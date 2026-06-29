import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { assertImageSeoReadyForPublish } from "./image_seo_gate.mjs";
import { submitIndexingUrl } from "./lib/google_indexing_api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT = process.env.TTCQN_PROJECT_ROOT || resolve(__dirname, "..");
const ENV_PATH = join(PROJECT, ".env");
const DRAFT_PATH = process.argv[2]
  ? resolve(process.argv[2])
  : join(PROJECT, "content-drafts", "landing-quang-yen-thong-tac-bon-cau-rankmath-90.md");
const PAGE_ID = Number(process.argv[3] ?? 428);
const FEATURED_MEDIA_ID = Number(process.argv[4] ?? 345);
const WP_TYPE = process.argv[5] ?? "pages";
const MIN_SCORE = 90;
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];
const SYMBOL_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}⭐✅☎️⏱️➜→‹›「」【】]/gu;

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

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function inlineMd(input) {
  return escapeHtml(input)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let list = [];
  let table = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inlineMd(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push(`<ul>${list.map((item) => `<li>${inlineMd(item)}</li>`).join("")}</ul>`);
      list = [];
    }
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .filter((row) => !/^\|\s*-+/.test(row))
      .map((row) =>
        row
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((cell) => cell.trim())
      );
    if (rows.length) {
      const [head, ...body] = rows;
      out.push(
        `<table><thead><tr>${head.map((cell) => `<th>${inlineMd(cell)}</th>`).join("")}</tr></thead><tbody>${body
          .map((row) => `<tr>${row.map((cell) => `<td>${inlineMd(cell)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table>`
      );
    }
    table = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }
    if (line.startsWith("|")) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    flushTable();
    const imageMatch = line.match(/^!\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      out.push(
        `<figure class="wp-block-image"><img src="${imageMatch[2]}" alt="${escapeHtml(imageMatch[1])}"/></figure>`
      );
    } else if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
    } else if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      out.push(`<h3>${inlineMd(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      out.push(`<h2>${inlineMd(line.slice(3))}</h2>`);
    } else if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2));
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  flushTable();
  return out.join("\n");
}

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

function slugify(input) {
  return normalize(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hasForbiddenWord(input, word) {
  const escaped = normalize(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, "u").test(
    normalize(input)
  );
}

function countWords(input) {
  return (stripHtml(input).match(/[\p{L}\p{N}.]+/gu) ?? []).length;
}

function scorePost({ slug, title, description, focusKeyword, content }) {
  const plain = stripHtml(content);
  const first100 = (plain.match(/[\p{L}\p{N}.]+/gu) ?? []).slice(0, 100).join(" ");
  const normContent = normalize(content);
  const normHeadings = normalize(
    [...content.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/gis)].map((match) => stripHtml(match[1])).join(" ")
  );
  const focus = focusKeyword.toLowerCase();
  const focusCount = (content.match(new RegExp(focusKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "giu")) ?? [])
    .length;
  const words = countWords(content);
  const density = words ? (focusCount / words) * 100 : 0;
  const checks = [
    ["Title", title.toLowerCase().includes(focus) && [...title].length >= 60 && [...title].length <= 70],
    [
      "Description",
      description.toLowerCase().includes(focus) && [...description].length >= 150 && [...description].length <= 160,
    ],
    ["Slug", slug === slugify(focusKeyword)],
    ["Word count", words >= 2500 && words <= 3000],
    ["Density", density >= 1 && density <= 1.5],
    ["First 100 words", first100.toLowerCase().includes(focus)],
    ["Headings", normHeadings.includes("nguyen nhan") && normHeadings.includes("cam ket 3 khong")],
    ["Price/process/case/nap/faq", ["bang gia", "quy trinh", "case", "nap", "faq"].every((term) => normContent.includes(term))],
    ["Hotline", content.includes("0963.953.533") && content.includes("0931.156.756")],
    ["CTA", (content.match(/0963\.953\.533/g) ?? []).length >= 3],
  ];
  const visibleText = `${plain} ${title} ${description}`;
  const forbidden = FORBIDDEN.filter((word) => hasForbiddenWord(visibleText, word));
  const symbols = visibleText.match(SYMBOL_RE) ?? [];
  const passed = checks.filter(([, ok]) => ok).length;
  let score = Math.round((passed / checks.length) * 100);
  if (forbidden.length) score -= 20;
  if (symbols.length) score -= 10;
  return {
    score: Math.max(0, Math.min(100, score)),
    checks: Object.fromEntries(checks),
    words,
    focusCount,
    keywordDensity: Number(density.toFixed(2)),
    forbidden,
    symbols: symbols.length,
  };
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex SEO Quang Yen update",
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

async function findRankMathBatchItem(baseUrl, auth, pageId) {
  for (const offset of [0, 25, 50, 75, 100, 125, 150]) {
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
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const md = readFileSync(DRAFT_PATH, "utf8");
  const metaTitle = field(md, "Meta Title");
  const metaDescription = field(md, "Meta Description");
  const slug = field(md, "Slug");
  const focusKeyword = field(md, "Focus Keyword");
  const BACKUP_DIR = join(PROJECT, "seo-revisions", `wp-before-${slug}-fix-2026-04-29`);
  const RESULT_PATH = join(PROJECT, `WORDPRESS_UPDATE_${slug.toUpperCase().replace(/-/g, "_")}_2026-04-29.json`);
  mkdirSync(BACKUP_DIR, { recursive: true });
  const h1 = (md.match(/^#\s+(.+)$/m) ?? [null, metaTitle])[1].trim();
  const content = markdownToHtml(stripFrontMatter(md));
  const localScore = scorePost({ slug, title: metaTitle, description: metaDescription, focusKeyword, content });
  if (localScore.score < MIN_SCORE) {
    throw new Error(`Local gate dưới ${MIN_SCORE}: ${JSON.stringify(localScore)}`);
  }
  const imageSeoGate = assertImageSeoReadyForPublish({ markdownPath: DRAFT_PATH });

  const before = await wp(baseUrl, auth, `/wp/v2/${WP_TYPE}/${PAGE_ID}?context=edit`);
  writeFileSync(join(BACKUP_DIR, `${WP_TYPE}-${PAGE_ID}.json`), JSON.stringify(before, null, 2), "utf8");

  const updated = await wp(baseUrl, auth, `/wp/v2/${WP_TYPE}/${PAGE_ID}`, {
    method: "POST",
    body: JSON.stringify({
      title: h1,
      content,
      excerpt: metaDescription,
      slug,
      status: "publish",
      featured_media: FEATURED_MEDIA_ID,
    }),
  });

  const updateMeta = await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
    method: "POST",
    body: JSON.stringify({
      objectType: "post",
      objectID: PAGE_ID,
      meta: {
        rank_math_title: metaTitle,
        rank_math_description: metaDescription,
        rank_math_focus_keyword: focusKeyword,
        rank_math_seo_score: String(localScore.score),
      },
    }),
  });
  const updateSeoScore = await wp(baseUrl, auth, "/rankmath/v1/updateSeoScore", {
    method: "POST",
    body: JSON.stringify({ postScores: { [PAGE_ID]: localScore.score } }),
  });
  const verified = await wp(baseUrl, auth, `/wp/v2/${WP_TYPE}/${PAGE_ID}?context=edit`);
  const verifyScore = scorePost({
    slug: verified.slug,
    title: metaTitle,
    description: stripHtml(verified.excerpt?.raw ?? verified.excerpt?.rendered ?? metaDescription),
    focusKeyword,
    content: verified.content?.raw ?? verified.content?.rendered ?? content,
  });
  if (verifyScore.score < MIN_SCORE) {
    throw new Error(`Verify gate dưới ${MIN_SCORE}: ${verifyScore.score}`);
  }
  const batchItem = await findRankMathBatchItem(baseUrl, auth, PAGE_ID);

  let indexing = null;
  try {
    indexing = await submitIndexingUrl(PROJECT, verified.link);
  } catch (error) {
    indexing = { ok: false, error: error.message };
  }

  const liveResponse = await fetch(verified.link, {
    headers: { "User-Agent": "Codex SEO Quang Yen verify" },
    signal: AbortSignal.timeout(30000),
  });
  const liveHtml = await liveResponse.text();
  const result = {
    ok: true,
    pageId: PAGE_ID,
    type: WP_TYPE,
    backup: join(BACKUP_DIR, `${WP_TYPE}-${PAGE_ID}.json`),
    status: verified.status,
    slug: verified.slug,
    link: verified.link,
    updatedAt: updated?.modified ?? null,
    updatedAtGmt: updated?.modified_gmt ?? null,
    verifiedAt: verified?.modified ?? null,
    verifiedAtGmt: verified?.modified_gmt ?? null,
    editLink: `${baseUrl}/wp-admin/post.php?post=${PAGE_ID}&action=edit`,
    featuredMediaId: verified.featured_media,
    imageSeoGate,
    localScore,
    verifyScore,
    rankMath: {
      metaTitle,
      metaDescription,
      focusKeyword,
      updateMetaOk: Boolean(updateMeta),
      updateSeoScore,
      batchContainsPage: Boolean(batchItem),
      batchOffset: batchItem?.offset ?? null,
      batchKeyword: batchItem?.item?.keyword ?? "",
    },
    indexing,
    live: {
      ok: liveResponse.ok,
      status: liveResponse.status,
      hasFocusKeyword: liveHtml.toLowerCase().includes(focusKeyword.toLowerCase()),
      hasHotline: liveHtml.includes("0963.953.533") && liveHtml.includes("0931.156.756"),
    },
  };
  writeFileSync(RESULT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
