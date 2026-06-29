import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();});}
function stripHtml(h){return h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}

// hoa-chat id=2045, mui-hoi id=2046
for(const id of [2045, 2046]){
  const r=await wpReq(`/wp-json/wp/v2/posts/${id}?context=edit&_fields=id,slug,content`);
  console.log(`\n=== id=${id} slug=${r.slug} ===`);
  // Print last 2000 chars of raw to see existing H2/H3 structure
  const raw=r.content?.raw||"";
  // Extract headings
  const headings=[...raw.matchAll(/<!-- wp:heading[^>]*-->\s*<h[23][^>]*>(.*?)<\/h[23]>/gs)].map(m=>m[1].replace(/<[^>]+>/g,""));
  console.log("Headings:", headings.join(" | "));
  // Print last paragraph
  const stripped=stripHtml(raw);
  console.log("Last 300 chars:", stripped.slice(-300));
  console.log("Total raw words:", stripped.split(/\s+/).filter(Boolean).length);
}
