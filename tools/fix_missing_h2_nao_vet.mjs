/**
 * Fix MISSING_H2:Nguyên nhân cho page nao-vet-ho-ga-quang-ninh (id=38)
 * Đổi H2[1] "Hố ga đầy do đâu — đặc thù riêng của Quảng Ninh"
 *       → "Nguyên Nhân Hố Ga Đầy — Đặc Thù Riêng Của Quảng Ninh"
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})});r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

const PAGE_ID = 38;

// Fetch current content
const get = await wpReq("GET", `/wp-json/wp/v2/pages/${PAGE_ID}?context=edit&_fields=id,content`);
if(get.s !== 200){console.log("GET failed:",get.s,typeof get.d==="string"?get.d.slice(0,100):JSON.stringify(get.d).slice(0,100));process.exit(1);}

let raw = get.d.content.raw;

// Check old H2 exists
const OLD_H2 = "Hố ga đầy do đâu — đặc thù riêng của Quảng Ninh";
const NEW_H2 = "Nguyên Nhân Hố Ga Đầy — Đặc Thù Riêng Của Quảng Ninh";

if(!raw.includes(OLD_H2)){
  console.log(`⚠ Không tìm thấy: "${OLD_H2}"`);
  // Check if already fixed
  if(raw.includes(NEW_H2)){console.log("✓ Đã có Nguyên Nhân rồi");process.exit(0);}
  process.exit(1);
}

const newRaw = raw.replace(OLD_H2, NEW_H2);

// Verify exactly 1 replacement
const countOld = (raw.match(new RegExp(OLD_H2.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"))||[]).length;
console.log(`Found "${OLD_H2}" x${countOld} — replacing...`);

// PATCH
const patch = await wpReq("POST", `/wp-json/wp/v2/pages/${PAGE_ID}`, { content: newRaw });
if(patch.s!==200){console.log("PATCH failed:",patch.s,JSON.stringify(patch.d).slice(0,200));process.exit(1);}
console.log("✓ Patched page 38");

// Verify H2 in new content
const h2s=(newRaw.match(/<h2[^>]*>.*?<\/h2>/gi)||[]).map(h=>h.replace(/<[^>]+>/g,"").slice(0,80));
const hasNguyen=h2s.some(h=>/nguyên nhân/i.test(h));
console.log("Has Nguyên nhân H2:", hasNguyen ? "✓ YES" : "✗ NO");
h2s.forEach((h,i)=>console.log(`  [${i}] ${h}`));

// Log
const TODAY="2026-06-09"; const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-MISSING-H2-NAO-VET-${TODAY},seo_fix,MISSING_H2:Nguyên nhân on nao-vet-ho-ga-quang-ninh (page 38),https://thongtaccongquangninh.com/nao-vet-ho-ga-quang-ninh/,,done,medium,,,,,Đổi H2[1] thêm "Nguyên Nhân",tools/fix_missing_h2_nao_vet.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
