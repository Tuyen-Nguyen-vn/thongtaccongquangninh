/**
 * Publish script: cam-nang-thong-tac-cong-tai-ha-long
 * Uploads 5 images, creates WP blog post, sets Rank Math, publishes.
 * IP bypass (103.57.220.210) để tránh DNS block trong môi trường dev.
 */
import https from "node:https";
import { createReadStream, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
const DRAFT_PATH = path.join(PROJECT, "content-drafts", "blog", "cam-nang-thong-tac-cong-tai-ha-long-rankmath-90.md");
const PACKAGE_PATH = path.join(PROJECT, "image-briefs", "cam-nang-thong-tac-cong-tai-ha-long-rankmath-90-image-package.json");
const REPORT_PATH = path.join(PROJECT, `WORDPRESS_PUBLISH_CAM_NANG_HA_LONG_${LOCAL_DATE}.json`);
const BACKUP_DIR = path.join(PROJECT, "backups");

const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function field(md, label) {
  const m = md.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
  return m ? m[1].trim() : "";
}

function firstH1(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "";
}

function normalizeLocalPath(inputPath) {
  if (!inputPath) return inputPath;
  if (existsSync(inputPath)) return inputPath;
  const wslPath = inputPath
    .replace(/\\/g, "/")
    .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
  return existsSync(wslPath) ? wslPath : inputPath;
}

function escHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inlineMd(s) {
  return escHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((#[^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\[([^\]]+)\]\((https?:\/\/thongtaccongquangninh\.com[^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\[([^\]]+)\]\((https?:\/\/(?!thongtaccongquangninh\.com)[^)]+)\)/g, '<a href="$2" rel="nofollow noopener" target="_blank">$1</a>');
}

function markdownToHtml(md, uploadMap) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let para = [], list = [], orderedList = [], table = [];

  const flushPara = () => { if (para.length) { out.push(`<p>${inlineMd(para.join(" "))}</p>`); para = []; } };
  const flushList = () => { if (list.length) { out.push(`<ul>${list.map(i => `<li>${inlineMd(i)}</li>`).join("")}</ul>`); list = []; } };
  const flushOrderedList = () => { if (orderedList.length) { out.push(`<ol>${orderedList.map(i => `<li>${inlineMd(i)}</li>`).join("")}</ol>`); orderedList = []; } };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter(r => !/^\|\s*-+/.test(r)).map(r => r.replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
    if (rows.length) {
      const [head, ...body] = rows;
      out.push(`<table><thead><tr>${head.map(c => `<th>${inlineMd(c)}</th>`).join("")}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${inlineMd(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
    }
    table = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { flushPara(); flushList(); flushOrderedList(); flushTable(); continue; }
    if (/^(Meta Title|Meta Description|Focus Keyword|Slug|Search Intent):/u.test(line)) continue;
    if (line.startsWith("<!--") || line.startsWith("**Trạng thái ảnh**")) continue;

    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/u);
    if (imgMatch) {
      flushPara(); flushList(); flushOrderedList(); flushTable();
      const fileName = path.basename(imgMatch[2]);
      const item = uploadMap.get(fileName);
      if (item) {
        out.push(`<!-- wp:image {"id":${item.id},"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="${item.url}" alt="${escHtml(item.altText)}" class="wp-image-${item.id}"/><figcaption class="wp-element-caption">${escHtml(item.caption)}</figcaption></figure>\n<!-- /wp:image -->`);
      }
      continue;
    }
    if (/^\*[^*]/.test(line) && !line.startsWith("**")) continue; // italic caption lines

    if (line.startsWith("|")) { flushPara(); flushList(); flushOrderedList(); table.push(line); continue; }
    flushTable();
    if (line === "---") { flushPara(); flushList(); flushOrderedList(); out.push("<!-- wp:separator --><hr class=\"wp-block-separator has-alpha-channel-opacity\"/><!-- /wp:separator -->"); }
    else if (line.startsWith("### ")) { flushPara(); flushList(); flushOrderedList(); out.push(`<h3>${inlineMd(line.slice(4))}</h3>`); }
    else if (line.startsWith("## ")) { flushPara(); flushList(); flushOrderedList(); out.push(`<h2>${inlineMd(line.slice(3).replace(/<a id="[^"]*"><\/a>/, ""))}</h2>`); }
    else if (line.startsWith("# ")) { flushPara(); flushList(); flushOrderedList(); } // H1 comes from WP post title.
    else if (line.startsWith("- ")) { flushPara(); flushOrderedList(); list.push(line.slice(2)); }
    else if (/^\d+\.\s+/.test(line)) { flushPara(); flushList(); orderedList.push(line.replace(/^\d+\.\s+/, "")); }
    else if (line.startsWith("> ")) { flushPara(); flushList(); flushOrderedList(); out.push(`<blockquote><p>${inlineMd(line.slice(2))}</p></blockquote>`); }
    else { para.push(line); }
  }
  flushPara(); flushList(); flushOrderedList(); flushTable();
  return out.join("\n");
}

// ── IP Bypass request ──────────────────────────────────────────────────────────
function wpRequest(method, route, auth, bodyObj = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = bodyObj != null ? Buffer.from(JSON.stringify(bodyObj), "utf8") : null;
    const req = https.request({
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: "/wp-json" + route,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "Content-Type": "application/json",
        "User-Agent": "TTCQN-SEO-Agent/1.0",
        ...extraHeaders,
        ...(bodyBuf ? { "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let payload = text;
        try { payload = JSON.parse(text); } catch {}
        if (res.statusCode >= 400) {
          reject(new Error(`WP ${res.statusCode} ${route}: ${typeof payload === "object" ? (payload.message || text) : text}`));
        } else {
          resolve(payload);
        }
      });
    });
    req.on("error", reject);
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

// ── Upload ảnh qua IP bypass ───────────────────────────────────────────────────
async function uploadImage(auth, image) {
  const localPath = normalizeLocalPath(image.outputPath);
  if (!existsSync(localPath)) throw new Error(`Không tìm thấy ảnh: ${localPath}`);

  const ext = path.extname(image.fileName).toLowerCase();
  const contentType = ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "image/jpeg";
  const stem = path.basename(image.fileName, ext);

  // Kiểm tra đã tồn tại chưa
  const existing = await wpRequest("GET", `/wp/v2/media?search=${encodeURIComponent(stem)}&per_page=5`, auth);
  const found = Array.isArray(existing) ? existing.find(m => (m.source_url || "").includes(image.fileName)) : null;
  if (found) {
    console.log(`  [SKIP] ${image.fileName} đã tồn tại (ID: ${found.id})`);
    return { id: found.id, url: found.source_url, altText: image.altText, caption: image.caption };
  }

  // Upload
  const buf = readFileSync(localPath);
  const media = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: "/wp-json/wp/v2/media",
      method: "POST",
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${image.fileName}"`,
        "Content-Length": buf.length,
        "User-Agent": "TTCQN-SEO-Agent/1.0",
      },
      rejectUnauthorized: false,
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let data;
        try { data = JSON.parse(text); } catch {
          reject(new Error(`Upload parse error: ${text.slice(0, 100)}`)); return;
        }
        if (res.statusCode >= 400) {
          reject(new Error(`Upload ${res.statusCode}: ${data.message || text}`)); return;
        }
        resolve(data);
      });
    });
    req.on("error", reject);
    req.write(buf);
    req.end();
  });

  // Update alt/caption
  await wpRequest("POST", `/wp/v2/media/${media.id}`, auth, {
    alt_text: image.altText,
    caption: image.caption,
    title: stem.replace(/-/g, " "),
  });

  console.log(`  [UPLOAD] ${image.fileName} -> ID ${media.id}`);
  return { id: media.id, url: media.source_url, altText: image.altText, caption: image.caption };
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  const md = readFileSync(DRAFT_PATH, "utf8");
  const pkg = JSON.parse(readFileSync(PACKAGE_PATH, "utf8"));

  const metaTitle = field(md, "Meta Title");
  const metaDesc  = field(md, "Meta Description");
  const keyword   = field(md, "Focus Keyword");
  const slug      = field(md, "Slug");
  const h1Title   = firstH1(md) || metaTitle;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 PUBLISH (IP bypass ${SERVER_IP})`);
  console.log(`   File: cam-nang-thong-tac-cong-tai-ha-long-rankmath-90.md`);
  console.log(`   Slug: ${slug}`);
  console.log(`   Title: ${metaTitle}`);
  console.log(`   H1: ${h1Title}`);
  console.log(`   Keyword: ${keyword}`);
  console.log(`${"=".repeat(60)}\n`);

  if (!metaTitle || !slug) throw new Error("Thiếu Meta Title hoặc Slug trong draft");

  // 1. Verify auth
  const me = await wpRequest("GET", "/wp/v2/users/me", auth);
  console.log(`Auth OK: ${me.name} — ${WP_HOST} via ${SERVER_IP}`);

  // 2. Upload ảnh
  console.log("\n--- Upload ảnh ---");
  const uploadMap = new Map();
  let featuredMediaId = 0;
  for (const image of pkg.images ?? []) {
    const result = await uploadImage(auth, image);
    uploadMap.set(image.fileName, result);
    if (!featuredMediaId) featuredMediaId = result.id;
  }

  // 3. Convert markdown → HTML
  const html = markdownToHtml(md, uploadMap);
  console.log(`\nHTML: ${html.length} ký tự`);

  // 4. Category "Thông Tắc Cống"
  let categoryIds = [];
  try {
    const cats = await wpRequest("GET", `/wp/v2/categories?search=th%C3%B4ng+t%E1%BA%AFc+c%E1%BB%91ng&per_page=5`, auth);
    if (Array.isArray(cats) && cats.length) {
      categoryIds = [cats[0].id];
      console.log(`\nCategory: ${cats[0].name} (ID: ${cats[0].id})`);
    }
  } catch (e) {
    console.warn(`Category lookup warn: ${e.message}`);
  }

  // 5. Tạo/cập nhật post
  console.log("\n--- Tạo bài viết WP ---");
  const existing = await wpRequest("GET", `/wp/v2/posts?slug=${encodeURIComponent(slug)}&status=any`, auth);
  let postId;
  let isNew = false;
  let postWriteData = null;

  const postBody = {
    title: h1Title,
    content: html,
    excerpt: metaDesc,
    status: "publish",
    slug,
    featured_media: featuredMediaId,
    ...(categoryIds.length ? { categories: categoryIds } : {}),
  };

  if (Array.isArray(existing) && existing.length > 0) {
    postId = existing[0].id;
    console.log(`[UPDATE] Post đã tồn tại: ID ${postId}`);
    mkdirSync(BACKUP_DIR, { recursive: true });
    writeFileSync(path.join(BACKUP_DIR, `post-${postId}-before-publish-cam-nang-ha-long.json`), JSON.stringify(existing[0], null, 2), "utf8");
    postWriteData = await wpRequest("POST", `/wp/v2/posts/${postId}`, auth, postBody);
  } else {
    isNew = true;
    const created = await wpRequest("POST", "/wp/v2/posts", auth, postBody);
    postWriteData = created;
    postId = created.id;
    console.log(`[CREATE] Post mới: ID ${postId}`);
  }

  // 6. Set Rank Math meta
  console.log("\n--- Rank Math meta ---");
  try {
    await wpRequest("POST", "/rankmath/v1/updateMeta", auth, {
      objectType: "post",
      objectID: postId,
      meta: {
        rank_math_title: metaTitle,
        rank_math_description: metaDesc,
        rank_math_focus_keyword: keyword,
      },
    });
    console.log("  Rank Math OK");
  } catch (e) {
    console.warn(`  Rank Math warning: ${e.message}`);
  }

  // 7. Verify
  const postData = await wpRequest("GET", `/wp/v2/posts/${postId}?context=view`, auth);
  const liveUrl = postData.link;
  console.log(`\n✅ WP DONE: ${liveUrl}`);

  // 8. Google Indexing API
  let indexing = { ok: false, skipped: true, reason: "Chưa chạy" };
  console.log("\n--- Google Indexing API ---");
  try {
    indexing = await submitIndexingUrl(PROJECT, liveUrl);
    if (indexing.ok) {
      console.log("  Google Indexing API OK");
    } else if (indexing.skipped) {
      console.warn(`  Google Indexing API skip: ${indexing.reason}`);
    } else {
      console.warn(`  Google Indexing API lỗi HTTP ${indexing.status}: ${JSON.stringify(indexing.payload)}`);
    }
  } catch (e) {
    indexing = { ok: false, skipped: false, error: e.message };
    console.warn(`  Google Indexing API exception: ${e.message}`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    generatedAtLocal: localDateTimeStamp(),
    postId,
    isNew,
    status: postData.status,
    liveUrl,
    updatedAt: postWriteData?.modified ?? null,
    updatedAtGmt: postWriteData?.modified_gmt ?? null,
    verifiedAt: postData?.modified ?? null,
    verifiedAtGmt: postData?.modified_gmt ?? null,
    slug,
    metaTitle,
    h1Title,
    keyword,
    featuredMediaId,
    indexing,
    uploads: [...uploadMap.entries()].map(([fn, u]) => ({ fileName: fn, id: u.id, url: u.url })),
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(`Report: ${REPORT_PATH}`);
  return report;
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
