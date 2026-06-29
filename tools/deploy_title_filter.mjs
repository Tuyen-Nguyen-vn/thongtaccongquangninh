/**
 * Deploy plugin dùng pre_get_document_title filter để trực tiếp set <title> cho page 282.
 * Bypass Rank Math hoàn toàn — đây là cách chắc nhất.
 * Title: "Chính Sách Bảo Mật Thông Tin Khách Hàng | Môi Trường Đô Thị Số 1" (64 chars)
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com"; const PAGE_ID = 282;

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
let SID=null;
function mcpReq(auth,body) { return new Promise((res,rej)=>{ const b=Buffer.from(JSON.stringify(body),"utf8"); const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false}; const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})}); r.on("error",rej);r.setTimeout(60000,()=>r.destroy(new Error("t")));r.write(b);r.end(); }); }
function ability(auth,name,params){return mcpReq(auth,{jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}

function crc32(buf) { let c=0xFFFFFFFF; for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xEDB88320:0);} return(c^0xFFFFFFFF)>>>0; }
function buildZip(entries) {
  const parts=[]; const cds=[]; let off=0;
  for(const[name,data]of entries){
    const nb=Buffer.from(name,"utf8"); const db=Buffer.isBuffer(data)?data:Buffer.from(data,"utf8");
    const cr=crc32(db);
    const lh=Buffer.alloc(30+nb.length);
    lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0,6);lh.writeUInt16LE(0,8);lh.writeUInt16LE(0,10);lh.writeUInt16LE(0,12);lh.writeUInt32LE(cr,14);lh.writeUInt32LE(db.length,18);lh.writeUInt32LE(db.length,22);lh.writeUInt16LE(nb.length,26);lh.writeUInt16LE(0,28);nb.copy(lh,30);
    parts.push(lh,db);
    const cd=Buffer.alloc(46+nb.length);
    cd.writeUInt32LE(0x02014b50,0);cd.writeUInt16LE(20,4);cd.writeUInt16LE(20,6);cd.writeUInt16LE(0,8);cd.writeUInt16LE(0,10);cd.writeUInt16LE(0,12);cd.writeUInt16LE(0,14);cd.writeUInt32LE(cr,16);cd.writeUInt32LE(db.length,20);cd.writeUInt32LE(db.length,24);cd.writeUInt16LE(nb.length,28);cd.writeUInt16LE(0,30);cd.writeUInt16LE(0,32);cd.writeUInt16LE(0,34);cd.writeUInt16LE(0,36);cd.writeUInt32LE(0,38);cd.writeUInt32LE(off,42);nb.copy(cd,46);
    cds.push(cd); off+=lh.length+db.length;
  }
  const cdBuf=Buffer.concat(cds); const eo=Buffer.alloc(22);
  eo.writeUInt32LE(0x06054b50,0);eo.writeUInt16LE(0,4);eo.writeUInt16LE(0,6);eo.writeUInt16LE(cds.length,8);eo.writeUInt16LE(cds.length,10);eo.writeUInt32LE(cdBuf.length,12);eo.writeUInt32LE(off,16);eo.writeUInt16LE(0,20);
  return Buffer.concat([...parts,cdBuf,eo]);
}

// PHP file with actual UTF-8 encoded string (no escapes needed — JS template literal contains UTF-8)
const TARGET_TITLE = "Chính Sách Bảo Mật Thông Tin Khách Hàng | Môi Trường Đô Thị Số 1";
console.log(`Target: "${TARGET_TITLE}" (${[...TARGET_TITLE].length} chars)`);

// Write the PHP code as a Buffer with proper UTF-8 encoding
const phpCode = Buffer.from(`<?php
/**
 * Plugin Name: TTCQN Title Override 282
 * Description: Override <title> for page 282 using pre_get_document_title filter.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;

add_filter('pre_get_document_title', function($title) {
    if (!is_page(282)) return $title;
    return '${TARGET_TITLE}';
}, 999);

// Also fix via rank_math filter (in case Rank Math bypasses pre_get_document_title)
add_filter('rank_math/frontend/title', function($title) {
    if (!is_page(282)) return $title;
    return '${TARGET_TITLE}';
}, 999);

// Also try: delete bad rank_math_title and replace on init
add_action('init', function() {
    if (!get_option('ttcqn_282_rm_clean_v3')) {
        delete_post_meta(282, 'rank_math_title');
        delete_post_meta(282, '_rank_math_title');
        // Store proper UTF-8 value directly
        global \$wpdb;
        \$wpdb->query(\$wpdb->prepare(
            "INSERT INTO {\$wpdb->postmeta} (post_id, meta_key, meta_value) VALUES (%d, 'rank_math_title', %s) ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value)",
            282, '${TARGET_TITLE}'
        ));
        wp_cache_delete(282, 'post_meta');
        update_option('ttcqn_282_rm_clean_v3', 1);
    }
}, 1);
`, "utf8");

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await mcpReq(auth, {jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"title-filter",version:"1"}}});

const zip = buildZip([["ttcqn-title-override-282/ttcqn-title-override-282.php", phpCode]]);
console.log(`ZIP: ${zip.length} bytes`);

console.log("Deploying plugin...");
const r = await ability(auth, "plugins/upload-base64", {
  content_base64: zip.toString("base64"),
  filename: "ttcqn-title-override-282.zip",
  activate: true, overwrite: true,
});
console.log(r.d?.result?.content?.[0]?.text?.slice(0,120) ?? "?");

// Check immediately
await new Promise(rr => setTimeout(rr, 2000));
console.log("\nLive <title>:");
await new Promise((res, rej) => {
  const opts = {hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/chinh-sach-bao-mat/",method:"GET",headers:{Host:WP_HOST,"User-Agent":"check/1"},rejectUnauthorized:false};
  const r=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
    const tm=d.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title=tm?tm[1].replace(/\s+/g," ").trim():"(not found)";
    console.log(`"${title}" (${[...title].length} chars) ${[...title].length>=60?"✓":"⚠"}`);
    res();
  })});
  r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
});
