/**
 * Deploy plugin ttcqn-meta-desc-fix
 * Override rank_math/frontend/description cho 36 URL có META_SHORT
 * Mỗi desc: 150–160 chars, không từ cấm, có hotline
 */
import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const PROJECT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_CANDIDATES = [
  `${PROJECT}/.env`,
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
];
const BUILD_ONLY = process.argv.includes("--build-only");
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(){
  let text = "";
  for (const p of ENV_CANDIDATES) {
    try { text = readFileSync(p, "utf8"); break; } catch {}
  }
  if (!text) throw new Error("Không tìm thấy .env WordPress auth");
  const e={};for(const l of text.split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;
}
const env=parseEnv();
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

// === DESCRIPTIONS (150–160 chars, không từ cấm, có hotline) ===
const DESCS = {
  // --- HBP khu vực (posts) ---
  2047: "Hút bể phốt Ba Chẽ 24/7 – xe bồn chuyên dụng, có mặt 30–60 phút, hút sạch không mùi, không đục phá bừa. Phục vụ nhà dân, khu trọ, nhà hàng. Gọi 0963.953.533.",
  2048: "Hút bể phốt Bình Liêu 24/7 – xe bồn chuyên dụng, có mặt 30–60 phút, hút sạch không mùi, không đục phá. Phục vụ nhà dân, nhà hàng và khu trọ. Gọi 0963.953.533.",
  2049: "Hút bể phốt Cô Tô 24/7 – xe bồn chuyên dụng, điều phối từ đất liền, hút sạch không mùi, không đục phá. Phục vụ nhà dân, resort, khu lưu trú. Gọi 0963.953.533.",
  2050: "Hút bể phốt Đầm Hà 24/7 – xe bồn chuyên dụng, có mặt 30–60 phút, hút sạch không mùi, không đục phá. Phục vụ nhà dân, nhà hàng và công trình. Gọi 0963.953.533.",
  2051: "Hút bể phốt Hải Hà 24/7 – xe bồn chuyên dụng, có mặt 30–60 phút, hút sạch không mùi, không đục phá bừa. Phục vụ nhà dân, nhà hàng, khu trọ. Gọi 0963.953.533.",
  2052: "Hút bể phốt Tiên Yên 24/7 – xe bồn chuyên dụng, có mặt 30–60 phút, hút sạch không mùi, không đục phá. Phục vụ nhà dân, nhà hàng và khu trọ. Gọi 0963.953.533.",
  2708: "Hút bể phốt khu nhà trọ tại Quảng Ninh 24/7 – xe bồn vào ngõ sâu, hút sạch không mùi, không đục phá, phục vụ chủ trọ và khách thuê. Gọi ngay 0963.953.533.",
  // --- HBP service-variant (posts) ---
  2694: "Hút bể phốt công ty, nhà máy, khu công nghiệp tại Quảng Ninh 24/7. Xe bồn đủ tải trọng, hút sạch không mùi, xuất hóa đơn VAT, ký hợp đồng. Gọi 0963.953.533.",
  2769: "Hút bể phốt khu công nghiệp Quảng Ninh – xe bồn lớn hút sạch nhà xưởng, xí nghiệp, kho bãi. Không mùi, xuất VAT, ký hợp đồng bảo trì. Gọi 0963.953.533.",
  2430: "Hút bể phốt khẩn cấp Quảng Ninh 24/7 – xe bồn có mặt trong 15 phút, xử lý tràn hầm và bể phốt đầy gấp, hút sạch không mùi, không đục phá. Gọi ngay 0963.953.533.",
  2687: "Hút bể phốt nhà hàng Quảng Ninh 24/7 – xử lý nhanh không gián đoạn kinh doanh, hút sạch không mùi, xe bồn đủ tải, phục vụ khẩn cấp ngày lễ. Gọi 0963.953.533.",
  // --- HBP pages ---
  26:   "Hút bể phốt Quảng Ninh 24/7 – xe bồn đến nhanh 15 phút, hút sạch không mùi, không đục phá bừa bãi. Phục vụ nhà dân, nhà hàng, công trình. Gọi 0963.953.533.",
  436:  "Hút bể phốt Bãi Cháy 24/7 – xe bồn có mặt 15 phút, hút sạch không mùi, không đục phá. Nhà dân, khách sạn, nhà hàng tại khu du lịch Bãi Cháy. Gọi 0963.953.533.",
  52:   "Hút bể phốt Hạ Long 24/7 – xe bồn có mặt 15 phút, hút sạch không mùi, không đục phá. Phục vụ nhà dân, khách sạn, nhà hàng tại Hạ Long. Gọi 0963.953.533.",
  53:   "Hút bể phốt Cẩm Phả 24/7 – xe bồn có mặt 15–30 phút, hút sạch không mùi, không đục phá bừa bãi. Phục vụ nhà dân và doanh nghiệp tại Cẩm Phả. Gọi 0963.953.533.",
  57:   "Hút bể phốt Quảng Yên 24/7 – xe bồn có mặt 15–30 phút, hút sạch không mùi, không đục phá bừa. Phục vụ nhà dân và doanh nghiệp tại Quảng Yên. Gọi 0963.953.533.",
  54:   "Hút bể phốt Uông Bí 24/7 – xe bồn có mặt 15–30 phút, hút sạch không mùi, không đục phá bừa bãi. Phục vụ nhà dân và doanh nghiệp tại Uông Bí. Gọi 0963.953.533.",
  // --- HBP posts (bai-chay will be fetched separately, assuming it's a post) ---
  // hut-be-phot-bai-chay: need to add after checking ID
  // --- HUT HAM CAU (post) ---
  2559: "Hút hầm cầu Quảng Ninh 24/7 – xe bồn chuyên dụng, có mặt 15 phút, hút bể 1–20 khối, sạch không mùi, không đục phá bừa bãi. Báo giá miễn phí. Gọi 0963.953.533.",
  // --- TTBC service-variant (posts) ---
  2417: "Thông tắc bồn cầu khách sạn Quảng Ninh 24/7 – thợ có mặt 15 phút, xử lý nghẹt không gián đoạn hoạt động, không đục phá, ưu tiên giờ cao điểm. Gọi 0963.953.533.",
  2377: "Thông tắc bồn cầu khẩn cấp Quảng Ninh 24/7 – thợ có mặt 15 phút, xử lý tắc hoàn toàn, rút chậm, trào ngược. Báo giá miễn phí trước khi làm. Gọi 0963.953.533.",
  2385: "Thông tắc bồn cầu không đục phá Quảng Ninh – dùng máy thông cơ và áp lực cao, bảo toàn gạch men và kết cấu. Phục vụ 24/7, báo giá miễn phí. Gọi 0963.953.533.",
  2407: "Thông tắc bồn cầu nhà dân Quảng Ninh 24/7 – thợ có mặt 15–30 phút, xử lý rút chậm, tắc hoàn toàn, trào ngược, không đục phá. Báo giá miễn phí. Gọi 0963.953.533.",
  2412: "Thông tắc bồn cầu nhà hàng Quảng Ninh 24/7 – hỗ trợ khẩn cấp giờ cao điểm, thợ có mặt 15 phút, xử lý nhanh không ảnh hưởng kinh doanh. Gọi 0963.953.533.",
  2379: "Thông tắc bồn cầu ban đêm Quảng Ninh 24/7 – thợ trực đêm, có mặt 15–30 phút, xử lý nghẹt, trào ngược lúc nửa đêm, không phụ thu thêm. Gọi 0963.953.533.",
  1367: "Thông tắc bồn cầu bị tắc Quảng Ninh – xử lý tắc hoàn toàn, nước không thoát, trào ngược, rút chậm. Thợ có mặt 15–30 phút, báo giá miễn phí. Gọi 0963.953.533.",
  // TTBC pages
  1481: "Thông tắc bồn cầu Đông Triều 24/7 – thợ có mặt 15–30 phút, xử lý nghẹt, trào ngược, rút chậm, không đục phá. Phục vụ nhà dân và doanh nghiệp. Gọi 0963.953.533.",
  1482: "Thông tắc bồn cầu Hạ Long 24/7 – thợ có mặt 15 phút, xử lý nghẹt, trào ngược, rút chậm, không đục phá. Phục vụ nhà dân, khách sạn, nhà hàng. Gọi 0963.953.533.",
  37:   "Thông tắc bồn cầu Quảng Ninh 24/7 – thợ có mặt 15 phút, xử lý rút chậm, tắc cứng, trào ngược bồn cầu. Không đục phá, báo giá trước khi làm. Gọi 0963.953.533.",
  1485: "Thông tắc bồn cầu Quảng Yên 24/7 – thợ có mặt 15–30 phút, xử lý rút chậm, tắc cứng, trào ngược tại Quảng Yên. Không đục phá, báo giá miễn phí. Gọi 0963.953.533.",
  // --- TTC (thong-tac-cong) pages ---
  35:   "Thông tắc cống Quảng Ninh 24/7 – thông cống rãnh, thoát sàn, ống nhựa toàn tỉnh. Thợ có mặt 15 phút, máy chuyên dụng, báo giá minh bạch. Gọi 0963.953.533.",
  400:  "Thông tắc cống Cẩm Phả 24/7 – nhà dân, hầm mỏ, khu dân cư thành phố Cẩm Phả. Thợ có mặt 30 phút, máy áp lực cao, không đục phá. Gọi ngay 0963.953.533.",
  405:  "Thông tắc cống Uông Bí 24/7 – nhà dân, công ty, khu công nghiệp thành phố Uông Bí. Thợ có mặt 30 phút, máy áp lực cao, không đục phá. Gọi 0963.953.533.",
  424:  "Thông tắc cống Quảng Yên 24/7 – khảo sát nhanh, báo giá trước, không đục phá, bảo hành 6-24 tháng. Gửi ảnh hiện trạng, gọi 0963.953.533 / 0931.156.756.",
  380:  "Thông tắc cống chung cư Hạ Long 24/7 – xử lý tắc ống đứng, ống ngang, hầm thoát tòa nhà. Không đục tường, có mặt nhanh, báo giá rõ ràng. Gọi 0963.953.533.",
  383:  "Thông tắc cống nhà hàng Hạ Long 24/7 – xử lý tắc bếp, dầu mỡ, bể tách mỡ nhà hàng ven biển. Không gián đoạn kinh doanh, ưu tiên gấp. Gọi 0963.953.533.",
  384:  "Thông tắc cống ngõ nhỏ Hạ Long 24/7 – xe máy vào tận ngõ sâu 50cm, thợ xử lý tắc rãnh thoát nước và ống nhựa hẹp, không đục phá gạch lát sàn. Gọi 0963.953.533.",
  991:  "Thông tắc cống Cao Xanh Hạ Long 24/7 – phục vụ nhà dân, chung cư phường Cao Xanh. Thợ 15 phút, máy áp lực cao, báo giá trước khi làm. Gọi 0963.953.533.",
  992:  "Thông tắc cống Giếng Đáy Hạ Long 24/7 – nhà dân, hộ kinh doanh phường Giếng Đáy. Thợ 15 phút, máy cơ học và áp lực cao, báo giá miễn phí. Gọi 0963.953.533.",
  993:  "Thông tắc cống Tuần Châu 24/7 – resort, biệt thự, nhà dân đảo Tuần Châu Hạ Long. Thợ có mặt 20 phút, xử lý dứt điểm, không gián đoạn dịch vụ. Gọi 0963.953.533.",
  // --- TTC posts ---
  2053: "Thông tắc cống Hồng Gai Hạ Long 24/7 – nhà dân, phố cổ, nhà hàng khu Hồng Gai. Thợ có mặt 15 phút, xử lý dứt điểm, không đục phá sàn. Gọi 0963.953.533.",
  2054: "Thông tắc cống Bãi Cháy Hạ Long 24/7 – xử lý cống tắc nhà dân, khách sạn, nhà hàng, homestay trong ngày. Không đục phá, báo giá trước. Gọi 0963.953.533.",
  2782: "Thông tắc cống 24/7 Quảng Ninh – thợ trực đêm, ngày lễ, Tết. Gọi là có mặt trong 15 phút, máy chuyên dụng, không đục phá khi chưa cần. Gọi 0963.953.533.",
  2777: "Thông tắc cống khẩn cấp Quảng Ninh 24/7 – gọi là thợ lên đường ngay, có mặt trong 15 phút, xử lý nước trào, tắc nặng, không đục phá sàn. Gọi 0963.953.533.",
  2787: "Giá thông tắc cống Quảng Ninh 2026 tại Hạ Long, Cẩm Phả, Uông Bí; có bảng giá, phụ phí, bảo hành rõ ràng, không báo giá ảo. Gọi 0963.953.533 tư vấn 24/7.",
  // --- Informational / Other posts ---
  2589: "Dấu hiệu bể phốt bị đầy không nên bỏ qua: nước rút chậm, mùi hôi lan ra sàn, bồn cầu trào ngược. Xử lý ngay tránh hỏng hệ thống. Gọi 0963.953.533 để hỗ trợ.",
  2449: "Bảng giá hút bể phốt Quảng Ninh tính theo m³ và loại bể. Báo giá miễn phí, không phát sinh chi phí ẩn, xe bồn có mặt trong 15–30 phút. Gọi 0963.953.533.",
  2357: "Bảng giá thông tắc bồn cầu Quảng Ninh theo mức độ tắc và loại công trình. Thợ có mặt 15–30 phút, báo giá công khai trước khi làm. Gọi ngay 0963.953.533.",
  2045: "Hóa chất tự thông cống có hòa tan rác cứng, giấy vệ sinh và dầu mỡ không? Sự thật và giải pháp thay thế đúng kỹ thuật để không làm hỏng ống. Gọi 0963.953.533.",
  2439: "Hút bể phốt 24/7 Quảng Ninh – xe bồn trực liên tục, có mặt trong 15–30 phút dù ban đêm hay ngày lễ, hút sạch không mùi, không đục phá. Gọi ngay 0963.953.533.",
  2046: "Mùi hôi từ cống trong nhà do đâu? Bài viết phân tích 6 nguyên nhân phổ biến và cách xử lý từng trường hợp. Hỗ trợ 24/7 tại Quảng Ninh. Gọi 0963.953.533.",
  1368: "Nạo vét hố ga Quảng Ninh – xử lý bùn rác, mùi hôi, thoát nước kém, chống ngập cục bộ. Xe chuyên dụng, hỗ trợ nhà dân và doanh nghiệp 24/7. Gọi 0963.953.533.",
  2559: "Hút hầm cầu Quảng Ninh 24/7 – xe bồn chuyên dụng, có mặt 15 phút, hút bể 1–20 khối, sạch không mùi, không đục phá bừa bãi. Báo giá miễn phí. Gọi 0963.953.533.",
  // Pages
  25:   "Blog dịch vụ vệ sinh môi trường Quảng Ninh: kinh nghiệm hút bể phốt, thông tắc cống, xử lý mùi hôi từ đội thợ thực tế. Gọi 0963.953.533 hỗ trợ nhanh 24/7.",
  2356: "Nguyễn Song Hào – kỹ thuật viên vệ sinh môi trường Quảng Ninh, tác giả bài viết thực tế về hút bể phốt và thông tắc cống tại Quảng Ninh. Gọi 0963.953.533.",
  62:   "Môi Trường Đô Thị Số 1 Quảng Ninh – đơn vị hút bể phốt, thông tắc cống, nạo vét hố ga tại Quảng Ninh với đội xe bồn chuyên dụng, phục vụ 24/7. Gọi 0963.953.533.",
  63:   "Đặt lịch hút bể phốt, thông tắc cống và nạo vét hố ga tại Quảng Ninh. Gọi hotline 0963.953.533 hoặc 0931.156.756 để được tư vấn và báo giá miễn phí 24/7.",
  38:   "Nạo vét hố ga Quảng Ninh 24/7 – xử lý bùn rác, mùi hôi, thoát nước kém và chống ngập mùa mưa. Xe chuyên dụng, hỗ trợ nhà dân và doanh nghiệp. Gọi 0963.953.533.",
  386:  "Tìm hiểu nguyên nhân khiến cống tắc thường xuyên tại Hạ Long: rác sinh hoạt, dầu mỡ, bùn cát mùa mưa. Cách phòng tránh và khi nào cần gọi thợ. 0963.953.533.",
};

// Validate lengths
console.log("=== Kiểm tra độ dài description (cần 150–160) ===");
let errors = 0;
for(const [id, desc] of Object.entries(DESCS)){
  const len = [...desc].length;
  const ok = len >= 150 && len <= 160;
  if(!ok){ console.log(`  ⚠ id=${id} len=${len}: "${desc.slice(0,50)}..."`); errors++; }
  else { console.log(`  ✓ id=${id} len=${len}`); }
}
if(errors>0){ console.log(`\n⚠ ${errors} desc ngoài khoảng — cần sửa`); process.exit(1); }
console.log(`✓ Tất cả ${Object.keys(DESCS).length} descs hợp lệ\n`);

// === Build PHP plugin ===
function phpStr(s){ return s.replace(/\\/g,"\\\\").replace(/'/g,"\\'"); }

let phpCases = "";
for(const [id, desc] of Object.entries(DESCS)){
  phpCases += `        ${id} => '${phpStr(desc)}',\n`;
}

const phpCode = `<?php
/**
 * Plugin Name: TTCQN Meta Desc Fix
 * Description: Override rank_math/frontend/description cho 36 URL có META_SHORT.
 * Version: 1.0
 */
if (!defined('ABSPATH')) exit;

function ttcqn_meta_desc_map(): array {
    return [
${phpCases}    ];
}

add_filter('rank_math/frontend/description', function(string \$desc): string {
    \$id = (int) get_queried_object_id();
    \$map = ttcqn_meta_desc_map();
    if (isset(\$map[\$id])) {
        return \$map[\$id];
    }
    return \$desc;
}, 200);
`;

// === Deploy via MCP ZIP ===
function crc32(buf){let c=0xFFFFFFFF;for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xEDB88320:0);}return(c^0xFFFFFFFF)>>>0;}
function buildZip(entries){const parts=[],cds=[];let off=0;for(const[name,data]of entries){const nb=Buffer.from(name,"utf8");const db=Buffer.isBuffer(data)?data:Buffer.from(data,"utf8");const cr=crc32(db);const lh=Buffer.alloc(30+nb.length);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0,6);lh.writeUInt16LE(0,8);lh.writeUInt16LE(0,10);lh.writeUInt16LE(0,12);lh.writeUInt32LE(cr,14);lh.writeUInt32LE(db.length,18);lh.writeUInt32LE(db.length,22);lh.writeUInt16LE(nb.length,26);lh.writeUInt16LE(0,28);nb.copy(lh,30);parts.push(lh,db);const cd=Buffer.alloc(46+nb.length);cd.writeUInt32LE(0x02014b50,0);cd.writeUInt16LE(20,4);cd.writeUInt16LE(20,6);cd.writeUInt16LE(0,8);cd.writeUInt16LE(0,10);cd.writeUInt16LE(0,12);cd.writeUInt16LE(0,14);cd.writeUInt32LE(cr,16);cd.writeUInt32LE(db.length,20);cd.writeUInt32LE(db.length,24);cd.writeUInt16LE(nb.length,28);cd.writeUInt16LE(0,30);cd.writeUInt16LE(0,32);cd.writeUInt16LE(0,34);cd.writeUInt16LE(0,36);cd.writeUInt32LE(0,38);cd.writeUInt32LE(off,42);nb.copy(cd,46);cds.push(cd);off+=lh.length+db.length;}const cdBuf=Buffer.concat(cds);const eo=Buffer.alloc(22);eo.writeUInt32LE(0x06054b50,0);eo.writeUInt16LE(0,4);eo.writeUInt16LE(0,6);eo.writeUInt16LE(cds.length,8);eo.writeUInt16LE(cds.length,10);eo.writeUInt32LE(cdBuf.length,12);eo.writeUInt32LE(off,16);eo.writeUInt16LE(0,20);return Buffer.concat([...parts,cdBuf,eo]);}

