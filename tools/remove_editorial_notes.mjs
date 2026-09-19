// Go tung doan ghi chu SEO noi bo bi dang nham (SEO TITLE/SLUG/META DESCRIPTION/FOCUS KEYWORD/SECONDARY KEYWORDS/SEARCH INTENT).
// Dung: node tools/remove_editorial_notes.mjs <id> [--h1] [--h2seo] [--dry]
//  --h1    : go them the <h1> trong noi dung (theme da xuat H1 tu tieu de bai)
//  --h2seo : go them tieu de <h2>Thong Tin SEO</h2>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const ROOT = "D:/.thongtaccongquangninh";
const ID = process.argv[2], DRY = process.argv.includes("--dry");
const env = {};
for (const l of readFileSync(`${ROOT}/.env`, "utf8").split(/\r?\n/)) { const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const api = `https://thongtaccongquangninh.com/wp-json/wp/v2/posts/${ID}`;
const post = await (await fetch(`${api}?context=edit`, { headers: { Authorization: auth } })).json();
let out = post.content.raw;
const removedAll = [];
for (const label of ["SEO TITLE", "SLUG", "META DESCRIPTION", "FOCUS KEYWORD", "SECONDARY KEYWORDS", "SEARCH INTENT"]) {
  const re = new RegExp(`<p><strong>${label}:</strong>[\\s\\S]*?</p>[ \\t]*\\r?\\n?`, "g");
  const ms = out.match(re) || [];
  if (ms.length === 0) continue;
  if (ms.length > 1) throw new Error(`${label}: ${ms.length} khop, dung lai`);
  if (ms[0].length > 700 || /<(img|table|ul|ol|a )/i.test(ms[0])) throw new Error(`${label}: khoi dang ngo, dung lai`);
  removedAll.push(ms[0].replace(/\s+/g, " ").slice(0, 90));
  out = out.replace(re, "");
}
if (process.argv.includes("--h2seo")) { const n = (out.match(/<h2>Thông Tin SEO<\/h2>\s*/g) || []).length; if (n !== 1) throw new Error("h2 Thong Tin SEO: " + n); out = out.replace(/<h2>Thông Tin SEO<\/h2>\s*/, ""); removedAll.push("<h2>Thông Tin SEO</h2>"); }
if (process.argv.includes("--h1")) { const ms = out.match(/<h1[^>]*>[\s\S]*?<\/h1>\s*/g) || []; if (ms.length !== 1) throw new Error("h1: " + ms.length); removedAll.push(ms[0].replace(/\s+/g, " ").slice(0, 90)); out = out.replace(/<h1[^>]*>[\s\S]*?<\/h1>\s*/, ""); }
console.log(`#${ID} ${post.slug}: go ${removedAll.length} muc, ${post.content.raw.length} -> ${out.length} ky tu`);
removedAll.forEach((x) => console.log("  -", x));
if (removedAll.length < 3) throw new Error("qua it muc, co the sai trang");
if (DRY) process.exit(0);
const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
mkdirSync(`${ROOT}/backups/editorial-${ID}-${stamp}`, { recursive: true });
writeFileSync(`${ROOT}/backups/editorial-${ID}-${stamp}/${ID}.json`, JSON.stringify({ id: ID, content: post.content.raw }, null, 2));
const res = await fetch(api, { method: "POST", headers: { Authorization: auth, "Content-Type": "application/json" }, body: JSON.stringify({ content: out }) });
console.log("update status", res.status);
const chk = await (await fetch(`${api}?context=edit`, { headers: { Authorization: auth } })).json();
const live = await fetch(chk.link, { redirect: "manual" }); const html = await live.text();
console.log("public HTTP", live.status, "| con 'FOCUS KEYWORD':", html.includes("FOCUS KEYWORD"), "| con 'SEARCH INTENT':", html.includes("SEARCH INTENT"), "| con 'SEO TITLE:':", html.includes("SEO TITLE:"));
