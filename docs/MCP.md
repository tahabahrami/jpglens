# MCP Integration for jpglens (stdio + SSE) — advanced features

This package adds **agent-grade** features:
- **Retries + exponential backoff** for `batch_analyze` (per-item timeout and jitter).
- **Pluggable reporters**: JSONL streaming (local) and optional **S3 upload**.
- **Structured issues**: normalized issue objects for auto-fix agents.

## Environment
- `JPGLENS_REPORTER` = `jsonl` | `s3` | `both` (default: `jsonl`)
- **S3 (optional)**
  - `JPGLENS_S3_BUCKET` (required for S3 reporter)
  - `JPGLENS_S3_REGION` (default: us-east-1)
  - `JPGLENS_S3_PREFIX` (default: `jpglens`)
  - Standard AWS credentials envs apply.

## Using reporters
- **JSONL**: writes `events-<runId>.jsonl` in `reportDir` with `start`, `item`, `complete` events.
- **S3**: uploads `start.json`, a stream of per-item JSON files, and `summary.json` to `s3://<bucket>/<prefix>/<runId>/`.

## Structured issues
Every run emits `structuredIssues[]` in receipts/summaries with fields:
```ts
{ selector?: string, wcag?: string, severity?: "low"|"medium"|"high"|"critical", recommendation?: string, description?: string, pageUrl?: string }
```
If core already returns issues, those are mapped; otherwise a best‑effort heuristic extracts cues from text.

## Batch retries
`batch_analyze` inputs:
- `retryMax` (default 2), `retryBaseMs` (500), `jitter` (true)
- `timeoutMs` (global) and per-item `timeoutMs`.
