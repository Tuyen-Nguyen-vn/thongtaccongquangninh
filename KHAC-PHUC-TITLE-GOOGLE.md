# KẾ HOẠCH KHẮC PHỤC: Google chỉ hiện URL, không hiện tên website

Website: `thongtaccongquangninh.com` — Ngày phân tích: 11/06/2026

## 1. KẾT QUẢ CHẨN ĐOÁN

### Triệu chứng
Trên kết quả tìm kiếm Google, trang chủ chỉ hiển thị URL trần
(`thongtaccongquangninh.com`) thay vì tiêu đề trang (title). Một số trang con
(ví dụ `/blog/`) vẫn còn title cũ trong index của Google.

### Nguyên nhân gốc (đã xác minh bằng đo đạc thực tế)

**Website KHÔNG THỂ TRUY CẬP từ bên ngoài Việt Nam — kết nối TCP bị timeout
hoàn toàn.** Kết quả kiểm tra ngày 11/06/2026 qua check-host.net:

| Vị trí kiểm tra | Kết quả tới 103.56.163.10 / 103.166.183.10 (cổng 443) |
|---|---|
| Los Angeles, Mỹ | ❌ Connection timed out |
| Dallas, Mỹ | ❌ Connection timed out |
| Atlanta, Mỹ | ❌ Connection timed out |
| Nuremberg, Đức | ❌ Connection timed out |
| Tokyo, Nhật | ❌ Connection timed out |
| Belgrade, Serbia | ❌ Connection timed out |

**Googlebot crawl chủ yếu từ dải IP tại Mỹ (66.249.64.0/19).** Khi Googlebot
không kết nối được tới website:
1. Google không đọc được thẻ `<title>`, meta description, structured data.
2. Kết quả tìm kiếm chỉ còn URL trần (hoặc "Không có thông tin cho trang này").
3. Nếu kéo dài, Google sẽ **gỡ dần toàn bộ trang khỏi index** — các trang con
   như `/blog/` còn title chỉ là dữ liệu cũ chưa bị xoá.

### Nguồn gây chặn (cần kiểm tra theo thứ tự khả nghi)

1. **Tường lửa hosting/VPS chặn IP nước ngoài** ("chặn IP quốc tế" — tuỳ chọn
   chống DDoS phổ biến của hosting Việt Nam). Đây là khả năng cao nhất vì
   timeout xảy ra ở tầng TCP, đồng loạt mọi quốc gia.
2. **Cấu hình CDN/DNS** — domain đang dùng nameserver `vclouddns.com`
   (catba/haiphong.vclouddns.com). Kiểm tra trong panel nhà cung cấp xem có bật
   chế độ "chỉ cho phép truy cập từ Việt Nam" / geo-blocking không.
3. **ClickGuard chặn nhầm** — nếu trên máy chủ đang chạy `clickguard.py` với
   phương thức `iptables`, kiểm tra danh sách IP đã chặn có dải Google không
   (xem mục 3).

> Lưu ý: vấn đề KHÔNG nằm ở HTML/thẻ title. Khi Google không kết nối được thì
> sửa title/meta bao nhiêu cũng vô nghĩa — phải mở kết nối trước.

## 2. GIAI ĐOẠN 1 — MỞ KHÓA CHO GOOGLEBOT (làm ngay, quan trọng nhất)

1. **Liên hệ nhà cung cấp hosting/VPS** (hoặc tự kiểm tra nếu quản trị VPS):
   - Hỏi/kiểm tra: "Có đang bật chặn IP quốc tế / firewall chỉ cho IP Việt Nam
     không?" → yêu cầu **tắt**, hoặc tối thiểu **mở cho các dải IP Googlebot**:
     - `66.249.64.0/19` (Googlebot chính)
     - Danh sách đầy đủ Google công bố tại:
       https://developers.google.com/static/search/apis/ipranges/googlebot.json
     - Bingbot: https://www.bing.com/toolbox/bingbot.json
   - Khuyến nghị: **mở hoàn toàn truy cập quốc tế** cho cổng 80/443; chống DDoS
     nên dùng rate-limit thay vì chặn cả nước ngoài.
2. **Nếu tự quản trị máy chủ Linux**, kiểm tra:
   ```bash
   iptables -L INPUT -n | head -50      # tìm rule DROP theo dải IP
   ipset list 2>/dev/null | head        # tìm bộ chặn geo-ip
   ```
   Xoá các rule chặn dải quốc tế / dải 66.249.x.x nếu có.
3. **Kiểm tra panel vclouddns/CDN**: tắt mọi tuỳ chọn "Chặn IP nước ngoài",
   "Vietnam only", "Country blocking".

### Cách xác minh đã mở thành công
- Vào https://check-host.net/check-http?host=https://thongtaccongquangninh.com
  → tất cả node (Mỹ, Đức, Nhật...) phải trả về **HTTP 200**.
- Vào **Google Search Console → Kiểm tra URL → Kiểm tra URL đang hoạt động
  (Test live URL)** → phải báo "URL có thể được lập chỉ mục" và xem được
  ảnh chụp trang.

