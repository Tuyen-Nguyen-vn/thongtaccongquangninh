import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "/mnt/d/.thongtaccongquangninh";
const POST_ID = 2054;
const SLUG = "thong-tac-cong-bai-chay";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const WRITE = process.argv.includes("--write");
const ENV_CANDIDATES = [
  `${PROJECT}/.env`,
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
];

const SEO_TITLE = "Thông Tắc Cống Bãi Cháy Hạ Long - Không Đục Phá, Xử Lý Nhanh";
const META_DESCRIPTION =
  "Thông tắc cống Bãi Cháy Hạ Long, xử lý nhanh cho nhà dân, khách sạn, nhà hàng. Báo giá trước, không đục phá. Gọi 0963.953.533.";
const H1 = "Dịch vụ thông tắc cống Bãi Cháy Hạ Long - không đục phá, xử lý nhanh";
const FOCUS_KEYWORD = "thông tắc cống Bãi Cháy";
const MAP_QUERY_URL =
  "https://www.google.com/maps?q=111%20C%C3%A1i%20L%C3%A2n%2C%20B%C3%A3i%20Ch%C3%A1y%2C%20H%E1%BA%A1%20Long%2C%20Qu%E1%BA%A3ng%20Ninh";

const REVIEW_LINKS = [
  "https://maps.app.goo.gl/syQkhASKmXui6fLg8",
  "https://maps.app.goo.gl/WHknRq8zuQRN9WVHA",
  "https://maps.app.goo.gl/adBoLtiKyovbTmjR6",
  "https://maps.app.goo.gl/c1UBr8scEgFCP8GcA",
  "https://maps.app.goo.gl/WqD1aXqU9q8W4iWg7",
  "https://maps.app.goo.gl/qtgYShGay44jPcXU8",
  "https://maps.app.goo.gl/KaGq11dnhQyDDSTe9",
  "https://maps.app.goo.gl/tHs8w9gyEA5WkBTU7",
  "https://maps.app.goo.gl/muQmwqb4U82ZhSrk7",
];

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function parseEnv() {
  let text = "";
  let pathUsed = "";
  for (const candidate of ENV_CANDIDATES) {
    try {
      text = readFileSync(candidate, "utf8");
      pathUsed = candidate;
      break;
    } catch {}
  }
  if (!text) throw new Error("Không tìm thấy .env WordPress auth");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) {
    throw new Error(`Thiếu WP_USERNAME/WP_APP_PASSWORD trong ${pathUsed}`);
  }
  return {
    pathUsed,
    auth: `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`,
  };
}

function wpRequest(method, wpPath, auth, body = null) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path: `/wp-json${wpPath}`,
        method,
        headers: {
          Host: WP_HOST,
          Authorization: auth,
          "User-Agent": "codex-bai-chay-verified/1.0",
          ...(bodyBuf
            ? {
                "Content-Type": "application/json",
                "Content-Length": bodyBuf.length,
              }
            : {}),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function publicGet(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path,
        method: "GET",
        headers: { Host: WP_HOST, "User-Agent": "codex-bai-chay-verify/1.0" },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => resolve({ status: res.statusCode, data }));
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function replaceSection(raw, anchorText, replacement) {
  const pattern = new RegExp(
    `(<h2[^>]*>[\\s\\S]*?${anchorText}[\\s\\S]*?<\\/h2>[\\s\\S]*?)(?=<h2[^>]*>|$)`,
    "i",
  );
  if (!pattern.test(raw)) throw new Error(`Không tìm thấy section: ${anchorText}`);
  return raw.replace(pattern, `${replacement}\n`);
}

function getFaqItems(raw) {
  let start = -1;
  for (const match of raw.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>/gi)) {
    if (/Câu hỏi thường gặp|FAQ/i.test(stripTags(match[0]))) {
      start = match.index ?? -1;
      break;
    }
  }
  if (start < 0) return [];
  const rest = raw.slice(start);
  const next = rest.slice(1).search(/<h2[^>]*>/i);
  const section = rest.slice(0, next > -1 ? next + 1 : rest.length);
  const items = [];
  for (const match of section.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi)) {
    const q = stripTags(match[1]).replace(/^Q:\s*/i, "");
    const a = stripTags(match[2]).replace(/^A:\s*/i, "");
    if (q && a) items.push({ q, a });
  }
  return items;
}

