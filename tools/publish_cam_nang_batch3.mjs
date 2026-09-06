// Tạo 4 bài blog "Cẩm Nang Hút Bể Phốt Tại ..." (Quảng Yên, Móng Cái, Đông Triều, Vân Đồn)
// trên WordPress qua REST API, ở trạng thái NHÁP (draft) — không tự đăng công khai.
// Cùng cơ chế với publish_cam_nang_hut_be_phot_ha_long.mjs và publish_cam_nang_batch2.mjs.
//
// Cách chạy (trên máy Windows có D:/.thongtaccongquangninh/.env):
//   node tools/publish_cam_nang_batch3.mjs --dry     # xem trước, KHÔNG ghi gì lên site
//   node tools/publish_cam_nang_batch3.mjs           # tạo 4 bài NHÁP thật trên WordPress
//
// Sau khi chạy thật: mở link "editLink" in ra cho từng bài, thêm 2 ảnh thật/bài theo alt
// text gợi ý, đọc lại rồi mới bấm Đăng.

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
    city: "Quảng Yên", slug: "cam-nang-hut-be-phot-tai-quang-yen",
    title: "Cẩm Nang Hút Bể Phốt Tại Quảng Yên – Dấu Hiệu, Giá, Quy Trình",
    metaDesc: "Cẩm nang hút bể phốt tại Quảng Yên: dấu hiệu bể đầy, giá tham khảo theo khu vực, quy trình 5 bước. Cần xe đến ngay, gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại quảng yên",
    servicePage: "https://thongtaccongquangninh.com/hut-be-phot-quang-yen/",
    relatedPage: "https://thongtaccongquangninh.com/thong-tac-cong-quang-yen/",
    relatedAnchor: "thông tắc cống tại Quảng Yên",
    causesHeading: "Nguyên nhân bể phốt tại Quảng Yên nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Nhà ven sông, nền thấp</strong> — nhiều khu dân cư Quảng Yên nằm gần sông, mực nước dâng theo triều khiến bể khó thoát nước phụ ra đất xung quanh.",
      "<strong>Khu công nghiệp và nhà xưởng</strong> — công nhân thuê trọ đông theo ca sản xuất, lượng nước thải dồn vào một khoảng thời gian trong ngày.",
      "<strong>Nhà nền thấp dễ ngập cục bộ sau mưa lớn</strong> — nước mưa tràn vào miệng bể nếu gioăng nắp đã cũ, làm loãng bùn và đầy nhanh hơn thực tế sử dụng.",
    ],
    areasHeading: "Đặc điểm xử lý theo từng khu vực",
    areas: [
      "<strong>Khu ven sông:</strong> ưu tiên kiểm tra thêm van một chiều tại miệng bể để tránh nước sông tràn ngược khi triều lên.",
      "<strong>Khu công nghiệp, nhà trọ công nhân:</strong> bể dùng chung nhiều phòng, cần khảo sát đúng dãy trước khi báo giá.",
      "<strong>Nhà nền thấp trung tâm thị xã:</strong> xe bồn tiếp cận trực tiếp phần lớn tuyến đường chính, ít phải dùng ống nối dài.",
    ],
    equipmentHeading: "Thiết bị dùng khi hút bể phốt tại Quảng Yên",
    equipment: [
      "Xe bồn 2-5 khối tuỳ khu vực.",
      "Máy hút chân không công suất đủ kéo bùn đặc lẫn nước mưa loãng.",
      "Ống mềm nối dài 15-30m cho nhà nằm sâu trong ngõ hoặc khu nền thấp khó tiếp cận.",
      "Camera dò đường ống khi nghi ngờ tắc do đường ống chứ không phải bể đầy.",
    ],
    preventTips: [
      "Không đổ dầu mỡ ăn thừa, bã cà phê đặc, tã giấy xuống bồn cầu hoặc phễu thoát sàn nối vào bể.",
      "Kiểm tra gioăng nắp bể trước mùa mưa để tránh nước mưa hoặc nước sông tràn vào làm loãng bùn.",
      "Nhà cho thuê trọ đông công nhân nên rút ngắn chu kỳ hút so với nhà ở thông thường.",
    ],
    caseStudy: "Một hộ dân ven sông tại Quảng Yên gọi vì bể phốt trào ngược sau đợt triều cường kéo dài. " +
      "Khảo sát cho thấy gioăng nắp bể đã cũ, nước sông ngấm vào làm đầy nhanh hơn bình thường dù mới hút hơn 1 năm. " +
      "Sau khi hút và kiểm tra <a href=\"https://thongtaccongquangninh.com/hut-be-phot-quang-yen/\">quy trình đầy đủ tại đây</a>, " +
      "chủ nhà được tư vấn thay gioăng nắp để tránh tái diễn.",
    faq: [
      ["Hút bể phốt tại Quảng Yên có làm được vào buổi tối không?",
        "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
      ["Nhà ven sông ở Quảng Yên có cần thiết bị đặc biệt không?",
        "Thợ kiểm tra thêm van một chiều tại miệng bể để tránh nước sông tràn ngược khi triều lên, không tính thêm phí cho bước kiểm tra này."],
      ["Hút bể phốt tại Quảng Yên xong có được bảo hành không?",
        "Có ghi nhận ngày hút và kiểm tra đường ống trong buổi làm việc. Nếu bể đầy lại bất thường trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
      ["Khu công nghiệp Quảng Yên có phục vụ hút theo dãy trọ không?",
        "Có, xe bồn phục vụ theo dãy nhà trọ công nhân, khảo sát đúng bể phục vụ dãy nào trước khi báo giá."],
    ],
  },
  {
    city: "Móng Cái", slug: "cam-nang-hut-be-phot-tai-mong-cai",
    title: "Cẩm Nang Hút Bể Phốt Tại Móng Cái – Dấu Hiệu, Giá, Quy Trình",
    metaDesc: "Cẩm nang hút bể phốt tại Móng Cái: dấu hiệu bể đầy, giá tham khảo theo khu vực, quy trình 5 bước. Cần xe đến ngay, gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại móng cái",
    servicePage: "https://thongtaccongquangninh.com/hut-be-phot-mong-cai/",
    relatedPage: "https://thongtaccongquangninh.com/thong-tac-cong-mong-cai/",
    relatedAnchor: "thông tắc cống tại Móng Cái",
    causesHeading: "Nguyên nhân bể phốt tại Móng Cái nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Khu chợ cửa khẩu, nhà phố kinh doanh</strong> — lượng khách ra vào đông, nhà hàng và quán ăn khu chợ có nước thải lẫn dầu mỡ nhiều hơn nhà ở thông thường.",
      "<strong>Nhà nghỉ, khách sạn phục vụ khách qua biên giới</strong> — công suất phòng biến động mạnh theo mùa du lịch, có thời điểm vượt xa tải bể thiết kế ban đầu.",
      "<strong>Nhà phố xây liền kề san sát</strong> — một số bể cũ dùng chung tường với nhà bên cạnh, khó mở rộng dung tích khi nhu cầu tăng.",
    ],
    areasHeading: "Đặc điểm xử lý theo từng khu vực",
    areas: [
      "<strong>Khu chợ cửa khẩu:</strong> nhà hàng, quán ăn cần vòi hút công suất lớn hơn để xử lý dầu mỡ tích tụ.",
      "<strong>Khu nhà nghỉ, khách sạn:</strong> nên đăng ký hút định kỳ trước mùa cao điểm khách qua biên giới thay vì chờ đầy mới gọi.",
      "<strong>Khu nhà phố trung tâm:</strong> xe bồn tiếp cận trực tiếp phần lớn tuyến đường chính.",
    ],
    equipmentHeading: "Thiết bị dùng khi hút bể phốt tại Móng Cái",
    equipment: [
      "Xe bồn 2-5 khối, ưu tiên xe công suất lớn cho khu nhà hàng, khách sạn.",
      "Máy hút chân không công suất đủ kéo bùn đặc lẫn dầu mỡ.",
      "Ống mềm nối dài 15-30m cho nhà phố liền kề khó tiếp cận trực tiếp.",
      "Camera dò đường ống khi nghi ngờ tắc do đường ống chứ không phải bể đầy.",
    ],
    preventTips: [
      "Nhà hàng, quán ăn khu chợ nên lắp thêm bể tách mỡ trước khi nước thải chảy vào bể phốt chính.",
      "Không đổ dầu mỡ ăn thừa, bã cà phê đặc xuống bồn cầu hoặc phễu thoát sàn nối vào bể.",
      "Nhà nghỉ, khách sạn nên hút định kỳ trước mùa cao điểm thay vì đợi khách đông mới xử lý.",
    ],
    caseStudy: "Một quán ăn tại khu chợ cửa khẩu Móng Cái gọi hút gấp vì bồn rửa bát trào ngược giờ cao điểm bán hàng. " +
      "Khảo sát cho thấy bể lẫn nhiều dầu mỡ tích tụ, chưa hút hơn 1 năm. Sau khi hút và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/hut-be-phot-mong-cai/\">quy trình đầy đủ tại đây</a>, " +
      "chủ quán được tư vấn lắp thêm bể tách mỡ để giảm tần suất hút.",
    faq: [
      ["Hút bể phốt tại Móng Cái có làm được vào buổi tối không?",
        "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
      ["Nhà hàng khu chợ cửa khẩu có cần thiết bị riêng không?",
        "Có, dùng vòi hút công suất lớn hơn để xử lý dầu mỡ tích tụ, đồng thời tư vấn lắp bể tách mỡ nếu chưa có để giảm tần suất hút."],
      ["Hút bể phốt tại Móng Cái xong có được bảo hành không?",
        "Có ghi nhận ngày hút và kiểm tra đường ống trong buổi làm việc. Nếu bể đầy lại bất thường trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
      ["Khách sạn, nhà nghỉ đặt lịch hút định kỳ trước mùa cao điểm được không?",
        "Được, nên đặt lịch trước mùa khách đông qua biên giới để tránh tình trạng chờ lâu khi nhiều nơi cùng gọi."],
    ],
  },
  {
    city: "Đông Triều", slug: "cam-nang-hut-be-phot-tai-dong-trieu",
    title: "Cẩm Nang Hút Bể Phốt Tại Đông Triều – Dấu Hiệu, Giá, Quy Trình",
    metaDesc: "Cẩm nang hút bể phốt tại Đông Triều: dấu hiệu bể đầy, giá tham khảo theo khu vực, quy trình 5 bước. Cần xe đến ngay, gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại đông triều",
    servicePage: "https://thongtaccongquangninh.com/hut-be-phot-dong-trieu/",
    relatedPage: "https://thongtaccongquangninh.com/thong-tac-cong-dong-trieu/",
    relatedAnchor: "thông tắc cống tại Đông Triều",
    causesHeading: "Nguyên nhân bể phốt tại Đông Triều nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Nhà vườn diện tích rộng</strong> — bể phốt thường xây xa nhà chính, đường ống dẫn dài hơn khu phố, dễ lắng cặn dọc đường ống trước khi vào bể.",
      "<strong>Khu Mạo Khê — vùng khai thác than</strong> — nhà trọ công nhân mỏ đông người dùng chung bể, tải trọng cao hơn nhà ở đơn lẻ.",
      "<strong>Khu trọ và cơ sở kinh doanh nhỏ ven quốc lộ</strong> — lượng khách vãng lai sử dụng nhà vệ sinh công cộng tại quán, vượt tải thiết kế ban đầu.",
    ],
    areasHeading: "Đặc điểm xử lý theo từng khu vực",
    areas: [
      "<strong>Nhà vườn:</strong> đường ống dẫn dài, khi khảo sát thợ kiểm tra thêm đoạn ống trước bể để phát hiện sớm điểm lắng cặn.",
      "<strong>Mạo Khê — khu nhà trọ công nhân mỏ:</strong> bể dùng chung nhiều phòng, cần khảo sát đúng dãy trước khi báo giá.",
      "<strong>Ven quốc lộ — quán ăn, cửa hàng:</strong> nên hút định kỳ ngắn hơn nhà ở do lượng khách vãng lai sử dụng nhà vệ sinh nhiều.",
    ],
    equipmentHeading: "Thiết bị dùng khi hút bể phốt tại Đông Triều",
    equipment: [
      "Xe bồn 2-5 khối tuỳ khu vực.",
      "Máy hút chân không công suất đủ kéo bùn đặc.",
      "Ống mềm nối dài 15-30m cho nhà vườn có bể xây xa nhà chính.",
      "Camera dò đường ống khi nghi ngờ tắc do đường ống chứ không phải bể đầy.",
    ],
    preventTips: [
      "Không đổ dầu mỡ ăn thừa, bã cà phê đặc, tã giấy xuống bồn cầu hoặc phễu thoát sàn nối vào bể.",
      "Nhà vườn nên kiểm tra định kỳ đoạn ống dẫn dài từ nhà ra bể, tránh để lắng cặn lâu ngày gây tắc trước khi bể kịp đầy.",
      "Quán ăn ven quốc lộ nên rút ngắn chu kỳ hút so với nhà ở do lượng khách vãng lai sử dụng nhà vệ sinh nhiều.",
    ],
    caseStudy: "Một nhà vườn tại Đông Triều gọi vì nhà vệ sinh thoát chậm dù bể chưa đầy hẳn. Khảo sát bằng camera phát hiện " +
      "đoạn ống dẫn dài hơn 15m từ nhà ra bể bị lắng cặn, không phải do bể đầy. Sau khi thông ống và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/hut-be-phot-dong-trieu/\">quy trình đầy đủ tại đây</a>, " +
      "chủ nhà được tư vấn kiểm tra đoạn ống này định kỳ để tránh tái diễn.",
    faq: [
      ["Hút bể phốt tại Đông Triều có làm được vào buổi tối không?",
        "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
      ["Nhà vườn có bể xây xa nhà chính thì xử lý sao?",
        "Dùng ống mềm nối dài, đồng thời kiểm tra thêm đoạn ống dẫn dài để phát hiện sớm điểm lắng cặn trước khi bể kịp đầy."],
      ["Khu trọ công nhân mỏ ở Mạo Khê có hút theo dãy không?",
        "Có, xe bồn phục vụ theo dãy nhà trọ, khảo sát đúng bể phục vụ dãy nào trước khi báo giá."],
      ["Hút bể phốt tại Đông Triều xong có được bảo hành không?",
        "Có ghi nhận ngày hút và kiểm tra đường ống trong buổi làm việc. Nếu bể đầy lại bất thường trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
    ],
  },
  {
    city: "Vân Đồn", slug: "cam-nang-hut-be-phot-tai-van-don",
    title: "Cẩm Nang Hút Bể Phốt Tại Vân Đồn – Dấu Hiệu, Giá, Quy Trình",
    metaDesc: "Cẩm nang hút bể phốt tại Vân Đồn: dấu hiệu bể đầy, giá tham khảo theo khu vực, quy trình 5 bước. Cần xe đến ngay, gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "hút bể phốt tại vân đồn",
    servicePage: "https://thongtaccongquangninh.com/hut-be-phot-van-don/",
    relatedPage: "https://thongtaccongquangninh.com/thong-tac-cong-van-don/",
    relatedAnchor: "thông tắc cống tại Vân Đồn",
    causesHeading: "Nguyên nhân bể phốt tại Vân Đồn nhanh đầy hơn khu vực khác",
    causes: [
      "<strong>Homestay, resort ven biển</strong> — công suất phòng tăng mạnh vào mùa du lịch hè, vượt tải bể thiết kế cho ngày thường.",
      "<strong>Nền đất pha cát ven biển</strong> — một số khu vực nước ngầm dâng theo triều khiến bể khó thoát nước phụ ra đất xung quanh.",
      "<strong>Đường vào đảo, khu du lịch hẹp</strong> — nhiều homestay nằm sâu trong ngõ nhỏ hoặc đường ven đồi, hạn chế xe bồn lớn tiếp cận thường xuyên.",
    ],
    areasHeading: "Đặc điểm xử lý theo từng khu vực",
    areas: [
      "<strong>Homestay, resort ven biển:</strong> nên đăng ký hút định kỳ trước mùa du lịch hè thay vì chờ đầy mới gọi.",
      "<strong>Khu dân cư gần biển:</strong> kiểm tra thêm van một chiều tại miệng bể để tránh nước biển/nước ngầm tràn ngược khi triều lên.",
      "<strong>Khu đường đảo, ven đồi:</strong> dùng xe nhỏ hoặc ống nối dài khi xe lớn khó tiếp cận trực tiếp.",
    ],
    equipmentHeading: "Thiết bị dùng khi hút bể phốt tại Vân Đồn",
    equipment: [
      "Xe bồn 2-5 khối, khu đường đảo hẹp ưu tiên xe nhỏ cơ động hơn.",
      "Máy hút chân không công suất đủ kéo bùn đặc.",
      "Ống mềm nối dài 15-30m cho homestay nằm sâu trong ngõ hoặc ven đồi.",
      "Camera dò đường ống khi nghi ngờ tắc do đường ống chứ không phải bể đầy.",
    ],
    preventTips: [
      "Không đổ dầu mỡ ăn thừa, bã cà phê đặc, tã giấy xuống bồn cầu hoặc phễu thoát sàn nối vào bể.",
      "Homestay, resort nên hút định kỳ trước mùa du lịch hè thay vì đợi khách đông mới xử lý.",
      "Kiểm tra gioăng nắp bể định kỳ ở khu ven biển để tránh nước biển ngấm vào làm loãng bùn.",
    ],
    caseStudy: "Một homestay ven biển tại Vân Đồn gọi hút gấp trước mùa hè vì lo công suất phòng tăng đột biến. " +
      "Khảo sát cho thấy bể xây từ 3 năm trước, dung tích nhỏ so với công suất phòng đặt kín mùa cao điểm. Sau khi hút và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/hut-be-phot-van-don/\">quy trình đầy đủ tại đây</a>, " +
      "chủ homestay được tư vấn hút định kỳ trước mỗi mùa du lịch thay vì chờ có dấu hiệu mới gọi.",
    faq: [
      ["Hút bể phốt tại Vân Đồn có làm được vào buổi tối không?",
        "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
      ["Homestay ven biển nên hút định kỳ bao lâu một lần?",
        "Tuỳ công suất phòng, nên khảo sát tốc độ đầy thực tế sau lần hút đầu rồi mới xác định chu kỳ phù hợp, ưu tiên hút trước mùa du lịch hè."],
      ["Đường vào đảo hẹp, xe bồn lớn không vào được thì sao?",
        "Dùng xe nhỏ hơn hoặc ống nối dài từ vị trí xe đỗ được gần nhất, không cần đục phá đường vào."],
      ["Hút bể phốt tại Vân Đồn xong có được bảo hành không?",
        "Có ghi nhận ngày hút và kiểm tra đường ống trong buổi làm việc. Nếu bể đầy lại bất thường trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
    ],
  },
];

function buildContent(post) {
  return [
    p(`Bể phốt đầy, trào ngược hay bốc mùi đều có dấu hiệu báo trước vài ngày đến vài tuần. ` +
      `Cẩm nang này ghi lại cách nhận biết, nguyên nhân đặc thù theo từng khu vực tại ${post.city}, ` +
      `và quy trình thực tế đội kỹ thuật áp dụng khi xử lý. Cần xe đến khảo sát ngay, gọi ` +
      `<strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong>.`),
    h2(`Khi nào cần hút bể phốt tại ${post.city} ngay, không nên chờ thêm`),
    p("Ba tình huống nên gọi trong ngày thay vì chờ cuối tuần:"),
    ul([
      "Nước từ bồn cầu hoặc phễu thoát sàn rút chậm hẳn so với bình thường, kèm tiếng ục ục khi xả.",
      "Mùi hôi bốc lên quanh khu vực đặt bể, rõ nhất vào buổi trưa nắng hoặc sau mưa lớn.",
      "Nắp bể hoặc miệng hố ga gần đó ẩm ướt, sũng nước dù trời không mưa — dấu hiệu bể đã tràn ra đất xung quanh.",
    ]),
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
    p(`Giá không cố định vì phụ thuộc dung tích bể thực tế và mức độ khó tiếp cận. Cách chính xác nhất là ` +
      `gọi mô tả tình trạng hoặc gửi ảnh khu vực đặt bể để được báo số cụ thể trước khi xe xuất phát — ` +
      `không báo giá ảo rồi phát sinh khi đến nơi. Xem <a href="${post.servicePage}">bảng giá chi tiết hút bể phốt tại ${post.city}</a> để tham khảo trước.`),
    h2("Cách hạn chế bể phốt nhanh đầy trở lại"),
    ul(post.preventTips),
    h2("Tình huống thực tế"),
    p(post.caseStudy),
    h2("Câu hỏi thường gặp"),
    ...post.faq.flatMap(([q, a]) => [h3(q), p(a)]),
    p(`Nếu nghi ngờ do cống tắc chứ không phải bể phốt đầy, xem thêm <a href="${post.relatedPage}">${post.relatedAnchor}</a>.`),
    h2("Liên hệ"),
    p(`Môi Trường Đô Thị Số 1 Quảng Ninh — hút bể phốt tại ${post.city} và các phường lân cận. ` +
      `Hotline: <strong>0963.953.533 / 0931.156.756</strong>. Xem chi tiết dịch vụ và bảng giá tại <a href="${post.servicePage}">trang Hút bể phốt ${post.city}</a>.`),
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
