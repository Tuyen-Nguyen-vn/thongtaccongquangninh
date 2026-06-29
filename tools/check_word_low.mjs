/**
 * Check WORD_LOW pages: get IDs and current word counts for service/info posts
 */
import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}
function stripHtml(h){return h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
function wc(t){return t.split(/\s+/).filter(Boolean).length;}

const slugs=[
  "bon-cau-rut-cham-nguyen-nhan",
  "hoa-chat-tu-thong-cong",
  "mui-hoi-cong-nguyen-nhan-xu-ly",
  "gioi-thieu",
  "lien-he",
  "nguyen-song-hao",
];

for(const slug of slugs){
  let found=null;
  for(const type of ["posts","pages"]){
    const r=await wpReq("GET",`/wp-json/wp/v2/${type}?slug=${slug}&_fields=id,slug,type,status&context=edit`);
    if(Array.isArray(r)&&r[0]){found={...r[0],type};break;}
  }
  if(!found){console.log(`${slug}: NOT FOUND`);continue;}
  const full=await wpReq("GET",`/wp-json/wp/v2/${found.type}/${found.id}?context=edit&_fields=id,slug,content`);
  const words=wc(stripHtml(full?.content?.raw||""));
  console.log(`${slug}: ${found.type} id=${found.id} status=${found.status} words=${words}`);
}
