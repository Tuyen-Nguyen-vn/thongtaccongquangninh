import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const PROJECT_ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATHS = [
  path.join(PROJECT_ROOT, ".env"),
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
];
const IMAGE_PATH = path.join(PROJECT_ROOT, "Favicon", "favicon-moi-truong-do-thi-so-1-quang-ninh-2026-05-12.png");
const REPORT_PATH = path.join(PROJECT_ROOT, "WORDPRESS_UPDATE_FAVICON_2026-05-12.json");
const FILE_NAME = "favicon-moi-truong-do-thi-so-1-quang-ninh-2026-05-12.png";
const ALT_TEXT = "Favicon Môi Trường Đô Thị Số 1 Quảng Ninh";

function readEnvFile(filePath) {
  const env = {};
  if (!existsSync(filePath)) return env;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const env = Object.assign({}, ...ENV_PATHS.map(readEnvFile));
const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD");
if (!existsSync(IMAGE_PATH)) throw new Error(`Missing optimized favicon: ${IMAGE_PATH}`);

const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(pathname, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${pathname}`, {
    ...options,
    headers: {
      Authorization: auth,
      "User-Agent": "Codex favicon replacement 2026-05-12",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`WP ${response.status} ${pathname}: ${typeof json === "object" ? json.message || text : text}`);
  }
  return json;
}

async function listMediaBySearch(search) {
  const rows = [];
  for (let page = 1; page <= 5; page += 1) {
    const batch = await wp(`/wp/v2/media?search=${encodeURIComponent(search)}&per_page=100&page=${page}&context=edit`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    rows.push(...batch);
    if (batch.length < 100) break;
  }
  return rows;
}

function isOldFavicon(media, newId) {
  if (!media || Number(media.id) === Number(newId)) return false;
  const haystack = [
    media.slug,
    media.source_url,
    media.title?.raw,
    media.title?.rendered,
    media.alt_text,
    media.caption?.raw,
    media.description?.raw,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes("favicon");
}

const beforeSettings = await wp("/wp/v2/settings");
let beforeSiteIconMedia = null;
if (beforeSettings.site_icon) {
  try {
    beforeSiteIconMedia = await wp(`/wp/v2/media/${beforeSettings.site_icon}?context=edit`);
  } catch (error) {
    beforeSiteIconMedia = { error: error.message };
  }
}
const beforeFaviconMedia = await listMediaBySearch("favicon");

const uploaded = await wp("/wp/v2/media", {
  method: "POST",
  body: readFileSync(IMAGE_PATH),
  headers: {
    "Content-Type": "image/png",
    "Content-Disposition": `attachment; filename="${FILE_NAME}"`,
  },
});

const updatedMedia = await wp(`/wp/v2/media/${uploaded.id}`, {
  method: "POST",
  body: JSON.stringify({
    alt_text: ALT_TEXT,
    caption: ALT_TEXT,
    title: ALT_TEXT,
    description: "Favicon mới 2026-05-12, giữ nguyên kích thước gốc 1536x1024 và nền trong suốt.",
  }),
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

await wp("/wp/v2/settings", {
  method: "POST",
  body: JSON.stringify({ site_icon: uploaded.id }),
  headers: { "Content-Type": "application/json" },
});

const deleteCandidates = new Map();
for (const item of beforeFaviconMedia) {
  if (isOldFavicon(item, uploaded.id)) deleteCandidates.set(Number(item.id), item);
}
if (beforeSiteIconMedia && !beforeSiteIconMedia.error && isOldFavicon(beforeSiteIconMedia, uploaded.id)) {
  deleteCandidates.set(Number(beforeSiteIconMedia.id), beforeSiteIconMedia);
}

const deletedOldFavicons = [];
for (const [id, item] of deleteCandidates) {
  try {
    const deleted = await wp(`/wp/v2/media/${id}?force=true`, { method: "DELETE" });
    deletedOldFavicons.push({
      id,
      sourceUrl: item.source_url,
      title: item.title?.raw || item.title?.rendered || "",
      deleted: Boolean(deleted.deleted),
    });
  } catch (error) {
    deletedOldFavicons.push({
      id,
      sourceUrl: item.source_url,
      title: item.title?.raw || item.title?.rendered || "",
      deleted: false,
      error: error.message,
    });
  }
}

const afterSettings = await wp("/wp/v2/settings");
const afterMedia = await wp(`/wp/v2/media/${afterSettings.site_icon}?context=edit`);
const remainingFaviconMedia = await listMediaBySearch("favicon");

const report = {
  generatedAt: new Date().toISOString(),
  imagePath: IMAGE_PATH,
  fileName: FILE_NAME,
  before: {
    siteIcon: beforeSettings.site_icon,
    sourceUrl: beforeSiteIconMedia?.source_url || null,
    faviconMediaIds: beforeFaviconMedia.map((item) => item.id),
  },
  uploaded: {
    id: uploaded.id,
    sourceUrl: uploaded.source_url,
    mediaDetails: updatedMedia.media_details,
  },
  deletedOldFavicons,
  after: {
    siteIcon: afterSettings.site_icon,
    sourceUrl: afterMedia.source_url,
    title: afterMedia.title?.raw || afterMedia.title?.rendered || "",
    remainingFaviconMedia: remainingFaviconMedia.map((item) => ({
      id: item.id,
      sourceUrl: item.source_url,
      title: item.title?.raw || item.title?.rendered || "",
    })),
  },
  ok: Number(afterSettings.site_icon) === Number(uploaded.id),
};

writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;
