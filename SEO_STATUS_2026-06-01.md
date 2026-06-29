# Trạng thái SEO - 2026-06-01

## Tình hình hiện tại

- Đã cập nhật skill `google-seo-foundation` theo Google Search Central updates 2026.
- Đã audit 38 URL local quan trọng theo các điểm mới: AI features, spam policy, Googlebot byte limits, preferred image, FAQ rich result deprecation, robots meta, snippet deep links.
- Đã xử lý phần ảnh SEO còn thiếu cho 2 bài thông tắc bồn cầu khẩn cấp Quảng Ninh.

## Việc vừa làm

- Tạo tool reusable `tools/insert_ready_image_packages_to_wp.mjs` để chèn ảnh từ `image-package.json` vào bài WordPress live theo REST.
- Chạy dry-run trước khi sửa live:
  - Post `2377`: `/thong-tac-bon-cau-khan-cap-quang-ninh/`, từ 0 lên 3 ảnh.
  - Post `2378`: `/thong-tac-bon-cau-khan-cap-quang-ninh-2/`, từ 0 lên 3 ảnh.
- Backup trước khi cập nhật live:
  - `seo-revisions/wp-before-insert-ready-image-packages-2026-06-01T10-26-11-338Z/posts-2377-thong-tac-bon-cau-khan-cap-quang-ninh.json`
  - `seo-revisions/wp-before-insert-ready-image-packages-2026-06-01T10-26-11-338Z/posts-2378-thong-tac-bon-cau-khan-cap-quang-ninh-2.json`
- Upload 6 ảnh WebP vào WordPress Media Library:
  - Media ID `2422`, `2423`, `2424` cho post `2377`.
  - Media ID `2426`, `2427`, `2428` cho post `2378`.
- Public verify bằng cache-buster:
  - `/thong-tac-bon-cau-khan-cap-quang-ninh/`: HTTP 200, 9 ảnh public, đủ 3 file mới.
  - `/thong-tac-bon-cau-khan-cap-quang-ninh-2/`: HTTP 200, 9 ảnh public, đủ 3 file mới.

## Báo cáo / bằng chứng

- Report apply live: `WORDPRESS_INSERT_READY_IMAGE_PACKAGES_2026-06-01T10-26-11-338Z.json`
- Image gate post `2377`: `reports/image-gate-2026-06-01T10-26-56-442Z.json`
- Image gate post `2378`: `reports/image-gate-2026-06-01T10-26-56-462Z.json`
- Audit ảnh toàn site sau khi chèn:
  - JSON: `reports/wp-unique-image-audit-2026-06-01T17-26-56.json`
  - Markdown: `reports/wp-unique-image-audit-2026-06-01T17-26-56.md`

## Kết quả audit sau cùng

- `totalContent`: 73
- `pagesWithIssues`: 0
- `samePageDuplicatePages`: 0
- `pagesUnderThreeImages`: 0
- `globalReuseGroups`: 8

## Việc tiếp theo

- Audit 8 nhóm ảnh đang reuse toàn site để quyết định nhóm nào cần tạo biến thể riêng.