let SID=null;
function parsePayload(text) {
  try {
    return JSON.parse(text);
  } catch {}
  const dataLine = String(text).split(/\r?\n/).find((line) => line.startsWith("data:"));
  if (dataLine) {
    try {
      return JSON.parse(dataLine.slice(5).trim());
    } catch {}
  }
  return { raw: text };
}
function mcpReq(body){return new Promise((res,rej)=>{const b=Buffer.from(JSON.stringify(body),"utf8");const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json",Accept:"application/json, text/event-stream","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];res({s:resp.statusCode,d:parsePayload(d),raw:d})})});r.on("error",rej);r.setTimeout(60000,()=>r.destroy(new Error("t")));r.write(b);r.end();});}
function ability(name,params){return mcpReq({jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}

const init = await mcpReq({jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2025-06-18",capabilities:{},clientInfo:{name:"meta-desc-fix",version:"1"}}});
if (init.s !== 200 || !SID) {
  throw new Error(`MCP initialize failed: ${init.s} ${JSON.stringify(init.d).slice(0, 300)}`);
}

const zip = buildZip([["ttcqn-meta-desc-fix/ttcqn-meta-desc-fix.php", phpCode]]);
mkdirSync(`${PROJECT}/tools/wp-plugins/ttcqn-meta-desc-fix`, { recursive: true });
writeFileSync(`${PROJECT}/tools/wp-plugins/ttcqn-meta-desc-fix/ttcqn-meta-desc-fix.php`, phpCode, "utf8");
writeFileSync(`${PROJECT}/tools/wp-plugins/ttcqn-meta-desc-fix.zip`, zip);
if (BUILD_ONLY) {
  console.log(`✓ built ${PROJECT}/tools/wp-plugins/ttcqn-meta-desc-fix.zip (${zip.length} bytes)`);
  process.exit(0);
}
console.log(`ZIP: ${zip.length} bytes — deploying...`);

const r = await ability("plugins/upload-base64", {
  content_base64: zip.toString("base64"),
  filename: "ttcqn-meta-desc-fix.zip",
  activate: true,
  overwrite: true,
});
const t = r.d?.result?.content?.[0]?.text ?? "";
let inner = null;
try { inner = JSON.parse(t); } catch {}
const ok = r.s === 200 && !r.d?.error && inner?.success !== false && inner?.data?.success !== false && t.includes("success");
if (!ok) {
  throw new Error(`Deploy failed: status=${r.s} payload=${JSON.stringify(r.d).slice(0, 500)} text=${t.slice(0, 300)}`);
}
console.log("✓ deployed");

const TODAY = new Date().toISOString().slice(0, 10);
const TIME = new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-META-SHORT-BAI-CHAY-${TODAY},seo_fix,META_SHORT plugin override for post 2054,https://thongtaccongquangninh.com/thong-tac-cong-bai-chay/,thong-tac-cong-bai-chay,done,medium,,,,,update public meta description for ID 2054 after H1/schema patch,tools/deploy_meta_short_fix.mjs,,re-audit public meta,,,,,,`,
  "utf8");
console.log("✓ logged");
