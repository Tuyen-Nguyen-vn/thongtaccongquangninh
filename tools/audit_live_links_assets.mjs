import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const PROJECT = process.env.TTCQN_PROJECT_ROOT
  ? resolve(process.env.TTCQN_PROJECT_ROOT)
  : resolve(dirname(__filename), "..");
const ENV_PATH = process.env.TTCQN_WP_ENV || join(PROJECT, ".env");
const REPORT_DIR = join(PROJECT, "reports");
const STAMP = new Date().toISOString().slice(0, 10);
const CSV_PATH = join(REPORT_DIR, `audit-live-links-assets-${STAMP}.csv`);
const MD_PATH = join(REPORT_DIR, `audit-live-links-assets-${STAMP}.md`);
const HOST = "thongtaccongquangninh.com";

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripHtml(input) {
  return String(input ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function wp(baseUrl, auth, path) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex live link audit",
    },
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`WordPress ${response.status} ${path}`);
  return response.json();
}

async function listAll(baseUrl, auth, collection) {
  const all = [];
  for (let page = 1; page < 20; page++) {
    const items = await wp(
      baseUrl,
      auth,
      `/wp/v2/${collection}?status=publish&context=edit&per_page=100&page=${page}`
    );
    all.push(...items.map((item) => ({ ...item, type: collection })));
    if (items.length < 100) break;
  }
  return all;
}

function toUrl(value, base) {
  const raw = String(value ?? "").trim();
  if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return null;
  if (raw.startsWith("data:") || raw.startsWith("javascript:")) return null;
  try {
    return new URL(raw, base).href.replace(/#.*$/, "");
  } catch {
    return null;
  }
}

function extractTargets(html, pageUrl) {
  const targets = [];
  const attrRe = /\b(?:href|src)=["']([^"']+)["']/gi;
  for (const match of html.matchAll(attrRe)) {
    const url = toUrl(match[1], pageUrl);
    if (!url) continue;
    const parsed = new URL(url);
    const isOwn = parsed.hostname === HOST || parsed.hostname === `www.${HOST}`;
    const isImportantExternal = ["zalo.me", "www.facebook.com", "facebook.com", "youtube.com", "www.youtube.com"].includes(
      parsed.hostname
    );
    if (isOwn || isImportantExternal) targets.push(url);
  }
  return targets;
}

async function fetchStatus(url, method = "HEAD") {
  try {
    const response = await fetch(url, {
      method,
      redirect: "follow",
      headers: { "User-Agent": "Codex live link audit" },
      signal: AbortSignal.timeout(30000),
    });
    return { ok: response.ok, status: response.status, finalUrl: response.url };
  } catch (error) {
    if (method === "HEAD") return fetchStatus(url, "GET");
    return { ok: false, status: 0, finalUrl: url, error: error.message };
  }
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

async function main() {
  mkdirSync(REPORT_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const pages = [...(await listAll(baseUrl, auth, "pages")), ...(await listAll(baseUrl, auth, "posts"))].sort((a, b) =>
    a.slug.localeCompare(b.slug)
  );
  const pageRows = [];
  const targetToSources = new Map();

  for (const page of pages) {
    const pageStatus = await fetchStatus(page.link, "GET");
    const html = pageStatus.ok
      ? await (await fetch(page.link, { headers: { "User-Agent": "Codex live link audit" } })).text()
      : "";
    const targets = extractTargets(html, page.link);
    for (const target of targets) {
      if (!targetToSources.has(target)) targetToSources.set(target, new Set());
      targetToSources.get(target).add(page.slug);
    }
    pageRows.push({
      slug: page.slug,
      type: page.type,
      id: page.id,
      status: pageStatus.status,
      title: stripHtml(page.title?.raw ?? page.title?.rendered ?? ""),
      link: page.link,
      targetCount: targets.length,
    });
    console.log(`${page.slug} page=${pageStatus.status} targets=${targets.length}`);
  }

  const targetRows = [];
  for (const [target, sources] of targetToSources.entries()) {
    const status = await fetchStatus(target);
    targetRows.push({
      target,
      status: status.status,
      ok: status.ok,
      finalUrl: status.finalUrl,
      sources: [...sources].sort().join("|"),
    });
  }

  const badPages = pageRows.filter((row) => row.status !== 200);
  const badTargets = targetRows.filter((row) => !row.ok);
  const headers = ["kind", "status", "ok", "url", "finalUrl", "sources"];
  const csv = [
    headers.map(csvCell).join(","),
    ...pageRows.map((row) =>
      [csvCell("page"), csvCell(row.status), csvCell(row.status === 200), csvCell(row.link), csvCell(row.link), csvCell(row.slug)].join(",")
    ),
    ...targetRows.map((row) =>
      [csvCell("target"), csvCell(row.status), csvCell(row.ok), csvCell(row.target), csvCell(row.finalUrl), csvCell(row.sources)].join(",")
    ),
  ].join("\n");
  writeFileSync(CSV_PATH, "\uFEFF" + csv, "utf8");

  const md = `# Audit link và asset live ${STAMP}

## Kết quả

- Page/post publish kiểm tra: **${pageRows.length}**
- Target link/asset quan trọng kiểm tra: **${targetRows.length}**
- Page HTTP lỗi: **${badPages.length}**
- Link/asset lỗi: **${badTargets.length}**
- File CSV: \`${CSV_PATH}\`

## Link/asset cần xử lý

${
  badTargets.length
    ? badTargets
        .map((row) => `- HTTP ${row.status}: ${row.target} | nguồn: ${row.sources}`)
        .join("\n")
    : "- Không phát hiện link/asset lỗi trong phạm vi kiểm tra."
}
`;
  writeFileSync(MD_PATH, md, "utf8");
  console.log(`DONE pages=${pageRows.length} targets=${targetRows.length} badTargets=${badTargets.length}`);
  if (badPages.length || badTargets.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
