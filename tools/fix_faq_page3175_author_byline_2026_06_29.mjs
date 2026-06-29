import https from "node:https";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(PROJECT_ROOT, ".env");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const BASE_URL = "https://thongtaccongquangninh.com";
const PAGE_ID = 3175;
const PAGE_SLUG = "cau-hoi-thuong-gap-thong-tac-cong";
const PAGE_PATH = `/${PAGE_SLUG}/`;
const MARKER = "ttcqn-author-nguyen-song-hao";
const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const AUTHOR_NAME = "Nguyễn Song Hào";
const APPLY = process.argv.includes("--apply");

const ts = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
const today = new Date().toISOString().slice(0, 10);
const time = new Date().toTimeString().slice(0, 5);
const BACKUP_DIR = path.join(PROJECT_ROOT, "seo-revisions", `wp-before-faq-page3175-byline-${ts}`);
const REPORT_PATH = path.join(PROJECT_ROOT, "reports", `faq-page3175-byline-${ts}.json`);
const CSV_PATH = path.join(PROJECT_ROOT, "docs", "SEO_PROGRESS.csv");

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function wpRequest(method, route, auth, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: `/wp-json${route}`,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "User-Agent": "Codex FAQ page 3175 byline fix",
          ...(payload ? { "Content-Type": "application/json", "Content-Length": payload.length } : {}),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let data = text;
          try {
            data = text ? JSON.parse(text) : {};
          } catch {}
          if (res.statusCode >= 400) {
            const message = typeof data === "object" ? data.message ?? text : data;
            reject(new Error(`WP ${res.statusCode} ${route}: ${message}`));
            return;
          }
          resolve(data);
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error(`timeout ${route}`)));
    if (payload) req.write(payload);
    req.end();
  });
}

function liveGet(pathname) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: pathname,
        method: "GET",
        headers: { Host: WP_HOST, "User-Agent": "Codex FAQ page 3175 verify", "Cache-Control": "no-cache" },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve({ status: res.statusCode, html: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("live verify timeout")));
    req.end();
  });
}

function bylineBlock(modified) {
  const d = new Date(modified);
  const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return [
    `<!-- wp:paragraph {"className":"${MARKER} ttcqn-author-byline"} -->`,
    `<p class="${MARKER} ttcqn-author-byline"><strong>Tác giả:</strong> <a href="${AUTHOR_URL}" rel="author">${AUTHOR_NAME}</a> · <strong>Cập nhật:</strong> ${dateStr}</p>`,
    "<!-- /wp:paragraph -->",
  ].join("\n");
}

function insertByline(content, modified) {
  if (String(content).includes(MARKER)) return { content, changed: false };
  const block = `\n\n${bylineBlock(modified)}\n\n`;
  const schemaIndex = String(content).search(/<!-- wp:html -->\s*<script\s+type=["']application\/ld\+json["']/i);
  if (schemaIndex !== -1) {
    return { content: content.slice(0, schemaIndex) + block + content.slice(schemaIndex), changed: true };
  }
  return { content: `${content}${block}`, changed: true };
}

function inspect(html) {
  return {
    h1Count: (html.match(/<h1\b/gi) ?? []).length,
    imageCount: (html.match(/<img\b/gi) ?? []).length,
    hasMarker: html.includes(MARKER),
    hasAuthorName: html.includes(AUTHOR_NAME),
    hasAuthorUrl: html.includes(AUTHOR_URL),
    hasFaqImages: html.includes("cau-hoi-thuong-gap-thong-tac-cong-tho-kiem-tra.webp") &&
      html.includes("cau-hoi-thuong-gap-thong-tac-cong-may-lo-xo.webp") &&
      html.includes("cau-hoi-thuong-gap-thong-tac-cong-ho-ga.webp"),
  };
}

async function main() {
  const env = parseEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Thiếu WP_USERNAME/WP_APP_PASSWORD trong .env");
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const page = await wpRequest("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`, auth);
  const current = page.content?.raw ?? page.content?.rendered ?? "";
  const patch = insertByline(current, page.modified ?? new Date().toISOString());
  const report = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? "apply" : "dry-run",
    url: `${BASE_URL}${PAGE_PATH}`,
    pageId: PAGE_ID,
    changed: patch.changed,
    backupDir: APPLY ? BACKUP_DIR : null,
    reportPath: REPORT_PATH,
  };
  if (APPLY && patch.changed) {
    mkdirSync(BACKUP_DIR, { recursive: true });
    writeFileSync(path.join(BACKUP_DIR, `page-${PAGE_ID}-${PAGE_SLUG}.json`), JSON.stringify(page, null, 2), "utf8");
    await wpRequest("POST", `/wp/v2/pages/${PAGE_ID}`, auth, { content: patch.content });
  }
  if (APPLY) {
    const live = await liveGet(`${PAGE_PATH}?nowprocket=1&codex=faq3175-byline-${Date.now()}`);
    report.live = { status: live.status, ...inspect(live.html) };
    const pass = live.status === 200 && report.live.h1Count === 1 && report.live.hasMarker && report.live.hasAuthorName && report.live.hasAuthorUrl && report.live.hasFaqImages;
    report.status = pass ? "pass" : "needs_review";
    appendFileSync(
      CSV_PATH,
      `\n${today},${time},FIX-FAQ-PAGE3175-AUTHOR-BYLINE-${today},seo_fix,cau hoi thuong gap thong tac cong,${BASE_URL}${PAGE_PATH},${PAGE_SLUG},${pass ? "done" : "needs_review"},low,,,,,Them author byline Nguyen Song Hao cho page public 3175 sau khi chen anh SEO,tools/fix_faq_page3175_author_byline_2026_06_29.mjs,,Run audit_unique_wp_images.py final,Live verify status ${live.status}; h1=${report.live.h1Count}; byline=${report.live.hasMarker}; images=${report.live.hasFaqImages},${pass ? "PASS" : "CHECK"},Codex,${today},${REPORT_PATH},${BACKUP_DIR},,,`,
      "utf8",
    );
  } else {
    report.status = patch.changed ? "dry_run_needs_apply" : "dry_run_already_has_byline";
  }
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  if (report.status === "needs_review") process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
