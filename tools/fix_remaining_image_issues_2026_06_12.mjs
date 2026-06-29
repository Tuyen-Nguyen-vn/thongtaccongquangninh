/**
 * Fix remaining live image SEO audit issues from 2026-06-12.
 *
 * Targets:
 * - /dieu-khoan-dich-vu/ page 2445: add 3 contextual service images.
 * - /thong-tac-cong-bai-chay/ post 2054: replace one pixel-duplicate image.
 *
 * Usage:
 *   node tools/fix_remaining_image_issues_2026_06_12.mjs
 *   node tools/fix_remaining_image_issues_2026_06_12.mjs --write
 */
import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const WRITE = process.argv.includes("--write");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const BACKUP_DIR = "D:\\.thongtaccongquangninh\\backups\\live-audit-fix-2026-06-12";

const LEGAL_PAGE_ID = 2445;
const BAI_CHAY_POST_ID = 2054;

const IMG_MAY_LO_XO =
  "https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-gieng-day-may-lo-xo-03.webp";
const IMG_KIEM_TRA =
  "https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-tuan-chau-kiem-tra-03.webp";
const IMG_NHA_HANG =
  "https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-bai-chay-xu-ly-nha-hang-03-1.webp";
const IMG_BAI_CHAY_DUP =
  "https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-bai-chay-kiem-tra-ho-ga-02-1.webp";
const IMG_BAI_CHAY_REPLACEMENT =
  "https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-gieng-day-tho-xu-ly-02.webp";

