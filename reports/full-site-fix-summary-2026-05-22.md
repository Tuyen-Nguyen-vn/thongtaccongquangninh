# Full Site Fix Summary - 2026-05-22

## Đã xử lý

- Gán featured image cho các bài còn thiếu ảnh đại diện.
- Bỏ category `Uncategorized` khỏi 19 bài trong luồng Blog/Cẩm nang.
- Sửa Markdown `**...**` ở bài Bãi Cháy và thêm sanitize cho mô tả hero.
- Sửa nhãn ảnh không phù hợp:
  - Trang chủ: đổi `ẢNH THẬT CÔNG TRÌNH / Hình ảnh thực tế 100%` thành `HỒ SƠ CÔNG TRÌNH / Hình ảnh thi công rõ bối cảnh`.
  - Trang chính sách bảo mật: thay caption có `Ảnh thực tế` bằng mô tả chủ thể/dịch vụ.
- Bổ sung/chuẩn hóa title, meta description và OG image cho:
  - Category archive.
  - Author archive.
  - Các page có meta description ngắn.
  - Các page có title ngắn.
- Upload live:
  - `ttcqn-home-emergency-renderer` version `2026.05.22.10`.
  - `ttcqn-seo-cleanup-redirects` version `2026.05.22.5`.

## File/plugin đã sửa

- `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- `tools/wp-plugins/ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects.php`
- Live page content: `chinh-sach-bao-mat`

## Báo cáo dữ liệu

- Post cleanup snapshot: `reports/full-site-post-cleanup-fix-2026-05-22.json`
- Privacy label cleanup: `reports/privacy-label-cleanup-2026-05-22.json`
- Audit trước sửa: `reports/full-site-live-audit-2026-05-22.md`
- Audit sau sửa: `reports/full-site-live-audit-after-fix-2026-05-22.md`

## Kết quả audit sau sửa

Audit toàn sitemap sau sửa ghi nhận:

- Tổng URL: 78.
- Điểm trung bình: 98/100.
- Featured image: 0 lỗi.
- Uncategorized: 0 lỗi.
- Nhãn ảnh cấm/không nên dùng: 0 lỗi.
- Ảnh lỗi trong 8 ảnh đầu mỗi URL: 0 lỗi.
- Canonical/H1/schema: không còn lỗi thực tế sau kiểm lại URL timeout.

Hai URL `author/cuben01` và `chi-phi-hut-be-phot-quang-ninh-2` bị timeout trong audit 9 giây, nhưng kiểm lại 30 giây đều trả `200`, có title, meta, canonical, H1, OG image và schema.

Kiểm lại 3 URL còn vấn đề:

- `/thong-tac-cong-bai-chay/`: `200`, không còn Markdown `**`, không còn nhãn ảnh cấm.
- `/author/cuben01/`: `200`, meta description 153 ký tự, có canonical, H1, OG image, schema.
- `/chi-phi-hut-be-phot-quang-ninh-2/`: `200`, meta description 160 ký tự, có canonical, H1, OG image, schema.

## Ghi chú còn lại

- Category `Uncategorized` vẫn tồn tại trong WordPress với count còn `1` theo REST, nhưng 19 bài trong sitemap bị audit lỗi đã được gỡ khỏi category này. Cần kiểm riêng bài còn lại nếu muốn dọn sạch taxonomy hoàn toàn.
