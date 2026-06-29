/**
 * Check images with bad alt on specific posts/pages
 */
import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();});}

// Service keywords for alt check
const SERVICE_WORDS = ["hút","bể phốt","thông tắc","cống","bồn cầu","hố ga","Quảng Ninh","Hạ Long","hóa chất","mùi hôi","nạo vét"];

function checkAlt(alt){
  if(!alt || alt.trim()==="") return "EMPTY";
  const lower = alt.toLowerCase();
  const hasService = SERVICE_WORDS.some(w=>lower.includes(w.toLowerCase()));
  if(!hasService) return "NO_SERVICE";
  return "OK";
}

const POSTS = [
  {id:2045, type:"posts", slug:"hoa-chat-tu-thong-cong"},
  {id:2054, type:"posts", slug:"thong-tac-cong-bai-chay"},
  // hut-be-phot-binh-lieu, co-to, dam-ha
];

// Also check by fetching from pages
const PAGES_CHECK = [
  {slug:"hut-be-phot-binh-lieu"},
  {slug:"hut-be-phot-co-to"},
  {slug:"hut-be-phot-dam-ha"},
];

// Find page IDs first
for(const {slug} of PAGES_CHECK){
  const r=await wpReq(`/wp-json/wp/v2/posts?slug=${slug}&_fields=id,type,slug`);
  if(Array.isArray(r)&&r[0]) POSTS.push({id:r[0].id,type:"posts",slug});
  else {
    const r2=await wpReq(`/wp-json/wp/v2/pages?slug=${slug}&_fields=id,type,slug`);
    if(Array.isArray(r2)&&r2[0]) POSTS.push({id:r2[0].id,type:"pages",slug});
  }
}

for(const {id,type,slug} of POSTS){
  const post = await wpReq(`/wp-json/wp/v2/${type}/${id}?_fields=id,content&context=edit`);
  const raw = post?.content?.raw||"";
  // Find all image blocks
  const imgRe=/<img[^>]+>/gi;
  const imgs=[...raw.matchAll(imgRe)];
  console.log(`\n${slug} (${type}/${id}): ${imgs.length} images`);
  for(const m of imgs){
    const altM = m[0].match(/alt="([^"]*)"/i);
    const srcM = m[0].match(/src="([^"]*?)(?:-\d+x\d+)?\.(jpg|jpeg|png|webp|gif)/i);
    const alt = altM?.[1]??null;
    const src = srcM?.[0]?.replace(/.*\//,"").slice(0,60)||"?";
    const status = alt===null?"NO_ALT_ATTR":checkAlt(alt);
    if(status!=="OK") console.log(`  [${status}] alt="${alt}" src=...${src}`);
  }
}
