// Thay the chuoi chinh xac de giam nhoi tu khoa. Moi chuoi phai khop DUNG 1 lan.
// Dung: node tools/apply_kw_replacements.mjs <id> <posts|pages> <file.json> "<focus ascii>" [--dry]
// file.json = [["tim","thay"], ...]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const ROOT = "D:/.thongtaccongquangninh";
const [id, type, file, focus] = process.argv.slice(2, 6);
const DRY = process.argv.includes("--dry");
const env = {};
for (const l of readFileSync(`${ROOT}/.env`, "utf8").split(/\r?\n/)) {
  const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const api = `https://thongtaccongquangninh.com/wp-json/wp/v2/${type}/${id}`;
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm", "hy vọng bài viết hữu ích"];
const strip = (c) => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
const count = (s) => { let a = ""; for (const c of s) { const x = strip(c); a += x.length === 1 ? x : c.toLowerCase(); } let n = 0, i = -1; while ((i = a.indexOf(focus, i + 1)) >= 0) n++; return n; };
const textOnly = (s) => count(s.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " "));

const post = await (await fetch(`${api}?context=edit`, { headers: { Authorization: auth } })).json();
let raw = post.content.raw;
const pairs = JSON.parse(readFileSync(file, "utf8"));
const before = textOnly(raw);
const bad = [];
for (const [f, r] of pairs) {
  const n = raw.split(f).length - 1;
  if (n !== 1) { bad.push(`${n}x: ${f.slice(0, 70)}`); continue; }
  raw = raw.replace(f, () => r);
}
const introduced = FORBIDDEN.filter((w) => raw.toLowerCase().includes(w) && !post.content.raw.toLowerCase().includes(w));
console.log(`#${id} ${post.slug}: text-count ${before} -> ${textOnly(raw)} | applied ${pairs.length - bad.length}/${pairs.length}`);
if (introduced.length) console.log("CANH BAO tu cam moi:", introduced);
if (bad.length) { console.log("KHONG KHOP (dung lai, khong ghi):"); bad.forEach((b) => console.log(" -", b)); process.exit(2); }
if (introduced.length) process.exit(3);
if (DRY) process.exit(0);
const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
mkdirSync(`${ROOT}/backups/kw-${id}-${stamp}`, { recursive: true });
writeFileSync(`${ROOT}/backups/kw-${id}-${stamp}/${id}.json`, JSON.stringify({ id, content: post.content.raw }, null, 2));
const res = await fetch(api, { method: "POST", headers: { Authorization: auth, "Content-Type": "application/json" }, body: JSON.stringify({ content: raw }) });
console.log("update status", res.status);
const chk = await (await fetch(`${api}?context=edit`, { headers: { Authorization: auth } })).json();
console.log("readback text-count", textOnly(chk.content.raw), "| link", chk.link);
const live = await fetch(chk.link, { redirect: "manual" });
console.log("public permalink HTTP", live.status, live.status === 200 ? "OK" : "!!! KIEM TRA REDIRECT");
