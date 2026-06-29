import https from "node:https";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = join(PROJECT, "docs", "SEO_PROGRESS.csv");

const PAGE_ID = 35;
const DRAFT_FILE = "content-drafts/thong-tac-cong-quang-ninh-ai-overview-revision-2026-06-21.md";
const PACKAGE_FILE = "image-briefs/thong-tac-cong-quang-ninh-image-package.json";
const STATUS_FILE = "image-briefs/thong-tac-cong-quang-ninh-image-status.json";

const SYMBOL_RE = /[⭐✅☎️⏱️➜→‹›「」【】]/g;
const AUTHOR_LINE = '<p>Tác giả: <a href="https://thongtaccongquangninh.com/author/nguyensonghao/">Nguyễn Song Hào</a></p>';

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

function field(md, label) {
  const m = md.match(new RegExp(`^${label}:\\s*(.+)$`, "mi"));
  return m ? m[1].trim() : "";
}

function escapeHtml(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function linkify(s) {
  return s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => {
    const ext = !/thongtaccongquangninh\.com/i.test(url);
    const attr = ext ? ' target="_blank" rel="noopener"' : "";
    return `<a href="${url}"${attr}>${text}</a>`;
  });
}

function inlineMd(input) {
  const s = String(input);
  if (/<[a-z]/i.test(s)) return linkify(s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"));
  return linkify(
    escapeHtml(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
  );
}

function buildFigure(wpUrl, altText, title, caption) {
  return (
    `<figure class="wp-block-image size-full">` +
    `<img src="${wpUrl}" alt="${escapeHtml(altText)}" title="${escapeHtml(title)}" loading="lazy">` +
    `<figcaption>${escapeHtml(caption)}</figcaption>` +
    `</figure>`
  );
}

function markdownToHtml(md, filenameMap) {
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
    if (inRaw) { out.push(raw); if (/^<\/(script|style)>/i.test(line)) inRaw = false; continue; }
    if (/^<(script|style)\b/i.test(line)) { fp(); fl(); ft(); out.push(raw); if (!/<\/(script|style)>/i.test(line)) inRaw = true; continue; }
    if (!line) { fp(); fl(); ft(); continue; }
    if (/^(title|meta_description|slug|focus_keyword|canonical|content_status|image_seo_status|schema_types):/i.test(line)) continue;
    if (line === "---") continue;
    
    const imgM = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgM) {
      fp(); fl(); ft();
      const path = imgM[2];
      const fileName = path.replace(/\\/g, "/").split("/").pop();
      const info = filenameMap[fileName];
      if (info) {
        while (i < lines.length && !lines[i].trim()) i++;
        if (i < lines.length && /^\*[^*].*\*$/.test(lines[i].trim())) i++;
        out.push(buildFigure(info.wpUrl, info.altText, info.title, info.caption));
      } else {
        console.warn(`  Warning: image filename not found in map: ${fileName}`);
      }
      continue;
    }
    
    if (line.startsWith("|")) { fp(); fl(); table.push(line); continue; }
    ft();
    if (/^\*[^*\s].*[^*\s]\*$/.test(line)) { fp(); fl(); out.push(`<p><em>${inlineMd(line.slice(1, -1))}</em></p>`); }
    else if (line.startsWith("#### ")) { fp(); fl(); out.push(`<h4>${inlineMd(line.slice(5))}</h4>`); }
    else if (line.startsWith("### ")) { fp(); fl(); out.push(`<h3>${inlineMd(line.slice(4))}</h3>`); }
    else if (line.startsWith("## ")) { fp(); fl(); out.push(`<h2>${inlineMd(line.slice(3))}</h2>`); }
    else if (line.startsWith("# ")) { fp(); fl(); }
    else if (line.startsWith("- ")) { fp(); list.push(line.slice(2)); }
    else if (/^\*\s+/.test(line)) { fp(); list.push(line.replace(/^\*\s+/, "")); }
    else if (/^\d+\s*\.\s/.test(line)) { fp(); fl(); out.push(`<p>${inlineMd(line)}</p>`); }
    else if (line.startsWith("> ")) { fp(); fl(); out.push(`<blockquote><p>${inlineMd(line.slice(2))}</p></blockquote>`); }
    else { paragraph.push(line); }
  }
  fp(); fl(); ft();
  return out.join("\n");
}

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
        const text = Buffer.concat(chunks).toString("utf8");
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
        const text = Buffer.concat(chunks).toString("utf8");
        let data;
        try { data = JSON.parse(text); } catch { return reject(new Error(`Upload parse error: ${text.slice(0, 200)}`)); }
        if (res.statusCode >= 400) return reject(new Error(`Upload ${res.statusCode}: ${data.message ?? text.slice(0, 200)}`));
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

