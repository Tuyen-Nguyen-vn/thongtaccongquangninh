/**
 * Diagnose KEYWORD_STUFFING on thong-tac-cong-* pages
 * Find keyword, count, density for each affected post/page
 */
import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();});}
function stripHtml(h){return h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
function wc(t){return t.split(/\s+/).filter(Boolean).length;}
function cnt(text,kw){return(text.match(new RegExp(kw.replace(/\s+/g,"\\s+"),"gi"))||[]).length;}

const slugs=[
  "thong-tac-cong-cao-xanh",
  "thong-tac-cong-tuan-chau",
  "thong-tac-cong-gieng-day",
  "thong-tac-cong-ngo-nho-ha-long",
  "thong-tac-cong-nha-hang-ha-long",
  "thong-tac-cong-bai-chay",
];

for(const slug of slugs){
  let found=null;
  for(const type of ["posts","pages"]){
    const r=await wpReq(`/wp-json/wp/v2/${type}?slug=${slug}&_fields=id,slug,type,status&context=edit`);
    if(Array.isArray(r)&&r[0]){found={...r[0],type};break;}
  }
  if(!found){console.log(`${slug}: NOT FOUND`);continue;}
  const full=await wpReq(`/wp-json/wp/v2/${found.type}/${found.id}?context=edit&_fields=id,slug,content`);
  const text=stripHtml(full?.content?.raw||"");
  const words=wc(text);

  // Try several candidate keywords
  const location=slug.replace("thong-tac-cong-","").replace(/-/g," ");
  const candidates=[
    `thông tắc cống ${location}`,
    `thông tắc cống Hạ Long`,
    `thông tắc cống`,
  ];
  for(const kw of candidates){
    const c=cnt(text,kw);
    if(c>0){
      const kwWords=kw.split(/\s+/).length;
      const density=(kwWords*c/words*100).toFixed(2);
      console.log(`${slug}: type=${found.type} id=${found.id} words=${words}`);
      console.log(`  kw="${kw}" (${kwWords}w) count=${c} density=${density}%`);
      break;
    }
  }
}
