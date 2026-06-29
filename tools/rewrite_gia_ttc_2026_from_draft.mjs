/**
 * Rewrite live post 2787 from the local markdown draft.
 *
 * Usage:
 *   node tools/rewrite_gia_ttc_2026_from_draft.mjs
 *   node tools/rewrite_gia_ttc_2026_from_draft.mjs --write
 */
import https from "node:https";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WRITE = process.argv.includes("--write");
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(__dirname, "..");
const DRAFT_PATH = join(PROJECT, "content-drafts", "blog", "gia-thong-tac-cong-quang-ninh-2026.md");
const ENV_PATH = join(PROJECT, ".env");
const POST_ID = 2787;
const WP_HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const CANONICAL_URL = `https://${WP_HOST}/gia-thong-tac-cong-quang-ninh/`;
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const TODAY = new Date().toISOString().slice(0, 10);
const BACKUP_DIR = join(PROJECT, "seo-revisions", `wp-before-gia-ttc-rewrite-${TODAY}`);
const REPORT_DIR = join(PROJECT, "reports");

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function field(md, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`^\\*\\*${escaped}:\\*\\*\\s*(.+)$`, "im"),
    new RegExp(`^${escaped}:\\s*(.+)$`, "im"),
  ];
  for (const pattern of patterns) {
    const match = md.match(pattern);
    if (match) return match[1].trim();
  }
  return "";
}

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderInline(input) {
  const source = String(input ?? "");
  const tokens = [];
  const linkRe = /(?<!!)\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let last = 0;
  let match;
  while ((match = linkRe.exec(source))) {
    if (match.index > last) tokens.push({ type: "text", value: source.slice(last, match.index) });
    tokens.push({ type: "link", text: match[1], url: match[2] });
    last = match.index + match[0].length;
  }
  if (last < source.length) tokens.push({ type: "text", value: source.slice(last) });

  return tokens
    .map((token) => {
      if (token.type === "link") {
        return `<a href="${escapeHtml(token.url)}" rel="noopener">${escapeHtml(token.text)}</a>`;
      }
      return escapeHtml(token.value)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>");
    })
    .join("");
}

function flushParagraph(buffer, out) {
  const text = buffer.join(" ").trim();
  if (text) out.push(`<p>${renderInline(text)}</p>`);
  buffer.length = 0;
}

function collectRawBlock(lines, index, endRe) {
  const parts = [];
  let i = index;
  while (i < lines.length) {
    parts.push(lines[i]);
    if (endRe.test(lines[i])) break;
    i += 1;
  }
  return { html: parts.join("\n"), nextIndex: i };
}

function collectList(lines, index) {
  const items = [];
  let i = index;
  while (i < lines.length) {
    const match = lines[i].trim().match(/^-\s+(.+)$/);
    if (!match) break;
    items.push(match[1]);
    i += 1;
  }
  return { html: `<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`, nextIndex: i - 1 };
}

