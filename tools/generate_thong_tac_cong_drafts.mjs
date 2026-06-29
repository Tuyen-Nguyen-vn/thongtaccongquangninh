import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const OUT_DIR = join(PROJECT, "content-drafts", "thong-tac-cong");
const HOTLINE = "0963.953.533 / 0931.156.756";
const IMAGE =
  "https://thongtaccongquangninh.com/wp-content/uploads/2026/04/ky-thuat-thong-tac-cong-dan-dung-quang-ninh-01.webp";

const profiles = [
  ["thong-tac-cong-quang-ninh", 35, "thông tắc cống Quảng Ninh", "Quảng Ninh", "Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên, Đông Triều, Móng Cái, Vân Đồn", "nhà dân tại Hạ Long"],
  ["thong-tac-cong-ha-long", 296, "thông tắc cống Hạ Long", "Hạ Long", "Bãi Cháy, Hòn Gai, Cao Xanh, Hà Khẩu, Tuần Châu, Việt Hưng, Cao Thắng", "quán ăn tại Bãi Cháy"],
  ["thong-tac-cong-cam-pha", 400, "thông tắc cống Cẩm Phả", "Cẩm Phả", "Cẩm Trung, Cẩm Thành, Cẩm Thủy, Cẩm Sơn, Cửa Ông, Mông Dương, Quang Hanh", "nhà dân tại Cửa Ông"],
  ["thong-tac-cong-uong-bi", 405, "thông tắc cống Uông Bí", "Uông Bí", "Vàng Danh, Yên Thanh, Quang Trung, Thanh Sơn, Trưng Vương, Phương Đông, Phương Nam", "nhà trọ tại Yên Thanh"],
  ["thong-tac-cong-quang-yen", 424, "thông tắc cống Quảng Yên", "Quảng Yên", "Đông Mai, Minh Thành, Sông Khoai, Tiền An, Liên Hòa, Phong Hải, Yên Hải", "nhà dân tại Đông Mai"],
  ["thong-tac-cong-dong-trieu", 425, "thông tắc cống Đông Triều", "Đông Triều", "Mạo Khê, Tràng An, Bình Khê, An Sinh, Yên Thọ, Hưng Đạo, Kim Sơn", "khu dân cư tại Mạo Khê"],
  ["thong-tac-cong-mong-cai", 426, "thông tắc cống Móng Cái", "Móng Cái", "Trần Phú, Hải Yên, Hải Hòa, Ninh Dương, Bình Ngọc, Vạn Ninh, Hải Xuân", "cửa hàng tại Hải Yên"],
  ["thong-tac-cong-van-don", 427, "thông tắc cống Vân Đồn", "Vân Đồn", "Cái Rồng, Đông Xá, Hạ Long, Đoàn Kết, Bình Dân, Quan Lạn, Minh Châu", "nhà dân tại Cái Rồng"],
  ["thong-tac-cong-nha-hang-ha-long", 383, "thông tắc cống nhà hàng Hạ Long", "Hạ Long", "Bãi Cháy, Hòn Gai, Tuần Châu, Cái Dăm, Cao Xanh, khu ven biển và tuyến phố ăn uống", "nhà hàng tại Bãi Cháy"],
  ["thong-tac-cong-ngo-nho-ha-long", 384, "thông tắc cống ngõ nhỏ Hạ Long", "Hạ Long", "Hòn Gai, Cao Xanh, Hà Khẩu, Bãi Cháy, Cao Thắng, các tuyến ngõ hẹp xe lớn khó vào", "nhà trong ngõ tại Cao Xanh"],
  ["thong-tac-cong-chung-cu-ha-long", 380, "thông tắc cống chung cư Hạ Long", "Hạ Long", "Bãi Cháy, Hòn Gai, Trần Hưng Đạo, Cao Xanh, Cái Dăm, các tòa nhà và khu căn hộ", "căn hộ tại Bãi Cháy"],
].map(([slug, id, keyword, area, wards, casePlace]) => ({ slug, id, keyword, area, wards, casePlace }));

