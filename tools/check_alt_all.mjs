import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();});}

const POSTS = [
  {id:2045, type:"posts", slug:"hoa-chat-tu-thong-cong"},
  {id:2048, type:"posts", slug:"hut-be-phot-binh-lieu"},
  {id:2049, type:"posts", slug:"hut-be-phot-co-to"},
  {id:2050, type:"posts", slug:"hut-be-phot-dam-ha"},
];

for(const {id,type,slug} of POSTS){
  const post = await wpReq(`/wp-json/wp/v2/${type}/${id}?_fields=id,content&context=edit`);
  const raw = post?.content?.raw||"";
  const imgRe=/<img[^>]+>/gi;
  const imgs=[...raw.matchAll(imgRe)];
  console.log(`\n${slug}:`);
  for(const m of imgs){
    const altM = m[0].match(/alt="([^"]*)"/i);
    const srcM = m[0].match(/wp-content[^"]*\.(jpg|jpeg|png|webp)/i);
    const alt = altM?.[1]??"(no alt attr)";
    const src = srcM?.[0]?.split("/").pop()||"?";
    console.log(`  alt="${alt}" src=${src}`);
  }
}
