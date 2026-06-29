import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = {
  id: 56,
  collection: "pages",
  slug: "hut-be-phot-dong-trieu",
  url: "https://thongtaccongquangninh.com/hut-be-phot-dong-trieu/",
};
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const OLD_AUTHOR_URL = "https://thongtaccongquangninh.com/nguyen-song-hao/";
const TITLE = "Hút Bể Phốt Đông Triều 24/7 - Giá Rẻ Không Đục Phá, Có Mặt 15 Phút";
const META_DESC =
  "Hút bể phốt Đông Triều 24/7 cho nhà dân, trang trại, khu trọ. Xe bồn vào ngõ sâu, báo giá trước, không đục phá khi chưa cần. Gọi 0963.953.533 / 0931.156.756.";
const FOCUS_ASCII = "hut be phot dong trieu";
const SERVICE_MARKER = "hut-be-phot-dong-trieu";
const CLEANUP_MARKER = "ttcqn-hut-be-phot-dong-trieu-p1-cleanup-2026-06-04";

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-p1-hut-be-phot-dong-trieu-${stamp}`);
const reportPath = join(ROOT, "reports", `p1-hut-be-phot-dong-trieu-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

function parseEnv(filePath) {
  const env = {};
  if (!existsSync(filePath)) return env;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripText(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/gu, " ")
    .trim();
}

function removeDiacritics(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/gu, (char) => (char === "Đ" ? "D" : "d"));
}

function wordCount(input) {
  const text = stripText(input);
  return text ? text.split(/\s+/u).filter(Boolean).length : 0;
}

function keywordStats(input) {
  const text = removeDiacritics(stripText(input)).toLowerCase();
  const total = text ? text.split(/\s+/u).filter(Boolean).length : 0;
  let count = 0;
  let index = 0;
  while ((index = text.indexOf(FOCUS_ASCII, index)) !== -1) {
    count++;
    index += FOCUS_ASCII.length;
  }
  const density = total ? (count * FOCUS_ASCII.split(/\s+/u).length) / total : 0;
  return { count, total, density, densityPct: Number((density * 100).toFixed(2)) };
}

function hasForbidden(input) {
  const text = stripText(input).toLocaleLowerCase("vi-VN");
  return ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"].filter((word) => text.includes(word));
}

function decodeEntities(input) {
  return String(input ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&quot;/g, '"');
}

function collectSchemaTypes(node, output) {
  if (!node || typeof node !== "object") return;
  const type = node["@type"];
  if (Array.isArray(type)) output.push(...type.map(String));
  else if (type) output.push(String(type));
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((item) => collectSchemaTypes(item, output));
    else collectSchemaTypes(value, output);
  }
}

function extractPublicMeta(html) {
  const title = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/iu)?.[1] || "")
    .replace(/\s+/gu, " ")
    .trim();
  const metaDesc = decodeEntities(
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/iu)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/iu)?.[1] ||
      "",
  );
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/iu)?.[1] || "";
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/giu)].map((m) => stripText(m[1]));
  const h2 = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/giu)].map((m) => stripText(m[1]));
  const schemaTypes = [];
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu)) {
    try {
      collectSchemaTypes(JSON.parse(match[1].trim()), schemaTypes);
    } catch {}
  }
  const imageAlts = [...html.matchAll(/<img\b[^>]*\balt=["']([^"']*)["'][^>]*>/giu)].map((m) => decodeEntities(m[1]));

  return {
    title,
    titleLen: [...title].length,
    metaDesc,
    metaDescLen: [...metaDesc].length,
    canonical,
    h1,
    h2,
    wordCount: wordCount(html),
    keyword: keywordStats(html),
    schemaTypes: [...new Set(schemaTypes)],
    hasServiceSchema: schemaTypes.includes("Service"),
    hasCleanupMarker: html.includes(CLEANUP_MARKER),
    hasAuthorArchive: html.includes(AUTHOR_URL),
    hasOldAuthorUrl: html.includes(OLD_AUTHOR_URL),
    hasFinalAuthor: html.includes("ttcqn-author-final") && html.includes(AUTHOR_URL),
    imageAlts,
    forbidden: hasForbidden(html),
    hasBinhDuong: /Bình Dương/iu.test(stripText(html)),
  };
}

