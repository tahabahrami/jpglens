<!-- BEGIN: MCP SECTION -->
## Use with Model Context Protocol (MCP)

Let AI agents (Cursor/Claude/OpenAI) run jpglens analyses via an MCP server.

### Quickstart
1. Build:
```bash
pnpm -F @jpglens/mcp-server build
```
2. Cursor → Settings → Features → MCP → **Add**
- Type: `stdio`
- Command: `/ABS/PATH/TO/repo/packages/mcp-server/dist/index.js`

**SSE (optional):**
Run `PORT=3333 node packages/mcp-server/dist/sse.js` and point hosted agents to `http://localhost:3333`.

### Advanced
- Retries/backoff in batch runs
- Reporters: JSONL, S3 (set `JPGLENS_REPORTER=both` to enable both)
- Normalized `structuredIssues` for auto-fix agents
<!-- END: MCP SECTION -->
