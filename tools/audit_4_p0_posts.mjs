/**
 * Mini audit 4 bài P0 để xác nhận fix đã đúng
 * Dùng WP REST để lấy content, không cần live fetch
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function wpGet(path) {
  return new Promise((res,rej)=>{
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,Authorization:auth},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();
  });
}

function stripTags(s) { return s.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim(); }
function countWords(s) { return s.trim().split(/\s+/).filter(Boolean).length; }

const POSTS = [
  {id:2687, slug:"hut-be-phot-nha-hang-quang-ninh-2026",     prevScore:61},
  {id:2708, slug:"hut-be-phot-khu-nha-tro-quang-ninh-2026",  prevScore:64},
  {id:2559, slug:"hut-ham-cau-quang-ninh-2026",               prevScore:64},
  {id:2702, slug:"hut-be-phot-khach-san-quang-ninh-2026",     prevScore:67},
];

for (const p of POSTS) {
  const r = await wpGet(`/wp-json/wp/v2/posts/${p.id}?context=edit&_fields=id,slug,title,content`);
  const raw = r.content?.raw ?? "";
  const plain = stripTags(raw);
  const wordCount = countWords(plain);

  // H1 check — NOTE: đây là content.raw (WP REST API), KHÔNG phải live HTML.
  // Plugin ttcqn-home-emergency-renderer inject H1 qua generate_after_header hook và strip H1 khỏi
  // content.raw qua the_content filter. Kết quả h1s=[] ở đây là BÌNH THƯỜNG, không phải lỗi.
  // Xem CODEX_CONTEXT.md mục "H1 Audit: False Positive Đã Biết".
  const h1s = [...raw.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => stripTags(m[1]));
  // H2s
  const h2s = [...raw.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => stripTags(m[1]));
  const hasNguyenNhan = h2s.some(h => /nguyên\s*nhân/i.test(h));
  // Forbidden words
  const foundForbidden = FORBIDDEN.filter(w => new RegExp(w,'gi').test(plain));

  // Score estimation (simplified)
  let score = 100;
  const issues = [];

  // Bỏ deduct điểm H1 vì h1s.length === 0 là bình thường trong content.raw (xem note ở trên).
  if (h1s.length > 1) { score -= 10; issues.push(`MULTI_H1_IN_RAW(${h1s.length})`); }

  if (!hasNguyenNhan) { score -= 8; issues.push("MISSING_H2:Nguyên nhân"); }

  if (wordCount < 2000) { score -= 12; issues.push(`WORD_LOW(${wordCount})`); }
  else if (wordCount > 3500) { score -= 5; issues.push(`WORD_TOO_LONG(${wordCount})`); }
  else if (wordCount > 2800) { score -= 2; issues.push(`WORD_ABOVE_TARGET(${wordCount})`); }

  if (foundForbidden.length > 0) { score -= foundForbidden.length * 6; issues.push(`FORBIDDEN_WORD(${foundForbidden.join(',')})`); }

  const delta = score - p.prevScore;
  const trend = delta > 0 ? `+${delta}` : `${delta}`;

  console.log(`\n${p.slug}`);
  console.log(`  Score: ${p.prevScore} → ~${score} (${trend})`);
  console.log(`  Words: ${wordCount}`);
  console.log(`  H1 (${h1s.length}): ${h1s.map(h=>'"'+h.slice(0,50)+'"').join(', ')}`);
  console.log(`  Nguyên nhân H2: ${hasNguyenNhan ? "✓" : "✗"}`);
  console.log(`  Forbidden words: ${foundForbidden.length === 0 ? "✓ CLEAN" : foundForbidden.join(', ')}`);
  if (issues.length > 0) console.log(`  Remaining issues: ${issues.join(' | ')}`);
  else console.log(`  → ✓ ALL CLEAR`);
}
