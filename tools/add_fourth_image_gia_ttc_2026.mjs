/**
 * Add the fourth SEO image to the live "gia thong tac cong Quang Ninh" post.
 *
 * Dry-run:
 *   node tools/add_fourth_image_gia_ttc_2026.mjs
 *
 * Apply:
 *   node tools/add_fourth_image_gia_ttc_2026.mjs --write
 */
import https from "node:https";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const PROJECT = "/mnt/d/.thongtaccongquangninh";
const POST_ID = 2787;
const POST_SLUG = "gia-thong-tac-cong-quang-ninh";
const WP_HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const BASE_URL = `https://${WP_HOST}`;
const URL_PATH = `/${POST_SLUG}/`;
const DRAFT_PATH = path.join(PROJECT, "content-drafts/blog/gia-thong-tac-cong-quang-ninh-2026.md");
const IMAGE_PATH = path.join(
  PROJECT,
  "Ảnh Đã Xử Lý SEO/gia-thong-tac-cong-quang-ninh-2026/gia-thong-tac-cong-quang-ninh-kiem-tra-may-lo-xo.webp",
);
const FILE_NAME = path.basename(IMAGE_PATH);
const ALT = "Kiểm tra máy lò xo trước khi báo giá thông tắc cống Quảng Ninh";
const CAPTION =
  "Kiểm tra máy lò xo và đầu thông giúp kỹ thuật viên chọn phương án xử lý phù hợp trước khi báo giá.";
const TITLE = "Kiểm tra máy lò xo báo giá thông tắc cống Quảng Ninh";
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = path.join(PROJECT, "seo-revisions", `wp-before-gia-ttc-fourth-image-${STAMP}`);
const REPORT_PATH = path.join(PROJECT, "reports", `add-fourth-image-gia-ttc-2026-${STAMP}.json`);
const CSV_PATH = path.join(PROJECT, "docs/SEO_PROGRESS.csv");

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function escAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripTags(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countImages(content) {
  return (String(content || "").match(/<img\b/gi) || []).length;
}

function request(auth, method, wpPath, { json, raw, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const body = json ? Buffer.from(JSON.stringify(json), "utf8") : raw || null;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: `/wp-json${wpPath}`,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "User-Agent": "codex-gia-ttc-fourth-image/1.0",
          ...(json ? { "Content-Type": "application/json" } : {}),
          ...(body ? { "Content-Length": body.length } : {}),
          ...headers,
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          const normalized = data.replace(/^\uFEFF/, "");
          let parsed = normalized;
          try {
            parsed = normalized ? JSON.parse(normalized) : {};
          } catch {}
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`WP ${res.statusCode} ${wpPath}: ${typeof parsed === "object" ? parsed.message || normalized : normalized}`));
            return;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
    if (body) req.write(body);
    req.end();
  });
}

function liveGet(urlPath) {
  return new Promise((resolve, reject) => {
    const cachePath = `${urlPath}?nowprocket=1&codex=image4-${Date.now()}`;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: cachePath,
        method: "GET",
        headers: { Host: WP_HOST, "User-Agent": "codex-gia-ttc-fourth-image-verify/1.0", "Cache-Control": "no-cache" },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => resolve({ status: res.statusCode, data: data.replace(/^\uFEFF/, "") }));
      },
    );
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

async function uploadMedia(auth) {
  const stem = FILE_NAME.replace(/\.[^.]+$/, "");
  const found = await request(auth, "GET", `/wp/v2/media?search=${encodeURIComponent(stem)}&per_page=20&_fields=id,source_url,slug`);
  const existing = Array.isArray(found.data) ? found.data.find((item) => String(item.source_url || "").includes(FILE_NAME)) : null;
  if (existing) {
    await request(auth, "POST", `/wp/v2/media/${existing.id}`, {
      json: { alt_text: ALT, title: TITLE, caption: CAPTION, description: "Ảnh WebP tối ưu riêng cho bài giá thông tắc cống Quảng Ninh 2026." },
    });
    return { ...existing, reused: true };
  }

  if (!existsSync(IMAGE_PATH)) throw new Error(`Missing image: ${IMAGE_PATH}`);
  const uploaded = await request(auth, "POST", "/wp/v2/media", {
    raw: readFileSync(IMAGE_PATH),
    headers: {
      "Content-Type": "image/webp",
      "Content-Disposition": `attachment; filename="${FILE_NAME}"`,
    },
  });
  await request(auth, "POST", `/wp/v2/media/${uploaded.data.id}`, {
    json: { alt_text: ALT, title: TITLE, caption: CAPTION, description: "Ảnh WebP tối ưu riêng cho bài giá thông tắc cống Quảng Ninh 2026." },
  });
  return { ...uploaded.data, reused: false };
}

function figureHtml(media) {
  return `<figure class="wp-block-image size-large"><img src="${escAttr(media.source_url)}" alt="${escAttr(ALT)}" class="wp-image-${media.id}" loading="lazy" /><figcaption>${escAttr(CAPTION)}</figcaption></figure>`;
}

