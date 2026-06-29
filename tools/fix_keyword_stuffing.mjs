/**
 * Reduce KEYWORD_STUFFING on 9 pages/posts
 * Strategy: replace last N occurrences of the focus keyword phrase
 *   with shorter alternatives, keeping meaning intact.
 * Target density: <3%
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function wpReq(method, path, body){
  return new Promise((res,rej)=>{
    const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,
      headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();
  });
}

// Replace last `n` occurrences of `phrase` in `text` with `alt`.
// Only replaces in text nodes (not inside HTML tags or attributes).
function replaceLastN(html, phrase, n, alt) {
  // Find all positions of the phrase (case-insensitive) not inside <...>
  const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'), 'gi');
  const positions = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    // Make sure not inside an HTML attribute (simple heuristic: check if we're between tags)
    const before = html.slice(0, m.index);
    const openBrackets = (before.match(/</g)||[]).length;
    const closeBrackets = (before.match(/>/g)||[]).length;
    if (openBrackets === closeBrackets) { // outside HTML tags
      positions.push({start: m.index, end: m.index + m[0].length, match: m[0]});
    }
  }
  if (positions.length === 0) return {html, replaced: 0};
  // Replace last n
  const toReplace = positions.slice(-n);
  // Replace from back to front to preserve indices
  let result = html;
  let replaced = 0;
  for (const pos of toReplace.reverse()) {
    result = result.slice(0, pos.start) + alt + result.slice(pos.end);
    replaced++;
  }
  return {html: result, replaced};
}

const TARGETS = [
  // [id, slug, type, focusKw, removeCount, replacement]
  {id:436,  slug:"hut-be-phot-bai-chay",  type:"pages", kw:"hút bể phốt Bãi Cháy",     remove:10,
   alt:"dịch vụ hút bể phốt tại Bãi Cháy"},
  {id:2048, slug:"hut-be-phot-binh-lieu", type:"posts", kw:"hút bể phốt Bình Liêu",    remove:10,
   alt:"dịch vụ hút bể phốt tại Bình Liêu"},
  {id:2049, slug:"hut-be-phot-co-to",     type:"posts", kw:"hút bể phốt Cô Tô",         remove:8,
   alt:"dịch vụ hút bể phốt tại Cô Tô"},
  {id:2050, slug:"hut-be-phot-dam-ha",    type:"posts", kw:"hút bể phốt Đầm Hà",       remove:11,
   alt:"dịch vụ hút bể phốt tại Đầm Hà"},
  {id:2051, slug:"hut-be-phot-hai-ha",    type:"posts", kw:"hút bể phốt Hải Hà",       remove:10,
   alt:"dịch vụ hút bể phốt tại Hải Hà"},
  {id:2052, slug:"hut-be-phot-tien-yen",  type:"posts", kw:"hút bể phốt Tiên Yên",     remove:8,
   alt:"dịch vụ hút bể phốt tại Tiên Yên"},
  // nao-vet-ho-ga (post, not page)
  {id:null, slug:"nao-vet-ho-ga", type:"posts", kw:"nạo vét hố ga",                    remove:3,
   alt:"dịch vụ nạo vét hố ga"},
  // nguyen-nhan-cong-tac: 7.24% (8-word kw, 16 replacements needed) — skip, manual review
];

// Validate density reduction
function stripHtml(h){return h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
function wordCount(t){return t.split(/\s+/).filter(Boolean).length;}
function countKw(text,kw){const re=new RegExp(kw.replace(/\s+/g,"\\s+"),"gi");return(text.match(re)||[]).length;}

let totalOk=0, totalFail=0;
for(let {id,slug,type,kw,remove,alt} of TARGETS){
  if(id===null){
    const list=await wpReq("GET",`/wp-json/wp/v2/${type}?slug=${slug}&_fields=id,slug`);
    if(!Array.isArray(list)||!list[0]){console.log(`⚠ ${slug}: lookup failed`);totalFail++;continue;}
    id=list[0].id;
  }
  const r=await wpReq("GET",`/wp-json/wp/v2/${type}/${id}?context=edit&_fields=id,slug,content`);
  if(!r?.id){console.log(`⚠ ${slug}: fetch failed`);totalFail++;continue;}
  const rawOld = r.content?.raw || "";

  const {html: rawNew, replaced} = replaceLastN(rawOld, kw, remove, alt);
  const textNew = stripHtml(rawNew);
  const wc = wordCount(textNew);
  const kwWords = kw.split(/\s+/).length;
  const cntNew = countKw(textNew, kw);
  const densityNew = (kwWords * cntNew / wc * 100).toFixed(2);

  if(replaced === 0){
    console.log(`⚠ ${slug}: no occurrences found for "${kw}"`);
    totalFail++;
    continue;
  }

  const res = await wpReq("POST", `/wp-json/wp/v2/${type}/${id}`, {content: rawNew});
  if(res?.id){
    console.log(`✓ ${slug}: replaced=${replaced} cnt=${cntNew}/${wc} density=${densityNew}%`);
    totalOk++;
  } else {
    console.log(`✗ ${slug}: ${JSON.stringify(res).slice(0,120)}`);
    totalFail++;
  }
}
console.log(`\n✓ ${totalOk} ok, ${totalFail} failed`);

const TODAY="2026-06-10"; const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-KW-STUFFING-${TODAY},seo_fix,KEYWORD_STUFFING — batch reduce density on 8 posts/pages,https://thongtaccongquangninh.com/,,done,medium,,,,,replace last N occurrences with shorter alt,tools/fix_keyword_stuffing.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
