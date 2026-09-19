// Tạo bài blog theo mùa "Mùa Mưa Bão Quảng Ninh: Phòng Chống Ngập Cống, Tràn Bể Phốt"
// trên WordPress qua REST API, ở trạng thái NHÁP (draft). Nội dung tổng hợp toàn tỉnh,
// theo mốc thời gian mùa bão thực tế (tháng 6-10), có checklist trước/trong/sau bão và
// ghi chú riêng theo đặc điểm địa hình từng vùng (ven biển, đồi núi).
//
// Cách chạy (trên máy Windows có D:/.thongtaccongquangninh/.env):
//   node tools/publish_bai_mua_mua_bao.mjs --dry     # xem trước
//   node tools/publish_bai_mua_mua_bao.mjs           # tạo bài NHÁP thật

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

function p(t) { return `<p>${t}</p>`; }
function h2(t) { return `<h2>${t}</h2>`; }
function h3(t) { return `<h3>${t}</h3>`; }
function ul(items) { return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`; }
function ol(items) { return `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>`; }
function faqSchema(faq) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  })}</script>`;
}

const SLUG = "mua-mua-bao-quang-ninh-phong-chong-ngap-cong-tran-be-phot";
const TITLE = "Mùa Mưa Bão Quảng Ninh: Phòng Chống Ngập Cống, Tràn Bể Phốt";
const META_DESC = "Mùa mưa bão Quảng Ninh (tháng 6-10): checklist chống ngập cống, tràn bể phốt trước/trong/sau bão. Cần hỗ trợ gấp gọi 0963.953.533 / 0931.156.756.";
const FOCUS_KEYWORD = "chống ngập cống mùa mưa bão quảng ninh";

const FAQ = [
  ["Trước mùa mưa bão nên nạo vét hố ga bao lâu một lần?",
    "Với nhà mặt đất, nên nạo vét 1 lần trước mùa mưa (khoảng tháng 4-5) và kiểm tra lại giữa mùa nếu khu vực hay ngập. Nhà ven sông, ven biển nên kiểm tra thêm sau mỗi đợt triều cường lớn."],
  ["Bể phốt trào ngược ngay trong lúc mưa to phải làm sao?",
    "Trước tiên ngừng xả thêm nước vào hệ thống (tạm không giặt, không xả bồn cầu nếu tránh được), kê đồ đạc tránh vùng thấp nhất, sau đó gọi thợ khảo sát ngay khi mưa ngớt — hút giữa lúc mưa to hiệu quả thấp vì nước ngoài vẫn tràn vào."],
  ["Sau bão nhà không ngập nhưng cống thoát rất chậm có cần gọi thợ không?",
    "Nên gọi kiểm tra, vì bùn cát và lá cây thường tích tụ trong hố ga sau bão dù nhà không ngập trực tiếp — để lâu dễ gây tắc hẳn ở đợt mưa tiếp theo."],
  ["Dịch vụ có hỗ trợ khẩn cấp trong mùa mưa bão không?",
    "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày kể cả cao điểm mùa mưa bão. Ca ngoài khung hoặc điều kiện di chuyển khó khăn do mưa lớn có thể tính thêm phụ phí, báo rõ trước khi thợ xuất phát."],
];

