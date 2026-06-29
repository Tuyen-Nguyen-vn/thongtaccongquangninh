import { createReadStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const IMAGE_DIR = join(PROJECT, "_tmp", "anh-seo-local-da-toi-uu-doi-ten");
const MAPPING_CSV = join(IMAGE_DIR, "mapping-anh-seo-local-da-toi-uu.csv");
const REPORT_PATH = join(PROJECT, "WORDPRESS_UPLOAD_INSERT_SEO_IMAGES_2026-05-06.json");
const BACKUP_DIR = join(PROJECT, "seo-revisions", `wp-before-insert-seo-images-2026-05-06`);
const BASE_URL = "https://thongtaccongquangninh.com";
const DRY_RUN = process.argv.includes("--dry-run");
const TARGET_ALIASES = new Map([
  ["/hut-be-phot/", ["/hut-be-phot-quang-ninh/"]],
  ["/thong-tac-cong/", ["/thong-tac-cong-quang-ninh/"]],
  ["/thong-tac-bon-cau/", ["/thong-tac-bon-cau-quang-ninh/"]],
  ["/thong-tac-chau-rua/", ["/thong-tac-chau-rua-quang-ninh/"]],
  ["/nao-vet-ho-ga/", ["/nao-vet-ho-ga-quang-ninh/"]],
  ["/thong-tac-cong-nha-hang/", ["/thong-tac-cong-nha-hang-ha-long/"]],
]);

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  values.push(value);
  return values;
}

function normalizeUrlPath(input) {
  const value = String(input ?? "").trim();
  if (!value || !value.startsWith("/")) return null;
  try {
    const url = new URL(value, BASE_URL);
    return url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "/");
  } catch {
    return null;
  }
}

function targetPaths(row) {
  const directPaths = row.target_page
    .split(",")
    .map((item) => normalizeUrlPath(item))
    .filter(Boolean);
  const expanded = directPaths.flatMap((targetPath) => [targetPath, ...(TARGET_ALIASES.get(targetPath) ?? [])]);
  return [...new Set(expanded)];
}

function slugFromPath(pathname) {
  return pathname === "/" ? "" : pathname.replace(/^\/|\/$/g, "");
}

function escapeHtml(input) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function figureHtml({ media, row, targetPath }) {
  const alt = row.alt || basename(row.new_file, extname(row.new_file)).replaceAll("-", " ");
  const caption = row.caption || `Ảnh minh họa dịch vụ tại ${targetPath}`;
  return `<!-- wp:image {"id":${media.id},"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="${media.source_url}" alt="${escapeHtml(alt)}" class="wp-image-${media.id}"/><figcaption class="wp-element-caption">${escapeHtml(caption)}</figcaption></figure>\n<!-- /wp:image -->`;
}

function insertFigure(content, figure, position) {
  if (/đầu bài|gioi thieu|giới thiệu|ảnh đầu bài/iu.test(position)) {
    const firstParagraph = content.match(/<\/p>/i);
    if (firstParagraph) {
      const index = firstParagraph.index + firstParagraph[0].length;
      return `${content.slice(0, index)}\n\n${figure}\n\n${content.slice(index)}`;
    }
  }
  if (/case study|khách hàng|doanh nghiệp|niềm tin|trust/iu.test(position)) {
    const caseMatch = content.search(/<h2[^>]*>[\s\S]*?(case|khách hàng|doanh nghiệp|e-e-a-t|niềm tin)[\s\S]*?<\/h2>/iu);
    if (caseMatch >= 0) return `${content.slice(0, caseMatch)}\n\n${figure}\n\n${content.slice(caseMatch)}`;
  }
  if (/quy trình|xử lý|thi công/iu.test(position)) {
    const processMatch = content.search(/<h2[^>]*>[\s\S]*?(quy trình|thi công|xử lý)[\s\S]*?<\/h2>/iu);
    if (processMatch >= 0) return `${content.slice(0, processMatch)}\n\n${figure}\n\n${content.slice(processMatch)}`;
  }
  const ctaMatch = content.search(/<h2[^>]*>[\s\S]*?(gọi|liên hệ|nap)[\s\S]*?<\/h2>/iu);
  if (ctaMatch >= 0) return `${content.slice(0, ctaMatch)}\n\n${figure}\n\n${content.slice(ctaMatch)}`;
  return `${content}\n\n${figure}`;
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "User-Agent": "Codex SEO image upload",
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
    throw new Error(`WordPress ${response.status} ${path}: ${message}`);
  }
  return payload;
}

