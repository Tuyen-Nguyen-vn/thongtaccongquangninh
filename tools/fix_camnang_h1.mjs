import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function req(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const r=https.request({hostname:"103.57.220.210",port:443,servername:"thongtaccongquangninh.com",path,method,headers:{Host:"thongtaccongquangninh.com",Authorization:auth,"User-Agent":"WP-Agent/1.0",...(b?{"Content-Type":"application/json","Content-Length":b.length}:{})},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)});}catch{res({s:resp.statusCode,d});}});});r.on("error",rej);r.setTimeout(30000,()=>r.destroy());if(b)r.write(b);r.end();});}

const list = await req("GET", "/wp-json/wp/v2/posts?slug=cam-nang-thong-tac-cong-tai-ha-long&context=edit", null);
if (!Array.isArray(list.d) || !list.d.length) { console.error("post not found"); process.exit(1); }
const post = list.d[0];
const id = post.id;
const oldTitle = post.title.raw;
const OLD = "Thông tắc cống Hạ Long: cẩm nang xử lý nhanh theo từng khu";
const NEW = "Cẩm nang thông tắc cống Hạ Long: xử lý nhanh theo từng khu";
console.log("id=", id, "| oldTitle=", JSON.stringify(oldTitle), "| len(new)=", [...NEW].length);
if (oldTitle.trim() !== OLD) { console.error("title mismatch — abort, not overwriting unknown title."); process.exit(1); }

const up = await req("POST", `/wp-json/wp/v2/posts/${id}`, { title: NEW });
console.log("update:", up.s, "| newTitle:", JSON.stringify(up.d.title?.raw));
