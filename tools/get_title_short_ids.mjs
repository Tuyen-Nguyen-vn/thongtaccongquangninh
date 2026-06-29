import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function wpGet(path){return new Promise((res,rej)=>{const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();});}

const items = [
  { type: "pages", slug: "hut-be-phot-quang-ninh" },
  { type: "pages", slug: "nao-vet-ho-ga-quang-ninh" },
  { type: "pages", slug: "nguyen-nhan-cong-tac-thuong-xuyen-ha-long" },
  { type: "posts", slug: "mui-hoi-cong-nguyen-nhan-xu-ly" },
];
for(const { type, slug } of items){
  const r = await wpGet(`/wp-json/wp/v2/${type}?slug=${slug}&context=edit&_fields=id,slug,title`);
  if(r[0]) console.log(`id=${r[0].id} type=${type.slice(0,-1)} slug=${r[0].slug} title="${r[0].title.raw}" len=${[...r[0].title.raw].length}`);
  else console.log(`NOT FOUND: ${type}/${slug}`);
}
