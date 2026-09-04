// Tạo 2 bài blog "Cẩm Nang Hút Bể Phốt Tại Cẩm Phả" + "...Tại Uông Bí" trên WordPress
// qua REST API, ở trạng thái NHÁP (draft) — không tự đăng công khai. Cùng cơ chế với
// tools/publish_cam_nang_hut_be_phot_ha_long.mjs (xem file đó để hiểu luồng chạy).
//
// Cách chạy (trên máy Windows có D:/.thongtaccongquangninh/.env):
//   node tools/publish_cam_nang_batch2.mjs --dry     # xem trước, KHÔNG ghi gì lên site
//   node tools/publish_cam_nang_batch2.mjs           # tạo 2 bài NHÁP thật trên WordPress
//
// Sau khi chạy thật: mở link "editLink" script in ra cho từng bài, thêm 2 ảnh thật/bài
// theo alt text gợi ý, đọc lại rồi mới bấm Đăng.

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

const POSTS = [
  {
    slug: "cam-nang-hut-be-phot-tai-cam-pha",
    title: "Cẩm Nang Hút Bể Phốt Tại Cẩm Phả – Dấu Hiệu, Giá, Quy Trình",
    metaDesc: "Cẩm nang hút bể phốt tại Cẩm Phả: dấu hiệu bể đầy, giá tham khảo theo khu vực, quy trình 5 bước. Cần xe đến ngay, gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại cẩm phả",
    servicePage: "https://thongtaccongquangninh.com/hut-be-phot-cam-pha/",
    servicePageAnchorHome: "trang Hút bể phốt Cẩm Phả",
    servicePageAnchorPrice: "bảng giá chi tiết hút bể phốt tại Cẩm Phả",
    servicePageAnchorProcess: "quy trình đầy đủ tại đây",
    relatedPage: "https://thongtaccongquangninh.com/thong-tac-cong-cam-pha/",
    relatedAnchor: "thông tắc cống tại Cẩm Phả",
    faq: [
      ["Hút bể phốt tại Cẩm Phả có làm được vào buổi tối không?",
        "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
      ["Nhà tập thể cũ khu mỏ ở Cẩm Trung có hút được không?",
        "Có. Nhà tập thể khu mỏ thường bể phốt dùng chung nhiều hộ, thợ khảo sát xác định đúng ngăn chứa của từng dãy trước khi hút, tránh hút nhầm ngăn của hộ khác."],
      ["Hút bể phốt tại Cẩm Phả xong có được bảo hành không?",
        "Có ghi nhận ngày hút và kiểm tra đường ống trong buổi làm việc. Nếu bể đầy lại bất thường trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
      ["Khu công nghiệp gần Cửa Ông, Mông Dương có phục vụ không?",
        "Có, xe bồn dung tích lớn phục vụ cả khu dân cư lẫn khu vực gần cảng, khu công nghiệp quanh Cửa Ông, Mông Dương."],
    ],
    intro: "Bể phốt đầy, trào ngược hay bốc mùi đều có dấu hiệu báo trước vài ngày đến vài tuần. " +
      "Cẩm nang này ghi lại cách nhận biết, nguyên nhân đặc thù theo từng khu vực tại Cẩm Phả, " +
      "và quy trình thực tế đội kỹ thuật áp dụng khi xử lý. Cần xe đến khảo sát ngay, gọi " +
      "<strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong>.",
    signs: [
      "Nước từ bồn cầu hoặc phễu thoát sàn rút chậm hẳn so với bình thường, kèm tiếng ục ục khi xả.",
      "Mùi hôi bốc lên quanh khu vực đặt bể, rõ nhất vào buổi trưa nắng hoặc sau mưa lớn.",
      "Nắp bể hoặc miệng hố ga gần đó ẩm ướt, sũng nước dù trời không mưa — dấu hiệu bể đã tràn ra đất xung quanh.",
    ],
    causesHeading: "Nguyên nhân bể phốt tại Cẩm Phả nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Nhà tập thể cũ khu mỏ</strong> (Cẩm Trung, Cẩm Thủy) — bể phốt xây từ thời bao cấp, dùng chung cho nhiều hộ trong một dãy, tải trọng vượt xa thiết kế ban đầu.",
      "<strong>Nền đất pha than bùn ở một số khu vực</strong> khiến bể khó thoát nước phụ ra đất xung quanh, nước tồn đọng lâu hơn khu đất cát thông thường.",
      "<strong>Khu dân cư gần cảng, khu công nghiệp</strong> (Cửa Ông, Mông Dương) có mật độ lao động thuê trọ cao theo ca làm việc, lượng nước thải dồn vào giờ cao điểm.",
    ],
    areasHeading: "Đặc điểm xử lý theo từng khu vực",
    areas: [
      "<strong>Cẩm Trung, Cẩm Thủy — nhà tập thể khu mỏ:</strong> bể dùng chung nhiều hộ, cần xác định đúng ngăn chứa của từng dãy trước khi hút.",
      "<strong>Cửa Ông, Mông Dương — khu công nghiệp, cảng:</strong> nhà trọ đông công nhân, chu kỳ đầy nhanh hơn nhà ở thông thường, nên hút định kỳ ngắn hơn.",
      "<strong>Khu trung tâm Cẩm Phả — nhà mặt phố, cửa hàng:</strong> xe bồn vào trực tiếp được phần lớn tuyến đường chính, ít phải dùng ống nối dài.",
    ],
    equipmentHeading: "Thiết bị dùng khi hút bể phốt tại Cẩm Phả",
    equipment: [
      "Xe bồn 2-5 khối tuỳ khu vực, khu nhà tập thể ngõ hẹp dùng xe nhỏ hơn.",
      "Máy hút chân không công suất đủ kéo bùn đặc tích tụ lâu năm ở bể tập thể cũ.",
      "Ống mềm nối dài 15-30m cho trường hợp xe không đỗ sát được miệng bể.",
      "Camera dò đường ống khi nghi ngờ tắc do đường ống chứ không phải bể đầy.",
    ],
    priceNote: "Giá không cố định vì phụ thuộc dung tích bể thực tế và mức độ khó tiếp cận. Cách " +
      "chính xác nhất là gọi mô tả tình trạng hoặc gửi ảnh khu vực đặt bể để được báo số cụ thể " +
      "trước khi xe xuất phát — không báo giá ảo rồi phát sinh khi đến nơi.",
    preventTips: [
      "Không đổ dầu mỡ ăn thừa, bã cà phê đặc, tã giấy xuống bồn cầu hoặc phễu thoát sàn nối vào bể.",
      "Hạn chế đổ hoá chất tẩy rửa mạnh với tần suất cao — vi sinh phân hủy tự nhiên trong bể bị diệt, chất thải tích tụ nhanh hơn.",
      "Nhà tập thể dùng chung bể nên thống nhất giữa các hộ về chu kỳ hút, tránh để một hộ tự gọi hút riêng gây lệch mức nước giữa các ngăn.",
    ],
    caseStudy: "Một dãy nhà tập thể cũ tại Cẩm Trung (6 hộ dùng chung 1 bể) gọi vì nước thải trào " +
      "ngược vào bếp tầng 1. Khảo sát cho thấy bể chưa hút hơn 4 năm, ngăn lắng gần như đầy đặc. " +
      "Sau khi hút và kiểm tra <a href=\"" + "https://thongtaccongquangninh.com/hut-be-phot-cam-pha/" +
      "\">quy trình đầy đủ tại đây</a>, các hộ được tư vấn chia lịch hút định kỳ 18 tháng/lần thay vì chờ đến khi tràn.",
  },
  {
    slug: "cam-nang-hut-be-phot-tai-uong-bi",
    title: "Cẩm Nang Hút Bể Phốt Tại Uông Bí – Dấu Hiệu, Giá, Quy Trình",
    metaDesc: "Cẩm nang hút bể phốt tại Uông Bí: dấu hiệu bể đầy, giá tham khảo theo khu vực, quy trình 5 bước. Cần xe đến ngay, gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại uông bí",
    servicePage: "https://thongtaccongquangninh.com/hut-be-phot-uong-bi/",
    servicePageAnchorHome: "trang Hút bể phốt Uông Bí",
    servicePageAnchorPrice: "bảng giá chi tiết hút bể phốt tại Uông Bí",
    servicePageAnchorProcess: "quy trình đầy đủ tại đây",
    relatedPage: "https://thongtaccongquangninh.com/thong-tac-cong-uong-bi/",
    relatedAnchor: "thông tắc cống tại Uông Bí",
    faq: [
      ["Hút bể phốt tại Uông Bí có làm được vào buổi tối không?",
        "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
      ["Nhà ở khu đồi Vàng Danh, đường dốc có hút được không?",
        "Có. Khu vực đồi núi dùng xe nhỏ hơn hoặc ống nối dài khi xe lớn khó lên dốc, thợ khảo sát trước để chọn xe phù hợp."],
      ["Mùa lễ hội Yên Tử đông khách, đặt lịch có chậm không?",
        "Mùa cao điểm lễ hội đầu năm, nhà nghỉ và hàng quán quanh khu vực nên đặt lịch hút định kỳ trước mùa thay vì chờ đầy mới gọi, tránh tình trạng chờ lâu do nhiều nơi cùng gọi một lúc."],
      ["Hút bể phốt tại Uông Bí xong có được bảo hành không?",
        "Có ghi nhận ngày hút và kiểm tra đường ống trong buổi làm việc. Nếu bể đầy lại bất thường trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
    ],
    intro: "Bể phốt đầy, trào ngược hay bốc mùi đều có dấu hiệu báo trước vài ngày đến vài tuần. " +
      "Cẩm nang này ghi lại cách nhận biết, nguyên nhân đặc thù theo từng khu vực tại Uông Bí, " +
      "và quy trình thực tế đội kỹ thuật áp dụng khi xử lý. Cần xe đến khảo sát ngay, gọi " +
      "<strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong>.",
    signs: [
      "Nước từ bồn cầu hoặc phễu thoát sàn rút chậm hẳn so với bình thường, kèm tiếng ục ục khi xả.",
      "Mùi hôi bốc lên quanh khu vực đặt bể, rõ nhất vào buổi trưa nắng hoặc sau mưa lớn.",
      "Nắp bể hoặc miệng hố ga gần đó ẩm ướt, sũng nước dù trời không mưa — dấu hiệu bể đã tràn ra đất xung quanh.",
    ],
    causesHeading: "Nguyên nhân bể phốt tại Uông Bí nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Địa hình đồi núi ở khu Vàng Danh</strong> khiến một số bể xây trên nền dốc thoát nước phụ chậm hơn khu đất bằng phẳng.",
      "<strong>Khách hành hương mùa lễ hội Yên Tử</strong> — nhà nghỉ, hàng quán quanh tuyến đường lên Yên Tử có lượng khách tăng đột biến đầu năm, vượt tải bể thiết kế cho ngày thường.",
      "<strong>Khu dân cư Yên Thanh, Quang Trung</strong> nhiều nhà trọ công nhân mỏ than, bể dùng chung nhiều phòng, tải trọng cao hơn nhà ở đơn lẻ.",
    ],
    areasHeading: "Đặc điểm xử lý theo từng khu vực",
    areas: [
      "<strong>Vàng Danh — khu đồi, đường dốc:</strong> xe nhỏ hoặc ống nối dài khi xe lớn khó tiếp cận trực tiếp.",
      "<strong>Yên Thanh, Quang Trung — nhà trọ công nhân mỏ:</strong> bể dùng chung nhiều phòng, cần khảo sát đúng dãy trước khi báo giá.",
      "<strong>Khu vực gần Yên Tử:</strong> ưu tiên đặt lịch trước mùa lễ hội đầu năm để tránh chờ lâu khi nhiều nơi cùng gọi.",
    ],
    equipmentHeading: "Thiết bị dùng khi hút bể phốt tại Uông Bí",
    equipment: [
      "Xe bồn 2-5 khối, khu đồi dốc ưu tiên xe nhỏ cơ động hơn.",
      "Máy hút chân không công suất đủ kéo bùn đặc.",
      "Ống mềm nối dài 15-30m cho nhà nằm sâu trong ngõ dốc hoặc xe không lên được tận nơi.",
      "Camera dò đường ống khi nghi ngờ tắc do đường ống chứ không phải bể đầy.",
    ],
    priceNote: "Giá không cố định vì phụ thuộc dung tích bể thực tế và mức độ khó tiếp cận, đặc biệt " +
      "ở khu vực đồi dốc. Cách chính xác nhất là gọi mô tả tình trạng hoặc gửi ảnh khu vực đặt bể " +
      "để được báo số cụ thể trước khi xe xuất phát — không báo giá ảo rồi phát sinh khi đến nơi.",
    preventTips: [
      "Không đổ dầu mỡ ăn thừa, bã cà phê đặc, tã giấy xuống bồn cầu hoặc phễu thoát sàn nối vào bể.",
      "Hạn chế đổ hoá chất tẩy rửa mạnh với tần suất cao — vi sinh phân hủy tự nhiên trong bể bị diệt, chất thải tích tụ nhanh hơn.",
      "Nhà nghỉ, hàng quán quanh khu Yên Tử nên hút trước mùa lễ hội thay vì đợi khách đông mới xử lý.",
    ],
    caseStudy: "Một nhà nghỉ nhỏ gần tuyến đường lên Yên Tử gọi hút gấp trước Tết vì lo đông khách " +
      "hành hương. Khảo sát cho thấy bể chưa hút hơn 2 năm, gần đầy. Sau khi hút và kiểm tra " +
      "<a href=\"" + "https://thongtaccongquangninh.com/hut-be-phot-uong-bi/" +
      "\">quy trình đầy đủ tại đây</a>, chủ nhà nghỉ được tư vấn hút định kỳ trước mỗi mùa lễ hội thay vì chờ có dấu hiệu mới gọi.",
  },
];

function buildContent(post) {
  return [
    p(post.intro),
    h2(`Khi nào cần hút bể phốt tại ${post.title.match(/Tại (.+?) –/)[1]} ngay, không nên chờ thêm`),
    p("Ba tình huống nên gọi trong ngày thay vì chờ cuối tuần:"),
    ul(post.signs),
    p("Nếu chỉ có 1 trong 3 dấu hiệu và mới xuất hiện 1-2 ngày, có thể theo dõi thêm; nếu có từ " +
      "2 dấu hiệu trở lên, nên gọi khảo sát trong ngày để tránh nước thải tràn ra sân hoặc vào đường ống sinh hoạt khác."),
    h2(post.causesHeading),
    ol(post.causes),
    h2(post.areasHeading),
    ul(post.areas),
    h2(post.equipmentHeading),
    ul(post.equipment),
    h2("Quy trình 5 bước"),
    ol([
      "<strong>Tiếp nhận qua điện thoại</strong> — hỏi vị trí, loại công trình, lần hút gần nhất nếu nhớ được.",
      "<strong>Điều xe theo khu vực</strong> — ưu tiên xe gần nhất trong bán kính đang phục vụ để rút ngắn thời gian có mặt.",
      "<strong>Khảo sát tại chỗ</strong> — xác định vị trí nắp bể, dung tích ước lượng, báo giá trước khi hút.",
      "<strong>Hút và vệ sinh</strong> — hút sạch ngăn chứa, kiểm tra đường ống dẫn vào bể có thông không.",
      "<strong>Bàn giao và ghi nhận</strong> — đóng nắp bể đúng vị trí, ghi lại ngày hút để tính chu kỳ bảo trì lần sau.",
    ]),
    h2("Giá tham khảo (thay đổi theo dung tích bể và khoảng cách xe đỗ)"),
    p(post.priceNote + ` Xem <a href="${post.servicePage}">${post.servicePageAnchorPrice}</a> để tham khảo trước.`),
    h2("Cách hạn chế bể phốt nhanh đầy trở lại"),
    ul(post.preventTips),
    h2("Tình huống thực tế"),
    p(post.caseStudy),
    h2("Câu hỏi thường gặp"),
    ...post.faq.flatMap(([q, a]) => [h3(q), p(a)]),
    p(`Nếu nghi ngờ do cống tắc chứ không phải bể phốt đầy, xem thêm <a href="${post.relatedPage}">${post.relatedAnchor}</a>.`),
    h2("Liên hệ"),
    p(`Môi Trường Đô Thị Số 1 Quảng Ninh — hút bể phốt tại ${post.title.match(/Tại (.+?) –/)[1]} và các phường lân cận. ` +
      `Hotline: <strong>0963.953.533 / 0931.156.756</strong>. Xem chi tiết dịch vụ và bảng giá tại <a href="${post.servicePage}">${post.servicePageAnchorHome}</a>.`),
    faqSchema(post.faq),
  ].join("\n");
}

async function findCategoryId(auth, name) {
  const res = await request("GET", `/wp-json/wp/v2/categories?search=${encodeURIComponent(name)}`, auth);
  if (res.status !== 200) return null;
  try { const list = JSON.parse(res.text); return list.length ? list[0].id : null; } catch { return null; }
}

async function main() {
  for (const post of POSTS) {
    const content = buildContent(post);
    const words = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
    console.log(`\n=== ${post.slug} ===`);
    console.log(`Title (${post.title.length} ky tu): ${post.title}`);
    console.log(`Meta (${post.metaDesc.length} ky tu): ${post.metaDesc}`);
    console.log(`Uoc tinh so tu: ~${words}`);
    if (DRY) continue;

    const env = readEnv(ENV_PATH);
    const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
    const categoryId = await findCategoryId(auth, "Cẩm nang") || await findCategoryId(auth, "Blog");
    const payload = {
      title: post.title, content, slug: post.slug, status: "draft",
      meta: { rank_math_description: post.metaDesc, rank_math_focus_keyword: post.focusKeyword },
      ...(categoryId ? { categories: [categoryId] } : {}),
    };
    if (!categoryId) console.warn("CANH BAO: khong tim thay chuyen muc 'Cam nang'/'Blog'.");

    const res = await request("POST", "/wp-json/wp/v2/posts", auth, payload);
    console.log(`Status: ${res.status}`);
    if (res.status !== 201 && res.status !== 200) {
      console.error("Tao bai THAT BAI:", res.text.slice(0, 500));
      continue;
    }
    const created = JSON.parse(res.text);
    const editLink = `https://${HOST}/wp-admin/post.php?post=${created.id}&action=edit`;
    mkdirSync(`${ROOT}/reports`, { recursive: true });
    writeFileSync(`${ROOT}/reports/publish-${post.slug}-${Date.now()}.json`,
      JSON.stringify({ id: created.id, link: created.link, editLink }, null, 2), "utf8");
    console.log(`DA TAO BAI NHAP: ${editLink}`);
  }
  if (DRY) console.log("\n--dry: chua ghi gi len WordPress. Bo --dry de tao bai nhap that.");
}

main().catch((e) => { console.error("[FATAL]", e); process.exit(1); });
