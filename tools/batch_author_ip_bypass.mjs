/**
 * Batch insert author byline vào tất cả post SEO chưa có.
 * Dùng IP bypass (103.57.220.210) thay cho DNS.
 * Chỉ xử lý: post type = posts, status = publish, content > 300 chars, chưa có marker.
 * Bỏ qua: pages (renderer custom), post 2554 (noindex), drafts.
 *
 * Usage:
 *   node tools/batch_author_ip_bypass.mjs            ← dry-run (không ghi)
 *   node tools/batch_author_ip_bypass.mjs --write    ← thực sự ghi
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";

const AUTHOR_URL = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const AUTHOR_NAME = "Nguyễn Song Hào";
const MARKER = "ttcqn-author-nguyen-song-hao";
const SKIP_IDS = new Set([2554]); // noindex posts

const WRITE = process.argv.includes("--write");

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function request(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: {
        Host: WP_HOST, Authorization: auth,
        "User-Agent": "batch-author/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d), headers: res.headers }); }
        catch { resolve({ status: res.statusCode, data: d, headers: res.headers }); }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

async function fetchAllPosts(auth) {
  const items = [];
  let page = 1;
  while (true) {
    const r = await request("GET", `/wp/v2/posts?per_page=100&page=${page}&context=edit&status=publish`, auth);
    if (r.status !== 200 || !Array.isArray(r.data)) break;
    items.push(...r.data);
    const totalPages = parseInt(r.headers["x-wp-totalpages"] ?? "1");
    if (page >= totalPages) break;
    page++;
  }
  return items;
}

function buildByline(modifiedDate) {
  const d = new Date(modifiedDate);
  const dateStr = `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`;
  return [
    `\n<!-- wp:paragraph {"className":"${MARKER} ttcqn-author-byline"} -->`,
    `<p class="${MARKER} ttcqn-author-byline"><strong>Tác giả:</strong> <a href="${AUTHOR_URL}" rel="author">${AUTHOR_NAME}</a> · <strong>Cập nhật:</strong> ${dateStr}</p>`,
    `<!-- /wp:paragraph -->`,
  ].join("\n");
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  console.log(`=== Batch Author Insert (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);

  const posts = await fetchAllPosts(auth);
  console.log(`Fetched ${posts.length} published posts\n`);

  const needAuthor = [];
  const alreadyHas = [];
  const skipped = [];

  for (const p of posts) {
    const content = p.content?.raw ?? "";
    if (SKIP_IDS.has(p.id)) { skipped.push({ id: p.id, slug: p.slug, reason: "explicitly skipped" }); continue; }
    if (content.length < 300) { skipped.push({ id: p.id, slug: p.slug, reason: `short content (${content.length} chars)` }); continue; }
    if (content.includes(MARKER)) { alreadyHas.push({ id: p.id, slug: p.slug }); continue; }
    needAuthor.push(p);
  }

  console.log(`Already has author:  ${alreadyHas.length}`);
  console.log(`Needs author:        ${needAuthor.length}`);
  console.log(`Skipped:             ${skipped.length}\n`);

  if (needAuthor.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  console.log("Posts needing author:");
  for (const p of needAuthor) {
    console.log(`  [${p.id}] ${p.slug} (${(p.content?.raw ?? "").length} chars)`);
  }

  if (!WRITE) {
    console.log("\n[DRY-RUN] Pass --write to actually update.");
    return;
  }

  console.log("\nWriting...");
  const results = [];
  for (const p of needAuthor) {
    process.stdout.write(`  [${p.id}] ${p.slug} ... `);
    const newContent = (p.content?.raw ?? "") + buildByline(p.modified ?? new Date().toISOString());
    const r = await request("POST", `/wp/v2/posts/${p.id}`, auth, { content: newContent });
    const ok = r.status === 200;
    console.log(ok ? "✓" : `✗ ${r.status}`);
    results.push({ id: p.id, slug: p.slug, ok, status: r.status });
    await new Promise(r => setTimeout(r, 300));
  }

  const done = results.filter(r => r.ok).length;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);
  appendFileSync(CSV_PATH,
    `\n${TODAY},${TIME},BATCH-AUTHOR-${TODAY},seo_eeat,batch insert author byline all posts,https://thongtaccongquangninh.com,,${done === results.length ? "done" : "partial"},medium,,,,,Insert author byline Nguyễn Song Hào: ${done}/${results.length} posts,tools/batch_author_ip_bypass.mjs,,Verify author link live on sample URLs,IDs=${results.map(r=>r.id).join(',')},,,,,,`,
    "utf8"
  );
  console.log(`\n${done}/${results.length} posts updated. Logged to SEO_PROGRESS.csv`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
