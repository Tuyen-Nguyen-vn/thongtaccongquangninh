import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const OUT_DIR = join(PROJECT, "content-drafts", "remaining");
const HOTLINE = "0963.953.533 / 0931.156.756";
const YOUTUBE = "https://www.youtube.com/@moitruongdothiso1quangninh";
const FACEBOOK = "https://www.facebook.com/thongtacconghalong24h";
const IMAGE =
  "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/og-ve-sinh-moi-truong-quang-ninh-phuc-vu-24-7.jpg";

const profiles = [
  {
    slug: "blog",
    id: 25,
    type: "pages",
    keyword: "blog vệ sinh môi trường Quảng Ninh",
    area: "Quảng Ninh",
    service: "hướng dẫn vệ sinh môi trường",
    intent: "Khách muốn đọc hướng dẫn xử lý cống tắc, bể phốt đầy, mùi hôi, bảng giá và biết khi nào cần gọi thợ.",
    casePlace: "nhà dân tại Hạ Long",
    metaTitle: "Blog vệ sinh môi trường Quảng Ninh 24/7, hướng dẫn xử lý nhanh",
    metaDescription:
      "Blog vệ sinh môi trường Quảng Ninh, hướng dẫn hút bể phốt, thông tắc cống, nạo vét, xử lý mùi hôi 24/7. Gọi 0963.953.533 / 0931.156.756 để xử lý nhanh.",
  },
  {
    slug: "trang-chu",
    id: 23,
    type: "pages",
    keyword: "trang chủ",
    area: "Quảng Ninh",
    service: "thông tắc cống",
    intent: "Khách vào trang chủ muốn biết dịch vụ chính, khu vực phục vụ, hotline, bảng giá và cách gọi thợ nhanh.",
    casePlace: "nhà dân tại Hạ Long",
    metaTitle: "Trang chủ Môi Trường Đô Thị Số 1 Quảng Ninh 24/7, gọi thợ nhanh",
    metaDescription:
      "Trang chủ Môi Trường Đô Thị Số 1 Quảng Ninh, nhận hút bể phốt, thông tắc cống, nạo vét, xử lý mùi hôi 24/7. Gọi 0963.953.533 / 0931.156.756.",
  },
  {
    slug: "lien-he",
    id: 63,
    type: "pages",
    keyword: "liên hệ",
    area: "Quảng Ninh",
    service: "thông tắc cống",
    intent: "Khách cần liên hệ nhanh, lấy hotline, gửi tình trạng và biết cách chuẩn bị trước khi thợ đến.",
    casePlace: "quán ăn tại Cẩm Phả",
    metaTitle: "Liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh 24/7, gọi thợ nhanh",
    metaDescription:
      "Liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh 24/7 để gọi hút bể phốt, thông tắc cống, nạo vét. Hotline 0963.953.533 / 0931.156.756.",
  },
  {
    slug: "gioi-thieu",
    id: 62,
    type: "pages",
    keyword: "giới thiệu",
    area: "Quảng Ninh",
    service: "thông tắc cống",
    intent: "Khách muốn tìm hiểu đơn vị, dịch vụ chính, cách làm việc, khu vực phục vụ và bằng chứng E-E-A-T trước khi gọi.",
    casePlace: "nhà trọ tại Uông Bí",
    metaTitle: "Giới thiệu Môi Trường Đô Thị Số 1 Quảng Ninh 24/7, gọi nhanh",
    metaDescription:
      "Giới thiệu Môi Trường Đô Thị Số 1 Quảng Ninh, nhận hút bể phốt, thông tắc cống, nạo vét, xử lý mùi hôi. Gọi 0963.953.533 / 0931.156.756.",
  },
  {
    slug: "chinh-sach-bao-hanh",
    id: 64,
    type: "pages",
    keyword: "chính sách bảo hành",
    area: "Quảng Ninh",
    service: "thông tắc cống",
    intent: "Khách muốn biết chính sách bảo hành sau khi thông tắc, hút bể, nạo vét hoặc xử lý mùi hôi.",
    casePlace: "khách sạn tại Bãi Cháy",
    metaTitle: "Chính sách bảo hành dịch vụ môi trường Quảng Ninh, rõ điều kiện",
    metaDescription:
      "Chính sách bảo hành dịch vụ hút bể phốt, thông tắc cống, nạo vét tại Quảng Ninh, ghi rõ điều kiện. Gọi 0963.953.533 / 0931.156.756.",
  },
  {
    slug: "chinh-sach-bao-mat",
    id: 282,
    type: "pages",
    keyword: "chính sách bảo mật",
    area: "Quảng Ninh",
    service: "thông tắc cống",
    intent: "Khách muốn biết cách website bảo mật thông tin liên hệ, địa chỉ, số điện thoại và dữ liệu gửi qua form.",
    casePlace: "khách hàng tại Quảng Yên",
    metaTitle: "Chính sách bảo mật thông tin khách hàng Quảng Ninh, rõ ràng",
    metaDescription:
      "Chính sách bảo mật thông tin khách hàng khi gọi hút bể phốt, thông tắc cống tại Quảng Ninh. Hotline 0963.953.533 / 0931.156.756.",
  },
  {
    slug: "thong-tac-cong-hong-gai-ha-long",
    id: 394,
    type: "posts",
    keyword: "thông tắc cống Hồng Gai Hạ Long",
    area: "Hồng Gai, Hạ Long",
    service: "thông tắc cống",
    intent: "Khách tại Hồng Gai cần xử lý cống tắc, nước trào, mùi hôi và muốn thợ đến nhanh trong ngày.",
    casePlace: "nhà dân tại Hồng Gai, Hạ Long",
  },
  {
    slug: "gia-thong-tac-cong-ha-long",
    id: 376,
    type: "posts",
    keyword: "giá thông tắc cống Hạ Long",
    area: "Hạ Long",
    service: "thông tắc cống",
    intent: "Khách muốn biết giá thông tắc cống Hạ Long, yếu tố làm thay đổi chi phí và hotline báo giá rõ trước khi làm.",
    casePlace: "quán ăn tại Bãi Cháy, Hạ Long",
  },
  {
    slug: "thong-tac-cong-ha-long-ban-dem",
    id: 377,
    type: "posts",
    keyword: "thông tắc cống Hạ Long ban đêm",
    area: "Hạ Long",
    service: "thông tắc cống",
    intent: "Khách cần gọi thợ thông tắc cống Hạ Long ban đêm khi nước trào, mùi hôi hoặc cơ sở kinh doanh không thể chờ sáng.",
    casePlace: "nhà nghỉ tại Bãi Cháy, Hạ Long",
  },
  {
    slug: "hut-be-phot-ha-long-xe-hut-24-7",
    id: 378,
    type: "posts",
    keyword: "hút bể phốt Hạ Long xe hút 24/7",
    area: "Hạ Long",
    service: "hút bể phốt",
    intent: "Khách cần xe hút bể phốt Hạ Long 24/7, muốn biết khi nào cần xe hút, giá tham khảo và cách điều xe vào ngõ.",
    casePlace: "nhà trọ tại Cao Xanh, Hạ Long",
  },
  {
    slug: "dau-hieu-be-phot-can-hut",
    id: 215,
    type: "posts",
    keyword: "dấu hiệu bể phốt cần hút",
    area: "Quảng Ninh",
    service: "hút bể phốt",
    intent: "Khách muốn nhận biết bể phốt đầy, mùi hôi, bồn cầu rút chậm và biết khi nào cần gọi xe hút.",
    casePlace: "nhà dân tại Hạ Long",
  },
  {
    slug: "cach-xu-ly-cong-thoat-nuoc-tac",
    id: 216,
    type: "posts",
    keyword: "cách xử lý cống thoát nước tắc",
    area: "Quảng Ninh",
    service: "thông tắc cống",
    intent: "Khách muốn biết tự xử lý cống thoát nước tắc bước đầu và khi nào cần gọi thợ.",
    casePlace: "nhà dân tại Cẩm Phả",
  },
  {
    slug: "bang-gia-hut-be-phot-quang-ninh-2026",
    id: 217,
    type: "posts",
    keyword: "bảng giá hút bể phốt Quảng Ninh 2026",
    area: "Quảng Ninh",
    service: "hút bể phốt",
    intent: "Khách muốn tham khảo giá hút bể phốt, yếu tố làm thay đổi chi phí và hotline báo giá.",
    casePlace: "nhà trọ tại Uông Bí",
  },
  {
    slug: "nao-vet-ho-ga-quang-ninh",
    id: 38,
    type: "pages",
    keyword: "nạo vét hố ga Quảng Ninh",
    area: "Quảng Ninh",
    service: "nạo vét hố ga",
    intent: "Khách cần nạo vét hố ga đầy bùn, nước trào, mùi hôi và muốn biết quy trình, giá.",
    casePlace: "tuyến hố ga tại Hạ Long",
  },
  {
    slug: "xu-ly-mui-hoi-quang-ninh",
    id: 311,
    type: "pages",
    keyword: "xử lý mùi hôi Quảng Ninh",
    area: "Quảng Ninh",
    service: "xử lý mùi hôi",
    intent: "Khách cần xử lý mùi hôi nhà vệ sinh, cống, bể phốt, hố ga và muốn gọi thợ kiểm tra.",
    casePlace: "nhà vệ sinh tại Quảng Yên",
  },
  {
    slug: "thong-tac-chau-rua-quang-ninh",
    id: 36,
    type: "pages",
    keyword: "thông tắc chậu rửa Quảng Ninh",
    area: "Quảng Ninh",
    service: "thông tắc chậu rửa",
    intent: "Khách cần xử lý chậu rửa bếp, lavabo, đường ống thoát nước tắc do dầu mỡ, rác, tóc.",
    casePlace: "bếp gia đình tại Bãi Cháy",
  },
  {
    slug: "thong-tac-toilet-quang-ninh",
    id: 166,
    type: "pages",
    keyword: "thông tắc toilet Quảng Ninh",
    area: "Quảng Ninh",
    service: "thông tắc toilet",
    intent: "Khách cần xử lý toilet tắc, nước trào, mùi hôi, muốn thợ đến nhanh không đục phá.",
    casePlace: "nhà nghỉ tại Móng Cái",
  },
  {
    slug: "nguyen-nhan-cong-tac-thuong-xuyen-ha-long",
    id: 386,
    type: "pages",
    keyword: "nguyên nhân cống tắc thường xuyên Hạ Long",
    area: "Hạ Long",
    service: "thông tắc cống",
    intent: "Khách muốn hiểu vì sao cống tắc lặp lại ở Hạ Long và cần hướng xử lý đúng gốc.",
    casePlace: "nhà hàng tại Bãi Cháy",
  },
  {
    slug: "bang-gia",
    id: 61,
    type: "pages",
    keyword: "bảng giá",
    area: "Quảng Ninh",
    service: "bảng giá dịch vụ",
    intent: "Khách muốn xem giá tham khảo cho hút bể phốt, thông tắc cống, nạo vét, xử lý mùi hôi.",
    casePlace: "khách hàng tại Cẩm Phả",
    metaTitle: "Bảng giá dịch vụ môi trường Quảng Ninh 2026, gọi thợ nhanh ngay",
    metaDescription:
      "Bảng giá dịch vụ môi trường Quảng Ninh 2026, báo giá rõ cho hút bể phốt, thông cống, nạo vét. Gọi 0963.953.533 / 0931.156.756 để xử lý nhanh trong ngày.",
  },
];

