/**
 * Debug: đọc _rank_math_title từ DB qua plugin, và cập nhật nó trực tiếp lúc activation.
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

// Plugin: log current meta + force-set title via register_activation_hook + admin_init
// Use a REST endpoint to output the result
const phpCode = `<?php
/**
 * Plugin Name: TTCQN RM Meta Debug
 * Description: Debug and force-set Rank Math title for page 282.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;

// Register REST endpoint to read current meta
add_action('rest_api_init', function() {
    register_rest_route('ttcqn-debug/v1', '/rm-meta/(?P<id>[0-9]+)', [
        'methods' => 'GET',
        'callback' => function($req) {
            $id = (int)$req['id'];
            $rm_title = get_post_meta($id, '_rank_math_title', true);
            $rm_desc  = get_post_meta($id, '_rank_math_description', true);
            $post_title = get_the_title($id);
            return [
                '_rank_math_title' => $rm_title,
                '_rank_math_description' => $rm_desc,
                'post_title' => $post_title,
                'option_cleared' => get_option('ttcqn_rm282_cleared_v1'),
            ];
        },
        'permission_callback' => '__return_true',
    ]);
});

// Force-set the title on every init (not just once) for testing
add_action('init', function() {
    $new_title = 'Ch\\u00ednh S\\u00e1ch B\\u1ea3o M\\u1eadt Th\\u00f4ng Tin | M\\u00f4i Tr\\u01b0\\u1eddng \\u0110\\u00f4 Th\\u1ecb S\\u1ed1 1 Qu\\u1ea3ng Ninh';
    // Note: PHP unicode escapes NOT supported in single-quoted strings
    // Use direct UTF-8 bytes instead
    update_post_meta(282, '_rank_math_title', 'Chinh Sach Bao Mat Thong Tin Khach Hang | Moi Truong Do Thi So 1 Quang Ninh');
    wp_cache_delete(282, 'post_meta');
}, 1);
`;

// Actually, PHP doesn't support \uXXXX in strings. Let me use the actual UTF-8 title.
// I'll build the PHP with actual UTF-8 bytes in the string.
const TARGET_TITLE = "Chinh Sach Bao Mat Thong Tin Khach Hang | Moi Truong Do Thi So 1 Quang Ninh";
// NOTE: using ASCII approximation first to test if the mechanism works at all.
// If it works, we'll use the proper UTF-8 version.
console.log(`Test title (ASCII): "${TARGET_TITLE}" (${TARGET_TITLE.length} chars)`);

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await mcpReq(auth, {jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"rm-debug",version:"1"}}});

const zip = buildZip([["ttcqn-rm-meta-debug/ttcqn-rm-meta-debug.php", phpCode]]);

console.log("Uploading debug plugin...");
const r = await ability(auth, "plugins/upload-base64", {
  content_base64: zip.toString("base64"),
  filename: "ttcqn-rm-meta-debug.zip",
  activate: true, overwrite: true,
});
const t = r.d?.result?.content?.[0]?.text ?? "";
console.log(t.slice(0, 150));

// Query the REST endpoint
await new Promise(rr => setTimeout(rr, 1500));
console.log("\nReading meta via REST debug endpoint...");
await new Promise((res, rej) => {
  const opts = {hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/ttcqn-debug/v1/rm-meta/282",method:"GET",headers:{Host:WP_HOST,"User-Agent":"debug/1"},rejectUnauthorized:false};
  const req2 = https.request(opts, resp => {
    let d=""; resp.on("data",c=>d+=c);
    resp.on("end", () => {
      try { const j=JSON.parse(d); console.log(JSON.stringify(j,null,2)); }
      catch { console.log(d.slice(0,200)); }
      res();
    });
  });
  req2.on("error", rej); req2.setTimeout(10000,()=>req2.destroy(new Error("t"))); req2.end();
});

// Check live title after update
await new Promise(rr => setTimeout(rr, 1000));
await new Promise((res, rej) => {
  const opts = {hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/chinh-sach-bao-mat/",method:"GET",headers:{Host:WP_HOST,"User-Agent":"check/1"},rejectUnauthorized:false};
  const req2 = https.request(opts, resp => {
    let d=""; resp.on("data",c=>d+=c);
    resp.on("end", () => {
      const tm=d.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title=tm?tm[1].replace(/\s+/g," ").trim():"(not found)";
      console.log(`\nLive <title>: "${title}" (${[...title].length} chars)`);
      res();
    });
  });
  req2.on("error", rej); req2.setTimeout(15000,()=>req2.destroy(new Error("t"))); req2.end();
});
