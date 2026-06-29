import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}
let SID = null;
function req(auth, body) {
  return new Promise((resolve, reject) => {
    const b = Buffer.from(JSON.stringify(body), "utf8");
    const o = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json/mcp/wp-mcp-ultimate", method: "POST",
      headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json",
        "Content-Length": b.length, ...(SID ? { "Mcp-Session-Id": SID } : {}) },
      rejectUnauthorized: false,
    };
    const r = https.request(o, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => {
        if (!SID && resp.headers["mcp-session-id"]) SID = resp.headers["mcp-session-id"];
        try { resolve({ s: resp.statusCode, d: JSON.parse(d) }); }
        catch { resolve({ s: resp.statusCode, d }); }
      });
    });
    r.on("error", reject); r.setTimeout(30000, () => r.destroy(new Error("timeout")));
    r.write(b); r.end();
  });
}
const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");

await req(auth, { jsonrpc: "2.0", id: 1, method: "initialize",
  params: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, clientInfo: { name: "test", version: "1" } } });

// Check debug log for errors
const r = await req(auth, { jsonrpc: "2.0", id: 2, method: "tools/call",
  params: { name: "wp-mcp-ultimate-execute-ability",
    arguments: { ability_name: "system/debug-log", parameters: { lines: 30, search: "ttcqn-fix-home-img-alt" } } } });
const txt = r.d?.result?.content?.[0]?.text ?? JSON.stringify(r.d);
console.log("=== Debug log (search ttcqn-fix-home-img-alt) ===");
console.log(txt.slice(0, 2000));

// Also check site info to confirm plugin is recognized
const r2 = await req(auth, { jsonrpc: "2.0", id: 3, method: "tools/call",
  params: { name: "wp-mcp-ultimate-execute-ability",
    arguments: { ability_name: "plugins/list", parameters: { status: "active" } } } });
const plugins = r2.d?.result?.content?.[0]?.text ?? "";
const found = plugins.includes("ttcqn-fix-home-img-alt");
console.log("\n=== Plugin active ===", found ? "✓ YES" : "✗ NO");
if (found) {
  const idx = plugins.indexOf("ttcqn-fix-home-img-alt");
  console.log(plugins.slice(Math.max(0, idx - 20), idx + 200));
}
