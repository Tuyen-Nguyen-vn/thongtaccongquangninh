/**
 * Final fixes: nao-vet-ho-ga (2 more removals) + nguyen-song-hao (page type)
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
    if((before.match(/</g)||[]).length===(before.match(/>/g)||[]).length)
      positions.push({start:m.index,end:m.index+m[0].length});
  }
  if(!positions.length)return{html,replaced:0};
  const toReplace=positions.slice(-n);let result=html;
  for(const pos of toReplace.reverse())result=result.slice(0,pos.start)+alt+result.slice(pos.end);
  return{html:result,replaced:toReplace.length};
}
function stripHtml(h){return h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
function wordCount(t){return t.split(/\s+/).filter(Boolean).length;}
function countKw(text,kw){return(text.match(new RegExp(kw.replace(/\s+/g,"\\s+"),"gi"))||[]).length;}

// nao-vet-ho-ga: remove 2 more → cnt=16, density=4×16/~2680=2.39%
{
  const r=await wpReq("GET","/wp-json/wp/v2/posts/1368?context=edit&_fields=id,slug,content");
  if(r?.id){
    const {html:raw2,replaced}=replaceLastN(r.content.raw,"nạo vét hố ga",3,"công tác vét bùn hố ga");
    const text=stripHtml(raw2);const wc=wordCount(text);
    const cnt=countKw(text,"nạo vét hố ga");
    const den=(4*cnt/wc*100).toFixed(2);
    const res=await wpReq("POST","/wp-json/wp/v2/posts/1368",{content:raw2});
    if(res?.id)console.log(`✓ nao-vet-ho-ga: replaced=${replaced} cnt=${cnt}/${wc} density=${den}%`);
    else console.log(`✗ nao-vet-ho-ga: ${JSON.stringify(res).slice(0,100)}`);
  }
}

// nguyen-song-hao: try pages type
{
  const list=await wpReq("GET","/wp-json/wp/v2/pages?slug=nguyen-song-hao&context=edit&_fields=id,slug,content");
  if(Array.isArray(list)&&list[0]){
    const p=list[0];
    const {html:raw2,replaced}=replaceLastN(p.content.raw,"Nguyễn Song Hào",5,"ông");
    const text=stripHtml(raw2);const wc=wordCount(text);
    const cnt=countKw(text,"Nguyễn Song Hào");
    const den=(3*cnt/wc*100).toFixed(2);
    const res=await wpReq("POST",`/wp-json/wp/v2/pages/${p.id}`,{content:raw2});
    if(res?.id)console.log(`✓ nguyen-song-hao id=${p.id}: replaced=${replaced} cnt=${cnt}/${wc} density=${den}%`);
    else console.log(`✗ nguyen-song-hao: ${JSON.stringify(res).slice(0,100)}`);
  } else {
    console.log("⚠ nguyen-song-hao not found in pages either");
  }
}

const TODAY="2026-06-10";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-KW-STUFFING-FINAL-${TODAY},seo_fix,KEYWORD_STUFFING final — nao-vet + nguyen-song-hao,https://thongtaccongquangninh.com/,,done,medium,,,,,final pass to reach <2.5% density,tools/fix_keyword_stuffing_final.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
