/**
 * Diagnostic: dump all rank_math_* postmeta for post 2554
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
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

const SLUG = "ttcqn-dump-meta-2554";
const PLUGIN_DIR = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}`;
const PLUGIN_FILE = `${PLUGIN_DIR}\\${SLUG}.php`;
const ZIP_PATH   = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}.zip`;

if (!existsSync(PLUGIN_DIR)) {
  execSync(`powershell -Command "New-Item -ItemType Directory -Force '${PLUGIN_DIR}'"`, {stdio:"pipe"});
}

writeFileSync(PLUGIN_FILE, `<?php
/*
Plugin Name: TTCQN Dump Meta 2554
Description: Dump rank_math postmeta for post 2554 to transient, then deactivate.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    $post_id = 2554;
    global $wpdb;
    $rows = $wpdb->get_results( $wpdb->prepare(
        "SELECT meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key LIKE %s",
        $post_id, 'rank_math%'
    ), ARRAY_A );
    set_transient( 'ttcqn_meta_dump_2554', $rows, 300 );
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
`, "utf8");

if (existsSync(ZIP_PATH)) execSync(`powershell -Command "Remove-Item '${ZIP_PATH}' -Force"`, {stdio:"pipe"});
execSync(`python -c "import zipfile; zf = zipfile.ZipFile(r'${ZIP_PATH}', 'w', zipfile.ZIP_DEFLATED); zf.write(r'${PLUGIN_FILE}', '${SLUG}/${SLUG}.php'); zf.close()"`, {stdio:"pipe"});

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

await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "dump-meta-2554", version: "1" } }, 1);
const zipB64 = readFileSync(ZIP_PATH).toString("base64");
const r = await ability("plugins/upload-base64", { content_base64: zipB64, filename: `${SLUG}.zip`, activate: true, overwrite: true });
console.log("Plugin deployed:", JSON.stringify(r).slice(0,200));

// Read transient via WP REST
await new Promise(r => setTimeout(r, 2000));
function wpGet(path) {
  return new Promise((res, rej) => {
    const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
    const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};
    const req=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    req.on("error",rej);req.setTimeout(10000,()=>req.destroy(new Error("t")));req.end();
  });
}
const transient = await wpGet('/wp-json/wp/v2/settings');
// Try to read transient via plugin endpoint or options
const opts = await ability("options/get", {option_name: "_transient_ttcqn_meta_dump_2554"});
console.log("Transient data:", JSON.stringify(opts).slice(0,500));
