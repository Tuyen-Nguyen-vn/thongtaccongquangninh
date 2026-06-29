/**
 * auto_publish_pipeline.mjs — Pipeline publish bài tự động
 *
 * Dùng:
 *   node tools/auto_publish_pipeline.mjs <file-draft.md>          # publish nếu score ≥ 88
 *   node tools/auto_publish_pipeline.mjs <file-draft.md> --draft  # luôn để draft
 *   node tools/auto_publish_pipeline.mjs <file-draft.md> --force  # bỏ qua ngưỡng score
 *
 * Pipeline:
 *   1. Đọc file markdown → score SEO
 *   2. Nếu score ≥ 88 → backup → push WordPress → update Rank Math → submit Google Index
 *   3. Ghi kết quả vào SEO_PROGRESS.csv + log file
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { homedir } from "node:os";
import { submitIndexingUrl } from "./lib/google_indexing_api.mjs";

const PROJECT   = "D:\\.thongtaccongquangninh";
const SITE      = "https://thongtaccongquangninh.com";
const TODAY     = new Date().toISOString().slice(0, 10);
const NOW_ISO   = new Date().toISOString();
const LOG_DIR   = join(PROJECT, "logs");
const BACKUP_DIR = join(PROJECT, "seo-revisions", `wp-backup-${TODAY}`);
const CSV_PATH  = join(PROJECT, "docs", "SEO_PROGRESS.csv");
const LOG_PATH  = join(LOG_DIR, "publish_pipeline.log");

// Từ cấm (từ push_seo_revisions.mjs)
const FORBIDDEN  = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];
const SYMBOL_RE  = /[⭐✅☎️⏱️➜→‹›「」【】]/g;

// ── Helpers ─────────────────────────────────────────────────────────────────

function findEnvPath() {
  const localEnv = join(PROJECT, ".env");
  if (existsSync(localEnv)) return localEnv;
  const homeDir = homedir();
  const docEnv = join(homeDir, "Documents", "Codex", "2026-04-28", "chatgpt-apps-plugin-chatgpt-apps-openai", ".env");
  if (existsSync(docEnv)) return docEnv;
  return localEnv;
}

const ENV_PATH  = findEnvPath();

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

function field(md, label) {
  const m = md.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
  return m ? m[1].trim() : "";
}

function stripHtml(s) {
  return String(s ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
}

function normalize(s) {
  return String(s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function countWords(s) {
  return (stripHtml(s).match(/[\p{L}\p{N}.]+/gu) ?? []).length;
}

import { markdownToHtml } from "./lib/markdown_to_html.mjs";

function scorePost({ slug, title, description, focusKeyword, content }) {
  const plain      = stripHtml(content);
  const first100   = (plain.match(/[\p{L}\p{N}.]+/gu) ?? []).slice(0, 100).join(" ");
  const normContent = normalize(content);
  const normHeadings = normalize([...content.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/gis)].map(m=>stripHtml(m[1])).join(" "));
  const kw = normalize(focusKeyword);
  const kwTokens = kw.split(/\s+/).filter(Boolean);
  const hasKw = (input) => kwTokens.filter(t => normalize(input).includes(t)).length / kwTokens.length >= 0.75;
  let score = 0; const issues = [];
  const add = (cond, pts, msg) => { if (cond) score += pts; else issues.push(msg); };
  add(hasKw(title),               10, "Title chưa bám focus keyword");
  add(title.length >= 55 && title.length <= 70, 8, `Title ${title.length} ký tự (cần 55-70)`);
  add(hasKw(description),         10, "Meta description chưa bám focus keyword");
  add(description.length >= 145 && description.length <= 160, 8, `Meta desc ${description.length} ký tự (cần 145-160)`);
  add(description.includes("0963.953.533"), 8, "Meta thiếu hotline");
  add(hasKw(slug.replaceAll("-"," ")), 7, "Slug chưa bám focus keyword");
  add(hasKw(first100),             8, "100 từ đầu chưa có focus keyword");
  add(hasKw(normHeadings),         7, "H2/H3 chưa bám focus keyword");
  const words = countWords(content);
  add(words >= 2500 && words <= 3100, 10, `Số từ ${words} (cần 2500-3100)`);
  add(normContent.includes("faq") || normContent.includes("cau hoi"), 5, "Thiếu FAQ");
  add(normContent.includes("bang gia"),   5, "Thiếu bảng giá");
  add(normContent.includes("quy trinh"),  5, "Thiếu quy trình");
  add(normContent.includes("case") || normContent.includes("thuc te"), 4, "Thiếu case study/thực tế");
  add(normContent.includes("moi truong do thi so 1") || normContent.includes("nap"), 4, "Thiếu NAP/thương hiệu");
  add((content.match(/0963\.953\.533/g) ?? []).length >= 2, 3, "CTA hotline chưa đủ 2 lần");
  const visibleText = `${plain} ${title} ${description}`;
  const forbidden = FORBIDDEN.filter(w => visibleText.toLowerCase().includes(w));
  const symbols   = (content.match(SYMBOL_RE) ?? []).length;
  if (forbidden.length) { score -= 10; issues.unshift(`Từ cấm: ${forbidden.join(", ")}`); }
  if (symbols)           { score -=  5; issues.unshift(`Còn ký hiệu/emoji: ${symbols}`); }
  return { score: Math.max(0, Math.min(100, score)), issues, words };
}

function slugFromKeyword(focusKeyword) {
  return focusKeyword
    .normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[đĐ]/gi, "d")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function wp(baseUrl, auth, path, init = {}) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: { Authorization: auth, "Content-Type": "application/json", "User-Agent": "Codex pipeline", ...(init.headers ?? {}) },
  });
  const text = await res.text();
  let payload; try { payload = text ? JSON.parse(text) : {}; } catch { payload = text; }
  if (!res.ok) { const msg = typeof payload === "object" ? payload.message ?? text : payload; throw new Error(`WP ${res.status} ${path}: ${msg}`); }
  return payload;
}

async function findWpPage(baseUrl, auth, slug) {
  for (const type of ["pages", "posts"]) {
    try {
      const r = await wp(baseUrl, auth, `/wp/v2/${type}?slug=${encodeURIComponent(slug)}&context=edit`);
      if (Array.isArray(r) && r.length > 0) return { ...r[0], _type: type };
    } catch { /* thử tiếp */ }
  }
  return null;
}

