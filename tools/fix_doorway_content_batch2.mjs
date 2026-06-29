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
    id: 56,
    type: "pages",
    slug: "hut-be-phot-dong-trieu",
    service: "hut",
    keyword: "hút bể phốt Đông Triều",
    area: "Đông Triều",
    title: "Hút Bể Phốt Đông Triều: Hỗ Trợ Hộ Gia Đình, Khu Nông Nghiệp",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/xe-hut-be-phot-chuyen-dung-quang-ninh-02.webp",
    imageAlt: "xe hút bể phốt tại Đông Triều",
    local: ["Mạo Khê", "Đông Triều", "Yên Thọ", "Hoàng Quế", "Bình Dương", "Tràng An", "Xuân Sơn"],
    localBrief: [
      "Đông Triều có nhiều khu nông nghiệp, trang trại, nhà vườn và khu công nghiệp gốm sứ. Đường làng rộng nhưng xe lớn cần chú ý tải trọng cầu cống.",
      "Khu Mạo Khê đông dân, nhiều nhà trọ công nhân mỏ, bể phốt thường chịu tải lớn và cần hút định kỳ.",
      "Nhà dân ở Yên Thọ, Hoàng Quế hay có hố ga kết hợp, cần kiểm tra kỹ toàn bộ hệ thống thoát nước ngoài sân trước khi hút.",
      "Các trang trại lớn ở Bình Dương, Tràng An thường yêu cầu khối lượng xe bồn cỡ lớn 10 khối để xử lý dứt điểm trong 1 lần hút."
    ],
    caseTitle: "tình huống trang trại tại Bình Dương",
    caseDetail: "Tình huống thường gặp tại khu trang trại là bể phốt dùng lâu ngày, lớp bùn đáy dày và vị trí nắp bể nằm sâu trong vườn. Khi tiếp nhận ca dạng này, thợ cần hỏi trước lối xe vào, khoảng cách kéo ống và khu vực cây trồng xung quanh để chọn xe, kéo ống gọn, hạn chế ảnh hưởng mặt bằng.",
    related: ["/hut-be-phot-quang-ninh/", "/thong-tac-cong-dong-trieu/"]
  },
  {
    id: 55,
    type: "pages",
    slug: "hut-be-phot-mong-cai",
    service: "hut",
    keyword: "hút bể phốt Móng Cái",
    area: "Móng Cái",
    title: "Hút Bể Phốt Móng Cái: Nhanh Chóng Khu Vực Biên Giới",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/xe-hut-be-phot-chuyen-dung-quang-ninh-02.webp",
    imageAlt: "xe hút bể phốt tại Móng Cái",
    local: ["Hòa Lạc", "Ka Long", "Trần Phú", "Ninh Dương", "Trà Cổ", "Hải Yên"],
    localBrief: [
      "Móng Cái giáp biên, có nhiều kho bãi, chợ trung tâm và khách sạn lưu trú. Thời gian chờ xe hút cần nhanh để không làm gián đoạn giao thương buôn bán.",
      "Khu Trần Phú, Ka Long đường đông đúc, xe bồn ưu tiên chạy ban đêm hoặc giờ nghỉ trưa để tránh ùn tắc giao thông cục bộ.",
      "Trà Cổ là khu du lịch sầm uất, nhà nghỉ và homestay cần hút định kỳ trước mùa hè để đón lượng khách lớn đổ về.",
      "Hải Yên và Ninh Dương có nhiều nhà xưởng, hệ thống tự hoại quy mô lớn, kỹ thuật cần đánh giá lượng bùn vi sinh trước khi thi công."
    ],
    caseTitle: "tình huống khách sạn tại Trà Cổ",
    caseDetail: "Tình huống thường gặp ở khách sạn Trà Cổ là bể tự hoại chịu tải cao trước mùa du lịch, nhà vệ sinh bắt đầu có mùi và bồn cầu xả yếu. Với ca dạng này, đội hút cần trao đổi khung giờ ít ảnh hưởng khách lưu trú, kiểm tra điểm đặt xe và báo phương án xử lý trước khi kéo ống.",
    related: ["/hut-be-phot-quang-ninh/", "/thong-tac-cong-mong-cai/"]
  },
  {
    id: 58,
    type: "pages",
    slug: "hut-be-phot-van-don",
    service: "hut",
    keyword: "hút bể phốt Vân Đồn",
    area: "Vân Đồn",
    title: "Hút Bể Phốt Vân Đồn: Dành Cho Đặc Thù Khu Du Lịch, Biển Đảo",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/xe-hut-be-phot-chuyen-dung-quang-ninh-02.webp",
    imageAlt: "xe hút bể phốt tại Vân Đồn",
    local: ["Cái Rồng", "Đông Xá", "Hạ Long", "Quan Lạn", "Minh Châu"],
    localBrief: [
      "Vân Đồn đặc thù là khu kinh tế và biển đảo. Các resort, nhà hàng hải sản cần xử lý vệ sinh khắt khe để đảm bảo môi trường du lịch.",
      "Đường ở Cái Rồng, Đông Xá thường nhỏ hẹp, ngõ sâu quanh co, xe hút mini hoặc vòi kéo dài trên 100m được ưu tiên sử dụng.",
      "Tại các xã đảo như Quan Lạn, Minh Châu, nếu khách có nhu cầu cần đặt lịch trước để sắp xếp phương án di chuyển thiết bị qua phà.",
      "Nước biển xâm nhập đôi khi làm ảnh hưởng kết cấu bể phốt cũ, thợ cần khảo sát và bơm xịt rửa cặn muối bám thành bể."
    ],
    caseTitle: "tình huống homestay tại Cái Rồng",
    caseDetail: "Tình huống thường gặp ở homestay Cái Rồng là bể đầy trong khi lối vào hẹp, xe khó áp sát nắp bể. Khi gặp ca dạng này, kỹ thuật cần kiểm tra vị trí đỗ xe, chiều dài ống hút, hướng đi qua lối chung và cách che chắn để hạn chế mùi trong khu sinh hoạt.",
    related: ["/hut-be-phot-quang-ninh/", "/thong-tac-cong-van-don/"]
  },
  {
    id: 425,
    type: "pages",
    slug: "thong-tac-cong-dong-trieu",
    service: "cong",
    keyword: "thông tắc cống Đông Triều",
    area: "Đông Triều",
    title: "Thông Tắc Cống Đông Triều: Xử Lý Cống Thoát Nước Sân Vườn",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/ky-thuat-thong-tac-cong-dan-dung-quang-ninh-01.webp",
    imageAlt: "thông tắc cống tại Đông Triều bằng máy lò xo",
    local: ["Mạo Khê", "Đông Triều", "Yên Thọ", "Hoàng Quế", "Bình Dương", "Tràng An", "Xuân Sơn"],
    localBrief: [
      "Cống thoát nước ở Đông Triều hay gặp tắc do bùn đất từ vườn, cặn thức ăn chăn nuôi hoặc rễ cây đâm vào ống ngầm.",
      "Các khu trọ công nhân tại Mạo Khê hay bị nghẹt thoát sàn do tóc, rác sinh hoạt và thói quen xả nước giặt phơi không che chắn.",
      "Nhà ở khu vực Yên Thọ, Hoàng Quế thường sử dụng cống chung với đường xả nước mưa, dễ gặp tình trạng trào ngược khi mưa lớn kéo dài.",
      "Việc dùng máy lò xo là tối ưu tại đây vì đường ống đi xa và có nhiều góc cua gấp, hóa chất thông thường không vươn tới được."
    ],
    caseTitle: "tình huống nhà vườn tại Yên Thọ",
    caseDetail: "Tình huống thường gặp ở nhà vườn Yên Thọ là cống sân bị rễ cây, bùn đất hoặc lá mục làm nghẹt, nước đọng lâu sau mưa. Với ca dạng này, thợ cần kiểm tra hố ga, dùng máy lò xo hoặc dụng cụ phù hợp để phá điểm nghẹt, sau đó tư vấn che chắn miệng thu nước và kiểm tra lại khớp nối.",
    related: ["/thong-tac-cong-quang-ninh/", "/hut-be-phot-dong-trieu/"]
  },
  {
    id: 426,
    type: "pages",
    slug: "thong-tac-cong-mong-cai",
    service: "cong",
    keyword: "thông tắc cống Móng Cái",
    area: "Móng Cái",
    title: "Thông Tắc Cống Móng Cái Nhanh Gọn, Khơi Thông Dòng Chảy",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/ky-thuat-thong-tac-cong-dan-dung-quang-ninh-01.webp",
    imageAlt: "thông tắc cống tại Móng Cái",
    local: ["Hòa Lạc", "Ka Long", "Trần Phú", "Ninh Dương", "Trà Cổ", "Hải Yên"],
    localBrief: [
      "Tại Móng Cái, cống nhà hàng, kho bãi hay bị mỡ đóng cục hoặc nghẹt rác do lưu lượng người qua lại lớn, xả thải liên tục.",
      "Chợ trung tâm Ka Long cần xử lý cống nhanh, gọn bằng máy áp lực để không cản trở buôn bán của tiểu thương xung quanh.",
      "Nhiều dãy nhà thương mại ở Trần Phú lắp đặt ống nước xả chung chật hẹp, dễ tắc cục bộ ở trục đứng tòa nhà.",
      "Hải Yên thường gặp tắc do vật liệu xây dựng hoặc cặn cứng lọt vào cống trong quá trình cải tạo mặt bằng."
    ],
    caseTitle: "tình huống quán hải sản tại Trần Phú",
    caseDetail: "Tình huống thường gặp ở quán hải sản Trần Phú là cống bếp nghẹt do mỡ, vụn thức ăn và rác nhỏ tích tụ trong ống. Với ca dạng này, kỹ thuật cần kiểm tra miệng thoát, hố ga sau bếp, dùng máy lò xo hoặc đầu đánh mỡ phù hợp và xả thử nhiều lần trước khi bàn giao.",
    related: ["/thong-tac-cong-quang-ninh/", "/hut-be-phot-mong-cai/"]
  },
  {
    id: 427,
    type: "pages",
    slug: "thong-tac-cong-van-don",
    service: "cong",
    keyword: "thông tắc cống Vân Đồn",
    area: "Vân Đồn",
    title: "Thông Tắc Cống Vân Đồn Đảm Bảo Vệ Sinh Môi Trường Biển",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/ky-thuat-thong-tac-cong-dan-dung-quang-ninh-01.webp",
    imageAlt: "thông tắc cống tại Vân Đồn",
    local: ["Cái Rồng", "Đông Xá", "Hạ Long", "Quan Lạn", "Minh Châu"],
    localBrief: [
      "Cống thoát tại Vân Đồn dễ nghẹt do cát biển, vỏ hải sản ở các nhà hàng ven vịnh xả ra hằng ngày.",
      "Đường cống thấp dễ chịu ảnh hưởng của triều cường, cần hố ga ngăn triều và chắn rác tốt để tránh nước trào ngược.",
      "Các khu nghỉ dưỡng tại Quan Lạn, Minh Châu cần ưu tiên dùng máy móc giảm ồn, giữ sạch sẽ để không ảnh hưởng khách lưu trú.",
      "Đặc thù đảo khiến vật tư khó tiếp cận, vì vậy mỗi lần thợ thông cống phải mang đủ máy hút, máy lò xo và camera nội soi."
    ],
    caseTitle: "tình huống nhà hàng hải sản tại Đông Xá",
    caseDetail: "Tình huống thường gặp ở nhà hàng hải sản Đông Xá là cống nghẹt do vỏ hải sản nhỏ, mỡ và bùn cát tích tụ tại khớp nối. Khi gặp ca dạng này, thợ cần mở điểm kỹ thuật nếu có, lấy dị vật ra trước khi thông ống, rồi xả thử để kiểm tra dòng thoát.",
    related: ["/thong-tac-cong-quang-ninh/", "/hut-be-phot-van-don/"]
  },
  {
    id: 398,
    type: "pages",
    slug: "thong-tac-bon-cau-ha-long",
    service: "bon-cau",
    keyword: "thông tắc bồn cầu Hạ Long",
    area: "Hạ Long",
    title: "Thông Tắc Bồn Cầu Hạ Long: Xử Lý Ngay Sự Cố Nhà Vệ Sinh Khách Sạn",
    image: "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/ky-thuat-thong-tac-cong-dan-dung-quang-ninh-01.webp",
    imageAlt: "thông tắc bồn cầu tại Hạ Long",
    local: ["Bãi Cháy", "Hòn Gai", "Cao Xanh", "Cao Thắng", "Tuần Châu", "Hồng Hải", "Hồng Hà", "Giếng Đáy", "Hà Khẩu"],
    localBrief: [
      "Khách sạn, chung cư tại Hạ Long (Bãi Cháy, Tuần Châu) cần xử lý tắc bồn cầu nhẹ nhàng, không đục phá nền gạch men cao cấp.",
      "Nhà dân cũ ở Hòn Gai thường gặp bồn cầu nghẹt do ống thoát lâu năm đóng cặn, hoặc do lỗi độ dốc ống dẫn xuống hầm tự hoại.",
      "Chung cư cao tầng ở Cao Xanh, Cao Thắng thỉnh thoảng tắc bồn cầu do dị vật rơi từ tầng trên xuống qua trục ống chung.",
      "Sự cố ở Giếng Đáy, Hà Khẩu thường liên quan đến giấy vệ sinh khó phân hủy bị dồn lại nhiều ngày."
    ],
    caseTitle: "tình huống căn hộ tại Bãi Cháy",
    caseDetail: "Tình huống thường gặp ở căn hộ Bãi Cháy là bồn cầu nghẹt do dị vật nhỏ hoặc giấy dày kẹt ở cổ thoát, nước xả yếu và trào ngược. Với ca dạng này, thợ cần kiểm tra bằng dụng cụ phù hợp, ưu tiên xử lý qua đường thoát có sẵn và chỉ tháo lắp khi có căn cứ kỹ thuật.",
    related: ["/thong-tac-bon-cau-quang-ninh/", "/hut-be-phot-ha-long/", "/thong-tac-cong-ha-long/"]
  }
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
      [`Gọi ${page.keyword} bao lâu thì có xe đến?`, `Khu vực ${page.area} được phân bổ đội xe riêng. Tùy vào khoảng cách từ điểm đỗ đến nắp bể, thợ sẽ báo thời gian xe vào tận nơi trước khi khách quyết định chờ.`],
      [`Xe bồn có hút được bùn đặc không?`, `Hoàn toàn được. Lực hút chân không mạnh từ xe chuyên dụng dư sức xử lý lớp bùn cặn và xỉ than dưới đáy hầm tự hoại.`],
      [`Giá ${page.keyword} ngoài giờ hành chính có đắt hơn?`, `Chúng tôi cam kết không phụ thu phí ngoài giờ. Khách được báo giá minh bạch ngay sau khi thợ khảo sát mặt bằng tại ${page.area}.`],
    ];
  } else if (page.service === "bon-cau") {
    return [
      [`${capitalize(page.keyword)} có cần phải tháo dỡ thiết bị không?`, `Với 90% các ca tắc do giấy, thợ sẽ xử lý bằng áp lực hoặc máy lò xo nhỏ mà không cần đục gạch men hay tháo bồn cầu.`],
      [`Làm sao để biết bồn cầu bị tắc do dị vật cứng?`, `Nếu xả nước rút cực chậm và có tiếng ọc ọc lớn dù chưa có mùi hôi, kèm theo tiền sử làm rơi vật bằng nhựa/vải, khả năng cao là kẹt dị vật sâu trong cổ cò.`],
      [`Dịch vụ có bảo hành sau thông tắc bồn cầu tại ${page.area} không?`, `Có. Môi Trường Đô Thị Số 1 Quảng Ninh có quy trình bảo hành rõ ràng đối với các sự cố thoát nước tự nhiên.`],
    ];
  }
  return [
    [`Gọi ${page.keyword} bằng phương pháp lò xo có an toàn không?`, `Máy lò xo đánh tan được cặn mỡ, tóc và rác mà không gây nứt vỡ thành ống cũ, rất phù hợp với kết cấu nhà dân tại ${page.area}.`],
    [`Cống tắc do rễ cây tại ${page.area} có thông được không?`, `Có. Thợ sử dụng đầu cắt rễ cây chuyên dụng kết hợp máy áp lực để làm sạch lòng ống mà không cần đục phá nền sân vườn.`],
    [`Chính sách giá cho khách hàng cũ tại ${page.area} thế nào?`, `Khách quen thuộc luôn được hỗ trợ giá ưu đãi, đặc biệt là các nhà hàng, khu trọ cần nạo vét và thông cống định kỳ hằng tháng.`],
  ];
}

