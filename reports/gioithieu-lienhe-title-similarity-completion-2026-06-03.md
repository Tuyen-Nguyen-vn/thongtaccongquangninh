# Báo cáo sửa title giống nhau: Giới thiệu / Liên hệ - 2026-06-03

## Kết quả

- Đã xử lý cặp title giống nhẹ:
  - `https://thongtaccongquangninh.com/gioi-thieu/`
  - `https://thongtaccongquangninh.com/lien-he/`
- Đã tách intent:
  - `gioi-thieu`: trang giới thiệu thương hiệu/công ty.
  - `lien-he`: trang liên hệ theo nhu cầu dịch vụ hút bể phốt, thông tắc cống.
- Đã sửa lỗi meta description trang Liên hệ bị cắt cụt ở chữ `hoặ`.

## Nội dung đã áp dụng

| URL | Title mới | Meta length |
|---|---|---:|
| `/gioi-thieu/` | Hồ sơ Môi Trường Đô Thị Số 1 Quảng Ninh và đội thông hút 24/7 | 151 |
| `/lien-he/` | Liên hệ đặt lịch hút bể phốt, thông tắc cống Quảng Ninh 24/7 | 153 |

## Thay đổi kỹ thuật

- Cập nhật WordPress page title/excerpt cho page 62 và 63.
- Cập nhật Rank Math title/description/focus keyword cho page 62 và 63.
- Cập nhật plugin `ttcqn-seo-cleanup-redirects` để title override public không kéo về mẫu cũ.
- Đóng gói và upload lại plugin SEO cleanup.

## Backup

- `seo-revisions/wp-before-gioithieu-lienhe-title-2026-06-03T06-22-06-479Z/`

## Báo cáo kỹ thuật

- Apply WordPress/Rank Math: `reports/gioithieu-lienhe-title-fix-2026-06-03T06-22-06-479Z.md`
- Upload plugin: `WORDPRESS_SEO_CLEANUP_REDIRECTS_UPLOAD_2026-06-03T06-23-21-480Z.json`
- Public verifier sau upload: `reports/gioithieu-lienhe-title-fix-2026-06-03T06-23-39-652Z.md`
- Audit URL toàn site: `WP_URL_AUDIT_REPORT_2026-06-03.md`

## Verification

- `php -l tools/wp-plugins/ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects.php`: PASS.
- `node --check tools/fix_gioi_thieu_lien_he_title_similarity_2026_06_03.mjs`: PASS.
- Dry-run: đúng 2 page.
- Apply: content/excerpt 2/2, Rank Math 2/2.
- Plugin upload: success.
- Public `/gioi-thieu/`: HTTP 200, canonical self, robots index, 1 H1, title 61 ký tự, meta 151 ký tự.
- Public `/lien-he/`: HTTP 200, canonical self, robots index, 1 H1, title 60 ký tự, meta 153 ký tự, ContactPage schema còn hợp lệ.
- Public verifier: `publicVerified = 2/2`, `titleTokenSimilarity = 0.333`.
- Re-audit URL: `duplicateGroups = 0`, `similarPairs = 0`.

## Trạng thái

PASS. Toàn bộ cảnh báo title trùng/quá giống trong audit URL hiện đã sạch.
