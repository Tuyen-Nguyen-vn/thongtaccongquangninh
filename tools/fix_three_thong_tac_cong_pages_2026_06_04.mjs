import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const OLD_AUTHOR_URL = "https://thongtaccongquangninh.com/nguyen-song-hao/";

const targets = [
  {
    id: 425,
    slug: "thong-tac-cong-dong-trieu",
    url: "https://thongtaccongquangninh.com/thong-tac-cong-dong-trieu/",
    keyword: "thông tắc cống Đông Triều",
    focusAscii: "thong tac cong dong trieu",
    title: "Thông tắc cống Đông Triều 24/7, không đục phá, thợ có mặt nhanh",
    metaDesc: "Thông tắc cống Đông Triều 24/7, không đục phá, báo giá rõ, có mặt nhanh. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi nhanh chóng tại nhà.",
    draftPath: "content-drafts/thong-tac-cong/thong-tac-cong-dong-trieu-rankmath-90.md",
    images: {
      img1: {
        url: "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/tho-thong-tac-cong-4.webp",
        alt: "thông tắc cống Đông Triều bằng máy lò xo không đục phá",
        caption: "Ảnh thực tế kỹ thuật thông cống bằng máy lò xo tại Đông Triều."
      },
      img2: {
        url: "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/du-an-thong-tac-cong-dong-trieu.webp",
        alt: "Thợ thông cống Đông Triều xử lý cống nghẹt tại khu dân cư ở Mạo Khê",
        caption: "Ảnh thực tế thi công thông tắc cống tại Đông Triều."
      },
      img3: {
        url: "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/tho-thong-tac-cong-14.webp",
        alt: "Thợ thông tắc cống Đông Triều tại nhà dân ở Đông Triều",
        caption: "Đội thợ kỹ thuật thông tắc cống Đông Triều sẵn sàng phục vụ 24/7."
      }
    }
  },
  {
    id: 426,
    slug: "thong-tac-cong-mong-cai",
    url: "https://thongtaccongquangninh.com/thong-tac-cong-mong-cai/",
    keyword: "thông tắc cống Móng Cái",
    focusAscii: "thong tac cong mong cai",
    title: "Thông tắc cống Móng Cái 24/7, không đục phá, thợ có mặt nhanh",
    metaDesc: "Thông tắc cống Móng Cái 24/7, không đục phá, báo giá rõ, có mặt nhanh. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi nhanh chóng tại nhà.",
    draftPath: "content-drafts/thong-tac-cong/thong-tac-cong-mong-cai-rankmath-90.md",
    images: {
      img1: {
        url: "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/tho-thong-tac-cong-0.webp",
        alt: "thông tắc cống Móng Cái bằng máy lò xo không đục phá",
        caption: "Ảnh thực tế kỹ thuật thông cống bằng máy lò xo tại Móng Cái."
      },
      img2: {
        url: "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/tho-thong-tac-cong-5.webp",
        alt: "Thợ thông cống Móng Cái xử lý cống trào ngược cho cửa hàng tại Hải Yên",
        caption: "Ảnh thực tế thi công xử lý cống nghẹt nhà hàng tại Móng Cái."
      },
      img3: {
        url: "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/tho-thong-tac-cong-10.webp",
        alt: "Thợ thông tắc cống Móng Cái tại nhà dân ở Móng Cái",
        caption: "Đội thợ kỹ thuật thông tắc cống Móng Cái sẵn sàng phục vụ 24/7."
      }
    }
  },
  {
    id: 427,
    slug: "thong-tac-cong-van-don",
    url: "https://thongtaccongquangninh.com/thong-tac-cong-van-don/",
    keyword: "thông tắc cống Vân Đồn",
    focusAscii: "thong tac cong van don",
    title: "Thông tắc cống Vân Đồn 24/7, không đục phá, thợ có mặt nhanh",
    metaDesc: "Thông tắc cống Vân Đồn 24/7, không đục phá, báo giá rõ, có mặt nhanh. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi nhanh chóng tại nhà.",
    draftPath: "content-drafts/thong-tac-cong/thong-tac-cong-van-don-rankmath-90.md",
    images: {
      img1: {
        url: "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/tho-thong-tac-cong-2.webp",
        alt: "thông tắc cống Vân Đồn bằng máy lò xo không đục phá",
        caption: "Ảnh thực tế kỹ thuật thông cống bằng máy lò xo tại Vân Đồn."
      },
      img2: {
        url: "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/tho-thong-tac-cong-6.webp",
        alt: "Thợ thông cống Vân Đồn xử lý cống trào ngược tại nhà dân tại Cái Rồng",
        caption: "Ảnh thực tế thi công xử lý cống nghẹt nhà dân tại Vân Đồn."
      },
      img3: {
        url: "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/tho-thong-tac-cong-11.webp",
        alt: "Thợ thông tắc cống Vân Đồn tại nhà dân ở Vân Đồn",
        caption: "Đội thợ kỹ thuật thông tắc cống Vân Đồn sẵn sàng phục vụ 24/7."
      }
    }
  }
];

