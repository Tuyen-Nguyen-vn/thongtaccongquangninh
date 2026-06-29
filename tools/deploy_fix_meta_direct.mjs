import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import https from "node:https";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
}
const WP_BASE_URL = env.WP_BASE_URL || "https://thongtaccongquangninh.com";
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const endpoint = `${WP_BASE_URL}/wp-json/mcp/wp-mcp-ultimate`;
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";

const SLUG = "ttcqn-fix-meta-direct";
const PLUGIN_DIR = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}`;
const PLUGIN_FILE = `${PLUGIN_DIR}\\${SLUG}.php`;
const ZIP_PATH = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}.zip`;

if (existsSync(ZIP_PATH)) execSync(`powershell -Command "Remove-Item '${ZIP_PATH}' -Force"`);
execSync(`python -c "import zipfile; zf = zipfile.ZipFile(r'${ZIP_PATH}', 'w', zipfile.ZIP_DEFLATED); zf.write(r'${PLUGIN_FILE}', '${SLUG}/${SLUG}.php'); zf.close()"`);

let SID = null;
async function rpc(method, params, id) {
  const headers = { Authorization: auth, "Content-Type": "application/json", Accept: "application/json" };
  if (SID) headers["Mcp-Session-Id"] = SID;
  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  if (!SID) SID = res.headers.get("mcp-session-id");
  return res.json();
}
async function ability(name, params) {
  return rpc("tools/call", { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: name, parameters: params } }, Date.now());
}

await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "fix-meta-direct", version: "1" } }, 1);
const zipB64 = readFileSync(ZIP_PATH).toString("base64");
const r = await ability("plugins/upload-base64", { content_base64: zipB64, filename: `${SLUG}.zip`, activate: true, overwrite: true });
const ok = JSON.stringify(r).includes("activated") || JSON.stringify(r).includes('"success":true');
console.log(ok ? "✅ Plugin deployed & activated" : "❌ " + JSON.stringify(r).slice(0, 300));

// Read result from wp_options via REST API
await new Promise(res => setTimeout(res, 2000));

function httpsGet(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth }, rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

const r2 = await httpsGet("/wp-json/wp/v2/settings");
let settings;
try { settings = JSON.parse(r2.body); } catch { settings = null; }
if (settings?.ttcqn_fix_meta_result) {
  console.log("Fix result:", settings.ttcqn_fix_meta_result);
} else {
  console.log("Settings response:", r2.status, r2.body.slice(0, 200));
}

// Check live meta on 2 pages
console.log("\nVerifying live pages...");
for (const [path, id] of [
  ["/thong-tac-cong-quang-ninh/", 35],
  ["/hut-be-phot-quang-ninh/", 26],
]) {
  const r3 = await httpsGet(path);
  const m = r3.body.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const desc = m?.[1] ?? "(not found)";
  console.log(`[${id}] [${[...desc].length}] ${desc}`);
}
