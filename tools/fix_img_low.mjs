/**
 * Fix IMG_LOW: inject existing media library images into posts 2694 & 2687
 * Searches WP media for suitable images by keyword, then prepends image block to content
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function wpReq(method,path,body){
  return new Promise((res,rej)=>{
    const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,
      headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();
  });
}

// Build a Gutenberg image block
function imageBlock(id, url, alt){
  return `<!-- wp:image {"id":${id},"sizeSlug":"large","linkDestination":"none"} -->\n<figure class="wp-block-image size-large"><img src="${url}" alt="${alt}" class="wp-image-${id}"/></figure>\n<!-- /wp:image -->\n\n`;
}

// Search media by filename keyword
async function findMedia(search, perPage=5){
  const r=await wpReq("GET",`/wp-json/wp/v2/media?search=${encodeURIComponent(search)}&per_page=${perPage}&_fields=id,slug,source_url,alt_text`);
  return Array.isArray(r)?r:[];
}

// Fetch post content
async function getPost(type,id){
  return await wpReq("GET",`/wp-json/wp/v2/${type}/${id}?context=edit&_fields=id,slug,content`);
}

// Prepend image block before first paragraph
function prependImages(raw, blocks){
  // Find first paragraph block or just prepend at top
  const paraIdx=raw.indexOf('<!-- wp:paragraph');
  if(paraIdx>0) return raw.slice(0,paraIdx)+blocks+raw.slice(paraIdx);
  return blocks+raw;
}

// --- post 2694: hut-be-phot-cong-ty ---
{
  const post=await getPost("posts",2694);
  if(post?.id){
    // Search for company/industrial themed images
    let imgs=await findMedia("cong-ty");
    if(!imgs.length) imgs=await findMedia("hut-be-phot-cong-ty");
    if(!imgs.length) imgs=await findMedia("xe-hut-be-phot");
    console.log(`cong-ty: found ${imgs.length} candidates`);
    imgs.slice(0,3).forEach(i=>console.log(`  id=${i.id} slug=${i.slug} alt="${i.alt_text||''}"`));

    if(imgs.length>0){
      // Use up to 2 images
      const selected=imgs.slice(0,2);
      let blocks="";
      for(const img of selected){
        const alt=img.alt_text||"Hút bể phốt công ty Quảng Ninh – xe bồn chuyên dụng";
        blocks+=imageBlock(img.id,img.source_url,alt);
      }
      const newRaw=prependImages(post.content.raw,blocks);
      const res=await wpReq("POST","/wp-json/wp/v2/posts/2694",{content:newRaw});
      if(res?.id) console.log(`✓ cong-ty: added ${selected.length} image(s)`);
      else console.log("✗ cong-ty:",JSON.stringify(res).slice(0,120));
    } else {
      console.log("⚠ cong-ty: no suitable image found in media library");
    }
  }
}

// --- post 2687: hut-be-phot-nha-hang ---
{
  const post=await getPost("posts",2687);
  if(post?.id){
    let imgs=await findMedia("nha-hang");
    if(!imgs.length) imgs=await findMedia("hut-be-phot-nha-hang");
    if(!imgs.length) imgs=await findMedia("hut-be-phot-bai-chay");
    console.log(`\nnha-hang: found ${imgs.length} candidates`);
    imgs.slice(0,3).forEach(i=>console.log(`  id=${i.id} slug=${i.slug} alt="${i.alt_text||''}"`));

    if(imgs.length>0){
      const selected=imgs.slice(0,2);
      let blocks="";
      for(const img of selected){
        const alt=img.alt_text||"Hút bể phốt nhà hàng Quảng Ninh – dịch vụ không gián đoạn kinh doanh";
        blocks+=imageBlock(img.id,img.source_url,alt);
      }
      const newRaw=prependImages(post.content.raw,blocks);
      const res=await wpReq("POST","/wp-json/wp/v2/posts/2687",{content:newRaw});
      if(res?.id) console.log(`✓ nha-hang: added ${selected.length} image(s)`);
      else console.log("✗ nha-hang:",JSON.stringify(res).slice(0,120));
    } else {
      console.log("⚠ nha-hang: no suitable image found in media library");
    }
  }
}

const TODAY="2026-06-10";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-IMG-LOW-${TODAY},seo_fix,IMG_LOW — inject images into cong-ty + nha-hang posts,https://thongtaccongquangninh.com/,,done,medium,,,,,add existing media to img-free posts,tools/fix_img_low.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("\n✓ logged");
