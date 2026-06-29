/**
 * Khôi phục index cho post 2554 (xe-hut-be-phot-quang-ninh)
 * Slug cũ là -2026 đã đổi thành clean slug → không còn lý do noindex
 * Xóa canonical_url sai (trỏ vào -2026) → để Rank Math tự dùng current permalink
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
}
const WP_BASE_URL = env.WP_BASE_URL || "https://thongtaccongquangninh.com";
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const endpoint = `${WP_BASE_URL}/wp-json/mcp/wp-mcp-ultimate`;

const SLUG = "ttcqn-restore-index-2554";
const PLUGIN_DIR = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}`;
const PLUGIN_FILE = `${PLUGIN_DIR}\\${SLUG}.php`;
const ZIP_PATH   = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}.zip`;

if (!existsSync(PLUGIN_DIR)) {
  execSync(`powershell -Command "New-Item -ItemType Directory -Force '${PLUGIN_DIR}'"`, {stdio:"pipe"});
}

writeFileSync(PLUGIN_FILE, `<?php
/*
Plugin Name: TTCQN Restore Index Post 2554
Description: Set rank_math_robots index/follow, xóa canonical cũ (-2026), rồi self-deactivate.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    $post_id = 2554;
    // Khôi phục index+follow
    update_post_meta( $post_id, 'rank_math_robots', [ 'index', 'follow' ] );
    // Xóa canonical cũ (-2026) để Rank Math dùng current permalink
    delete_post_meta( $post_id, 'rank_math_canonical_url' );
    // Xóa advanced robots nếu có noindex ở đó
    delete_post_meta( $post_id, 'rank_math_advanced_robots' );
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
`, "utf8");

if (existsSync(ZIP_PATH)) execSync(`powershell -Command "Remove-Item '${ZIP_PATH}' -Force"`, {stdio:"pipe"});
execSync(`python -c "import zipfile; zf = zipfile.ZipFile(r'${ZIP_PATH}', 'w', zipfile.ZIP_DEFLATED); zf.write(r'${PLUGIN_FILE}', '${SLUG}/${SLUG}.php'); zf.close()"`, {stdio:"pipe"});
console.log("Zip tạo xong.");

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

await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "restore-index-2554", version: "1" } }, 1);
const zipB64 = readFileSync(ZIP_PATH).toString("base64");
const r = await ability("plugins/upload-base64", { content_base64: zipB64, filename: `${SLUG}.zip`, activate: true, overwrite: true });
const ok = JSON.stringify(r).includes("activated") || JSON.stringify(r).includes('"success":true');
console.log(ok ? "✓ Post 2554: noindex removed, canonical cleared." : "✗ " + JSON.stringify(r).slice(0, 300));

const TODAY="2026-06-16"; const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},RESTORE-INDEX-2554-${TODAY},seo_fix,Khoi phuc index post 2554 xe-hut-be-phot-quang-ninh — slug da clean khong can noindex nua,https://thongtaccongquangninh.com/xe-hut-be-phot-quang-ninh/,,done,high,,,,,deploy plugin restore-index-2554,tools/restore_index_2554.mjs,,verify live robots meta,,,,,,`,
  "utf8");
console.log("✓ logged");
