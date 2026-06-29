/**
 * Purge WP Rocket cache cho danh sách URLs.
 * Dùng WP REST API của wp-rocket (nếu có) hoặc MCP adapter.
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) {
  const e = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return e;
}
const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");

// Try WP Rocket purge endpoint
async function purgeUrl(url) {
  return new Promise((res, rej) => {
    const body = Buffer.from(JSON.stringify({ url }));
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/wp-json/wp-rocket/v1/clear-cache", method: "POST", headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json", "Content-Length": body.length }, rejectUnauthorized: false };
    const r = https.request(opts, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => { try { res({ s: resp.statusCode, d: JSON.parse(d) }); } catch { res({ s: resp.statusCode, d }); } }); });
    r.on("error", rej); r.setTimeout(15000, () => r.destroy()); r.write(body); r.end();
  });
}

// Xác nhận word count với cache-buster
async function checkWords(slug) {
  return new Promise((res, rej) => {
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path: `/${slug}/?nowprocket=1&t=${Date.now()}`, method: "GET", headers: { Host: WP_HOST, "User-Agent": "wordcount/1", "Accept-Encoding": "identity" }, rejectUnauthorized: false };
    const r = https.request(opts, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => {
        const visible = d.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
        // Extract main content
        const mainMatch = visible.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) || visible.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
        const content = mainMatch ? mainMatch[1] : visible;
        const words = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
        res(words);
      });
    });
    r.on("error", rej); r.setTimeout(20000, () => r.destroy()); r.end();
  });
}

const URLS = [
  { slug: "thong-tac-cong-tuan-chau", fullUrl: "https://thongtaccongquangninh.com/thong-tac-cong-tuan-chau/" },
  { slug: "xe-hut-be-phot-quang-ninh", fullUrl: "https://thongtaccongquangninh.com/xe-hut-be-phot-quang-ninh/" },
];

for (const u of URLS) {
  console.log(`\n=== ${u.slug} ===`);

  // Try purge
  const purge = await purgeUrl(u.fullUrl);
  console.log("Purge status:", purge.s, JSON.stringify(purge.d).slice(0, 100));

  // Check word count bypassing cache
  await new Promise(r => setTimeout(r, 1500));
  const words = await checkWords(u.slug);
  console.log(`Word count (nocache): ${words} ${words <= 3500 ? "✓ PASS" : "✗ WARN"}`);
}
