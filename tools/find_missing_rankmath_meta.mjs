/**
 * Tìm tất cả published/public posts+pages chưa được set Rank Math focus KW
 * bằng cách so sánh wp-url-audit-list.json với danh sách đã cover.
 *
 * Usage: node tools/find_missing_rankmath_meta.mjs
 */
import { readFileSync } from "node:fs";
import https from "node:https";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const AUDIT_JSON = "D:\\.thongtaccongquangninh\\wp-url-audit-list.json";

// Tất cả IDs đã được set Rank Math meta qua 4 scripts
const COVERED_IDS = new Set([
  // set_rankmath_meta_landings.mjs (5)
  26, 35, 37, 2559, 38,
  // set_rankmath_meta_area_pages.mjs (14)
  52, 53, 54, 55, 56, 57, 58,
  296, 991, 992, 993, 2054,
  1482, 450,
  // set_rankmath_meta_remaining.mjs (23)
  1486, 1483, 1481, 1487, 1485,
  400, 405, 426, 425, 427, 424,
  2047, 2048, 2049, 2050, 2051, 2052,
  2025, 2044, 2589, 1367, 1377, 2357,
  // set_rankmath_meta_bc_extra.mjs (9)
  2377, 2379, 2385, 2407, 2412, 2417, 2430, 2439, 2449,
  // set_rankmath_meta_final_batch.mjs (20)
  311, 380, 383, 384, 436, 1368, 1369, 2053, 2332, 217,
  36, 61, 62, 63, 215, 216, 386, 2043, 2045, 2046,
  // set_rankmath_meta_newposts_2026.mjs (8) — 2026-06-14
  2687, 2694, 2702, 2708, 2769, 2777, 2782, 2787,
  // pages: trang-chu, blog, doi-tac, author (4) — 2026-06-14
  23, 25, 2022, 2356,
  // Tuần 2 content batch — 2026-06-16
  2913, // hut-be-phot-ha-long
]);

// Bỏ qua: noindex (2554), draft (2378), non-SEO pages
const SKIP_IDS = new Set([2554, 2378]);
// Slug patterns không cần focus KW
const SKIP_SLUG_PATTERNS = [
  /^draft-/, /^sample-/, /dieu-khoan/, /chinh-sach/, /privacy/, /terms/,
  /sitemap/, /feed/, /checkout/, /cart/, /account/, /wp-/,
];

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function request(path, auth) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "meta-check/1.0" },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  // Đọc inventory
  const raw = JSON.parse(readFileSync(AUDIT_JSON, "utf8"));
  const inventory = Array.isArray(raw) ? raw : (raw.entries ?? []);

  // Lọc: published + public + không skip
  const candidates = inventory.filter(e => {
    if (e.status !== "publish") return false;
    if (e.is_public === "false") return false;
    if (SKIP_IDS.has(e.id)) return false;
    if (SKIP_SLUG_PATTERNS.some(p => p.test(e.slug ?? ""))) return false;
    // Bỏ qua trang utility không có nội dung SEO
    if (["dieu-khoan-dich-vu", "chinh-sach-bao-mat"].includes(e.slug)) return false;
    return true;
  });

  const missing = candidates.filter(e => !COVERED_IDS.has(e.id));
  const covered = candidates.filter(e => COVERED_IDS.has(e.id));

  console.log(`=== Rank Math Meta Coverage Check ===\n`);
  console.log(`Inventory (published+public): ${candidates.length} entries`);
  console.log(`Đã cover: ${covered.length}`);
  console.log(`Còn thiếu: ${missing.length}\n`);

  if (missing.length === 0) {
    console.log("✓ Tất cả published pages đã có Rank Math meta!");
    return;
  }

  // Nhóm theo audit_priority
  const high = missing.filter(e => e.audit_priority?.includes("high"));
  const normal = missing.filter(e => !e.audit_priority?.includes("high"));

  if (high.length > 0) {
    console.log(`--- HIGH PRIORITY (${high.length}) ---`);
    for (const e of high) {
      console.log(`  [${e.id}] ${e.post_type.padEnd(5)} ${e.slug}`);
      console.log(`         Title: ${e.title}`);
    }
  }
  if (normal.length > 0) {
    console.log(`\n--- NORMAL (${normal.length}) ---`);
    for (const e of normal) {
      console.log(`  [${e.id}] ${e.post_type.padEnd(5)} ${e.slug}`);
    }
  }

  // Spot-check: lấy 2-3 bài missing để xem thực sự có focus_kw chưa (qua Rank Math API)
  console.log(`\n--- Spot-check Rank Math API (3 bài đầu) ---`);
  for (const e of missing.slice(0, 3)) {
    const r = await request(`/rankmath/v1/getObjectSeo?objectType=post&objectID=${e.id}`, auth);
    if (r.status === 200) {
      const kw = r.data?.data?.rank_math_focus_keyword ?? "(empty)";
      const desc = r.data?.data?.rank_math_description ?? "";
      console.log(`  [${e.id}] ${e.slug}`);
      console.log(`    focus_kw: "${kw}"`);
      console.log(`    desc: "${desc.slice(0, 60)}${desc.length > 60 ? "..." : ""}"`);
    } else {
      console.log(`  [${e.id}] ${e.slug} → status ${r.status}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