function cap(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function len(value) {
  return [...value].length;
}

function titleFor(keyword) {
  const options = [
    `${cap(keyword)} 24/7, báo giá rõ, gọi thợ nhanh`,
    `${cap(keyword)} 24/7, xử lý nhanh, báo giá rõ`,
    `${cap(keyword)} 24/7, không đục phá, báo giá rõ`,
    `${cap(keyword)} 2026, báo giá rõ, gọi thợ nhanh`,
    `${cap(keyword)} 24/7, báo giá rõ, xử lý nhanh tại nhà`,
    `${cap(keyword)}, cách xử lý đúng ngay`,
  ];
  const hit = options.find((item) => len(item) >= 60 && len(item) <= 70);
  if (hit) return hit;
  let value = `${cap(keyword)}, xử lý đúng ngay`;
  if (len(value) > 70) value = `${cap(keyword)}, báo giá rõ`;
  for (const suffix of [" tại nhà", " trong ngày", " nhanh", " 24/7"]) {
    if (len(value) >= 60) break;
    if (len(value + suffix) <= 70) value += suffix;
  }
  return value;
}

function descFor(keyword) {
  const options = [
    `${cap(keyword)} 24/7, kiểm tra đúng nguyên nhân, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để thợ xử lý nhanh trong ngày tại Quảng Ninh.`,
    `${cap(keyword)} 24/7, xử lý mùi hôi, trào ngược, tắc nghẽn, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để thợ đến nhanh.`,
    `${cap(keyword)} 24/7, tư vấn đúng tình trạng, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý nhanh trong ngày tại Quảng Ninh.`,
  ];
  const hit = options.find((item) => len(item) >= 150 && len(item) <= 160);
  if (hit) return hit;
  let value = options.find((item) => len(item) < 150) ?? options[options.length - 1];
  for (const suffix of [" tại nhà", " trong ngày", " nhanh"]) {
    if (len(value) >= 150) break;
    if (len(value + suffix) <= 160) value += suffix;
  }
  if (len(value) > 160) {
    value = value
      .replace(" trong ngày tại Quảng Ninh", "")
      .replace(" tại Quảng Ninh", "")
      .replace(" tắc nghẽn,", "");
  }
  return value;
}

function primarySymptom(profile) {
  if (profile.service.includes("hút")) return "bể đầy, mùi hôi, bồn cầu rút chậm hoặc trào ngược";
  if (profile.service.includes("mùi")) return "mùi hôi từ nhà vệ sinh, cống, hố ga hoặc bể phốt";
  if (profile.service.includes("chậu")) return "chậu rửa rút chậm, nước đọng, mùi hôi và dầu mỡ bám";
  if (profile.service.includes("toilet")) return "toilet tắc, nước dâng, mùi hôi và xả không trôi";
  if (profile.service.includes("nạo")) return "hố ga đầy bùn, nước trào và cống thoát chậm";
  if (profile.service.includes("bảng")) return "khách cần biết giá trước khi gọi thợ";
  return "cống tắc, nước trào, mùi hôi và tắc lặp lại";
}

function relatedLinks() {
  return `[hút bể phốt Quảng Ninh](https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/), [thông tắc cống Quảng Ninh](https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/), [thông tắc bồn cầu Quảng Ninh](https://thongtaccongquangninh.com/thong-tac-bon-cau-quang-ninh/) và [bảng giá](https://thongtaccongquangninh.com/bang-gia/)`;
}

function article(profile) {
  const kw = profile.keyword;
  const Kw = cap(kw);
  const symptom = primarySymptom(profile);
  const extraBangGia =
    profile.slug === "bang-gia"
      ? `
## Cách đọc bảng giá để tránh phát sinh

Khi xem **bảng giá**, khách nên đối chiếu ba yếu tố: tình trạng thực tế, vị trí công trình và thiết bị cần dùng. Một ca hút bể phốt trong ngõ sâu khác với ca xe vào sát nắp bể; một ca thông cống bếp dầu mỡ khác với cống sân đầy bùn sau mưa.

Nên gửi ảnh khu vực, mô tả mùi hôi, mức nước trào, thời gian phát sinh và lối xe vào nếu có. Thông tin càng rõ, đội kỹ thuật càng dễ báo khoảng giá sát hơn trước khi đến. Trước khi thi công, khách vẫn cần nghe báo giá cuối cùng tại chỗ rồi mới đồng ý làm.
`
      : "";
  return `Meta Title: ${profile.metaTitle ?? titleFor(kw)}

Meta Description: ${profile.metaDescription ?? descFor(kw)}

Slug: ${profile.slug}

Focus Keyword: ${kw}

Search Intent: ${profile.intent}

# ${Kw} 24/7, xử lý nhanh trong ngày

Khi gặp ${symptom}, nhiều gia đình và cơ sở kinh doanh tại ${profile.area} thường lúng túng vì không biết nên tự xử lý hay gọi thợ. Nếu xử lý sai, sự cố có thể nặng hơn, mùi hôi lan rộng và chi phí phát sinh tăng.

Môi Trường Đô Thị Số 1 Quảng Ninh hỗ trợ **${kw}** 24/7, có thợ và xe phù hợp cho nhà dân, nhà trọ, quán ăn, khách sạn, chung cư và công trình cải tạo. Gọi **${HOTLINE}**, kỹ thuật hỏi nhanh tình trạng, báo hướng xử lý và điều đội gần nhất.

Dịch vụ **${kw}** tập trung vào kiểm tra đúng nguyên nhân, báo giá rõ trước khi làm, hạn chế đục phá và bàn giao sau khi đã xả thử. Khách được hướng dẫn cách theo dõi sau xử lý để giảm nguy cơ tái phát.

![${kw} tại Quảng Ninh](${IMAGE})

## Khi nào cần xử lý ${kw} ngay

Không nên chờ sự cố nặng mới gọi thợ. Với ${symptom}, thời gian chậm xử lý có thể khiến nước bẩn lan sang nhiều khu vực, gây mùi hôi và ảnh hưởng sinh hoạt.

Bạn nên gọi hỗ trợ **${kw}** khi gặp các dấu hiệu sau:

- Sự cố lặp lại nhiều lần dù đã tự xử lý.
- Mùi hôi bốc lên sau khi xả nước hoặc sau mưa.
- Nước rút chậm, trào ngược hoặc đọng tại miệng thoát.
- Công trình đông người dùng, nhà trọ, quán ăn, khách sạn bị gián đoạn.
- Đã dùng hóa chất nhưng tình trạng không hết.
- Cần biết giá và phương án trước khi cho thợ làm.

Nếu sự cố mới phát sinh, thợ có thể xử lý nhanh bằng thiết bị gọn. Nếu vấn đề liên quan bể phốt, hố ga, cống nhánh hoặc đường ống âm sàn, đội kỹ thuật cần kiểm tra sâu hơn để tránh tái phát.

Khi gọi hotline, hãy nói rõ địa chỉ tại ${profile.area}, dấu hiệu đang gặp, thời điểm phát sinh và đã tự xử lý bằng cách nào. Những thông tin này giúp đội **${kw}** mang đúng thiết bị ngay từ đầu.

## Nguyên nhân thường gặp tại ${profile.area}

Nguyên nhân đầu tiên là chất thải, dầu mỡ, tóc, cặn xà phòng, giấy dày hoặc bùn lắng tích tụ lâu ngày. Các chất này bám trong bể, cống, hố ga hoặc ống thoát, làm dòng nước yếu dần rồi tắc hẳn.

Nguyên nhân thứ hai là công trình sử dụng vượt tải. Nhà trọ, quán ăn, khách sạn, chung cư và hộ gia đình đông người thường phát sinh sự cố nhanh hơn thiết kế ban đầu.

Nguyên nhân thứ ba là hệ thống thoát nước thiếu bảo trì. Bể phốt không hút định kỳ, hố ga không nạo vét, cống nhánh không được xả kiểm tra sẽ dễ phát sinh mùi hôi và trào ngược.

Nguyên nhân thứ tư là tự xử lý sai cách. Dùng hóa chất quá mạnh, đẩy dây sai hướng hoặc xả nước liên tục khi đã trào có thể làm điểm nghẹt sâu hơn.

Nguyên nhân thứ năm là kết cấu cũ, ống lún, co gấp hoặc thông hơi kém. Trường hợp này cần kiểm tra thực tế, không nên chỉ xử lý bề mặt.

Xác định đúng nguyên nhân giúp **${kw}** xử lý nhanh và giảm phát sinh. Mục tiêu không chỉ là làm hết sự cố trước mắt, mà còn kiểm tra dòng thoát sau xử lý để hạn chế tái phát.

## Tại sao chọn Môi Trường Đô Thị Số 1 Quảng Ninh

Khách gọi **${kw}** thường đang cần xử lý nhanh, vì vậy quy trình tiếp nhận đi thẳng vào việc cần làm. Kỹ thuật hỏi vị trí, dấu hiệu, loại công trình, thời điểm cần thợ và điều kiện tiếp cận.

Đội kỹ thuật được điều theo khu vực để giảm thời gian di chuyển. Với các điểm gần trung tâm, đường lớn, khu dân cư và cơ sở kinh doanh, khách được báo thời gian dự kiến trước khi chờ.

Thiết bị xử lý gồm máy lò xo, máy nén khí, dụng cụ mở hố ga, xe bồn hút bể phốt, ống hút nhiều đoạn và thiết bị vệ sinh khu vực sau khi làm. Từng ca được chọn thiết bị theo hiện trạng.

Điểm quan trọng là hạn chế đục phá và giữ vệ sinh khu vực thao tác. Với đa số ca tắc nghẽn, mùi hôi, bể đầy hoặc hố ga đầy bùn, đội kỹ thuật ưu tiên xử lý qua điểm kỹ thuật có sẵn.

Khách được báo giá trước khi làm. Nếu phát hiện phát sinh như kéo ống xa, mở nắp khó, tắc ống chính hoặc cần xe bồn, thợ báo lại phương án và chi phí trước khi triển khai tiếp.

Sau khi xử lý, thợ xả thử nhiều lần, kiểm tra mùi hôi, dòng nước và các điểm liên quan. Với ca nặng, khách được hướng dẫn theo dõi thêm để phát hiện sớm dấu hiệu bất thường.

Nếu cần thêm hạng mục liên quan, khách có thể xem ${relatedLinks()}.

Gọi ngay **${HOTLINE}** để đặt lịch **${kw}**. Cung cấp vị trí, ảnh khu vực nếu có và tình trạng hiện tại, thợ sẽ báo hướng xử lý phù hợp.

## Cam kết 3 Không: Không đục phá / Không báo giá ảo / Không tái phát

Cam kết đầu tiên của **${kw}** là không đục phá khi chưa có căn cứ kỹ thuật. Thợ kiểm tra từ nhẹ đến sâu, ưu tiên điểm kỹ thuật có sẵn trước khi đề xuất tháo lắp.

Cam kết thứ hai là không báo giá ảo. Giá được nói rõ theo tình trạng, vị trí, thời điểm gọi, thiết bị cần dùng và hạng mục có phát sinh hay không.

Cam kết thứ ba là hạn chế tái phát. Sau khi xử lý xong, thợ kiểm tra lại dòng thoát, nhắc khách cách sử dụng và các dấu hiệu cần theo dõi.

Với nhà trong ngõ, công trình sâu hoặc mặt bằng khó tiếp cận, đội **${kw}** ưu tiên thiết bị gọn, kéo ống hợp lý và giữ vệ sinh lối đi.

Cam kết này áp dụng cho nhà dân, nhà trọ, quán ăn, khách sạn, nhà nghỉ, trường học, văn phòng, cơ sở sản xuất nhỏ và công trình cải tạo tại ${profile.area}.

## Bảng giá ${kw}

Chi phí **${kw}** phụ thuộc vào nguyên nhân, mức độ nặng, vị trí, thời điểm gọi, thiết bị cần dùng và có phải xử lý kèm hố ga, cống nhánh hoặc bể phốt không.

| Hạng mục | Tình trạng thường gặp | Giá tham khảo |
|---|---|---|
| Kiểm tra và xử lý nhẹ | Sự cố mới phát sinh, vị trí dễ tiếp cận | Từ 250.000đ |
| Xử lý bằng máy chuyên dụng | Tắc sâu, mùi hôi hoặc tái phát | Từ 400.000đ |
| Xe bồn/hố ga hỗ trợ | Bể đầy, hố ga lắng bùn, nước trào | Theo khối lượng |
| Cơ sở kinh doanh | Nhà hàng, khách sạn, nhà trọ, chung cư | Khảo sát và báo giá |
| Ngoài giờ/ban đêm | Cần xử lý gấp để không gián đoạn | Báo trước khi đi |
| Bảo hành sau xử lý | Theo nguyên nhân và hạng mục thực tế | Ghi rõ khi bàn giao |

Mức giá trên giúp khách ước lượng trước khi gọi. Trước khi thi công, thợ nói rõ chi phí dự kiến và phương án xử lý. Khách đồng ý rồi mới làm.

Khách có thể xem thêm [bảng giá](https://thongtaccongquangninh.com/bang-gia/) để so sánh các hạng mục liên quan. Nếu cần hút bể, xem [hút bể phốt Quảng Ninh](https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/); nếu cần thông cống, xem [thông tắc cống Quảng Ninh](https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/).

Không nên chọn báo giá quá thấp nhưng không hỏi tình trạng. Mỗi nguyên nhân cần thiết bị và thời gian khác nhau.

${extraBangGia}

## Quy trình 5 bước xử lý tại nhà

Quy trình **${kw}** được làm rõ để khách biết thợ đang xử lý đến đâu và vì sao chọn phương án đó.

Bước 1: Tiếp nhận cuộc gọi. Khách cung cấp địa chỉ tại ${profile.area}, dấu hiệu, thời điểm phát sinh và mức độ ảnh hưởng.

Bước 2: Khảo sát tại chỗ. Thợ kiểm tra vị trí sự cố, điểm thoát, hố ga, bể phốt, đường ống hoặc thiết bị liên quan.

Bước 3: Báo phương án và giá. Nếu xử lý nhẹ, dùng thiết bị gọn. Nếu cần máy, xe bồn hoặc nạo vét, thợ báo rõ trước khi làm.

Bước 4: Thi công gọn. Đội **${kw}** thao tác bằng thiết bị phù hợp, hạn chế tháo dỡ, giữ vệ sinh khu vực làm việc và không đổ hóa chất bừa bãi.

Bước 5: Xả thử và bàn giao. Sau khi xử lý xong, thợ kiểm tra lại dòng nước, mùi hôi, khu vực liên quan và hướng dẫn cách hạn chế tái phát.

Quy trình này áp dụng cho ca ban ngày, ban đêm, cuối tuần và ngày lễ. Việc hỏi kỹ trước khi đi giúp mang đúng thiết bị và giảm thời gian chờ.

## Khu vực nhận ${kw}

Môi Trường Đô Thị Số 1 Quảng Ninh nhận **${kw}** tại ${profile.area} và các khu vực lân cận. Đội kỹ thuật có thể điều thợ hoặc xe gần nhất theo tình trạng thực tế.

Nhà dân thường gặp sự cố do dùng lâu ngày. Nhà trọ, quán ăn, khách sạn và cơ sở đông người dễ phát sinh nhanh hơn do tần suất dùng cao.

Nếu sự cố kèm mùi từ nhà vệ sinh, khách có thể cần thêm **thợ xử lý mùi hôi nhà vệ sinh**. Đội kỹ thuật sẽ kiểm tra phễu thoát sàn, bẫy nước, cổ ống và đường thông khí.

Khách ngoài ${profile.area} vẫn có thể gọi hotline để được điều đội gần nhất. Với nhu cầu tổng thể tại tỉnh, xem thêm ${relatedLinks()}.

## Case study E-E-A-T: xử lý sự cố tại ${profile.casePlace}

Một khách tại ${profile.casePlace} gọi vào buổi tối vì ${symptom}. Gia đình đã thử tự xử lý nhưng tình trạng chỉ giảm tạm thời rồi quay lại sau vài ngày.

Kỹ thuật hỏi nhanh qua điện thoại và nhận thấy dấu hiệu không chỉ nằm ở bề mặt. Công trình đã sử dụng nhiều năm, có nhiều điểm thoát liên quan và chưa được kiểm tra định kỳ.

Sau khi đến nơi, đội **${kw}** kiểm tra điểm phát sinh, hố ga, đường thoát và thiết bị liên quan. Thợ dùng thiết bị phù hợp để xử lý đoạn nghẹt hoặc phần quá tải trước, sau đó xả thử nhiều lần.

Vì hệ thống có dấu hiệu phát sinh từ nguyên nhân gốc, khách được báo thêm phương án xử lý triệt để. Sau khi hoàn tất, dòng thoát ổn định hơn, mùi hôi giảm và khu vực làm việc được vệ sinh.

Case này cho thấy cần đánh giá toàn hệ thống. Nếu chỉ xử lý điểm nhìn thấy mà bỏ qua bể đầy, hố ga nghẹt hoặc cống nhánh yếu, tình trạng có thể quay lại sau vài ngày.

## Lưu ý trước khi thợ đến

Trước khi đội **${kw}** đến, khách nên dừng xả nước nếu đã trào. Không tiếp tục đổ hóa chất khi đã thử một lần không hiệu quả.

Nếu nghi có dị vật, bùn, dầu mỡ, bể đầy hoặc mùi từ hố ga, hãy nói rõ khi gọi. Mỗi nguyên nhân cần cách xử lý khác nhau.

Nên mở sẵn lối vào khu vực sự cố, dọn vật dễ vỡ và báo chiều rộng ngõ nếu cần xe hoặc ống hút hỗ trợ. Với quán ăn, nhà trọ, khách sạn, nên cho biết giờ phù hợp để giảm ảnh hưởng khách.

Khi gọi **${HOTLINE}**, chỉ cần nói ngắn gọn: địa chỉ tại ${profile.area}, sự cố xảy ra bao lâu, đã tự xử lý chưa, có mùi hôi hoặc trào ngược không.

## NAP liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh

Tên đơn vị: Môi Trường Đô Thị Số 1 Quảng Ninh

Website: https://thongtaccongquangninh.com

YouTube: ${YOUTUBE}

Facebook: ${FACEBOOK}

Hotline: **${HOTLINE}**

Dịch vụ chính tại ${profile.area}: **${kw}**, hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi nhà vệ sinh.

Khu vực phục vụ: ${profile.area}, Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên, Đông Triều, Móng Cái, Vân Đồn và các khu vực lân cận tại Quảng Ninh.

Thời gian hỗ trợ: 24/7, nhận ca gấp ngoài giờ, cuối tuần và ngày lễ tùy tình trạng điều xe.

Khi cần **${kw}**, gọi ngay **${HOTLINE}**. Đội kỹ thuật hỏi nhanh tình trạng, báo hướng xử lý và điều thợ hoặc xe đến điểm gần nhất. Với ca gấp, **${kw}** được ưu tiên xử lý theo vị trí gần nhất.

## FAQ về ${kw}

### Gọi ${kw} bao lâu thì có thợ đến?

Khu vực trung tâm ${profile.area} và các điểm gần đội kỹ thuật thường có thể điều thợ nhanh, tùy thời điểm và mật độ ca đang xử lý. Khi gọi **${HOTLINE}**, khách được báo thời gian dự kiến trước khi chờ.

### ${Kw} có cần đục phá không?

Phần lớn ca **${kw}** không cần đục phá nếu có thể tiếp cận qua điểm kỹ thuật sẵn có. Chỉ khi có lỗi kết cấu hoặc vị trí bị che kín mới cần bàn phương án tháo lắp.

### Giá ${kw} tính thế nào?

Giá phụ thuộc nguyên nhân, vị trí, độ khó, thiết bị cần dùng và thời điểm xử lý. Khách được báo giá trước khi làm để tránh phát sinh không rõ ràng.

### Gọi ban đêm có được xử lý không?

Có. Hotline **${HOTLINE}** nhận ca gấp ngoài giờ, cuối tuần và ngày lễ. Kỹ thuật sẽ báo thời gian đến và chi phí nếu có khác ban ngày.

Cần **${kw}**, gọi ngay **${HOTLINE}** để được hỏi tình trạng, báo hướng xử lý và điều đội gần nhất.
`;
}

mkdirSync(OUT_DIR, { recursive: true });
const selected = process.argv.slice(2);
const targets = selected.length ? profiles.filter((profile) => selected.includes(profile.slug)) : profiles;
for (const profile of targets) {
  const path = join(OUT_DIR, `${profile.slug}-rankmath-90.md`);
  writeFileSync(path, article(profile), "utf8");
  console.log(JSON.stringify({ slug: profile.slug, id: profile.id, type: profile.type, path }));
}
