/**
 * Round 2: add 1 more image to each post to reach 3 total (IMG_LOW threshold)
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

function imageBlock(id,url,alt){
  return `<!-- wp:image {"id":${id},"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="${url}" alt="${alt}" class="wp-image-${id}"/></figure>\n<!-- /wp:image -->\n\n`;
}
async function findMedia(search,perPage=10){
  const r=await wpReq("GET",`/wp-json/wp/v2/media?search=${encodeURIComponent(search)}&per_page=${perPage}&_fields=id,slug,source_url,alt_text`);
  return Array.isArray(r)?r:[];
}

// Append image block at END of content (after last block)
function appendImage(raw,block){
  return raw.trimEnd()+"\n\n"+block;
}

// cong-ty (id=2694): already has 2 images (id=2697, 2696). Add 3rd (2695)
{
  const r=await wpReq("GET","/wp-json/wp/v2/posts/2694?context=edit&_fields=id,slug,content");
  if(r?.id){
    // Use the 3rd candidate image (id=2695)
    const img=await findMedia("hut-be-phot-cong-ty-quang-ninh-2026-01");
    const chosen=img[0]||{id:2695,source_url:"https://thongtaccongquangninh.com/wp-content/uploads/2026/06/hut-be-phot-cong-ty-quang-ninh-2026-01.webp",alt_text:"Xe hút bể phốt công ty tại Hạ Long Quảng Ninh – Môi Trường Đô Thị Số 1"};
    const block=imageBlock(chosen.id,chosen.source_url,chosen.alt_text||"Hút bể phốt công ty Quảng Ninh – xe bồn chuyên dụng");
    const newRaw=appendImage(r.content.raw,block);
    const res=await wpReq("POST","/wp-json/wp/v2/posts/2694",{content:newRaw});
    if(res?.id) console.log(`✓ cong-ty id=2694: added 3rd image id=${chosen.id}`);
    else console.log("✗",JSON.stringify(res).slice(0,120));
  }
}

// nha-hang (id=2687): already has 2 images (id=2690, 2689). Add 3rd (2688)
{
  const r=await wpReq("GET","/wp-json/wp/v2/posts/2687?context=edit&_fields=id,slug,content");
  if(r?.id){
    const img=await findMedia("hut-be-phot-nha-hang-quang-ninh-2026-01");
    const chosen=img[0]||{id:2688,source_url:"https://thongtaccongquangninh.com/wp-content/uploads/2026/06/hut-be-phot-nha-hang-quang-ninh-2026-01.webp",alt_text:"Hút bể phốt nhà hàng Quảng Ninh – thợ kỹ thuật xử lý tại nhà"};
    const block=imageBlock(chosen.id,chosen.source_url,chosen.alt_text||"Hút bể phốt nhà hàng Quảng Ninh – không gián đoạn kinh doanh");
    const newRaw=appendImage(r.content.raw,block);
    const res=await wpReq("POST","/wp-json/wp/v2/posts/2687",{content:newRaw});
    if(res?.id) console.log(`✓ nha-hang id=2687: added 3rd image id=${chosen.id}`);
    else console.log("✗",JSON.stringify(res).slice(0,120));
  }
}

const TODAY="2026-06-10";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-IMG-LOW-R2-${TODAY},seo_fix,IMG_LOW round2 — add 3rd image to cong-ty+nha-hang,https://thongtaccongquangninh.com/,,done,medium,,,,,reach 3 images threshold,tools/fix_img_low_r2.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
