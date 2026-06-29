/**
 * Refresh wp-url-audit-list.csv + .json
 * Fetches all pages + posts from WP REST API (IP bypass) and overwrites inventory.
 */
import https from "node:https";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH = existsSync(join(ROOT, ".env"))
  ? join(ROOT, ".env")
  : "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = join(ROOT, "wp-url-audit-list.csv");
const JSON_PATH = join(ROOT, "wp-url-audit-list.json");

const LOCAL_LANDING_SLUGS = new Set([
  "hut-be-phot-quang-ninh","hut-be-phot-ha-long","hut-be-phot-cam-pha","hut-be-phot-uong-bi",
  "hut-be-phot-mong-cai","hut-be-phot-van-don","hut-be-phot-tien-yen","hut-be-phot-dong-trieu",
  "hut-ham-cau-quang-ninh","thong-tac-cong-quang-ninh","thong-tac-cong-ha-long",
  "thong-tac-cong-bai-chay","thong-tac-cong-cao-xanh","thong-tac-cong-tuan-chau",
  "thong-tac-cong-gieng-day","thong-tac-bon-cau-quang-ninh","nao-vet-ho-ga-quang-ninh",
  "thong-tac-cong-cam-pha","thong-tac-cong-uong-bi","thong-tac-cong-mong-cai",
]);

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function wpGet(path, auth) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "url-audit/2.0" },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        if (d.charCodeAt(0) === 0xFEFF) {
          d = d.slice(1);
        }
        try { resolve({ status: res.statusCode, data: JSON.parse(d), headers: res.headers }); }
        catch { resolve({ status: res.statusCode, data: d, headers: res.headers }); }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

async function fetchAll(type, auth) {
  const items = [];
  let page = 1;
  while (true) {
    const r = await wpGet(`/wp/v2/${type}?per_page=100&page=${page}&context=view&status=any`, auth);
    if (r.status !== 200 || !Array.isArray(r.data)) break;
    items.push(...r.data);
    const total = parseInt(r.headers["x-wp-totalpages"] ?? "1");
    if (page >= total) break;
    page++;
  }
  return items;
}

function csvEscape(s) {
  if (!s) return "";
  s = String(s).replace(/\r?\n/g, " ").trim();
  if (s.includes(",") || s.includes('"')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const now = new Date().toISOString();

  console.log("=== Refresh WP URL Audit ===");

  const [pages, posts] = await Promise.all([
    fetchAll("pages", auth),
    fetchAll("posts", auth),
  ]);

  console.log(`Fetched: ${pages.length} pages, ${posts.length} posts`);

  const entries = [];

  for (const item of [...pages, ...posts]) {
    const restBase = pages.includes(item) ? "pages" : "posts";
    const slug = item.slug ?? "";
    const isPublic = item.status === "publish";
    const isLocalLanding = LOCAL_LANDING_SLUGS.has(slug) ||
      (isPublic && slug.match(/hut-be-phot|hut-ham-cau|thong-tac-cong|thong-tac-bon-cau|nao-vet-ho-ga|xu-ly-mui-hoi/));

    const priority = !isPublic ? "non-public"
      : isLocalLanding ? "high-local-seo"
      : "normal";

    entries.push({
      id: item.id,
      post_type: restBase === "pages" ? "page" : "post",
      rest_base: restBase,
      status: item.status,
      date: item.date,
      modified: item.modified,
      slug,
      link: item.link ?? "",
      title: item.title?.rendered ?? "",
      excerpt: (item.excerpt?.rendered ?? "").replace(/<[^>]+>/g, "").trim().slice(0, 200),
      source: "rest",
      in_sitemap: isPublic ? "true" : "false",
      is_public: isPublic ? "true" : "false",
      is_local_landing: isLocalLanding ? "true" : "false",
      audit_priority: priority,
      issues: "",
    });
  }

  entries.sort((a, b) => a.id - b.id);

  // Write CSV
  const headers = "id,post_type,rest_base,status,date,modified,slug,link,title,excerpt,source,in_sitemap,is_public,is_local_landing,audit_priority,issues";
  const csvRows = entries.map(e =>
    [e.id, e.post_type, e.rest_base, e.status, e.date, e.modified,
     csvEscape(e.slug), csvEscape(e.link), csvEscape(e.title), csvEscape(e.excerpt),
     e.source, e.in_sitemap, e.is_public, e.is_local_landing, e.audit_priority, e.issues].join(",")
  );
  writeFileSync(CSV_PATH, [headers, ...csvRows].join("\n"), "utf8");
  console.log(`CSV: ${csvRows.length} rows → ${CSV_PATH}`);

  // Write JSON
  const json = {
    summary: {
      generatedAt: now,
      totalEntries: entries.length,
      pages: pages.length,
      posts: posts.length,
      publicEntries: entries.filter(e => e.is_public === "true").length,
      localLanding: entries.filter(e => e.is_local_landing === "true").length,
    },
    entries,
  };
  writeFileSync(JSON_PATH, JSON.stringify(json, null, 2), "utf8");
  console.log(`JSON: ${entries.length} entries → ${JSON_PATH}`);

  // Summary
  const localPages = entries.filter(e => e.is_local_landing === "true" && e.is_public === "true");
  console.log(`\nLocal landing (published): ${localPages.length}`);
  for (const p of localPages) console.log(`  [${p.id}] ${p.slug} (${p.modified?.slice(0,10)})`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