function buildReviewList() {
  return REVIEW_LINKS.map(
    (url, index) => `<li><a href="${url}" rel="nofollow sponsored noopener" target="_blank">Đánh giá Google Maps ${index + 1}</a></li>`,
  ).join("\n");
}

const FAQ_ITEMS = [
  {
    q: "Bao lâu thợ có mặt tại Bãi Cháy sau khi gọi?",
    a: "Sau khi tiếp nhận yêu cầu qua điện thoại, đội kỹ thuật sẽ hỏi nhanh vị trí và tình trạng tắc để báo thời gian đến dự kiến. Các điểm gần trung tâm Bãi Cháy, Cái Dăm, Vườn Đào thường được ưu tiên điều thợ gần nhất, thời gian thực tế phụ thuộc giao thông và ca đang xử lý.",
  },
  {
    q: "Có thông tắc cống Bãi Cháy ban đêm không và giá có tăng không?",
    a: "Khung giờ hoạt động đã xác minh của đơn vị là 05:00 - 22:00 hằng ngày. Nếu phát sinh sự cố sát giờ đóng hoặc ngoài khung giờ này, khách nên gọi trực tiếp hotline để được xác nhận khả năng điều phối và thời gian hỗ trợ thực tế.",
  },
  {
    q: "Thông tắc cống có bắt buộc phải đục phá nền nhà hoặc tháo dỡ bồn cầu không?",
    a: "Không. Với công nghệ máy lò xo thép xoắn cơ học thế hệ mới, thợ của chúng tôi sẽ xử lý thông nghẹt trực tiếp qua phễu thoát sàn hoặc nắp hố ga kỹ thuật. Việc đục gạch sàn chỉ là giải pháp cuối cùng khi đường ống chính bị gãy, sụt lún nghiêm trọng và sẽ được bàn bạc kỹ với khách hàng trước khi làm.",
  },
  {
    q: "Giá thông tắc cống Bãi Cháy được tính như thế nào?",
    a: "Đơn giá phụ thuộc vào vị trí tắc nghẽn, mức độ nặng nhẹ, chiều dài đường ống cần thông và loại máy móc sử dụng. Kỹ thuật viên sẽ khảo sát thực tế và báo giá trọn gói trước khi làm.",
  },
  {
    q: "Sau khi thông cống xong có được bảo hành không?",
    a: "Có. Thời gian bảo hành phụ thuộc nguyên nhân tắc, tình trạng đường ống và hạng mục đã xử lý. Kỹ thuật viên sẽ ghi rõ điều kiện bảo hành sau khi khảo sát, tránh hứa quá mức khi đường ống đã gãy, lún hoặc sai độ dốc.",
  },
  {
    q: "Khi nào cần kết hợp hút bể phốt thay vì chỉ thông cống thông thường?",
    a: "Khi nước thải từ bồn cầu trào ngược lên thoát sàn ở nhiều nhà vệ sinh cùng lúc, bốc mùi hôi thối nặng nề khắp nhà dù đã thông cống, hoặc hố ga thoát nước chính bị ngập đen ngòm. Lúc này, kỹ thuật viên sẽ kiểm tra bể chứa và tư vấn phương án hút bể phốt để xử lý triệt để tận gốc.",
  },
];

