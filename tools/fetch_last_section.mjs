import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) {
  const e = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return e;
}
const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
let SID = null;

function mcpPost(body) {
  return new Promise((resolve, reject) => {
    const b = Buffer.from(JSON.stringify(body), "utf8");
    const o = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path: `/wp-json/mcp/mcp-adapter-default-server`, method: "POST", headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json", "Content-Length": b.length, ...(SID ? { "Mcp-Session-Id": SID } : {}) }, rejectUnauthorized: false };
    const r = https.request(o, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => { if (!SID && resp.headers["mcp-session-id"]) SID = resp.headers["mcp-session-id"]; try { resolve(JSON.parse(d)); } catch { resolve(d); } }); });
    r.on("error", reject); r.setTimeout(30000, () => r.destroy(new Error("t"))); r.write(b); r.end();
  });
}

await mcpPost({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "agent", version: "1" } } });
await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" });

// Get page 993 - print raw MCP response structure
const r = await mcpPost({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "mcp-adapter-execute-ability", arguments: { ability_name: "content/get-page", parameters: { id: 993 } } } });
const text = r?.result?.content?.[0]?.text ?? "{}";
console.log("text length:", text.length);
console.log("text[:200]:", text.slice(0, 200));

const data = JSON.parse(text);
console.log("\nKeys:", Object.keys(data));
console.log("data.success:", data.success);
console.log("data.data keys:", data.data ? Object.keys(data.data) : "no data");

// Try direct WP REST API
const wpR = await new Promise((res, rej) => {
  const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/wp-json/wp/v2/pages/993?context=edit", method: "GET", headers: { Host: WP_HOST, Authorization: auth }, rejectUnauthorized: false };
  const req = https.request(opts, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => res(JSON.parse(d))); });
  req.on("error", rej); req.setTimeout(20000, () => req.destroy()); req.end();
});
const wpHtml = wpR?.content?.raw ?? wpR?.content?.rendered ?? "";
console.log("\nWP REST raw content length:", wpHtml.length);
console.log("Last 800 chars:", wpHtml.slice(-800));
