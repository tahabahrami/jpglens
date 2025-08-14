#!/usr/bin/env node
import { Server, Tool } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import * as fs from "fs-extra";
import path from "node:path";
import { glob } from "glob";
import AdmZip from "adm-zip";
import { normalizeIssues, pickReporters, withRetry } from "./shared.js";

const CWD = process.cwd();

async function ensureDir(dir) { await fs.mkdirp(dir); }
async function writeJSONSafe(file, data) { await ensureDir(path.dirname(file)); await fs.writeJSON(file, data, { spaces: 2 }); }
async function maybeImport(imp) { try { return await imp(); } catch { return null; } }

const UserContextSchema = z.object({ persona: z.string().optional(), device: z.string().optional(), deviceContext: z.string().optional(), expertise: z.string().optional(), urgency: z.string().optional(), goals: z.array(z.string()).optional() });
const AnalysisOptionsSchema = z.object({ stage: z.string().optional(), userIntent: z.string().optional(), userContext: UserContextSchema.optional(), criticalElements: z.array(z.string()).optional(), businessContext: z.record(z.string()).optional(), depth: z.enum(["quick","standard","comprehensive"]).optional(), types: z.array(z.enum(["usability","accessibility","visual-design","performance"])).optional(), includeScreenshots: z.boolean().optional(), customPromptKey: z.string().optional() });
const ReportConfigSchema = z.object({ enabled: z.boolean().optional(), outputDir: z.string().default("./jpglens-reports"), format: z.enum(["markdown","json","html"]).default("markdown"), template: z.string().default("detailed"), includeScreenshots: z.boolean().optional() });
const ReporterConfigSchema = z.object({ kind: z.string().default(process.env.JPGLENS_REPORTER || "jsonl") }).optional();
const RunPlaywrightSchema = z.object({ url: z.string().url(), options: AnalysisOptionsSchema.default({}), report: ReportConfigSchema.default({}), reporters: ReporterConfigSchema, headless: z.boolean().default(true), timeoutMs: z.number().int().min(1000).max(600000).default(120000), runId: z.string().optional() });
const BatchRunSchema = z.object({ items: z.array(z.object({ url: z.string().url(), options: AnalysisOptionsSchema.default({}), timeoutMs: z.number().int().min(1000).max(600000).optional() })).min(1), report: ReportConfigSchema.default({}), reporters: ReporterConfigSchema, concurrency: z.number().int().min(1).max(8).default(2), headless: z.boolean().default(true), timeoutMs: z.number().int().min(1000).max(180000).default(120000), retryMax: z.number().int().min(0).max(5).default(2), retryBaseMs: z.number().int().min(100).max(10000).default(500), jitter: z.boolean().default(True), runId: z.string().optional() });
const JourneySchema = z.object({ name: z.string(), persona: z.string().optional(), device: z.string().optional(), stages: z.array(z.object({ name: z.string(), page: z.string(), userGoal: z.string().optional(), aiAnalysis: z.string().optional(), options: AnalysisOptionsSchema.optional() })) });
const PromptProfileSchema = z.object({ key: z.string(), instructions: z.string(), extraContext: z.record(z.any()).optional() });
const TestBedSchema = z.object({ framework: z.enum(["storybook","playwright","cypress"]).default("storybook"), componentName: z.string(), path: z.string().default("src/components"), states: z.array(z.string()).default(["default","hover","focus","active"]), context: z.string().optional(), designSystem: z.string().optional() });

const server = new Server({ name: "mcp-jpglens", version: "0.6.0" }, { capabilities: { tools: {} } });

server.tool(new Tool({ name: "run_playwright_analysis", description: "Open a page with Playwright, run jpglens analyzeUserJourney, write a receipt JSON, emit structured issues, and stream via reporters.", inputSchema: RunPlaywrightSchema }), async ({ input }) => {
  const pw = await maybeImport(() => import("@playwright/test"));
  const jp = await maybeImport(() => import("jpglens/playwright"));
  if (!pw || !jp) return { content: [{ type: "text", text: "npm i -D @playwright/test jpglens && npx playwright install" }] };
  const { chromium } = pw; const { analyzeUserJourney } = jp;
  const browser = await chromium.launch({ headless: input.headless }); const page = await browser.newPage();
  await page.goto(input.url, { timeout: input.timeoutMs });
  const result = await analyzeUserJourney(page, { ...input.options });
  const structured = normalizeIssues(result, input.url);
  const ts = Date.now(); const reportDir = path.resolve(CWD, input.report.outputDir); await ensureDir(reportDir);
  const runId = input.runId ?? String(ts);
  const reps = await pickReporters(runId, reportDir, input.reporters?.kind);
  for (const r of reps) await r.onStart?.({ kind:"single", runId, reportDir });
  await Promise.all(reps.map(r => r.onItem?.({ seq: 1, url: input.url, structuredIssues: structured, rawResult: result })));
  const receipt = path.join(reportDir, `receipt-${runId}.json`);
  await writeJSONSafe(receipt, { runId, timestamp: ts, url: input.url, options: input.options, report: input.report, result, structuredIssues: structured });
  await Promise.all(reps.map(r => r.onComplete?.({ receipt, count: structured.length })));
  await browser.close();
  return { content: [{ type: "text", text: `Analysis complete. Receipt: ${receipt}` }] };
});

