/**
 * Audit bài thông tắc cống Hạ Long
 * Thử các slug khả năng cao
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];
const HOTLINES = ["0963.953.533", "0931.156.756"];

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function wpGet(path) {
  return new Promise((res,rej)=>{
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,Authorization:auth},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();
  });
}

function stripTags(s) { return s.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&[a-z#0-9]+;/g,' ').replace(/\s+/g,' ').trim(); }
function countWords(s) { return s.trim().split(/\s+/).filter(Boolean).length; }

// Thử các slug khả năng
const SLUGS_TO_TRY = [
  "thong-tac-cong-ha-long",
  "thong-tac-cong-quang-ninh",
  "cam-nang-thong-tac-cong-tai-ha-long",
];

let foundPost = null;
for (const slug of SLUGS_TO_TRY) {
  const r = await wpGet(`/wp-json/wp/v2/posts?slug=${slug}&context=edit&_fields=id,slug,title,content,meta`);
  if (Array.isArray(r) && r[0]) { foundPost = r[0]; break; }
  const rp = await wpGet(`/wp-json/wp/v2/pages?slug=${slug}&context=edit&_fields=id,slug,title,content,meta`);
  if (Array.isArray(rp) && rp[0]) { foundPost = rp[0]; break; }
}

if (!foundPost) {
  console.log("Không tìm thấy bài với các slug đã thử. Liệt kê tất cả bài có 'thong-tac-cong':");
  const all = await wpGet("/wp-json/wp/v2/posts?per_page=100&_fields=id,slug,title&status=publish");
  const filtered = all.filter(p => p.slug?.includes("thong-tac-cong") || p.slug?.includes("ha-long"));
  for (const p of filtered) console.log(`  id=${p.id} slug=${p.slug}`);
  process.exit(0);
}

const raw = foundPost.content?.raw ?? "";
const plain = stripTags(raw);
const wordCount = countWords(plain);
const title = foundPost.title?.rendered ?? foundPost.title?.raw ?? "(no title)";
const rmTitle = foundPost.meta?.rank_math_title ?? "(not set)";
const rmDesc = foundPost.meta?.rank_math_description ?? "(not set)";

console.log(`\n=== AUDIT: ${foundPost.slug} (id=${foundPost.id}) ===`);
console.log(`WP title (${[...title].length}): "${title}"`);
console.log(`RM title (${[...rmTitle].length}): "${rmTitle}"`);
console.log(`RM desc (${[...rmDesc].length}): "${rmDesc.slice(0,120)}"`);
console.log(`Words: ${wordCount}`);

// H1
const h1s = [...raw.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>stripTags(m[1]));
console.log(`\nH1 (${h1s.length}):`);
h1s.forEach(h=>console.log(`  "${h}"`));

// H2
const h2s = [...raw.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m=>stripTags(m[1]));
console.log(`\nH2 (${h2s.length}):`);
h2s.forEach((h,i)=>console.log(`  [${i}] "${h}"`));

// Checks
const hasNguyenNhan = h2s.some(h=>/nguyên\s*nhân/i.test(h));
const foundForbidden = FORBIDDEN.filter(w=>new RegExp(w,'gi').test(plain));
const hasHotline = HOTLINES.some(h=>plain.includes(h));

// Images
const imgs = [...raw.matchAll(/<img[^>]+>/gi)];
const emptyAlts = imgs.filter(m=>m[0].match(/alt=["']\s*["']/));
const missingAlts = imgs.filter(m=>!m[0].includes('alt='));
const noSvcLoc = imgs.filter(m=>{
  const alt=(m[0].match(/alt=["']([^"']*)["']/)||[])[1]||'';
  return alt && !/quảng ninh|hạ long|thông tắc|hút|nạo vét|bể phốt|hầm cầu|hố ga/i.test(alt);
});

console.log(`\nImages: ${imgs.length} total`);
console.log(`  empty alt: ${emptyAlts.length}, missing alt: ${missingAlts.length}, no svc/loc in alt: ${noSvcLoc.length}`);

// Schema
const schemas = [...raw.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
console.log(`\nSchema blocks: ${schemas.length}`);
const schemaTypes = schemas.map(m=>{try{return JSON.parse(m[1])['@type']}catch{return '?'}});
console.log(`  Types: ${schemaTypes.join(', ')}`);

// Issues summary
console.log("\n=== ISSUES ===");
const issues = [];
if (h1s.length===0) issues.push("NO_H1");
if (h1s.length>1) issues.push(`MULTI_H1(${h1s.length})`);
if (!hasNguyenNhan) issues.push("MISSING_H2:Nguyên nhân");
if (wordCount<2000) issues.push(`WORD_LOW(${wordCount})`);
else if (wordCount>3500) issues.push(`WORD_TOO_LONG(${wordCount})`);
else if (wordCount>2800) issues.push(`WORD_ABOVE_TARGET(${wordCount})`);
if (foundForbidden.length) issues.push(`FORBIDDEN(${foundForbidden.join(',')})`);
if (!hasHotline) issues.push("NO_HOTLINE");
if (imgs.length<3) issues.push(`IMG_LOW(${imgs.length})`);
if (emptyAlts.length) issues.push(`EMPTY_ALT×${emptyAlts.length}`);
if (noSvcLoc.length) issues.push(`ALT_NO_SVC_LOC×${noSvcLoc.length}`);
const titleLen = [...title].length;
if (titleLen>65) issues.push(`TITLE_LONG(${titleLen})`);
if (titleLen<50) issues.push(`TITLE_SHORT(${titleLen})`);

if (issues.length===0) console.log("✓ ALL CLEAR");
else issues.forEach(i=>console.log(`  ⚠ ${i}`));
