/**
 * auto_reindex_retry.mjs — Tự động submit lại URL lên Google Index
 *
 * Dùng:
 *   node tools/auto_reindex_retry.mjs           # submit tất cả URL
 *   node tools/auto_reindex_retry.mjs --check   # chỉ kiểm tra, không submit
 *
 * Logic:
 *   - Đọc danh sách URL từ wp-url-audit-list.json (ưu tiên)
 *   - Fallback: đọc từ WP sitemap live
 *   - Submit qua Rank Math Instant Indexing API
 *   - Lưu kết quả vào SEO_GOOGLE_INDEX_[today].json
 *   - Chạy hàng ngày qua Task Scheduler
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { submitIndexingUrl } from "./lib/google_indexing_api.mjs";

const PROJECT  = "D:\\.thongtaccongquangninh";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SITE     = "https://thongtaccongquangninh.com";
const TODAY    = new Date().toISOString().slice(0, 10);

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseEnv(path) {
  const env = {};
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* fallback */ }
  return env;
}

async function wp(baseUrl, auth, path, init = {}) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: { Authorization: auth, "Content-Type": "application/json", "User-Agent": "Codex Reindex", ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`WP ${res.status} ${path}`);
  return res.json();
}

async function fetchLiveUrlsFromWP(baseUrl, auth) {
  const urls = [];
  for (const type of ["pages", "posts"]) {
    try {
      const items = await wp(baseUrl, auth, `/wp/v2/${type}?per_page=100&status=publish&fields=link`);
      for (const item of items) if (item.link) urls.push(item.link);
    } catch (err) {
      console.warn(`[REINDEX] Không lấy được ${type}: ${err.message}`);
    }
  }
  return [...new Set(urls)];
}

function loadUrlsFromAuditFile() {
  const path = join(PROJECT, "wp-url-audit-list.json");
  if (!existsSync(path)) return [];
  try {
    const data = JSON.parse(readFileSync(path, "utf8"));
    const pages = Array.isArray(data) ? data : (data.pages ?? data.urls ?? []);
    return pages
      .filter(p => p.url || p.link)
      .map(p => {
        const raw = p.url ?? p.link ?? "";
        return raw.startsWith("http") ? raw : `${SITE}/${raw.replace(/^\//, "")}`;
      });
  } catch { return []; }
}

function getLastSubmitDate() {
  // Tìm file SEO_GOOGLE_INDEX gần nhất
  try {
    const files = readdirSync(PROJECT)
      .filter(f => f.startsWith("SEO_GOOGLE_INDEX_") && f.endsWith(".json"))
      .sort()
      .reverse();
    if (!files.length) return null;
    const data = JSON.parse(readFileSync(join(PROJECT, files[0]), "utf8"));
    return { file: files[0], submittedAt: data.submittedAt, urlCount: data.urlCount };
  } catch { return null; }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const checkOnly = process.argv.includes("--check");
  const env       = parseEnv(ENV_PATH);
  const baseUrl   = env.WP_BASE_URL ?? SITE;
  const auth      = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  // 1. Kiểm tra lần submit gần nhất
  const lastSubmit = getLastSubmitDate();
  if (lastSubmit) {
    const hoursAgo = (Date.now() - new Date(lastSubmit.submittedAt).getTime()) / 3600000;
    console.log(`[REINDEX] Lần submit gần nhất: ${lastSubmit.file}`);
    console.log(`[REINDEX] Thời gian: ${lastSubmit.submittedAt} (${Math.round(hoursAgo)}h trước)`);
    console.log(`[REINDEX] Số URL: ${lastSubmit.urlCount}`);
    if (hoursAgo < 22 && !process.argv.includes("--force")) {
      console.log(`[REINDEX] Mới submit ${Math.round(hoursAgo)}h trước. Bỏ qua để tránh spam Google.`);
      console.log(`[REINDEX] Dùng --force để bắt submit dù mới.`);
      process.exit(0);
    }
  } else {
    console.log(`[REINDEX] Chưa có file submit log nào.`);
  }

  // 2. Lấy danh sách URL
  let urls = loadUrlsFromAuditFile();
  if (urls.length > 0) {
    console.log(`[REINDEX] Đọc ${urls.length} URL từ wp-url-audit-list.json`);
  } else {
    console.log(`[REINDEX] Lấy URL trực tiếp từ WordPress...`);
    urls = await fetchLiveUrlsFromWP(baseUrl, auth);
    console.log(`[REINDEX] Tìm thấy ${urls.length} trang live`);
  }

  if (urls.length === 0) {
    console.error(`[REINDEX] Không có URL nào để submit.`);
    process.exit(1);
  }

  // Luôn thêm trang chủ
  if (!urls.includes(`${SITE}/`)) urls.unshift(`${SITE}/`);

  console.log(`[REINDEX] Tổng: ${urls.length} URL`);
  if (checkOnly) {
    console.log(`[REINDEX] --check mode: chỉ liệt kê, không submit`);
    urls.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
    process.exit(0);
  }

  // 3. Submit trực tiếp qua Google Indexing API
  console.log(`[REINDEX] Submitting...`);
  const submitResults = [];
  for (const url of urls) {
    try {
      submitResults.push(await submitIndexingUrl(PROJECT, url));
    } catch (error) {
      submitResults.push({ ok: false, status: 0, error: error.message, url });
    }
  }
  const submitOkCount = submitResults.filter((item) => item.ok).length;
  const submitFailCount = submitResults.length - submitOkCount;
  const submitOk = submitFailCount === 0;
  const submitStatus = submitOk ? 200 : 207;
  const submitBody = JSON.stringify({
    ok: submitOk,
    successCount: submitOkCount,
    failCount: submitFailCount,
    sample: submitResults.slice(0, 3),
  });

  console.log(`[REINDEX] Status: ${submitStatus} — ${submitOk ? "✅ OK" : "❌ Lỗi"}`);
  console.log(`[REINDEX] Response: ${submitBody.slice(0, 200)}`);

  // 4. Lưu kết quả
  const result = {
    submittedAt: new Date().toISOString(),
    urlCount: urls.length,
    submitStatus, submitOk,
    submitResponse: submitBody,
    urls,
    results: submitResults,
  };
  const outPath = join(PROJECT, `SEO_GOOGLE_INDEX_${TODAY}.json`);
  writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`[REINDEX] Kết quả lưu → ${outPath}`);
  console.log(`[REINDEX] Xong: ${urls.length} URL — ${submitOk ? "thành công" : "có lỗi"}`);
}

main().catch(err => { console.error(err.stack ?? err.message); process.exit(1); });
