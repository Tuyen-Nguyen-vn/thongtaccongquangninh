import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();});}

const SLUGS=[
  "nao-vet-ho-ga",
  "thong-tac-cong-bai-chay",
  "thong-tac-bon-cau-dong-trieu",
  "thong-tac-bon-cau-quang-yen",
  "hut-be-phot-cong-ty-quang-ninh-2026",
  "hoa-chat-tu-thong-cong",
];
for(const slug of SLUGS){
  let found=null;
  for(const type of ["posts","pages"]){
    const r=await wpReq(`/wp-json/wp/v2/${type}?slug=${slug}&_fields=id,slug,type`);
    if(Array.isArray(r)&&r[0]){found={id:r[0].id,type};break;}
  }
  console.log(`${slug}: ${found?.type} id=${found?.id}`);
}