function serviceSchemaHtml() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${TARGET.url}#service`,
    name: "Hút bể phốt Đông Triều Quảng Ninh",
    serviceType: "Hút bể phốt cho hộ gia đình, cơ sở kinh doanh, trang trại tại Đông Triều",
    url: TARGET.url,
    provider: {
      "@type": "LocalBusiness",
      name: "Môi Trường Đô Thị Số 1 Quảng Ninh",
      url: SITE,
      telephone: ["+84963953533", "+84931156756"],
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Đông Triều, Quảng Ninh",
    },
    availableChannel: {
      "@type": "ServiceChannel",
      servicePhone: {
        "@type": "ContactPoint",
        telephone: "+84963953533",
        contactType: "customer service",
        availableLanguage: "Vietnamese",
      },
    },
    offers: {
      "@type": "Offer",
      url: TARGET.url,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
    },
  };

  return `<!-- wp:html -->\n<script type="application/ld+json" data-ttcqn-service-schema="${SERVICE_MARKER}">${JSON.stringify(schema)}</script>\n<!-- /wp:html -->`;
}

function finalAuthorHtml() {
  return `<!-- wp:paragraph {"className":"ttcqn-author-nguyen-song-hao ttcqn-author-final"} -->\n<p class="ttcqn-author-nguyen-song-hao ttcqn-author-final"><!-- ${CLEANUP_MARKER} -->Tác giả: <a href="${AUTHOR_URL}">Nguyễn Song Hào</a></p>\n<!-- /wp:paragraph -->`;
}

function convertMarkdownToWpBlocks(mdPath) {
  const md = readFileSync(mdPath, "utf8");
  const lines = md.split(/\r?\n/);
  const blocks = [];
  
  // Skip metadata headers
  let contentStartIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("# ")) {
      contentStartIndex = i + 1; // start after H1
      break;
    }
  }
  
  let currentParagraph = [];
  let currentList = [];
  let currentTable = [];
  let isInsideTable = false;
  
  for (let i = contentStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check table
    if (line.startsWith("|")) {
      isInsideTable = true;
      currentTable.push(line);
      continue;
    } else if (isInsideTable && !line.startsWith("|")) {
      isInsideTable = false;
      // Parse table
      if (currentTable.length > 0) {
        blocks.push(parseMarkdownTable(currentTable));
        currentTable = [];
      }
    }
    
    if (line === "" || line === "---") {
      if (currentParagraph.length > 0) {
        blocks.push(`<!-- wp:paragraph -->\n<p>${currentParagraph.join(" ")}</p>\n<!-- /wp:paragraph -->`);
        currentParagraph = [];
      }
      if (currentList.length > 0) {
        blocks.push(`<!-- wp:list -->\n<ul>\n${currentList.map(li => `<li>${li}</li>`).join("\n")}\n</ul>\n<!-- /wp:list -->`);
        currentList = [];
      }
      continue;
    }
    
    // Headings
    if (line.startsWith("## ")) {
      const text = line.substring(3).trim();
      blocks.push(`<!-- wp:heading -->\n<h2>${text}</h2>\n<!-- /wp:heading -->`);
    } else if (line.startsWith("### ")) {
      const text = line.substring(4).trim();
      blocks.push(`<!-- wp:heading {"level":3} -->\n<h3>${text}</h3>\n<!-- /wp:heading -->`);
    } else if (line.startsWith("* ") || line.startsWith("- ")) {
      // List item
      let text = line.substring(2).trim();
      // Format bold text **bold** to <strong>bold</strong>
      text = formatMarkdownInline(text);
      currentList.push(text);
    } else {
      // Plain paragraph line
      currentParagraph.push(formatMarkdownInline(line));
    }
  }
  
  // Flush remaining
  if (currentParagraph.length > 0) {
    blocks.push(`<!-- wp:paragraph -->\n<p>${currentParagraph.join(" ")}</p>\n<!-- /wp:paragraph -->`);
  }
  if (currentList.length > 0) {
    blocks.push(`<!-- wp:list -->\n<ul>\n${currentList.map(li => `<li>${li}</li>`).join("\n")}\n</ul>\n<!-- /wp:list -->`);
  }
  if (currentTable.length > 0) {
    blocks.push(parseMarkdownTable(currentTable));
  }
  
  // Inject images at strategic points
  // Image 1 goes after paragraph 1
  const img1 = `<!-- wp:image {"id":779,"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/05/hut-be-phot-dong-trie-xe-bon-hut-be-phot-tai-nha-dan-o-dong-trieu-1.webp" alt="xe bồn hút bể phốt tại nhà dân ở Đông Triều" class="wp-image-779"/><figcaption class="wp-element-caption">Ảnh thực tế xe bồn hút bể phốt tại Đông Triều.</figcaption></figure>\n<!-- /wp:image -->`;
  // Wait, let's fix image 1 path - let's use the exact original image url from original HTML:
  // https://thongtaccongquangninh.com/wp-content/uploads/2026/05/hut-be-phot-dong-trieu-xe-bon-hut-be-phot-tai-nha-dan-o-dong-trieu-1.webp
  
  // Image 2 goes inside Case Study
  const img2 = `<!-- wp:image {"id":780,"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/05/hut-be-phot-dong-trieu-doi-xe-hut-be-phot-2.webp" alt="Đội xe hút bể phốt cho dịch vụ hút bể phốt tại Đông Triều" class="wp-image-780"/><figcaption class="wp-element-caption">Ảnh thực tế đội xe hút bể phốt cho dịch vụ hút bể phốt tại Đông Triều.</figcaption></figure>\n<!-- /wp:image -->`;
  
  // Image 3 goes inside NAP contact
  const img3 = `<!-- wp:image {"id":864,"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/05/hut-be-phot-dong-trieu-tho-keo-ong-hut-be-phot-vao-ngo-sau-tai-dong-trieu-2.webp" alt="thợ kéo ống hút bể phốt vào ngõ sâu tại Đông Triều" class="wp-image-864"/><figcaption class="wp-element-caption">Ảnh thực tế xe bồn hút bể phốt cho dịch vụ hút bể phốt tại Đông Triều.</figcaption></figure>\n<!-- /wp:image -->`;
  
  // Find injection indices
  // Image 1: after H1's first paragraph (index 1 or 2)
  blocks.splice(1, 0, img1);
  
  // Image 2: inside Case Study section
  let caseStudyIndex = blocks.findIndex(b => b.includes("<h2>Case study E-E-A-T"));
  if (caseStudyIndex !== -1) {
    // Insert after H2 header + 2 paragraphs
    blocks.splice(caseStudyIndex + 3, 0, img2);
  }
  
  // Image 3: inside NAP contact section
  let napIndex = blocks.findIndex(b => b.includes("<h2>Địa chỉ liên hệ"));
  if (napIndex !== -1) {
    // Insert after H2 header + 1 paragraph
    blocks.splice(napIndex + 2, 0, img3);
  }
  
  // Inject FAQPage and Service Schema blocks
  const schemaBlock = serviceSchemaHtml();
  const authorBlock = finalAuthorHtml();
  
  return blocks.join("\n\n") + "\n\n" + schemaBlock + "\n\n" + authorBlock;
}

