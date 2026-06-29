/**
 * Deploy plugin fix TITLE_LONG/SHORT cho 10 bài:
 * id=26   hut-be-phot-quang-ninh (TITLE_SHORT 56 → extend)
 * id=38   nao-vet-ho-ga-quang-ninh (TITLE_SHORT 58 → extend)
 * id=386  nguyen-nhan-cong-tac-thuong-xuyen-ha-long (TITLE_SHORT 53)
 * id=2046 mui-hoi-cong-nguyen-nhan-xu-ly (TITLE_SHORT 53)
 * id=2412 thong-tac-bon-cau-nha-hang (TITLE_LONG 76 → fix ≤65)
 * id=2694 hut-be-phot-cong-ty     (TITLE_SHORT 53 → extend)
 * id=2702 hut-be-phot-khach-san   (TITLE_SHORT 58 → extend)
 * id=2708 hut-be-phot-khu-nha-tro (TITLE_SHORT 56 → extend)
 * id=2687 hut-be-phot-nha-hang    (60 chars ✓ keep)
 * id=2559 hut-ham-cau              (TITLE_SHORT 53 → extend)
 * v3: +4 pages/posts, option key v3
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}
const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");

// Titles mới — 60–65 chars, có keyword + địa phương, không từ cấm
const TITLES = {
  26:   "Hút Bể Phốt Quảng Ninh 24/7 – Xe Bồn Hút Sạch, Có Mặt 15 Phút",     // 61
  38:   "Nạo Vét Hố Ga Quảng Ninh 24/7 – Tránh Ngập Mùa Mưa, Gọi Ngay",     // 60
  386:  "Nguyên Nhân Cống Tắc Thường Xuyên Hạ Long – Xử Lý Và Phòng Tránh", // 64
  2046: "Mùi Hôi Từ Cống Trong Nhà – Nguyên Nhân Và Cách Xử Lý Triệt Để",   // 63
  2412: "Thông Tắc Bồn Cầu Nhà Hàng Quảng Ninh 24/7 – Nhanh, Không Đục Phá", // 65
  2694: "Hút Bể Phốt Công Ty Quảng Ninh – Báo Giá Miễn Phí, Hóa Đơn VAT",   // 62
  2702: "Hút Bể Phốt Khách Sạn Quảng Ninh – Nhanh 15 Phút, Không Mùi Hôi",   // 63
  2708: "Hút Bể Phốt Khu Nhà Trọ Quảng Ninh – Xe Vào Ngõ Sâu, Phục Vụ 24/7", // 65
  2687: "Hút Bể Phốt Nhà Hàng Quảng Ninh – Không Gián Đoạn Kinh Doanh",      // 60
  2559: "Hút Hầm Cầu Quảng Ninh 24/7 – Xe Bồn Chuyên Dụng, Có Mặt 15 Phút",  // 64
};

// Verify lengths
console.log("=== Kiểm tra độ dài title ===");
let allOk = true;
for (const [id, t] of Object.entries(TITLES)) {
  const len = [...t].length;
  const status = len <= 65 ? "✓" : `⚠ TOO LONG (${len})`;
  console.log(`  id=${id} (${len} chars) ${status}: "${t}"`);
  if (len > 65) allOk = false;
}
if (!allOk) { console.log("⚠ Có title > 65 chars — sửa trước"); process.exit(1); }
console.log("✓ Tất cả ≤ 65 chars\n");

function phpStr(s) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// Build PHP switch cases
let phpCases = "";
let phpInitUpdates = "";
for (const [id, title] of Object.entries(TITLES)) {
  phpCases += `        case ${id}: return '${phpStr(title)}';\n`;
  phpInitUpdates += `        update_post_meta(${id}, 'rank_math_title', '${phpStr(title)}');\n`;
  phpInitUpdates += `        wp_cache_delete(${id}, 'post_meta');\n`;
}

const phpCode = Buffer.from(`<?php
/**
 * Plugin Name: TTCQN Title Long Fix
 * Description: Fix TITLE_LONG/SHORT cho 10 bài — pre_get_document_title priority 999.
 * Version: 3.0
 */
if (!defined('ABSPATH')) exit;

function ttcqn_title_long_fixed(int $post_id): ?string {
    switch ($post_id) {
${phpCases}        default: return null;
    }
}

add_filter('pre_get_document_title', function(string $title): string {
    $id = (int) get_queried_object_id();
    $fixed = ttcqn_title_long_fixed($id);
    return $fixed !== null ? $fixed : $title;
}, 999);

