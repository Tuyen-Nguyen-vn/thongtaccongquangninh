import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();});}

// Check if nguyen-song-hao is a page or post
for(const type of ["pages","posts"]){
  const r=await wpReq(`/wp-json/wp/v2/${type}?slug=nguyen-song-hao&_fields=id,slug,type`);
  if(Array.isArray(r)&&r[0]) console.log(`Found as ${type}: id=${r[0].id}`);
}

// Also: what does get_queried_object_id return for blog page?
// Confirm by checking if page 25 has reading settings
const p25=await wpReq("/wp-json/wp/v2/pages/25?_fields=id,slug,title");
console.log("Page 25:", JSON.stringify(p25));
