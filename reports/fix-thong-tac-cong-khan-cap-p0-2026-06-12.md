# Fix P0 — thong-tac-cong-khan-cap-quang-ninh-2026 — 2026-06-12

URL: https://thongtaccongquangninh.com/thong-tac-cong-khan-cap-quang-ninh-2026/
Post ID: 2777

## Đã sửa live

- Đổi title sang: `Thông Tắc Cống Khẩn Cấp Quảng Ninh: Có Mặt Nhanh Trong 15 Phút` (62 ký tự).
- Đổi meta description sang 154 ký tự, có hotline `0963.953.533`.
- Xóa block biên tập bị lộ public: `Gợi ý ảnh SEO`, `Internal Links`, `External Link`, `CHECKLIST RANK MATH`, `Điểm ước tính`.
- Xóa từ cấm `uy tín` khỏi phần public.
- Thêm `Service` JSON-LD khớp dịch vụ thông tắc cống khẩn cấp.
- Giữ slug hiện tại, chưa đổi URL để tránh phát sinh redirect/canonical mới.

## Backup

- `backups/live-audit-fix-2026-06-12/post-2777-before.json`
- `backups/live-audit-fix-2026-06-12/post-2777-before-content.html`
- `backups/live-audit-fix-2026-06-12/post-2777-after-preview.html`
- `backups/live-audit-fix-2026-06-12/ttc-khan-cap-after.html`

## Kết quả audit sau sửa

- Trước sửa: score 75, severity HIGH.
- Sau sửa: score 97, severity MEDIUM.
- Word count live: 2913.
- Images: 3, không có issue.
- Required H2: đủ.
- Forbidden words: không còn.
- Schema: có `Service`, không còn `MISSING_SERVICE`.
- Còn: `SLUG_HAS_DATE_OR_LONG_NUMBER` do URL chứa `2026`; chưa đổi slug vì đây không phải lỗi technical/index và đổi slug cần xử lý redirect.

## Toàn site sau sửa

- HIGH: 0.
- PASS: 29.
- MEDIUM: 58.
- Không còn URL chứa từ cấm trong audit.
- Không còn URL thiếu schema bắt buộc.
- Image audit còn 2 URL cần xử lý: `/dieu-khoan-dich-vu/` thiếu ảnh và `/thong-tac-cong-bai-chay/` trùng ảnh.

## Lệnh đã chạy

- `node --check .\tools\fix_ttc_khan_cap_p0.mjs`
- `node .\tools\fix_ttc_khan_cap_p0.mjs`
- `node .\tools\fix_ttc_khan_cap_p0.mjs --write`
- Public HTML verify bằng cache-buster `?nowprocket=1&codex=afterfixkc`
- `node .\tools\audit_seo_full.mjs --limit 90 --no-csv`
- `python .\tools\audit_unique_wp_images.py`