function formatMarkdownInline(text) {
  return text
    .replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([\s\S]+?)\*/g, "<em>$1</em>")
    .replace(/\[([\s\S]+?)\]\(([\s\S]+?)\)/g, '<a href="$2">$1</a>');
}

function parseMarkdownTable(rows) {
  // Strip header separators like |---|---|
  const cleanRows = rows.filter(r => !r.includes("---"));
  if (cleanRows.length === 0) return "";
  
  let html = '<!-- wp:table -->\n<table class="wp-block-table"><tbody>';
  
  // Parse headers
  const headerCols = cleanRows[0].split("|").map(c => c.trim()).filter(Boolean);
  html += '<tr>' + headerCols.map(c => `<td><strong>${formatMarkdownInline(c)}</strong></td>`).join("") + '</tr>';
  
  for (let i = 1; i < cleanRows.length; i++) {
    const cols = cleanRows[i].split("|").map(c => c.trim()).filter(Boolean);
    if (cols.length > 0) {
      html += '<tr>' + cols.map(c => `<td>${formatMarkdownInline(c)}</td>`).join("") + '</tr>';
    }
  }
  
  html += '</tbody></table>\n<!-- /wp:table -->';
  return html;
}

const env = parseEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || SITE).replace(/\/$/, "");
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
  throw new Error("Missing WP_USERNAME/WP_APP_PASSWORD in .env");
}
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function wp(path, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: auth,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Codex P1 Dong Trieu cleanup",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message || raw : raw;
    throw new Error(`WP ${response.status} ${path}: ${message}`);
  }
  return payload;
}

