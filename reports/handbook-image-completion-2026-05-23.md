# Hoàn tất ảnh Cẩm nang 2026-05-23

Thời gian kiểm: 2026-05-23 00:07 +07

## Phạm vi

- 23 bài Cẩm nang public qua WordPress REST.
- Page đích ngoại lệ: `chi-phi-hut-be-phot-quang-ninh-2` vì post gốc `chi-phi-hut-be-phot-quang-ninh` đang 301 sang URL này.
- Trang archive `/blog/`.

## Backup

- `backups/handbook-featured-before-2026-05-22/`
- `backups/handbook-image-content-before-2026-05-22/`
- `backups/handbook-under3-images-before-2026-05-22/`
- `backups/handbook-faq-images-before-2026-05-23/`

## Đã sửa live

- Gắn `featured_media` cho post gốc `chi-phi-hut-be-phot-quang-ninh` và page đích `chi-phi-hut-be-phot-quang-ninh-2`: media ID 2100.
- Sửa caption media/content của nhóm ảnh chi phí hút bể phốt, bỏ cụm `Ảnh thực tế`.
- Thêm ảnh thứ 3 cho post gốc `chi-phi-hut-be-phot-quang-ninh`: media ID 2190.
- Bổ sung ảnh để đủ tối thiểu 3 ảnh nội dung cho 6 bài:
  - `thong-tac-cong-cao-xanh-2`: thêm media 1667, 1668.
  - `thong-tac-cong-hong-gai-2`: thêm media 2174.
  - `mui-hoi-cong-nguyen-nhan-xu-ly-4`: thêm media 2176.
  - `hoa-chat-tu-thong-cong-3`: thêm media 2178.
  - `chu-ky-hut-be-phot-3`: thêm media 2180.
  - `bon-cau-rut-cham-nguyen-nhan-3`: thêm media 2189.
- Sửa 5 ảnh raw trong bài `cau-hoi-thuong-gap-thong-tac-cong`: đổi `../image-briefs/...` sang URL media WordPress thật, thêm class `wp-image-*`, giữ alt mô tả trực tiếp.

## Kết quả audit 23 bài

| Hạng mục | Kết quả |
|---|---:|
| Bài Cẩm nang kiểm | 23 |
| Thiếu featured image | 0 |
| Bài dưới 3 ảnh nội dung | 0 |
| Ảnh nội dung thiếu alt | 0 |
| Ảnh nội dung dùng relative src | 0 |
| Featured image thiếu alt | 0 |
| Caption/alt còn `ảnh minh họa` hoặc `ảnh thực tế` | 0 |
| URL live không 200 | 0 |
| Thiếu OG image | 0 |
| Ảnh nội dung 404 | 0 |

## Kiểm archive và unique image

- `/blog/`: HTTP 200, ảnh upload kiểm được 4 URL, 0 ảnh 404, không có cụm `ảnh minh họa/ảnh thực tế`.
- `/cau-hoi-thuong-gap-thong-tac-cong/`: HTTP 200, ảnh upload kiểm được 6 URL, 0 ảnh 404, không có cụm cấm.
- `/chi-phi-hut-be-phot-quang-ninh-2/`: HTTP 200, ảnh upload kiểm được 4 URL, 0 ảnh 404, không có cụm cấm.
- `python3 tools/audit_unique_wp_images.py --no-hash`: 65 nội dung, 0 trang lỗi, 0 trang dưới 3 ảnh, 0 trang trùng ảnh trong cùng trang.

## File bằng chứng

- `WORDPRESS_HANDBOOK_FEATURED_UPDATE_2026-05-22.json`
- `WORDPRESS_HANDBOOK_IMAGE_CONTENT_UPDATE_2026-05-22.json`
- `WORDPRESS_HANDBOOK_UNDER3_IMAGES_UPDATE_2026-05-22.json`
- `WORDPRESS_HANDBOOK_FAQ_IMAGE_FIX_2026-05-23.json`
- `reports/handbook-image-current-audit-2026-05-22.json`
- `reports/wp-unique-image-audit-2026-05-23T00-05-59.json`
- `reports/wp-unique-image-audit-2026-05-23T00-05-59.md`

## Việc tiếp theo

Rà title/meta của các bài Cẩm nang mới sửa ảnh để đảm bảo ảnh đại diện và `og:image` khớp intent tìm kiếm từng bài.
