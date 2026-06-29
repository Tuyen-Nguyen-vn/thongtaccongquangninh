import https from "node:https";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const PROJECT_ROOT = "/mnt/d/.thongtaccongquangninh";
const ENV_PATHS = [
  path.join(PROJECT_ROOT, ".env"),
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
];
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const BASE_URL = "https://thongtaccongquangninh.com";
const PAGE_ID = 424;
const SLUG = "thong-tac-cong-quang-yen";
const URL = `${BASE_URL}/${SLUG}/`;
const APPLY = process.argv.includes("--apply");
const ts = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_DIR = path.join(PROJECT_ROOT, "seo-revisions", `wp-before-quang-yen-ttc-rewrite-${ts}`);
const REPORT_PATH = path.join(PROJECT_ROOT, "reports", `quang-yen-ttc-rewrite-${ts}.json`);

const NEW_TITLE = "Thông Tắc Cống Quảng Yên, Có Mặt Nhanh, Giá Rõ";
const NEW_DESC =
  "Thông tắc cống Quảng Yên, khảo sát nhanh, báo giá trước, không đục phá, bảo hành 6-24 tháng. Tiếp nhận 05:00-22:00. Gọi 0963.953.533.";
const FOCUS_KEYWORD = "thông tắc cống Quảng Yên";

function readEnv() {
  const envPath = ENV_PATHS.find((p) => existsSync(p));
  if (!envPath) throw new Error(`Không tìm thấy .env trong: ${ENV_PATHS.join(", ")}`);
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Thiếu WP_USERNAME/WP_APP_PASSWORD");
  return {
    auth: `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`,
    envPath,
  };
}

function wpRequest(method, route, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: `/wp-json${route}`,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "User-Agent": "Codex Quang Yen TTC rewrite",
          ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let data = text;
          try {
            data = text ? JSON.parse(text) : {};
          } catch {}
          if (res.statusCode >= 400) {
            const message = typeof data === "object" ? data.message ?? text : data;
            reject(new Error(`WP ${res.statusCode} ${route}: ${message}`));
            return;
          }
          resolve({ status: res.statusCode, data });
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error(`timeout ${route}`)));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function escapeHtml(input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function extractFigures(raw) {
  const figures = String(raw ?? "").match(/<figure\b[\s\S]*?<\/figure>/giu) ?? [];
  const captions = [
    {
      alt: "Máy lò xo thông cống tại Quảng Yên cho nhà dân và cửa hàng",
      caption: "Thi công thông tắc cống bằng máy lò xo cho nhà dân, cửa hàng tại Quảng Yên.",
    },
    {
      alt: "Kỹ thuật kiểm tra đường ống thoát nước Quảng Yên không đục phá",
      caption: "Kiểm tra đường ống, miệng thoát và hố ga trước khi báo phương án xử lý.",
    },
    {
      alt: "Nạo vét bùn hố ga Quảng Yên sau mưa tránh trào ngược",
      caption: "Nạo vét bùn hố ga, xử lý điểm nghẽn ngoài sân cho khu vực nền thấp tại Quảng Yên.",
    },
  ];
  return figures.slice(0, 3).map((figure, index) => {
    const data = captions[index];
    let next = figure;
    next = next.replace(/\salt="[^"]*"/iu, ` alt="${escapeHtml(data.alt)}"`);
    next = next.replace(/<figcaption\b[^>]*>[\s\S]*?<\/figcaption>/iu, `<figcaption class="wp-element-caption">${escapeHtml(data.caption)}</figcaption>`);
    return next;
  });
}

function faqSchema() {
  const mainEntity = [
    {
      "@type": "Question",
      name: "Thông tắc cống Quảng Yên bao nhiêu tiền?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Chi phí phụ thuộc vị trí tắc, chiều dài đường ống, mức bùn mỡ, thời điểm thi công và việc có cần nạo vét hố ga hay không. Kỹ thuật khảo sát và báo giá trước khi làm.",
      },
    },
    {
      "@type": "Question",
      name: "Thợ thông tắc cống tại Quảng Yên bao lâu có mặt?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Đội kỹ thuật điều phối theo tuyến gần nhất. Thời gian thực tế phụ thuộc địa chỉ, khung giờ gọi, thời tiết và tình trạng giao thông.",
      },
    },
    {
      "@type": "Question",
      name: "Dịch vụ có làm ban đêm, cuối tuần và ngày lễ không?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dịch vụ tiếp nhận 05:00-22:00 hằng ngày, gồm buổi tối, cuối tuần và ngày lễ khi khách cần xử lý cống trào, bốc mùi hoặc nước rút quá chậm.",
      },
    },
    {
      "@type": "Question",
      name: "Thông cống có phải đục phá nền nhà không?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kỹ thuật ưu tiên xử lý qua miệng thoát, hố ga và điểm kỹ thuật sẵn có. Chỉ đề xuất tháo lắp hoặc can thiệp thêm khi có căn cứ kỹ thuật rõ ràng.",
      },
    },
    {
      "@type": "Question",
      name: "Sau khi thông tắc có bảo hành không?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Có chính sách bảo hành theo tình trạng thực tế, thường từ 6 đến 24 tháng tùy hạng mục và nguyên nhân gây tắc.",
      },
    },
  ];
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity })}</script>`;
}

function buildContent(raw) {
  const [fig1 = "", fig2 = "", fig3 = ""] = extractFigures(raw);
  return `<p><strong>Thông tắc cống Quảng Yên</strong> cần xử lý sớm khi nước rút chậm, miệng thoát bốc mùi hoặc hố ga dâng sau mưa. Đội kỹ thuật Môi Trường Đô Thị Số 1 Quảng Ninh tiếp nhận 05:00-22:00, kiểm tra đúng điểm nghẽn, báo giá trước khi làm và ưu tiên không đục phá.</p>
