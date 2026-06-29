/**
 * Đổi slug của 17 trang từ *-2026 → * (bỏ năm)
 * WP tự tạo _wp_old_slug → 301 redirect qua wp_old_slug_redirect hook
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

// Kiểm tra HTTP redirect
function checkRedirect(slug){return new Promise((res)=>{
  const o={hostname:SIP,port:443,servername:WPH,path:`/${slug}/`,method:"GET",
    headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
  const r=https.request(o,resp=>{
    res({status:resp.statusCode,location:resp.headers.location||""});
    resp.resume();
  });
  r.on("error",()=>res({status:0,location:""}));
  r.setTimeout(10000,()=>{r.destroy();res({status:0,location:""});});
  r.end();
});}

// Danh sách 17 trang cần đổi slug
const PAGES=[
  {slug:"bang-gia-hut-be-phot-quang-ninh-2026"},
  {slug:"dau-hieu-be-phot-bi-day-2026"},
  {slug:"hut-ham-cau-quang-ninh-2026"},
  {slug:"xe-hut-be-phot-quang-ninh-2026"},
  {slug:"gia-hut-be-phot-quang-ninh-2026"},
  {slug:"hut-be-phot-24-7-quang-ninh-2026"},
  {slug:"gia-thong-tac-cong-quang-ninh-2026"},
  {slug:"hut-be-phot-khan-cap-quang-ninh-2026"},
  {slug:"hut-be-phot-cong-ty-quang-ninh-2026"},
  {slug:"hut-be-phot-nha-hang-quang-ninh-2026"},
  {slug:"hut-be-phot-khach-san-quang-ninh-2026"},
  {slug:"hut-be-phot-khu-nha-tro-quang-ninh-2026"},
  {slug:"thong-tac-bon-cau-khach-san-quang-ninh-2026"},
  {slug:"hut-be-phot-khu-cong-nghiep-quang-ninh-2026"},
  {slug:"thong-tac-cong-khan-cap-quang-ninh-2026"},
  {slug:"thong-tac-bon-cau-nha-hang-quang-ninh-2026"},
  {slug:"thong-tac-bon-cau-nha-dan-quang-ninh-2026"},
];

const results=[];

for(const {slug} of PAGES){
  const newSlug=slug.replace(/-2026$/,"");

  // Tìm post hoặc page
  const [posts,pages]=await Promise.all([
    wpGet(`/wp-json/wp/v2/posts?slug=${slug}&_fields=id,slug,title`),
    wpGet(`/wp-json/wp/v2/pages?slug=${slug}&_fields=id,slug,title`),
  ]);
  const found=Array.isArray(posts)&&posts[0]?{type:"posts",...posts[0]}:
               Array.isArray(pages)&&pages[0]?{type:"pages",...pages[0]}:null;

  if(!found){
    console.log(`✗ ${slug}: not found`);
    results.push({slug,newSlug,status:"NOT_FOUND"});
    continue;
  }

  // Cập nhật slug
  const res=await wpPost(found.type,found.id,{slug:newSlug});
  if(res?.slug===newSlug){
    console.log(`✓ ${slug} → ${newSlug} (id=${found.id})`);
    results.push({slug,newSlug,id:found.id,type:found.type,status:"OK"});
  } else {
    console.log(`✗ ${slug}: update returned slug="${res?.slug}" expected "${newSlug}"`);
    results.push({slug,newSlug,status:"FAIL",response:JSON.stringify(res).slice(0,80)});
  }
}

// Kiểm tra 3 redirect đại diện
console.log("\n=== Verify 301 redirect (3 samples) ===");
const samples=results.filter(r=>r.status==="OK").slice(0,3);
for(const {slug,newSlug} of samples){
  const {status,location}=await checkRedirect(slug);
  const ok=status===301&&location.includes(newSlug);
  console.log(`${ok?"✓":"??"} /${slug}/ → ${status} ${location}`);
}

// Log
const ok=results.filter(r=>r.status==="OK").length;
const fail=results.filter(r=>r.status!=="OK").length;
const TODAY="2026-06-16";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},SLUG-REDIRECT-${TODAY},seo_fix,Đổi slug bỏ "-2026" cho ${ok}/17 trang — 301 redirect tự động qua WP _wp_old_slug,https://thongtaccongquangninh.com/,,done,medium,,,,,thay slug REST API then verify redirect,tools/exec_slug_redirect.mjs,,monitor GSC,,,,,,`,
  "utf8");
console.log(`\n✓ ${ok} OK / ${fail} FAIL — logged`);
