/**
 * Set noindex on post 2554 (xe-hut-be-phot-quang-ninh-2026)
 * It already has canonical → hut-be-phot-quang-ninh; noindex removes indexing risk.
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const POST_ID = 2554;
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function wpPost(path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(JSON.stringify(body), "utf8");
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method: "POST",
      headers: {
        Host: WP_HOST, Authorization: auth,
        "Content-Type": "application/json", "Content-Length": bodyBuf.length,
        "User-Agent": "noindex-fix/1.0",
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout")));
    req.write(bodyBuf);
    req.end();
  });
}

function fetchHtml(urlPath) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: urlPath, method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "verify/1.0", "Cache-Control": "no-cache" },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, html: d }));
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  console.log(`=== Set noindex on post ${POST_ID} (xe-hut-be-phot-quang-ninh-2026) ===\n`);

  // Strategy 1: Rank Math updateMeta — set robots to noindex
  console.log("--- Strategy 1: Rank Math updateMeta ---");
  const rm = await wpPost("/rankmath/v1/updateMeta", auth, {
    objectType: "post",
    objectID: POST_ID,
    meta: { rank_math_robots: ["noindex"] },
  });
  console.log(`  Status: ${rm.status}`);
  let success = false;
  if (rm.status === 200) {
    console.log("  ✓ Rank Math updateMeta OK:", JSON.stringify(rm.data).slice(0, 150));
    success = true;
  } else {
    console.log("  ✗ Failed:", JSON.stringify(rm.data).slice(0, 150));
  }

  // Strategy 2: WP REST post meta fallback
  if (!success) {
    console.log("\n--- Strategy 2: WP REST API post meta ---");
    const r2 = await wpPost(`/wp/v2/posts/${POST_ID}`, auth, {
      meta: { rank_math_robots: "noindex" },
    });
    console.log(`  Status: ${r2.status}`);
    if (r2.status === 200) {
      console.log("  ✓ WP meta update OK");
      success = true;
    } else {
      console.log("  ✗ Failed:", JSON.stringify(r2.data).slice(0, 150));
    }
  }

  // Verify live robots meta
  console.log("\n--- Verify live robots meta ---");
  await new Promise(r => setTimeout(r, 1500));
  const { html } = await fetchHtml("/xe-hut-be-phot-quang-ninh-2026/");
  const robotsMatch = html.match(/<meta name=["']robots["'][^>]*content=["']([^"']+)["']/i);
  const canonMatch  = html.match(/<link rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const liveRobots  = robotsMatch?.[1] ?? "(none)";
  const liveCanon   = canonMatch?.[1]  ?? "(none)";
  console.log(`  Live robots:    ${liveRobots}`);
  console.log(`  Live canonical: ${liveCanon}`);

  const noindexOk = liveRobots.toLowerCase().includes("noindex");
  if (noindexOk) {
    console.log("  ✓ noindex confirmed live!");
  } else {
    console.log("  ✗ noindex not visible yet (may need cache purge)");
  }

  // Log to CSV
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);
  const csvRow = `\n${TODAY},${TIME},HBP-NOINDEX-2554-${TODAY},seo_fix,noindex competing HBP post,https://thongtaccongquangninh.com/xe-hut-be-phot-quang-ninh-2026/,post-2554-noindex,${noindexOk ? "done" : "pending"},medium,,,,,Set rank_math_robots=noindex post 2554 (canonical already → hut-be-phot-quang-ninh),tools/noindex_hbp_competing.mjs,,Monitor GSC Coverage — should move to Excluded,Live robots=${liveRobots},,,,,,`;
  appendFileSync(CSV_PATH, csvRow, "utf8");
  console.log("\nLogged to SEO_PROGRESS.csv");
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
