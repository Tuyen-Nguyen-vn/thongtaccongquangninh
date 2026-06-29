import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const PROJECT = process.env.TTCQN_PROJECT_ROOT
  ? resolve(process.env.TTCQN_PROJECT_ROOT)
  : resolve(dirname(__filename), "..");
const ENV_PATH = process.env.TTCQN_WP_ENV || join(PROJECT, ".env");
const BASE_URL = "https://thongtaccongquangninh.com";
const TODAY = localDateStamp();
const CSV_PATH = join(PROJECT, "wp-url-audit-list.csv");
const JSON_PATH = join(PROJECT, "wp-url-audit-list.json");
const REPORT_PATH = join(PROJECT, `WP_URL_AUDIT_REPORT_${TODAY}.md`);
const STATUSES = ["publish", "draft", "pending", "private", "future"];
const LOCAL_TERMS = [
  "ha-long",
  "bai-chay",
  "hong-gai",
  "hon-gai",
  "cam-pha",
  "uong-bi",
  "mong-cai",
  "quang-yen",
  "dong-trieu",
  "van-don",
  "hoanh-bo",
  "tien-yen",
  "quang-ninh"
];
const SITEMAP_PATHS = ["/sitemap.xml", "/sitemap_index.xml", "/page-sitemap.xml", "/post-sitemap.xml"];
const SYSTEM_TYPES = new Set([
  "attachment",
  "nav_menu_item",
  "wp_block",
  "wp_template",
  "wp_template_part",
  "wp_global_styles",
  "wp_navigation",
  "wp_font_family",
  "wp_font_face",
  "e-floating-buttons",
  "elementor_library",
  "elementor_snippet",
  "rm_content_editor",
  "rank_math_schema",
]);

function localDateStamp(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function parseEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripHtml(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/&#8211;|&ndash;/giu, "-")
    .replace(/&#8212;|&mdash;/giu, "-")
    .replace(/&#038;/giu, "&")
    .replace(/\s+/gu, " ")
    .trim();
}

function normalizeTitle(input) {
  return stripHtml(input)
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function csvEscape(input) {
  const value = String(input ?? "");
  return /[",\r\n]/u.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "(blank)";
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const prev = Array.from({ length: b.length + 1 }, (_, index) => index);
  const curr = Array.from({ length: b.length + 1 }, () => 0);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

function similarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (!maxLen) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

async function getJson(url, headers = {}) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "Codex read-only SEO URL inventory",
      ...headers,
    },
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message ?? raw : payload;
    throw new Error(`${response.status} ${url}: ${message}`);
  }
  return { payload, headers: response.headers, status: response.status };
}

async function getText(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/xml,text/xml,text/html",
      "User-Agent": "Codex read-only SEO URL inventory",
    },
  });
  const text = await response.text();
  return { status: response.status, contentType: response.headers.get("content-type"), text };
}

async function listCollection(baseUrl, restBase, authHeaders, useEditContext, excludeStatus = false) {
  const rows = [];
  const statusParam = useEditContext ? STATUSES.join(",") : "publish";
  for (let page = 1; page <= 200; page++) {
    const params = new URLSearchParams({
      per_page: "100",
      page: String(page),
    });
    if (!excludeStatus) params.set("status", statusParam);
    if (useEditContext) params.set("context", "edit");
    const url = `${baseUrl}/wp-json/wp/v2/${restBase}?${params}`;
    try {
      const { payload } = await getJson(url, authHeaders);
      if (!Array.isArray(payload) || payload.length === 0) break;
      rows.push(...payload);
      if (payload.length < 100) break;
    } catch (error) {
      if (String(error.message).includes("rest_post_invalid_page_number")) break;
      throw error;
    }
  }
  return rows;
}

function getItemTitle(item) {
  return stripHtml(item.title?.raw ?? item.title?.rendered ?? item.name ?? "");
}

function getItemExcerpt(item) {
  return stripHtml(item.excerpt?.raw ?? item.excerpt?.rendered ?? item.description ?? "");
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    const value = parsed.toString();
    return value.endsWith("/") ? value : `${value}/`;
  } catch {
    return "";
  }
}

function classifyIssues(row, sitemapUrls) {
  const issues = [];
  if (!row.slug) issues.push("missing_slug");
  if (!row.link) issues.push("missing_link");
  if (row.link && !row.link.startsWith(BASE_URL)) issues.push("external_or_invalid_permalink");
  if (row.is_public && row.link && !sitemapUrls.has(normalizeUrl(row.link))) issues.push("rest_public_not_in_sitemap");
  return issues;
}

