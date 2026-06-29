/**
 * Fetch current rank_math_description for all META_SHORT URLs
 * Output: JSON array [{id, slug, type, desc, len}]
 */
import https from "node:https";
import { readFileSync, writeFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function wpGet(path){return new Promise((res,rej)=>{const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();});}

const ITEMS = [
  // posts
  {slug:"dau-hieu-be-phot-bi-day-2026",type:"posts"},
  {slug:"gia-hut-be-phot-quang-ninh-2026",type:"posts"},
  {slug:"gia-thong-tac-bon-cau-quang-ninh",type:"posts"},
  {slug:"hoa-chat-tu-thong-cong",type:"posts"},
  {slug:"hut-be-phot-24-7-quang-ninh-2026",type:"posts"},
  {slug:"hut-be-phot-ba-che",type:"posts"},
  {slug:"hut-be-phot-bai-chay",type:"posts"},
  {slug:"hut-be-phot-binh-lieu",type:"posts"},
  {slug:"hut-be-phot-co-to",type:"posts"},
  {slug:"hut-be-phot-cong-ty-quang-ninh-2026",type:"posts"},
  {slug:"hut-be-phot-dam-ha",type:"posts"},
  {slug:"hut-be-phot-hai-ha",type:"posts"},
  {slug:"hut-be-phot-khan-cap-quang-ninh-2026",type:"posts"},
  {slug:"hut-be-phot-nha-hang-quang-ninh-2026",type:"posts"},
  {slug:"hut-be-phot-tien-yen",type:"posts"},
  {slug:"hut-ham-cau-quang-ninh-2026",type:"posts"},
  {slug:"mui-hoi-cong-nguyen-nhan-xu-ly",type:"posts"},
  {slug:"nao-vet-ho-ga",type:"posts"},
  {slug:"thong-tac-bon-cau-ban-dem-quang-ninh",type:"posts"},
  {slug:"thong-tac-bon-cau-bi-tac",type:"posts"},
  {slug:"thong-tac-bon-cau-khach-san-quang-ninh-2026",type:"posts"},
  {slug:"thong-tac-bon-cau-khan-cap-quang-ninh",type:"posts"},
  {slug:"thong-tac-bon-cau-khong-duc-pha-quang-ninh",type:"posts"},
  {slug:"thong-tac-bon-cau-nha-dan-quang-ninh-2026",type:"posts"},
  {slug:"thong-tac-bon-cau-nha-hang-quang-ninh-2026",type:"posts"},
  {slug:"thong-tac-bon-cau-quang-ninh",type:"posts"},
  // pages
  {slug:"gioi-thieu",type:"pages"},
  {slug:"hut-be-phot-cam-pha",type:"pages"},
  {slug:"hut-be-phot-ha-long",type:"pages"},
  {slug:"hut-be-phot-quang-ninh",type:"pages"},
  {slug:"hut-be-phot-quang-yen",type:"pages"},
  {slug:"hut-be-phot-uong-bi",type:"pages"},
  {slug:"lien-he",type:"pages"},
  {slug:"mui-hoi-cong-nguyen-nhan-xu-ly",type:"pages"}, // fallback check
  {slug:"nao-vet-ho-ga-quang-ninh",type:"pages"},
  {slug:"nguyen-nhan-cong-tac-thuong-xuyen-ha-long",type:"pages"},
  {slug:"thong-tac-bon-cau-dong-trieu",type:"pages"},
  {slug:"thong-tac-bon-cau-ha-long",type:"pages"},
];

const results = [];
for(const {slug, type} of ITEMS){
  const r = await wpGet(`/wp-json/wp/v2/${type}?slug=${slug}&context=edit&_fields=id,slug,meta`);
  if(!r[0]){ continue; }
  const p = r[0];
  const desc = (p.meta?.rank_math_description || p.meta?._rank_math_description || "").trim();
  results.push({id: p.id, slug: p.slug, type: type.slice(0,-1), desc, len: [...desc].length});
  console.log(`id=${p.id} type=${type.slice(0,-1)} len=${[...desc].length} slug=${p.slug}`);
}

writeFileSync("reports/meta_short_descs.json", JSON.stringify(results, null, 2), "utf8");
console.log(`\nWritten ${results.length} items to reports/meta_short_descs.json`);
