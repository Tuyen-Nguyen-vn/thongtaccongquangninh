# PLAN — Áp 4 module Google Search Central vào thongtaccongquangninh.com

Ngày lập: 2026-06-20 | Người phụ trách: Tuyền | Site: WordPress + Rank Math

Nguồn: 4 tài liệu Google Search Central Tuyền gửi — (1) AI Features (AI Overviews/AI Mode), (2) Featured Snippets, (3) Byline/Publication Date, (4) Site Names. Plan này nối tiếp `docs/GOOGLE_SEARCH_CENTRAL_MODULES_2026-05-23.md` (đã có 3/4 module, **thiếu Site Names** — bổ sung tại đây).

---

## 0. Tóm tắt cho người không phải dev


- **Site Name** = cái tên hiện dưới mỗi kết quả tìm kiếm (giờ site có thể đang hiện "thongtaccongquangninh.com" thay vì "Môi Trường Đô Thị Số 1 Quảng Ninh"). Sửa được bằng schema `WebSite` + Rank Math. **Đây là việc gấp nhất và đang bị 1 lỗi chặn.**
- **Byline Date** = ngày đăng / ngày cập nhật hiện trong kết quả tìm kiếm. Tăng độ tin, tốt cho bài dịch vụ "cập nhật 2026".
- **Featured Snippet** = ô trả lời nổi bật trên đầu Google. Không ép được, nhưng viết FAQ/định nghĩa ngắn gọn 2–3 câu thì dễ được chọn. Site đã có sẵn nền (FAQPage schema) — chỉ cần làm đúng chuẩn rộng hơn.

Mức độ ưu tiên tổng: **Site Name (P1, đang bị chặn) → Byline Date hiển thị (P1) → Featured Snippet chuẩn hóa (P2) → AI Features rà soát (P2) → Đo lường (P3)**.

---

## MODULE 1 — SITE NAME (P1, GẤP, ĐANG BỊ CHẶN)

### Vấn đề là gì
Google tự sinh "tên trang web" dưới mỗi kết quả từ schema `WebSite` (name + alternateName) trên TRANG CHỦ + các tín hiệu `og:site_name`, `<title>` trang chủ. Nếu không khai rõ, Google có thể hiện tên miền trần.

### Nằm ở đâu / vì sao đang chặn
Theo `SEO thongtaccongquangninh.com/rank-math-local-seo-config.md` mục 8: option `rank-math-options-titles` trong database đang bị lưu **sai kiểu (chuỗi JSON thay vì object)** → màn **Rank Math → Titles & Meta crash, không lưu được**. Vì màn này crash nên **Website Name / Alternate Name chưa set được** → schema `WebSite` chưa chắc có `name` đúng.

### Ảnh hưởng
SERP có thể hiển thị "thongtaccongquangninh.com" thay vì thương hiệu → giảm nhận diện, giảm CTR, yếu tín hiệu brand cho cả AI Features.

### Cách sửa (theo thứ tự)
1. **Gỡ lỗi `titles` (bắt buộc trước):** nối lại Chrome extension → gọi `exportSettings` của Rank Math → kiểm `typeof titles === 'object'`. Nếu vẫn là string: import lại file đã sửa (đã chuẩn bị, 120 trường giữ nguyên) → xác minh màn Titles & Meta mở + Save được.
2. **Điền Site Name** (Rank Math → Titles & Meta → Local SEO / Knowledge Graph), giá trị đã chốt trong config:
   - Website Name: `Môi Trường Đô Thị Số 1 Quảng Ninh`
   - Website Alternate Name: `Môi Trường Đô Thị Quảng Ninh`
