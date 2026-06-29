import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p) { const e={}; for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");} return e; }
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SERVER_IP="103.57.220.210", WP_HOST="thongtaccongquangninh.com";

const req = () => new Promise((res,rej)=>{
  const r=https.request({hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/?nowprocket=1&t="+Date.now(),method:"GET",headers:{Host:WP_HOST,"User-Agent":"schema-audit"},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d));});
  r.on("error",rej);r.setTimeout(20000,()=>r.destroy());r.end();
});

const html = await req();
const blocks=[...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1].trim());
console.log(`Total LD+JSON blocks: ${blocks.length}`);

for(const [i,b] of blocks.entries()) {
  try {
    const j=JSON.parse(b);
    const nodes=Array.isArray(j)?j:(j["@graph"]||[j]);
    for(const n of nodes){
      const t=Array.isArray(n["@type"])?n["@type"].join("+"):n["@type"];
      if(t && (t.includes("LocalBusiness") || t.includes("Organization"))) {
        console.log(`\nBlock ${i} — @type: ${t}`);
        console.log("  name:", n.name);
        console.log("  address:", JSON.stringify(n.address));
        console.log("  hasMap:", n.hasMap||"none");
        const d=n.department||[];
        console.log("  department count:", d.length);
        d.forEach((x,k)=>console.log(`    [${k+1}] ${x.name} | ${x.address?.streetAddress} | hasMap=${x.hasMap?"YES":"NO"}`));
      }
    }
  } catch(e){console.log(`Block ${i}: parse error`);}
}
