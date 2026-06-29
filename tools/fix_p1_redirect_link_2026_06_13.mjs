import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH = join(PROJECT, ".env");
const BACKUP_DIR = join(PROJECT, "backups", "p1-redirect-link-2026-06-13");
const REPORT_PATH = join(PROJECT, "reports", "p1-redirect-link-2026-06-13.json");
const CSV_PATH = join(PROJECT, "docs", "SEO_PROGRESS.csv");
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const SLUG = "thong-tac-bon-cau-nha-hang-quang-ninh-2026";
const BAD_PATH = "/thong-tac-cong-nha-hang-quang-ninh/";
const GOOD_PATH = "/thong-tac-cong-nha-hang-ha-long/";
const BAD_URL = `https://${WP_HOST}${BAD_PATH}`;
const GOOD_URL = `https://${WP_HOST}${GOOD_PATH}`;
const WRITE = process.argv.includes("--write");

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function wpRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: "/wp-json" + path,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "User-Agent": "ttcqn-p1-redirect-link-fix/2026-06-13",
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
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(45000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

async function fetchBySlug(type) {
  const res = await wpRequest("GET", `/wp/v2/${type}?slug=${encodeURIComponent(SLUG)}&context=edit`);
  if (res.status !== 200) throw new Error(`GET ${type} failed: HTTP ${res.status}`);
  return Array.isArray(res.data) ? res.data[0] : null;
}

function countOccurrences(content) {
  return (content.match(/thong-tac-cong-nha-hang-quang-ninh/g) || []).length;
}

function patchContent(content) {
  return content.replaceAll(BAD_URL, GOOD_URL).replaceAll(BAD_PATH, GOOD_PATH);
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  mkdirSync(join(PROJECT, "reports"), { recursive: true });

  const targets = [];
  for (const type of ["posts", "pages"]) {
    const item = await fetchBySlug(type);
    if (item) targets.push({ type, item });
  }
  if (!targets.length) throw new Error(`No post/page found for slug ${SLUG}`);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const results = [];
  for (const { type, item } of targets) {
    const before = item.content?.raw || "";
    const after = patchContent(before);
    const replacements = countOccurrences(before);
    const changed = before !== after;

    writeFileSync(
      join(BACKUP_DIR, `${type}-${item.id}-${SLUG}-before-${stamp}.json`),
      JSON.stringify(item, null, 2),
      "utf8",
    );
    writeFileSync(join(BACKUP_DIR, `${type}-${item.id}-${SLUG}-after-preview.html`), after, "utf8");

    let updateStatus = "DRY_RUN";
    let link = item.link;
    if (WRITE && changed) {
      const update = await wpRequest("POST", `/wp/v2/${type}/${item.id}`, { content: after });
      if (update.status !== 200) {
        throw new Error(`POST ${type}/${item.id} failed: HTTP ${update.status} ${JSON.stringify(update.data).slice(0, 300)}`);
      }
      updateStatus = "UPDATED";
      link = update.data.link || link;
    } else if (!changed) {
      updateStatus = "NO_CHANGE";
    }

    results.push({ type, id: item.id, slug: item.slug, link, replacements, changed, updateStatus });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    write: WRITE,
    from: BAD_PATH,
    to: GOOD_PATH,
    results,
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

  if (WRITE) {
    const ids = results.map((r) => `${r.type}:${r.id}:${r.updateStatus}`).join("|");
    appendFileSync(
      CSV_PATH,
      `\n2026-06-13,${new Date().toTimeString().slice(0, 5)},FIX-P1-REDIRECT-LINK-2026-06-13,seo_fix,fix internal link redirect nha hang,${GOOD_URL},,done,high,,,,,${ids},tools/fix_p1_redirect_link_2026_06_13.mjs,,Re-audit link assets and GSC redirects,,,,,,`,
      "utf8",
    );
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
