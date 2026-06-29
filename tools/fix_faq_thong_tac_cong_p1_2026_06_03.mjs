import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = {
  id: 1377,
  collection: "posts",
  slug: "cau-hoi-thuong-gap-thong-tac-cong",
  url: "https://thongtaccongquangninh.com/cau-hoi-thuong-gap-thong-tac-cong/",
};
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const OLD_AUTHOR_URL = "https://thongtaccongquangninh.com/nguyen-song-hao/";
const TITLE = "Câu hỏi thường gặp thông tắc cống Quảng Ninh, giá và bảo hành";
const META_DESC =
  "Câu hỏi thường gặp thông tắc cống Quảng Ninh: giá, thời gian, bảo hành, xử lý không đục phá. Gọi 0963.953.533 / 0931.156.756 để kiểm tra nhanh trong ngày.";
const FOCUS_KEYWORD = "câu hỏi thường gặp thông tắc cống";
const FOCUS_ASCII = "cau hoi thuong gap thong tac cong";
const SERVICE_MARKER = "faq-thong-tac-cong-quang-ninh";
const CLEANUP_MARKER = "ttcqn-faq-thong-tac-cong-p1-cleanup";

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-p1-faq-thong-tac-cong-${stamp}`);
const reportPath = join(ROOT, "reports", `p1-faq-thong-tac-cong-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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

function countMatches(input, pattern) {
  return (String(input).match(pattern) || []).length;
}

function decodeEntities(input) {
  return String(input ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
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
  };
}

function reduceExactKeywordRepeats(content) {
  const replacements = [
    "phần giải đáp này",
    "mục hỏi đáp này",
    "nội dung FAQ này",
    "phần trả lời này",
    "mục tư vấn này",
  ];
  let seen = 0;
  return String(content).replace(/(<strong>)?câu hỏi thường gặp thông tắc cống(<\/strong>)?/giu, (full) => {
    seen++;
    if (seen <= 6) return full;
    return replacements[(seen - 7) % replacements.length];
  });
}

function removeLeanParagraphs(content) {
  const removed = [];
  const patterns = [
    /^Nội dung được viết để người cần /iu,
    /^Nếu anh\/chị đang tìm câu hỏi thường gặp thông tắc cống trước khi đặt lịch/iu,
    /^Nếu anh\/chị đang so sánh nhiều đơn vị/iu,
    /^Với câu hỏi thường gặp thông tắc cống này, nguyên tắc an toàn/iu,
    /^Nếu anh\/chị hỏi câu hỏi thường gặp thông tắc cống này qua điện thoại/iu,
    /^Với câu hỏi thường gặp thông tắc cống về giá/iu,
    /^Khi gọi ban đêm, anh\/chị nên/iu,
    /^Sau khi thông, nên xả nước nóng vừa phải/iu,
    /^Đây là câu hỏi thường gặp thông tắc cống cần lưu ý vì hóa chất/iu,
    /^Một câu hỏi thường gặp thông tắc cống khác là quy trình/iu,
    /^Quy trình này giúp việc thông tắc cống Quảng Ninh/iu,
    /^Sau xử lý, nước rút đều hơn/iu,
    /^Trong câu hỏi thường gặp thông tắc cống về chuẩn bị/iu,
    /^Không nên đồng ý nếu thợ chỉ nói giá mơ hồ/iu,
    /^Với ca khẩn cấp, hãy gọi hotline để được điều phối gần nhất/iu,
  ];

  const next = String(content).replace(/<p\b[^>]*>[\s\S]*?<\/p>/giu, (paragraph) => {
    const text = stripText(paragraph);
    if (patterns.some((pattern) => pattern.test(text))) {
      removed.push(text.slice(0, 140));
      return "";
    }
    return paragraph;
  });
  return { content: next.replace(/\n{3,}/gu, "\n\n"), removed };
}

