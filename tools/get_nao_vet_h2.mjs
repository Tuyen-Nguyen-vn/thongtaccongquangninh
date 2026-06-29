import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function wpGet(path){return new Promise((res,rej)=>{const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();});}

const rp = await wpGet(`/wp-json/wp/v2/pages?slug=nao-vet-ho-ga-quang-ninh&context=edit&_fields=id,slug,title,content`);
if(rp[0]) {
  const p=rp[0];
  console.log("PAGE id="+p.id+" title: "+p.title.raw);
  const h2s=(p.content.raw.match(/<h2[^>]*>.*?<\/h2>/gi)||[]);
  console.log("H2 count: "+h2s.length);
  h2s.forEach((h,i)=>console.log(`  [${i}] ${h.replace(/<[^>]+>/g,"").slice(0,80)}`));
  process.exit(0);
}
const r2 = await wpGet(`/wp-json/wp/v2/posts?slug=nao-vet-ho-ga-quang-ninh&context=edit&_fields=id,slug,title,content`);
const p = r2[0];
if(!p){console.log("not found");process.exit(1);}
console.log("POST id="+p.id+" title: "+p.title.raw);
const h2s = (p.content.raw.match(/<h2[^>]*>.*?<\/h2>/gi)||[]);
console.log("H2 count: "+h2s.length);
h2s.forEach((h,i)=>console.log(`  [${i}] ${h.replace(/<[^>]+>/g,"").slice(0,80)}`));
