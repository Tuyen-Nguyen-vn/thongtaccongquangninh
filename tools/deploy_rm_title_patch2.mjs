/**
 * v2: delete _rank_math_title → Rank Math fallback = "%title% | %sitename%"
 * = "Chính Sách Bảo Mật Thông Tin Khách Hàng | Môi Trường Đô Thị Số 1 Quảng Ninh" (~77 chars) ✓
 * Không gọi deactivate_plugins() (không available ở front-end).
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";

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

const phpCode = `<?php
/**
 * Plugin Name: TTCQN RM Title Clear 282
 * Description: Delete _rank_math_title for page 282 so Rank Math uses post title fallback.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;
add_action('init', function() {
    if (get_option('ttcqn_rm282_cleared_v1')) return;
    delete_post_meta(282, '_rank_math_title');
    delete_post_meta(282, '_rank_math_description');
    // Clear any Rank Math meta cache
    wp_cache_delete(282, 'post_meta');
    update_option('ttcqn_rm282_cleared_v1', 1);
}, 1);
`;

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await mcpReq(auth, {jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"rm-clear",version:"1"}}});

const zip = buildZip([["ttcqn-rm-title-clear-282/ttcqn-rm-title-clear-282.php", phpCode]]);
console.log(`ZIP size: ${zip.length} bytes`);

console.log("Uploading plugin...");
const r = await ability(auth, "plugins/upload-base64", {
  content_base64: zip.toString("base64"),
  filename: "ttcqn-rm-title-clear-282.zip",
  activate: true, overwrite: true,
});
const t = r.d?.result?.content?.[0]?.text ?? "";
console.log(t.slice(0, 200));

// Warm up the page (trigger init hook)
await new Promise(rr => setTimeout(rr, 2000));
console.log("Triggering page request to fire init hook...");
await new Promise((res, rej) => {
  const opts = {hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/chinh-sach-bao-mat/",method:"GET",headers:{Host:WP_HOST,"User-Agent":"warmup/1","Cache-Control":"no-cache"},rejectUnauthorized:false};
  const req2 = https.request(opts, resp => {
    let d=""; resp.on("data",c=>d+=c);
    resp.on("end", () => {
      const tm = d.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = tm ? tm[1].replace(/\s+/g," ").trim() : "(not found)";
      console.log(`\nLive <title>: "${title}" (${[...title].length} chars)`);
      if ([...title].length >= 60) console.log("✓ TITLE_SHORT resolved!");
      else console.log("⚠ Still short — Rank Math may be caching");
      res();
    });
  });
  req2.on("error", rej); req2.setTimeout(15000,()=>req2.destroy(new Error("t"))); req2.end();
});
