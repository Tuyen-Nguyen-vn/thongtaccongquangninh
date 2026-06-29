/**
 * Add real content images to /dieu-khoan-dich-vu/.
 *
 * Dry-run:
 *   node tools/fix_dieu_khoan_images_2026_06_27.mjs
 *
 * Apply:
 *   node tools/fix_dieu_khoan_images_2026_06_27.mjs --write
 */
import https from "node:https";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const PROJECT = "/mnt/d/.thongtaccongquangninh";
const ENV_CANDIDATES = [
  path.join(PROJECT, ".env"),
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
];
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PAGE_SLUG = "dieu-khoan-dich-vu";
const PAGE_ID = 2445;
const PAGE_URL = `https://${WP_HOST}/dieu-khoan-dich-vu/`;
const CSV_PATH = path.join(PROJECT, "docs/SEO_PROGRESS.csv");
const IMAGE_DIR = path.join(PROJECT, "Ảnh Đã Xử Lý SEO/dieu-khoan-dich-vu-2026-06-27");
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = path.join(PROJECT, "seo-revisions", `wp-before-dieu-khoan-images-${STAMP}`);
const REPORT_PATH = path.join(PROJECT, "reports", `dieu-khoan-images-fix-${STAMP}.json`);

const IMAGES = [
  {
    fileName: "dieu-khoan-dich-vu-xe-hut-be-phot-quang-ninh.webp",
    alt: "Xe hút bể phốt phục vụ theo điều khoản dịch vụ tại Quảng Ninh",
    caption: "Hình minh họa quy trình tiếp nhận, điều phối xe và nhân lực theo đúng phạm vi đã thống nhất.",
    title: "Điều khoản dịch vụ xe hút bể phốt Quảng Ninh",
    insert: "replace-empty-figure",
  },
  {
    fileName: "dieu-khoan-dich-vu-tho-thong-tac-cong-quang-ninh.webp",
    alt: "Kỹ thuật viên thông tắc cống thực hiện đúng điều khoản đã báo tại Quảng Ninh",
    caption: "Hình minh họa thao tác kỹ thuật sau khi khách hàng xác nhận phạm vi, chi phí và thời gian xử lý.",
    title: "Điều khoản dịch vụ kỹ thuật thông tắc cống Quảng Ninh",
    insertAfter: "<h2>5. Cam Kết Thực Hiện</h2>",
  },
  {
    fileName: "dieu-khoan-dich-vu-lien-he-moi-truong-quang-ninh.webp",
    alt: "Thông tin liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh trong điều khoản dịch vụ",
    caption: "Hình minh họa thông tin nhận yêu cầu, bảo hành và xử lý phản hồi qua hotline 0963.953.533 / 0931.156.756.",
    title: "Điều khoản dịch vụ liên hệ Môi Trường Quảng Ninh",
    insertAfter: "<h2>11. Liên Hệ</h2>",
  },
];

function findEnvPath() {
  const found = ENV_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!found) throw new Error(`Không tìm thấy .env trong: ${ENV_CANDIDATES.join(", ")}`);
  return found;
}

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const ENV_PATH = findEnvPath();
const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function request(method, wpPath, { json, raw, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const body = json ? Buffer.from(JSON.stringify(json), "utf8") : raw || null;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: "/wp-json" + wpPath,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "User-Agent": "codex-dieu-khoan-images/1.0",
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
          let parsed = data;
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch {}
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`WP ${res.statusCode} ${wpPath}: ${typeof parsed === "object" ? parsed.message || data : data}`));
            return;
          }
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
    if (body) req.write(body);
    req.end();
  });
}

function liveGet(pathname) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: pathname,
        method: "GET",
        headers: {
          Host: WP_HOST,
          "User-Agent": "codex-dieu-khoan-live-verify/1.0",
          "Cache-Control": "no-cache",
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => resolve({ status: res.statusCode, data }));
      },
    );
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function escAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function countImages(html) {
  return (String(html || "").match(/<img\b/gi) || []).length;
}

