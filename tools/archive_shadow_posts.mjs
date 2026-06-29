import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210", WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function req(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const r=https.request({hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,headers:{Host:WP_HOST,Authorization:auth,"User-Agent":"WP-Agent/1.0",...(b?{"Content-Type":"application/json","Content-Length":b.length}:{})},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)});}catch{res({s:resp.statusCode,d});}});});r.on("error",rej);r.setTimeout(30000,()=>r.destroy());if(b)r.write(b);r.end();});}
// Keep PAGE live; archive shadowed POSTs (rename slug + draft). Non-destructive: content kept as draft.
for (const [id,newslug] of [[2913,"hut-be-phot-ha-long-post-archived"],[2917,"thong-tac-cong-cam-pha-post-archived"]]) {
  const up = await req("POST", `/wp-json/wp/v2/posts/${id}`, { slug: newslug, status: "draft" });
  console.log(`post ${id} -> ${up.s} slug=${up.d.slug} status=${up.d.status}`);
}
