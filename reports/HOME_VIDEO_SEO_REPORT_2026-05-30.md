# Báo cáo triển khai video SEO trang chủ - 2026-05-30

## File đã sửa

- `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`

## Asset đã tạo

- `tools/wp-plugins/ttcqn-home-emergency-renderer/assets/video/video-thi-cong-moi-truong-do-thi-so-1-ha-long.mp4`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/assets/video/video-thi-cong-moi-truong-do-thi-so-1-ha-long-poster.jpg`

## Tối ưu video

- File gốc: 30 MB, HEVC, 720x1280, 31.63 giây.
- File xuất web: 5.8 MB, MP4 H.264/AAC, 720x1280, 31.63 giây.
- Poster: 93 KB, JPG, 720x1280.
- Metadata địa phương: Hạ Long, Quảng Ninh - `20.9517, 107.0742`.
- Xóa metadata cũ bằng `-map_metadata -1`, sau đó gắn lại title/comment/location sạch cho file xuất web.

## Triển khai trên website

- Thêm section `#video-thuc-te` dưới section giới thiệu công ty và trước section dịch vụ.
- Dùng thẻ `<video controls playsinline preload="metadata">`.
- Không autoplay để tránh làm nặng trang.
- Thêm CTA gọi `tel:0963953533` và link bảng giá `/bang-gia/`.

## Schema SEO

- Thêm `VideoObject` vào JSON-LD trang chủ.
- Thuộc tính có đủ: `name`, `description`, `thumbnailUrl`, `uploadDate`, `duration`, `contentUrl`, `url`, `publisher`, `mainEntityOfPage`.
- Gỡ tín hiệu video cũ của Rank Math trỏ YouTube `vcVjDZLV_O0` khỏi output trang chủ.
- Gỡ `og:video` cũ để tránh Google nhận nhầm video chính.

## Kiểm tra

- `php -l` passed cho plugin và template.
- Video URL live trả HTTP 200, `content-type: video/mp4`, `content-length: 5775525`.
- Poster URL live trả HTTP 200, `content-type: image/jpeg`, `content-length: 92618`.
- HTML live có marker `2026.05.30.5; direct-template`.
- HTML live có section video, poster, MP4 và `VideoObject`.
- Không còn `href=""`, `href="#"`, `og:video` cũ hoặc YouTube video cũ trong output trang chủ.
- JSON-LD live parse được 2 block, chỉ còn 1 `VideoObject`.
- Browser check desktop/mobile: video render được, không tràn ngang, section tồn tại.

## Bằng chứng

- `reports/home-video-seo-live-2026-05-30-v2.html`
- `reports/home-video-seo-browser-verify-2026-05-30.json`
- `reports/home-video-seo-mobile-network-2026-05-30.json`
- `reports/home-video-seo-desktop-2026-05-30.png`
- `reports/home-video-seo-mobile-2026-05-30.png`