async function submitGoogleIndex(baseUrl, auth, url) {
  try {
    const res = await submitIndexingUrl(PROJECT, url);
    return { ok: res.ok, status: res.status ?? 0, body: JSON.stringify(res.payload ?? res) };
  } catch (err) {
    return { ok: false, status: 0, body: err.message };
  }
}

function appendCsvRow(csvPath, row) {
  const headers = [
    "date","time","task_id","task_type","keyword","url","slug","status",
    "difficulty","internal_score_before","internal_score_after",
    "rank_math_before","rank_math_after","action_done","files_changed",
    "issues","next_action","agent_note","review_status","reviewed_by",
    "reviewed_at","review_report","review_report_json","review_report_md","review_log_path",
  ];
  const line = headers.map(h => `"${String(row[h] ?? "").replaceAll('"','""')}"`).join(",");
  if (existsSync(csvPath)) {
    appendFileSync(csvPath, "\n" + line, "utf8");
  }
}

function log(msg) {
  const ts = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Bangkok" });
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try { appendFileSync(LOG_PATH, line + "\n", "utf8"); } catch { /* ignore */ }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const mdArg   = args.find(a => !a.startsWith("--"));
  const force   = args.includes("--force");
  const asDraft = args.includes("--draft");

  if (!mdArg) {
    console.error(
      "Dùng: node tools/auto_publish_pipeline.mjs <draft.md> [--draft] [--force]\n" +
      "  --draft  : luôn để draft (không publish)\n" +
      "  --force  : bỏ qua ngưỡng score (nguy hiểm)"
    );
    process.exit(1);
  }

  mkdirSync(LOG_DIR,    { recursive: true });
  mkdirSync(BACKUP_DIR, { recursive: true });

  const mdPath = resolve(mdArg);
  if (!existsSync(mdPath)) { console.error(`File không tồn tại: ${mdPath}`); process.exit(1); }

  const md = readFileSync(mdPath, "utf8");
  const title        = field(md, "Meta Title");
  const description  = field(md, "Meta Description");
  const focusKeyword = field(md, "Focus Keyword");
  const slugField    = field(md, "Slug");

  if (!title || !focusKeyword) {
    console.error("File thiếu Meta Title hoặc Focus Keyword. Kiểm tra lại file draft.");
    process.exit(1);
  }

  const slug     = slugField || slugFromKeyword(focusKeyword);
  const content  = markdownToHtml(md);
  const scoreResult = scorePost({ slug, title, description, focusKeyword, content });
  const THRESHOLD = 88;

  log(`── AUTO PUBLISH PIPELINE ──`);
  log(`File: ${basename(mdPath)}`);
  log(`Slug: ${slug}`);
  log(`Keyword: ${focusKeyword}`);
  log(`Score: ${scoreResult.score}/100 (ngưỡng ${THRESHOLD})`);
  if (scoreResult.issues.length) log(`Vấn đề: ${scoreResult.issues.join(" | ")}`);
  log(`Số từ: ${scoreResult.words}`);

  if (scoreResult.score < THRESHOLD && !force) {
    log(`❌ DỪNG: Score ${scoreResult.score} < ${THRESHOLD}. Sửa các vấn đề trên rồi chạy lại.`);
    log(`   (Thêm --force để bỏ qua kiểm tra)`);
    process.exit(1);
  }

  const env     = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL ?? SITE;
  const auth    = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  // Tìm trang hiện có
  log(`Tìm trang "${slug}" trên WordPress...`);
  const existing = await findWpPage(baseUrl, auth, slug);

  let wpType = "pages";
  if (mdPath.includes("blog") || mdPath.includes("remaining") || mdPath.includes("hut-be-phot") || mdPath.includes("thong-tac-cong")) {
    wpType = "posts";
  }
  
  if (existing) {
    log(`Tìm thấy ID=${existing.id}, status=${existing.status}, type=${existing._type}`);
    wpType = existing._type;
    // Backup
    const backupPath = join(BACKUP_DIR, `${slug}.json`);
    writeFileSync(backupPath, JSON.stringify(existing, null, 2), "utf8");
    log(`Backup → ${backupPath}`);
  } else {
    log(`Chưa có trang "${slug}" → sẽ tạo mới (type=${wpType})`);
  }

  const targetStatus = asDraft ? "draft" : ((scoreResult.score >= THRESHOLD || force) ? "publish" : "draft");
  const endpoint     = existing ? `/wp/v2/${wpType}/${existing.id}` : `/wp/v2/${wpType}`;
  const method       = existing ? "POST" : "POST"; // WP REST dùng POST cho cả create và update

  log(`Push → ${targetStatus} (${existing ? "update" : "tạo mới"})`);

  const pushed = await wp(baseUrl, auth, endpoint, {
    method,
    body: JSON.stringify({ title, content, excerpt: description, status: targetStatus, ...(existing ? {} : { slug }) }),
  });

  const wpId   = pushed.id ?? existing?.id;
  const wpLink = pushed.link ?? `${SITE}/${slug}/`;
  log(`✅ WordPress OK: ID=${wpId} status=${pushed.status} link=${wpLink}`);

  // Update Rank Math
  try {
    await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      body: JSON.stringify({
        objectType: "post", objectID: wpId,
        meta: {
          rank_math_title: title,
          rank_math_description: description,
          rank_math_focus_keyword: focusKeyword,
          rank_math_seo_score: String(scoreResult.score),
        },
      }),
    });
    log(`✅ Rank Math meta: OK`);
  } catch (err) {
    log(`⚠️  Rank Math meta: ${err.message}`);
  }

  // Submit Google Index (chỉ khi publish)
  let indexResult = { ok: false, status: 0, body: "skipped" };
  if (targetStatus === "publish") {
    log(`Submit Google Index: ${wpLink}`);
    indexResult = await submitGoogleIndex(baseUrl, auth, wpLink);
    log(indexResult.ok ? `✅ Google Index: ${indexResult.status}` : `⚠️  Google Index: ${indexResult.body}`);
  } else {
    log(`Google Index: bỏ qua (bài đang draft)`);
  }

  // Ghi vào SEO_PROGRESS.csv
  appendCsvRow(CSV_PATH, {
    date: TODAY, time: new Date().toLocaleTimeString("vi-VN", { timeZone: "Asia/Bangkok" }),
    task_id: `PUBLISH-${slug}-${TODAY}`,
    task_type: "publish",
    keyword: focusKeyword,
    url: wpLink,
    slug,
    status: targetStatus === "publish" ? "completed" : "draft_ready",
    difficulty: "medium",
    internal_score_before: "", internal_score_after: scoreResult.score,
    rank_math_before: "", rank_math_after: "",
    action_done: `auto_publish_pipeline: score=${scoreResult.score} → ${targetStatus}`,
    files_changed: basename(mdPath),
    issues: scoreResult.issues.join("; "),
    next_action: targetStatus === "publish" ? "Kiểm tra Google Index sau 48h" : "Sửa lỗi và publish lại",
    agent_note: `words=${scoreResult.words} indexStatus=${indexResult.status}`,
    review_status: "NOT_REQUIRED",
  });
  log(`✅ Đã ghi vào SEO_PROGRESS.csv`);

  // Lưu kết quả JSON
  const resultPath = join(LOG_DIR, `publish-${slug}-${TODAY}.json`);
  writeFileSync(resultPath, JSON.stringify({
    publishedAt: NOW_ISO, slug, keyword: focusKeyword, score: scoreResult.score,
    wpId, wpLink, wpStatus: pushed.status, targetStatus,
    indexSubmit: indexResult, issues: scoreResult.issues,
  }, null, 2), "utf8");

  log(`── XONG ──`);
  console.log("");
  console.log("════════════════════════════════════════");
  console.log(`✅ ${targetStatus === "publish" ? "ĐÃ PUBLISH" : "ĐÃ ĐỂ DRAFT"}: ${wpLink}`);
  console.log(`   Score: ${scoreResult.score}/100 | Từ: ${scoreResult.words}`);
  if (targetStatus === "draft") {
    console.log("   ℹ️  Bài đang draft vì score chưa đủ hoặc --draft flag");
    if (scoreResult.issues.length) console.log("   Cần sửa:", scoreResult.issues.slice(0, 3).join(" | "));
  }
  console.log("════════════════════════════════════════");
}

main().catch(err => { console.error(err.stack ?? err.message); process.exit(1); });
