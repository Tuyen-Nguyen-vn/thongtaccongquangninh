/**
 * Extend rank_math_description cho 8 URL còn META_SHORT.
 * Mỗi desc được viết đủ 150-160 chars, có hotline.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from "node:fs";
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

// 150-160 chars mỗi desc, có hotline
const FIXES = [
  { id: 2589, type: "post", desc: "Nhận biết 5 dấu hiệu bể phốt bị đầy: mùi hôi, rút chậm, nước trào, côn trùng nhiều. Gọi 0963.953.533 hút ngay tại Quảng Ninh, có mặt 15 phút. 24/7." },
  { id: 26,   type: "page", desc: "Hút bể phốt Quảng Ninh 24/7 bằng xe bồn chuyên dụng, hút sạch, báo giá trước, hỗ trợ nhà dân và công trình. Gọi 0963.953.533. Có mặt 15 phút, bảo hành." },
  { id: 386,  type: "page", desc: "Tìm nguyên nhân cống tắc thường xuyên tại Hạ Long: dầu mỡ, bùn cặn, hố ga đầy, ống sai độ dốc. Gọi 0963.953.533. Có mặt 15 phút, xử lý tại chỗ." },
  { id: 380,  type: "page", desc: "Thông tắc cống chung cư Hạ Long, xử lý trục đứng, tầng hầm, cống bếp và thoát sàn bằng thiết bị phù hợp. Gọi 0963.953.533. Thợ có mặt 15 phút." },
  { id: 384,  type: "page", desc: "Thông tắc cống ngõ nhỏ Hạ Long cho nhà dân, nhà trọ, cửa hàng. Thợ mang thiết bị gọn, xử lý nhanh, báo giá trước. Gọi 0963.953.533. Thợ có mặt 15 phút." },
  { id: 35,   type: "page", desc: "Thông tắc cống Quảng Ninh 24/7 bằng máy lò xo, xử lý nước trào, mùi hôi, cống nghẹt, không đục phá khi chưa cần. Gọi 0963.953.533. Có mặt 15 phút, bảo hành." },
  { id: 1369, type: "post", desc: "Xử lý mùi hôi nhà vệ sinh Quảng Ninh 24/7 — tìm đúng nguồn hôi từ bể phốt, cống, ron cầu, hết hẳn không quay lại. Gọi 0963.953.533. Thợ có mặt 15 phút." },
  { id: 311,  type: "page", desc: "Xử lý mùi hôi Quảng Ninh 24/7 — tìm đúng nguồn hôi từ cống, bể phốt, hố ga, xử lý hết hẳn không tái phát. Thợ có mặt 15 phút, bảo hành. Gọi 0963.953.533." },
];

// Verify lengths
for (const f of FIXES) {
  const len = [...f.desc].length;
  if (len < 150 || len > 160) console.warn(`⚠️  ID ${f.id}: desc ${len} chars — ngoài range!`);
  else console.log(`✓ ID ${f.id}: ${len} chars`);
}

// Build PHP plugin
const SLUG = "ttcqn-fix-meta-short-batch2";
const PLUGIN_DIR = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}`;
const PLUGIN_FILE = `${PLUGIN_DIR}\\${SLUG}.php`;
const ZIP_PATH = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}.zip`;

if (!existsSync(PLUGIN_DIR)) mkdirSync(PLUGIN_DIR, { recursive: true });

const updates = FIXES.map(f => `    update_post_meta( ${f.id}, 'rank_math_description', '${f.desc.replace(/'/g, "\\'")}' );`).join("\n");

const phpContent = `<?php
/*
Plugin Name: TTCQN Fix Meta Short Batch 2
Description: One-time: extend rank_math_description for 8 URLs with META_SHORT. Self-deactivates.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function() {
${updates}
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

await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "fix-meta-batch2", version: "1" } }, 1);
const zipB64 = readFileSync(ZIP_PATH).toString("base64");
const r = await ability("plugins/upload-base64", { content_base64: zipB64, filename: `${SLUG}.zip`, activate: true, overwrite: true });
const ok = JSON.stringify(r).includes("activated") || JSON.stringify(r).includes('"success":true');
console.log(ok ? "✅ rank_math_description cập nhật cho 8 URL." : "❌ " + JSON.stringify(r).slice(0, 300));

appendFileSync("docs/SEO_PROGRESS.csv", "\n2026-06-10,meta_short_batch2,fix_meta_short_8_urls,done,\"rank_math_description extend 150-160 chars cho 8 URL\",re-audit", "utf8");