function buildVerifiedIntroBlock() {
  return `<h2><a id="ve-don-vi"></a>Về đơn vị phụ trách thông tắc cống tại Bãi Cháy</h2>
<p><strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong> là đơn vị vận hành dịch vụ hút bể phốt, thông tắc cống, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh. Theo dữ liệu đã được Tuyền xác minh cho trang này, đơn vị bắt đầu hoạt động từ <strong>2014</strong>, đã xử lý hơn <strong>20.000+</strong> ca dịch vụ và phục vụ trên <strong>32.000+</strong> khách hàng tại Quảng Ninh và khu vực lân cận.</p>
<p><strong>Trụ sở chính:</strong> 111 Cái Lân, Bãi Cháy, Quảng Ninh<br>
<strong>Giờ hoạt động xác minh:</strong> 05:00 - 22:00 hằng ngày<br>
<strong>Hotline:</strong> <strong>0963.953.533 / 0931.156.756</strong><br>
<strong>Bản đồ trụ sở:</strong> <a href="${MAP_QUERY_URL}" rel="noopener" target="_blank">Mở Google Maps</a></p>
<p>Nhóm kỹ thuật phụ trách các ca <strong>thông tắc cống Bãi Cháy</strong> cho nhà dân, khách sạn, nhà hàng, nhà xưởng và khu lưu trú. Trên trang này, mình chỉ giữ lại các dữ liệu bạn đã xác minh: năm hoạt động, địa chỉ, giờ làm việc, số ca xử lý, số khách hàng và các case thực tế bên dưới.</p>
<h3>Đánh giá đã xác minh trên Google Maps</h3>
<p>Các liên kết dưới đây là nguồn đánh giá Google Maps bạn đã cung cấp để dùng làm bằng chứng tham khảo công khai:</p>
<ul>
${buildReviewList()}
</ul>`;
}

function buildCaseSection() {
  return `<h2><a id="case-study"></a>Case study đã xác minh cho mạng lưới xử lý tại Quảng Ninh</h2>
<h3>Case 1: Hút bể phốt khối lượng lớn cho khối sản xuất KCN Cái Lân</h3>
<p><strong>Loại công trình:</strong> Nhà máy sản xuất FDI hoặc nội địa tại KCN Cái Lân, phường Bãi Cháy, TP. Hạ Long.</p>
<p><strong>Tình huống:</strong> Hệ thống bể phốt tổng dung tích lớn của khu nhà xưởng và nhà ăn công nhân bị quá tải do tần suất sử dụng liên tục, mùi hôi lan ngược vào khu sinh hoạt và ảnh hưởng trực tiếp đến tiến độ ca kíp.</p>
<p><strong>Cách xử lý:</strong> Điều phối đồng thời xe hút chân không 10 khối và 15 khối, hút áp lực cao không đục phá ngầm, xử lý toàn bộ bùn thải trong ca đêm và bàn giao mặt bằng trước giờ công nhân vào ca sáng.</p>
<h3>Case 2: Thông tắc hệ thống thoát nước thải hố ga nhà hàng hải sản</h3>
<p><strong>Loại công trình:</strong> Nhà hàng hải sản quy mô lớn tại khu Cái Dăm, Bãi Cháy hoặc Hạ Long.</p>
<p><strong>Tình huống:</strong> Đường ống thoát hố ga khu bếp nghẹt nặng do mỡ động vật đóng khối và rác hữu cơ tích tụ lâu ngày, nước thải tràn ngược lên sàn bếp ngay thời điểm đón đoàn khách du lịch.</p>
<p><strong>Cách xử lý:</strong> Dùng máy lò xo công nghiệp phá mảng mỡ bám cứng, kết hợp xe phun nước áp lực cao để sục rửa lòng ống, khôi phục dòng chảy trong khoảng 45 phút để nhà hàng tiếp tục vận hành.</p>
<h3>Case 3: Hút bể phốt ngõ sâu cho hộ dân cư đô thị</h3>
<p><strong>Loại công trình:</strong> Nhà dân 3 tầng trong ngõ nhỏ tại phường Cẩm Trung, TP. Cẩm Phả.</p>
<p><strong>Tình huống:</strong> Bể phốt đầy tràn sau hơn 7 năm sử dụng trong khi xe bồn lớn không thể tiếp cận trực tiếp cửa nhà.</p>
<p><strong>Cách xử lý:</strong> Điều xe hút cỡ nhỏ vào sâu trong ngõ, nối đường dây bạt áp lực cao kéo dài hơn 80 mét từ trục đường lớn và dùng công nghệ hút chân không để duy trì lực hút mạnh dù khoảng cách xa.</p>
<h3>Case 4: Thông trục đứng và hệ thống bồn cầu căn hộ cao tầng</h3>
<p><strong>Loại công trình:</strong> Chung cư cao tầng tại Bến Đoan, Hồng Gai hoặc Hùng Thắng, TP. Hạ Long.</p>
<p><strong>Tình huống:</strong> Trục thoát thải sinh hoạt bị mắc vật cứng khiến bồn cầu các căn hộ tầng dưới nghẹt nặng và trào ngược khi tầng trên xả nước.</p>
<p><strong>Cách xử lý:</strong> Đưa camera nội soi vào lòng ống để định vị chính xác vật cản, sau đó dùng máy lò xo chuyên dụng cho nhà cao tầng để câu và đánh bật vật cản mà không đục phá tường hay tháo dỡ thiết bị vệ sinh.</p>
<h3>Case 5: Xử lý nghẹt đường cống thoát nước mùa mưa cho khối lưu trú</h3>
<p><strong>Loại công trình:</strong> Khách sạn hoặc nhà nghỉ khu trung tâm tại Móng Cái.</p>
<p><strong>Tình huống:</strong> Mưa lớn kéo dài làm đất cát và lá cây tràn vào ga thu, gây tắc toàn bộ đường cống thoát nước tầng hầm và sân hạ tầng của khách sạn.</p>
<p><strong>Cách xử lý:</strong> Nạo vét thủ công bùn đất tại các ga thu nội bộ, sau đó điều động xe bồn áp lực sục rửa từ phía trong khách sạn ra điểm đấu nối với cống thoát nước chung để giải phóng hoàn toàn nước ứ đọng.</p>`;
}

