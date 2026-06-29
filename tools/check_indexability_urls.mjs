import https from "node:https";
import { appendFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE = "https://thongtaccongquangninh.com";
const HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const CSV_PATH = path.join(ROOT, "docs", "SEO_PROGRESS.csv");
const URLS = process.argv.slice(2).filter((url) => /^https?:\/\//i.test(url));

function nowLocalParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

function httpGet(url, { method = "GET" } = {}) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const useIp = parsed.hostname === HOST;
    const req = https.request(
      {
        hostname: useIp ? SERVER_IP : parsed.hostname,
        port: 443,
        servername: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method,
        headers: {
          Host: parsed.hostname,
          "User-Agent": "Codex targeted indexability check",
          "Cache-Control": "no-cache",
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString("utf8"),
          url,
        }));
      },
    );
    req.on("error", (error) => resolve({ status: 0, headers: {}, body: "", url, error: error.message }));
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function normalize(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    return u.href.replace(/\/?$/, "/");
  } catch {
    return url;
  }
}

function locs(xml) {
  return [...String(xml).matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
}

async function sitemapMembership() {
  const index = await httpGet(`${SITE}/sitemap_index.xml?codex=${Date.now()}`);
  const childSitemaps = locs(index.body).filter((url) => url.includes("sitemap"));
  const membership = Object.fromEntries(URLS.map((url) => [normalize(url), []]));
  for (const sitemap of childSitemaps) {
    const res = await httpGet(sitemap);
    const urls = new Set(locs(res.body).map(normalize));
    for (const target of URLS.map(normalize)) {
      if (urls.has(target)) membership[target].push(sitemap);
    }
  }
  return { indexStatus: index.status, childSitemaps, membership };
}

function pick(html, regex) {
  const match = html.match(regex);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function extract(html) {
  const title = pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description =
    pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    pick(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const canonical =
    pick(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    pick(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const robots = pick(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    title,
    titleLen: [...title].length,
    description,
    descLen: [...description].length,
    canonical: normalize(canonical),
    robots,
    noindex: /noindex/i.test(robots),
    h1Count: (html.match(/<h1\b/gi) ?? []).length,
    imageCount: (html.match(/<img\b/gi) ?? []).length,
    faqSchemaCount: (html.match(/"@type"\s*:\s*"FAQPage"/g) ?? []).length,
    stale247Count: (html.match(/24\/7/g) ?? []).length,
    wordCount: bodyText ? bodyText.split(/\s+/).length : 0,
  };
}

async function main() {
  if (!URLS.length) {
    console.error("Usage: node tools/check_indexability_urls.mjs <url> [url...]");
    process.exit(2);
  }
  const sitemap = await sitemapMembership();
  const results = [];
  for (const url of URLS) {
    const cacheBust = `${url}${url.includes("?") ? "&" : "?"}nowprocket=1&codex=indexability-${Date.now()}`;
    const res = await httpGet(cacheBust);
    const data = extract(res.body);
    const problems = [];
    const norm = normalize(url);
    if (res.status !== 200) problems.push(`HTTP_${res.status}`);
    if (data.noindex) problems.push("NOINDEX");
    if (data.canonical !== norm) problems.push(`CANONICAL:${data.canonical || "missing"}`);
    if (data.h1Count !== 1) problems.push(`H1_${data.h1Count}`);
    if (data.titleLen < 40) problems.push(`TITLE_SHORT:${data.titleLen}`);
    if (data.descLen < 120) problems.push(`META_SHORT:${data.descLen}`);
    if (!sitemap.membership[norm]?.length) problems.push("NOT_IN_SITEMAP");
    if (data.stale247Count > 0) problems.push(`STALE_24_7:${data.stale247Count}`);
    results.push({
      url,
      status: res.status,
      ...data,
      sitemap: sitemap.membership[norm] ?? [],
      problems,
    });
    console.log(`[${problems.length ? "WARN" : "OK"}] ${url} | status=${res.status} | problems=${problems.join(",") || "none"}`);
  }
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const reportPath = path.join(ROOT, "reports", `indexability-target-urls-${stamp}.json`);
  const markdownPath = path.join(ROOT, "reports", `indexability-target-urls-${stamp}.md`);
  const report = {
    generatedAt: new Date().toISOString(),
    sitemapIndexStatus: sitemap.indexStatus,
    childSitemapCount: sitemap.childSitemaps.length,
    urlCount: results.length,
    passCount: results.filter((item) => item.problems.length === 0).length,
    warnCount: results.filter((item) => item.problems.length > 0).length,
    results,
  };
  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  writeFileSync(
    markdownPath,
    [
      "# Indexability Check - Target URLs",
      "",
      `- Generated: ${report.generatedAt}`,
      `- Sitemap index status: ${report.sitemapIndexStatus}`,
      `- Pass: ${report.passCount}/${report.urlCount}`,
      "",
      "| URL | HTTP | Canonical | Robots | H1 | Images | FAQ | 24/7 | Sitemap | Problems |",
      "|---|---:|---|---|---:|---:|---:|---:|---:|---|",
      ...results.map((item) => `| ${item.url} | ${item.status} | ${item.canonical} | ${item.robots || ""} | ${item.h1Count} | ${item.imageCount} | ${item.faqSchemaCount} | ${item.stale247Count} | ${item.sitemap.length} | ${item.problems.join("; ")} |`),
    ].join("\n") + "\n",
    "utf8",
  );
  const { date, time } = nowLocalParts();
  const evidence = results.map((item) => `${item.url}=HTTP${item.status}/sitemap${item.sitemap.length}/problems:${item.problems.join("+") || "none"}`).join("; ");
  appendFileSync(
    CSV_PATH,
    `\n${date},${time},INDEXABILITY-CHECK-TARGET-URLS-${date},seo_verify,check indexability for targeted URLs,${URLS.join("|")},,${report.warnCount === 0 ? "done" : "needs_review"},low,,,,,Checked live HTTP canonical robots H1 meta FAQ stale copy and sitemap membership,tools/check_indexability_urls.mjs,,Fix technical indexability only if problems are not GSC lag,"${evidence}",${report.warnCount === 0 ? "PASS" : "CHECK"},Codex,${date},${reportPath},${markdownPath},,,`,
    "utf8",
  );
  console.log(JSON.stringify({ reportPath, markdownPath, passCount: report.passCount, warnCount: report.warnCount }, null, 2));
  if (report.warnCount > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