<p>Khu vực Quảng Yên có nhiều nhà ven sông, khu thấp, nhà xưởng nhỏ, cửa hàng ăn uống và tuyến hố ga dễ lắng bùn cát. Vì vậy, thợ không chỉ nhìn miệng cống trong nhà mà còn kiểm tra hố ga ngoài sân, đoạn ống bếp, độ dốc thoát nước và dấu hiệu trào ngược.</p>
<p>Cống đang trào, bốc mùi hoặc tắc lặp lại? Gọi <strong>0963.953.533 / 0931.156.756</strong>, hoặc gửi ảnh miệng thoát, hố ga, khu vực nước trào để kỹ thuật đánh giá nhanh trước khi đến.</p>

${fig1}

<h2>Dấu hiệu cần gọi thợ thông tắc cống tại Quảng Yên</h2>
<ul>
<li>Nước rút chậm ở bếp, nhà vệ sinh, sân sau hoặc khu giặt rửa.</li>
<li>Miệng thoát sàn có mùi hôi, nghe tiếng ọc nước khi xả.</li>
<li>Nước trào ngược khi xả đồng thời bồn rửa, máy giặt hoặc thoát sàn.</li>
<li>Hố ga ngoài sân đầy bùn, dâng nước sau mưa lớn.</li>
<li>Đã tự vệ sinh rọ chắn rác nhưng cống vẫn tắc lại sau vài ngày.</li>
</ul>
<p>Nếu sự cố chỉ xảy ra ở một miệng thoát, nguyên nhân thường nằm gần ống nhánh. Nếu nhiều điểm cùng chậm, cần kiểm tra tuyến chính, hố ga hoặc bể phốt để tránh thông sai điểm nghẽn.</p>

