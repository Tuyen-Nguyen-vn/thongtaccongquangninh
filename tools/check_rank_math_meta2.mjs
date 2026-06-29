import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

// Use context=edit + explicit meta field like get_meta_short_ids.mjs does
const post = await wpReq("GET","/wp-json/wp/v2/posts/2589?_fields=id,slug,meta&context=edit");
console.log("meta.rank_math_description len="+(post?.meta?.rank_math_description?.length||0));
console.log("val="+JSON.stringify(post?.meta?.rank_math_description||""));
console.log("all meta keys:", Object.keys(post?.meta||{}).filter(k=>k.startsWith("rank_math")));

// Now try same for a known working post (id=26, pages)
const page = await wpReq("GET","/wp-json/wp/v2/pages/26?_fields=id,slug,meta&context=edit");
console.log("\npage 26 rank_math_description len="+(page?.meta?.rank_math_description?.length||0));
console.log("val="+JSON.stringify(page?.meta?.rank_math_description||""));
