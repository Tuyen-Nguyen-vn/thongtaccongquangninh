/**
 * Fix TITLE_SHORT: update Rank Math title for 3 pages via REST API
 * Target: >= 60 chars, <= 70 chars, no keyword stuffing
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

// Current titles (from audit: 57, 47, 53 chars) → need ≥ 60 chars
// Format: "[Dịch vụ] [Địa điểm] [năm/USP] | [Brand tắt]"
const FIXES = [
  {
    id: 380, type: "pages", slug: "thong-tac-cong-chung-cu-ha-long",
    title: "Thông Tắc Cống Chung Cư Hạ Long 24/7 – Không Đục Phá, Có Mặt Nhanh",
  },
  {
    id: 384, type: "pages", slug: "thong-tac-cong-ngo-nho-ha-long",
    title: "Thông Tắc Cống Ngõ Nhỏ Hạ Long – Xe Máy Vào Tận Ngõ Sâu 24/7",
  },
  {
    id: 383, type: "pages", slug: "thong-tac-cong-nha-hang-ha-long",
    title: "Thông Tắc Cống Nhà Hàng Hạ Long 24/7 – Không Gián Đoạn Kinh Doanh",
  },
];

// Validate lengths before applying
console.log("=== Kiểm tra title (cần 60–70 chars) ===");
let errors = 0;
for(const {slug, title} of FIXES){
  const len = [...title].length;
  const ok = len >= 60 && len <= 70;
  console.log(`  ${ok?"✓":"⚠"} ${slug}: len=${len} "${title}"`);
  if(!ok) errors++;
}
if(errors > 0){ console.log(`\n⚠ ${errors} title ngoài khoảng — dừng`); process.exit(1); }
console.log();

for(const {id, type, slug, title} of FIXES){
  // Fetch current title first
  const cur = await wpReq("GET", `/wp-json/wp/v2/${type}/${id}?_fields=id,slug,meta&context=edit`);
  const curTitle = cur?.meta?.rank_math_title || "";
  console.log(`${slug}: current rank_math_title="${curTitle}"`);

  // Update rank_math_title via meta
  const res = await wpReq("POST", `/wp-json/wp/v2/${type}/${id}`, {
    meta: { rank_math_title: title }
  });
  if(res?.id) console.log(`  ✓ updated: "${title}" (${[...title].length} chars)`);
  else console.log(`  ✗ ${JSON.stringify(res).slice(0,120)}`);
}

const TODAY="2026-06-10";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-TITLE-SHORT-${TODAY},seo_fix,TITLE_SHORT — chung-cu + ngo-nho + nha-hang (3 pages),https://thongtaccongquangninh.com/,,done,medium,,,,,expand title to 60-70 chars,tools/fix_title_short.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