<h2>Nguyên nhân thường gặp và cách xử lý phù hợp</h2>
<table>
<thead><tr><th>Tình trạng gặp phải</th><th>Nguyên nhân có thể</th><th>Cách xử lý phù hợp</th><th>Giá tham khảo</th></tr></thead>
<tbody>
<tr><td>Nước bếp rút chậm, có váng mỡ</td><td>Dầu mỡ, thức ăn thừa, cặn xà phòng đóng trong ống</td><td>Dùng máy lò xo, xả kiểm tra nhiều lần, vệ sinh bẫy mỡ nếu có</td><td>Báo theo độ dài ống và mức mỡ</td></tr>
<tr><td>Thoát sàn có mùi, nước ọc lên</td><td>Tắc tóc, rác nhỏ, bẫy nước khô hoặc cặn bẩn gần miệng thoát</td><td>Lấy rác, thông đoạn gần, kiểm tra mùi sau xử lý</td><td>Báo sau khảo sát</td></tr>
<tr><td>Sân hoặc hố ga trào sau mưa</td><td>Bùn cát, lá cây, rác lắng trong hố ga nền thấp</td><td>Nạo vét hố ga, kiểm tra tuyến thoát ngoài sân</td><td>Tùy khối lượng bùn và số hố ga</td></tr>
<tr><td>Cống tắc lặp lại sau vài ngày</td><td>Ống lún, gãy, sai độ dốc hoặc chưa xử lý đúng điểm nghẽn</td><td>Kiểm tra tuyến ống, xác định điểm lỗi trước khi đề xuất sửa thêm</td><td>Báo theo hiện trạng</td></tr>
</tbody>
</table>

<h2>Khi nào tự xử lý được, khi nào nên gọi thợ?</h2>
<p>Khách có thể tự vệ sinh rọ chắn rác, tóc, cặn bẩn ngay miệng thoát và thử xả nước kiểm tra. Với tắc nhẹ do cặn xà phòng, nước ấm có thể hỗ trợ nhưng không nên lạm dụng hóa chất mạnh trong không gian kín.</p>
<p>Nên gọi thợ khi nước đã trào ra sàn, mùi hôi nặng, nhiều điểm thoát cùng chậm, hố ga đầy bùn hoặc cống tắc lặp lại dù đã tự xử lý. Đây là nhóm sự cố cần thiết bị cơ học, kiểm tra hố ga và xác định nguyên nhân gốc.</p>

${fig2}

<h2>Quy trình thông tắc cống Quảng Yên 5 bước</h2>
<ol>
<li><strong>Tiếp nhận tình trạng:</strong> hỏi địa chỉ, vị trí tắc, thời điểm bắt đầu, ảnh hiện trạng và cách khách đã thử.</li>
<li><strong>Khảo sát điểm thoát:</strong> kiểm tra miệng cống, thoát sàn, cống bếp, hố ga và dòng thoát ngoài sân.</li>
<li><strong>Báo phương án và chi phí:</strong> nói rõ phần xử lý bằng máy lò xo, nạo vét hố ga hoặc kiểm tra tuyến chính; khách đồng ý mới làm.</li>
<li><strong>Thi công không đục phá trước:</strong> ưu tiên xử lý qua điểm kỹ thuật sẵn có, hạn chế tháo mở khi chưa có căn cứ.</li>
<li><strong>Xả thử và bàn giao:</strong> kiểm tra tốc độ nước rút, mùi hôi, hố ga và hướng dẫn cách phòng tắc lại.</li>
</ol>

<h2>Cam kết 3 Không và chính sách bảo hành</h2>
<ul>
<li><strong>Không đục phá tùy tiện:</strong> chỉ đề xuất tháo lắp khi nghi ngờ ống vỡ, lún, sai độ dốc hoặc điểm nghẽn nằm ngoài khả năng thông thường.</li>
<li><strong>Không báo giá ảo:</strong> báo trước theo vị trí tắc, mức bùn mỡ, thời điểm gọi và khối lượng cần xử lý.</li>
<li><strong>Không làm nửa chừng:</strong> xử lý xong phải xả thử, kiểm mùi và nhắc rõ điểm dễ tái phát.</li>
</ul>
<p>Dịch vụ có bảo hành theo tình trạng thực tế, thường từ <strong>6 đến 24 tháng</strong> tùy nguyên nhân và hạng mục. Với ca liên quan hố ga đầy bùn, ống lún hoặc hệ thống cũ, kỹ thuật sẽ nói rõ phần nào bảo hành được và phần nào cần theo dõi thêm.</p>

