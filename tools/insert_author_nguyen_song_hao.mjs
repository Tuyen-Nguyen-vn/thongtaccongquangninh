import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DEFAULT_ENV_PATH = existsSync("/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env")
  ? "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env"
  : "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const BASE_URL = "https://thongtaccongquangninh.com";
const AUTHOR_NAME = "Nguyễn Song Hào";
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const BUSINESS_NAME = "Môi Trường Đô Thị Số 1 Quảng Ninh";
const MARKER = "ttcqn-author-nguyen-song-hao";
const DEFAULT_TARGETS = [
  "https://thongtaccongquangninh.com/thong-tac-bon-cau-khan-cap-quang-ninh/",
  "https://thongtaccongquangninh.com/thong-tac-bon-cau-khan-cap-quang-ninh-2/",
];

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function parseArgs(argv) {
  const out = { dryRun: false, includeDrafts: false, env: DEFAULT_ENV_PATH, inventory: "", targetsFile: "", targets: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--include-drafts") out.includeDrafts = true;
    else if (arg === "--env") out.env = argv[++i];
    else if (arg === "--inventory") out.inventory = argv[++i];
    else if (arg === "--targets-file") out.targetsFile = argv[++i];
    else out.targets.push(arg);
  }
  return out;
}

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function escapeHtml(input) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripTags(input) {
  return String(input ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function slugFromPath(pathname) {
  return pathname === "/" ? "" : pathname.replace(/^\/|\/$/g, "");
}

function resolveProjectPath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

function uniqueItems(items) {
  return [...new Set(items.filter(Boolean))];
}

function loadTargets(args) {
  const targets = [...args.targets];
  const skipped = [];
  const inventoryStats = {
    mode: args.inventory ? "inventory" : args.targetsFile ? "targets-file" : "default-targets",
    publishRows: 0,
    postTargets: 0,
    skippedPublishRows: 0,
  };

  if (args.targetsFile) {
    const lines = readFileSync(resolveProjectPath(args.targetsFile), "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    targets.push(...lines);
  }

  if (args.inventory) {
    const inventory = JSON.parse(readFileSync(resolveProjectPath(args.inventory), "utf8"));
    const rows = Array.isArray(inventory.rows) ? inventory.rows : [];
    const publishRows = rows.filter((row) => row.status === "publish");
    inventoryStats.publishRows = publishRows.length;
    for (const row of publishRows) {
      if (row.post_type === "post" && row.link) {
        targets.push(row.link);
        continue;
      }
      let reason = "Bỏ qua: không phải WordPress post publish dùng post_content thường";
      if (row.post_type === "page") {
        reason = "Bỏ qua: page publish; nhóm page có thể dùng renderer/option/plugin custom";
      } else if (row.post_type === "sitemap_only") {
        reason = "Bỏ qua: sitemap/category-only; không có REST post_content để chèn author box";
      }
      skipped.push({
        targetUrl: row.link,
        type: row.post_type,
        id: row.id || null,
        title: row.title || "",
        reason,
      });
    }
  }

  const uniqueTargets = uniqueItems(targets);
  if (!uniqueTargets.length) uniqueTargets.push(...DEFAULT_TARGETS);
  inventoryStats.postTargets = uniqueTargets.length;
  inventoryStats.skippedPublishRows = skipped.length;
  return { targets: uniqueTargets, skipped, inventoryStats };
}

async function wp(baseUrl, auth, route, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${route}`, {
    ...init,
    headers: {
      Authorization: auth,
      "User-Agent": "Codex Nguyen Song Hao author inserter",
      ...(init.headers ?? {}),
    },
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message ?? raw : payload;
    throw new Error(`WordPress ${response.status} ${route}: ${message}`);
  }
  return payload;
}

async function findContentObject(baseUrl, auth, targetUrl) {
  const url = new URL(targetUrl, baseUrl);
  const slug = slugFromPath(url.pathname);
  for (const type of ["posts", "pages"]) {
    const items = await wp(
      baseUrl,
      auth,
      `/wp/v2/${type}?slug=${encodeURIComponent(slug)}&status=publish,draft,pending,private,future&context=edit`
    );
    if (Array.isArray(items) && items.length) return { type, item: items[0], pathname: url.pathname };
  }
  return null;
}

function authorBylineBlock(modifiedDate) {
  const updated = new Date(modifiedDate).toLocaleDateString("vi-VN", { timeZone: "Asia/Bangkok" });
  return [
    `<!-- wp:paragraph {"className":"${MARKER} ttcqn-author-byline"} -->`,
    `<p class="${MARKER} ttcqn-author-byline"><strong>Tác giả:</strong> <a href="${AUTHOR_URL}" rel="author">${AUTHOR_NAME}</a> · <strong>Cập nhật:</strong> ${updated}</p>`,
    "<!-- /wp:paragraph -->",
  ].join("\n");
}

function authorBoxBlock() {
  return [
    `<!-- wp:group {"className":"${MARKER} ttcqn-author-box","layout":{"type":"constrained"}} -->`,
    `<div class="wp-block-group ${MARKER} ttcqn-author-box">`,
    "<!-- wp:heading {\"level\":2} -->",
    `<h2 class="wp-block-heading">Tác giả bài viết</h2>`,
    "<!-- /wp:heading -->",
    "<!-- wp:paragraph -->",
    `<p>Bài viết được biên soạn bởi <strong><a href="${AUTHOR_URL}" rel="author">${AUTHOR_NAME}</a></strong>, phụ trách nội dung SEO và thông tin dịch vụ cho ${BUSINESS_NAME}.</p>`,
    "<!-- /wp:paragraph -->",
    "<!-- wp:paragraph -->",
    `<p>Nội dung tập trung vào các dịch vụ hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh. Khi cần xử lý gấp, gọi <strong>0963.953.533 / 0931.156.756</strong>.</p>`,
    "<!-- /wp:paragraph -->",
    "</div>",
    "<!-- /wp:group -->",
  ].join("\n");
}

function authorFinalLineBlock() {
  return [
    `<!-- wp:paragraph {"className":"${MARKER} ttcqn-author-final"} -->`,
    `<p class="${MARKER} ttcqn-author-final"><strong>Tác giả:</strong> <a href="${AUTHOR_URL}" rel="author">${AUTHOR_NAME}</a></p>`,
    "<!-- /wp:paragraph -->",
  ].join("\n");
}

function jsonLdBlock(item, targetUrl, modifiedIso) {
  const title = stripTags(item.title?.raw || item.title?.rendered || "");
  const description = stripTags(item.excerpt?.raw || item.excerpt?.rendered || "").slice(0, 300);
  const modified = modifiedIso;
  const published = item.date_gmt ? `${item.date_gmt}Z` : item.date || modified;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${targetUrl}#blogposting`,
    "mainEntityOfPage": targetUrl,
    "headline": title,
    "description": description,
    "datePublished": published,
    "dateModified": modified,
    "author": {
      "@type": "Person",
      "name": AUTHOR_NAME,
      "url": AUTHOR_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name": BUSINESS_NAME,
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/wp-content/uploads/2026/04/logo-cong-ty.png`,
      },
    },
  };
  return [
    `<!-- wp:html -->`,
    `<script type="application/ld+json" data-${MARKER}="1">${JSON.stringify(schema)}</script>`,
    "<!-- /wp:html -->",
  ].join("\n");
}

function insertAfterFirstParagraph(content, block) {
  const match = content.match(/<\/p>/i);
  if (!match) return `${block}\n\n${content}`;
  const index = match.index + match[0].length;
  return `${content.slice(0, index)}\n\n${block}\n\n${content.slice(index)}`;
}

function insertBeforeLastContact(content, block) {
  const matches = [...content.matchAll(/<h2[^>]*>[\s\S]*?(gọi|goi|liên hệ|lien he|nap)[\s\S]*?<\/h2>/giu)];
  if (matches.length) {
    const last = matches[matches.length - 1];
    return `${content.slice(0, last.index)}\n\n${block}\n\n${content.slice(last.index)}`;
  }
  return `${content}\n\n${block}`;
}

function upsertAuthorContent(content, item, targetUrl, modifiedIso) {
  let next = String(content ?? "");
  const hadAuthor = next.includes(MARKER);
  next = next.replace(new RegExp(`<!-- wp:paragraph \\{"className":"${MARKER}[\\s\\S]*?<!-- /wp:paragraph -->\\s*`, "gu"), "");
  next = next.replace(new RegExp(`<!-- wp:group \\{"className":"${MARKER}[\\s\\S]*?<!-- /wp:group -->\\s*`, "gu"), "");
  next = next.replace(new RegExp(`<!-- wp:html -->\\s*<script type="application/ld\\+json" data-${MARKER}="1">[\\s\\S]*?</script>\\s*<!-- /wp:html -->\\s*`, "gu"), "");
  next = insertAfterFirstParagraph(next, authorBylineBlock(modifiedIso));
  next = insertBeforeLastContact(next, authorBoxBlock());
  next = `${next}\n\n${jsonLdBlock(item, targetUrl, modifiedIso)}\n\n${authorFinalLineBlock()}`;
  return { content: next, hadAuthor };
}

async function verifyPublic(targetUrl) {
  const url = new URL(targetUrl);
  url.searchParams.set("nowprocket", "1");
  url.searchParams.set("codex", `author-${Date.now()}`);
  const response = await fetch(url, { headers: { "User-Agent": "Codex Nguyen Song Hao author verifier" } });
  const html = await response.text();
  const hasBlogPosting = html.includes('"@type":"BlogPosting"') || html.includes('"@type": "BlogPosting"');
  const hasAuthorSchema =
    html.includes(`data-${MARKER}="1"`) &&
    html.includes(`"name":"${AUTHOR_NAME}"`) &&
    html.includes(`"url":"${AUTHOR_URL}"`);
  return {
    url: url.toString(),
    status: response.status,
    hasAuthorName: html.includes(AUTHOR_NAME),
    hasAuthorUrl: html.includes(AUTHOR_URL),
    hasMarker: html.includes(MARKER),
    hasByline: html.includes("<strong>Tác giả:</strong>") && html.includes(AUTHOR_NAME),
    hasAuthorBox: html.includes("Tác giả bài viết") && html.includes(BUSINESS_NAME),
    hasFinalAuthorLine: html.includes("ttcqn-author-final") && html.includes(AUTHOR_URL),
    hasBlogPosting,
    hasAuthorSchema,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = parseEnv(args.env);
  const baseUrl = env.WP_BASE_URL || BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const { targets, skipped: upfrontSkipped, inventoryStats } = loadTargets(args);
  const runStamp = stamp();
  const backupDir = path.join(ROOT, "seo-revisions", `wp-before-author-nguyen-song-hao-${runStamp}`);
  const reportPath = path.join(ROOT, `WORDPRESS_AUTHOR_NGUYEN_SONG_HAO_${runStamp}.json`);
  mkdirSync(backupDir, { recursive: true });

  const updated = [];
  const skipped = [...upfrontSkipped];
  const verified = [];

  for (const targetUrl of targets) {
    const found = await findContentObject(baseUrl, auth, targetUrl);
    if (!found) {
      skipped.push({ targetUrl, reason: "Không tìm thấy post/page" });
      continue;
    }
    const { type, item, pathname } = found;
    if (type !== "posts") {
      skipped.push({
        targetUrl,
        type,
        id: item.id,
        reason: "Bỏ qua: không phải post publish dùng post_content thường",
      });
      continue;
    }
    if (item.status !== "publish" && !args.includeDrafts) {
      skipped.push({ targetUrl, type, id: item.id, status: item.status, reason: "Bỏ qua: không phải publish" });
      continue;
    }
    const currentRaw = item.content?.raw || "";
    const current = currentRaw || item.content?.rendered || "";
    if (!currentRaw || stripTags(currentRaw).length < 300) {
      skipped.push({
        targetUrl,
        type,
        id: item.id,
        reason: "Bỏ qua: raw post_content rỗng/ngắn, nghi không phải nguồn render chính",
      });
      continue;
    }
    const modifiedIso = new Date().toISOString();
    const { content, hadAuthor } = upsertAuthorContent(current, item, targetUrl, modifiedIso);
    if (content === current) {
      skipped.push({ targetUrl, type, id: item.id, reason: "Không có thay đổi" });
      continue;
    }
    const backupPath = path.join(backupDir, `${type}-${item.id}-${slugFromPath(pathname)}.json`);
    if (!args.dryRun) {
      writeFileSync(backupPath, JSON.stringify(item, null, 2), "utf8");
      await wp(baseUrl, auth, `/wp/v2/${type}/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (item.status === "publish") {
        verified.push({ targetUrl, type, id: item.id, ...(await verifyPublic(targetUrl)) });
      }
    }
    updated.push({
      targetUrl,
      type,
      id: item.id,
      status: item.status,
      title: stripTags(item.title?.raw || item.title?.rendered || ""),
      hadAuthor,
      backupPath,
    });
  }

  const verificationFailed = verified.filter((item) => !(
    item.status === 200 &&
    item.hasAuthorName &&
    item.hasAuthorUrl &&
    item.hasMarker &&
    item.hasByline &&
    item.hasAuthorBox &&
    item.hasBlogPosting &&
    item.hasAuthorSchema
  ));
  const publicUpdatedCount = updated.filter((item) => item.status === "publish").length;
  const result = {
    ok: args.dryRun ? true : verificationFailed.length === 0 && verified.length === publicUpdatedCount,
    dryRun: args.dryRun,
    includeDrafts: args.includeDrafts,
    generatedAt: new Date().toISOString(),
    author: { name: AUTHOR_NAME, url: AUTHOR_URL },
    inventoryStats,
    backupDir,
    updated,
    skipped,
    verified,
    verificationFailed,
  };
  writeFileSync(reportPath, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify({ reportPath, ...result }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
