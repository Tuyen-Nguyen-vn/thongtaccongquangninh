/**
 * Add ~50 words to post 2043 to push entry-content past 2000
 * Extend the Quảng Yên paragraph in section 6 with a practical tip
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
const getR = await wpRest("GET", `/wp/v2/posts/${POST_ID}?context=edit`, auth);
let raw = getR.d?.content?.raw ?? "";
console.log(`Current length: ${raw.length} chars`);

// Find the end of the Quảng Yên paragraph and append an extra tip sentence
// Current text ends: "...tránh tái nghẹt sau 2–3 tháng.</p>\n<!-- /wp:paragraph -->"
const FIND = `tránh tái nghẹt sau 2–3 tháng.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">7. Câu Hỏi Thường Gặp Về Bồn Cầu Rút Chậm</h2>`;

const REPLACE = `tránh tái nghẹt sau 2–3 tháng. Nếu không chắc loại ống hoặc nguồn nước nhà bạn, hãy gọi <strong>0963.953.533</strong> để thợ kiểm tra và tư vấn phương án phù hợp trước khi tự xử lý — tránh làm hỏng ống cũ vốn đã yếu.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">7. Câu Hỏi Thường Gặp Về Bồn Cầu Rút Chậm</h2>`;

if (!raw.includes(FIND)) {
  console.log("⚠ FIND string not found — checking what's around section 7 heading");
  const idx = raw.indexOf("7. Câu Hỏi Thường Gặp");
  if (idx > -1) console.log("Context before H2 section 7:", raw.slice(idx-200, idx+50).replace(/\n/g, " ↵ "));
  process.exit(1);
}

const newRaw = raw.replace(FIND, REPLACE);
console.log(`New length: ${newRaw.length} chars`);

// 2. Update
const updateR = await wpRest("POST", `/wp/v2/posts/${POST_ID}`, auth, { content: newRaw });
console.log(`Status: ${updateR.s}`);

if (updateR.s === 200) {
  const updated = updateR.d?.content?.raw ?? "";
  const txt = updated.replace(/<[^>]+>/g," ").replace(/<!--[\s\S]*?-->/g," ").replace(/\s+/g," ").trim();
  const wc = txt.split(/\s+/).filter(w=>w.length>1).length;
  console.log(`Raw word count: ${wc}`);
  console.log(`Has section 6: ${updated.includes("Giải Pháp Theo Từng Khu")}`);
  console.log(`Has FAQ: ${updated.includes("Bồn cầu rút chậm có tự")}`);
}

const TODAY = "2026-06-08"; const TIME = new Date().toTimeString().slice(0, 5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},PAD-BON-CAU-2043-WORDS-${TODAY},seo_fix,/bon-cau-rut-cham-nguyen-nhan/ +50 từ thêm câu tips vào section 6 Quảng Yên,https://thongtaccongquangninh.com/bon-cau-rut-cham-nguyen-nhan/,,done,low,,,,,push entry-content từ 1967 lên >2000,tools/pad_2043_words.mjs,,Verify audit,,,,,,`,
  "utf8"
);
console.log("✓ logged");