server.tool(new Tool({ name: "batch_analyze", description: "Batch-run Playwright analyses with retries/backoff, JSONL/S3 reporters, and structured issues.", inputSchema: BatchRunSchema }), async ({ input }) => {
  const pw = await maybeImport(() => import("@playwright/test"));
  const jp = await maybeImport(() => import("jpglens/playwright"));
  if (!pw || !jp) return { content: [{ type: "text", text: "npm i -D @playwright/test jpglens && npx playwright install" }] };
  const { chromium } = pw; const { analyzeUserJourney } = jp;
  const reportDir = path.resolve(CWD, input.report.outputDir); await ensureDir(reportDir);
  const ts = Date.now(); const runId = input.runId ?? String(ts);
  const reps = await pickReporters(runId, reportDir, input.reporters?.kind);
  for (const r of reps) await r.onStart?.({ kind:"batch", runId, reportDir });

  const queue = [...input.items].map((x,i)=>({ ...x, _seq: i+1 }));
  const results:any[] = [];

  async function worker(workerId:number) {
    const browser = await chromium.launch({ headless: input.headless });
    const page = await browser.newPage();
    while (queue.length) {
      const item = queue.shift(); if (!item) break;
      const timeout = item.timeoutMs ?? input.timeoutMs;
      try {
        const res = await withRetry(async () => {
          await page.goto(item.url, { timeout });
          const r = await analyzeUserJourney(page, { ...item.options });
          return r;
        }, { max: input.retryMax, baseMs: input.retryBaseMs, jitter: input.jitter });
        const structured = normalizeIssues(res, item.url);
        const entry = { url: item.url, ok: true, workerId, seq: item._seq, structuredIssues: structured, rawResult: res };
        results.push(entry);
        await Promise.all(reps.map(r => r.onItem?.(entry)));
      } catch (e) {
        const entry = { url: item.url, ok: false, workerId, seq: item._seq, error: (e && e.message) || String(e) };
        results.push(entry);
        await Promise.all(reps.map(r => r.onItem?.(entry)));
      }
    }
    await browser.close();
  }
  await Promise.all(new Array(input.concurrency).fill(0).map((_,i)=>worker(i+1)));
  const batchFile = path.join(reportDir, `batch-summary-${runId}.json`);
  await writeJSONSafe(batchFile, { results, timestamp: ts, runId });
  await Promise.all(reps.map(r => r.onComplete?.({ summary: batchFile, total: results.length })));
  return { content: [{ type: "text", text: `Batch completed. Summary: ${batchFile}` }] };
});

server.tool(new Tool({ name: "run_journey", description: "Run a multi-stage journey; emit structured issues for each stage; JSONL/S3 reporters.", inputSchema: z.object({ baseUrl: z.string().url(), journey: z.object({ name: z.string(), persona: z.string().optional(), device: z.string().optional(), stages: z.array(z.object({ name: z.string(), page: z.string(), userGoal: z.string().optional(), aiAnalysis: z.string().optional(), options: AnalysisOptionsSchema.optional() })) }), reporters: ReporterConfigSchema, headless: z.boolean().default(true), timeoutMs: z.number().int().min(1000).max(600000).default(120000), report: ReportConfigSchema.default({}), runId: z.string().optional() }) }), async ({ input }) => {
  const pw = await maybeImport(() => import("@playwright/test"));
  const jp = await maybeImport(() => import("jpglens/playwright"));
  if (!pw || !jp) return { content: [{ type: "text", text: "npm i -D @playwright/test jpglens && npx playwright install" }] };
  const { chromium } = pw;
  const hasComplete = 'analyzeCompleteJourney' in jp;
  const reportDir = path.resolve(CWD, input.report.outputDir); await ensureDir(reportDir);
  const ts = Date.now(); const runId = input.runId ?? String(ts);
  const reps = await pickReporters(runId, reportDir, input.reporters?.kind);
  for (const r of reps) await r.onStart?.({ kind:"journey", runId, reportDir });

  const results:any[] = [];
  if (hasComplete) {
    const { analyzeCompleteJourney } = jp;
    const r = await analyzeCompleteJourney(input.journey);
    const structured = normalizeIssues(r);
    const entry = { type:"complete", ok:true, structuredIssues: structured, rawResult: r };
    results.push(entry);
    await Promise.all(reps.map(rep => rep.onItem?.(entry)));
  } else {
    const { analyzeUserJourney } = jp;
    const browser = await chromium.launch({ headless: input.headless });
    const page = await browser.newPage();
    for (let i=0;i<input.journey.stages.length;i++) {
      const stage = input.journey.stages[i];
      try {
        const url = new URL(stage.page, input.baseUrl).toString();
        await page.goto(url, { timeout: input.timeoutMs });
        const r = await analyzeUserJourney(page, { stage: stage.name, userIntent: stage.userGoal ?? stage.aiAnalysis ?? "", ...(stage.options ?? {}) });
        const structured = normalizeIssues(r, url);
        const entry = { stage: stage.name, ok:true, seq:i+1, url, structuredIssues: structured, rawResult: r };
        results.push(entry);
        await Promise.all(reps.map(rep => rep.onItem?.(entry)));
      } catch (e) {
        const entry = { stage: stage.name, ok:false, seq:i+1, error: (e && e.message) || String(e) };
        results.push(entry);
        await Promise.all(reps.map(rep => rep.onItem?.(entry)));
      }
    }
    await browser.close();
  }

  const summary = path.join(reportDir, `journey-summary-${runId}.json`);
  await writeJSONSafe(summary, { journey: input.journey, results, timestamp: ts, runId });
  await Promise.all(reps.map(r => r.onComplete?.({ summary, total: results.length })));
  return { content: [{ type: "text", text: `Journey run complete. Summary: ${summary}` }] };
});

