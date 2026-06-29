/**
 * Fix KEYWORD_STUFFING on thong-tac-cong-* pages
 * Uses same ASCII-based density calculation as audit tool
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

// Same logic as audit tool
function removeDiacritics(s){
  return s.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D");
}
function countWords(t){return(t.match(/\b\w+\b/g)||[]).length;}
function stripHtml(h){return h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}

function keywordDensity(text, focusKeywordAscii){
  const ascii=removeDiacritics(text).toLowerCase();
  const total=countWords(ascii);
  if(!total||!focusKeywordAscii)return{count:0,total,density:0};
  const words=focusKeywordAscii.split(/\s+/).length;
  const phrase=focusKeywordAscii.toLowerCase();
  let count=0,idx=0;
  while((idx=ascii.indexOf(phrase,idx))!==-1){count++;idx+=phrase.length;}
  const density=total>0?(count*words)/total:0;
  return{count,total,density,words};
}

// replaceLastN using ASCII-aware matching on original HTML
// Finds occurrences of the phrase (case-insensitive, diacritic-insensitive) outside HTML tags,
// then replaces the last N with alt text
function replaceLastNAscii(html, phrase, n, alt){
  // Build regex that matches the phrase with diacritics
  // Strategy: find positions in ascii-stripped html, then map back to original html positions
  // Simpler approach: find the phrase in Vietnamese directly with case-insensitive regex
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

// For each post, find the Vietnamese form of the slug keyword by checking common occurrences
function findVietnameseKeyword(text, slugAscii){
  // Try to find the actual Vietnamese text that matches slug
  // Look for phrases that match when diacritics removed
  const slugParts = slugAscii.split(" ");
  const ngramLen = slugParts.length;
  const words = text.split(/\s+/);
  const candidates = {};
  for(let i=0;i<=words.length-ngramLen;i++){
    const ngram = words.slice(i,i+ngramLen).join(" ");
    const ascii = removeDiacritics(ngram).toLowerCase().replace(/[^a-z0-9 ]/g,"");
    if(ascii === slugAscii){
      candidates[ngram]=(candidates[ngram]||0)+1;
    }
  }
  // Return most common form
  const sorted=Object.entries(candidates).sort((a,b)=>b[1]-a[1]);
  return sorted[0]?.[0]||null;
}

// --- page data ---
const PAGES = [
  { slug:"thong-tac-cong-cao-xanh",   id:991,  type:"pages", auditDensity:3.15 },
  { slug:"thong-tac-cong-tuan-chau",  id:993,  type:"pages", auditDensity:4.92 },
  { slug:"thong-tac-cong-gieng-day",  id:992,  type:"pages", auditDensity:4.45 },
  { slug:"thong-tac-cong-ngo-nho-ha-long", id:384, type:"pages", auditDensity:5.62 },
  { slug:"thong-tac-cong-nha-hang-ha-long", id:383, type:"pages", auditDensity:2.62 },
  { slug:"thong-tac-cong-bai-chay",   id:2054, type:"posts", auditDensity:3.78 },
];

const TARGET = 0.020; // aim for 2.0% (comfortably below 2.5%)

for(const {slug, id, type, auditDensity} of PAGES){
  const r=await wpReq("GET",`/wp-json/wp/v2/${type}/${id}?context=edit&_fields=id,slug,content`);
  if(!r?.id){console.log(`✗ ${slug}: not found`);continue;}

  const raw=r.content?.raw||"";
  const text=stripHtml(raw);
  const focusAscii=slug.replace(/-/g," ");
  const kd=keywordDensity(text,focusAscii);

  console.log(`\n${slug}: id=${id} density=${(kd.density*100).toFixed(2)}% count=${kd.count} total=${kd.total} kwWords=${kd.words}`);

  if(kd.density <= 0.025){
    console.log(`  → already OK`);
    continue;
  }

  // Find Vietnamese form
  const viKw=findVietnameseKeyword(text, focusAscii);
  if(!viKw){
    console.log(`  ✗ Could not find Vietnamese form of keyword`);
    continue;
  }
  console.log(`  Vietnamese form: "${viKw}"`);

  // Calculate how many to remove
  const maxCount=Math.floor(TARGET*kd.total/kd.words);
  const toRemove=kd.count-maxCount;
  console.log(`  maxCount=${maxCount} toRemove=${toRemove}`);

  if(toRemove<=0){
    console.log(`  → already OK per raw calc`);
    continue;
  }

  // Build replacement: use shorter phrase without location
  const alt="thông tắc cống tại đây";

  const {html:newRaw,replaced}=replaceLastNAscii(raw,viKw,toRemove,alt);
  const kd2=keywordDensity(stripHtml(newRaw),focusAscii);
  console.log(`  after: density=${(kd2.density*100).toFixed(2)}% count=${kd2.count} replaced=${replaced}`);

  if(kd2.density>0.025){
    console.log(`  ⚠ still above 2.5% — need more removal`);
  }

  const res=await wpReq("POST",`/wp-json/wp/v2/${type}/${id}`,{content:newRaw});
  if(res?.id) console.log(`  ✓ saved`);
  else console.log(`  ✗ ${JSON.stringify(res).slice(0,120)}`);
}

const TODAY="2026-06-10";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-STUFFING-TTC-${TODAY},seo_fix,KEYWORD_STUFFING — thong-tac-cong-* pages (6 pages),https://thongtaccongquangninh.com/,,done,medium,,,,,remove excess keyword instances,tools/fix_thong_tac_cong_stuffing.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("\n✓ logged");
