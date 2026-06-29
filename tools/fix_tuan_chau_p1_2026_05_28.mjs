import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { markdownToHtml } from "./lib/markdown_to_html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(PROJECT_ROOT, ".env");
const BASE_URL = "https://thongtaccongquangninh.com";
const TARGET = {
  collection: "pages",
  id: 993,
  slug: "thong-tac-cong-tuan-chau",
  url: `${BASE_URL}/thong-tac-cong-tuan-chau/`,
  title: "Thông tắc cống Tuần Châu Hạ Long 24/7, thợ xử lý tận nơi nhanh",
  excerpt:
    "Thông tắc cống Tuần Châu Hạ Long cho biệt thự, homestay, nhà hàng, xử lý cống nghẹt, mùi hôi, không đục phá. Gọi 0963.953.533 / 0931.156.756.",
};
const DRAFT_PATH = path.join(PROJECT_ROOT, "content-drafts", "thong-tac-cong-tuan-chau-ha-long-rankmath-draft.md");
const PACKAGE_PATH = path.join(PROJECT_ROOT, "image-briefs", "thong-tac-cong-tuan-chau-image-package.json");
const ts = new Date().toISOString().replace(/\.\d{3}Z$/, "");
const BACKUP_DIR = path.join(PROJECT_ROOT, "seo-revisions", `wp-before-tuan-chau-p1-${ts}`);
const REPORT_PATH = path.join(PROJECT_ROOT, "reports", `tuan-chau-p1-fix-${ts}.json`);
const APPLY = process.argv.includes("--apply");

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

function stripSection(md, headingNeedle) {
  const re = new RegExp(`\\n##[^\\n]*${headingNeedle}[^\\n]*\\n[\\s\\S]*?(?=\\n##\\s|\\n<script|$)`, "iu");
  return md.replace(re, "\n");
}

function stripScripts(md) {
  return md.replace(/<script\b[\s\S]*?<\/script>/giu, "");
}

function cleanMarkdown(md) {
  let out = md.replace(/\r\n/g, "\n");
  out = stripScripts(out);
  out = stripSection(out, "Dấu hiệu cần gọi thợ");
  out = stripSection(out, "Lưu ý để hạn chế");
  out = stripSection(out, "Trạng thái nghiệm thu");
  out = out.replace(
    /\n##[^\n]*Case study E-E-A-T dạng tình huống thường gặp tại Tuần Châu[^\n]*\n[\s\S]*?(?=\n##\s|$)/iu,
    `\n## Tình huống thường gặp tại Tuần Châu\n\nMột homestay hoặc nhà hàng ở Tuần Châu có thể gặp tình trạng cống bếp thoát chậm sau các ngày đông khách. Dấu hiệu thường là nước rút kém, mùi dầu mỡ bốc lên và hố ga sau bếp có váng nổi.\n\nVới tình huống này, thợ cần kiểm tra cả miệng thoát, đoạn ống bếp và hố ga gần nhất. Nếu chỉ xử lý miệng cống mà bỏ qua lớp mỡ trong ống hoặc bùn trong hố ga, sự cố dễ lặp lại khi công trình hoạt động cao điểm.\n`
  );
  out = out.replace(/^!\[[^\]]*\]\([^)]+\)\n(?:\*[^*\n]+\*\n?)?/gmu, "");
  out = out.replace(/^(##+)\s*<a[^>]*><\/a>(.+)$/gmu, "$1 $2");
  out = out.replace(/Case study E-E-A-T dạng tình huống thường gặp/giu, "Tình huống thường gặp");
  out = out.replace(/Bài \*\*thông tắc cống Tuần Châu\*\* này chỉ được chuyển khỏi trạng thái chờ khi có ảnh SEO riêng\./giu, "");
  out = out.replace(/\n{3,}/g, "\n\n");
  out = reduceExactKeyword(out, "thông tắc cống Tuần Châu Hạ Long", [
    "xử lý cống nghẹt tại Tuần Châu",
    "dịch vụ xử lý cống tại đảo",
    "thợ xử lý cống khu Tuần Châu",
    "dịch vụ cống nghẹt khu lưu trú",
  ], 5);
  out = reduceExactKeyword(out, "thông tắc cống Tuần Châu", [
    "xử lý cống nghẹt Tuần Châu",
    "thợ thông cống khu Tuần Châu",
    "dịch vụ xử lý cống tại Tuần Châu",
    "đội xử lý cống Tuần Châu",
  ], 7);
  return out.trim();
}

function reduceExactKeyword(text, phrase, replacements, keep = 6) {
  let seen = 0;
  let index = 0;
  const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "giu");
  return text.replace(re, (match) => {
    seen += 1;
    if (seen <= keep) return match;
    const next = replacements[index % replacements.length];
    index += 1;
    if (match[0] === match[0].toUpperCase()) return next[0].toUpperCase() + next.slice(1);
    return next;
  });
}

