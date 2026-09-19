import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = "D:/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const DRY = process.argv.includes("--dry");
const ID = 2046;

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

const REPLACEMENTS = [
  ["Xác định đúng mùi hôi cống nguyên nhân xử lý từ đâu là bước quan trọng nhất",
   "Xác định đúng nguồn gốc mùi hôi từ đâu là bước quan trọng nhất"],
  ["Mùi hôi cống nguyên nhân xử lý đúng cách cần tìm nguồn phát trước",
   "Xử lý đúng cách cần tìm nguồn phát trước"],
  ["mùi hôi cống nguyên nhân xử lý cần thông ống hơi trên mái.",
   "cần thông ống hơi trên mái để xử lý triệt để."],
  ["<h2>Cách Xác Định Đúng Mùi Hôi Cống Nguyên Nhân Xử Lý Từ Đâu</h2>",
   "<h2>Cách Xác Định Đúng Nguồn Gốc Mùi Hôi Từ Đâu</h2>"],
  ["Để mùi hôi cống nguyên nhân xử lý hiệu quả, cần thu hẹp vị trí",
   "Để xử lý hiệu quả, cần thu hẹp vị trí"],
  ["<h2>Bảng Giá Xử Lý Mùi Hôi Cống Nguyên Nhân Xử Lý</h2>",
   "<h2>Bảng Giá Xử Lý Mùi Hôi Cống</h2>"],
  ["Gói khảo sát tìm mùi hôi cống nguyên nhân xử lý miễn phí khi đặt dịch vụ.",
   "Gói khảo sát tìm nguyên nhân miễn phí khi đặt dịch vụ."],
  ["<h2>Quy Trình 5 Bước Xử Lý Mùi Hôi Cống Nguyên Nhân Xử Lý</h2>",
   "<h2>Quy Trình 5 Bước Xử Lý Mùi Hôi Cống</h2>"],
  ["bị mùi hôi cống nguyên nhân xử lý không rõ từ nhà vệ sinh tầng 2",
   "bị mùi hôi không rõ nguyên nhân từ nhà vệ sinh tầng 2"],
  ["mùi hôi cống nguyên nhân xử lý hoàn toàn trong 20 phút",
   "mùi hôi hết hoàn toàn trong 20 phút"],
];

async function main() {
  const r = await fetch(`https://${HOST}/wp-json/wp/v2/posts/${ID}?context=edit`, { headers: { Authorization: auth } });
  const post = await r.json();
  let raw = post.content.raw;
  const before = (raw.match(/mùi hôi cống nguyên nhân xử lý/gi) || []).length;

  let applied = 0, missed = [];
  for (const [find, replace] of REPLACEMENTS) {
    if (raw.includes(find)) { raw = raw.replace(find, replace); applied++; }
    else missed.push(find.slice(0, 60));
  }
  const after = (raw.match(/mùi hôi cống nguyên nhân xử lý/gi) || []).length;

  console.log(`Truoc: ${before} lan | Sau: ${after} lan | Da ap dung: ${applied}/${REPLACEMENTS.length}`);
  if (missed.length) { console.log("KHONG KHOP:"); missed.forEach(m => console.log(" -", m)); }

  if (DRY) return;

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/destuff-2046-${stamp}`;
  mkdirSync(backupDir, { recursive: true });
  writeFileSync(`${backupDir}/${ID}.json`, JSON.stringify({ id: ID, title: post.title.raw, content: post.content.raw }, null, 2), "utf8");

  const res = await fetch(`https://${HOST}/wp-json/wp/v2/posts/${ID}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ content: raw }),
  });
  console.log("Update status:", res.status);
  console.log("Backup:", backupDir);
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
