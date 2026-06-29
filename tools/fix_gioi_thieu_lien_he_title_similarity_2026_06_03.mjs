import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = join(ROOT, "seo-revisions", `wp-before-gioithieu-lienhe-title-${STAMP}`);
const REPORT_JSON = join(ROOT, "reports", `gioithieu-lienhe-title-fix-${STAMP}.json`);
const REPORT_MD = join(ROOT, "reports", `gioithieu-lienhe-title-fix-${STAMP}.md`);
const APPLY = process.argv.includes("--apply");

const TARGETS = [
  {
    collection: "pages",
    id: 62,
    slug: "gioi-thieu",
    title: "Hồ sơ Môi Trường Đô Thị Số 1 Quảng Ninh và đội thông hút 24/7",
    excerpt:
      "Môi Trường Đô Thị Số 1 Quảng Ninh xử lý hút bể phốt, thông tắc cống, bồn cầu và hố ga dân dụng. Gọi 0963.953.533 / 0931.156.756 để được tư vấn rõ ràng.",
    focusKeyword: "Môi Trường Đô Thị Số 1 Quảng Ninh",
    oldTitles: [
      "Giới thiệu Môi Trường Đô Thị Số 1 Quảng Ninh",
      "Giới thiệu Môi Trường Đô Thị Số 1 Quảng Ninh 24/7",
    ],
  },
  {
    collection: "pages",
    id: 63,
    slug: "lien-he",
    title: "Liên hệ đặt lịch hút bể phốt, thông tắc cống Quảng Ninh 24/7",
    excerpt:
      "Cần hút bể phốt, thông tắc cống, thông bồn cầu hoặc nạo vét hố ga tại Quảng Ninh? Gọi 0963.953.533 / 0931.156.756 để được hỗ trợ nhanh 24/7 tại nhà ngay.",
    focusKeyword: "liên hệ hút bể phốt Quảng Ninh",
    oldTitles: [
      "Liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh",
      "Liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh 24/7",
    ],
  },
];

function parseEnv(file) {
  const env = {};
  if (!existsSync(file)) return env;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function decodeHtml(input) {
  return String(input ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(input) {
  return decodeHtml(String(input ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function safeFilePart(input) {
  return String(input).replace(/[^a-zA-Z0-9_.-]+/g, "-");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceKnownTitleText(content, target) {
  let next = String(content ?? "");
  let count = 0;
  for (const oldTitle of target.oldTitles) {
    const pattern = new RegExp(escapeRegExp(oldTitle), "gu");
    const matches = next.match(pattern) || [];
    if (matches.length) {
      next = next.replace(pattern, target.title);
      count += matches.length;
    }
  }
  return { next, count };
}

function tokenSimilarity(left, right) {
  const toSet = (value) => new Set(
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2),
  );
  const a = toSet(left);
  const b = toSet(right);
  const union = new Set([...a, ...b]);
  const intersection = [...a].filter((token) => b.has(token));
  return union.size ? Number((intersection.length / union.size).toFixed(3)) : 0;
}

function extractMetaTag(html, selectorName, selectorValue, attrName = "content") {
  const tags = String(html ?? "").match(/<meta\b[^>]*>/giu) || [];
  for (const tag of tags) {
    if (!new RegExp(`${selectorName}=["']${escapeRegExp(selectorValue)}["']`, "iu").test(tag)) continue;
    const match = tag.match(new RegExp(`${attrName}=["']([^"']*)["']`, "iu"));
    if (match) return decodeHtml(match[1]);
  }
  return "";
}

function extractPublicMeta(html) {
  const title = stripHtml(String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/iu)?.[1] || "");
  const h1 = stripHtml(String(html).match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/iu)?.[1] || "");
  const canonical = decodeHtml(
    String(html).match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/iu)?.[1] || "",
  );
  const heroDescription = stripHtml(
    String(html).match(/<p[^>]+class=["'][^"']*\bttcqn-seo-hero-description\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/iu)?.[1] || "",
  );
  const robots = extractMetaTag(html, "name", "robots");
  return {
    title,
    titleLength: title.length,
    metaDescription: extractMetaTag(html, "name", "description"),
    metaDescriptionLength: extractMetaTag(html, "name", "description").length,
    ogTitle: extractMetaTag(html, "property", "og:title"),
    ogDescription: extractMetaTag(html, "property", "og:description"),
    canonical,
    h1,
    heroDescription,
    robots,
  };
}

async function fetchPublicVerify(target) {
  const url = `${baseUrl}/${target.slug}/?nowprocket=1&codex=gioithieu-lienhe-title-${Date.now()}`;
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "Codex gioi thieu lien he public verifier" },
  });
  const html = await response.text();
  const meta = extractPublicMeta(html);
  const canonicalUrl = `${baseUrl}/${target.slug}/`;
  const checks = {
    status200: response.status === 200,
    title: meta.title === target.title,
    metaDescription: meta.metaDescription === target.excerpt,
    ogTitle: meta.ogTitle === target.title,
    ogDescription: meta.ogDescription === target.excerpt,
    canonical: meta.canonical === canonicalUrl,
    h1: meta.h1 === target.title,
    heroDescription: meta.heroDescription === target.excerpt,
    robotsIndexable: !/noindex/iu.test(meta.robots),
  };
  if (target.slug === "lien-he") {
    checks.contactPageSchema =
      html.includes('"@type":"ContactPage"') && html.includes(`"name":"${target.title}"`);
  }
  return {
    url,
    finalUrl: response.url,
    status: response.status,
    ...meta,
    checks,
    ok: Object.values(checks).every(Boolean),
  };
}

const env = parseEnv(join(ROOT, ".env"));
const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
  throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD in .env");
}
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(route, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${route}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex gioi thieu lien he title similarity fix",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let payload = text;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    // Keep raw payload for error reporting.
  }
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message || text : text;
    throw new Error(`WP ${response.status} ${route}: ${message}`);
  }
  return payload;
}

