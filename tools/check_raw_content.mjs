import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpGet(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();});}

function countWords(t){return t.replace(/<[^>]+>/g," ").split(/\s+/).filter(Boolean).length;}

const PAGES=[
  {id:62,slug:"gioi-thieu"},
  {id:63,slug:"lien-he"},
  {id:2356,slug:"nguyen-song-hao"},
];

for(const {id,slug} of PAGES){
  const p=await wpGet(`/wp-json/wp/v2/pages/${id}?context=edit&_fields=id,slug,content,modified`);
  const raw=p?.content?.raw||"";
  const w=countWords(raw);
  console.log(`${slug} (id=${id}): raw=${w}w, modified=${p?.modified}`);
  // Kiểm tra có chứa content ta thêm không
  const hasCamKet=raw.includes("Cam kết chất lượng và quy trình kiểm tra");
  const hasFAQ=raw.includes("Có thể đặt lịch trước không");
  const hasChuyenMon=raw.includes("Chuyên môn và lĩnh vực phụ trách");
  console.log(`  hasCamKet=${hasCamKet}, hasFAQ=${hasFAQ}, hasChuyenMon=${hasChuyenMon}`);
}
