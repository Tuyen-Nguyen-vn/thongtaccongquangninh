/**
 * Fix MISSING_H2:Nguyên nhân trên 4 bài P0
 * Đổi tên H2 hiện tại → thêm "nguyên nhân" vào text
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function wpReq(method, path, body) {
  return new Promise((res,rej)=>{
    const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})});
    r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();
  });
}

// Mỗi entry: id, oldH2 (text hiện tại), newH2 (text mới có "nguyên nhân")
// Strategy: đổi H2 đầu tiên có ngữ nghĩa gần nhất → thêm "nguyên nhân"
const FIXES = [
  {
    id: 2687, slug: "hut-be-phot-nha-hang-quang-ninh-2026",
    oldH2: "Vì Sao Bể Phốt Nhà Hàng Đầy Nhanh Gấp 3 Lần Hộ Dân?",
    newH2: "Nguyên Nhân Bể Phốt Nhà Hàng Đầy Nhanh Gấp 3 Lần Hộ Dân",
  },
  {
    id: 2708, slug: "hut-be-phot-khu-nha-tro-quang-ninh-2026",
    oldH2: "Tại Sao Bể Phốt Khu Nhà Trọ Cần Hút Thường Xuyên Hơn Nhà Thường?",
    newH2: "Nguyên Nhân Bể Phốt Nhà Trọ Đầy Và Cần Hút Thường Xuyên Hơn",
  },
  {
    id: 2559, slug: "hut-ham-cau-quang-ninh-2026",
    oldH2: "Hầm Cầu Đầy Có Những Dấu Hiệu Gì? Đừng Bỏ Qua",
    newH2: "Nguyên Nhân Và Dấu Hiệu Hầm Cầu Đầy Cần Hút Ngay",
  },
  {
    id: 2702, slug: "hut-be-phot-khach-san-quang-ninh-2026",
    oldH2: "Vì Sao Bể Phốt Khách Sạn Đầy Nhanh Hơn Nhà Dân?",
    newH2: "Nguyên Nhân Bể Phốt Khách Sạn Đầy Nhanh – Khi Nào Cần Gọi Thợ?",
  },
];

for (const fix of FIXES) {
  console.log(`\n=== ${fix.slug} (id=${fix.id}) ===`);

  const r = await wpReq("GET", `/wp-json/wp/v2/posts/${fix.id}?context=edit&_fields=content`);
  if (r.s !== 200) { console.log(`  GET error: ${r.s}`); continue; }
  let raw = r.d.content.raw;

  // Tìm pattern H2 trong raw content
  // Format có thể là: <h2 class="wp-block-heading">TEXT</h2>
  // hoặc Gutenberg: <!-- wp:heading {"level":2} -->\n<h2>TEXT</h2>\n<!-- /wp:heading -->
  const oldPattern = new RegExp(
    `(<h2[^>]*>)${fix.oldH2.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(</h2>)`,
    'g'
  );

  const matches = [...raw.matchAll(oldPattern)];
  console.log(`  Pattern matches: ${matches.length}`);

  if (matches.length === 0) {
    // Try case-insensitive search
    const oldPatternCI = new RegExp(
      fix.oldH2.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),
      'i'
    );
    const ciMatch = oldPatternCI.test(raw);
    console.log(`  Case-insensitive match: ${ciMatch}`);

    // Show nearby text
    const idx = raw.search(new RegExp(fix.oldH2.slice(0,20).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'i'));
    if (idx >= 0) {
      console.log(`  Found at index ${idx}: "${raw.slice(idx, idx+120)}"`);
    }
    console.log(`  → Không match, bỏ qua`);
    continue;
  }

  const fixed = raw.replace(oldPattern, `$1${fix.newH2}$2`);

  if (fixed === raw) {
    console.log("  → Không thay đổi (identical), bỏ qua");
    continue;
  }

  const pr = await wpReq("POST", `/wp-json/wp/v2/posts/${fix.id}`, { content: fixed });
  console.log(`  POST status: ${pr.s}`);
  if (pr.s !== 200) { console.log("  ERROR:", JSON.stringify(pr.d).slice(0,200)); continue; }

  // Verify
  const vr = await wpReq("GET", `/wp-json/wp/v2/posts/${fix.id}?context=edit&_fields=content`);
  const vRaw = vr.d?.content?.raw ?? "";
  const hasNew = vRaw.includes(fix.newH2);
  const hasOld = vRaw.includes(fix.oldH2);
  const hasNguyenNhan = /nguyên\s*nhân/i.test(vRaw);
  console.log(`  new H2 present: ${hasNew}, old H2 present: ${hasOld}, has nguyên nhân: ${hasNguyenNhan}`);
  console.log(hasNew && !hasOld ? "  ✓ FIXED" : "  ⚠ check needed");
}

console.log("\nDone.");
