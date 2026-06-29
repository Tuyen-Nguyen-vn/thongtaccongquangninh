/**
 * Bỏ "2026" khỏi title 11 trang còn lại (2026 ở giữa hoặc cuối title)
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpGet(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();});}
function wpPost(type,id,body){return new Promise((res,rej)=>{const b=Buffer.from(JSON.stringify(body),"utf8");const o={hostname:SIP,port:443,servername:WPH,path:`/wp-json/wp/v2/${type}/${id}`,method:"POST",headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));r.write(b);r.end();});}

const PAGES=[
  {id:2787, type:"posts"}, // gia-thong-tac-cong-quang-ninh
  {id:2708, type:"posts"}, // hut-be-phot-khu-nha-tro-quang-ninh
  {id:2702, type:"posts"}, // hut-be-phot-khach-san-quang-ninh
  {id:2694, type:"posts"}, // hut-be-phot-cong-ty-quang-ninh
  {id:2554, type:"posts"}, // xe-hut-be-phot-quang-ninh
  {id:2559, type:"posts"}, // hut-ham-cau-quang-ninh
  {id:2357, type:"posts"}, // gia-thong-tac-bon-cau-quang-ninh
  {id:2044, type:"posts"}, // chu-ky-hut-be-phot
  {id:2043, type:"posts"}, // bon-cau-rut-cham-nguyen-nhan
  {id:217,  type:"posts"}, // bang-gia-hut-be-phot-quang-ninh
  {id:61,   type:"pages"}, // bang-gia
];

// Bỏ "2026" và dấu câu xung quanh (colon, dash, space, brackets)
function cleanTitle(t){
  return t
    .replace(/\s*[\[(\s]+2026[\])\s]*:\s*/g, ": ") // "2026:" ở giữa → bỏ 2026 giữ colon
    .replace(/\s*[\[(\s]+2026[\])\s]*/g, " ")       // "[2026]", "(2026)", " 2026 " → space
    .replace(/\s{2,}/g, " ")
    .replace(/\s*[:\-–|]\s*$/, "")                   // bỏ dấu câu lửng cuối
    .trim();
}

let changed=0, skipped=0;
for(const {id,type} of PAGES){
  const post=await wpGet(`/wp-json/wp/v2/${type}/${id}?_fields=id,slug,title`);
  if(!post?.id){console.log(`✗ id=${id} not found`);continue;}
  const raw=post.title?.rendered||post.title?.raw||"";
  const currentTitle=raw
    .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(n))
    .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"');
  const newTitle=cleanTitle(currentTitle);
  if(newTitle===currentTitle){
    console.log(`- id=${id}: không có 2026 — bỏ qua`);
    skipped++; continue;
  }
  const res=await wpPost(type,id,{title:newTitle});
  if(res?.id){
    console.log(`✓ id=${id} /${post.slug}/\n    "${currentTitle}"\n  → "${newTitle}"`);
    changed++;
  } else {
    console.log(`✗ id=${id}: ${JSON.stringify(res).slice(0,100)}`);
  }
}

console.log(`\nĐổi title: ${changed}/${PAGES.length} | Bỏ qua: ${skipped}`);
const TODAY="2026-06-16";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-TITLE-YEAR2-${TODAY},seo_fix,Bỏ "2026" khỏi title ${changed} trang còn lại (2026 ở giữa/cuối title),https://thongtaccongquangninh.com/,,done,medium,,,,,update title via REST API,tools/fix_title_remove_year2.mjs,,re-audit title,,,,,,`,
  "utf8");
console.log("✓ logged");
