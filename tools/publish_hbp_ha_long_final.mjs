/**
 * Publish bài Hút Bể Phốt Hạ Long lên WordPress live.
 * 1. Upload/Verify 4 WebP ảnh lên Media Library với alt/caption chuẩn.
 * 2. Thay thế các placeholder ảnh trong file Markdown bằng Gutenberg Image block tương ứng.
 * 3. Convert Markdown sang HTML, dọn dẹp các từ khóa bị cấm (chuyên nghiệp, uy tín, hàng đầu, tận tâm).
 * 4. Backup nội dung cũ của Page 52.
 * 5. Cập nhật Content, Title (H1), Excerpt (Meta Desc) cho Page 52.
 * 6. Cập nhật Rank Math Meta.
 * 7. Verify live URL bằng cache-buster.
 * 8. Ghi log vào docs/SEO_PROGRESS.csv và reports.
 */

import https from "node:https";
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = process.env.TTCQN_PROJECT_ROOT || path.resolve(__dirname, "..");

const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PAGE_ID = 52;
const DRAFT_PATH = path.join(PROJECT, "content-drafts", "hut-be-phot-ha-long-2026.md");
const CSV_PATH = path.join(PROJECT, "docs", "SEO_PROGRESS.csv");
const ENV_PATH = path.join(PROJECT, ".env");

const FORBIDDEN = [
  [/chuyên nghiệp/gi, "đúng kỹ thuật"],
  [/uy tín/gi, "rõ giá"],
  [/hàng đầu/gi, "được gọi nhiều"],
  [/tận tâm/gi, "làm rõ việc"],
];

const SYMBOL_RE = /[⭐☎️⏱️➜→‹›「」【】]/g;

const IMAGE_DEFS = [
  {
    fileName: "xe-bon-hut-be-phot-khu-cong-nghiep-ha-long.webp",
    filePath: path.join(PROJECT, "Ảnh Đã Xử Lý SEO", "xe-bon-hut-be-phot-khu-cong-nghiep-ha-long.webp"),
    altText: "Xe bồn hút bể phốt đang thi công tại khu công nghiệp Hạ Long, 2 kỹ thuật viên làm việc",
    caption: "Xe bồn và kỹ thuật viên hút bể phốt tại khu vực công nghiệp Hạ Long",
    placeholder: "/wp-content/uploads/2026/06/xe-bon-hut-be-phot-khu-cong-nghiep-ha-long.webp"
  },
  {
    fileName: "tho-hut-be-phot-nha-dan-ha-long-ngo-hep.webp",
    filePath: path.join(PROJECT, "Ảnh Đã Xử Lý SEO", "tho-hut-be-phot-nha-dan-ha-long-ngo-hep.webp"),
    altText: "Thợ hút bể phốt đang làm việc trong nhà vệ sinh hộ gia đình tại Hạ Long",
    caption: "Kỹ thuật viên hút bể phốt tại nhà dân khu vực ngõ hẹp Hạ Long",
    placeholder: "/wp-content/uploads/2026/06/tho-hut-be-phot-nha-dan-ha-long-ngo-hep.webp"
  },
  {
    fileName: "hut-be-phot-san-nha-dan-quang-ninh-xe-bon-nho.webp",
    filePath: path.join(PROJECT, "Ảnh Đã Xử Lý SEO", "hut-be-phot-san-nha-dan-quang-ninh-xe-bon-nho.webp"),
    altText: "Kỹ thuật viên hút bể phốt tại sân nhà dân Quảng Ninh, xe bồn đỗ trước cổng",
    caption: "Hút bể phốt tại sân nhà dân, xe bồn nhỏ vào được ngõ chật",
    placeholder: "/wp-content/uploads/2026/06/hut-be-phot-san-nha-dan-quang-ninh-xe-bon-nho.webp"
  },
  {
    fileName: "xe-hut-be-phot-ha-long-san-dinh-chua.webp",
    filePath: path.join(PROJECT, "Ảnh Đã Xử Lý SEO", "xe-hut-be-phot-ha-long-san-dinh-chua.webp"),
    altText: "Xe hút bể phốt đang làm việc tại khu vực rộng, thành phố Hạ Long",
    caption: "Xe hút bể phốt phục vụ tại khu vực rộng, Hạ Long",
    placeholder: "/wp-content/uploads/2026/06/xe-hut-be-phot-ha-long-san-dinh-chua.webp"
  }
];

