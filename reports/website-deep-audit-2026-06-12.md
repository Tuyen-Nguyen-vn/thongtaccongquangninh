# Báo cáo audit chuyên sâu website — 2026-06-12

Website: https://thongtaccongquangninh.com  
Phạm vi: live website, 87 URL đang publish, kiểm bằng REST/public HTML + cache-buster + audit ảnh.

## 1. Kết luận nhanh

- Nền technical SEO đang ổn: 87/87 URL publish fetch HTTP 200, không phát hiện canonical/noindex bất thường, viewport OK, 0 broken internal link.
- Robots mở đúng cho Googlebot: `Allow: /`, chỉ chặn `/wp-admin/`, sitemap Rank Math khai báo tại `/sitemap_index.xml`.
- Schema phủ tốt: LocalBusiness/HomeAndConstructionBusiness có trên 87 URL, BreadcrumbList phủ toàn site, FAQPage có trên 85 URL, Service có trên 72 URL.
- Điểm yếu chính hiện nằm ở 3 bài thông tắc cống mới/dạng phụ: thiếu H2 "Nguyên nhân", thiếu Service schema, title dài, còn từ cấm và nội dung hơi dài.
- Image SEO còn 3 URL cần xử lý: 1 trang thiếu ảnh hoàn toàn và 2 trang có ảnh trùng byte/pixel trong cùng bài.
- Performance cần tối ưu tiếp: TTFB bypass cache khoảng 1.56-2.15 giây; HTML trang chủ khoảng 541 KB, landing chính khoảng 200-222 KB.

## 2. Số liệu audit

- URL audit: 87
- PASS: 28
- HIGH: 3
- MEDIUM/WARN: 56
- Pages: 46
- Posts: 41
- Internal links checked: 107
- Broken internal links: 0
- Footer variants: 2

Top issue category:

- Content: 73
- Title/meta: 11
- Image: 10
- Schema: 3
- Heading: 2

## 3. Technical SEO & Indexability

Kết quả tốt:

- 87/87 URL publish trả HTTP 200.
- 107/107 internal link kiểm tra trả HTTP 200.
- Không phát hiện URL public bị noindex ngoài ý muốn.
- Canonical không bất thường trong audit.
- Header live có `strict-transport-security`, `x-content-type-options: nosniff`, `x-frame-options: SAMEORIGIN`, `referrer-policy`.
- Sitemap index trả 200, gồm `post-sitemap.xml`, `page-sitemap.xml`, `category-sitemap.xml`.

Lưu ý:

- `sitemap_index.xml` có `x-robots-tag: noindex`; đây là bình thường với sitemap XML, không phải noindex trang nội dung.
- File `SEO_GOOGLE_INDEX_2026-06-11.json` chỉ là log submit 86 URL thành công, không phải bằng chứng Google đã index từng URL.

## 4. On-page SEO

Các trang tiền chính:

| URL | Score | Tình trạng |
|---|---:|---|
| `/hut-be-phot-quang-ninh/` | 97 | 2943 từ, 3 ảnh, 1 H1, schema đủ; meta description hơi ngắn 125 ký tự |
| `/thong-tac-cong-quang-ninh/` | 94 | 3169 từ, 15 ảnh, 1 H1, schema đủ; meta description ngắn 130 ký tự |
| `/thong-tac-bon-cau-quang-ninh/` | 100 | PASS |
| `/nao-vet-ho-ga-quang-ninh/` | 97 | 2473 từ, hơi dưới target |
| `/bang-gia/` | 97 | 3252 từ, hơi dài |

Meta/title cần sửa:

- Trang chủ: title ngắn 44 ký tự.
- `/gia-thong-tac-cong-quang-ninh-2026/`: title dài 89 ký tự.
- `/thong-tac-cong-24-7-quang-ninh/`: title dài 77 ký tự, meta ngắn 144 ký tự.
- `/thong-tac-cong-khan-cap-quang-ninh-2026/`: title dài 82 ký tự.
- 7 URL meta description ngắn, gồm `/hut-be-phot-quang-ninh/`, `/thong-tac-cong-quang-ninh/`, `/thong-tac-cong-chung-cu-ha-long/`, `/thong-tac-cong-ngo-nho-ha-long/`.

## 5. P0 cần xử lý

### 5.1 `/gia-thong-tac-cong-quang-ninh-2026/` — Score 67, HIGH

Vấn đề:

- Thiếu H2 bắt buộc "Nguyên nhân".
- Nội dung quá dài: 3623 từ.
- Title quá dài: 89 ký tự.
- Thiếu Service schema.
- Còn từ cấm: "chuyên nghiệp" x1, "uy tín" x2.
- Slug có năm 2026.

Hành động:

