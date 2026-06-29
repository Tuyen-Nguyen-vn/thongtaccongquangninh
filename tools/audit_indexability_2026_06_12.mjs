/**
 * Indexability audit for Search Console coverage troubleshooting.
 *
 * Checks sitemap URLs + current REST published pages/posts:
 * - HTTP status and redirect final URL.
 * - canonical self-reference.
 * - robots noindex/blocking.
 * - title/meta presence.
 * - sitemap-only and REST-only differences.
 *
 * Usage:
 *   node tools/audit_indexability_2026_06_12.mjs
 */
import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const PROJECT = "D:\\.thongtaccongquangninh";
const REPORT_DIR = `${PROJECT}\\reports`;
const SITE = "https://thongtaccongquangninh.com";
const HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const ENV_PATH = `${PROJECT}\\.env`;
const STAMP = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

function parseEnv(p) {
  const env = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    return u.href.replace(/\/$/, "/");
  } catch {
    return url;
  }
}

async function http(method, url, { authHeader = false, manualRedirect = false } = {}) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const useIp = parsed.hostname === HOST;
    const opts = {
      hostname: useIp ? SERVER_IP : parsed.hostname,
      port: 443,
      servername: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        Host: parsed.hostname,
        "User-Agent": "Codex Indexability Audit/1.0",
        ...(authHeader ? { Authorization: auth } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data, url }));
    });
    req.on("error", (error) => resolve({ status: 0, headers: {}, body: "", url, error: error.message }));
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

async function fetchText(url) {
  const r = await http("GET", url);
  return r;
}

async function checkChain(url, max = 5) {
  const chain = [];
  let current = url;
  for (let i = 0; i <= max; i++) {
    const r = await http("HEAD", current);
    chain.push({ url: current, status: r.status, location: r.headers.location || null, error: r.error || null });
    if (r.status >= 300 && r.status < 400 && r.headers.location) {
      current = new URL(r.headers.location, current).href;
    } else {
      break;
    }
  }
  return chain;
}

function locs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
}

async function fetchSitemaps() {
  const index = await fetchText(`${SITE}/sitemap_index.xml`);
  const sitemapUrls = locs(index.body).filter((u) => u.includes("sitemap"));
  const bySitemap = {};
  const all = new Set();
  for (const sm of sitemapUrls) {
    const r = await fetchText(sm);
    const urls = locs(r.body).filter((u) => !u.includes("sitemap"));
    bySitemap[sm] = { status: r.status, count: urls.length, urls };
    urls.forEach((u) => all.add(normalizeUrl(u)));
  }
  return { indexStatus: index.status, sitemapUrls, bySitemap, all: [...all] };
}

async function fetchRestPublished() {
  const all = [];
  for (const type of ["pages", "posts"]) {
    let page = 1;
    while (true) {
      const r = await http("GET", `${SITE}/wp-json/wp/v2/${type}?per_page=100&page=${page}&status=publish&_fields=id,slug,link,title,modified,date,type`, { authHeader: true });
      if (r.status !== 200) break;
      let items = [];
      try {
        items = JSON.parse(r.body);
      } catch {
        break;
      }
      if (!Array.isArray(items) || items.length === 0) break;
      for (const item of items) {
        all.push({
          id: item.id,
          restType: type,
          slug: item.slug,
          link: normalizeUrl(item.link),
          title: item.title?.rendered || "",
          modified: item.modified,
          date: item.date,
        });
      }
      const totalPages = Number(r.headers["x-wp-totalpages"] || 1);
      if (page >= totalPages) break;
      page++;
    }
  }
  return all;
}

