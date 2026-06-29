import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
}

const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const baseUrl = env.WP_BASE_URL || "https://thongtaccongquangninh.com";
const pluginSlug = "wp-mcp-ultimate-main/wp-mcp-ultimate";

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

async function setPluginStatus(status) {
  log(`Setting plugin status to: ${status}...`);
  const res = await fetch(`${baseUrl}/wp-json/wp/v2/plugins/${pluginSlug}`, {
    method: "PUT",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  log(`Status response code: ${res.status}`);
  log(`Response: ${JSON.stringify(data).slice(0, 300)}`);
  return res.status === 200;
}

async function testMcpTools() {
  log("Initializing MCP session to test...");
  const endpoint = `${baseUrl}/wp-json/mcp/wp-mcp-ultimate?cb=${Date.now()}`;
  const initRes = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json", "Cache-Control": "no-cache" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } }
    })
  });
  
  const initData = await initRes.json();
  const sid = initRes.headers.get("mcp-session-id");
  log(`Init response code: ${initRes.status}, Session ID: ${sid}`);

  if (initRes.status === 200 && sid) {
    log("Calling tools/list...");
    const listRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        "Mcp-Session-Id": sid,
        "Cache-Control": "no-cache"
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })
    });
    const listData = await listRes.json();
    log(`Tools list response: ${JSON.stringify(listData, null, 2)}`);
  }
}

async function main() {
  log("=== Starting MCP Plugin Restart Tool ===");
  
  // 1. Deactivate plugin
  await setPluginStatus("inactive");
  await new Promise(r => setTimeout(r, 4000));

  // 2. Activate plugin
  await setPluginStatus("active");
  await new Promise(r => setTimeout(r, 4000));

  // 3. Test tools/list
  await testMcpTools();
}

main().catch(console.error);
