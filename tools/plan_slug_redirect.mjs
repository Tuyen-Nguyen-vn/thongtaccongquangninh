/**
 * Lập kế hoạch redirect các slug chứa năm "2026"
 * - Liệt kê toàn bộ slug có "2026"
 * - Đề xuất clean slug (bỏ năm)
 * - Kiểm tra conflict (clean slug đã tồn tại chưa)
 * - Ghi ra docs/SLUG_REDIRECT_PLAN.md
 */
import https from "node:https";
import { readFileSync, writeFileSync } from "node:fs";

// Lấy danh sách từ audit JSON mới nhất
const auditData = JSON.parse(readFileSync("D:\\.thongtaccongquangninh\\reports\\site-full-audit-2026-06-16.json","utf8"));

// Tìm tất cả URLs có "2026"
const allUrls = auditData.map?.(u=>u.url||u).filter?.(u=>typeof u==="string") ||
                Object.values(auditData).flat?.().filter?.(u=>typeof u==="string"&&u.startsWith("http")) || [];

// Đọc từ site-full JSON structure
let urls2026 = [];
try{
  const entries = Array.isArray(auditData) ? auditData : auditData.entries || auditData.urls || [];
  urls2026 = entries.filter(e=>{
    const url = typeof e==="string"?e:(e.url||"");
    return url.includes("2026");
  }).map(e=>typeof e==="string"?e:(e.url||""));
}catch{}

if(urls2026.length===0){
  // Fallback: extract from JSON keys/values
  const raw=readFileSync("D:\\.thongtaccongquangninh\\reports\\site-full-audit-2026-06-16.json","utf8");
  const matches=[...raw.matchAll(/https:\/\/thongtaccongquangninh\.com\/[^"]+2026[^"]*\//g)];
  urls2026=[...new Set(matches.map(m=>m[0]))];
}

console.log("URLs with 2026:", urls2026.length);
urls2026.forEach(u=>console.log(" ",u));

// Đề xuất clean slug (bỏ -2026)
function cleanSlug(url){
  return url.replace(/-2026(?=\/|$)/,"").replace(/\/$/,"");
}

// Fetch WP REST để kiểm tra clean slug có tồn tại chưa
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpGet(path){return new Promise((res,rej)=>{const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();});}

// Lấy post/page ID của từng 2026-slug để biết type
async function findPost(slug){
  const s=slug.replace(/.*\//,"").replace(/\/$/,"");
  const [posts,pages]=await Promise.all([
    wpGet(`/wp-json/wp/v2/posts?slug=${s}&_fields=id,slug,link`),
    wpGet(`/wp-json/wp/v2/pages?slug=${s}&_fields=id,slug,link`),
  ]);
  if(Array.isArray(posts)&&posts[0]) return {type:"posts",...posts[0]};
  if(Array.isArray(pages)&&pages[0]) return {type:"pages",...pages[0]};
  return null;
}

async function checkCleanExists(cleanUrl){
  const slug=cleanUrl.replace(/.*\//,"").replace(/\/$/,"");
  const [posts,pages]=await Promise.all([
    wpGet(`/wp-json/wp/v2/posts?slug=${slug}&_fields=id,slug`),
    wpGet(`/wp-json/wp/v2/pages?slug=${slug}&_fields=id,slug`),
  ]);
  const existPost=Array.isArray(posts)&&posts[0];
  const existPage=Array.isArray(pages)&&pages[0];
  return existPost||existPage||null;
}

const rows=[];
console.log("\n=== Checking conflicts ===");
for(const url of urls2026){
  const cleanUrl=cleanSlug(url);
  const slug=url.replace(/.*com\//,"").replace(/\/$/,"");
  const cleanS=cleanUrl.replace(/.*com\//,"").replace(/\/$/,"");

  const [post,conflict]=await Promise.all([findPost(slug),checkCleanExists(cleanUrl)]);
  const row={
    oldUrl: url,
    oldSlug: slug,
    newSlug: cleanS,
    newUrl: cleanUrl+"/",
    type: post?.type||"?",
    id: post?.id||"?",
    conflict: conflict?`CONFLICT (id=${conflict.id})`:"OK",
  };
  rows.push(row);
  console.log(`${row.conflict==="OK"?"✓":"⚠"} ${slug} → ${cleanS} [${row.conflict}]`);
}

// Tạo báo cáo markdown
const today="2026-06-16";
let md=`# Kế hoạch redirect slug có năm 2026\n\nNgày lập: ${today}  \nMục tiêu: Trước 2027-01-01 — đổi slug, setup 301 redirect, không bị cũ hóa URL.\n\n`;
md+=`## Danh sách redirect\n\n`;
md+=`| # | Old slug | New slug | Type | ID | Conflict? |\n`;
md+=`|---|---|---|---|---|---|\n`;
rows.forEach((r,i)=>{
  md+=`| ${i+1} | \`${r.oldSlug}\` | \`${r.newSlug}\` | ${r.type} | ${r.id} | ${r.conflict} |\n`;
});

md+=`\n## Ghi chú\n\n`;
const conflicts=rows.filter(r=>r.conflict!=="OK");
if(conflicts.length>0){
  md+=`### ⚠ CONFLICT — slug đích đã tồn tại, cần xử lý trước\n\n`;
  conflicts.forEach(r=>{
    md+=`- \`${r.oldSlug}\` → \`${r.newSlug}\` — **${r.conflict}**. Cần merge nội dung hoặc chọn slug khác.\n`;
  });
  md+=`\n`;
}
md+=`### Cách thực hiện (từng bước)\n\n`;
md+=`1. **Backup** trước khi thay đổi slug.\n`;
md+=`2. Với mỗi trang KHÔNG conflict: đổi slug trong WP Admin (Quick Edit → Permalink) hoặc qua REST API \`{slug: "new-slug"}\`.\n`;
md+=`   - Rank Math tự tạo redirect 301 từ old → new khi slug đổi qua WP Admin.\n`;
md+=`   - Nếu dùng REST API, cần thêm redirect thủ công qua Rank Math Redirections.\n`;
md+=`3. Với trang CONFLICT: hợp nhất nội dung hai bài (giữ bài clean slug, merge nội dung quan trọng từ bài 2026) → sau đó xóa hoặc redirect bài 2026 sang bài đích.\n`;
md+=`4. Submit lại sitemap qua Google Search Console sau khi hoàn tất.\n`;
md+=`5. Theo dõi GSC 30 ngày để đảm bảo không mất traffic.\n\n`;
md+=`### Thời điểm nên thực hiện\n\n`;
md+=`- **Không cần vội**: các slug có "2026" vẫn hoạt động tốt trong năm 2026. Có thể chờ đến tháng 10–11/2026 để thực hiện trước khi năm mới.\n`;
md+=`- **Ưu tiên sớm** nếu bài đang không rank tốt hoặc cần tái cấu trúc nội dung.\n`;
md+=`- Không nên đổi hàng loạt cùng lúc — làm 3–4 trang/tuần để dễ monitor.\n`;

writeFileSync("D:\\.thongtaccongquangninh\\docs\\SLUG_REDIRECT_PLAN.md", md, "utf8");
console.log(`\n✓ Đã ghi docs/SLUG_REDIRECT_PLAN.md (${rows.length} redirects, ${conflicts.length} conflicts)`);
