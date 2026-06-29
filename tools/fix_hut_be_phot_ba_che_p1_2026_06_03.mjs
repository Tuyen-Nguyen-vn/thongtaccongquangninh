import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = {
  id: 2047,
  collection: "posts",
  slug: "hut-be-phot-ba-che",
  url: "https://thongtaccongquangninh.com/hut-be-phot-ba-che/",
};
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const OLD_AUTHOR_URL = "https://thongtaccongquangninh.com/nguyen-song-hao/";
const TITLE = "Hút bể phốt Ba Chẽ Quảng Ninh 24/7 - Xe vào vùng núi, báo giá rõ";
const META_DESC =
  "Hút bể phốt Ba Chẽ Quảng Ninh 24/7 cho nhà dân, trường học, cơ sở vùng núi. Xe đến tận nơi, hút sạch, không phát sinh phí ẩn. Gọi 0963.953.533 / 0931.156.756.";
const FOCUS_ASCII = "hut be phot ba che";
const SERVICE_MARKER = "hut-be-phot-ba-che";
const CLEANUP_MARKER = "ttcqn-hut-be-phot-ba-che-p1-cleanup-2026-06-03";

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-p1-hut-be-phot-ba-che-${stamp}`);
const reportPath = join(ROOT, "reports", `p1-hut-be-phot-ba-che-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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
  };
}

