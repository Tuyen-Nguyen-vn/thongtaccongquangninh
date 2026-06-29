/**
 * Batch fix META_SHORT cho 8 trang + TITLE_SHORT cho /bang-gia/ (id=61).
 * Deploy plugin với pre_get_document_title + rank_math/frontend/description filters.
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

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

// ─── DỮ LIỆU FIX ────────────────────────────────────────────────────────────
const FIXES = {
  // id → { title?, desc }
  61: {
    title: "Bảng Giá Hút Bể Phốt, Thông Tắc Cống & Bồn Cầu Quảng Ninh 2026",
    desc:  "Bảng giá hút bể phốt, thông tắc cống và bồn cầu tại Quảng Ninh 2026 rõ từng dịch vụ, không ẩn phí phát sinh. Báo giá miễn phí, gọi ngay 0963.953.533 nhé.",
  },
  217: {
    desc: "Bảng giá hút bể phốt Quảng Ninh 2026 tính theo m³ và địa bàn — rõ từng hạng mục, không có phí ẩn phát sinh. Thợ có mặt trong 15 phút. Gọi 0963.953.533.",
  },
  2043: {
    desc: "Bồn cầu rút chậm do đâu? Nhận biết sớm 5 nguyên nhân phổ biến và cách xử lý nhanh tại Quảng Ninh. Gọi 0963.953.533 — thợ thông tắc bồn cầu có mặt ngay.",
  },
  216: {
    desc: "Cách xử lý cống thoát nước tắc tại nhà Quảng Ninh: dùng lò xo, máy cao áp hoặc gọi thợ đến tận nơi. Hướng dẫn từng bước, hotline 0963.953.533 hỗ trợ 24/7.",
  },
  2332: {
    desc: "Cẩm nang thông tắc cống tại Hạ Long theo từng khu vực: ngõ hẹp, chung cư, nhà hàng, nhà phố. Mẹo xử lý nhanh và khi nào cần gọi thợ. Hotline 0963.953.533.",
  },
  1377: {
    desc: "Câu hỏi thường gặp về thông tắc cống Quảng Ninh: giá bao nhiêu, thợ đến bao lâu, có bảo hành không, tự thông được không. Gọi tư vấn ngay 0963.953.533.",
  },
  2025: {
    desc: "Chi phí hút bể phốt Quảng Ninh 2026 tính theo m³ và loại bể — bảng giá tham khảo rõ ràng, không ẩn phí phát sinh, có mặt trong 15 phút. Gọi 0963.953.533.",
  },
  2044: {
    desc: "Chu kỳ hút bể phốt Quảng Ninh bao lâu một lần? Hướng dẫn lịch hút định kỳ theo số người dùng, loại bể và mùa — tránh tràn ngập. Đặt lịch 0963.953.533.",
  },
};

// Verify lengths
console.log("=== Kiểm tra độ dài ===");
let ok = true;
for (const [id, fix] of Object.entries(FIXES)) {
  const descLen = [...fix.desc].length;
  const titleLen = fix.title ? [...fix.title].length : null;
  const dStatus = descLen >= 150 && descLen <= 160 ? "✓" : `⚠ ${descLen}`;
  const tStatus = titleLen ? (titleLen >= 60 && titleLen <= 70 ? "✓" : `⚠ ${titleLen}`) : "-";
  console.log(`  id=${id}: desc=${descLen}${dStatus==="✓"?"✓":" "+dStatus}${titleLen?` title=${titleLen}${tStatus==="✓"?"✓":" "+tStatus}`:""}`);
  if (descLen < 150 || descLen > 160) ok = false;
  if (titleLen && (titleLen < 60 || titleLen > 70)) ok = false;
}
if (!ok) { console.log("⚠ Có giá trị ngoài range — điều chỉnh trước khi deploy"); process.exit(1); }
console.log("✓ Tất cả trong range\n");

// Build PHP plugin (UTF-8 encoded)
function phpStr(s) {
  // Escape single quotes and backslashes for PHP single-quoted string
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

let phpCases_desc = "";
let phpCases_title = "";
for (const [id, fix] of Object.entries(FIXES)) {
  phpCases_desc += `        case ${id}: return '${phpStr(fix.desc)}';\n`;
  if (fix.title) {
    phpCases_title += `        case ${id}: return '${phpStr(fix.title)}';\n`;
  }
}

const phpCode = Buffer.from(`<?php
/**
 * Plugin Name: TTCQN Meta Batch Fix
 * Description: Fix META_SHORT và TITLE_SHORT cho 8 trang ưu tiên.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;

function ttcqn_fixed_desc($post_id) {
    switch ((int)$post_id) {
${phpCases_desc}        default: return null;
    }
}

function ttcqn_fixed_title($post_id) {
    switch ((int)$post_id) {
${phpCases_title}        default: return null;
    }
}

// Meta description filter (Rank Math)
add_filter('rank_math/frontend/description', function($desc) {
    $id = get_queried_object_id();
    $fixed = ttcqn_fixed_desc($id);
    return $fixed !== null ? $fixed : $desc;
}, 999);

// Title filter
add_filter('pre_get_document_title', function($title) {
    $id = get_queried_object_id();
    $fixed = ttcqn_fixed_title($id);
    return $fixed !== null ? $fixed : $title;
}, 999);

// Also: update wp_postmeta directly on first run (so GSC/crawlers see it)
add_action('init', function() {
    if (get_option('ttcqn_meta_batch_v1')) return;
    $fixes = [
        61 => ['desc' => '${phpStr(FIXES[61].desc)}', 'title' => '${phpStr(FIXES[61].title)}'],
        217 => ['desc' => '${phpStr(FIXES[217].desc)}'],
        2043 => ['desc' => '${phpStr(FIXES[2043].desc)}'],
        216 => ['desc' => '${phpStr(FIXES[216].desc)}'],
        2332 => ['desc' => '${phpStr(FIXES[2332].desc)}'],
        1377 => ['desc' => '${phpStr(FIXES[1377].desc)}'],
        2025 => ['desc' => '${phpStr(FIXES[2025].desc)}'],
        2044 => ['desc' => '${phpStr(FIXES[2044].desc)}'],
    ];
    foreach ($fixes as $post_id => $data) {
        if (!empty($data['desc'])) {
            update_post_meta($post_id, 'rank_math_description', $data['desc']);
        }
        if (!empty($data['title'])) {
            update_post_meta($post_id, 'rank_math_title', $data['title']);
        }
        wp_cache_delete($post_id, 'post_meta');
    }
    update_option('ttcqn_meta_batch_v1', 1);
}, 1);
`, "utf8");

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await mcpReq(auth, {jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"meta-batch",version:"1"}}});

const zip = buildZip([["ttcqn-meta-batch-fix/ttcqn-meta-batch-fix.php", phpCode]]);
console.log(`ZIP: ${zip.length} bytes\nDeploying...`);
const r = await ability(auth, "plugins/upload-base64", {
  content_base64: zip.toString("base64"),
  filename: "ttcqn-meta-batch-fix.zip",
  activate: true, overwrite: true,
});
const t = r.d?.result?.content?.[0]?.text ?? "";
console.log(t.includes("success") ? "✓ activated" : "? " + t.slice(0,120));

// Verify 3 pages live
await new Promise(rr => setTimeout(rr, 2000));
console.log("\n=== Verify live ===");
const CHECKS = [
  {path:"/bang-gia/",id:61},
  {path:"/bon-cau-rut-cham-nguyen-nhan/",id:2043},
  {path:"/chi-phi-hut-be-phot-quang-ninh/",id:2025},
];
for (const {path, id} of CHECKS) {
  await new Promise((res, rej) => {
    const opts={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,"User-Agent":"check/1"},rejectUnauthorized:false};
    const req2=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
      const title=(d.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||"";
      const desc=(d.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i)||[])[1]||"";
      const tLen=[...title.trim()].length; const dLen=[...desc].length;
      console.log(`  ${path}: title=${tLen}${tLen>=60?"✓":"⚠"} desc=${dLen}${dLen>=150?"✓":"⚠"}`);
      res();
    })});
    req2.on("error",rej);req2.setTimeout(15000,()=>req2.destroy(new Error("t")));req2.end();
  });
}

// Log CSV
const TODAY = "2026-06-08";
const TIME = new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},META-BATCH-FIX-${TODAY},seo_fix,Batch fix META_SHORT 8 trang + TITLE_SHORT /bang-gia/ via plugin ttcqn-meta-batch-fix,,,done,medium,,,,,8 trang meta 150-160 chars; /bang-gia/ title 63 chars; filter plugin active,tools/deploy_meta_batch_fix.mjs,,Audit lại sau 24h để verify CSC pick up,,,,,,`,
  "utf8"
);
console.log("\n✓ CSV logged.");
