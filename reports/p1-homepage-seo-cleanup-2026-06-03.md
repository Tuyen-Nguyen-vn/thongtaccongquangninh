# P1 Homepage SEO cleanup - 2026-06-03

## Muc tieu

- URL: `https://thongtaccongquangninh.com/`
- Slug audit: `trang-chu`
- Score truoc: `80`
- Loi chinh: `META_SHORT(143)`, `IMG:EMPTY_ALT(8)`, `IMG:ALT_NO_SERVICE_OR_LOCATION(12)`, `MISSING_BREADCRUMBLIST`, `WORD_TOO_LONG(3658)`.

## Da lam

- Backup zip plugin cu: `backups/homepage-seo-2026-06-03/ttcqn-home-emergency-renderer.before-homepage-seo.zip`.
- Cap nhat `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`.
  - Bump renderer len `2026.06.03.6`.
  - Them meta description homepage 151 ky tu qua Rank Math filters.
  - Them `BreadcrumbList` vao home schema graph.
- Cap nhat `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`.
  - Chuan hoa alt icon, quy trinh, CTA du an, cam nang, testimonial, avatar doi ngu.
  - Sua link cam nang Hong Gai tu `/thong-tac-cong-hong-gai-2/` ve `/thong-tac-cong-hong-gai/`.
- Dong goi va upload plugin bang `node tools/upload_home_emergency_renderer_plugin.mjs`.

## Kiem tra

- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`: PASS.
- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`: PASS.
- Upload plugin: `uploadSuccess=true`, `activeConfirmed=true`.
- Public verify cache-buster:
  - HTTP `200`.
  - Renderer: `2026.06.03.6; direct-template`.
  - Meta description: 151 ky tu.
  - `BreadcrumbList`: co.
  - Loi alt anh trong renderer: `0`.
- Full audit: `node tools/audit_seo_full.mjs --no-csv`.
  - Homepage score sau: `97`.
  - Image issues: `0`.
  - Schema co `BreadcrumbList`.
  - Con lai: `WORD_TOO_LONG(3658)`.

## Ket qua

- Trang chu da tang score `80 -> 97`.
- Khong rut gon noi dung/layout homepage trong batch nay de tranh drift giao dien.
- URL thap nhat tiep theo: `/thong-tac-bon-cau-khan-cap-quang-ninh/` score `81`.
