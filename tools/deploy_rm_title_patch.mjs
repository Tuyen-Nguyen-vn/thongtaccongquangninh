/**
 * Deploy plugin để update _rank_math_title cho page 282.
 * Plugin tự xóa sau khi chạy (deactivate sau 1 request).
 * Target title: "Chính Sách Bảo Mật Thông Tin | Môi Trường Đô Thị Số 1 Quảng Ninh" (64 chars)
 */
import https from "node:https";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
let SID=null;
function req(auth,body) { return new Promise((res,rej)=>{ const b=Buffer.from(JSON.stringify(body),"utf8"); const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false}; const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})}); r.on("error",rej);r.setTimeout(60000,()=>r.destroy(new Error("t")));r.write(b);r.end(); }); }
function ability(auth,name,params){return req(auth,{jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}

// Build ZIP in memory (store compression, no deflate needed)
function buildZip(entries) {
  const parts = [];
  const cds = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const dataBuf = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
    const crc = crc32(dataBuf);
    // Local file header
    const lh = Buffer.alloc(30 + nameBuf.length);
    lh.writeUInt32LE(0x04034b50, 0); // sig
    lh.writeUInt16LE(20, 4);  // version needed
    lh.writeUInt16LE(0, 6);   // flags
    lh.writeUInt16LE(0, 8);   // compression: store
    lh.writeUInt16LE(0, 10);  // mod time
    lh.writeUInt16LE(0, 12);  // mod date
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(dataBuf.length, 18);
    lh.writeUInt32LE(dataBuf.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    nameBuf.copy(lh, 30);
    parts.push(lh, dataBuf);
    // Central directory
    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8); cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12); cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(dataBuf.length, 20);
    cd.writeUInt32LE(dataBuf.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30); cd.writeUInt16LE(0, 32); cd.writeUInt16LE(0, 34); cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    nameBuf.copy(cd, 46);
    cds.push(cd);
    offset += lh.length + dataBuf.length;
  }
  const cdBuf = Buffer.concat(cds);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4); eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(cds.length, 8); eocd.writeUInt16LE(cds.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...parts, cdBuf, eocd]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const NEW_RM_TITLE = "Chính Sách Bảo Mật Thông Tin | Môi Trường Đô Thị Số 1 Quảng Ninh";
console.log(`New Rank Math title: "${NEW_RM_TITLE}" (${[...NEW_RM_TITLE].length} chars)`);

const phpCode = `<?php
/**
 * Plugin Name: TTCQN RM Title Patch 282
 * Description: One-time update _rank_math_title for page 282, then self-deactivate.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;

add_action('init', function() {
    if (get_option('ttcqn_rm282_patched_v1')) return;
    $title = '${NEW_RM_TITLE}';
    update_post_meta(282, '_rank_math_title', $title);
    // Also clear any Rank Math cache for this post
    if (function_exists('rank_math')) {
        delete_post_meta(282, 'rank_math_schema');
    }
    update_option('ttcqn_rm282_patched_v1', 1);
    // Self-deactivate
    deactivate_plugins(plugin_basename(__FILE__));
}, 5);
`;

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await req(auth, { jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"rm-patch",version:"1"}}});

const zip = buildZip([
  ["ttcqn-rm-title-patch-282/ttcqn-rm-title-patch-282.php", phpCode]
]);
const zipB64 = zip.toString("base64");
console.log(`ZIP size: ${zip.length} bytes`);

console.log("Uploading & activating plugin...");
const uploadR = await ability(auth, "plugins/upload-base64", {
  content_base64: zipB64,
  filename: "ttcqn-rm-title-patch-282.zip",
  activate: true,
  overwrite: true,
});
const uploadTxt = uploadR.d?.result?.content?.[0]?.text ?? "";
console.log(uploadTxt.includes("success") || uploadTxt.includes("activ") ? "✓ uploaded+activated" : "Response: " + uploadTxt.slice(0,200));

// Wait a moment for init hook to fire, then verify via live page
await new Promise(r => setTimeout(r, 3000));

// Fetch live <title>
await new Promise((res,rej)=>{
  const opts={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/chinh-sach-bao-mat/",method:"GET",headers:{Host:WP_HOST,"User-Agent":"debug/1"},rejectUnauthorized:false};
  const r=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
    const tm=d.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const t=tm?tm[1].replace(/\s+/g," ").trim():"(not found)";
    console.log(`\nLive <title>: "${t}" (${[...t].length} chars)`);
    res();
  })});
  r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
});
