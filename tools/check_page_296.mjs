import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function wpGet(path) {
  return new Promise((res,rej)=>{
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,Authorization:auth},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();
  });
}

// Check page 296
const pg = await wpGet("/wp-json/wp/v2/pages/296?context=edit");
console.log("=== Page 296 Info from REST API ===");
console.log("ID:", pg?.id);
console.log("Slug:", pg?.slug);
console.log("Status:", pg?.status);
console.log("Title Raw:", pg?.title?.raw);
console.log("Title Rendered:", pg?.title?.rendered);
console.log("Excerpt Raw:", pg?.excerpt?.raw);

// Check Rank Math metadata via REST
const rmMeta = await wpGet("/wp-json/rankmath/v1/getMeta?objectType=post&objectID=296");
console.log("\n=== Rank Math Meta ===");
console.log(JSON.stringify(rmMeta, null, 2));

