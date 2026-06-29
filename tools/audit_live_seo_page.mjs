import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const REPORT_DIR = join(PROJECT, "reports");
const DEFAULT_SLUG = "thong-tac-bon-cau-quang-yen";
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

function slugify(input) {
  return normalize(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function words(input) {
  return stripHtml(input).match(/[\p{L}\p{N}]+(?:[-./][\p{L}\p{N}]+)*/gu) ?? [];
}

function fieldLength(input) {
  return [...String(input ?? "")].length;
}

function keywordCount(input, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({ heading: key, count }));
}

function scorePage({ slug, title, description, focusKeyword, content, liveHtml, featuredMedia }) {
  const plainWords = words(content);
  const body = stripHtml(content);
  const first100 = plainWords.slice(0, 100).join(" ");
  const h = headings(content);
  const h2Text = h.filter((item) => item.level === 2).map((item) => item.text).join(" ");
  const visible = `${title} ${description} ${body}`;
  const focus = focusKeyword.toLowerCase();
  const expectedSlug = slugify(focusKeyword);
  const focusTotal = keywordCount(visible, focusKeyword);
  const density = plainWords.length ? (focusTotal / plainWords.length) * 100 : 0;
  const liveH1 = (String(liveHtml ?? "").match(/<h1\b/gi) ?? []).length;
  const bannedHits = FORBIDDEN.filter((word) => hasForbiddenWord(visible, word));
  const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(visible);
  const h2Norm = normalize(h2Text);
  const checks = [
    ["Meta title 60-70 ký tự", fieldLength(title) >= 60 && fieldLength(title) <= 70],
    ["Meta description 150-160 ký tự", fieldLength(description) >= 150 && fieldLength(description) <= 160],
    ["Focus keyword trong title", title.toLowerCase().includes(focus)],
    ["Focus keyword trong description", description.toLowerCase().includes(focus)],
    ["Slug đúng keyword", slug === expectedSlug],
    ["Word count 2500-3000", plainWords.length >= 2500 && plainWords.length <= 3000],
    ["Mật độ keyword 1-1.5%", density >= 1 && density <= 1.5],
    ["1 H1 trên live page", liveH1 === 1],
    ["Focus keyword trong 100 từ đầu", first100.toLowerCase().includes(focus)],
    ["Có Nguyên nhân", h2Norm.includes("nguyen nhan")],
    ["Có Cam kết 3 Không", h2Norm.includes("cam ket 3 khong")],
    ["Có Bảng giá", h2Norm.includes("bang gia")],
    ["Có Quy trình 5 bước", h2Norm.includes("quy trinh")],
    ["Có Case study E-E-A-T", h2Norm.includes("case") || h2Norm.includes("e-e-a-t")],
    ["Có NAP", h2Norm.includes("nap")],
    ["Có FAQ", h2Norm.includes("faq")],
    ["Đủ 2 hotline", HOTLINES.every((hotline) => visible.includes(hotline))],
    ["CTA hotline >= 3", (visible.match(/0963\.953\.533/g) ?? []).length >= 3],
    ["Không có từ cấm", bannedHits.length === 0],
    ["Không emoji/ký hiệu", !hasEmoji],
    ["Có featured media", Number(featuredMedia) > 0],
  ];
  const passed = checks.filter(([, ok]) => ok).length;
  return {
    score: Math.round((passed / checks.length) * 100),
    titleLength: fieldLength(title),
    descriptionLength: fieldLength(description),
    wordCount: plainWords.length,
    focusTotal,
    keywordDensity: Number(density.toFixed(2)),
    liveH1,
    h2Count: h.filter((item) => item.level === 2).length,
    duplicateHeadings: duplicateHeadings(h),
    bannedHits,
    hasEmoji,
    checks: Object.fromEntries(checks),
  };
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex live SEO audit",
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

async function listBySlug(baseUrl, auth, type, slug) {
  const collection = type === "page" ? "pages" : "posts";
  try {
    return await wp(baseUrl, auth, `/wp/v2/${collection}?slug=${encodeURIComponent(slug)}&status=any&context=edit&per_page=20`);
  } catch {
    return await wp(baseUrl, auth, `/wp/v2/${collection}?slug=${encodeURIComponent(slug)}&context=edit&per_page=20`);
  }
}

async function rankMathBatchItem(baseUrl, auth, id) {
  for (const offset of [0, 25, 50, 75, 100, 125, 150]) {
    const batch = await wp(baseUrl, auth, "/rankmath/v1/toolsAction", {
      method: "POST",
      body: JSON.stringify({
        action: "update_seo_score",
        args: { update_all_scores: true, offset },
      }),
    });
    if (batch && typeof batch === "object" && batch[String(id)]) {
      return { offset, item: batch[String(id)] };
    }
  }
  return null;
}

function markdownReport({ slug, primary, duplicates, live, score, batch, reportJson }) {
  const failed = Object.entries(score.checks)
    .filter(([, ok]) => !ok)
    .map(([name]) => `- ${name}`)
    .join("\n");
  const dupRows = duplicates.length
    ? duplicates
        .map((item) => `- ${item.type} ID ${item.id}: ${item.status}, ${item.link}`)
        .join("\n")
    : "- Không thấy bản trùng theo slug.";
  const duplicateH2 = score.duplicateHeadings.length
    ? score.duplicateHeadings.map((item) => `- ${item.heading}: ${item.count} lần`).join("\n")
    : "- Không phát hiện H2/H3 trùng lặp rõ.";

  return `# Kiểm tra website live: ${slug}

## Kết luận

- URL chính: ${primary.link}
- WordPress: ${primary.type} ID ${primary.id}, trạng thái ${primary.status}
- Live HTTP: ${live.status}
- Điểm gate local/Rank Math mô phỏng: ${score.score}/100
- Quyết định public: ${score.score >= 90 ? "Đạt ngưỡng 90+, có thể giữ public nếu Rank Math SEO Details khớp." : "Chưa đạt 90, cần sửa trước khi public/giữ public."}

## Chỉ số SEO

- Meta title: ${score.titleLength} ký tự
- Meta description/excerpt: ${score.descriptionLength} ký tự
- Số từ: ${score.wordCount}
- Focus keyword: ${primary.focusKeyword}
- Số lần keyword: ${score.focusTotal}
- Mật độ keyword: ${score.keywordDensity}%
- H1 live: ${score.liveH1}
- H2: ${score.h2Count}
- Featured media: ${primary.featuredMedia || 0}
- Rank Math batch: ${batch ? `có tại offset ${batch.offset}, keyword "${batch.keyword ?? batch.item?.keyword ?? ""}"` : "chưa thấy trong batch kiểm tra"}

## Lỗi cần xử lý

${failed || "- Không có lỗi trong gate local."}

## Trùng lặp/bản nháp cùng slug

${dupRows}

## Heading trùng lặp

${duplicateH2}

## Từ cấm và ký hiệu

- Từ cấm: ${score.bannedHits.length ? score.bannedHits.join(", ") : "không phát hiện trong dữ liệu kiểm tra"}
- Emoji/ký hiệu: ${score.hasEmoji ? "có" : "không"}

## File JSON chi tiết

- ${reportJson}
`;
}

async function main() {
  const slug = process.argv[2] ?? DEFAULT_SLUG;
  mkdirSync(REPORT_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const pages = (await listBySlug(baseUrl, auth, "page", slug)).map((item) => ({ ...item, type: "page" }));
  const posts = (await listBySlug(baseUrl, auth, "post", slug)).map((item) => ({ ...item, type: "post" }));
  const matches = [...pages, ...posts].sort((a, b) => {
    if (a.status === "publish" && b.status !== "publish") return -1;
    if (b.status === "publish" && a.status !== "publish") return 1;
    if (a.type === "page" && b.type !== "page") return -1;
    if (b.type === "page" && a.type !== "page") return 1;
    return a.id - b.id;
  });
  if (!matches.length) throw new Error(`Không tìm thấy page/post với slug ${slug}`);

  const primary = matches[0];
  const liveResponse = await fetch(primary.link, {
    headers: { "User-Agent": "Codex live SEO audit" },
    signal: AbortSignal.timeout(30000),
  });
  const liveHtml = await liveResponse.text();
  const title = stripHtml(primary.title?.raw ?? primary.title?.rendered ?? "");
  const description = stripHtml(primary.excerpt?.raw ?? primary.excerpt?.rendered ?? "");
  const focusKeyword =
    primary.yoast_head_json?.schema?.["@graph"]?.[0]?.name ??
    title.replace(/\s+24\/7.*$/i, "").trim();
  const batch = await rankMathBatchItem(baseUrl, auth, primary.id);
  const batchKeyword = batch?.item?.keyword ?? "";
  const finalFocusKeyword = batchKeyword || focusKeyword;
  const seoTitle = stripHtml(batch?.item?.title ?? title);
  const score = scorePage({
    slug,
    title: seoTitle,
    description,
    focusKeyword: finalFocusKeyword,
    content: primary.content?.raw ?? primary.content?.rendered ?? "",
    liveHtml,
    featuredMedia: primary.featured_media,
  });
  const duplicates = matches.slice(1).map((item) => ({
    type: item.type,
    id: item.id,
    status: item.status,
    link: item.link,
    title: stripHtml(item.title?.raw ?? item.title?.rendered ?? ""),
  }));
  const result = {
    slug,
    primary: {
      type: primary.type,
      id: primary.id,
      status: primary.status,
      link: primary.link,
      title,
      seoTitle,
      description,
      focusKeyword: finalFocusKeyword,
      featuredMedia: primary.featured_media,
      contentChars: String(primary.content?.raw ?? primary.content?.rendered ?? "").length,
    },
    duplicates,
    live: {
      ok: liveResponse.ok,
      status: liveResponse.status,
      length: liveHtml.length,
      hasHotlines: HOTLINES.every((hotline) => liveHtml.includes(hotline)),
      hasFocusKeyword: liveHtml.toLowerCase().includes(finalFocusKeyword.toLowerCase()),
    },
    rankMathBatch: batch
      ? { offset: batch.offset, keyword: batch.item?.keyword ?? "", title: stripHtml(batch.item?.title ?? "") }
      : null,
    score,
  };
  const stamp = new Date().toISOString().slice(0, 10);
  const jsonPath = join(REPORT_DIR, `website-check-${slug}-${stamp}.json`);
  const mdPath = join(REPORT_DIR, `website-check-${slug}-${stamp}.md`);
  writeFileSync(jsonPath, JSON.stringify(result, null, 2), "utf8");
  writeFileSync(
    mdPath,
    markdownReport({
      slug,
      primary: result.primary,
      duplicates,
      live: result.live,
      score,
      batch: result.rankMathBatch,
      reportJson: jsonPath,
    }),
    "utf8"
  );
  console.log(JSON.stringify({ ...result, report: { jsonPath, mdPath } }, null, 2));
  if (score.score < 90) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
