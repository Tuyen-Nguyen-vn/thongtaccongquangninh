# Báo cáo sửa ảnh SEO live — 2026-06-12

## Phạm vi
- Trang sửa live: `https://thongtaccongquangninh.com/dieu-khoan-dich-vu/`
- Bài sửa live: `https://thongtaccongquangninh.com/thong-tac-cong-bai-chay/`
- Script sử dụng: `tools/fix_remaining_image_issues_2026_06_12.mjs`

## Thay đổi đã ghi live
- `/dieu-khoan-dich-vu/`: thêm 3 ảnh dịch vụ đúng ngữ cảnh, có `alt` và `figcaption`.
- `/thong-tac-cong-bai-chay/`: thay ảnh `thong-tac-cong-bai-chay-kiem-tra-ho-ga-02-1.webp` vì trùng pixel với ảnh đầu bài.
- Ảnh thay thế: `thong-tac-cong-gieng-day-tho-xu-ly-02.webp`, dùng alt/caption theo bối cảnh Hạ Long - Bãi Cháy, không tự nhận sai địa điểm.

## Backup và bằng chứng
- Backup REST/preview nằm trong `backups/live-audit-fix-2026-06-12/`.
- HTML public sau sửa:
  - `backups/live-audit-fix-2026-06-12/dieu-khoan-after-imagefix.html`
  - `backups/live-audit-fix-2026-06-12/bai-chay-after-imagefix.html`

## Kiểm tra sau sửa
- `node --check tools/fix_remaining_image_issues_2026_06_12.mjs`: OK.
- Dry-run trước khi ghi live: OK, trang điều khoản từ 0 lên 3 ảnh, bài Bãi Cháy bỏ ảnh trùng và giữ 3 ảnh.
- Public HTML có cache-buster: cả 2 URL trả HTTP 200.
- `python tools/audit_unique_wp_images.py`:
  - Total content: 87
  - Pages with same-page duplicate/suspicious images: 0
  - Pages under 3 content images: 0
- `node tools/audit_seo_full.mjs --limit 90 --no-csv`:
  - URL audit: 87
  - PASS: 29
  - FAIL: 0
  - WARN: 58
  - Broken internal links: 0
