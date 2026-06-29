/**
 * Remove published draft notes from post 2554 (xe-hut-be-phot-quang-ninh).
 * Removes: Gợi ý ảnh SEO, Internal links, Checklist Rank Math, Điểm ước tính.
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";

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

function wpReq(method, path, bodyObj) {
  return new Promise((resolve, reject) => {
    const b = bodyObj ? Buffer.from(JSON.stringify(bodyObj), "utf8") : null;
    const headers = { Host: WP_HOST, Authorization: auth };
    if (b) { headers["Content-Type"] = "application/json"; headers["Content-Length"] = b.length; }
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path, method, headers, rejectUnauthorized: false };
    const r = https.request(opts, resp => { let d = ""; resp.on("data", c => d += c); resp.on("end", () => { try { resolve({ s: resp.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: resp.statusCode, d }); } }); });
    r.on("error", reject); r.setTimeout(30000, () => r.destroy(new Error("t")));
    if (b) r.write(b); r.end();
  });
}

function countVisibleWords(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

// Fetch raw content
const r = await wpReq("GET", "/wp-json/wp/v2/posts/2554?context=edit");
const raw = r?.d?.content?.raw ?? "";
const rendered = r?.d?.content?.rendered ?? "";
console.log("Content visible before:", countVisibleWords(rendered), "words");

// Find draft section start
const DRAFT_MARKERS = ["<p><strong>Gợi ý ảnh SEO", "Gợi ý ảnh SEO"];
let draftStart = -1;
for (const m of DRAFT_MARKERS) {
  const i = raw.indexOf(m);
  if (i > -1 && (draftStart === -1 || i < draftStart)) draftStart = i;
}

if (draftStart === -1) {
  console.log("No draft markers found. Exit.");
  process.exit(0);
}

// Draft ends just before the first <script type="application/ld+json"> after the draft start
// OR before <p>Tác giả: (whichever comes first after draftStart)
const jsonLdIdx = raw.indexOf('<script type="application/ld+json">', draftStart);
const authorIdx = raw.indexOf('<p>Tác giả:', draftStart);
const possibleEnds = [jsonLdIdx, authorIdx].filter(i => i > draftStart);
const draftEnd = possibleEnds.length > 0 ? Math.min(...possibleEnds) : raw.length;

const removed = raw.slice(draftStart, draftEnd);
const removedWords = countVisibleWords(removed);
console.log(`Removing ${removedWords} words (${removed.length} chars):`);
console.log("Removed starts with:", removed.slice(0, 100).replace(/\n/g, ' '));
console.log("Removed ends with:", removed.slice(-100).replace(/\n/g, ' '));

const newRaw = raw.slice(0, draftStart) + raw.slice(draftEnd);
console.log("\nNew raw length:", newRaw.length, "(was:", raw.length, ")");

// Update post
const upd = await wpReq("POST", "/wp-json/wp/v2/posts/2554", { content: newRaw });
console.log("Update status:", upd.s);
if (upd.s !== 200) {
  console.error("Update failed:", JSON.stringify(upd.d).slice(0, 200));
  process.exit(1);
}

// Verify new content
await new Promise(r => setTimeout(r, 2000));
const check = await wpReq("GET", "/wp-json/wp/v2/posts/2554?context=edit");
const newRendered = check?.d?.content?.rendered ?? "";
const newWords = countVisibleWords(newRendered);
console.log("Content visible after:", newWords, "words");

// CSV log
const TODAY = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0, 5);
appendFileSync(CSV_PATH,
  `\n${TODAY},${TIME},FIX-DRAFT-NOTES-2554-${TODAY},content_fix,Xoa ${removedWords} tu ghi chu noi bo (Go y anh SEO + Internal links + Checklist) tu post 2554 xe-hut-be-phot-quang-ninh,https://thongtaccongquangninh.com/xe-hut-be-phot-quang-ninh/,,done,high,,,,,Draft notes bi publish cho user; content visible: 3273 → ${newWords}; full page ~${3845 - removedWords},wp-json/wp/v2/posts/2554,,Re-run audit verify WORD_TOO_LONG giam; kiem tra cac post khac co draft notes tuong tu,,,,,,`,
  "utf8"
);
console.log("✓ Done. CSV logged.");
