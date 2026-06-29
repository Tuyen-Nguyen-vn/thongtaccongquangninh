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

function wpGet(type, id) {
  const base = type === "post" ? "posts" : "pages";
  return new Promise((res, rej) => {
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path: `/wp-json/wp/v2/${base}/${id}?context=edit`, method: "GET", headers: { Host: WP_HOST, Authorization: auth }, rejectUnauthorized: false };
    const r = https.request(opts, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => res(JSON.parse(d))); });
    r.on("error", rej); r.setTimeout(15000, () => r.destroy()); r.end();
  });
}

function countVis(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

const p993 = await wpGet("page", 993);
const raw993 = p993?.content?.raw ?? "";
const vis993 = countVis(p993?.content?.rendered ?? "");
console.log("Page 993 (tuan-chau):");
console.log("  PENDING_IMAGE_SEO:", raw993.includes("PENDING_IMAGE_SEO") ? "STILL THERE ✗" : "REMOVED ✓");
console.log("  Content visible words:", vis993);

const p2554 = await wpGet("post", 2554);
const raw2554 = p2554?.content?.raw ?? "";
const vis2554 = countVis(p2554?.content?.rendered ?? "");
console.log("\nPost 2554 (xe-hut-be-phot):");
console.log("  Gợi ý ảnh SEO:", raw2554.includes("Gợi ý ảnh SEO") ? "STILL THERE ✗" : "REMOVED ✓");
console.log("  Checklist Rank Math:", raw2554.includes("Checklist Rank Math") ? "STILL THERE ✗" : "REMOVED ✓");
console.log("  Content visible words:", vis2554);
