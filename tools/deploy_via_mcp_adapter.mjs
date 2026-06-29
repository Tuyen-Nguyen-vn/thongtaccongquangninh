/**
 * Deploy via mcp-adapter-default-server which has mcp-adapter-execute-ability tool
 */
import https from "node:https";
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

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
function mcpReq(body) {
  return new Promise((res, rej) => {
    const b = Buffer.from(JSON.stringify(body), "utf8");
    const r = https.request(
      { hostname: SERVER_IP, port: 443, servername: WP_HOST,
        path: "/wp-json/mcp/mcp-adapter-default-server", method: "POST",
        headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json", "Content-Length": b.length, ...(SID ? { "Mcp-Session-Id": SID } : {}) },
        rejectUnauthorized: false },
      resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => { if (!SID && resp.headers["mcp-session-id"]) SID = resp.headers["mcp-session-id"]; try { res({ s: resp.statusCode, d: JSON.parse(d) }); } catch { res({ s: resp.statusCode, d }); } }); }
    );
    r.on("error", rej); r.setTimeout(60000, () => r.destroy()); r.write(b); r.end();
  });
}
function fetchPage(path) {
  return new Promise((res, rej) => {
    const o = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path, method: "GET", headers: { Host: WP_HOST, "User-Agent": "Mozilla/5.0" }, rejectUnauthorized: false };
    const r = https.request(o, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => res(d)); });
    r.on("error", rej); r.setTimeout(15000, () => r.destroy()); r.end();
  });
}

// Initialize mcp-adapter session
await mcpReq({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "deploy-via-adapter", version: "1" } } });
await mcpReq({ jsonrpc: "2.0", method: "notifications/initialized" });
console.log("SID:", SID);

// List tools to confirm
const toolList = await mcpReq({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
const tools = toolList.d?.result?.tools ?? [];
console.log("Tools:", tools.map(t => t.name).join(", "));

// Discover abilities via mcp-adapter-discover-abilities
const discover = await mcpReq({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "mcp-adapter-discover-abilities", arguments: {} } });
const discoverText = discover.d?.result?.content?.[0]?.text ?? JSON.stringify(discover.d);
console.log("\nDiscovered abilities:", discoverText.slice(0, 1000));

// Check if plugins/upload-base64 is in the list
const hasUpload = discoverText.includes("upload") || discoverText.includes("plugin");
console.log("Has upload/plugin:", hasUpload);

// Build and deploy plugin
const SLUG = "ttcqn-seo-cleanup-redirects";
const PLUGIN_FILE = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}\\${SLUG}.php`;
const ZIP_PATH = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}.zip`;

if (existsSync(ZIP_PATH)) execSync(`powershell -Command "Remove-Item '${ZIP_PATH}' -Force"`, { stdio: "pipe" });
execSync(`python -c "import zipfile; zf = zipfile.ZipFile(r'${ZIP_PATH}', 'w', zipfile.ZIP_DEFLATED); zf.write(r'${PLUGIN_FILE}', '${SLUG}/${SLUG}.php'); zf.close()"`, { stdio: "pipe" });
const zipB64 = readFileSync(ZIP_PATH).toString("base64");
console.log(`\nZIP: ${readFileSync(ZIP_PATH).length} bytes`);

// Try executing plugins/upload-base64 via mcp-adapter
console.log("\n=== Trying mcp-adapter-execute-ability: plugins/upload-base64 ===");
const r = await mcpReq({ jsonrpc: "2.0", id: 4, method: "tools/call", params: {
  name: "mcp-adapter-execute-ability",
  arguments: {
    ability_name: "plugins/upload-base64",
    parameters: { content_base64: zipB64, filename: `${SLUG}.zip`, activate: true, overwrite: true }
  }
}});
console.log("Status:", r.s);
console.log("Result:", JSON.stringify(r.d).slice(0, 500));

// Verify
await new Promise(r => setTimeout(r, 3000));
const html = await fetchPage("/xe-hut-be-phot-quang-ninh/");
const rm = html.match(/<meta\s+name="robots"\s+content="([^"]*?)"/i);
console.log("\nxe-hut-be-phot robots:", rm?.[1] || "not found");
console.log("NOINDEX:", html.includes("noindex") ? "❌ STILL noindex" : "✓ CLEAN");
