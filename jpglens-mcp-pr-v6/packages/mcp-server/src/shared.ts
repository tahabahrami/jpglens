// shared utilities for reporters, retries, and structured issues
import * as fs from "fs-extra";
import path from "node:path";
import { glob } from "glob";

export type StructuredIssue = {
  selector?: string;
  wcag?: string;
  severity?: "low"|"medium"|"high"|"critical";
  recommendation?: string;
  description?: string;
  pageUrl?: string;
  component?: string;
  screenshot?: string;
  codeHint?: { file?: string; line?: number; suggestion?: string };
};

export function normalizeIssues(result:any, pageUrl?:string): StructuredIssue[] {
  // If jpglens already returns machine-readable issues, just map fields
  const issues: StructuredIssue[] = [];
  const src = result?.issues || result?.data?.issues || [];
  if (Array.isArray(src) && src.length) {
    for (const it of src) {
      issues.push({
        selector: it.selector || it.target,
        wcag: it.wcag || it.ruleId || it.guideline,
        severity: it.severity || it.level || "medium",
        recommendation: it.fix || it.recommendation || it.suggest,
        description: it.description || it.summary,
        pageUrl
      });
    }
    return issues;
  }
  // Heuristic: parse markdown-style bullets for WCAG + selector cues (best-effort)
  const text = JSON.stringify(result);
  const regex = /(WCAG\s*\d\.\d\.[\dA-Za-z]+).*?(#\S+|\.[A-Za-z0-9_-]+|\[[^\]]+\])/gi;
  let m; 
  while ((m = regex.exec(text))) {
    issues.push({ wcag: m[1], selector: m[2], severity: "medium", recommendation: "See report details.", pageUrl });
  }
  return issues;
}

// Reporter framework
export type Reporter = {
  onStart?(ctx: { kind: string; runId: string; reportDir: string }): Promise<void>|void;
  onItem?(item: any): Promise<void>|void;
  onComplete?(summary: any): Promise<void>|void;
};

export async function makeJsonlReporter(runId: string, reportDir: string): Promise<Reporter> {
  await fs.mkdirp(reportDir);
  const file = path.join(reportDir, `events-${runId}.jsonl`);
  return {
    async onStart(ctx){ await fs.appendFile(file, JSON.stringify({ type:"start", ...ctx, ts:Date.now() })+"\n"); },
    async onItem(ev){ await fs.appendFile(file, JSON.stringify({ type:"item", ...ev, ts:Date.now() })+"\n"); },
    async onComplete(sum){ await fs.appendFile(file, JSON.stringify({ type:"complete", ...sum, ts:Date.now() })+"\n"); }
  };
}

export async function makeS3Reporter(runId: string, reportDir: string) : Promise<Reporter> {
  let S3:any = null;
  try { const mod = await import("@aws-sdk/client-s3"); S3 = mod; } catch { /* optional */ }
  if (!S3) return { onStart(){}, onItem(){}, onComplete(){} };
  const region = process.env.JPGLENS_S3_REGION || "us-east-1";
  const bucket = process.env.JPGLENS_S3_BUCKET;
  const prefix = process.env.JPGLENS_S3_PREFIX || "jpglens";
  const s3 = new S3.S3Client({ region });
  async function put(key:string, body:Uint8Array|Buffer|string, contentType?:string) {
    if (!bucket) return;
    const Key = `${prefix}/${runId}/${key}`.replace(/\/+/, "/");
    await s3.send(new S3.PutObjectCommand({ Bucket: bucket, Key, Body: body, ContentType: contentType }));
  }
  return {
    async onStart(ctx){ await put("start.json", Buffer.from(JSON.stringify(ctx)), "application/json"); },
    async onItem(ev){ await put(`items/${ev.seq || Date.now()}.json`, Buffer.from(JSON.stringify(ev)), "application/json"); },
    async onComplete(sum){ await put("summary.json", Buffer.from(JSON.stringify(sum)), "application/json"); }
  };
}

export async function pickReporters(runId:string, reportDir:string, kind?:string): Promise<Reporter[]> {
  const sel = (kind || process.env.JPGLENS_REPORTER || "jsonl").toLowerCase();
  const reps: Reporter[] = [];
  if (sel.includes("jsonl") || sel === "both" || sel === "all") reps.push(await makeJsonlReporter(runId, reportDir));
  if (sel.includes("s3") || sel === "both" || sel === "all") reps.push(await makeS3Reporter(runId, reportDir));
  return reps;
}

// Retry helpers
export async function withRetry<T>(fn:()=>Promise<T>, opts:{max:number, baseMs:number, jitter:boolean}) : Promise<T> {
  let attempt = 0; let lastErr:any = null;
  while (attempt <= opts.max) {
    try { return await fn(); } catch (e) {
      lastErr = e; 
      if (attempt === opts.max) break;
      const backoff = opts.baseMs * Math.pow(2, attempt) * (opts.jitter ? (0.5 + Math.random()) : 1);
      await new Promise(r => setTimeout(r, backoff));
      attempt++;
    }
  }
  throw lastErr;
}
