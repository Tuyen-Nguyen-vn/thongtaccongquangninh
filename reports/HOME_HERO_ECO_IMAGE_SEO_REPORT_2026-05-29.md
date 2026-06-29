# Báo cáo tối ưu hero + ảnh SEO trang chủ

Ngày kiểm tra: 2026-05-29

## Phạm vi đã làm

- Cập nhật hero trang chủ trong plugin `ttcqn-home-emergency-renderer` lên version `2026.05.29.15`.
- Chuyển hero sang nền sáng/eco, giữ form nhận gọi lại và CTA hiện có.
- Tối ưu responsive desktop/mobile, không còn ảnh nhân vật cắt rời trong hero.
- Tạo bộ ảnh SEO từ thư mục `D:\Downloads\CV Hồ Sơ Năng Lực (Template)\uploads`.
- Re-encode ảnh để xóa metadata cũ và dấu vết phần mềm/AI trong metadata.
- Gắn GPS Hạ Long: `20.9515, 107.0784`.

## File đã sửa

- `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`

## Ảnh đã xuất

- `tools/wp-plugins/ttcqn-home-emergency-renderer/assets/hero-eco/hero-eco-xe-hut-be-phot-thong-tac-cong-ha-long.jpg`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/assets/hero-eco/hero-eco-xe-hut-be-phot-thong-tac-cong-ha-long-mobile.jpg`
- `Ảnh Đã Xử Lý SEO/hero-eco-home-20260529/*.jpg`

## Metadata ảnh SEO

- Title, Description, Keywords, Subject đã gắn theo ngữ cảnh Hạ Long/Quảng Ninh.
- Artist: `Môi Trường Đô Thị Số 1 Quảng Ninh`
- Copyright: `© 2026 thongtaccongquangninh.com`
- GPS: Hạ Long `20 deg 57' 5.40" N`, `107 deg 4' 42.24" E`
- Không phát hiện các field: `Software`, `CreatorTool`, `ContainsAiGeneratedContent`, `DigitalSourceType` trên ảnh hero live.

## Kiểm tra live

- Trang chủ trả marker: `2026.05.29.15; direct-template`
- Ảnh hero live HTTP 200.
- Desktop screenshot: `reports/home-hero-eco-desktop-2026-05-29.png`
- Mobile screenshot: `reports/home-hero-eco-mobile-2026-05-29.png`
- Browser verify: không lỗi console, không horizontal overflow.
- Link audit nhanh: không có `href=""`, không có `href="#"`.

## Report kỹ thuật

- Upload plugin: `WORDPRESS_HOME_EMERGENCY_RENDERER_PLUGIN_UPLOAD_2026-05-29.json`
- Browser verify: `reports/home-hero-eco-browser-verify-2026-05-29.json`
- Metadata CSV: `reports/hero-eco-image-seo-metadata-2026-05-29.csv`
- Backup trước sửa: `backups/home-eco-hero-before-20260529-180947`
