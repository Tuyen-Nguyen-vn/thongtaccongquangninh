/**
 * Đếm từ dùng đúng method của audit (getMainHtml + split whitespace)
 * Đồng thời bust cache bằng cách re-save lại các page qua REST API
 */
import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";

function wpPost(type,id,body){return new Promise((res,rej)=>{const b=Buffer.from(JSON.stringify(body),"utf8");const o={hostname:SIP,port:443,servername:WPH,path:`/wp-json/wp/v2/${type}/${id}`,method:"POST",headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));r.write(b);r.end();});}

function fetchLive(slug){return new Promise((res,rej)=>{
  const o={hostname:SIP,port:443,servername:WPH,path:`/${slug}/`,method:"GET",
    headers:{Host:WPH,"User-Agent":"Mozilla/5.0","Cache-Control":"no-cache","Pragma":"no-cache"},rejectUnauthorized:false};
  const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d))});
  r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();
});}

function stripTagsAndShell(html){
  let h=html;
  h=h.replace(/<script\b[\s\S]*?<\/script>/gi," ");
  h=h.replace(/<style\b[\s\S]*?<\/style>/gi," ");
  h=h.replace(/<noscript\b[\s\S]*?<\/noscript>/gi," ");
  h=h.replace(/<header\b[\s\S]*?<\/header>/gi," ");
  h=h.replace(/<footer\b[\s\S]*?<\/footer>/gi," ");
  h=h.replace(/<nav\b[\s\S]*?<\/nav>/gi," ");
  h=h.replace(/<aside\b[\s\S]*?<\/aside>/gi," ");
  return h;
}

function getMainHtml(html){
  const candidates=[
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]+class=["'][^"']*\bentry-content\b[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/(?:article|main|section)/i,
    /<div[^>]+id=["']content["'][^>]*>([\s\S]*?)<\/div>\s*<\/(?:body|main)/i,
  ];
  for(const re of candidates){const m=html.match(re);if(m&&m[1]&&m[1].length>500)return m[1];}
  return stripTagsAndShell(html);
}

function textFromHtml(html){
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ")
    .replace(/<[^>]+>/g," ")
    .replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/\s+/g," ").trim();
}

function countWords(text){return text.split(/\s+/).filter(Boolean).length;}

// Bust cache by re-saving (null update — ping post to clear cache)
const CACHE_BUST=[
  {type:"pages",id:62,slug:"gioi-thieu"},
  {type:"pages",id:63,slug:"lien-he"},
  {type:"pages",id:2356,slug:"nguyen-song-hao"},
];

console.log("=== Bust WP cache ===");
for(const {type,id,slug} of CACHE_BUST){
  // Re-save với comment để trigger save_post hook
  const res=await wpPost(type,id,{meta:{"ttcqn_cache_bust":"1"}});
  console.log(`  ${slug}: ${res?.id?"✓ cache bust":"✗ "+JSON.stringify(res).slice(0,60)}`);
}

// Chờ cache invalidation
await new Promise(r=>setTimeout(r,2000));

console.log("\n=== Live word count (audit method) ===");
const SLUGS=[
  {slug:"gioi-thieu",threshold:2000},
  {slug:"lien-he",threshold:2000},
  {slug:"nguyen-song-hao",threshold:2000},
  {slug:"dieu-khoan-dich-vu",threshold:2000},
  {slug:"hoa-chat-tu-thong-cong",threshold:2000},
  {slug:"blog",threshold:2000},
  {slug:"chinh-sach-bao-mat",threshold:2000},
];

for(const {slug,threshold} of SLUGS){
  const html=await fetchLive(slug);
  const main=getMainHtml(html);
  const text=textFromHtml(main);
  const w=countWords(text);
  const status=w>=2500?"✓ OK":w>=2000?"⚠ BELOW_TARGET":"✗ LOW";
  console.log(`${status} ${slug}: ${w}w (audit-method)`);
}
