/**
 * Fix remaining image duplicate issues detected only by hash/pixel audit.
 *
 * Dry-run:
 *   node tools/fix_image_hash_duplicates_2026_06_27.mjs
 *
 * Apply:
 *   node tools/fix_image_hash_duplicates_2026_06_27.mjs --write
 */
import https from "node:https";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const PROJECT = "/mnt/d/.thongtaccongquangninh";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const IMAGE_DIR = path.join(PROJECT, "Ảnh Đã Xử Lý SEO/hash-fix-2026-06-27");
const CSV_PATH = path.join(PROJECT, "docs/SEO_PROGRESS.csv");
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = path.join(PROJECT, "seo-revisions", `wp-before-image-hash-duplicates-${STAMP}`);
const REPORT_PATH = path.join(PROJECT, "reports", `image-hash-duplicates-fix-${STAMP}.json`);
const ENV_CANDIDATES = [
  path.join(PROJECT, ".env"),
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
];

const TARGETS = [
  {
    type: "posts",
    id: 2054,
    slug: "thong-tac-cong-bai-chay",
    urlPath: "/thong-tac-cong-bai-chay/",
    replacement: {
      old: "https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-bai-chay-kiem-tra-ho-ga-02-7.webp",
      fileName: "hash-fix-bai-chay-kiem-tra-ho-ga-rieng.webp",
      alt: "Kiểm tra hố ga khi thông tắc cống tại Bãi Cháy Hạ Long",
      caption: "Hình minh họa bước kiểm tra hố ga và đường thoát nước tại khu nhà hàng, khách sạn Bãi Cháy.",
      title: "Kiểm tra hố ga thông tắc cống Bãi Cháy",
    },
  },
  {
    type: "pages",
    id: 282,
    slug: "chinh-sach-bao-mat",
    urlPath: "/chinh-sach-bao-mat/",
    replacement: {
      old: "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/doi-ngu-ky-thuat-moi-truong-do-thi-quang-ninh-san-sang-phuc-vu-24-7.webp",
      fileName: "hash-fix-chinh-sach-bao-mat-doi-ky-thuat.webp",
      alt: "Đội kỹ thuật tiếp nhận yêu cầu bảo mật thông tin khách hàng tại Quảng Ninh",
      caption: "Hình minh họa quy trình tiếp nhận yêu cầu và bảo mật thông tin khách hàng qua hotline.",
      title: "Đội kỹ thuật tiếp nhận yêu cầu bảo mật thông tin",
    },
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
          "User-Agent": "codex-image-hash-duplicates/1.0",
          ...(json ? { "Content-Type": "application/json" } : {}),
          ...(body ? { "Content-Length": body.length } : {}),
          ...headers,
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          let parsed = data;
          try { parsed = data ? JSON.parse(data.replace(/^\uFEFF/, "")) : {}; } catch {}
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
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: `${urlPath}?nowprocket=1&codex=hash-fix-${Date.now()}`,
        method: "GET",
        headers: { Host: WP_HOST, "User-Agent": "codex-image-hash-duplicates-verify/1.0", "Cache-Control": "no-cache" },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => resolve({ status: res.statusCode, data }));
      },
    );
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function escAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

async function uploadMedia(rep) {
  const stem = rep.fileName.replace(/\.[^.]+$/, "");
  const found = await request("GET", `/wp/v2/media?search=${encodeURIComponent(stem)}&per_page=20&_fields=id,source_url,slug`);
  const existing = Array.isArray(found.data) ? found.data.find((item) => String(item.source_url || "").includes(rep.fileName)) : null;
  if (existing) {
    await request("POST", `/wp/v2/media/${existing.id}`, {
      json: { alt_text: rep.alt, title: rep.title, caption: rep.caption, description: "Biến thể WebP riêng để xử lý trùng ảnh theo hash/pixel." },
    });
    return existing;
  }
  const filePath = path.join(IMAGE_DIR, rep.fileName);
  if (!existsSync(filePath)) throw new Error(`Thiếu file ảnh: ${filePath}`);
  const uploaded = await request("POST", "/wp/v2/media", {
    raw: readFileSync(filePath),
    headers: { "Content-Type": "image/webp", "Content-Disposition": `attachment; filename="${rep.fileName}"` },
  });
  await request("POST", `/wp/v2/media/${uploaded.data.id}`, {
    json: { alt_text: rep.alt, title: rep.title, caption: rep.caption, description: "Biến thể WebP riêng để xử lý trùng ảnh theo hash/pixel." },
  });
  return uploaded.data;
}

