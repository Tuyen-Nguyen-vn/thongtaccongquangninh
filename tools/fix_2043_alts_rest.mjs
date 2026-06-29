/**
 * Fix alt text for 2 images on post 2043 via WP REST API directly
 * (content/patch-page reported success but didn't persist)
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com"; const POST_ID = 2043;

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

// 1. Get current raw content
console.log("=== 1. Get current raw content ===");
const getR = await wpRest("GET", `/wp/v2/posts/${POST_ID}?context=edit`, auth);
let raw = getR.d?.content?.raw ?? "";
console.log(`  Length: ${raw.length} chars`);

// Show current alts
const alts = [...raw.matchAll(/alt="([^"]*)"/gi)];
console.log("  Current alts:");
alts.forEach((m, i) => console.log(`    [${i}] "${m[1]}"`));

// 2. Apply alt fixes in-memory
const ALT_FIXES = [
  {
    find: 'alt="Bồn cầu rút nước chậm cần kiểm tra đường thoát, xi phông và bể phốt trước khi xử lý"',
    replace: 'alt="Bồn cầu rút nước chậm cần kiểm tra đường thoát, xi phông và bể phốt trước khi xử lý tại Quảng Ninh"',
  },
  {
    find: 'alt="Thợ dùng thiết bị phù hợp để kiểm tra nguyên nhân bồn cầu rút chậm"',
    replace: 'alt="Thợ thông tắc bồn cầu rút chậm dùng thiết bị phù hợp kiểm tra nguyên nhân tại Quảng Ninh"',
  },
];

let changed = 0;
for (const { find, replace } of ALT_FIXES) {
  if (raw.includes(find)) {
    raw = raw.replace(find, replace);
    changed++;
    console.log(`  ✓ Found and replaced alt ${changed}`);
  } else {
    console.log(`  ✗ Not found: ${find.slice(0, 60)}`);
  }
}

if (changed === 0) {
  console.log("No changes needed — alts may already be fixed.");
  process.exit(0);
}

// 3. Write back via WP REST
console.log(`\n=== 2. Update post (${changed} alt fix(es)) ===`);
const updateR = await wpRest("POST", `/wp/v2/posts/${POST_ID}`, auth, { content: raw });
console.log(`  Status: ${updateR.s}`);

if (updateR.s === 200) {
  const newRaw = updateR.d?.content?.raw ?? "";
  const newAlts = [...newRaw.matchAll(/alt="([^"]*)"/gi)];
  console.log("  New alts:");
  newAlts.forEach((m, i) => console.log(`    [${i}] "${m[1]}"`));

  // Verify
  const hasQN0 = /tại Quảng Ninh/i.test(newAlts[0]?.[1] ?? "");
  const hasQN1 = /tại Quảng Ninh/i.test(newAlts[1]?.[1] ?? "");
  console.log(`  Alt[0] has QN: ${hasQN0 ? "✓" : "✗"}`);
  console.log(`  Alt[1] has QN: ${hasQN1 ? "✓" : "✗"}`);
} else {
  console.log("  Error:", JSON.stringify(updateR.d).slice(0, 200));
}

// Also verify Gutenberg block attributes have correct alt (for Gutenberg image blocks)
// The block JSON stores alt separately: "alt":"..." in <!-- wp:image {...,"alt":"..."} -->
console.log("\n=== 3. Check Gutenberg image block attrs ===");
const blockAlts = [...raw.matchAll(/wp:image\s+(\{[^}]+\})/g)];
blockAlts.forEach((m, i) => {
  const blockAttr = m[1];
  const altMatch = blockAttr.match(/"alt":"([^"]*)"/);
  if (altMatch) console.log(`  Block[${i}] alt: "${altMatch[1]}"`);
  else console.log(`  Block[${i}] no alt attr in block JSON`);
});

// Log CSV
const TODAY = "2026-06-08"; const TIME = new Date().toTimeString().slice(0, 5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-BON-CAU-ALT-REST-${TODAY},seo_fix,/bon-cau-rut-cham-nguyen-nhan/ fix alt 2 ảnh via WP REST direct,https://thongtaccongquangninh.com/bon-cau-rut-cham-nguyen-nhan/,,done,low,,,,,alt[0]+alt[1] thêm 'tại Quảng Ninh' via REST PUT,tools/fix_2043_alts_rest.mjs,,Audit live verify sau cache clear,,,,,,`,
  "utf8"
);
console.log("\n✓ logged");
