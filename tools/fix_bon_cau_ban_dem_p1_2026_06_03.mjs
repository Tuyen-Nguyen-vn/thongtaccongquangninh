import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = {
  id: 2379,
  collection: "posts",
  slug: "thong-tac-bon-cau-ban-dem-quang-ninh",
  url: "https://thongtaccongquangninh.com/thong-tac-bon-cau-ban-dem-quang-ninh/",
};
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const OLD_AUTHOR_URL = "https://thongtaccongquangninh.com/nguyen-song-hao/";
const NEW_TITLE = "Thông tắc bồn cầu ban đêm Quảng Ninh: thợ trực 24/7 đến tận nơi";
const NEW_DESC =
  "Thông tắc bồn cầu ban đêm Quảng Ninh: gọi 0963.953.533, thợ trực 24/7, xử lý nhanh không đục phá tại Hạ Long, Cẩm Phả, Uông Bí. Có báo giá trước khi làm.";
const EXTRA_MARKER = "ttcqn-night-toilet-extra-risk-notes";

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-p1-bon-cau-ban-dem-${stamp}`);
const reportPath = join(ROOT, "reports", `p1-bon-cau-ban-dem-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

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
  const content = stripText(html);
  return {
    title,
    titleLen: [...title].length,
    metaDesc,
    metaDescLen: [...metaDesc].length,
    canonical,
    h1: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/giu)].map((m) => stripText(m[1])),
    h2: [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/giu)].map((m) => stripText(m[1])),
    wordCount: content ? content.split(/\s+/u).length : 0,
    hasServiceSchema: /"@type"\s*:\s*"Service"/iu.test(html),
    hasAuthorArchive: html.includes(AUTHOR_URL),
    hasOldAuthorUrl: html.includes(OLD_AUTHOR_URL),
  };
}

function serviceSchemaHtml() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${TARGET.url}#service`,
    name: "Thông tắc bồn cầu ban đêm Quảng Ninh",
    serviceType: "Thông tắc bồn cầu ban đêm tại Quảng Ninh",
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

  return `<!-- wp:html -->\n<script type="application/ld+json" data-ttcqn-service-schema="bon-cau-ban-dem-quang-ninh">${JSON.stringify(
    schema,
  )}</script>\n<!-- /wp:html -->`;
}

