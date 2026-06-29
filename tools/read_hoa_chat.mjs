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
// Print H2 headings to understand structure
const h2s=[...raw.matchAll(/<!-- wp:heading[^>]*>\s*<h2[^>]*>(.*?)<\/h2>/gi)];
console.log("H2 headings:");
for(const m of h2s) console.log(" -",m[1].replace(/<[^>]+>/g,""));
// Word count estimate
const text=raw.replace(/<[^>]+>/g," ").replace(/\s+/g," ");
const words=(text.match(/\b\w+\b/g)||[]).length;
console.log("\nRaw word count:",words);
// Show last 500 chars before JSON-LD
const marker='<!-- wp:html -->\n<script type="application/ld+json" data-ttcqn-author-nguyen-song-hao="1">';
const idx=raw.lastIndexOf(marker);
console.log("\nLast 300 chars before JSON-LD marker:");
if(idx>0) console.log(raw.slice(idx-300,idx));
