import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const OUT_DIR = join(PROJECT, "content-drafts", "hut-be-phot");
const HOTLINE = "0963.953.533 / 0931.156.756";
const IMAGE =
  "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/xe-hut-be-phot-chuyen-dung-quang-ninh-02.webp";

const profiles = [
  ["hut-be-phot-quang-ninh", 26, "hút bể phốt Quảng Ninh", "Quảng Ninh", "Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên, Đông Triều, Móng Cái, Vân Đồn, Hoành Bồ, Bãi Cháy", "nhà dân tại Hạ Long"],
  ["hut-be-phot-ha-long", 52, "hút bể phốt Hạ Long", "Hạ Long", "Bãi Cháy, Hòn Gai, Cao Xanh, Hà Khẩu, Tuần Châu, Việt Hưng, Cao Thắng", "nhà hàng tại Bãi Cháy"],
  ["hut-be-phot-cam-pha", 53, "hút bể phốt Cẩm Phả", "Cẩm Phả", "Cẩm Trung, Cẩm Thành, Cẩm Thủy, Cẩm Sơn, Cửa Ông, Mông Dương, Quang Hanh", "nhà dân tại Cửa Ông"],
  ["hut-be-phot-uong-bi", 54, "hút bể phốt Uông Bí", "Uông Bí", "Vàng Danh, Yên Thanh, Quang Trung, Thanh Sơn, Trưng Vương, Phương Đông, Phương Nam", "nhà trọ tại Yên Thanh"],
  ["hut-be-phot-mong-cai", 55, "hút bể phốt Móng Cái", "Móng Cái", "Trần Phú, Hải Yên, Hải Hòa, Ninh Dương, Bình Ngọc, Vạn Ninh, Hải Xuân", "cửa hàng tại Hải Yên"],
  ["hut-be-phot-van-don", 58, "hút bể phốt Vân Đồn", "Vân Đồn", "Cái Rồng, Đông Xá, Hạ Long, Đoàn Kết, Bình Dân, Quan Lạn, Minh Châu", "nhà dân tại Cái Rồng"],
  ["hut-be-phot-hoanh-bo", 59, "hút bể phốt Hoành Bồ", "Hoành Bồ", "Trới, Lê Lợi, Thống Nhất, Sơn Dương, Dân Chủ, Quảng La, Bằng Cả", "nhà dân tại Trới"],
  ["hut-be-phot-dong-trieu", 56, "hút bể phốt Đông Triều", "Đông Triều", "Mạo Khê, Tràng An, Bình Khê, An Sinh, Yên Thọ, Hưng Đạo, Kim Sơn", "khu dân cư tại Mạo Khê"],
  ["hut-be-phot-quang-yen", 57, "hút bể phốt Quảng Yên", "Quảng Yên", "Đông Mai, Minh Thành, Sông Khoai, Tiền An, Liên Hòa, Phong Hải, Yên Hải", "nhà dân tại Đông Mai"],
  ["hut-be-phot-bai-chay", 436, "hút bể phốt Bãi Cháy", "Bãi Cháy", "Bãi Cháy, Cái Dăm, Hùng Thắng, Tuần Châu, tuyến khách sạn, nhà hàng và khu dân cư ven biển", "khách sạn tại Bãi Cháy"],
].map(([slug, id, keyword, area, wards, casePlace]) => ({ slug, id, keyword, area, wards, casePlace }));