async function uploadMedia(baseUrl, auth, row) {
  const filePath = join(IMAGE_DIR, row.new_file);
  const existing = await wp(
    baseUrl,
    auth,
    `/wp/v2/media?search=${encodeURIComponent(basename(row.new_file, extname(row.new_file)))}&per_page=20`
  );
  const found = Array.isArray(existing)
    ? existing.find((item) => item.source_url && item.source_url.includes(row.new_file))
    : null;
  if (found) return { media: found, uploaded: false };
  if (DRY_RUN) return { media: { id: 0, source_url: `DRY_RUN/${row.new_file}` }, uploaded: false };

  const media = await wp(baseUrl, auth, "/wp/v2/media", {
    method: "POST",
    headers: {
      "Content-Type": "image/webp",
      "Content-Disposition": `attachment; filename="${row.new_file}"`,
    },
    body: createReadStream(filePath),
    duplex: "half",
  });
  await wp(baseUrl, auth, `/wp/v2/media/${media.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      alt_text: row.alt,
      caption: row.caption,
      description: row.note,
      title: basename(row.new_file, extname(row.new_file)).replaceAll("-", " "),
    }),
  });
  return { media, uploaded: true };
}

async function findContentObject(baseUrl, auth, targetPath) {
  if (targetPath === "/") {
    const settings = await wp(baseUrl, auth, "/wp/v2/settings");
    const pageId = Number(settings.page_on_front);
    if (!pageId) return null;
    const page = await wp(baseUrl, auth, `/wp/v2/pages/${pageId}?context=edit`);
    return { type: "pages", item: page };
  }
  const slug = slugFromPath(targetPath);
  for (const type of ["pages", "posts"]) {
    const items = await wp(
      baseUrl,
      auth,
      `/wp/v2/${type}?slug=${encodeURIComponent(slug)}&status=publish,draft,pending,private,future&context=edit`
    );
    if (Array.isArray(items) && items.length) return { type, item: items[0] };
  }
  return null;
}

function imageCount(content) {
  return (String(content ?? "").match(/<img\b|wp:image/giu) ?? []).length;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL || BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const rows = parseCsv(readFileSync(MAPPING_CSV, "utf8")).filter((row) => row.new_file?.endsWith(".webp"));
  mkdirSync(BACKUP_DIR, { recursive: true });
  const uploads = [];
  const inserted = [];
  const skipped = [];
  const pageSummary = new Map();

  for (const row of rows) {
    const filePath = join(IMAGE_DIR, row.new_file);
    if (!readFileSync(filePath)) throw new Error(`Không đọc được ảnh ${filePath}`);
    const { media, uploaded } = await uploadMedia(baseUrl, auth, row);
    uploads.push({ file: row.new_file, mediaId: media.id, url: media.source_url, uploaded });

    for (const targetPath of targetPaths(row)) {
      const found = await findContentObject(baseUrl, auth, targetPath);
      if (!found) {
        skipped.push({ file: row.new_file, targetPath, reason: "Không tìm thấy page/post tương ứng" });
        continue;
      }
      const { type, item } = found;
      const content = item.content?.raw ?? item.content?.rendered ?? "";
      const summaryKey = `${type}:${item.id}:${targetPath}`;
      if (!pageSummary.has(summaryKey)) {
        pageSummary.set(summaryKey, {
          type,
          id: item.id,
          targetPath,
          title: item.title?.raw ?? item.title?.rendered ?? "",
          link: item.link,
          beforeImages: imageCount(content),
          insertedImages: 0,
          afterImages: imageCount(content),
        });
      }
      if (content.includes(row.new_file) || content.includes(media.source_url)) {
        skipped.push({ file: row.new_file, targetPath, id: item.id, reason: "Ảnh đã có trong nội dung" });
        continue;
      }
      const figure = figureHtml({ media, row, targetPath });
      const nextContent = insertFigure(content, figure, row.position);
      if (!DRY_RUN) {
        const backupPath = join(BACKUP_DIR, `${type}-${item.id}-${slugFromPath(targetPath) || "home"}.json`);
        writeFileSync(backupPath, JSON.stringify(item, null, 2), "utf8");
        await wp(baseUrl, auth, `/wp/v2/${type}/${item.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: nextContent }),
        });
      }
      const summary = pageSummary.get(summaryKey);
      summary.insertedImages += 1;
      summary.afterImages += 1;
      inserted.push({
        file: row.new_file,
        mediaId: media.id,
        targetPath,
        id: item.id,
        type,
        position: row.position,
        alt: row.alt,
        caption: row.caption,
        link: item.link,
      });
    }
  }

  const summaries = [...pageSummary.values()];
  const missing = summaries
    .filter((page) => page.afterImages < 3)
    .map((page) => ({ ...page, missingToThree: 3 - page.afterImages }));
  const result = {
    ok: true,
    dryRun: DRY_RUN,
    generatedAt: new Date().toISOString(),
    sourceZip: "C:\\Users\\DELL\\Desktop\\anh-seo-local-da-toi-uu-doi-ten.zip",
    imageDir: IMAGE_DIR,
    backupDir: BACKUP_DIR,
    uploads,
    inserted,
    skipped,
    pageSummary: summaries,
    missingImagePages: missing,
  };
  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
