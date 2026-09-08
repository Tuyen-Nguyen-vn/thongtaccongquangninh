// Tạo bài blog "Cẩm Nang Hút Bể Phốt Tại Hạ Long" trực tiếp trên WordPress qua REST API,
// ở trạng thái NHÁP (draft) — KHÔNG tự đăng công khai. Bạn mở bài trong WordPress, thêm
// 2 ảnh thật (script này không có ảnh thật để tự chèn), đọc lại rồi tự bấm Đăng (Publish).
//
// Nội dung, Title, Meta, FAQ giống hệt bản đã gửi trong content/cam-nang-hut-be-phot-tai-ha-long.md
// — script này chỉ là cách nhanh hơn để đưa đúng nội dung đó lên WordPress mà không phải
// copy-paste tay từng phần.
//
// Cách chạy (trên máy Windows có D:/.thongtaccongquangninh/.env chứa WP_USERNAME + WP_APP_PASSWORD):
//   node tools/publish_cam_nang_hut_be_phot_ha_long.mjs --dry     # xem trước, KHÔNG ghi gì lên site
//   node tools/publish_cam_nang_hut_be_phot_ha_long.mjs           # tạo bài NHÁP thật trên WordPress
//
// Chạy xong (không phải --dry), script in ra một đường link dạng:
//   https://thongtaccongquangninh.com/wp-admin/post.php?post=1234&action=edit
// Mở link đó, đăng nhập WordPress, thêm 2 ảnh theo gợi ý alt text in ra cuối log, đọc lại
// toàn bài rồi mới bấm "Đăng" (Publish). Bài KHÔNG hiển thị công khai cho tới khi bạn bấm Đăng.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import https from "node:https";

const ENV_PATH = "D:/.thongtaccongquangninh/.env";
const HOST = "thongtaccongquangninh.com";
const ROOT = "D:/.thongtaccongquangninh";
const DRY = process.argv.includes("--dry");

function readEnv(file) {
  const values = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) values[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return values;
}

function request(method, urlPath, auth, payload) {
  return new Promise((resolve, reject) => {
    const body = payload === undefined ? null : Buffer.from(JSON.stringify(payload), "utf8");
    const req = https.request(
      { hostname: HOST, port: 443, path: urlPath, method,
        headers: { Authorization: auth, Accept: "application/json",
          ...(body ? { "Content-Type": "application/json", "Content-Length": body.length } : {}) } },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, text: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error("timeout")));
    if (body) req.write(body);
    req.end();
  });
}

const TITLE = "Cẩm Nang Hút Bể Phốt Tại Hạ Long – Dấu Hiệu, Giá, Quy Trình";
const META_DESC = "Cẩm nang hút bể phốt tại Hạ Long: dấu hiệu bể đầy, giá tham khảo theo khu vực, quy trình 5 bước. Cần xe đến ngay, gọi 0963.953.533 / 0931.156.756.";
const FOCUS_KEYWORD = "hút bể phốt tại hạ long";
const SLUG = "cam-nang-hut-be-phot-tai-ha-long";

function p(text) { return `<p>${text}</p>`; }
function h2(text) { return `<h2>${text}</h2>`; }
function h3(text) { return `<h3>${text}</h3>`; }
function ul(items) { return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`; }
function ol(items) { return `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>`; }

const FAQ = [
  ["Hút bể phốt tại Hạ Long có làm được vào buổi tối không?",
    "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
  ["Nhà trong ngõ nhỏ dưới 1m ở khu Hồng Gai có hút được không?",
    "Có. Dùng ống nối dài kéo từ xe đỗ ở đường lớn vào, không cần xe vào tận cửa."],
  ["Hút bể phốt tại Hạ Long xong có được bảo hành không?",
    "Có ghi nhận ngày hút và kiểm tra đường ống trong buổi làm việc. Nếu bể đầy lại bất thường trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
  ["Có cần đục nền để tìm nắp bể không?",
    "Không đục phá nếu xác định được vị trí nắp qua bản vẽ nhà hoặc mô tả của gia chủ. Chỉ đề xuất đục khi nắp bị bê tông hoá hoàn toàn và gia chủ đồng ý trước."],
];

function faqSchema() {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQ.map(([q, a]) => ({
      "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a },
    })),
  })}</script>`;
}

