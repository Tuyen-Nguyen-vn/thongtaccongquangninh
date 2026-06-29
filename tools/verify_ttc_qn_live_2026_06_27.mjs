import https from "node:https";
import { writeFileSync } from "node:fs";

const expectedTitle = "Dịch vụ thông tắc cống Quảng Ninh 24/7 | Song Hào xử lý nhanh";
const expectedMeta =
  "Thông tắc cống Quảng Ninh tại Hạ Long, Cẩm Phả, Uông Bí, Móng Cái. Không đục phá, báo giá trước, bảo hành theo ca. Gọi 0963.953.533 / 0931.156.756.";
const targetPath = "/thong-tac-cong-quang-ninh/?nowprocket=1&codex=20260627-title-meta";

function fetchLive(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "103.57.220.210",
        port: 443,
        servername: "thongtaccongquangninh.com",
        path,
        method: "GET",
        headers: { Host: "thongtaccongquangninh.com", "User-Agent": "Codex live verifier" },
        rejectUnauthorized: false,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function clean(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&ndash;/g, "-")
    .replace(/&amp;/g, "&");
}

function pick(body, regex) {
  const match = body.match(regex);
  return match ? clean(match[1]) : "";
}

const live = await fetchLive(targetPath);
const body = live.body;
const title = pick(body, /<title[^>]*>([\s\S]*?)<\/title>/i);
const metaDescription =
  pick(body, /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i) ||
  pick(body, /<meta\s+content=["']([^"']*)["']\s+name=["']description["'][^>]*>/i);
const ogTitle =
  pick(body, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
  pick(body, /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["'][^>]*>/i);
const ogDescription =
  pick(body, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
  pick(body, /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["'][^>]*>/i);
const h1s = [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => clean(match[1]));
const jsonLdBlocks = [...body.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
  (match) => match[1],
);
const schemas = [];
for (const raw of jsonLdBlocks) {
  try {
    const parsed = JSON.parse(raw.trim());
    for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
      if (item["@graph"]) schemas.push(...item["@graph"]);
      else schemas.push(item);
    }
  } catch (error) {
    schemas.push({ parseError: error.message, raw: raw.slice(0, 80) });
  }
}
const types = schemas.flatMap((schema) => (Array.isArray(schema["@type"]) ? schema["@type"] : [schema["@type"]])).filter(Boolean);
const images = [...body.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
const alts = images.map((tag) => (tag.match(/\salt=["']([^"']*)["']/i) || [])[1] || "");
const checks = {
  status200: live.status === 200,
  titleOk: title === expectedTitle,
  metaOk: metaDescription === expectedMeta,
  ogTitleOk: ogTitle === expectedTitle || ogTitle.includes("thông tắc cống Quảng Ninh"),
  ogDescriptionOk: ogDescription === "" || ogDescription === expectedMeta,
  h1Count: h1s.length,
  h1Ok: h1s.includes("Dịch vụ thông tắc cống Quảng Ninh - Uy tín, chuyên nghiệp 24/7"),
  hasMap: /google\.com\/maps\/embed/i.test(body),
  hasPerson: types.includes("Person"),
  hasLocalBusiness: types.includes("LocalBusiness") || types.includes("ProfessionalService"),
  hasFAQ: types.includes("FAQPage"),
  noRatingSchema: !types.includes("AggregateRating") && !types.includes("Review") && !/aggregateRating/i.test(body),
  imageCount: images.length,
  localAltCount: alts.filter((alt) => /Quảng Ninh|Hạ Long|Cẩm Phả|Uông Bí|Móng Cái/i.test(alt)).length,
};

const report = {
  generatedAt: new Date().toISOString(),
  url: `https://thongtaccongquangninh.com${targetPath}`,
  status: live.status,
  title,
  metaDescription,
  ogTitle,
  ogDescription,
  h1s,
  schemaTypes: types,
  checks,
};
const reportPath = "/mnt/d/.thongtaccongquangninh/reports/live-verify-ttc-qn-2026-06-27-title-meta.json";
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ report: reportPath, checks, title, metaDescription }, null, 2));
if (!checks.status200 || !checks.titleOk || !checks.metaOk || !checks.h1Ok || !checks.hasPerson || !checks.hasLocalBusiness || !checks.hasFAQ) {
  process.exitCode = 1;
}