function stripTags(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function imageBlock(media, image) {
  return `<figure class="wp-block-image size-large"><img loading="lazy" decoding="async" class="wp-image-${media.id}" src="${escAttr(media.source_url)}" alt="${escAttr(image.alt)}" /><figcaption class="wp-element-caption">${image.caption}</figcaption></figure>`;
}

async function getPage() {
  const res = await request("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`);
  if (res.data.slug !== PAGE_SLUG) {
    throw new Error(`Sai page: expected slug ${PAGE_SLUG}, got ${res.data.slug}`);
  }
  return res.data;
}

async function getExistingMedia(fileName) {
  const stem = fileName.replace(/\.[^.]+$/, "");
  const res = await request("GET", `/wp/v2/media?search=${encodeURIComponent(stem)}&per_page=20&_fields=id,source_url,title,slug`);
  if (!Array.isArray(res.data)) return null;
  return res.data.find((item) => String(item.source_url || "").includes(fileName)) || null;
}

async function uploadMedia(image) {
  const existing = await getExistingMedia(image.fileName);
  if (existing) {
    await request("POST", `/wp/v2/media/${existing.id}`, {
      json: {
        alt_text: image.alt,
        title: image.title,
        caption: image.caption,
        description: "Ảnh WebP đã tối ưu cho trang Điều khoản dịch vụ: crop nhẹ, giảm dung lượng, xóa EXIF cũ.",
      },
    });
    return existing;
  }
  const filePath = path.join(IMAGE_DIR, image.fileName);
  if (!existsSync(filePath)) throw new Error(`Thiếu file ảnh: ${filePath}`);
  const media = await request("POST", "/wp/v2/media", {
    raw: readFileSync(filePath),
    headers: {
      "Content-Type": "image/webp",
      "Content-Disposition": `attachment; filename="${image.fileName}"`,
    },
  });
  await request("POST", `/wp/v2/media/${media.data.id}`, {
    json: {
      alt_text: image.alt,
      title: image.title,
      caption: image.caption,
      description: "Ảnh WebP đã tối ưu cho trang Điều khoản dịch vụ: crop nhẹ, giảm dung lượng, xóa EXIF cũ.",
    },
  });
  return media.data;
}

function removeEmptyFigures(content) {
  return content.replace(
    /<figure class="wp-block-image size-large">\s*<figcaption>([\s\S]*?)<\/figcaption>\s*<\/figure>/i,
    "",
  );
}

function insertAfter(content, marker, block, label) {
  const at = content.indexOf(marker);
  if (at === -1) throw new Error(`Không tìm thấy marker ${label}: ${marker}`);
  const insertAt = at + marker.length;
  return content.slice(0, insertAt) + "\n" + block + "\n" + content.slice(insertAt);
}

function buildContent(raw, mediaByFile) {
  let content = raw;
  const beforeImages = countImages(content);
  const planned = [];
  const alreadyHasAll = IMAGES.every((image) => content.includes(image.fileName));

  if (alreadyHasAll && beforeImages >= 3) {
    return { content, planned, changed: false, beforeImages, afterImages: beforeImages };
  }

  const first = IMAGES[0];
  const firstBlock = imageBlock(mediaByFile.get(first.fileName), first);
  if (content.includes(first.fileName)) {
    planned.push({ action: "skip-existing", fileName: first.fileName });
  } else if (/<figure class="wp-block-image size-large">\s*<figcaption>[\s\S]*?<\/figcaption>\s*<\/figure>/i.test(content)) {
    content = content.replace(
      /<figure class="wp-block-image size-large">\s*<figcaption>[\s\S]*?<\/figcaption>\s*<\/figure>/i,
      firstBlock,
    );
    planned.push({ action: "replace-empty-figure", fileName: first.fileName });
  } else {
    content = insertAfter(content, "</p>", firstBlock, "intro paragraph");
    planned.push({ action: "insert-after-intro", fileName: first.fileName });
  }

  for (const image of IMAGES.slice(1)) {
    if (content.includes(image.fileName)) {
      planned.push({ action: "skip-existing", fileName: image.fileName });
      continue;
    }
    const block = imageBlock(mediaByFile.get(image.fileName), image);
    content = insertAfter(content, image.insertAfter, block, image.fileName);
    planned.push({ action: "insert-after-heading", marker: image.insertAfter, fileName: image.fileName });
  }

  if (!/author\/nguyensonghao/i.test(content)) {
    content = content.replace(/\s+$/, "");
    content += `\n\n<p class="ttcqn-author-nguyen-song-hao ttcqn-author-byline"><strong>Tác giả:</strong> <a href="https://thongtaccongquangninh.com/author/nguyensonghao/" rel="author">Nguyễn Song Hào</a></p>`;
    planned.push({ action: "add-author-byline" });
  }

  content = removeEmptyFigures(content);
  return { content, planned, changed: content !== raw, beforeImages, afterImages: countImages(content) };
}

function verifyHtml(html) {
  const mainMatch = html.match(/<main\b[\s\S]*?<\/main>/i);
  const main = mainMatch ? mainMatch[0] : html;
  const fullH1Count = (html.match(/<h1\b/gi) || []).length;
  const images = [...main.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const contentImages = images.filter((tag) => /dieu-khoan-dich-vu-/.test(tag));
  const missingAlt = contentImages.filter((tag) => !/\salt=(["'])(?:(?!\1).)+\1/i.test(tag));
  return {
    h1Count: (main.match(/<h1\b/gi) || []).length || fullH1Count,
    mainImages: images.length,
    contentImages: contentImages.length,
    missingAlt: missingAlt.length,
    hasAuthor: /author\/nguyensonghao/i.test(main),
    hasBannedWord: /\b(chuyên nghiệp|uy tín|hàng đầu|tận tâm)\b/i.test(stripTags(main)),
  };
}

async function main() {
  mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const page = await getPage();
  const raw = page.content?.raw || "";
  const dryMedia = new Map(
    IMAGES.map((image, index) => [
      image.fileName,
      { id: 900000 + index, source_url: `${PAGE_URL}wp-content/uploads/placeholder/${image.fileName}` },
    ]),
  );

  let mediaByFile = dryMedia;
  if (WRITE) {
    mediaByFile = new Map();
    for (const image of IMAGES) {
      const media = await uploadMedia(image);
      mediaByFile.set(image.fileName, media);
    }
  }

  const built = buildContent(raw, mediaByFile);
  const report = {
    ok: true,
    mode: WRITE ? "write" : "dry-run",
    generatedAt: new Date().toISOString(),
    envPath: ENV_PATH,
    page: {
      id: page.id,
      slug: page.slug,
      link: page.link,
      status: page.status,
      title: page.title?.raw || page.title?.rendered,
    },
    before: { contentLength: raw.length, imageCount: built.beforeImages },
    after: { contentLength: built.content.length, imageCount: built.afterImages },
    changed: built.changed,
    planned: built.planned,
    images: IMAGES.map((image) => ({
      ...image,
      localPath: path.join(IMAGE_DIR, image.fileName),
      uploaded: WRITE ? mediaByFile.get(image.fileName) : null,
    })),
    backupDir: WRITE ? BACKUP_DIR : null,
    liveVerify: null,
  };

  if (WRITE && built.changed) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    writeFileSync(path.join(BACKUP_DIR, `page-${PAGE_ID}-${PAGE_SLUG}.json`), JSON.stringify(page, null, 2), "utf8");
    writeFileSync(path.join(BACKUP_DIR, `page-${PAGE_ID}-${PAGE_SLUG}.html`), raw, "utf8");
    await request("POST", `/wp/v2/pages/${PAGE_ID}`, { json: { content: built.content } });
    const live = await liveGet(`/dieu-khoan-dich-vu/?nowprocket=1&codex=dieu-khoan-images-${Date.now()}`);
    report.liveVerify = { status: live.status, ...verifyHtml(live.data) };
    const day = new Date().toISOString().slice(0, 10);
    const time = new Date().toTimeString().slice(0, 5);
    appendFileSync(
      CSV_PATH,
      `\n${day},${time},FIX-DIEU-KHOAN-IMAGES-2026-06-27,seo_image,/dieu-khoan-dich-vu/ thêm 3 ảnh nội dung SEO,${PAGE_URL},dieu-khoan-dich-vu,done,low,,,,,backup+upload+insert 3 WebP+author byline,${path.relative(PROJECT, REPORT_PATH)};${path.relative(PROJECT, BACKUP_DIR)},,Run audit_unique_wp_images.py --no-hash,live contentImages=${report.liveVerify.contentImages}; missingAlt=${report.liveVerify.missingAlt},NOT_REQUIRED,,,,,`,
      "utf8",
    );
  } else if (WRITE && !built.changed) {
    const live = await liveGet(`/dieu-khoan-dich-vu/?nowprocket=1&codex=dieu-khoan-images-${Date.now()}`);
    report.liveVerify = { status: live.status, ...verifyHtml(live.data) };
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({
    reportPath: REPORT_PATH,
    mode: report.mode,
    changed: report.changed,
    before: report.before,
    after: report.after,
    planned: report.planned,
    liveVerify: report.liveVerify,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
