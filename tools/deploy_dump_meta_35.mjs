import { readFileSync, existsSync } from "node:fs";
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

const SLUG = "ttcqn-dump-all-meta";
const PLUGIN_DIR = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}`;
const PLUGIN_FILE = `${PLUGIN_DIR}\\${SLUG}.php`;
const ZIP_PATH = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}.zip`;

const { execSync: exec } = await import("node:child_process");
if (existsSync(ZIP_PATH)) exec(`powershell -Command "Remove-Item '${ZIP_PATH}' -Force"`);
exec(`python -c "import zipfile; zf = zipfile.ZipFile(r'${ZIP_PATH}', 'w', zipfile.ZIP_DEFLATED); zf.write(r'${PLUGIN_FILE}', '${SLUG}/${SLUG}.php'); zf.close()"`);

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

await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "dump-meta", version: "1" } }, 1);
const zipB64 = readFileSync(ZIP_PATH).toString("base64");
const r = await ability("plugins/upload-base64", { content_base64: zipB64, filename: `${SLUG}.zip`, activate: true, overwrite: true });
const ok = JSON.stringify(r).includes("activated") || JSON.stringify(r).includes('"success":true');
console.log(ok ? "✅ Plugin deployed" : "❌ " + JSON.stringify(r).slice(0, 200));

// Read dump via HTTPS
await new Promise(res => setTimeout(res, 2000));

const r2 = await new Promise((resolve, reject) => {
  const opts = {
    hostname: "103.57.220.210", port: 443, servername: "thongtaccongquangninh.com",
    path: "/meta_dump_35.txt", method: "GET",
    headers: { Host: "thongtaccongquangninh.com" }, rejectUnauthorized: false,
  };
  const req = https.request(opts, (res) => {
    let d = ""; res.on("data", c => d += c);
    res.on("end", () => resolve({ status: res.statusCode, body: d }));
  });
  req.on("error", reject);
  req.setTimeout(10000, () => req.destroy(new Error("timeout")));
  req.end();
});
console.log(`\nMeta dump (status ${r2.status}):\n${r2.body}`);
