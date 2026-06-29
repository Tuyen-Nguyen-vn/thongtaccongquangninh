/**
 * Fix FORBIDDEN_WORD "uy tín" (accidentally introduced) in thong-tac-chau-rua (pages/36)
 * "Nguyên nhân uy tín là tóc..." → "Nguyên nhân phổ biến nhất là tóc..."
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

const FORBIDDEN = ['chuyên nghiệp','uy tín','hàng đầu','tận tâm','hy vọng bài viết hữu ích'];

const post = await wpReq("GET","/wp-json/wp/v2/pages/36?context=edit&_fields=id,slug,content");
const raw = post?.content?.raw||"";

// Find all forbidden words
for(const fw of FORBIDDEN){
  const matches=[...raw.matchAll(new RegExp(fw,'gi'))];
  if(matches.length>0){
    console.log(`"${fw}" x${matches.length}`);
    for(const m of matches) console.log(`  "...${raw.slice(Math.max(0,m.index-40),m.index+60)}..."`);
  }
}

// Fix: replace "uy tín" (the bad replacement) with "phổ biến nhất"
const newRaw = raw.replace(/uy tín/gi, "phổ biến nhất");

// Verify no forbidden words remain
let remaining=0;
for(const fw of FORBIDDEN){
  const n=[...newRaw.matchAll(new RegExp(fw,'gi'))].length;
  if(n>0){console.log(`⚠ Still has "${fw}" x${n}`);remaining+=n;}
}
if(remaining===0) console.log("\n✓ Không còn từ cấm");

const res = await wpReq("POST","/wp-json/wp/v2/pages/36",{content:newRaw});
if(res?.id) console.log(`✓ saved page 36`);
else console.log(`✗ ${JSON.stringify(res).slice(0,120)}`);

const TODAY="2026-06-16";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-FORBIDDEN2-CHAU-RUA-${TODAY},seo_fix,FORBIDDEN_WORD "uy tín" (bad replacement) — thong-tac-chau-rua,https://thongtaccongquangninh.com/thong-tac-chau-rua-quang-ninh/,,done,high,,,,,replace "uy tín" → "phổ biến nhất",tools/fix_forbidden2_chau_rua.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