const apply = process.argv.includes("--apply");
const dryRun = !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-p1-thong-tac-cong-three-pages-${stamp}`);
const reportPath = join(ROOT, "reports", `p1-thong-tac-cong-three-pages-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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

function keywordStats(input, focusAscii) {
  const text = removeDiacritics(stripText(input)).toLowerCase();
  const total = text ? text.split(/\s+/u).filter(Boolean).length : 0;
  let count = 0;
  let index = 0;
  while ((index = text.indexOf(focusAscii, index)) !== -1) {
    count++;
    index += focusAscii.length;
  }
  const density = total ? (count * focusAscii.split(/\s+/u).length) / total : 0;
  return { count, total, density, densityPct: Number((density * 100).toFixed(2)) };
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
    schemaTypes: [...new Set(schemaTypes)],
    hasServiceSchema: schemaTypes.includes("Service"),
    hasAuthorArchive: html.includes(AUTHOR_URL),
    hasOldAuthorUrl: html.includes(OLD_AUTHOR_URL),
    hasFinalAuthor: html.includes("ttcqn-author-final") && html.includes(AUTHOR_URL),
    imageAlts,
  };
}

function serviceSchemaHtml(target) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${target.url}#service`,
    name: target.keyword + " Quảng Ninh",
    serviceType: `Thông tắc cống tại ${target.slug.split("-").pop().replace(/^[a-z]/, c => c.toUpperCase())}, Quảng Ninh`,
    url: target.url,
    provider: {
      "@type": "LocalBusiness",
      name: "Môi Trường Đô Thị Số 1 Quảng Ninh",
      url: SITE,
      telephone: ["+84963953533", "+84931156756"],
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: `${target.slug.split("-").pop().replace(/^[a-z]/, c => c.toUpperCase())}, Quảng Ninh`,
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
      url: target.url,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
    },
  };

  return `<!-- wp:html -->\n<script type="application/ld+json" data-ttcqn-service-schema="${target.slug}">${JSON.stringify(schema)}</script>\n<!-- /wp:html -->`;
}

function finalAuthorHtml() {
  return `<!-- wp:paragraph {"className":"ttcqn-author-nguyen-song-hao ttcqn-author-final"} -->\n<p class="ttcqn-author-nguyen-song-hao ttcqn-author-final">Tác giả: <a href="${AUTHOR_URL}">Nguyễn Song Hào</a></p>\n<!-- /wp:paragraph -->`;
}

function formatMarkdownInline(text) {
  return text
    .replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([\s\S]+?)\*/g, "<em>$1</em>")
    .replace(/\[([\s\S]+?)\]\(([\s\S]+?)\)/g, '<a href="$2">$1</a>');
}

