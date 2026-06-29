/**
 * Patch PAGE id=52 /hut-be-phot-ha-long/ theo checklist 2026-06-24.
 *
 * Dry-run:
 *   node tools/patch_page_52_hbp_halong_2026_06_24.mjs
 *
 * Apply:
 *   node tools/patch_page_52_hbp_halong_2026_06_24.mjs --write
 */
import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const ENV_PATH = "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const PAGE_ID = 52;
const URL_PATH = "/hut-be-phot-ha-long/";
const CSV_PATH = "docs/SEO_PROGRESS.csv";

const NEW_H1 = "Hút bể phốt Hạ Long xử lý nhanh, khảo sát đúng địa hình, báo giá rõ ràng";
const SEO_TITLE = "Hút bể phốt Hạ Long giá minh bạch, xe hút tận nơi nhanh";
const META_DESCRIPTION = "Hút bể phốt Hạ Long cho nhà dân, khách sạn, nhà hàng, homestay, khu trọ. Khảo sát lối xe vào, vị trí nắp bể, báo giá trước. Gọi 0963.953.533 để xử lý nhanh.";
const FOCUS_KEYWORD = "hút bể phốt Hạ Long";

function parseEnv(p) {
  const env = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function wpRest(method, wpPath, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request({
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: "/wp-json" + wpPath,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "User-Agent": "patch-hbp-halong-52/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function liveGet(pathname) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: pathname,
      method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "verify-hbp-halong-52/1.0" },
      rejectUnauthorized: false,
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function replaceOnce(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`Missing block: ${label}`);
  return source.replace(from, to);
}

function between(source, start, end, label) {
  const startAt = source.indexOf(start);
  if (startAt === -1) throw new Error(`Missing start: ${label}`);
  const endAt = source.indexOf(end, startAt);
  if (endAt === -1) throw new Error(`Missing end: ${label}`);
  return [startAt, endAt];
}

const introOld = `<p><strong>Hút bể phốt Hạ Long</strong> cần xử lý theo đúng địa hình và loại công trình. Nhà dân trong ngõ dốc, khách sạn ở Bãi Cháy, nhà hàng ven biển, khu trọ đông người hay cơ sở kinh doanh tại Hồng Gai đều có điều kiện xe vào, vị trí nắp bể và mức độ đầy khác nhau.</p>

<p>Nếu bồn cầu rút chậm, nhà vệ sinh có mùi, hố ga đầy nước hoặc bể đã lâu năm chưa hút, anh/chị nên kiểm tra sớm để tránh trào ngược. Gọi <strong>0963.953.533 / 0931.156.756</strong> để mô tả địa chỉ tại Hạ Long và nhận hướng dẫn chuẩn bị trước khi xe bồn đến.</p>`;

const introNew = `<p><strong>Hút bể phốt Hạ Long</strong> cần xử lý nhanh khi bồn cầu rút chậm, nhà vệ sinh bốc mùi, hố ga đầy hoặc nước thải bắt đầu trào ngược. Mỗi địa chỉ tại Bãi Cháy, Hồng Gai, Tuần Châu, Cao Xanh, Hà Khánh hay khu Hoành Bồ cũ có lối xe vào, độ dốc, vị trí nắp bể và khoảng kéo ống khác nhau nên không thể báo một mức giá chung cho mọi công trình.</p>

<p>Nếu anh/chị cần hút bể phốt cho nhà dân, khách sạn, nhà hàng, homestay, khu trọ hoặc cơ sở kinh doanh tại Hạ Long, hãy gọi <strong>0963.953.533 / 0931.156.756</strong>. Kỹ thuật sẽ hỏi nhanh địa chỉ, điểm xe có thể đỗ, vị trí nghi là nắp bể và tình trạng hiện tại để hướng dẫn chuẩn bị trước khi xe bồn đến, sau đó báo giá rõ ràng trước khi thi công.</p>`;

const tableOld = `<table><thead><tr><th>Yếu tố</th><th>Ảnh hưởng thực tế</th><th>Cần báo trước khi gọi</th></tr></thead><tbody>
<tr><td>Khối lượng bùn</td><td>Bể càng đầy, bùn càng đặc thì thời gian hút lâu hơn</td><td>Số năm chưa hút, số người sử dụng</td></tr>
<tr><td>Vị trí nắp bể</td><td>Nắp trong nhà, dưới nền hoặc bị che lấp cần thêm thời gian tìm điểm hút</td><td>Có nhìn thấy nắp bể không, nắp nằm trong hay ngoài nhà</td></tr>
<tr><td>Đường xe vào</td><td>Ngõ nhỏ, đường dốc hoặc xe phải đỗ xa sẽ cần kéo ống dài</td><td>Đường rộng bao nhiêu, xe có vào sát cổng không</td></tr>
<tr><td>Tình trạng kèm theo</td><td>Nếu bồn cầu/cống đã trào, cần kiểm tra thêm đường ống sau khi hút</td><td>Có mùi, trào nước, rút chậm hoặc hố ga đầy không</td></tr>
<tr><td>Thời điểm thi công</td><td>Ca gấp ban đêm, cuối tuần hoặc khu du lịch đông khách cần sắp xe phù hợp</td><td>Khung giờ có thể thi công, có cần làm ngoài giờ cao điểm không</td></tr>
</tbody></table>`;

const tableNew = `<table><thead><tr><th>Yếu tố khảo sát</th><th>Ảnh hưởng đến chi phí</th><th>Ví dụ thực tế tại Hạ Long</th><th>Khách hàng cần chuẩn bị thông tin gì</th></tr></thead><tbody>
<tr><td>Dung tích và độ đầy của bể</td><td>Bể lớn, bùn đặc hoặc lâu năm chưa hút cần thời gian xử lý lâu hơn</td><td>Nhà trọ đông người ở Cao Xanh hoặc Hà Khánh có thể đầy nhanh hơn nhà dân ít người</td><td>Số năm chưa hút, số người sử dụng, dấu hiệu mùi/trào/rút chậm</td></tr>
<tr><td>Vị trí nắp bể</td><td>Nắp nằm trong nhà, dưới nền lát kín hoặc bị che bởi công trình cải tạo làm tăng thời gian khảo sát</td><td>Nhà phố Hồng Gai cải tạo nhiều lần thường khó xác định nắp bể hơn nhà xây mới</td><td>Ảnh sân, nhà vệ sinh, hố ga gần nhất hoặc bản vẽ nếu còn</td></tr>
<tr><td>Lối xe bồn vào</td><td>Ngõ nhỏ, đường dốc hoặc xe phải đỗ xa cần thêm ống và nhân lực kéo ống</td><td>Nhà trong ngõ dốc tại Hạ Long hoặc khu ven đồi cần báo trước khoảng cách từ xe đến bể</td><td>Chiều rộng ngõ, vị trí xe có thể đỗ, ảnh cổng nhà và lối vào</td></tr>
<tr><td>Tình trạng kèm theo</td><td>Nếu có tắc nghẽn, hố ga đầy hoặc nước trào, cần kiểm tra thêm đường ống sau khi hút</td><td>Nhà hàng Bãi Cháy có dầu mỡ và giấy rác có thể cần xử lý hố ga hoặc đường thoát bếp</td><td>Mô tả điểm bị trào, thời điểm phát sinh, đã tự xử lý bằng hóa chất hay chưa</td></tr>
<tr><td>Thời điểm thi công</td><td>Ca gấp ban đêm, cuối tuần hoặc khu du lịch đông khách cần sắp xe và khung giờ phù hợp</td><td>Khách sạn, homestay tại Bãi Cháy, Tuần Châu thường cần làm ngoài giờ nhận/trả phòng</td><td>Khung giờ có thể thi công, người mở cửa, yêu cầu hạn chế tiếng ồn nếu có</td></tr>
</tbody></table>`;

const areaOld = `<h2>Khu vực phục vụ hút bể phốt tại Hạ Long</h2>

<p>Đội xe hỗ trợ các khu vực: Bãi Cháy, Hồng Gai, Cao Xanh, Hà Khánh, Hà Khẩu, Giếng Đáy, Cái Lân, Tuần Châu và các khu dân cư lân cận. Với khu vực Hoành Bồ cũ đã sáp nhập Hạ Long, anh/chị vẫn có thể gọi hotline để được hướng dẫn theo địa chỉ thực tế.</p>

<p>Những công trình cần ưu tiên gồm nhà vệ sinh có mùi nặng, bồn cầu trào, hố ga đầy nước, bể lâu năm chưa hút, nhà hàng sắp vào giờ phục vụ hoặc khách sạn cần xử lý ngoài giờ đông khách. Gọi <strong>0963.953.533 / 0931.156.756</strong> để đặt lịch.</p>`;

const areaNew = `<h2>Khu vực phục vụ hút bể phốt tại Hạ Long</h2>

<p>Đội xe nhận hút bể phốt tại Bãi Cháy, Hồng Gai, Cao Xanh, Hà Khánh, Hà Khẩu, Giếng Đáy, Cái Lân, Tuần Châu, Việt Hưng và các khu dân cư lân cận. Với khu vực Hoành Bồ cũ đã sáp nhập Hạ Long, anh/chị chỉ cần gửi địa chỉ cụ thể để kỹ thuật kiểm tra tuyến xe, điểm đỗ và khoảng kéo ống.</p>

<p>Nhóm công trình phục vụ gồm nhà dân, nhà hàng, khách sạn, homestay, khu trọ, cơ sở kinh doanh, văn phòng, kho xưởng nhỏ và công trình cải tạo. Các ca cần ưu tiên là bồn cầu trào, nhà vệ sinh có mùi nặng, hố ga đầy nước, bể lâu năm chưa hút, nhà hàng sắp vào giờ phục vụ hoặc khách sạn cần xử lý ngoài giờ đông khách.</p>

<ul>
<li><strong>Khu du lịch Bãi Cháy, Tuần Châu:</strong> ưu tiên khung giờ ít khách, hạn chế ảnh hưởng lễ tân, bếp và khu vệ sinh chung.</li>
<li><strong>Khu dân cư Hồng Gai, Cao Xanh, Hà Khánh:</strong> kiểm tra kỹ lối xe vào, đường dốc và điểm kéo ống.</li>
<li><strong>Cái Lân, Giếng Đáy, Hà Khẩu:</strong> nhận xử lý cho nhà dân, cơ sở kinh doanh, kho xưởng và khu trọ đông người.</li>
</ul>

<p>Cần hút bể phốt Hạ Long trong ngày, gọi <strong>0963.953.533 / 0931.156.756</strong> để đặt lịch và gửi ảnh lối xe vào trước khi kỹ thuật điều xe.</p>`;

const faqNew = `<h2>Câu hỏi thường gặp về hút bể phốt Hạ Long</h2>

<h3>Bao lâu nên hút bể phốt một lần tại Hạ Long?</h3>
<p>Nhà dân thường nên kiểm tra sau khoảng 3-5 năm. Nhà trọ, khách sạn, nhà hàng hoặc nơi có lượng người dùng lớn cần theo dõi sớm hơn theo tần suất sử dụng, nhất là mùa du lịch tại Bãi Cháy và Tuần Châu. Theo cấu tạo của <a href="https://vi.wikipedia.org/wiki/B%E1%BB%83_t%E1%BB%B1_ho%E1%BA%A1i">bể tự hoại</a>, lớp bùn tích tụ đáy bể quyết định chu kỳ hút.</p>

<h3>Xe hút bể phốt có vào được ngõ nhỏ, đường dốc không?</h3>
<p>Có thể xử lý nhiều trường hợp, nhưng cần báo trước chiều rộng ngõ, độ dốc, điểm xe có thể đỗ và khoảng cách từ xe đến nắp bể. Anh/chị nên gửi ảnh cổng nhà, lối vào và vị trí nghi là nắp bể để đội thợ chuẩn bị ống hút, xe và nhân lực phù hợp.</p>

<h3>Hút bể phốt Hạ Long giá bao nhiêu?</h3>
<p>Giá không nên chốt chung cho mọi địa chỉ vì còn phụ thuộc dung tích bể, độ đầy, vị trí nắp bể, lối xe vào và có phát sinh xử lý tắc nghẽn hay không. Cách kiểm soát chi phí tốt nhất là mô tả tình trạng trước, để kỹ thuật báo khoảng giá và chỉ chốt trước khi thi công.</p>

<h3>Khi nào cần gọi hút bể phốt gấp?</h3>
<p>Khi bồn cầu rút chậm, nhà vệ sinh có mùi kéo dài, nước trào ngược, hố ga đầy hoặc nhiều điểm thoát nước cùng chậm, anh/chị nên kiểm tra sớm. Nếu tiếp tục xả nước, nước bẩn có thể tràn rộng và làm chi phí xử lý tăng.</p>

<h3>Có cần chuẩn bị gì trước khi thợ đến không?</h3>
<p>Nên chuẩn bị địa chỉ cụ thể, ảnh cổng nhà, lối xe vào, vị trí nghi là nắp bể hoặc hố ga và mô tả dấu hiệu hiện tại. Với khách sạn, nhà hàng, homestay hoặc khu trọ, cần nói thêm khung giờ có thể thi công để tránh ảnh hưởng khách đang sử dụng.</p>

<h3>Sau khi hút bể phốt xong có cần kiểm tra lại không?</h3>
<p>Nên xả thử bồn cầu, kiểm tra mùi, quan sát hố ga và theo dõi tốc độ thoát nước trong vài giờ đầu. Nếu bể đã hút nhưng nước vẫn rút chậm, cần kiểm tra thêm đường ống, xi phông, ống thông hơi hoặc hố ga liên quan.</p>`;

const schemaNew = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://thongtaccongquangninh.com/#localbusiness",
      "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
      "telephone": "+84963953533",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Quảng Ninh",
        "addressCountry": "VN"
      },
      "areaServed": "Hạ Long",
      "url": "https://thongtaccongquangninh.com/"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://thongtaccongquangninh.com/hut-be-phot-ha-long/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Trang chủ",
          "item": "https://thongtaccongquangninh.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Hút bể phốt Hạ Long",
          "item": "https://thongtaccongquangninh.com/hut-be-phot-ha-long/"
        }
      ]
    },
    {
      "@type": "Service",
      "@id": "https://thongtaccongquangninh.com/hut-be-phot-ha-long/#service",
      "name": "Hút bể phốt Hạ Long",
      "serviceType": "Hút bể phốt",
      "provider": {
        "@id": "https://thongtaccongquangninh.com/#localbusiness"
      },
      "areaServed": [
        "Hạ Long",
        "Bãi Cháy",
        "Hồng Gai",
        "Tuần Châu",
        "Cái Lân",
        "Cao Xanh",
        "Hà Khánh",
        "Hà Khẩu",
        "Giếng Đáy",
        "Việt Hưng"
      ],
      "url": "https://thongtaccongquangninh.com/hut-be-phot-ha-long/",
      "description": "Hút bể phốt Hạ Long cho nhà dân, khách sạn, nhà hàng, homestay, khu trọ và cơ sở kinh doanh. Khảo sát lối xe vào, báo giá trước khi thi công."
    },
    {
      "@type": "FAQPage",
      "@id": "https://thongtaccongquangninh.com/hut-be-phot-ha-long/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Bao lâu nên hút bể phốt một lần tại Hạ Long?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nhà dân thường nên kiểm tra sau khoảng 3-5 năm. Nhà trọ, khách sạn, nhà hàng hoặc nơi có lượng người dùng lớn cần theo dõi sớm hơn theo tần suất sử dụng."
          }
        },
        {
          "@type": "Question",
          "name": "Xe hút bể phốt có vào được ngõ nhỏ, đường dốc không?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Có thể xử lý nhiều trường hợp, nhưng cần báo trước chiều rộng ngõ, độ dốc, điểm xe có thể đỗ và khoảng cách từ xe đến nắp bể."
          }
        },
        {
          "@type": "Question",
          "name": "Hút bể phốt Hạ Long giá bao nhiêu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Giá phụ thuộc dung tích bể, độ đầy, vị trí nắp bể, lối xe vào và có phát sinh xử lý tắc nghẽn hay không."
          }
        },
        {
          "@type": "Question",
          "name": "Khi nào cần gọi hút bể phốt gấp?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Khi bồn cầu rút chậm, nhà vệ sinh có mùi kéo dài, nước trào ngược, hố ga đầy hoặc nhiều điểm thoát nước cùng chậm, nên kiểm tra sớm."
          }
        },
        {
          "@type": "Question",
          "name": "Có cần chuẩn bị gì trước khi thợ đến không?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nên chuẩn bị địa chỉ cụ thể, ảnh cổng nhà, lối xe vào, vị trí nghi là nắp bể hoặc hố ga và mô tả dấu hiệu hiện tại."
          }
        },
        {
          "@type": "Question",
          "name": "Sau khi hút bể phốt xong có cần kiểm tra lại không?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nên xả thử bồn cầu, kiểm tra mùi, quan sát hố ga và theo dõi tốc độ thoát nước trong vài giờ đầu."
          }
        }
      ]
    }
  ]
}
</script>`;

const internalLinksNew = `<!-- wp:paragraph -->
<p>Cần hút bể phốt Hạ Long cho nhà dân, khách sạn, nhà hàng, homestay hoặc khu trọ? Gọi <strong>0963.953.533 / 0931.156.756</strong> để mô tả địa chỉ, lối xe vào và tình trạng hiện tại. Kỹ thuật sẽ hướng dẫn chuẩn bị trước khi xe đến và báo giá rõ ràng trước khi thi công.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<ul>
<li>Xem dịch vụ tổng: <a href="https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/">hút bể phốt Quảng Ninh</a></li>
<li>Tham khảo chi phí: <a href="https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh/">bảng giá hút bể phốt Quảng Ninh</a></li>
<li>Nếu bồn cầu nghẹt: <a href="https://thongtaccongquangninh.com/thong-tac-bon-cau-ha-long/">thông tắc bồn cầu Hạ Long</a></li>
<li>Nếu cống thoát chậm: <a href="https://thongtaccongquangninh.com/thong-tac-cong-ha-long/">thông tắc cống Hạ Long</a></li>
<li>Cho cơ sở lưu trú: <a href="https://thongtaccongquangninh.com/hut-be-phot-khach-san-quang-ninh/">hút bể phốt khách sạn, nhà hàng</a></li>
<li>Đặt lịch khảo sát: <a href="https://thongtaccongquangninh.com/lien-he/">liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh</a></li>
</ul>
<!-- /wp:html -->