const CONTENT = [
  p("Quảng Ninh nằm ven biển, chịu ảnh hưởng trực tiếp của mùa mưa bão miền Bắc (tập trung tháng 6-10, cao điểm " +
    "tháng 7-9). Hệ thống thoát nước nhà dân, hố ga, bể phốt dễ quá tải trong giai đoạn này nếu không kiểm tra " +
    "trước. Bài này ghi lại việc cần làm trước, trong và sau mùa mưa bão. Cần hỗ trợ gấp, gọi " +
    "<strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong>."),

  h2("Vì sao mùa mưa bão dễ gây ngập cống, tràn bể phốt hơn ngày thường"),
  ul([
    "<strong>Lượng mưa dồn trong thời gian ngắn</strong> vượt khả năng thoát của hố ga chưa được nạo vét định kỳ.",
    "<strong>Rác, lá cây, cát bùn cuốn theo dòng nước</strong> làm nghẹt miệng hố ga và đường ống ngang.",
    "<strong>Nước biển/nước sông dâng theo triều cường</strong> (rõ nhất ở Hạ Long, Quảng Yên, Vân Đồn) khiến bể phốt, hầm cầu khó thoát nước phụ ra đất xung quanh, dễ trào ngược.",
    "<strong>Gió bão làm bật nắp hố ga, nắp bể</strong> nếu gioăng đã cũ, nước mưa tràn thẳng vào làm loãng bùn và đầy nhanh hơn thực tế sử dụng.",
  ]),

  h2("Checklist TRƯỚC mùa mưa bão (nên làm xong trước tháng 6)"),
  ol([
    "<strong>Nạo vét hố ga trước nhà và hố ga chung khu vực</strong> — bùn cát tích tụ cả năm là nguyên nhân chính gây ngập khi mưa lớn.",
    "<strong>Kiểm tra gioăng, nắp bể phốt/hầm cầu</strong> — gioăng cũ hở là đường nước mưa/nước triều tràn vào nhanh nhất.",
    "<strong>Kiểm tra van một chiều</strong> (nếu nhà ở ven sông, ven biển) — tránh nước ngoài tràn ngược vào hệ thống khi triều dâng.",
    "<strong>Thông tắc cống định kỳ</strong> nếu năm ngoái từng có dấu hiệu thoát chậm — đừng đợi mưa xuống mới kiểm tra.",
    "<strong>Với nhà hàng, khách sạn ven biển (Bãi Cháy, Vân Đồn, Cẩm Phả)</strong>: kiểm tra thêm bể tách mỡ, dễ bị cuốn trôi cặn khi mưa lớn dồn về cùng lúc với dầu mỡ nhà bếp.",
  ]),

  h2("Trong lúc mưa to, bão đổ bộ — nên và không nên làm gì"),
  h3("Nên"),
  ul([
    "Hạn chế xả nước thêm vào hệ thống nếu đã thấy dấu hiệu thoát chậm (tránh giặt đồ nhiều, xả bồn cầu liên tục).",
    "Kê đồ đạc tránh khu vực thấp nhất nhà nếu đã có dấu hiệu nước dâng quanh miệng hố ga.",
    "Ghi lại thời điểm và mức độ ngập để mô tả chính xác cho thợ khi gọi khảo sát sau đó.",
  ]),
  h3("Không nên"),
  ul([
    "Không cố tự thông cống hoặc mở nắp bể phốt giữa lúc mưa to — nước ngoài vẫn tràn vào, xử lý không dứt điểm mà còn rủi ro an toàn.",
    "Không đổ hóa chất thông cống mạnh khi hệ thống đang ngập — hiệu quả thấp và có thể gây phản ứng phụ với nước bẩn ứ đọng.",
  ]),

  h2("Sau bão — việc cần kiểm tra dù nhà không bị ngập trực tiếp"),
  ol([
    "<strong>Kiểm tra hố ga ngoài nhà</strong> — bùn cát, lá cây, rác trôi dạt thường lấp một phần miệng hố ga dù nhà không ngập.",
    "<strong>Xả thử nước ở điểm thấp nhất trong nhà</strong> (phễu thoát sàn tầng 1, sân sau) để phát hiện sớm nếu có điểm nghẹt mới hình thành.",
    "<strong>Với nhà ven biển, ven sông</strong>: kiểm tra lại gioăng nắp bể phốt/hầm cầu — nước mặn/nước phù sa đọng lại có thể ăn mòn nhanh hơn nước mưa thường.",
    "<strong>Nếu đã hút bể phốt gần đây nhưng sau bão lại đầy nhanh bất thường</strong>: khả năng cao nước mưa/nước triều đã tràn vào qua gioăng hở, cần kiểm tra và thay gioăng thay vì hút lại ngay.",
  ]),

  h2("Ghi chú riêng theo đặc điểm địa hình từng khu vực"),
  ul([
    "<strong>Hạ Long, Cẩm Phả, Vân Đồn, Quảng Yên — ven biển, ven sông:</strong> ưu tiên kiểm tra van một chiều và gioăng nắp trước mùa triều cường kết hợp mưa bão (thường trùng tháng 7-9).",
    "<strong>Uông Bí, Đông Triều — đồi núi:</strong> ưu tiên nạo vét hố ga trước mùa mưa vì đất đá dễ cuốn theo dòng nước từ trên cao xuống, lấp nhanh hơn khu vực bằng phẳng.",
    "<strong>Móng Cái — khu chợ cửa khẩu:</strong> rác thải sinh hoạt và bao bì dễ cuốn vào hố ga khi mưa lớn, nên có thùng rác riêng gần miệng hố ga trước mùa mưa.",
  ]),

  h2("Câu hỏi thường gặp"),
  ...FAQ.flatMap(([q, a]) => [h3(q), p(a)]),

  h2("Liên hệ hỗ trợ khẩn cấp mùa mưa bão"),
  p("Môi Trường Đô Thị Số 1 Quảng Ninh — hỗ trợ thông tắc cống, hút bể phốt, hút hầm cầu tại Hạ Long, Cẩm Phả, " +
    "Uông Bí, Móng Cái, Quảng Yên, Đông Triều, Vân Đồn. Hotline: <strong>0963.953.533 / 0931.156.756</strong>. " +
    "Xem thêm <a href=\"https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/\">thông tắc cống tại Quảng Ninh</a> " +
    "và <a href=\"https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/\">hút bể phốt tại Quảng Ninh</a>."),

  faqSchema(FAQ),
].join("\n");