function capitalize(input) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function serviceName(page) {
  if (page.service === "hut") return "hút bể phốt";
  if (page.service === "bon-cau") return "thông tắc bồn cầu";
  return "thông tắc cống";
}

function labelForPath(path) {
  const slug = path.replace(/^\/|\/$/g, "");
  return slug.replaceAll("-", " ");
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
        { "@type": "ListItem", position: 2, name: "Dịch vụ", item: `${BASE}/hut-be-phot-quang-ninh/` },
        { "@type": "ListItem", position: 3, name: page.title, item: url },
      ],
    },
  ];
  return `<!-- wp:html -->\n<script type="application/ld+json" data-codex="doorway-safe-schema-${page.slug}">${JSON.stringify(graph)}</script>\n<!-- /wp:html -->`;
}

function contentMarkdown(page) {
  const service = serviceName(page);
  const faq = faqItems(page);
  const relatedLinks = page.related.map((path) => `[${labelForPath(path)}](${BASE}${path})`).join(", ");
  return `# ${page.title}

Sự cố ${service} tại ${page.area} mang những đặc thù riêng biệt từ địa hình cho tới thiết kế ống nước. Với thiết bị phù hợp và quy trình kiểm tra rõ ràng, Môi Trường Đô Thị Số 1 Quảng Ninh đưa ra phương án **${page.keyword}** theo đúng tình trạng thực tế, hạn chế đục phá và báo giá trước khi làm.

Gọi **${HOTLINE}** để được kỹ thuật viên báo giá rõ ràng trước khi triển khai công việc.

![${page.imageAlt}](${page.image})

## Đặc thù ${service} tại ${page.area}

${page.localBrief.join("\n\n")}

Thấu hiểu địa hình của ${page.area}, thợ sẽ mang đúng loại máy và độ dài dây/ống cần thiết, đảm bảo công việc diễn ra suôn sẻ, gọn gàng, không đục phá bừa bãi.

## Cam kết chất lượng dịch vụ

- **Cam kết không đục phá**: Ưu tiên tối đa các thiết bị luồn lách qua ống thoát sẵn có. Thợ chỉ yêu cầu mở điểm khi đó là lối duy nhất (sẽ hàn lấp thẩm mỹ sau khi xong).
- **Cam kết báo giá chuẩn**: Báo đúng giá theo khối lượng (đối với xe bồn) hoặc mức độ tắc nghẽn (đối với cống, bồn cầu). Tuyệt đối không gian lận khối lượng bùn.
- **Cam kết bảo hành**: Xử lý dứt điểm nguyên nhân, cung cấp phiếu bảo hành hợp lệ, hỗ trợ khách hàng nhanh nhất nếu có trục trặc tái phát do nguyên nhân tự nhiên.

## Bảng giá tham khảo dịch vụ

| Hạng mục xử lý | Tình trạng áp dụng | Chi phí tham khảo |
| --- | --- | --- |
| ${service} hộ gia đình | Nước rút chậm, trào ngược mùi nhẹ | Liên hệ khảo sát |
| Xử lý trọn gói cho nhà hàng, quán ăn | Đóng cặn mỡ, nghẹt dị vật cứng | Báo giá chi tiết tại công trình |
| Dịch vụ cho khu công nghiệp, kho bãi | Lượng chất thải lớn, cần phương tiện nặng | Dựa trên hợp đồng dài hạn |

Khách hàng muốn biết rõ chi phí hãy gọi **${HOTLINE}** để mô tả tình hình, kỹ thuật sẽ tư vấn sơ bộ. Hoặc tham khảo thêm [bảng giá chung](${BASE}/bang-gia/).

## Quy trình triển khai 5 bước rõ ràng

Bước 1: Lắng nghe mô tả sự cố từ khách hàng tại khu vực ${page.area}.

Bước 2: Có mặt chỉ sau 15-30 phút để khảo sát và lên phương án thi công (chọn đầu thông, máy bơm, hoặc dung tích xe).

Bước 3: Báo giá trọn gói. Khách duyệt mới bắt đầu triển khai thiết bị.

Bước 4: Thực thi ${service} khẩn trương, dọn dẹp vệ sinh môi trường xung quanh trả lại mặt bằng sạch sẽ.

Bước 5: Cho khách hàng kiểm tra độ xả, test dòng chảy, nhận thanh toán và viết phiếu bảo hành.

## Tình huống thường gặp: ${page.caseTitle}

Lưu ý: phần này là tình huống minh họa theo nhóm công trình thường gặp, không ghi nhận là khách hàng thật khi chưa có dữ liệu xác minh.

${page.caseDetail}

Mỗi sự cố tại từng phường/xã của ${page.area} là một trải nghiệm kỹ thuật riêng. Đội thợ luôn phân tích để đưa ra phương pháp an toàn nhất cho công trình nhà bạn.

## Internal link liên quan

Tìm hiểu thêm về các dịch vụ bổ trợ: ${relatedLinks}. Việc bảo dưỡng định kỳ các hạng mục liên quan sẽ giúp kéo dài tuổi thọ hệ thống thoát nước.

## NAP liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh

Tên đơn vị: Môi Trường Đô Thị Số 1 Quảng Ninh

Website: ${BASE}

Hotline trực ban: **${HOTLINE}**

Dịch vụ chính tại ${page.area}: **${page.keyword}**, thông tắc cống ngầm, hút bể phốt, nạo vét bùn hố ga.

Khu vực phủ sóng: ${page.area}, ${page.local.join(", ")} và toàn tỉnh.

## FAQ - Câu hỏi thường gặp

${faq.map(([question, answer]) => `### ${question}\n\n${answer}`).join("\n\n")}

Quý khách cần tư vấn thêm về **${page.keyword}**, gọi **${HOTLINE}** để được hỏi tình trạng và báo hướng xử lý.
`;
}

function pageHtml(page) {
  return `${markdownToHtml(contentMarkdown(page))}\n${schemaBlock(page)}\n`;
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex doorway-safe batch 2",
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
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const reportPath = join(PROJECT, `WORDPRESS_UPDATE_DOORWAY_BATCH2_2026-05-06.json`);
  const backupDir = join(PROJECT, "backups");
  mkdirSync(backupDir, { recursive: true });
  const backupPath = join(
    backupDir,
    `wordpress-before-doorway-batch2-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );
  const preflight = { dryRun: DRY_RUN, backupPath, updated: [], skipped: [], errors: [] };
  const backup = { createdAt: new Date().toISOString(), dryRun: DRY_RUN, pages: [], errors: [] };

  for (const page of pages) {
    try {
      const html = pageHtml(page);
      const current = await wp(env.WP_BASE_URL, auth, `/wp/v2/${page.type}/${page.id}?context=edit`);
      backup.pages.push({ slug: page.slug, id: page.id, type: page.type, current });
      if (DRY_RUN) {
        preflight.skipped.push({ slug: page.slug, id: page.id, reason: "dry-run", bytes: html.length });
        console.log(`DRY_RUN ${page.slug} ${html.length} bytes`);
        continue;
      }
      const updated = await wp(env.WP_BASE_URL, auth, `/wp/v2/${page.type}/${page.id}`, {
        method: "POST",
        body: JSON.stringify({ content: html }),
      });
      preflight.updated.push({ slug: page.slug, id: page.id, link: updated.link });
      console.log(`UPDATED ${page.slug} ${updated.link}`);
    } catch (e) {
      backup.errors.push({ slug: page.slug, id: page.id, error: e.message });
      preflight.errors.push({ slug: page.slug, error: e.message });
      console.error(`ERROR ${page.slug}: ${e.message}`);
    }
  }
  writeFileSync(backupPath, JSON.stringify(backup, null, 2), "utf8");
  writeFileSync(reportPath, JSON.stringify(preflight, null, 2), "utf8");
  console.log("BACKUP:", backupPath);
  console.log("XONG BATCH 2. Xem report tại:", reportPath);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
