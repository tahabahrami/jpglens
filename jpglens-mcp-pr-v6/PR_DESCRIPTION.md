# feat(mcp): retries/backoff, pluggable reporters (JSONL + S3), structured issues

- **Retries + exponential backoff** in `batch_analyze` (per-item timeouts, jitter).
- **Reporters**: JSONL event stream and optional S3 uploads (`JPGLENS_REPORTER=jsonl|s3|both`).
- **Structured issues** emitted in receipts/summaries for auto-fix agents.
- Works in both **stdio** and **SSE** servers.

### S3 env
- `JPGLENS_S3_BUCKET` (required), `JPGLENS_S3_REGION` (default us-east-1), `JPGLENS_S3_PREFIX` (default `jpglens`)
- Standard AWS creds envs supported.