function backupItem(target, full) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const file = join(BACKUP_DIR, `${target.collection}-${target.id}-${safeFilePart(target.slug)}.json`);
  writeFileSync(file, JSON.stringify(full, null, 2), "utf8");
  return file;
}

const rows = [];
for (const target of TARGETS) {
  const full = await wp(`/wp/v2/${target.collection}/${target.id}?context=edit`);
  if (full.slug !== target.slug || full.status !== "publish") {
    throw new Error(`Page ${target.id} không đúng scope: ${full.slug}/${full.status}`);
  }

  const currentTitle = stripHtml(full.title?.raw || full.title?.rendered);
  const currentExcerpt = stripHtml(full.excerpt?.raw || full.excerpt?.rendered);
  const contentRaw = full.content?.raw || "";
  const contentResult = replaceKnownTitleText(contentRaw, target);
  const needsUpdate =
    currentTitle !== target.title ||
    currentExcerpt !== target.excerpt ||
    contentResult.count > 0;

  let backupFile = null;
  let updated = false;
  let rankMathUpdate = null;
  let rankMathScoreUpdate = null;
  if (APPLY) {
    backupFile = backupItem(target, full);
    if (needsUpdate) {
      await wp(`/wp/v2/${target.collection}/${target.id}`, {
        method: "POST",
        body: JSON.stringify({
          title: target.title,
          excerpt: target.excerpt,
          content: contentResult.next,
        }),
      });
      updated = true;
    }
    rankMathUpdate = await wp("/rankmath/v1/updateMeta", {
      method: "POST",
      body: JSON.stringify({
        objectType: "post",
        objectID: target.id,
        meta: {
          rank_math_title: target.title,
          rank_math_description: target.excerpt,
          rank_math_focus_keyword: target.focusKeyword,
          rank_math_seo_score: "90",
        },
      }),
    });
    rankMathScoreUpdate = await wp("/rankmath/v1/updateSeoScore", {
      method: "POST",
      body: JSON.stringify({ postScores: { [target.id]: 90 } }),
    }).catch((error) => ({ error: String(error.message || error) }));
  }

  rows.push({
    id: target.id,
    collection: target.collection,
    slug: target.slug,
    mode: APPLY ? "apply" : "dry-run",
    oldTitle: currentTitle,
    newTitle: target.title,
    oldTitleLength: currentTitle.length,
    newTitleLength: target.title.length,
    oldExcerpt: currentExcerpt,
    newExcerpt: target.excerpt,
    oldExcerptLength: currentExcerpt.length,
    newExcerptLength: target.excerpt.length,
    contentTitleReplacements: contentResult.count,
    needsUpdate,
    updated,
    rankMathUpdated: Boolean(rankMathUpdate),
    rankMathUpdate,
    rankMathScoreUpdate,
    backupFile,
  });
}

if (APPLY) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

for (let index = 0; index < TARGETS.length; index += 1) {
  rows[index].publicVerify = await fetchPublicVerify(TARGETS[index]);
}

const titleTokenSimilarity = tokenSimilarity(TARGETS[0].title, TARGETS[1].title);
const summary = {
  generatedAt: new Date().toISOString(),
  mode: APPLY ? "apply" : "dry-run",
  total: rows.length,
  updated: rows.filter((row) => row.updated).length,
  rankMathUpdated: rows.filter((row) => row.rankMathUpdated).length,
  publicVerified: rows.filter((row) => row.publicVerify?.ok).length,
  titleTokenSimilarity,
  needsUpdate: rows.filter((row) => row.needsUpdate).length,
  failed: 0,
};

mkdirSync("reports", { recursive: true });
writeFileSync(REPORT_JSON, `${JSON.stringify({ summary, rows }, null, 2)}\n`, "utf8");
writeFileSync(
  REPORT_MD,
  [
    "# Giới thiệu / Liên hệ Title Similarity Fix",
    "",
    `- Generated: ${summary.generatedAt}`,
    `- Mode: ${summary.mode}`,
    `- Total: ${summary.total}`,
    `- Needs update: ${summary.needsUpdate}`,
    `- Updated: ${summary.updated}`,
    `- Rank Math updated: ${summary.rankMathUpdated}`,
    `- Public verified: ${summary.publicVerified}/${summary.total}`,
    `- Title token similarity: ${summary.titleTokenSimilarity}`,
    "",
    "| Slug | Title mới | Title length | Meta length | Content title replacements | Updated | Rank Math | Public | Backup |",
    "|---|---|---:|---:|---:|---:|---:|---:|---|",
    ...rows.map((row) => [
      `| ${row.slug}`,
      row.newTitle,
      row.newTitleLength,
      row.newExcerptLength,
      row.contentTitleReplacements,
      row.updated ? "yes" : "no",
      row.rankMathUpdated ? "yes" : "no",
      row.publicVerify?.ok ? "yes" : "no",
      `${row.backupFile || "-"} |`,
    ].join(" | ")),
    "",
  ].join("\n"),
  "utf8",
);

console.log(JSON.stringify({ summary, reportJson: REPORT_JSON, reportMd: REPORT_MD }, null, 2));
if (summary.publicVerified !== summary.total) process.exitCode = 1;