function replaceImage(content, rep, media) {
  let replaced = 0;
  const next = content.replace(/<img\b[^>]*>/gi, (tag) => {
    if (!tag.includes(rep.old)) return tag;
    replaced += 1;
    let out = tag.replace(/\ssrc=(["']).*?\1/i, ` src="${escAttr(media.source_url)}"`);
    if (/\salt=(["']).*?\1/i.test(out)) out = out.replace(/\salt=(["']).*?\1/i, ` alt="${escAttr(rep.alt)}"`);
    else out = out.replace(/>$/, ` alt="${escAttr(rep.alt)}">`);
    if (/wp-image-\d+/.test(out)) out = out.replace(/wp-image-\d+/, `wp-image-${media.id}`);
    else out = out.replace(/>$/, ` class="wp-image-${media.id}">`);
    return out;
  });
  return { content: next, replaced };
}

function stripTags(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function main() {
  mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const report = { ok: true, mode: WRITE ? "write" : "dry-run", generatedAt: new Date().toISOString(), backupDir: WRITE ? BACKUP_DIR : null, targets: [] };
  for (const target of TARGETS) {
    const page = await request("GET", `/wp/v2/${target.type}/${target.id}?context=edit`);
    if (page.data.slug !== target.slug) throw new Error(`Sai slug ${target.id}: ${page.data.slug} != ${target.slug}`);
    const raw = page.data.content?.raw || "";
    const media = WRITE ? await uploadMedia(target.replacement) : { id: 920000, source_url: `https://${WP_HOST}/wp-content/uploads/placeholder/${target.replacement.fileName}` };
    const next = replaceImage(raw, target.replacement, media);
    const changed = next.content !== raw;
    let liveVerify = null;
    if (WRITE && changed) {
      mkdirSync(BACKUP_DIR, { recursive: true });
      writeFileSync(path.join(BACKUP_DIR, `${target.type}-${target.id}-${target.slug}.json`), JSON.stringify(page.data, null, 2), "utf8");
      writeFileSync(path.join(BACKUP_DIR, `${target.type}-${target.id}-${target.slug}.html`), raw, "utf8");
      await request("POST", `/wp/v2/${target.type}/${target.id}`, { json: { content: next.content } });
      const live = await liveGet(target.urlPath);
      const main = (live.data.match(/<main\b[\s\S]*?<\/main>/i) || [live.data])[0];
      liveVerify = {
        status: live.status,
        mainHasNew: main.includes(target.replacement.fileName),
        mainHasOld: main.includes(target.replacement.old),
        missingAlt: main.includes(target.replacement.alt) ? 0 : 1,
        h1Count: (live.data.match(/<h1\b/gi) || []).length,
        hasBannedWord: /\b(chuyên nghiệp|uy tín|hàng đầu|tận tâm)\b/i.test(stripTags(main)),
      };
    }
    report.targets.push({
      id: target.id,
      type: target.type,
      slug: target.slug,
      link: page.data.link,
      changed,
      replaced: next.replaced,
      beforeHasOld: raw.includes(target.replacement.old),
      afterHasOld: next.content.includes(target.replacement.old),
      afterHasNew: next.content.includes(target.replacement.fileName),
      media: WRITE ? { id: media.id, source_url: media.source_url } : null,
      liveVerify,
    });
  }
  if (WRITE) {
    const day = new Date().toISOString().slice(0, 10);
    const time = new Date().toTimeString().slice(0, 5);
    const replacements = report.targets.reduce((sum, target) => sum + target.replaced, 0);
    appendFileSync(
      CSV_PATH,
      `\n${day},${time},FIX-IMAGE-HASH-DUPLICATES-2026-06-27,seo_image,fix image hash duplicate audit,https://thongtaccongquangninh.com/,image-hash-duplicates,done,medium,,,,,replace ${replacements} hash/pixel duplicate images,${path.relative(PROJECT, REPORT_PATH)};${path.relative(PROJECT, BACKUP_DIR)},,Run audit_unique_wp_images.py,replaced=${replacements},NOT_REQUIRED,,,,,`,
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
      changed: target.changed,
      replaced: target.replaced,
      afterHasOld: target.afterHasOld,
      afterHasNew: target.afterHasNew,
      liveVerify: target.liveVerify,
    })),
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
