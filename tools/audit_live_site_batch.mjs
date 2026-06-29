import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const REPORT_DIR = join(PROJECT, "reports");
const STAMP = new Date().toISOString().slice(0, 10);
const CSV_PATH = join(REPORT_DIR, `audit-live-full-site-${STAMP}.csv`);
const MD_PATH = join(REPORT_DIR, `audit-live-full-site-${STAMP}.md`);

const HOTLINES = ["0963.953.533", "0931.156.756"];
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripHtml(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&#8212;|&mdash;/g, "-")
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

function hasForbiddenWord(input, word) {
  const escaped = normalize(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, "u").test(
    normalize(input)
  );
}

function words(input) {
  return stripHtml(input).match(/[\p{L}\p{N}]+(?:[-./][\p{L}\p{N}]+)*/gu) ?? [];
}

function fieldLength(input) {
  return [...String(input ?? "")].length;
}

function keywordCount(input, keyword) {
  const escaped = String(keyword ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!escaped) return 0;
  return (String(input ?? "").match(new RegExp(escaped, "giu")) ?? []).length;
}

function headings(content) {
  return [...String(content ?? "").matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]),
    text: stripHtml(match[2]),
  }));
}

function duplicateHeadings(items) {
  const counts = new Map();
  for (const item of items.filter((h) => h.level === 2 || h.level === 3)) {
    const key = normalize(item.text);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1);
}

function focusFromTitle(title) {
  return stripHtml(title)
    .replace(/\s+24\/7.*$/i, "")
    .replace(/\s+2026.*$/i, "")
    .replace(/\s*,.*$/i, "")
    .trim();
}

function scoreItem({ slug, title, description, focusKeyword, content, liveHtml, featuredMedia, liveOk }) {
  const plainWords = words(content);
  const body = stripHtml(content);
  const first100 = plainWords.slice(0, 100).join(" ");
  const h = headings(content);
  const h2Text = h.filter((item) => item.level === 2).map((item) => item.text).join(" ");
  const visible = `${title} ${description} ${body}`;
  const focus = String(focusKeyword ?? "").toLowerCase();
  const focusTotal = keywordCount(visible, focusKeyword);
  const density = plainWords.length ? (focusTotal / plainWords.length) * 100 : 0;
  const liveH1 = (String(liveHtml ?? "").match(/<h1\b/gi) ?? []).length;
  const bannedHits = FORBIDDEN.filter((word) => hasForbiddenWord(visible, word));
  const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(visible);
  const h2Norm = normalize(h2Text);
  const slugNorm = normalize(slug.replaceAll("-", " "));
  const focusNorm = normalize(focusKeyword);
  const checks = [
    ["Live HTTP 200", liveOk],
    ["Meta title 60-70 ký tự", fieldLength(title) >= 60 && fieldLength(title) <= 70],
    ["Meta description 150-160 ký tự", fieldLength(description) >= 150 && fieldLength(description) <= 160],
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
    ["Đủ 2 hotline", HOTLINES.every((hotline) => visible.includes(hotline))],
    ["CTA hotline >= 3", HOTLINES.some((hotline) => (visible.match(new RegExp(hotline.replaceAll(".", "\\."), "g")) ?? []).length >= 3)],
    ["Không có từ cấm", bannedHits.length === 0],
    ["Không emoji/ký hiệu", !hasEmoji],
    ["Có featured media", Number(featuredMedia) > 0],
    ["Không trùng H2/H3", duplicateHeadings(h).length === 0],
  ];
  const passed = checks.filter(([, ok]) => ok).length;
  return {
    score: Math.round((passed / checks.length) * 100),
    words: plainWords.length,
    density: Number(density.toFixed(2)),
    titleLength: fieldLength(title),
    descLength: fieldLength(description),
    liveH1,
    featured: Number(featuredMedia) || 0,
    failed: checks.filter(([, ok]) => !ok).map(([name]) => name),
    bannedHits,
  };
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex live full-site SEO audit",
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

async function listAll(baseUrl, auth, collection) {
  const all = [];
  for (let page = 1; page < 20; page++) {
    const items = await wp(
      baseUrl,
      auth,
      `/wp/v2/${collection}?status=publish&context=edit&per_page=100&page=${page}`
    );
    all.push(...items.map((item) => ({ ...item, type: collection })));
    if (items.length < 100) break;
  }
  return all;
}

async function rankMathKeywords(baseUrl, auth) {
  const byId = new Map();
  for (const offset of [0, 25, 50, 75, 100, 125, 150, 175, 200]) {
    try {
      const batch = await wp(baseUrl, auth, "/rankmath/v1/toolsAction", {
        method: "POST",
        body: JSON.stringify({
          action: "update_seo_score",
          args: { update_all_scores: true, offset },
        }),
      });
      for (const [id, item] of Object.entries(batch ?? {})) {
        if (item && typeof item === "object") byId.set(Number(id), item);
      }
    } catch {}
  }
  return byId;
}

async function fetchLive(url) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Codex live full-site SEO audit" },
      signal: AbortSignal.timeout(30000),
    });
    return { ok: response.ok, status: response.status, html: await response.text() };
  } catch (error) {
    return { ok: false, status: 0, html: "", error: error.message };
  }
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