function isMainAuditType(typeName, info) {
  if (typeName === "post" || typeName === "page") return true;
  if (SYSTEM_TYPES.has(typeName)) return false;
  return Boolean(info.viewable || info.visibility?.public || info.visibility?.publicly_queryable || info.public);
}

async function collectSitemaps(baseUrl) {
  const visited = new Set();
  const sitemapFiles = [];
  const urls = new Map();

  async function visit(pathOrUrl) {
    const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${baseUrl}${pathOrUrl}`;
    if (visited.has(url)) return;
    visited.add(url);
    const { status, contentType, text } = await getText(url);
    sitemapFiles.push({ url, status, contentType });
    if (status < 200 || status >= 300) return;

    const sitemapLocs = [...text.matchAll(/<sitemap>[\s\S]*?<loc>([\s\S]*?)<\/loc>[\s\S]*?<\/sitemap>/giu)].map((m) =>
      m[1].trim()
    );
    if (sitemapLocs.length) {
      for (const loc of sitemapLocs) await visit(loc);
      return;
    }
    for (const match of text.matchAll(/<url>[\s\S]*?<loc>([\s\S]*?)<\/loc>([\s\S]*?)<\/url>/giu)) {
      const loc = normalizeUrl(match[1].trim());
      if (!loc) continue;
      const lastmod = match[2].match(/<lastmod>([\s\S]*?)<\/lastmod>/iu)?.[1]?.trim() ?? "";
      urls.set(loc, { loc, lastmod, source: url });
    }
  }

  for (const path of SITEMAP_PATHS) await visit(path);
  return { sitemapFiles, sitemapUrls: urls };
}

function findDuplicateOrSimilarTitles(rows) {
  const candidates = rows.filter((row) => row.title).map((row) => ({ ...row, normalizedTitle: normalizeTitle(row.title) }));
  const duplicateGroups = Object.values(
    candidates.reduce((acc, row) => {
      if (!row.normalizedTitle) return acc;
      acc[row.normalizedTitle] ??= [];
      acc[row.normalizedTitle].push(row);
      return acc;
    }, {})
  ).filter((group) => group.length > 1);

  const similarPairs = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];
      if (!a.normalizedTitle || !b.normalizedTitle || a.normalizedTitle === b.normalizedTitle) continue;
      const score = similarity(a.normalizedTitle, b.normalizedTitle);
      if (score >= 0.85) {
        similarPairs.push({
          score: Number(score.toFixed(3)),
          a: { id: a.id, post_type: a.post_type, title: a.title, link: a.link },
          b: { id: b.id, post_type: b.post_type, title: b.title, link: b.link },
        });
      }
    }
  }
  return {
    duplicateGroups: duplicateGroups.map((group) =>
      group.map((row) => ({ id: row.id, post_type: row.post_type, title: row.title, link: row.link }))
    ),
    similarPairs,
  };
}

async function main() {
  const startedAt = new Date().toISOString();
  const env = parseEnv(ENV_PATH);
  const baseUrl = (env.WP_BASE_URL || BASE_URL).replace(/\/$/, "");
  const authHeaders =
    env.WP_USERNAME && env.WP_APP_PASSWORD
      ? { Authorization: `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}` }
      : {};

  const authProbe = Object.keys(authHeaders).length
    ? await getJson(`${baseUrl}/wp-json/wp/v2/users/me`, authHeaders)
        .then(() => ({ ok: true, mode: "context=edit" }))
        .catch((error) => ({ ok: false, mode: "public_only", error: error.message }))
    : { ok: false, mode: "public_only", error: "Không có WP_USERNAME/WP_APP_PASSWORD trong .env" };
  const useEditContext = authProbe.ok;

  const { payload: typesPayload } = await getJson(
    `${baseUrl}/wp-json/wp/v2/types${useEditContext ? "?context=edit" : ""}`,
    useEditContext ? authHeaders : {}
  );
  const types = Object.entries(typesPayload).map(([name, info]) => ({
    name,
    label: info.name ?? info.label ?? name,
    rest_base: info.rest_base ?? info.slug ?? name,
    slug: info.slug ?? "",
    viewable: Boolean(info.viewable || info.visibility?.public || info.visibility?.publicly_queryable),
    has_archive: info.has_archive ?? false,
    auditMain: isMainAuditType(name, info),
  }));

  const { sitemapFiles, sitemapUrls } = await collectSitemaps(baseUrl);
  const sitemapUrlSet = new Set(sitemapUrls.keys());
  const byNormalizedLink = new Map();
  const systemObjects = [];

  for (const type of types) {
    if (!type.rest_base || type.rest_base.includes("(")) {
      systemObjects.push({ ...type, skipped: true, reason: "nested_or_parameterized_rest_base" });
      continue;
    }
    let items = [];
    try {
      items = await listCollection(baseUrl, type.rest_base, useEditContext ? authHeaders : {}, useEditContext, type.name === "attachment");
    } catch (error) {
      systemObjects.push({ ...type, skipped: true, reason: error.message });
      continue;
    }
    const mapped = items.map((item) => {
      const link = item.link ?? "";
      const normalizedLink = normalizeUrl(link);
      const textForLocal = `${item.slug ?? ""} ${getItemTitle(item)} ${link}`.toLocaleLowerCase("vi-VN");
      const isLocalLanding = LOCAL_TERMS.some((term) => textForLocal.includes(term));
      const status = item.status ?? "";
      const isPublic = status === "publish" && Boolean(link);
      return {
        id: item.id ?? "",
        post_type: type.name,
        rest_base: type.rest_base,
        status,
        date: item.date ?? "",
        modified: item.modified ?? "",
        slug: item.slug ?? "",
        link,
        title: getItemTitle(item),
        excerpt: getItemExcerpt(item),
        source: "rest",
        in_sitemap: normalizedLink ? sitemapUrlSet.has(normalizedLink) : false,
        is_public: isPublic,
        is_local_landing: isLocalLanding,
        audit_priority: isPublic && isLocalLanding ? "high-local-seo" : isPublic ? "normal" : "non-public",
        normalizedLink,
        issues: [],
      };
    });

    if (!type.auditMain) {
      systemObjects.push({ ...type, count: mapped.length, items: mapped });
      continue;
    }

    for (const row of mapped) {
      row.issues = classifyIssues(row, sitemapUrlSet);
      const key = row.normalizedLink || `${row.post_type}:${row.id}`;
      byNormalizedLink.set(key, row);
    }
  }

  for (const sitemapRow of sitemapUrls.values()) {
    if (!byNormalizedLink.has(sitemapRow.loc)) {
      byNormalizedLink.set(sitemapRow.loc, {
        id: "",
        post_type: "sitemap_only",
        rest_base: "",
        status: "publish",
        date: "",
        modified: sitemapRow.lastmod,
        slug: new URL(sitemapRow.loc).pathname.replace(/^\/|\/$/g, ""),
        link: sitemapRow.loc,
        title: "",
        excerpt: "",
        source: "sitemap",
        in_sitemap: true,
        is_public: true,
        is_local_landing: LOCAL_TERMS.some((term) => sitemapRow.loc.toLocaleLowerCase("vi-VN").includes(term)),
        audit_priority: "sitemap-only-check",
        normalizedLink: sitemapRow.loc,
        issues: ["sitemap_only_not_found_in_rest_main_content"],
      });
    }
  }

  const rows = [...byNormalizedLink.values()].sort((a, b) => {
    const aLink = a.link || "";
    const bLink = b.link || "";
    return a.post_type.localeCompare(b.post_type) || aLink.localeCompare(bLink);
  });
  const publicAuditUrls = rows.filter((row) => row.is_public && row.link);
  const missingSlugOrPermalink = rows.filter((row) =>
    row.issues.some((issue) => ["missing_slug", "missing_link", "external_or_invalid_permalink", "rest_public_not_in_sitemap"].includes(issue))
  );
  const { duplicateGroups, similarPairs } = findDuplicateOrSimilarTitles(publicAuditUrls);
  const localSeoLandingPages = publicAuditUrls.filter((row) => row.is_local_landing);
  const sitemapOnlyUrls = rows.filter((row) => row.source === "sitemap");
  const restOnlyUrls = rows.filter((row) => row.source === "rest" && row.is_public && !row.in_sitemap);

  const summary = {
    generatedAt: new Date().toISOString(),
    startedAt,
    baseUrl,
    readOnly: true,
    authMode: authProbe.mode,
    authError: authProbe.error ?? "",
    totalRows: rows.length,
    totalPublicAuditUrls: publicAuditUrls.length,
    totalLocalSeoLandingPages: localSeoLandingPages.length,
    totalSitemapUrls: sitemapUrls.size,
    totalSitemapFilesChecked: sitemapFiles.length,
    totalSystemObjects: systemObjects.reduce((sum, item) => sum + (item.count ?? 0), 0),
    wpCliUsed: false,
    wpCliReason: "Workspace hiện tại không có wp-config.php/wp-load.php; dùng REST API + sitemap.",
  };

  const json = {
    summary,
    postTypeCounts: countBy(rows, "post_type"),
    statusCounts: countBy(rows, "status"),
    sitemapFiles,
    types,
    publicAuditUrls,
    missingSlugOrPermalink,
    duplicateOrSimilarTitles: { duplicateGroups, similarPairs },
    localSeoLandingPages,
    sitemapOnlyUrls,
    restOnlyUrls,
    systemObjects,
    rows,
  };

  const headers = [
    "id",
    "post_type",
    "rest_base",
    "status",
    "date",
    "modified",
    "slug",
    "link",
    "title",
    "excerpt",
    "source",
    "in_sitemap",
    "is_public",
    "is_local_landing",
    "audit_priority",
    "issues",
  ];
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(Array.isArray(row[header]) ? row[header].join("|") : row[header])).join(",")),
  ].join("\r\n");
  writeFileSync(CSV_PATH, `${csv}\r\n`, "utf8");
  writeFileSync(JSON_PATH, JSON.stringify(json, null, 2), "utf8");

  const SIMILAR_CSV_PATH = join(PROJECT, "wp-similar-title-pairs.csv");
  const similarCsvRows = [
    "score,url_a,title_a,url_b,title_b",
    ...similarPairs.map(p => `${p.score},${csvEscape(p.a.link)},${csvEscape(p.a.title)},${csvEscape(p.b.link)},${csvEscape(p.b.title)}`)
  ].join("\r\n");
  writeFileSync(SIMILAR_CSV_PATH, `${similarCsvRows}\r\n`, "utf8");

  const topLocal = localSeoLandingPages
    .slice(0, 80)
    .map((row) => `- ${row.link} | ${row.post_type} | ${row.title}`)
    .join("\n");
  const duplicateMd = [
    ...duplicateGroups.slice(0, 20).map((group) => `- Trùng title: ${group.map((row) => `${row.id}:${row.link}`).join(" | ")}`),
    ...similarPairs.slice(0, 200).map((pair) => `- Giống ${pair.score}: ${pair.a.link} <-> ${pair.b.link}`),
  ].join("\n");
  const report = `# WordPress URL Audit List - ${TODAY}

## Tóm tắt

- Tổng dòng audit: ${summary.totalRows}
- URL public cần audit SEO: ${summary.totalPublicAuditUrls}
- URL nghi landing page local SEO: ${summary.totalLocalSeoLandingPages}
- URL trong sitemap: ${summary.totalSitemapUrls}
- Auth REST: ${summary.authMode}${summary.authError ? ` (${summary.authError})` : ""}
- WP-CLI: không dùng. ${summary.wpCliReason}
- Cam kết: chỉ đọc WordPress qua REST/sitemap, không sửa database/nội dung.

## Số lượng theo post_type

${Object.entries(json.postTypeCounts)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

## Số lượng theo status

${Object.entries(json.statusCounts)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

## URL lỗi permalink/slug hoặc lệch sitemap

${missingSlugOrPermalink.length ? missingSlugOrPermalink.map((row) => `- ${row.link || `(ID ${row.id})`} | ${row.issues.join(", ")}`).join("\n") : "- Không phát hiện lỗi trong nhóm audit chính."}

## Title trùng hoặc quá giống

${duplicateMd || "- Chưa phát hiện title trùng/quá giống theo ngưỡng 85%."}

## Landing page local SEO nghi vấn

${topLocal || "- Không phát hiện."}

## File đầu ra

- ${CSV_PATH}
- ${JSON_PATH}
- ${SIMILAR_CSV_PATH}
`;
  writeFileSync(REPORT_PATH, report, "utf8");
  console.log(
    JSON.stringify(
      {
        ok: true,
        csvPath: CSV_PATH,
        jsonPath: JSON_PATH,
        reportPath: REPORT_PATH,
        summary,
        postTypeCounts: json.postTypeCounts,
        statusCounts: json.statusCounts,
        missingSlugOrPermalink: missingSlugOrPermalink.length,
        duplicateGroups: duplicateGroups.length,
        similarPairs: similarPairs.length,
        localSeoLandingPages: localSeoLandingPages.length,
        sitemapOnlyUrls: sitemapOnlyUrls.length,
        restOnlyUrls: restOnlyUrls.length,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