async function findCategoryId(auth, name) {
  const res = await request("GET", `/wp-json/wp/v2/categories?search=${encodeURIComponent(name)}`, auth);
  if (res.status !== 200) return null;
  try { const list = JSON.parse(res.text); return list.length ? list[0].id : null; } catch { return null; }
}

async function main() {
  const words = CONTENT.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
  console.log(`Title (${TITLE.length} ky tu): ${TITLE}`);
  console.log(`Meta (${META_DESC.length} ky tu): ${META_DESC}`);
  console.log(`Uoc tinh so tu: ~${words}`);
  console.log(`Slug: ${SLUG}`);

  if (DRY) {
    console.log("\n--dry: chua ghi gi len WordPress. Bo --dry de tao bai nhap that.");
    return;
  }

  const env = readEnv(ENV_PATH);
  const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
  const categoryId = await findCategoryId(auth, "Cẩm nang") || await findCategoryId(auth, "Blog");
  const payload = {
    title: TITLE, content: CONTENT, slug: SLUG, status: "draft",
    meta: { rank_math_description: META_DESC, rank_math_focus_keyword: FOCUS_KEYWORD },
    ...(categoryId ? { categories: [categoryId] } : {}),
  };
  if (!categoryId) console.warn("CANH BAO: khong tim thay chuyen muc 'Cam nang'/'Blog' — bai se tao khong co chuyen muc.");

  const res = await request("POST", "/wp-json/wp/v2/posts", auth, payload);
  console.log(`\nStatus: ${res.status}`);
  if (res.status !== 201 && res.status !== 200) {
    console.error("Tao bai THAT BAI:", res.text.slice(0, 500));
    process.exit(1);
  }
  const created = JSON.parse(res.text);
  mkdirSync(`${ROOT}/reports`, { recursive: true });
  writeFileSync(`${ROOT}/reports/publish-${SLUG}-${Date.now()}.json`,
    JSON.stringify({ id: created.id, link: created.link, editLink: `https://${HOST}/wp-admin/post.php?post=${created.id}&action=edit` }, null, 2), "utf8");

  console.log("\n=== DA TAO BAI NHAP THANH CONG ===");
  console.log(`Mo bai de kiem tra va them anh: https://${HOST}/wp-admin/post.php?post=${created.id}&action=edit`);
  console.log("\nGoi y anh minh hoa (them 2-3 anh that):");
  console.log('  - "Hố ga ngập nước mùa mưa bão tại Quảng Ninh trước khi nạo vét"');
  console.log('  - "Thợ kiểm tra gioăng nắp bể phốt trước mùa mưa bão"');
  console.log('  - "Xe hút bể phốt hỗ trợ khẩn cấp sau bão tại Quảng Ninh"');
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
