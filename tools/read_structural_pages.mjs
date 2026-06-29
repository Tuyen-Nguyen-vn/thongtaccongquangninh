import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();});}

function countWords(t){return(t.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<[^>]+>/g," ").match(/\b\w+\b/g)||[]).length;}

const PAGES=[
  {id:62, slug:"gioi-thieu"},
  {id:63, slug:"lien-he"},
  {id:2356, slug:"nguyen-song-hao"},
];

for(const {id,slug} of PAGES){
  const p=await wpReq(`/wp-json/wp/v2/pages/${id}?context=edit&_fields=id,slug,content`);
  const raw=p?.content?.raw||"";
  const words=countWords(raw);
  // Extract H2/H3
  const headings=[...raw.matchAll(/<!-- wp:heading[^>]*>\s*<h([23])[^>]*>(.*?)<\/h\1>/gi)];
  console.log(`\n=== ${slug} (id=${id}) raw=${words}w ===`);
  for(const m of headings) console.log(`  H${m[1]}: ${m[2].replace(/<[^>]+>/g,"")}`);
  // Show last 500 chars (before JSON-LD if any)
  const marker='<!-- wp:html -->\n<script type="application/ld+json"';
  const idx=raw.lastIndexOf(marker);
  const endIdx=idx>0?idx:raw.length;
  console.log(`  Last 400 chars before JSON-LD:`);
  console.log(raw.slice(Math.max(0,endIdx-400),endIdx));
}
