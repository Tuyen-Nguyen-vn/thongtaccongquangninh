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

// Pass 2: fix con 20 lan lap "mui hoi cong nguyen nhan" ma pass 1 (destuff_2046)
// chua bat het (khac cau so voi pass 1).
const REPLACEMENTS = [
  ["Mùi hôi cống nguyên nhân xử lý là vấn đề nhiều gia đình ở Hạ Long, Cẩm Phả gặp phải, đặc biệt mùa hè nắng nóng. Mùi hôi cống nguyên nhân không chỉ gây khó chịu mà còn chứa H2S và NH3",
   "Mùi hôi cống là vấn đề nhiều gia đình ở Hạ Long, Cẩm Phả gặp phải, đặc biệt mùa hè nắng nóng. Đây không chỉ gây khó chịu mà còn chứa H2S và NH3"],
  ["đây là mùi hôi cống nguyên nhân phổ biến nhất, dễ xử lý nhất.",
   "đây là nguyên nhân phổ biến nhất, dễ xử lý nhất."],
  ["mùi hôi cống nguyên nhân từ cống thành phố ngấm vào qua hố ga hở.",
   "mùi từ cống thành phố ngấm vào qua hố ga hở."],
  ["Cam Kết 3 Không Khi Xử Lý Mùi Hôi Cống Nguyên Nhân",
   "Cam Kết 3 Không Khi Xử Lý Mùi Hôi Cống"],
  ["tìm và xử lý đúng nguồn mùi hôi cống nguyên nhân, không che giấu triệu chứng.",
   "tìm và xử lý đúng nguồn gốc, không che giấu triệu chứng."],
  ["<tr><th>Loại xử lý mùi hôi cống nguyên nhân</th><th>Đơn giá</th></tr>",
   "<tr><th>Loại xử lý</th><th>Đơn giá</th></tr>"],
  ["nếu mùi hôi cống nguyên nhân giảm ngay thì xi phông đang khô.",
   "nếu mùi giảm ngay thì xi phông đang khô."],
  ["<strong>Xử lý đúng nguồn mùi hôi cống nguyên nhân:</strong>",
   "<strong>Xử lý đúng nguồn gốc:</strong>"],
  ["Case Study E-E-A-T: Xử Lý Mùi Hôi Cống Nguyên Nhân Tại Hạ Long",
   "Case Study E-E-A-T: Xử Lý Mùi Hôi Cống Tại Hạ Long"],
  ["Khu Vực Xử Lý Mùi Hôi Cống Nguyên Nhân Tại Quảng Ninh",
   "Khu Vực Xử Lý Mùi Hôi Cống Tại Quảng Ninh"],
  ["Dịch vụ tìm và xử lý mùi hôi cống nguyên nhân tại:",
   "Dịch vụ tìm và xử lý mùi hôi cống tại:"],
  ["FAQ – Câu Hỏi Về Mùi Hôi Cống Nguyên Nhân Xử Lý",
   "FAQ – Câu Hỏi Về Mùi Hôi Cống"],
  ["Tại sao nhà mới xây vẫn có mùi hôi cống nguyên nhân?</summary><p>Nhà mới thường thiếu ống thông hơi hoặc xi phông chưa có nước vì chưa dùng. Mùi hôi cống nguyên nhân xử lý này xuất hiện ngay từ tuần đầu vào ở",
   "Tại sao nhà mới xây vẫn có mùi hôi cống?</summary><p>Nhà mới thường thiếu ống thông hơi hoặc xi phông chưa có nước vì chưa dùng. Tình trạng này xuất hiện ngay từ tuần đầu vào ở"],
  ["Mùi hôi cống nguyên nhân H2S có hại sức khỏe không?</summary><p>H2S và NH3 trong khí cống ở nồng độ thấp gây đau đầu, buồn nôn. Nồng độ cao có thể gây ngất. Trẻ em và người cao tuổi nhạy cảm hơn – cần xử lý mùi hôi cống nguyên nhân sớm.",
   "Mùi hôi cống do khí H2S có hại sức khỏe không?</summary><p>H2S và NH3 trong khí cống ở nồng độ thấp gây đau đầu, buồn nôn. Nồng độ cao có thể gây ngất. Trẻ em và người cao tuổi nhạy cảm hơn – cần xử lý sớm."],
  ["Làm sao ngăn mùi hôi cống nguyên nhân tái phát?</summary><p>Đổ nước vào hố ga ít dùng ít nhất 1 lần/tuần. Hút bể phốt định kỳ 2-3 năm/lần. Kiểm tra gioăng ống 5 năm/lần để chặn mùi hôi cống nguyên nhân từ gốc.",
   "Làm sao ngăn mùi hôi cống tái phát?</summary><p>Đổ nước vào hố ga ít dùng ít nhất 1 lần/tuần. Hút bể phốt định kỳ 2-3 năm/lần. Kiểm tra gioăng ống 5 năm/lần để chặn mùi từ gốc."],
  ["NAP – Liên Hệ Xử Lý Mùi Hôi Cống Nguyên Nhân Quảng Ninh",
   "NAP – Liên Hệ Xử Lý Mùi Hôi Cống Quảng Ninh"],
];

async function main() {
  const r = await fetch(`https://${HOST}/wp-json/wp/v2/posts/${ID}?context=edit`, { headers: { Authorization: auth } });
  const post = await r.json();
  let raw = post.content.raw;
  const before = (raw.match(/mùi hôi cống nguyên nhân/gi) || []).length;

  let applied = 0, missed = [];
  for (const [find, replace] of REPLACEMENTS) {
    if (raw.includes(find)) { raw = raw.replace(find, replace); applied++; }
    else missed.push(find.slice(0, 70));
  }
  const after = (raw.match(/mùi hôi cống nguyên nhân/gi) || []).length;

  console.log(`Truoc: ${before} lan | Sau: ${after} lan | Da ap dung: ${applied}/${REPLACEMENTS.length}`);
  if (missed.length) { console.log("KHONG KHOP:"); missed.forEach(m => console.log(" -", m)); }

  if (DRY) return;

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/destuff-2046-pass2-${stamp}`;
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
