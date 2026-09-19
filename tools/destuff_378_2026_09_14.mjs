import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = "D:/.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const DRY = process.argv.includes("--dry");
const ID = 378;

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
  ["Dịch vụ <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> tập trung vào kiểm tra đúng nguyên nhân",
   "Dịch vụ này tập trung vào kiểm tra đúng nguyên nhân"],
  ["Bạn nên gọi hỗ trợ <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> khi gặp các dấu hiệu sau",
   "Bạn nên gọi thợ khi gặp các dấu hiệu sau"],
  ["Những thông tin này giúp đội <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> mang đúng thiết bị ngay từ đầu.",
   "Những thông tin này giúp đội kỹ thuật mang đúng thiết bị ngay từ đầu."],
  ["Xác định đúng nguyên nhân giúp <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> xử lý nhanh và giảm phát sinh.",
   "Xác định đúng nguyên nhân giúp xử lý nhanh và giảm phát sinh."],
  ["Khách gọi <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> thường đang cần xử lý nhanh",
   "Khách gọi dịch vụ này thường đang cần xử lý nhanh"],
  ["để đặt lịch <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong>. Cung cấp vị trí",
   "để đặt lịch xử lý. Cung cấp vị trí"],
  ["Cam kết đầu tiên của <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> là không đục phá khi chưa có căn cứ kỹ thuật.",
   "Cam kết đầu tiên là không đục phá khi chưa có căn cứ kỹ thuật."],
  ["đội <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> ưu tiên thiết bị gọn, kéo ống hợp lý",
   "đội kỹ thuật ưu tiên thiết bị gọn, kéo ống hợp lý"],
  ["Chi phí <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> phụ thuộc vào nguyên nhân",
   "Chi phí phụ thuộc vào nguyên nhân"],
  ["Quy trình <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> được làm rõ để khách biết thợ đang xử lý đến đâu",
   "Quy trình được làm rõ để khách biết thợ đang xử lý đến đâu"],
  ["Bước 4: Thi công gọn. Đội <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> thao tác bằng thiết bị phù hợp",
   "Bước 4: Thi công gọn. Đội kỹ thuật thao tác bằng thiết bị phù hợp"],
  ["Môi Trường Đô Thị Số 1 Quảng Ninh nhận <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> tại Hạ Long và các khu vực lân cận.",
   "Môi Trường Đô Thị Số 1 Quảng Ninh nhận xử lý tại Hạ Long và các khu vực lân cận."],
  ["Sau khi đến nơi, đội <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> kiểm tra điểm phát sinh, hố ga, đường thoát",
   "Sau khi đến nơi, đội kỹ thuật kiểm tra điểm phát sinh, hố ga, đường thoát"],
  ["Trước khi đội <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> đến, khách nên dừng xả nước nếu đã trào.",
   "Trước khi thợ đến, khách nên dừng xả nước nếu đã trào."],
  ["Dịch vụ chính tại Hạ Long: <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong>, hút bể phốt, thông tắc cống",
   "Dịch vụ chính tại Hạ Long: hút bể phốt, thông tắc cống"],
  ["Khi cần <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong>, gọi ngay <strong>0963.953.533 / 0931.156.756</strong>. Đội kỹ thuật hỏi nhanh",
   "Khi cần xử lý gấp, gọi ngay <strong>0963.953.533 / 0931.156.756</strong>. Đội kỹ thuật hỏi nhanh"],
  ["Với ca gấp, <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> được ưu tiên xử lý theo vị trí gần nhất.",
   "Với ca gấp, đội kỹ thuật ưu tiên xử lý theo vị trí gần nhất."],
  ["<h3>Hút bể phốt Hạ Long xe hút chuyên dụng có cần đục phá không?</h3>",
   "<h3>Dịch vụ này có cần đục phá nhà không?</h3>"],
  ["Phần lớn ca <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong> không cần đục phá nếu có thể tiếp cận",
   "Phần lớn ca xử lý không cần đục phá nếu có thể tiếp cận"],
  ["Cần <strong>hút bể phốt Hạ Long xe hút chuyên dụng</strong>, gọi ngay <strong>0963.953.533 / 0931.156.756</strong> để được hỏi tình trạng",
   "Cần xử lý gấp, gọi ngay <strong>0963.953.533 / 0931.156.756</strong> để được hỏi tình trạng"],
  ["<figcaption class=\"wp-element-caption\">Ảnh thi công thực tế Hút bể phốt Hạ Long xe hút chuyên dụng, xử lý nhanh trong ngày</figcaption></figure>\n\n\n<p>Khi gặp bể đầy",
   "<figcaption class=\"wp-element-caption\">Ảnh thi công thực tế xử lý bể phốt tại Hạ Long, hoàn thành trong ngày</figcaption></figure>\n\n\n<p>Khi gặp bể đầy"],
  ["<figcaption class=\"wp-element-caption\">Ảnh thi công thực tế Hút bể phốt Hạ Long xe hút chuyên dụng, xử lý nhanh trong ngày</figcaption></figure>",
   "<figcaption class=\"wp-element-caption\">Xe hút chuyên dụng xử lý bể phốt tại hộ gia đình Hạ Long</figcaption></figure>"],
];

async function main() {
  const r = await fetch(`https://${HOST}/wp-json/wp/v2/posts/${ID}?context=edit`, { headers: { Authorization: auth } });
  const post = await r.json();
  let raw = post.content.raw;
  const before = (raw.match(/hút bể phốt hạ long xe hút chuyên dụng/gi) || []).length;

  let applied = 0, missed = [];
  for (const [find, replace] of REPLACEMENTS) {
    if (raw.includes(find)) { raw = raw.replace(find, replace); applied++; }
    else missed.push(find.slice(0, 60));
  }
  const after = (raw.match(/hút bể phốt hạ long xe hút chuyên dụng/gi) || []).length;

  console.log(`Truoc: ${before} lan | Sau: ${after} lan | Da ap dung: ${applied}/${REPLACEMENTS.length}`);
  if (missed.length) { console.log("KHONG KHOP:"); missed.forEach(m => console.log(" -", m)); }

  if (DRY) return;

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const backupDir = `${ROOT}/backups/destuff-378-${stamp}`;
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
