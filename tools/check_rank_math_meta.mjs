import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();});}

// Get all meta fields for post 2589
const post = await wpReq("/wp-json/wp/v2/posts/2589?context=edit");
const meta = post?.meta || {};
// Filter rank_math keys
const rmKeys = Object.entries(meta).filter(([k])=>k.includes("rank_math"));
console.log("rank_math meta fields:");
for(const [k,v] of rmKeys){
  const val = typeof v === "string" ? v : JSON.stringify(v);
  console.log(`  ${k}: len=${[...val].length} val=${JSON.stringify(val.slice(0,80))}`);
}

// Also try RankMath REST namespace
const rm = await wpReq("/wp-json/rankmath/v1/updateMeta?objectID=2589&objectType=post");
console.log("\nRank Math API test:", JSON.stringify(rm).slice(0,200));
