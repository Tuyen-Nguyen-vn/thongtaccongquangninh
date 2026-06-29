/**
 * Fix NO_H1 cho bài thong-tac-cong-ha-long (id=296)
 * Xem đầu content → thêm H1 block Gutenberg nếu chưa có
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
const POST_ID = 296;

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function wpReq(method, path, body) {
  return new Promise((res,rej)=>{
    const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})});
    r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();
  });
}

// Lấy content hiện tại
const r = await wpReq("GET", `/wp-json/wp/v2/pages/${POST_ID}?context=edit&_fields=id,slug,title,content`);
if (r.s !== 200) { console.log("GET error:", r.s); process.exit(1); }

const raw = r.d.content.raw;
console.log(`id=${r.d.id} slug=${r.d.slug}`);
console.log(`Content length: ${raw.length} chars`);
console.log(`First 400 chars:\n${raw.slice(0,400)}\n`);

// Check H1 hiện tại
const h1Count = [...raw.matchAll(/<h1[\s>]/gi)].length;
console.log(`H1 count in raw: ${h1Count}`);

if (h1Count > 0) {
  console.log("✓ Đã có H1 trong content — không cần fix");
  process.exit(0);
}

// H1 text: match với WP title nhưng SEO-optimized
const H1_TEXT = "Thông Tắc Cống Hạ Long 24/7 – Có Mặt 15 Phút, Không Đục Phá";
console.log(`\nSẽ thêm H1: "${H1_TEXT}" (${[...H1_TEXT].length} chars)`);

// Build Gutenberg H1 block
const h1Block = `<!-- wp:heading {"level":1} -->
<h1 class="wp-block-heading">${H1_TEXT}</h1>
<!-- /wp:heading -->

`;

// Prepend vào đầu content
const newRaw = h1Block + raw;

// Kiểm tra: đảm bảo chỉ thêm H1 chứ không xóa gì
const oldH2Count = [...raw.matchAll(/<h2[\s>]/gi)].length;
const newH2Count = [...newRaw.matchAll(/<h2[\s>]/gi)].length;
const newH1Count = [...newRaw.matchAll(/<h1[\s>]/gi)].length;
console.log(`After: H1=${newH1Count} H2=${newH2Count} (was ${oldH2Count})`);

// POST
const pr = await wpReq("POST", `/wp-json/wp/v2/pages/${POST_ID}`, { content: newRaw });
console.log(`POST status: ${pr.s}`);
if (pr.s !== 200) { console.log("ERROR:", JSON.stringify(pr.d).slice(0,200)); process.exit(1); }

// Verify
const vr = await wpReq("GET", `/wp-json/wp/v2/pages/${POST_ID}?context=edit&_fields=content`);
const vRaw = vr.d?.content?.raw ?? "";
const vH1 = [...vRaw.matchAll(/<h1[\s>]/gi)].length;
const hasH1Text = vRaw.includes(H1_TEXT);
console.log(`Verify: H1 count=${vH1}, has correct text=${hasH1Text}`);
console.log(vH1===1 && hasH1Text ? "✓ FIXED" : "⚠ check needed");
