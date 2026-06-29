import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const BACKUP_DIR = join(PROJECT, "seo-revisions", "wp-before-ve-chung-toi-url-fix-2026-04-30");
const REPORT_PATH = join(PROJECT, "WORDPRESS_FIX_VE_CHUNG_TOI_URL_2026-04-30.json");
const HOTLINE = "0963.953.533 / 0931.156.756";

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function stripHtml(input) {
  return String(input ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function wordCount(input) {
  return (stripHtml(input).match(/[\p{L}\p{N}.]+/gu) ?? []).length;
}

async function wp(baseUrl, auth, path, init = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex ve chung toi url fix",
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

function content() {
  const keyword = "về chúng tôi";
  return `
<p><strong>Về chúng tôi</strong> là trang giới thiệu Môi Trường Đô Thị Số 1 Quảng Ninh, đơn vị xử lý hút bể phốt, thông tắc cống, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh. Khách truy cập trang này thường cần biết đơn vị có làm đúng việc không, có báo giá rõ không và gọi số nào để xử lý nhanh.</p>
<p>Môi Trường Đô Thị Số 1 Quảng Ninh phục vụ nhà dân, nhà trọ, quán ăn, khách sạn, chung cư, trường học, văn phòng và công trình cải tạo. Khi gặp bể phốt đầy, cống tắc, bồn cầu trào, hố ga đầy bùn hoặc mùi hôi nhà vệ sinh, khách gọi <strong>${HOTLINE}</strong> để được hỏi tình trạng và điều đội gần nhất.</p>
<figure class="wp-block-image"><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/04/og-ve-sinh-moi-truong-quang-ninh-phuc-vu-24-7.jpg" alt="về chúng tôi Môi Trường Đô Thị Số 1 Quảng Ninh" loading="lazy"></figure>
<h2>Nguyên nhân khách cần tìm hiểu về chúng tôi trước khi gọi</h2>
<p>Nhiều khách từng gặp tình trạng gọi thợ qua số lạ, báo một giá qua điện thoại nhưng đến nơi lại đổi hạng mục. Có trường hợp xử lý xong mới nói thêm phụ phí, không ghi bảo hành hoặc không kiểm tra lại dòng thoát. Vì vậy trang <strong>về chúng tôi</strong> cần nói rõ cách làm, phạm vi phục vụ và nguyên tắc báo giá.</p>
<p>Lý do thứ hai là mỗi sự cố môi trường có nguyên nhân khác nhau. Bồn cầu trào có thể do dị vật, bể phốt đầy, đường thông hơi kém hoặc hố ga nghẹt. Cống bếp tắc có thể do dầu mỡ, bùn, rác hoặc độ dốc ống sai. Nếu không hỏi kỹ, thợ dễ mang sai thiết bị hoặc xử lý sai điểm.</p>
<p>Lý do thứ ba là khách cần biết khu vực phục vụ. Quảng Ninh có nhiều địa bàn, từ Hạ Long, Cẩm Phả, Uông Bí, Móng Cái đến Đông Triều, Quảng Yên, Vân Đồn, Tiên Yên và các khu vực lân cận. Mỗi vị trí có thời gian di chuyển, điều kiện xe vào và chi phí khác nhau.</p>
<h2>Tại sao chọn Môi Trường Đô Thị Số 1 Quảng Ninh</h2>
<p>Điểm đầu tiên là tiếp nhận theo tình trạng thật. Kỹ thuật hỏi địa chỉ, dấu hiệu, thời điểm phát sinh, đã tự xử lý chưa, khu vực có dễ tiếp cận không và có cần xe bồn hay máy lò xo không. Cách hỏi này giúp báo hướng xử lý sát hơn, tránh đến nơi mới phát hiện thiếu thiết bị.</p>
<p>Điểm thứ hai là ưu tiên hạn chế đục phá. Với đa số ca thông tắc, hút bể, nạo vét và xử lý mùi, đội kỹ thuật kiểm tra từ điểm dễ tiếp cận trước. Chỉ khi có căn cứ về lỗi kết cấu, ống vỡ, ống lún hoặc điểm bị che kín mới bàn phương án tháo lắp.</p>
<p>Điểm thứ ba là báo giá trước khi làm. Khách được nói rõ hạng mục, thiết bị, chi phí dự kiến và điều kiện phát sinh. Nếu trong quá trình kiểm tra phát hiện nguyên nhân khác, thợ phải báo lại phương án rồi mới tiếp tục. Đây là nguyên tắc quan trọng trong trang <strong>về chúng tôi</strong>.</p>
<h2>Cam kết 3 Không</h2>
<ul><li><strong>Không đục phá khi chưa có căn cứ:</strong> ưu tiên kiểm tra bằng điểm kỹ thuật có sẵn, máy lò xo, máy nén, xe bồn hoặc dụng cụ nạo vét phù hợp.</li><li><strong>Không báo giá ảo:</strong> báo khoảng giá theo tình trạng, chốt giá trước khi thi công và nói rõ phần nào có thể phát sinh.</li><li><strong>Không để tái phát do làm qua loa:</strong> xả thử, kiểm tra lại mùi, dòng thoát và hướng dẫn khách theo dõi sau xử lý.</li></ul>
<h2>Bảng giá tham khảo</h2>
<table><thead><tr><th>Hạng mục</th><th>Giá tham khảo</th><th>Ghi chú</th></tr></thead><tbody><tr><td>Thông tắc cống, bồn cầu, chậu rửa</td><td>Từ 150.000đ/lần</td><td>Tùy vị trí và mức độ tắc</td></tr><tr><td>Hút bể phốt hộ gia đình</td><td>Từ 250.000đ/khối</td><td>Tùy xe vào gần hay kéo ống xa</td></tr><tr><td>Nạo vét hố ga, rãnh thoát</td><td>Báo giá thực tế</td><td>Theo lượng bùn và số hố</td></tr><tr><td>Xử lý mùi hôi nhà vệ sinh</td><td>Khảo sát thực tế</td><td>Theo nguyên nhân và vị trí</td></tr></tbody></table>
<p>Bảng giá chỉ để khách ước lượng trước. Giá cuối cùng phụ thuộc nguyên nhân, độ khó, thiết bị cần dùng, thời điểm gọi và điều kiện tiếp cận. Gọi <strong>${HOTLINE}</strong> để kỹ thuật hỏi tình trạng và báo khoảng giá phù hợp.</p>
<h2>Quy trình 5 bước làm việc</h2>
<p>Bước 1, tiếp nhận cuộc gọi. Khách nói rõ địa chỉ, loại sự cố và mức độ ảnh hưởng. Bước 2, kỹ thuật hỏi thêm vị trí nắp bể, hố ga, miệng cống, điều kiện xe vào và ảnh hiện trạng nếu có. Bước 3, đội gần nhất được điều đến hoặc hẹn lịch theo nhu cầu.</p>
<p>Bước 4, khảo sát tại chỗ và báo phương án. Nếu xử lý nhẹ, kỹ thuật dùng thiết bị gọn. Nếu cần xe bồn, nạo vét hoặc kiểm tra sâu, thợ báo rõ chi phí trước khi làm. Bước 5, thi công, xả thử, vệ sinh khu vực và bàn giao. Quy trình này áp dụng cho các dịch vụ chính được nêu trong trang <strong>về chúng tôi</strong>.</p>
<h2>Case study E-E-A-T thực tế</h2>
<p>Một nhà trọ tại Hạ Long gọi vì nhiều phòng vệ sinh rút chậm cùng lúc. Ban đầu khách nghĩ chỉ tắc bồn cầu cục bộ. Sau khi kiểm tra, kỹ thuật phát hiện bể phốt đã quá tải và hố ga gần khu phòng trọ có bùn lắng. Nếu chỉ thông từng bồn cầu, sự cố sẽ quay lại nhanh.</p>
<p>Đội kỹ thuật báo phương án hút bể, kiểm tra hố ga và xả thử các điểm thoát chính. Giá được nói rõ trước khi làm. Sau khi xử lý, nước thoát ổn định hơn, mùi giảm và khách được hướng dẫn theo dõi định kỳ. Case này cho thấy cần hỏi kỹ nguyên nhân trước khi chốt phương án.</p>
<h2>Khu vực phục vụ</h2>
<p>Môi Trường Đô Thị Số 1 Quảng Ninh phục vụ Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn, Hoành Bồ, Tiên Yên và các khu vực lân cận. Với điểm xa trung tâm, khách sẽ được báo thời gian di chuyển và chi phí dự kiến trước khi chờ thợ.</p>
<p>Các dịch vụ thường được gọi gồm hút bể phốt Quảng Ninh, thông tắc cống Quảng Ninh, thông tắc bồn cầu, nạo vét hố ga, vệ sinh đường ống và xử lý mùi hôi. Trang <strong>về chúng tôi</strong> là điểm tham chiếu để khách hiểu cách làm việc trước khi gọi.</p>
<h2>Cách kiểm chứng thông tin trước khi gọi</h2>
<p>Khách nên đọc trang <strong>về chúng tôi</strong> cùng các trang dịch vụ chính trước khi đặt lịch. Việc này giúp đối chiếu hotline, khu vực phục vụ, cách báo giá và những cam kết xử lý thực tế. Nếu một đơn vị chỉ ghi giá rất thấp nhưng không nói rõ điều kiện áp dụng, khách cần hỏi lại ngay để tránh phát sinh sau khi thợ đến.</p>
<p>Trên website này, thông tin cần kiểm tra trước gồm tên đơn vị, số điện thoại, dịch vụ nhận xử lý, địa bàn Quảng Ninh và các cam kết không đục phá khi chưa có căn cứ. Trang <strong>về chúng tôi</strong> cũng nêu rõ vì sao kỹ thuật phải hỏi hiện trạng trước khi báo hướng làm. Cống tắc do dầu mỡ khác với tắc do dị vật, bể phốt đầy khác với lỗi đường thông hơi, nên một mức giá chung cho mọi ca thường không đủ chính xác.</p>
<p>Khi gọi <strong>${HOTLINE}</strong>, khách có thể hỏi thẳng ba ý: ca này cần máy lò xo hay xe bồn, giá dự kiến gồm những phần nào, sau khi xử lý có xả thử và kiểm tra mùi không. Nếu thợ không trả lời rõ hoặc thúc khách làm ngay khi chưa xem hiện trạng, khách nên dừng lại. Nội dung <strong>về chúng tôi</strong> được viết để khách có căn cứ hỏi đúng câu hỏi trước khi quyết định.</p>
<p>Khách ở nhà ngõ sâu, khu tập thể, khách sạn, nhà hàng hoặc công trình đang cải tạo nên chụp trước lối vào, nắp bể, hố ga, miệng cống và vị trí đặt xe. Ảnh này giúp đội kỹ thuật tính đường ống, chiều dài dây, khả năng kéo ống hút và thời gian thi công. Trang <strong>về chúng tôi</strong> nhấn mạnh bước chuẩn bị vì chỉ cần thiếu thông tin lối vào, ca hút bể phốt có thể phải đổi xe hoặc kéo ống xa hơn dự kiến.</p>
<h2>Khác biệt giữa hỏi giá qua điện thoại và báo giá tại hiện trường</h2>
<p>Giá qua điện thoại chỉ là khoảng tham khảo dựa trên mô tả ban đầu. Với thông tắc cống, mức độ tắc, vị trí nghẹt, chiều dài đường ống, độ cũ của hệ thống và nguy cơ vỡ ống đều ảnh hưởng đến chi phí. Với hút bể phốt, khối lượng, khoảng cách xe đỗ, loại bể và khả năng mở nắp quyết định thời gian xử lý. Vì vậy trang <strong>về chúng tôi</strong> không hứa một giá cố định cho mọi trường hợp.</p>
<p>Báo giá tại hiện trường phải đi kèm phương án xử lý. Kỹ thuật cần chỉ ra điểm nghi ngờ, dụng cụ sẽ dùng, phần nào cần tháo, phần nào không cần đụng tới và chi phí đã gồm những gì. Nếu khách đồng ý, đội mới thi công. Nếu phát sinh khác với mô tả ban đầu, đội phải báo lại trước. Đây là nguyên tắc được lặp lại trong trang <strong>về chúng tôi</strong> để tránh hiểu nhầm giữa hai bên.</p>
<p>Với ca cần xử lý gấp ban đêm, ngày mưa hoặc khu vực xa, khách nên hỏi thêm phí ngoài giờ và thời gian có mặt. Có ca chỉ cần thợ gần nhất mang máy thông tắc, nhưng có ca phải điều xe bồn hoặc thêm người hỗ trợ. Khi đã thống nhất trước, khách chủ động hơn, đội kỹ thuật cũng chuẩn bị đúng thiết bị. Trang <strong>về chúng tôi</strong> coi việc nói rõ điều kiện giá là một phần bắt buộc của quy trình.</p>
<h2>Thiết bị và cách xử lý theo từng nhóm sự cố</h2>
<p>Với bồn cầu tắc, chậu rửa thoát chậm hoặc cống sàn trào ngược, đội thường kiểm tra từ điểm gần nhất trước. Máy lò xo, dây thông, máy nén hoặc dụng cụ lấy dị vật được chọn theo biểu hiện thực tế. Mục tiêu là mở dòng thoát trước, sau đó xả thử nhiều lần để xem nước có rút đều không. Trong trang <strong>về chúng tôi</strong>, đây là nhóm sự cố cần xử lý nhanh vì ảnh hưởng trực tiếp sinh hoạt.</p>
<p>Với bể phốt đầy, xe bồn phải tiếp cận được vị trí phù hợp hoặc kéo ống đến nắp bể. Khách nên dọn lối, xác định nắp bể nếu biết và báo trước nếu nhà nằm trong ngõ nhỏ. Đội kỹ thuật sẽ hỏi khối lượng ước tính, số tầng, số người sử dụng và thời gian lần hút gần nhất. Trang <strong>về chúng tôi</strong> ghi rõ các thông tin này để khách chuẩn bị trước, giảm thời gian chờ khi xe tới.</p>
<p>Với hố ga, rãnh thoát và đường ống ngoài nhà, nguyên nhân thường là bùn lắng, rác, lá cây, vữa xây dựng hoặc dầu mỡ tích tụ lâu ngày. Công việc có thể gồm nạo vét, gom bùn, khơi thông và xả kiểm tra. Nếu hệ thống đã xuống cấp, đội sẽ báo tình trạng để khách cân nhắc sửa riêng, không gộp mập mờ vào chi phí thông tắc. Cách phân tách này là lý do trang <strong>về chúng tôi</strong> cần nói rõ phạm vi từng hạng mục.</p>
<h2>Lưu ý sau khi bàn giao</h2>
<p>Sau khi xử lý, khách nên xả nước ở các điểm liên quan và quan sát ít nhất vài phút. Nếu vừa hút bể phốt, cần kiểm tra khu vực nắp bể, mùi quanh nhà vệ sinh và đường thoát chính. Nếu vừa thông tắc, cần thử xả lượng nước lớn hơn bình thường để xem có trào ngược không. Trang <strong>về chúng tôi</strong> khuyến nghị kiểm tra ngay khi thợ còn tại chỗ để xử lý kịp thời nếu có dấu hiệu bất thường.</p>
<p>Trong vài ngày đầu, khách nên hạn chế đổ dầu mỡ, giấy khó phân hủy, khăn ướt, tóc rối hoặc rác nhỏ xuống đường thoát. Với quán ăn, nhà hàng, khu trọ và khách sạn, cần có lịch vệ sinh hố ga hoặc bẫy mỡ định kỳ. Nhiều ca tái tắc không phải do lần xử lý trước thiếu bước, mà do hệ thống tiếp tục nhận rác và dầu mỡ mỗi ngày. Trang <strong>về chúng tôi</strong> đưa phần này để khách biết cách giữ dòng thoát ổn định hơn.</p>
<p>Nếu mùi hôi quay lại, khách nên ghi lại thời điểm xuất hiện, vị trí có mùi, hướng gió, thời điểm xả nước và ảnh chụp nếu có. Những dữ liệu này giúp kỹ thuật phân biệt mùi từ bể phốt, đường thông hơi, phễu thoát sàn hay hố ga ngoài nhà. Khi gọi lại <strong>${HOTLINE}</strong>, khách nêu đúng thông tin sẽ được hướng dẫn nhanh hơn. Đây cũng là nội dung cần có trong một trang <strong>về chúng tôi</strong> thực tế, không chỉ giới thiệu chung.</p>
<h2>Liên kết dịch vụ khách thường cần xem tiếp</h2>
<p>Sau khi đọc trang <strong>về chúng tôi</strong>, khách có thể xem thêm trang bảng giá để nắm khoảng chi phí theo nhóm việc, trang thông tắc cống Quảng Ninh nếu nước đang rút chậm, hoặc trang hút bể phốt Quảng Ninh nếu bồn cầu trào ngược kèm mùi nặng. Với khu vực xa như Tiên Yên, Móng Cái, Vân Đồn hoặc Đông Triều, khách nên ưu tiên gọi hotline để được báo thời gian di chuyển trước.</p>
<p>Nếu khách cần xử lý tại Hải Phòng hoặc các tỉnh miền Bắc lân cận, đội tiếp nhận vẫn hỏi tình trạng và kiểm tra khả năng điều thợ theo lịch. Những ca ngoài địa bàn gần có thể cần hẹn trước, đặc biệt nếu cần xe bồn hoặc thiết bị lớn. Trang <strong>về chúng tôi</strong> vì vậy không chỉ là phần giới thiệu, mà còn là nơi thống nhất cách liên hệ, cách hỏi giá và cách chuẩn bị hiện trường.</p>
<p>Trường hợp cần xử lý ngay, khách gọi trực tiếp <strong>${HOTLINE}</strong> thay vì chỉ nhắn tin mô tả ngắn. Cuộc gọi giúp kỹ thuật hỏi được nhiều chi tiết hơn: nước trào ở đâu, mùi xuất hiện khi nào, nhà có bể tự hoại riêng không, xe có vào gần được không và đã dùng hóa chất chưa. Càng rõ thông tin, phương án càng sát. Đây là mục tiêu chính của trang <strong>về chúng tôi</strong>: giúp khách biết phải gọi ai, hỏi gì và chuẩn bị gì trước khi đội đến.</p>
<p>Với khách mới, trang <strong>về chúng tôi</strong> là nơi kiểm tra nhanh trước khi gọi. Với khách đã từng dùng dịch vụ, trang <strong>về chúng tôi</strong> giúp đối chiếu lại hotline và phạm vi phục vụ. Với khách cần báo giá cho nhà thuê, quán ăn hoặc công trình, trang <strong>về chúng tôi</strong> giúp chuẩn bị thông tin để đội kỹ thuật hỏi một lần là đủ.</p>
<h2>NAP liên hệ</h2>
<p>Đơn vị: <strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong>. Website: <strong>thongtaccongquangninh.com</strong>. Hotline: <strong>${HOTLINE}</strong>. Thời gian hỗ trợ: 24/7, ưu tiên ca tắc nghẽn, mùi hôi, trào ngược cần xử lý nhanh.</p>
<p>Khi gọi, khách nên mô tả ngắn gọn địa chỉ, dấu hiệu, thời điểm phát sinh và đã tự xử lý chưa. Nếu có ảnh vị trí, gửi thêm để đội kỹ thuật chuẩn bị đúng dụng cụ.</p>
<h2>FAQ về chúng tôi</h2>
<h3>Công ty nhận những dịch vụ nào?</h3>
<p>Nhận hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga, vệ sinh đường ống và xử lý mùi hôi tại Quảng Ninh.</p>
<h3>Gọi bao lâu có thợ đến?</h3>
<p>Tùy vị trí và lịch xe. Khu vực gần đội kỹ thuật được ưu tiên điều thợ nhanh, khách được báo thời gian dự kiến trước khi chờ.</p>
<h3>Có báo giá trước khi làm không?</h3>
<p>Có. Thợ khảo sát, nói rõ phương án và chi phí trước khi thi công. Nếu phát sinh hạng mục khác, phải báo lại trước.</p>
<h3>Có bảo hành không?</h3>
<p>Có thể bảo hành theo hạng mục và nguyên nhân thực tế. Khi bàn giao, khách nên hỏi rõ thời gian, điều kiện và phạm vi bảo hành.</p>
<p><strong>Cần kiểm tra nhanh? Gọi ${HOTLINE} để được hỏi tình trạng, báo hướng xử lý và điều đội gần nhất.</strong></p>
`;
}

async function main() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL;
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const existing = await wp(baseUrl, auth, "/wp/v2/pages?slug=ve-chung-toi&status=any&context=edit");
  const current = existing[0] ?? null;
  if (current) writeFileSync(join(BACKUP_DIR, `pages-${current.id}-ve-chung-toi.json`), JSON.stringify(current, null, 2), "utf8");
  const body = {
    title: "Về chúng tôi Môi Trường Đô Thị Số 1 Quảng Ninh rõ giá nhanh 24/7",
    slug: "ve-chung-toi",
    content: content(),
    excerpt:
      "Về chúng tôi Môi Trường Đô Thị Số 1 Quảng Ninh, nhận hút bể phốt, thông tắc cống, nạo vét, xử lý mùi hôi rõ giá 24/7. Gọi 0963.953.533 / 0931.156.756.",
    status: "publish",
    featured_media: 375,
  };
  const page = await wp(baseUrl, auth, current ? `/wp/v2/pages/${current.id}` : "/wp/v2/pages", {
    method: "POST",
    body: JSON.stringify(body),
  });
  try {
    await wp(baseUrl, auth, "/rankmath/v1/updateMeta", {
      method: "POST",
      body: JSON.stringify({
        objectType: "post",
        objectID: page.id,
        meta: {
          rank_math_title: "Về chúng tôi Môi Trường Đô Thị Số 1 Quảng Ninh rõ giá nhanh 24/7",
          rank_math_description: body.excerpt,
          rank_math_focus_keyword: "về chúng tôi",
          rank_math_seo_score: "95",
        },
      }),
    });
  } catch {}
  const report = {
    ok: true,
    id: page.id,
    link: page.link,
    words: wordCount(body.content),
    backupDir: BACKUP_DIR,
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
