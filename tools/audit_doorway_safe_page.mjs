import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const REPORT_DIR = join(PROJECT, "reports");
const HOST = "thongtaccongquangninh.com";
const HOTLINES = ["0963.953.533", "0931.156.756"];
const DEFAULT_SLUG = "hut-be-phot-ha-long";

const PAGE_CONFIG = {
  "hut-be-phot-ha-long": {
    keyword: "hút bể phốt Hạ Long",
    areaServed: "Hạ Long",
    requiredLinks: [
      "/hut-be-phot/",
      "/hut-be-phot-quang-ninh/",
      "/thong-tac-cong-ha-long/",
      "/thong-tac-bon-cau-ha-long/",
      "/lien-he/",
      "/cau-hoi-thuong-gap-thong-tac-cong/",
    ],
    localTerms: [
      "Bãi Cháy",
      "Hòn Gai",
      "Cao Xanh",
      "Cao Thắng",
      "Tuần Châu",
      "Hồng Hải",
      "Hồng Hà",
      "Giếng Đáy",
      "Hà Khẩu",
    ],
  },
  "hut-be-phot-uong-bi": {
    keyword: "hút bể phốt Uông Bí",
    areaServed: "Uông Bí",
    requiredLinks: ["/hut-be-phot-quang-ninh/", "/thong-tac-cong-uong-bi/", "/thong-tac-bon-cau-quang-ninh/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
    localTerms: ["Quang Trung", "Trưng Vương", "Thanh Sơn", "Yên Thanh", "Phương Đông", "Phương Nam", "Nam Khê", "Vàng Danh", "Yên Tử"],
  },
  "hut-be-phot-quang-yen": {
    keyword: "hút bể phốt Quảng Yên",
    areaServed: "Quảng Yên",
    requiredLinks: ["/hut-be-phot-quang-ninh/", "/thong-tac-cong-quang-yen/", "/thong-tac-bon-cau-quang-ninh/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
    localTerms: ["Hà An", "Đông Mai", "Minh Thành", "Sông Khoai", "Cộng Hòa", "Tiền An", "Tân An", "Hoàng Tân"],
  },
  "hut-be-phot-cam-pha": {
    keyword: "hút bể phốt Cẩm Phả",
    areaServed: "Cẩm Phả",
    requiredLinks: ["/hut-be-phot-quang-ninh/", "/thong-tac-cong-cam-pha/", "/thong-tac-bon-cau-cam-pha/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
    localTerms: ["Cửa Ông", "Cẩm Trung", "Cẩm Thành", "Cẩm Thủy", "Cẩm Bình", "Quang Hanh", "Mông Dương", "Cẩm Sơn"],
  },
  "thong-tac-cong-ha-long": {
    keyword: "thông tắc cống Hạ Long",
    areaServed: "Hạ Long",
    requiredLinks: ["/thong-tac-cong-quang-ninh/", "/hut-be-phot-ha-long/", "/thong-tac-bon-cau-ha-long/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
    localTerms: ["Bãi Cháy", "Hòn Gai", "Cao Xanh", "Cao Thắng", "Tuần Châu", "Hồng Hải", "Hồng Hà", "Giếng Đáy", "Hà Khẩu"],
  },
  "thong-tac-cong-cam-pha": {
    keyword: "thông tắc cống Cẩm Phả",
    areaServed: "Cẩm Phả",
    requiredLinks: ["/thong-tac-cong-quang-ninh/", "/hut-be-phot-cam-pha/", "/thong-tac-bon-cau-cam-pha/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
    localTerms: ["Cửa Ông", "Cẩm Trung", "Cẩm Thành", "Cẩm Thủy", "Cẩm Bình", "Quang Hanh", "Mông Dương", "Cẩm Sơn"],
  },
  "thong-tac-cong-uong-bi": {
    keyword: "thông tắc cống Uông Bí",
    areaServed: "Uông Bí",
    requiredLinks: ["/thong-tac-cong-quang-ninh/", "/hut-be-phot-uong-bi/", "/thong-tac-bon-cau-quang-ninh/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
    localTerms: ["Quang Trung", "Trưng Vương", "Thanh Sơn", "Yên Thanh", "Phương Đông", "Phương Nam", "Nam Khê", "Vàng Danh", "Yên Tử"],
  },
  "thong-tac-cong-quang-yen": {
    keyword: "thông tắc cống Quảng Yên",
    areaServed: "Quảng Yên",
    requiredLinks: ["/thong-tac-cong-quang-ninh/", "/hut-be-phot-quang-yen/", "/thong-tac-bon-cau-quang-ninh/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
    localTerms: ["Hà An", "Đông Mai", "Minh Thành", "Sông Khoai", "Cộng Hòa", "Tiền An", "Tân An", "Hoàng Tân"],
  },
};

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function decodeEntities(input) {
  return String(input ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&#8212;|&mdash;/g, "-")
    .replace(/&#038;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(input) {
  return decodeEntities(
    String(input ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function normalize(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
}

function attr(tag, name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i");
  const match = String(tag).match(re);
  return match ? decodeEntities(match[2]) : "";
}

function firstMatch(input, re) {
  const match = String(input ?? "").match(re);
  return match ? decodeEntities(match[1]) : "";
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function toSitePath(url, baseUrl) {
  try {
    const parsed = new URL(url, baseUrl);
    if (parsed.hostname !== HOST && parsed.hostname !== `www.${HOST}`) return null;
    return `${parsed.pathname.replace(/\/?$/, "/")}${parsed.search}`;
  } catch {
    return null;
  }
}

function collectSchemaNodes(node, out = []) {
  if (!node || typeof node !== "object") return out;
  if (Array.isArray(node)) {
    for (const item of node) collectSchemaNodes(item, out);
    return out;
  }
  out.push(node);
  if (node["@graph"]) collectSchemaNodes(node["@graph"], out);
  return out;
}

function typeNames(value) {
  if (Array.isArray(value)) return value.map(String);
  if (value) return [String(value)];
  return [];
}

function extractJsonLd(html) {
  const blocks = [];
  for (const match of String(html).matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const raw = match[1].trim();
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      blocks.push({ parseError: true, rawStart: raw.slice(0, 160) });
    }
  }
  const nodes = blocks.flatMap((block) => collectSchemaNodes(block));
  return {
    blocks,
    nodes,
    types: unique(nodes.flatMap((node) => typeNames(node["@type"]))),
  };
}

function extractHeadings(html) {
  return [...String(html).matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]),
    text: stripHtml(match[2]),
  }));
}

function extractFaq(html) {
  const headings = extractHeadings(html)
    .filter((item) => item.level >= 2 && item.level <= 4)
    .map((item) => item.text)
    .filter((text) => text.includes("?"));
  return unique(headings).slice(0, 20);
}

function extractInternalLinks(html, pageUrl) {
  const links = [];
  for (const match of String(html).matchAll(/<a\b[^>]*href=(["'])([\s\S]*?)\1[^>]*>/gi)) {
    const path = toSitePath(match[2], pageUrl);
    if (path) links.push(path);
  }
  return unique(links).sort();
}

function extractImages(html, pageUrl) {
  const images = [];
  for (const match of String(html).matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = attr(tag, "src") || attr(tag, "data-src");
    if (!src) continue;
    let url = src;
    try {
      url = new URL(src, pageUrl).href;
    } catch {}
    images.push({
      src: url,
      alt: attr(tag, "alt"),
      title: attr(tag, "title"),
    });
  }
  return images;
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex doorway-safe SEO audit",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(60000),
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

async function listBySlug(baseUrl, auth, collection, slug) {
  try {
    return await wp(
      baseUrl,
      auth,
      `/wp/v2/${collection}?slug=${encodeURIComponent(slug)}&status=any&context=edit&per_page=20`
    );
  } catch {
    return await wp(baseUrl, auth, `/wp/v2/${collection}?slug=${encodeURIComponent(slug)}&context=edit&per_page=20`);
  }
}

async function rankMathBatchItem(baseUrl, auth, id) {
  for (const offset of [0, 25, 50, 75, 100, 125, 150, 175, 200]) {
    const batch = await wp(baseUrl, auth, "/rankmath/v1/toolsAction", {
      method: "POST",
      body: JSON.stringify({
        action: "update_seo_score",
        args: { update_all_scores: true, offset },
      }),
    });
    if (batch && typeof batch === "object" && batch[String(id)]) {
      return { offset, item: batch[String(id)] };
    }
  }
  return null;
}

async function httpStatus(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "User-Agent": "Codex doorway-safe SEO audit" },
      signal: AbortSignal.timeout(30000),
    });
    return { status: response.status, ok: response.ok, finalUrl: response.url };
  } catch {
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": "Codex doorway-safe SEO audit" },
        signal: AbortSignal.timeout(30000),
      });
      return { status: response.status, ok: response.ok, finalUrl: response.url };
    } catch (error) {
      return { status: 0, ok: false, finalUrl: url, error: error.message };
    }
  }
}

function markdownTable(rows) {
  const clean = (value) =>
    String(value ?? "")
      .replace(/\r?\n/g, "<br>")
      .replace(/\|/g, "\\|")
      .trim();
  return [
    "| Trường | Giá trị |",
    "| --- | --- |",
    ...rows.map(([key, value]) => `| ${clean(key)} | ${clean(value)} |`),
  ].join("\n");
}

function schemaSummary(schema, expectedArea) {
  const localBusiness = schema.nodes.find((node) => typeNames(node["@type"]).includes("LocalBusiness"));
  const areaValues = [];
  if (localBusiness) {
    const areas = Array.isArray(localBusiness.areaServed) ? localBusiness.areaServed : [localBusiness.areaServed];
    for (const area of areas.filter(Boolean)) {
      if (typeof area === "string") areaValues.push(area);
      else if (area.name) areaValues.push(area.name);
    }
  }
  return {
    types: schema.types,
    localBusinessAreaServed: unique(areaValues),
    hasExpectedArea: expectedArea ? normalize(areaValues.join(" ")).includes(normalize(expectedArea)) : true,
  };
}

function buildIssues({ pageUrl, canonical, robots, schemaInfo, faq, links, images, config, contentText, targetStatuses }) {
  const issues = [];
  const cleanCanonical = canonical.replace(/\/?$/, "/");
  const cleanPageUrl = pageUrl.replace(/\/?$/, "/");
  if (cleanCanonical !== cleanPageUrl) issues.push(`Canonical không tự trỏ: ${canonical || "thiếu"}`);
  if (normalize(robots).includes("noindex")) issues.push(`Robots có noindex: ${robots}`);
  if (!schemaInfo.types.includes("LocalBusiness")) issues.push("Thiếu LocalBusiness schema");
  if (!schemaInfo.types.includes("BreadcrumbList")) issues.push("Thiếu BreadcrumbList schema");
  if (faq.length && !schemaInfo.types.includes("FAQPage")) issues.push("Có FAQ hiển thị nhưng thiếu FAQPage schema");
  if (!schemaInfo.hasExpectedArea) issues.push(`LocalBusiness areaServed chưa thấy đúng địa bàn: ${config.areaServed}`);
  for (const link of config.requiredLinks ?? []) {
    const normalizedLink = link.replace(/\/?$/, "/");
    const present = links.some((item) => item.replace(/\/?$/, "/") === normalizedLink);
    const status = targetStatuses[link];
    if (!present) issues.push(`Thiếu internal link yêu cầu: ${link}`);
    if (status && !status.ok) issues.push(`Link yêu cầu có HTTP ${status.status}: ${link}`);
  }
  const noAlt = images.filter((image) => !image.alt).length;
  if (noAlt) issues.push(`${noAlt} ảnh thiếu alt`);
  const localImageAlt = images.some((image) => normalize(image.alt).includes(normalize(config.areaServed)));
  if (!localImageAlt) issues.push(`TODO ảnh/alt thực địa có địa phương: ${config.areaServed}`);
  const missingLocalTerms = (config.localTerms ?? []).filter((term) => !normalize(contentText).includes(normalize(term)));
  if (missingLocalTerms.length) issues.push(`Thiếu một số tín hiệu địa phương: ${missingLocalTerms.slice(0, 8).join(", ")}`);
  if (!HOTLINES.every((hotline) => contentText.includes(hotline))) issues.push("Thiếu đủ 2 hotline trong nội dung live");
  return issues;
}

async function main() {
  mkdirSync(REPORT_DIR, { recursive: true });
  const slug = process.argv[2] ?? DEFAULT_SLUG;
  const config = PAGE_CONFIG[slug] ?? {
    keyword: slug.replaceAll("-", " "),
    areaServed: "",
    requiredLinks: ["/lien-he/"],
    localTerms: [],
  };
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const matches = [
    ...(await listBySlug(baseUrl, auth, "pages", slug)).map((item) => ({ ...item, type: "pages" })),
    ...(await listBySlug(baseUrl, auth, "posts", slug)).map((item) => ({ ...item, type: "posts" })),
  ].sort((a, b) => {
    if (a.status === "publish" && b.status !== "publish") return -1;
    if (b.status === "publish" && a.status !== "publish") return 1;
    return a.type.localeCompare(b.type);
  });
  if (!matches.length) throw new Error(`Không tìm thấy page/post theo slug: ${slug}`);

  const primary = matches[0];
  const pageUrl = primary.link || `${baseUrl}/${slug}/`;
  const liveUrl = `${pageUrl}${pageUrl.includes("?") ? "&" : "?"}codex_audit=${Date.now()}`;
  const liveResponse = await fetch(liveUrl, {
    redirect: "follow",
    headers: {
      "User-Agent": "Codex doorway-safe SEO audit",
      "Cache-Control": "no-cache",
    },
    signal: AbortSignal.timeout(60000),
  });
  const html = await liveResponse.text();
  const headings = extractHeadings(html);
  const h1 = headings.filter((item) => item.level === 1).map((item) => item.text);
  const canonical = firstMatch(html, /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  const robots = firstMatch(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const liveTitle = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const liveDescription =
    firstMatch(html, /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
    stripHtml(primary.excerpt?.raw ?? primary.excerpt?.rendered ?? "");
  const schema = extractJsonLd(html);
  const schemaInfo = schemaSummary(schema, config.areaServed);
  const faq = extractFaq(html);
  const links = extractInternalLinks(html, pageUrl);
  const images = extractImages(html, pageUrl);
  const targetStatuses = {};
  for (const link of config.requiredLinks ?? []) {
    targetStatuses[link] = await httpStatus(new URL(link, baseUrl).href);
  }
  const rankMath = await rankMathBatchItem(baseUrl, auth, primary.id).catch(() => null);
  const contentText = `${stripHtml(primary.content?.raw ?? primary.content?.rendered ?? "")} ${stripHtml(html)}`;
  const issues = buildIssues({
    pageUrl,
    canonical,
    robots,
    schemaInfo,
    faq,
    links,
    images,
    config,
    contentText,
    targetStatuses,
  });
  const date = new Date().toISOString().slice(0, 10);
  const jsonPath = join(REPORT_DIR, `doorway-audit-${slug}-${date}.json`);
  const mdPath = join(REPORT_DIR, `doorway-audit-${slug}-${date}.md`);
  const report = {
    generatedAt: new Date().toISOString(),
    slug,
    url: pageUrl,
    liveStatus: liveResponse.status,
    postId: primary.id,
    type: primary.type,
    status: primary.status,
    title: stripHtml(primary.title?.raw ?? primary.title?.rendered ?? ""),
    metaTitle: liveTitle,
    metaDescription: liveDescription,
    h1,
    canonical,
    robots: robots || "không thấy meta robots riêng",
    schema: schemaInfo,
    faq,
    internalLinks: links,
    images,
    targetStatuses,
    rankMath: rankMath
      ? {
          offset: rankMath.offset,
          score: rankMath.item?.score,
          keyword: rankMath.item?.keyword,
          title: rankMath.item?.title,
          description: rankMath.item?.description,
        }
      : null,
    issues,
  };
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const targetRows = Object.entries(targetStatuses)
    .map(([link, status]) => `- ${link}: HTTP ${status.status}${status.ok ? "" : " - lỗi/không nên thêm nếu chưa sửa"}`)
    .join("\n");
  const imageRows = images
    .slice(0, 12)
    .map((image) => `- ${image.alt || "(thiếu alt)"} | ${image.src}`)
    .join("\n");
  const linkRows = links.slice(0, 80).map((link) => `- ${link}`).join("\n");
  const md = `# Audit chống Doorway: ${slug}

## Bảng audit trước sửa

${markdownTable([
  ["URL", pageUrl],
  ["Post ID", `${primary.type} ${primary.id}, trạng thái ${primary.status}`],
  ["Title hiện tại", report.title],
  ["Meta title hiện tại", report.metaTitle],
  ["Meta description", report.metaDescription],
  ["H1", h1.join("<br>") || "Không thấy H1"],
  ["Canonical hiện tại", canonical || "Không thấy canonical"],
  ["Robots meta hiện tại", report.robots],
  ["Schema hiện tại", `${schemaInfo.types.join(", ") || "Không thấy JSON-LD"}${schemaInfo.localBusinessAreaServed.length ? `<br>areaServed: ${schemaInfo.localBusinessAreaServed.join(", ")}` : ""}`],
  ["FAQ hiện tại", faq.length ? faq.join("<br>") : "Không thấy FAQ dạng câu hỏi"],
  ["Internal link", `${links.length} link nội bộ. Xem danh sách bên dưới.`],
  ["Ảnh + alt text", `${images.length} ảnh. Xem danh sách bên dưới.`],
  ["Vấn đề phát hiện", issues.length ? issues.join("<br>") : "Chưa phát hiện lỗi trong phạm vi audit này."],
])}

## Link yêu cầu và HTTP

${targetRows || "- Không có cấu hình link yêu cầu riêng."}

## Danh sách internal link

${linkRows || "- Không thấy internal link."}

## Ảnh và alt

${imageRows || "- Không thấy ảnh."}

## File JSON chi tiết

- ${jsonPath}
`;
  writeFileSync(mdPath, md, "utf8");
  console.log(`DONE slug=${slug} status=${liveResponse.status} issues=${issues.length}`);
  console.log(`MD=${mdPath}`);
  console.log(`JSON=${jsonPath}`);
  if (issues.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
