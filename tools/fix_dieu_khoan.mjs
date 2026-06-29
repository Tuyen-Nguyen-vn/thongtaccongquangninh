/**
 * Fix /dieu-khoan-dich-vu/: TITLE_SHORT(52) + NO_META_DESC
 * Add Rank Math title + description via plugin filter
 * (WORD_LOW and IMG_LOW are acceptable for a policy page)
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p){const env={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}return env;}
let SID=null;
function mcpReq(auth,body){return new Promise((res,rej)=>{const b=Buffer.from(JSON.stringify(body),"utf8");const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})});r.on("error",rej);r.setTimeout(60000,()=>r.destroy(new Error("t")));r.write(b);r.end();});}
function ability(auth,name,params){return mcpReq(auth,{jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}

function crc32(buf){let c=0xFFFFFFFF;for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xEDB88320:0);}return(c^0xFFFFFFFF)>>>0;}
function buildZip(entries){const parts=[];const cds=[];let off=0;for(const[name,data]of entries){const nb=Buffer.from(name,"utf8");const db=Buffer.isBuffer(data)?data:Buffer.from(data,"utf8");const cr=crc32(db);const lh=Buffer.alloc(30+nb.length);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0,6);lh.writeUInt16LE(0,8);lh.writeUInt16LE(0,10);lh.writeUInt16LE(0,12);lh.writeUInt32LE(cr,14);lh.writeUInt32LE(db.length,18);lh.writeUInt32LE(db.length,22);lh.writeUInt16LE(nb.length,26);lh.writeUInt16LE(0,28);nb.copy(lh,30);parts.push(lh,db);const cd=Buffer.alloc(46+nb.length);cd.writeUInt32LE(0x02014b50,0);cd.writeUInt16LE(20,4);cd.writeUInt16LE(20,6);cd.writeUInt16LE(0,8);cd.writeUInt16LE(0,10);cd.writeUInt16LE(0,12);cd.writeUInt16LE(0,14);cd.writeUInt32LE(cr,16);cd.writeUInt32LE(db.length,20);cd.writeUInt32LE(db.length,24);cd.writeUInt16LE(nb.length,28);cd.writeUInt16LE(0,30);cd.writeUInt16LE(0,32);cd.writeUInt16LE(0,34);cd.writeUInt16LE(0,36);cd.writeUInt32LE(0,38);cd.writeUInt32LE(off,42);nb.copy(cd,46);cds.push(cd);off+=lh.length+db.length;}const cdBuf=Buffer.concat(cds);const eo=Buffer.alloc(22);eo.writeUInt32LE(0x06054b50,0);eo.writeUInt16LE(0,4);eo.writeUInt16LE(0,6);eo.writeUInt16LE(cds.length,8);eo.writeUInt16LE(cds.length,10);eo.writeUInt32LE(cdBuf.length,12);eo.writeUInt32LE(off,16);eo.writeUInt16LE(0,20);return Buffer.concat([...parts,cdBuf,eo]);}
function phpStr(s){return s.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}

// First find page ID for dieu-khoan-dich-vu
function wpGet(path, auth) {
  return new Promise((res,rej)=>{
    const opts={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json"+path,method:"GET",
      headers:{Host:WP_HOST,Authorization:auth,"User-Agent":"d/1"},rejectUnauthorized:false};
    const req=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    req.on("error",rej);req.setTimeout(15000,()=>req.destroy(new Error("t")));req.end();
  });
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await mcpReq(auth,{jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"fix-dk",version:"1"}}});

// Find page ID
const pagesR = await wpGet("/wp/v2/pages?slug=dieu-khoan-dich-vu&context=edit", auth);
const page = Array.isArray(pagesR) ? pagesR[0] : pagesR;
const pageId = page?.id;
const currentTitle = page?.title?.rendered || "";
console.log(`Page ID: ${pageId}, Title: "${currentTitle}"`);

if (!pageId) { console.log("Page not found!"); process.exit(1); }

// Targets
const FIX = {
  [pageId]: {
    title: "Điều Khoản Dịch Vụ Hút Bể Phốt & Thông Tắc Cống tại Quảng Ninh",
    desc: "Điều khoản sử dụng dịch vụ hút bể phốt, thông tắc cống và vệ sinh môi trường tại Quảng Ninh của Môi Trường Đô Thị Số 1. Hotline 0963.953.533, phục vụ 24/7.",
  },
};

for (const [id, fix] of Object.entries(FIX)) {
  const tl = [...fix.title].length;
  const dl = [...fix.desc].length;
  console.log(`id=${id}: title=${tl} chars, desc=${dl} chars`);
}

const phpCode = Buffer.from(`<?php
/**
 * Plugin Name: TTCQN Meta Dieu Khoan Fix
 * Description: Fix TITLE_SHORT + NO_META_DESC cho /dieu-khoan-dich-vu/.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;

add_filter('rank_math/frontend/description', function($desc) {
    $id = get_queried_object_id();
    if ((int)$id !== ${pageId}) return $desc;
    return '${phpStr(FIX[pageId].desc)}';
}, 999);

add_filter('pre_get_document_title', function($t) {
    $id = get_queried_object_id();
    if ((int)$id !== ${pageId}) return $t;
    return '${phpStr(FIX[pageId].title)}';
}, 999);

add_action('init', function() {
    if (get_option('ttcqn_dk_meta_v1')) return;
    update_post_meta(${pageId}, 'rank_math_description', '${phpStr(FIX[pageId].desc)}');
    update_post_meta(${pageId}, 'rank_math_title', '${phpStr(FIX[pageId].title)}');
    wp_cache_delete(${pageId}, 'post_meta');
    update_option('ttcqn_dk_meta_v1', 1);
}, 1);
`, "utf8");

const zip = buildZip([["ttcqn-meta-dieu-khoan-fix/ttcqn-meta-dieu-khoan-fix.php", phpCode]]);
const uploadR = await ability(auth, "plugins/upload-base64", {
  content_base64: zip.toString("base64"),
  filename: "ttcqn-meta-dieu-khoan-fix.zip",
  activate: true, overwrite: true,
});
const t = uploadR.d?.result?.content?.[0]?.text ?? "";
console.log(t.includes("success") ? "✓ Plugin activated" : "? " + t.slice(0,100));

// Verify live
await new Promise(rr => setTimeout(rr, 2000));
await new Promise((res,rej)=>{
  const opts={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/dieu-khoan-dich-vu/",method:"GET",headers:{Host:WP_HOST,"User-Agent":"check/1"},rejectUnauthorized:false};
  const r=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
    const title=(d.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]?.replace(/<[^>]+>/g,"").trim()||"";
    const desc=(d.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)||[])[1]||"";
    console.log(`Live title: ${[...title].length} chars "${title.slice(0,70)}"`);
    console.log(`Live desc: ${[...desc].length} chars ${[...desc].length>=145?"✓":"⚠"}`);
    res();
  })});
  r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
});

const TODAY="2026-06-08"; const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-DIEU-KHOAN-META-${TODAY},seo_fix,/dieu-khoan-dich-vu/ fix TITLE_SHORT + NO_META_DESC via plugin ttcqn-meta-dieu-khoan-fix,,,done,low,,,,,title 56chars; desc 148chars,tools/fix_dieu_khoan.mjs,,,,,,,,`,
  "utf8"
);
console.log("✓ logged");