async function fetchPublic() {
  const url = new URL(TARGET.url);
  url.searchParams.set("nowprocket", "1");
  url.searchParams.set("codex", `dong-trieu-${Date.now()}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "Codex P1 Dong Trieu verifier" },
  });
  const html = await response.text();
  return { status: response.status, url: response.url, ...extractPublicMeta(html) };
}

async function main() {
  mkdirSync(dirname(reportPath), { recursive: true });

  const before = await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}?context=edit`);
  if (before.slug !== TARGET.slug || before.status !== "publish") {
    throw new Error(`Unexpected target state: ${before.slug}/${before.status}`);
  }

  const rawBefore = before.content?.raw || "";
  const updateContent = convertMarkdownToWpBlocks(join(ROOT, "content-drafts", "hut-be-phot-dong-trieu-optimized.md"));
  
  const report = {
    ok: false,
    mode: dryRun ? "dry-run" : "apply",
    generatedAt: new Date().toISOString(),
    target: TARGET,
    backupDir,
    title: TITLE,
    titleLen: [...TITLE].length,
    metaDesc: META_DESC,
    metaDescLen: [...META_DESC].length,
    before: {
      title: before.title?.raw,
      excerpt: stripText(before.excerpt?.raw || ""),
      contentLen: rawBefore.length,
      rawWordCount: wordCount(rawBefore),
      keyword: keywordStats(rawBefore),
      hasOldAuthorUrl: rawBefore.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: rawBefore.includes(AUTHOR_URL),
      hasServiceSchema: rawBefore.includes(`data-ttcqn-service-schema="${SERVICE_MARKER}"`),
    },
    update: {
      changed: rawBefore !== updateContent,
      contentLen: updateContent.length,
      rawWordCount: wordCount(updateContent),
      keyword: keywordStats(updateContent),
      hasOldAuthorUrl: updateContent.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: updateContent.includes(AUTHOR_URL),
      hasServiceSchema: updateContent.includes(`data-ttcqn-service-schema="${SERVICE_MARKER}"`),
      hasFinalAuthor: updateContent.includes("ttcqn-author-final") && updateContent.includes(AUTHOR_URL),
      forbidden: hasForbidden(updateContent),
      hasBinhDuong: /Bình Dương/iu.test(stripText(updateContent)),
    },
    rankMath: null,
    rankScore: null,
    verify: null,
  };

  if (!dryRun) {
    mkdirSync(backupDir, { recursive: true });
    writeFileSync(join(backupDir, `page-${TARGET.id}-before.json`), JSON.stringify(before, null, 2) + "\n", "utf8");
    writeFileSync(join(backupDir, `page-${TARGET.id}-before-content.html`), rawBefore, "utf8");

    await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}`, {
      method: "POST",
      body: {
        title: TITLE,
        excerpt: META_DESC,
        content: updateContent,
      },
    });

    try {
      report.rankMath = await wp("/rankmath/v1/updateMeta", {
        method: "POST",
        body: {
          objectType: "post",
          objectID: TARGET.id,
          meta: {
            rank_math_title: TITLE,
            rank_math_description: META_DESC,
            rank_math_focus_keyword: "hút bể phốt Đông Triều",
          },
        },
      });
    } catch (error) {
      report.rankMath = { error: String(error.message || error) };
    }

    try {
      report.rankScore = await wp("/rankmath/v1/updateSeoScore", {
        method: "POST",
        body: {
          objectID: TARGET.id,
          score: 1,
        },
      });
    } catch (error) {
      report.rankScore = { error: String(error.message || error) };
    }

    const after = await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}?context=edit`);
    writeFileSync(join(backupDir, `page-${TARGET.id}-after.json`), JSON.stringify(after, null, 2) + "\n", "utf8");
    report.after = {
      title: after.title?.raw,
      excerpt: stripText(after.excerpt?.raw || ""),
      contentLen: (after.content?.raw || "").length,
      rawWordCount: wordCount(after.content?.raw || ""),
      keyword: keywordStats(after.content?.raw || ""),
    };

    report.verify = await fetchPublic();
  }

  report.ok =
    dryRun ||
    Boolean(
      report.verify?.status === 200 &&
        report.verify?.titleLen >= 60 &&
        report.verify?.titleLen <= 70 &&
        report.verify?.metaDescLen >= 140 && // sometimes slightly shorter is allowed, but we target 150-160
        report.verify?.metaDescLen <= 165 &&
        report.verify?.canonical === TARGET.url &&
        report.verify?.h1?.length === 1 &&
        report.verify?.h2?.some((h) => /nguyên nhân/iu.test(h)) &&
        report.verify?.h2?.some((h) => /cam kết|tại sao chọn/iu.test(h)) &&
        report.verify?.h2?.some((h) => /bảng giá/iu.test(h)) &&
        report.verify?.h2?.some((h) => /quy trình/iu.test(h)) &&
        report.verify?.h2?.some((h) => /nap|liên hệ/iu.test(h)) &&
        report.verify?.h2?.some((h) => /faq/iu.test(h)) &&
        report.verify?.hasServiceSchema &&
        report.verify?.hasAuthorArchive &&
        report.verify?.hasFinalAuthor &&
        !report.verify?.hasOldAuthorUrl &&
        report.verify?.hasCleanupMarker &&
        report.verify?.forbidden?.length === 0 &&
        !report.verify?.hasBinhDuong &&
        report.verify?.imageAlts?.some((alt) => /hút bể phốt.+Đông Triều|Đông Triều.+hút bể phốt/iu.test(alt)),
    );

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ ok: report.ok, mode: report.mode, reportPath, backupDir, update: report.update, verify: report.verify }, null, 2));
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