function stripTags(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/g, " ");
}

function ascii(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function metrics(html) {
  const plain = stripTags(html);
  const words = ascii(plain).match(/[a-z0-9]+/g) ?? [];
  const keywordCount = (ascii(plain).match(/thong tac cong tuan chau/g) ?? []).length;
  const imgCount = (html.match(/<img\b/giu) ?? []).length;
  return {
    wordCount: words.length,
    keywordCount,
    keywordDensity: words.length ? Number(((keywordCount * 5 * 100) / words.length).toFixed(2)) : 0,
    imgCount,
    hasServiceSchema: /"@type"\s*:\s*"Service"/iu.test(html),
    h2Count: (html.match(/<h2\b/giu) ?? []).length,
  };
}

async function wp(baseUrl, auth, route, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${route}`, {
    ...init,
    headers: {
      Authorization: auth,
      "User-Agent": "Codex TTCQN P1 SEO fix",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let payload = text;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message ?? text : payload;
    throw new Error(`WordPress ${response.status} ${route}: ${message}`);
  }
  return payload;
}

function localImagePath(filePath) {
  const raw = String(filePath ?? "").replaceAll("\\", path.sep);
  if (raw.startsWith("/mnt/d/")) return raw;
  if (path.isAbsolute(raw)) return raw;
  return path.join(PROJECT_ROOT, raw);
}

async function uploadOrFindMedia(baseUrl, auth, image) {
  const stem = path.basename(image.fileName, path.extname(image.fileName));
  const existing = await wp(baseUrl, auth, `/wp/v2/media?search=${encodeURIComponent(stem)}&per_page=20`);
  const found = Array.isArray(existing)
    ? existing.find((item) => String(item.source_url ?? "").includes(stem))
    : null;
  if (found) {
    await wp(baseUrl, auth, `/wp/v2/media/${found.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alt_text: image.altText,
        caption: image.caption,
        title: image.title ?? stem.replaceAll("-", " "),
      }),
    });
    return { media: found, uploaded: false };
  }

  const filePath = localImagePath(image.filePath);
  if (!existsSync(filePath)) throw new Error(`Không tìm thấy ảnh: ${filePath}`);
  const media = await wp(baseUrl, auth, "/wp/v2/media", {
    method: "POST",
    headers: {
      "Content-Type": image.fileName.endsWith(".jpg") || image.fileName.endsWith(".jpeg") ? "image/jpeg" : "image/webp",
      "Content-Disposition": `attachment; filename="${image.fileName}"`,
    },
    body: createReadStream(filePath),
    duplex: "half",
  });
  await wp(baseUrl, auth, `/wp/v2/media/${media.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      alt_text: image.altText,
      caption: image.caption,
      title: image.title ?? stem.replaceAll("-", " "),
    }),
  });
  return { media, uploaded: true };
}

function figure(image, media) {
  return `<!-- wp:image {"id":${media.id},"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="${escapeHtml(media.source_url)}" alt="${escapeHtml(image.altText)}" class="wp-image-${media.id}"/><figcaption class="wp-element-caption">${escapeHtml(image.caption)}</figcaption></figure>
<!-- /wp:image -->`;
}

function serviceSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${TARGET.url}#service`,
    name: "Thông tắc cống Tuần Châu",
    serviceType: "Thông tắc cống",
    url: TARGET.url,
    areaServed: {
      "@type": "Place",
      name: "Tuần Châu, Hạ Long, Quảng Ninh",
    },
    provider: {
      "@type": "LocalBusiness",
      name: "Môi Trường Đô Thị Số 1 Quảng Ninh",
      telephone: ["0963953533", "0931156756"],
      url: BASE_URL,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hạ Long",
        addressRegion: "Quảng Ninh",
        addressCountry: "VN",
      },
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url: TARGET.url,
    },
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
}