<h2>Bảng giá tham khảo dịch vụ thông tắc cống Quảng Yên</h2>
<p>Bảng dưới đây chỉ dùng để định hướng. Chi phí cuối cùng phụ thuộc hiện trạng thực tế và được báo trước khi thi công.</p>
<table>
<thead><tr><th>Hạng mục</th><th>Tình huống thường gặp</th><th>Cách tính</th><th>Ghi chú</th></tr></thead>
<tbody>
<tr><td>Thông cống bếp, thoát sàn</td><td>Nước rút chậm, mùi nhẹ, tắc cục bộ</td><td>Theo vị trí và độ dài ống</td><td>Ưu tiên máy lò xo, không đục phá</td></tr>
<tr><td>Xử lý cống nghẹt nặng</td><td>Trào ngược, nhiều điểm cùng chậm</td><td>Theo mức độ nghẹt và thiết bị cần dùng</td><td>Cần xả thử sau xử lý</td></tr>
<tr><td>Nạo vét hố ga</td><td>Hố ga đầy bùn/rác sau mưa</td><td>Theo số hố ga và khối lượng bùn</td><td>Phù hợp nhà sân thấp, nhà xưởng, cửa hàng</td></tr>
<tr><td>Kiểm tra tắc lặp lại</td><td>Tắc lại sau vài ngày hoặc vài tuần</td><td>Theo phạm vi kiểm tra tuyến ống</td><td>Có thể liên quan độ dốc, ống lún/gãy</td></tr>
</tbody>
</table>

<h2>Khu vực phục vụ tại Quảng Yên</h2>
<table>
<thead><tr><th>Khu vực phục vụ</th><th>Thời gian có mặt dự kiến</th><th>Ghi chú thi công</th></tr></thead>
<tbody>
<tr><td>Cộng Hòa, Yên Giang, Hà An</td><td>Điều phối theo tuyến gần nhất</td><td>Ưu tiên nhà dân, cửa hàng, hố ga sân thấp</td></tr>
<tr><td>Minh Thành, Đông Mai, Phong Cốc</td><td>Tùy khung giờ và thời tiết</td><td>Kiểm tra kỹ tuyến thoát sau mưa, bùn cát</td></tr>
<tr><td>Sông Khoai, khu nhà xưởng, khu dân cư lân cận</td><td>Hẹn nhanh theo địa chỉ cụ thể</td><td>Nên gửi ảnh hố ga, miệng thoát trước khi thợ đến</td></tr>
</tbody>
</table>

<h2>Ví dụ tình huống thường gặp tại Quảng Yên</h2>
<p>Một nhà dân khu nền thấp thường thấy nước sân rút chậm sau mưa, hố ga đầy bùn đen và miệng thoát trong bếp có mùi. Nếu chỉ thông ống bếp, nước có thể rút tạm nhưng hố ga vẫn giữ bùn, khiến cống dễ tắc lại.</p>
<p>Phương án phù hợp là kiểm tra cả hố ga ngoài sân, thông đoạn ống nghẹt, nạo vét bùn nếu cần, sau đó xả thử nhiều lần. Đây là tình huống biên tập theo nhóm sự cố thường gặp tại Quảng Yên, không gắn tên khách khi chưa có xác nhận công khai.</p>

${fig3}

