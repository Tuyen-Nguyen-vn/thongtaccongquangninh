// Liet ke tung lan lap cum tu khoa chinh trong content.raw cua 1 bai (chi doc).
// Dung: node tools/kw_occurrences.mjs <id> <posts|pages> "<focus ascii>"
import { readFileSync } from "node:fs";
const ROOT = "D:/.thongtaccongquangninh";
const [id, type, focus] = process.argv.slice(2);
const env = {};
for (const l of readFileSync(`${ROOT}/.env`, "utf8").split(/\r?\n/)) {
  const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const r = await fetch(`https://thongtaccongquangninh.com/wp-json/wp/v2/${type}/${id}?context=edit`, { headers: { Authorization: auth } });
const p = await r.json();
const raw = p.content.raw;
const strip = (c) => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
let ascii = ""; for (const c of raw) { const s = strip(c); ascii += s.length === 1 ? s : c.toLowerCase(); }
if (ascii.length !== raw.length) console.log("WARN: length mismatch", ascii.length, raw.length);
console.log(`# ${id} ${p.slug} | title: ${p.title.raw} | len ${raw.length}`);
let i = -1, n = 0;
while ((i = ascii.indexOf(focus, i + 1)) >= 0) {
  const before = raw.slice(0, i);
  const open = Math.max(before.lastIndexOf("<h2"), before.lastIndexOf("<h3"), before.lastIndexOf("<p"), before.lastIndexOf("<li"), before.lastIndexOf("<summary"), before.lastIndexOf("<figcaption"), before.lastIndexOf("<td"), before.lastIndexOf("<th"), before.lastIndexOf("<img"), before.lastIndexOf("<script"));
  const tag = before.slice(open, open + 12).replace(/[^a-z0-9<]/gi, "");
  console.log(`[${++n}] @${i} ${tag} :: ...${raw.slice(Math.max(0, i - 70), i)}⟦${raw.slice(i, i + focus.length)}⟧${raw.slice(i + focus.length, i + focus.length + 60)}...`.replace(/\n/g, " "));
}
console.log("total", n);