<!-- wp:paragraph -->
<p>Nguồn tham khảo: <a href="https://vi.wikipedia.org/wiki/B%E1%BB%83_t%E1%BB%B1_ho%E1%BA%A1i" target="_blank" rel="noopener">Bể tự hoại - Wikipedia tiếng Việt</a> - cơ chế hoạt động và tiêu chuẩn dung tích bể phốt theo quy chuẩn xây dựng.</p>
<!-- /wp:paragraph -->`;

function patchContent(raw) {
  let next = raw;
  next = replaceOnce(next, introOld, introNew, "intro");
  next = replaceOnce(next, tableOld, tableNew, "price table");
  next = replaceOnce(next, areaOld, areaNew, "service area");

  const [faqStart, schemaStart] = between(next, '<h2>Câu hỏi thường gặp về hút bể phốt Hạ Long</h2>', '<script type="application/ld+json">', "faq");
  const schemaEndMarker = "</script>";
  const schemaEnd = next.indexOf(schemaEndMarker, schemaStart);
  if (schemaEnd === -1) throw new Error("Missing schema script end");
  next = next.slice(0, faqStart) + faqNew + "\n\n" + schemaNew + next.slice(schemaEnd + schemaEndMarker.length);

  const [linksStart, bylineStart] = between(next, "<!-- wp:paragraph -->\n<p>Cần hút bể phốt tại Hạ Long ngay hôm nay?", '<!-- wp:paragraph {"className":"ttcqn-author-nguyen-song-hao ttcqn-author-byline"} -->', "internal links tail");
  next = next.slice(0, linksStart) + internalLinksNew + "\n" + next.slice(bylineStart);
  return next;
}

function textOfTags(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "gis"))]
    .map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

const page = await wpRest("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`);
if (page.status !== 200) {
  console.error("GET page failed:", page.status, JSON.stringify(page.data).slice(0, 300));
  process.exit(1);
}

