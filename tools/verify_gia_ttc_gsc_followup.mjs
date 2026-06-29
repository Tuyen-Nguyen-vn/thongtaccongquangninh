/**
 * Verify the public state of the gia-thong-tac-cong-quang-ninh URL before GSC inspection.
 *
 * Usage:
 *   node tools/verify_gia_ttc_gsc_followup.mjs
 */
import https from "node:https";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const PROJECT = "/mnt/d/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const URL_PATH = "/gia-thong-tac-cong-quang-ninh/";
const URL = `https://${HOST}${URL_PATH}`;
const IMAGE_FILE = "gia-thong-tac-cong-quang-ninh-kiem-tra-may-lo-xo.webp";
const IMAGE_ALT = "Kiểm tra máy lò xo trước khi báo giá thông tắc cống Quảng Ninh";
const IMAGE_CAPTION = "Kiểm tra máy lò xo và đầu thông giúp kỹ thuật viên chọn phương án xử lý phù hợp trước khi báo giá.";
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const REPORT_PATH = path.join(PROJECT, "reports", `gsc-followup-gia-ttc-${STAMP}.json`);

function get(publicPath) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: HOST,
        path: publicPath,
        method: "GET",
        headers: {
          Host: HOST,
          "User-Agent": "codex-gsc-followup/1.0",
          "Cache-Control": "no-cache",
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: body.replace(/^\uFEFF/, "") }));
      },
    );
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function match(html, re) {
  const found = String(html || "").match(re);
  return found ? found[1].trim() : "";
}

function textFromHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function count(html, re) {
  return (String(html || "").match(re) || []).length;
}

async function main() {
  const cacheKey = `gsc-followup-${Date.now()}`;
  const [page, sitemap, robots] = await Promise.all([
    get(`${URL_PATH}?nowprocket=1&codex=${cacheKey}`),
    get(`/post-sitemap.xml?nowprocket=1&codex=${cacheKey}`),
    get(`/robots.txt?nowprocket=1&codex=${cacheKey}`),
  ]);

  const html = page.body;
  const plain = textFromHtml(html);
  const robotsMeta = match(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  const checks = {
    httpStatus: page.status,
    title: match(html, /<title>([\s\S]*?)<\/title>/i),
    metaDescription: match(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i),
    robotsMeta,
    canonical: match(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i),
    h1Count: count(html, /<h1\b/gi),
    h1: match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    imageCount: count(html, /<img\b/gi),
    hasNewImage: html.includes(IMAGE_FILE),
    hasNewImageAlt: html.includes(IMAGE_ALT),
    hasNewImageCaption: plain.includes(IMAGE_CAPTION),
    hasServiceSchema: html.includes(`${URL}#service`),
    hasFaqSchema: html.includes(`${URL}#faq`),
    hasNoindex: /noindex/i.test(robotsMeta),
    updatedTime: match(html, /<meta\s+property=["']og:updated_time["']\s+content=["']([^"']+)["']/i),
    sitemapStatus: sitemap.status,
    inPostSitemap: sitemap.body.includes(URL),
    robotsStatus: robots.status,
    robotsHasSitemap: /Sitemap:/i.test(robots.body),
  };

  const report = {
    generatedAt: new Date().toISOString(),
    url: URL,
    ok:
      checks.httpStatus === 200 &&
      checks.canonical === URL &&
      !checks.hasNoindex &&
      checks.h1Count === 1 &&
      checks.hasNewImage &&
      checks.hasNewImageAlt &&
      checks.hasNewImageCaption &&
      checks.hasServiceSchema &&
      checks.hasFaqSchema &&
      checks.inPostSitemap,
    checks,
    gsc: {
      directAccessAvailableInWorkspace: false,
      note: "No current Search Console URL Inspection credential/script was confirmed in this run; use GSC UI to inspect the URL and request indexing if needed.",
    },
  };

  mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({ reportPath: REPORT_PATH, ok: report.ok, checks }, null, 2));
  if (!report.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