function serviceSchemaHtml() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${TARGET.url}#service`,
    name: "Hút bể phốt Ba Chẽ Quảng Ninh",
    serviceType: "Hút bể phốt cho nhà dân, trường học và cơ sở tập thể tại Ba Chẽ",
    url: TARGET.url,
    provider: {
      "@type": "LocalBusiness",
      name: "Môi Trường Đô Thị Số 1 Quảng Ninh",
      url: SITE,
      telephone: ["+84963953533", "+84931156756"],
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Ba Chẽ, Quảng Ninh",
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

function removeAuthorBox(content) {
  const pattern =
    /\s*<!-- wp:group \{"className":"ttcqn-author-nguyen-song-hao ttcqn-author-box"[\s\S]*?<!-- \/wp:group -->\s*/u;
  const next = String(content).replace(pattern, "\n\n");
  return { content: next, changed: next !== content };
}

function removeDuplicatedReminder(content) {
  const pattern = /\s*<h2>Ghi nhớ khi cần hút bể phốt Ba Chẽ khẩn cấp<\/h2>[\s\S]*?(?=<h2>NAP liên hệ<\/h2>)/u;
  const next = String(content).replace(pattern, "\n");
  return { content: next, changed: next !== content };
}

function removeEscapedSchemaParagraph(content) {
  const pattern = /\s*<p>&lt;script type=&quot;application\/ld\+json&quot;&gt;[\s\S]*?&lt;\/script&gt;<\/p>\s*/u;
  const next = String(content).replace(pattern, "\n");
  return { content: next, changed: next !== content };
}

function reduceExactKeywordRepeats(content) {
  const replacements = [
    "dịch vụ tại Ba Chẽ",
    "ca bể đầy tại Ba Chẽ",
    "xe hút bể khu vực Ba Chẽ",
    "việc xử lý bể tại Ba Chẽ",
    "dịch vụ bể phốt tại Ba Chẽ",
    "ca xử lý vùng núi",
  ];
  let seen = 0;
  const next = String(content).replace(/(<strong>)?hút bể phốt Ba Chẽ(<\/strong>)?/giu, (full) => {
    seen++;
    if (seen <= 7) return full;
    return replacements[(seen - 8) % replacements.length];
  });
  return { content: next, changed: next !== content, kept: Math.min(seen, 7), replaced: Math.max(0, seen - 7) };
}

function normalizeHeadings(content) {
  const replacements = [
    [/Khi nào cần gọi hút bể phốt Ba Chẽ/gu, "Khi nào cần gọi xe hút bể tại Ba Chẽ"],
    [/Cam kết 3 Không khi hút bể phốt Ba Chẽ/gu, "Cam kết 3 Không khi xử lý bể phốt tại Ba Chẽ"],
    [/Bảng giá hút bể phốt Ba Chẽ 2026/gu, "Bảng giá dịch vụ tại Ba Chẽ 2026"],
    [/Quy trình 5 bước hút bể phốt Ba Chẽ/gu, "Quy trình 5 bước cho ca bể đầy tại Ba Chẽ"],
    [/Lưu ý riêng trước khi đặt lịch hút bể phốt Ba Chẽ/gu, "Lưu ý riêng trước khi đặt lịch tại Ba Chẽ"],
    [/Các tình huống hút bể phốt Ba Chẽ thường gặp/gu, "Các tình huống bể đầy thường gặp tại Ba Chẽ"],
    [/Chu kỳ bảo trì sau khi hút bể phốt Ba Chẽ/gu, "Chu kỳ bảo trì sau khi xử lý bể tại Ba Chẽ"],
    [/Gọi hút bể phốt Ba Chẽ ngay/gu, "Gọi xử lý bể đầy tại Ba Chẽ ngay"],
    [/FAQ về hút bể phốt Ba Chẽ/gu, "FAQ về dịch vụ bể phốt tại Ba Chẽ"],
  ];
  let next = String(content);
  let count = 0;
  for (const [pattern, value] of replacements) {
    const before = next;
    next = next.replace(pattern, value);
    if (before !== next) count++;
  }
  return { content: next, changed: next !== content, count };
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
      /\s*<!-- wp:paragraph \{"className":"ttcqn-author-nguyen-song-hao ttcqn-author-final"\} -->[\s\S]*?<!-- \/wp:paragraph -->\s*$/u,
      "",
    );

  return `${next.trim()}\n\n${serviceSchemaHtml()}\n\n${finalAuthorHtml()}`;
}

function updateContent(raw) {
  let content = String(raw);
  const before = content;
  const changes = [];

  const oldUrlBefore = content;
  content = content.replaceAll(OLD_AUTHOR_URL, AUTHOR_URL);
  changes.push({ label: "replace_old_author_url", changed: oldUrlBefore !== content });

  const imageAltBefore = content;
  content = content.replace(
    'alt="Đội thợ xử lý bùn cứng nhiều năm tại Ba Chẽ"',
    'alt="Đội thợ hút bể phốt xử lý bùn cứng tại Ba Chẽ"',
  );
  changes.push({ label: "fix_case_image_alt", changed: imageAltBefore !== content });

  const authorBox = removeAuthorBox(content);
  content = authorBox.content;
  changes.push({ label: "remove_duplicate_author_box", changed: authorBox.changed });

  const reminder = removeDuplicatedReminder(content);
  content = reminder.content;
  changes.push({ label: "remove_duplicate_reminder_section", changed: reminder.changed });

  const escapedSchema = removeEscapedSchemaParagraph(content);
  content = escapedSchema.content;
  changes.push({ label: "remove_escaped_schema_text", changed: escapedSchema.changed });

  const headings = normalizeHeadings(content);
  content = headings.content;
  changes.push({ label: "normalize_keyword_heavy_headings", changed: headings.changed, count: headings.count });

  const reduced = reduceExactKeywordRepeats(content);
  content = reduced.content;
  changes.push({ label: "reduce_exact_keyword_repeats", changed: reduced.changed, kept: reduced.kept, replaced: reduced.replaced });

  const blogSchemaBefore = content;
  content = updateBlogPostingSchema(content);
  changes.push({ label: "update_blogposting_schema", changed: blogSchemaBefore !== content });

  const schemaBefore = content;
  content = insertServiceAndFinalAuthor(content);
  changes.push({ label: "add_service_schema_and_final_author", changed: schemaBefore !== content });

  return { content, changed: content !== before, changes };
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
      "User-Agent": "Codex P1 Ba Che cleanup",
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
  url.searchParams.set("codex", `ba-che-${Date.now()}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "Codex P1 Ba Che verifier" },
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
    title: TITLE,
    titleLen: [...TITLE].length,
    metaDesc: META_DESC,
    metaDescLen: [...META_DESC].length,
    before: {
      title: before.title?.raw,
      excerpt: stripText(before.excerpt?.raw || ""),
      contentLen: raw.length,
      rawWordCount: wordCount(raw),
      keyword: keywordStats(raw),
      hasOldAuthorUrl: raw.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: raw.includes(AUTHOR_URL),
      hasServiceSchema: raw.includes(`data-ttcqn-service-schema="${SERVICE_MARKER}"`),
      badAlt: raw.includes('alt="Đội thợ xử lý bùn cứng nhiều năm tại Ba Chẽ"'),
    },
    update: {
      changed: update.changed,
      contentLen: update.content.length,
      rawWordCount: wordCount(update.content),
      keyword: keywordStats(update.content),
      changes: update.changes,
      hasOldAuthorUrl: update.content.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: update.content.includes(AUTHOR_URL),
      hasServiceSchema: update.content.includes(`data-ttcqn-service-schema="${SERVICE_MARKER}"`),
      hasFinalAuthor: update.content.includes("ttcqn-author-final") && update.content.includes(AUTHOR_URL),
      badAlt: update.content.includes('alt="Đội thợ xử lý bùn cứng nhiều năm tại Ba Chẽ"'),
    },
    rankMath: null,
    rankScore: null,
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
            rank_math_focus_keyword: "hút bể phốt Ba Chẽ",
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
    writeFileSync(join(backupDir, `post-${TARGET.id}-after.json`), JSON.stringify(after, null, 2) + "\n", "utf8");
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
        report.verify?.metaDescLen >= 150 &&
        report.verify?.metaDescLen <= 160 &&
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
        report.verify?.imageAlts?.some((alt) => /hút bể phốt.+Ba Chẽ|Ba Chẽ.+hút bể phốt/iu.test(alt)),
    );

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ ok: report.ok, mode: report.mode, reportPath, backupDir, update: report.update, verify: report.verify }, null, 2));
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
