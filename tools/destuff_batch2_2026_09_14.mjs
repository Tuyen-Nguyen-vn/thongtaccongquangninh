import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = "D:/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const DRY = process.argv.includes("--dry");

function readEnv(file) {
  const values = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) values[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return values;
}
const env = readEnv(`${ROOT}/.env`);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

// Batch 2: cac trang con lai dung chung mau "seo-supplement" (Nguyen Nhan/
// Cam Ket/Bang Gia/Quy Trinh/Case Study/FAQ/NAP nhoi cum tu khoa vao moi
// heading). Giu N lan dau (du de tu nhien o than bai chinh), rut gon cac
// lan sau thanh cum ngan chung.
const PAGES = [
  { id: 23, type: "pages", phrase: "thông tắc cống Quảng Ninh", keepN: 8, short: "dịch vụ này" },
  { id: 62, type: "pages", phrase: "dịch vụ thông tắc Quảng Ninh", keepN: 3, short: "dịch vụ này" },
  { id: 2769, type: "posts", phrase: "hút bể phốt khu công nghiệp", keepN: 5, short: "dịch vụ này" },
  { id: 2777, type: "posts", phrase: "thông tắc cống khẩn cấp", keepN: 5, short: "dịch vụ này" },
  { id: 2025, type: "pages", phrase: "chi phí hút bể phốt Quảng Ninh", keepN: 4, short: "chi phí này" },
  { id: 386, type: "pages", phrase: "nguyên nhân tắc nghẽn tại Hạ Long", keepN: 4, short: "tình trạng này" },
  { id: 2559, type: "posts", phrase: "hút hầm cầu Quảng Ninh", keepN: 5, short: "dịch vụ này" },
  { id: 1369, type: "posts", phrase: "xử lý mùi hôi nhà vệ sinh", keepN: 5, short: "việc xử lý này" },
  { id: 2787, type: "posts", phrase: "giá thông tắc cống Quảng Ninh", keepN: 4, short: "giá dịch vụ" },
  { id: 2519, type: "posts", phrase: "bảng giá hút bể phốt Quảng Ninh", keepN: 3, short: "bảng giá này" },
  { id: 38, type: "pages", phrase: "nạo vét hố ga", keepN: 8, short: "việc này" },
  { id: 1368, type: "posts", phrase: "nạo vét hố ga", keepN: 8, short: "việc này" },
  { id: 2332, type: "posts", phrase: "thông tắc cống tại Hạ Long", keepN: 6, short: "tình trạng này" },
];

async function processPage({ id, type, phrase, keepN, short }) {
  const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const r = await fetch(`https://${HOST}/wp-json/wp/v2/${type}/${id}?context=edit`, { headers: { Authorization: auth } });
  if (!r.ok) { console.log(`[${id}] FETCH FAILED status=${r.status}`); return; }
  const post = await r.json();
  let raw = post.content.raw;
  const before = (raw.match(re) || []).length;

  let count = 0;
  raw = raw.replace(re, (match) => {
    count++;
    if (count <= keepN) return match;
    const isUpper = match[0] === match[0].toUpperCase();
    return isUpper ? short[0].toUpperCase() + short.slice(1) : short;
  });
  const after = (raw.match(re) || []).length;

  console.log(`[${id}] ${post.title.raw.slice(0, 50)} | "${phrase}": ${before} -> ${after} (giu ${keepN})`);

  if (DRY) return;

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/destuff-batch2-${id}-${stamp}`;
  mkdirSync(backupDir, { recursive: true });
  writeFileSync(`${backupDir}/${id}.json`, JSON.stringify({ id, title: post.title.raw, content: post.content.raw }, null, 2), "utf8");

  const res = await fetch(`https://${HOST}/wp-json/wp/v2/${type}/${id}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ content: raw }),
  });
  console.log(`   -> update status=${res.status}, backup=${backupDir}`);
}

async function main() {
  for (const page of PAGES) {
    await processPage(page);
  }
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
