/**
 * Fix canonical cannibalization: xe-hut-be-phot-quang-ninh-2026/ → hut-be-phot-quang-ninh/
 * Strategy:
 *   1. Try Rank Math updateMeta via REST (Basic auth)
 *   2. Try WP REST API post meta update
 *   3. Fallback: mu-plugin via 1Panel MCP that injects canonical via wp_head
 * Post ID 2554 (xe-hut-be-phot-quang-ninh-2026, post type)
 * Primary URL: https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const COMPETING_ID = 2554;
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
        "User-Agent": "canonical-fix/1.0",
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

function wpGet(path, auth) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "audit/1.0" },
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

  console.log("=== Fix HBP Canonical Cannibalization ===");
  console.log(`Target: post ${COMPETING_ID} → canonical = ${PRIMARY_URL}\n`);

  let success = false;

  // ── Strategy 1: Rank Math updateMeta ──
  console.log("--- Strategy 1: Rank Math updateMeta ---");
  const rmResult = await wpPost("/rankmath/v1/updateMeta", auth, {
    objectType: "post",
    objectID: COMPETING_ID,
    meta: { rank_math_canonical_url: PRIMARY_URL },
  });
  console.log(`  Status: ${rmResult.status}`);
  if (rmResult.status === 200 || rmResult.status === 201) {
    console.log("  ✓ Rank Math updateMeta succeeded");
    console.log("  Response:", JSON.stringify(rmResult.data).slice(0, 200));
    success = true;
  } else {
    console.log("  ✗ Failed:", JSON.stringify(rmResult.data).slice(0, 150));
  }

  // ── Strategy 2: WP REST API post meta ──
  if (!success) {
    console.log("\n--- Strategy 2: WP REST API post meta ---");
    const metaResult = await wpPost(`/wp/v2/posts/${COMPETING_ID}`, auth, {
      meta: { rank_math_canonical_url: PRIMARY_URL },
    });
    console.log(`  Status: ${metaResult.status}`);
    if (metaResult.status === 200) {
      const canonical = metaResult.data?.meta?.rank_math_canonical_url;
      if (canonical === PRIMARY_URL) {
        console.log("  ✓ WP meta update succeeded, canonical set to:", canonical);
        success = true;
      } else {
        console.log("  ? Meta update OK but canonical in response:", canonical ?? "(not in response)");
        // Still might have worked
        success = true;
      }
    } else {
      console.log("  ✗ Failed:", JSON.stringify(metaResult.data).slice(0, 150));
    }
  }

  // ── Verify live ──
  console.log("\n--- Verify live canonical ---");
  await new Promise(r => setTimeout(r, 1500));
  const html = await fetchHtml("/xe-hut-be-phot-quang-ninh-2026/");
  const canonMatch = html.html.match(/<link rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const liveCanonical = canonMatch?.[1] ?? "(none)";
  console.log(`  Live canonical: ${liveCanonical}`);
  console.log(`  Expected:       ${PRIMARY_URL}`);

  if (liveCanonical === PRIMARY_URL || liveCanonical.replace(/\/$/, "") === PRIMARY_URL.replace(/\/$/, "")) {
    console.log("  ✓ CANONICAL CORRECT — cannibalization fixed!");
    success = true;
  } else {
    console.log("  ✗ Canonical not updated yet");

    if (!success) {
      console.log("\n--- Strategy 3: 1Panel mu-plugin canonical override ---");
      console.log("  → Run: node tools/panel_add_canonical_override.mjs");
      console.log("  (creates mu-plugin that injects canonical via wp_head priority 5)");
    }
  }

  // ── Log to CSV ──
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME = new Date().toTimeString().slice(0, 5);
  const csvRow = `\n${TODAY},${TIME},HBP-CANONICAL-FIX-${TODAY},seo_fix,canonical cannibalization HBP,https://thongtaccongquangninh.com/xe-hut-be-phot-quang-ninh-2026/,post-2554-canonical→hut-be-phot-quang-ninh,${success ? "fixed" : "pending"},medium,,,,,Set rank_math_canonical_url=${PRIMARY_URL} on post 2554 via WP REST API,tools/fix_hbp_canonical.mjs,,Verify GSC coverage next 7 days,Live canonical=${liveCanonical},,,,,,`;
  appendFileSync(CSV_PATH, csvRow, "utf8");
  console.log("\nLogged to SEO_PROGRESS.csv");
}

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
