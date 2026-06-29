import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();});}

const post=await wpReq("/wp-json/wp/v2/posts/2045?context=edit&_fields=id,slug,content");
const raw=post?.content?.raw||"";

// Find all H2 and H3
const headings=[...raw.matchAll(/<!-- wp:heading[^>]*>\s*<h([23])[^>]*>(.*?)<\/h\1>/gi)];
console.log("All headings:");
for(const m of headings) console.log(`  H${m[1]}: ${m[2].replace(/<[^>]+>/g,"")}`);

// Strip HTML and JSON-LD script content, count visible words
const noScript=raw.replace(/<script[\s\S]*?<\/script>/gi," ");
const noHtml=noScript.replace(/<[^>]+>/g," ").replace(/<!--[\s\S]*?-->/g," ").replace(/\s+/g," ").trim();
const words=(noHtml.match(/\b\w+\b/g)||[]).length;
console.log("\nWords (no script, no html):",words);
