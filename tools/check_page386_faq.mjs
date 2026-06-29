import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function wpGet(path){return new Promise((res,rej)=>{const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();});}

for(const id of [63, 386]) {
  const r = await wpGet(`/wp-json/wp/v2/pages/${id}?context=edit&_fields=id,slug,title,content`);
  const raw = r.content?.raw || "";
  console.log(`\n=== Page ${id}: ${r.title?.raw} ===`);
  // Find FAQ section
  const faqIdx = raw.toLowerCase().indexOf("câu hỏi");
  if(faqIdx>=0) {
    console.log("FAQ section found at "+faqIdx);
    // Show 300 chars around it
    console.log(raw.slice(faqIdx, faqIdx+400).replace(/<[^>]+>/g,"").slice(0,300));
  } else {
    console.log("No 'câu hỏi' section found in content");
    // Show last 200 chars of content
    console.log("Last 200 chars:", raw.slice(-200).replace(/<[^>]+>/g,"").slice(0,200));
  }
  // Check for strong + question marks
  const qmatches = (raw.match(/<strong[^>]*>[^<]*\?[^<]*<\/strong>/gi)||[]);
  console.log(`Questions (strong+?): ${qmatches.length}`);
  qmatches.slice(0,5).forEach(q=>console.log("  "+q.replace(/<[^>]+>/g,"").slice(0,80)));
}
