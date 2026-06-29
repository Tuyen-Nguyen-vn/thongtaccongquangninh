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
const URLS = [
  "https://thongtaccongquangninh.com/thong-tac-cong-ha-long/",
  "https://thongtaccongquangninh.com/thong-tac-cong-bai-chay/",
  "https://thongtaccongquangninh.com/cau-hoi-thuong-gap-thong-tac-cong/",
  "https://thongtaccongquangninh.com/hut-be-phot-khach-san-quang-ninh/",
];

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

function extract(html) {
  const get = (re) => (html.match(re) || [])[1] || "";
  const title = get(/<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s+/g, " ").trim();
  const description =
    get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    get(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const canonical =
    get(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    get(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const robots = get(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    titleLen: [...title].length,
    descLen: [...description].length,
    canonical: normalize(canonical),
    robots,
    noindex: /noindex/i.test(robots),
    h1Count: (html.match(/<h1\b/gi) ?? []).length,
    imageCount: (html.match(/<img\b/gi) ?? []).length,
    wordCount: bodyText ? bodyText.split(/\s+/).length : 0,
  };
}

async function main() {
  const sitemap = await sitemapMembership();
  const results = [];
  for (const url of URLS) {
    const cacheBust = `${url}?nowprocket=1&codex=indexability-${Date.now()}`;
    const res = await httpGet(cacheBust);
    const data = extract(res.body);
    const problems = [];
    const norm = normalize(url);
    if (res.status !== 200) problems.push(`HTTP_${res.status}`);
    if (data.noindex) problems.push("NOINDEX");
    if (data.canonical !== norm) problems.push(`CANONICAL:${data.canonical || "missing"}`);
    if (data.h1Count !== 1) problems.push(`H1_${data.h1Count}`);
    if (data.titleLen < 40) problems.push(`TITLE_SHORT:${data.titleLen}`);
    if (data.descLen < 140) problems.push(`META_SHORT:${data.descLen}`);
    if (!sitemap.membership[norm]?.length) problems.push("NOT_IN_SITEMAP");
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
  const reportPath = path.join(ROOT, "reports", `indexability-recent-image-fixes-${stamp}.json`);
  const markdownPath = path.join(ROOT, "reports", `indexability-recent-image-fixes-${stamp}.md`);
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
      "# Indexability Check - Recent Image Fix URLs",
      "",
      `- Generated: ${report.generatedAt}`,
      `- Sitemap index status: ${report.sitemapIndexStatus}`,
      `- Pass: ${report.passCount}/${report.urlCount}`,
      "",
      "| URL | HTTP | Canonical | Robots | H1 | Images | Sitemap | Problems |",
      "|---|---:|---|---|---:|---:|---:|---|",
      ...results.map((item) => `| ${item.url} | ${item.status} | ${item.canonical} | ${item.robots || ""} | ${item.h1Count} | ${item.imageCount} | ${item.sitemap.length} | ${item.problems.join("; ")} |`),
    ].join("\n") + "\n",
    "utf8",
  );
  const { date, time } = nowLocalParts();
  const evidence = results.map((item) => `${item.url}=HTTP${item.status}/sitemap${item.sitemap.length}/problems:${item.problems.join("+") || "none"}`).join("; ");
  appendFileSync(
    CSV_PATH,
    `\n${date},${time},INDEXABILITY-CHECK-IMAGE-FIX-URLS-${date},seo_verify,check indexability for GSC neutral URLs,${URLS.join("|")},,${report.warnCount === 0 ? "done" : "needs_review"},low,,,,,Checked live HTTP canonical robots H1 meta images and sitemap membership after GSC inspection,tools/check_recent_image_fix_indexability_2026_06_29.mjs,,Fix sitemap/canonical only if problems are technical not GSC lag,"${evidence}",${report.warnCount === 0 ? "PASS" : "CHECK"},Codex,${date},${reportPath},${markdownPath},,,`,
    "utf8",
  );
  console.log(JSON.stringify({ reportPath, markdownPath, passCount: report.passCount, warnCount: report.warnCount }, null, 2));
  if (report.warnCount > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
