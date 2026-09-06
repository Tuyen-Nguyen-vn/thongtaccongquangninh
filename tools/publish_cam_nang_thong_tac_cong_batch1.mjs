// Tạo 6 bài blog "Cẩm Nang Thông Tắc Cống Tại ..." (Cẩm Phả, Uông Bí, Quảng Yên, Móng Cái,
// Đông Triều, Vân Đồn) trên WordPress qua REST API, ở trạng thái NHÁP (draft). Không làm
// Hạ Long vì site đã có sẵn "cam-nang-thong-tac-cong-tai-ha-long" — làm thêm sẽ trùng lặp.
// Cùng cơ chế với các file publish_cam_nang_*.mjs khác trong thư mục này.
//
// Cách chạy (trên máy Windows có D:/.thongtaccongquangninh/.env):
//   node tools/publish_cam_nang_thong_tac_cong_batch1.mjs --dry     # xem trước
//   node tools/publish_cam_nang_thong_tac_cong_batch1.mjs           # tạo 6 bài NHÁP thật
//
// Sau khi chạy thật: mở link "editLink" in ra cho từng bài, thêm 2 ảnh thật/bài, đọc lại
// rồi mới bấm Đăng.

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
    city: "Cẩm Phả", slug: "cam-nang-thong-tac-cong-tai-cam-pha",
    title: "Cẩm Nang Thông Tắc Cống Tại Cẩm Phả – Nguyên Nhân, Giá, Cách Xử Lý",
    metaDesc: "Cẩm nang thông tắc cống tại Cẩm Phả: nguyên nhân thường gặp, giá tham khảo, quy trình 5 bước. Cần thợ đến ngay, gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại cẩm phả",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-cong-cam-pha/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-cam-pha/",
    relatedAnchor: "hút bể phốt tại Cẩm Phả",
    causesHeading: "Nguyên nhân cống tắc tại Cẩm Phả thường gặp",
    causes: [
      "<strong>Ống gang cũ ở khu tập thể mỏ</strong> (Cẩm Trung, Cẩm Thủy) — qua nhiều năm bị gỉ, co hẹp lòng ống, dễ tắc khi có rác lẫn vào.",
      "<strong>Dầu mỡ nhà bếp tích tụ</strong> ở khu nhà hàng, quán ăn quanh trung tâm, đông cứng dần trong đường ống ngang.",
      "<strong>Bùn cát dồn về hố ga sau mưa lớn</strong> — một số khu vực gần cảng, khu công nghiệp Cửa Ông có hệ thoát nước chung dễ quá tải khi mưa to.",
    ],
    areasHeading: "Đặc điểm xử lý theo từng khu vực",
    areas: [
      "<strong>Cẩm Trung, Cẩm Thủy — nhà tập thể khu mỏ:</strong> ống gang cũ, cần máy lò xo lực đẩy phù hợp để không làm vỡ thêm đoạn ống đã gỉ mỏng.",
      "<strong>Khu nhà hàng, quán ăn:</strong> ưu tiên thông đoạn ống gần bồn rửa trước, xử lý dầu mỡ đóng cặn bằng máy áp lực.",
      "<strong>Cửa Ông, Mông Dương — gần cảng, khu công nghiệp:</strong> kiểm tra thêm hố ga ngoài nhà, thường là nơi bùn cát tích tụ trước khi vào đường ống chính.",
    ],
    equipmentHeading: "Thiết bị dùng khi thông tắc cống tại Cẩm Phả",
    equipment: [
      "Máy lò xo các cỡ dây phù hợp đường kính ống, kể cả ống gang cũ dễ vỡ.",
      "Máy bơm áp lực cao để đẩy dầu mỡ và cặn bám thành ống.",
      "Camera dò đường ống khi cần xác định chính xác điểm tắc trước khi thi công.",
      "Dụng cụ nạo vét hố ga cho khu vực có nhiều bùn cát sau mưa.",
    ],
    preventTips: [
      "Không đổ dầu mỡ ăn thừa trực tiếp xuống bồn rửa bát, nên gạn ra túi riêng trước khi rửa.",
      "Nhà tập thể khu mỏ nên kiểm tra định kỳ đoạn ống gang chung, phát hiện sớm điểm gỉ sắp tắc.",
      "Sau mưa lớn nên kiểm tra hố ga ngoài nhà, nạo vét bùn cát trước khi tích tụ quá nhiều.",
    ],
    caseStudy: "Một quán ăn gần trung tâm Cẩm Phả gọi thông cống gấp vì nước rửa bát trào ngược giờ cao điểm. " +
      "Khảo sát cho thấy đoạn ống dưới bồn rửa đóng đầy dầu mỡ nhiều năm chưa thông. Sau khi xử lý bằng máy áp lực và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/thong-tac-cong-cam-pha/\">quy trình đầy đủ tại đây</a>, " +
      "chủ quán được tư vấn gạn dầu mỡ riêng trước khi rửa để tránh tái tắc.",
    faq: [
      ["Thông tắc cống tại Cẩm Phả có làm được vào buổi tối không?",
        "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
      ["Ống gang cũ ở khu tập thể mỏ có thông được không?",
        "Được, nhưng thợ điều chỉnh lực đẩy máy lò xo phù hợp để không làm vỡ thêm đoạn ống đã gỉ mỏng, tránh gây hư hỏng ngoài dự kiến."],
      ["Thông tắc cống tại Cẩm Phả xong có cần nạo vét hố ga không?",
        "Tuỳ tình trạng, nếu hố ga nhiều bùn cát sau mưa thì nên nạo vét cùng lúc để tránh tắc lại sớm, có báo giá riêng cho phần này."],
      ["Thông tắc cống tại Cẩm Phả có bảo hành không?",
        "Có ghi nhận ngày xử lý. Nếu tắc lại ở đúng điểm cũ trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
    ],
  },
  {
    city: "Uông Bí", slug: "cam-nang-thong-tac-cong-tai-uong-bi",
    title: "Cẩm Nang Thông Tắc Cống Tại Uông Bí – Nguyên Nhân, Giá, Cách Xử Lý",
    metaDesc: "Cẩm nang thông tắc cống tại Uông Bí: nguyên nhân thường gặp, giá tham khảo, quy trình 5 bước. Cần thợ đến ngay, gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại uông bí",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-cong-uong-bi/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-uong-bi/",
    relatedAnchor: "hút bể phốt tại Uông Bí",
    causesHeading: "Nguyên nhân cống tắc tại Uông Bí thường gặp",
    causes: [
      "<strong>Địa hình dốc ở khu Vàng Danh</strong> — nước mưa cuốn theo đất đá xuống đường ống thấp hơn, dễ lắng cặn tại các đoạn nối.",
      "<strong>Nhà trọ công nhân mỏ dùng chung đường thoát</strong> (Yên Thanh, Quang Trung) — lượng rác thải sinh hoạt nhiều hơn nhà ở đơn lẻ.",
      "<strong>Mùa lễ hội Yên Tử đông khách</strong> — nhà nghỉ, hàng quán quanh tuyến đường lên chùa có lượng nước thải tăng đột biến đầu năm.",
    ],
    areasHeading: "Đặc điểm xử lý theo từng khu vực",
    areas: [
      "<strong>Vàng Danh — khu đồi dốc:</strong> kiểm tra kỹ các đoạn nối ống nơi dễ lắng cặn đất đá sau mưa.",
      "<strong>Yên Thanh, Quang Trung — nhà trọ công nhân:</strong> đường thoát dùng chung nhiều phòng, cần xác định đúng đoạn tắc trước khi xử lý.",
      "<strong>Khu vực gần Yên Tử:</strong> nên kiểm tra đường ống trước mùa lễ hội để tránh tắc giữa lúc đông khách.",
    ],
    equipmentHeading: "Thiết bị dùng khi thông tắc cống tại Uông Bí",
    equipment: [
      "Máy lò xo các cỡ dây phù hợp đường kính ống.",
      "Máy bơm áp lực cao cho đoạn ống dài hoặc nhiều điểm gấp khúc.",
      "Camera dò đường ống khi cần xác định chính xác điểm tắc.",
      "Dụng cụ nạo vét hố ga cho khu vực đồi dốc dễ lắng đất đá.",
    ],
    preventTips: [
      "Không đổ dầu mỡ ăn thừa, giấy vệ sinh dày xuống đường thoát chung.",
      "Khu đồi dốc nên kiểm tra hố ga trước mùa mưa để tránh đất đá cuốn vào đường ống.",
      "Nhà nghỉ, hàng quán quanh Yên Tử nên thông kiểm tra trước mùa lễ hội thay vì đợi tắc mới gọi.",
    ],
    caseStudy: "Một nhà nghỉ gần tuyến đường lên Yên Tử gọi thông cống gấp trước Tết vì lo đông khách hành hương. " +
      "Khảo sát phát hiện đoạn ống gần nhà vệ sinh chung đã tích tụ giấy vệ sinh dày lâu ngày. Sau khi xử lý và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/thong-tac-cong-uong-bi/\">quy trình đầy đủ tại đây</a>, " +
      "chủ nhà nghỉ được tư vấn kiểm tra định kỳ trước mỗi mùa lễ hội.",
    faq: [
      ["Thông tắc cống tại Uông Bí có làm được vào buổi tối không?",
        "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
      ["Nhà ở khu đồi Vàng Danh có thông được không?",
        "Có, thợ kiểm tra kỹ các đoạn nối ống dễ lắng cặn đất đá do địa hình dốc trước khi xử lý."],
      ["Mùa lễ hội Yên Tử đặt lịch có chậm không?",
        "Nên đặt lịch kiểm tra trước mùa lễ hội đầu năm, tránh tình trạng chờ lâu khi nhiều nơi cùng gọi lúc cao điểm."],
      ["Thông tắc cống tại Uông Bí có bảo hành không?",
        "Có ghi nhận ngày xử lý. Nếu tắc lại ở đúng điểm cũ trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
    ],
  },
  {
    city: "Quảng Yên", slug: "cam-nang-thong-tac-cong-tai-quang-yen",
    title: "Cẩm Nang Thông Tắc Cống Tại Quảng Yên – Nguyên Nhân, Giá, Cách Xử Lý",
    metaDesc: "Cẩm nang thông tắc cống tại Quảng Yên: nguyên nhân thường gặp, giá tham khảo, quy trình 5 bước. Cần thợ đến ngay, gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại quảng yên",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-cong-quang-yen/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-quang-yen/",
    relatedAnchor: "hút bể phốt tại Quảng Yên",
    causesHeading: "Nguyên nhân cống tắc tại Quảng Yên thường gặp",
    causes: [
      "<strong>Nhà nền thấp ven sông</strong> — nước dâng theo triều khiến đường thoát chảy chậm, rác dễ lắng lại thay vì trôi hết ra ngoài.",
      "<strong>Cát bùn từ khu vực ven sông</strong> cuốn vào hố ga sau mưa, tích tụ dần làm hẹp dòng chảy.",
      "<strong>Nhà trọ công nhân khu công nghiệp</strong> dùng chung đường thoát, lượng rác thải sinh hoạt nhiều hơn nhà ở đơn lẻ.",
    ],
    areasHeading: "Đặc điểm xử lý theo từng khu vực",
    areas: [
      "<strong>Khu ven sông, nền thấp:</strong> kiểm tra thêm van một chiều nếu có, tránh nước sông tràn ngược khi triều lên.",
      "<strong>Khu công nghiệp, nhà trọ:</strong> cần xác định đúng đoạn ống dùng chung dãy nào trước khi xử lý.",
      "<strong>Trung tâm thị xã:</strong> xe và thiết bị tiếp cận trực tiếp phần lớn tuyến đường chính.",
    ],
    equipmentHeading: "Thiết bị dùng khi thông tắc cống tại Quảng Yên",
    equipment: [
      "Máy lò xo các cỡ dây phù hợp đường kính ống.",
      "Máy bơm áp lực cao cho đoạn ống lẫn nhiều bùn cát.",
      "Camera dò đường ống khi cần xác định chính xác điểm tắc.",
      "Dụng cụ nạo vét hố ga cho khu ven sông dễ lắng cát bùn.",
    ],
    preventTips: [
      "Không đổ dầu mỡ ăn thừa, rác thải sinh hoạt xuống đường thoát chung.",
      "Khu ven sông nên nạo vét hố ga định kỳ trước mùa mưa để tránh cát bùn tích tụ quá nhiều.",
      "Nhà trọ công nhân nên kiểm tra đường thoát chung định kỳ thay vì đợi tắc mới gọi.",
    ],
    caseStudy: "Một hộ dân ven sông tại Quảng Yên gọi thông cống vì nước thoát chậm sau đợt triều cường kéo dài. " +
      "Khảo sát cho thấy hố ga ngoài nhà tích tụ nhiều cát bùn, chưa nạo vét hơn 1 năm. Sau khi xử lý và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/thong-tac-cong-quang-yen/\">quy trình đầy đủ tại đây</a>, " +
      "chủ nhà được tư vấn nạo vét định kỳ trước mùa mưa.",
    faq: [
      ["Thông tắc cống tại Quảng Yên có làm được vào buổi tối không?",
        "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
      ["Nhà ven sông ở Quảng Yên có cần kiểm tra thêm gì không?",
        "Có, kiểm tra thêm van một chiều nếu có để tránh nước sông tràn ngược khi triều lên, không tính thêm phí cho bước kiểm tra này."],
      ["Thông tắc cống tại Quảng Yên có cần nạo vét hố ga không?",
        "Tuỳ tình trạng, khu ven sông thường cần nạo vét thêm do cát bùn tích tụ, có báo giá riêng cho phần này."],
      ["Thông tắc cống tại Quảng Yên có bảo hành không?",
        "Có ghi nhận ngày xử lý. Nếu tắc lại ở đúng điểm cũ trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
    ],
  },
  {
    city: "Móng Cái", slug: "cam-nang-thong-tac-cong-tai-mong-cai",
    title: "Cẩm Nang Thông Tắc Cống Tại Móng Cái – Nguyên Nhân, Giá, Cách Xử Lý",
    metaDesc: "Cẩm nang thông tắc cống tại Móng Cái: nguyên nhân thường gặp, giá tham khảo, quy trình 5 bước. Cần thợ đến ngay, gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại móng cái",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-cong-mong-cai/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-mong-cai/",
    relatedAnchor: "hút bể phốt tại Móng Cái",
    causesHeading: "Nguyên nhân cống tắc tại Móng Cái thường gặp",
    causes: [
      "<strong>Rác thải khu chợ cửa khẩu</strong> — bao bì, túi nilon từ hoạt động buôn bán dễ lọt vào hố ga khu chợ.",
      "<strong>Dầu mỡ từ nhà hàng, quán ăn</strong> đông khách qua lại, đóng cặn dần trong đường ống ngang.",
      "<strong>Nhà phố liền kề san sát</strong> — đường ống chung của cả dãy dễ bị ảnh hưởng khi một nhà xả rác không đúng cách.",
    ],
    areasHeading: "Đặc điểm xử lý theo từng khu vực",
    areas: [
      "<strong>Khu chợ cửa khẩu:</strong> ưu tiên kiểm tra hố ga trước, thường là nơi rác bao bì tích tụ nhiều nhất.",
      "<strong>Nhà hàng, quán ăn:</strong> xử lý dầu mỡ đóng cặn bằng máy áp lực, tư vấn thêm bể tách mỡ nếu cần.",
      "<strong>Nhà phố liền kề:</strong> xác định đúng đoạn ống chung trước khi thi công, tránh ảnh hưởng nhà bên cạnh.",
    ],
    equipmentHeading: "Thiết bị dùng khi thông tắc cống tại Móng Cái",
    equipment: [
      "Máy lò xo các cỡ dây phù hợp đường kính ống.",
      "Máy bơm áp lực cao để xử lý dầu mỡ và rác bao bì tích tụ.",
      "Camera dò đường ống khi cần xác định chính xác điểm tắc.",
      "Dụng cụ nạo vét hố ga cho khu chợ dễ lẫn rác thải sinh hoạt.",
    ],
    preventTips: [
      "Khu chợ nên có thùng rác riêng gần hố ga để hạn chế rác bao bì lọt vào đường thoát.",
      "Nhà hàng, quán ăn nên gạn dầu mỡ riêng trước khi đổ nước rửa bát.",
      "Nhà phố liền kề nên thống nhất giữa các hộ về việc không xả rác cứng xuống đường ống chung.",
    ],
    caseStudy: "Một cửa hàng tại khu chợ cửa khẩu Móng Cái gọi thông cống vì nước thoát chậm trước hố ga trước cửa. " +
      "Khảo sát phát hiện túi nilon và bao bì tích tụ nhiều trong hố ga. Sau khi xử lý và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/thong-tac-cong-mong-cai/\">quy trình đầy đủ tại đây</a>, " +
      "chủ cửa hàng được tư vấn đặt thêm thùng rác gần hố ga để tránh tái diễn.",
    faq: [
      ["Thông tắc cống tại Móng Cái có làm được vào buổi tối không?",
        "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
      ["Khu chợ cửa khẩu có cần xử lý riêng không?",
        "Có, ưu tiên kiểm tra hố ga trước vì thường là nơi rác bao bì tích tụ nhiều nhất trong khu vực buôn bán."],
      ["Nhà hàng dầu mỡ nhiều có cần lắp thêm gì không?",
        "Nên lắp bể tách mỡ trước khi nước thải chảy vào đường ống chính, giảm tần suất phải gọi thông cống."],
      ["Thông tắc cống tại Móng Cái có bảo hành không?",
        "Có ghi nhận ngày xử lý. Nếu tắc lại ở đúng điểm cũ trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
    ],
  },
  {
    city: "Đông Triều", slug: "cam-nang-thong-tac-cong-tai-dong-trieu",
    title: "Cẩm Nang Thông Tắc Cống Tại Đông Triều – Nguyên Nhân, Giá, Cách Xử Lý",
    metaDesc: "Cẩm nang thông tắc cống tại Đông Triều: nguyên nhân thường gặp, giá tham khảo, quy trình 5 bước. Cần thợ đến ngay, gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại đông triều",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-cong-dong-trieu/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-dong-trieu/",
    relatedAnchor: "hút bể phốt tại Đông Triều",
    causesHeading: "Nguyên nhân cống tắc tại Đông Triều thường gặp",
    causes: [
      "<strong>Rễ cây xâm nhập đường ống</strong> — nhà vườn nhiều cây lâu năm, rễ có thể len vào các mối nối ống cũ theo thời gian.",
      "<strong>Nhà trọ công nhân mỏ than Mạo Khê</strong> dùng chung đường thoát, lượng rác thải sinh hoạt nhiều hơn nhà ở đơn lẻ.",
      "<strong>Đất cát từ sân vườn rộng</strong> cuốn vào hố ga sau mưa, tích tụ dần làm hẹp dòng chảy.",
    ],
    areasHeading: "Đặc điểm xử lý theo từng khu vực",
    areas: [
      "<strong>Nhà vườn:</strong> kiểm tra kỹ các mối nối ống cũ nếu nghi ngờ rễ cây xâm nhập, dùng camera trước khi quyết định đào sửa.",
      "<strong>Mạo Khê — khu nhà trọ công nhân mỏ:</strong> đường thoát dùng chung nhiều phòng, cần xác định đúng đoạn tắc.",
      "<strong>Khu vườn rộng ven quốc lộ:</strong> nạo vét hố ga định kỳ để tránh đất cát tích tụ.",
    ],
    equipmentHeading: "Thiết bị dùng khi thông tắc cống tại Đông Triều",
    equipment: [
      "Máy lò xo các cỡ dây, có lưỡi cắt rễ cây cho đường ống nhà vườn lâu năm.",
      "Máy bơm áp lực cao cho đoạn ống dài từ nhà ra hố ga ngoài vườn.",
      "Camera dò đường ống khi nghi ngờ rễ cây hoặc cần xác định chính xác điểm tắc.",
      "Dụng cụ nạo vét hố ga cho khu vườn rộng dễ lắng đất cát.",
    ],
    preventTips: [
      "Nhà vườn nên kiểm tra định kỳ đoạn ống gần gốc cây lớn, phát hiện sớm dấu hiệu rễ xâm nhập.",
      "Không đổ dầu mỡ ăn thừa, rác thải sinh hoạt xuống đường thoát chung.",
      "Nạo vét hố ga trước mùa mưa để tránh đất cát sân vườn tích tụ quá nhiều.",
    ],
    caseStudy: "Một nhà vườn tại Đông Triều gọi thông cống vì nước thoát chậm dần trong nhiều tuần. Khảo sát bằng camera phát hiện " +
      "rễ cây đã len vào một mối nối ống cũ gần gốc cây ăn quả lâu năm. Sau khi xử lý và kiểm tra " +
      "<a href=\"https://thongtaccongquangninh.com/thong-tac-cong-dong-trieu/\">quy trình đầy đủ tại đây</a>, " +
      "chủ nhà được tư vấn kiểm tra định kỳ đoạn ống này để tránh tái diễn.",
    faq: [
      ["Thông tắc cống tại Đông Triều có làm được vào buổi tối không?",
        "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
      ["Rễ cây xâm nhập đường ống nhà vườn có xử lý được không?",
        "Được, dùng máy lò xo có lưỡi cắt rễ cây, kèm camera dò để xác định chính xác vị trí trước khi quyết định có cần đào sửa hay không."],
      ["Khu trọ công nhân mỏ ở Mạo Khê có xử lý theo dãy không?",
        "Có, xác định đúng đoạn ống dùng chung dãy nào trước khi báo giá và thi công."],
      ["Thông tắc cống tại Đông Triều có bảo hành không?",
        "Có ghi nhận ngày xử lý. Nếu tắc lại ở đúng điểm cũ trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
    ],
  },
  {
    city: "Vân Đồn", slug: "cam-nang-thong-tac-cong-tai-van-don",
    title: "Cẩm Nang Thông Tắc Cống Tại Vân Đồn – Nguyên Nhân, Giá, Cách Xử Lý",
    metaDesc: "Cẩm nang thông tắc cống tại Vân Đồn: nguyên nhân thường gặp, giá tham khảo, quy trình 5 bước. Cần thợ đến ngay, gọi 0963.953.533 / 0931.156.756.",
    focusKeyword: "thông tắc cống tại vân đồn",
    servicePage: "https://thongtaccongquangninh.com/thong-tac-cong-van-don/",
    relatedPage: "https://thongtaccongquangninh.com/hut-be-phot-van-don/",
    relatedAnchor: "hút bể phốt tại Vân Đồn",
    causesHeading: "Nguyên nhân cống tắc tại Vân Đồn thường gặp",
    causes: [
      "<strong>Cát biển cuốn vào hố ga</strong> — nhà gần bờ biển dễ bị cát theo gió hoặc nước mưa cuốn vào đường thoát.",
      "<strong>Homestay, resort đông khách mùa hè</strong> — lượng nước thải và rác sinh hoạt tăng mạnh so với ngày thường.",
      "<strong>Rác bão biển</strong> sau các đợt gió mùa hoặc bão, lá cây và rác trôi dạt lấp hố ga ngoài trời.",
    ],
    areasHeading: "Đặc điểm xử lý theo từng khu vực",
    areas: [
      "<strong>Homestay, resort ven biển:</strong> nên kiểm tra đường ống trước mùa du lịch hè để tránh tắc giữa lúc đông khách.",
      "<strong>Khu gần bờ biển:</strong> nạo vét hố ga định kỳ để tránh cát biển tích tụ.",
      "<strong>Sau mùa mưa bão:</strong> kiểm tra hố ga ngoài trời vì dễ bị rác bão biển lấp kín.",
    ],
    equipmentHeading: "Thiết bị dùng khi thông tắc cống tại Vân Đồn",
    equipment: [
      "Máy lò xo các cỡ dây phù hợp đường kính ống.",
      "Máy bơm áp lực cao cho đoạn ống lẫn cát biển.",
      "Camera dò đường ống khi cần xác định chính xác điểm tắc.",
      "Dụng cụ nạo vét hố ga cho khu ven biển dễ lắng cát và rác bão.",
    ],
    preventTips: [
      "Homestay, resort nên kiểm tra đường ống trước mùa du lịch hè thay vì đợi khách đông mới xử lý.",
      "Khu gần biển nên nạo vét hố ga định kỳ, đặc biệt sau các đợt gió mùa hoặc bão.",
      "Không đổ dầu mỡ ăn thừa, rác thải sinh hoạt xuống đường thoát chung.",
    ],
    caseStudy: "Một homestay ven biển tại Vân Đồn gọi thông cống sau đợt gió mùa vì hố ga ngoài sân bị lấp bởi lá cây và cát biển. " +
      "Sau khi nạo vét và kiểm tra <a href=\"https://thongtaccongquangninh.com/thong-tac-cong-van-don/\">quy trình đầy đủ tại đây</a>, " +
      "chủ homestay được tư vấn kiểm tra hố ga định kỳ sau mỗi đợt gió mùa hoặc bão.",
    faq: [
      ["Thông tắc cống tại Vân Đồn có làm được vào buổi tối không?",
        "Có, tiếp nhận trong khung 05:00-22:00 hằng ngày. Ca sau 20h tính thêm phụ phí di chuyển, báo rõ số tiền trước khi thợ xuất phát."],
      ["Nhà gần biển ở Vân Đồn có cần nạo vét hố ga thường xuyên không?",
        "Nên nạo vét định kỳ vì cát biển và rác bão dễ tích tụ hơn khu vực trong đất liền."],
      ["Homestay đông khách mùa hè có nên kiểm tra trước không?",
        "Nên kiểm tra đường ống trước mùa du lịch hè để tránh tắc giữa lúc khách đông, tránh ảnh hưởng trải nghiệm khách lưu trú."],
      ["Thông tắc cống tại Vân Đồn có bảo hành không?",
        "Có ghi nhận ngày xử lý. Nếu tắc lại ở đúng điểm cũ trong thời gian ngắn sau đó, liên hệ lại để kiểm tra miễn phí."],
    ],
  },
];

function buildContent(post) {
  return [
    p(`Cống tắc, nước trào ngược hay thoát chậm đều có nguyên nhân cụ thể, không phải lúc nào cũng cần đục phá. ` +
      `Cẩm nang này ghi lại nguyên nhân thường gặp theo từng khu vực tại ${post.city}, và quy trình thực tế đội kỹ thuật ` +
      `áp dụng khi xử lý. Cần thợ đến khảo sát ngay, gọi <strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong>.`),
    h2(`Khi nào cần thông tắc cống tại ${post.city} ngay, không nên chờ thêm`),
    p("Ba tình huống nên gọi trong ngày thay vì chờ cuối tuần:"),
    ul([
      "Nước thoát chậm hẳn ở bồn rửa, bồn cầu hoặc phễu thoát sàn, kèm tiếng ục ục khi xả.",
      "Mùi hôi bốc lên từ cống hoặc hố ga, rõ nhất sau mưa hoặc vào buổi trưa nắng.",
      "Nước trào ngược lên sàn nhà hoặc sân khi xả nước ở vị trí thấp nhất trong nhà.",
    ]),
    p("Nếu chỉ có 1 trong 3 dấu hiệu và mới xuất hiện 1-2 ngày, có thể theo dõi thêm; nếu có từ " +
      "2 dấu hiệu trở lên, nên gọi khảo sát trong ngày để tránh nước thải tràn ra sân hoặc ảnh hưởng sinh hoạt."),
    h2(post.causesHeading),
    ol(post.causes),
    h2(post.areasHeading),
    ul(post.areas),
    h2(post.equipmentHeading),
    ul(post.equipment),
    h2("Quy trình 5 bước"),
    ol([
      "<strong>Tiếp nhận qua điện thoại</strong> — hỏi vị trí, mô tả tình trạng thoát nước, thời gian bắt đầu chậm/tắc.",
      "<strong>Điều thợ theo khu vực</strong> — ưu tiên thợ gần nhất trong bán kính đang phục vụ để rút ngắn thời gian có mặt.",
      "<strong>Khảo sát tại chỗ</strong> — xác định điểm tắc bằng kinh nghiệm hoặc camera nếu cần, báo giá trước khi xử lý.",
      "<strong>Thông tắc</strong> — dùng máy lò xo hoặc máy áp lực phù hợp, không đục phá khi máy còn xử lý được.",
      "<strong>Kiểm tra và bàn giao</strong> — xả thử nhiều lần để chắc chắn thông hoàn toàn, ghi lại ngày xử lý.",
    ]),
    h2("Giá tham khảo (thay đổi theo mức độ tắc và vị trí thi công)"),
    p(`Giá không cố định vì phụ thuộc độ sâu và mức độ tắc thực tế. Cách chính xác nhất là gọi mô tả tình trạng ` +
      `để được báo số cụ thể trước khi thợ xuất phát — không báo giá ảo rồi phát sinh khi đến nơi. ` +
      `Xem <a href="${post.servicePage}">bảng giá chi tiết thông tắc cống tại ${post.city}</a> để tham khảo trước.`),
    h2("Cách hạn chế cống tắc lại"),
    ul(post.preventTips),
    h2("Tình huống thực tế"),
    p(post.caseStudy),
    h2("Câu hỏi thường gặp"),
    ...post.faq.flatMap(([q, a]) => [h3(q), p(a)]),
    p(`Nếu nghi ngờ do bể phốt đầy chứ không phải cống tắc, xem thêm <a href="${post.relatedPage}">${post.relatedAnchor}</a>.`),
    h2("Liên hệ"),
    p(`Môi Trường Đô Thị Số 1 Quảng Ninh — thông tắc cống tại ${post.city} và các phường lân cận. ` +
      `Hotline: <strong>0963.953.533 / 0931.156.756</strong>. Xem chi tiết dịch vụ và bảng giá tại <a href="${post.servicePage}">trang Thông tắc cống ${post.city}</a>.`),
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
