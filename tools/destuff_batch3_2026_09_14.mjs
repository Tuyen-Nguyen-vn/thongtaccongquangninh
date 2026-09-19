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

// Batch 3: cac trang "huyen dao xa" (Binh Lieu, Tien Yen, Co To, Bai Chay,
// Tuan Chau, Uong Bi, lien-he) dung mau lap "Khi nao can goi X / Cam ket 3
// Khong khi X / Bang gia X / Quy trinh 5 buoc X / Luu y truoc khi dat lich
// X" - cung mot loai loi nhu batch 1 va 2, chi khac dia danh.
const PAGES = [
  { id: 63, type: "pages", phrase: "liên hệ thông tắc cống Quảng Ninh", keepN: 3, short: "liên hệ với chúng tôi" },
  { id: 4677, type: "posts", phrase: "hút bể phốt nhà trọ Uông Bí", keepN: 4, short: "dịch vụ này" },
  { id: 2041, type: "posts", phrase: "thông tắc cống Tuần Châu", keepN: 5, short: "dịch vụ này" },
  { id: 2052, type: "posts", phrase: "hút bể phốt Tiên Yên", keepN: 5, short: "dịch vụ này" },
  { id: 436, type: "pages", phrase: "hút bể phốt tại Bãi Cháy", keepN: 5, short: "dịch vụ này" },
  { id: 2049, type: "posts", phrase: "hút bể phốt Cô Tô", keepN: 5, short: "dịch vụ này" },
  { id: 2048, type: "posts", phrase: "hút bể phốt Bình Liêu", keepN: 5, short: "dịch vụ này" },
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
  const backupDir = `${ROOT}/backups/destuff-batch3-${id}-${stamp}`;
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
