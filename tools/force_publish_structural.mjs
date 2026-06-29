/**
 * Force re-publish 3 structural pages để trigger WP cache invalidation
 */
import https from "node:https";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = process.env.TTCQN_PROJECT_ROOT || path.resolve(__dirname, "..");
const ENV_PATH = path.join(PROJECT, ".env");
const REPORTS_DIR = path.join(PROJECT, "reports");
function localStamp(date = new Date()) {
  const map = Object.fromEntries(
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );
  return `${map.year}-${map.month}-${map.day}T${map.hour}-${map.minute}-${map.second}`;
}
function localIsoFromStamp(stamp) {
  const [datePart, timePart] = String(stamp).split("T");
  return `${datePart}T${String(timePart ?? "").replace(/-/g, ":")}`;
}
const REPORT_PATH = path.join(REPORTS_DIR, `force-publish-structural-${localStamp()}.json`);
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";

function wpPost(id,body){return new Promise((res,rej)=>{
  const b=Buffer.from(JSON.stringify(body),"utf8");
  const o={hostname:SIP,port:443,servername:WPH,path:`/wp-json/wp/v2/pages/${id}`,method:"POST",
    headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length},rejectUnauthorized:false};
  const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
  r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));r.write(b);r.end();
});}

function fetchLive(slug){return new Promise((res,rej)=>{
  const o={hostname:SIP,port:443,servername:WPH,path:`/${slug}/`,method:"GET",
    headers:{Host:WPH,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false};
  const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res({statusCode:resp.statusCode,headers:resp.headers,html:d}))});
  r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();
});}

function stripTagsAndShell(html){
  let h=html;
  h=h.replace(/<script\b[\s\S]*?<\/script>/gi," ");
  h=h.replace(/<style\b[\s\S]*?<\/style>/gi," ");
  h=h.replace(/<noscript\b[\s\S]*?<\/noscript>/gi," ");
  h=h.replace(/<header\b[\s\S]*?<\/header>/gi," ");
  h=h.replace(/<footer\b[\s\S]*?<\/footer>/gi," ");
  h=h.replace(/<nav\b[\s\S]*?<\/nav>/gi," ");
  h=h.replace(/<aside\b[\s\S]*?<\/aside>/gi," ");
  return h;
}
function getMainHtml(html){
  const candidates=[
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]+class=["'][^"']*\bentry-content\b[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/(?:article|main|section)/i,
  ];
  for(const re of candidates){const m=html.match(re);if(m&&m[1]&&m[1].length>500)return m[1];}
  return stripTagsAndShell(html);
}
function countWords(text){
  return text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim().split(/\s+/).filter(Boolean).length;
}
function extractTitle(html){
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : "";
}
function extractCanonical(html){
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return m ? m[1].trim() : "";
}

const PAGES=[
  {id:62,slug:"gioi-thieu"},
  {id:63,slug:"lien-he"},
  {id:2356,slug:"nguyen-song-hao"},
];

console.log("=== Force re-publish ===");
const publishResults = [];
for(const {id,slug} of PAGES){
  const res=await wpPost(id,{status:"publish"});
  publishResults.push({
    id,
    slug,
    ok: Boolean(res?.id),
    status: res?.status ?? null,
    link: res?.link ?? null,
    modified: res?.modified ?? null,
    modified_gmt: res?.modified_gmt ?? null,
    raw: res?.id ? null : res,
  });
  console.log(`  ${slug}: ${res?.id?"✓ published":"✗ "+JSON.stringify(res).slice(0,80)}`);
}

await new Promise(r=>setTimeout(r,3000));

console.log("\n=== Live verify (technical) ===");
const verifyResults = [];
for(const {slug} of PAGES){
  const live=await fetchLive(slug);
  const html = live.html;
  const main=getMainHtml(html);
  const w=countWords(main);
  const title = extractTitle(html);
  const canonical = extractCanonical(html);
  const expectedUrl = `https://${WPH}/${slug}/`;
  const httpOk = live.statusCode === 200;
  const canonicalOk = canonical === expectedUrl;
  const titleOk = Boolean(title);
  const status = httpOk && canonicalOk && titleOk ? "✓ OK" : "✗ CHECK";
  verifyResults.push({
    slug,
    httpStatus: live.statusCode ?? null,
    title,
    canonical,
    expectedUrl,
    httpOk,
    canonicalOk,
    titleOk,
    words: w,
    wordCountStatus: w>=2500?"ok":w>=2000?"below_target":"low",
    status: httpOk && canonicalOk && titleOk ? "ok" : "check",
  });
  console.log(`${status} ${slug}: http=${live.statusCode} canonical=${canonicalOk?"ok":"mismatch"} title=${titleOk?"ok":"missing"} words=${w}`);
}

mkdirSync(REPORTS_DIR, { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify({
  generatedAt: new Date().toISOString(),
  generatedAtLocal: localIsoFromStamp(path.basename(REPORT_PATH, ".json").replace(/^force-publish-structural-/, "")),
  pages: PAGES,
  publishResults,
  verifyResults,
}, null, 2), "utf8");
console.log(`\nReport: ${REPORT_PATH}`);
