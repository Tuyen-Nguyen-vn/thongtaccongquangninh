/**
 * Fetch WP REST raw content và tìm sections dài
 * Usage: node get_raw_content.mjs <post|page> <id>
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

const [,, TYPE, ID] = process.argv;
const restBase = TYPE === "post" ? "posts" : "pages";

const r = await new Promise((res, rej) => {
  const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path: `/wp-json/wp/v2/${restBase}/${ID}?context=edit`, method: "GET", headers: { Host: WP_HOST, Authorization: auth }, rejectUnauthorized: false };
  const req = https.request(opts, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => res(JSON.parse(d))); });
  req.on("error", rej); req.setTimeout(20000, () => req.destroy()); req.end();
});

const raw = r?.content?.raw ?? "";
const rendered = r?.content?.rendered ?? "";
console.log("Raw length:", raw.length, "| Rendered length:", rendered.length);

// Count words in rendered (after stripping scripts and HTML)
const visible = rendered
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ').trim();
const visibleWords = visible.split(' ').filter(Boolean).length;
console.log("Visible word count from rendered:", visibleWords);

// Search for nghiem thu
if (raw.includes("nghiệm thu") || raw.includes("nghiem thu")) {
  const idx = raw.indexOf("nghiệm thu");
  console.log("\nFound 'nghiệm thu' in raw at:", idx);
  console.log(raw.slice(Math.max(0, idx - 100), idx + 200));
} else {
  console.log("\n'Trạng thái nghiệm thu' NOT in raw content");
}

// H2 sections in raw
const h2s = [...raw.matchAll(/##\s+(.+)|<h2[^>]*>([^<]+)<\/h2>/g)].map(m => m[1] || m[2]);
console.log("\nH2/## in raw:", h2s.length > 0 ? h2s : "(using blocks)");

// Show last 1500 chars of raw
console.log("\n--- Last 1500 chars of raw ---");
console.log(raw.slice(-1500));
