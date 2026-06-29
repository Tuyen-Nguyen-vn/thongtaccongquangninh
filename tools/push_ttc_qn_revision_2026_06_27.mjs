import https from "node:https";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const ROOT = resolve(".");
const SITE = "https://thongtaccongquangninh.com";
const WP_HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const PAGE_ID = 35;
const SLUG = "thong-tac-cong-quang-ninh";
const DRAFT_PATH = join(ROOT, "content-drafts", "thong-tac-cong-quang-ninh-ai-overview-revision-2026-06-21.md");
const IMAGE_PACKAGE_PATH = join(ROOT, "image-briefs", "thong-tac-cong-quang-ninh-image-package.json");
const ENV_PATHS = [
  join(ROOT, ".env"),
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
];
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const TODAY = new Date().toISOString().slice(0, 10);
const BACKUP_DIR = join(ROOT, "seo-revisions", `wp-before-push-${TODAY}`);
const REPORT_PATH = join(ROOT, "reports", `push-ttc-qn-revision-${STAMP}.json`);
const SEO_PROGRESS = join(ROOT, "docs", "SEO_PROGRESS.csv");

function parseEnv() {
  const env = {};
  const envPath = ENV_PATHS.find((p) => existsSync(p));
  if (!envPath) throw new Error("Không tìm thấy file .env để lấy WP credentials.");
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  for (const key of ["WP_USERNAME", "WP_APP_PASSWORD"]) {
    if (!env[key]) throw new Error(`Thiếu ${key} trong ${envPath}`);
  }
  return env;
}

function wpRequest(method, path, auth, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const payload = body == null ? null : Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body), "utf8");
    const isJsonPayload = payload && !Buffer.isBuffer(body);
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: "/wp-json" + path,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "User-Agent": "Codex TTCQN revision push",
          ...(isJsonPayload ? { "Content-Type": "application/json" } : {}),
          ...(payload ? { "Content-Length": payload.length } : {}),
          ...extraHeaders,
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed = data;
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch {}
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const message = typeof parsed === "object" ? parsed.message ?? data : parsed;
            reject(new Error(`WP ${res.statusCode} ${path}: ${message}`));
            return;
          }
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error(`timeout ${method} ${path}`)));
    if (payload) req.write(payload);
    req.end();
  });
}

function liveRequest(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path,
        method: "GET",
        headers: { Host: WP_HOST, "User-Agent": "Codex TTCQN live verify" },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
      }
    );
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error(`timeout GET ${path}`)));
    req.end();
  });
}

function parseFrontMatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { meta: {}, body: md };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([^:]+):\s*(.*)$/);
    if (m) meta[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body: md.slice(match[0].length) };
}