const CONTENT = [
  p("Bể phốt đầy, trào ngược hay bốc mùi đều có dấu hiệu báo trước vài ngày đến vài tuần. " +
    "Cẩm nang này ghi lại cách nhận biết, nguyên nhân đặc thù theo từng khu vực tại Hạ Long, " +
    "và quy trình thực tế đội kỹ thuật áp dụng khi xử lý. Cần xe đến khảo sát ngay, gọi " +
    "<strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong>."),

  h2("Khi nào cần hút bể phốt tại Hạ Long ngay, không nên chờ thêm"),
  p("Ba tình huống nên gọi trong ngày thay vì chờ cuối tuần:"),
  ul([
    "Nước từ bồn cầu hoặc phễu thoát sàn rút chậm hẳn so với bình thường, kèm tiếng ục ục khi xả.",
    "Mùi hôi bốc lên quanh khu vực đặt bể, đặc biệt rõ sau mưa hoặc vào buổi trưa nắng nóng.",
    "Nắp bể hoặc miệng hố ga gần đó có dấu hiệu ẩm ướt, sũng nước dù trời không mưa — dấu hiệu bể đã tràn ra đất xung quanh.",
  ]),
  p("Nếu chỉ có 1 trong 3 dấu hiệu và mới xuất hiện 1-2 ngày, có thể theo dõi thêm; nếu có từ " +
    "2 dấu hiệu trở lên, nên gọi khảo sát trong ngày để tránh nước thải tràn ra sân hoặc vào " +
    "đường ống sinh hoạt khác."),

  h2("Nguyên nhân bể phốt tại Hạ Long nhanh đầy hơn khu vực khác"),
  p("Ba yếu tố đặc thù địa phương làm bể phốt tại Hạ Long đầy nhanh hơn mức trung bình:"),
  ol([
    "<strong>Mực nước ngầm cao ở khu vực gần biển</strong> (Bãi Cháy, Tuần Châu, Hùng Thắng) khiến bể khó thoát nước ra đất xung quanh như ở vùng cao, nước tồn đọng lâu hơn.",
    "<strong>Mật độ khách lưu trú theo mùa</strong> — các phường có nhiều homestay, khách sạn nhỏ (Bãi Cháy, Hùng Thắng) có lượng nước thải tăng đột biến vào mùa du lịch hè, vượt tải thiết kế ban đầu của bể.",
    "<strong>Bể xây từ trước 2015 dung tích nhỏ</strong> — phổ biến ở khu phố cũ (Hồng Gai, Bạch Đằng, Cao Xanh), thiết kế cho hộ 3-4 người nhưng nay dùng cho hộ đông hơn hoặc cho thuê trọ.",
  ]),

  h2("Đặc điểm xử lý theo từng khu vực"),
  ul([
    "<strong>Bãi Cháy — nhà hàng, khách sạn:</strong> bể thường lẫn dầu mỡ từ bếp, cần vòi hút công suất lớn hơn để tránh tắc ống hút giữa chừng.",
    "<strong>Hồng Gai, Bạch Đằng — phố cổ, ngõ hẹp:</strong> xe bồn lớn không vào được, phải dùng xe nhỏ hoặc kéo ống mềm nối dài từ đường lớn vào.",
    "<strong>Hà Khẩu, Cao Xanh — khu chung cư, nhà trọ:</strong> bể phốt dùng chung nhiều hộ, cần xác định đúng ngăn chứa trước khi hút để tránh hút nhầm ngăn lắng.",
    "<strong>Giếng Đáy — nhà liền kề gần khu công nghiệp Cái Lân:</strong> đường ống đấu nối phức tạp, nên khảo sát bằng camera trước khi báo giá chính xác.",
    "<strong>Tuần Châu, Hùng Thắng — resort, biệt thự ven biển:</strong> bể dung tích lớn nhưng đường vào hẹp hoặc dốc, cần xe chuyên dụng cỡ nhỏ.",
  ]),

  h2("Thiết bị dùng khi hút bể phốt tại Hạ Long"),
  ul([
    "Xe bồn 2-5 khối tuỳ khu vực (khu ngõ nhỏ dùng xe nhỏ hơn, khu mặt đường lớn dùng xe 5 khối để giảm số chuyến).",
    "Máy hút chân không công suất đủ kéo bùn đặc, không chỉ hút nước trong.",
    "Ống mềm nối dài 15-30m cho trường hợp xe không đỗ sát được miệng bể.",
    "Camera dò đường ống (dùng khi nghi ngờ tắc do đường ống chứ không phải bể đầy).",
  ]),

  h2("Quy trình 5 bước"),
  ol([
    "<strong>Tiếp nhận qua điện thoại</strong> — hỏi vị trí, loại công trình (nhà dân/nhà hàng/khách sạn), lần hút gần nhất nếu nhớ được.",
    "<strong>Điều xe theo khu vực</strong> — ưu tiên xe gần nhất trong bán kính đang phục vụ để rút ngắn thời gian có mặt.",
    "<strong>Khảo sát tại chỗ</strong> — xác định vị trí nắp bể, dung tích ước lượng, báo giá trước khi hút.",
    "<strong>Hút và vệ sinh</strong> — hút sạch ngăn chứa, kiểm tra đường ống dẫn vào bể có thông không.",
    "<strong>Bàn giao và ghi nhận</strong> — đóng nắp bể đúng vị trí, ghi lại ngày hút để tính chu kỳ bảo trì lần sau.",
  ]),

  h2("Giá tham khảo (thay đổi theo dung tích bể và khoảng cách xe đỗ)"),
  p("Giá không cố định vì phụ thuộc dung tích bể thực tế và mức độ khó tiếp cận (ngõ hẹp, " +
    "tầng cao, khoảng cách đỗ xe). Cách chính xác nhất là gọi mô tả tình trạng hoặc gửi ảnh " +
    "khu vực đặt bể để được báo số cụ thể trước khi xe xuất phát — không báo giá ảo rồi " +
    "phát sinh khi đến nơi. Xem <a href=\"https://thongtaccongquangninh.com/hut-be-phot-ha-long/\">" +
    "bảng giá chi tiết hút bể phốt tại Hạ Long</a> để tham khảo trước."),

  h2("Cách hạn chế bể phốt nhanh đầy trở lại"),
  ul([
    "Không đổ dầu mỡ ăn thừa, bã cà phê đặc, tã giấy xuống bồn cầu hoặc phễu thoát sàn nối vào bể.",
    "Hạn chế đổ hoá chất tẩy rửa mạnh với tần suất cao — vi sinh phân hủy tự nhiên trong bể bị diệt, làm chất thải tích tụ nhanh hơn thay vì phân hủy dần.",
    "Với nhà cho thuê trọ đông người, nên rút ngắn chu kỳ hút so với nhà ở thông thường thay vì đợi đến khi tràn mới gọi.",
  ]),

  h2("Tình huống thực tế"),
  p("Một homestay 8 phòng tại khu Hùng Thắng gọi vì bồn cầu tầng 1 trào ngược vào buổi sáng " +
    "cao điểm khách trả phòng. Khảo sát cho thấy bể xây năm 2016, dung tích nhỏ so với công " +
    "suất phòng hiện tại, chưa hút lần nào trong hơn 2 năm. Sau khi hút và kiểm tra " +
    "<a href=\"https://thongtaccongquangninh.com/hut-be-phot-ha-long/\">quy trình đầy đủ tại đây</a> " +
    "không có điểm gãy, chủ homestay được tư vấn rút ngắn chu kỳ hút xuống 12-14 tháng thay vì để tự nhiên."),

  h2("Câu hỏi thường gặp"),
  ...FAQ.flatMap(([q, a]) => [h3(q), p(a)]),
  p("Nếu nghi ngờ do cống tắc chứ không phải bể phốt đầy, xem thêm " +
    "<a href=\"https://thongtaccongquangninh.com/thong-tac-cong-ha-long/\">thông tắc cống tại Hạ Long</a>."),

  h2("Liên hệ"),
  p("Môi Trường Đô Thị Số 1 Quảng Ninh — hút bể phốt tại Hạ Long và các phường lân cận. " +
    "Hotline: <strong>0963.953.533 / 0931.156.756</strong>. Xem chi tiết dịch vụ và bảng giá tại " +
    "trang <a href=\"https://thongtaccongquangninh.com/hut-be-phot-ha-long/\">trang Hút bể phốt Hạ Long</a>."),

  faqSchema(),
].join("\n");

