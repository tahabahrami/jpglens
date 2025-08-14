#!/usr/bin/env node
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
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
const BatchRunSchema = z.object({ items: z.array(z.object({ url: z.string().url(), options: AnalysisOptionsSchema.default({}), timeoutMs: z.number().int().min(1000).max(600000).optional() })).min(1), report: ReportConfigSchema.default({}), reporters: ReporterConfigSchema, concurrency: z.number().int().min(1).max(8).default(2), headless: z.boolean().default(true), timeoutMs: z.number().int().min(1000).max(180000).default(120000), retryMax: z.number().int().min(0).max(5).default(2), retryBaseMs: z.number().int().min(100).max(10000).default(500), jitter: z.boolean().default(true), runId: z.string().optional() });
const JourneySchema = z.object({ name: z.string(), persona: z.string().optional(), device: z.string().optional(), stages: z.array(z.object({ name: z.string(), page: z.string(), userGoal: z.string().optional(), aiAnalysis: z.string().optional(), options: AnalysisOptionsSchema.optional() })) });

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const clients = new Set();
app.get("/sse", (req, res) => {
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  res.flushHeaders();
  res.write(":ok\n\n");
  clients.add(res);
  req.on("close", () => clients.delete(res));
});
function broadcast(event, data) { const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`; for (const res of clients) { try { res.write(msg); } catch {} } }

app.get("/health", (_req, res) => res.json({ ok: true, transport: "sse" }));

app.post("/rpc/run_playwright_analysis", async (req, res) => {
  const input = RunPlaywrightSchema.parse(req.body || {});
  const pw = await maybeImport(() => import("@playwright/test")); const jp = await maybeImport(() => import("jpglens/playwright"));
  if (!pw || !jp) return res.status(400).json({ ok: false, install: "npm i -D @playwright/test jpglens && npx playwright install" });
  const { chromium } = pw; const { analyzeUserJourney } = jp;
  const reportDir = path.resolve(CWD, input.report.outputDir); await ensureDir(reportDir);
  const ts = Date.now(); const runId = input.runId ?? String(ts);
  const reps = await pickReporters(runId, reportDir, input.reporters?.kind);
  for (const r of reps) await r.onStart?.({ kind:"single", runId, reportDir });
  const browser = await chromium.launch({ headless: input.headless }); const page = await browser.newPage();
  broadcast("progress", { step:"navigate", url: input.url });
  await page.goto(input.url, { timeout: input.timeoutMs });
  const result = await analyzeUserJourney(page, { ...input.options });
  const structured = normalizeIssues(result, input.url);
  const receipt = path.join(reportDir, `receipt-${runId}.json`);
  await writeJSONSafe(receipt, { runId, timestamp: ts, url: input.url, options: input.options, report: input.report, result, structuredIssues: structured });
  await Promise.all(reps.map(r => r.onItem?.({ seq:1, url: input.url, structuredIssues: structured })));
  await Promise.all(reps.map(r => r.onComplete?.({ receipt, count: structured.length })));
  await browser.close();
  broadcast("progress", { step:"done", receipt });
  res.json({ ok: true, receipt });
});

app.post("/rpc/batch_analyze", async (req, res) => {
  const input = BatchRunSchema.parse(req.body || {});
  const pw = await maybeImport(() => import("@playwright/test")); const jp = await maybeImport(() => import("jpglens/playwright"));
  if (!pw || !jp) return res.status(400).json({ ok: false, install: "npm i -D @playwright/test jpglens && npx playwright install" });
  const { chromium } = pw; const { analyzeUserJourney } = jp;
  const reportDir = path.resolve(CWD, input.report.outputDir); await ensureDir(reportDir);
  const ts = Date.now(); const runId = input.runId ?? String(ts);
  const reps = await pickReporters(runId, reportDir, input.reporters?.kind);
  for (const r of reps) await r.onStart?.({ kind:"batch", runId, reportDir });
  const queue = [...input.items].map((x,i)=>({ ...x, _seq: i+1 }));
  const results:any[] = [];
  async function worker(id:number) {
    const browser = await chromium.launch({ headless: input.headless }); const page = await browser.newPage();
    while (queue.length) {
      const item = queue.shift(); if (!item) break;
      const timeout = item.timeoutMs ?? input.timeoutMs;
      try {
        const r = await withRetry(async () => { broadcast("progress", { step:"navigate", worker: id, url:item.url }); await page.goto(item.url, { timeout }); const res = await analyzeUserJourney(page, { ...item.options }); return res; }, { max: input.retryMax, baseMs: input.retryBaseMs, jitter: input.jitter });
        const structured = normalizeIssues(r, item.url);
        const entry = { url: item.url, ok:true, workerId:id, seq:item._seq, structuredIssues: structured };
        results.push(entry);
        await Promise.all(reps.map(rep => rep.onItem?.(entry)));
      } catch (e) {
        const entry = { url: item.url, ok:false, workerId:id, seq:item._seq, error: (e && e.message) || String(e) };
        results.push(entry);
        await Promise.all(reps.map(rep => rep.onItem?.(entry)));
      }
    }
    await browser.close();
  }
  await Promise.all(new Array(input.concurrency).fill(0).map((_,i)=>worker(i+1)));
  const batchFile = path.join(reportDir, `batch-summary-${runId}.json`);
  await writeJSONSafe(batchFile, { results, timestamp: ts, runId });
  await Promise.all(reps.map(r => r.onComplete?.({ summary: batchFile, total: results.length })));
  broadcast("progress", { step:"batch:done", summary: batchFile });
  res.json({ ok: true, summary: batchFile });
});

app.post("/rpc/run_journey", async (req, res) => {
  const schema = z.object({ baseUrl: z.string().url(), journey: JourneySchema, reporters: ReporterConfigSchema, headless: z.boolean().default(true), timeoutMs: z.number().int().min(1000).max(600000).default(120000), report: ReportConfigSchema.default({}), runId: z.string().optional() });
  const input = schema.parse(req.body || {});
  const pw = await maybeImport(() => import("@playwright/test")); const jp = await maybeImport(() => import("jpglens/playwright"));
  if (!pw || !jp) return res.status(400).json({ ok: false, install: "npm i -D @playwright/test jpglens && npx playwright install" });
  const { chromium } = pw;
  const reportDir = path.resolve(CWD, input.report.outputDir); await ensureDir(reportDir);
  const ts = Date.now(); const runId = input.runId ?? String(ts);
  const reps = await pickReporters(runId, reportDir, input.reporters?.kind);
  for (const r of reps) await r.onStart?.({ kind:"journey", runId, reportDir });

  const results:any[] = [];
  const hasComplete = 'analyzeCompleteJourney' in jp;
  if (hasComplete) {
    const { analyzeCompleteJourney } = jp;
    const r = await analyzeCompleteJourney(input.journey);
    const structured = normalizeIssues(r);
    const entry = { type:"complete", ok:true, structuredIssues: structured };
    results.push(entry);
    await Promise.all(reps.map(rep => rep.onItem?.(entry)));
  } else {
    const { analyzeUserJourney } = jp;
    const browser = await chromium.launch({ headless: input.headless }); const page = await browser.newPage();
    for (let i=0;i<input.journey.stages.length;i++) {
      const stage = input.journey.stages[i];
      try {
        const url = new URL(stage.page, input.baseUrl).toString();
        broadcast("progress", { step:"stage:navigate", stage: stage.name, url });
        await page.goto(url, { timeout: input.timeoutMs });
        const r = await analyzeUserJourney(page, { stage: stage.name, userIntent: stage.userGoal ?? stage.aiAnalysis ?? "", ...(stage.options ?? {}) });
        const structured = normalizeIssues(r, url);
        const entry = { stage: stage.name, ok:true, seq:i+1, url, structuredIssues: structured };
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
  broadcast("progress", { step:"journey:done", summary });
  res.json({ ok: true, summary });
});

// Utility RPCs kept unchanged for completeness
app.post("/rpc/collect_reports", async (req, res) => {
  const schema = z.object({ reportDir: z.string().default("./jpglens-reports"), maxFiles: z.number().int().min(1).max(50).default(10) });
  const input = schema.parse(req.body || {});
  const dir = path.resolve(CWD, input.reportDir);
  const files = (await glob([path.join(dir,"**/*.md"), path.join(dir,"**/*.markdown"), path.join(dir,"**/*.json"), path.join(dir,"**/*.html")], { nodir:true })).sort().slice(-input.maxFiles);
  if (!files.length) return res.json({ ok:false, message:`No reports found in ${dir}` });
  const summaries = [];
  for (const f of files) {
    let text = "";
    if (f.endsWith(".json")) { try { const j = await fs.readJSON(f); text = JSON.stringify(j).slice(0,4000);} catch { text=""; } }
    else { try { text = await fs.readFile(f,"utf8"); } catch { text=""; } if (text.length>4000) text = text.slice(0,4000)+"\n...truncated..."; }
    summaries.push(`---\n# ${path.basename(f)}\n${text}`);
  }
  res.json({ ok:true, text: summaries.join("\n") });
});

app.post("/rpc/export_artifacts", async (req, res) => {
  const schema = z.object({ reportDir: z.string().default("./jpglens-reports"), zipName: z.string().default("jpglens-artifacts.zip") });
  const input = schema.parse(req.body || {});
  const dir = path.resolve(CWD, input.reportDir);
  if (!await fs.pathExists(dir)) return res.status(400).json({ ok:false, message:"report dir not found", dir });
  const zipPath = path.resolve(CWD, input.zipName); const zip = new AdmZip();
  const files = await glob([path.join(dir, "**/*")], { nodir: true }); for (const f of files) zip.addLocalFile(f);
  zip.writeZip(zipPath);
  broadcast("artifact", { zipPath });
  res.json({ ok: true, zipPath });
});

const PORT = Number(process.env.PORT || 3333);
createServer(app).listen(PORT, () => console.log(`[mcp-jpglens] SSE RPC listening on http://localhost:${PORT}`));
