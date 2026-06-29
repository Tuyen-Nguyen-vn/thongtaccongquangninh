/**
 * Backup nội dung WordPress trước khi thay đổi
 * Dùng: node tools/backup_wp_before_change.mjs [slug1,slug2,...] [type]
 *   - slug: slug của trang cần backup (mặc định backup toàn bộ URL list)
 *   - type: "pages" hoặc "posts" (mặc định "pages")
 *
 * Ví dụ:
 *   node tools/backup_wp_before_change.mjs                              # backup tất cả
 *   node tools/backup_wp_before_change.mjs thong-tac-cong-ha-long       # backup 1 trang
 *   node tools/backup_wp_before_change.mjs hut-be-phot-ha-long,thong-tac-cong-ha-long
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PROJECT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const APP_ENV_PATH = "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env";
const ENV_PATH = existsSync(join(PROJECT, ".env"))
  ? join(PROJECT, ".env")
  : existsSync(APP_ENV_PATH)
  ? APP_ENV_PATH
  : "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const URL_AUDIT = join(PROJECT, "wp-url-audit-list.json");
const TODAY = new Date().toISOString().slice(0, 10);
const BACKUP_DIR = join(PROJECT, "seo-revisions", `wp-backup-${TODAY}`);

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

async function wp(baseUrl, auth, path) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex SEO backup",
    },
  });
  if (!res.ok) throw new Error(`WP ${res.status} ${path}`);
  return res.json();
}

async function main() {
  const slugFilter = new Set(
    (process.argv[2] ?? "").split(",").map((s) => s.trim()).filter(Boolean)
  );
  const typeArg = process.argv[3] ?? "";

  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  // Đọc danh sách URL từ audit list nếu có
  let targets = [];
  if (existsSync(URL_AUDIT)) {
    const data = JSON.parse(readFileSync(URL_AUDIT, "utf8"));
    const pages = Array.isArray(data) ? data : (data.pages ?? data.urls ?? []);
    targets = pages
      .filter((p) => p.id && p.slug && (slugFilter.size === 0 || slugFilter.has(p.slug)))
      .map((p) => ({ id: p.id, slug: p.slug, type: typeArg || p.type || "pages" }));
  }

  // Nếu slugFilter có nhưng URL_AUDIT không tìm thấy → thử fetch trực tiếp theo slug
  if (targets.length === 0 && slugFilter.size > 0) {
    for (const slug of slugFilter) {
      const type = typeArg || "pages";
      try {
        const results = await wp(baseUrl, auth, `/wp/v2/${type}?slug=${slug}&context=edit`);
        if (results.length > 0) targets.push({ id: results[0].id, slug, type });
      } catch {
        console.warn(`[BACKUP] Không tìm thấy slug "${slug}" trong WP`);
      }
    }
  }

  if (targets.length === 0) {
    console.error("[BACKUP] Không có trang nào để backup. Kiểm tra wp-url-audit-list.json hoặc tham số slug.");
    process.exit(1);
  }

  mkdirSync(BACKUP_DIR, { recursive: true });
  let ok = 0, fail = 0;

  for (const { id, slug, type } of targets) {
    try {
      const data = await wp(baseUrl, auth, `/wp/v2/${type}/${id}?context=edit`);
      const outPath = join(BACKUP_DIR, `${slug}.json`);
      writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
      console.log(`[BACKUP] ✓ ${slug} → ${outPath}`);
      ok++;
    } catch (err) {
      console.warn(`[BACKUP] ✗ ${slug}: ${err.message}`);
      fail++;
    }
  }

  // Ghi log tóm tắt
  const logPath = join(BACKUP_DIR, "_backup-log.json");
  writeFileSync(
    logPath,
    JSON.stringify({ date: TODAY, total: targets.length, ok, fail, slugs: targets.map((t) => t.slug) }, null, 2),
    "utf8"
  );

  console.log(`\n[BACKUP] Xong: ${ok} OK, ${fail} lỗi → ${BACKUP_DIR}`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err.stack ?? err.message);
  process.exit(1);
});
