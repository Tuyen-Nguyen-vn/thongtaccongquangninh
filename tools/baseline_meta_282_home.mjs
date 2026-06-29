import https from "node:https";
const D="thongtaccongquangninh.com", IP="103.57.220.210";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function get(path,authed){return new Promise((resolve)=>{const h={Host:D,"User-Agent":"WP-Agent/1.0"};if(authed)h.Authorization=auth;const req=https.request({hostname:IP,port:443,servername:D,path,method:"GET",headers:h,rejectUnauthorized:false},(res)=>{let d="";res.on("data",c=>d+=c);res.on("end",()=>{try{resolve({s:res.statusCode,j:JSON.parse(d),d});}catch{resolve({s:res.statusCode,d});}});});req.on("error",e=>resolve({s:0,d:String(e)}));req.setTimeout(30000,()=>req.destroy());req.end();});}

// what is post/page 282?
const p282 = await get("/wp-json/wp/v2/pages/282?context=edit",true);
if(p282.j) console.log("PAGE 282:", JSON.stringify({slug:p282.j.slug,link:p282.j.link,title:p282.j.title?.raw}));
else { const po=await get("/wp-json/wp/v2/posts/282?context=edit",true); console.log("POST 282:", po.j?JSON.stringify({slug:po.j.slug,link:po.j.link,title:po.j.title?.raw}):po.s); }

// live <title> of 282
const slug = p282.j?.slug;
if(slug){
  const live = await get("/"+slug+"/?nocache="+Date.now(),false);
  const t=(live.d.match(/<title>([\s\S]*?)<\/title>/i)||[])[1];
  console.log("282 live <title>:", t);
}
// home meta description live
const home = await get("/?nocache="+Date.now(),false);
const desc=(home.d.match(/<meta[^>]*name=["']description["'][^>]*>/i)||[])[0];
const ht=(home.d.match(/<title>([\s\S]*?)<\/title>/i)||[])[1];
console.log("HOME <title>:", ht);
console.log("HOME description:", desc);