async function main() {
  mkdirSync(REPORT_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const rankMath = await rankMathKeywords(baseUrl, auth);
  const items = [...(await listAll(baseUrl, auth, "pages")), ...(await listAll(baseUrl, auth, "posts"))].sort(
    (a, b) => a.slug.localeCompare(b.slug)
  );
  const rows = [];

  for (const item of items) {
    const rank = rankMath.get(Number(item.id));
    const title = stripHtml(rank?.title ?? item.title?.raw ?? item.title?.rendered ?? "");
    const description = stripHtml(item.excerpt?.raw ?? item.excerpt?.rendered ?? "");
    const focusKeyword = stripHtml(rank?.keyword ?? focusFromTitle(title));
    const content = item.content?.raw ?? item.content?.rendered ?? "";
    const live = await fetchLive(item.link);
    const score = scoreItem({
      slug: item.slug,
      title,
      description,
      focusKeyword,
      content,
      liveHtml: live.html,
      featuredMedia: item.featured_media,
      liveOk: live.ok && live.status === 200,
    });
    rows.push({
      slug: item.slug,
      type: item.type,
      id: item.id,
      status: item.status,
      http: live.status,
      score: score.score,
      words: score.words,
      density: score.density,
      titleLength: score.titleLength,
      descLength: score.descLength,
      liveH1: score.liveH1,
      featured: score.featured,
      failed: score.failed.join("; "),
      link: item.link,
    });
    console.log(`${item.slug} http=${live.status} score=${score.score}`);
  }

  const headers = [
    "slug",
    "type",
    "id",
    "status",
    "http",
    "score",
    "words",
    "density",
    "titleLength",
    "descLength",
    "liveH1",
    "featured",
    "failed",
    "link",
  ];
  const csv = [headers.map(csvCell).join(","), ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(","))].join(
    "\n"
  );
  writeFileSync(CSV_PATH, "\uFEFF" + csv, "utf8");

  const bad = rows.filter((row) => row.http !== 200 || row.score < 90);
  const md = `# Audit live toàn site ${STAMP}

## Kết quả

- Tổng URL publish kiểm tra: **${rows.length}**
- URL HTTP lỗi: **${rows.filter((row) => row.http !== 200).length}**
- URL dưới 90 điểm: **${bad.length}**
- Trang bảng giá: **${rows.find((row) => row.slug === "bang-gia")?.score ?? "không thấy"} điểm**
- File CSV: \`${CSV_PATH}\`

## URL cần xử lý

${
  bad.length
    ? bad
        .map(
          (row) =>
            `- ${row.slug} (${row.type} ID ${row.id}) HTTP ${row.http}, score ${row.score}: ${row.failed || "không rõ lỗi"}`
        )
        .join("\n")
    : "- Không có URL dưới ngưỡng 90 hoặc HTTP lỗi."
}
`;
  writeFileSync(MD_PATH, md, "utf8");
  console.log(`DONE total=${rows.length} bad=${bad.length} csv=${CSV_PATH}`);
  if (bad.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
