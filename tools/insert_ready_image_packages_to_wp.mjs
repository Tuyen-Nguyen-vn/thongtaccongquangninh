import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DEFAULT_ENV_PATH = existsSync("/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env")
  ? "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env"
  : "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const BASE_URL = "https://thongtaccongquangninh.com";

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function parseArgs(argv) {
  const out = { packages: [], dryRun: false, env: DEFAULT_ENV_PATH, minImages: 3 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--env") out.env = argv[++i];
    else if (arg === "--min-images") out.minImages = Number(argv[++i] || 3);
    else out.packages.push(arg);
  }
  if (!out.packages.length) {
    throw new Error("Usage: node tools/insert_ready_image_packages_to_wp.mjs [--dry-run] <image-package.json> [...]");
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

function localPath(input) {
  const value = String(input ?? "");
  if (value.startsWith("/mnt/d/")) return value;
  if (path.isAbsolute(value)) return value;
  return path.join(ROOT, value);
}

function slugFromPath(pathname) {
  return pathname === "/" ? "" : pathname.replace(/^\/|\/$/g, "");
}

function imageCount(content) {
  return (String(content ?? "").match(/<img\b/giu) ?? []).length;
}

async function wp(baseUrl, auth, route, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${route}`, {
    ...init,
    headers: {
      Authorization: auth,
      "User-Agent": "Codex ready image package inserter",
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
  for (const type of ["pages", "posts"]) {
    const items = await wp(
      baseUrl,
      auth,
      `/wp/v2/${type}?slug=${encodeURIComponent(slug)}&status=publish,draft,pending,private,future&context=edit`
    );
    if (Array.isArray(items) && items.length) return { type, item: items[0], pathname: url.pathname };
  }
  return null;
}

async function uploadOrFindMedia(baseUrl, auth, image, dryRun) {
  const fileName = image.fileName || path.basename(image.filePath || "");
  const stem = path.basename(fileName, path.extname(fileName));
  const existing = await wp(baseUrl, auth, `/wp/v2/media?search=${encodeURIComponent(stem)}&per_page=20`);
  const found = Array.isArray(existing)
    ? existing.find((item) => String(item.source_url ?? "").includes(fileName))
    : null;
  if (found) return { media: found, uploaded: false };
  if (dryRun) return { media: { id: 0, source_url: `DRY_RUN/${fileName}` }, uploaded: false };

  const filePath = localPath(image.filePath);
  if (!existsSync(filePath)) throw new Error(`Không tìm thấy ảnh: ${filePath}`);
  const media = await wp(baseUrl, auth, "/wp/v2/media", {
    method: "POST",
    headers: {
      "Content-Type": fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") ? "image/jpeg" : "image/webp",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
    body: createReadStream(filePath),
    duplex: "half",
  });
  await wp(baseUrl, auth, `/wp/v2/media/${media.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      alt_text: image.altText || "",
      caption: image.caption || "",
      description: image.note || "",
      title: stem.replaceAll("-", " "),
    }),
  });
  return { media, uploaded: true };
}

function figureHtml(media, image) {
  const alt = image.altText || path.basename(image.fileName, path.extname(image.fileName)).replaceAll("-", " ");
  const caption = image.caption || "";
  const captionHtml = caption ? `<figcaption class="wp-element-caption">${escapeHtml(caption)}</figcaption>` : "";
  return `<!-- wp:image {"id":${media.id},"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="${media.source_url}" alt="${escapeHtml(alt)}" class="wp-image-${media.id}"/>${captionHtml}</figure>\n<!-- /wp:image -->`;
}

function insertFigure(content, figure, placement) {
  const value = String(placement ?? "");
  if (/đầu bài|dau bai|sau mở bài|sau mo bai|intro/i.test(value)) {
    const firstParagraph = content.match(/<\/p>/i);
    if (firstParagraph) {
      const index = firstParagraph.index + firstParagraph[0].length;
      return `${content.slice(0, index)}\n\n${figure}\n\n${content.slice(index)}`;
    }
  }
  if (/case|khách hàng|khach hang|tình huống|tinh huong/i.test(value)) {
    const match = content.search(/<h2[^>]*>[\s\S]*?(case|khách hàng|khach hang|tình huống|tinh huong|niềm tin)[\s\S]*?<\/h2>/iu);
    if (match >= 0) return `${content.slice(0, match)}\n\n${figure}\n\n${content.slice(match)}`;
  }
  if (/quy trình|quy trinh|thi công|thi cong|xử lý|xu ly/i.test(value)) {
    const match = content.search(/<h2[^>]*>[\s\S]*?(quy trình|quy trinh|thi công|thi cong|xử lý|xu ly)[\s\S]*?<\/h2>/iu);
    if (match >= 0) return `${content.slice(0, match)}\n\n${figure}\n\n${content.slice(match)}`;
  }
  const contactMatch = content.search(/<h2[^>]*>[\s\S]*?(gọi|goi|liên hệ|lien he|nap)[\s\S]*?<\/h2>/iu);
  if (contactMatch >= 0) return `${content.slice(0, contactMatch)}\n\n${figure}\n\n${content.slice(contactMatch)}`;
  return `${content}\n\n${figure}`;
}