function cap(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function len(value) {
  return [...value].length;
}

function fitTitle(keyword) {
  const options = [
    `${cap(keyword)} 24/7, xe bồn vào nhanh, báo giá rõ`,
    `${cap(keyword)} 24/7, hút sạch, báo giá rõ, có mặt nhanh`,
    `${cap(keyword)} 24/7, xe bồn hút sạch, có mặt nhanh`,
    `${cap(keyword)} 24/7, xe bồn vào nhanh, xử lý gọn`,
  ];
  return options.find((item) => len(item) >= 60 && len(item) <= 70) ?? options[0];
}

function fitDesc(keyword) {
  const options = [
    `${cap(keyword)} 24/7, xe bồn hút sạch, không tràn bẩn, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý bể đầy, mùi hôi ngay trong ngày tại nhà.`,
    `${cap(keyword)} 24/7, xe bồn hút sạch, báo giá rõ, có mặt nhanh. Gọi 0963.953.533 / 0931.156.756 để xử lý bể đầy, trào ngược ngay trong ngày.`,
    `${cap(keyword)} 24/7, xe bồn hút sạch, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý bể phốt đầy, mùi hôi, trào ngược ngay tại nhà.`,
  ];
  return options.find((item) => len(item) >= 150 && len(item) <= 160) ?? options[0];
}

function article(profile) {
  const kw = profile.keyword;
  const Kw = cap(kw);
  const title = fitTitle(kw);
  const desc = fitDesc(kw);
  return `Meta Title: ${title}

Meta Description: ${desc}

Slug: ${profile.slug}

Focus Keyword: ${kw}

Search Intent: Khách tại ${profile.area} cần xe hút bể phốt đến nhanh, muốn biết giá, xe có vào được không, hút có sạch không và hotline gọi trực tiếp.

# ${Kw} 24/7, xe bồn có mặt nhanh

Bể phốt đầy tại ${profile.area} thường gây mùi hôi, bồn cầu rút chậm, nước thải trào ngược và làm sinh hoạt đảo lộn. Lúc này, điều cần nhất là gọi đúng đội **${kw}** có xe bồn phù hợp, ống hút đủ dài và thao tác gọn.

Môi Trường Đô Thị Số 1 Quảng Ninh nhận **${kw}** 24/7 tại ${profile.wards}. Gọi **${HOTLINE}**, kỹ thuật hỏi nhanh dung tích bể, vị trí đặt xe, chiều dài ống cần kéo và điều xe gần nhất.

Dịch vụ **${kw}** ưu tiên hút sạch, hạn chế mùi, không làm bẩn khu vực sinh hoạt và báo giá trước khi làm. Xe bồn được điều theo mặt bằng thực tế, có phương án kéo ống cho nhà trong ngõ sâu, nhà hàng, nhà trọ, khách sạn và khu dân cư đông người.

![${kw} bằng xe bồn chuyên dụng](${IMAGE})

## Khi nào cần gọi ${kw} ngay

Không nên chờ đến khi nước thải trào mạnh mới gọi thợ. Khi bể phốt đầy, khí và chất thải có thể đẩy ngược lên bồn cầu, thoát sàn, hố ga hoặc khu vực bếp, gây mùi hôi kéo dài.

Bạn nên gọi **${kw}** khi gặp các dấu hiệu sau:

- Bồn cầu rút chậm, xả nước yếu dù không có dị vật.
- Nhà vệ sinh có mùi hôi nặng, nhất là buổi sáng hoặc sau mưa.
- Nước thải trào ngược ở bồn cầu, thoát sàn hoặc hố ga.
- Bể phốt lâu năm chưa hút, nhà có thêm người sử dụng hoặc kinh doanh lưu trú.
- Đã thông tắc nhiều lần nhưng tình trạng nhanh tái phát.
- Hố ga có bùn đầy, nước đen, váng nổi hoặc bọt khí.

Nếu bể chỉ đầy nhẹ, xe bồn có thể hút sạch trong thời gian ngắn. Nếu bể đầy kèm tắc cống, hố ga lắng bùn hoặc đường ống nghẹt, đội **${kw}** sẽ kiểm tra thêm để tránh xử lý nửa chừng.

Khi gọi hotline, hãy nói rõ địa chỉ tại ${profile.area}, xe có vào sát nhà không, khoảng cách từ xe đến nắp bể, bể nằm trong nhà hay ngoài sân. Những thông tin này giúp đội **${kw}** mang đúng chiều dài ống và điều xe phù hợp.

## Nguyên nhân bể phốt đầy tại ${profile.area}

${profile.area} có nhiều dạng công trình: nhà dân, nhà hàng, khách sạn, nhà trọ, chung cư, trường học, cơ sở sản xuất nhỏ và công trình cải tạo. Mỗi nơi có tần suất xả thải khác nhau nên chu kỳ hút cũng khác nhau.

Nguyên nhân phổ biến nhất là bể sử dụng nhiều năm chưa hút. Lớp bùn đặc và váng nổi chiếm dần dung tích, làm nước thải không còn thời gian lắng, từ đó đẩy mùi hôi và chất thải ngược lên thiết bị vệ sinh.

Nguyên nhân thứ hai là số người sử dụng tăng. Nhà trọ, quán ăn, khách sạn, cơ sở lưu trú và hộ gia đình đông người thường làm bể đầy nhanh hơn thiết kế ban đầu.

Nguyên nhân thứ ba là xả vật khó phân hủy xuống bồn cầu. Khăn ướt, giấy dày, băng vệ sinh, tóc và rác nhỏ làm bể nhanh đầy, đồng thời tạo điểm nghẹt ở ống thoát.

Nguyên nhân thứ tư là hố ga hoặc cống nhánh tắc. Khi cống không thoát, nhiều khách tưởng bể phốt đầy nhưng thực tế cần kết hợp [thông tắc cống Quảng Ninh](https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/).

Nguyên nhân thứ năm là bể xây sai kết cấu, ngăn lắng nhỏ hoặc đường ống thông hơi kém. Trường hợp này cần kiểm tra kỹ trước khi báo phương án, tránh hút xong vài ngày lại bốc mùi.

Xác định đúng nguyên nhân giúp dịch vụ **${kw}** xử lý nhanh và giảm phát sinh. Mục tiêu của **${kw}** không chỉ là hút hết bùn, mà còn kiểm tra dòng thoát sau khi hút để hạn chế tái phát.

## Tại sao chọn Môi Trường Đô Thị Số 1 Quảng Ninh

Khách gọi **${kw}** thường đang cần xử lý nhanh vì mùi hôi, trào ngược hoặc công trình đang vận hành. Quy trình tiếp nhận đi thẳng vào việc cần làm: hỏi vị trí bể, lối xe vào, chiều dài ống, loại công trình và thời điểm cần xe đến.

Đội **${kw}** được điều theo khu vực để giảm thời gian di chuyển. Với các điểm gần trung tâm, đường lớn, khu dân cư, nhà hàng, khách sạn và nhà trọ, kỹ thuật báo thời gian dự kiến rõ trước khi khách chờ.

Thiết bị xử lý gồm xe bồn hút bể phốt, ống hút nhiều đoạn, dụng cụ mở nắp bể, máy hỗ trợ thông tắc và thiết bị vệ sinh khu vực sau khi hoàn tất. Từng ca được chọn xe theo mặt bằng, không áp một cách làm cho mọi trường hợp.

Điểm quan trọng là hạn chế mùi và không làm bẩn khu vực sinh hoạt. Với đa số ca bể đầy, đội xe mở nắp đúng điểm, kéo ống gọn, hút theo từng lớp bùn và xả kiểm tra sau khi bàn giao.

Khách được báo giá trước khi làm. Nếu phát hiện tắc ống chính, hố ga đầy bùn, nắp bể khó mở hoặc cần kéo ống xa, đội thợ báo lại phương án và chi phí trước khi triển khai tiếp.

Sau khi hút, thợ kiểm tra lại lực xả, mùi hôi, thoát sàn và hố ga liên quan. Với ca nặng, khách được hướng dẫn theo dõi thêm để phát hiện sớm dấu hiệu bất thường.

Nếu bạn cần **xe hút bể phốt vào ngõ sâu**, hãy gọi cùng hotline. Đội kỹ thuật sẽ hỏi chiều rộng ngõ, vị trí đỗ xe, khoảng cách kéo ống và đưa phương án phù hợp.

Gọi ngay **${HOTLINE}** để đặt lịch **${kw}**. Cung cấp vị trí, ảnh nắp bể nếu có và tình trạng mùi/trào, thợ sẽ báo hướng xử lý phù hợp.

## Cam kết 3 Không: Không đục phá / Không báo giá ảo / Không tái phát

Cam kết đầu tiên của **${kw}** là không đục phá khi chưa có căn cứ kỹ thuật. Thợ kiểm tra vị trí nắp bể, đường ống, hố ga và điểm hút trước khi đề xuất mở thêm hoặc tháo lắp.

Cam kết thứ hai là không báo giá ảo. Giá được nói rõ theo vị trí, khoảng cách kéo ống, khối lượng hút, thời điểm gọi và có cần xử lý kèm cống/hố ga hay không.

Cam kết thứ ba là hạn chế tái phát. Sau khi hút xong, thợ kiểm tra lại dòng thoát, nhắc khách không xả khăn ướt, dầu mỡ, giấy dày hoặc vật khó phân hủy xuống bồn cầu.

Với nhà trong ngõ, công trình sâu hoặc mặt bằng khó tiếp cận, đội **${kw}** ưu tiên kéo ống gọn và giữ vệ sinh lối đi. Nếu cần xe nhỏ hơn hoặc nối ống dài, kỹ thuật báo trước để khách chủ động.

Cam kết này áp dụng cho nhà dân, nhà trọ, quán ăn, khách sạn, nhà nghỉ, trường học, văn phòng, cơ sở sản xuất nhỏ và công trình cải tạo tại ${profile.area}.

## Bảng giá ${kw}

Chi phí **${kw}** phụ thuộc vào khối lượng bùn, khoảng cách kéo ống, vị trí đặt bể, thời điểm gọi, loại xe cần điều và có phải xử lý kèm hố ga/cống nhánh không.

| Hạng mục | Tình trạng thường gặp | Giá tham khảo |
|---|---|---|
| Hút bể phốt hộ gia đình | Bể đầy, mùi hôi, bồn cầu rút chậm | Theo khối lượng |
| Hút bể phốt nhà trọ | Nhiều phòng, tần suất dùng cao | Khảo sát và báo giá |
| Hút bể phốt nhà hàng/khách sạn | Cần làm nhanh, hạn chế ảnh hưởng kinh doanh | Khảo sát và báo giá |
| Xe hút vào ngõ sâu | Cần kéo ống dài hoặc đổi vị trí đỗ xe | Báo theo mặt bằng |
| Nạo vét hố ga kết hợp | Hố ga đầy bùn, nước trào sau mưa | Theo khối lượng |
| Thông tắc sau hút | Bể đầy kèm nghẹt ống/cống nhánh | Theo nguyên nhân |

Mức giá trên giúp khách ước lượng trước khi gọi. Trước khi thi công, thợ nói rõ chi phí dự kiến và phương án xử lý. Khách đồng ý rồi mới làm.

Khách có thể xem thêm [bảng giá](https://thongtaccongquangninh.com/bang-gia/) để so sánh các hạng mục liên quan. Nếu bể đầy kèm cống thoát chậm, nên kiểm tra thêm [thông tắc cống Quảng Ninh](https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/).

Nếu bồn cầu trào ngược sau khi bể đầy, khách có thể cần thêm [thông tắc bồn cầu Quảng Ninh](https://thongtaccongquangninh.com/thong-tac-bon-cau-quang-ninh/) để xử lý đúng điểm nghẹt. Với hố ga nhiều bùn, xem thêm [nạo vét hố ga Quảng Ninh](https://thongtaccongquangninh.com/nao-vet-ho-ga-quang-ninh/).

Không nên chọn báo giá quá thấp nhưng không hỏi khối lượng và vị trí bể. Bể phốt gia đình, bể nhà hàng và bể khu trọ là các trường hợp khác nhau, cần xe và thời gian khác nhau.

## Quy trình 5 bước hút bể phốt tại nhà

Quy trình **${kw}** được làm rõ để khách biết xe đang xử lý đến đâu và vì sao chọn phương án đó.

Bước 1: Tiếp nhận cuộc gọi. Khách cung cấp địa chỉ tại ${profile.area}, tình trạng mùi hôi, trào ngược, bồn cầu rút chậm, vị trí nắp bể và xe có vào được không.

Bước 2: Khảo sát tại chỗ. Thợ kiểm tra nắp bể, hố ga, đường ống, khoảng cách kéo ống và các thiết bị vệ sinh liên quan.

Bước 3: Báo phương án và giá. Nếu xe vào sát, báo theo khối lượng hút. Nếu phải kéo ống xa, mở nắp khó hoặc cần xử lý kèm cống, báo rõ trước khi làm.

Bước 4: Hút bể phốt gọn. Đội **${kw}** kéo ống, mở nắp, hút bùn/váng/nước thải theo đúng quy trình, hạn chế mùi và giữ vệ sinh khu vực thao tác.

Bước 5: Xả thử và bàn giao. Sau khi hút xong, thợ kiểm tra bồn cầu, thoát sàn, hố ga, dọn khu vực làm việc và hướng dẫn cách dùng để giảm nguy cơ đầy nhanh.

Quy trình này áp dụng cho ca ban ngày, ban đêm, cuối tuần và ngày lễ. Việc hỏi kỹ trước khi đi giúp điều đúng xe và giảm thời gian chờ.

## Khu vực nhận ${kw}

Môi Trường Đô Thị Số 1 Quảng Ninh nhận **${kw}** tại ${profile.wards}. Ngoài ra, đội kỹ thuật có thể điều xe gần nhất cho các khu vực lân cận trong tỉnh.

Nhà dân thường cần hút do bể nhiều năm chưa xử lý. Nhà trọ, quán ăn, khách sạn và cơ sở đông người dễ đầy nhanh do tần suất dùng cao, nhiều người xả vật khó phân hủy và hệ thống thoát nước chịu tải liên tục.

Nếu bể đầy kèm mùi từ nhà vệ sinh, khách có thể cần thêm **thợ xử lý mùi hôi nhà vệ sinh**. Đội kỹ thuật sẽ kiểm tra phễu thoát sàn, bẫy nước, cổ ống và đường thông khí, không chỉ hút riêng bể.

Khách ngoài ${profile.area} vẫn có thể gọi hotline để được điều xe gần nhất. Với nhu cầu tổng thể tại tỉnh, xem thêm dịch vụ [hút bể phốt Quảng Ninh](https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/).

## Case study E-E-A-T: xử lý bể phốt đầy tại ${profile.casePlace}

Một khách tại ${profile.casePlace} gọi vào buổi tối vì bồn cầu tầng một rút chậm, nhà vệ sinh có mùi hôi nặng và thoát sàn có tiếng ọc nước. Gia đình đã thử thông bằng pittong nhưng tình trạng chỉ giảm tạm thời.

Kỹ thuật hỏi nhanh qua điện thoại và nhận thấy dấu hiệu không chỉ tắc ở cổ bồn. Nhà đã dùng bể nhiều năm, chưa hút định kỳ, trong khi hố ga cũng có nước đen và váng nổi.

Sau khi đến nơi, đội **${kw}** kiểm tra nắp bể, hố ga và đường thoát. Thợ kéo ống hút đúng vị trí, hút phần bùn đặc, váng nổi và nước thải trong bể, sau đó xả thử nhiều lần.

Vì hố ga có dấu hiệu lắng bùn, khách được báo thêm phương án nạo vét để xử lý gốc. Sau khi hoàn tất, bồn cầu thoát mạnh trở lại, thoát sàn không còn ọc nước và khu vực làm việc được vệ sinh.

Case này cho thấy cần đánh giá toàn hệ thống. Nếu chỉ thông phần miệng bồn cầu mà bỏ qua bể đầy hoặc hố ga nghẹt, tình trạng có thể quay lại sau vài ngày.

## Lưu ý trước khi xe hút đến

Trước khi đội **${kw}** đến, khách nên xác định vị trí nắp bể nếu biết. Nếu nắp bể bị che bởi gạch, sân, cây cảnh hoặc đồ đạc, nên dọn lối để thợ kiểm tra nhanh hơn.

Không nên tiếp tục xả nhiều nước khi bồn cầu đã trào. Nếu đã dùng hóa chất, cần báo trước để thợ thao tác an toàn và tránh hơi hóa chất bốc lên khi mở bể.

Nên báo chiều rộng ngõ, vị trí đỗ xe và khoảng cách từ xe đến bể. Với quán ăn, nhà trọ, khách sạn, nên cho biết giờ phù hợp để giảm ảnh hưởng khách đang sử dụng.

Khi gọi **${HOTLINE}**, chỉ cần nói ngắn gọn: địa chỉ tại ${profile.area}, bể đầy bao lâu, có mùi hôi không, bồn cầu có trào không, xe có vào sát được không.

## NAP liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh

Tên đơn vị: Môi Trường Đô Thị Số 1 Quảng Ninh

Website: https://thongtaccongquangninh.com

Hotline: **${HOTLINE}**

Dịch vụ chính tại ${profile.area}: **${kw}**, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi nhà vệ sinh.

Khu vực phục vụ: ${profile.area}, Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên, Đông Triều, Móng Cái, Vân Đồn và các khu vực lân cận tại Quảng Ninh.

Thời gian hỗ trợ: 24/7, nhận ca gấp ngoài giờ, cuối tuần và ngày lễ tùy tình trạng điều xe.

Khi cần **${kw}**, bể đầy, mùi hôi hoặc nước trào ngược, gọi ngay **${HOTLINE}**. Đội kỹ thuật hỏi nhanh tình trạng, báo hướng xử lý và điều xe đến điểm gần nhất. Với ca gấp, **${kw}** được ưu tiên xử lý theo vị trí gần nhất.

## FAQ về ${kw}

### Gọi ${kw} bao lâu thì có xe đến?

Khu vực trung tâm ${profile.area} và các điểm gần đội xe thường có thể điều xe nhanh, tùy thời điểm và mật độ ca đang xử lý. Khi gọi **${HOTLINE}**, khách được báo thời gian dự kiến trước khi chờ.

### ${Kw} có làm bẩn nhà không?

Đội xe kéo ống theo lối phù hợp, mở nắp đúng vị trí và vệ sinh khu vực thao tác sau khi hút. Khách nên dọn sẵn lối vào để việc hút bể phốt diễn ra gọn hơn.

### Bể phốt đầy kèm cống tắc thì xử lý thế nào?

Thợ cần hút bể trước nếu bể quá tải, sau đó kiểm tra cống nhánh, hố ga và bồn cầu. Nếu đường ống còn nghẹt, đội kỹ thuật sẽ báo phương án thông tắc riêng trước khi làm.

### Giá ${kw} ban đêm có cao hơn không?

Ca ban đêm, ngày lễ hoặc vị trí xa có thể có chi phí điều xe khác ban ngày. Khách được báo giá trước khi làm, không tự phát sinh khi chưa đồng ý.

Cần **${kw}**, bể đầy hoặc mùi hôi bốc lên, gọi ngay **${HOTLINE}** để được hỏi tình trạng, báo hướng xử lý và điều xe gần nhất.
`;
}

mkdirSync(OUT_DIR, { recursive: true });
const selected = process.argv.slice(2);
const targets = selected.length ? profiles.filter((profile) => selected.includes(profile.slug)) : profiles;
for (const profile of targets) {
  const path = join(OUT_DIR, `${profile.slug}-rankmath-90.md`);
  writeFileSync(path, article(profile), "utf8");
  console.log(JSON.stringify({ slug: profile.slug, id: profile.id, path }));
}
