import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const SITE = "https://thongtaccongquangninh.com";
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const ENV_PATH = path.join(ROOT, ".env");
const MARKER = "ttcqn-author-nguyen-song-hao";

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;

const CANONICAL = {
  id: 2377,
  slug: "thong-tac-bon-cau-khan-cap-quang-ninh",
  url: "https://thongtaccongquangninh.com/thong-tac-bon-cau-khan-cap-quang-ninh/",
  title: "Thông tắc bồn cầu khẩn cấp Quảng Ninh 24/7, có thợ sau 15 phút",
  description:
    "Bồn cầu tắc trào ngược tại Quảng Ninh? Gọi 0963.953.533 / 0931.156.756, thợ đến nhanh 24/7, xử lý bằng máy lò xo, không đục phá, báo giá trước cho nhà dân.",
};

const DRAFT = {
  id: 2378,
  slug: "thong-tac-bon-cau-khan-cap-quang-ninh-2",
  title: "Bản nháp gộp: thông tắc bồn cầu khẩn cấp Quảng Ninh",
};

function parseEnv(filePath) {
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
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

function updateAuthorJsonLd(content, post, target) {
  const pattern = new RegExp(
    `(<script type="application/ld\\+json" data-${MARKER}="1">)([\\s\\S]*?)(</script>)`,
    "u",
  );
  const match = String(content).match(pattern);
  if (!match) return { content, updated: false };
  let schema;
  try {
    schema = JSON.parse(match[2]);
  } catch {
    return { content, updated: false };
  }
  schema["@id"] = `${target.url}#blogposting`;
  schema.mainEntityOfPage = target.url;
  schema.headline = target.title;
  schema.description = target.description;
  schema.datePublished = post.date_gmt ? `${post.date_gmt}Z` : post.date;
  schema.dateModified = new Date().toISOString();
  const next = String(content).replace(pattern, `${match[1]}${JSON.stringify(schema)}${match[3]}`);
  return { content: next, updated: true };
}

async function wp(route, init = {}) {
  const response = await fetch(`${SITE}/wp-json${route}`, {
    ...init,
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
      "User-Agent": "Codex khan cap duplicate title fix",
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
    throw new Error(`WP ${response.status} ${route}: ${message}`);
  }
  return payload;
}

function extractMeta(html) {
  const title = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/iu)?.[1] || "");
  const metaDesc =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/iu)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/iu)?.[1] ||
    "";
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/iu)?.[1] || "";
  return { title, titleLen: title.length, metaDesc, metaDescLen: metaDesc.length, canonical };
}

async function fetchHtml(url, follow = "follow") {
  const response = await fetch(url, {
    redirect: follow,
    headers: { "User-Agent": "Codex khan cap duplicate title verifier" },
  });
  const html = follow === "follow" ? await response.text() : "";
  return {
    status: response.status,
    url: response.url,
    location: response.headers.get("location"),
    html,
  };
}