function removeAuthorBox(content) {
  const pattern =
    /\s*<!-- wp:group \{"className":"ttcqn-author-nguyen-song-hao ttcqn-author-box"[\s\S]*?<!-- \/wp:group -->\s*/u;
  const next = String(content).replace(pattern, "\n\n");
  return { content: next, changed: next !== content };
}

function serviceSchemaHtml() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${TARGET.url}#service`,
    name: "Câu hỏi thường gặp thông tắc cống Quảng Ninh",
    serviceType: "Tư vấn và xử lý thông tắc cống tại Quảng Ninh",
    url: TARGET.url,
    provider: {
      "@type": "LocalBusiness",
      name: "Môi Trường Đô Thị Số 1 Quảng Ninh",
      url: SITE,
      telephone: ["+84963953533", "+84931156756"],
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Quảng Ninh",
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

function updateBlogPostingSchema(content) {
  return String(content).replace(
    /(<script type="application\/ld\+json" data-ttcqn-author-nguyen-song-hao="1">)([\s\S]*?)(<\/script>)/u,
    (full, open, json, close) => {
      try {
        const schema = JSON.parse(json);
        schema["@id"] = `${TARGET.url}#blogposting`;
        schema.mainEntityOfPage = TARGET.url;
        schema.headline = TITLE;
        schema.description = META_DESC;
        schema.dateModified = new Date().toISOString();
        if (schema.author && typeof schema.author === "object") {
          schema.author.url = AUTHOR_URL;
        }
        return `${open}${JSON.stringify(schema)}${close}`;
      } catch {
        return full;
      }
    },
  );
}

function insertServiceAndFinalAuthor(content) {
  let next = String(content)
    .replace(
      new RegExp(
        `\\s*<!-- wp:html -->\\s*<script type="application\\/ld\\+json" data-ttcqn-service-schema="${SERVICE_MARKER}">[\\s\\S]*?<\\/script>\\s*<!-- \\/wp:html -->`,
        "u",
      ),
      "",
    )
    .replace(
      /\s*<!-- wp:paragraph \{"className":"ttcqn-author-nguyen-song-hao ttcqn-author-final"\} -->\s*<p class="ttcqn-author-nguyen-song-hao ttcqn-author-final">[\s\S]*?<\/p>\s*<!-- \/wp:paragraph -->\s*$/u,
      "",
    )
    .trim();

  next = `${next}\n\n${serviceSchemaHtml()}\n\n${finalAuthorHtml()}`;
  return next;
}

function updateContent(raw) {
  let content = String(raw);
  const changes = [];

  const h1Before = content;
  content = content.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/iu, `<h1>${TITLE}</h1>`);
  changes.push({ label: "sync_h1_with_title", changed: h1Before !== content });

  const authorUrlBefore = content;
  content = content.replaceAll(OLD_AUTHOR_URL, AUTHOR_URL);
  changes.push({ label: "replace_old_author_url", changed: authorUrlBefore !== content });

  const repeatBefore = content;
  content = reduceExactKeywordRepeats(content);
  changes.push({
    label: "reduce_exact_focus_keyword_repeats",
    changed: repeatBefore !== content,
    beforeCount: countMatches(repeatBefore, /câu hỏi thường gặp thông tắc cống/giu),
    afterCount: countMatches(content, /câu hỏi thường gặp thông tắc cống/giu),
  });

  const lean = removeLeanParagraphs(content);
  content = lean.content;
  changes.push({ label: "remove_repetitive_low_value_paragraphs", changed: lean.removed.length > 0, removed: lean.removed });

  const authorBox = removeAuthorBox(content);
  content = authorBox.content;
  changes.push({ label: "remove_duplicate_author_box", changed: authorBox.changed });

  const blogSchemaBefore = content;
  content = updateBlogPostingSchema(content);
  changes.push({ label: "update_blogposting_schema", changed: blogSchemaBefore !== content });

  const finalBefore = content;
  content = insertServiceAndFinalAuthor(content);
  changes.push({ label: "add_service_schema_and_final_author", changed: finalBefore !== content });

  return { content, changes };
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
      "User-Agent": "Codex P1 FAQ cleanup",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(60000),
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
  url.searchParams.set("codex", `faq-thong-tac-cong-${Date.now()}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "Codex P1 FAQ verifier" },
    signal: AbortSignal.timeout(60000),
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

  const raw = before.content?.raw || "";
  const update = updateContent(raw);
  const report = {
    ok: false,
    mode: dryRun ? "dry-run" : "apply",
    generatedAt: new Date().toISOString(),
    target: TARGET,
    backupDir,
    before: {
      title: before.title?.raw,
      excerpt: stripText(before.excerpt?.raw || ""),
      rawWordCount: wordCount(raw),
      rawH1Count: countMatches(raw, /<h1\b/giu),
      rawH2Count: countMatches(raw, /<h2\b/giu),
      exactFocusCount: countMatches(raw, /câu hỏi thường gặp thông tắc cống/giu),
      keyword: keywordStats(raw),
      hasOldAuthorUrl: raw.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: raw.includes(AUTHOR_URL),
      hasServiceSchema: raw.includes(`data-ttcqn-service-schema="${SERVICE_MARKER}"`) || /"@type"\s*:\s*"Service"/iu.test(raw),
      hasFinalAuthor: raw.includes("ttcqn-author-final") && raw.includes(AUTHOR_URL),
    },
    update: {
      changes: update.changes,
      afterRawWordCount: wordCount(update.content),
      afterRawH1Count: countMatches(update.content, /<h1\b/giu),
      afterRawH2Count: countMatches(update.content, /<h2\b/giu),
      exactFocusCount: countMatches(update.content, /câu hỏi thường gặp thông tắc cống/giu),
      keyword: keywordStats(update.content),
      metaDescLen: [...META_DESC].length,
      hasOldAuthorUrl: update.content.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: update.content.includes(AUTHOR_URL),
      hasServiceSchema: update.content.includes(`data-ttcqn-service-schema="${SERVICE_MARKER}"`),
      finalAuthorLine:
        /<!-- wp:paragraph \{"className":"ttcqn-author-nguyen-song-hao ttcqn-author-final"\} -->\s*<p class="ttcqn-author-nguyen-song-hao ttcqn-author-final">[\s\S]*?<\/p>\s*<!-- \/wp:paragraph -->\s*$/u.test(
          update.content,
        ),
    },
    rankMath: null,
    verify: null,
  };

  if (!dryRun) {
    mkdirSync(backupDir, { recursive: true });
    writeFileSync(join(backupDir, `post-${TARGET.id}-before.json`), JSON.stringify(before, null, 2) + "\n", "utf8");
    writeFileSync(join(backupDir, `post-${TARGET.id}-before-content.html`), raw, "utf8");

    await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}`, {
      method: "POST",
      body: {
        title: TITLE,
        excerpt: META_DESC,
        content: update.content,
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
            rank_math_focus_keyword: FOCUS_KEYWORD,
          },
        },
      });
    } catch (error) {
      report.rankMath = { error: String(error.message || error) };
    }

    const after = await wp(`/wp/v2/${TARGET.collection}/${TARGET.id}?context=edit`);
    writeFileSync(join(backupDir, `post-${TARGET.id}-after.json`), JSON.stringify(after, null, 2) + "\n", "utf8");
    report.after = {
      title: after.title?.raw,
      excerpt: stripText(after.excerpt?.raw || ""),
      rawWordCount: wordCount(after.content?.raw || ""),
      contentLen: (after.content?.raw || "").length,
    };

    report.verify = await fetchPublic();
  }

  report.ok =
    dryRun ||
    Boolean(
      report.verify?.status === 200 &&
        report.verify?.metaDescLen >= 150 &&
        report.verify?.metaDescLen <= 160 &&
        report.verify?.canonical === TARGET.url &&
        report.verify?.h1?.length === 1 &&
        report.verify?.h1?.[0] === TITLE &&
        report.verify?.hasServiceSchema &&
        report.verify?.hasCleanupMarker &&
        report.verify?.hasAuthorArchive &&
        report.verify?.hasFinalAuthor &&
        !report.verify?.hasOldAuthorUrl,
    );

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(
    JSON.stringify(
      { ok: report.ok, mode: report.mode, reportPath, backupDir, before: report.before, update: report.update, verify: report.verify },
      null,
      2,
    ),
  );
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
