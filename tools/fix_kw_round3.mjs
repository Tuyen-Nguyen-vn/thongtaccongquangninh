/**
 * Round 3 keyword stuffing fix:
 *   nao-vet-ho-ga: 2.67% → remove 2 more to reach <2.5%
 *   nguyen-nhan-cong-tac: 7.24% → replace 18 instances to reach ~1.5%
 *   nguyen-song-hao: investigate URL and fix
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
      headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},
      rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();
  });
}

function replaceLastN(html,phrase,n,alt){
  const re=new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+'),'gi');
  const positions=[];let m;
  while((m=re.exec(html))!==null){
    const before=html.slice(0,m.index);
    if((before.match(/</g)||[]).length===(before.match(/>/g)||[]).length)
      positions.push({start:m.index,end:m.index+m[0].length});
  }
  if(!positions.length)return{html,replaced:0};
  const toReplace=positions.slice(-n);let result=html;
  for(const pos of toReplace.reverse())result=result.slice(0,pos.start)+alt+result.slice(pos.end);
  return{html:result,replaced:toReplace.length};
}
function stripHtml(h){return h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
function wc(t){return t.split(/\s+/).filter(Boolean).length;}
function cnt(text,kw){return(text.match(new RegExp(kw.replace(/\s+/g,"\\s+"),"gi"))||[]).length;}

// --- 1. nao-vet-ho-ga (post id=1368) ---
// Current: 4×16/2400=2.67%. Need ≤15 → density 4×15/2400=2.50% (borderline)
// Remove 2 more to get to 14: 4×14/2400=2.33% ✓
{
  const r=await wpReq("GET","/wp-json/wp/v2/posts/1368?context=edit&_fields=id,slug,content");
  if(r?.id){
    const {html:raw2,replaced}=replaceLastN(r.content.raw,"nạo vét hố ga",2,"công tác vét hố ga");
    const text=stripHtml(raw2);
    const c=cnt(text,"nạo vét hố ga"); const w=wc(text);
    const d=(4*c/w*100).toFixed(2);
    const res=await wpReq("POST","/wp-json/wp/v2/posts/1368",{content:raw2});
    if(res?.id) console.log(`✓ nao-vet-ho-ga: replaced=${replaced} cnt=${c}/${w} density=${d}%`);
    else console.log(`✗ nao-vet-ho-ga: ${JSON.stringify(res).slice(0,100)}`);
  }
}

// --- 2. nguyen-nhan-cong-tac (page id=386) ---
// kw "nguyên nhân cống tắc thường xuyên Hạ Long" (8 words), 26/2874=7.24%
// Need count ≤ 8 (8×8/2874=2.23%). Remove 18.
// Strategy: replace with "nguyên nhân tắc nghẽn tại Hạ Long" — breaks 8-word sequence
{
  const r=await wpReq("GET","/wp-json/wp/v2/pages/386?context=edit&_fields=id,slug,content");
  if(r?.id){
    const kw="nguyên nhân cống tắc thường xuyên Hạ Long";
    const {html:raw2,replaced}=replaceLastN(r.content.raw,kw,18,"nguyên nhân tắc nghẽn tại Hạ Long");
    const text=stripHtml(raw2);
    const c=cnt(text,kw); const w=wc(text);
    const d=(8*c/w*100).toFixed(2);
    const res=await wpReq("POST","/wp-json/wp/v2/pages/386",{content:raw2});
    if(res?.id) console.log(`✓ nguyen-nhan-cong-tac: replaced=${replaced} cnt=${c}/${w} density=${d}%`);
    else console.log(`✗ nguyen-nhan-cong-tac: ${JSON.stringify(res).slice(0,100)}`);
  }
}

// --- 3. nguyen-song-hao: find correct type ---
for(const type of ["posts","pages"]){
  const list=await wpReq("GET",`/wp-json/wp/v2/${type}?slug=nguyen-song-hao&_fields=id,slug,status`);
  if(Array.isArray(list)&&list[0]) console.log(`nguyen-song-hao found as ${type} id=${list[0].id} status=${list[0].status}`);
}

// Try fetching by known page id (was 2356 from last session)
const p2356=await wpReq("GET","/wp-json/wp/v2/pages/2356?context=edit&_fields=id,slug,content");
if(p2356?.id){
  const kw="Nguyễn Song Hào";
  const text0=stripHtml(p2356.content.raw);
  const c0=cnt(text0,kw); const w0=wc(text0);
  console.log(`page 2356 slug=${p2356.slug} cnt=${c0}/${w0} density=${(3*c0/w0*100).toFixed(2)}%`);
  // Replace last 5 more
  const {html:raw2,replaced}=replaceLastN(p2356.content.raw,kw,5,"giám đốc");
  const text2=stripHtml(raw2);
  const c=cnt(text2,kw); const w=wc(text2);
  const d=(3*c/w*100).toFixed(2);
  const res=await wpReq("POST","/wp-json/wp/v2/pages/2356",{content:raw2});
  if(res?.id) console.log(`✓ nguyen-song-hao p2356: replaced=${replaced} cnt=${c}/${w} density=${d}%`);
  else console.log(`✗ nguyen-song-hao p2356`);
}

const TODAY="2026-06-10";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-KW-ROUND3-${TODAY},seo_fix,KEYWORD_STUFFING round3 — nao-vet+nguyen-nhan+nguyen-song,https://thongtaccongquangninh.com/,,done,medium,,,,,final stuffing cleanup,tools/fix_kw_round3.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
