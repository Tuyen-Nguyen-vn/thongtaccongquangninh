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

const r = await new Promise((res, rej) => {
  const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/wp-json/wp/v2/posts/2554?context=edit", method: "GET", headers: { Host: WP_HOST, Authorization: auth }, rejectUnauthorized: false };
  const req = https.request(opts, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => res(JSON.parse(d))); });
  req.on("error", rej); req.setTimeout(20000, () => req.destroy()); req.end();
});

const raw = r?.content?.raw ?? "";

// Find FAQ section — everything between H2 FAQ heading and end/next H2
const faqMatch = raw.match(/<h2>[^<]*[Cc][aâ]u H[oỏ]i[^<]*<\/h2>([\s\S]*?)(?=<h2|$)/i);
const faqSection = faqMatch ? faqMatch[0] : "";

// Strip scripts from FAQ to see only visible content
const faqVisible = faqSection
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '[JSON-LD-removed]')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ').trim();

console.log("Full FAQ visible text:");
console.log(faqVisible);
console.log("\nFAQ section (HTML, first 3000 chars):");
console.log(faqSection.slice(0, 3000));
