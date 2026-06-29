import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TOKEN_FILE = path.join(ROOT, "secrets", "token_webmasters.json");
const SITE_URL = "https://thongtaccongquangninh.com/";
const API_URL = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
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

async function refreshToken() {
  const token = JSON.parse(readFileSync(TOKEN_FILE, "utf8"));
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: token.client_id,
      client_secret: token.client_secret,
      refresh_token: token.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(`Refresh token failed: ${JSON.stringify(payload)}`);
  }
  token.token = payload.access_token;
  token.expiry = new Date(Date.now() + payload.expires_in * 1000).toISOString();
  writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2), "utf8");
  return payload.access_token;
}

async function inspectUrl(accessToken, url) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL }),
  });
  const payload = await response.json();
  if (!response.ok) {
    return { url, ok: false, status: response.status, error: payload.error ?? payload };
  }
  const inspection = payload.inspectionResult ?? {};
  const index = inspection.indexStatusResult ?? {};
  const rich = inspection.richResultsResult ?? {};
  const mobile = inspection.mobileUsabilityResult ?? {};
  return {
    url,
    ok: true,
    status: response.status,
    inspectionResultLink: inspection.inspectionResultLink ?? null,
    indexStatus: {
      verdict: index.verdict ?? null,
      coverageState: index.coverageState ?? null,
      robotsTxtState: index.robotsTxtState ?? null,
      indexingState: index.indexingState ?? null,
      pageFetchState: index.pageFetchState ?? null,
      lastCrawlTime: index.lastCrawlTime ?? null,
      googleCanonical: index.googleCanonical ?? null,
      userCanonical: index.userCanonical ?? null,
      sitemap: index.sitemap ?? [],
      referringUrls: index.referringUrls ?? [],
    },
    richResults: {
      verdict: rich.verdict ?? null,
      detectedTypes: (rich.detectedItems ?? []).map((item) => item.richResultType).filter(Boolean),
      issueCount: (rich.detectedItems ?? []).reduce(
        (count, item) => count + (item.items ?? []).reduce((inner, nested) => inner + (nested.issues ?? []).length, 0),
        0,
      ),
    },
    mobileUsability: {
      verdict: mobile.verdict ?? null,
      issueCount: (mobile.issues ?? []).length,
    },
  };
}

function markdown(report) {
  const lines = [
    "# GSC URL Inspection - Recent Image Fix URLs",
    "",
    `- Generated: ${report.generatedAt}`,
    `- Site: ${report.siteUrl}`,
    `- OK: ${report.okCount}/${report.urlCount}`,
    "",
    "| URL | Verdict | Coverage | Fetch | Last crawl | Rich | Mobile |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const item of report.results) {
    if (!item.ok) {
      lines.push(`| ${item.url} | ERROR | ${String(item.error?.message ?? item.status ?? "").replaceAll("|", "\\|")} |  |  |  |  |`);
      continue;
    }
    lines.push(
      `| ${item.url} | ${item.indexStatus.verdict ?? ""} | ${String(item.indexStatus.coverageState ?? "").replaceAll("|", "\\|")} | ${item.indexStatus.pageFetchState ?? ""} | ${item.indexStatus.lastCrawlTime ?? ""} | ${item.richResults.verdict ?? ""} | ${item.mobileUsability.verdict ?? ""} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const accessToken = await refreshToken();
  const results = [];
  for (const url of URLS) {
    const result = await inspectUrl(accessToken, url);
    results.push(result);
    if (result.ok) {
      console.log(`[OK] ${url} | ${result.indexStatus.verdict} | ${result.indexStatus.coverageState}`);
    } else {
      console.log(`[ERR] ${url} | ${result.status}`);
    }
  }
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const reportPath = path.join(ROOT, "reports", `gsc-url-inspection-recent-image-fixes-${stamp}.json`);
  const markdownPath = path.join(ROOT, "reports", `gsc-url-inspection-recent-image-fixes-${stamp}.md`);
  const okCount = results.filter((item) => item.ok).length;
  const report = {
    generatedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    urlCount: URLS.length,
    okCount,
    errorCount: URLS.length - okCount,
    results,
  };
  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  writeFileSync(markdownPath, markdown(report), "utf8");

  const { date, time } = nowLocalParts();
  const evidence = results
    .map((item) => item.ok ? `${item.url}=${item.indexStatus.verdict}/${item.indexStatus.coverageState}` : `${item.url}=ERR${item.status}`)
    .join("; ");
  appendFileSync(
    CSV_PATH,
    `\n${date},${time},GSC-INSPECT-IMAGE-FIX-URLS-${date},gsc_inspection,inspect recent image/byline URLs,${URLS.join("|")},,${report.errorCount === 0 ? "done" : "needs_review"},low,,,,,Ran GSC URL Inspection after Google Indexing submit,tools/inspect_recent_image_fix_urls_gsc_2026_06_29.mjs,,Theo doi crawl lai trong GSC neu lastCrawlTime chua doi,"${evidence}",${report.errorCount === 0 ? "PASS" : "CHECK"},Codex,${date},${reportPath},${markdownPath},,,`,
    "utf8",
  );
  console.log(JSON.stringify({ reportPath, markdownPath, okCount: report.okCount, errorCount: report.errorCount }, null, 2));
  if (report.errorCount > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
