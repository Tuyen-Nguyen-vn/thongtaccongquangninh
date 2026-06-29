# Fix P0 — thong-tac-cong-24-7-quang-ninh — 2026-06-12

URL: https://thongtaccongquangninh.com/thong-tac-cong-24-7-quang-ninh/
Post ID: 2782

## Đã sửa live

- Đổi title sang: `Thông Tắc Cống 24/7 Quảng Ninh: Gọi Thợ Xử Lý Ngay Trong Đêm` (60 ký tự).
- Đổi meta description sang 150 ký tự, có hotline `0963.953.533`.
- Đổi H2 đầu tiên thành `Nguyên Nhân Cống Tắc Thường Xảy Ra Ban Đêm`.
- Xóa block biên tập bị lộ public: `Gợi ý ảnh`, `Internal Links`, `External Link`, `Checklist Rank Math`, `Điểm ước tính`.
- Xóa từ cấm `uy tín` trong phần public.
- Thêm nội dung thật để bù phần rác bị xóa: dấu hiệu cần gọi thợ 24/7 và cách hạn chế cống tắc lại.
- Thêm `Service` JSON-LD khớp dịch vụ 24/7.
- Thay ảnh trùng `thong-tac-cong-24-7-quang-ninh-02.webp` bằng ảnh máy lò xo `thong-tac-cong-gieng-day-may-lo-xo-03.webp`.

## Backup

- `backups/live-audit-fix-2026-06-12/post-2782-before.json`
- `backups/live-audit-fix-2026-06-12/post-2782-before-content.html`
- `backups/live-audit-fix-2026-06-12/post-2782-after-preview.html`
- `backups/live-audit-fix-2026-06-12/ttc-24-7-after.html`

## Kết quả audit sau sửa

- Trước sửa: score 70, severity HIGH.
- Sau sửa: score 100, severity PASS.
- Word count live: 2899.
- Images: 3, không còn issue.
- Schema: có `Service`, không còn `MISSING_SERVICE`.
- Required H2: đủ.
- Forbidden words: không còn.

## Audit ảnh sau sửa

- Trước: `pagesWithIssues=3`, `samePageDuplicatePages=2`.
- Sau: `pagesWithIssues=2`, `samePageDuplicatePages=1`.
- URL này không còn nằm trong danh sách Pages Needing Action.

## Lệnh đã chạy

- `node --check .\tools\fix_ttc_24_7_p0.mjs`
- `node .\tools\fix_ttc_24_7_p0.mjs`
- `node .\tools\fix_ttc_24_7_p0.mjs --write`
- Public HTML verify bằng cache-buster `?nowprocket=1&codex=afterfix24`
- `node .\tools\audit_seo_full.mjs --limit 90 --no-csv`
- `python .\tools\audit_unique_wp_images.py`
