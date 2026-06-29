/**
 * Touch post 2554 to bust LiteSpeed page cache, then verify noindex live.
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

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
        "User-Agent": "cache-bust/1.0",
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

  // Touch post — update modified timestamp to bust LiteSpeed cache
  console.log("Touching post 2554 to invalidate LiteSpeed cache...");
  const touch = await wpPost("/wp/v2/posts/2554", auth, {
    date: new Date().toISOString().slice(0, 19),
  });
  console.log(`  Touch status: ${touch.status}`);

  await new Promise(r => setTimeout(r, 2500));

  // Verify
  const { html } = await fetchHtml("/xe-hut-be-phot-quang-ninh-2026/");
  const robots   = html.match(/<meta name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? "(none)";
  const canonical = html.match(/<link rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? "(none)";
  console.log(`\nLive robots:    ${robots}`);
  console.log(`Live canonical: ${canonical}`);

  if (robots.toLowerCase().includes("noindex")) {
    console.log("✓ noindex confirmed live!");
  } else {
    console.log("✗ Still not noindex — may need 1Panel cache purge.");
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
