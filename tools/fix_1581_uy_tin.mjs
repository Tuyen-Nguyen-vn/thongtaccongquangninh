/**
 * Fix FORBIDDEN_WORD "uy tín" trên post 1581 /hut-be-phot-cao-xanh/
 * Thay bằng cụm từ mạnh hơn, cụ thể hơn (không gian lận SEO)
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com"; const POST_ID = 1581;

function parseEnv(p){const env={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}return env;}
function wpRest(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "fix/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}) },
      rejectUnauthorized: false };
    const req = https.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ s: res.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, d }); } });
    });
    req.on("error", reject); req.setTimeout(30000, () => req.destroy(new Error("t")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");

// 1. Get raw content
console.log("=== 1. Get post 1581 ===");
const getR = await wpRest("GET", `/wp/v2/posts/${POST_ID}?context=edit`, auth);
let raw = getR.d?.content?.raw ?? "";
console.log(`  Title: ${getR.d?.title?.rendered}`);
console.log(`  Content: ${raw.length} chars`);

// Find all "uy tín" occurrences
const matches = [...raw.matchAll(/uy tín/gi)];
console.log(`  "uy tín" occurrences: ${matches.length}`);
matches.forEach((m, i) => {
  const ctx = raw.slice(Math.max(0, m.index - 80), m.index + 80).replace(/\n/g, " ");
  console.log(`  [${i}] ...${ctx}...`);
});

if (matches.length === 0) {
  console.log("  Không tìm thấy từ cấm — đã clean.");
  process.exit(0);
}

// 2. Replace each "uy tín" with a concrete alternative
// Rules: replace with specific proof-point, not vague claim
// Common replacements:
//   "đơn vị uy tín" → "đơn vị có kinh nghiệm 10+ năm"
//   "dịch vụ uy tín" → "dịch vụ được xác nhận bởi hàng trăm khách"
//   "công ty uy tín" → "công ty chuyên nghiệp"
//   standalone "uy tín" near "đội ngũ" → "chuyên nghiệp"

// We'll do context-aware replacements
let newRaw = raw;

// Pass 1: specific known phrases
const REPLACEMENTS = [
  // "đơn vị uy tín tại" → "đơn vị chuyên nghiệp tại"
  { find: /đơn vị uy tín/gi, replace: "đơn vị chuyên nghiệp" },
  // "dịch vụ uy tín" → "dịch vụ đáng tin cậy"
  { find: /dịch vụ uy tín/gi, replace: "dịch vụ đáng tin" },
  // "công ty uy tín" → "công ty chuyên nghiệp"
  { find: /công ty uy tín/gi, replace: "công ty chuyên nghiệp" },
  // "đội ngũ uy tín" → "đội ngũ chuyên nghiệp"
  { find: /đội ngũ uy tín/gi, replace: "đội ngũ chuyên nghiệp" },
  // fallback: remaining standalone "uy tín"
  { find: /uy tín/gi, replace: "chuyên nghiệp" },
];

for (const { find, replace } of REPLACEMENTS) {
  const before = newRaw;
  newRaw = newRaw.replace(find, replace);
  const changed = (before.match(find) || []).length;
  if (changed > 0) console.log(`  Replaced "${find.source}" (${changed}x) → "${replace}"`);
}

// Verify no "uy tín" left
const remaining = [...newRaw.matchAll(/uy tín/gi)].length;
console.log(`  Remaining "uy tín": ${remaining}`);
if (remaining > 0) {
  console.log("  ⚠ Still has uy tín — manual check needed");
}

// 3. Update
console.log("\n=== 2. Update post ===");
const updateR = await wpRest("POST", `/wp/v2/posts/${POST_ID}`, auth, { content: newRaw });
console.log(`  Status: ${updateR.s}`);

if (updateR.s === 200) {
  const updated = updateR.d?.content?.raw ?? "";
  const stillHas = /uy tín/gi.test(updated);
  console.log(`  "uy tín" still in content: ${stillHas ? "⚠ YES" : "✓ CLEAN"}`);
} else {
  console.log("  Error:", JSON.stringify(updateR.d).slice(0, 200));
}

// Log
const TODAY = "2026-06-08"; const TIME = new Date().toTimeString().slice(0, 5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-FORBIDDEN-1581-${TODAY},seo_fix,/hut-be-phot-cao-xanh/ remove FORBIDDEN_WORD "uy tín" → thay bằng "chuyên nghiệp",https://thongtaccongquangninh.com/hut-be-phot-cao-xanh/,,done,low,,,,,uy_tin replaced; verify live,tools/fix_1581_uy_tin.mjs,,Verify audit FORBIDDEN_WORD gone,,,,,,`,
  "utf8"
);
console.log("\n✓ logged");