3. **Bổ sung tên dự phòng** (Google khuyến nghị) — sửa schema `WebSite` để `alternateName` là **mảng**, xếp theo thứ tự ưu tiên, thêm tên miền chữ thường làm fallback cuối:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "WebSite",
     "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
     "alternateName": ["Môi Trường Đô Thị Quảng Ninh", "thongtaccongquangninh.com"],
     "url": "https://thongtaccongquangninh.com/"
   }
   ```
4. **Đồng bộ tín hiệu trên trang chủ:** đảm bảo `og:site_name` = "Môi Trường Đô Thị Số 1 Quảng Ninh"; `<title>` trang chủ và phần text brand hiển thị trên trang chủ dùng đúng tên này, nhất quán.
5. **Xác minh:** Schema Markup Validator (validator.schema.org) → không lỗi cú pháp; URL Inspection trong GSC trên trang chủ → Request Indexing. Chờ recrawl (vài ngày–vài tuần).

### Cần Tuyền / làm tay
- Cấp lại Chrome extension hoặc quyền WP admin để chạy bước 1.
- Quyết định: dùng Rank Math điền site name hay khai thẳng trong mu-plugin (khuyên: Rank Math trước, mu-plugin chỉ khi cần mảng alternateName).

### Lộ trình: **Ngày 1–2** (sau khi nối lại công cụ).

---

## MODULE 2 — BYLINE / PUBLICATION DATE (P1)

### Vấn đề là gì
Google ước lượng ngày đăng/cập nhật từ nhiều tín hiệu; muốn ngày hiện đúng trong SERP cần **2 thứ khớp nhau**: ngày hiển thị có nhãn trên trang + `datePublished`/`dateModified` trong schema.

### Hiện trạng (đã có một phần)
Theo `PROJECT_STATE.md`: posts đã có schema `BlogPosting` (vd post 2377/2378) → nhiều khả năng đã có `datePublished`/`dateModified` qua Rank Math. **Phần còn thiếu: ngày HIỂN THỊ có nhãn rõ trên giao diện bài viết** (theme thường ẩn ngày).

### Nằm ở đâu

### Ảnh hưởng
Thiếu ngày hiển thị → Google khó xác nhận ngày → SERP không hiện "Cập nhật…", bài "2026" mất lợi thế tươi mới; rủi ro Google chọn nhầm ngày khác trên trang.

### Cách sửa
1. **Kiểm schema trước:** chạy Rich Results Test trên 2–3 bài tiêu biểu, xác nhận có `datePublished` và `dateModified` hợp lệ, không phải ngày tương lai.
2. **Thêm ngày hiển thị có nhãn** ngay dưới H1/tiêu đề bài, định dạng rõ ràng. Mẫu chuẩn:
   - `Cập nhật lần cuối: 20/06/2026`
   - hoặc `Đăng ngày: 20/06/2026 · Cập nhật: …`
   Nhãn phải là chữ "Đăng ngày" / "Cập nhật lần cuối" để Google nhận diện.
5. Phạm vi áp dụng: **bài blog/bài SEO dịch vụ** (nơi độ tươi quan trọng). Trang tĩnh như Liên hệ/Chính sách không cần.

### Cần Tuyền / làm tay

### Lộ trình: **Ngày 2–4**, làm sau khi Module 1 xong.

---

## MODULE 3 — FEATURED SNIPPET (P2)

### Vấn đề là gì

### Hiện trạng (nền tốt)
Site đã có FAQPage JSON-LD ở nhiều trang (chính sách bảo hành 4 Q&A, bảo mật 5 Q&A, các bài có FAQ 4 câu), cấu trúc bài SEO đã quy định FAQ + bảng giá + quy trình 5 bước. `max-image-preview:large` đã bật, chưa thấy `nosnippet`/`max-snippet` hạn chế.

### Cách sửa / tối ưu
   - H2: *Thông tắc cống ở Quảng Ninh giá bao nhiêu?*
   - Câu đầu: "Giá thông tắc cống tại Quảng Ninh dao động **300.000–1.500.000đ** tùy mức tắc và đường kính cống. Báo giá rõ trước khi làm, không phát sinh. Gọi **0963.953.533** để được khảo sát miễn phí."
3. **Bảng giá dạng table HTML thật** (không ảnh chụp bảng) — Google rất hay lấy table làm snippet.
4. **Quy trình 5 bước dạng list có thứ tự** (`<ol>`) — dễ thành snippet kiểu danh sách.
5. **FAQ giữ đáp án 2–3 câu** (đúng luật dự án) để bắt cả Featured Snippet lẫn nhóm "Mọi người cũng hỏi".

### Cần Tuyền / làm tay

### Lộ trình: **liên tục** khi viết bài mới + rà 5 landing chính trong tuần.

---

## MODULE 4 — AI FEATURES / AI OVERVIEWS / AI MODE (P2)

### Vấn đề là gì

### Hiện trạng (đã làm gần xong)
`max-image-preview:large` site-wide ✓, BreadcrumbList ✓, internal link 5 landing đã bổ sung 28 link ✓, schema khớp visible text ✓, ảnh WebP + alt địa danh ✓. Còn lại là rà vài điểm nền.

### Cách sửa / checklist rà soát
3. **Nội dung quan trọng phải là text** (không nhét vào ảnh) — kiểm trang chủ render qua emergency renderer: phần USP/giá/khu vực có ở dạng text.
4. **Internal link** cho bài mới luôn trỏ về landing trụ cột (đã thành luật — giữ).
5. **Page experience / Core Web Vitals:** bám `SEO thongtaccongquangninh.com/pagespeed-performance-plan.md` + `htaccess-performance-patch.txt` đã có.
6. **Google Business Profile + (nếu có) Merchant Center:** cập nhật NAP, giờ 24/7, khu vực phục vụ trùng khớp site.
7. **Đo lường:** traffic AI Features nằm trong GSC → Performance → loại "Web" (không tách riêng). Theo dõi tại đây.

### Cần Tuyền / làm tay
- Quyền GSC để verify + xem Performance.
- Quyền/quyết định Google Business Profile.
- Quyết định Google-Extended (mở/chặn).

### Lộ trình: **Ngày 3–5**, chủ yếu là rà soát + GBP.

---

## BẢNG ƯU TIÊN & LỘ TRÌNH GỘP

| # | Việc | Ưu tiên | Ngày | Chặn bởi | Cần Tuyền |
|---|---|---|---|---|---|
| 1 | Gỡ lỗi `rank-math-options-titles` (string→object) | P1 | 1 | Chrome/WP admin | Cấp quyền công cụ |
| 2 | Set Website Name + Alternate + WebSite schema mảng | P1 | 1–2 | #1 | Xác nhận cách khai |
| 3 | Xác minh schema + Request Indexing trang chủ | P1 | 2 | #2 | Quyền GSC |
| 4 | Kiểm schema date + thêm ngày hiển thị có nhãn | P1 | 2–4 | — | Chốt chỗ chèn |
| 5 | Chuẩn hóa đoạn trả lời/table/list cho snippet (5 landing) | P2 | 3–5 | — | — |
| 6 | Rà robots.txt + Google-Extended + text content | P2 | 3 | — | Quyết Google-Extended |
| 7 | Cập nhật Google Business Profile | P2 | 4–5 | — | Quyền GBP |
| 8 | Theo dõi GSC Performance (Web) 14 ngày | P3 | sau | #3 | Quyền GSC |

---

## ĐIỀU GOOGLE KHÔNG BẢO ĐẢM (ghi để không kỳ vọng sai)

## DỮ LIỆU/CÔNG CỤ CÒN THIẾU (phương án tiết kiệm)
- **Chrome extension / WP admin đang ngắt** → chặn Module 1. Phương án: nối lại extension HOẶC Tuyền đưa quyền 1Panel/REST để agent sửa option `titles` trực tiếp (đã có file đã sửa sẵn).
- **Quyền GSC + GBP** → cần cho bước xác minh và đo lường.

---

Việc tiếp theo nên làm: nối lại Chrome/WP admin để gỡ lỗi `rank-math-options-titles` rồi set Site Name (Module 1).
