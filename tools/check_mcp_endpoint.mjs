import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}
function req(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/wp-json" + path, method,
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "check/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}) },
      rejectUnauthorized: false
    };
    const r = https.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, data: d }); } });
    });
    r.on("error", reject); r.setTimeout(15000, () => r.destroy(new Error("timeout")));
    if (bodyBuf) r.write(bodyBuf);
    r.end();
  });
}
(async () => {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  // GET để xem capabilities
  console.log("=== GET /mcp/wp-mcp-ultimate ===");
  const g = await req("GET", "/mcp/wp-mcp-ultimate", auth);
  console.log("Status:", g.status);
  console.log("Data:", JSON.stringify(g.data).slice(0, 1000));

  // POST với list_tools để xem tools
  console.log("\n=== POST list tools ===");
  const p = await req("POST", "/mcp/wp-mcp-ultimate", auth, {
    jsonrpc: "2.0", id: 1, method: "tools/list", params: {}
  });
  console.log("Status:", p.status);
  const tools = p.data?.result?.tools ?? [];
  if (tools.length > 0) {
    console.log(`Tools (${tools.length}):`);
    for (const t of tools) console.log(`  - ${t.name}: ${t.description?.slice(0,80)}`);
  } else {
    console.log("Data:", JSON.stringify(p.data).slice(0, 500));
  }
})().catch(e => console.error(e.message));
