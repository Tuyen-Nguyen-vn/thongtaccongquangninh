# Trạng thái SEO - 2026-05-12

## Tình hình hiện tại

- Bộ workflow dự án đã được chuẩn hóa xong cho `D:\.thongtaccongquangninh`.
- `Makefile` đã có target `setup`, `doctor`, `check`.
- `install.sh` và `install.ps1` đã sẵn sàng để cài tool + tạo alias/profile + chạy doctor.
- `make doctor` đã chạy trong dự án và báo thiếu một số tool nền trên máy: `rg`, `fzf`, `Docker`.
- Đã sửa lỗi line ending `bash\r` trong script workflow, vì file ban đầu có CRLF.

## Trạng thái dự án SEO / nội dung

- 6 trang dịch vụ chính đã được rewrite xong và live theo chuỗi NLP rewrite.
- Draft Bãi Cháy đã có image package, đã upload ảnh WebP, hiện đang ở trạng thái `draft` chờ quyết định public.
- Các draft khác vẫn còn trong hàng đợi ảnh SEO / review.
- File trạng thái cũ gần nhất là `SEO_STATUS_2026-05-10.md`; file này bổ sung thêm trạng thái workflow và kiểm tra môi trường.

## Việc vừa làm

- Nối workflow cài đặt và doctor vào đúng dự án Quảng Ninh.
- Chuẩn hóa alias terminal cho bash.
- Tạo `install.ps1` để Windows PowerShell cài tool và tạo profile.
- Chạy `make doctor` để xác nhận môi trường thực tế.
- Fix publish page ID `383` (`/thong-tac-cong-nha-hang-ha-long/`) từ file `rewrite_page383.html` bằng WordPress REST trên máy này, sau khi môi trường khác báo Cloudflare/TLS chặn.
- Bổ sung SEO cho page `383`: nội dung lên khoảng 2.589 từ, meta description 158 ký tự có hotline, Rank Math meta cập nhật OK, audit live đạt 95/100.
- Thay favicon mới theo ảnh Tuyền gửi: giữ nguyên canvas `1536x1024`, nền trong suốt, nén PNG không đổi pixel, đưa vào plugin `TTCQN Favicon Override 20260512`.
- Đã xóa 5 media favicon cũ qua MCP và chuyển favicon cũ trong workspace vào `backups/favicon-old-2026-05-12`; live `/bang-gia/` và `/lien-he/` chỉ còn trỏ tới favicon mới, không còn link `android-chrome`/`apple-touch-icon` cũ.

## Ghi chú kỹ thuật

- Các file shell đã được chuẩn hóa line ending về Unix để tránh lỗi `bash\r` khi chạy trên WSL/Linux.
- `doctor` hiện chỉ là kiểm tra môi trường, chưa đụng vào publish live hay dữ liệu SEO nội dung.
- Nếu cài thêm `ripgrep`, `fzf` và `Docker`, workflow sẽ đầy đủ hơn.
- Page `383` đã có backup tại `backups/page-383-before-seo-refine-2026-05-12T14-21-50-389Z.json` và report tại `WORDPRESS_REWRITE_PAGE_383_NHA_HANG_HA_LONG_2026-05-12.json`.
- Favicon report: `WORDPRESS_FAVICON_20260512_PLUGIN_UPLOAD_2026-05-12.json`, `WORDPRESS_FAVICON_CLEANUP_2026-05-12.json`. Plugin favicon cũ bị host chặn deactivate do lỗi LiteSpeed, nhưng frontend đang được plugin mới ghi đè sạch.

## Việc tiếp theo

- Chọn 1 task SEO/nội dung cụ thể còn dang dở để xử lý tiếp.
- Ưu tiên các draft đã gần xong ảnh SEO hoặc cần public/review.
