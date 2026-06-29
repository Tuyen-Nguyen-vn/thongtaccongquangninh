# Fix Cẩm nang trang chủ - 2026-05-22

## Đã sửa

- Sửa fallback ảnh trong `ttcqn-home-emergency-renderer` để không còn dùng URL upload 404:
  - URL cũ lỗi: `wp-content/uploads/2026/05/mac-dinh-thong-tac-quang-ninh.jpg`
  - Cách mới: dùng asset có sẵn trong plugin theo loại bài.
- Bài thông tắc cống dùng ảnh:
  - `assets/service-images/service-thong-tac-cong-quang-ninh-may-chuyen-dung.webp`
- Bài hút bể phốt dùng ảnh:
  - `assets/service-images/service-hut-be-phot-quang-ninh-xe-bon-chuyen-dung.webp`
- Alt fallback được rút gọn theo ảnh/dịch vụ, không dùng tiêu đề dài lặp thương hiệu.
- Excerpt được strip Markdown `**...**` trước khi cắt ngắn, tránh lộ dấu `**hotline**`.
- Bumped plugin version: `2026.05.22.3`.

## File đã sửa

- `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`

## Kiểm tra local

- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`: pass.
- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`: pass.
- `python3 tools/_pack_zips.py`: đã tạo lại zip plugin.

## Upload live

- Script: `node tools/upload_home_emergency_renderer_plugin.mjs`
- Kết quả:
  - `uploadSuccess`: true
  - `activeConfirmed`: true
  - `success`: true

## Re-audit live

URL kiểm:

- `https://thongtaccongquangninh.com/?nowprocket=1&audit_cam_nang_fix=<timestamp>`
- `https://thongtaccongquangninh.com/?nowprocket=1&audit_cam_nang_featured=<timestamp>`

Kết quả:

- Live marker: `ttcqn-home-emergency-renderer = 2026.05.22.3; direct-template`.
- Số thẻ Cẩm nang: 6.
- 6/6 link bài trả `200`.
- 6/6 ảnh Cẩm nang trả `200`.
- 0/6 excerpt còn Markdown `**...**`.
- 0/6 ảnh còn dùng fallback cũ `mac-dinh-thong-tac-quang-ninh.jpg`.

## Featured media đã gán

- Media ID `2196`: `service-thong-tac-cong-quang-ninh-may-chuyen-dung.webp`.
- Media ID `2197`: `service-hut-be-phot-quang-ninh-xe-bon-chuyen-dung.webp`.
- `thong-tac-cong-gieng-day-2`: `featured_media = 2196`.
- `thong-tac-cong-cao-xanh-2`: `featured_media = 2196`.
- `thong-tac-cong-bai-chay`: `featured_media = 2196`.
- `thong-tac-cong-hong-gai-2`: `featured_media = 2196`.
- `hut-be-phot-tien-yen-2`: `featured_media = 2197`.
- `hut-be-phot-hai-ha-2`: `featured_media = 2197`.

Báo cáo snapshot trước/sau:

- `reports/handbook-featured-media-fix-2026-05-22.json`

## Việc còn lại

- Intent Cẩm nang vẫn đang kéo một số bài dịch vụ/landing địa phương. Nếu muốn section thuần hướng dẫn, cần lọc lại query theo nhóm bài cẩm nang/hướng dẫn thay vì kéo bài mới nhất từ `blog,tin-tuc`.
