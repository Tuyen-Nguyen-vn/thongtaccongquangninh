import https from "node:https";
const MCP_HOST="onehost-wphn022606.000nethost.com",MCP_PORT=2023,MCP_PATH="/api/mcp";
const TOKEN="sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
let sessionId=null,msgId=1;
function parseSSE(t){const r=[];for(const l of t.split("\n")){if(l.startsWith("data: ")){const x=l.slice(6).trim();if(x==="[DONE]")continue;try{r.push(JSON.parse(x));}catch{}}}return r;}
function mcpPost(method,params){return new Promise((resolve,reject)=>{const body=JSON.stringify({jsonrpc:"2.0",id:msgId++,method,params:params??{}});const headers={Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json",Accept:"application/json, text/event-stream","Content-Length":Buffer.byteLength(body)};if(sessionId)headers["Mcp-Session-Id"]=sessionId;const req=https.request({hostname:MCP_HOST,port:MCP_PORT,path:MCP_PATH,method:"POST",headers,rejectUnauthorized:false},(res)=>{if(res.headers["mcp-session-id"])sessionId=res.headers["mcp-session-id"];let d="";res.on("data",c=>d+=c);res.on("end",()=>{const ct=res.headers["content-type"]??"";if(ct.includes("text/event-stream"))resolve({status:res.statusCode,events:parseSSE(d),raw:d});else{try{resolve({status:res.statusCode,json:JSON.parse(d)});}catch{resolve({status:res.statusCode,raw:d});}}});});req.on("error",reject);req.setTimeout(60000,()=>req.destroy(new Error("timeout")));req.write(body);req.end();});}
function getResult(r){return r.json?.result??r.events?.find(e=>e.result!==undefined)?.result;}
function extractText(r){const res=getResult(r);if(!res)return "(none)";if(res?.isError)return "ERR: "+JSON.stringify(res.content??res);return (Array.isArray(res?.content)?res.content.map(c=>c.text??"").join(""):null)??JSON.stringify(res);}
await mcpPost("initialize",{protocolVersion:"2024-11-05",capabilities:{},clientInfo:{name:"f282",version:"1"}});
await mcpPost("notifications/initialized",{});
async function call(n,a){return extractText(await mcpPost("tools/call",{name:n,arguments:a}));}

const PATH="/public_html/wp-content/plugins/ttcqn-title-override-282/ttcqn-title-override-282.php";
const NEW_CODE=`<?php
/**
 * Plugin Name: TTCQN Title Override 282
 * Description: Override <title> for page 282 — fixed brand name v1.1.
 * Version: 1.1
 */
if (!defined('ABSPATH')) exit;

define('TTCQN_282_TITLE', 'Chính Sách Bảo Mật Thông Tin Khách Hàng | Thông Tắc Cống Quảng Ninh');

add_filter('pre_get_document_title', function($title) {
    if (!is_page(282)) return $title;
    return TTCQN_282_TITLE;
}, 999);

add_filter('rank_math/frontend/title', function($title) {
    if (!is_page(282)) return $title;
    return TTCQN_282_TITLE;
}, 999);

// One-time: update postmeta with correct brand (v4 key = fresh run)
add_action('init', function() {
    if (!get_option('ttcqn_282_rm_clean_v4')) {
        delete_post_meta(282, 'rank_math_title');
        delete_post_meta(282, '_rank_math_title');
        global $wpdb;
        $wpdb->query($wpdb->prepare(
            "INSERT INTO {$wpdb->postmeta} (post_id, meta_key, meta_value) VALUES (%d, 'rank_math_title', %s) ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value)",
            282, TTCQN_282_TITLE
        ));
        wp_cache_delete(282, 'post_meta');
        update_option('ttcqn_282_rm_clean_v4', 1);
    }
}, 1);
`;

// Verify old brand still in remote file first
const old = await call("read_file",{path:PATH});
const hits = (old.match(/Môi Trường Đô Thị Số 1/g)||[]).length;
console.log("Old file brand hits:", hits, "(expect 3)");
if(hits===0){console.error("Old brand not found — already fixed or wrong file");process.exit(1);}

const wr = await call("write_file",{path:PATH, content:NEW_CODE});
console.log("write_file:", wr);

// Read back to verify
const back = await call("read_file",{path:PATH});
const newHits = (back.match(/Môi Trường Đô Thị Số 1/g)||[]).length;
const newBrand = (back.match(/Thông Tắc Cống Quảng Ninh/g)||[]).length;
console.log("After write — old brand hits:", newHits, "(expect 0) | new brand hits:", newBrand, "(expect 3+)");
console.log(newHits===0?"✓ OK":"✗ FAIL");