// Một lần duy nhất: ghi vào rank_math_title để crawlers cũng thấy
add_action('init', function(): void {
    if (get_option('ttcqn_title_long_fix_v3')) return;
${phpInitUpdates}    update_option('ttcqn_title_long_fix_v3', 1);
}, 1);
`, "utf8");

// === MCP ZIP build ===
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (const b of buf) { c ^= b; for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0); }
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function buildZip(entries) {
  const parts = [], cds = []; let off = 0;
  for (const [name, data] of entries) {
    const nb = Buffer.from(name, "utf8");
    const db = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
    const cr = crc32(db);
    const lh = Buffer.alloc(30 + nb.length);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6); lh.writeUInt16LE(0, 8); lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0, 12); lh.writeUInt32LE(cr, 14); lh.writeUInt32LE(db.length, 18); lh.writeUInt32LE(db.length, 22); lh.writeUInt16LE(nb.length, 26); lh.writeUInt16LE(0, 28); nb.copy(lh, 30);
    parts.push(lh, db);
    const cd = Buffer.alloc(46 + nb.length);
    cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6); cd.writeUInt16LE(0, 8); cd.writeUInt16LE(0, 10); cd.writeUInt16LE(0, 12); cd.writeUInt16LE(0, 14); cd.writeUInt32LE(cr, 16); cd.writeUInt32LE(db.length, 20); cd.writeUInt32LE(db.length, 24); cd.writeUInt16LE(nb.length, 28); cd.writeUInt16LE(0, 30); cd.writeUInt16LE(0, 32); cd.writeUInt16LE(0, 34); cd.writeUInt16LE(0, 36); cd.writeUInt32LE(0, 38); cd.writeUInt32LE(off, 42); nb.copy(cd, 46);
    cds.push(cd); off += lh.length + db.length;
  }
  const cdBuf = Buffer.concat(cds);
  const eo = Buffer.alloc(22);
  eo.writeUInt32LE(0x06054b50, 0); eo.writeUInt16LE(0, 4); eo.writeUInt16LE(0, 6); eo.writeUInt16LE(cds.length, 8); eo.writeUInt16LE(cds.length, 10); eo.writeUInt32LE(cdBuf.length, 12); eo.writeUInt32LE(off, 16); eo.writeUInt16LE(0, 20);
  return Buffer.concat([...parts, cdBuf, eo]);
}

// MCP init
let SID = null;
function mcpReq(body) {
  return new Promise((res, rej) => {
    const b = Buffer.from(JSON.stringify(body), "utf8");
    const o = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json/mcp/wp-mcp-ultimate", method: "POST",
      headers: {
        Host: WP_HOST, Authorization: auth, "Content-Type": "application/json",
        "Content-Length": b.length, ...(SID ? { "Mcp-Session-Id": SID } : {}),
      },
      rejectUnauthorized: false,
    };
    const r = https.request(o, resp => {
      let d = "";
      resp.on("data", c => d += c);
      resp.on("end", () => {
        if (!SID && resp.headers["mcp-session-id"]) SID = resp.headers["mcp-session-id"];
        try { res({ s: resp.statusCode, d: JSON.parse(d) }); } catch { res({ s: resp.statusCode, d }); }
      });
    });
    r.on("error", rej); r.setTimeout(60000, () => r.destroy(new Error("t"))); r.write(b); r.end();
  });
}
function ability(name, params) {
  return mcpReq({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: name, parameters: params } } });
}

await mcpReq({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, clientInfo: { name: "title-long-fix", version: "1" } } });

const zip = buildZip([["ttcqn-title-long-fix/ttcqn-title-long-fix.php", phpCode]]);
console.log(`ZIP: ${zip.length} bytes — deploying...`);

const r = await ability("plugins/upload-base64", {
  content_base64: zip.toString("base64"),
  filename: "ttcqn-title-long-fix.zip",
  activate: true,
  overwrite: true,
});
const t = r.d?.result?.content?.[0]?.text ?? "";
const ok = t.includes("success");
console.log(ok ? "✓ deployed" : "? " + t.slice(0, 200));

// Log
const TODAY = "2026-06-09";
const TIME = new Date().toTimeString().slice(0, 5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-TITLE-SHORT-v3-${TODAY},seo_fix,TITLE fix 10 posts/pages (ids 26/38/386/2046+6) 60–65 chars,https://thongtaccongquangninh.com/,,done,high,,,,,60–65 chars,tools/deploy_title_long_fix.mjs,,re-audit needed,,,,,,`,
  "utf8"
);
console.log("✓ logged");
