import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const BACKUP_DIR = path.join(PROJECT, "seo-revisions", `wp-image-package-backup-${new Date().toISOString().slice(0, 10)}`);
const REPORT_PATH = path.join(PROJECT, `WORDPRESS_PUSH_IMAGE_PACKAGE_${new Date().toISOString().slice(0, 10)}.json`);

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function field(md, label) {
  const match = md.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : "";
}

function escapeHtml(input) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMd(input) {
  return escapeHtml(input)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function localPathFromPackage(filePath) {
  const value = String(filePath ?? "");
  if (value.startsWith("/mnt/d/")) return `D:\\${value.slice("/mnt/d/".length).replaceAll("/", "\\")}`;
  if (path.isAbsolute(value)) return value;
  return path.join(PROJECT, value);
}

async function wp(baseUrl, auth, route, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${route}`, {
    ...init,
    headers: {
      Authorization: auth,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
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

async function uploadOrFindMedia(baseUrl, auth, image) {
  const stem = path.basename(image.fileName, path.extname(image.fileName));
  const existing = await wp(baseUrl, auth, `/wp/v2/media?search=${encodeURIComponent(stem)}&per_page=20`);
  const found = Array.isArray(existing)
    ? existing.find((item) => String(item.source_url ?? "").includes(image.fileName))
    : null;
  if (found) return { media: found, uploaded: false };

  const localPath = localPathFromPackage(image.filePath);
  if (!existsSync(localPath)) throw new Error(`Khong tim thay anh: ${localPath}`);
  const media = await wp(baseUrl, auth, "/wp/v2/media", {
    method: "POST",
    headers: {
      "Content-Type": image.fileName.endsWith(".jpg") || image.fileName.endsWith(".jpeg") ? "image/jpeg" : "image/webp",
      "Content-Disposition": `attachment; filename="${image.fileName}"`,
    },
    body: createReadStream(localPath),
    duplex: "half",
  });
  await wp(baseUrl, auth, `/wp/v2/media/${media.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      alt_text: image.altText,
      caption: image.caption,
      description: image.note || "",
      title: stem.replaceAll("-", " "),
    }),
  });
  return { media, uploaded: true };
}

function figureForImage(uploadMap, alt, src) {
  const fileName = path.basename(src);
  const item = uploadMap.get(fileName);
  if (item) {
    return `<!-- wp:image {"id":${item.media.id},"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="${item.media.source_url}" alt="${escapeHtml(item.image.altText || alt)}" class="wp-image-${item.media.id}"/><figcaption class="wp-element-caption">${escapeHtml(item.image.caption)}</figcaption></figure>\n<!-- /wp:image -->`;
  }
  if (/^https?:\/\//i.test(src)) {
    return `<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"/></figure>\n<!-- /wp:image -->`;
  }
  return "";
}

function markdownToHtml(md, uploadMap) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let list = [];
  let table = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inlineMd(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push(`<ul>${list.map((item) => `<li>${inlineMd(item)}</li>`).join("")}</ul>`);
      list = [];
    }
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .filter((row) => !/^\|\s*-+/u.test(row))
      .map((row) => row.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
    if (rows.length) {
      const [head, ...body] = rows;
      out.push(`<table><thead><tr>${head.map((cell) => `<th>${inlineMd(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineMd(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
    }
    table = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }
    if (line.startsWith("<!--") || line.startsWith("-->")) continue;
    if (/^(Meta Title|Meta Description|Focus Keyword|Slug):/u.test(line)) continue;
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+[^)]*)?\)$/u);
    if (imageMatch) {
      flushParagraph();
      flushList();
      flushTable();
      const figure = figureForImage(uploadMap, imageMatch[1], imageMatch[2]);
      if (figure) out.push(figure);
      continue;
    }
    if (line.startsWith("|")) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    flushTable();
    if (line === "---") {
      flushParagraph();
      flushList();
      out.push("<hr>");
    } else if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      out.push(`<h3>${inlineMd(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      out.push(`<h2>${inlineMd(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
    } else if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2));
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  flushTable();
  return out.join("\n");
}

async function main() {
  const [mdArg, packageArg, targetIdArg = "1288", targetType = "posts"] = process.argv.slice(2);
  if (!mdArg || !packageArg) {
    console.error("Usage: node tools/push_image_package_to_wp_draft.mjs <draft.md> <image-package.json> [wp-id] [posts|pages]");
    process.exit(1);
  }

  const mdPath = path.resolve(mdArg);
  const packagePath = path.resolve(packageArg);
  const md = readFileSync(mdPath, "utf8");
  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const uploadMap = new Map();
  const uploads = [];

  for (const image of pkg.images ?? []) {
    const result = await uploadOrFindMedia(baseUrl, auth, image);
    uploadMap.set(image.fileName, { ...result, image });
    uploads.push({ fileName: image.fileName, mediaId: result.media.id, url: result.media.source_url, uploaded: result.uploaded });
  }

  const targetId = Number(targetIdArg);
  const existing = await wp(baseUrl, auth, `/wp/v2/${targetType}/${targetId}?context=edit`);
  mkdirSync(BACKUP_DIR, { recursive: true });
  const backupPath = path.join(BACKUP_DIR, `${targetType}-${targetId}-${pkg.slug || "draft"}.json`);
  writeFileSync(backupPath, JSON.stringify(existing, null, 2), "utf8");

  const html = markdownToHtml(md, uploadMap);
  const pushed = await wp(baseUrl, auth, `/wp/v2/${targetType}/${targetId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: field(md, "Meta Title"),
      content: html,
      excerpt: field(md, "Meta Description"),
      status: "publish",
      featured_media: uploads[0]?.mediaId || existing.featured_media || 0,
    }),
  });

  const report = {
    generatedAt: new Date().toISOString(),
    mdPath,
    packagePath,
    targetType,
    targetId,
    status: pushed.status,
    link: pushed.link,
    backupPath,
    uploads,
    htmlImages: (html.match(/<img\b/giu) ?? []).length,
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({ ok: true, reportPath: REPORT_PATH, ...report }, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
