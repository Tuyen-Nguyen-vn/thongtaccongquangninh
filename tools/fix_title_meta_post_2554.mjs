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

// Title mới: 59 ký tự — bỏ site name suffix, giữ từ khóa chính + hotline
const NEW_TITLE = "Xe Hút Bể Phốt Quảng Ninh – Có Mặt 15 Phút | 0963.953.533";
// Desc mới: 157 ký tự — thêm "rõ ràng" để đủ 150-160
const NEW_DESC  = "Xe hút bể phốt Quảng Ninh – xe bồn 5 khối hút sạch bể 1–20 khối, có mặt sau 15 phút, không đục phá, báo giá rõ ràng trước thi công. Gọi ngay 0963.953.533.";

console.log(`Title (${NEW_TITLE.length}): ${NEW_TITLE}`);
console.log(`Desc  (${NEW_DESC.length}): ${NEW_DESC}`);

const SLUG = "ttcqn-fix-titlemeta-2554";
const PLUGIN_DIR = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}`;
const PLUGIN_FILE = `${PLUGIN_DIR}\\${SLUG}.php`;
const ZIP_PATH = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}.zip`;

if (!existsSync(PLUGIN_DIR)) mkdirSync(PLUGIN_DIR, { recursive: true });

const phpContent = `<?php
/*
Plugin Name: TTCQN Fix Title Meta Post 2554
Description: One-time: set rank_math_title and rank_math_description for post 2554, then self-deactivate.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
    $post_id = 2554;
    update_post_meta( $post_id, 'rank_math_title', '${NEW_TITLE}' );
    update_post_meta( $post_id, 'rank_math_description', '${NEW_DESC}' );
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
`;

writeFileSync(PLUGIN_FILE, phpContent, "utf8");
if (existsSync(ZIP_PATH)) execSync(`powershell -Command "Remove-Item '${ZIP_PATH}' -Force"`);
execSync(`python -c "import zipfile; zf = zipfile.ZipFile(r'${ZIP_PATH}', 'w', zipfile.ZIP_DEFLATED); zf.write(r'${PLUGIN_FILE}', '${SLUG}/${SLUG}.php'); zf.close()"`);
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

await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "fix-titlemeta", version: "1" } }, 1);
const zipB64 = readFileSync(ZIP_PATH).toString("base64");
const r = await ability("plugins/upload-base64", { content_base64: zipB64, filename: `${SLUG}.zip`, activate: true, overwrite: true });
const ok = JSON.stringify(r).includes("activated") || JSON.stringify(r).includes('"success":true');
console.log(ok ? "✅ Title và meta đã cập nhật." : "❌ " + JSON.stringify(r).slice(0, 300));
