// Fix 4 trang Hút bể phốt điểm 78 (Hà Khẩu, Hồng Gai, Hùng Thắng, Tuần Châu).
// Dựng lại toàn bộ nội dung từ dữ liệu có cấu trúc (giữ nguyên ảnh/giá/case study/NAP thật),
// để kiểm soát số từ (~2.500-2.900), mật độ từ khóa (<2.5%), bỏ từ cấm, sửa giờ hoạt động sai,
// và chèn JSON-LD Service khớp cấu trúc plugin ttcqn-doorway-schema đang dùng site-wide.
// Backup nội dung cũ trước khi ghi đè. Dùng --dry để kiểm tra trước, bỏ --dry để ghi thật.
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

const env = readEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const HL_LAT = 20.9623842, HL_LNG = 107.0528491;

function serviceSchema(pageUrl, ward) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "Service", "@id": pageUrl + "#service",
    "name": `Hút bể phốt ${ward.name}`, "description": ward.serviceDesc, "serviceType": "Hút bể phốt",
    "provider": { "@type": "LocalBusiness", "@id": "https://thongtaccongquangninh.com/#localbusiness",
      "name": "Thông Tắc Cống Quảng Ninh", "telephone": ["+84963953533", "+84931156756"], "url": "https://thongtaccongquangninh.com/" },
    "areaServed": { "@type": "City", "name": ward.name,
      "containedInPlace": { "@type": "AdministrativeArea", "name": "Quảng Ninh" },
      "geo": { "@type": "GeoCoordinates", "latitude": HL_LAT, "longitude": HL_LNG } },
    "availableChannel": { "@type": "ServiceChannel", "servicePhone": "+84963953533", "serviceUrl": pageUrl, "availableLanguage": ["vi"] },
    "hoursAvailable": { "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], "opens": "05:00", "closes": "22:00" },
    "url": pageUrl,
  })}</script>`;
}

function img(id, file, alt, caption) {
  return `<!-- wp:image {"id":${id},"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/07/${file}" alt="${alt}" class="wp-image-${id}" loading="lazy" /><figcaption class="wp-element-caption">${caption}</figcaption></figure>
<!-- /wp:image -->`;
}

const WARDS = {
  3359: {
    slug: "hut-be-phot-ha-khau", name: "Hà Khẩu",
    title: "Hút Bể Phốt Hà Khẩu – Nhà Trọ, Khu Cảng, Có Mặt Nhanh Hạ Long",
    metaDesc: "Hút bể phốt Hà Khẩu cho nhà trọ công nhân cảng, khu dân cư gần cảng Cái Lân. Khảo sát đúng dãy phòng, báo giá trước khi làm. Gọi 0963.953.533 / 0931.156.756.",
    serviceDesc: "Dịch vụ hút bể phốt tại Hà Khẩu, Hạ Long cho nhà trọ công nhân cảng và khu dân cư gần cảng. Xe bồn tới tận nơi, báo giá trước khi làm, tiếp nhận 05:00-22:00 hằng ngày.",
    imgTop: img(3814, "hut-be-phot-ha-khau-anh-dau-bai.webp", "Xe bồn hút bể phốt tại khu nhà trọ công nhân cảng Hà Khẩu", "Xe bồn tiếp cận khu nhà trọ công nhân cảng tại Hà Khẩu."),
    imgCase: img(3815, "hut-be-phot-ha-khau-case-study.webp", "Thợ kiểm tra điểm mở bể trước khi hút bể phốt tại Hà Khẩu", "Thợ kiểm tra điểm mở bể trước khi hút tại dãy nhà trọ Hà Khẩu."),
    imgBottom: img(3816, "hut-be-phot-ha-khau-quy-trinh-thi-cong.webp", "Quy trình đưa ống hút bể phốt từ xe bồn tới điểm mở bể tại Hà Khẩu", "Đưa ống hút từ xe bồn tới điểm mở bể trong ngõ khu trọ Hà Khẩu."),
    intro1: "Hà Khẩu tập trung nhiều dãy nhà trọ cho công nhân cảng và khu dân cư sát cảng Cái Lân. Dịch vụ hút bể phốt tại đây phục vụ cả nhà trọ đông phòng lẫn hộ gia đình, đội thợ khảo sát đúng dung tích bể trước khi báo giá, không đục phá khi chưa cần thiết.",
    intro2: "Nhiều chủ trọ và hộ dân tại Hà Khẩu gặp tình trạng bể phốt bốc mùi, nước trào ngược vì bể dùng chung cho nhiều phòng mà không hút định kỳ. Xử lý đúng lịch giúp tránh sự cố bất ngờ giữa lúc phòng trọ kín người và kéo dài tuổi thọ bể phốt thêm nhiều năm.",
    nguyenNhanBody: "Khu vực Hà Khẩu gần cảng có nhiều nhà trọ công nhân với bể phốt nhỏ, mật độ người cao, bể phốt nhanh đầy hơn tiêu chuẩn 2-3 lần.",
    nguyenNhanBullets: [
      ["Vi khuẩn phân hủy chậm", "dùng thuốc tẩy nhiều làm chết vi khuẩn có ích, bùn tích nhanh hơn."],
      ["Đường thoát nước mưa chung bể", "một số nhà cũ khu Hà Khẩu nối nhầm ống mưa vào bể phốt."],
      ["Bể phốt thiết kế nhỏ", "tính cho 4 người nhưng thực tế 8-10 người sử dụng."],
    ],
    infraHeading: "Hạ Tầng Khu Cảng Ảnh Hưởng Thế Nào Đến Việc Hút Bể Phốt",
    infraBody: `<p>Hà Khẩu tập trung nhiều dãy nhà trọ cho công nhân cảng, mật độ người ở trên một bể phốt thường cao gấp 2-3 lần bể phốt nhà ở thông thường. Phần lớn nhà trọ xây kiểu dãy phòng khép kín, bể phốt dùng chung cho 8-15 phòng, nên khi bể đầy thường xảy ra đồng loạt ở nhiều phòng cùng lúc chứ không lẻ tẻ từng hộ như nhà dân đơn lẻ.</p>
<p>Đường ống trong khu trọ công nhân thường đi chung một trục đứng, ống nhỏ hơn tiêu chuẩn nhà ở dân dụng. Khi khảo sát, thợ cần xác định đúng bể phục vụ dãy phòng nào trước khi tháo nắp, tránh nhầm sang bể của dãy khác gây mất thời gian cho cả chủ trọ lẫn người thuê. Với các dãy trọ xây trước 2015, nắp bể thường bị bê tông hóa hoặc lát gạch đè lên, cần dò vị trí bằng gõ âm thanh trước khi đục nắp kiểm tra – bước khảo sát này được tính trong lần hút đầu, không phát sinh thêm chi phí.</p>
<p>Xe bồn tiếp cận khu Hà Khẩu qua đường chính ra vào cảng, phần lớn ngõ rộng đủ cho xe 5-8m³ vào sát nhà. Với vài dãy trọ nằm sâu trong ngõ nhỏ hơn 2m, thợ dùng ống hút nối dài để không phải di chuyển xe vào sâu, giữ nguyên lối đi chung của khu trọ trong lúc thi công, không ảnh hưởng sinh hoạt của người thuê trọ.</p>
<p>Một yếu tố khác cần lưu ý ở khu vực gần cảng là nền đất thường yếu hơn khu vực trung tâm do gần mực nước biển, một số bể phốt xây trên nền đất chưa xử lý kỹ có hiện tượng lún nhẹ theo thời gian. Khi khảo sát, thợ quan sát thêm độ nghiêng của nắp bể và tình trạng nứt xung quanh miệng bể để cảnh báo sớm cho chủ nhà nếu thấy dấu hiệu lún bất thường, tránh chờ đến khi kết cấu bị ảnh hưởng nặng mới xử lý.</p>`,
    goiHeading: "Nên Chọn Hút Lẻ Hay Đăng Ký Gói Định Kỳ Cho Dãy Trọ",
    goiBody: `<p>Với hộ gia đình đơn lẻ tại Hà Khẩu, hút theo nhu cầu khi thấy dấu hiệu đầy là đủ, không cần đăng ký gói cố định. Nhưng với chủ trọ quản lý một dãy 8-15 phòng, đăng ký gói định kỳ 3-4 tháng/lần thường tiết kiệm hơn so với gọi hút lẻ từng đợt khi bể đã đầy, vì tránh được tình trạng nhiều phòng cùng gặp sự cố một lúc.</p>
<p>Gói định kỳ được tính chung một lần khảo sát cho cả dãy, chủ trọ chỉ cần xác nhận lịch trước mỗi đợt, không phải mô tả lại tình trạng bể mỗi lần gọi. Với dãy trọ mới xây chưa rõ chu kỳ đầy thực tế, đội thợ tư vấn hút đợt đầu trước, quan sát tốc độ đầy thực tế của bể rồi mới đề xuất chu kỳ phù hợp cho các đợt sau, tránh đặt gói dày hơn mức cần thiết.</p>
<p>Với chủ trọ đang cho thuê nhiều dãy ở các khu khác nhau quanh Hà Khẩu, có thể gộp lịch hút của nhiều dãy trong cùng một đợt để xe bồn đi một vòng thay vì điều xe riêng từng dãy, giảm chi phí di chuyển được tính vào giá chung. Thông tin từng dãy (số phòng, dung tích bể, lần hút gần nhất) được ghi lại sau lần đầu tiên, giúp các lần sau chủ trọ chỉ cần gọi hẹn ngày mà không phải cung cấp lại toàn bộ thông tin.</p>`,
    trustHeading: "Vì Sao Chủ Trọ Hà Khẩu Chọn Dịch Vụ Này",
    trustBody: `<p>Với khu trọ đông người, hai điều chủ trọ quan tâm nhất là giá không phát sinh và không phải đóng cửa phòng lâu ngày trong lúc thi công. Đội thợ đo dung tích thực tế trước khi báo giá, con số đưa ra tại nhà đúng bằng số tiền thanh toán sau khi hút, không có khoản phụ thu nào phát sinh thêm giữa chừng.</p>
<p>Toàn bộ bùn thải được xe bồn chở về đúng điểm xử lý theo quy định môi trường, không đổ ra cống chung hay khu đất trống quanh khu trọ – điều quan trọng với khu dân cư đông đúc như Hà Khẩu nơi mùi hôi ảnh hưởng trực tiếp đến các phòng trọ xung quanh. Sau khi hút, bể được xịt men vi sinh khử mùi và bảo hành 30 ngày, nếu mùi quay lại trong thời gian này sẽ được xử lý lại không tính thêm phí.</p>
<p>Thời gian thi công một bể thông thường mất 30-60 phút tùy dung tích, không cần chủ trọ phải thông báo trước cho toàn bộ người thuê nghỉ sinh hoạt, chỉ cần tránh khu vực gần nắp bể trong lúc thợ làm việc.</p>
<p>Với chủ trọ lần đầu thuê dịch vụ, thợ giải thích rõ từng khoản trước khi bắt đầu: dung tích đo được, đơn giá tương ứng, và lý do nếu giá cao hơn dự kiến ban đầu chủ trọ tự ước lượng qua điện thoại. Cách làm này giúp chủ trọ đối chiếu được với các lần hút sau, chủ động nhận biết nếu có đơn vị khác báo giá bất thường.</p>`,
    maintenanceHeading: "Bảo Trì Bể Phốt Lâu Dài Cho Khu Nhà Trọ",
    maintenanceBody: `<p>Với bể phốt phục vụ nhiều phòng trọ, việc bảo trì đúng cách quan trọng hơn nhà ở đơn lẻ vì tần suất sử dụng cao gấp nhiều lần. Chủ trọ nên tránh để người thuê đổ dầu mỡ thừa, băng vệ sinh hoặc rác cứng xuống bồn cầu – đây là nguyên nhân phổ biến khiến bể đầy nhanh hơn tính toán ban đầu, kể cả khi mới hút chưa lâu.</p>
<p>Sau mỗi lần hút, nên ghi lại ngày hút và số phòng đang sử dụng vào sổ quản lý dãy trọ, làm căn cứ ước tính lần hút tiếp theo thay vì đợi đến khi có mùi mới gọi. Với dãy trọ có biến động số phòng cho thuê theo mùa (nhiều công nhân hơn vào mùa cao điểm cảng), chu kỳ hút nên điều chỉnh linh hoạt thay vì cố định cứng theo lịch.</p>
<p>Nếu phát hiện dấu hiệu bất thường như nước thoát chậm dù mới hút, hoặc mùi hôi xuất hiện ở một phòng cụ thể trong khi các phòng khác bình thường, nên kiểm tra riêng đường ống của phòng đó trước, vì có thể là tắc cục bộ chứ không phải do bể phốt chung đã đầy – tránh gọi hút cả bể khi thực ra chỉ cần thông một đoạn ống.</p>
<p>Với dãy trọ xây gần cảng, nên kiểm tra thêm nắp bể sau mỗi mùa mưa lớn, vì nước mưa dâng cao quanh khu vực có thể tràn qua khe nắp bể nếu gioăng cao su đã lão hóa, làm loãng bùn và khiến bể tưởng như còn ít nhưng thực tế cần hút sớm hơn dự kiến do lẫn nước mưa.</p>`,
    quyTrinhSteps: [
      ["Gọi hotline", "mô tả địa chỉ, số phòng đang dùng chung bể, dung tích bể ước chừng – thợ báo giá sơ bộ và xác nhận thời gian đến."],
      ["Khảo sát tại chỗ", "kiểm tra nắp bể, đo dung tích, xác định mức bùn và số phòng thực tế đang xả vào bể."],
      ["Báo giá chính xác", "chốt giá dựa trên dung tích thực tế – không phát sinh sau khi đồng ý, kể cả khi bể dùng chung nhiều phòng."],
      ["Hút bể phốt", "xe bồn hút toàn bộ bùn nước, kiểm tra đường thoát của các phòng liền kề sau khi hút."],
      ["Khử mùi và bàn giao", "xịt men vi sinh, đậy nắp bể, tư vấn chu kỳ hút phù hợp với số phòng, bảo hành 30 ngày."],
    ],
    quyTrinhNote: "Với dãy trọ nhiều phòng, thợ khảo sát kỹ số bể thực tế đang phục vụ bao nhiêu phòng trước khi báo giá, tránh tính nhầm dung tích khi bể dùng chung cho cả dãy.",
    caseMonth: "Tháng 3/2026", caseBody: "chủ nhà trọ 20 phòng tại phường Hà Khẩu gọi hút bể phốt khi bể tràn vào giờ cao điểm buổi tối. Xe bồn hút 6m³, dọn sạch khu vực ảnh hưởng, khuyến nghị lắp thêm bể phụ để giảm tần suất hút cho dãy trọ đông phòng. Chủ nhà tiết kiệm khoảng 30% chi phí so với việc gọi hút lẻ mỗi tháng khi chuyển sang đăng ký gói định kỳ.",
    caseExtra: "Sau khi hút, thợ kiểm tra thêm đường ống thoát của 2 phòng liền kề đang có dấu hiệu chậm, phát hiện một đoạn ống bị lún nhẹ do nền đất yếu gần cảng và tư vấn chủ trọ theo dõi thêm trước khi cần đào sửa, tránh phát sinh chi phí ngoài dự kiến ngay trong lần hút này.",
    faqOrig: [
      ["Dịch vụ có phục vụ nhà trọ cảng không?", "Có – nhận nhà trọ công nhân, nhà trọ cảng tại Hà Khẩu. Hút ngoài giờ làm việc hoặc giờ thấp điểm theo yêu cầu chủ nhà để không ảnh hưởng người thuê. Thợ liên hệ trước 15-30 phút khi sắp đến nơi để chủ trọ chuẩn bị lối vào."],
      ["Bao lâu cần hút một lần ở khu nhà trọ Hà Khẩu?", "Nhà trọ đông người (trên 10 người/bể 3m³): nên hút 3-4 tháng/lần. Đăng ký gói định kỳ được ưu đãi 10-15% so với hút lẻ. Nhà trọ ít người hơn có thể giãn chu kỳ tùy theo tốc độ đầy thực tế quan sát được sau lần hút đầu."],
      ["Sau khi hút có cần khử mùi không?", "Có – thợ xịt men vi sinh ngay sau khi hút. Men vi sinh kích hoạt vi khuẩn có ích giúp phân hủy bùn còn lại và ngăn mùi hôi trong 30-60 ngày. Nếu mùi quay lại sớm hơn thời gian này, liên hệ lại để được xử lý bổ sung trong thời hạn bảo hành."],
    ],
    faqExtra: [
      ["Chủ trọ Hà Khẩu có thể ký hợp đồng hút định kỳ cho cả dãy phòng không?", "Có. Với dãy trọ 8-15 phòng, đăng ký gói định kỳ được báo giá theo dãy, tính chung một lần khảo sát, tiết kiệm hơn gọi hút lẻ từng đợt và chủ động được lịch trước khi bể đầy."],
      ["Hút bể phốt buổi tối ở khu trọ công nhân Hà Khẩu có làm phiền người ở không?", "Không. Thợ dùng ống hút kín, không xả nước ra ngoài, tiếng máy hút chủ yếu phát ra ở xe bồn đỗ ngoài ngõ. Có thể hẹn giờ ngoài ca làm việc của công nhân theo yêu cầu chủ trọ."],
    ],
    khuVucBody: "Dịch vụ hút bể phốt phủ toàn bộ Hà Khẩu và các khu vực lân cận: Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên.",
  },
  3356: {
    slug: "hut-be-phot-hong-gai", name: "Hồng Gai",
    title: "Hút Bể Phốt Hồng Gai – Nhà Ống Cũ, Ống Gang, Có Mặt Nhanh",
    metaDesc: "Hút bể phốt Hồng Gai cho nhà ống phố cổ, bể phốt xây gạch trước 1990. Có ống bơm đường dài cho ngõ hẹp, báo giá trước khi làm. Gọi 0963.953.533 / 0931.156.756.",
    serviceDesc: "Dịch vụ hút bể phốt tại Hồng Gai, Hạ Long cho nhà ống phố cổ, bể phốt xây gạch trước 1990. Có thiết bị bơm đường dài cho ngõ hẹp, tiếp nhận 05:00-22:00 hằng ngày.",
    imgTop: img(3826, "hut-be-phot-hong-gai-anh-dau-bai.webp", "Xe bồn hút bể phốt tại phố cổ Hồng Gai", "Xe bồn đỗ đầu ngõ, ống hút nối dài vào nhà ống phố cổ Hồng Gai."),
    imgCase: img(3827, "hut-be-phot-hong-gai-case-study.webp", "Thợ kiểm tra điểm mở bể trước khi hút bể phốt tại Hồng Gai", "Thợ kiểm tra thành bể gạch cũ trước khi hút tại Hồng Gai."),
    imgBottom: img(3828, "hut-be-phot-hong-gai-quy-trinh-thi-cong.webp", "Quy trình đưa ống hút bể phốt từ xe bồn tới điểm mở bể tại Hồng Gai", "Luồn ống hút qua ngõ hẹp tới điểm mở bể tại Hồng Gai."),
    intro1: "Hồng Gai là khu phố cổ của Hạ Long, nhiều nhà ống xây từ trước 1990 với bể phốt xây gạch, ngõ vào hẹp 1-2m. Dịch vụ hút bể phốt tại đây dùng ống bơm đường dài để không phải đưa xe bồn vào sâu, giữ nguyên hiện trạng ngõ phố cổ.",
    intro2: "Nhiều gia đình và cơ sở kinh doanh tại Hồng Gai gặp tình trạng bể phốt bốc mùi, tràn nước bẩn vì không hút định kỳ, đặc biệt với bể gạch cũ đã xuống cấp. Xử lý đúng lịch giúp tránh sự cố bất ngờ và kéo dài tuổi thọ bể phốt lên 10-15 năm.",
    nguyenNhanBody: "Bể phốt xây gạch cũ tại Hồng Gai thường bị nứt thành, mùi hôi rò ra; lượng người đông trong diện tích nhỏ khiến bể nhanh đầy hơn tiêu chuẩn.",
    nguyenNhanBullets: [
      ["Vi khuẩn phân hủy chậm", "dùng thuốc tẩy nhiều làm chết vi khuẩn có ích, bùn tích nhanh hơn."],
      ["Đường thoát nước mưa chung bể", "một số nhà cũ khu Hồng Gai nối nhầm ống mưa vào bể phốt."],
      ["Bể phốt thiết kế nhỏ", "tính cho 4 người nhưng thực tế 8-10 người sử dụng."],
    ],
    infraHeading: "Vì Sao Nhà Ống Phố Cổ Cần Cách Hút Bể Phốt Riêng",
    infraBody: `<p>Khu phố cổ Hồng Gai còn nhiều nhà ống xây trước 1990, bể phốt xây gạch chứ không đổ bê tông cốt thép như nhà mới. Thành bể gạch sau vài chục năm thường bị nứt chân chim, một số chỗ đã ngấm nước ra đất xung quanh. Nếu hút bằng máy công suất lớn theo kiểu bể bê tông hiện đại, áp lực hút mạnh có thể làm bong thêm mảng gạch đã yếu, thậm chí sụp một phần thành bể.</p>
<p>Ngõ vào các nhà ống Hồng Gai phổ biến ở mức 1-2m, nhiều đoạn xe máy tránh nhau còn khó, xe bồn tiêu chuẩn không thể vào sát nhà. Thợ xử lý bằng cách đỗ xe bồn ở đầu ngõ hoặc trục đường chính, sau đó dùng ống hút mềm nối dài 30-50m luồn qua ngõ tới đúng vị trí nắp bể. Cách này giữ nguyên hiện trạng ngõ, không cần đục phá hay di dời vật cản để xe vào.</p>
<p>Một điểm khác biệt nữa là hệ thống ống thoát nước nhà ống cũ thường dùng ống gang, qua thời gian bị gỉ và co hẹp lòng ống. Khi kiểm tra bể, thợ tranh thủ soi luôn đoạn ống gần miệng bể để phát hiện sớm điểm gỉ sắp tắc, tránh phải gọi thêm một lần thợ riêng cho việc thông ống sau này.</p>
<p>Nhiều nhà ống Hồng Gai đã qua vài lần cải tạo, sửa thêm tầng hoặc đổi công năng phòng, nên vị trí bể phốt trên thực tế đôi khi không còn khớp với bản vẽ nhà gốc nếu còn lưu. Với những trường hợp này, thợ ưu tiên dò bằng kinh nghiệm thực tế (âm thanh gõ nền, độ ẩm bất thường trên sàn) thay vì chỉ dựa vào bản vẽ cũ, đảm bảo xác định đúng vị trí trước khi quyết định đục nền kiểm tra.</p>`,
    goiHeading: "Xử Lý Không Gian Chật Hẹp Trong Nhà Ống Như Thế Nào",
    goiBody: `<p>Nhà ống phố cổ Hồng Gai phần lớn không có sân, nắp bể phốt thường nằm trong nhà, dưới nền gạch phòng bếp hoặc khu vệ sinh. Thợ mang theo tấm bạt lót và ống dẫn kín để hút gọn trong không gian chật, hạn chế mùi phát tán ra phòng khách hay khu sinh hoạt chung của gia đình trong lúc thi công.</p>
<p>Với nắp bể nằm dưới sàn gạch, cần báo trước để thợ mang dụng cụ cạy gạch nhẹ nhàng, lắp lại nguyên trạng sau khi xong, không để lại vết nứt hay lệch màu gạch. Nhà có nhiều thế hệ cùng sống chung một lúc, thợ ưu tiên sắp xếp giờ hút vào khung ít người qua lại nhất trong ngày theo yêu cầu gia chủ.</p>
<p>Một số nhà ống Hồng Gai đã cải tạo mặt tiền làm cửa hàng, phần bể phốt cũ nằm ngay dưới khu vực bày hàng. Với trường hợp này, thợ trao đổi trước với chủ nhà để chọn khung giờ ít khách, thường là đầu giờ sáng trước khi mở cửa hàng, tránh phải dọn hàng hóa để lấy lối vào nắp bể.</p>`,
    trustHeading: "Vì Sao Nhà Phố Cổ Hồng Gai Chọn Dịch Vụ Này",
    trustBody: `<p>Với nhà ống bể gạch cũ, rủi ro lớn nhất khi thuê thợ không quen tay là hút áp lực mạnh làm nứt vỡ thêm thành bể. Đội thợ luôn kiểm tra tình trạng bể trước, điều chỉnh công suất hút phù hợp thay vì dùng một mức áp lực cho mọi loại bể, giảm rủi ro hư hỏng công trình cũ.</p>
<p>Giá được báo sau khi khảo sát thực tế, đã tính luôn công luồn ống dài qua ngõ hẹp nên không phát sinh thêm khi thi công. Bùn thải chở về đúng điểm xử lý theo quy định, không xả ra cống chung của khu phố cổ – nơi hệ thống thoát nước đã cũ và dễ quá tải nếu xả bừa.</p>
<p>Sau khi hoàn tất, nắp bể và nền gạch được lắp lại nguyên trạng, không để lại dấu vết thi công trên mặt sàn nhà. Dịch vụ bảo hành 30 ngày cho vấn đề mùi hôi tái phát sau khi hút.</p>
<p>Với gia đình lớn tuổi sống một mình trong nhà ống, thợ hỗ trợ thêm việc di chuyển đồ đạc nhẹ quanh khu vực nắp bể nếu cần, thay vì để gia chủ tự dọn trước khi thợ đến. Sau khi hoàn tất công việc, khu vực thi công được lau dọn sạch sẽ trước khi bàn giao lại cho gia đình.</p>`,
    maintenanceHeading: "Bảo Trì Bể Phốt Gạch Cũ Đúng Cách",
    maintenanceBody: `<p>Bể phốt xây gạch có tuổi thọ khác bể bê tông, cần theo dõi kỹ hơn theo thời gian thay vì chỉ đợi đến khi có mùi mới kiểm tra. Sau mỗi lần hút, nên quan sát xem nước có rút chậm bất thường trong vài tuần đầu không – đây có thể là dấu hiệu vết nứt thành bể đã lan rộng hơn lần kiểm tra trước.</p>
<p>Hạn chế đổ hóa chất tẩy rửa mạnh hoặc nước nóng già xuống bồn cầu vì có thể làm giòn thêm lớp vữa trát bên trong bể gạch cũ. Với nhà ống nhiều thế hệ sinh sống, nên thống nhất trong nhà về việc không đổ dầu mỡ nhà bếp qua đường ống nhà vệ sinh chung, tránh làm đặc bùn nhanh hơn bình thường.</p>
<p>Nếu trong quá trình sinh hoạt phát hiện nền nhà gần khu vực đặt bể có dấu hiệu ẩm hoặc lún nhẹ, nên kiểm tra sớm thay vì chờ đến chu kỳ hút định kỳ, vì đây có thể là dấu hiệu rò rỉ từ thành bể gạch đã nứt cần xử lý trước khi ảnh hưởng đến kết cấu nhà.</p>
<p>Với nhà ống đã cải tạo thêm tầng, trọng lượng công trình phía trên tăng lên so với thiết kế ban đầu, có thể gây thêm áp lực lên bể phốt cũ bên dưới. Nếu nhà từng cải tạo nâng tầng, nên rút ngắn chu kỳ kiểm tra bể xuống còn 1,5-2 năm/lần thay vì chu kỳ thông thường, để phát hiện sớm nếu thành bể chịu tải kém hơn trước.</p>`,
    quyTrinhSteps: [
      ["Gọi hotline", "mô tả địa chỉ, độ rộng ngõ, dung tích bể ước chừng – thợ báo giá sơ bộ và xác nhận thiết bị ống dài cần mang theo."],
      ["Khảo sát tại chỗ", "kiểm tra nắp bể, đo dung tích, xác định mức bùn và tình trạng thành bể gạch trước khi hút."],
      ["Báo giá chính xác", "chốt giá dựa trên dung tích thực tế và độ dài ống cần luồn qua ngõ – không phát sinh sau khi đồng ý."],
      ["Hút bể phốt", "hút với áp lực điều chỉnh phù hợp bể gạch cũ, kiểm tra đường thoát sau khi hút."],
      ["Khử mùi và bàn giao", "xịt men vi sinh, đậy nắp bể, tư vấn lịch hút định kỳ, bảo hành 30 ngày."],
    ],
    quyTrinhNote: "Với bể gạch cũ, thợ giảm áp lực hút ở giai đoạn đầu và quan sát phản ứng của thành bể trước khi hút hết công suất, tránh làm bong thêm mảng gạch đã yếu.",
    caseMonth: "Tháng 2/2026", caseBody: "nhà ống 3 tầng trong ngõ 2m tại phường Hồng Gai không cho xe bồn vào. Thợ dùng bơm hút đường dài 30m từ ngoài ngõ, hút sạch bể 4m³, khử mùi hoàn toàn. Chi phí 750.000đ, không đục phá ngõ hay ảnh hưởng các nhà lân cận trong quá trình thi công.",
    caseExtra: "Trong lúc hút, thợ phát hiện thêm một điểm nứt nhỏ ở góc thành bể chưa rò nước, đã đánh dấu và tư vấn chủ nhà theo dõi, tránh phải đục sàn kiểm tra ngay khi bể vẫn còn dùng tốt và chưa cần sửa gấp.",
    faqOrig: [
      ["Hút bể phốt trong ngõ hẹp có được không?", "Được – đội thợ có thiết bị bơm đường dài lên đến 50m, phục vụ được ngõ hẹp không cho xe bồn vào trực tiếp. Trước khi thi công, thợ khảo sát đường ngõ để xác định điểm đỗ xe bồn phù hợp nhất, hạn chế cản trở lối đi chung."],
      ["Bể phốt gạch cũ có hút được không?", "Được – nhưng cần kiểm tra thành bể trước khi hút. Bể phốt gạch cũ nứt dễ sụp khi hút áp lực mạnh, thợ sẽ điều chỉnh công suất phù hợp. Nếu phát hiện thành bể quá yếu, thợ tư vấn phương án an toàn hơn thay vì hút bằng mọi giá."],
      ["Sau khi hút có cần khử mùi không?", "Có – thợ xịt men vi sinh ngay sau khi hút. Men vi sinh kích hoạt vi khuẩn có ích giúp phân hủy bùn còn lại và ngăn mùi hôi trong 30-60 ngày. Với nhà ống ít thông gió, có thể xịt thêm một lần sau vài ngày nếu gia chủ vẫn còn cảm nhận mùi nhẹ."],
    ],
    faqExtra: [
      ["Nhà ống Hồng Gai không có sân, nắp bể phốt nằm trong nhà thì xử lý sao?", "Thợ mang theo tấm bạt và ống dẫn kín để hút gọn trong không gian chật, hạn chế mùi phát tán ra phòng khách. Với nắp bể nằm dưới sàn gạch, cần báo trước để thợ mang dụng cụ cạy gạch nhẹ nhàng, lắp lại nguyên trạng sau khi xong."],
      ["Ống hút đường dài 30-50m ở Hồng Gai có tính thêm phí không?", "Không tính thêm cho khoảng cách trong phạm vi ngõ thông thường tại Hồng Gai. Giá báo trước đã gồm chi phí nhân công luồn ống, chỉ phát sinh nếu công trình yêu cầu thiết bị đặc biệt ngoài dự kiến."],
    ],
    khuVucBody: "Dịch vụ hút bể phốt phủ toàn bộ Hồng Gai và các khu vực lân cận: Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên.",
  },
  3361: {
    slug: "hut-be-phot-hung-thang", name: "Hùng Thắng",
    title: "Hút Bể Phốt Hùng Thắng – Khu Đô Thị Mới, Bể Ngầm, Có Mặt Nhanh",
    metaDesc: "Hút bể phốt Hùng Thắng cho nhà liền kề, biệt thự khu đô thị mới, bể ngầm bê tông. Báo giá theo dãy nhà, không phát sinh. Gọi 0963.953.533 / 0931.156.756.",
    serviceDesc: "Dịch vụ hút bể phốt tại Hùng Thắng, Hạ Long cho nhà liền kề, biệt thự khu đô thị mới, bể phốt ngầm bê tông. Tiếp nhận 05:00-22:00 hằng ngày, báo giá theo dãy nhà.",
    imgTop: img(3804, "hut-be-phot-hung-thang-anh-dau-bai.webp", "Xe bồn hút bể phốt tại khu đô thị mới Hùng Thắng", "Xe bồn phục vụ dãy nhà liền kề tại khu đô thị mới Hùng Thắng."),
    imgCase: img(3805, "hut-be-phot-hung-thang-case-study.webp", "Thợ kiểm tra điểm mở bể trước khi hút bể phốt tại Hùng Thắng", "Thợ dò vị trí nắp bể ngầm trước khi hút tại Hùng Thắng."),
    imgBottom: img(3806, "hut-be-phot-hung-thang-quy-trinh-thi-cong.webp", "Quy trình đưa ống hút bể phốt từ xe bồn tới điểm mở bể tại Hùng Thắng", "Đưa ống hút chuyên dụng xuống bể ngầm sâu tại Hùng Thắng."),
    intro1: "Hùng Thắng là khu đô thị mới của Hạ Long, nhà liền kề và biệt thự dùng bể phốt ngầm bê tông chôn sâu. Dịch vụ hút bể phốt tại đây có ống hút chuyên dụng chịu cột áp lớn, phù hợp bể chôn sâu 1,5-3m, báo giá theo dãy nhà khi nhiều hộ cùng đặt lịch.",
    intro2: "Nhiều gia đình tại khu đô thị mới Hùng Thắng gặp tình trạng bể phốt bốc mùi, tràn nước bẩn vì không hút định kỳ dù bể bê tông bền hơn bể gạch cũ. Xử lý đúng lịch giúp tránh sự cố bất ngờ và kéo dài tuổi thọ bể phốt lên 10-15 năm.",
    nguyenNhanBody: "Nhà liền kề khu đô thị mới thường có bể phốt ngầm bê tông dung tích 5-8m³, cần hút định kỳ 2-3 năm/lần để tránh tắc đường thoát.",
    nguyenNhanBullets: [
      ["Vi khuẩn phân hủy chậm", "dùng thuốc tẩy nhiều làm chết vi khuẩn có ích, bùn tích nhanh hơn."],
      ["Đường thoát nước mưa chung bể", "một số nhà nối nhầm ống mưa vào bể phốt ngay từ khi xây."],
      ["Bể phốt thiết kế nhỏ", "tính cho 4 người nhưng thực tế 8-10 người sử dụng."],
    ],
    infraHeading: "Bể Phốt Ngầm Bê Tông Ở Khu Đô Thị Mới Khác Gì Nhà Cũ",
    infraBody: `<p>Các dãy nhà liền kề và biệt thự tại khu đô thị mới Hùng Thắng đều xây theo quy hoạch đồng bộ, bể phốt là bể ngầm bê tông cốt thép, dung tích phổ biến 5-8m³, chôn sâu hơn bể nhà cũ khoảng 1,5-3m. Ưu điểm là thành bể chắc, ít nứt vỡ, nhưng nắp bể thường được lát đá hoặc gạch sân vườn phủ lên, nên bước đầu tiên luôn là xác định đúng vị trí nắp qua bản vẽ hoàn công hoặc dò thủ công.</p>
<p>Vì các nhà liền kề nằm sát nhau và dùng chung kiểu thiết kế, một dãy 4-6 căn thường xuống cấp bể phốt gần cùng thời điểm sau 2-3 năm sử dụng. Đây là lý do dịch vụ tại Hùng Thắng có gói hút theo dãy: xe bồn phục vụ nhiều nhà liền kề trong một buổi, giảm số lần điều xe và thời gian chờ cho từng hộ.</p>
<p>Vì bể chôn sâu, thợ dùng ống hút chuyên dụng chịu được cột áp lớn hơn ống thông thường, và luôn kiểm tra van một chiều tại miệng bể trước khi hút để tránh nước bẩn trào ngược lên khi tháo nắp. Sau khi hút xong, nắp và lớp lát nền được lắp lại nguyên trạng, không để lại vết đục trên sân vườn.</p>
<p>Một số dãy nhà liền kề tại Hùng Thắng có tầng hầm để xe hoặc kho chứa đồ nằm ngay phía trên đường ống thoát chính, khiến việc tiếp cận bể phức tạp hơn nhà không có tầng hầm. Với trường hợp này, đội thợ khảo sát trước qua điện thoại hoặc hình ảnh chủ nhà gửi để chuẩn bị đúng thiết bị cần mang theo, tránh phải quay lại lần hai vì thiếu dụng cụ phù hợp với kết cấu riêng của từng nhà.</p>`,
    goiHeading: "Đăng Ký Hút Theo Dãy Cho Nhà Liền Kề Như Thế Nào",
    goiBody: `<p>Không bắt buộc các hộ trong dãy phải đăng ký cùng lúc. Một hộ có thể đặt lịch trước, sau đó đội thợ chủ động liên hệ các nhà lân cận cùng dãy để gộp lịch hút trong cùng một buổi, mỗi hộ vẫn thanh toán riêng theo dung tích bể nhà mình, không tính chung hóa đơn.</p>
<p>Với biệt thự đơn lẻ không nằm trong dãy liền kề, lịch hút vẫn được sắp xếp bình thường như nhà phố thông thường, không cần chờ ghép với nhà khác. Cách làm này giúp cả hai nhóm khách hàng – nhà liền kề theo dãy và biệt thự riêng lẻ – đều chủ động được thời gian phù hợp với mình.</p>
<p>Với nhà mới bàn giao chưa từng hút lần nào, nên khảo sát trước dù bể chưa có dấu hiệu đầy, vì một số công trình lắp sai vị trí nắp bể so với bản vẽ gốc trong quá trình thi công. Phát hiện sớm giúp lần hút đầu tiên diễn ra thuận lợi, không mất thời gian dò tìm khi bể đã đầy và cần xử lý gấp.</p>`,
    trustHeading: "Vì Sao Cư Dân Hùng Thắng Chọn Dịch Vụ Này",
    trustBody: `<p>Nhà liền kề và biệt thự mới xây thường còn bảo hành công trình, chủ nhà lo ngại việc đục phá sân vườn hoặc nền lát đá làm ảnh hưởng đến kết cấu mới. Đội thợ dò vị trí nắp bể bằng dụng cụ chuyên dụng trước khi đục, hạn chế tối đa diện tích phải mở, và lắp lại nguyên trạng lớp lát nền sau khi hoàn tất.</p>
<p>Giá được báo sau khi khảo sát dung tích bể thực tế, không đổi dù bể chôn sâu hơn dự kiến ban đầu. Với dãy nhà đăng ký theo gói, mỗi hộ nhận hóa đơn riêng minh bạch theo bể nhà mình, không phải chia đều chi phí với hàng xóm.</p>
<p>Toàn bộ bùn thải chở về điểm xử lý đúng quy định, không xả ra hệ thống thoát nước chung của khu đô thị – nơi cống thoát dùng chung cho nhiều hộ và dễ ảnh hưởng dây chuyền nếu xử lý sai cách. Bảo hành 30 ngày cho vấn đề mùi hôi tái phát sau khi hút.</p>
<p>Với nhà đang trong thời gian bảo hành xây dựng, thợ ghi lại rõ vị trí và cách thức mở nắp bể trong biên bản bàn giao đơn giản, giúp chủ nhà có căn cứ đối chiếu nếu đơn vị xây dựng cần kiểm tra lại công trình sau này, tránh nhầm lẫn giữa hư hỏng do thi công cũ và tác động từ lần hút bể.</p>`,
    maintenanceHeading: "Bảo Trì Bể Ngầm Bê Tông Đúng Chu Kỳ",
    maintenanceBody: `<p>Bể ngầm bê tông bền hơn bể gạch cũ nhưng không có nghĩa là không cần theo dõi. Nên kiểm tra định kỳ 2-3 năm/lần dù chưa thấy dấu hiệu đầy rõ ràng, vì bể chôn sâu khó quan sát trực tiếp như bể nổi, nhiều trường hợp bùn đã dâng cao nhưng chủ nhà không biết do không có mùi thoát ra ngoài.</p>
<p>Với dãy nhà liền kề xây cùng đợt, các hộ nên trao đổi thông tin lần hút gần nhất với nhau, vì bể thường xuống cấp gần đồng thời do cùng tuổi thọ công trình – phát hiện sớm ở một nhà có thể giúp các nhà lân cận chủ động kiểm tra trước khi xảy ra sự cố tương tự.</p>
<p>Sân vườn và lối lát đá phía trên bể ngầm nên tránh trồng cây có rễ ăn sâu ngay vị trí nắp bể, vì rễ cây lớn theo thời gian có thể làm nứt nắp bê tông hoặc chèn vào đường ống, gây khó khăn khi cần mở nắp kiểm tra hoặc hút định kỳ sau này.</p>
<p>Khi cải tạo sân vườn hoặc lắp thêm hạng mục ngoài trời như hồ cá, bếp nướng ngoài sân, chủ nhà nên xác nhận lại vị trí bể ngầm trước khi thi công, tránh xây đè lên đúng vị trí nắp bể khiến lần hút sau phải phá dỡ hạng mục mới lắp để tiếp cận.</p>`,
    quyTrinhSteps: [
      ["Gọi hotline", "mô tả địa chỉ, loại nhà (liền kề hay biệt thự), dung tích bể ước chừng – thợ báo giá sơ bộ và xác nhận thời gian đến."],
      ["Khảo sát tại chỗ", "dò vị trí nắp bể qua bản vẽ hoàn công hoặc thủ công, đo dung tích và kiểm tra van một chiều tại miệng bể."],
      ["Báo giá chính xác", "chốt giá dựa trên dung tích thực tế – không phát sinh sau khi đồng ý, kể cả khi bể chôn sâu hơn dự kiến."],
      ["Hút bể phốt", "dùng ống hút chuyên dụng chịu cột áp lớn, kiểm tra đường thoát sau khi hút xong."],
      ["Khử mùi và bàn giao", "xịt men vi sinh, lắp lại nắp và lớp lát nền nguyên trạng, tư vấn lịch hút định kỳ, bảo hành 30 ngày."],
    ],
    quyTrinhNote: "Với bể ngầm sâu, thợ kiểm tra van một chiều tại miệng bể trước khi hút để tránh nước trào ngược, và lắp lại nguyên trạng lớp lát nền sau khi hoàn tất.",
    caseMonth: "Tháng 5/2026", caseBody: "dãy 5 nhà liền kề khu đô thị Hùng Thắng hút bể phốt theo gói, mỗi bể 6m³. Xe bồn phục vụ 5 nhà trong một buổi sáng, tiết kiệm chi phí đi lại cho cả dãy. Tổng chi phí 4.500.000đ (900.000đ/nhà), bảo hành 30 ngày cho toàn bộ 5 hộ.",
    caseExtra: "Khi khảo sát dãy 5 nhà, thợ phát hiện 2 căn có nắp bể bị lát đè bởi gạch sân vườn không đúng vị trí bản vẽ ban đầu, đã dò lại và đánh dấu vị trí chính xác giúp chủ nhà thuận tiện hơn cho lần hút sau, không phải dò lại từ đầu.",
    faqOrig: [
      ["Có làm theo nhóm nhà liền kề không?", "Có – đặt lịch gói cho nhiều nhà cùng khu được ưu tiên giá và thời gian, tiết kiệm cho cả dãy phố. Chỉ cần một hộ liên hệ trước, đội thợ sẽ chủ động mời các nhà lân cận tham gia nếu muốn."],
      ["Bể phốt ngầm bê tông hút như thế nào?", "Thợ xác định vị trí nắp bể, dùng ống hút chuyên dụng phù hợp độ sâu. Bể ngầm sâu đến 3m vẫn hút được hoàn toàn. Với bể có nắp bị lát đè, thợ dò vị trí cẩn thận trước khi mở để tránh làm hỏng lớp lát nền phía trên."],
      ["Sau khi hút có cần khử mùi không?", "Có – thợ xịt men vi sinh ngay sau khi hút. Men vi sinh kích hoạt vi khuẩn có ích giúp phân hủy bùn còn lại và ngăn mùi hôi trong 30-60 ngày. Đây cũng là bước giúp duy trì hệ vi sinh trong bể ổn định cho chu kỳ sử dụng tiếp theo."],
    ],
    faqExtra: [
      ["Bể phốt khu đô thị mới Hùng Thắng có cần hút sớm hơn nhà cũ không?", "Không nhất thiết. Bể bê tông kín và bền hơn bể gạch cũ, chu kỳ hút thường 2-3 năm/lần với hộ gia đình thông thường. Chỉ cần hút sớm hơn nếu nhà có đông người ở hoặc kinh doanh tại nhà."],
      ["Đặt lịch hút cho cả dãy liền kề có cần các nhà đăng ký cùng lúc không?", "Không bắt buộc. Có thể đăng ký trước rồi thợ chủ động liên hệ các nhà lân cận để gộp lịch, mỗi hộ vẫn thanh toán riêng theo dung tích bể nhà mình."],
    ],
    khuVucBody: "Dịch vụ hút bể phốt phủ toàn bộ Hùng Thắng và các khu vực lân cận: Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên.",
  },
  3360: {
    slug: "hut-be-phot-tuan-chau", name: "Tuần Châu",
    title: "Hút Bể Phốt Tuần Châu – Resort, Biệt Thự, Xe Bồn Vào Đảo Nhanh",
    metaDesc: "Hút bể phốt Tuần Châu cho resort, biệt thự nghỉ dưỡng. Xe bồn 15m³, ưu tiên lịch trước mùa cao điểm. Gọi 0963.953.533 / 0931.156.756 để đặt lịch.",
    serviceDesc: "Dịch vụ hút bể phốt tại Tuần Châu, Hạ Long cho resort, biệt thự nghỉ dưỡng. Xe bồn công suất lớn, ưu tiên lịch trước mùa cao điểm, tiếp nhận 05:00-22:00 hằng ngày.",
    imgTop: img(3810, "hut-be-phot-tuan-chau-anh-dau-bai.webp", "Xe bồn hút bể phốt tại resort đảo Tuần Châu", "Xe bồn 15m³ phục vụ khu resort tại đảo Tuần Châu."),
    imgCase: img(3811, "hut-be-phot-tuan-chau-case-study.webp", "Thợ kiểm tra điểm mở bể trước khi hút bể phốt tại Tuần Châu", "Thợ kiểm tra hệ thống bể trước khi hút tại resort Tuần Châu."),
    imgBottom: img(3812, "hut-be-phot-tuan-chau-quy-trinh-thi-cong.webp", "Quy trình đưa ống hút bể phốt từ xe bồn tới điểm mở bể tại Tuần Châu", "Triển khai ống hút công suất lớn tại khu resort Tuần Châu."),
    intro1: "Đảo Tuần Châu tập trung nhiều resort, khách sạn và biệt thự nghỉ dưỡng. Dịch vụ hút bể phốt tại đây dùng xe bồn công suất lớn, ưu tiên nhận đặt lịch bảo trì trước mùa cao điểm hè và lễ Tết để resort chủ động, không bị động khi khách đông.",
    intro2: "Nhiều resort và hộ dân tại Tuần Châu gặp tình trạng bể phốt bốc mùi, tràn nước bẩn vì không hút định kỳ, đặc biệt khi công suất phòng tăng cao vào mùa du lịch. Xử lý đúng lịch giúp tránh sự cố bất ngờ giữa lúc đông khách và kéo dài tuổi thọ hệ thống bể phốt.",
    nguyenNhanBody: "Resort và khu nghỉ dưỡng Tuần Châu có hệ thống bể phốt công suất lớn, cần hút định kỳ 6 tháng-1 năm và có kế hoạch bảo trì trước mùa du lịch cao điểm.",
    nguyenNhanBullets: [
      ["Vi khuẩn phân hủy chậm", "dùng hóa chất tẩy rửa mạnh nhiều làm chết vi khuẩn có ích, bùn tích nhanh hơn."],
      ["Đường thoát nước mưa chung bể", "một số công trình cũ nối nhầm ống mưa vào bể phốt."],
      ["Bể phốt quá tải theo mùa", "công suất tính theo ngày thường, không đủ khi resort kín phòng vào cao điểm."],
    ],
    infraHeading: "Vì Sao Resort Cần Kế Hoạch Hút Trước Mùa Cao Điểm",
    infraBody: `<p>Đảo Tuần Châu tập trung nhiều resort, khách sạn và biệt thự nghỉ dưỡng, hệ thống bể phốt có công suất lớn hơn nhà dân thông thường để phục vụ lượng khách đông vào mùa hè. Khi resort hoạt động hết công suất phòng, tần suất sử dụng nước thải tăng gấp nhiều lần ngày thường, khiến bể phốt đầy nhanh hơn dự kiến nếu không hút trước mùa cao điểm.</p>
<p>Khác với nhà dân chỉ cần gọi khi có dấu hiệu đầy, resort và khách sạn tại Tuần Châu nên đặt lịch hút định kỳ trước các đợt lễ, Tết và mùa du lịch hè để tránh sự cố tràn bể ngay trong lúc đông khách – thời điểm khó sắp xếp xe bồn gấp vì nhu cầu chung của cả khu vực tăng cao. Đơn vị ưu tiên nhận đặt lịch bảo trì theo hợp đồng cho khách nghỉ dưỡng để chủ động điều xe trước cao điểm.</p>
<p>Đường vào đảo Tuần Châu rộng, xe bồn 15m³ di chuyển thuận lợi tới các khu resort và biệt thự ven biển. Với công trình có nhiều bể hoặc bể dung tích lớn, thợ có thể điều động xe hút nhiều lượt trong cùng một buổi để rút ngắn thời gian thi công, hạn chế ảnh hưởng đến hoạt động đón khách.</p>
<p>Một số resort tại Tuần Châu có khu bếp trung tâm và khu giặt là riêng, phát sinh nước thải có dầu mỡ hoặc hóa chất tẩy rửa công nghiệp nhiều hơn bể phốt nhà dân. Với hệ thống này, đội thợ khuyến nghị tách riêng bể xử lý nước thải bếp và bể phốt sinh hoạt nếu công trình chưa tách sẵn, giúp bể phốt chính không bị đầy nhanh do lẫn dầu mỡ từ khu bếp.</p>`,
    goiHeading: "Resort Nên Ký Hợp Đồng Bảo Trì Hay Gọi Từng Lần",
    goiBody: `<p>Với resort và khách sạn hoạt động quanh năm, ký hợp đồng bảo trì định kỳ giúp chủ động lịch hút trước mỗi mùa cao điểm mà không phải gọi gấp khi đã đông khách. Hợp đồng thường quy định trước số lần hút mỗi năm và ưu tiên điều xe trong 24 giờ khi có phát sinh ngoài lịch.</p>
<p>Với biệt thự đơn lẻ hoặc hộ gia đình tại Tuần Châu, gọi hút theo nhu cầu khi thấy dấu hiệu đầy là đủ, không cần ký hợp đồng dài hạn như resort. Cả hai hình thức đều dùng chung bảng giá minh bạch theo dung tích bể, không phân biệt cách đặt lịch.</p>
<p>Với resort mới đi vào hoạt động chưa có dữ liệu về tốc độ đầy bể thực tế, đội thợ tư vấn hút khảo sát lần đầu trước mùa cao điểm đầu tiên, ghi nhận tốc độ đầy theo công suất phòng thực tế, từ đó đề xuất số lần bảo trì phù hợp cho hợp đồng năm sau thay vì áp dụng số liệu chung chung của resort khác.</p>`,
    trustHeading: "Vì Sao Resort Tuần Châu Chọn Dịch Vụ Này",
    trustBody: `<p>Resort hoạt động liên tục nên điều quan trọng nhất là không gián đoạn dịch vụ đón khách trong lúc thi công. Đội thợ khảo sát và lên lịch hút vào khung giờ ít ảnh hưởng nhất theo lịch vận hành resort, phối hợp với bộ phận kỹ thuật để biết trước vị trí các bể và đường ống liên quan.</p>
<p>Giá được báo theo dung tích thực tế đo tại chỗ, không tính phát sinh ngoài hợp đồng đã thống nhất. Với công trình có nhiều bể, xe bồn 15m³ có thể điều động nhiều lượt trong cùng buổi để rút ngắn tổng thời gian thi công so với chia làm nhiều ngày riêng lẻ.</p>
<p>Toàn bộ bùn thải chở về đúng điểm xử lý theo quy định môi trường – yếu tố nhiều resort quan tâm vì liên quan trực tiếp đến cam kết vận hành bền vững với khách lưu trú. Bảo hành 30 ngày cho vấn đề mùi hôi tái phát sau khi hút.</p>
<p>Với hợp đồng bảo trì dài hạn, resort được cung cấp lịch sử các lần hút trước (ngày hút, dung tích, ghi chú tình trạng bể) để bộ phận kỹ thuật resort chủ động đối chiếu, thay vì phải hỏi lại đơn vị cung cấp dịch vụ mỗi khi cần báo cáo nội bộ về công tác bảo trì hạ tầng.</p>`,
    maintenanceHeading: "Lên Kế Hoạch Bảo Trì Theo Mùa Du Lịch",
    maintenanceBody: `<p>Với resort và khu nghỉ dưỡng, thời điểm hút bể phốt lý tưởng nhất là ngay trước mùa cao điểm, không phải trong lúc đang cao điểm. Nên lên lịch bảo trì cố định vào cuối mùa thấp điểm hằng năm, khi công suất phòng còn thấp và việc thi công ít ảnh hưởng đến khách lưu trú.</p>
<p>Với biệt thự nghỉ dưỡng cho thuê theo mùa, nên kiểm tra bể phốt trước mỗi đợt cho thuê dài ngày, đặc biệt nếu biệt thự để trống nhiều tháng trước đó – bể không sử dụng lâu ngày đôi khi có hiện tượng đóng váng bề mặt cần xử lý trước khi khách vào ở.</p>
<p>Nhân viên vận hành resort nên được hướng dẫn nhận biết sớm dấu hiệu bất thường như mùi nhẹ ở khu vực gần bể hoặc thoát nước chậm ở một dãy phòng cụ thể, để báo trước khi tình trạng lan rộng ảnh hưởng đến trải nghiệm khách lưu trú trong mùa cao điểm.</p>
<p>Với resort tổ chức sự kiện, tiệc cưới hoặc hội nghị đông người trong thời gian ngắn, nên xem xét hút bảo trì trước sự kiện lớn nếu bể đã gần đến chu kỳ hút, tránh tình trạng lượng khách tăng đột biến trong một ngày làm bể quá tải ngay giữa sự kiện.</p>`,
    quyTrinhSteps: [
      ["Gọi hotline", "mô tả địa chỉ, loại hình (resort hay biệt thự), số lượng và dung tích bể ước chừng – thợ báo giá sơ bộ và xác nhận thời gian đến."],
      ["Khảo sát tại chỗ", "kiểm tra toàn bộ hệ thống bể, đo dung tích, xác định mức bùn của từng bể nếu công trình có nhiều bể."],
      ["Báo giá chính xác", "chốt giá dựa trên dung tích thực tế và số lượt xe cần điều động – không phát sinh sau khi đồng ý."],
      ["Hút bể phốt", "xe bồn 15m³ hút toàn bộ bùn nước, có thể chia nhiều lượt trong cùng buổi nếu công suất bể lớn."],
      ["Khử mùi và bàn giao", "xịt men vi sinh, đậy nắp bể, tư vấn lịch bảo trì trước mùa cao điểm, bảo hành 30 ngày."],
    ],
    quyTrinhNote: "Với resort có nhiều bể hoặc bể dung tích lớn, thợ lên lịch hút nhiều lượt trong một buổi và phối hợp với bộ phận vận hành để không ảnh hưởng giờ đón khách.",
    caseMonth: "Tháng 1/2026", caseBody: "khu resort 50 phòng tại Tuần Châu chuẩn bị mùa hè ký hợp đồng hút bể phốt trước lễ. Xe bồn 15m³ hút 2 lần (30m³ tổng), dọn sạch toàn bộ hệ thống, khử mùi bằng men vi sinh. Resort hoạt động suốt mùa hè không sự cố, chi phí 2.400.000đ.",
    caseExtra: "Trước khi hút, thợ kiểm tra thêm hệ thống bể dự phòng của resort để xác nhận còn hoạt động tốt, đảm bảo trong lúc hút bể chính, khách vẫn sử dụng nhà vệ sinh bình thường mà không gián đoạn dịch vụ đón khách.",
    faqOrig: [
      ["Resort, khách sạn có hợp đồng dịch vụ không?", "Có – cung cấp hợp đồng bảo trì bể phốt định kỳ cho resort, khách sạn tại Tuần Châu, ưu tiên điều xe theo lịch đã cam kết. Hợp đồng có thể điều chỉnh số lần hút mỗi năm theo công suất phòng thực tế của resort."],
      ["Xe bồn vào đảo Tuần Châu có khó không?", "Không – đường vào Tuần Châu rộng, xe bồn 15m³ vào được. Thợ quen đường nội bộ khu resort và biệt thự tại đây, kể cả các khu mới xây chưa có nhiều thông tin công khai."],
      ["Sau khi hút có cần khử mùi không?", "Có – thợ xịt men vi sinh ngay sau khi hút. Men vi sinh kích hoạt vi khuẩn có ích giúp phân hủy bùn còn lại và ngăn mùi hôi trong 30-60 ngày. Với resort, có thể xịt bổ sung tại các khu vực nhạy cảm gần sảnh đón khách nếu cần."],
    ],
    faqExtra: [
      ["Resort tại Tuần Châu nên đặt lịch hút định kỳ trước mùa hè bao lâu?", "Nên đặt lịch trước 3-4 tuần trước cao điểm hè hoặc lễ Tết để chủ động thời gian xe bồn, tránh tình trạng nhiều đơn vị cùng đặt gấp trong mùa cao điểm."],
      ["Biệt thự đơn lẻ ở Tuần Châu có cần xe bồn lớn như resort không?", "Không cần. Biệt thự gia đình dùng bể dung tích tương đương nhà dân thông thường, xe bồn cỡ vừa vẫn xử lý gọn; xe 15m³ chủ yếu phục vụ resort, khách sạn có công suất phòng lớn."],
    ],
    khuVucBody: "Dịch vụ hút bể phốt phủ toàn bộ Tuần Châu và các khu vực lân cận: Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên.",
  },
};

function buildContent(ward, pageUrl) {
  const bullets = ward.nguyenNhanBullets.map(([t, d]) => `<li><strong>${t}:</strong> ${d}</li>`).join("\n");
  const steps = ward.quyTrinhSteps.map(([t, d]) => `<li><strong>${t}:</strong> ${d}</li>`).join("\n");
  const faqAll = [...ward.faqOrig, ...ward.faqExtra]
    .map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n");

  return `<!-- wp:html -->
<div class="service-page">

<p>${ward.intro1}</p>

<p>${ward.intro2}</p>
${serviceSchema(pageUrl, ward)}
${ward.imgTop}


<h2>Dấu Hiệu Cần Gọi Thợ Ngay</h2>
<ul>
<li><strong>Mùi hôi từ nhà vệ sinh:</strong> khí H2S từ bể phốt đầy thoát ngược lên xi phông.</li>
<li><strong>Cống thoát chậm toàn bộ nhà:</strong> bể phốt gần đầy, nước không thoát được.</li>
<li><strong>Nước bẩn trào ra hố ga:</strong> dấu hiệu bể phốt đã quá tải.</li>
<li><strong>Đã hơn 2-3 năm chưa hút:</strong> kể cả chưa có triệu chứng rõ, bùn đáy đã đặc cần xử lý.</li>
</ul>

<h2>Nguyên Nhân Bể Phốt Tại ${ward.name} Nhanh Đầy</h2>
<p>${ward.nguyenNhanBody}</p>
<ul>
${bullets}
</ul>

<h2>${ward.infraHeading}</h2>
${ward.infraBody}

<h2>Cam Kết 3 Không Với Khách Hàng</h2>
<ul>
<li><strong>Không xả bừa ra môi trường:</strong> xe bồn chở bùn về điểm xử lý đúng quy định, không xả ra cống/sông.</li>
<li><strong>Không ép phát sinh chi phí:</strong> báo giá rõ trước khi hút, đo thực tế dung tích bể.</li>
<li><strong>Không để lại mùi sau khi hút:</strong> xịt men vi sinh khử mùi sau khi hút, bảo hành 30 ngày nếu mùi tái phát.</li>
</ul>

<h2>${ward.trustHeading}</h2>
${ward.trustBody}

<h2>Bảng Giá Tham Khảo Theo Dung Tích Bể</h2>
<table>
<tr><th>Dung tích bể phốt</th><th>Đơn giá</th></tr>
<tr><td>Dưới 3m³</td><td>400.000 – 600.000đ</td></tr>
<tr><td>3 – 5m³</td><td>600.000 – 900.000đ</td></tr>
<tr><td>5 – 10m³</td><td>900.000 – 1.500.000đ</td></tr>
<tr><td>Trên 10m³ (nhà hàng, resort)</td><td>1.500.000 – 3.000.000đ</td></tr>
</table>
<p><em>Giá trên là tham khảo. Thợ đo thực tế và báo giá chính xác tại nhà trước khi hút. Không phát sinh thêm.</em></p>
<p>Giá thực tế phụ thuộc vào ba yếu tố chính: dung tích bể đo được, độ đặc của bùn đáy bể và khoảng cách xe bồn phải di chuyển ống hút để tiếp cận bể. Bể càng lâu chưa hút, bùn càng đặc, thời gian hút càng lâu dù dung tích bể không đổi. Vì vậy giá chỉ được chốt sau khi thợ khảo sát trực tiếp, không báo giá qua điện thoại cho trường hợp chưa rõ tình trạng bể.</p>

<h2>${ward.goiHeading}</h2>
${ward.goiBody}

<h2>Quy Trình Xử Lý 5 Bước</h2>
<ol>
${steps}
</ol>
<p>${ward.quyTrinhNote}</p>

<h2>${ward.maintenanceHeading}</h2>
${ward.maintenanceBody}

<h2>Câu Chuyện Thực Tế Tại ${ward.name}</h2>
<p>${ward.caseMonth}, ${ward.caseBody} ${ward.caseExtra}</p>
${ward.imgCase}

<h2>Khu Vực Phục Vụ</h2>
<p>${ward.khuVucBody} Đội thợ cơ động trong khung 05:00-22:00 hằng ngày, xe bồn luôn sẵn sàng. Gọi ngay <strong>0963.953.533</strong> hoặc <strong>0931.156.756</strong>.</p>

<h2>Câu Hỏi Thường Gặp</h2>
${faqAll}

<h2>Thông Tin Liên Hệ</h2>
<address>
<strong>Thông Tắc Cống Quảng Ninh</strong><br>
Địa chỉ: Phường Hùng Thắng, TP. Hạ Long, Quảng Ninh<br>
Hotline: <a href="tel:0963953533">0963.953.533</a> – <a href="tel:0931156756">0931.156.756</a><br>
Email: lienhe@thongtaccongquangninh.com<br>
Giờ tiếp nhận: 05:00-22:00 hằng ngày, kể cả ngày lễ, Tết
</address>

</div>
<!-- /wp:html -->
${ward.imgBottom}`;
}

function approxWordCount(html) {
  const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
  return text.split(/\s+/).filter(Boolean).length;
}

async function fetchPage(id) {
  const res = await request("GET", `/wp-json/wp/v2/pages/${id}?context=edit`, auth);
  if (res.status !== 200) throw new Error(`GET ${id} failed: ${res.status} ${res.text.slice(0, 200)}`);
  return JSON.parse(res.text);
}

async function updatePage(id, ward) {
  const page = await fetchPage(id);
  const oldContent = page.content.raw;
  const oldTitle = page.title.raw;
  const pageUrl = page.link;

  const content = buildContent(ward, pageUrl);
  const check = {
    approxWords: approxWordCount(content),
    hasForbidden: /chuyên nghiệp|uy tín|hàng đầu|tận tâm/i.test(content),
    has247Wrong: /24\/7/.test(content),
    hasServiceSchema: content.includes('"@type":"Service"'),
    keywordExactCount: (content.match(new RegExp(`[Hh]út bể phốt ${ward.name}\\b`, "g")) || []).length,
  };

  if (DRY) {
    return { id, ward: ward.name, oldTitle, newTitle: ward.title, oldLen: oldContent.length, newLen: content.length, status: "DRY", ...check };
  }

  const payload = {
    title: ward.title,
    content,
    meta: { rank_math_description: ward.metaDesc, rank_math_focus_keyword: `hút bể phốt ${ward.name.toLowerCase()}` },
  };
  const res = await request("POST", `/wp-json/wp/v2/pages/${id}`, auth, payload);
  return { id, ward: ward.name, oldTitle, newTitle: ward.title, oldLen: oldContent.length, newLen: content.length, status: res.status, resText: res.text.slice(0, 300), ...check };
}

const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
const backupDir = `${ROOT}/backups/fix-4-hbp-wards-${stamp}`;
if (!DRY) mkdirSync(backupDir, { recursive: true });

const results = [];
for (const [id, ward] of Object.entries(WARDS)) {
  if (!DRY) {
    const page = await fetchPage(Number(id));
    writeFileSync(`${backupDir}/${id}.json`, JSON.stringify({ id: Number(id), title: page.title.raw, content: page.content.raw, link: page.link }, null, 2), "utf8");
  }
  const r = await updatePage(Number(id), ward);
  console.log(`[${r.status}] id=${r.id} ${r.ward} | words=${r.approxWords} forbidden=${r.hasForbidden} wrong247=${r.has247Wrong} service=${r.hasServiceSchema} kwCount=${r.keywordExactCount}`);
  results.push(r);
}

if (!DRY) {
  writeFileSync(`${ROOT}/reports/fix-4-hbp-wards-${stamp}.json`, JSON.stringify(results, null, 2), "utf8");
  console.log("Backup dir:", backupDir);
  console.log("Report:", `reports/fix-4-hbp-wards-${stamp}.json`);
}