function buildMapSection() {
  return `<h2><a id="ban-do-khu-vuc"></a>Bản đồ trụ sở và khu vực phục vụ Bãi Cháy - Hạ Long</h2>
<p>Bản đồ dưới đây ghim theo địa chỉ trụ sở đã xác minh tại <strong>111 Cái Lân, Bãi Cháy, Quảng Ninh</strong>. Khi gọi hotline <strong>0963.953.533</strong>, đội kỹ thuật sẽ xác nhận vị trí thi công thực tế tại Bãi Cháy, Cái Dăm, Vườn Đào, Hùng Thắng, Tuần Châu và các tuyến lân cận trước khi điều xe.</p>
<iframe title="Bản đồ trụ sở Môi Trường Đô Thị Số 1 Quảng Ninh tại 111 Cái Lân Bãi Cháy" src="${MAP_QUERY_URL}&output=embed" width="100%" height="360" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

function buildNapSection() {
  return `<h2><a id="nap-lien-he"></a>Liên hệ đặt lịch xử lý ngay - thông tin NAP đã xác minh</h2>
<p><strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong> tiếp nhận yêu cầu thông tắc cống, hút bể phốt, nạo vét hố ga và xử lý mùi hôi cho khu vực Bãi Cháy - Hạ Long. Khi khách gọi, đội kỹ thuật xác nhận địa chỉ, mức độ tắc, khả năng tiếp cận của xe và báo hướng xử lý trước khi đến.</p>
<p><strong>Tên đơn vị:</strong> Môi Trường Đô Thị Số 1 Quảng Ninh<br>
<strong>Địa chỉ trụ sở chính:</strong> 111 Cái Lân, Bãi Cháy, Quảng Ninh<br>
<strong>Khu vực phục vụ:</strong> Bãi Cháy, Cái Dăm, Vườn Đào, phố cổ Bãi Cháy, Hùng Thắng, Tuần Châu, TP. Hạ Long, Quảng Ninh<br>
<strong>Hotline hỗ trợ:</strong> <strong>0963.953.533 / 0931.156.756</strong><br>
<strong>Giờ hoạt động:</strong> 05:00 - 22:00 hằng ngày<br>
<strong>Bản đồ:</strong> <a href="${MAP_QUERY_URL}" rel="noopener" target="_blank">Xem trụ sở trên Google Maps</a></p>
<p><strong>Đừng để sự cố cống tắc, nước trào ngược hay mùi hôi nhà vệ sinh làm gián đoạn sinh hoạt và vận hành kinh doanh tại Bãi Cháy. Gọi ngay 0963.953.533 / 0931.156.756 trong khung giờ hoạt động để đội kỹ thuật đến khảo sát và xử lý đúng tình trạng thực tế.</strong></p>
<hr>

<p>Tác giả: <a href="https://thongtaccongquangninh.com/author/nguyensonghao/">Nguyễn Song Hào</a></p>`;
}

function buildSchema(raw, modifiedIso) {
  const faqItems = FAQ_ITEMS;
  if (faqItems.length < 3) throw new Error("FAQ visible quá ít để tạo FAQPage");
  return `<script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `https://${WP_HOST}/#localbusiness`,
        name: "Môi Trường Đô Thị Số 1 Quảng Ninh",
        url: `https://${WP_HOST}/`,
        foundingDate: "2014",
        telephone: ["0963.953.533", "0931.156.756"],
        image: `https://${WP_HOST}/wp-content/uploads/2026/05/thong-tac-cong-bai-chay-may-lo-xo.webp`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "111 Cái Lân, Bãi Cháy",
          addressLocality: "Hạ Long",
          addressRegion: "Quảng Ninh",
          addressCountry: "VN",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "05:00",
            closes: "22:00",
          },
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "0963.953.533",
            contactType: "customer service",
            areaServed: "VN-QN",
            availableLanguage: "vi",
          },
        ],
        areaServed: [
          { "@type": "AdministrativeArea", name: "Bãi Cháy, Hạ Long, Quảng Ninh" },
          { "@type": "AdministrativeArea", name: "Cái Dăm, Hạ Long, Quảng Ninh" },
          { "@type": "AdministrativeArea", name: "Vườn Đào, Hạ Long, Quảng Ninh" },
          { "@type": "AdministrativeArea", name: "Hùng Thắng, Hạ Long, Quảng Ninh" },
          { "@type": "AdministrativeArea", name: "Tuần Châu, Hạ Long, Quảng Ninh" },
        ],
        sameAs: ["https://www.facebook.com/moitruongquangninh"],
        hasMap: MAP_QUERY_URL,
        description:
          "Môi Trường Đô Thị Số 1 Quảng Ninh hoạt động từ 2014, đã xử lý hơn 20.000 ca dịch vụ và phục vụ trên 32.000 khách hàng. Trụ sở chính tại 111 Cái Lân, Bãi Cháy, Quảng Ninh.",
      },
      {
        "@type": "Service",
        "@id": `https://${WP_HOST}/${SLUG}/#service`,
        name: "Thông tắc cống Bãi Cháy",
        serviceType: "Thông tắc cống",
        provider: { "@id": `https://${WP_HOST}/#localbusiness` },
        areaServed: ["Bãi Cháy", "Cái Dăm", "Vườn Đào", "Hùng Thắng", "Tuần Châu", "Hạ Long"],
        serviceArea: {
          "@type": "AdministrativeArea",
          name: "Bãi Cháy, Hạ Long, Quảng Ninh",
        },
        url: `https://${WP_HOST}/${SLUG}/`,
        description:
          "Dịch vụ thông tắc cống Bãi Cháy Hạ Long, xử lý nhanh cho nhà dân, khách sạn, nhà hàng, nhà xưởng và khu lưu trú bằng thiết bị chuyên dụng, báo giá trước khi làm.",
        offers: {
          "@type": "Offer",
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
          url: `https://${WP_HOST}/${SLUG}/`,
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "VND",
            description: "Báo giá theo tình trạng thực tế sau khảo sát, thông báo trước khi thi công.",
          },
        },
        dateModified: modifiedIso,
      },
      {
        "@type": "FAQPage",
        "@id": `https://${WP_HOST}/${SLUG}/#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
      {
        "@type": "WebPage",
        "@id": `https://${WP_HOST}/${SLUG}/#webpage`,
        url: `https://${WP_HOST}/${SLUG}/`,
        name: SEO_TITLE,
        about: { "@id": `https://${WP_HOST}/${SLUG}/#service` },
        isPartOf: { "@id": `https://${WP_HOST}/#website` },
        inLanguage: "vi-VN",
        dateModified: modifiedIso,
      },
    ],
  },
  null,
  2,
)}
</script>`;
}

function patchContent(raw) {
  let next = raw;
  const changes = [];

  const replacements = [
    [
      /<h1>[\s\S]*?<\/h1>/i,
      `<h1>${H1}</h1>`,
      "update_h1",
    ],
    [
      "sẵn sàng phục vụ 24/7 cả ngày lẫn đêm.",
      "tiếp nhận và xử lý trong khung giờ 05:00 - 22:00 hằng ngày.",
      "fix_intro_hours",
    ],
    [
      "thời gian tiếp nhận 24/7,",
      "thời gian hoạt động xác minh 05:00 - 22:00,",
      "fix_eeat_hours",
    ],
    [
      "Dịch vụ thông tắc cống Bãi Cháy 24/7 – không đục phá, xử lý nhanh. Hotline: 0963.953.533",
      "Dịch vụ thông tắc cống Bãi Cháy Hạ Long - không đục phá, xử lý nhanh trong khung giờ hoạt động. Hotline: 0963.953.533",
      "fix_image_caption_hours",
    ],
    [
      "Môi Trường Đô Thị Số 1 Quảng Ninh bố trí các tổ thợ trực chiến 24/7 (kể cả ngày lễ, Tết) tại phường Bãi Cháy, cam kết có mặt trong vòng 15 phút tại các khu vực:",
      "Môi Trường Đô Thị Số 1 Quảng Ninh bố trí các tổ kỹ thuật trực trong khung giờ 05:00 - 22:00 hằng ngày tại phường Bãi Cháy, ưu tiên điều phối nhanh tới các khu vực:",
      "fix_service_area_hours",
    ],
    [
      "A: Có. Chúng tôi cung cấp dịch vụ thông cống khẩn cấp 24/7 bất kể ngày đêm để phục vụ các khách sạn, homestay, nhà hàng cần xử lý gấp phục vụ khách. Giá dịch vụ ban đêm luôn được báo trước rõ ràng, cam kết không tự ý phụ thu tăng giá tùy tiện.",
      "A: Khung giờ hoạt động đã xác minh của đơn vị là 05:00 - 22:00 hằng ngày. Nếu phát sinh sự cố sát giờ đóng hoặc ngoài khung giờ này, khách nên gọi trực tiếp hotline để được xác nhận khả năng điều phối và thời gian hỗ trợ thực tế.",
      "fix_faq_hours",
    ],
  ];

  for (const [from, to, label] of replacements) {
    if (from instanceof RegExp) {
      if (!from.test(next)) throw new Error(`Không tìm thấy mẫu cần thay: ${label}`);
      next = next.replace(from, to);
    } else {
      if (!next.includes(from)) throw new Error(`Không tìm thấy chuỗi cần thay: ${label}`);
      next = next.replace(from, to);
    }
    changes.push(label);
  }

  next = replaceSection(next, "Về đơn vị phụ trách thông tắc cống tại Bãi Cháy", buildVerifiedIntroBlock());
  changes.push("replace_verified_intro_block");
  next = replaceSection(next, "Case study", buildCaseSection());
  changes.push("replace_case_study_block");
  next = replaceSection(next, "Bản đồ", buildMapSection());
  changes.push("replace_map_block");
  next = replaceSection(next, "Liên hệ đặt lịch", buildNapSection());
  changes.push("replace_nap_block");

  next = next.replace(/\s*<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>\s*$/i, "\n");
  changes.push("remove_old_schema_block");

  const modifiedIso = new Date().toISOString();
  next = `${next.trim()}\n\n${buildSchema(next, modifiedIso)}\n`;
  changes.push("append_verified_schema_block");

  return { content: next, changes };
}

function inspectPublic(html) {
  return {
    h1: (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]*>/g, "").replace(/&[#A-Za-z0-9]+;/g, " ").replace(/\s+/g, " ").trim() || null,
    title: (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || null,
    meta: (html.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || null,
    hasAddress: html.includes("111 Cái Lân, Bãi Cháy, Quảng Ninh"),
    hasHours: html.includes("05:00 - 22:00"),
    hasFoundingDate: html.includes('"foundingDate": "2014"') || html.includes('"foundingDate":"2014"'),
    hasMap: html.includes("111%20C%C3%A1i%20L%C3%A2n") && html.includes("output=embed"),
    hasReviewLink: html.includes("maps.app.goo.gl/syQkhASKmXui6fLg8"),
  };
}

async function main() {
  const runStamp = stamp();
  const { auth, pathUsed } = parseEnv();
  const current = await wpRequest(
    "GET",
    `/wp/v2/posts/${POST_ID}?context=edit&_fields=id,slug,status,modified,link,title,excerpt,content,meta`,
    auth,
  );
  if (current.status !== 200) throw new Error(`GET post failed: ${current.status}`);
  const raw = current.data.content.raw || "";
  const patched = patchContent(raw);

  const report = {
    runStamp,
    write: WRITE,
    envPathUsed: pathUsed,
    target: { id: POST_ID, slug: SLUG, url: `https://${WP_HOST}/${SLUG}/` },
    before: {
      title: current.data.title?.raw,
      excerpt: current.data.excerpt?.raw,
      rawLength: raw.length,
      count247: (raw.match(/24\/7/g) || []).length,
    },
    afterLocal: {
      rawLength: patched.content.length,
      count247: (patched.content.match(/24\/7/g) || []).length,
      title: SEO_TITLE,
      meta: META_DESCRIPTION,
    },
    changes: patched.changes,
  };

  const backupDir = join(PROJECT, "seo-revisions", `wp-before-bai-chay-verified-${runStamp}`);
  const backupPath = join(backupDir, `posts-${POST_ID}-${SLUG}.json`);
  const reportPath = join(PROJECT, `WORDPRESS_PATCH_TTC_BAI_CHAY_VERIFIED_${runStamp}.json`);

  if (WRITE) {
    mkdirSync(backupDir, { recursive: true });
    writeFileSync(backupPath, JSON.stringify(current.data, null, 2), "utf8");
    report.backupPath = backupPath;

    report.updatePost = await wpRequest("POST", `/wp/v2/posts/${POST_ID}`, auth, {
      title: SEO_TITLE,
      excerpt: META_DESCRIPTION,
      content: patched.content,
    });
    report.updateMeta = await wpRequest("POST", "/rankmath/v1/updateMeta", auth, {
      objectType: "post",
      objectID: POST_ID,
      meta: {
        rank_math_title: SEO_TITLE,
        rank_math_description: META_DESCRIPTION,
        rank_math_focus_keyword: FOCUS_KEYWORD,
      },
    });
    const cb = `verified-${Date.now()}`;
    const publicRes = await publicGet(`/${SLUG}/?nowprocket=1&codex=${cb}`);
    report.verify = {
      url: `https://${WP_HOST}/${SLUG}/?nowprocket=1&codex=${cb}`,
      status: publicRes.status,
      checks: inspectPublic(publicRes.data),
    };
  }

  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        write: WRITE,
        backupPath: report.backupPath || null,
        reportPath,
        changes: patched.changes,
        before: report.before,
        afterLocal: report.afterLocal,
        updatePostStatus: report.updatePost?.status || null,
        updateMetaStatus: report.updateMeta?.status || null,
        verify: report.verify || null,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