function parseEnv(p) {
  const env = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function wpRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: "/wp-json" + path,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "User-Agent": "ttcqn-fix-image-audit-2026-06-12/1.0",
        ...(bodyBuf
          ? {
              "Content-Type": "application/json",
              "Content-Length": bodyBuf.length,
            }
          : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function figure(src, alt, caption) {
  return `<figure class="wp-block-image size-large"><img src="${src}" alt="${alt}" loading="lazy"><figcaption>${caption}</figcaption></figure>`;
}

function countImages(html) {
  return (html.match(/<img\b/gi) || []).length;
}

function patchLegalPage(raw) {
  let content = raw;
  const firstFigure = figure(
    IMG_MAY_LO_XO,
    "Thợ dùng máy lò xo thông tắc cống tại nhà dân ở Quảng Ninh",
    "Máy lò xo được dùng cho các ca thông tắc cống tại nhà dân, hạn chế đục phá khi chưa cần thiết."
  );
  const secondFigure = figure(
    IMG_KIEM_TRA,
    "Kiểm tra đường ống và hố ga trước khi thông tắc cống tại Quảng Ninh",
    "Kiểm tra đường ống, hố ga và điểm thoát nước trước khi báo phương án xử lý."
  );
  const thirdFigure = figure(
    IMG_NHA_HANG,
    "Xử lý cống bếp dầu mỡ cho nhà hàng tại Quảng Ninh",
    "Cống bếp nhà hàng, khách sạn cần xử lý đúng nguyên nhân dầu mỡ và cặn bám."
  );

  const intro =
    "<p>Khi sử dụng dịch vụ hoặc liên hệ đặt lịch qua website <strong>thongtaccongquangninh.com</strong>, bạn đồng ý với các điều khoản dưới đây. Vui lòng đọc kỹ trước khi đặt dịch vụ.</p>";
  const scope =
    "<p>Dịch vụ được thực hiện tại nhà dân, chung cư, văn phòng, nhà hàng, khách sạn, khu công nghiệp và các công trình dân dụng — trong phạm vi địa bàn phục vụ đã công bố.</p>";
  const contactHeading = "<h2>11. Liên Hệ</h2>";

  if (!content.includes(IMG_MAY_LO_XO)) {
    content = content.replace(intro, `${intro}\n${firstFigure}`);
  }
  if (!content.includes(IMG_KIEM_TRA)) {
    content = content.replace(scope, `${scope}\n${secondFigure}`);
  }
  if (!content.includes(IMG_NHA_HANG)) {
    content = content.replace(contactHeading, `${thirdFigure}\n${contactHeading}`);
  }
  return content;
}

function patchBaiChayPost(raw) {
  const replacement = figure(
    IMG_BAI_CHAY_REPLACEMENT,
    "Thợ kiểm tra đường ống thoát nước tại Hạ Long trước khi thông tắc cống Bãi Cháy",
    "Kiểm tra đường ống và điểm thoát nước tại Hạ Long trước khi xử lý cống tắc ở Bãi Cháy."
  );
  const pattern =
    /<figure class="wp-block-image size-full"><img src="https:\/\/thongtaccongquangninh\.com\/wp-content\/uploads\/2026\/06\/thong-tac-cong-bai-chay-kiem-tra-ho-ga-02-1\.webp"[\s\S]*?<\/figure>/;
  return raw.replace(pattern, replacement);
}

async function fetchEntity(type, id) {
  const path = `/wp/v2/${type}/${id}?context=edit`;
  const res = await wpRequest("GET", path);
  if (res.status !== 200) throw new Error(`GET ${type}/${id} failed: ${res.status}`);
  return res.data;
}

async function updateEntity(type, id, content) {
  const res = await wpRequest("POST", `/wp/v2/${type}/${id}`, { content });
  if (res.status !== 200) {
    throw new Error(`POST ${type}/${id} failed: ${res.status} ${JSON.stringify(res.data).slice(0, 300)}`);
  }
  return res.data;
}

async function main() {
  console.log(`=== Fix remaining image issues (${WRITE ? "WRITE" : "DRY-RUN"}) ===`);
  mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  const legal = await fetchEntity("pages", LEGAL_PAGE_ID);
  const legalBefore = legal.content?.raw || "";
  const legalAfter = patchLegalPage(legalBefore);
  writeFileSync(`${BACKUP_DIR}\\page-2445-before-imagefix-${stamp}.json`, JSON.stringify(legal, null, 2), "utf8");
  writeFileSync(`${BACKUP_DIR}\\page-2445-after-imagefix-preview.html`, legalAfter, "utf8");

  const baiChay = await fetchEntity("posts", BAI_CHAY_POST_ID);
  const baiChayBefore = baiChay.content?.raw || "";
  const baiChayAfter = patchBaiChayPost(baiChayBefore);
  writeFileSync(`${BACKUP_DIR}\\post-2054-before-imagefix-${stamp}.json`, JSON.stringify(baiChay, null, 2), "utf8");
  writeFileSync(`${BACKUP_DIR}\\post-2054-after-imagefix-preview.html`, baiChayAfter, "utf8");

  const checks = {
    legal: {
      beforeImages: countImages(legalBefore),
      afterImages: countImages(legalAfter),
      insertedMayLoXo: legalAfter.includes(IMG_MAY_LO_XO),
      insertedKiemTra: legalAfter.includes(IMG_KIEM_TRA),
      insertedNhaHang: legalAfter.includes(IMG_NHA_HANG),
      changed: legalAfter !== legalBefore,
    },
    baiChay: {
      beforeImages: countImages(baiChayBefore),
      afterImages: countImages(baiChayAfter),
      oldDuplicatePresent: baiChayAfter.includes(IMG_BAI_CHAY_DUP),
      replacementPresent: baiChayAfter.includes(IMG_BAI_CHAY_REPLACEMENT),
      changed: baiChayAfter !== baiChayBefore,
    },
  };
  console.log(JSON.stringify(checks, null, 2));

  if (!WRITE) {
    console.log("[DRY-RUN] Preview files written under backups/live-audit-fix-2026-06-12");
    return;
  }

  if (!checks.legal.changed && !checks.baiChay.changed) {
    console.log("Nothing to update.");
    return;
  }

  if (checks.legal.changed) {
    const updated = await updateEntity("pages", LEGAL_PAGE_ID, legalAfter);
    console.log(`Updated legal page: ${updated.link}`);
  }
  if (checks.baiChay.changed) {
    const updated = await updateEntity("posts", BAI_CHAY_POST_ID, baiChayAfter);
    console.log(`Updated Bai Chay post: ${updated.link}`);
  }
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