async function verifyPublic(baseUrl, targetUrl, fileNames) {
  const url = new URL(targetUrl, baseUrl);
  url.searchParams.set("nowprocket", "1");
  url.searchParams.set("codex", `image-${Date.now()}`);
  const response = await fetch(url, { headers: { "User-Agent": "Codex ready image package verifier" } });
  const html = await response.text();
  return {
    url: url.toString(),
    status: response.status,
    imageCount: imageCount(html),
    filesPresent: Object.fromEntries(fileNames.map((file) => [file, html.includes(file)])),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = parseEnv(args.env);
  const baseUrl = env.WP_BASE_URL || BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const runStamp = stamp();
  const backupDir = path.join(ROOT, "seo-revisions", `wp-before-insert-ready-image-packages-${runStamp}`);
  const reportPath = path.join(ROOT, `WORDPRESS_INSERT_READY_IMAGE_PACKAGES_${runStamp}.json`);
  mkdirSync(backupDir, { recursive: true });

  const results = [];
  const uploads = [];
  const inserted = [];
  const skipped = [];
  const verified = [];

  for (const packageArg of args.packages) {
    const packagePath = path.resolve(packageArg);
    const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
    const targetUrl = pkg.url || pkg.images?.find((image) => image.pageUrl)?.pageUrl;
    if (!targetUrl) {
      skipped.push({ packagePath, reason: "Thiếu url/pageUrl trong image package" });
      continue;
    }
    const found = await findContentObject(baseUrl, auth, targetUrl);
    if (!found) {
      skipped.push({ packagePath, targetUrl, reason: "Không tìm thấy page/post theo slug" });
      continue;
    }
    const { type, item, pathname } = found;
    const beforeContent = item.content?.raw || item.content?.rendered || "";
    const beforeImages = imageCount(beforeContent);
    let content = beforeContent;
    const pageFiles = [];
    const pageInserted = [];
    const availableImages = (pkg.images ?? []).filter((image) => image.fileName && image.filePath);

    for (const image of availableImages) {
      pageFiles.push(image.fileName);
      if (content.includes(image.fileName)) {
        skipped.push({ packagePath, targetUrl, fileName: image.fileName, reason: "Ảnh đã có trong nội dung" });
        continue;
      }
      if (image.isPoster || image.containsPrivateInfo || image.privacyOk === false || image.customerFaceVisible) {
        skipped.push({ packagePath, targetUrl, fileName: image.fileName, reason: "Không đạt metadata an toàn ảnh" });
        continue;
      }
      if (imageCount(content) >= args.minImages) {
        skipped.push({ packagePath, targetUrl, fileName: image.fileName, reason: `Nội dung đã đủ ${args.minImages} ảnh` });
        continue;
      }
      const { media, uploaded } = await uploadOrFindMedia(baseUrl, auth, image, args.dryRun);
      uploads.push({ packagePath, targetUrl, fileName: image.fileName, mediaId: media.id, url: media.source_url, uploaded });
      content = insertFigure(content, figureHtml(media, image), image.placement);
      pageInserted.push({
        targetUrl,
        type,
        id: item.id,
        fileName: image.fileName,
        mediaId: media.id,
        alt: image.altText,
        caption: image.caption,
        placement: image.placement,
      });
    }

    if (pageInserted.length && !args.dryRun) {
      const backupPath = path.join(backupDir, `${type}-${item.id}-${slugFromPath(pathname) || "home"}.json`);
      writeFileSync(backupPath, JSON.stringify(item, null, 2), "utf8");
      await wp(baseUrl, auth, `/wp/v2/${type}/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    }

    inserted.push(...pageInserted);
    const afterImages = imageCount(content);
    const verification = args.dryRun
      ? null
      : await verifyPublic(baseUrl, targetUrl, pageInserted.map((entry) => entry.fileName));
    if (verification) verified.push({ targetUrl, type, id: item.id, ...verification });
    results.push({
      packagePath,
      targetUrl,
      type,
      id: item.id,
      title: item.title?.raw || item.title?.rendered || "",
      beforeImages,
      afterImages,
      insertedCount: pageInserted.length,
    });
  }

  const result = {
    ok: true,
    dryRun: args.dryRun,
    generatedAt: new Date().toISOString(),
    backupDir,
    packages: args.packages.map((item) => path.resolve(item)),
    results,
    uploads,
    inserted,
    skipped,
    verified,
  };
  writeFileSync(reportPath, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify({ reportPath, ...result }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
