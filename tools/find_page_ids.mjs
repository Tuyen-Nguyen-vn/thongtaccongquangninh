import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();});}

const slugs=["dieu-khoan-dich-vu","gioi-thieu","lien-he"];
for(const s of slugs){
  const r=await wpReq("/wp-json/wp/v2/pages?slug="+s+"&_fields=id,slug,title");
  if(Array.isArray(r)&&r[0]) console.log(`${s}: id=${r[0].id} title="${r[0].title?.rendered}"`);
  else console.log(`${s}: ${JSON.stringify(r).slice(0,100)}`);
}
// nguyen-song-hao is page 2356 (known from previous session)
const r2=await wpReq("/wp-json/wp/v2/pages/2356?_fields=id,slug,title");
console.log(`nguyen-song-hao page: id=${r2.id} slug=${r2.slug}`);
