import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";

const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];
const idArg = process.argv.find((a) => a.startsWith("--id="))?.split("=")[1];
const collectionArg = process.argv.find((a) => a.startsWith("--type="))?.split("=")[1] || "pages";
const keywordArg = process.argv.find((a) => a.startsWith("--keyword="))?.split("=")[1];
if (!slugArg && !idArg) throw new Error("Usage: node tools/seo_gate_score.mjs --slug=<slug> [--type=pages|posts] [--id=<id>] [--keyword=<override>]");

function parseEnv(filePath) {
  const env = {};
  if (!existsSync(filePath)) return env;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripText(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/gu, " ")
    .trim();
}

function wordCount(input) {
  const t = stripText(input);
  return t ? t.split(/\s+/u).filter(Boolean).length : 0;
}

function removeDiacritics(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/gu, (c) => (c === "Đ" ? "D" : "d"));
}

function slugify(input) {
  return removeDiacritics(String(input ?? ""))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function keywordCount(input, keyword) {
  const text = stripText(input).toLowerCase();
  const kw = keyword.toLowerCase();
  let count = 0;
  let index = 0;
  while ((index = text.indexOf(kw, index)) !== -1) {
    count++;
    index += kw.length;
  }
  return count;
}

function countMatches(input, pattern) {
  return (String(input).match(pattern) || []).length;
}

const env = parseEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || SITE).replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD in .env");
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(path) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    headers: { Authorization: auth, Accept: "application/json", "User-Agent": "TTCQN seo-gate-score" },
    signal: AbortSignal.timeout(60000),
  });
  const rawBody = await response.text();
  const payload = rawBody ? JSON.parse(rawBody) : {};
  if (!response.ok) throw new Error(`WP ${response.status} ${path}: ${JSON.stringify(payload)}`);
  return payload;
}

async function main() {
  let record;
  if (idArg) {
    record = await wp(`/wp/v2/${collectionArg}/${idArg}?context=edit`);
  } else {
    const results = await wp(`/wp/v2/${collectionArg}?slug=${encodeURIComponent(slugArg)}&context=edit`);
    if (!results.length) throw new Error(`No ${collectionArg} found for slug ${slugArg}`);
    record = results[0];
  }

  const meta = record.meta || {};
  const rankMathTitle = meta.rank_math_title || record.title?.raw || "";
  const rankMathDesc = meta.rank_math_description || stripText(record.excerpt?.raw || "");
  const focusKeyword = keywordArg || meta.rank_math_focus_keyword || "";
  const raw = record.content?.raw || "";
  const words = wordCount(raw);
  const kwCount = focusKeyword ? keywordCount(raw, focusKeyword) : 0;
  const density = words ? Number(((kwCount / words) * 100).toFixed(2)) : 0;
  const first100 = stripText(raw).toLowerCase().split(/\s+/u).filter(Boolean).slice(0, 100).join(" ");
  const h1Count = countMatches(raw, /<h1\b/giu);
  const hotlineCount = countMatches(stripText(raw), /0963[\s.\-]?953[\s.\-]?533|0931[\s.\-]?156[\s.\-]?756/giu);
  const banned = countMatches(stripText(raw), /uy tín|chuyên nghiệp|hàng đầu|tận tâm/giu);
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(raw);

  const checks = {
    "Meta title 60-70 ký tự": [...rankMathTitle].length >= 60 && [...rankMathTitle].length <= 70,
    "Meta description 150-160 ký tự": [...rankMathDesc].length >= 150 && [...rankMathDesc].length <= 160,
    "Focus keyword trong title": focusKeyword && rankMathTitle.toLowerCase().includes(focusKeyword.toLowerCase()),
    "Focus keyword trong description": focusKeyword && rankMathDesc.toLowerCase().includes(focusKeyword.toLowerCase()),
    "Slug đúng keyword": focusKeyword && record.slug === slugify(focusKeyword),
    "Word count 2500-3000": words >= 2500 && words <= 3000,
    "Mật độ keyword 1-1.5%": density >= 1 && density <= 1.5,
    "1 H1 trên live page": h1Count <= 1,
    "Focus keyword trong 100 từ đầu": focusKeyword && first100.includes(focusKeyword.toLowerCase()),
    "Có Nguyên nhân": /nguyên nhân/iu.test(raw),
    "Có Cam kết 3 Không": /cam kết.*3.*không|3.*không/iu.test(raw),
    "Có Bảng giá": /bảng giá/iu.test(raw),
    "Có Quy trình 5 bước": /quy trình.*5.*bước|5.*bước/iu.test(raw),
    "Có Case study E-E-A-T": /case study/iu.test(raw),
    "Có NAP": /<address/iu.test(raw) || /địa chỉ:/iu.test(raw),
    "Có FAQ": /faq/iu.test(raw),
    "Đủ 2 hotline": hotlineCount >= 2,
    "CTA hotline >= 3": hotlineCount >= 3,
    "Không có từ cấm": banned === 0,
    "Không emoji/ký hiệu": !emoji,
    "Có featured media": Boolean(record.featured_media),
  };

  const trueCount = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  const score = Math.round((trueCount / total) * 100);

  const result = {
    slug: record.slug,
    id: record.id,
    title: rankMathTitle,
    titleLen: [...rankMathTitle].length,
    description: rankMathDesc,
    descLen: [...rankMathDesc].length,
    focusKeyword,
    wordCount: words,
    keywordCount: kwCount,
    density,
    hotlineCount,
    featuredMedia: record.featured_media,
    score,
    trueCount,
    total,
    checks,
  };

  console.log(JSON.stringify(result, null, 2));

  mkdirSync(join(ROOT, "reports"), { recursive: true });
  writeFileSync(join(ROOT, "reports", `seo-gate-score-${record.slug}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`), JSON.stringify(result, null, 2) + "\n", "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
