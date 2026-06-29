/**
 * Fix META_SHORT cache issue: set rank_math_description directly in DB via REST API
 * for 6 pages still showing old cached meta despite plugin being deployed
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

// Same descriptions as in the plugin (150-160 chars, validated)
const FIXES = [
  { id: 2589, type: "posts", slug: "dau-hieu-be-phot-bi-day-2026",
    desc: "Dấu hiệu bể phốt bị đầy không nên bỏ qua: nước rút chậm, mùi hôi lan ra sàn, bồn cầu trào ngược. Xử lý ngay tránh hỏng hệ thống. Gọi 0963.953.533 để hỗ trợ." },
  { id: 26,   type: "pages", slug: "hut-be-phot-quang-ninh",
    desc: "Hút bể phốt Quảng Ninh 24/7 – xe bồn đến nhanh 15 phút, hút sạch không mùi, không đục phá bừa bãi. Phục vụ nhà dân, nhà hàng, công trình. Gọi 0963.953.533." },
  { id: 386,  type: "pages", slug: "nguyen-nhan-cong-tac-thuong-xuyen-ha-long",
    desc: "Tìm hiểu nguyên nhân khiến cống tắc thường xuyên tại Hạ Long: rác sinh hoạt, dầu mỡ, bùn cát mùa mưa. Cách phòng tránh và khi nào cần gọi thợ. 0963.953.533." },
  { id: 380,  type: "pages", slug: "thong-tac-cong-chung-cu-ha-long",
    desc: "Thông tắc cống chung cư Hạ Long 24/7 – xử lý tắc ống đứng, ống ngang, hầm thoát tòa nhà. Không đục tường, có mặt nhanh, báo giá rõ ràng. Gọi 0963.953.533." },
  { id: 384,  type: "pages", slug: "thong-tac-cong-ngo-nho-ha-long",
    desc: "Thông tắc cống ngõ nhỏ Hạ Long 24/7 – xe máy vào tận ngõ sâu 50cm, thợ xử lý tắc rãnh thoát nước và ống nhựa hẹp, không đục phá gạch lát sàn. Gọi 0963.953.533." },
  { id: 35,   type: "pages", slug: "thong-tac-cong-quang-ninh",
    desc: "Thông tắc cống Quảng Ninh 24/7 – thông cống rãnh, thoát sàn, ống nhựa toàn tỉnh. Thợ có mặt 15 phút, máy chuyên dụng, báo giá minh bạch. Gọi 0963.953.533." },
];

for(const {id, type, slug, desc} of FIXES){
  const len = [...desc].length;
  if(len < 150 || len > 160){ console.log(`⚠ ${slug}: len=${len} out of range`); continue; }
  const res = await wpReq("POST", `/wp-json/wp/v2/${type}/${id}`, {
    meta: { rank_math_description: desc }
  });
  if(res?.id) console.log(`✓ ${slug}: rank_math_description set (${len} chars)`);
  else console.log(`✗ ${slug}: ${JSON.stringify(res).slice(0,120)}`);
}

const TODAY="2026-06-10";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-META-CACHE-${TODAY},seo_fix,META_SHORT cache bypass — set rank_math_description directly in DB for 6 pages,https://thongtaccongquangninh.com/,,done,medium,,,,,bypass WP cache for meta desc,tools/fix_meta_cache.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