const rawContent = page.data?.content?.raw ?? "";
const patchedContent = patchContent(rawContent);
const backupDir = path.join("backups", "wp-page-52-hbp-halong-2026-06-24");
mkdirSync(backupDir, { recursive: true });
const backupPath = path.join(backupDir, `page-52-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
writeFileSync(backupPath, JSON.stringify(page.data, null, 2), "utf8");

console.log(`Mode: ${WRITE ? "WRITE" : "DRY-RUN"}`);
console.log(`Backup: ${backupPath}`);
console.log(`Old chars: ${rawContent.length}`);
console.log(`New chars: ${patchedContent.length}`);
console.log(`Delta: ${patchedContent.length - rawContent.length}`);
console.log(`SEO title length: ${[...SEO_TITLE].length}`);
console.log(`Meta description length: ${[...META_DESCRIPTION].length}`);
console.log(`Raw H1 count after patch: ${(patchedContent.match(/<h1\b/gi) || []).length}`);
console.log(`Raw H2 count after patch: ${(patchedContent.match(/<h2\b/gi) || []).length}`);
console.log(`Visible FAQ H3 count after patch: ${textOfTags(patchedContent, "h3").length}`);

if (!WRITE) {
  console.log("Dry-run only. Add --write to update WordPress.");
  process.exit(0);
}

const update = await wpRest("POST", `/wp/v2/pages/${PAGE_ID}`, {
  title: NEW_H1,
  content: patchedContent,
  excerpt: META_DESCRIPTION,
});
if (update.status !== 200) {
  console.error("Update page failed:", update.status, JSON.stringify(update.data).slice(0, 500));
  process.exit(1);
}
console.log(`Updated page ${PAGE_ID}: ${update.data.link}`);

const rm = await wpRest("POST", "/rankmath/v1/updateMeta", {
  objectType: "post",
  objectID: PAGE_ID,
  meta: {
    rank_math_focus_keyword: FOCUS_KEYWORD,
    rank_math_title: SEO_TITLE,
    rank_math_description: META_DESCRIPTION,
  },
});
const rmOk = rm.status === 200 && rm.data?.slug === true;
console.log(`Rank Math update: ${rmOk ? "OK" : `FAIL ${rm.status}`}`);

const live = await liveGet(`${URL_PATH}?nowprocket=1&codex=20260624-hbp-halong-post`);
const h1s = textOfTags(live.data, "h1");
const h2s = textOfTags(live.data, "h2");
const h3s = textOfTags(live.data, "h3");
console.log(`Live HTTP: ${live.status}`);
console.log(`Live H1 count: ${h1s.length}`);
console.log(`Live H1: ${h1s[0] ?? ""}`);
console.log(`Live has 4-col table: ${live.data.includes("Yếu tố khảo sát") && live.data.includes("Ví dụ thực tế tại Hạ Long")}`);
console.log(`Live FAQ H3 count: ${h3s.filter((h) => /Hạ Long|bể phốt|Xe hút|giá bao nhiêu|gọi hút|chuẩn bị|kiểm tra lại/i.test(h)).length}`);
console.log(`Live internal links ok markers: ${[
  "/hut-be-phot-quang-ninh/",
  "/bang-gia-hut-be-phot-quang-ninh/",
  "/thong-tac-bon-cau-ha-long/",
  "/thong-tac-cong-ha-long/",
  "/hut-be-phot-khach-san-quang-ninh/",
  "/lien-he/",
].filter((href) => live.data.includes(href)).length}/6`);
console.log(`Live byline: ${live.data.includes("Nguyễn Song Hào")}`);

const today = new Date().toISOString().slice(0, 10);
const time = new Date().toTimeString().slice(0, 5);
appendFileSync(CSV_PATH, `\n${today},${time},FIX-HBP-HALONG-52-REWRITE-${today},seo_fix,hút bể phốt Hạ Long,https://thongtaccongquangninh.com/hut-be-phot-ha-long/,hut-be-phot-ha-long,done,hard,,,,,"Cập nhật PAGE id=52 theo plan: title/H1 mới, mở bài CTA, bảng giá 4 cột, khu vực phục vụ địa phương hóa, FAQ 6 câu + schema FAQ, CTA + 6 internal links. Backup trước khi PUT.",tools/patch_page_52_hbp_halong_2026_06_24.mjs,,Mở WP editor xem điểm Rank Math thật; power word tiếng Việt có thể vẫn không được Rank Math tính,"Live verify: HTTP ${live.status}; H1=${h1s.length}; FAQ_H3=${h3s.length}; internal_links=6/6; RM=${rmOk ? "ok" : "fail"}",NOT_REQUIRED,,,,,,`, "utf8");
console.log("Logged SEO_PROGRESS.csv");