<h2>Internal link dịch vụ liên quan</h2>
<p>Nếu cống tắc do bể phốt đầy, xem thêm <a href="${BASE_URL}/hut-be-phot-quang-ninh/">hút bể phốt Quảng Ninh</a>. Nếu bồn cầu rút chậm hoặc trào nước, xem <a href="${BASE_URL}/thong-tac-bon-cau-quang-ninh/">thông tắc bồn cầu Quảng Ninh</a>. Với hố ga đầy bùn sau mưa, tham khảo <a href="${BASE_URL}/nao-vet-ho-ga-quang-ninh/">nạo vét hố ga Quảng Ninh</a>.</p>
<p>Khách ở địa bàn lân cận có thể xem thêm <a href="${BASE_URL}/thong-tac-cong-ha-long/">thông tắc cống Hạ Long</a>, <a href="${BASE_URL}/thong-tac-cong-uong-bi/">thông tắc cống Uông Bí</a> hoặc liên hệ trực tiếp qua <a href="${BASE_URL}/lien-he/">trang liên hệ</a>.</p>

<h2>Thông tin đơn vị và tín hiệu E-E-A-T</h2>
<p><strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong> vận hành nhóm dịch vụ môi trường dân dụng và công trình nhỏ: thông tắc cống, hút bể phốt, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi. Khi tiếp nhận ca Quảng Yên, kỹ thuật hỏi rõ loại công trình, vị trí hố ga, tình trạng nước trào, đường vào nhà và thời điểm có thể thi công.</p>
<p>Quy trình báo giá đi theo hiện trạng, không chốt một mức cứng khi chưa biết nguyên nhân. Nhà dân tắc nhẹ ở miệng thoát khác với hố ga đầy bùn sau mưa; cống bếp cửa hàng ăn uống khác với tuyến thoát sân thấp hoặc nhà xưởng. Khách được nghe phương án trước, đồng ý rồi thợ mới triển khai.</p>
<p>Văn phòng phục vụ khu vực Quảng Yên được ghi nhận trong hồ sơ dự án tại <strong>Số 12B Đường 338, Phường Cộng Hòa, TX. Quảng Yên, Tỉnh Quảng Ninh</strong>. Các tuyến hỗ trợ lân cận gồm Uông Bí và Hạ Long để điều phối khi khách gọi ngoài giờ hoặc cần xử lý gấp.</p>

<h2>Khách nên chuẩn bị gì trước khi thợ đến?</h2>
<ul>
<li>Chụp ảnh miệng thoát, hố ga, khu vực nước trào hoặc vị trí có mùi hôi nặng.</li>
<li>Nói rõ cống tắc ở một điểm hay nhiều điểm, tắc sau mưa hay tắc cả ngày nắng.</li>
<li>Ngừng xả thêm nước nếu nước đang dâng, tránh làm bẩn thêm khu vực sinh hoạt.</li>
<li>Không trộn nhiều loại hóa chất thông cống, nhất là trong nhà vệ sinh kín.</li>
<li>Mở sẵn lối vào hố ga, khu bếp, sân sau hoặc điểm kỹ thuật nếu biết vị trí.</li>
</ul>
<p>Thông tin càng rõ, kỹ thuật càng dễ khoanh vùng: tắc gần miệng thoát, tắc đoạn ống bếp, hố ga đầy bùn hay tuyến chính có vấn đề. Việc này giúp rút ngắn thời gian khảo sát và hạn chế phát sinh không cần thiết.</p>