function insertFigure(content, media) {
  if (content.includes(FILE_NAME)) return { content, inserted: false, reason: "already_present" };
  const figure = figureHtml(media);
  const anchor =
    /(<h2>Cách Nhận Biết Đơn Vị Thông Tắc Cống Báo Giá Minh Bạch<\/h2>\s*<p>[\s\S]*?<\/p>)/;
  if (!anchor.test(content)) throw new Error("Không tìm thấy vị trí chèn ảnh trong HTML live.");
  return { content: content.replace(anchor, `$1\n${figure}`), inserted: true, reason: "inserted_after_transparency_intro" };
}

function updateDraft(media) {
  const draft = readFileSync(DRAFT_PATH, "utf8");
  if (draft.includes(FILE_NAME)) return { changed: false, imageCount: (draft.match(/^!\[/gm) || []).length };
  const markdownImage = `\n![${ALT}](${media.source_url})\n*${CAPTION}*\n`;
  const anchor =
    /(Một đơn vị minh bạch sẽ hỏi kỹ trước khi báo: địa chỉ, điểm trào nước, loại công trình, ống dài khoảng bao nhiêu, có hố ga không, đã dùng hóa chất chưa và cần xử lý ban ngày hay ban đêm\.\n)/;
  if (!anchor.test(draft)) throw new Error("Không tìm thấy vị trí chèn ảnh trong draft.");
  const next = draft.replace(anchor, `$1${markdownImage}`);
  if (WRITE) writeFileSync(DRAFT_PATH, next, "utf8");
  return { changed: true, imageCount: (next.match(/^!\[/gm) || []).length };
}

function verifyLive(html, media) {
  const text = stripTags(html);
  return {
    statusOk: true,
    h1Count: (html.match(/<h1\b/gi) || []).length,
    totalImages: countImages(html),
    hasNewFile: html.includes(FILE_NAME),
    hasNewAlt: html.includes(ALT),
    hasCaption: text.includes(CAPTION),
    hasPriceKeyword: /giá thông tắc cống Quảng Ninh/i.test(text),
    hasMediaUrl: html.includes(media.source_url),
  };
}

async function main() {
  const envPath = path.join(PROJECT, ".env");
  const env = parseEnv(envPath);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  mkdirSync(path.dirname(REPORT_PATH), { recursive: true });

  const current = await request(auth, "GET", `/wp/v2/posts/${POST_ID}?context=edit`);
  if (current.data.slug !== POST_SLUG) throw new Error(`Sai slug post ${POST_ID}: ${current.data.slug}`);

  const beforeContent = current.data.content?.raw || "";
  let media = {
    id: 990001,
    source_url: `${BASE_URL}/wp-content/uploads/placeholder/${FILE_NAME}`,
    reused: false,
  };
  if (WRITE) media = await uploadMedia(auth);

  const insertion = insertFigure(beforeContent, media);
  const draftUpdate = updateDraft(media);
  const nextContent = insertion.content;
  let liveVerify = null;

  if (WRITE && insertion.inserted) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    writeFileSync(path.join(BACKUP_DIR, `post-${POST_ID}-before.json`), JSON.stringify(current.data, null, 2), "utf8");
    writeFileSync(path.join(BACKUP_DIR, `post-${POST_ID}-before.html`), beforeContent, "utf8");
    await request(auth, "POST", `/wp/v2/posts/${POST_ID}`, { json: { content: nextContent, status: "publish" } });
  }
  if (WRITE) {
    const live = await liveGet(URL_PATH);
    liveVerify = { status: live.status, ...verifyLive(live.data, media) };
  }

  const report = {
    ok: !WRITE || !liveVerify || (liveVerify.status === 200 && liveVerify.hasNewFile && liveVerify.hasNewAlt && liveVerify.hasCaption),
    mode: WRITE ? "write" : "dry-run",
    generatedAt: new Date().toISOString(),
    postId: POST_ID,
    url: `${BASE_URL}${URL_PATH}`,
    imagePath: IMAGE_PATH,
    media: { id: media.id, sourceUrl: media.source_url, reused: media.reused },
    before: { imageCount: countImages(beforeContent), hadNewFile: beforeContent.includes(FILE_NAME) },
    after: { imageCount: countImages(nextContent), hasNewFile: nextContent.includes(FILE_NAME), insertion },
    draftUpdate,
    liveVerify,
    backupDir: WRITE && insertion.inserted ? BACKUP_DIR : null,
  };

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  if (WRITE) {
    const day = new Date().toISOString().slice(0, 10);
    const time = new Date().toTimeString().slice(0, 5);
    appendFileSync(
      CSV_PATH,
      `\n${day},${time},ADD-GIA-TTC-FOURTH-IMAGE-2026,seo_image,gia-thong-tac-cong-quang-ninh,${BASE_URL}${URL_PATH},post-${POST_ID},done,low,,,,,add fourth optimized WebP image to pass image count gate,${path.relative(PROJECT, REPORT_PATH)};${path.relative(PROJECT, BACKUP_DIR)},,Verify live with cache-buster and audit_unique_wp_images.py,image=${FILE_NAME};media=${media.id},NOT_REQUIRED,,,,,`,
      "utf8",
    );
  }

  console.log(JSON.stringify(report, null, 2));
  if (WRITE && !report.ok) throw new Error(`Live verify failed: ${JSON.stringify(liveVerify)}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