## 3. GIAI ĐOẠN 2 — ĐẢM BẢO CLICKGUARD KHÔNG CHẶN BOT TÌM KIẾM

PLAN.md quy định whitelist phải gồm "IP của bạn, Googlebot..." nhưng
`config.json` trước đây chỉ có `127.0.0.1` và `::1` → rủi ro Googlebot bị chặn
bởi luật tần suất truy cập (≥60 lượt/5 phút — Googlebot hoàn toàn có thể vượt
khi crawl mạnh).

Đã sửa trong commit này: thêm dải IP Googlebot/Bingbot vào `whitelist` của
`config.json`.

Việc cần làm thêm trên máy chủ đang chạy ClickGuard:
1. Cập nhật `config.json` mới (đã có whitelist bot tìm kiếm).
2. Kiểm tra IP Google có đang nằm trong danh sách chặn không:
   ```bash
   grep -E "^66\.249\." data/blocked_ips.txt clickguard_blocked.txt 2>/dev/null
   grep -E "66\.249\." data/state.json 2>/dev/null
   ```
   Nếu có → xoá các dòng đó khỏi `blocked_ips.txt`/`clickguard_blocked.txt` và
   khỏi `data/state.json`, rồi khởi động lại clickguard.
3. Nếu dùng phương thức `htaccess`: mở file `.htaccess` xoá các dòng
   `Require not ip 66.249.*` / `Deny from 66.249.*` trong khối
   `# BEGIN ClickGuard`.

## 4. GIAI ĐOẠN 3 — CHUẨN HOÁ ON-PAGE SEO (sau khi site truy cập được)

Khi Googlebot đã vào được, kiểm tra và chuẩn hoá để title hiển thị đúng và đẹp:

1. **Thẻ title trang chủ**: duy nhất, 50–60 ký tự, dạng
   `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt Uy Tín 24/7`.
2. **Meta description**: 150–160 ký tự, có số điện thoại và khu vực phục vụ.
3. **robots.txt**: KHÔNG chứa `Disallow: /` cho trang chủ; có dòng
   `Sitemap: https://thongtaccongquangninh.com/sitemap.xml`.
4. **Không có** thẻ `<meta name="robots" content="noindex">` hoặc header
   `X-Robots-Tag: noindex` trên trang chủ.
5. **Canonical** trỏ về chính `https://thongtaccongquangninh.com/`; hợp nhất
   www/non-www bằng redirect 301 về một bản duy nhất.
6. **Structured data (JSON-LD)** để Google hiểu tên website/tên doanh nghiệp:
   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "WebSite",
     "name": "Thông Tắc Cống Quảng Ninh",
     "url": "https://thongtaccongquangninh.com/"
   }
   </script>
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "LocalBusiness",
     "name": "Thông Tắc Cống Quảng Ninh",
     "telephone": "+84963953533",
     "areaServed": "Quảng Ninh",
     "url": "https://thongtaccongquangninh.com/"
   }
   </script>
   ```
7. **Open Graph**: `og:title`, `og:site_name`, `og:description`, `og:image`.

## 5. GIAI ĐOẠN 4 — YÊU CẦU GOOGLE LẬP CHỈ MỤC LẠI & GIÁM SÁT

1. Google Search Console → Kiểm tra URL trang chủ → **Yêu cầu lập chỉ mục**.
   Làm tương tự với 5–10 trang quan trọng nhất.
2. Gửi lại `sitemap.xml` trong mục Sơ đồ trang web.
3. Theo dõi trong 1–2 tuần:
   - **Cài đặt → Số liệu thống kê thu thập dữ liệu (Crawl stats)**: lỗi
     "Không kết nối được máy chủ" phải về 0.
   - **Trang (Indexing → Pages)**: số trang được index tăng trở lại.
   - Tìm `site:thongtaccongquangninh.com` trên Google: title phải hiện lại
     (thường 3–14 ngày sau khi mở kết nối + yêu cầu index).
4. Đặt giám sát uptime từ nước ngoài (UptimeRobot/BetterStack, region US/EU,
   miễn phí) để được cảnh báo ngay nếu site lại bị chặn quốc tế.

## 6. TÓM TẮT THỨ TỰ ƯU TIÊN

| # | Việc | Ai làm | Khi nào |
|---|---|---|---|
| 1 | Tắt chặn IP quốc tế / mở dải Googlebot tại hosting + CDN | Chủ site + nhà cung cấp | NGAY |
| 2 | Xác minh bằng check-host.net + Search Console Test live URL | Chủ site | Ngay sau #1 |
| 3 | Cập nhật config ClickGuard (whitelist bot) + gỡ IP Google khỏi blocklist trên máy chủ | Chủ site | Cùng ngày |
| 4 | Rà soát title/meta/robots/canonical/JSON-LD | Chủ site | Sau khi site mở |
| 5 | Yêu cầu lập chỉ mục lại + gửi sitemap | Chủ site | Sau #4 |
| 6 | Giám sát 1–2 tuần + đặt uptime monitor quốc tế | Chủ site | Liên tục |
