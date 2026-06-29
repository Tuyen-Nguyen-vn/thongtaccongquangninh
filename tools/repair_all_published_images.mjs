/**
 * tools/repair_all_published_images.mjs
 *
 * Script khẩn cấp sửa lỗi hiển thị hình ảnh (lỗi !<a href="...">) cho 17 bài viết mới xuất bản.
 * Chạy:
 *   node tools/repair_all_published_images.mjs            # Chạy thật cập nhật live
 *   node tools/repair_all_published_images.mjs --dry-run  # Chạy thử kiểm tra HTML, không lưu live
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { homedir } from "node:os";
import { markdownToHtml } from "./lib/markdown_to_html.mjs";
import { submitIndexingUrl } from "./lib/google_indexing_api.mjs";

const PROJECT = "D:\\.thongtaccongquangninh";
const SITE = "https://thongtaccongquangninh.com";
const LOG_DIR = join(PROJECT, "logs");
const REPORTS_DIR = join(PROJECT, "reports");
const DRAFTS_DIR = join(PROJECT, "content-drafts");

// ── Helpers ─────────────────────────────────────────────────────────────────

function findEnvPath() {
  const localEnv = join(PROJECT, ".env");
  if (existsSync(localEnv)) return localEnv;
  const homeDir = homedir();
  const docEnv = join(homeDir, "Documents", "Codex", "2026-04-28", "chatgpt-apps-plugin-chatgpt-apps-openai", ".env");
  if (existsSync(docEnv)) return docEnv;
  return localEnv;
}

const ENV_PATH = findEnvPath();

function parseEnv(path) {
  const env = {};
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* fallback */ }
  return env;
}

function field(md, label) {
  const m = md.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
  return m ? m[1].trim() : "";
}

async function wp(baseUrl, auth, path, init = {}) {
  const res = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex Image Repair Pipeline",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = text;
  }
  if (!res.ok) {
    const msg = typeof payload === "object" ? payload.message ?? text : payload;
    throw new Error(`WP ${res.status} ${path}: ${msg}`);
  }
  return payload;
}

async function findWpPageSmart(baseUrl, auth, slug, logWpId) {
  if (logWpId) {
    for (const type of ["posts", "pages"]) {
      try {
        const p = await wp(baseUrl, auth, `/wp/v2/${type}/${logWpId}?context=edit`);
        if (p && p.id) return { ...p, _type: type };
      } catch { /* thử tiếp */ }
    }
  }
  for (const type of ["posts", "pages"]) {
    try {
      const r = await wp(baseUrl, auth, `/wp/v2/${type}?slug=${encodeURIComponent(slug)}&status=any&context=edit`);
      if (Array.isArray(r) && r.length > 0) return { ...r[0], _type: type };
    } catch { /* thử tiếp */ }
  }
  for (const suffix of ["-2", "-3", "-4"]) {
    const slugWithSuffix = `${slug}${suffix}`;
    for (const type of ["posts", "pages"]) {
      try {
        const r = await wp(baseUrl, auth, `/wp/v2/${type}?slug=${encodeURIComponent(slugWithSuffix)}&status=any&context=edit`);
        if (Array.isArray(r) && r.length > 0) return { ...r[0], _type: type };
      } catch { /* thử tiếp */ }
    }
  }
  return null;
}

async function submitGoogleIndex(url) {
  try {
    const res = await submitIndexingUrl(PROJECT, url);
    return { ok: res.ok, status: res.status ?? 0, body: JSON.stringify(res.payload ?? res) };
  } catch (err) {
    return { ok: false, status: 0, body: err.message };
  }
}

// Tìm file markdown đệ quy trong thư mục content-drafts/
function findMdFile(dir, slug) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findMdFile(fullPath, slug);
      if (found) return found;
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      try {
        const content = readFileSync(fullPath, "utf8");
        const slugMatch = content.match(/^Slug:\s*(.+)$/m);
        if (slugMatch && slugMatch[1].trim() === slug) {
          return fullPath;
        }
        if (entry.name.includes(slug)) {
          return fullPath;
        }
      } catch {}
    }
  }
  return null;
}

