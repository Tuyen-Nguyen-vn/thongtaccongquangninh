import { mkdirSync, writeFileSync } from "node:fs";

const BASE_URL = "https://thongtaccongquangninh.com";
const REPORT_STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const CODEX_TAG = `slug-normalize-verify-${REPORT_STAMP}`;

const targets = [
  ["bon-cau-rut-cham-nguyen-nhan", "bon-cau-rut-cham-nguyen-nhan-3"],
  ["chi-phi-hut-be-phot-quang-ninh", "chi-phi-hut-be-phot-quang-ninh-2"],
  ["chu-ky-hut-be-phot", "chu-ky-hut-be-phot-3"],
  ["hoa-chat-tu-thong-cong", "hoa-chat-tu-thong-cong-3"],
  ["mui-hoi-cong-nguyen-nhan-xu-ly", "mui-hoi-cong-nguyen-nhan-xu-ly-4"],
  ["hut-be-phot-ba-che", "hut-be-phot-ba-che-2"],
  ["hut-be-phot-binh-lieu", "hut-be-phot-binh-lieu-2"],
  ["hut-be-phot-co-to", "hut-be-phot-co-to-2"],
  ["hut-be-phot-dam-ha", "hut-be-phot-dam-ha-2"],
  ["hut-be-phot-hai-ha", "hut-be-phot-hai-ha-2"],
  ["hut-be-phot-tien-yen", "hut-be-phot-tien-yen-2"],
  ["thong-tac-cong-hong-gai", "thong-tac-cong-hong-gai-2"],
];

function publicUrl(slug) {
  return `${BASE_URL}/${slug}/`;
}

function cacheBust(url) {
  return `${url}?nowprocket=1&codex=${encodeURIComponent(CODEX_TAG)}`;
}

function extractCanonical(html) {
  const match = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
  return match?.[1] || "";
}

function extractRobots(html) {
  const match = html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  return match?.[1] || "";
}

function extractJsonLdBlocks(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim());
}

async function headNoFollow(url) {
  const response = await fetch(cacheBust(url), {
    method: "HEAD",
    redirect: "manual",
    headers: { "User-Agent": "Codex normalized suffix verifier" },
  });
  return {
    status: response.status,
    location: response.headers.get("location") || "",
    redirectedBy: response.headers.get("x-redirect-by") || "",
  };
}

async function getFollow(url) {
  const response = await fetch(cacheBust(url), {
    redirect: "follow",
    headers: { "User-Agent": "Codex normalized suffix verifier" },
  });
  return {
    status: response.status,
    finalUrl: response.url.replace(/\?.*$/, ""),
    html: await response.text(),
  };
}

const rows = [];
for (const [canonicalSlug, oldSlug] of targets) {
  const canonicalUrl = publicUrl(canonicalSlug);
  const oldUrl = publicUrl(oldSlug);
  const page = await getFollow(canonicalUrl);
  const oldHead = await headNoFollow(oldUrl);
  const canonical = extractCanonical(page.html);
  const robots = extractRobots(page.html);
  const jsonLdBlocks = extractJsonLdBlocks(page.html);
  const oldPathNeedle = `/${oldSlug}/`;
  const jsonLdOldUrlHits = jsonLdBlocks.filter((block) => block.includes(oldPathNeedle)).length;

  const pass =
    page.status === 200
    && page.finalUrl === canonicalUrl
    && canonical === canonicalUrl
    && /index/i.test(robots)
    && !/noindex/i.test(robots)
    && [301, 308].includes(oldHead.status)
    && oldHead.location.replace(/\?.*$/, "") === canonicalUrl
    && jsonLdOldUrlHits === 0;

  rows.push({
    canonicalSlug,
    oldSlug,
    canonicalUrl,
    oldUrl,
    pageStatus: page.status,
    finalUrl: page.finalUrl,
    canonical,
    robots,
    oldRedirectStatus: oldHead.status,
    oldRedirectLocation: oldHead.location,
    oldRedirectBy: oldHead.redirectedBy,
    jsonLdBlocks: jsonLdBlocks.length,
    jsonLdOldUrlHits,
    pass,
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  total: rows.length,
  passed: rows.filter((row) => row.pass).length,
  failed: rows.filter((row) => !row.pass).length,
};

mkdirSync("reports", { recursive: true });
const jsonPath = `reports/normalized-suffix-verify-${REPORT_STAMP}.json`;
const mdPath = `reports/normalized-suffix-verify-${REPORT_STAMP}.md`;

writeFileSync(jsonPath, `${JSON.stringify({ summary, rows }, null, 2)}\n`, "utf8");
writeFileSync(
  mdPath,
  [
    "# Normalized Suffix URL Verify",
    "",
    `- Generated: ${summary.generatedAt}`,
    `- Total: ${summary.total}`,
    `- Passed: ${summary.passed}`,
    `- Failed: ${summary.failed}`,
    "",
    "| URL sạch | URL cũ | Clean 200/canonical | Old 301 | JSON-LD sạch | Pass |",
    "|---|---|---:|---:|---:|---:|",
    ...rows.map((row) => [
      `| ${row.canonicalUrl}`,
      row.oldUrl,
      row.pageStatus === 200 && row.finalUrl === row.canonicalUrl && row.canonical === row.canonicalUrl ? "OK" : "FAIL",
      [301, 308].includes(row.oldRedirectStatus) && row.oldRedirectLocation.replace(/\?.*$/, "") === row.canonicalUrl ? "OK" : "FAIL",
      row.jsonLdOldUrlHits === 0 ? "OK" : `FAIL (${row.jsonLdOldUrlHits})`,
      row.pass ? "PASS |" : "FAIL |",
    ].join(" | ")),
    "",
  ].join("\n"),
  "utf8",
);

console.log(JSON.stringify({ summary, jsonPath, mdPath }, null, 2));
if (summary.failed > 0) process.exitCode = 1;