<h2>Câu hỏi thường gặp về thông tắc cống Quảng Yên</h2>
<h3>Thông tắc cống Quảng Yên bao nhiêu tiền?</h3>
<p>Chi phí phụ thuộc vị trí tắc, độ sâu, chiều dài ống, mức bùn mỡ và việc có cần nạo vét hố ga hay không. Kỹ thuật khảo sát, nói rõ phương án và báo giá trước khi làm.</p>
<h3>Thợ thông tắc cống tại Quảng Yên bao lâu có mặt?</h3>
<p>Đội kỹ thuật điều phối theo tuyến gần nhất. Thời gian thực tế phụ thuộc địa chỉ, khung giờ gọi, thời tiết và tình trạng giao thông tại thời điểm đó.</p>
<h3>Có làm ban đêm, cuối tuần và ngày lễ không?</h3>
<p>Có. Dịch vụ tiếp nhận 05:00-22:00 hằng ngày khi khách cần xử lý cống trào, bốc mùi, nước rút quá chậm hoặc sự cố ảnh hưởng sinh hoạt, kinh doanh.</p>
<h3>Thông cống có phải đục phá nền nhà không?</h3>
<p>Không đục phá tùy tiện. Thợ ưu tiên xử lý qua miệng thoát, hố ga và điểm kỹ thuật sẵn có; chỉ đề xuất tháo lắp khi có căn cứ kỹ thuật rõ ràng.</p>
<h3>Sau khi thông tắc có bảo hành không?</h3>
<p>Có chính sách bảo hành theo tình trạng thực tế, thường từ 6 đến 24 tháng tùy hạng mục và nguyên nhân gây tắc.</p>

