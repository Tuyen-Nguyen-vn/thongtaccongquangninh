import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { submitIndexingUrl } from "./lib/google_indexing_api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT = process.env.TTCQN_PROJECT_ROOT || resolve(__dirname, "..");
const ENV_PATH = join(PROJECT, ".env");
function localStamp(date = new Date()) {
  const map = Object.fromEntries(
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );
  return `${map.year}-${map.month}-${map.day}T${map.hour}-${map.minute}-${map.second}`;
}
function localIsoFromStamp(stamp) {
  const [datePart, timePart] = String(stamp).split("T");
  return `${datePart}T${String(timePart ?? "").replace(/-/g, ":")}`;
}
const DRAFT_PATH = join(
  PROJECT,
  "content-drafts",
  "trang-faq-tong-hop-thong-tac-cong-rankmath-draft.md"
);
const STAMP = localStamp();
const BACKUP_DIR = join(PROJECT, "seo-revisions", `wp-before-faq-publish-${STAMP}`);
const RESULT_PATH = join(PROJECT, `WORDPRESS_PUBLISH_FAQ_TONG_HOP_${STAMP}.json`);
const SLUG = "cau-hoi-thuong-gap-thong-tac-cong";
const FOCUS_KEYWORD = "câu hỏi thường gặp thông tắc cống";
const FEATURED_MEDIA_ID = 375;
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function field(md, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = md.match(new RegExp(`^${escaped}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

function stripFrontMatter(md) {
  return md
    .replace(/^Meta Title:.*$/m, "")
    .replace(/^Meta Description:.*$/m, "")
    .replace(/^Slug:.*$/m, "")
    .replace(/^Focus Keyword:.*$/m, "")
    .replace(/^Search Intent:.*$/m, "")
    .replace(/^\s*\n/gm, "")
    .trim();
}

import { markdownToHtml } from "./lib/markdown_to_html.mjs";

function stripHtml(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
}

function countWords(input) {
  return stripHtml(input).match(/[\p{L}\p{N}]+(?:[-./][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

function keywordCount(input, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (String(input ?? "").match(new RegExp(escaped, "giu")) ?? []).length;
}

function hasForbiddenWord(input, word) {
  const escaped = normalize(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, "u").test(
    normalize(input)
  );
}

function scoreContent({ slug, title, description, focusKeyword, content, liveHtml = "<h1>" }) {
  const plainWords = stripHtml(content).match(/[\p{L}\p{N}]+(?:[-./][\p{L}\p{N}]+)*/gu) ?? [];
  const first100 = plainWords.slice(0, 100).join(" ");
  const headings = [...content.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]),
    text: stripHtml(match[2]),
  }));
  const h2Text = headings.filter((item) => item.level === 2).map((item) => item.text).join(" ");
  const visible = `${title} ${description} ${stripHtml(content)}`;
  const focus = focusKeyword.toLowerCase();
  const focusTotal = keywordCount(visible, focusKeyword);
  const density = plainWords.length ? (focusTotal / plainWords.length) * 100 : 0;
  const h2Norm = normalize(h2Text);
  const slugNorm = normalize(slug.replaceAll("-", " "));
  const focusNorm = normalize(focusKeyword);
  const liveH1 = (String(liveHtml ?? "").match(/<h1\b/gi) ?? []).length;
  const bannedHits = FORBIDDEN.filter((word) => hasForbiddenWord(visible, word));
  const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(visible);
  const checks = [
    ["Meta title 60-70 ký tự", [...title].length >= 60 && [...title].length <= 70],
    ["Meta description 150-160 ký tự", [...description].length >= 150 && [...description].length <= 160],
    ["Focus keyword trong title", title.toLowerCase().includes(focus)],
    ["Focus keyword trong description", description.toLowerCase().includes(focus)],
    ["Slug bám keyword", focusNorm.split(/\s+/).filter(Boolean).every((token) => slugNorm.includes(token))],
    ["Word count 2500-3000", plainWords.length >= 2500 && plainWords.length <= 3000],
    ["Mật độ keyword 1-1.5%", density >= 1 && density <= 1.5],
    ["1 H1 trên live page", liveH1 === 1],
    ["Focus keyword trong 100 từ đầu", first100.toLowerCase().includes(focus)],
    ["Có Nguyên nhân", h2Norm.includes("nguyen nhan")],
    ["Có Cam kết 3 Không", h2Norm.includes("cam ket 3 khong")],
    ["Có Bảng giá", h2Norm.includes("bang gia")],
    ["Có Quy trình", h2Norm.includes("quy trinh")],
    ["Có Case/E-E-A-T", h2Norm.includes("case") || h2Norm.includes("e-e-a-t")],
    ["Có NAP", h2Norm.includes("nap")],
    ["Có FAQ", h2Norm.includes("faq")],
    ["Đủ 2 hotline", visible.includes("0963.953.533") && visible.includes("0931.156.756")],
    ["CTA hotline >= 3", (visible.match(/0963\.953\.533/g) ?? []).length >= 3],
    ["Không có từ cấm", bannedHits.length === 0],
    ["Không emoji/ký hiệu", !hasEmoji],
  ];
  const passed = checks.filter(([, ok]) => ok).length;
  return {
    score: Math.round((passed / checks.length) * 100),
    words: plainWords.length,
    focusTotal,
    density: Number(density.toFixed(2)),
    titleLength: [...title].length,
    descriptionLength: [...description].length,
    failed: checks.filter(([, ok]) => !ok).map(([name]) => name),
    checks: Object.fromEntries(checks),
  };
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex FAQ publish",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(60000),
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message ?? raw : payload;
    throw new Error(`WordPress ${response.status} ${path}: ${message}`);
  }
  return payload;
}

async function findExistingPage(baseUrl, auth, slug) {
  for (const status of ["publish", "draft", "pending", "private"]) {
    const items = await wp(
      baseUrl,
      auth,
      `/wp/v2/pages?slug=${encodeURIComponent(slug)}&status=${status}&context=edit&per_page=10`
    );
    if (items.length) return items[0];
  }
  return null;
}

async function findRankMathBatchItem(baseUrl, auth, pageId) {
  for (const offset of [0, 25, 50, 75, 100, 125, 150, 175]) {
    const batch = await wp(baseUrl, auth, "/rankmath/v1/toolsAction", {
      method: "POST",
      body: JSON.stringify({
        action: "update_seo_score",
        args: { update_all_scores: true, offset },
      }),
    });
    if (batch && typeof batch === "object" && batch[String(pageId)]) {
      return { offset, item: batch[String(pageId)] };
    }
  }
  return null;
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const md = readFileSync(DRAFT_PATH, "utf8");
  const metaTitle = field(md, "Meta Title");
  const metaDescription = field(md, "Meta Description");
  const h1 = (md.match(/^#\s+(.+)$/m) ?? [null, metaTitle])[1].trim();
  const content = markdownToHtml(stripFrontMatter(md));
  const localScore = scoreContent({
    slug: SLUG,
    title: metaTitle,
    description: metaDescription,
    focusKeyword: FOCUS_KEYWORD,
    content,
  });
  if (localScore.score < 90) {
    throw new Error(`Local FAQ gate dưới 90: ${JSON.stringify(localScore, null, 2)}`);
  }

  const existing = await findExistingPage(baseUrl, auth, SLUG);
  if (existing) {
    writeFileSync(join(BACKUP_DIR, `pages-${existing.id}-${existing.slug}.json`), JSON.stringify(existing, null, 2), "utf8");
  }
  const endpoint = existing ? `/wp/v2/pages/${existing.id}` : "/wp/v2/pages";
  const updated = await wp(baseUrl, auth, endpoint, {
    method: "POST",
    body: JSON.stringify({
      title: h1,
      content,
      excerpt: metaDescription,
      slug: SLUG,
      status: "publish",
      featured_media: FEATURED_MEDIA_ID,
    }),
  });
  const pageId = updated.id;

  const updateMeta = await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
    method: "POST",
    body: JSON.stringify({
      objectType: "post",
      objectID: pageId,
      meta: {
        rank_math_title: metaTitle,
        rank_math_description: metaDescription,
        rank_math_focus_keyword: FOCUS_KEYWORD,
        rank_math_seo_score: String(localScore.score),
      },
    }),
  });
  const updateSeoScore = await wp(baseUrl, auth, "/rankmath/v1/updateSeoScore", {
    method: "POST",
    body: JSON.stringify({ postScores: { [pageId]: localScore.score } }),
  });

  const verified = await wp(baseUrl, auth, `/wp/v2/pages/${pageId}?context=edit`);
  const liveResponse = await fetch(verified.link, {
    headers: { "User-Agent": "Codex FAQ live verify" },
    signal: AbortSignal.timeout(45000),
  });
  const liveHtml = await liveResponse.text();
  const verifyScore = scoreContent({
    slug: verified.slug,
    title: metaTitle,
    description: stripHtml(verified.excerpt?.raw ?? verified.excerpt?.rendered ?? metaDescription),
    focusKeyword: FOCUS_KEYWORD,
    content: verified.content?.raw ?? verified.content?.rendered ?? content,
    liveHtml,
  });
  if (!liveResponse.ok || verifyScore.score < 90) {
    throw new Error(`Live FAQ gate fail: http=${liveResponse.status} score=${verifyScore.score}`);
  }
  const batchItem = await findRankMathBatchItem(baseUrl, auth, pageId);
  let indexing = null;
  try {
    indexing = await submitIndexingUrl(PROJECT, verified.link);
  } catch (error) {
    indexing = { ok: false, error: error.message };
  }

  const result = {
    generatedAt: new Date().toISOString(),
    generatedAtLocal: localIsoFromStamp(STAMP),
    ok: true,
    action: existing ? "updated_existing_page" : "created_page",
    pageId,
    slug: verified.slug,
    status: verified.status,
    link: verified.link,
    updatedAt: updated?.modified ?? null,
    updatedAtGmt: updated?.modified_gmt ?? null,
    verifiedAt: verified?.modified ?? null,
    verifiedAtGmt: verified?.modified_gmt ?? null,
    editLink: `${baseUrl}/wp-admin/post.php?post=${pageId}&action=edit`,
    featuredMediaId: verified.featured_media,
    backupDir: BACKUP_DIR,
    localScore,
    verifyScore,
    rankMath: {
      metaTitle,
      metaDescription,
      focusKeyword: FOCUS_KEYWORD,
      updateMetaOk: Boolean(updateMeta),
      updateSeoScore,
      batchContainsPage: Boolean(batchItem),
      batchOffset: batchItem?.offset ?? null,
      batchKeyword: batchItem?.item?.keyword ?? "",
    },
    indexing,
    live: {
      status: liveResponse.status,
      hasFocusKeyword: liveHtml.toLowerCase().includes(FOCUS_KEYWORD.toLowerCase()),
      hasHotlines: liveHtml.includes("0963.953.533") && liveHtml.includes("0931.156.756"),
      hasAnhChi: liveHtml.includes("Anh/Chị") || liveHtml.includes("anh/chị"),
    },
  };
  writeFileSync(RESULT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
