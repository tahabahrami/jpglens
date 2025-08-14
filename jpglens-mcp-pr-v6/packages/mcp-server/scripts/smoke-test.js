/**
 * Lightweight smoke test (stdio)
 */
import { spawn } from "node:child_process";
import { once } from "node:events";
async function run() {
  const child = spawn("node", ["./dist/index.js"], { stdio: ["pipe", "pipe", "pipe"] });
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) + "\n");
  const [out] = await once(child.stdout, "data");
  console.log(String(out).slice(0, 200));
  child.kill();
}
run().catch(e => { console.error(e); process.exit(1); });