- Đổi title về 60-70 ký tự, bỏ lặp "Thông Tắc Cống Quảng Ninh".
- Thêm hoặc đổi một H2 hiện có thành "Nguyên nhân giá thông tắc cống chênh lệch tại Quảng Ninh".
- Xóa/thay toàn bộ "chuyên nghiệp", "uy tín".
- Thêm Service JSON-LD khớp nội dung hiển thị.
- Rút bớt đoạn thừa để về khoảng 2800-3100 từ.

### 5.2 `/thong-tac-cong-24-7-quang-ninh/` — Score 70, HIGH

Vấn đề:

- Thiếu H2 bắt buộc "Nguyên nhân".
- Title dài 77 ký tự.
- Meta ngắn 144 ký tự.
- Thiếu Service schema.
- Còn từ cấm: "uy tín" x1.
- Ảnh trong cùng bài có trùng pixel/byte.

Hành động:

- Sửa H2 "Vì Sao Cống Tắc Thường Xảy Ra Ban Đêm?" thành H2 có chữ "Nguyên nhân".
- Viết lại title/meta ngắn gọn hơn.
- Thêm Service schema.
- Thay ảnh trùng bằng ảnh thợ thông tắc cống tại nhà dân ở Quảng Ninh bằng máy lò xo.

### 5.3 `/thong-tac-cong-khan-cap-quang-ninh-2026/` — Score 75, HIGH

Vấn đề:

- Nội dung dài 3356 từ.
- Title dài 82 ký tự.
- Thiếu Service schema.
- Còn từ cấm: "uy tín" x2.
- Slug có năm 2026.

Hành động:

- Rút gọn title.
- Thêm Service schema.
- Xóa từ cấm.
- Rút bớt các đoạn lặp hotline/CTA hoặc nội dung phụ để giảm độ dài.

## 6. Image SEO

Audit ảnh WordPress:

- Total content: 87
- Pages with issues: 3
- Same-page duplicate pages: 2
- Pages under 3 images: 1
- Global reuse groups: 16

URL cần xử lý:

- `/dieu-khoan-dich-vu/`: 0 ảnh, cần thêm 3 ảnh nội dung phù hợp.
- `/thong-tac-cong-24-7-quang-ninh/`: ảnh 01 và 02 trùng byte/pixel.
- `/thong-tac-cong-bai-chay/`: 2 ảnh trùng byte/pixel trong cùng bài.

Chủ đề ảnh cần bổ sung:

- Thợ thông tắc cống tại nhà dân ở Quảng Ninh bằng máy lò xo.
- Kiểm tra hố ga và đường ống thoát nước tại Quảng Ninh.
- Xử lý cống bếp dầu mỡ cho nhà hàng/quán ăn tại Quảng Ninh.
- Riêng Bãi Cháy: ảnh thợ thông tắc cống tại nhà dân ở Bãi Cháy bằng máy lò xo.

## 7. Performance

Đo bằng curl với cache-buster `?nowprocket=1&codex=20260612`:

| URL | HTTP | TTFB | Total | HTML size |
|---|---:|---:|---:|---:|
| `/` | 200 | 2.148s | 2.228s | 541 KB |
| `/thong-tac-cong-quang-ninh/` | 200 | 1.604s | 1.649s | 222 KB |
| `/hut-be-phot-quang-ninh/` | 200 | 1.562s | 1.693s | 207 KB |
| `/bang-gia/` | 200 | 1.817s | 1.851s | 203 KB |
| `/gia-thong-tac-cong-quang-ninh-2026/` | 200 | 1.665s | 1.774s | 210 KB |

Nhận định:

- TTFB >1.5s trên nhiều URL là điểm nghẽn mobile.
- Trang chủ HTML 541 KB khá nặng, cần kiểm lại renderer, số block/ảnh/script inline.
- PageSpeed API bị 429 rate limit trong lượt audit này, chưa có Lighthouse score mới.

## 8. Ưu tiên sửa

Việc tiếp theo nên làm trước:

1. Sửa `/gia-thong-tac-cong-quang-ninh-2026/` vì score thấp nhất 67 và có đủ lỗi P0: heading, title, từ cấm, schema.
2. Sau đó sửa `/thong-tac-cong-24-7-quang-ninh/` vì vừa lỗi content/schema vừa trùng ảnh.
3. Chạy lại `node .\tools\audit_seo_full.mjs --no-csv` và `python .\tools\audit_unique_wp_images.py` để xác nhận.

## 9. File bằng chứng

- `reports/seo-full-audit-2026-06-12.md`
- `reports/seo-full-audit-2026-06-12.json`
- `reports/site-full-audit-2026-06-12.md`
- `reports/site-full-audit-2026-06-12.json`
- `reports/wp-unique-image-audit-2026-06-12T17-48-03.md`
- `reports/wp-unique-image-audit-2026-06-12T17-48-03.json`
- `reports/robots-2026-06-12.txt`
- `reports/sitemap-index-2026-06-12.xml`