const env = parseEnv(ENV_PATH);
const AUTH = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function main() {
  const backupDir = path.join(ROOT, "seo-revisions", `wp-before-khan-cap-duplicate-title-${STAMP}`);
  const report = {
    ok: false,
    mode: dryRun ? "dry-run" : "apply",
    generatedAt: new Date().toISOString(),
    backupDir,
    canonical: CANONICAL,
    draft: DRAFT,
    actions: [],
    verify: {},
  };

  const post2377 = await wp(`/wp/v2/posts/${CANONICAL.id}?context=edit`);
  const post2378 = await wp(`/wp/v2/posts/${DRAFT.id}?context=edit`);

  if (post2377.slug !== CANONICAL.slug || post2377.status !== "publish") {
    throw new Error(`Post ${CANONICAL.id} không đúng publish canonical: ${post2377.slug}/${post2377.status}`);
  }
  if (post2378.slug !== DRAFT.slug || post2378.status !== "draft") {
    throw new Error(`Post ${DRAFT.id} không đúng trạng thái draft: ${post2378.slug}/${post2378.status}`);
  }

  const authorJson = updateAuthorJsonLd(post2377.content?.raw || "", post2377, CANONICAL);
  report.actions.push({
    id: post2377.id,
    slug: post2377.slug,
    status: post2377.status,
    oldTitle: post2377.title?.raw,
    newTitle: CANONICAL.title,
    oldExcerpt: stripTags(post2377.excerpt?.raw),
    newExcerpt: CANONICAL.description,
    authorJsonLdUpdated: authorJson.updated,
  });
  report.actions.push({
    id: post2378.id,
    slug: post2378.slug,
    status: post2378.status,
    oldTitle: post2378.title?.raw,
    newTitle: DRAFT.title,
  });

  if (!dryRun) {
    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(path.join(backupDir, `posts-${post2377.id}-${post2377.slug}.json`), JSON.stringify(post2377, null, 2));
    fs.writeFileSync(path.join(backupDir, `posts-${post2378.id}-${post2378.slug}.json`), JSON.stringify(post2378, null, 2));

    await wp(`/wp/v2/posts/${post2377.id}`, {
      method: "POST",
      body: JSON.stringify({
        title: CANONICAL.title,
        excerpt: CANONICAL.description,
        content: authorJson.content,
      }),
    });

    let rankMath2377 = null;
    try {
      rankMath2377 = await wp("/rankmath/v1/updateMeta", {
        method: "POST",
        body: JSON.stringify({
          objectType: "post",
          objectID: post2377.id,
          meta: {
            rank_math_title: CANONICAL.title,
            rank_math_description: CANONICAL.description,
          },
        }),
      });
    } catch (error) {
      rankMath2377 = { error: String(error.message || error) };
    }

    await wp(`/wp/v2/posts/${post2378.id}`, {
      method: "POST",
      body: JSON.stringify({ title: DRAFT.title }),
    });

    let rankMath2378 = null;
    try {
      rankMath2378 = await wp("/rankmath/v1/updateMeta", {
        method: "POST",
        body: JSON.stringify({
          objectType: "post",
          objectID: post2378.id,
          meta: { rank_math_title: DRAFT.title },
        }),
      });
    } catch (error) {
      rankMath2378 = { error: String(error.message || error) };
    }

    report.actions[0].rankMath = rankMath2377;
    report.actions[1].rankMath = rankMath2378;

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const publicUrl = new URL(CANONICAL.url);
    publicUrl.searchParams.set("nowprocket", "1");
    publicUrl.searchParams.set("codex", `dup-title-${Date.now()}`);
    const publicResult = await fetchHtml(publicUrl.toString());
    const redirected = await fetchHtml(`${SITE}/${DRAFT.slug}/?nowprocket=1&codex=dup-title-${Date.now()}`, "manual");
    const htmlMeta = extractMeta(publicResult.html);
    const hasUpdatedAuthorSchema =
      publicResult.html.includes(`data-${MARKER}="1"`) &&
      publicResult.html.includes(`"headline":"${CANONICAL.title}"`) &&
      publicResult.html.includes(`"description":"${CANONICAL.description}"`);

    report.verify = {
      public: {
        status: publicResult.status,
        url: publicResult.url,
        ...htmlMeta,
        hasUpdatedAuthorSchema,
      },
      duplicateUrl: redirected,
    };
  }

  const verified =
    dryRun ||
    (report.verify.public?.status === 200 &&
      report.verify.public?.title.includes(CANONICAL.title) &&
      report.verify.public?.metaDesc === CANONICAL.description &&
      report.verify.public?.canonical === CANONICAL.url &&
      report.verify.public?.hasUpdatedAuthorSchema &&
      [301, 302].includes(report.verify.duplicateUrl?.status) &&
      String(report.verify.duplicateUrl?.location || "").includes(CANONICAL.url));

  report.ok = Boolean(verified);
  const reportPath = path.join(
    ROOT,
    "reports",
    `khan-cap-duplicate-title-${dryRun ? "dryrun" : "apply"}-${STAMP}.json`,
  );
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ reportPath, ...report }, null, 2));
  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