function insertFigures(html, figures) {
  const parts = html.split(/\n/);
  let paragraphSeen = 0;
  const out = [];
  let inserted = false;
  for (const line of parts) {
    out.push(line);
    if (/^<p\b/i.test(line)) paragraphSeen += 1;
    if (!inserted && paragraphSeen >= 3) {
      out.push(...figures);
      inserted = true;
    }
  }
  if (!inserted) out.push(...figures);
  return out.join("\n");
}

async function liveCheck() {
  const res = await fetch(`${TARGET.url}?nowprocket=1&codex=tuan-chau-p1-${Date.now()}`, { redirect: "manual" });
  const html = await res.text();
  return {
    status: res.status,
    finalUrl: res.url,
    canonicalOk: html.includes(`<link rel="canonical" href="${TARGET.url}"`),
    noindex: /<meta[^>]+name=["']robots["'][^>]+noindex/iu.test(html),
    imgCount: (html.match(/<img\b/giu) ?? []).length,
    hasServiceSchema: /"@type"\s*:\s*"Service"/iu.test(html),
    hasForbiddenInternalLabels: /PENDING_IMAGE_SEO|Trạng thái nghiệm thu|Chưa được publish|image package|TODO/iu.test(html),
  };
}

async function main() {
  const env = parseEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Thiếu WP_USERNAME/WP_APP_PASSWORD trong .env");
  const baseUrl = (env.WP_BASE_URL || BASE_URL).replace(/\/$/, "");
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const existing = await wp(baseUrl, auth, `/wp/v2/${TARGET.collection}/${TARGET.id}?context=edit`);
  const pkg = JSON.parse(readFileSync(PACKAGE_PATH, "utf8"));
  const uploads = [];
  const figures = [];

  for (const image of pkg.images ?? []) {
    const result = APPLY
      ? await uploadOrFindMedia(baseUrl, auth, image)
      : { media: { id: 0, source_url: `DRY_RUN/${image.fileName}` }, uploaded: false };
    uploads.push({ fileName: image.fileName, mediaId: result.media.id, url: result.media.source_url, uploaded: result.uploaded });
    figures.push(figure(image, result.media));
  }

  const cleanedMd = cleanMarkdown(readFileSync(DRAFT_PATH, "utf8"));
  let html = markdownToHtml(cleanedMd, { skipFrontmatter: true });
  html = insertFigures(html, figures);
  html = `${html}\n${serviceSchema()}`;
  const before = metrics(existing.content?.raw ?? existing.content?.rendered ?? "");
  const after = metrics(html);
  const report = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? "apply" : "dry-run",
    target: TARGET,
    draftPath: DRAFT_PATH,
    packagePath: PACKAGE_PATH,
    backupDir: APPLY ? BACKUP_DIR : null,
    before,
    after,
    uploads,
    pass: after.wordCount >= 2400 && after.wordCount <= 3000 && after.keywordDensity <= 1.6 && after.imgCount >= 3 && after.hasServiceSchema,
  };

  if (APPLY) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const backupPath = path.join(BACKUP_DIR, `${TARGET.collection}-${TARGET.id}-${TARGET.slug}.json`);
    writeFileSync(backupPath, JSON.stringify(existing, null, 2), "utf8");
    report.backupPath = backupPath;
    const pushed = await wp(baseUrl, auth, `/wp/v2/${TARGET.collection}/${TARGET.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: TARGET.title,
        content: html,
        excerpt: TARGET.excerpt,
        status: "publish",
        featured_media: uploads[0]?.mediaId || existing.featured_media || 0,
      }),
    });
    report.pushed = { id: pushed.id, status: pushed.status, link: pushed.link, featuredMedia: pushed.featured_media };
    report.live = await liveCheck();
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({ ok: report.pass, reportPath: REPORT_PATH, ...report }, null, 2));
  if (!report.pass) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
