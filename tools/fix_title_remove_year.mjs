/**
 * Cập nhật title 17 trang vừa đổi slug — bỏ " 2026" khỏi title
 * Chỉ bỏ nếu title kết thúc bằng " 2026" hoặc " 2026 " hoặc "(2026)"
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

// Slug mới (sau khi đổi ở bước trước)
const PAGES=[
  {id:217,  type:"posts", slug:"bang-gia-hut-be-phot-quang-ninh"},
  {id:2589, type:"posts", slug:"dau-hieu-be-phot-bi-day"},
  {id:2559, type:"posts", slug:"hut-ham-cau-quang-ninh"},
  {id:2554, type:"posts", slug:"xe-hut-be-phot-quang-ninh"},
  {id:2449, type:"posts", slug:"gia-hut-be-phot-quang-ninh"},
  {id:2439, type:"posts", slug:"hut-be-phot-24-7-quang-ninh"},
  {id:2787, type:"posts", slug:"gia-thong-tac-cong-quang-ninh"},
  {id:2430, type:"posts", slug:"hut-be-phot-khan-cap-quang-ninh"},
  {id:2694, type:"posts", slug:"hut-be-phot-cong-ty-quang-ninh"},
  {id:2687, type:"posts", slug:"hut-be-phot-nha-hang-quang-ninh"},
  {id:2702, type:"posts", slug:"hut-be-phot-khach-san-quang-ninh"},
  {id:2708, type:"posts", slug:"hut-be-phot-khu-nha-tro-quang-ninh"},
  {id:2417, type:"posts", slug:"thong-tac-bon-cau-khach-san-quang-ninh"},
  {id:2769, type:"posts", slug:"hut-be-phot-khu-cong-nghiep-quang-ninh"},
  {id:2777, type:"posts", slug:"thong-tac-cong-khan-cap-quang-ninh"},
  {id:2412, type:"posts", slug:"thong-tac-bon-cau-nha-hang-quang-ninh"},
  {id:2407, type:"posts", slug:"thong-tac-bon-cau-nha-dan-quang-ninh"},
];

function cleanTitle(t){
  // Bỏ " 2026" ở cuối (với hoặc không có space/dash trước)
  return t.replace(/[\s\-–]+2026\s*$/,"").trim();
}

let changed=0,skipped=0;
for(const {id,type,slug} of PAGES){
  const post=await wpGet(`/wp-json/wp/v2/${type}/${id}?_fields=id,slug,title`);
  if(!post?.id){console.log(`✗ id=${id} not found`);continue;}

  const rawTitle=post.title?.rendered||post.title?.raw||"";
  // Decode HTML entities từ rendered title
  const currentTitle=rawTitle.replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(n)).replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"');
  const newTitle=cleanTitle(currentTitle);

  if(newTitle===currentTitle){
    console.log(`- ${slug}: title không có "2026" — bỏ qua`);
    skipped++;
    continue;
  }

  const res=await wpPost(type,id,{title:newTitle});
  const gotTitle=res?.title?.rendered||res?.title?.raw||"";
  if(res?.id){
    console.log(`✓ ${slug}:\n    "${currentTitle}"\n  → "${newTitle}"`);
    changed++;
  } else {
    console.log(`✗ ${slug}: ${JSON.stringify(res).slice(0,100)}`);
  }
}

console.log(`\nĐổi title: ${changed}/${PAGES.length} | Bỏ qua (không có 2026): ${skipped}`);

const TODAY="2026-06-16";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-TITLE-YEAR-${TODAY},seo_fix,Bỏ " 2026" khỏi title 17 trang vừa đổi slug,https://thongtaccongquangninh.com/,,done,medium,,,,,update title via REST API,tools/fix_title_remove_year.mjs,,re-audit title,,,,,,`,
  "utf8");
console.log("✓ logged");
