/**
 * Push 4 area pages với IP bypass (thay cho fetch() bị ENOTFOUND DNS)
 * Dùng https.request trực tiếp tới 103.57.220.210 với SNI thongtaccongquangninh.com
 *
 * Usage: node tools/push_area_pages_ip_bypass.mjs [--publish] [--slug=thong-tac-cong-bai-chay]
 */
import https from "node:https";
import { readFileSync, appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PROJECT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const APP_ENV_PATH = "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env";
const ENV_PATH = existsSync(join(PROJECT, ".env"))
  ? join(PROJECT, ".env")
  : existsSync(APP_ENV_PATH)
  ? APP_ENV_PATH
  : "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = join(PROJECT, "docs", "SEO_PROGRESS.csv");
const TODAY = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0, 5);

const PAGES = [
  {
    slug: "thong-tac-cong-bai-chay",
    id: 2054,
    type: "posts",
    draftFile: "content-drafts/thong-tac-cong-bai-chay-rankmath-draft.md",
    imageDir: "Ảnh Đã Xử Lý SEO/thong-tac-cong-bai-chay",
    packageFile: "image-briefs/thong-tac-cong-bai-chay-image-package.json",
  },
  {
    slug: "thong-tac-cong-cao-xanh",
    id: 991,
    type: "pages",
    draftFile: "content-drafts/thong-tac-cong-cao-xanh-rankmath-draft.md",
    imageDir: "Ảnh Đã Xử Lý SEO/thong-tac-cong-cao-xanh",
    packageFile: "image-briefs/thong-tac-cong-cao-xanh-image-package.json",
  },
  {
    slug: "thong-tac-cong-tuan-chau",
    id: 2041,
    type: "posts",
    draftFile: "content-drafts/thong-tac-cong-tuan-chau-ha-long-rankmath-draft.md",
    imageDir: "Ảnh Đã Xử Lý SEO/thong-tac-cong-tuan-chau",
    packageFile: "image-briefs/thong-tac-cong-tuan-chau-image-package.json",
  },
  {
    slug: "thong-tac-cong-gieng-day",
    id: 992,
    type: "pages",
    draftFile: "content-drafts/thong-tac-cong-gieng-day-ha-long-rankmath-draft.md",
    imageDir: "Ảnh Đã Xử Lý SEO/thong-tac-cong-gieng-day",
    packageFile: "image-briefs/thong-tac-cong-gieng-day-image-package.json",
  },
];

const FORBIDDEN = [
  [/chuyên nghiệp/gi, "đúng kỹ thuật"],
  [/uy tín/gi, "rõ giá"],
  [/hàng đầu/gi, "được gọi nhiều"],
  [/tận tâm/gi, "làm rõ việc"],
];
const SYMBOL_RE = /[⭐✅☎️⏱️➜→‹›「」【】]/g;
const AUTHOR_LINE =
  '<p>Tác giả: <a href="https://thongtaccongquangninh.com/author/nguyensonghao/">Nguyễn Song Hào</a></p>';

/* ── helpers ── */

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function field(md, label) {
  const m = md.match(new RegExp(`^${label}:\\s*(.+)$`, "mi"));
  return m ? m[1].trim() : "";
}

function cleanContent(html) {
  let v = String(html ?? "").replace(SYMBOL_RE, "");
  for (const [from, to] of FORBIDDEN) v = v.replace(from, to);
  return v;
}

function escapeHtml(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function convertMarkdownLinks(input) {
  return String(input).replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g,
    '<a href="$2">$1</a>'
  );
}

