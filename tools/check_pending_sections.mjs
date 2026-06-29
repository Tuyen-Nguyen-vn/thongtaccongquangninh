/**
 * Check all long pages for PENDING_IMAGE_SEO content that shouldn't be published.
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

function wpGet(type, id) {
  const base = type === "post" ? "posts" : "pages";
  return new Promise((res, rej) => {
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path: `/wp-json/wp/v2/${base}/${id}?context=edit`, method: "GET", headers: { Host: WP_HOST, Authorization: auth }, rejectUnauthorized: false };
    const r = https.request(opts, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => res(JSON.parse(d))); });
    r.on("error", rej); r.setTimeout(20000, () => r.destroy()); r.end();
  });
}

function countVisibleWords(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ').trim()
    .split(' ').filter(Boolean).length;
}

const PAGES = [
  { id: 2554, slug: "xe-hut-be-phot-quang-ninh", type: "post", reported: 3845 },
  { id: 384,  slug: "thong-tac-cong-ngo-nho-ha-long", type: "page", reported: 3555 },
  { id: 2417, slug: "thong-tac-bon-cau-khach-san-quang-ninh", type: "post", reported: 3553 },
  { id: 2449, slug: "gia-hut-be-phot-quang-ninh", type: "post", reported: 3539 },
  { id: 2052, slug: "hut-be-phot-tien-yen", type: "post", reported: 3534 },
  { id: 436,  slug: "hut-be-phot-bai-chay", type: "page", reported: 3525 },
  { id: 2049, slug: "hut-be-phot-co-to", type: "post", reported: 3518 },
  { id: 993,  slug: "thong-tac-cong-tuan-chau", type: "page", reported: 3504 },
];

for (const pg of PAGES) {
  const r = await wpGet(pg.type, pg.id);
  const raw = r?.content?.raw ?? "";
  const rendered = r?.content?.rendered ?? "";
  const visWords = countVisibleWords(rendered);

  const hasPending = raw.includes("PENDING_IMAGE_SEO");
  const pendingIdx = raw.indexOf("PENDING_IMAGE_SEO");

  console.log(`\n${pg.slug}:`);
  console.log(`  Reported: ${pg.reported} | Content visible: ${visWords} | Chrome: ${pg.reported - visWords}`);
  console.log(`  PENDING_IMAGE_SEO: ${hasPending ? "YES ⚠" : "no"}`);

  if (hasPending) {
    // Find extent of pending section
    const h2Start = raw.lastIndexOf("<h2", pendingIdx);
    const h2End = raw.indexOf("</h2>", pendingIdx);
    const sectionEnd = raw.indexOf("<h2", pendingIdx + 10);
    const sectionHtml = raw.slice(h2Start, sectionEnd > -1 ? sectionEnd : raw.indexOf("<script", pendingIdx));
    const sectionWords = countVisibleWords(sectionHtml);
    console.log(`  PENDING section ~${sectionWords} words (chars ${h2Start}–${sectionEnd > -1 ? sectionEnd : "end"})`);
    console.log(`  Context: "${sectionHtml.slice(0, 200).replace(/\n/g, ' ')}"`);
  }
}
