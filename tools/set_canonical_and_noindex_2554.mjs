/**
 * Set canonical + noindex on post 2554 via WP REST API meta (single request).
 * Writes rank_math_canonical_url + rank_math_robots directly to postmeta,
 * which also triggers LiteSpeed cache invalidation.
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const POST_ID = 2554;
const PRIMARY_URL = "https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/";
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
        "User-Agent": "canonical-noindex/1.0",
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
    req.setTimeout(25000, () => req.destroy(new Error("timeout")));
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

  console.log(`=== Set canonical + noindex on post ${POST_ID} via WP REST meta ===\n`);

  // Single WP REST request: set both canonical and robots in postmeta
  // Also triggers LiteSpeed cache invalidation
  const r = await wpPost(`/wp/v2/posts/${POST_ID}`, auth, {
    meta: {
      rank_math_canonical_url: PRIMARY_URL,
      rank_math_robots: "noindex",
    },
  });

  console.log(`Status: ${r.status}`);
  if (r.status !== 200) {
    console.log("FAIL:", JSON.stringify(r.data).slice(0, 300));
    process.exit(1);
  }

  const returnedMeta = r.data?.meta ?? {};
  console.log(`  Returned rank_math_canonical_url: ${returnedMeta.rank_math_canonical_url ?? "(not in response)"}`);
  console.log(`  Returned rank_math_robots:        ${JSON.stringify(returnedMeta.rank_math_robots ?? "(not in response)")}`);

  // Wait for cache to clear
  await new Promise(r => setTimeout(r, 2500));

  // Verify live
  const { html } = await fetchHtml("/xe-hut-be-phot-quang-ninh-2026/");
  const canonical = html.match(/<link rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? "(none)";
  const robots    = html.match(/<meta name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? "(none)";

  console.log(`\nLive canonical: ${canonical}`);
  console.log(`Live robots:    ${robots}`);

  const canonOk  = canonical === PRIMARY_URL || canonical.replace(/\/$/, "") === PRIMARY_URL.replace(/\/$/, "");
  const noindexOk = robots.toLowerCase().includes("noindex");

  console.log(`\n  canonical → ${canonOk ? "✓ OK" : "✗ WRONG"}`);
  console.log(`  noindex   → ${noindexOk ? "✓ OK" : "✗ WRONG"}`);

  if (!canonOk || !noindexOk) {
    console.log("\n⚠ REST meta may need register_meta() in WP. Trying Rank Math updateMeta as backup...");

    // Backup: Rank Math updateMeta for canonical
    if (!canonOk) {
      const rmC = await wpPost("/rankmath/v1/updateMeta", auth, {
        objectType: "post", objectID: POST_ID,
        meta: { rank_math_canonical_url: PRIMARY_URL },
      });
      console.log(`  RM canonical: ${rmC.status} ${JSON.stringify(rmC.data).slice(0, 80)}`);
    }

    // Backup: Rank Math updateMeta for robots
    if (!noindexOk) {
      const rmR = await wpPost("/rankmath/v1/updateMeta", auth, {
        objectType: "post", objectID: POST_ID,
        meta: { rank_math_robots: ["noindex"] },
      });
      console.log(`  RM robots:    ${rmR.status} ${JSON.stringify(rmR.data).slice(0, 80)}`);
    }

    // Wait + re-verify
    await new Promise(r => setTimeout(r, 2000));
    const { html: html2 } = await fetchHtml("/xe-hut-be-phot-quang-ninh-2026/");
    const c2 = html2.match(/<link rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? "(none)";
    const r2 = html2.match(/<meta name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? "(none)";
    console.log(`\nRe-verify canonical: ${c2}`);
    console.log(`Re-verify robots:    ${r2}`);
  }

  // Log
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);
  appendFileSync(CSV_PATH,
    `\n${TODAY},${TIME},HBP-CANONICAL-NOINDEX-FINAL-${TODAY},seo_fix,canonical+noindex post 2554,https://thongtaccongquangninh.com/xe-hut-be-phot-quang-ninh-2026/,post-2554-canonical+noindex,${canonOk && noindexOk ? "done" : "partial"},medium,,,,,WP REST meta rank_math_canonical_url+rank_math_robots post 2554,tools/set_canonical_and_noindex_2554.mjs,,Verify GSC Excluded next 7 days,canonical=${canonical} robots=${robots},,,,,,`,
    "utf8"
  );
  console.log("\nLogged to SEO_PROGRESS.csv");
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
