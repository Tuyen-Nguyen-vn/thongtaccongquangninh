/**
 * Round 2: remove more occurrences to get density < 2.5%
 * Target: count ≤ 12 per post (5-word keyword at ~3500 rendered words = 1.7%)
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

const TARGETS = [
  {id:436,  type:"pages", kw:"hút bể phốt Bãi Cháy",   remove:7, alt:"xe hút bể phốt tại Bãi Cháy"},
  {id:2048, type:"posts", kw:"hút bể phốt Bình Liêu",   remove:8, alt:"xe hút bể phốt tại Bình Liêu"},
  {id:2049, type:"posts", kw:"hút bể phốt Cô Tô",        remove:9, alt:"xe hút bể phốt tại Cô Tô"},
  {id:2050, type:"posts", kw:"hút bể phốt Đầm Hà",      remove:8, alt:"xe hút bể phốt tại Đầm Hà"},
  {id:2051, type:"posts", kw:"hút bể phốt Hải Hà",      remove:9, alt:"xe hút bể phốt tại Hải Hà"},
  {id:2052, type:"posts", kw:"hút bể phốt Tiên Yên",    remove:9, alt:"xe hút bể phốt tại Tiên Yên"},
];

function stripHtml(h){return h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
function wordCount(t){return t.split(/\s+/).filter(Boolean).length;}
function countKw(text,kw){const re=new RegExp(kw.replace(/\s+/g,"\\s+"),"gi");return(text.match(re)||[]).length;}

let ok=0,fail=0;
for(const {id,type,kw,remove,alt} of TARGETS){
  const r=await wpReq("GET",`/wp-json/wp/v2/${type}/${id}?context=edit&_fields=id,slug,content`);
  if(!r?.id){console.log(`⚠ id=${id}: fetch failed`);fail++;continue;}
  const rawOld=r.content?.raw||"";
  const {html:rawNew,replaced}=replaceLastN(rawOld,kw,remove,alt);
  if(!replaced){console.log(`⚠ ${r.slug}: 0 occurrences of "${kw}"`);fail++;continue;}
  const textNew=stripHtml(rawNew);
  const wc=wordCount(textNew);
  const kwW=kw.split(/\s+/).length;
  const cnt=countKw(textNew,kw);
  const den=(kwW*cnt/wc*100).toFixed(2);
  const res=await wpReq("POST",`/wp-json/wp/v2/${type}/${id}`,{content:rawNew});
  if(res?.id){console.log(`✓ ${res.slug}: replaced=${replaced} cnt=${cnt}/${wc} density=${den}%`);ok++;}
  else{console.log(`✗ id=${id}: ${JSON.stringify(res).slice(0,120)}`);fail++;}
}
console.log(`\n✓ ${ok} ok, ${fail} failed`);

const TODAY="2026-06-10";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-KW-STUFFING-PASS2-${TODAY},seo_fix,KEYWORD_STUFFING pass2 — target count≤12 density<2.5%,https://thongtaccongquangninh.com/,,done,medium,,,,,replace last N occurrences round 2,tools/fix_keyword_stuffing_pass2.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
