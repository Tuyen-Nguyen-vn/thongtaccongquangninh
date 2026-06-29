/**
 * publish_gieng_day_cong.mjs
 * Upload 3 ảnh SEO + publish bài thong-tac-cong-gieng-day lên WordPress
 */

import { createReadStream, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { markdownToHtml } from "./lib/markdown_to_html.mjs";
import { submitIndexingUrl } from "./lib/google_indexing_api.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = process.env.TTCQN_PROJECT_ROOT || path.resolve(__dirname, "..");
const ENV_PATH = path.join(PROJECT, ".env");
function localDateParts(date = new Date()) {
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
  return map;
}
function localDateTimeStamp(date = new Date()) {
  const map = localDateParts(date);
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`;
}
const LOCAL_DATE_PARTS = localDateParts();
const LOCAL_DATE = `${LOCAL_DATE_PARTS.year}-${LOCAL_DATE_PARTS.month}-${LOCAL_DATE_PARTS.day}`;
const DRAFT_MD = path.join(PROJECT, "content-drafts", "thong-tac-cong-gieng-day-ha-long-rankmath-draft.md");
const IMAGE_PKG = path.join(PROJECT, "image-briefs", "thong-tac-cong-gieng-day-image-package.json");
const BACKUP_DIR = path.join(PROJECT, "backups");

// Mapping: tên PNG trong draft → slot trong image-package
const SLOT_BY_PNG = {
  "thong-tac-cong-gieng-day-anh-dau-bai.png":  "hero",
  "thong-tac-cong-gieng-day-khu-vuc-phuc-vu.png": "process",
  "thong-tac-cong-gieng-day-case-study.png":    "case-study",
};

function parseEnv(fp) {
  const env = {};
  for (const line of readFileSync(fp, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

function field(md, label) {
  const m = md.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
  return m ? m[1].trim() : "";
}

async function wpFetch(baseUrl, auth, route, init = {}) {
  const res = await fetch(`${baseUrl}/wp-json${route}`, {
    ...init,
    headers: {
      Authorization: auth,
      "User-Agent": "ttcqn-publisher/1.0",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = text; }
  if (!res.ok) {
    const msg = typeof body === "object" ? (body.message ?? text) : text;
    throw new Error(`WP ${res.status} ${route}: ${msg}`);
  }
  return body;
}

async function uploadOrFind(baseUrl, auth, image) {
  // Tìm media đã upload trước
  const stem = path.basename(image.fileName, path.extname(image.fileName));
  const existing = await wpFetch(baseUrl, auth, `/wp/v2/media?search=${encodeURIComponent(stem)}&per_page=20`);
  if (Array.isArray(existing)) {
    const found = existing.find(m => String(m.source_url ?? "").includes(image.fileName));
    if (found) { console.log(`  (đã có) ${image.fileName} → ${found.source_url}`); return found; }
  }

  const localPath = path.join(PROJECT, image.filePath);
  if (!existsSync(localPath)) throw new Error(`Không tìm thấy file: ${localPath}`);

  const mime = image.fileName.endsWith(".webp") ? "image/webp"
    : image.fileName.endsWith(".jpg") || image.fileName.endsWith(".jpeg") ? "image/jpeg" : "image/png";

  const media = await wpFetch(baseUrl, auth, "/wp/v2/media", {
    method: "POST",
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${image.fileName}"`,
    },
    body: createReadStream(localPath),
    duplex: "half",
  });

  // Set alt, caption, title
  await wpFetch(baseUrl, auth, `/wp/v2/media/${media.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      alt_text:    image.altText,
      caption:     image.caption,
      title:       image.title ?? stem,
    }),
  });

  console.log(`  Uploaded ${image.fileName} → ${media.source_url}`);
  return media;
}

function prepareMarkdown(md) {
  // 1. Xóa section PENDING_IMAGE_SEO (kể cả heading trước nó)
  let out = md.replace(
    /\n## <a id="trang-thai-nghiem-thu"[^>]*>.*?<\/a>Trạng thái nghiệm thu[\s\S]*?(?=\n<script|\s*$)/,
    ""
  );

  // 2. Xóa JSON-LD scripts (Rank Math tự generate)
  out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");

  // 3. Di chuyển byline từ đầu xuống cuối
  const bylineMatch = out.match(/^\n?\*Cập nhật mới nhất ngày:.*?\*\n?/m);
  if (bylineMatch) {
    out = out.replace(bylineMatch[0], "\n");
    out = out.trimEnd() + "\n\n" + bylineMatch[0].trim() + "\n";
  }

  return out;
}

async function main() {
  const env     = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth    = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  const md  = readFileSync(DRAFT_MD, "utf8");
  const pkg = JSON.parse(readFileSync(IMAGE_PKG, "utf8"));

  const title        = field(md, "Meta Title");
  const description  = field(md, "Meta Description");
  const focusKeyword = field(md, "Focus Keyword");
  const slug         = field(md, "Slug");

  console.log(`Slug: ${slug}`);
  console.log(`Keyword: ${focusKeyword}`);

  // Kiểm tra bài đã tồn tại chưa
  const checkExisting = await wpFetch(baseUrl, auth, `/wp/v2/posts?slug=${encodeURIComponent(slug)}&status=any&context=edit`);
  const existing = Array.isArray(checkExisting) && checkExisting.length > 0 ? checkExisting[0] : null;
  if (existing) {
    console.log(`⚠️  Bài "${slug}" đã tồn tại (ID=${existing.id}, status=${existing.status}). Sẽ update + publish.`);
    mkdirSync(BACKUP_DIR, { recursive: true });
    writeFileSync(path.join(BACKUP_DIR, `post-${existing.id}-before-publish-gieng-day-cong.json`), JSON.stringify(existing, null, 2), "utf8");
  }

  // Upload ảnh
  console.log("\nUpload ảnh...");
  const mediaBySlot = {};
  for (const image of pkg.images) {
    const media = await uploadOrFind(baseUrl, auth, image);
    mediaBySlot[image.slot] = { media, image };
  }

  // Xây imageMap: tên PNG trong draft → URL live của webp đã upload
  const imageMap = {};
  for (const [pngName, slot] of Object.entries(SLOT_BY_PNG)) {
    const item = mediaBySlot[slot];
    if (item) {
      imageMap[pngName] = item.media.source_url;
      imageMap[`../image-briefs/assets/${pngName}`] = item.media.source_url;
    }
  }

  // Chuẩn bị markdown và convert sang HTML
  const cleanMd = prepareMarkdown(md);
  const html    = markdownToHtml(cleanMd, { imageMap });

  const heroMedia = mediaBySlot["hero"]?.media;

  // Tạo mới hoặc cập nhật bài hiện có
  console.log(existing ? "\nCập nhật bài hiện có..." : "\nTạo bài mới...");
  const post = await wpFetch(baseUrl, auth, existing ? `/wp/v2/posts/${existing.id}` : "/wp/v2/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      content: html,
      excerpt: description,
      status: "publish",
      slug,
      featured_media: heroMedia?.id ?? 0,
    }),
  });

  console.log(`✅ Post ID=${post.id} status=${post.status} link=${post.link}`);

  // Update Rank Math meta
  console.log("Update Rank Math...");
  try {
    await wpFetch(baseUrl, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objectType: "post",
        objectID: post.id,
        meta: {
          rank_math_title:          title,
          rank_math_description:    description,
          rank_math_focus_keyword:  focusKeyword,
        },
      }),
    });
    console.log("✅ Rank Math OK");
  } catch (err) {
    console.warn("⚠️  Rank Math:", err.message);
  }

  // Submit Google Index trực tiếp qua Google Indexing API
  console.log("Submit Google Index...");
  let indexing = null;
  try {
    indexing = await submitIndexingUrl(PROJECT, post.link);
    console.log(`Google Index API: ${JSON.stringify(indexing).slice(0, 300)}`);
  } catch (err) {
    indexing = { ok: false, error: err.message };
    console.warn("⚠️  Google Index:", err.message);
  }

  const verified = await wpFetch(baseUrl, auth, `/wp/v2/posts/${post.id}?context=edit`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  // Ghi log
  const report = {
    publishedAt: new Date().toISOString(),
    generatedAtLocal: localDateTimeStamp(),
    action: existing ? "updated_existing_post" : "created_post",
    requestedSlug: slug,
    slug: verified.slug,
    slugMatchedRequested: verified.slug === slug,
    postId: post.id,
    link: post.link,
    status: post.status,
    updatedAt: post?.modified ?? null,
    updatedAtGmt: post?.modified_gmt ?? null,
    verifiedAt: verified?.modified ?? null,
    verifiedAtGmt: verified?.modified_gmt ?? null,
    indexing,
    images: Object.fromEntries(Object.entries(mediaBySlot).map(([s, v]) => [s, v.media.source_url])),
  };
  const reportPath = path.join(PROJECT, `PUBLISH_GIENG_DAY_CONG_${LOCAL_DATE}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nLog: ${reportPath}`);
  console.log(`\n✅ XONG: ${post.link}`);
}

main().catch(err => { console.error(err.stack ?? err.message); process.exit(1); });
