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
  return new Promise((res, rej) => {
    const b = Buffer.from(JSON.stringify(body));
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/wp-json/mcp/mcp-adapter-default-server", method: "POST", headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json", "Content-Length": b.length, ...(SID ? { "Mcp-Session-Id": SID } : {}) }, rejectUnauthorized: false };
    const r = https.request(opts, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => { if (!SID && resp.headers["mcp-session-id"]) SID = resp.headers["mcp-session-id"]; try { res(JSON.parse(d)); } catch { res(d); } }); });
    r.on("error", rej); r.setTimeout(20000, () => r.destroy()); r.write(b); r.end();
  });
}

// Init
await mcpPost({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "x", version: "1" } } });
await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" });

// Discover cache abilities
const disc = await mcpPost({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "mcp-adapter-discover-abilities", arguments: { search: "cache" } } });
const text = disc?.result?.content?.[0]?.text ?? JSON.stringify(disc).slice(0, 300);
console.log("cache abilities:\n", text);

// Try clear all cache
const clearAll = await mcpPost({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "mcp-adapter-execute-ability", arguments: { ability_name: "cache/clear-all", parameters: {} } } });
console.log("clear-all result:", JSON.stringify(clearAll?.result ?? clearAll?.error).slice(0, 300));