<h2>CTA: gửi ảnh hiện trạng để được tư vấn nhanh</h2>
<p>Cống thoát chậm, bốc mùi hoặc trào ngược tại Quảng Yên? Gọi ngay <strong>0963.953.533 / 0931.156.756</strong> trong khung 05:00-22:00 để được tư vấn, báo giá rõ và điều thợ hỗ trợ.</p>
<p>Nếu có thể, hãy gửi trước ảnh miệng thoát, hố ga hoặc khu vực nước trào. Kỹ thuật sẽ đánh giá nhanh hơn, chuẩn bị đúng dụng cụ và hạn chế phát sinh khi đến công trình.</p>
<p class="ttcqn-author-nguyen-song-hao ttcqn-author-byline"><strong>Tác giả:</strong> <a href="https://thongtaccongquangninh.com/author/nguyensonghao/" rel="author">Nguyễn Song Hào</a> · <strong>Cập nhật:</strong> 27/06/2026</p>
${faqSchema()}`;
}

function stripTags(html) {
  return String(html ?? "")
    .replace(/<script\b[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/g, " ");
}

function metrics(html) {
  const text = stripTags(html).replace(/\s+/g, " ").trim();
  const words = text ? text.split(/\s+/).filter((w) => w.length > 1).length : 0;
  const h1Count = (String(html).match(/<h1\b/giu) ?? []).length;
  const h2Count = (String(html).match(/<h2\b/giu) ?? []).length;
  const tableCount = (String(html).match(/<table\b/giu) ?? []).length;
  const figureCount = (String(html).match(/<figure\b/giu) ?? []).length;
  const faqSchemaCount = (String(html).match(/"@type":"FAQPage"|"@type"\s*:\s*"FAQPage"/giu) ?? []).length;
  const repeatedCaptionCount = (String(html).match(/Thợ dùng máy lò xo thông cống cho dịch vụ thông tắc cống tại Quảng Yên/g) ?? []).length;
  const links = [
    "/hut-be-phot-quang-ninh/",
    "/thong-tac-bon-cau-quang-ninh/",
    "/nao-vet-ho-ga-quang-ninh/",
    "/thong-tac-cong-ha-long/",
    "/thong-tac-cong-uong-bi/",
    "/lien-he/",
  ].filter((href) => String(html).includes(href));
  return {
    words,
    h1Count,
    h2Count,
    tableCount,
    figureCount,
    faqSchemaCount,
    repeatedCaptionCount,
    internalLinks: links.length,
    hasHotline: text.includes("0963.953.533") && text.includes("0931.156.756"),
    hasForbiddenClaims: /giảm 30%|chi nhánh trực thuộc tại tất cả|Ch��ng|địa hình đầm lầy|trang trại chăn nuôi thủy sản/iu.test(text),
    stale247Count: (text.match(/24\/7/gu) ?? []).length,
  };
}

async function liveCheck() {
  const res = await fetch(`${URL}?nowprocket=1&codex=qy-rewrite-${Date.now()}`);
  const html = await res.text();
  const body = metrics(html);
  return {
    status: res.status,
    h1Count: (html.match(/<h1\b/giu) ?? []).length,
    canonicalOk: html.includes(`<link rel="canonical" href="${URL}"`),
    noindex: /<meta[^>]+name=["']robots["'][^>]+noindex/iu.test(html),
    titleOk: html.includes(NEW_TITLE),
    descOk: html.includes(NEW_DESC),
    body,
  };
}

async function main() {
  const { auth, envPath } = readEnv();
  const beforeRes = await wpRequest("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`, auth);
  const before = beforeRes.data;
  const beforeContent = before.content?.raw ?? before.content?.rendered ?? "";
  const afterContent = buildContent(beforeContent);
  const beforeMetrics = metrics(beforeContent);
  const afterMetrics = metrics(afterContent);
  const report = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? "apply" : "dry-run",
    envPath,
    url: URL,
    backupDir: APPLY ? BACKUP_DIR : null,
    beforeMetrics,
    afterMetrics,
    gates: {
      noRawH1: afterMetrics.h1Count === 0,
      enoughWords: afterMetrics.words >= 1800 && afterMetrics.words <= 2400,
      hasTables: afterMetrics.tableCount >= 2,
      hasFigures: afterMetrics.figureCount >= 3,
      hasFaqSchema: afterMetrics.faqSchemaCount === 1,
      hasInternalLinks: afterMetrics.internalLinks >= 6,
      noRepeatedCaption: afterMetrics.repeatedCaptionCount === 0,
      noForbiddenClaims: !afterMetrics.hasForbiddenClaims,
      noStale247: afterMetrics.stale247Count === 0,
    },
  };
  report.okBeforeApply = Object.values(report.gates).every(Boolean);
  if (APPLY) {
    if (!report.okBeforeApply) {
      throw new Error(`Pre-apply gate failed: ${JSON.stringify(report.gates)}`);
    }
    mkdirSync(BACKUP_DIR, { recursive: true });
    writeFileSync(path.join(BACKUP_DIR, `pages-${PAGE_ID}-${SLUG}.json`), JSON.stringify(before, null, 2), "utf8");
    const updateRes = await wpRequest("POST", `/wp/v2/pages/${PAGE_ID}`, auth, {
      title: NEW_TITLE,
      excerpt: NEW_DESC,
      content: afterContent,
      status: "publish",
    });
    const rankMathRes = await wpRequest("POST", "/rankmath/v1/updateMeta", auth, {
      objectType: "post",
      objectID: PAGE_ID,
      meta: {
        rank_math_title: NEW_TITLE,
        rank_math_description: NEW_DESC,
        rank_math_focus_keyword: FOCUS_KEYWORD,
      },
    });
    report.update = { status: updateRes.status, id: updateRes.data?.id, link: updateRes.data?.link };
    report.rankMath = { status: rankMathRes.status, data: rankMathRes.data };
    report.live = await liveCheck();
    report.okAfterApply =
      report.live.status === 200 &&
      report.live.h1Count === 1 &&
      report.live.canonicalOk &&
      !report.live.noindex &&
      report.live.titleOk &&
      report.live.descOk &&
      report.live.body.tableCount >= 2 &&
      report.live.body.internalLinks >= 6 &&
      !report.live.body.hasForbiddenClaims;
  }
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ reportPath: REPORT_PATH, ok: APPLY ? report.okAfterApply : report.okBeforeApply, gates: report.gates, live: report.live ?? null }, null, 2));
  if (APPLY ? !report.okAfterApply : !report.okBeforeApply) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
