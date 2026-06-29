import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import https from "node:https";
import { dirname, join, relative } from "node:path";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";
const MCP_HOST = "onehost-wphn022606.000nethost.com";
const MCP_PORT = 2023;
const MCP_PATH = "/api/mcp";
const MCP_TOKEN = "sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
const PROJECT_TIMEZONE = "Asia/Bangkok";
const PLUGIN_LOCAL = join(ROOT, "tools", "wp-plugins", "ttcqn-meta-desc-fix", "ttcqn-meta-desc-fix.php");
const PLUGIN_REMOTE = "/public_html/wp-content/plugins/ttcqn-meta-desc-fix/ttcqn-meta-desc-fix.php";
const ENV_PATH = join(ROOT, ".env");
const BASE_URL = "https://thongtaccongquangninh.com";

const TARGETS = [
  {
    id: 35,
    type: "pages",
    slug: "thong-tac-cong-quang-ninh",
    replacements: [
      [
        /<li><a href="https:\/\/thongtaccongquangninh\.com\/thong-tac-bon-cau-khan-cap-quang-ninh\/">Thông tắc bồn cầu khẩn cấp Quảng Ninh<\/a> - Đội thợ trực đêm có mặt sau 15 phút\.<\/li>/g,
        '<li><a href="https://thongtaccongquangninh.com/thong-tac-bon-cau-khan-cap-quang-ninh/">Thông tắc bồn cầu khẩn cấp Quảng Ninh</a> - Điều phối nhanh trong khung 05:00-22:00 hằng ngày.</li>',
      ],
      [
        /<li><a href="https:\/\/thongtaccongquangninh\.com\/thong-tac-bon-cau-ban-dem-quang-ninh\/">Thông tắc bồn cầu ban đêm Quảng Ninh<\/a> - Dịch vụ xử lý sự cố toilet trong khung 05:00-22:00 hằng ngày\.<\/li>/g,
        '<li><a href="https://thongtaccongquangninh.com/thong-tac-bon-cau-ban-dem-quang-ninh/">Thông tắc bồn cầu Quảng Ninh xử lý nhanh</a> - Dịch vụ xử lý sự cố toilet trong khung 05:00-22:00 hằng ngày.</li>',
      ],
    ],
  },
  {
    id: 2377,
    type: "posts",
    slug: "thong-tac-bon-cau-khan-cap-quang-ninh",
    replacements: [
      [
        /<p><strong>Thông tắc bồn cầu khẩn cấp<\/strong> là dịch vụ điều thợ đến trong vòng 15–30 phút, không cần hẹn lịch trước, tiếp nhận 05:00-22:00 hằng ngày kể cả đêm khuya, cuối tuần và ngày lễ\.<\/p>/g,
        "<p><strong>Thông tắc bồn cầu khẩn cấp</strong> là dịch vụ ưu tiên điều phối nhanh trong khung 05:00-22:00 hằng ngày, không cần hẹn lịch trước và báo rõ thời gian có mặt theo khu vực.</p>",
      ],
      [
        /<p><strong>Khi nào KHÔNG cần gọi khẩn cấp\?<\/strong> Nếu bồn cầu chỉ xả chậm nhẹ, vẫn thoát được dù lâu hơn bình thường — bạn có thể hẹn giờ hành chính để tiết kiệm phụ phí đêm khuya\. Nhưng nếu đã ngừng thoát hoàn toàn — gọi ngay\.<\/p>/g,
        "<p><strong>Khi nào KHÔNG cần gọi khẩn cấp?</strong> Nếu bồn cầu chỉ xả chậm nhẹ và vẫn thoát được, bạn có thể chủ động đặt lịch trong khung 05:00-22:00 để tối ưu chi phí. Nhưng nếu đã ngừng thoát hoàn toàn thì nên gọi ngay để được điều phối sớm.</p>",
      ],
      [
        /<td>Phụ phí đêm khuya \(22h – 6h\)<\/td>/g,
        "<td>Phụ phí ngoài phạm vi triển khai chuẩn</td>",
      ],
      [
        /<p>Anh Tuấn, quản lý ca đêm của một khách sạn mini trên đường Hạ Long, Bãi Cháy, gọi điện lúc 23:15 — bồn cầu tầng 3 tắc cứng, khách báo nước sắp tràn ra sàn\. Thợ có mặt sau 12 phút\. Kiểm tra phát hiện khăn tắm nhỏ bị cuốn sâu vào ống cong\. Dùng kềm lấy vật cứng lấy ra trong 20 phút, không đục phá\. Khách sạn hoạt động bình thường trở lại trước nửa đêm\.<\/p>/g,
        "<p>Anh Tuấn, quản lý một khách sạn mini trên đường Hạ Long, Bãi Cháy, gọi khi bồn cầu tầng 3 tắc cứng và khách báo nước sắp tràn ra sàn. Thợ có mặt nhanh, kiểm tra phát hiện khăn tắm nhỏ bị cuốn sâu vào ống cong và xử lý trong 20 phút, không đục phá. Khách sạn hoạt động bình thường trở lại ngay sau đó.</p>",
      ],
      [
        /<p><strong>Giờ hoạt động:<\/strong> 05:00-22:00 — kể cả ngày lễ, Tết, đêm khuya<\/p>/g,
        "<p><strong>Giờ hoạt động:</strong> 05:00-22:00 hằng ngày</p>",
      ],
      [
        /Được\. Môi Trường Đô Thị Số 1 tiếp nhận 05:00-22:00 hằng ngày, kể cả 2–3 giờ sáng\. Gọi <strong>0963\.953\.533<\/strong>, thợ nhận máy và điều xe ngay\. Phụ phí đêm khuya từ 22h–6h áp dụng thêm 100\.000–200\.000 đồng tùy khoảng cách\.<\/p>/g,
        "Được. Môi Trường Đô Thị Số 1 tiếp nhận 05:00-22:00 hằng ngày. Gọi <strong>0963.953.533</strong> để được điều phối nhanh và báo rõ thời gian có mặt theo khu vực.</p>",
      ],
    ],
  },
  {
    id: 2379,
    type: "posts",
    slug: "thong-tac-bon-cau-ban-dem-quang-ninh",
    title: "Thông tắc bồn cầu Quảng Ninh: thợ xử lý nhanh tận nơi",
    replacements: [
      [
        /<h1>Thông Tắc Bồn Cầu Ban Đêm Quảng Ninh – Gọi 0963\.953\.533, Thợ Có Mặt Trong 15 Phút<\/h1>/g,
        "<h1>Thông tắc bồn cầu Quảng Ninh: thợ xử lý nhanh tận nơi</h1>",
      ],
      [
        /<p>Bồn cầu tắc ban đêm tại Quảng Ninh\? Gọi ngay dịch vụ <a href="https:\/\/thongtaccongquangninh\.com\/thong-tac-bon-cau-quang-ninh\/">thông tắc bồn cầu Quảng Ninh<\/a> — thợ trực xuyên đêm, có mặt trong 15 phút\. Hotline: <strong>0963\.953\.533<\/strong>\.<\/p>/g,
        '<p>Bồn cầu tắc tại Quảng Ninh? Gọi ngay dịch vụ <a href="https://thongtaccongquangninh.com/thong-tac-bon-cau-quang-ninh/">thông tắc bồn cầu Quảng Ninh</a> để được điều phối nhanh trong khung 05:00-22:00 hằng ngày. Hotline: <strong>0963.953.533</strong>.</p>',
      ],
      [
        /<h2>Nguyên nhân bồn cầu tắc vào ban đêm tại Quảng Ninh<\/h2>/g,
        "<h2>Nguyên nhân bồn cầu tắc cần xử lý sớm tại Quảng Ninh</h2>",
      ],
      [
        /<p>Thực ra bồn cầu không &#8220;chọn&#8221; đêm để tắc – chỉ là ban ngày bận bịu, bạn chưa để ý\. Đến đêm khuya mới dùng lại và phát hiện nước không thoát, mùi hôi xộc lên, thậm chí trào ra ngoài\.<\/p>/g,
        "<p>Thực ra bồn cầu không chọn thời điểm để tắc. Nhiều trường hợp đến lúc sử dụng lại mới phát hiện nước không thoát, mùi hôi xộc lên hoặc thậm chí trào ra ngoài.</p>",
      ],
      [
        /<p><!-- ttcqn-night-toilet-extra-risk-notes -->Ban đêm cần xử lý sớm hơn ban ngày vì nhà vệ sinh thường ít phương án thay thế, ánh sáng kém và nước trào dễ ngấm xuống sàn\. Trước khi thợ đến, hãy ngừng xả thêm nước, mở cửa thông gió nhẹ, chặn trẻ nhỏ lại gần khu vực trào và chụp ảnh miệng bồn cầu gửi qua Zalo\. Nếu nghi bể phốt đầy, nói rõ lần hút gần nhất để thợ chuẩn bị đúng thiết bị\.<\/p>/g,
        "<p><!-- ttcqn-night-toilet-extra-risk-notes -->Khi sự cố xảy ra, nên xử lý sớm vì nhà vệ sinh thường ít phương án thay thế và nước trào dễ ngấm xuống sàn. Trước khi thợ đến, hãy ngừng xả thêm nước, mở cửa thông gió nhẹ, chặn trẻ nhỏ lại gần khu vực trào và chụp ảnh miệng bồn cầu gửi qua Zalo. Nếu nghi bể phốt đầy, nói rõ lần hút gần nhất để thợ chuẩn bị đúng thiết bị.</p>",
      ],
      [
        /<h2>Thông Tắc Bồn Cầu Ban Đêm Là Gì\? Khi Nào Cần Gọi Ngay\?<\/h2>/g,
        "<h2>Thông Tắc Bồn Cầu Xử Lý Nhanh Là Gì? Khi Nào Cần Gọi Ngay?</h2>",
      ],
      [
        /<p><strong>Thông tắc bồn cầu ban đêm<\/strong> là dịch vụ xử lý nghẽn đường ống bồn cầu ngoài giờ hành chính – từ 18 giờ tối đến 6 giờ sáng hôm sau\. Dịch vụ này tồn tại vì sự cố nhà vệ sinh không theo lịch, không hẹn trước\.<\/p>/g,
        "<p><strong>Thông tắc bồn cầu xử lý nhanh</strong> là dịch vụ ưu tiên điều phối khi sự cố xảy ra đột ngột trong ngày. Trọng tâm là chẩn đoán đúng nguyên nhân, báo giá rõ và xử lý dứt điểm trong khung 05:00-22:00 hằng ngày.</p>",
      ],
      [
        /<p><strong>Môi Trường Đô Thị Số 1 Quảng Ninh<\/strong> nhận cuộc gọi bất kể mấy giờ\. Hotline <strong>0963\.953\.533 \/ 0931\.156\.756<\/strong> tiếp nhận 05:00-22:00 hằng ngày – bao gồm cuối tuần và các ngày lễ\.<\/p>/g,
        "<p><strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong> tiếp nhận cuộc gọi trong khung 05:00-22:00 hằng ngày. Hotline <strong>0963.953.533 / 0931.156.756</strong> chốt tình trạng và điều phối nhanh theo khu vực.</p>",
      ],
      [
        /<h2>Quy Trình Thông Tắc Bồn Cầu Ban Đêm – 5 Bước Tại Quảng Ninh<\/h2>/g,
        "<h2>Quy Trình Thông Tắc Bồn Cầu Xử Lý Nhanh – 5 Bước Tại Quảng Ninh</h2>",
      ],
      [
        /ban đêm/gi,
        "xử lý nhanh",
      ],
      [
        /xuyên đêm/gi,
        "nhanh trong ngày",
      ],
      [
        /đêm khuya/gi,
        "ngoài khung triển khai chuẩn",
      ],
      [
        /nửa đêm/gi,
        "cuối buổi",
      ],
      [
        /lúc 2–3 giờ sáng/gi,
        "ngoài khung triển khai chuẩn",
      ],
    ],
  },
  {
    id: 2412,
    type: "posts",
    slug: "thong-tac-bon-cau-nha-hang-quang-ninh",
    replacements: [
      [/Ca khẩn cấp ban đêm \(22h–6h\)/g, "Ca xử lý gấp ngoài lịch tiêu chuẩn"],
      [/<li><strong>Phục vụ:<\/strong> 05:00-22:00 – kể cả ngày lễ, Tết<\/li>/g, "<li><strong>Phục vụ:</strong> 05:00-22:00 hằng ngày</li>"],
      [/<p><strong>Bồn cầu nhà hàng tắc vào ban đêm, có gọi được không\?<\/strong><\/p>/g, "<p><strong>Bồn cầu nhà hàng tắc ngoài giờ ăn cao điểm, có gọi được không?</strong></p>"],
      [/<p>Có – tiếp nhận 05:00-22:00 hằng ngày bao gồm cả đêm khuya, cuối tuần và ngày lễ\. Phụ thu ca đêm \(22h–6h\) được thông báo rõ trước khi làm\.<\/p>/g, "<p>Có. Đơn vị tiếp nhận 05:00-22:00 hằng ngày và báo rõ phương án xử lý, thời gian có mặt theo khu vực trước khi triển khai.</p>"],
    ],
  },
  {
    id: 2417,
    type: "posts",
    slug: "thong-tac-bon-cau-khach-san-quang-ninh",
    replacements: [
      [/Ca đêm 22h–6h: tăng 30%<br \/>/g, "Ngoài phạm vi triển khai chuẩn: báo lại theo điều kiện thực tế<br />"],
      [/<li><strong>Làm việc 05:00-22:00 kể cả ngày lễ, Tết Nguyên Đán<\/strong> – mùa cao điểm Hạ Long tháng 4-8 và Tết là lúc bận nhất, không phải lúc nghỉ<\/li>/g, "<li><strong>Làm việc 05:00-22:00 hằng ngày</strong> – mùa cao điểm Hạ Long tháng 4-8 cần chủ động đặt lịch sớm để điều phối thuận lợi hơn.</li>"],
      [/<li>Phục vụ: <strong>05:00-22:00<\/strong>, kể cả lễ, Tết Nguyên Đán<\/li>/g, "<li>Phục vụ: <strong>05:00-22:00</strong> hằng ngày</li>"],
      [/<p><strong>Khách sạn Bãi Cháy gọi thợ thông bồn cầu lúc nửa đêm có được không\?<\/strong><br \/>/g, "<p><strong>Khách sạn Bãi Cháy cần gọi thợ thông bồn cầu gấp có được không?</strong><br />"],
      [/<p><strong>Khách sạn Bãi Cháy gọi thợ thông bồn cầu lúc nửa đêm có được không\?<\/strong><br \/>Được\. Môi Trường Đô Thị Số 1 Quảng Ninh làm việc 05:00-22:00, kể cả đêm khuya, ngày lễ và Tết Nguyên Đán\. Ca đêm từ 22h–6h có phụ thu 30% – thông báo rõ khi nhận cuộc gọi, không ẩn phí\. Gọi <strong>0963\.953\.533<\/strong> bất kỳ giờ nào, có thợ trực nhận ca ngay\.<\/p>/g, "<p><strong>Khách sạn Bãi Cháy cần gọi thợ thông bồn cầu gấp có được không?</strong><br />Được. Môi Trường Đô Thị Số 1 Quảng Ninh làm việc 05:00-22:00 hằng ngày. Gọi <strong>0963.953.533</strong> trong khung này để được điều phối nhanh và báo rõ thời gian có mặt.</p>"],
    ],
  },
  {
    id: 2430,
    type: "posts",
    slug: "hut-be-phot-khan-cap-quang-ninh",
    replacements: [
      [/<p>Bể phốt đầy vào đúng buổi tối khuya, ngày lễ, hoặc giữa đợt mưa lớn là tình huống không ai muốn — nhưng lại xảy ra thường xuyên hơn bạn nghĩ\./g, "<p>Bể phốt đầy, gặp ngày mưa lớn hoặc đúng lúc công trình đang sử dụng cao điểm là tình huống không ai muốn — nhưng lại xảy ra thường xuyên hơn bạn nghĩ."],
      [/<li>Xe bồn và thợ <strong>sẵn sàng 05:00-22:00<\/strong>, kể cả 2–3 giờ sáng hoặc ngày Tết<\/li>/g, "<li>Xe bồn và thợ <strong>điều phối nhanh 05:00-22:00 hằng ngày</strong>, có báo thời gian có mặt rõ ràng theo khu vực</li>"],
      [/ngoài giờ hành chính, cuối tuần hoặc ngày lễ/gi, "trong ngày hoặc cuối tuần"],
      [/<h3>Hút bể phốt khẩn cấp lúc nửa đêm có ai làm không\?<\/h3>/g, "<h3>Hút bể phốt khẩn cấp có được điều phối nhanh không?</h3>"],
      [/<p>Có\. Đội xe tiếp nhận 05:00-22:00 hằng ngày, kể cả 1–3 giờ sáng và ngày lễ Tết\. Gọi <strong>0963\.953\.533<\/strong> — điện thoại luôn có người trực, không cần nhắn tin chờ hồi âm sáng hôm sau\. Phụ phí đêm \(22h–6h\) là 100\.000–200\.000đ tùy dung tích, thông báo trước khi làm\.<\/p>/g, "<p>Có. Đội xe tiếp nhận 05:00-22:00 hằng ngày. Gọi <strong>0963.953.533</strong> để được điều phối nhanh và báo rõ phương án xử lý, thời gian có mặt theo khu vực.</p>"],
    ],
  },
  {
    id: 2687,
    type: "posts",
    slug: "hut-be-phot-nha-hang-quang-ninh",
    replacements: [
      [/<td>Áp dụng ca đêm, Tết, lễ<\/td>/g, "<td>Áp dụng ngoài lịch triển khai chuẩn khi có thỏa thuận trước</td>"],
      [/<li><strong>Giờ phục vụ:<\/strong> 05:00-22:00 – 365 ngày kể cả lễ Tết<\/li>/g, "<li><strong>Giờ phục vụ:</strong> 05:00-22:00 hằng ngày</li>"],
    ],
  },
  {
    id: 2702,
    type: "posts",
    slug: "hut-be-phot-khach-san-quang-ninh",
    replacements: [
      [/<p><strong>Môi Trường Đô Thị Số 1 Quảng Ninh<\/strong> xử lý đúng tình huống này — có mặt trong 15 phút tại Hạ Long, báo giá rõ ràng trước khi làm, không đục phá, tiếp nhận 05:00-22:00 hằng ngày kể cả lễ Tết\. Hotline: <strong>0963\.953\.533<\/strong>\.<\/p>/g, "<p><strong>Môi Trường Đô Thị Số 1 Quảng Ninh</strong> xử lý đúng tình huống này — có mặt trong 15 phút tại Hạ Long, báo giá rõ ràng trước khi làm, không đục phá, tiếp nhận 05:00-22:00 hằng ngày. Hotline: <strong>0963.953.533</strong>.</p>"],
      [/<tr><td><strong>Phụ phí ca đêm \(22h – 6h\)<\/strong><\/td><td>Bất kỳ<\/td><td>—<\/td><td>\+200\.000đ<\/td><\/tr>/g, ""],
      [/<p><strong>Khách sạn 3 sao, Hòn Gai, Hạ Long:<\/strong> &quot;Gọi lúc 10 giờ tối, thợ có mặt trước 11 giờ\. Hút xong trước nửa đêm, khách không hay biết gì\. Từ đó tôi hút định kỳ 4 tháng một lần, không bao giờ để xảy ra sự cố nữa\.&quot;<\/p>/g, '<p><strong>Khách sạn 3 sao, Hòn Gai, Hạ Long:</strong> "Khi hệ thống có dấu hiệu đầy, đội kỹ thuật đến nhanh, xử lý gọn và không làm ảnh hưởng khách lưu trú. Từ đó tôi hút định kỳ 4 tháng một lần, không để xảy ra sự cố nữa."</p>'],
      [/<p><strong>Dịch vụ có làm ban đêm không\?<\/strong> Có\. tiếp nhận 05:00-22:00 hằng ngày kể cả ban đêm, ngày lễ và cuối tuần — đây là lúc khách sạn cần xử lý nhất vì không thể dừng hoạt động\. Phụ phí ca đêm \(22h–6h\) là 200\.000đ, thông báo trước khi xe xuất phát\.<\/p>/g, "<p><strong>Dịch vụ có điều phối nhanh không?</strong> Có. Đơn vị tiếp nhận 05:00-22:00 hằng ngày và báo rõ phương án xử lý, thời gian có mặt trước khi xe xuất phát.</p>"],
      [/<p><strong>Giá hút bể phốt khách sạn tính như thế nào\?<\/strong> Tính theo dung tích thực tế đã hút \(không phải dung tích thiết kế\), cộng thêm phụ phí ca đêm nếu thi công từ 22h–6h\. Gọi báo địa chỉ và số phòng — nhận báo giá ngay trong cuộc gọi, không cần chờ thợ đến mới biết giá\.<\/p>/g, "<p><strong>Giá hút bể phốt khách sạn tính như thế nào?</strong> Tính theo dung tích thực tế đã hút (không phải dung tích thiết kế). Gọi báo địa chỉ và số phòng để nhận báo giá ngay trong cuộc gọi, không cần chờ thợ đến mới biết giá.</p>"],
      [/<p><strong>Công ty Môi Trường Đô Thị Số 1 Quảng Ninh<\/strong> Hotline: <strong>0963\.953\.533 \/ 0931\.156\.756<\/strong> Zalo: <strong>0963\.953\.533<\/strong> Website: thongtaccongquangninh\.com Phục vụ: <strong>05:00-22:00<\/strong> tất cả ngày trong năm, kể cả ngày lễ và Tết Nguyên Đán<\/p>/g, "<p><strong>Công ty Môi Trường Đô Thị Số 1 Quảng Ninh</strong> Hotline: <strong>0963.953.533 / 0931.156.756</strong> Zalo: <strong>0963.953.533</strong> Website: thongtaccongquangninh.com Phục vụ: <strong>05:00-22:00</strong> hằng ngày</p>"],
      [/"openingHours&quot;: &quot;Mo-Su 00:00-24:00&quot;/g, '"openingHours&quot;: &quot;Mo-Su 05:00-22:00&quot;'],
      [/tiếp nhận 05:00-22:00 hằng ngày kể cả ban đêm, ngày lễ và cuối tuần/gi, "tiếp nhận 05:00-22:00 hằng ngày"],
      [/Phụ phí ca đêm 200\.000đ/gi, "chi phí phát sinh theo điều kiện thực tế nếu có thỏa thuận trước"],
    ],
  },
  {
    id: 2777,
    type: "posts",
    slug: "thong-tac-cong-khan-cap-quang-ninh",
    replacements: [
      [/<p>Gọi ngay: <strong>0963\.953\.533 \/ 0931\.156\.756<\/strong> – đường dây tiếp nhận 05:00-22:00 hằng ngày, kể cả lễ Tết\.<\/p>/g, "<p>Gọi ngay: <strong>0963.953.533 / 0931.156.756</strong> – đường dây tiếp nhận 05:00-22:00 hằng ngày.</p>"],
      [/<td>Phụ phí ngày lễ, Tết<\/td>/g, "<td>Phụ phí ngoài lịch triển khai chuẩn</td>"],
      [/Phí khẩn cấp đêm và ngày lễ được thông báo rõ <strong>trước khi làm<\/strong>, không phát sinh sau\./g, "Chi phí phát sinh nếu có sẽ được thông báo rõ <strong>trước khi làm</strong>, không phát sinh sau."],
      [/<li><strong>tiếp nhận 05:00-22:00 hằng ngày<\/strong> – không nghỉ đêm, không nghỉ lễ, không từ chối ca đêm\.<\/li>/g, "<li><strong>tiếp nhận 05:00-22:00 hằng ngày</strong> – ưu tiên điều phối nhanh và báo rõ thời gian có mặt theo khu vực.</li>"],
      [/<p><strong>Giá thực tế:<\/strong> 350\.000 đ \(bao gồm phụ phí ca đêm, đã thỏa thuận trước khi làm\)\.<\/p>/g, "<p><strong>Giá thực tế:</strong> 350.000 đ (đã chốt theo hiện trạng và phương án xử lý trước khi làm).</p>"],
      [/Phục vụ: 05:00-22:00 – kể cả đêm khuya, lễ Tết, thời tiết xấu<br \/>/g, "Phục vụ: 05:00-22:00 hằng ngày<br />"],
      [/Được\. Đường dây <strong>0963\.953\.533<\/strong> tiếp nhận 05:00-22:00 hằng ngày, không nghỉ đêm, không nghỉ lễ\. Gọi lúc 2 giờ sáng hay sáng sớm đều có thợ nhận ca\. Phụ phí ca đêm \(22:00–6:00\) được thông báo rõ trước khi làm\.<\/p>/g, "Được. Đường dây <strong>0963.953.533</strong> tiếp nhận 05:00-22:00 hằng ngày. Khách nên gọi trong khung này để được điều phối nhanh và báo rõ thời gian có mặt theo khu vực.</p>"],
    ],
  },
  {
    id: 2787,
    type: "posts",
    slug: "gia-thong-tac-cong-quang-ninh",
    replacements: [
      [/<td>Phụ phí ca đêm 21:00 - 06:00<\/td>/g, "<td>Phụ phí ngoài lịch triển khai chuẩn</td>"],
      [/<li>Ca đêm, ngày lễ hoặc yêu cầu xử lý gấp ngoài giờ\.<\/li>/g, "<li>Yêu cầu xử lý gấp ngoài lịch triển khai chuẩn.</li>"],
      [/<p><strong>Thời gian gọi thợ<\/strong> ảnh hưởng đến phụ phí\. Ca ban ngày áp dụng khung tiêu chuẩn; ca đêm, mưa lớn, ngày lễ hoặc yêu cầu có mặt gấp có thể cộng chi phí điều thợ\.<\/p>/g, "<p><strong>Thời gian gọi thợ</strong> ảnh hưởng đến phương án điều phối. Trong khung 05:00-22:00 áp dụng lịch tiêu chuẩn; các yêu cầu ngoài lịch triển khai chuẩn hoặc điều kiện thi công đặc biệt sẽ được báo lại rõ trước khi làm.</p>"],
      [/<li>Thời gian làm việc: 05:00-22:00, kể cả cuối tuần và ngày lễ\.<\/li>/g, "<li>Thời gian làm việc: 05:00-22:00 hằng ngày.</li>"],
      [/<p>Một đơn vị minh bạch sẽ hỏi kỹ trước khi báo: địa chỉ, điểm trào nước, loại công trình, ống dài khoảng bao nhiêu, có hố ga không, đã dùng hóa chất chưa và cần xử lý ban ngày hay ban đêm\.<\/p>/g, "<p>Một đơn vị minh bạch sẽ hỏi kỹ trước khi báo: địa chỉ, điểm trào nước, loại công trình, ống dài khoảng bao nhiêu, có hố ga không, đã dùng hóa chất chưa và cần xử lý trong khung tiêu chuẩn hay ngoài lịch triển khai chuẩn.</p>"],
    ],
  },
];

const PUBLIC_CHECKS = [
  { path: "/thong-tac-cong-quang-ninh/", allowNightInBody: false },
  { path: "/thong-tac-bon-cau-khan-cap-quang-ninh/", allowNightInBody: false },
  { path: "/thong-tac-bon-cau-ban-dem-quang-ninh/", allowNightInBody: false },
  { path: "/thong-tac-bon-cau-nha-hang-quang-ninh/", allowNightInBody: false },
  { path: "/thong-tac-bon-cau-khach-san-quang-ninh/", allowNightInBody: false },
  { path: "/hut-be-phot-khan-cap-quang-ninh/", allowNightInBody: false },
  { path: "/hut-be-phot-nha-hang-quang-ninh/", allowNightInBody: false },
  { path: "/hut-be-phot-khach-san-quang-ninh/", allowNightInBody: false },
  { path: "/thong-tac-cong-khan-cap-quang-ninh/", allowNightInBody: false },
  { path: "/gia-thong-tac-cong-quang-ninh/", allowNightInBody: false },
];

let sessionId = null;
let messageId = 1;

function getTimeParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PROJECT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const map = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const millisecond = String(date.getMilliseconds()).padStart(3, "0");
  return { ...map, millisecond };
}

function formatProjectTimestamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.${parts.millisecond}+07:00`;
}

function formatProjectStamp(date = new Date()) {
  const parts = getTimeParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}-${parts.minute}-${parts.second}-${parts.millisecond}+07-00`;
}

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) {
      env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

function parseSse(text) {
  const events = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice(6).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      events.push(JSON.parse(payload));
    } catch {}
  }
  return events;
}

function normalizeText(text) {
  return text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
}

function verifyLocalPlugin(filePath) {
  const content = readFileSync(filePath, "utf8");
  const required = [
    "Version: 2026.06.29.1",
    "2379 => 'Thông tắc bồn cầu Quảng Ninh, điều phối nhanh trong khung 05:00-22:00 hằng ngày",
    "2787 => 'Giá thông tắc cống Quảng Ninh 2026 tại Hạ Long, Cẩm Phả, Uông Bí;",
  ];
  const missing = required.filter((snippet) => !content.includes(snippet));
  if (missing.length) {
    throw new Error(`Local plugin missing expected snippets: ${missing.join(", ")}`);
  }
  return content;
}

function fetchPublic(path) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: HOST,
        path,
        method: "GET",
        headers: { Host: HOST, "User-Agent": "Codex cleanup-out-of-hours-service-claims" },
        rejectUnauthorized: false,
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => resolve({ status: res.statusCode, text }));
      },
    );
    req.on("error", (error) => resolve({ status: 0, error: error.message, text: "" }));
    req.setTimeout(45000, () => {
      req.destroy();
      resolve({ status: 0, error: "timeout", text: "" });
    });
    req.end();
  });
}

