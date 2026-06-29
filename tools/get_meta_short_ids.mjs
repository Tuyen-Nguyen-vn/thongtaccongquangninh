import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();});}

const slugs=[
  "dau-hieu-be-phot-bi-day-2026",
  "hut-be-phot-quang-ninh",
  "nguyen-nhan-cong-tac-thuong-xuyen-ha-long",
  "thong-tac-bon-cau-quang-yen",
  "thong-tac-cong-bai-chay",
  "thong-tac-cong-cam-pha",
  "thong-tac-cong-cao-xanh",
  "thong-tac-cong-chung-cu-ha-long",
  "thong-tac-cong-gieng-day",
  "thong-tac-cong-hong-gai",
  "thong-tac-cong-ngo-nho-ha-long",
  "thong-tac-cong-nha-hang-ha-long",
  "thong-tac-cong-quang-ninh",
  "thong-tac-cong-quang-yen",
  "thong-tac-cong-tuan-chau",
  "thong-tac-cong-uong-bi",
];

for(const slug of slugs){
  let found=null;
  for(const type of ["posts","pages"]){
    const r=await wpReq(`/wp-json/wp/v2/${type}?slug=${slug}&_fields=id,slug,type&context=edit`);
    if(Array.isArray(r)&&r[0]){found={...r[0],type};break;}
  }
  // Also get rank math meta
  let meta="";
  if(found){
    const full=await wpReq(`/wp-json/wp/v2/${found.type}/${found.id}?_fields=id,slug,meta&context=edit`);
    meta=full?.meta?.rank_math_description||"";
  }
  console.log(`${slug}: ${found?.type} id=${found?.id} metaLen=${meta.length}`);
  if(meta) console.log(`  current: "${meta}"`);
}