function extract(html) {
  const get = (re) => (html.match(re) || [])[1] || "";
  const canonical =
    get(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    get(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const robots = get(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
  const title = get(/<title[^>]*>([\s\S]*?)<\/title>/i).trim();
  const desc =
    get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    get(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    canonical: normalizeUrl(canonical),
    robots,
    noindex: /noindex/i.test(robots),
    titleLen: [...title].length,
    descLen: [...desc].length,
    wordCount: bodyText ? bodyText.split(/\s+/).length : 0,
  };
}

async function auditUrl(url, source) {
  const chain = await checkChain(url);
  const first = chain[0];
  const last = chain[chain.length - 1];
  let htmlStatus = last.status;
  let extracted = {};
  if (last.status === 200) {
    const r = await fetchText(last.url);
    htmlStatus = r.status;
    extracted = extract(r.body);
  }
  const finalUrl = normalizeUrl(last.url);
  const norm = normalizeUrl(url);
  const problems = [];
  if (first.status >= 300 && first.status < 400) problems.push("URL_REDIRECTS");
  if (htmlStatus !== 200) problems.push(`HTTP_${htmlStatus}`);
  if (extracted.noindex) problems.push("NOINDEX");
  if (extracted.canonical && extracted.canonical !== finalUrl) problems.push(`CANONICAL_TO_OTHER:${extracted.canonical}`);
  if (!extracted.canonical && htmlStatus === 200) problems.push("NO_CANONICAL");
  if (extracted.titleLen && extracted.titleLen < 40) problems.push(`TITLE_SHORT:${extracted.titleLen}`);
  if (extracted.descLen && extracted.descLen < 140) problems.push(`META_SHORT:${extracted.descLen}`);
  if (extracted.wordCount && extracted.wordCount < 700 && !/category\//.test(norm)) problems.push(`THIN_CONTENT:${extracted.wordCount}`);
  return {
    url: norm,
    source,
    status: htmlStatus,
    finalUrl,
    hops: chain.length,
    canonical: extracted.canonical || "",
    robots: extracted.robots || "",
    titleLen: extracted.titleLen || 0,
    descLen: extracted.descLen || 0,
    wordCount: extracted.wordCount || 0,
    problems,
    chain,
  };
}

async function main() {
  mkdirSync(REPORT_DIR, { recursive: true });
  console.log("[1] Fetch sitemap index + child sitemaps");
  const sitemaps = await fetchSitemaps();
  console.log(`  Sitemap index ${sitemaps.indexStatus}, child=${sitemaps.sitemapUrls.length}, urls=${sitemaps.all.length}`);

  console.log("[2] Fetch REST published pages/posts");
  const rest = await fetchRestPublished();
  console.log(`  REST published: ${rest.length}`);

  const sitemapSet = new Set(sitemaps.all);
  const restSet = new Set(rest.map((x) => x.link));
  const restOnly = [...restSet].filter((u) => !sitemapSet.has(u));
  const sitemapOnly = [...sitemapSet].filter((u) => !restSet.has(u));

  console.log(`[3] Audit sitemap URLs (${sitemaps.all.length})`);
  const audit = [];
  for (let i = 0; i < sitemaps.all.length; i++) {
    const url = sitemaps.all[i];
    const source = restSet.has(url) ? "sitemap+rest" : "sitemap-only";
    process.stdout.write(`  [${i + 1}/${sitemaps.all.length}] ${url}\r`);
    audit.push(await auditUrl(url, source));
  }
  process.stdout.write("\n");

  const summary = {
    generatedAt: new Date().toISOString(),
    sitemapIndexStatus: sitemaps.indexStatus,
    childSitemaps: sitemaps.sitemapUrls.length,
    sitemapUrls: sitemaps.all.length,
    restPublished: rest.length,
    restOnly: restOnly.length,
    sitemapOnly: sitemapOnly.length,
    sitemapRedirects: audit.filter((x) => x.problems.includes("URL_REDIRECTS")).length,
    sitemapNot200: audit.filter((x) => x.status !== 200).length,
    sitemapNoindex: audit.filter((x) => x.problems.includes("NOINDEX")).length,
    sitemapCanonicalOther: audit.filter((x) => x.problems.some((p) => p.startsWith("CANONICAL_TO_OTHER"))).length,
    sitemapThinContent: audit.filter((x) => x.problems.some((p) => p.startsWith("THIN_CONTENT"))).length,
  };

  const jsonPath = `${REPORT_DIR}\\indexability-audit-${STAMP}.json`;
  const mdPath = `${REPORT_DIR}\\indexability-audit-${STAMP}.md`;
  writeFileSync(
    jsonPath,
    JSON.stringify({ summary, sitemaps: { sitemapUrls: sitemaps.sitemapUrls, bySitemap: sitemaps.bySitemap }, rest, restOnly, sitemapOnly, audit }, null, 2),
    "utf8",
  );

  const lines = [];
  lines.push(`# Indexability Audit — ${STAMP}`);
  lines.push("");
  lines.push(`**Site:** ${SITE}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("|---|---:|");
  for (const [k, v] of Object.entries(summary)) lines.push(`| ${k} | ${v} |`);
  lines.push("");
  lines.push("## Sitemap Child Sitemaps");
  lines.push("");
  lines.push("| Sitemap | Status | URLs |");
  lines.push("|---|---:|---:|");
  for (const [sm, info] of Object.entries(sitemaps.bySitemap)) lines.push(`| ${sm} | ${info.status} | ${info.count} |`);
  lines.push("");
  lines.push("## Sitemap URLs With Indexability Problems");
  lines.push("");
  const bad = audit.filter((x) => x.problems.length);
  if (!bad.length) {
    lines.push("_Không phát hiện URL trong sitemap bị redirect, 404, noindex hoặc canonical sang URL khác._");
  } else {
    lines.push("| URL | Source | Status | Canonical | Problems |");
    lines.push("|---|---|---:|---|---|");
    for (const x of bad) lines.push(`| ${x.url} | ${x.source} | ${x.status} | ${x.canonical || ""} | ${x.problems.join("<br>")} |`);
  }
  lines.push("");
  lines.push("## REST Published But Not In Sitemap");
  lines.push("");
  if (!restOnly.length) lines.push("_Không có._");
  else for (const u of restOnly) lines.push(`- ${u}`);
  lines.push("");
  lines.push("## Sitemap Only URLs");
  lines.push("");
  if (!sitemapOnly.length) lines.push("_Không có._");
  else for (const u of sitemapOnly) lines.push(`- ${u}`);

  writeFileSync(mdPath, lines.join("\n"), "utf8");
  console.log(`[OUT] ${mdPath}`);
  console.log(`[OUT] ${jsonPath}`);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
