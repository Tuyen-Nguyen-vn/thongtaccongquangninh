# Báo cáo duyệt SEO và chuẩn hóa URL public - 2026-06-03

## Kết quả

- Đã kiểm tra nhóm bài SEO chưa public/đang nằm ở draft legacy.
- Không public thêm bản trùng vì 13/13 bài SEO đạt gate trước đó đã có route live indexable.
- Đã chuẩn hóa 12 URL đang public từ dạng hậu tố `-2`, `-3`, `-4` về slug sạch.
- Đã giữ redirect 301 từ URL hậu tố cũ về URL sạch.
- Đã sửa JSON-LD/content để schema không còn trỏ về URL hậu tố.

## URL đã chuẩn hóa

| URL sạch | URL cũ |
|---|---|
| https://thongtaccongquangninh.com/bon-cau-rut-cham-nguyen-nhan/ | https://thongtaccongquangninh.com/bon-cau-rut-cham-nguyen-nhan-3/ |
| https://thongtaccongquangninh.com/chi-phi-hut-be-phot-quang-ninh/ | https://thongtaccongquangninh.com/chi-phi-hut-be-phot-quang-ninh-2/ |
| https://thongtaccongquangninh.com/chu-ky-hut-be-phot/ | https://thongtaccongquangninh.com/chu-ky-hut-be-phot-3/ |
| https://thongtaccongquangninh.com/hoa-chat-tu-thong-cong/ | https://thongtaccongquangninh.com/hoa-chat-tu-thong-cong-3/ |
| https://thongtaccongquangninh.com/mui-hoi-cong-nguyen-nhan-xu-ly/ | https://thongtaccongquangninh.com/mui-hoi-cong-nguyen-nhan-xu-ly-4/ |
| https://thongtaccongquangninh.com/hut-be-phot-ba-che/ | https://thongtaccongquangninh.com/hut-be-phot-ba-che-2/ |
| https://thongtaccongquangninh.com/hut-be-phot-binh-lieu/ | https://thongtaccongquangninh.com/hut-be-phot-binh-lieu-2/ |
| https://thongtaccongquangninh.com/hut-be-phot-co-to/ | https://thongtaccongquangninh.com/hut-be-phot-co-to-2/ |
| https://thongtaccongquangninh.com/hut-be-phot-dam-ha/ | https://thongtaccongquangninh.com/hut-be-phot-dam-ha-2/ |
| https://thongtaccongquangninh.com/hut-be-phot-hai-ha/ | https://thongtaccongquangninh.com/hut-be-phot-hai-ha-2/ |
| https://thongtaccongquangninh.com/hut-be-phot-tien-yen/ | https://thongtaccongquangninh.com/hut-be-phot-tien-yen-2/ |
| https://thongtaccongquangninh.com/thong-tac-cong-hong-gai/ | https://thongtaccongquangninh.com/thong-tac-cong-hong-gai-2/ |

## Thay đổi đã áp dụng

- Chuyển slug draft/blocker sang dạng `draft-legacy-<id>-<slug>` để nhường slug sạch cho bản public.
- Đổi slug public của 12 item về slug sạch.
- Sửa plugin `ttcqn-seo-cleanup-redirects` lên version `2026.06.03.3`.
- Đảo redirect bài chi phí: `chi-phi-hut-be-phot-quang-ninh-2` về `chi-phi-hut-be-phot-quang-ninh`.
- Thay 25 URL hậu tố cũ trong content/schema của 12 bài bằng URL sạch.

## Backup và báo cáo kỹ thuật

- Backup trước đổi slug: `seo-revisions/wp-before-slug-normalize-2026-06-03T05-46-26-549Z/`
- Backup trước sửa content/schema: `seo-revisions/wp-before-schema-url-normalize-2026-06-03T05-58-24-878Z/`
- Apply đổi slug: `reports/slug-normalize-2026-06-03T05-46-26-549Z.md`
- Apply sửa schema URL: `reports/schema-url-normalize-2026-06-03T05-58-24-878Z.md`
- Verify live cuối: `reports/normalized-suffix-verify-2026-06-03T05-59-45-651Z.md`
- Upload plugin redirect: `WORDPRESS_SEO_CLEANUP_REDIRECTS_UPLOAD_2026-05-20.json`

## Verification

- `php -l tools/wp-plugins/ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects.php`: PASS.
- `node --check tools/normalize_suffix_slugs_2026_06_03.mjs`: PASS.
- `node --check tools/normalize_suffix_schema_urls_2026_06_03.mjs`: PASS.
- `node --check tools/verify_normalized_suffix_urls_2026_06_03.mjs`: PASS.
- `node tools/verify_normalized_suffix_urls_2026_06_03.mjs`: 12/12 PASS.
- `node tools/collect_wp_url_audit_list.mjs`: duplicateGroups 0, sitemap 88 URL, publish 87, draft 1.
- `python3 tools/audit_unique_wp_images.py --no-hash`: nhóm bài đã chuẩn hóa không thiếu ảnh; chỉ còn 2 trang pháp lý thiếu ảnh.

## Tồn đọng ngoài scope

- Title còn giống nhẹ: `gioi-thieu` với `lien-he`.
- Title còn giống nhẹ: `thong-tac-bon-cau-dong-trieu` với `thong-tac-bon-cau-quang-yen`.
- Trang pháp lý `dieu-khoan-dich-vu` và `chinh-sach-bao-mat` chưa có ảnh nội dung.

## Trạng thái

PASS. Nhóm bài SEO đã duyệt không tạo thêm duplicate public, các URL hậu tố cũ đã được chuẩn hóa về URL sạch và verify live xong.