function parseMarkdownTable(rows) {
  const cleanRows = rows.filter(r => !r.includes("---"));
  if (cleanRows.length === 0) return "";
  
  let html = '<!-- wp:table -->\n<table class="wp-block-table"><tbody>';
  
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

function convertMarkdownToWpBlocks(mdPath, target) {
  const md = readFileSync(mdPath, "utf8");
  const lines = md.split(/\r?\n/);
  const blocks = [];
  
  let contentStartIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("# ")) {
      contentStartIndex = i + 1;
      break;
    }
  }
  
  let currentParagraph = [];
  let currentList = [];
  let currentTable = [];
  let isInsideTable = false;
  
  for (let i = contentStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith("|")) {
      isInsideTable = true;
      currentTable.push(line);
      continue;
    } else if (isInsideTable && !line.startsWith("|")) {
      isInsideTable = false;
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
    
    if (line.startsWith("## ")) {
      const text = line.substring(3).trim();
      blocks.push(`<!-- wp:heading -->\n<h2>${text}</h2>\n<!-- /wp:heading -->`);
    } else if (line.startsWith("### ")) {
      const text = line.substring(4).trim();
      blocks.push(`<!-- wp:heading {"level":3} -->\n<h3>${text}</h3>\n<!-- /wp:heading -->`);
    } else if (line.startsWith("* ") || line.startsWith("- ")) {
      let text = line.substring(2).trim();
      currentList.push(formatMarkdownInline(text));
    } else {
      currentParagraph.push(formatMarkdownInline(line));
    }
  }
  
  if (currentParagraph.length > 0) {
    blocks.push(`<!-- wp:paragraph -->\n<p>${currentParagraph.join(" ")}</p>\n<!-- /wp:paragraph -->`);
  }
  if (currentList.length > 0) {
    blocks.push(`<!-- wp:list -->\n<ul>\n${currentList.map(li => `<li>${li}</li>`).join("\n")}\n</ul>\n<!-- /wp:list -->`);
  }
  if (currentTable.length > 0) {
    blocks.push(parseMarkdownTable(currentTable));
  }
  
  // Inject images
  const img1 = `<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="${target.images.img1.url}" alt="${target.images.img1.alt}"/><figcaption class="wp-element-caption">${target.images.img1.caption}</figcaption></figure>\n<!-- /wp:image -->`;
  blocks.splice(1, 0, img1);
  
  const img2 = `<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="${target.images.img2.url}" alt="${target.images.img2.alt}"/><figcaption class="wp-element-caption">${target.images.img2.caption}</figcaption></figure>\n<!-- /wp:image -->`;
  let caseStudyIndex = blocks.findIndex(b => b.includes("<h2>Case study E-E-A-T"));
  if (caseStudyIndex !== -1) {
    blocks.splice(caseStudyIndex + 3, 0, img2);
  }
  
  const img3 = `<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="${target.images.img3.url}" alt="${target.images.img3.alt}"/><figcaption class="wp-element-caption">${target.images.img3.caption}</figcaption></figure>\n<!-- /wp:image -->`;
  let napIndex = blocks.findIndex(b => b.includes("<h2>NAP liên hệ"));
  if (napIndex !== -1) {
    blocks.splice(napIndex + 2, 0, img3);
  }
  
  const schemaBlock = serviceSchemaHtml(target);
  const authorBlock = finalAuthorHtml();
  
  return blocks.join("\n\n") + "\n\n" + schemaBlock + "\n\n" + authorBlock;
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
      "User-Agent": "Codex Three Pages Fixer",
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