async function findCategoryId(auth, name) {
  const res = await request("GET", `/wp-json/wp/v2/categories?search=${encodeURIComponent(name)}`, auth);
  if (res.status !== 200) return null;
  try {
    const list = JSON.parse(res.text);
    return list.length ? list[0].id : null;
  } catch { return null; }
}

async function main() {
  const words = CONTENT.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
  console.log(`Title (${TITLE.length} ky tu): ${TITLE}`);
  console.log(`Meta (${META_DESC.length} ky tu): ${META_DESC}`);
  console.log(`Uoc tinh so tu noi dung: ~${words}`);
  console.log(`Slug: ${SLUG}`);

  if (DRY) {
    console.log("\n--dry: chua ghi gi len WordPress. Bo --dry de tao bai nhap that.");
    return;
  }

  const env = readEnv(ENV_PATH);
  const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

  const categoryId = await findCategoryId(auth, "Cẩm nang") || await findCategoryId(auth, "Blog");
  const payload = {
    title: TITLE,
    content: CONTENT,
    slug: SLUG,
    status: "draft",
    meta: { rank_math_description: META_DESC, rank_math_focus_keyword: FOCUS_KEYWORD },
    ...(categoryId ? { categories: [categoryId] } : {}),
  };
  if (!categoryId) console.warn("CANH BAO: khong tim thay chuyen muc 'Cam nang'/'Blog' — bai se tao khong co chuyen muc, tu gan tay sau.");

  const res = await request("POST", "/wp-json/wp/v2/posts", auth, payload);
  console.log(`\nStatus: ${res.status}`);
  if (res.status !== 201 && res.status !== 200) {
    console.error("Tao bai THAT BAI:", res.text.slice(0, 500));
    process.exit(1);
  }
  const created = JSON.parse(res.text);
  mkdirSync(`${ROOT}/reports`, { recursive: true });
  writeFileSync(`${ROOT}/reports/publish-cam-nang-hbp-halong-${Date.now()}.json`,
    JSON.stringify({ id: created.id, link: created.link, editLink: `https://${HOST}/wp-admin/post.php?post=${created.id}&action=edit` }, null, 2), "utf8");

  console.log("\n=== DA TAO BAI NHAP THANH CONG ===");
  console.log(`Mo bai de kiem tra va them anh: https://${HOST}/wp-admin/post.php?post=${created.id}&action=edit`);
  console.log("\nCON THIEU (lam tay):");
  console.log('1. Them 2 anh minh hoa, goi y alt text:');
  console.log('   - "Xe bồn hút bể phốt tại Hạ Long đỗ trước homestay khu Hùng Thắng"');
  console.log('   - "Thợ kiểm tra nắp bể phốt tại Hạ Long trước khi hút"');
  console.log("2. Doc lai toan bai trong trinh soan thao.");
  console.log("3. Bam DANG (Publish) khi da hai long — bai dang la NHAP, chua ai xem duoc cho den luc nay.");
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
