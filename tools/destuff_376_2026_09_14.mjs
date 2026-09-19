import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = "D:/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const DRY = process.argv.includes("--dry");
const ID = 376;

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

// Trang nay dung chung template voi ID 377 (chi khac tu khoa). Ngoai giam
// mat do "gia thong tac cong ha long" tu 28 xuong, con sua 3 loi ngu phap
// that do the substitution tao ra: "Bang gia gia...", "Khu vuc nhan gia...",
// "Gia gia... tinh the nao?".
const REPLACEMENTS = [
  ["Dịch vụ <strong>giá thông tắc cống Hạ Long</strong> tập trung vào kiểm tra đúng nguyên nhân",
   "Dịch vụ này tập trung vào kiểm tra đúng nguyên nhân"],
  ["Bạn nên gọi hỗ trợ <strong>giá thông tắc cống Hạ Long</strong> khi gặp các dấu hiệu sau:",
   "Bạn nên gọi hỗ trợ ngay khi gặp các dấu hiệu sau:"],
  ["giúp đội <strong>giá thông tắc cống Hạ Long</strong> mang đúng thiết bị ngay từ đầu.",
   "giúp đội kỹ thuật mang đúng thiết bị ngay từ đầu."],
  ["Xác định đúng nguyên nhân giúp <strong>giá thông tắc cống Hạ Long</strong> xử lý nhanh và giảm phát sinh.",
   "Xác định đúng nguyên nhân giúp việc xử lý nhanh hơn và giảm phát sinh."],
  ["để đặt lịch <strong>giá thông tắc cống Hạ Long</strong>. Cung cấp vị trí",
   "để đặt lịch xử lý. Cung cấp vị trí"],
  ["Cam kết đầu tiên của <strong>giá thông tắc cống Hạ Long</strong> là không đục phá",
   "Cam kết đầu tiên của dịch vụ là không đục phá"],
  ["đội <strong>giá thông tắc cống Hạ Long</strong> ưu tiên thiết bị gọn, kéo ống hợp lý",
   "đội kỹ thuật ưu tiên thiết bị gọn, kéo ống hợp lý"],
  ["<h2>Bảng giá giá thông tắc cống Hạ Long</h2>",
   "<h2>Bảng Giá Thông Tắc Cống Hạ Long</h2>"],
  ["Chi phí <strong>giá thông tắc cống Hạ Long</strong> phụ thuộc vào nguyên nhân",
   "Chi phí xử lý phụ thuộc vào nguyên nhân"],
  ["Quy trình <strong>giá thông tắc cống Hạ Long</strong> được làm rõ",
   "Quy trình xử lý được làm rõ"],
  ["Đội <strong>giá thông tắc cống Hạ Long</strong> thao tác bằng thiết bị phù hợp",
   "Đội kỹ thuật thao tác bằng thiết bị phù hợp"],
  ["<h2>Khu vực nhận giá thông tắc cống Hạ Long</h2>",
   "<h2>Khu Vực Áp Dụng Giá Thông Tắc Cống Hạ Long</h2>"],
  ["Sau khi đến nơi, đội <strong>giá thông tắc cống Hạ Long</strong> kiểm tra điểm phát sinh",
   "Sau khi đến nơi, đội kỹ thuật kiểm tra điểm phát sinh"],
  ["Trước khi đội <strong>giá thông tắc cống Hạ Long</strong> đến, khách nên dừng xả nước",
   "Trước khi đội kỹ thuật đến, khách nên dừng xả nước"],
  ["Khi cần <strong>giá thông tắc cống Hạ Long</strong>, gọi ngay <strong>0963.953.533 / 0931.156.756</strong>. Đội kỹ thuật hỏi nhanh",
   "Khi cần báo giá gấp, gọi ngay <strong>0963.953.533 / 0931.156.756</strong>. Đội kỹ thuật hỏi nhanh"],
  ["Với ca gấp, <strong>giá thông tắc cống Hạ Long</strong> được ưu tiên xử lý theo vị trí gần nhất.",
   "Với ca gấp, yêu cầu này được ưu tiên xử lý theo vị trí gần nhất."],
  ["<h3>Giá giá thông tắc cống Hạ Long tính thế nào?</h3>",
   "<h3>Giá Thông Tắc Cống Hạ Long Tính Thế Nào?</h3>"],
  ["Phần lớn ca <strong>giá thông tắc cống Hạ Long</strong> không cần đục phá nếu có thể tiếp cận",
   "Phần lớn ca này không cần đục phá nếu có thể tiếp cận"],
  ["Cần <strong>giá thông tắc cống Hạ Long</strong>, gọi ngay <strong>0963.953.533 / 0931.156.756</strong> để được hỏi tình trạng",
   "Cần báo giá ngay, gọi <strong>0963.953.533 / 0931.156.756</strong> để được hỏi tình trạng"],
];

async function main() {
  const r = await fetch(`https://${HOST}/wp-json/wp/v2/posts/${ID}?context=edit`, { headers: { Authorization: auth } });
  const post = await r.json();
  let raw = post.content.raw;
  const before = (raw.match(/giá thông tắc cống hạ long/gi) || []).length;

  let applied = 0, missed = [];
  for (const [find, replace] of REPLACEMENTS) {
    if (raw.includes(find)) { raw = raw.replace(find, replace); applied++; }
    else missed.push(find.slice(0, 70));
  }
  const after = (raw.match(/giá thông tắc cống hạ long/gi) || []).length;

  console.log(`Truoc: ${before} lan | Sau: ${after} lan | Da ap dung: ${applied}/${REPLACEMENTS.length}`);
  if (missed.length) { console.log("KHONG KHOP:"); missed.forEach(m => console.log(" -", m)); }

  if (DRY) return;

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/destuff-376-${stamp}`;
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
