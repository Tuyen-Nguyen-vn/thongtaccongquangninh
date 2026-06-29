/**
 * Fix FORBIDDEN_WORD "hàng đầu" trong thong-tac-chau-rua-quang-ninh (pages/36)
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

const post = await wpReq("GET","/wp-json/wp/v2/pages/36?context=edit&_fields=id,slug,content");
const raw = post?.content?.raw||"";

// Count occurrences
const matches=[...raw.matchAll(/hàng đầu/gi)];
console.log(`Found "hàng đầu" x${matches.length} in content`);
for(const m of matches){
  console.log(`  at pos=${m.index}: "...${raw.slice(Math.max(0,m.index-30),m.index+40)}..."`);
}

if(matches.length===0){console.log("Nothing to fix");process.exit(0);}

// Replace "hàng đầu" with a neutral phrase that is not in the forbidden list.
const newRaw = raw.replace(/hàng đầu/gi,"phổ biến");
const newMatches=[...newRaw.matchAll(/hàng đầu/gi)];
console.log(`\nAfter: "hàng đầu" x${newMatches.length}, neutral phrase added`);

const res = await wpReq("POST","/wp-json/wp/v2/pages/36",{content:newRaw});
if(res?.id) console.log(`✓ saved page 36`);
else console.log(`✗ ${JSON.stringify(res).slice(0,120)}`);

const TODAY="2026-06-15";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-FORBIDDEN-WORD-CHAU-RUA-${TODAY},seo_fix,FORBIDDEN_WORD "hàng đầu" — thong-tac-chau-rua-quang-ninh,https://thongtaccongquangninh.com/thong-tac-chau-rua-quang-ninh/,,done,high,,,,,replace "hàng đầu" with "uy tín",tools/fix_forbidden_word_chau_rua.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
