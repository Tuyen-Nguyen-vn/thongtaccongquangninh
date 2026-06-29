import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
}
const WP_BASE_URL = env.WP_BASE_URL || "https://thongtaccongquangninh.com";
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const endpoint = `${WP_BASE_URL}/wp-json/mcp/wp-mcp-ultimate`;

const SLUG = "ttcqn-check-postmeta";
const PLUGIN_DIR = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}`;
const PLUGIN_FILE = `${PLUGIN_DIR}\\${SLUG}.php`;
const ZIP_PATH = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}.zip`;

if (!existsSync(PLUGIN_DIR)) mkdirSync(PLUGIN_DIR, { recursive: true });
writeFileSync(PLUGIN_FILE, `<?php
/*
Plugin Name: TTCQN Check PostMeta
Description: One-time: dump rank_math_description for posts 35,26,380,384,386,2589. Self-deactivates.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;
add_action( 'init', function() {
    $ids = [35, 26, 380, 384, 386, 2589];
    $out = [];
    foreach ($ids as $id) {
        $desc = get_post_meta($id, 'rank_math_description', true);
        $out[] = $id . ': [' . mb_strlen($desc) . '] ' . substr($desc, 0, 80);
    }
    file_put_contents(ABSPATH . 'postmeta_dump.txt', implode("\\n", $out));
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
`, "utf8");

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

await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "check-meta", version: "1" } }, 1);

const zipB64 = readFileSync(ZIP_PATH).toString("base64");
const r = await ability("plugins/upload-base64", { content_base64: zipB64, filename: `${SLUG}.zip`, activate: true, overwrite: true });
console.log("Plugin deployed:", JSON.stringify(r).slice(0, 200));

// Read the dump file
await new Promise(res => setTimeout(res, 2000));
const r2 = await ability("files/read-file", { path: "postmeta_dump.txt" });
console.log("PostMeta dump:\n", JSON.stringify(r2).slice(0, 800));