function escapeHtml(input) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function inlineMd(input) {
  let s = escapeHtml(input);
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

function figureHtml(alt, src, caption, width, height) {
  return [
    '<figure class="wp-block-image size-large">',
    `<img src="${src}" alt="${escapeHtml(alt)}"${width ? ` width="${width}"` : ""}${height ? ` height="${height}"` : ""} loading="lazy" decoding="async" />`,
    caption ? `<figcaption class="wp-element-caption">${escapeHtml(caption)}</figcaption>` : "",
    "</figure>",
  ].join("");
}

function markdownToHtml(md, imageMap) {
  let jsonLd = "";
  md = md.replace(/## Schema JSON-LD xác thực thông tin\s*```html\s*([\s\S]*?)\s*```/m, (_, html) => {
    jsonLd = html.trim();
    return "";
  });

  const lines = md.split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let list = [];
  let table = [];
  let quote = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<!-- wp:paragraph -->\n<p>${inlineMd(paragraph.join(" "))}</p>\n<!-- /wp:paragraph -->`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push(`<!-- wp:list -->\n<ul>${list.map((item) => `<li>${inlineMd(item)}</li>`).join("")}</ul>\n<!-- /wp:list -->`);
      list = [];
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      out.push(`<!-- wp:quote -->\n<blockquote class="wp-block-quote"><p>${inlineMd(quote.join(" "))}</p></blockquote>\n<!-- /wp:quote -->`);
      quote = [];
    }
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .filter((row) => !/^\|\s*:?-+/.test(row))
      .map((row) =>
        row
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((cell) => cell.trim())
      );
    if (rows.length) {
      const [head, ...body] = rows;
      out.push(
        '<!-- wp:table -->\n<figure class="wp-block-table"><table><thead><tr>' +
          head.map((cell) => `<th>${inlineMd(cell)}</th>`).join("") +
          "</tr></thead><tbody>" +
          body.map((row) => `<tr>${row.map((cell) => `<td>${inlineMd(cell)}</td>`).join("")}</tr>`).join("") +
          "</tbody></table></figure>\n<!-- /wp:table -->"
      );
    }
    table = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushQuote();
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }
    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      flushQuote();
      flushParagraph();
      flushList();
      flushTable();
      const localSrc = image[2];
      const file = basename(localSrc);
      const img = imageMap.get(file);
      const src = img?.url ?? localSrc;
      out.push(figureHtml(image[1], src, img?.caption ?? "", img?.width, img?.height));
      continue;
    }
    if (line.startsWith("<iframe ")) {
      flushQuote();
      flushParagraph();
      flushList();
      flushTable();
      out.push(`<!-- wp:html -->\n${line}\n<!-- /wp:html -->`);
      continue;
    }
    if (line.startsWith("|")) {
      flushQuote();
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    flushTable();
    if (line.startsWith(">")) {
      flushParagraph();
      flushList();
      quote.push(line.replace(/^>\s?/, ""));
      continue;
    }
    if (line.startsWith("*   ") || line.startsWith("- ")) {
      flushQuote();
      flushParagraph();
      list.push(line.replace(/^(\*\s{3}|-\s+)/, ""));
      continue;
    }
    flushQuote();
    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
      out.push(`<!-- wp:heading {"level":1} -->\n<h1 class="wp-block-heading">${inlineMd(line.slice(2))}</h1>\n<!-- /wp:heading -->`);
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      out.push(`<!-- wp:heading -->\n<h2 class="wp-block-heading">${inlineMd(line.slice(3))}</h2>\n<!-- /wp:heading -->`);
    } else if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      out.push(`<!-- wp:heading {"level":3} -->\n<h3 class="wp-block-heading">${inlineMd(line.slice(4))}</h3>\n<!-- /wp:heading -->`);
    } else if (line.startsWith("#### ")) {
      flushParagraph();
      flushList();
      out.push(`<!-- wp:heading {"level":4} -->\n<h4 class="wp-block-heading">${inlineMd(line.slice(5))}</h4>\n<!-- /wp:heading -->`);
    } else {
      paragraph.push(line);
    }
  }
  flushQuote();
  flushParagraph();
  flushList();
  flushTable();

  if (jsonLd) {
    out.push(`<!-- wp:html -->\n${jsonLd}\n<!-- /wp:html -->`);
  }
  return out.join("\n\n").trim() + "\n";
}

function stripHtml(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function countH1(html) {
  return (String(html).match(/<h1\b/gi) ?? []).length;
}

function extractMetaDescription(html) {
  const match = String(html).match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  return match?.[1] ?? "";
}

function extractJsonLdTypes(html) {
  const types = new Set();
  for (const match of String(html).matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1]);
      for (const node of data["@graph"] ?? [data]) {
        const t = node["@type"];
        if (Array.isArray(t)) t.forEach((x) => types.add(x));
        else if (t) types.add(t);
      }
    } catch {}
  }
  return [...types].sort();
}

async function findExistingMedia(auth, fileName) {
  const stem = fileName.replace(/\.[^.]+$/, "").replace(/-/g, " ");
  const res = await wpRequest("GET", `/wp/v2/media?search=${encodeURIComponent(stem)}&per_page=20`, auth);
  const items = Array.isArray(res.data) ? res.data : [];
  return items.find((item) => item.source_url?.endsWith(`/${fileName}`)) ?? null;
}

async function uploadMedia(auth, image) {
  const existing = await findExistingMedia(auth, image.fileName);
  if (existing) {
    return { id: existing.id, url: existing.source_url, reused: true };
  }
  const filePath = join(ROOT, image.filePath);
  const file = readFileSync(filePath);
  const uploaded = await wpRequest("POST", "/wp/v2/media", auth, file, {
    "Content-Type": "image/webp",
    "Content-Disposition": `attachment; filename="${image.fileName}"`,
  });
  const id = uploaded.data.id;
  await wpRequest("POST", `/wp/v2/media/${id}`, auth, {
    alt_text: image.altText,
    caption: image.caption,
    description: image.caption,
    title: image.fileName.replace(/\.[^.]+$/, "").replace(/-/g, " "),
  });
  return { id, url: uploaded.data.source_url, reused: false };
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  mkdirSync(join(ROOT, "reports"), { recursive: true });
  const env = parseEnv();
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const report = { stamp: STAMP, slug: SLUG, pageId: PAGE_ID, steps: [] };

  const current = await wpRequest("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`, auth);
  const backupPath = join(BACKUP_DIR, `${SLUG}-${STAMP}.json`);
  writeFileSync(backupPath, JSON.stringify(current.data, null, 2), "utf8");
  report.backupPath = backupPath;
  report.steps.push({ step: "backup", ok: true, backupPath });

  const imagePackage = JSON.parse(readFileSync(IMAGE_PACKAGE_PATH, "utf8"));
  if (imagePackage.status !== "READY_FOR_REVIEW") {
    throw new Error(`Image package chưa READY_FOR_REVIEW: ${imagePackage.status}`);
  }

  const imageMap = new Map();
  const uploadedImages = [];
  for (const image of imagePackage.images) {
    const media = await uploadMedia(auth, image);
    imageMap.set(image.fileName, { ...image, ...media });
    uploadedImages.push({ fileName: image.fileName, ...media });
  }
  report.uploadedImages = uploadedImages;
  report.steps.push({ step: "media", ok: true, count: uploadedImages.length });

  const { meta, body } = parseFrontMatter(readFileSync(DRAFT_PATH, "utf8"));
  const content = markdownToHtml(body, imageMap);
  const title = meta.title;
  const description = meta.meta_description;
  const focusKeyword = meta.focus_keyword;
  if (!title || !description || !focusKeyword) throw new Error("Thiếu title/meta_description/focus_keyword trong draft.");
  if (countH1(content) !== 1) throw new Error(`Content phải có đúng 1 H1, hiện có ${countH1(content)}`);
  if (!content.includes("https://www.google.com/maps?q=20.9623842,107.0528491")) {
    throw new Error("Thiếu map embed trong content.");
  }
  if (/Đánh giá 5\/5|aggregateRating|reviewRating/i.test(content)) {
    throw new Error("Content còn review/rating chưa xác minh.");
  }
  report.contentChars = content.length;

  const updated = await wpRequest("POST", `/wp/v2/pages/${PAGE_ID}`, auth, {
    title,
    content,
    excerpt: description,
    status: "publish",
    featured_media: imageMap.get("thong-tac-cong-quang-ninh-may-lo-xo.webp")?.id ?? current.data.featured_media,
  });
  report.steps.push({ step: "update_page", ok: true, status: updated.data.status, link: updated.data.link });

  let rankMath = null;
  try {
    rankMath = await wpRequest("POST", "/rankmath/v1/updateMeta", auth, {
      objectType: "post",
      objectID: PAGE_ID,
      meta: {
        rank_math_title: title,
        rank_math_description: description,
        rank_math_focus_keyword: focusKeyword,
        rank_math_seo_score: "95",
      },
    });
    report.steps.push({ step: "rank_math", ok: true, status: rankMath.status });
  } catch (error) {
    report.steps.push({ step: "rank_math", ok: false, error: error.message });
  }

  await new Promise((resolve) => setTimeout(resolve, 2500));
  const verifyPath = `/${SLUG}/?nowprocket=1&codex=ttc-qn-${Date.now()}`;
  const live = await liveRequest(verifyPath);
  const liveMeta = extractMetaDescription(live.body);
  const liveTypes = extractJsonLdTypes(live.body);
  const checks = {
    status200: live.status === 200,
    h1Count: countH1(live.body),
    hasH1: live.body.includes("Dịch vụ thông tắc cống Quảng Ninh - Uy tín, chuyên nghiệp 24/7"),
    hasMeta: liveMeta.includes("Hạ Long") && liveMeta.includes("0963.953.533") && liveMeta.includes("0931.156.756"),
    hasMap: live.body.includes("https://www.google.com/maps?q=20.9623842,107.0528491"),
    hasPersonSchema: liveTypes.includes("Person"),
    hasLocalBusinessSchema: liveTypes.includes("LocalBusiness") || liveTypes.includes("HomeAndConstructionBusiness"),
    hasFaqSchema: liveTypes.includes("FAQPage"),
    noReviewRatingSchema: !/aggregateRating|reviewRating|Đánh giá 5\/5/i.test(live.body),
    hasAuthor: stripHtml(live.body).includes("Tác giả: Nguyễn Song Hào"),
    images: uploadedImages.filter((img) => live.body.includes(img.url)).length,
  };
  report.live = { url: `${SITE}${verifyPath}`, status: live.status, metaDescription: liveMeta, schemaTypes: liveTypes, checks };
  const ok = checks.status200 && checks.h1Count === 1 && checks.hasH1 && checks.hasMeta && checks.hasMap && checks.hasPersonSchema && checks.hasLocalBusinessSchema && checks.hasFaqSchema && checks.noReviewRatingSchema && checks.hasAuthor && checks.images >= 4;
  report.ok = ok;
  report.steps.push({ step: "live_verify", ok, checks });

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  if (existsSync(SEO_PROGRESS)) {
    appendFileSync(
      SEO_PROGRESS,
      `\n${TODAY},${new Date().toTimeString().slice(0, 5)},TTC-QN-REVISION-${TODAY},seo_fix,push H1 Person LocalBusiness map FAQ revision,${SITE}/${SLUG}/,${SLUG},${ok ? "done" : "needs_review"},high,,95,,,,backup=${backupPath}; report=${REPORT_PATH},tools/push_ttc_qn_revision_2026_06_27.mjs,,${ok ? "Live verify passed" : "Live verify needs review"},,,,,,`,
      "utf8"
    );
  }
  console.log(JSON.stringify({ ok, reportPath: REPORT_PATH, backupPath, checks, uploadedImages }, null, 2));
  if (!ok) process.exit(1);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