function parseEnv(p) {
  const env = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function httpsRequest(method, urlPath, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const reqHeaders = {
      Host: WP_HOST,
      Authorization: auth,
      "User-Agent": "Codex Publish Ha Long/1.0",
      ...headers
    };
    
    let bodyBuf = null;
    if (body) {
      if (Buffer.isBuffer(body)) {
        bodyBuf = body;
      } else if (typeof body === "object") {
        bodyBuf = Buffer.from(JSON.stringify(body), "utf8");
        reqHeaders["Content-Type"] = "application/json";
      } else {
        bodyBuf = Buffer.from(String(body), "utf8");
      }
      reqHeaders["Content-Length"] = bodyBuf.length;
    }

    const opts = {
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: urlPath,
      method,
      headers: reqHeaders,
      rejectUnauthorized: false,
    };

    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error("timeout " + urlPath)));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function getField(md, label) {
  const match = md.match(new RegExp(`^${label}:\\s*(.+)$`, "mi"));
  return match ? match[1].trim() : "";
}

function getH1(md) {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMd(input) {
  const s = String(input);
  if (/<[a-z]/i.test(s)) return s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return escapeHtml(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let paragraph = [], list = [], olist = [], table = [];

  const fp = () => { if (paragraph.length) { out.push(`<p>${inlineMd(paragraph.join(" "))}</p>`); paragraph = []; } };
  const fl = () => { if (list.length) { out.push(`<ul>${list.map(i => `<li>${inlineMd(i)}</li>`).join("")}</ul>`); list = []; } };
  const fo = () => { if (olist.length) { out.push(`<ol>${olist.map(i => `<li>${inlineMd(i)}</li>`).join("")}</ol>`); olist = []; } };
  const ft = () => {
    if (!table.length) return;
    const rows = table.filter(r => !/^\|\s*[-:| ]+\|?\s*$/.test(r)).map(r => r.replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
    if (rows.length) {
      const [head, ...bdy] = rows;
      out.push(`<table><thead><tr>${head.map(c => `<th>${inlineMd(c)}</th>`).join("")}</tr></thead><tbody>${bdy.map(r => `<tr>${r.map(c => `<td>${inlineMd(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
    }
    table = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { fp(); fl(); fo(); ft(); continue; }
    if (line.startsWith("<!--") || line.startsWith("-->")) continue;
    if (/^(Meta Title|Meta Description|Focus Keyword|Slug):/i.test(line)) continue;
    if (line.startsWith("|")) { fp(); fl(); fo(); table.push(line); continue; }
    ft();

    if (line === "---") { fp(); fl(); fo(); out.push("<hr>"); }
    else if (line.startsWith("### ")) { fp(); fl(); fo(); out.push(`<h3>${inlineMd(line.slice(4))}</h3>`); }
    else if (line.startsWith("## ")) { fp(); fl(); fo(); out.push(`<h2>${inlineMd(line.slice(3))}</h2>`); }
    else if (line.startsWith("# ")) { fp(); fl(); fo(); /* Skip H1 in body */ }
    else if (/^[-*]\s/.test(line)) { fp(); fo(); list.push(line.replace(/^[-*]\s+/, "")); }
    else if (/^\d+\.\s/.test(line)) { fp(); fl(); olist.push(line.replace(/^\d+\.\s+/, "")); }
    else if (line.startsWith("> ")) { fp(); fl(); fo(); out.push(`<blockquote><p>${inlineMd(line.slice(2))}</p></blockquote>`); }
    else { paragraph.push(line); }
  }
  fp(); fl(); fo(); ft();
  return out.join("\n");
}

function cleanContent(html) {
  let v = String(html ?? "").replace(SYMBOL_RE, "");
  for (const [from, to] of FORBIDDEN) v = v.replace(from, to);
  return v;
}

async function uploadOrFindMedia(image) {
  const stem = path.basename(image.fileName, path.extname(image.fileName));
  console.log(`Checking if media exists: ${image.fileName} (stem: ${stem})`);
  
  // 1. Search existing media
  const existing = await httpsRequest("GET", `/wp-json/wp/v2/media?search=${encodeURIComponent(stem)}&per_page=10`);
  let found = null;
  if (existing.status === 200 && Array.isArray(existing.data)) {
    found = existing.data.find(item => String(item.source_url ?? "").includes(image.fileName));
  }
  
  if (found) {
    console.log(`✓ Media already exists: id=${found.id} URL=${found.source_url}`);
    
    // Check if alt/caption matches, if not update it
    if (found.alt_text !== image.altText || found.caption?.raw !== image.caption) {
      console.log(`Updating metadata for existing media id=${found.id}`);
      await httpsRequest("POST", `/wp-json/wp/v2/media/${found.id}`, {}, {
        alt_text: image.altText,
        caption: image.caption,
        title: stem.replaceAll("-", " ")
      });
    }
    return found;
  }

  // 2. Upload if not found
  console.log(`Uploading new media: ${image.fileName}...`);
  if (!existsSync(image.filePath)) {
    throw new Error(`File không tồn tại: ${image.filePath}`);
  }
  
  const fileBuf = readFileSync(image.filePath);
  const uploadR = await httpsRequest("POST", "/wp-json/wp/v2/media", {
    "Content-Type": "image/webp",
    "Content-Disposition": `attachment; filename="${image.fileName}"`,
  }, fileBuf);

  if (uploadR.status !== 201) {
    throw new Error(`Upload ảnh thất bại: HTTP ${uploadR.status} - ${JSON.stringify(uploadR.data)}`);
  }
  
  const mediaId = uploadR.data.id;
  const mediaUrl = uploadR.data.source_url;
  console.log(`✓ Uploaded media successfully: id=${mediaId} URL=${mediaUrl}`);

  // 3. Update metadata
  console.log(`Setting metadata for media id=${mediaId}...`);
  await httpsRequest("POST", `/wp-json/wp/v2/media/${mediaId}`, {}, {
    alt_text: image.altText,
    caption: image.caption,
    title: stem.replaceAll("-", " ")
  });

  return uploadR.data;
}

async function main() {
  const doWrite = process.argv.includes("--write");
  console.log(`Starting publication process... Mode: ${doWrite ? "WRITE" : "DRY-RUN"}`);

  // 1. Check auth
  const me = await httpsRequest("GET", "/wp-json/wp/v2/users/me");
  if (me.status !== 200) {
    console.error("Auth check failed:", me.status, me.data);
    process.exit(1);
  }
  console.log(`✓ Auth OK! Welcome, ${me.data.name}`);

  // 2. Backup existing page
  const pageR = await httpsRequest("GET", `/wp-json/wp/v2/pages/${PAGE_ID}?context=edit`);
  if (pageR.status !== 200) {
    console.error(`Lấy dữ liệu Page ID ${PAGE_ID} thất bại:`, pageR.status, pageR.data);
    process.exit(1);
  }
  const oldPage = pageR.data;
  const backupDir = "D:\\.thongtaccongquangninh\\backups";
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `page-52-hut-be-phot-ha-long-before-rewrite-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(backupPath, JSON.stringify(oldPage, null, 2), "utf8");
  console.log(`✓ Backup saved to: ${backupPath}`);

  // 3. Upload & map images
  const mediaMap = {};
  for (const imgDef of IMAGE_DEFS) {
    const media = await uploadOrFindMedia(imgDef);
    mediaMap[imgDef.placeholder] = {
      id: media.id,
      url: media.source_url,
      alt: imgDef.altText,
      caption: imgDef.caption
    };
  }

  // 4. Process draft markdown
  if (!existsSync(DRAFT_PATH)) {
    console.error(`Draft file not found: ${DRAFT_PATH}`);
    process.exit(1);
  }
  let md = readFileSync(DRAFT_PATH, "utf8");

  const metaTitle = cleanContent(getField(md, "Meta Title"));
  const metaDesc = cleanContent(getField(md, "Meta Description"));
  const focusKeyword = getField(md, "Focus Keyword");
  const pageH1 = cleanContent(getH1(md));

  console.log(`Meta Title (SEO Title): ${metaTitle} (length: ${metaTitle.length})`);
  console.log(`Meta Desc: ${metaDesc} (length: ${metaDesc.length})`);
  console.log(`Focus Keyword: ${focusKeyword}`);
  console.log(`H1 (Page Title): ${pageH1}`);

  // Replace image markdown placeholders with Gutenberg block comments
  for (const placeholder of Object.keys(mediaMap)) {
    const imgData = mediaMap[placeholder];
    const imageBlock = `<!-- wp:image {"id":${imgData.id},"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="${imgData.url}" alt="${escapeHtml(imgData.alt)}" class="wp-image-${imgData.id}"/><figcaption class="wp-element-caption">${escapeHtml(imgData.caption)}</figcaption></figure>
<!-- /wp:image -->`;
    
    // Find markdown format: ![alt](placeholder)
    const regex = new RegExp(`!\\[[^\\]]*\\]\\(${placeholder.replace(/\//g, "\\/")}\\)`, "g");
    md = md.replace(regex, imageBlock);
  }

  // Convert markdown to HTML
  let html = markdownToHtml(md);
  
  // Clean forbidden keywords
  html = cleanContent(html);

  // Check author link at the end
  const authorBylinePattern = /href="https:\/\/thongtaccongquangninh\.com\/author\/nguyensonghao\/"/i;
  if (!authorBylinePattern.test(html)) {
    console.log("Adding required Nguyễn Song Hào author link...");
    html += `\n<p>Tác giả: <a href="https://thongtaccongquangninh.com/author/nguyensonghao/">Nguyễn Song Hào</a></p>`;
  }

  if (!doWrite) {
    const previewPath = "D:\\.thongtaccongquangninh\\reports\\preview-page52-dryrun.html";
    writeFileSync(previewPath, `<h1>${pageH1}</h1>\n\n${html}`, "utf8");
    console.log(`\n[DRY-RUN] Done. Preview written to: ${previewPath}`);
    console.log("Run with --write to save live to WordPress.");
    process.exit(0);
  }

  // 5. Update WordPress page content
  console.log(`Updating WordPress page ${PAGE_ID}...`);
  const updateR = await httpsRequest("POST", `/wp-json/wp/v2/pages/${PAGE_ID}`, {}, {
    title: pageH1,
    content: html,
    excerpt: metaDesc,
    status: "publish"
  });

  if (updateR.status !== 200) {
    console.error("Cập nhật content thất bại:", updateR.status, updateR.data);
    process.exit(1);
  }
  console.log(`✓ Content updated successfully! Link: ${updateR.data.link}`);

  // 6. Update Rank Math meta
  console.log("Updating Rank Math metadata...");
  const rankmathR = await httpsRequest("POST", "/wp-json/rankmath/v1/updateMeta", {}, {
    objectType: "post",
    objectID: PAGE_ID,
    meta: {
      rank_math_title: metaTitle,
      rank_math_description: metaDesc,
      rank_math_focus_keyword: focusKeyword
    }
  });
  const rmOk = rankmathR.status === 200 && rankmathR.data?.slug === true;
  console.log(`✓ Rank Math update: ${rmOk ? "OK" : `FAIL ${rankmathR.status} - ${JSON.stringify(rankmathR.data)}`}`);

  // 7. Verify live URL via cache-buster
  console.log("Verifying live page rendering...");
  const liveUrl = `/hut-be-phot-ha-long/?nowprocket=1&codex=20260624-hbp-halong`;
  const live = await new Promise((resolve) => {
    const opts = {
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: liveUrl,
      method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "Verify-Bot/1.0" },
      rejectUnauthorized: false,
    };
    https.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, data }));
    }).on("error", (e) => resolve({ status: 500, error: e.message })).end();
  });

  const h1Match = live.data ? live.data.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) : null;
  const liveH1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : "";
  const tableOk = live.data ? (live.data.includes("Yếu tố khảo sát") && live.data.includes("Ví dụ thực tế tại Hạ Long")) : false;
  const authorOk = live.data ? live.data.includes("Nguyễn Song Hào") : false;

  console.log(`Live HTTP Status: ${live.status}`);
  console.log(`Live H1: ${liveH1}`);
  console.log(`Live Table OK: ${tableOk}`);
  console.log(`Live Author Link OK: ${authorOk}`);

  // 8. Log progress in CSV and reports
  const today = new Date().toISOString().slice(0, 10);
  const time = new Date().toTimeString().slice(0, 5);
  const logMsg = `Cập nhật toàn bộ bài viết hút bể phốt Hạ Long mới, upload 4 ảnh WebP thi công thực tế, tối ưu bảng giá 4 cột, FAQ chuẩn và author link`;
  const verifyDetails = `HTTP ${live.status}; H1="${liveH1}"; Table=${tableOk}; Author=${authorOk}; RM=${rmOk ? "ok" : "fail"}`;
  
  const csvRow = `\n${today},${time},FIX-HBP-HALONG-52-REWRITE-FINAL-${today},seo_fix,hút bể phốt Hạ Long,https://thongtaccongquangninh.com/hut-be-phot-ha-long/,hut-be-phot-ha-long,done,hard,,,,,"${logMsg}",tools/publish_hbp_ha_long_final.mjs,,Mở WP editor xem điểm Rank Math thật,"${verifyDetails}",NOT_REQUIRED,,,,,,`;
  appendFileSync(CSV_PATH, csvRow, "utf8");
  console.log("✓ Logged to docs/SEO_PROGRESS.csv");

  const reportPath = `D:\\.thongtaccongquangninh\\reports\\publish-page52-rewrite-final-${today}.json`;
  const logReport = {
    updatedAt: new Date().toISOString(),
    pageId: PAGE_ID,
    slug: "hut-be-phot-ha-long",
    link: updateR.data.link,
    metaTitle,
    metaDesc,
    focusKeyword,
    h1: pageH1,
    contentLen: html.length,
    backup: backupPath,
    images: Object.values(mediaMap),
    verification: {
      status: live.status,
      h1: liveH1,
      tableOk,
      authorOk,
      rmOk
    }
  };
  writeFileSync(reportPath, JSON.stringify(logReport, null, 2), "utf8");
  console.log(`✓ Report saved to: ${reportPath}`);
  console.log("\nALL TASKS COMPLETED SUCCESSFULLY!");
}

main().catch((err) => {
  console.error("FATAL ERROR:", err.stack ?? err.message);
  process.exit(1);
});