function inlineMd(input) {
  const s = String(input);
  if (/<[a-z]/i.test(s)) {
    return convertMarkdownLinks(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }
  return convertMarkdownLinks(escapeHtml(s))
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function slotFromPlaceholder(path, imageSlotMap) {
  const p = path.toLowerCase();
  // Match exact packaged filenames first; some real filenames contain generic words
  // like "quy-trinh" but belong to a separate supporting slot.
  if (imageSlotMap) {
    const basename = p.split(/[\/\\]/).pop();
    for (const [slot, info] of Object.entries(imageSlotMap)) {
      if (info.fileName && info.fileName.toLowerCase() === basename) return slot;
    }
  }
  if (p.includes("anh-dau-bai") || p.includes("dau-bai")) return "hero";
  if (p.includes("quy-trinh") || p.includes("process")) return "process";
  if (p.includes("case-study") || p.includes("case_study")) return "case-study";
  return null;
}

function buildFigure(wpUrl, altText, title, caption) {
  return (
    `<figure class="wp-block-image size-full">` +
    `<img src="${wpUrl}" alt="${escapeHtml(altText)}" title="${escapeHtml(title)}" loading="lazy">` +
    `<figcaption>${escapeHtml(caption)}</figcaption>` +
    `</figure>`
  );
}

function markdownToHtml(md, imageSlotMap) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let paragraph = [], list = [], table = [];
  let inRaw = false;

  const fp = () => { if (!paragraph.length) return; out.push(`<p>${inlineMd(paragraph.join(" "))}</p>`); paragraph = []; };
  const fl = () => { if (!list.length) return; out.push(`<ul>${list.map(i => `<li>${inlineMd(i)}</li>`).join("")}</ul>`); list = []; };
  const ft = () => {
    if (!table.length) return;
    const rows = table.filter(r => !/^\|\s*[-:]+/.test(r)).map(r => r.replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
    if (rows.length) {
      const [head, ...body] = rows;
      out.push(`<table><thead><tr>${head.map(c => `<th>${inlineMd(c)}</th>`).join("")}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${inlineMd(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
    }
    table = [];
  };

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i]; const line = raw.trim(); i++;
    if (inRaw) { out.push(raw); if (/^<\/(script|style|table|div|figure|section|article|ul|ol|form)>/i.test(line)) inRaw = false; continue; }
    if (/^<(script|style)\b/i.test(line)) { fp(); fl(); ft(); out.push(raw); if (!/<\/(script|style)>/i.test(line)) inRaw = true; continue; }
    if (/^<(table|div|figure|section|article)\b/i.test(line)) { fp(); fl(); ft(); out.push(raw); if (!/<\/(table|div|figure|section|article)>/i.test(line)) inRaw = true; continue; }
    if (!line) { fp(); fl(); ft(); continue; }
    if (/^(Meta Title|Meta Description|Slug|Focus Keyword|Search Intent):/i.test(line)) continue;
    if (/^Tác giả:/i.test(line)) continue;
    const imgM = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgM) {
      fp(); fl(); ft();
      const slot = slotFromPlaceholder(imgM[2], imageSlotMap);
      const info = slot ? imageSlotMap[slot] : null;
      if (info) {
        if (i < lines.length && /^\*[^*].*[^*]\*$/.test(lines[i].trim())) i++;
        out.push(buildFigure(info.wpUrl, info.altText, info.title, info.caption));
      }
      continue;
    }
    if (line.startsWith("|")) { fp(); fl(); table.push(line); continue; }
    ft();
    if (line === "---") { fp(); fl(); out.push("<hr>"); }
    else if (line.startsWith("### ")) { fp(); fl(); out.push(`<h3>${inlineMd(line.slice(4))}</h3>`); }
    else if (line.startsWith("## ")) { fp(); fl(); out.push(`<h2>${inlineMd(line.slice(3))}</h2>`); }
    else if (line.startsWith("# ")) { fp(); fl(); }
    else if (line.startsWith("- ")) { fp(); list.push(line.slice(2)); }
    else if (/^\d+\.\s/.test(line)) { fp(); fl(); out.push(`<p>${inlineMd(line)}</p>`); }
    else if (line.startsWith("> ")) { fp(); fl(); out.push(`<blockquote><p>${inlineMd(line.slice(2))}</p></blockquote>`); }
    else { paragraph.push(line); }
  }
  fp(); fl(); ft();
  return out.join("\n");
}

/* ── https helpers (bypass DNS) ── */

function httpsRequest(method, wpPath, auth, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(typeof body === "string" ? body : JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: "/wp-json" + wpPath,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "Content-Type": "application/json",
        "User-Agent": "Codex SEO push",
        ...extraHeaders,
        ...(bodyBuf ? { "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        let text = Buffer.concat(chunks).toString("utf8");
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1);
        }
        let payload;
        try { payload = text ? JSON.parse(text) : {}; } catch { payload = text; }
        if (res.statusCode >= 400) {
          const msg = typeof payload === "object" ? (payload.message ?? text) : payload;
          return reject(new Error(`WP ${res.statusCode} ${wpPath}: ${msg}`));
        }
        resolve(payload);
      });
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout " + wpPath)));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function uploadMedia(auth, filePath, altText, title, caption) {
  return new Promise((resolve, reject) => {
    const fileName = filePath.replace(/\\/g, "/").split("/").pop();
    const buf = readFileSync(filePath);
    const mime = fileName.endsWith(".webp") ? "image/webp" : /\.jpe?g$/i.test(fileName) ? "image/jpeg" : "image/png";
    const opts = {
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: "/wp-json/wp/v2/media",
      method: "POST",
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buf.length,
        "User-Agent": "Codex SEO push",
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", async () => {
        let text = Buffer.concat(chunks).toString("utf8");
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1);
        }
        let data;
        try { data = JSON.parse(text); } catch { return reject(new Error(`Upload parse error: ${text.slice(0, 200)}`)); }
        if (res.statusCode >= 400) return reject(new Error(`Upload ${res.statusCode}: ${data.message ?? text.slice(0, 200)}`));
        // Update metadata
        try {
          await httpsRequest("POST", `/wp/v2/media/${data.id}`, auth, { alt_text: altText, title: { raw: title }, caption: { raw: caption } });
        } catch {}
        resolve({ id: data.id, url: data.source_url });
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("upload timeout " + fileName)));
    req.write(buf);
    req.end();
  });
}

/* ── main ── */

async function main() {
  const args = process.argv.slice(2);
  const doPublish = args.includes("--publish");
  const onlySlug = (args.find((a) => a.startsWith("--slug=")) ?? "").replace("--slug=", "");

  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  const me = await httpsRequest("GET", "/wp/v2/users/me", auth, null);
  console.log(`Auth OK: ${me.name} — ${WP_HOST} via IP ${SERVER_IP}`);

  const pages = onlySlug ? PAGES.filter((p) => p.slug === onlySlug) : PAGES;
  const results = [];

  for (const page of pages) {
    console.log(`\n═══ ${page.slug} (id=${page.id}) ═══`);
    const pkg = JSON.parse(readFileSync(join(PROJECT, page.packageFile), "utf8"));
    const imageSlotMap = {};

    for (const img of pkg.images) {
      const localPath = join(PROJECT, img.filePath.replace(/\\/g, "/"));
      if (!existsSync(localPath)) { console.warn(`  SKIP: ${localPath}`); continue; }
      process.stdout.write(`  Upload ${img.fileName}... `);
      try {
        const { id, url } = await uploadMedia(auth, localPath, img.altText, img.title, img.caption);
        imageSlotMap[img.slot] = { wpUrl: url, wpId: id, altText: img.altText, title: img.title, caption: img.caption, fileName: img.fileName };
        console.log(`OK id=${id}`);
      } catch (e) { console.log(`FAIL: ${e.message}`); }
    }

    const md = readFileSync(join(PROJECT, page.draftFile), "utf8");
    const title = field(md, "Meta Title");
    const description = field(md, "Meta Description");
    const focusKeyword = field(md, "Focus Keyword");
    if (!title) { console.error("  ERROR: Meta Title missing"); results.push({ slug: page.slug, status: "error" }); continue; }

    const content = cleanContent(markdownToHtml(md, imageSlotMap)) + "\n" + AUTHOR_LINE;
    const status = doPublish ? "publish" : "draft";
    console.log(`  Pushing ${content.length} chars, status=${status}...`);
    await httpsRequest("POST", `/wp/v2/${page.type}/${page.id}`, auth, { title, content, excerpt: description, status });
    console.log(`  Content OK`);

    try {
      await httpsRequest("POST", "/rankmath/v1/updateMeta", auth, {
        objectType: "post", objectID: page.id,
        meta: { rank_math_title: title, rank_math_description: description, rank_math_focus_keyword: focusKeyword },
      });
      console.log(`  Rank Math OK`);
    } catch (e) { console.log(`  Rank Math skip: ${e.message.slice(0, 80)}`); }

    results.push({ slug: page.slug, id: page.id, status, images: Object.keys(imageSlotMap).length });
    console.log(`  DONE: ${status}, ${Object.keys(imageSlotMap).length}/${pkg.images.length} images`);
  }

  console.log("\n═══ SUMMARY ═══");
  for (const r of results) console.log(`${r.slug} → ${r.status} images=${r.images ?? "err"}`);

  const csvRow =
    `\n${TODAY},${TIME},PUSH-AREA-4-PAGES-DONE-${TODAY},push_content,thong tac cong khu vuc,` +
    `https://thongtaccongquangninh.com/[4-pages]/,` +
    `${results.map(r => r.slug).join("|")},${doPublish ? "published" : "draft_pushed"},easy,,,,,` +
    `Upload anh + push noi dung 4 trang khu vuc via IP bypass DNS,` +
    `tools/push_area_pages_ip_bypass.mjs,,` +
    `Verify Rank Math score sau khi push,Script dung IP 103.57.220.210 bypass ENOTFOUND,,,,,,`;
  appendFileSync(CSV_PATH, csvRow, "utf8");
  console.log(`\nLogged to docs/SEO_PROGRESS.csv`);
}

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