// Tìm file report push ảnh
function findPushFile(reportsDir, slug) {
  const files = readdirSync(reportsDir).filter(f => f.startsWith("wp-push-") && f.endsWith(".json"));
  for (const file of files) {
    if (file.includes(slug)) {
      return join(reportsDir, file);
    }
  }
  return null;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log(`=== PIPELINE SỬA LỖI HÌNH ẢNH HÀNG LOẠT ===`);
  if (dryRun) {
    console.log(`[DRY-RUN] Đang chạy ở chế độ KIỂM TRA (không lưu lên WordPress live)\n`);
  } else {
    console.log(`[LIVE-RUN] Đang chạy ở chế độ CẬP NHẬT TRỰC TIẾP LÊN LIVE SITE!\n`);
  }

  // Quét toàn bộ file publish log của ngày 2026-05-21 trong logs
  const logFiles = readdirSync(LOG_DIR).filter(
    (f) => f.startsWith("publish-") && f.endsWith("-2026-05-21.json")
  );

  if (logFiles.length === 0) {
    console.error(`Không tìm thấy file publish log nào khớp với mẫu logs/publish-*-2026-05-21.json`);
    process.exit(1);
  }

  console.log(`Tìm thấy ${logFiles.length} bài viết cần kiểm tra/sửa lỗi từ log.\n`);

  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL ?? SITE;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  let successCount = 0;
  let errorCount = 0;

  for (const logFile of logFiles) {
    const logPath = join(LOG_DIR, logFile);
    let logData;
    try {
      logData = JSON.parse(readFileSync(logPath, "utf8"));
    } catch (err) {
      console.error(`❌ Lỗi đọc log file ${logFile}: ${err.message}`);
      errorCount++;
      continue;
    }

    const { slug, wpId } = logData;
    if (!slug || !wpId) {
      console.error(`❌ Log file ${logFile} thiếu slug hoặc wpId.`);
      errorCount++;
      continue;
    }

    console.log(`\n--------------------------------------------------`);
    console.log(`📝 Đang xử lý: [${slug}] (ID: ${wpId})`);

    // 1. Tìm file draft Markdown gốc
    const draftPath = findMdFile(DRAFTS_DIR, slug);
    if (!draftPath) {
      console.error(`   ❌ Không tìm thấy file draft Markdown cho slug [${slug}] trong thư mục ${DRAFTS_DIR}`);
      errorCount++;
      continue;
    }
    console.log(`   👉 Tìm thấy draft: ${basename(draftPath)}`);

    // 2. Tìm bài viết thực tế trên live site trước
    let existing = null;
    try {
      console.log(`   🔍 Đang tìm bài viết thực tế trên live qua slug [${slug}] và ID [${wpId}]...`);
      existing = await findWpPageSmart(baseUrl, auth, slug, wpId);
    } catch (err) {
      console.warn(`   ⚠️ Cảnh báo: Lỗi khi tìm bài viết trên live: ${err.message}`);
    }

    if (!existing) {
      console.error(`   ❌ Lỗi: Không tìm thấy bài viết trên live site qua slug [${slug}] hoặc ID [${wpId}]`);
      errorCount++;
      continue;
    }
    
    const wpType = existing._type; // 'posts' hoặc 'pages'
    const actualWpId = existing.id;

    // 3. Tìm file report push ảnh
    const pushPath = findPushFile(REPORTS_DIR, slug);
    let liveImages = [];
    if (!pushPath) {
      console.warn(`   ⚠️ Cảnh báo: Không tìm thấy file push ảnh (wp-push-*.json) cho slug [${slug}]. Tiến hành fallback sử dụng link từ trang live hiện tại.`);
    } else {
      console.log(`   👉 Tìm thấy push data: ${basename(pushPath)}`);
      try {
        const pushData = JSON.parse(readFileSync(pushPath, "utf8"));
        liveImages = pushData.images || [];
        console.log(`   📸 Số ảnh đã upload live trong push data: ${liveImages.length}`);
      } catch (err) {
        console.error(`   ❌ Lỗi đọc push data ${pushPath}: ${err.message}`);
      }
    }

    // Nếu không có ảnh từ push data, trích xuất ảnh live từ nội dung HTML hiện tại trên trang live!
    if (liveImages.length === 0 && existing && existing.content && existing.content.rendered) {
      const existingHtml = existing.content.rendered;
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      const liveUrls = [];
      while ((match = imgRegex.exec(existingHtml))) {
        liveUrls.push(match[1]);
      }
      if (liveUrls.length > 0) {
        console.log(`   ℹ️ Fallback thành công: Tìm thấy ${liveUrls.length} ảnh đã có sẵn trên live site để ánh xạ.`);
        liveImages = liveUrls.map(url => ({ url }));
      }
    }

    // 4. Quét tìm ảnh trong file Markdown gốc
    const mdContent = readFileSync(draftPath, "utf8");
    const lines = mdContent.split(/\r?\n/);
    const mdImages = [];
    for (const line of lines) {
      const match = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (match) {
        mdImages.push({
          alt: match[1],
          src: match[2],
        });
      }
    }
    console.log(`   📝 Số ảnh tìm thấy trong Markdown gốc: ${mdImages.length}`);

    // 5. Xây dựng imageMap và captionMap bằng cơ chế ánh xạ tuần tự (Index-based)
    const imageMap = {};
    const captionMap = {};
    for (let k = 0; k < mdImages.length; k++) {
      const mdImg = mdImages[k];
      const liveImg = liveImages[k];
      if (liveImg) {
        imageMap[mdImg.src] = liveImg.url;
        if (liveImg.caption) {
          captionMap[mdImg.src] = liveImg.caption;
        }
        console.log(`      🔗 Ánh xạ [${mdImg.src}] -> [${liveImg.url}]`);
      } else {
        console.warn(`      ⚠️ Cảnh báo: Thiếu ảnh live tương ứng cho ảnh Markdown thứ ${k+1} (${mdImg.src})`);
      }
    }

    // 6. Biên dịch lại Markdown sang HTML sạch sẽ chuẩn WordPress
    const cleanHtml = markdownToHtml(mdContent, { imageMap, captionMap });

    // Dry-run: Ghi file tạm để kiểm tra
    if (dryRun) {
      const tempOutDir = join(PROJECT, "scratch");
      const tempPath = join(tempOutDir, `dry-run-${slug}.html`);
      writeFileSync(tempPath, cleanHtml, "utf8");
      console.log(`   🔍 [DRY-RUN] Đã ghi HTML ra file tạm: ${tempPath}`);
      successCount++;
      continue;
    }

    // 7. Gọi WordPress REST API để cập nhật đè nội dung HTML mới
    try {
      console.log(`   🚀 Đang gửi REST API cập nhật nội dung cho bài viết ID: ${actualWpId} (type: ${wpType})...`);
      
      await wp(baseUrl, auth, `/wp/v2/${wpType}/${actualWpId}`, {
        method: "POST",
        body: JSON.stringify({ content: cleanHtml }),
      });
      
      console.log(`   ✅ Cập nhật live thành công bài viết ID: ${actualWpId} (type: ${wpType})`);

      // 8. Re-submit Google Index qua Rank Math
      const postUrl = logData.wpLink || `${SITE}/${slug}/`;
      console.log(`   📡 Đang gửi yêu cầu re-index tới Google: ${postUrl}`);
      const indexResult = await submitGoogleIndex(postUrl);
      if (indexResult.ok) {
        console.log(`   ✅ Gửi re-index Google thành công.`);
      } else {
        console.warn(`   ⚠️ Cảnh báo gửi re-index thất bại: ${indexResult.body}`);
      }

      successCount++;
    } catch (err) {
      console.error(`   ❌ Lỗi cập nhật bài viết live: ${err.message}`, err.stack ?? "");
      errorCount++;
    }
  }

  console.log(`\n==================================================`);
  console.log(`=== KẾT QUẢ HOÀN THÀNH ===`);
  console.log(`- Thành công: ${successCount}/${logFiles.length}`);
  console.log(`- Thất bại: ${errorCount}`);
  console.log(`==================================================`);
}

main().catch((err) => {
  console.error(`❌ Lỗi hệ thống: ${err.message}`, err.stack ?? "");
});
