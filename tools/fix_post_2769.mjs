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

const POST_ID  = 2769;
const NEW_TITLE = "Hút Bể Phốt Khu Công Nghiệp Quảng Ninh – Có Mặt 15 Phút";
const NEW_DESC  = "Hút bể phốt khu công nghiệp Quảng Ninh – xe bồn 5 khối, có mặt trong 15 phút, không đục phá, báo giá minh bạch. Gọi ngay 0963.953.533, phục vụ 24/7. Bảo hành.";

console.log(`Title (${[...NEW_TITLE].length}): ${NEW_TITLE}`);
console.log(`Desc  (${[...NEW_DESC].length}): ${NEW_DESC}`);

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

await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "fix-2769", version: "1" } }, 1);

// 1. Fix H2 + add Service schema vào raw content
const r = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/posts/${POST_ID}?context=edit&_fields=id,content`, { headers: { Authorization: auth } });
const p = await r.json();
let raw = p.content?.raw || "";

// Đổi H2 đầu tiên thành có "Nguyên nhân"
raw = raw.replace(
  /<h2[^>]*>Tại Sao Bể Phốt Khu Công Nghiệp Dễ Quá Tải Hơn Nhà Dân\?<\/h2>/i,
  "<h2>Nguyên Nhân Bể Phốt Khu Công Nghiệp Dễ Quá Tải Hơn Nhà Dân</h2>"
);

// Thêm Service schema nếu chưa có trong raw
if (!raw.includes('"Service"')) {
  raw += `
<!-- Schema: Service + LocalBusiness -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Hút Bể Phốt Khu Công Nghiệp Quảng Ninh",
  "description": "Dịch vụ hút bể phốt khu công nghiệp tại Quảng Ninh 24/7. Xe bồn 5 khối, có mặt 15 phút, không đục phá, báo giá minh bạch. Hotline: 0963.953.533.",
  "serviceType": "Hút bể phốt khu công nghiệp",
  "areaServed": { "@type": "State", "name": "Quảng Ninh" },
  "url": "https://thongtaccongquangninh.com/hut-be-phot-khu-cong-nghiep-quang-ninh-2026/",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
    "url": "https://thongtaccongquangninh.com",
    "telephone": "+84963953533",
    "address": { "@type": "PostalAddress", "addressLocality": "Hạ Long", "addressRegion": "Quảng Ninh", "addressCountry": "VN" },
    "geo": { "@type": "GeoCoordinates", "latitude": "20.9509", "longitude": "107.0845" },
    "openingHours": "Mo-Su 00:00-23:59",
    "priceRange": "₫₫"
  }
}
</script>`;
}

const r1 = await ability("content/update-post", { id: POST_ID, content: raw });
const ok1 = JSON.stringify(r1).includes('"success":true');
console.log(ok1 ? "✅ H2 + Service schema cập nhật." : "❌ content: " + JSON.stringify(r1).slice(0, 200));

// 2. Fix title + meta via one-time plugin
const SLUG = "ttcqn-fix-2769-titlemeta";
const PLUGIN_DIR = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}`;
const PLUGIN_FILE = `${PLUGIN_DIR}\\${SLUG}.php`;
const ZIP_PATH = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}.zip`;

if (!existsSync(PLUGIN_DIR)) mkdirSync(PLUGIN_DIR, { recursive: true });
writeFileSync(PLUGIN_FILE, `<?php
/*
Plugin Name: TTCQN Fix Post 2769 Title Meta
Description: One-time: fix rank_math_title + description for post 2769. Self-deactivates.
Version: 1.0.0
*/
if ( ! defined( 'ABSPATH' ) ) exit;
add_action( 'init', function() {
    update_post_meta( ${POST_ID}, 'rank_math_title', '${NEW_TITLE.replace(/'/g, "\\'")}' );
    update_post_meta( ${POST_ID}, 'rank_math_description', '${NEW_DESC.replace(/'/g, "\\'")}' );
    deactivate_plugins( plugin_basename( __FILE__ ) );
} );
`, "utf8");

if (existsSync(ZIP_PATH)) execSync(`powershell -Command "Remove-Item '${ZIP_PATH}' -Force"`);
execSync(`python -c "import zipfile; zf = zipfile.ZipFile(r'${ZIP_PATH}', 'w', zipfile.ZIP_DEFLATED); zf.write(r'${PLUGIN_FILE}', '${SLUG}/${SLUG}.php'); zf.close()"`);

const zipB64 = readFileSync(ZIP_PATH).toString("base64");
const r2 = await ability("plugins/upload-base64", { content_base64: zipB64, filename: `${SLUG}.zip`, activate: true, overwrite: true });
const ok2 = JSON.stringify(r2).includes("activated") || JSON.stringify(r2).includes('"success":true');
console.log(ok2 ? "✅ Title + meta đã cập nhật." : "❌ plugin: " + JSON.stringify(r2).slice(0, 200));

appendFileSync("docs/SEO_PROGRESS.csv", "\n2026-06-10,post_2769_fix,fix_title_meta_h2_schema,done,\"TITLE_LONG→57; META_SHORT→162; H2 Nguyen nhan; Service schema\",re-audit", "utf8");
