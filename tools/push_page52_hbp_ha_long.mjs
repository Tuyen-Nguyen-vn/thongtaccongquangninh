/**
 * Push nội dung mới cho PAGE 52 (hut-be-phot-ha-long) qua IP bypass DNS.
 * Đọc YAML frontmatter (meta_title / meta_description), backup nội dung cũ trước khi ghi.
 * Usage: node tools/push_page52_hbp_ha_long.mjs [--publish]
 *   (không --publish = chỉ in HTML xem trước, KHÔNG ghi lên live)
 */
import https from "node:https";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PAGE_ID = 52;
const DRAFT = "content-drafts\\hut-be-phot-ha-long-2026.md";
const TODAY = new Date().toISOString().slice(0, 10);

const FORBIDDEN = [
  [/chuyên nghiệp/gi, "đúng kỹ thuật"],
  [/uy tín/gi, "rõ giá"],
  [/hàng đầu/gi, "được gọi nhiều"],
  [/tận tâm/gi, "làm rõ việc"],
];
const SYMBOL_RE = /[⭐☎️⏱️➜→‹›「」【】]/g;
const AUTHOR_LINE = '<p>Tác giả: <a href="https://thongtaccongquangninh.com/author/nguyensonghao/">Nguyễn Song Hào</a></p>';

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function frontmatter(md, key) {
  const m = md.match(new RegExp(`^${key}:\\s*(.+)$`, "mi"));
  return m ? m[1].trim() : "";
}

function escapeHtml(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
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
  // bỏ YAML frontmatter
  let body = md.replace(/^---[\s\S]*?---\s*/, "");
  const lines = body.split(/\r?\n/);
  const out = [];
  let paragraph = [], list = [], olist = [], table = [];
  const fp = () => { if (!paragraph.length) return; out.push(`<p>${inlineMd(paragraph.join(" "))}</p>`); paragraph = []; };
  const fl = () => { if (!list.length) return; out.push(`<ul>${list.map(i => `<li>${inlineMd(i)}</li>`).join("")}</ul>`); list = []; };
  const fo = () => { if (!olist.length) return; out.push(`<ol>${olist.map(i => `<li>${inlineMd(i)}</li>`).join("")}</ol>`); olist = []; };
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
    if (line.startsWith("|")) { fp(); fl(); fo(); table.push(line); continue; }
    ft();
    if (line === "---") { fp(); fl(); fo(); out.push("<hr>"); }
    else if (line.startsWith("### ")) { fp(); fl(); fo(); out.push(`<h3>${inlineMd(line.slice(4))}</h3>`); }
    else if (line.startsWith("## ")) { fp(); fl(); fo(); out.push(`<h2>${inlineMd(line.slice(3))}</h2>`); }
    else if (line.startsWith("# ")) { fp(); fl(); fo(); /* H1 = title, bỏ trong body */ }
    else if (/^[-*]\s/.test(line)) { fp(); fo(); list.push(line.replace(/^[-*]\s+/, "")); }
    else if (/^\d+\.\s/.test(line)) { fp(); fl(); olist.push(line.replace(/^\d+\.\s+/, "")); }
    else if (line.startsWith("> ")) { fp(); fl(); fo(); out.push(`<blockquote><p>${inlineMd(line.slice(2))}</p></blockquote>`); }
    else if (/^\*[^*].*\*$/.test(line) && !line.includes(" ** ")) { fp(); fl(); fo(); out.push(`<p><em>${inlineMd(line.replace(/^\*|\*$/g, ""))}</em></p>`); }
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
function httpsRequest(method, wpPath, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request({
      hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/wp-json" + wpPath, method,
      headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json", "User-Agent": "Codex push52", ...(bodyBuf ? { "Content-Length": bodyBuf.length } : {}) },
      rejectUnauthorized: false,
    }, (res) => {
      const chunks = []; res.on("data", c => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let payload; try { payload = text ? JSON.parse(text) : {}; } catch { payload = text; }
        if (res.statusCode >= 400) return reject(new Error(`WP ${res.statusCode} ${wpPath}: ${typeof payload === "object" ? payload.message ?? text : text}`));
        resolve(payload);
      });
    });
    req.on("error", reject); req.setTimeout(30000, () => req.destroy(new Error("timeout " + wpPath)));
    if (bodyBuf) req.write(bodyBuf); req.end();
  });
}
async function main() {
  const doPublish = process.argv.includes("--publish");
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  const md = readFileSync(join(PROJECT, DRAFT), "utf8");
  const title = frontmatter(md, "meta_title");
  const description = frontmatter(md, "meta_description");
  const focusKeyword = "hút bể phốt Hạ Long";
  if (!title) { console.error("ERROR: meta_title missing"); process.exit(1); }

  let content = cleanContent(markdownToHtml(md));
  if (!/author\/nguyensonghao/i.test(content)) content += "\n" + AUTHOR_LINE;
  console.log(`Title: ${title}`);
  console.log(`Desc : ${description}`);
  console.log(`HTML : ${content.length} ký tự`);

  if (!doPublish) {
    writeFileSync(join(PROJECT, "reports", `preview-page52-${TODAY}.html`), content, "utf8");
    console.log(`\n[DRY-RUN] Đã ghi preview -> reports/preview-page52-${TODAY}.html (chưa đẩy live). Thêm --publish để đăng.`);
    return;
  }

  const me = await httpsRequest("GET", "/wp/v2/users/me", auth, null);
  console.log(`Auth OK: ${me.name}`);

  // Backup nội dung cũ
  const old = await httpsRequest("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`, auth, null);
  const backupPath = join(PROJECT, "backups", `page-52-hut-be-phot-ha-long-before-rewrite-${TODAY}.json`);
  writeFileSync(backupPath, JSON.stringify({ id: old.id, slug: old.slug, status: old.status, title: old.title, content: old.content, excerpt: old.excerpt }, null, 2), "utf8");
  console.log(`Backup: ${backupPath}`);

  // Cập nhật nội dung
  const res = await httpsRequest("POST", `/wp/v2/pages/${PAGE_ID}`, auth, { title, content, excerpt: description, status: "publish" });
  console.log(`Content updated: id=${res.id} status=${res.status} link=${res.link}`);

  // Rank Math meta
  try {
    await httpsRequest("POST", "/rankmath/v1/updateMeta", auth, {
      objectType: "post", objectID: PAGE_ID,
      meta: { rank_math_title: title, rank_math_description: description, rank_math_focus_keyword: focusKeyword },
    });
    console.log("Rank Math meta OK");
  } catch (e) { console.log(`Rank Math skip: ${e.message.slice(0, 100)}`); }

  const log = { updatedAt: new Date().toISOString(), pageId: PAGE_ID, slug: res.slug, link: res.link, title, contentLen: content.length, backup: backupPath };
  writeFileSync(join(PROJECT, "reports", `push-page52-rewrite-${TODAY}.json`), JSON.stringify(log, null, 2), "utf8");
  console.log(`\nHOÀN THÀNH -> ${res.link}`);
}
main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
