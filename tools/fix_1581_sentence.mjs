/**
 * Fix awkward "chuyên nghiệp kinh doanh" → "hình ảnh kinh doanh" trên post 1581
 * Original: "uy tín kinh doanh" (business reputation) — cần dùng từ tự nhiên hơn
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

// Get current
const getR = await wpRest("GET", `/wp/v2/posts/${POST_ID}?context=edit`, auth);
let raw = getR.d?.content?.raw ?? "";

// Show context around the bad replacement
const badIdx = raw.indexOf("chuyên nghiệp kinh doanh");
if (badIdx > -1) {
  console.log("Bad phrase context:");
  console.log(raw.slice(Math.max(0, badIdx - 100), badIdx + 100).replace(/\n/g, " "));

  // Fix: "chuyên nghiệp kinh doanh" → "hình ảnh kinh doanh"
  // Full sentence context: "tránh ảnh hưởng khách thuê và chuyên nghiệp kinh doanh"
  // → "tránh ảnh hưởng khách thuê và hình ảnh kinh doanh"
  const FIND = "chuyên nghiệp kinh doanh";
  const REPLACE = "hình ảnh kinh doanh";
  raw = raw.replace(FIND, REPLACE);
  console.log(`\nFixed: "${FIND}" → "${REPLACE}"`);

  const updateR = await wpRest("POST", `/wp/v2/posts/${POST_ID}`, auth, { content: raw });
  console.log(`Status: ${updateR.s}`);
  if (updateR.s === 200) {
    const updated = updateR.d?.content?.raw ?? "";
    console.log("Has uy tín:", /uy tín/i.test(updated) ? "⚠ YES" : "✓ CLEAN");
    console.log("Has hình ảnh kinh doanh:", updated.includes("hình ảnh kinh doanh") ? "✓" : "✗");
  }
} else {
  console.log("'chuyên nghiệp kinh doanh' not found — checking actual content...");
  const idxKD = raw.indexOf("kinh doanh");
  if (idxKD > -1) {
    console.log("'kinh doanh' context:", raw.slice(Math.max(0,idxKD-100), idxKD+80).replace(/\n/g," "));
  }
  console.log("Has uy tín:", /uy tín/i.test(raw) ? "⚠ YES" : "✓ CLEAN");
}

const TODAY = "2026-06-08"; const TIME = new Date().toTimeString().slice(0, 5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-FORBIDDEN-1581-SENTENCE-${TODAY},seo_fix,/hut-be-phot-cao-xanh/ fix "chuyên nghiệp kinh doanh" → "hình ảnh kinh doanh",,,done,low,,,,,sentence naturalness fix,tools/fix_1581_sentence.mjs,,,,,,,,`,
  "utf8"
);
console.log("✓ logged");
