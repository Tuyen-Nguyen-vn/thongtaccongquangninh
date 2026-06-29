import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = {
  id: 2377,
  collection: "posts",
  slug: "thong-tac-bon-cau-khan-cap-quang-ninh",
  url: "https://thongtaccongquangninh.com/thong-tac-bon-cau-khan-cap-quang-ninh/",
};
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const OLD_AUTHOR_URL = "https://thongtaccongquangninh.com/nguyen-song-hao/";
const NEW_H1 = "Thông tắc bồn cầu khẩn cấp Quảng Ninh 24/7, có thợ sau 15 phút";
const NEW_DESC =
  "Bồn cầu tắc trào ngược tại Quảng Ninh? Gọi 0963.953.533 / 0931.156.756, thợ đến nhanh 24/7, xử lý bằng máy lò xo, không đục phá, báo giá trước cho nhà dân.";
const CAUSE_MARKER = "ttcqn-khan-cap-bon-cau-nguyen-nhan-extra";
const SERVICE_MARKER = "bon-cau-khan-cap-quang-ninh";

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-p1-bon-cau-khan-cap-${stamp}`);
const reportPath = join(ROOT, "reports", `p1-bon-cau-khan-cap-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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
    .replace(/\s+/gu, " ")
    .trim();
}

function wordCount(input) {
  const text = stripText(input);
  return text ? text.split(/\s+/u).length : 0;
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
      const decoded = JSON.parse(match[1].trim());
      collectSchemaTypes(decoded, schemaTypes);
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
    schemaTypes: [...new Set(schemaTypes)],
    hasServiceSchema: schemaTypes.includes("Service"),
    hasCauseMarker: html.includes(CAUSE_MARKER),
    hasAuthorArchive: html.includes(AUTHOR_URL),
    hasOldAuthorUrl: html.includes(OLD_AUTHOR_URL),
    hasFinalAuthor: html.includes("ttcqn-author-final") && html.includes(AUTHOR_URL),
  };
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

function causeBlock() {
  return `<!-- wp:heading -->\n<h2>Nguyên nhân cần thông tắc bồn cầu khẩn cấp Quảng Ninh trong ngày</h2>\n<!-- /wp:heading -->\n<!-- wp:paragraph -->\n<p><!-- ${CAUSE_MARKER} -->Bồn cầu chuyển sang tình trạng khẩn cấp thường không chỉ vì giấy vệ sinh mắc ở miệng xả. Với nhà dân, nhà trọ, khách sạn nhỏ tại Hạ Long, Cẩm Phả, Uông Bí, điểm nghẹt hay nằm ở đoạn cong của ống thoát, nơi khăn ướt, tóc, cặn bẩn và dị vật mềm bị nén lại sau nhiều lần xả nước.</p>\n<!-- /wp:paragraph -->\n<!-- wp:paragraph -->\n<p>Một nguyên nhân khác là bể phốt đã đầy nhưng dấu hiệu ban đầu bị bỏ qua: nước rút chậm, tiếng ục ục sau khi xả, mùi hôi xuất hiện vào chiều tối hoặc khi mưa lớn. Khi bể đầy, việc tiếp tục xả nước chỉ làm áp lực trong đường ống tăng lên, nước bẩn dễ trào ngược ra sàn vệ sinh và lan sang khu vực sinh hoạt.</p>\n<!-- /wp:paragraph -->\n<!-- wp:paragraph -->\n<p>Ở các nhà ống, phòng trọ và cơ sở lưu trú tại Quảng Ninh, đường ống thường nhỏ, nhiều góc cua, có đoạn cải tạo qua nhiều năm nên vật kẹt khó tự trôi. Nếu vừa rơi vật cứng, vừa thấy nước dâng cao, cần ngừng sử dụng ngay, không đổ hóa chất mạnh và gọi thợ để kiểm tra bằng máy lò xo hoặc dụng cụ phù hợp trước khi phải tháo bồn cầu.</p>\n<!-- /wp:paragraph -->`;
}

function serviceSchemaHtml() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${TARGET.url}#service`,
    name: "Thông tắc bồn cầu khẩn cấp Quảng Ninh",
    serviceType: "Thông tắc bồn cầu khẩn cấp 24/7",
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