async function fetchPublic(targetUrl) {
  const url = new URL(targetUrl);
  url.searchParams.set("nowprocket", "1");
  url.searchParams.set("codex", `three-pages-${Date.now()}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "Codex Three Pages Verifier" },
  });
  const html = await response.text();
  return { status: response.status, url: response.url, ...extractPublicMeta(html) };
}

async function main() {
  mkdirSync(dirname(reportPath), { recursive: true });
  const results = [];

  for (const target of targets) {
    console.log(`Processing: ${target.slug} (ID: ${target.id})...`);
    const before = await wp(`/wp/v2/pages/${target.id}?context=edit`);
    if (before.slug !== target.slug || before.status !== "publish") {
      throw new Error(`Unexpected target state for ${target.slug}: ${before.status}`);
    }

    const rawBefore = before.content?.raw || "";
    const updateContent = convertMarkdownToWpBlocks(join(ROOT, target.draftPath), target);
    
    const pageResult = {
      id: target.id,
      slug: target.slug,
      title: target.title,
      metaDesc: target.metaDesc,
      before: {
        title: before.title?.raw,
        excerpt: stripText(before.excerpt?.raw || ""),
        contentLen: rawBefore.length,
        rawWordCount: wordCount(rawBefore),
        keyword: keywordStats(rawBefore, target.focusAscii),
      },
      update: {
        changed: rawBefore !== updateContent,
        contentLen: updateContent.length,
        rawWordCount: wordCount(updateContent),
        keyword: keywordStats(updateContent, target.focusAscii),
        hasServiceSchema: updateContent.includes(`data-ttcqn-service-schema="${target.slug}"`),
        hasFinalAuthor: updateContent.includes("ttcqn-author-final") && updateContent.includes(AUTHOR_URL),
      },
      rankMath: null,
      verify: null,
    };

    if (!dryRun) {
      mkdirSync(backupDir, { recursive: true });
      writeFileSync(join(backupDir, `page-${target.id}-before.json`), JSON.stringify(before, null, 2) + "\n", "utf8");
      writeFileSync(join(backupDir, `page-${target.id}-before-content.html`), rawBefore, "utf8");

      await wp(`/wp/v2/pages/${target.id}`, {
        method: "POST",
        body: {
          title: target.title,
          excerpt: target.metaDesc,
          content: updateContent,
        },
      });

      try {
        pageResult.rankMath = await wp("/rankmath/v1/updateMeta", {
          method: "POST",
          body: {
            objectType: "post",
            objectID: target.id,
            meta: {
              rank_math_title: target.title,
              rank_math_description: target.metaDesc,
              rank_math_focus_keyword: target.keyword,
            },
          },
        });
      } catch (error) {
        pageResult.rankMath = { error: String(error.message || error) };
      }

      const after = await wp(`/wp/v2/pages/${target.id}?context=edit`);
      writeFileSync(join(backupDir, `page-${target.id}-after.json`), JSON.stringify(after, null, 2) + "\n", "utf8");
      
      pageResult.after = {
        title: after.title?.raw,
        excerpt: stripText(after.excerpt?.raw || ""),
        contentLen: (after.content?.raw || "").length,
        rawWordCount: wordCount(after.content?.raw || ""),
      };

      pageResult.verify = await fetchPublic(target.url);
    }
    
    results.push(pageResult);
  }

  const report = {
    ok: results.every(r => dryRun || (
      r.verify?.status === 200 &&
      r.verify?.titleLen >= 60 &&
      r.verify?.titleLen <= 70 &&
      r.verify?.metaDescLen >= 140 &&
      r.verify?.metaDescLen <= 165 &&
      r.verify?.h1?.length === 1 &&
      r.verify?.h2?.some((h) => /nguyên nhân/iu.test(h)) &&
      r.verify?.h2?.some((h) => /cam kết|tại sao chọn/iu.test(h)) &&
      r.verify?.h2?.some((h) => /bảng giá/iu.test(h)) &&
      r.verify?.h2?.some((h) => /quy trình/iu.test(h)) &&
      r.verify?.h2?.some((h) => /nap|liên hệ/iu.test(h)) &&
      r.verify?.h2?.some((h) => /faq/iu.test(h)) &&
      r.verify?.hasServiceSchema &&
      r.verify?.hasAuthorArchive &&
      r.verify?.hasFinalAuthor
    )),
    mode: dryRun ? "dry-run" : "apply",
    generatedAt: new Date().toISOString(),
    backupDir,
    results
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ ok: report.ok, mode: report.mode, reportPath, backupDir }, null, 2));
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