// other unchanged tools (scaffold_config, add_prompt_profile, generate_testbed, collect_reports, export_artifacts)
import { Tool as ToolCls } from "@modelcontextprotocol/sdk/server/index.js";
const scaffoldSchema = z.object({ overwrite: z.boolean().default(false), ai: z.object({ provider: z.string().default("openrouter"), model: z.string().default(process.env.JPGLENS_MODEL || "anthropic/claude-3-5-sonnet"), baseUrl: z.string().optional(), maxTokens: z.number().optional(), temperature: z.number().optional() }).optional(), analysis: z.object({ types: z.array(z.string()).optional(), depth: z.string().optional(), includeScreenshots: z.boolean().optional() }).optional(), reporting: z.object({ enabled: z.boolean().optional(), outputDir: z.string().optional(), format: z.string().optional(), template: z.string().optional(), includeScreenshots: z.boolean().optional() }).optional(), personas: z.record(z.any()).optional(), plugins: z.array(z.string()).optional(), customPrompts: z.record(z.string()).optional() });
server.tool(new ToolCls({ name:"scaffold_config", description:"Create/update jpglens.config.js", inputSchema: scaffoldSchema }), async ({ input }) => {
  const file = path.join(CWD, "jpglens.config.js"); if (await fs.pathExists(file) && !input.overwrite) return { content: [{ type:"text", text:`Config exists at ${file}. Set overwrite=true to replace.` }] };
  const config = { ai: { provider: input.ai?.provider ?? "openrouter", model: input.ai?.model ?? (process.env.JPGLENS_MODEL || "anthropic/claude-3-5-sonnet"), apiKey: "${process.env.JPGLENS_API_KEY}", baseUrl: input.ai?.baseUrl ?? process.env.JPGLENS_BASE_URL, maxTokens: input.ai?.maxTokens ?? 4000, temperature: input.ai?.temperature ?? 0.1 }, analysis: { types: input.analysis?.types ?? ["usability","accessibility","visual-design","performance"], depth: input.analysis?.depth ?? "comprehensive", includeScreenshots: input.analysis?.includeScreenshots ?? true, generateReports: true }, userPersonas: input.personas ?? { "mobile-user": { expertise:"novice", device:"mobile", goals:["simplicity","speed"] }, "power-user": { expertise:"expert", device:"desktop", goals:["efficiency","advanced-features"] } }, customPrompts: input.customPrompts ?? { "mobile-focus": "Analyze specifically for mobile usability", "accessibility-deep": "Deep dive into WCAG 2.1 compliance" }, plugins: input.plugins ?? [] };
  await fs.writeFile(file, `// Auto-generated by @jpglens/mcp-server\nexport default ${JSON.stringify(config, null, 2)};\n`, "utf8");
  return { content: [{ type:"text", text:`Wrote ${file}` }] };
});
server.tool(new ToolCls({ name:"add_prompt_profile", description:"Add/update custom prompt in jpglens.config.js", inputSchema: z.object({ key:z.string(), instructions:z.string(), extraContext: z.record(z.any()).optional() }) }), async ({ input }) => {
  const file = path.join(CWD, "jpglens.config.js"); if (!await fs.pathExists(file)) return { content:[{ type:"text", text:"No jpglens.config.js found. Run scaffold_config first." }] };
  let text = await fs.readFile(file, "utf8");
  if (!text.includes("customPrompts")) text = text.replace(/plugins:\s*\[[\s\S]*?\]/m, (m)=> m + `,\n  customPrompts: { "${input.key}": ${JSON.stringify(input.instructions)} }`);
  else text = text.replace(/customPrompts:\s*{([\s\S]*?)}/m, (m, inner) => `customPrompts: {\n    "${input.key}": ${JSON.stringify(input.instructions)},${inner}\n  }`);
  await fs.writeFile(file, text, "utf8");
  return { content:[{ type:"text", text:`Added/updated prompt '${input.key}'.` }] };
});
server.tool(new ToolCls({ name:"generate_testbed", description:"Scaffold Storybook + Playwright testbeds", inputSchema: z.object({ framework: z.enum(["storybook","playwright","cypress"]).default("storybook"), componentName:z.string(), path:z.string().default("src/components"), states:z.array(z.string()).default(["default","hover","focus","active"]), context:z.string().optional(), designSystem:z.string().optional() }) }), async ({ input }) => {
  const out = []; if (input.framework === "storybook") { const storiesDir = path.join(CWD, ".storybook/generated"); await ensureDir(storiesDir); const storyFile = path.join(storiesDir, `${input.componentName}.stories.jsx`); await fs.writeFile(storyFile, `// Auto-generated by @jpglens/mcp-server\nimport React from "react";\nimport { within } from "@storybook/testing-library";\nimport { analyzeComponentStates } from "jpglens/storybook";\n\nexport default { title: "Generated/${input.componentName}", component: () => <div /> };\n\nexport const InteractiveStates = {\n  play: async ({ canvasElement }) => {\n    const canvas = within(canvasElement);\n    await analyzeComponentStates(canvas, { component: "${input.componentName}", states: ${JSON.stringify(input.states)}, context: ${JSON.stringify(input.context || "")}, designSystem: ${JSON.stringify(input.designSystem || "design-system")} });\n  }\n};`, "utf8"); out.push(storyFile); }
  const testsDir = path.join(CWD, "tests", "generated"); await ensureDir(testsDir); const specFile = path.join(testsDir, `${input.componentName}.spec.ts`); await fs.writeFile(specFile, `// Auto-generated by @jpglens/mcp-server\nimport { test } from "@playwright/test";\nimport { analyzeUserJourney } from "jpglens/playwright";\n\ntest.describe("${input.componentName} testbed", () => {\n  test("ai analysis for ${input.componentName}", async ({ page }) => {\n    await page.goto("/");\n    await analyzeUserJourney(page, { stage: "component-review", userIntent: "assess ${input.componentName} usability", userContext: { device: "desktop" }, criticalElements: ["${input.componentName}"] });\n  });\n});`, "utf8"); out.push(specFile);
  return { content:[{ type:"text", text:`Generated:\n${out.join("\n")}` }] };
});
server.tool(new ToolCls({ name:"collect_reports", description:"Summarize last N reports", inputSchema: z.object({ reportDir: z.string().default("./jpglens-reports"), maxFiles: z.number().int().min(1).max(50).default(10) }) }), async ({ input }) => {
  const dir = path.resolve(CWD, input.reportDir); const patterns = ["**/*.md","**/*.markdown","**/*.json","**/*.html"].map(p=>path.join(dir,p)); const files = (await glob(patterns, { nodir: true })).sort().slice(-input.maxFiles);
  if (!files.length) return { content:[{ type:"text", text:`No reports found in ${dir}` }] };
  const summaries = []; for (const f of files) { let text = ""; if (f.endsWith(".json")) { try { const j = await fs.readJSON(f); text = JSON.stringify(j).slice(0, 4000); } catch { text = ""; } } else { try { text = await fs.readFile(f, "utf8"); } catch { text = ""; } if (text.length > 4000) text = text.slice(0, 4000) + "\n...truncated..."; } summaries.push(`---\n# ${path.basename(f)}\n${text}`); }
  return { content:[{ type:"text", text: summaries.join("\n") }] };
});
server.tool(new ToolCls({ name:"export_artifacts", description:"Zip report directory", inputSchema: z.object({ reportDir: z.string().default("./jpglens-reports"), zipName: z.string().default("jpglens-artifacts.zip") }) }), async ({ input }) => {
  const dir = path.resolve(CWD, input.reportDir); if (!await fs.pathExists(dir)) return { content:[{ type:"text", text:`Report dir not found: ${dir}` }] };
  const zipPath = path.resolve(CWD, input.zipName); const zip = new AdmZip(); const files = await glob([path.join(dir, "**/*")], { nodir: true }); for (const f of files) zip.addLocalFile(f); zip.writeZip(zipPath);
  return { content:[{ type:"text", text:`ZIP ready at ${zipPath}` }] };
});

server.start();
