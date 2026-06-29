/**
 * Purge WP Rocket cache qua MCP adapter abilities.
 */
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

async function mcpPost(path, bodyObj) {
  return new Promise((res, rej) => {
    const b = Buffer.from(JSON.stringify(bodyObj));
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path, method: "POST", headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json", "Content-Length": b.length }, rejectUnauthorized: false };
    const r = https.request(opts, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => { try { res({ s: resp.statusCode, d: JSON.parse(d) }); } catch { res({ s: resp.statusCode, d }); } }); });
    r.on("error", rej); r.setTimeout(20000, () => r.destroy()); r.write(b); r.end();
  });
}

const MCP_ENDPOINT = "/wp-json/mcp/mcp-adapter-default-server";

// Init
const init = await mcpPost(MCP_ENDPOINT, { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "cache-purge", version: "1.0" } } });
console.log("Init:", init.s);
await mcpPost(MCP_ENDPOINT, { jsonrpc: "2.0", method: "notifications/initialized", params: {} });

// Discover cache-related abilities
const disc = await mcpPost(MCP_ENDPOINT, { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "mcp-adapter-discover-abilities", arguments: { search: "cache" } } });
const abilities = disc.d?.result?.content?.[0]?.text ?? "";
console.log("Cache abilities:", abilities.slice(0, 500));

// Try cache/clear-all
const clearAll = await mcpPost(MCP_ENDPOINT, { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "mcp-adapter-execute-ability", arguments: { ability_name: "cache/clear-all", parameters: {} } } });
console.log("cache/clear-all:", JSON.stringify(clearAll.d?.result).slice(0, 200));