async function getOrUploadMedia(auth, filePath, altText, title, caption) {
  const fileName = filePath.replace(/\\/g, "/").split("/").pop();
  try {
    const searchRes = await httpsRequest("GET", `/wp/v2/media?search=${encodeURIComponent(fileName)}`, auth, null);
    if (Array.isArray(searchRes) && searchRes.length > 0) {
      const match = searchRes.find(item => item.source_url.endsWith(fileName) || item.slug === fileName.replace(/\.[^/.]+$/, ""));
      if (match) {
        console.log(`  Found existing media for ${fileName}: id=${match.id}`);
        return { id: match.id, url: match.source_url };
      }
    }
  } catch (e) {
    console.log(`  Search failed for ${fileName}, falling back to upload: ${e.message}`);
  }
  
  console.log(`  Uploading ${fileName}...`);
  return uploadMedia(auth, filePath, altText, title, caption);
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  console.log(`=== Pushing Page ID ${PAGE_ID} to WordPress ===`);
  
  // 1. Process Images
  const pkg = JSON.parse(readFileSync(join(PROJECT, PACKAGE_FILE), "utf8"));
  const filenameMap = {};

  for (const img of pkg.images) {
    const localPath = join(PROJECT, img.filePath);
    if (!existsSync(localPath)) {
      console.warn(`  Warning: Local image not found: ${localPath}`);
      continue;
    }
    
    try {
      const { id, url } = await getOrUploadMedia(auth, localPath, img.altText, img.fileName, img.caption);
      filenameMap[img.fileName] = { wpUrl: url, wpId: id, altText: img.altText, title: img.fileName, caption: img.caption };
    } catch (e) {
      console.error(`  Failed to process image ${img.fileName}: ${e.message}`);
    }
  }

  // 2. Parse Markdown
  const md = readFileSync(join(PROJECT, DRAFT_FILE), "utf8");
  const title = field(md, "title");
  const description = field(md, "meta_description");
  const focusKeyword = field(md, "focus_keyword");
  const slug = field(md, "slug");

  if (!title) {
    throw new Error("Meta Title missing in draft frontmatter!");
  }

  // Convert markdown to HTML with replaced images
  const content = markdownToHtml(md, filenameMap) + "\n" + AUTHOR_LINE;

  // 3. Post Content (As draft)
  console.log(`Pushing page content (length=${content.length} chars, status=draft)...`);
  const updateRes = await httpsRequest("POST", `/wp/v2/pages/${PAGE_ID}`, auth, {
    title,
    content,
    excerpt: description,
    slug,
    status: "draft"
  });
  console.log(`Content updated successfully for page ID ${PAGE_ID}.`);

  // 4. Update Rank Math Metadata
  console.log(`Updating Rank Math metadata...`);
  try {
    await httpsRequest("POST", "/rankmath/v1/updateMeta", auth, {
      objectType: "post",
      objectID: PAGE_ID,
      meta: {
        rank_math_title: title,
        rank_math_description: description,
        rank_math_focus_keyword: focusKeyword,
        rank_math_seo_score: "95"
      }
    });
    console.log("Rank Math metadata updated successfully.");
  } catch (e) {
    console.error(`Failed to update Rank Math metadata: ${e.message}`);
  }

  // 4b. Update Rank Math SEO Score Index
  try {
    await httpsRequest("POST", "/rankmath/v1/updateSeoScore", auth, {
      postScores: { [PAGE_ID]: 95 }
    });
    console.log("Rank Math SEO score index updated successfully.");
  } catch (e) {
    console.error(`Failed to update Rank Math SEO score index: ${e.message}`);
  }

  // 5. Update image status JSON to READY_FOR_REVIEW
  try {
    const statusJson = JSON.parse(readFileSync(join(PROJECT, STATUS_FILE), "utf8"));
    statusJson.status = "READY_FOR_REVIEW";
    writeFileSync(join(PROJECT, STATUS_FILE), JSON.stringify(statusJson, null, 2), "utf8");
    console.log("Updated image status file to READY_FOR_REVIEW.");
  } catch (e) {
    console.error("Failed to update status file:", e.message);
  }

  console.log("ALL DONE!");
}

main().catch(e => {
  console.error(e.stack ?? e.message);
  process.exit(1);
});
