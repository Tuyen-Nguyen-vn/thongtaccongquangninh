# Deep Website Audit — 2026-06-17

Website: https://thongtaccongquangninh.com
Chế độ: audit read-only, không sửa live, không publish, không xóa file.

## 1. Kết quả tổng quan

- Inventory WordPress mới: 160 entry, gồm 55 pages và 105 posts.
- Published URL audit: 86 URL.
- SEO full audit: PASS 42, FAIL 8, WARN 36.
- Sitemap: 80 URL, 2 child sitemap, status 200.
- Sitemap lỗi indexability: 0.
- GSC 404/redirect audit: 0 URL 404, 0 redirect chain dài, 27 redirect 1 bước.
- Broken internal links: 3 URL gãy, xuất hiện trên 2 trang quan trọng.
- Image SEO: 1 trang thiếu ảnh, 2 global image reuse groups.
- Schema: 1 warning nhỏ ở homepage BreadcrumbList ít hơn 2 item.

## 2. P0 — Cần xử lý trước

### P0.1. Link nội bộ trỏ vào URL 404

Các URL 404 đã xác minh bằng `curl.exe -I -L`:

- `https://thongtaccongquangninh.com/thong-tac-cong-cao-xanh/` → 404.
- `https://thongtaccongquangninh.com/thong-tac-cong-bai-chay/` → 404.
- `https://thongtaccongquangninh.com/thong-tac-cong-tuan-chau/` → 404.

Nguồn link gãy:

- `https://thongtaccongquangninh.com/`
  - trỏ tới `/thong-tac-cong-cao-xanh/`
  - trỏ tới `/thong-tac-cong-bai-chay/`
- `https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/`
  - trỏ tới `/thong-tac-cong-cao-xanh/`
  - trỏ tới `/thong-tac-cong-bai-chay/`
  - trỏ tới `/thong-tac-cong-tuan-chau/`

Nguyên nhân hiện thấy:

- Inventory mới cho thấy các slug `thong-tac-cong-bai-chay`, `thong-tac-cong-cao-xanh`, `thong-tac-cong-tuan-chau` đang ở trạng thái draft/non-public.
- Trong khi đó trang chủ và landing `thong-tac-cong-quang-ninh` vẫn còn link công khai tới các slug này.

Khuyến nghị fix:

- Nếu 3 trang này cần SEO: publish lại đúng URL sau khi kiểm nội dung/ảnh/meta/schema.
- Nếu chưa muốn public: đổi link trên trang chủ và landing TTC về URL đang publish phù hợp, hoặc bỏ link khỏi block khu vực.

### P0.2. Trùng permalink giữa page và post publish

Inventory phát hiện 2 permalink có cả page và post đang publish:

- `https://thongtaccongquangninh.com/hut-be-phot-ha-long/`
  - Page ID 52 publish.
  - Post ID 2913 publish.
- `https://thongtaccongquangninh.com/thong-tac-cong-cam-pha/`
  - Page ID 400 publish.
  - Post ID 2917 publish.

Rủi ro:

- Dễ tạo duplicate title/canonical confusion trong WordPress.
- Có thể làm audit title/meta/schema đếm trùng và gây khó kiểm source of truth.

Khuyến nghị fix:

- Chọn 1 source of truth cho mỗi permalink.
- Bản còn lại chuyển draft/noindex/redirect nội bộ tùy mục tiêu SEO, có backup trước khi sửa live.

### P0.3. Post `xe-hut-be-phot-quang-ninh` đang noindex

URL:

- `https://thongtaccongquangninh.com/xe-hut-be-phot-quang-ninh/`

Kết quả verify:

- HTTP 200.
- Robots: `noindex, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large`.
- Canonical tự trỏ về chính URL.
- Không nằm trong sitemap.

Ghi chú:

- Đây khớp lịch sử xử lý cannibalization post 2554, nên không tự coi là lỗi cần gỡ noindex.
- Cần quyết định rõ: giữ noindex để tránh cạnh tranh với `/hut-be-phot-quang-ninh/`, hoặc index nếu muốn dùng post này làm money page riêng.

## 3. P1 — Nên xử lý trong batch gần nhất

### P1.1. `/dieu-khoan-dich-vu/` còn yếu

Vấn đề:

- Word count 1925, vẫn dưới ngưỡng.
- 0 ảnh nội dung.
- Thiếu FAQPage schema.
- Không nằm trong sitemap.