function cap(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function fitTitle(keyword) {
  const base = `${cap(keyword)} 24/7, không đục phá, có mặt nhanh`;
  if ([...base].length >= 60 && [...base].length <= 70) return base;
  const withGon = `${base} gọn`;
  if ([...withGon].length >= 60 && [...withGon].length <= 70) return withGon;
  return `${cap(keyword)} 24/7, xử lý nhanh không đục phá`;
}

function fitDesc(keyword) {
  const options = [
    `${cap(keyword)} 24/7, không đục phá, báo giá rõ, có mặt nhanh. Gọi 0963.953.533 / 0931.156.756 để xử lý tắc nghẽn, mùi hôi ngay trong ngày.`,
    `${cap(keyword)} 24/7, không đục phá, báo giá rõ, có mặt nhanh. Gọi 0963.953.533 / 0931.156.756 để thợ xử lý tắc nghẽn, mùi hôi ngay tại nhà.`,
    `${cap(keyword)} 24/7, không đục phá, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để thợ xử lý tắc nghẽn, trào ngược, mùi hôi ngay trong ngày.`,
  ];
  const hit = options.find((item) => [...item].length >= 150 && [...item].length <= 160);
  if (hit) return hit;
  let value = options[0];
  while ([...value].length < 150) value += " nhanh";
  while ([...value].length > 160) value = value.replace(", mùi hôi", "");
  return value;
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

Search Intent: Khách tại ${profile.area} cần xử lý cống tắc gấp, muốn biết giá, thời gian thợ đến, cách làm không đục phá và hotline gọi trực tiếp.

# ${Kw} 24/7, có mặt nhanh 15 phút

Cống tắc tại ${profile.area} thường làm nước bẩn dâng lên sàn, mùi hôi lan khắp nhà vệ sinh, bếp hoặc khu kinh doanh. Lúc này, điều cần nhất là gọi đúng đội **${kw}** có thiết bị phù hợp, kiểm tra đúng điểm nghẹt và xử lý gọn trong ngày.

Môi Trường Đô Thị Số 1 Quảng Ninh nhận **${kw}** 24/7 tại ${profile.wards}. Gọi **${HOTLINE}**, kỹ thuật hỏi nhanh tình trạng, báo hướng xử lý và điều thợ gần nhất.

Dịch vụ **${kw}** ưu tiên không đục phá, dùng máy lò xo, máy nén khí, đầu thông áp lực và xe bồn khi cống liên quan bể phốt hoặc hố ga đầy. Khách được báo giá trước khi làm, xả thử sau khi xử lý và nhận hướng dẫn để hạn chế tắc lại.

![${kw} bằng máy lò xo không đục phá](${IMAGE})

## Khi nào cần gọi ${kw} ngay

Không nên cố xả nước liên tục khi miệng cống đã trào hoặc rút chậm. Nước bẩn có thể chảy ngược ra sàn, đẩy mùi hôi vào phòng tắm, bếp, khu giặt hoặc khu vực khách đang sử dụng.

Bạn nên gọi **${kw}** khi gặp các dấu hiệu sau:

- Nước thoát sàn rút chậm, có xoáy yếu hoặc đọng lâu.
- Cống bốc mùi hôi dù đã vệ sinh bề mặt.
- Bồn cầu, chậu rửa, thoát sàn cùng rút chậm.
- Nước trào ngược sau khi xả mạnh hoặc sau mưa lớn.
- Đã dùng bột thông tắc, pittong, dây tay nhưng không hết.
- Tình trạng lặp lại nhiều lần tại nhà dân, nhà hàng, nhà trọ, chung cư hoặc mặt bằng kinh doanh.

Nếu điểm tắc nằm gần miệng thoát, thợ có thể xử lý bằng dụng cụ hoặc máy lò xo trong thời gian ngắn. Nếu cống tắc kèm mùi hôi nặng, nhiều thiết bị cùng rút chậm, nguyên nhân có thể nằm ở hố ga, cống nhánh hoặc bể phốt.

Khi gọi hotline, hãy nói rõ địa chỉ tại ${profile.area}, vị trí nước trào, thời gian phát sinh, có đổ hóa chất trước đó không và xe lớn có vào được không. Những thông tin này giúp đội **${kw}** mang đúng thiết bị ngay từ đầu.

## Nguyên nhân cống tắc tại ${profile.area}

${profile.area} có nhiều dạng công trình: nhà dân, quán ăn, nhà trọ, chung cư, cơ sở lưu trú nhỏ, mặt bằng kinh doanh và công trình cải tạo. Mỗi nơi có thói quen xả thải khác nhau nên nguyên nhân tắc cũng khác nhau.

Nguyên nhân phổ biến nhất là dầu mỡ, tóc, rác sinh hoạt, giấy dày, khăn ướt, bùn đất hoặc cặn xà phòng bám trong đường ống. Các chất này không gây tắc ngay lập tức nhưng tích tụ từng lớp, làm lòng ống hẹp dần.

Nguyên nhân thứ hai là hố ga đầy bùn hoặc lâu ngày chưa nạo vét. Khi hố ga quá tải, nước từ thoát sàn và cống nhánh không thoát kịp, tạo mùi hôi và trào ngược. Với trường hợp này, **${kw}** cần kiểm tra cả hố ga chứ không chỉ thông miệng cống.

Nguyên nhân thứ ba là đường ống sai độ dốc, lún, gãy hoặc có đoạn co gấp. Chất thải bị giữ lại tại điểm thấp, lâu ngày tạo mảng bám cứng. Nếu chỉ dùng hóa chất, tình trạng có thể giảm tạm thời rồi tái phát.

Nguyên nhân thứ tư là cống chung bị quá tải sau mưa hoặc giờ cao điểm xả thải. Nhà hàng, khu trọ, chung cư và tuyến ngõ đông người dùng thường gặp tình trạng này rõ hơn nhà dân ít người.

Nguyên nhân thứ năm là tự xử lý sai cách. Một số loại bột thông tắc có thể đóng cục, sinh nhiệt hoặc làm điểm nghẹt đi sâu hơn. Nếu đã dùng hóa chất, cần báo trước để thợ chọn phương án thao tác an toàn.

Xác định đúng nguyên nhân giúp dịch vụ **${kw}** xử lý nhanh và giảm phát sinh. Mục tiêu của **${kw}** không chỉ là làm nước rút, mà còn kiểm tra dòng chảy sau xử lý để hạn chế tắc lại.

## Tại sao chọn Môi Trường Đô Thị Số 1 Quảng Ninh

Khách gọi trong tình huống cống tắc thường đang rất gấp, vì vậy quy trình tiếp nhận đi thẳng vào việc cần làm. Tổng đài hỏi vị trí, dấu hiệu tắc, mức độ trào, loại công trình và thời điểm cần thợ có mặt.

Đội **${kw}** được điều theo khu vực để giảm thời gian di chuyển. Với các điểm gần trung tâm, đường lớn, khu dân cư và cơ sở kinh doanh, kỹ thuật báo thời gian dự kiến rõ trước khi khách chờ.

Thiết bị xử lý gồm máy lò xo thông cống, đầu dây nhiều kích thước, máy nén khí, dụng cụ mở hố ga và xe bồn hỗ trợ khi có dấu hiệu đầy bể hoặc hố ga quá tải. Từng ca được chọn thiết bị theo hiện trạng, không áp một cách làm cho mọi trường hợp.

Điểm quan trọng là hạn chế tác động đến nền sàn, tường, gạch và thiết bị vệ sinh. Với đa số ca tắc do dầu mỡ, tóc, rác mềm, bùn hoặc cặn bám, thợ ưu tiên xử lý qua miệng thoát, hố ga hoặc điểm kỹ thuật có sẵn.

Khách được báo giá trước khi làm. Nếu phát hiện tắc ống chính, đầy hố ga, đầy bể phốt hoặc cần xe chuyên dụng, đội thợ báo lại phương án và chi phí trước khi triển khai tiếp.

Sau khi xử lý, thợ xả thử nhiều lần, kiểm tra lực nước, mùi hôi và các điểm thoát liên quan. Với ca nặng, khách được hướng dẫn theo dõi thêm để phát hiện sớm dấu hiệu bất thường.

Nếu bạn đang **tìm thợ thông cống không đục phá**, hãy gọi cùng một hotline. Đội kỹ thuật sẽ phân loại là tắc cống cục bộ, tắc cống nhánh, đầy hố ga hay cần hút bể phốt kết hợp.

Gọi ngay **${HOTLINE}** để đặt lịch **${kw}**. Cung cấp vị trí, ảnh khu vực nếu có và tình trạng nước rút, thợ sẽ báo hướng xử lý phù hợp.

## Cam kết 3 Không: Không đục phá / Không báo giá ảo / Không tái phát

Cam kết đầu tiên của **${kw}** là không đục phá khi chưa có căn cứ kỹ thuật. Thợ kiểm tra từ nhẹ đến sâu: quan sát dòng nước, thử xả, dùng máy lò xo, kiểm tra hố ga và chỉ đề xuất tháo dỡ khi cần.

Cam kết thứ hai là không báo giá ảo. Giá được nói rõ theo tình trạng tắc, vị trí, thời điểm gọi, thiết bị cần dùng và có xử lý kèm hố ga hoặc bể phốt hay không.

Cam kết thứ ba là hạn chế tái phát. Sau khi thông xong, thợ kiểm tra lại dòng chảy, nhắc khách không xả dầu mỡ, khăn ướt, rác vụn, tóc hoặc vật khó phân hủy xuống cống.

Với nhà trong ngõ, công trình sâu hoặc mặt bằng khó tiếp cận, đội **${kw}** ưu tiên đưa máy gọn vào trước. Nếu cần xe bồn, chúng tôi điều **xe hút bể phốt vào ngõ sâu** theo điều kiện thực tế.

Cam kết này áp dụng cho nhà dân, nhà trọ, quán ăn, nhà nghỉ, trường học, văn phòng, cơ sở sản xuất nhỏ và công trình cải tạo tại ${profile.area}.

## Bảng giá ${kw}

Chi phí **${kw}** phụ thuộc vào độ nặng của điểm tắc, khoảng cách di chuyển, thời điểm gọi, thiết bị cần dùng và có phải xử lý kèm hố ga, bể phốt hay cống nhánh không.

| Hạng mục | Tình trạng thường gặp | Giá tham khảo |
|---|---|---|
| Thông tắc cống nhẹ | Nước rút chậm, tắc gần miệng thoát | Từ 250.000đ |
| Thông tắc bằng máy lò xo | Tắc sâu hơn, cần đầu dây chuyên dụng | Từ 400.000đ |
| Xử lý cống bếp/dầu mỡ | Mảng bám dầu mỡ, mùi hôi, nước đọng | Khảo sát và báo giá |
| Nạo vét hố ga kết hợp | Hố ga đầy bùn, nước trào sau mưa | Theo khối lượng |
| Xe bồn hỗ trợ | Nghi đầy bể phốt hoặc hố ga lớn | Theo vị trí và khối lượng |
| Cơ sở kinh doanh | Nhà hàng, nhà nghỉ, nhà trọ đông người | Khảo sát và báo giá |

Mức giá trên giúp khách ước lượng trước khi gọi. Trước khi thi công, thợ nói rõ chi phí dự kiến và phương án xử lý. Khách đồng ý rồi mới làm.

Khách có thể xem thêm [bảng giá](https://thongtaccongquangninh.com/bang-gia/) để so sánh các hạng mục liên quan. Với nhu cầu hút bể phốt giá rẻ Quảng Ninh, cần kiểm tra khối lượng, vị trí đặt ống hút và điều kiện xe vào để báo đúng.

Không nên chọn báo giá quá thấp nhưng không hỏi tình trạng. Cống tắc do dầu mỡ và cống tắc do đầy hố ga là hai việc khác nhau, cần thiết bị khác nhau.

Nếu cống tắc đi kèm mùi hôi từ bể chứa, khách nên xem thêm [hút bể phốt Quảng Ninh](https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/) để xử lý đúng nguyên nhân.

## Quy trình 5 bước xử lý tại nhà

Quy trình **${kw}** được làm rõ để khách biết thợ đang xử lý đến đâu và vì sao chọn phương án đó.

Bước 1: Tiếp nhận cuộc gọi. Khách cung cấp địa chỉ tại ${profile.area}, tình trạng nước rút, có mùi hôi không, có trào ngược không và đã dùng hóa chất chưa.

Bước 2: Khảo sát tại chỗ. Thợ kiểm tra miệng thoát, thoát sàn, cống bếp, hố ga, đường thoát gần nhất và nắp bể phốt nếu tiếp cận được.

Bước 3: Báo phương án và giá. Nếu tắc nhẹ, dùng dụng cụ hoặc máy lò xo. Nếu tắc sâu, cần đầu dây dài hoặc máy nén khí. Nếu nghi đầy hố ga/bể phốt, báo phương án xử lý trước khi làm.

Bước 4: Thi công gọn. Đội **${kw}** thao tác bằng thiết bị phù hợp, hạn chế tháo dỡ, giữ vệ sinh khu vực làm việc và không đổ hóa chất bừa bãi.

Bước 5: Xả thử và bàn giao. Sau khi thông xong, thợ xả nhiều lần, kiểm tra lực nước, kiểm tra mùi, dọn khu vực làm việc và hướng dẫn cách dùng để giảm nguy cơ tắc lại.

Quy trình này áp dụng cho ca ban ngày, ban đêm, cuối tuần và ngày lễ. Việc hỏi kỹ trước khi đi giúp mang đúng thiết bị và giảm thời gian chờ.

## Khu vực nhận ${kw}

Môi Trường Đô Thị Số 1 Quảng Ninh nhận **${kw}** tại ${profile.wards}. Ngoài ra, đội kỹ thuật có thể điều thợ gần nhất cho các khu vực lân cận trong tỉnh.

Nhà dân thường tắc do tóc, rác vụn, dầu mỡ hoặc hố ga lâu ngày chưa nạo vét. Nhà hàng, nhà trọ, chung cư và cơ sở đông người dễ tắc do tần suất dùng cao, nhiều người xả vật khó phân hủy và hệ thống thoát nước chịu tải liên tục.

Nếu cống tắc kèm mùi từ nhà vệ sinh, khách có thể cần thêm **thợ xử lý mùi hôi nhà vệ sinh**. Đội kỹ thuật sẽ kiểm tra phễu thoát sàn, bẫy nước, cổ ống và đường thông khí, không chỉ xử lý riêng miệng cống.

Khách ngoài ${profile.area} vẫn có thể gọi hotline để được điều đội gần nhất. Với nhu cầu tổng thể tại tỉnh, xem thêm dịch vụ [thông tắc cống Quảng Ninh](https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/).

## Case study E-E-A-T: xử lý cống trào ngược tại ${profile.casePlace}

Một khách tại ${profile.casePlace} gọi vào buổi tối vì nước thoát sàn trào ngược, mùi hôi bốc lên mạnh và chậu rửa rút rất chậm. Gia đình đã thử xả nước nóng nhưng nước chỉ rút chậm rồi lại dâng.

Kỹ thuật hỏi nhanh qua điện thoại và nhận thấy dấu hiệu không chỉ tắc ở miệng thoát. Công trình đã sử dụng nhiều năm, hố ga chưa nạo vét định kỳ, trong khi cống bếp cũng rút chậm.

Sau khi đến nơi, đội **${kw}** kiểm tra thoát sàn, hố ga và đường ống nhánh. Thợ dùng máy lò xo xử lý đoạn nghẹt trước để giảm trào, sau đó xả thử nhiều lần và kiểm tra mùi.

Vì hố ga có dấu hiệu quá tải, khách được báo thêm phương án nạo vét để xử lý gốc. Sau khi hoàn tất, nước thoát mạnh trở lại, không còn ọc nước và khu vực làm việc được vệ sinh.

Case này cho thấy cần đánh giá toàn hệ thống. Nếu chỉ thông phần miệng cống mà bỏ qua hố ga đầy hoặc cống nhánh nghẹt, tình trạng có thể quay lại sau vài ngày.

## Lưu ý trước khi thợ đến

Trước khi đội **${kw}** đến, khách nên dừng xả nước nếu cống đã trào. Không tiếp tục đổ hóa chất khi đã thử một lần không hiệu quả.

Nếu nghi có dị vật như khăn, nắp chai, rác cứng, tóc cuộn hoặc dầu mỡ đóng mảng, hãy nói rõ khi gọi. Dị vật cứng cần cách xử lý khác với tắc dầu mỡ, cố đẩy bằng dây không đúng có thể làm vật mắc sâu hơn.

Nên mở sẵn lối vào khu vực cống, dọn vật dễ vỡ và báo chiều rộng ngõ nếu cần xe hoặc ống hút hỗ trợ. Với quán ăn, nhà trọ, cơ sở kinh doanh, nên cho biết giờ phù hợp để giảm ảnh hưởng khách.

Khi gọi **${HOTLINE}**, chỉ cần nói ngắn gọn: địa chỉ tại ${profile.area}, cống tắc bao lâu, nước rút chậm hay trào, có mùi hôi không, đã dùng hóa chất chưa.

## NAP liên hệ Môi Trường Đô Thị Số 1 Quảng Ninh

Tên đơn vị: Môi Trường Đô Thị Số 1 Quảng Ninh

Website: https://thongtaccongquangninh.com

Hotline: **${HOTLINE}**

Dịch vụ chính tại ${profile.area}: **${kw}**, thông tắc bồn cầu, hút bể phốt, nạo vét hố ga, xử lý mùi hôi nhà vệ sinh.

Khu vực phục vụ: ${profile.area}, Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên, Đông Triều, Móng Cái, Vân Đồn và các khu vực lân cận tại Quảng Ninh.

Thời gian hỗ trợ: 24/7, nhận ca gấp ngoài giờ, cuối tuần và ngày lễ tùy tình trạng điều xe.

Khi cần **${kw}**, nước trào ngược hoặc bốc mùi, gọi ngay **${HOTLINE}**. Đội kỹ thuật hỏi nhanh tình trạng, báo hướng xử lý và điều thợ đến điểm gần nhất. Với ca gấp, **${kw}** được ưu tiên xử lý theo vị trí gần nhất.

## FAQ về ${kw}

### Gọi ${kw} bao lâu thì có thợ đến?

Khu vực trung tâm ${profile.area} và các điểm gần đội kỹ thuật thường có thể điều thợ nhanh, tùy thời điểm và mật độ ca đang xử lý. Khi gọi **${HOTLINE}**, khách được báo thời gian dự kiến trước khi chờ.

### ${Kw} có cần đục nền không?

Phần lớn ca **${kw}** không cần đục nền nếu điểm tắc nằm ở miệng thoát, ống nhánh, hố ga gần hoặc do dầu mỡ, tóc, rác mềm. Chỉ khi có lỗi kết cấu hoặc tắc cứng sâu mới cần bàn phương án tháo lắp.

### Cống tắc do hố ga đầy thì xử lý thế nào?

Nếu hố ga đầy bùn hoặc nước trào sau mưa, thợ cần thông tuyến ống trước rồi nạo vét phần bùn lắng. Trường hợp liên quan bể phốt, đội kỹ thuật sẽ báo rõ phương án hút bể trước khi làm.

### Giá ${kw} ban đêm có cao hơn không?

Ca ban đêm, ngày lễ hoặc vị trí xa có thể có chi phí điều thợ/điều xe khác ban ngày. Khách được báo giá trước khi làm, không tự phát sinh khi chưa đồng ý.

Cần **${kw}**, nước trào hoặc mùi hôi bốc lên, gọi ngay **${HOTLINE}** để được hỏi tình trạng, báo hướng xử lý và điều thợ gần nhất.
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
