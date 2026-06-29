# Trạng thái SEO - 2026-05-10

## Draft Bãi Cháy

- File local đã sửa: `content-drafts\thong-tac-cong-bai-chay-rankmath-draft.md`.
- Đã bỏ toàn bộ từ cấm: `chuyên nghiệp`, `uy tín`, `hàng đầu`, `tận tâm`.
- Image package đã pass: `image-briefs\thong-tac-cong-bai-chay-image-package.json`.
- Đã upload 3 ảnh WebP lên WordPress Media Library:
  - Media ID 1290: `thong-tac-cong-bai-chay-anh-dau-bai.webp`.
  - Media ID 1291: `thong-tac-cong-bai-chay-case-study.webp`.
  - Media ID 1292: `thong-tac-cong-bai-chay-quy-trinh-thi-cong.webp`.
- Đã cập nhật WordPress draft/post ID 1288, status hiện tại: `draft`.
- Draft WordPress hiện có 4 ảnh trong content, 3 caption, featured media ID 1290.
- URL public `https://thongtaccongquangninh.com/thong-tac-cong-bai-chay/` vẫn 404 vì bài đang draft, chưa public.

## Tool đã sửa

- `tools\check_image_seo_gate.mjs`: đổi từ gate manifest cũ sang kiểm package thật bằng `image_seo_gate.mjs`.
- `tools\collect_wp_url_audit_list.mjs`: report audit URL tự đóng dấu ngày hiện tại thay vì cố định `2026-05-06`.
- `tools\push_image_package_to_wp_draft.mjs`: helper mới để upload image package và gắn ảnh vào WordPress draft.

## Báo cáo và backup

- Image gate report: `reports\image-gate-2026-05-10T12-50-39-020Z.json`.
- Backup trước khi gắn ảnh: `seo-revisions\wp-image-package-backup-2026-05-10\posts-1288-thong-tac-cong-bai-chay.json`.
- Report gắn ảnh WordPress: `WORDPRESS_PUSH_IMAGE_PACKAGE_2026-05-10.json`.
- Inventory đã refresh:
  - `wp-url-audit-list.csv`
  - `wp-url-audit-list.json`
  - `WP_URL_AUDIT_REPORT_2026-05-10.md`

## Test đã chạy

- `node --check tools\check_image_seo_gate.mjs`: OK.
- `node --check tools\image_seo_gate.mjs`: OK.
- `node --check tools\collect_wp_url_audit_list.mjs`: OK.
- `node --check tools\push_image_package_to_wp_draft.mjs`: OK sau khi sửa regex ảnh Markdown.
- `node tools\check_image_seo_gate.mjs content-drafts\thong-tac-cong-bai-chay-rankmath-draft.md`: pass, status `READY_FOR_REVIEW`, 3 ảnh.
- `python tools\seo_score.py content-drafts\thong-tac-cong-bai-chay-rankmath-draft.md "thông tắc cống Bãi Cháy"`: nội bộ 95/100, đạt.
- REST kiểm WordPress post ID 1288: status `draft`, không còn từ cấm, có 4 ảnh, 3 caption.
- Live URL `/thong-tac-cong-bai-chay/`: 404 đúng kỳ vọng vì chưa public.
- `node tools\collect_wp_url_audit_list.mjs`: OK, tổng 45 dòng, 44 URL public, 1 draft, 33 landing local SEO.

## Việc còn lại

- Chỉ public Bãi Cháy khi Tuyền duyệt rõ.
- Nếu public, cần chạy lệnh publish/update status, kiểm live frontend 200, kiểm sitemap/index, rồi submit Google Index.
