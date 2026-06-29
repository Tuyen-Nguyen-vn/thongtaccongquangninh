/**
 * Fix đúng key: Rank Math đọc "rank_math_title" (không có underscore prefix).
 * Đồng thời xóa cả "_rank_math_title" cũ và update "rank_math_title" mới.
 * Sau đó trigger save_post qua content/update-page để clear cache.
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com"; const PAGE_ID = 282;

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
let SID=null;
function mcpReq(auth,body) { return new Promise((res,rej)=>{ const b=Buffer.from(JSON.stringify(body),"utf8"); const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false}; const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})}); r.on("error",rej);r.setTimeout(60000,()=>r.destroy(new Error("t")));r.write(b);r.end(); }); }
function ability(auth,name,params){return mcpReq(auth,{jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}
function wpRest(method, path, auth2, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: { Host: WP_HOST, Authorization: auth2, "User-Agent": "fix/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}) },
      rejectUnauthorized: false };
    const req2 = https.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ s: res.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, d }); } });
    });
    req2.on("error", reject); req2.setTimeout(30000, () => req2.destroy(new Error("t")));
    if (bodyBuf) req2.write(bodyBuf);
    req2.end();
  });
}

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

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await mcpReq(auth, {jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"rm-fix-key",version:"1"}}});

// Step 1: Try WP REST API with correct key "rank_math_title" (no underscore)
console.log("1. Trying WP REST with rank_math_title (no underscore)...");
const r1 = await wpRest("POST", `/wp/v2/pages/${PAGE_ID}`, auth, {
  meta: {
    rank_math_title: "Chính Sách Bảo Mật Thông Tin Khách Hàng | Môi Trường Đô Thị Số 1"
  }
});
console.log(`   Status: ${r1.s}`);
if (typeof r1.d === "object" && r1.d.meta) {
  console.log(`   rank_math_title in response: "${r1.d.meta.rank_math_title ?? "(not in response)"}"`);
}

// Step 2: Deploy plugin that sets BOTH keys and also via Rank Math's own setter
const phpCode = `<?php
/**
 * Plugin Name: TTCQN RM Fix Key 282
 * Description: Fix Rank Math title for page 282 using correct meta key.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;

// REST endpoint: debug all rank_math_* meta keys
add_action('rest_api_init', function() {
    register_rest_route('ttcqn-debug/v1', '/rm-all-meta/(?P<id>[0-9]+)', [
        'methods' => 'GET',
        'callback' => function($req) {
            global $wpdb;
            $id = (int)$req['id'];
            $rows = $wpdb->get_results($wpdb->prepare(
                "SELECT meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key LIKE '%rank_math%'",
                $id
            ), ARRAY_A);
            return $rows;
        },
        'permission_callback' => '__return_true',
    ]);
});

// On save_post, update both possible keys
add_action('save_post', function($post_id, $post) {
    if ((int)$post_id !== 282) return;
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) return;
    $title = "Ch\xc3\xadnh S\xc3\xa1ch B\xe1\xba\xa3o M\xe1\xba\xadt Th\xc3\xb4ng Tin Kh\xc3\xa1ch H\xc3\xa0ng | M\xc3\xb4i Tr\xc6\xb0\xe1\xbb\x9dng \xc4\x90\xc3\xb4 Th\xe1\xbb\x8b S\xe1\xbb\x91 1";
    // Try both key variants
    update_post_meta($post_id, 'rank_math_title', $title);
    update_post_meta($post_id, '_rank_math_title', $title);
    wp_cache_delete($post_id, 'post_meta');
}, 999, 2);

// Also: REST init hook to set immediately
add_action('init', function() {
    if (!get_option('ttcqn_rm282_key_fixed_v2')) {
        $title = "Ch\xc3\xadnh S\xc3\xa1ch B\xe1\xba\xa3o M\xe1\xba\xadt Th\xc3\xb4ng Tin Kh\xc3\xa1ch H\xc3\xa0ng | M\xc3\xb4i Tr\xc6\xb0\xe1\xbb\x9dng \xc4\x90\xc3\xb4 Th\xe1\xbb\x8b S\xe1\xbb\x91 1";
        update_post_meta(282, 'rank_math_title', $title);
        update_post_meta(282, '_rank_math_title', $title);
        wp_cache_delete(282, 'post_meta');
        update_option('ttcqn_rm282_key_fixed_v2', 1);
    }
}, 1);
`;

console.log("\n2. Deploying plugin with correct key + debug endpoint...");
const zip = buildZip([["ttcqn-rm-fix-key-282/ttcqn-rm-fix-key-282.php", phpCode]]);
const r2 = await ability(auth, "plugins/upload-base64", {
  content_base64: zip.toString("base64"),
  filename: "ttcqn-rm-fix-key-282.zip",
  activate: true, overwrite: true,
});
const t2 = r2.d?.result?.content?.[0]?.text ?? "";
console.log(t2.includes("success") ? "✓ activated" : "? " + t2.slice(0,100));

// Query all rank_math_* meta
await new Promise(rr => setTimeout(rr, 1500));
console.log("\n3. Checking all rank_math_* meta in DB...");
const dbR = await new Promise((res, rej) => {
  const opts = {hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/ttcqn-debug/v1/rm-all-meta/282",method:"GET",headers:{Host:WP_HOST,"User-Agent":"debug/1"},rejectUnauthorized:false};
  const r=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
  r.on("error",rej);r.setTimeout(10000,()=>r.destroy(new Error("t")));r.end();
});
if (Array.isArray(dbR)) {
  dbR.forEach(row => console.log(`  ${row.meta_key}: "${(row.meta_value||"").slice(0,80)}"`));
} else {
  console.log("  Raw:", JSON.stringify(dbR).slice(0,200));
}

// Trigger save_post
await new Promise(rr => setTimeout(rr, 500));
console.log("\n4. Triggering save_post...");
const saveR = await ability(auth, "content/update-page", {
  id: PAGE_ID,
  title: "Chính Sách Bảo Mật Thông Tin Khách Hàng",
});
console.log(saveR.d?.result?.content?.[0]?.text?.includes("success") ? "✓" : "?");

// Check live
await new Promise(rr => setTimeout(rr, 4000));
console.log("\n5. Live <title>:");
await new Promise((res, rej) => {
  const opts = {hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/chinh-sach-bao-mat/",method:"GET",headers:{Host:WP_HOST,"User-Agent":"check/1"},rejectUnauthorized:false};
  const r=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
    const tm=d.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title=tm?tm[1].replace(/\s+/g," ").trim():"(not found)";
    console.log(`   "${title}" (${[...title].length} chars) ${[...title].length>=60?"✓":"⚠"}`);
    res();
  })});
  r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
});