Ảnh cần bổ sung theo audit:

- Thợ thông tắc cống tại nhà dân ở Quảng Ninh bằng máy lò xo.
- Kiểm tra hố ga và đường ống thoát nước tại Quảng Ninh.
- Xử lý cống bếp dầu mỡ cho nhà hàng/quán ăn tại Quảng Ninh.

### P1.2. Homepage còn warning ảnh và link

Vấn đề:

- 64 ảnh, còn `ALT_NO_SERVICE_OR_LOCATION x4` theo SEO full audit.
- Audit homepage image riêng thấy 3 icon bị skip, không phải ảnh nội dung.
- Broken link từ homepage tới 2 URL draft/non-public.
- Homepage có footer hash riêng, footer variant toàn site = 2.

### P1.3. NAP/social có marker địa chỉ cũ

Audit NAP/social trả OK với hotline và social, nhưng phát hiện marker `111 Cái Lân` trên các trang spot-check:

- `/`
- `/hut-be-phot-quang-ninh/`
- `/thong-tac-cong-quang-ninh/`
- `/lien-he/`
- `/gioi-thieu/`
- `/bang-gia/`

Cần đối chiếu lại vì `CODEX_CONTEXT.md` hiện ghi VP chính Hạ Long cần xác nhận địa chỉ cụ thể với Tuyền, còn schema/live đang dùng `111 Cái Lân, Bãi Cháy`.

### P1.4. Homepage BreadcrumbList warning

Structured data audit chỉ có 1 WARN:

- Homepage `BreadcrumbList` có ít hơn 2 item.

Tác động thấp hơn broken links, nhưng nên sửa khi đụng schema/home renderer.

## 4. P2 — Theo dõi

- Word count dài/ngắn ở 40 URL chủ yếu là cảnh báo content, chưa phải blocker kỹ thuật.
- 2 global image reuse groups cần review thủ công trước khi chạy `--fix`.
- 27 redirect 1 bước là bình thường nếu dùng để gom alias cũ, hiện không có redirect chain dài.
- 4 REST published nhưng không nằm sitemap:
  - `/dieu-khoan-dich-vu/`
  - `/he-thong-lien-ket-doi-tac/`
  - `/chinh-sach-bao-mat/`
  - `/xe-hut-be-phot-quang-ninh/`

## 5. File evidence

- `wp-url-audit-list.csv`
- `wp-url-audit-list.json`
- `reports/site-full-audit-2026-06-17.md`
- `reports/site-full-audit-2026-06-17.json`
- `reports/seo-full-audit-2026-06-17.md`
- `reports/seo-full-audit-2026-06-17.json`
- `reports/indexability-audit-2026-06-16T18-50-29.md`
- `reports/indexability-audit-2026-06-16T18-50-29.json`
- `reports/gsc-404-redirect-audit-2026-06-16T18-50-29.md`
- `reports/gsc-404-redirect-audit-2026-06-16T18-50-29.json`
- `reports/wp-unique-image-audit-2026-06-17T01-51-57.md`
- `reports/wp-unique-image-audit-2026-06-17T01-51-57.json`
- `reports/structured-data-live-audit-2026-06-16T18-51-59.md`
- `reports/structured-data-live-audit-2026-06-16T18-51-59.json`
- `reports/nap-social-audit-2026-05-31.json`

## 6. Lệnh đã chạy

```powershell
node .\tools\refresh_url_audit.mjs
node .\tools\audit_site_full.mjs
node .\tools\audit_seo_full.mjs
node .\tools\audit_indexability_2026_06_12.mjs
node .\tools\audit_gsc_404_redirect.mjs
python .\tools\audit_unique_wp_images.py
node .\tools\audit_homepage_images.mjs
node .\tools\check_homepage_hotlink.mjs
node .\tools\audit_live_structured_data.mjs
node .\tools\audit_internal_links.mjs
node .\tools\audit_nap_social_links.mjs
```

Lệnh bị dừng:

```powershell
node .\tools\audit_live_links_assets.mjs
```

Lý do: script vẫn chạy nền sau hơn 5 phút, đã dừng đúng PID audit để không treo máy. Chưa có report mới từ script này.

## 7. Việc tiếp theo nên làm

Fix batch P0: xử lý 3 broken internal links trên trang chủ và `/thong-tac-cong-quang-ninh/`, đồng thời quyết định source of truth cho 2 cặp permalink trùng.
