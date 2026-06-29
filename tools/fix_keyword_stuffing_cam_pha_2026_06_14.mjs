/**
 * Reduce exact-match keyword repetition on /thong-tac-cong-cam-pha/.
 *
 * Keeps the first SEO-critical mentions, then rewrites later exact-match
 * occurrences to natural local-service phrasing.
 *
 * Usage:
 *   node tools/fix_keyword_stuffing_cam_pha_2026_06_14.mjs
 *   node tools/fix_keyword_stuffing_cam_pha_2026_06_14.mjs --write
 */
import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

import { keywordDensity, textFromHtml } from "./lib/seo_audit_extend.mjs";

const WRITE = process.argv.includes("--write");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH = `${PROJECT}\\.env`;
const BACKUP_DIR = `${PROJECT}\\backups\\live-audit-fix-2026-06-14`;
const REPORTS_DIR = `${PROJECT}\\reports`;
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const REPORT_PATH = `${REPORTS_DIR}\\fix-keyword-stuffing-cam-pha-2026-06-14-${STAMP}.json`;

const PAGE_ID = 400;
const PAGE_TYPE = "pages";
const PAGE_SLUG = "thong-tac-cong-cam-pha";
const FOCUS_ASCII = "thong tac cong cam pha";
const KEEP_EXACT_MATCHES = 6;
const EXACT_RE = /thông\s+tắc\s+cống\s+cẩm\s+phả/giu;

const replacements = [
  "xử lý cống tắc tại Cẩm Phả",
  "dịch vụ xử lý đường cống tại Cẩm Phả",
  "đội thợ tại Cẩm Phả",
  "ca cống nghẹt ở Cẩm Phả",
  "khơi thông đường ống khu vực Cẩm Phả",
  "xử lý thoát nước tại Cẩm Phả",
  "thợ thông cống tại Cẩm Phả",
  "xử lý cống nghẹt Cẩm Phả",
  "dịch vụ thoát nước khu vực Cẩm Phả",
  "đội xử lý cống ở Cẩm Phả",
];

function parseEnv(p) {
  const env = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
  throw new Error("Missing WP_USERNAME or WP_APP_PASSWORD in .env");
}

const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function wpJson(method, pathname, body = null) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: `/wp-json/wp/v2/${pathname}`,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          Accept: "application/json",
          "User-Agent": "Codex keyword density fix 2026-06-14",
          ...(bodyBuf
            ? {
                "Content-Type": "application/json",
                "Content-Length": bodyBuf.length,
              }
            : {}),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed = data;
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch {
            // Keep raw payload for diagnostics.
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`${res.statusCode} ${pathname}: ${String(data).slice(0, 500)}`));
            return;
          }
          resolve(parsed);
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function countExact(html) {
  return [...html.matchAll(EXACT_RE)].length;
}

function normalizeTitleCase(original, replacement) {
  return /^[A-ZÀ-Ỹ]/u.test(original) ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;
}

function reduceExactMatches(html) {
  let seen = 0;
  let changed = 0;
  const next = html.replace(EXACT_RE, (match) => {
    seen += 1;
    if (seen <= KEEP_EXACT_MATCHES) return match;
    const replacement = replacements[(seen - KEEP_EXACT_MATCHES - 1) % replacements.length];
    changed += 1;
    return normalizeTitleCase(match, replacement);
  });
  return { next, seen, changed };
}

mkdirSync(BACKUP_DIR, { recursive: true });
mkdirSync(REPORTS_DIR, { recursive: true });

const page = await wpJson("GET", `${PAGE_TYPE}/${PAGE_ID}?context=edit`);
const raw = page.content?.raw || "";
if (!raw) throw new Error(`No raw content returned for page ${PAGE_ID}`);

const before = {
  exactMatches: countExact(raw),
  density: keywordDensity(textFromHtml(raw), FOCUS_ASCII),
};

const { next, seen, changed } = reduceExactMatches(raw);

const after = {
  exactMatches: countExact(next),
  density: keywordDensity(textFromHtml(next), FOCUS_ASCII),
};

const backupPath = `${BACKUP_DIR}\\page-${PAGE_ID}-${PAGE_SLUG}-before-keyword-density-${STAMP}.json`;
writeFileSync(backupPath, JSON.stringify(page, null, 2), "utf8");

const report = {
  generatedAt: new Date().toISOString(),
  mode: WRITE ? "write" : "dry-run",
  pageId: PAGE_ID,
  slug: PAGE_SLUG,
  keepExactMatches: KEEP_EXACT_MATCHES,
  seenExactMatches: seen,
  changedExactMatches: changed,
  backupPath,
  before,
  after,
  updated: false,
};

if (before.exactMatches <= KEEP_EXACT_MATCHES) {
  report.note = "No update needed; exact-match count is already at or below target.";
} else if (WRITE) {
  const updated = await wpJson("POST", `${PAGE_TYPE}/${PAGE_ID}`, { content: next });
  report.updated = true;
  report.updatedModified = updated.modified_gmt || updated.modified || null;
  report.link = updated.link || null;
}

writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
