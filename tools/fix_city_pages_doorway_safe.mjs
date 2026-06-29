import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const HOTLINE = "0963.953.533 / 0931.156.756";
const BASE = "https://thongtaccongquangninh.com";
const DRY_RUN = process.argv.includes("--dry-run");
const SELECTED = new Set(process.argv.slice(2).filter((arg) => !arg.startsWith("--")));
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];

const pages = [
  {
    id: 52,
    type: "pages",
    slug: "hut-be-phot-ha-long",
    service: "hut",
    keyword: "hút bể phốt Hạ Long",
    area: "Hạ Long",
    title: "Hút bể phốt Hạ Long 24/7, xe bồn có mặt nhanh",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/xe-hut-be-phot-chuyen-dung-quang-ninh-02.webp",
    imageAlt: "hút bể phốt Hạ Long bằng xe bồn chuyên dụng",
    local: ["Bãi Cháy", "Hòn Gai", "Cao Xanh", "Cao Thắng", "Tuần Châu", "Hồng Hải", "Hồng Hà", "Giếng Đáy", "Hà Khẩu"],
    localBrief: [
      "Hạ Long có nhiều khách sạn, homestay, nhà hàng ven vịnh và nhà dân nằm trên tuyến dốc. Các điểm ở Bãi Cháy, Hòn Gai, Tuần Châu thường cần kéo ống xa hoặc chọn vị trí đỗ xe tránh cản lối.",
      "Nhóm Cao Xanh, Cao Thắng, Hồng Hải và Hồng Hà hay gặp nhà trong ngõ, sân hẹp, bể nằm phía sau nhà. Khi tiếp nhận ca, kỹ thuật hỏi rõ khoảng cách từ xe đến nắp bể để mang đủ ống.",
      "Khu Giếng Đáy, Hà Khẩu và Việt Hưng có cả nhà dân cũ lẫn công trình mới. Bể xây lâu năm thường có bùn đặc, còn công trình mới lại dễ sai độ dốc hoặc thông hơi kém.",
      "Với nhà hàng ven biển, thời điểm xử lý cần tránh giờ đông khách. Đội xe thường hẹn khung giờ tối muộn hoặc sáng sớm, hút gọn và vệ sinh lại khu thao tác.",
    ],
    caseTitle: "nhà nghỉ tại Bãi Cháy",
    caseDetail: "Ca thực tế là một nhà nghỉ gần trục Bãi Cháy, bồn cầu tầng trệt rút chậm sau nhiều ngày kín phòng. Xe không vào sát nắp bể nên đội kỹ thuật kéo ống qua sân sau, hút lớp bùn đặc trước rồi kiểm tra lại hố ga bếp. Sau khi xả thử, nước thoát đều, mùi hôi giảm rõ và chủ nhà được nhắc lịch kiểm tra định kỳ trước mùa cao điểm du lịch.",
    related: ["/hut-be-phot/", "/thong-tac-cong-ha-long/", "/thong-tac-bon-cau-ha-long/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
  },
  {
    id: 54,
    type: "pages",
    slug: "hut-be-phot-uong-bi",
    service: "hut",
    keyword: "hút bể phốt Uông Bí",
    area: "Uông Bí",
    title: "Hút bể phốt Uông Bí 24/7, xe bồn có mặt nhanh",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/xe-hut-be-phot-chuyen-dung-quang-ninh-02.webp",
    imageAlt: "hút bể phốt Uông Bí bằng xe bồn chuyên dụng",
    local: ["Quang Trung", "Trưng Vương", "Thanh Sơn", "Yên Thanh", "Phương Đông", "Phương Nam", "Nam Khê", "Vàng Danh", "Yên Tử"],
    localBrief: [
      "Uông Bí có nhiều nhà trọ, khu dân cư cũ, hàng quán gần tuyến du lịch Yên Tử và khu vực phục vụ công nhân. Bể phốt thường chịu tải cao vào cuối tuần, ngày lễ hoặc giờ tan ca.",
      "Quang Trung, Trưng Vương và Thanh Sơn có nhiều tuyến phố đông, chỗ đỗ xe phải tính trước. Kỹ thuật thường hỏi vị trí nắp bể, xe có đỗ sát được không và có cần kéo ống qua sân hay không.",
      "Yên Thanh, Phương Đông, Phương Nam, Nam Khê và Vàng Danh có cả nhà ở, nhà xưởng nhỏ và khu trọ. Một số bể lâu năm có nắp bị che dưới nền, cần xác định điểm mở trước khi điều xe.",
      "Khu gần Yên Tử hay có nhà hàng, nhà nghỉ và điểm kinh doanh theo mùa. Với nhóm này, thời gian xử lý cần gọn để không ảnh hưởng khách đang lưu trú hoặc ăn uống.",
    ],
    caseTitle: "nhà trọ tại phường Quang Trung",
    caseDetail: "Một dãy trọ ở Quang Trung gọi vì nhiều phòng cùng bốc mùi sau mưa, bồn cầu phòng cuối rút chậm. Đội xe kiểm tra thấy bể đầy bùn, hố ga phía sau có nước đen và nhiều váng. Thợ hút bể trước, sau đó xả thử từng phòng để tìm nhánh thoát yếu. Chủ trọ được hướng dẫn nhắc người thuê không xả khăn ướt và đặt lịch hút sớm hơn do lượng người dùng cao.",
    related: ["/hut-be-phot-quang-ninh/", "/thong-tac-cong-uong-bi/", "/thong-tac-bon-cau-quang-ninh/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
  },
  {
    id: 57,
    type: "pages",
    slug: "hut-be-phot-quang-yen",
    service: "hut",
    keyword: "hút bể phốt Quảng Yên",
    area: "Quảng Yên",
    title: "Hút bể phốt Quảng Yên 24/7, xe bồn có mặt nhanh",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/xe-hut-be-phot-chuyen-dung-quang-ninh-02.webp",
    imageAlt: "hút bể phốt Quảng Yên bằng xe bồn chuyên dụng",
    local: ["Hà An", "Đông Mai", "Minh Thành", "Sông Khoai", "Cộng Hòa", "Tiền An", "Tân An", "Hoàng Tân"],
    localBrief: [
      "Quảng Yên có nhiều khu dân cư mới, nhà xưởng, tuyến đường làng nhỏ và khu vực gần công nghiệp. Điều quan trọng là chọn xe và chiều dài ống phù hợp để không làm ảnh hưởng lối đi chung.",
      "Hà An, Đông Mai, Minh Thành và Sông Khoai thường có nhà ở xen khu sản xuất, bể nằm sau sân hoặc sát hố ga. Kỹ thuật cần hỏi trước điểm mở bể để tránh mất thời gian tìm nắp.",
      "Cộng Hòa, Tiền An, Tân An và Hoàng Tân có nhiều tuyến dân cư thấp, cống thoát chịu ảnh hưởng triều và mưa. Khi bể đầy kèm nước chậm, cần kiểm tra cả hố ga lẫn cống nhánh.",
      "Một số khu đô thị mới tại Quảng Yên có bể thiết kế nhỏ so với số người ở thực tế. Nếu chỉ thông bồn cầu mà không hút bể, mùi và trào ngược có thể quay lại nhanh.",
    ],
    caseTitle: "khu dân cư Hà An",
    caseDetail: "Một hộ tại Hà An báo bể phốt đầy, sân sau có mùi và hố ga nổi bọt. Xe phải đỗ ngoài đường làng, đội thợ nối thêm ống để hút qua lối phụ. Sau khi hút bùn đặc, kỹ thuật mở hố ga gần bếp kiểm tra lớp mỡ đóng bám và khuyên chủ nhà nạo vét riêng. Ca này xử lý xong trong buổi chiều, không phải tháo nền hay di chuyển nhiều đồ trong nhà.",
    related: ["/hut-be-phot-quang-ninh/", "/thong-tac-cong-quang-yen/", "/thong-tac-bon-cau-quang-ninh/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
  },
  {
    id: 53,
    type: "pages",
    slug: "hut-be-phot-cam-pha",
    service: "hut",
    keyword: "hút bể phốt Cẩm Phả",
    area: "Cẩm Phả",
    title: "Hút bể phốt Cẩm Phả 24/7, xe bồn có mặt nhanh",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/xe-hut-be-phot-chuyen-dung-quang-ninh-02.webp",
    imageAlt: "hút bể phốt Cẩm Phả bằng xe bồn chuyên dụng",
    local: ["Cửa Ông", "Cẩm Trung", "Cẩm Thành", "Cẩm Thủy", "Cẩm Bình", "Quang Hanh", "Mông Dương", "Cẩm Sơn"],
    localBrief: [
      "Cẩm Phả có nhiều khu dân cư gần mỏ, khu công nhân, nhà hàng ven biển và nhà xây lâu năm. Bể phốt ở các điểm này thường nhanh đầy do lượng người dùng cao và bùn lắng nặng.",
      "Cửa Ông, Cẩm Trung, Cẩm Thành, Cẩm Thủy và Cẩm Bình có nhiều tuyến đông xe, việc đỗ xe bồn phải gọn. Khi gọi, khách nên báo có thể đỗ trước cửa hay phải kéo ống từ đầu ngõ.",
      "Quang Hanh, Mông Dương và Cẩm Sơn có nhà trong ngõ, đường dốc hoặc công trình sát đồi. Một số ca cần nối ống dài và đi theo lối phụ để không ảnh hưởng sinh hoạt.",
      "Nhà hàng ven biển ở Cẩm Phả hay gặp bể đầy kèm hố ga bếp có mỡ. Đội kỹ thuật cần tách rõ phần hút bể và phần nạo vét hố ga để báo giá đúng.",
    ],
    caseTitle: "nhà dân tại Cửa Ông",
    caseDetail: "Một hộ tại Cửa Ông gọi vì bồn cầu trào nhẹ, mùi hôi xuất hiện sau mưa lớn. Đội xe phát hiện bể dùng lâu năm, bùn đặc và hố ga ngoài sân có cặn đen. Thợ hút theo từng lớp, tránh trào bẩn ra sân, sau đó kiểm tra thoát sàn nhà tắm. Chủ nhà được nhắc không xả giấy dày và theo dõi thêm hố ga nếu mưa kéo dài.",
    related: ["/hut-be-phot-quang-ninh/", "/thong-tac-cong-cam-pha/", "/thong-tac-bon-cau-cam-pha/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
  },
  {
    id: 296,
    type: "pages",
    slug: "thong-tac-cong-ha-long",
    service: "cong",
    keyword: "thông tắc cống Hạ Long",
    area: "Hạ Long",
    title: "Thông tắc cống Hạ Long 24/7, không đục phá",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/ky-thuat-thong-tac-cong-dan-dung-quang-ninh-01.webp",
    imageAlt: "thông tắc cống Hạ Long bằng máy lò xo",
    local: ["Bãi Cháy", "Hòn Gai", "Cao Xanh", "Cao Thắng", "Tuần Châu", "Hồng Hải", "Hồng Hà", "Giếng Đáy", "Hà Khẩu"],
    localBrief: [
      "Hạ Long có nhiều nhà hàng, khách sạn, homestay, nhà trong ngõ dốc và khu dân cư ven vịnh. Cống bếp, thoát sàn và hố ga thường chịu tải mạnh vào cuối tuần hoặc mùa du lịch.",
      "Bãi Cháy và Tuần Châu hay gặp tắc do dầu mỡ nhà hàng, tóc, cặn xà phòng và rác nhỏ. Nếu nước trào ở giờ đông khách, cần xử lý nhanh nhưng không làm bẩn khu kinh doanh.",
      "Hòn Gai, Cao Xanh, Cao Thắng, Hồng Hải và Hồng Hà có nhiều nhà dân cũ, đường ống cải tạo nhiều lần. Điểm nghẹt có thể nằm sâu ở ống nhánh hoặc hố ga chứ không nằm ngay miệng thoát.",
      "Giếng Đáy, Hà Khẩu và Việt Hưng có nhà mới lẫn nhà trọ. Một số tuyến cống thấp, sau mưa nước thoát chậm nên cần kiểm tra hố ga trước khi dùng máy.",
    ],
    caseTitle: "quán ăn tại Bãi Cháy",
    caseDetail: "Một quán ăn Bãi Cháy gọi vì thoát sàn bếp trào nước đục trước giờ mở cửa. Kỹ thuật kiểm tra thấy dầu mỡ đóng ở đoạn ống nhánh và hố ga có váng dày. Thợ dùng máy lò xo xử lý điểm nghẹt, sau đó vét lớp mỡ nổi trong hố ga. Chủ quán được nhắc đặt lưới chắn rác và tách dầu mỡ trước khi xả để giảm tắc lại.",
    related: ["/thong-tac-cong-quang-ninh/", "/hut-be-phot-ha-long/", "/thong-tac-bon-cau-ha-long/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
  },
  {
    id: 400,
    type: "pages",
    slug: "thong-tac-cong-cam-pha",
    service: "cong",
    keyword: "thông tắc cống Cẩm Phả",
    area: "Cẩm Phả",
    title: "Thông tắc cống Cẩm Phả 24/7, không đục phá",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/ky-thuat-thong-tac-cong-dan-dung-quang-ninh-01.webp",
    imageAlt: "thông tắc cống Cẩm Phả bằng máy lò xo",
    local: ["Cửa Ông", "Cẩm Trung", "Cẩm Thành", "Cẩm Thủy", "Cẩm Bình", "Quang Hanh", "Mông Dương", "Cẩm Sơn"],
    localBrief: [
      "Cẩm Phả có nhà dân gần mỏ, khu công nhân, quán ăn ven biển và nhiều tuyến ngõ hẹp. Cống tắc thường đi kèm bùn đen, cặn than, dầu mỡ bếp hoặc hố ga lâu ngày chưa nạo vét.",
      "Cửa Ông, Cẩm Trung và Cẩm Thành có nhiều nhà cũ, ống thoát có đoạn co gấp hoặc nối thêm sau cải tạo. Khi nước rút chậm nhiều điểm cùng lúc, cần kiểm tra cả tuyến chính.",
      "Cẩm Thủy, Cẩm Bình, Quang Hanh, Mông Dương và Cẩm Sơn có nhiều lối dốc, việc đưa máy và ống vào phải gọn. Thợ ưu tiên xử lý từ hố ga hoặc miệng thoát có sẵn.",
      "Nhà hàng ven biển Cẩm Phả dễ tắc cống bếp do dầu mỡ. Nếu chỉ dùng hóa chất, lớp mỡ có thể dồn sâu hơn và làm mùi nặng vào ngày nóng.",
    ],
    caseTitle: "nhà dân tại Cửa Ông",
    caseDetail: "Một nhà dân tại Cửa Ông bị nước nhà tắm trào ngược sau mưa, bồn rửa bếp cũng rút chậm. Đội thợ kiểm tra hố ga thấy bùn đen và cặn đặc. Máy lò xo được đưa qua hố ga trước, sau đó xả thử từng điểm thoát trong nhà. Ca này không phải đục nền, nhưng khách được nhắc nạo vét hố ga định kỳ vì tuyến thoát nhận nhiều bùn.",
    related: ["/thong-tac-cong-quang-ninh/", "/hut-be-phot-cam-pha/", "/thong-tac-bon-cau-cam-pha/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
  },
  {
    id: 405,
    type: "pages",
    slug: "thong-tac-cong-uong-bi",
    service: "cong",
    keyword: "thông tắc cống Uông Bí",
    area: "Uông Bí",
    title: "Thông tắc cống Uông Bí 24/7, không đục phá",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/ky-thuat-thong-tac-cong-dan-dung-quang-ninh-01.webp",
    imageAlt: "thông tắc cống Uông Bí bằng máy lò xo",
    local: ["Quang Trung", "Trưng Vương", "Thanh Sơn", "Yên Thanh", "Phương Đông", "Phương Nam", "Nam Khê", "Vàng Danh", "Yên Tử"],
    localBrief: [
      "Uông Bí có khu dân cư cũ, nhà trọ, hàng quán gần tuyến du lịch và khu công nghiệp. Cống tắc thường xuất hiện ở bếp, nhà tắm, thoát sàn khu trọ hoặc hố ga sau nhà.",
      "Quang Trung, Trưng Vương và Thanh Sơn có mật độ nhà ở cao, nhiều tuyến xe dừng khó. Đội kỹ thuật cần hỏi trước điểm đỗ và lối vào để mang máy gọn.",
      "Yên Thanh, Nam Khê, Vàng Danh, Phương Đông và Phương Nam có nhiều nhà trọ, khu công nhân và cơ sở ăn uống. Rác nhỏ, tóc và dầu mỡ là nhóm nguyên nhân thường gặp.",
      "Gần Yên Tử, nhà nghỉ và quán ăn có lượng khách theo mùa. Khi cống nghẹt vào cuối tuần, cần xử lý theo khung giờ không làm gián đoạn phục vụ.",
    ],
    caseTitle: "nhà trọ tại Yên Thanh",
    caseDetail: "Một dãy trọ tại Yên Thanh có ba phòng cùng thoát sàn chậm, mùi hôi lên mạnh buổi tối. Thợ kiểm tra hố ga chung thấy tóc, rác nhỏ và cặn xà phòng bám dày. Sau khi dùng máy lò xo thông tuyến nhánh, đội xả thử từng phòng và hướng dẫn chủ trọ gắn lưới chắn rác. Ca này xử lý trong ngày, không cần tháo gạch.",
    related: ["/thong-tac-cong-quang-ninh/", "/hut-be-phot-uong-bi/", "/thong-tac-bon-cau-quang-ninh/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
  },
  {
    id: 424,
    type: "pages",
    slug: "thong-tac-cong-quang-yen",
    service: "cong",
    keyword: "thông tắc cống Quảng Yên",
    area: "Quảng Yên",
    title: "Thông tắc cống Quảng Yên 24/7, không đục phá",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/ky-thuat-thong-tac-cong-dan-dung-quang-ninh-01.webp",
    imageAlt: "thông tắc cống Quảng Yên bằng máy lò xo",
    local: ["Hà An", "Đông Mai", "Minh Thành", "Sông Khoai", "Cộng Hòa", "Tiền An", "Tân An", "Hoàng Tân"],
    localBrief: [
      "Quảng Yên có khu dân cư mới, đường làng nhỏ, nhà xưởng và khu vực chịu ảnh hưởng nước thấp. Cống tắc có thể do rác sinh hoạt, bùn đất, dầu mỡ hoặc tuyến hố ga quá tải.",
      "Hà An, Đông Mai, Minh Thành và Sông Khoai có nhiều nhà dân xen khu sản xuất. Khi thoát sàn và bồn cầu cùng rút chậm, thợ cần kiểm tra cả hố ga chứ không xử lý riêng miệng cống.",
      "Cộng Hòa, Tiền An, Tân An và Hoàng Tân có một số đường hẹp, xe lớn không vào sát. Đội thợ ưu tiên mang máy lò xo và dụng cụ gọn trước, chỉ gọi xe khi cần hút bùn/hố ga.",
      "Khu đô thị mới tại Quảng Yên đôi khi gặp lỗi độ dốc ống hoặc cát xây dựng còn trong tuyến thoát. Trường hợp này cần xả kiểm tra kỹ sau khi thông để tránh tắc lại.",
    ],
    caseTitle: "khu dân cư Hà An",
    caseDetail: "Một hộ tại Hà An báo nước bếp trào ra sân sau, hố ga nổi váng và có mùi. Thợ kiểm tra thấy ống nhánh bếp bị mỡ bám, hố ga thấp bị bùn lắng. Đội xử lý bằng máy lò xo trước, sau đó xả nước mạnh để kiểm tra dòng thoát. Chủ nhà được khuyên nạo vét hố ga khi lớp bùn tăng và không đổ dầu mỡ trực tiếp xuống chậu rửa.",
    related: ["/thong-tac-cong-quang-ninh/", "/hut-be-phot-quang-yen/", "/thong-tac-bon-cau-quang-ninh/", "/cau-hoi-thuong-gap-thong-tac-cong/", "/lien-he/"],
  },
];

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function escapeHtml(input) {
  return String(input).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function inlineMd(input) {
  return escapeHtml(input)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let list = [];
  let table = [];

  const flushParagraph = () => {
    if (paragraph.length) out.push(`<p>${inlineMd(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) out.push(`<ul>${list.map((item) => `<li>${inlineMd(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .filter((row) => !/^\|\s*-+/.test(row))
      .map((row) => row.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
    if (rows.length) {
      const [head, ...body] = rows;
      out.push(
        `<table><thead><tr>${head.map((cell) => `<th>${inlineMd(cell)}</th>`).join("")}</tr></thead><tbody>${body
          .map((row) => `<tr>${row.map((cell) => `<td>${inlineMd(cell)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table>`
      );
    }
    table = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }
    if (line.startsWith("|")) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    flushTable();
    const img = line.match(/^!\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (img) {
      flushParagraph();
      flushList();
      out.push(`<figure class="wp-block-image"><img src="${img[2]}" alt="${escapeHtml(img[1])}"/></figure>`);
    } else if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
    } else if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      out.push(`<h3>${inlineMd(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      out.push(`<h2>${inlineMd(line.slice(3))}</h2>`);
    } else if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2));
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  flushTable();
  return out.join("\n");
}

function stripHtml(input) {
  return String(input ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function words(input) {
  return stripHtml(input).match(/[\p{L}\p{N}]+(?:[-./][\p{L}\p{N}]+)*/gu) ?? [];
}

function normalize(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
}

function shingles(input, size = 5) {
  const w = words(input).map((word) => normalize(word));
  const set = new Set();
  for (let i = 0; i <= w.length - size; i++) set.add(w.slice(i, i + size).join(" "));
  return set;
}

function jaccard(a, b) {
  let inter = 0;
  for (const value of a) if (b.has(value)) inter++;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function faqItems(page) {
  if (page.service === "hut") {
    return [
      [`Gọi ${page.keyword} bao lâu thì có xe đến?`, `Khu vực ${page.area} được hỏi vị trí trước để điều xe gần nhất. Thời gian thực tế phụ thuộc điểm đỗ xe, khoảng cách kéo ống và số ca đang xử lý, nhưng khách luôn được báo mốc dự kiến trước khi chờ.`],
      [`${capitalize(page.keyword)} có xử lý được nhà trong ngõ không?`, `Có thể xử lý nếu còn vị trí đỗ xe và kéo ống an toàn. Khách nên báo chiều rộng ngõ, khoảng cách từ xe đến nắp bể và gửi ảnh lối vào nếu có.`],
      [`Bể phốt đầy kèm cống tắc tại ${page.area} thì làm thế nào?`, `Thợ kiểm tra bể, hố ga và cống nhánh. Nếu bể quá tải thì hút trước, sau đó mới xử lý đoạn ống còn nghẹt để tránh trào ngược trở lại.`],
      [`Giá ${page.keyword} ban đêm có thay đổi không?`, `Ca ban đêm, ngày lễ hoặc vị trí xa có thể có chi phí điều xe khác ban ngày. Chi phí được nói rõ trước khi làm, không tự phát sinh khi khách chưa đồng ý.`],
    ];
  }
  return [
    [`Gọi ${page.keyword} bao lâu thì có thợ đến?`, `Kỹ thuật hỏi địa chỉ, điểm nước trào và thiết bị cần mang theo rồi báo thời gian dự kiến. Các điểm gần đội thợ tại ${page.area} được ưu tiên điều ca gần nhất.`],
    [`${capitalize(page.keyword)} có cần đục nền không?`, `Phần lớn ca được xử lý qua miệng thoát, hố ga hoặc điểm kỹ thuật có sẵn. Chỉ khi nghi gãy ống, sai độ dốc hoặc vật cứng mắc sâu mới cần bàn phương án tháo lắp.`],
    [`Cống tắc kèm mùi hôi tại ${page.area} có phải do bể phốt không?`, `Có thể do dầu mỡ, hố ga đầy, bẫy nước khô hoặc bể phốt quá tải. Thợ sẽ kiểm tra dòng thoát và hố ga trước khi kết luận.`],
    [`Giá ${page.keyword} ban đêm có cao hơn không?`, `Ca ban đêm, ngày lễ hoặc điểm xa có thể có phí điều thợ khác ban ngày. Khách được báo giá trước khi làm, không tự phát sinh khi chưa đồng ý.`],
  ];
}

function capitalize(input) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function serviceName(page) {
  return page.service === "hut" ? "hút bể phốt" : "thông tắc cống";
}

function labelForPath(path) {
  const slug = path.replace(/^\/|\/$/g, "");
  const labels = {
    "hut-be-phot": "dịch vụ hút bể phốt",
    "hut-be-phot-quang-ninh": "hút bể phốt Quảng Ninh",
    "thong-tac-cong-quang-ninh": "thông tắc cống Quảng Ninh",
    "thong-tac-cong-ha-long": "thông tắc cống Hạ Long",
    "thong-tac-cong-uong-bi": "thông tắc cống Uông Bí",
    "thong-tac-cong-quang-yen": "thông tắc cống Quảng Yên",
    "thong-tac-cong-cam-pha": "thông tắc cống Cẩm Phả",
    "thong-tac-bon-cau-ha-long": "thông tắc bồn cầu Hạ Long",
    "thong-tac-bon-cau-cam-pha": "thông tắc bồn cầu Cẩm Phả",
    "thong-tac-bon-cau-quang-ninh": "thông tắc bồn cầu Quảng Ninh",
    "cau-hoi-thuong-gap-thong-tac-cong": "câu hỏi thường gặp",
    "lien-he": "liên hệ",
  };
  return labels[slug] ?? slug.replaceAll("-", " ");
}

function schemaBlock(page) {
  const url = `${BASE}/${page.slug}/`;
  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${url}#localbusiness`,
      name: "Môi Trường Đô Thị Số 1 Quảng Ninh",
      url,
      telephone: ["0963.953.533", "0931.156.756"],
      priceRange: "Liên hệ báo giá theo tình trạng thực tế",
      openingHours: "Mo-Su 00:00-23:59",
      address: {
        "@type": "PostalAddress",
        addressLocality: page.area,
        addressRegion: "Quảng Ninh",
        addressCountry: "VN",
      },
      areaServed: {
        "@type": "City",
        name: page.area,
      },
      description: `${capitalize(page.keyword)} 24/7 tại ${page.area}, báo giá trước khi làm, hỗ trợ hotline ${HOTLINE}.`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems(page).map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: `${BASE}/` },
        { "@type": "ListItem", position: 2, name: page.service === "hut" ? "Hút bể phốt" : "Thông tắc cống", item: `${BASE}/${page.service === "hut" ? "hut-be-phot-quang-ninh" : "thong-tac-cong-quang-ninh"}/` },
        { "@type": "ListItem", position: 3, name: page.title, item: url },
      ],
    },
  ];
  return `<!-- wp:html -->\n<script type="application/ld+json" data-codex="doorway-safe-schema-${page.slug}">${JSON.stringify(graph)}</script>\n<!-- /wp:html -->`;
}

function localMapSection(page) {
  const isHut = page.service === "hut";
  return `## Bản đồ tình huống theo khu vực tại ${page.area}

${page.local
  .map((place, index) => {
    if (isHut) {
      const variants = [
        `Với **${page.keyword}** tại ${place}, nhóm nhà trong ngõ hoặc nhà sát mặt đường cần báo trước vị trí nắp bể. Nếu xe phải đỗ xa, thợ chuẩn bị thêm ống và kiểm tra đường kéo để không ảnh hưởng lối đi chung.`,
        `Tại ${place}, ca **${page.keyword}** thường cần hỏi rõ bể nằm trong nhà, ngoài sân hay gần hố ga. Thông tin này giúp đội xe chọn hướng tiếp cận, tránh mở sai điểm hoặc kéo ống vòng nhiều lần.`,
        `Khu ${place} có thể phát sinh bể đầy kèm mùi từ thoát sàn. Khi đó, **${page.keyword}** không chỉ hút phần bùn trong bể mà còn phải xả thử bồn cầu, kiểm tra hố ga và dòng thoát sau hút.`,
        `Nếu khách ở ${place} kinh doanh ăn uống, lưu trú hoặc cho thuê trọ, tần suất dùng bể cao hơn nhà dân. Đội **${page.keyword}** cần hỏi số phòng, số người dùng và thời điểm ít ảnh hưởng nhất để điều xe.`,
      ];
      return variants[index % variants.length];
    }
    const variants = [
      `Với **${page.keyword}** tại ${place}, thợ cần biết nước trào ở bếp, nhà tắm, sân hay hố ga. Mỗi điểm trào dẫn đến cách kiểm tra khác nhau, không thể chỉ thông qua miệng thoát gần nhất.`,
      `Tại ${place}, cống tắc sau mưa thường liên quan hố ga hoặc tuyến thoát thấp. Đội **${page.keyword}** sẽ kiểm tra dòng chảy, lớp bùn và điểm nghẹt trước khi dùng máy.`,
      `Khu ${place} có nhiều nhà cải tạo, ống thoát có thể nối thêm hoặc đi qua đoạn co gấp. Khi xử lý **${page.keyword}**, thợ ưu tiên đi từ hố ga hoặc điểm kỹ thuật có sẵn để hạn chế tháo dỡ.`,
      `Nếu khách ở ${place} kinh doanh ăn uống, dầu mỡ là nguyên nhân cần kiểm tra đầu tiên. **${page.keyword}** phải đi kèm xả thử sau xử lý, nếu không mảng bám còn lại có thể làm tắc lại.`,
    ];
    return variants[index % variants.length];
  })
  .join("\n\n")}
`;
}

function buildingChecklist(page) {
  const isHut = page.service === "hut";
  if (isHut) {
    return `## Checklist trước khi gọi xe hút bể phốt

Nhà dân tại ${page.area} nên kiểm tra nắp bể nằm ở đâu, có bị che bởi gạch, tủ, cây cảnh hoặc vật nặng không. Nếu không biết nắp bể, hãy mô tả vị trí bồn cầu, sân sau, hố ga và lần hút gần nhất để kỹ thuật khoanh vùng.

Nhà trọ, homestay và cơ sở lưu trú cần báo số phòng, số người đang dùng, thời điểm khách ít đi lại và có thể khóa nước tạm thời không. Đây là nhóm dễ đầy nhanh, nên **${page.keyword}** phải tính theo tải sử dụng thực tế, không chỉ theo tuổi bể.

Nhà hàng, quán ăn và cơ sở có bếp cần báo thêm tình trạng hố ga dầu mỡ. Nếu bể đầy nhưng hố ga bếp cũng lắng mỡ, thợ sẽ tách riêng hạng mục hút bể và nạo vét, giúp khách biết phần nào là nguyên nhân chính.

Nhà trong ngõ, đường dốc hoặc khu xe khó quay đầu cần gửi ảnh lối vào nếu có. Khi nhận thông tin này, đội **${page.keyword}** chuẩn bị chiều dài ống, vị trí đỗ xe và nhân lực kéo ống phù hợp.

Công trình lâu năm cần báo đã từng hút lúc nào, có sửa nhà, nâng nền hoặc che nắp bể không. Nhiều ca tại ${page.area} mất thời gian không phải vì hút khó, mà vì nắp bể bị che sau cải tạo.

Nếu bồn cầu vừa nghẹt vừa bốc mùi, không nên tự đổ thêm hóa chất. Hóa chất có thể làm hơi nặng hơn khi mở bể và không xử lý được lớp bùn đặc bên dưới.
`;
  }
  return `## Checklist trước khi gọi thợ thông cống

Nhà dân tại ${page.area} nên quan sát nước trào ở đâu trước: thoát sàn, chậu rửa, bồn cầu, sân hay hố ga. Vị trí trào đầu tiên giúp thợ đoán được điểm nghẹt nằm gần thiết bị hay nằm sâu ở tuyến chính.

Quán ăn, nhà hàng và bếp kinh doanh cần báo lượng dầu mỡ xả hằng ngày, có bẫy mỡ không và hố ga gần bếp đã nạo vét lần nào chưa. Với nhóm này, **${page.keyword}** thường phải xử lý lớp mỡ bám chứ không chỉ đẩy rác mềm.

Nhà trọ, nhà nghỉ và cơ sở đông người cần báo có bao nhiêu phòng cùng rút chậm. Nếu nhiều phòng cùng lỗi, khả năng cao là hố ga hoặc tuyến chính, không phải một miệng thoát đơn lẻ.

Công trình trong ngõ hẹp nên gửi ảnh lối vào, ảnh hố ga và vị trí nước trào nếu có. Thông tin này giúp đội **${page.keyword}** chọn máy gọn, dây phù hợp và tránh mang thiếu thiết bị.

Nếu đã dùng bột thông cống, nước nóng, axit hoặc dây tay, hãy nói rõ trước khi thợ thao tác. Một số hóa chất còn tồn trong ống có thể gây mùi mạnh hoặc nguy hiểm khi mở hố ga.

Nếu cống trào sau mưa, cần kiểm tra thêm hố ga ngoài sân, mực nước và bùn lắng. Tại ${page.area}, nhiều ca tưởng tắc cục bộ nhưng thực tế là tuyến thoát thấp hoặc hố ga quá tải.
`;
}

function preventionSection(page) {
  const isHut = page.service === "hut";
  return `## Cách hạn chế tái phát sau khi xử lý

${isHut ? `Sau khi **${page.keyword}**, khách nên theo dõi lực xả bồn cầu trong 2-3 ngày đầu. Nếu nước rút yếu, có tiếng ọc hoặc mùi quay lại, cần báo sớm để kiểm tra cống nhánh, hố ga hoặc đường thông hơi.` : `Sau khi **${page.keyword}**, khách nên xả thử từng điểm thoát và theo dõi mùi trong 2-3 ngày. Nếu nước vẫn rút chậm ở nhiều vị trí, cần kiểm tra hố ga hoặc tuyến ống chính.`}

Không xả khăn ướt, giấy dày, tóc, dầu mỡ, thức ăn thừa và vật khó phân hủy xuống hệ thống thoát nước. Những thứ này không làm tắc ngay trong một lần, nhưng tích lại thành mảng bám và làm lỗi quay lại đúng lúc cao điểm sử dụng.

Với nhà hàng, nhà trọ, homestay hoặc khu đông người tại ${page.area}, nên đặt lịch kiểm tra định kỳ thay vì chờ trào ngược. Lịch kiểm tra phụ thuộc số người dùng, lượng nước xả, bếp có dầu mỡ và hố ga có dễ tiếp cận không.

Khi có mùi hôi nhưng nước vẫn rút được, không nên bỏ qua. Mùi có thể đến từ bẫy nước khô, hố ga lắng bùn, bể phốt gần đầy hoặc ống thông hơi kém; mỗi nguyên nhân cần một cách xử lý khác nhau.

Nếu công trình vừa sửa nền, đổi thiết bị vệ sinh hoặc nâng sân, hãy kiểm tra lại nắp bể và hố ga. Nhiều ca ở ${page.area} bị kéo dài vì điểm kỹ thuật bị lấp kín, khiến thợ khó tiếp cận khi có sự cố.
`;
}

function quoteSection(page) {
  const isHut = page.service === "hut";
  return `## Thông tin cần có để báo giá sát thực tế

Để báo giá **${page.keyword}** không bị lệch, khách nên gửi tối thiểu 4 thông tin: địa chỉ cụ thể tại ${page.area}, loại công trình, dấu hiệu đang gặp và thời điểm cần xử lý. Nếu có ảnh khu vực thao tác, ảnh nắp bể hoặc hố ga, đội kỹ thuật sẽ đánh giá nhanh hơn.

${isHut ? `Với bể phốt, thông tin quan trọng nhất là bể nằm ở đâu, đã hút lần gần nhất khi nào, xe có vào sát không và khoảng cách kéo ống ước chừng bao nhiêu mét. Nhà càng sâu, ngõ càng nhỏ hoặc nắp bể càng khó mở thì phương án **${page.keyword}** càng cần chuẩn bị kỹ.` : `Với cống tắc, thông tin quan trọng nhất là nước trào ở điểm nào, có bao nhiêu thiết bị cùng rút chậm, đã dùng hóa chất chưa và hố ga gần nhất có mở được không. Những chi tiết này giúp đội **${page.keyword}** chọn máy lò xo, đầu thông, dụng cụ hố ga hoặc xe hỗ trợ đúng ngay từ đầu.`}

Khách tại ${page.local.slice(0, 3).join(", ")} thường cần xử lý nhanh vì khu dân cư hoặc điểm kinh doanh đông. Khách tại ${page.local.slice(3, 6).join(", ")} lại hay cần hỏi kỹ lối vào, chỗ đỗ xe và thời điểm thi công. Nhóm ${page.local.slice(6).join(", ")} nếu có đường hẹp, đường dốc hoặc hố ga thấp thì nên báo trước để tránh phát sinh thời gian.

Khi đã có đủ thông tin, kỹ thuật nói rõ phần nào là chi phí chính, phần nào có thể phát sinh nếu kiểm tra thấy hố ga, cống nhánh hoặc bể chứa liên quan. Cách báo này giúp khách quyết định nhanh mà vẫn kiểm soát được chi phí.

Nếu cần xử lý gấp, hãy gọi hotline và đọc đúng tên phường/xã để đội kỹ thuật định tuyến nhanh hơn.
`;
}

function contentMarkdown(page) {
  const service = serviceName(page);
  const isHut = page.service === "hut";
  const issue = isHut ? "bể đầy, mùi hôi, bồn cầu rút chậm hoặc nước thải trào ngược" : "nước rút chậm, mùi hôi, thoát sàn trào hoặc hố ga đầy";
  const mainLink = isHut ? "/hut-be-phot-quang-ninh/" : "/thong-tac-cong-quang-ninh/";
  const faq = faqItems(page);
  const relatedLinks = page.related.map((path) => `[${labelForPath(path)}](${BASE}${path})`).join(", ");
  return `# ${page.title}

${capitalize(issue)} tại ${page.area} cần xử lý theo đúng mặt bằng, không thể dùng một mẫu chung cho mọi khu vực. Môi Trường Đô Thị Số 1 Quảng Ninh nhận **${page.keyword}** 24/7, hỏi rõ vị trí, tình trạng và điều kiện xe/thợ trước khi báo phương án.

Gọi **${HOTLINE}** nếu công trình đang phát sinh mùi, trào ngược hoặc ảnh hưởng sinh hoạt. Đội kỹ thuật sẽ hỏi nhanh vị trí tại ${page.local.slice(0, 5).join(", ")}, loại nhà, điểm thao tác và điều thiết bị phù hợp.

![${page.imageAlt}](${page.image})

## Đặc thù ${service} tại ${page.area}

${page.localBrief.join("\n\n")}

Những điểm này làm trang **${page.keyword}** khác với trang ở thành phố khác. Khi tiếp nhận ca, kỹ thuật không chỉ hỏi tên địa bàn mà còn hỏi lối vào, độ dốc, chỗ đỗ xe, vị trí hố ga và thời điểm khách cần xử lý.

${localMapSection(page)}

${buildingChecklist(page)}

## Khi nào cần gọi ngay

${isHut ? `Hãy gọi **${page.keyword}** khi bồn cầu rút chậm, mùi hôi lên từ nhà vệ sinh, thoát sàn có tiếng ọc nước, hố ga nổi váng hoặc bể đã nhiều năm chưa hút. Nếu nhà có thêm người ở, kinh doanh lưu trú hoặc hàng quán, chu kỳ đầy bể thường ngắn hơn nhà dân ít người.` : `Hãy gọi **${page.keyword}** khi thoát sàn rút chậm, nước trào ra nền, cống bếp bốc mùi, hố ga đầy bùn hoặc đã dùng pittong/hóa chất nhưng không hết. Nếu nhiều điểm trong nhà cùng rút chậm, khả năng tắc không nằm ở miệng thoát đơn lẻ.`}

Không nên tiếp tục xả nhiều nước khi đã có trào ngược. Với ca có mùi nặng, khách nên mở thoáng khu vực, dừng đổ hóa chất và báo rõ đã tự xử lý bằng cách nào để thợ chọn thiết bị an toàn.

## Nguyên nhân thường gặp tại ${page.area}

${isHut ? `Nguyên nhân đầu tiên là bể sử dụng lâu năm, bùn và váng chiếm gần hết dung tích. Nguyên nhân thứ hai là số người dùng tăng, nhất là nhà trọ, khách sạn, hàng quán hoặc hộ kinh doanh. Nguyên nhân thứ ba là hố ga, cống nhánh hoặc bồn cầu có vật khó phân hủy làm nước thải không thoát đều.` : `Nguyên nhân đầu tiên là dầu mỡ, tóc, giấy dày, cặn xà phòng và rác nhỏ bám thành ống. Nguyên nhân thứ hai là hố ga đầy bùn, làm nước từ thoát sàn không kịp ra tuyến chính. Nguyên nhân thứ ba là đường ống cũ, sai độ dốc, co gấp hoặc từng cải tạo nhiều lần.`}

Tại ${page.area}, các khu ${page.local.slice(0, 4).join(", ")} có điều kiện nhà ở khác nhóm ${page.local.slice(4).join(", ")}. Vì vậy, đội kỹ thuật cần kiểm tra thực tế trước khi kết luận nguyên nhân.

Nếu xử lý sai điểm, tình trạng có thể giảm vài ngày rồi quay lại. Cách làm an toàn là kiểm tra từ dấu hiệu nhẹ đến điểm sâu: thiết bị vệ sinh, miệng thoát, hố ga, đường ống nhánh và bể chứa liên quan.

## Cam kết 3 Không

- Không đục phá khi chưa có căn cứ kỹ thuật rõ.
- Không báo giá ảo; chi phí phải bám tình trạng, vị trí và thiết bị cần dùng.
- Không xử lý qua loa khiến lỗi nhanh tái phát.

Với **${page.keyword}**, thợ sẽ báo phương án trước khi làm. Nếu phát hiện ca không đúng với thông tin ban đầu, ví dụ cần thêm xe bồn, kéo ống xa, mở hố ga hoặc xử lý thêm tuyến nhánh, khách được báo lại trước.

## Bảng giá tham khảo

| Hạng mục | Khi nào áp dụng | Ghi chú |
| --- | --- | --- |
| Xử lý hộ gia đình | Nhà dân, nhà trong ngõ, công trình nhỏ | Báo theo tình trạng |
| Xử lý nhà trọ/hàng quán | Tần suất dùng cao, cần làm nhanh | Khảo sát trước |
| Ca ngoài giờ | Ban đêm, cuối tuần, ngày lễ | Báo trước khi đi |
| Công trình khó tiếp cận | Ngõ nhỏ, đường dốc, kéo ống/máy xa | Cần hỏi kỹ vị trí |
| Xử lý kết hợp | Hố ga, bể phốt, cống nhánh liên quan | Tách rõ từng hạng mục |

Khách cần giá nhanh có thể gọi **${HOTLINE}** và mô tả địa chỉ, dấu hiệu, loại công trình. Nếu cần xem thêm hạng mục chung, truy cập [bảng giá](${BASE}/bang-gia/).

${quoteSection(page)}

## Quy trình 5 bước

Bước 1: Tiếp nhận thông tin tại ${page.area}, gồm vị trí, dấu hiệu, mức độ gấp và điều kiện tiếp cận.

Bước 2: Kiểm tra tại chỗ. Thợ xác định điểm thao tác, thiết bị cần dùng và rủi ro phát sinh.

Bước 3: Báo phương án. Khách nắm rõ cách làm, thời gian dự kiến và chi phí trước khi đồng ý.

Bước 4: Thi công. Đội kỹ thuật xử lý gọn, giữ vệ sinh khu thao tác và hạn chế ảnh hưởng sinh hoạt/kinh doanh.

Bước 5: Xả thử, kiểm tra lại mùi, dòng thoát hoặc lực xả, sau đó bàn giao và nhắc cách phòng tránh.

${preventionSection(page)}

## Case study E-E-A-T: ${page.caseTitle}

${page.caseDetail}

Ca này cho thấy cùng một dịch vụ nhưng địa bàn khác nhau cần phương án khác nhau. Nội dung, FAQ, case study và schema của trang **${page.keyword}** phải bám đúng ${page.area}, không dùng chung với Hạ Long, Uông Bí, Quảng Yên hay Cẩm Phả.

## Internal link liên quan

Khách có thể xem dịch vụ chính tại [${isHut ? "hút bể phốt Quảng Ninh" : "thông tắc cống Quảng Ninh"}](${BASE}${mainLink}). Các link cần giữ trong cụm địa phương gồm: ${relatedLinks}.

Các link nội bộ này giữ khách trong cụm dịch vụ liên quan, tránh để trang địa phương hoạt động như trang cô lập. Khi thêm link mới, phải kiểm tra HTTP 200 và không xóa link hợp lệ đang có.

## NAP liên hệ

Tên đơn vị: Môi Trường Đô Thị Số 1 Quảng Ninh

Website: ${BASE}

Hotline: **${HOTLINE}**

Dịch vụ chính tại ${page.area}: **${page.keyword}**, ${isHut ? "thông tắc cống, thông tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi" : "hút bể phốt, thông tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi"}.

Khu vực phục vụ: ${page.area}, ${page.local.join(", ")} và vùng lân cận trong Quảng Ninh.

## FAQ về ${page.keyword}

${faq.map(([question, answer]) => `### ${question}\n\n${answer}`).join("\n\n")}

Cần **${page.keyword}** trong ngày, gọi **${HOTLINE}** để được hỏi tình trạng, báo hướng xử lý và điều đội gần nhất.
`;
}

function pageHtml(page) {
  return `${markdownToHtml(contentMarkdown(page))}\n${schemaBlock(page)}\n`;
}

function quality(page, html) {
  const text = stripHtml(html);
  const wordCount = words(html).length;
  const kwCount = (text.match(new RegExp(page.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "giu")) ?? []).length;
  const density = wordCount ? (kwCount / wordCount) * 100 : 0;
  const forbidden = FORBIDDEN.filter((word) => normalize(text).includes(normalize(word)));
  return {
    slug: page.slug,
    wordCount,
    kwCount,
    density: Number(density.toFixed(2)),
    forbidden,
    ok: wordCount >= 1800 && wordCount <= 3300 && kwCount >= 8 && forbidden.length === 0,
  };
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex doorway-safe city batch",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(60000),
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  if (!response.ok) {
    const message = typeof payload === "object" ? payload.message ?? raw : payload;
    throw new Error(`WordPress ${response.status} ${path}: ${message}`);
  }
  return payload;
}

async function main() {
  const targets = pages.filter((page) => !SELECTED.size || SELECTED.has(page.slug));
  if (!targets.length) throw new Error("Không có slug hợp lệ để xử lý.");
  const generated = targets.map((page) => ({ page, html: pageHtml(page) }));
  const qualityRows = generated.map(({ page, html }) => quality(page, html));
  const badQuality = qualityRows.filter((row) => !row.ok);
  const similarities = [];
  for (let i = 0; i < generated.length; i++) {
    for (let j = i + 1; j < generated.length; j++) {
      if (generated[i].page.service !== generated[j].page.service) continue;
      const value = jaccard(shingles(generated[i].html), shingles(generated[j].html)) * 100;
      similarities.push({
        a: generated[i].page.slug,
        b: generated[j].page.slug,
        service: generated[i].page.service,
        similarity: Number(value.toFixed(2)),
      });
    }
  }
  const tooSimilar = similarities.filter((row) => row.similarity >= 70);
  const preflight = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    targets: targets.map((page) => page.slug),
    qualityRows,
    similarities,
    tooSimilar,
    updated: [],
  };
  const reportPath = join(PROJECT, `WORDPRESS_UPDATE_CITY_DOORWAY_SAFE_2026-05-05.json`);

  if (badQuality.length || tooSimilar.length) {
    writeFileSync(reportPath, JSON.stringify(preflight, null, 2), "utf8");
    console.log(JSON.stringify(preflight, null, 2));
    throw new Error("Preflight không đạt: còn lỗi quality hoặc similarity >= 70%.");
  }

  if (DRY_RUN) {
    writeFileSync(reportPath, JSON.stringify(preflight, null, 2), "utf8");
    console.log(JSON.stringify(preflight, null, 2));
    return;
  }

  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = join(PROJECT, "seo-revisions", `wp-before-city-doorway-safe-${stamp}`);
  mkdirSync(backupDir, { recursive: true });

  for (const { page, html } of generated) {
    const current = await wp(env.WP_BASE_URL, auth, `/wp/v2/${page.type}/${page.id}?context=edit`);
    if (current.slug !== page.slug) throw new Error(`Sai slug cho ID ${page.id}: ${current.slug} != ${page.slug}`);
    const backupPath = join(backupDir, `${page.type}-${page.id}-${page.slug}.json`);
    writeFileSync(backupPath, JSON.stringify(current, null, 2), "utf8");
    const updated = await wp(env.WP_BASE_URL, auth, `/wp/v2/${page.type}/${page.id}`, {
      method: "POST",
      body: JSON.stringify({ content: html }),
    });
    preflight.updated.push({
      slug: page.slug,
      id: page.id,
      link: updated.link,
      modified: updated.modified,
      backupPath,
    });
    console.log(`UPDATED ${page.slug} ${updated.link}`);
  }
  writeFileSync(reportPath, JSON.stringify(preflight, null, 2), "utf8");
  console.log(JSON.stringify(preflight, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
