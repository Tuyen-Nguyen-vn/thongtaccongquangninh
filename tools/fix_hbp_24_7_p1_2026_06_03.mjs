import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const ENV_PATH = join(ROOT, ".env");
const SITE = "https://thongtaccongquangninh.com";
const TARGET = {
  id: 2439,
  collection: "posts",
  slug: "hut-be-phot-24-7-quang-ninh-2026",
  url: "https://thongtaccongquangninh.com/hut-be-phot-24-7-quang-ninh-2026/",
};
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const OLD_AUTHOR_URL = "https://thongtaccongquangninh.com/nguyen-song-hao/";
const NEW_TITLE = "Hút bể phốt 24/7 Quảng Ninh: xe bồn tới nhanh 15 phút, báo giá rõ";
const NEW_DESC =
  "Hút bể phốt 24/7 Quảng Ninh, xe bồn tới nhanh khi bể đầy, trào mùi, ngõ sâu hoặc ca đêm. Gọi 0963.953.533 / 0931.156.756 để báo giá rõ trước khi xử lý.";

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(ROOT, "seo-revisions", `wp-before-p1-hbp-24-7-${stamp}`);
const reportPath = join(ROOT, "reports", `p1-hbp-24-7-fix-${dryRun ? "dryrun" : "apply"}-${stamp}.json`);

function parseEnv(filePath) {
  const env = {};
  if (!existsSync(filePath)) return env;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripTags(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function countMatches(input, pattern) {
  return (String(input).match(pattern) || []).length;
}

function decodeEntities(input) {
  return String(input ?? "")
    .replace(/&amp;/g, "&")
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
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/giu)].map((m) => stripTags(m[1]));
  const h2 = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/giu)].map((m) => stripTags(m[1]));
  return {
    title,
    titleLen: [...title].length,
    metaDesc,
    metaDescLen: [...metaDesc].length,
    canonical,
    h1,
    h2,
    hasServiceSchema: /"@type"\s*:\s*"Service"/iu.test(html),
    hasAuthorArchive: html.includes(AUTHOR_URL),
    hasOldAuthorUrl: html.includes(OLD_AUTHOR_URL),
  };
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

function serviceSchemaHtml() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${TARGET.url}#service`,
    name: "Hút bể phốt 24/7 Quảng Ninh",
    serviceType: "Hút bể phốt khẩn cấp 24/7",
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
    offers: {
      "@type": "Offer",
      url: TARGET.url,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
    },
  };

  return `<!-- wp:html -->\n<script type="application/ld+json" data-ttcqn-service-schema="hbp-24-7">${JSON.stringify(
    schema,
  )}</script>\n<!-- /wp:html -->`;
}

function removeFinalAuthorLine(content) {
  return String(content).replace(
    /\s*(?:<!-- wp:paragraph -->\s*)?<p>\s*Tác giả:\s*<a href="https:\/\/thongtaccongquangninh\.com\/author\/nguyensonghao\/">Nguyễn Song Hào<\/a>\s*<\/p>\s*(?:<!-- \/wp:paragraph -->\s*)?$/u,
    "",
  );
}

function updateContent(raw) {
  let content = String(raw);
  const before = content;

  content = content.replace(
    /<h1>Hút Bể Phốt 24\/7 Quảng Ninh – Gọi Là Có Mặt Sau 15 Phút<\/h1>/u,
    `<h1>${NEW_TITLE}</h1>`,
  );
  content = content.replace(
    /<h2>Bể Phốt Đầy Lúc Đêm Khuya – Vì Sao Không Thể Đợi Đến Sáng\?<\/h2>/u,
    "<h2>Nguyên nhân bể phốt đầy lúc đêm khuya không thể đợi đến sáng</h2>",
  );
  content = content.replace(
    /<h2>Khu Vực Phục Vụ Hút Bể Phốt 24\/7 Tại Quảng Ninh<\/h2>/u,
    "<h2>NAP liên hệ và khu vực phục vụ hút bể phốt 24/7 tại Quảng Ninh</h2>",
  );
  content = content.replace(
    /<h2>Thực Tế Xử Lý – Case Study Tại Quảng Ninh<\/h2>/u,
    "<h2>Tình huống thường gặp khi hút bể phốt 24/7 tại Quảng Ninh</h2>",
  );
  content = content.replace(
    /<strong>Ca xử lý lúc 1:30 sáng tại Bãi Cháy, Hạ Long \(tháng 4\/2026\)<\/strong>/u,
    "<strong>Tình huống thường gặp lúc đêm tại Bãi Cháy, Hạ Long</strong>",
  );
  content = content.replace(
    /<strong>Ca xử lý tại khu nhà trọ Cẩm Phả \(tháng 3\/2026\)<\/strong>/u,
    "<strong>Tình huống khu nhà trọ Cẩm Phả bể đầy lâu năm</strong>",
  );
  content = content.replaceAll(OLD_AUTHOR_URL, AUTHOR_URL);
  content = updateBlogPostingSchema(content);

  const serviceBlock = serviceSchemaHtml();
  if (content.includes('data-ttcqn-service-schema="hbp-24-7"')) {
    content = content.replace(
      /<!-- wp:html -->\s*<script type="application\/ld\+json" data-ttcqn-service-schema="hbp-24-7">[\s\S]*?<\/script>\s*<!-- \/wp:html -->/u,
      serviceBlock,
    );
  } else {
    content = `${content.trim()}\n\n${serviceBlock}`;
  }

  content = removeFinalAuthorLine(content);
  content = `${content.trim()}\n\n<!-- wp:paragraph -->\n<p>Tác giả: <a href="${AUTHOR_URL}">Nguyễn Song Hào</a></p>\n<!-- /wp:paragraph -->`;

  return {
    content,
    changed: content !== before,
    replacements: [
      "h1_title",
      "h2_nguyen_nhan",
      "h2_nap",
      "case_label_to_tinh_huong",
      "author_archive_url",
      "service_schema",
      "final_author_line",
    ],
  };
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
      "User-Agent": "Codex P1 HBP 24/7 cleanup",
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
  url.searchParams.set("codex", `hbp-24-7-${Date.now()}`);
  const response = await fetch(url, {
    headers: { "User-Agent": "Codex P1 HBP 24/7 verifier" },
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
      excerpt: stripTags(before.excerpt?.raw || ""),
      rawH1Count: countMatches(raw, /<h1\b/giu),
      rawH2Count: countMatches(raw, /<h2\b/giu),
      hasOldAuthorUrl: raw.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: raw.includes(AUTHOR_URL),
      hasServiceSchema: raw.includes('data-ttcqn-service-schema="hbp-24-7"'),
    },
    update: {
      changed: update.changed,
      replacements: update.replacements,
      afterRawH1Count: countMatches(update.content, /<h1\b/giu),
      afterRawH2Count: countMatches(update.content, /<h2\b/giu),
      hasOldAuthorUrl: update.content.includes(OLD_AUTHOR_URL),
      hasAuthorArchive: update.content.includes(AUTHOR_URL),
      hasServiceSchema: update.content.includes('data-ttcqn-service-schema="hbp-24-7"'),
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
      excerpt: stripTags(after.excerpt?.raw || ""),
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
        report.verify?.h2?.some((h) => /nguyên nhân/iu.test(h)) &&
        report.verify?.h2?.some((h) => /nap|liên hệ/iu.test(h)) &&
        report.verify?.hasServiceSchema &&
        report.verify?.hasAuthorArchive &&
        !report.verify?.hasOldAuthorUrl,
    );

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ ok: report.ok, mode: report.mode, reportPath, backupDir, verify: report.verify }, null, 2));
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
