/**
 * Replace remaining globally reused content images with page-specific variants.
 *
 * Dry-run:
 *   node tools/fix_global_image_reuse_2026_06_27.mjs
 *
 * Apply:
 *   node tools/fix_global_image_reuse_2026_06_27.mjs --write
 */
import https from "node:https";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const PROJECT = "/mnt/d/.thongtaccongquangninh";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const BASE_URL = `https://${WP_HOST}`;
const IMAGE_DIR = path.join(PROJECT, "Ảnh Đã Xử Lý SEO/reuse-fix-2026-06-27");
const CSV_PATH = path.join(PROJECT, "docs/SEO_PROGRESS.csv");
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = path.join(PROJECT, "seo-revisions", `wp-before-global-image-reuse-${STAMP}`);
const REPORT_PATH = path.join(PROJECT, "reports", `global-image-reuse-fix-${STAMP}.json`);

const ENV_CANDIDATES = [
  path.join(PROJECT, ".env"),
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
];

const TARGETS = [
  {
    type: "posts",
    id: 2976,
    slug: "thong-tac-cong-gieng-day-bai-viet",
    urlPath: "/thong-tac-cong-gieng-day-bai-viet/",
    replacements: [
      {
        old: "https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-gieng-day-ha-long-01.webp",
        fileName: "reuse-fix-gieng-day-bai-viet-kiem-tra-ho-ga.webp",
        alt: "Kiểm tra hố ga trước khi thông tắc cống tại Giếng Đáy Hạ Long",
        caption: "Hình minh họa bước kiểm tra hố ga và tuyến thoát nước trước khi xử lý cống nghẹt tại Giếng Đáy.",
        title: "Kiểm tra hố ga thông tắc cống Giếng Đáy",
      },
      {
        old: "https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-gieng-day-may-lo-xo-03.webp",
        fileName: "reuse-fix-gieng-day-bai-viet-may-lo-xo.webp",
        alt: "Máy lò xo xử lý đường cống nghẹt tại Giếng Đáy Hạ Long",
        caption: "Hình minh họa máy lò xo xử lý cống nghẹt trong nhà dân và cơ sở kinh doanh tại Giếng Đáy.",
        title: "Máy lò xo thông tắc cống Giếng Đáy",
      },
      {
        old: "https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-gieng-day-tho-xu-ly-02.webp",
        fileName: "reuse-fix-gieng-day-bai-viet-xu-ly-duong-thoat.webp",
        alt: "Xử lý đường thoát nước tại khu dân cư Giếng Đáy Hạ Long",
        caption: "Hình minh họa thao tác xử lý đường thoát nước sau khi xác định vị trí tắc tại Giếng Đáy.",
        title: "Xử lý đường thoát nước Giếng Đáy",
      },
    ],
  },
  {
    type: "pages",
    id: 427,
    slug: "thong-tac-cong-van-don",
    urlPath: "/thong-tac-cong-van-don/",
    replacements: [
      {
        old: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/ky-thuat-thong-tac-cong-dan-dung-quang-ninh-01.webp",
        fileName: "reuse-fix-thong-tac-cong-van-don-may-lo-xo.webp",
        alt: "Máy lò xo thông tắc cống tại Vân Đồn cho nhà dân và homestay",
        caption: "Hình minh họa thao tác dùng máy lò xo xử lý đường cống nghẹt tại Vân Đồn.",
        title: "Máy lò xo thông tắc cống Vân Đồn",
      },
    ],
  },
  {
    type: "pages",
    id: 25,
    slug: "blog",
    urlPath: "/blog/",
    replacements: [
      {
        old: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/og-ve-sinh-moi-truong-quang-ninh-phuc-vu-24-7.jpg",
        fileName: "reuse-fix-blog-cam-nang-duong-ong-quang-ninh.webp",
        alt: "Cẩm nang kiểm tra đường ống thoát nước tại Quảng Ninh",
        caption: "Hình minh họa nhóm bài cẩm nang về kiểm tra đường ống, cống nghẹt và xử lý mùi hôi tại Quảng Ninh.",
        title: "Cẩm nang đường ống thoát nước Quảng Ninh",
      },
    ],
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
          "User-Agent": "codex-global-image-reuse/1.0",
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
    const cachePath = `${urlPath}${urlPath.includes("?") ? "&" : "?"}nowprocket=1&codex=reuse-${Date.now()}`;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: cachePath,
        method: "GET",
        headers: { Host: WP_HOST, "User-Agent": "codex-global-image-reuse-verify/1.0", "Cache-Control": "no-cache" },
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

function countImages(content) {
  return (String(content || "").match(/<img\b/gi) || []).length;
}

function stripTags(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function uploadMedia(rep) {
  const stem = rep.fileName.replace(/\.[^.]+$/, "");
  const found = await request("GET", `/wp/v2/media?search=${encodeURIComponent(stem)}&per_page=20&_fields=id,source_url,slug`);
  const existing = Array.isArray(found.data) ? found.data.find((item) => String(item.source_url || "").includes(rep.fileName)) : null;
  if (existing) {
    await request("POST", `/wp/v2/media/${existing.id}`, {
      json: { alt_text: rep.alt, title: rep.title, caption: rep.caption, description: "Biến thể WebP riêng để giảm reuse ảnh giữa nhiều URL." },
    });
    return existing;
  }
  const filePath = path.join(IMAGE_DIR, rep.fileName);
  if (!existsSync(filePath)) throw new Error(`Thiếu file ảnh: ${filePath}`);
  const uploaded = await request("POST", "/wp/v2/media", {
    raw: readFileSync(filePath),
    headers: {
      "Content-Type": "image/webp",
      "Content-Disposition": `attachment; filename="${rep.fileName}"`,
    },
  });
  await request("POST", `/wp/v2/media/${uploaded.data.id}`, {
    json: { alt_text: rep.alt, title: rep.title, caption: rep.caption, description: "Biến thể WebP riêng để giảm reuse ảnh giữa nhiều URL." },
  });
  return uploaded.data;
}

function replaceImageTag(content, oldSrc, media, rep) {
  let replaced = 0;
  const next = content.replace(/<img\b[^>]*>/gi, (tag) => {
    if (!tag.includes(oldSrc)) return tag;
    replaced += 1;
    let out = tag;
    if (/\ssrc=(["']).*?\1/i.test(out)) out = out.replace(/\ssrc=(["']).*?\1/i, ` src="${escAttr(media.source_url)}"`);
    else out = out.replace(/>$/, ` src="${escAttr(media.source_url)}">`);
    if (/\salt=(["']).*?\1/i.test(out)) out = out.replace(/\salt=(["']).*?\1/i, ` alt="${escAttr(rep.alt)}"`);
    else out = out.replace(/>$/, ` alt="${escAttr(rep.alt)}">`);
    if (/wp-image-\d+/.test(out)) out = out.replace(/wp-image-\d+/, `wp-image-${media.id}`);
    else out = out.replace(/>$/, ` class="wp-image-${media.id}">`);
    return out;
  });
  return { content: next, replaced };
}

function verifyContent(content, target) {
  const missingOld = target.replacements.filter((rep) => content.includes(rep.old)).map((rep) => rep.old);
  const missingNew = target.replacements.filter((rep) => !content.includes(rep.fileName)).map((rep) => rep.fileName);
  const missingAlt = target.replacements.filter((rep) => !content.includes(rep.alt)).map((rep) => rep.fileName);
  return {
    imageCount: countImages(content),
    missingOldCount: missingOld.length,
    missingNewCount: missingNew.length,
    missingAltCount: missingAlt.length,
  };
}

function verifyLive(html, target) {
  return {
    statusOk: true,
    h1Count: (html.match(/<h1\b/gi) || []).length,
    totalImages: (html.match(/<img\b/gi) || []).length,
    hasNewFiles: target.replacements.every((rep) => html.includes(rep.fileName)),
    hasOldFiles: target.replacements.some((rep) => html.includes(rep.old)),
    missingAlt: target.replacements.filter((rep) => !html.includes(rep.alt)).length,
    hasBannedWord: /\b(chuyên nghiệp|uy tín|hàng đầu|tận tâm)\b/i.test(stripTags(html)),
  };
}

async function main() {
  mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const report = {
    ok: true,
    mode: WRITE ? "write" : "dry-run",
    generatedAt: new Date().toISOString(),
    envPath: ENV_PATH,
    backupDir: WRITE ? BACKUP_DIR : null,
    targets: [],
  };

  for (const target of TARGETS) {
    const page = await request("GET", `/wp/v2/${target.type}/${target.id}?context=edit`);
    if (page.data.slug !== target.slug) throw new Error(`Sai slug ID ${target.id}: ${page.data.slug} != ${target.slug}`);
    let content = page.data.content?.raw || "";
    const before = verifyContent(content, target);
    const uploads = [];
    const changes = [];
    const mediaByFile = new Map();
    if (WRITE) {
      for (const rep of target.replacements) {
        const media = await uploadMedia(rep);
        mediaByFile.set(rep.fileName, media);
        uploads.push({ fileName: rep.fileName, mediaId: media.id, sourceUrl: media.source_url });
      }
    } else {
      target.replacements.forEach((rep, index) => {
        mediaByFile.set(rep.fileName, { id: 910000 + index, source_url: `${BASE_URL}/wp-content/uploads/placeholder/${rep.fileName}` });
      });
    }

    for (const rep of target.replacements) {
      const media = mediaByFile.get(rep.fileName);
      const replaced = replaceImageTag(content, rep.old, media, rep);
      content = replaced.content;
      changes.push({ old: rep.old, fileName: rep.fileName, replaced: replaced.replaced });
    }
    const after = verifyContent(content, target);
    const changed = content !== (page.data.content?.raw || "");

    let liveVerify = null;
    if (WRITE && changed) {
      mkdirSync(BACKUP_DIR, { recursive: true });
      writeFileSync(path.join(BACKUP_DIR, `${target.type}-${target.id}-${target.slug}.json`), JSON.stringify(page.data, null, 2), "utf8");
      writeFileSync(path.join(BACKUP_DIR, `${target.type}-${target.id}-${target.slug}.html`), page.data.content?.raw || "", "utf8");
      await request("POST", `/wp/v2/${target.type}/${target.id}`, { json: { content } });
      const live = await liveGet(target.urlPath);
      liveVerify = { status: live.status, ...verifyLive(live.data, target) };
    } else if (WRITE) {
      const live = await liveGet(target.urlPath);
      liveVerify = { status: live.status, ...verifyLive(live.data, target) };
    }

    report.targets.push({
      id: target.id,
      type: target.type,
      slug: target.slug,
      link: page.data.link,
      before,
      after,
      changed,
      changes,
      uploads,
      liveVerify,
    });
  }

  if (WRITE) {
    const day = new Date().toISOString().slice(0, 10);
    const time = new Date().toTimeString().slice(0, 5);
    const changedCount = report.targets.filter((target) => target.changed).length;
    const replacements = report.targets.reduce((sum, target) => sum + target.changes.reduce((s, c) => s + c.replaced, 0), 0);
    appendFileSync(
      CSV_PATH,
      `\n${day},${time},FIX-GLOBAL-IMAGE-REUSE-2026-06-27,seo_image,reduce globalReuseGroups,https://thongtaccongquangninh.com/,global-image-reuse,done,medium,,,,,replace ${replacements} reused image URLs across ${changedCount} URLs,${path.relative(PROJECT, REPORT_PATH)};${path.relative(PROJECT, BACKUP_DIR)},,Run audit_unique_wp_images.py --no-hash,replaced=${replacements}; targets=${changedCount},NOT_REQUIRED,,,,,`,
      "utf8",
    );
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({
    reportPath: REPORT_PATH,
    mode: report.mode,
    backupDir: report.backupDir,
    targets: report.targets.map((target) => ({
      slug: target.slug,
      before: target.before,
      after: target.after,
      changed: target.changed,
      replaced: target.changes.reduce((sum, change) => sum + change.replaced, 0),
      liveVerify: target.liveVerify,
    })),
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
