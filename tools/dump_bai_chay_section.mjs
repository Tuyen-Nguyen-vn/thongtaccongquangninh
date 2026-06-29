import https from "node:https";
import { readFileSync, writeFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function req(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const r=https.request({hostname:"103.57.220.210",port:443,servername:"thongtaccongquangninh.com",path,method,headers:{Host:"thongtaccongquangninh.com",Authorization:auth,"User-Agent":"WP-Agent/1.0",...(b?{"Content-Type":"application/json","Content-Length":b.length}:{})},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)});}catch{res({s:resp.statusCode,d});}});});r.on("error",rej);r.setTimeout(30000,()=>r.destroy());if(b)r.write(b);r.end();});}
const cur = await req("GET", "/wp-json/wp/v2/posts/2054?context=edit", null);
const h = cur.d.content.raw;
writeFileSync("D:/.thongtaccongquangninh/reports/bai-chay-current.html", h, "utf8");
const i = h.indexOf("Khu vực phục vụ");
console.log(h.slice(i-30, i+900));
