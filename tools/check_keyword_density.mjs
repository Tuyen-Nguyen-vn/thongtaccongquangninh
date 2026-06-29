/**
 * Fetch content + count keyword density for stuffed posts
 */
import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function wpGet(path){return new Promise((res,rej)=>{const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();});}

const POSTS = [
  {slug:"hut-be-phot-bai-chay",type:"pages",kw:"hút bể phốt Bãi Cháy"},
  {slug:"hut-be-phot-binh-lieu",type:"posts",kw:"hút bể phốt Bình Liêu"},
  {slug:"hut-be-phot-co-to",type:"posts",kw:"hút bể phốt Cô Tô"},
  {slug:"hut-be-phot-dam-ha",type:"posts",kw:"hút bể phốt Đầm Hà"},
  {slug:"hut-be-phot-hai-ha",type:"posts",kw:"hút bể phốt Hải Hà"},
];

function countKw(text, kw){
  const re = new RegExp(kw.replace(/\s+/g,"\\s+"), "gi");
  return (text.match(re)||[]).length;
}
function wordCount(text){ return text.split(/\s+/).filter(Boolean).length; }
function stripHtml(html){ return html.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(); }

for(const {slug,type,kw} of POSTS){
  const r=await wpGet(`/wp-json/wp/v2/${type}?slug=${slug}&context=edit&_fields=id,slug,content`);
  if(!r[0]){ console.log("NOT FOUND: "+slug); continue; }
  const raw = r[0].content?.raw || "";
  const text = stripHtml(raw);
  const wc = wordCount(text);
  const cnt = countKw(text, kw);
  const density = cnt/wc*100;
  console.log(`\nid=${r[0].id} ${slug}`);
  console.log(`  words=${wc} kw="${kw}" count=${cnt} density=${density.toFixed(2)}%`);
  console.log(`  need to remove: ${Math.ceil(cnt - wc*0.034)} instances (to reach 3.4%)`);
}
