# P1 On-page Cleanup Batch — 2026-06-03

## Phạm vi đã xử lý
- Sửa các lỗi P1 có thể vá hẹp trên live: title/meta quá dài hoặc quá ngắn, nhiều H1, thiếu H2 `Nguyên nhân`, thiếu H2 `NAP / Liên hệ`, metadata SEO bị lộ trong nội dung, từ cấm.
- Không đổi slug trong batch này để tránh phát sinh redirect/permalink mới.
- Không sửa ảnh, không publish nội dung mới.

## Thay đổi live
| URL | Score trước | Score sau | Việc đã làm |
|---|---:|---:|---|
| `/chi-phi-hut-be-phot-quang-ninh/` | 89 | 100 | Tách title/meta/H1 khỏi `/bang-gia-hut-be-phot-quang-ninh-2026/`, cập nhật Rank Math, giữ canonical self. |
| `/thong-tac-bon-cau-nha-dan-quang-ninh-2026/` | 56 | 86 | Gỡ block `Thông Tin SEO`, bỏ metadata rò frontend, sửa title/meta, đưa về 1 H1, thêm H2 `Nguyên nhân` và `NAP liên hệ`, cập nhật Rank Math. |
| `/thong-tac-bon-cau-khong-duc-pha-quang-ninh/` | 59 | 89 | Gỡ block `Thông Tin SEO`, bỏ metadata rò frontend, sửa title/meta, đưa về 1 H1, thêm H2 `Nguyên nhân`, bỏ từ cấm `chuyên nghiệp`, cập nhật Rank Math. |
| `/hut-be-phot-khan-cap-quang-ninh-2026/` | 62 | 89 | Gỡ block `Thông Tin SEO`, bỏ metadata rò frontend, sửa title/meta, đưa về 1 H1, thêm H2 `Nguyên nhân`, bỏ từ cấm `uy tín`, cập nhật Rank Math. |
| `/thong-tac-bon-cau-khach-san-quang-ninh-2026/` | 64 | 86 | Sửa title/H1/meta, thêm H2 `Nguyên nhân` và `NAP liên hệ`, cập nhật Rank Math. |

## Sửa global renderer
- File: `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- File: `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`
- Bump plugin: `2026.06.03.1`
- Đổi alt logo header từ cụm có từ cấm sang: `Môi Trường Đô Thị Số 1 Quảng Ninh - hút bể phốt thông tắc cống 24/7`
- Upload plugin: `WORDPRESS_HOME_EMERGENCY_RENDERER_PLUGIN_UPLOAD_2026-05-31.json`

## Backup
- `seo-revisions/wp-before-chi-phi-title-dedupe-20260603T061000Z`
- `seo-revisions/wp-before-p1-bon-cau-nha-dan-20260603T062000Z`
- `seo-revisions/wp-before-p1-bon-cau-khong-duc-pha-20260603T063000Z`
- `seo-revisions/wp-before-p1-hut-be-phot-khan-cap-20260603T064000Z`
- `seo-revisions/wp-before-p1-bon-cau-khach-san-20260603T065000Z`
- `reports/backups/home-renderer-logo-alt-2026-06-03`

## Kiểm tra đã chạy
- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`
- `node tools/upload_home_emergency_renderer_plugin.mjs`
- Public verify từng URL bằng `?nowprocket=1&codex=...`
- `node tools/audit_seo_full.mjs --no-csv`

## Kết quả audit cuối
- Duplicate title: `0`
- Broken internal link: `0`
- URL audit: `76`
- Top issue còn lại: `MISSING_SERVICE` 20 URL, `MISSING_H2:Nguyên nhân` 12 URL, `SLUG_HAS_DATE_OR_LONG_NUMBER` 7 URL.
- URL thấp nhất tiếp theo tai thoi diem batch nay: `/gia-hut-be-phot-quang-ninh-2026/` score `67`.

## Cap nhat sau batch tiep theo
- `/gia-hut-be-phot-quang-ninh-2026/` da duoc xu ly trong `reports/p1-gia-bang-gia-duplicate-cleanup-2026-06-03.md`, score sau audit la `86`.
- URL duplicate auto `/bang-gia-hut-be-phot-quang-ninh-2026-3/` da duoc dua ve draft va 301 ve `/bang-gia-hut-be-phot-quang-ninh-2026/`.
- URL thap nhat tiep theo theo audit moi: `/hut-be-phot-24-7-quang-ninh-2026/` score `70`.
