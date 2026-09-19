import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = "D:/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const DRY = process.argv.includes("--dry");
const ID = 3278;
const TYPE = "pages";

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

// Trang nay viet tu nhien hon cac trang khac, chi giam bot lap lai trong
// than doan van (giu heading, cau hoi FAQ va vai lan nhac tu nhien dau
// moi section).
const REPLACEMENTS = [
  ["Môi Trường Đô Thị Số 1 Quảng Ninh tiếp nhận ca <strong>thông tắc bồn cầu Hùng Thắng</strong> trong khung",
   "Môi Trường Đô Thị Số 1 Quảng Ninh tiếp nhận ca này trong khung"],
  ["không thay thế được dịch vụ <strong>thông tắc bồn cầu Hùng Thắng</strong> khi có dị vật cứng hay lỗi đường ống.",
   "không thay thế được dịch vụ chuyên nghiệp khi có dị vật cứng hay lỗi đường ống."],
  ["Với những dấu hiệu trên, <strong>thông tắc bồn cầu Hùng Thắng</strong> nên bắt đầu bằng kiểm tra nguyên nhân.",
   "Với những dấu hiệu trên, nên bắt đầu bằng kiểm tra nguyên nhân."],
  ["Với ca <strong>thông tắc bồn cầu Hùng Thắng</strong>, thợ cần hỏi đúng loại nhà",
   "Với ca này, thợ cần hỏi đúng loại nhà"],
  ["Vì vậy <strong>thông tắc bồn cầu Hùng Thắng</strong> cần kiểm tra cả cổ xả",
   "Vì vậy cần kiểm tra cả cổ xả"],
  ["Nên gọi thợ <strong>thông tắc bồn cầu Hùng Thắng</strong> ngay khi:",
   "Nên gọi thợ ngay khi:"],
  ["<strong>thông tắc bồn cầu Hùng Thắng</strong> nên được xử lý ngay khi nước bắt đầu dâng bất thường.",
   "nên được xử lý ngay khi nước bắt đầu dâng bất thường."],
  ["Mục tiêu của ca <strong>thông tắc bồn cầu Hùng Thắng</strong> là giải quyết nghẹt bồn cầu",
   "Mục tiêu của dịch vụ là giải quyết nghẹt bồn cầu"],
  ["Một tình huống <strong>thông tắc bồn cầu Hùng Thắng</strong> thường gặp là nhà liền kề",
   "Một tình huống thường gặp là nhà liền kề"],
  ["nội dung <strong>thông tắc bồn cầu Hùng Thắng</strong> chỉ dùng làm ví dụ kỹ thuật",
   "nội dung này chỉ dùng làm ví dụ kỹ thuật"],
  ["Chính sách bảo hành <strong>thông tắc bồn cầu Hùng Thắng</strong> phụ thuộc nguyên nhân",
   "Chính sách bảo hành phụ thuộc nguyên nhân"],
  ["Giá <strong>thông tắc bồn cầu Hùng Thắng</strong> tham khảo từ 250.000đ cho ca tắc nhẹ",
   "Giá tham khảo từ 250.000đ cho ca tắc nhẹ"],
  ["thời gian điều thợ <strong>thông tắc bồn cầu Hùng Thắng</strong> thường nhanh hơn các khu xa",
   "thời gian điều thợ thường nhanh hơn các khu xa"],
  ["Phần lớn ca <strong>thông tắc bồn cầu Hùng Thắng</strong> không cần đục nền.",
   "Phần lớn ca này không cần đục nền."],
  ["Có tiếp nhận <strong>thông tắc bồn cầu Hùng Thắng</strong> trong khung <strong>05:00-22:00</strong>.",
   "Có tiếp nhận yêu cầu này trong khung <strong>05:00-22:00</strong>."],
  ["để được tư vấn <strong>thông tắc bồn cầu Hùng Thắng</strong>, báo hướng xử lý",
   "để được tư vấn, báo hướng xử lý"],
];

async function main() {
  const r = await fetch(`https://${HOST}/wp-json/wp/v2/${TYPE}/${ID}?context=edit`, { headers: { Authorization: auth } });
  const post = await r.json();
  let raw = post.content.raw;
  const before = (raw.match(/thông tắc bồn cầu hùng thắng/gi) || []).length;

  let applied = 0, missed = [];
  for (const [find, replace] of REPLACEMENTS) {
    if (raw.includes(find)) { raw = raw.replace(find, replace); applied++; }
    else missed.push(find.slice(0, 70));
  }
  const after = (raw.match(/thông tắc bồn cầu hùng thắng/gi) || []).length;

  console.log(`Truoc: ${before} lan | Sau: ${after} lan | Da ap dung: ${applied}/${REPLACEMENTS.length}`);
  if (missed.length) { console.log("KHONG KHOP:"); missed.forEach(m => console.log(" -", m)); }

  if (DRY) return;

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/destuff-3278-${stamp}`;
  mkdirSync(backupDir, { recursive: true });
  writeFileSync(`${backupDir}/${ID}.json`, JSON.stringify({ id: ID, title: post.title.raw, content: post.content.raw }, null, 2), "utf8");

  const res = await fetch(`https://${HOST}/wp-json/wp/v2/${TYPE}/${ID}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ content: raw }),
  });
  console.log("Update status:", res.status);
  console.log("Backup:", backupDir);
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
