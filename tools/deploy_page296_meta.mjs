/**
 * Deploy plugin fix title + desc cho page 296 (thong-tac-cong-ha-long)
 * Pattern: pre_get_document_title + rank_math/frontend/description filter
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

const PAGE_ID = 296;
const TITLE = "Thông Tắc Cống Hạ Long 24/7 – Đến Nhanh 15 Phút | 0963.953.533";
const DESC  = "Thông tắc cống Hạ Long 24/7 – xe bồn cao áp đến nhanh 15 phút, xử lý đúng điểm nghẽn, không đục phá. Phục vụ nhà hàng, khách sạn, nhà dân. Gọi 0963.953.533.";

console.log(`Title (${[...TITLE].length}): "${TITLE}"`);
console.log(`Desc  (${[...DESC].length}): "${DESC}"`);

function phpStr(s) { return s.replace(/\\/g,"\\\\").replace(/'/g,"\\'"); }

const phpCode = Buffer.from(`<?php
/**
 * Plugin Name: TTCQN Page 296 Meta Fix
 * Description: Fix title + desc cho page 296 thong-tac-cong-ha-long.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;

add_filter('pre_get_document_title', function(string $title): string {
    if (is_page(${PAGE_ID})) return '${phpStr(TITLE)}';
    return $title;
}, 999);

add_filter('rank_math/frontend/description', function(string $desc): string {
    if (is_page(${PAGE_ID})) return '${phpStr(DESC)}';
    return $desc;
}, 999);

add_action('init', function(): void {
    if (get_option('ttcqn_page_296_meta_v1')) return;
    update_post_meta(${PAGE_ID}, 'rank_math_title', '${phpStr(TITLE)}');
    update_post_meta(${PAGE_ID}, 'rank_math_description', '${phpStr(DESC)}');
    update_post_meta(${PAGE_ID}, 'rank_math_focus_keyword', 'th\\u00f4ng t\\u1eafc c\\u1ed1ng H\\u1ea1 Long');
    wp_cache_delete(${PAGE_ID}, 'post_meta');
    update_option('ttcqn_page_296_meta_v1', 1);
}, 1);
`, "utf8");

// MCP ZIP deploy
function crc32(buf) { let c=0xFFFFFFFF; for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xEDB88320:0);} return(c^0xFFFFFFFF)>>>0; }
function buildZip(entries) {
  const parts=[],cds=[];let off=0;
  for(const[name,data]of entries){
    const nb=Buffer.from(name,"utf8");const db=Buffer.isBuffer(data)?data:Buffer.from(data,"utf8");const cr=crc32(db);
    const lh=Buffer.alloc(30+nb.length);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0,6);lh.writeUInt16LE(0,8);lh.writeUInt16LE(0,10);lh.writeUInt16LE(0,12);lh.writeUInt32LE(cr,14);lh.writeUInt32LE(db.length,18);lh.writeUInt32LE(db.length,22);lh.writeUInt16LE(nb.length,26);lh.writeUInt16LE(0,28);nb.copy(lh,30);
    parts.push(lh,db);
    const cd=Buffer.alloc(46+nb.length);cd.writeUInt32LE(0x02014b50,0);cd.writeUInt16LE(20,4);cd.writeUInt16LE(20,6);cd.writeUInt16LE(0,8);cd.writeUInt16LE(0,10);cd.writeUInt16LE(0,12);cd.writeUInt16LE(0,14);cd.writeUInt32LE(cr,16);cd.writeUInt32LE(db.length,20);cd.writeUInt32LE(db.length,24);cd.writeUInt16LE(nb.length,28);cd.writeUInt16LE(0,30);cd.writeUInt16LE(0,32);cd.writeUInt16LE(0,34);cd.writeUInt16LE(0,36);cd.writeUInt32LE(0,38);cd.writeUInt32LE(off,42);nb.copy(cd,46);
    cds.push(cd);off+=lh.length+db.length;
  }
  const cdBuf=Buffer.concat(cds);const eo=Buffer.alloc(22);
  eo.writeUInt32LE(0x06054b50,0);eo.writeUInt16LE(0,4);eo.writeUInt16LE(0,6);eo.writeUInt16LE(cds.length,8);eo.writeUInt16LE(cds.length,10);eo.writeUInt32LE(cdBuf.length,12);eo.writeUInt32LE(off,16);eo.writeUInt16LE(0,20);
  return Buffer.concat([...parts,cdBuf,eo]);
}

let SID=null;
function mcpReq(body){return new Promise((res,rej)=>{const b=Buffer.from(JSON.stringify(body),"utf8");const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})});r.on("error",rej);r.setTimeout(60000,()=>r.destroy(new Error("t")));r.write(b);r.end();});}
function ability(name,params){return mcpReq({jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}

await mcpReq({jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"page296",version:"1"}}});

const zip=buildZip([["ttcqn-page-296-meta/ttcqn-page-296-meta.php",phpCode]]);
console.log(`\nZIP: ${zip.length} bytes — deploying...`);

const r=await ability("plugins/upload-base64",{content_base64:zip.toString("base64"),filename:"ttcqn-page-296-meta.zip",activate:true,overwrite:true});
const t=r.d?.result?.content?.[0]?.text??"";
console.log(t.includes("success")?"✓ deployed":"? "+t.slice(0,150));