async function mcpPost(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: messageId++,
      method,
      params: params ?? {},
    });
    const headers = {
      Authorization: `Bearer ${MCP_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "Content-Length": Buffer.byteLength(body),
    };
    if (sessionId) headers["Mcp-Session-Id"] = sessionId;

    const req = https.request(
      {
        hostname: MCP_HOST,
        port: MCP_PORT,
        path: MCP_PATH,
        method: "POST",
        headers,
        rejectUnauthorized: false,
      },
      (res) => {
        if (res.headers["mcp-session-id"]) sessionId = res.headers["mcp-session-id"];
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => {
          const contentType = res.headers["content-type"] || "";
          if (contentType.includes("text/event-stream")) {
            resolve({ status: res.statusCode, events: parseSse(text), raw: text });
            return;
          }
          try {
            resolve({ status: res.statusCode, json: JSON.parse(text) });
          } catch {
            resolve({ status: res.statusCode, raw: text });
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(120000, () => req.destroy(new Error("timeout")));
    req.write(body);
    req.end();
  });
}

function getResult(response) {
  return response.json?.result ?? response.events?.find((event) => event.result !== undefined)?.result;
}

function hostText(response) {
  const result = getResult(response);
  if (!result) return JSON.stringify(response).slice(0, 2000);
  if (result.isError) {
    throw new Error(Array.isArray(result.content) ? result.content.map((item) => item.text || "").join("") : JSON.stringify(result));
  }
  if (Array.isArray(result.content)) return result.content.map((item) => item.text || "").join("");
  return JSON.stringify(result);
}

async function hostTool(tool, args) {
  const response = await mcpPost("tools/call", { name: tool, arguments: args });
  if (response.status !== 200) {
    throw new Error(`${tool} failed HTTP ${response.status}: ${JSON.stringify(response).slice(0, 1000)}`);
  }
  return hostText(response);
}

async function wpFetch(path, auth, init = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex cleanup-out-of-hours-service-claims",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: response.status, text, json };
}

function applyReplacements(raw, replacements) {
  let next = raw;
  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement);
  }
  return next
    .replace(/05:00-22:00 hằng ngày hằng ngày/g, "05:00-22:00 hằng ngày")
    .replace(/xử lý nhanh xử lý nhanh/gi, "xử lý nhanh")
    .replace(/\n{3,}/g, "\n\n");
}

function inspectPublic(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [null, ""])[1].trim();
  const desc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || [null, ""])[1];
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [null, ""])[1].replace(/<[^>]+>/g, "").trim();
  const has247 = /24\/7/i.test(html);
  const hasNightCopy = /trực đêm|đêm khuya|nửa đêm|ca đêm|kể cả 2–3 giờ sáng|kể cả 1–3 giờ sáng|bất kể mấy giờ|trực xuyên đêm|không nghỉ đêm|ban đêm/i.test(html);
  const hasOldHours = /00:00-24:00|00:00-23:59|opens":"00:00"|closes":"23:59"/i.test(html);
  return { title, desc, h1, has247, hasNightCopy, hasOldHours };
}

const now = new Date();
const stamp = formatProjectStamp(now);
const backupDir = join(ROOT, "backups", `cleanup-out-of-hours-service-claims-live-${stamp}`);
const reportPath = join(ROOT, "reports", `cleanup-out-of-hours-service-claims-live-${stamp}.json`);
mkdirSync(backupDir, { recursive: true });
mkdirSync(dirname(reportPath), { recursive: true });

async function main() {
  const env = parseEnv(ENV_PATH);
  if (!env.WP_USERNAME || !env.WP_APP_PASSWORD) throw new Error("Missing WP auth in .env");
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const localPlugin = verifyLocalPlugin(PLUGIN_LOCAL);

  const report = {
    generatedAt: formatProjectTimestamp(now),
    timezone: PROJECT_TIMEZONE,
    plugin: {
      local: PLUGIN_LOCAL,
      remote: PLUGIN_REMOTE,
      backupPath: join(backupDir, "ttcqn-meta-desc-fix.remote.php"),
      remoteMatches: false,
    },
    targets: [],
    public: [],
    success: false,
  };

  await mcpPost("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "codex-cleanup-out-of-hours-service-claims", version: "1.0" },
  });
  await mcpPost("notifications/initialized", {});

  const remoteBefore = await hostTool("read_file", { path: PLUGIN_REMOTE });
  writeFileSync(report.plugin.backupPath, remoteBefore, "utf8");
  report.plugin.writeText = await hostTool("write_file", { path: PLUGIN_REMOTE, content: localPlugin });
  const remoteAfter = await hostTool("read_file", { path: PLUGIN_REMOTE });
  report.plugin.remoteMatches = normalizeText(remoteAfter) === normalizeText(localPlugin);

  for (const target of TARGETS) {
    const current = await wpFetch(`/wp-json/wp/v2/${target.type}/${target.id}?context=edit`, auth);
    if (current.status !== 200 || !current.json?.content?.raw) {
      report.targets.push({ ...target, ok: false, error: `Fetch failed ${current.status}` });
      continue;
    }

    const backupPath = join(backupDir, `${target.type}-${target.id}-${target.slug}.before.json`);
    writeFileSync(backupPath, JSON.stringify(current.json, null, 2), "utf8");
    const beforeContent = current.json.content.raw;
    const beforeTitle = current.json.title?.raw || "";
    const nextContent = applyReplacements(beforeContent, target.replacements);
    const nextTitle = target.title || beforeTitle;
    const payload = {};
    if (nextContent !== beforeContent) payload.content = nextContent;
    if (nextTitle !== beforeTitle) payload.title = nextTitle;
    const needsUpdate = Object.keys(payload).length > 0;

    let updateStatus = null;
    if (needsUpdate) {
      const update = await wpFetch(`/wp-json/wp/v2/${target.type}/${target.id}`, auth, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      updateStatus = update.status;
    }

    report.targets.push({
      id: target.id,
      type: target.type,
      slug: target.slug,
      backupPath,
      needsUpdate,
      updateStatus,
      beforeTitle,
      afterTitle: nextTitle,
      ok: !needsUpdate || updateStatus === 200,
    });
  }

  for (const check of PUBLIC_CHECKS) {
    const res = await fetchPublic(`${check.path}?nowprocket=1&codex=${Date.now()}`);
    const parsed = inspectPublic(res.text);
    report.public.push({
      path: check.path,
      status: res.status,
      title: parsed.title,
      desc: parsed.desc,
      h1: parsed.h1,
      has247: parsed.has247,
      hasNightCopy: parsed.hasNightCopy,
      hasOldHours: parsed.hasOldHours,
      ok: res.status === 200 && !parsed.has247 && !parsed.hasNightCopy && !parsed.hasOldHours,
    });
  }

  report.success =
    report.plugin.remoteMatches &&
    report.targets.every((item) => item.ok) &&
    report.public.every((item) => item.ok);

  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  appendFileSync(
    join(ROOT, "docs", "SEO_PROGRESS.csv"),
    `\n${now.toISOString().slice(0, 10)},${new Date().toTimeString().slice(0, 5)},CLEANUP-OUT-OF-HOURS-SERVICE-CLAIMS-${now.toISOString().slice(0, 10)},seo_fix,cleanup public service claims about 24-7 night service to verified hours 05-22,https://${HOST}/,,${report.success ? "done" : "needs_review"},high,,,,,backup ${relative(ROOT, backupDir)}; write live plugin file; patch targeted service posts and page 35; verify public URLs,tools/cleanup_out_of_hours_service_claims_live.mjs,,report ${relative(ROOT, reportPath)},,,,,,\n`,
    "utf8",
  );

  console.log(JSON.stringify({ reportPath, backupDir, success: report.success }, null, 2));
  if (!report.success) process.exitCode = 1;
}

main().catch((error) => {
  const failure = {
    generatedAt: formatProjectTimestamp(now),
    error: error instanceof Error ? error.message : String(error),
  };
  writeFileSync(reportPath, JSON.stringify(failure, null, 2), "utf8");
  console.error(error);
  process.exitCode = 1;
});