function updateBlogPostingSchema(content) {
  return String(content).replace(
    /(<script type="application\/ld\+json" data-ttcqn-author-nguyen-song-hao="1">)([\s\S]*?)(<\/script>)/u,
    (full, open, json, close) => {
      try {
        const schema = JSON.parse(json);
        schema["@id"] = `${TARGET.url}#blogposting`;
        schema.mainEntityOfPage = TARGET.url;
        schema.headline = NEW_H1;
        schema.description = NEW_DESC;
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

function insertServiceBeforeFinalAuthor(content) {
  const servicePattern = new RegExp(
    `\\s*<!-- wp:html -->\\s*<script type="application\\/ld\\+json" data-ttcqn-service-schema="${SERVICE_MARKER}">[\\s\\S]*?<\\/script>\\s*<!-- \\/wp:html -->`,
    "u",
  );
  let next = String(content).replace(servicePattern, "");
  const block = serviceSchemaHtml();
  const finalAuthorPattern =
    /(\s*<!-- wp:paragraph \{"className":"ttcqn-author-nguyen-song-hao ttcqn-author-final"\} -->\s*<p class="ttcqn-author-nguyen-song-hao ttcqn-author-final">[\s\S]*?<\/p>\s*<!-- \/wp:paragraph -->\s*)$/u;

  if (finalAuthorPattern.test(next)) {
    return next.replace(finalAuthorPattern, `\n\n${block}\n\n$1`);
  }

  return `${next.trim()}\n\n${block}`;
}

function updateContent(raw) {
  let content = String(raw);
  const changes = [];

  const h1Before = content;
  content = content.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/iu, `<h1>${NEW_H1}</h1>`);
  changes.push({ label: "sync_raw_h1_with_title", changed: h1Before !== content });

  const causeBefore = content;
  if (!content.includes(CAUSE_MARKER)) {
    const anchor = /<h2>Bồn Cầu Bị Tắc Có Dấu Hiệu Nào Cần Gọi Thợ Ngay\?<\/h2>/u;
    content = content.replace(anchor, `${causeBlock()}\n\n$&`);
  }
  changes.push({ label: "add_nguyen_nhan_h2_and_extra_content", changed: causeBefore !== content });

  const authorBefore = content;
  content = content.replaceAll(OLD_AUTHOR_URL, AUTHOR_URL);
  changes.push({ label: "replace_old_author_url", changed: authorBefore !== content });

  const blogSchemaBefore = content;
  content = updateBlogPostingSchema(content);
  changes.push({ label: "update_blogposting_schema", changed: blogSchemaBefore !== content });

  const serviceBefore = content;
  content = insertServiceBeforeFinalAuthor(content);
  changes.push({ label: "add_service_schema_before_final_author", changed: serviceBefore !== content });

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
      "User-Agent": "Codex P1 Bon Cau Khan Cap cleanup",
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
  url.searchParams.set("codex", `bon-cau-khan-cap-${Date.now()}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "Codex P1 Bon Cau Khan Cap verifier" },
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
      hasNguyenNhanH2: /<h2[^>]*>[^<]*Nguyên nhân/iu.test(raw),
      hasCauseMarker: raw.includes(CAUSE_MARKER),
      hasOldAuthorUrl: raw.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: raw.includes(AUTHOR_URL),
      hasServiceSchema: raw.includes(`data-ttcqn-service-schema="${SERVICE_MARKER}"`) || /"@type"\s*:\s*"Service"/iu.test(raw),
    },
    update: {
      changes: update.changes,
      afterRawWordCount: wordCount(update.content),
      afterRawH1Count: countMatches(update.content, /<h1\b/giu),
      afterRawH2Count: countMatches(update.content, /<h2\b/giu),
      hasNguyenNhanH2: /<h2[^>]*>[^<]*Nguyên nhân/iu.test(update.content),
      hasCauseMarker: update.content.includes(CAUSE_MARKER),
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
        title: NEW_H1,
        excerpt: NEW_DESC,
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
            rank_math_title: NEW_H1,
            rank_math_description: NEW_DESC,
            rank_math_focus_keyword: "thông tắc bồn cầu khẩn cấp Quảng Ninh",
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
        /thông tắc bồn cầu khẩn cấp quảng ninh/iu.test(report.verify?.h1?.[0] || "") &&
        report.verify?.h2?.some((h) => /nguyên nhân/iu.test(h)) &&
        report.verify?.hasServiceSchema &&
        report.verify?.hasCauseMarker &&
        report.verify?.hasAuthorArchive &&
        report.verify?.hasFinalAuthor &&
        !report.verify?.hasOldAuthorUrl,
    );

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ ok: report.ok, mode: report.mode, reportPath, backupDir, verify: report.verify, update: report.update }, null, 2));
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