function updateBlogPostingSchema(content) {
  return String(content).replace(
    /(<script type="application\/ld\+json" data-ttcqn-author-nguyen-song-hao="1">)([\s\S]*?)(<\/script>)/u,
    (full, open, json, close) => {
      try {
        const schema = JSON.parse(json);
        schema["@id"] = `${TARGET.url}#blogposting`;
        schema.mainEntityOfPage = TARGET.url;
        schema.headline = NEW_TITLE;
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

function removeFinalAuthorLine(content) {
  return String(content).replace(
    /\s*(?:<!-- wp:paragraph -->\s*)?<p>\s*Tác giả:\s*<a href="https:\/\/thongtaccongquangninh\.com\/author\/nguyensonghao\/">Nguyễn Song Hào<\/a>\s*<\/p>\s*(?:<!-- \/wp:paragraph -->\s*)?$/u,
    "",
  );
}

function extraRiskNotes() {
  return `<!-- wp:paragraph -->\n<p><!-- ${EXTRA_MARKER} -->Ban đêm cần xử lý sớm hơn ban ngày vì nhà vệ sinh thường ít phương án thay thế, ánh sáng kém và nước trào dễ ngấm xuống sàn. Trước khi thợ đến, hãy ngừng xả thêm nước, mở cửa thông gió nhẹ, chặn trẻ nhỏ lại gần khu vực trào và chụp ảnh miệng bồn cầu gửi qua Zalo. Nếu nghi bể phốt đầy, nói rõ lần hút gần nhất để thợ chuẩn bị đúng thiết bị.</p>\n<!-- /wp:paragraph -->`;
}

function updateContent(raw) {
  let content = String(raw);
  const changes = [];

  const headingBefore = content;
  content = content.replace(
    /<h2>Tại Sao Bồn Cầu Hay Bị Tắc Vào Ban Đêm\?<\/h2>/u,
    "<h2>Nguyên nhân bồn cầu tắc vào ban đêm tại Quảng Ninh</h2>",
  );
  changes.push({ label: "add_nguyen_nhan_h2", changed: headingBefore !== content });

  const extraBefore = content;
  if (!content.includes(EXTRA_MARKER)) {
    const nextHeading = /<h2>Thông Tắc Bồn Cầu Ban Đêm Là Gì\? Khi Nào Cần Gọi Ngay\?<\/h2>/u;
    content = content.replace(nextHeading, `${extraRiskNotes()}\n\n$&`);
  }
  changes.push({ label: "add_word_count_risk_notes", changed: extraBefore !== content });

  const authorBefore = content;
  content = content.replaceAll(OLD_AUTHOR_URL, AUTHOR_URL);
  changes.push({ label: "replace_old_author_url", changed: authorBefore !== content });

  const schemaBefore = content;
  content = updateBlogPostingSchema(content);
  changes.push({ label: "update_blogposting_schema", changed: schemaBefore !== content });

  const serviceBlock = serviceSchemaHtml();
  if (content.includes('data-ttcqn-service-schema="bon-cau-ban-dem-quang-ninh"')) {
    const before = content;
    content = content.replace(
      /<!-- wp:html -->\s*<script type="application\/ld\+json" data-ttcqn-service-schema="bon-cau-ban-dem-quang-ninh">[\s\S]*?<\/script>\s*<!-- \/wp:html -->/u,
      serviceBlock,
    );
    changes.push({ label: "refresh_service_schema", changed: before !== content });
  } else {
    content = `${content.trim()}\n\n${serviceBlock}`;
    changes.push({ label: "add_service_schema", changed: true });
  }

  const finalBefore = content;
  content = removeFinalAuthorLine(content);
  content = `${content.trim()}\n\n<!-- wp:paragraph -->\n<p>Tác giả: <a href="${AUTHOR_URL}">Nguyễn Song Hào</a></p>\n<!-- /wp:paragraph -->`;
  changes.push({ label: "ensure_final_author_line", changed: finalBefore !== content });

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
      "User-Agent": "Codex P1 Bon Cau Ban Dem cleanup",
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
  url.searchParams.set("codex", `bon-cau-ban-dem-${Date.now()}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "Codex P1 Bon Cau Ban Dem verifier" },
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
    newTitle: NEW_TITLE,
    newTitleLen: [...NEW_TITLE].length,
    newDesc: NEW_DESC,
    newDescLen: [...NEW_DESC].length,
    before: {
      title: before.title?.raw,
      excerpt: stripText(before.excerpt?.raw || ""),
      rawWordCount: wordCount(raw),
      rawH1Count: countMatches(raw, /<h1\b/giu),
      rawH2Count: countMatches(raw, /<h2\b/giu),
      hasNguyenNhanH2: /<h2[^>]*>[^<]*Nguyên nhân/iu.test(raw),
      hasExtraMarker: raw.includes(EXTRA_MARKER),
      hasOldAuthorUrl: raw.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: raw.includes(AUTHOR_URL),
      hasServiceSchema:
        raw.includes('data-ttcqn-service-schema="bon-cau-ban-dem-quang-ninh"') ||
        /"@type"\s*:\s*"Service"/iu.test(raw),
    },
    update: {
      changes: update.changes,
      afterRawWordCount: wordCount(update.content),
      afterRawH1Count: countMatches(update.content, /<h1\b/giu),
      afterRawH2Count: countMatches(update.content, /<h2\b/giu),
      hasNguyenNhanH2: /<h2[^>]*>[^<]*Nguyên nhân/iu.test(update.content),
      hasExtraMarker: update.content.includes(EXTRA_MARKER),
      hasOldAuthorUrl: update.content.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: update.content.includes(AUTHOR_URL),
      hasServiceSchema: update.content.includes('data-ttcqn-service-schema="bon-cau-ban-dem-quang-ninh"'),
      finalAuthorLine: update.content.trim().endsWith(`<p>Tác giả: <a href="${AUTHOR_URL}">Nguyễn Song Hào</a></p>\n<!-- /wp:paragraph -->`),
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
        title: NEW_TITLE,
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
            rank_math_title: NEW_TITLE,
            rank_math_description: NEW_DESC,
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
        report.verify?.titleLen >= 60 &&
        report.verify?.titleLen <= 70 &&
        report.verify?.metaDescLen >= 150 &&
        report.verify?.metaDescLen <= 160 &&
        report.verify?.canonical === TARGET.url &&
        report.verify?.h1?.length === 1 &&
        /thông tắc bồn cầu ban đêm/iu.test(report.verify?.h1?.[0] || "") &&
        report.verify?.h2?.some((h) => /nguyên nhân/iu.test(h)) &&
        report.verify?.hasServiceSchema &&
        report.verify?.hasAuthorArchive &&
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
