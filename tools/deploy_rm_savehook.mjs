/**
 * Deploy plugin hooks into save_post để update _rank_math_title khi page 282 saved.
 * Sau đó gọi content/update-page → save_post fires → cache clears → title mới render.
 * Target: "Chính Sách Bảo Mật Thông Tin Khách Hàng | Môi Trường Đô Thị Số 1" (65 chars)
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

// UTF-8 target title as PHP string (65 chars, within 60-70)
// "Chính Sách Bảo Mật Thông Tin Khách Hàng | Môi Trường Đô Thị Số 1"
const TARGET = "Chính Sách Bảo Mật Thông Tin Khách Hàng | Môi Trường Đô Thị Số 1";
console.log(`Target title: "${TARGET}" (${[...TARGET].length} chars)`);

// The plugin hooks save_post for page 282 to intercept and set _rank_math_title
// The save_post hook runs DURING post save (before cache invalidation)
const phpCode = `<?php
/**
 * Plugin Name: TTCQN RM Title Hook 282
 * Description: Hook save_post to set correct Rank Math title for page 282.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;

add_action('save_post', function($post_id, $post) {
    if ((int)$post_id !== 282) return;
    if (wp_is_post_revision($post_id)) return;
    if (wp_is_post_autosave($post_id)) return;
    // Remove hook to prevent infinite loop
    remove_action('save_post', __FUNCTION__);
    // Set the Rank Math SEO title (bypass Rank Math's own save routine)
    update_post_meta($post_id, '_rank_math_title', 'Ch\xc3\xadnh S\xc3\xa1ch B\xe1\xba\xa3o M\xe1\xba\xadt Th\xc3\xb4ng Tin Kh\xc3\xa1ch H\xc3\xa0ng | M\xc3\xb4i Tr\xc6\xb0\xe1\xbb\x9dng \xc4\x90\xc3\xb4 Th\xe1\xbb\x8b S\xe1\xbb\x91 1');
}, 20, 2);
`;

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await mcpReq(auth, {jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"rm-hook",version:"1"}}});

const zip = buildZip([["ttcqn-rm-title-hook-282/ttcqn-rm-title-hook-282.php", phpCode]]);
console.log(`ZIP: ${zip.length} bytes`);

console.log("1. Uploading + activating plugin...");
const r = await ability(auth, "plugins/upload-base64", {
  content_base64: zip.toString("base64"),
  filename: "ttcqn-rm-title-hook-282.zip",
  activate: true, overwrite: true,
});
const t = r.d?.result?.content?.[0]?.text ?? "";
console.log(t.includes("success") ? "✓" : "? " + t.slice(0,100));

// 2. Trigger save_post by updating the page title via content/update-page
await new Promise(rr => setTimeout(rr, 1000));
console.log("2. Triggering save_post via content/update-page...");
const saveR = await ability(auth, "content/update-page", {
  id: PAGE_ID,
  title: "Chính Sách Bảo Mật Thông Tin Khách Hàng",
});
const saveTxt = saveR.d?.result?.content?.[0]?.text ?? "";
console.log(saveTxt.includes("success") ? "✓ save_post triggered" : "? " + saveTxt.slice(0,100));

// 3. Wait for cache clear, then check live title
await new Promise(rr => setTimeout(rr, 4000));
console.log("3. Checking live <title>...");
await new Promise((res, rej) => {
  const opts = {hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/chinh-sach-bao-mat/",method:"GET",headers:{Host:WP_HOST,"User-Agent":"check/1"},rejectUnauthorized:false};
  const r=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
    const tm=d.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title=tm?tm[1].replace(/\s+/g," ").trim():"(not found)";
    console.log(`Live <title>: "${title}" (${[...title].length} chars)`);
    if([...title].length>=60) console.log("✓ TITLE resolved!");
    else console.log("⚠ Still short");
    res();
  })});
  r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
});
