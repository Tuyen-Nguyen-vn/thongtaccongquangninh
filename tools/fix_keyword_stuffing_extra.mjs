/**
 * Fix nao-vet-ho-ga (bad pass1 replacement) + nguyen-song-hao
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

function replaceLastN(html,phrase,n,alt){
  const re=new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+'),'gi');
  const positions=[];let m;
  while((m=re.exec(html))!==null){
    const before=html.slice(0,m.index);
    const open=(before.match(/</g)||[]).length;
    const close=(before.match(/>/g)||[]).length;
    if(open===close)positions.push({start:m.index,end:m.index+m[0].length});
  }
  if(!positions.length)return{html,replaced:0};
  const toReplace=positions.slice(-n);
  let result=html;
  for(const pos of toReplace.reverse())result=result.slice(0,pos.start)+alt+result.slice(pos.end);
  return{html:result,replaced:toReplace.length};
}
function replaceAll(html,phrase,alt){return replaceLastN(html,phrase,9999,alt);}

function stripHtml(h){return h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
function wordCount(t){return t.split(/\s+/).filter(Boolean).length;}
function countKw(text,kw){const re=new RegExp(kw.replace(/\s+/g,"\\s+"),"gi");return(text.match(re)||[]).length;}

// --- FIX nao-vet-ho-ga (post) ---
{
  const list=await wpReq("GET",`/wp-json/wp/v2/posts?slug=nao-vet-ho-ga&context=edit&_fields=id,slug,content`);
  if(Array.isArray(list)&&list[0]){
    const p=list[0];
    let raw=p.content?.raw||"";
    // Step 1: undo bad pass1 replacement ("dịch vụ nạo vét hố ga" → "công tác vét bùn hố ga")
    // "dịch vụ nạo vét hố ga" contains "nạo vét hố ga", need to collapse all to neutral first
    const {html:r1,replaced:r1n}=replaceAll(raw,"dịch vụ nạo vét hố ga","công tác thông hố ga Quảng Ninh");
    // Step 2: now replace remaining "nạo vét hố ga" instances (last 5)
    const {html:r2,replaced:r2n}=replaceLastN(r1,"nạo vét hố ga",5,"công tác vét bùn hố ga");
    const text=stripHtml(r2);
    const wc=wordCount(text);
    const cnt=countKw(text,"nạo vét hố ga");
    const den=(4*cnt/wc*100).toFixed(2);
    const res=await wpReq("POST",`/wp-json/wp/v2/posts/${p.id}`,{content:r2});
    if(res?.id)console.log(`✓ nao-vet-ho-ga id=${p.id}: undo=${r1n} extra=${r2n} cnt=${cnt}/${wc} density=${den}%`);
    else console.log(`✗ nao-vet-ho-ga: ${JSON.stringify(res).slice(0,120)}`);
  } else {
    console.log("⚠ nao-vet-ho-ga NOT FOUND");
  }
}

// --- FIX nguyen-song-hao ---
// keyword "Nguyễn Song Hào" (3 words), 14 in 1189 = 3.53%
// Need count ≤ 9 (3×9/1189 = 2.27% < 2.5%)
{
  const list=await wpReq("GET",`/wp-json/wp/v2/posts?slug=nguyen-song-hao&context=edit&_fields=id,slug,content`);
  if(Array.isArray(list)&&list[0]){
    const p=list[0];
    let raw=p.content?.raw||"";
    // Replace last 5 occurrences with pronouns/titles for natural variation
    const {html:r1,replaced:r1n}=replaceLastN(raw,"Nguyễn Song Hào",5,"ông");
    const text=stripHtml(r1);
    const wc=wordCount(text);
    const cnt=countKw(text,"Nguyễn Song Hào");
    const den=(3*cnt/wc*100).toFixed(2);
    const res=await wpReq("POST",`/wp-json/wp/v2/posts/${p.id}`,{content:r1});
    if(res?.id)console.log(`✓ nguyen-song-hao id=${p.id}: replaced=${r1n} cnt=${cnt}/${wc} density=${den}%`);
    else console.log(`✗ nguyen-song-hao: ${JSON.stringify(res).slice(0,120)}`);
  } else {
    console.log("⚠ nguyen-song-hao NOT FOUND");
  }
}

const TODAY="2026-06-10";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-KW-STUFFING-EXTRA-${TODAY},seo_fix,KEYWORD_STUFFING nao-vet+nguyen-song-hao fix,https://thongtaccongquangninh.com/,,done,medium,,,,,undo bad replacement + reduce person name density,tools/fix_keyword_stuffing_extra.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