function markdownBody(md) {
  const match = md.match(/^#\s+.+$/m);
  return match ? md.slice(match.index) : md;
}

function markdownToHtml(md) {
  const lines = markdownBody(md).replace(/\r\n/g, "\n").split("\n");
  const out = [];
  const paragraph = [];

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      flushParagraph(paragraph, out);
      continue;
    }

    if (line.startsWith("<table")) {
      flushParagraph(paragraph, out);
      const block = collectRawBlock(lines, i, /<\/table>\s*$/i);
      out.push(block.html);
      i = block.nextIndex;
      continue;
    }

    if (line.startsWith("<script")) {
      flushParagraph(paragraph, out);
      const block = collectRawBlock(lines, i, /<\/script>\s*$/i);
      out.push(block.html);
      i = block.nextIndex;
      continue;
    }

    const imgMatch = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/);
    if (imgMatch) {
      flushParagraph(paragraph, out);
      let caption = "";
      if (i + 1 < lines.length) {
        const cap = lines[i + 1].trim().match(/^\*(.+)\*$/);
        if (cap) {
          caption = cap[1];
          i += 1;
        }
      }
      out.push(
        `<figure class="wp-block-image size-large"><img src="${escapeHtml(imgMatch[2])}" alt="${escapeHtml(imgMatch[1])}" loading="lazy" />${caption ? `<figcaption>${renderInline(caption)}</figcaption>` : ""}</figure>`,
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph(paragraph, out);
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^-\s+/.test(line)) {
      flushParagraph(paragraph, out);
      const list = collectList(lines, i);
      out.push(list.html);
      i = list.nextIndex;
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph(paragraph, out);
  return out.join("\n");
}

function textFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countRe(html, re) {
  return (html.match(re) || []).length;
}

function wpRequest(auth, method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: `/wp-json${path}`,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "User-Agent": "ttcqn-gia-ttc-rewrite/1.0",
          ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function validate({ title, description, focusKeyword, html }) {
  const plain = textFromHtml(html);
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  const checks = {
    titleLength: [...title].length,
    metaLength: [...description].length,
    focusKeyword,
    wordCount,
    h1Count: countRe(html, /<h1\b/gi),
    h2Count: countRe(html, /<h2\b/gi),
    h3Count: countRe(html, /<h3\b/gi),
    tableCount: countRe(html, /<table\b/gi),
    imageCount: countRe(html, /<img\b/gi),
    serviceSchema: html.includes(`${CANONICAL_URL}#service`),
    faqSchema: html.includes(`${CANONICAL_URL}#faq`),
    hasAuthorByline: html.includes("https://thongtaccongquangninh.com/author/nguyensonghao/"),
    hasH1Keyword: /<h1[^>]*>[\s\S]*Giá Thông Tắc Cống Quảng Ninh/i.test(html),
    hasPhuPhiSection: html.includes("Khi Nào Phát Sinh Phụ Phí"),
    hasCanonicalSlugOnly: !html.includes("gia-thong-tac-cong-quang-ninh-2026/#service"),
    leakedEditorialNotes: /GỢI Ý ẢNH|CHECKLIST RANK MATH|ĐIỂM ƯỚC TÍNH/.test(plain),
  };

  const failures = [];
  if (checks.h1Count !== 1) failures.push(`H1_COUNT_${checks.h1Count}`);
  if (checks.tableCount < 1) failures.push("MISSING_TABLE");
  if (checks.h2Count < 7) failures.push(`LOW_H2_${checks.h2Count}`);
  if (checks.imageCount < 3) failures.push(`LOW_IMAGE_${checks.imageCount}`);
  if (!checks.serviceSchema) failures.push("MISSING_SERVICE_SCHEMA");
  if (!checks.faqSchema) failures.push("MISSING_FAQ_SCHEMA");
  if (!checks.hasAuthorByline) failures.push("MISSING_AUTHOR");
  if (!checks.hasH1Keyword) failures.push("H1_NO_KEYWORD");
  if (!checks.hasPhuPhiSection) failures.push("MISSING_PHU_PHI");
  if (checks.leakedEditorialNotes) failures.push("LEAKED_EDITORIAL_NOTES");
  return { checks, failures };
}

async function main() {
  if (!existsSync(DRAFT_PATH)) throw new Error(`Missing draft: ${DRAFT_PATH}`);
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const md = readFileSync(DRAFT_PATH, "utf8");
  const title = field(md, "SEO TITLE") || field(md, "Meta Title");
  const description = field(md, "META DESCRIPTION") || field(md, "Meta Description");
  const focusKeyword = field(md, "FOCUS KEYWORD") || field(md, "Focus Keyword");
  const html = markdownToHtml(md);
  const { checks, failures } = validate({ title, description, focusKeyword, html });

  mkdirSync(BACKUP_DIR, { recursive: true });
  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(join(BACKUP_DIR, `post-2787-after-preview-${STAMP}.html`), html, "utf8");

  const current = await wpRequest(auth, "GET", `/wp/v2/posts/${POST_ID}?context=edit`);
  if (current.status !== 200) throw new Error(`GET post failed: ${current.status} ${JSON.stringify(current.data).slice(0, 300)}`);
  writeFileSync(join(BACKUP_DIR, `post-2787-before-${STAMP}.json`), JSON.stringify(current.data, null, 2), "utf8");

  const report = {
    timestamp: new Date().toISOString(),
    mode: WRITE ? "write" : "dry-run",
    postId: POST_ID,
    url: CANONICAL_URL,
    draft: DRAFT_PATH,
    title,
    description,
    checks,
    failures,
  };
  const reportPath = join(REPORT_DIR, `rewrite-gia-ttc-2026-${STAMP}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(JSON.stringify(report, null, 2));
  if (failures.length) {
    throw new Error(`Preflight failed: ${failures.join(", ")}`);
  }

  if (!WRITE) {
    console.log(`[DRY-RUN] Preview: ${join(BACKUP_DIR, `post-2787-after-preview-${STAMP}.html`)}`);
    return;
  }

  const updated = await wpRequest(auth, "POST", `/wp/v2/posts/${POST_ID}`, {
    title,
    excerpt: description,
    content: html,
    status: "publish",
  });
  if (updated.status !== 200) throw new Error(`POST update failed: ${updated.status} ${JSON.stringify(updated.data).slice(0, 300)}`);

  const meta = await wpRequest(auth, "POST", "/rankmath/v1/updateMeta", {
    objectType: "post",
    objectID: POST_ID,
    meta: {
      rank_math_title: title,
      rank_math_description: description,
      rank_math_focus_keyword: focusKeyword,
    },
  });
  if (![200, 201].includes(meta.status)) {
    throw new Error(`Rank Math update failed: ${meta.status} ${JSON.stringify(meta.data).slice(0, 300)}`);
  }

  const csvPath = join(PROJECT, "docs", "SEO_PROGRESS.csv");
  appendFileSync(
    csvPath,
    `${TODAY},rewrite_gia_ttc_2026,gia-thong-tac-cong-quang-ninh,"${focusKeyword}",done,"updated post 2787 from draft; h1=1 table=${checks.tableCount} faq_schema=${checks.faqSchema}",${reportPath}\n`,
    "utf8",
  );
  console.log(`Updated live: ${updated.data.link}`);
  console.log(`Rank Math: ${meta.status}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
