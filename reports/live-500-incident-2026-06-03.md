# Báo Cáo Sự Cố Live HTTP 500 - 2026-06-03

## Tóm tắt

Trong lúc thực hiện nhóm P0 sau audit Google Search Console, hệ thống WordPress live của `thongtaccongquangninh.com` đang trả **HTTP 500** trên frontend, REST API, MCP, sitemap, trang đăng nhập và wp-admin.

Do không thể backup, không thể đọc nội dung qua REST/MCP và không thể xác minh sau khi sửa, mọi thay đổi live P0 đã được dừng lại theo gate an toàn của dự án.

## Việc đã định làm

- Sửa tiêu đề trùng giữa 2 bài:
  - `2377` - `/thong-tac-bon-cau-khan-cap-quang-ninh/`
  - `2378` - `/thong-tac-bon-cau-khan-cap-quang-ninh-2/`
- Sửa internal link 404 trong bài:
  - `2412` - `/thong-tac-bon-cau-nha-hang-quang-ninh-2026/`
  - Link lỗi: `/thong-tac-cong-nha-hang-quang-ninh/`
  - Gợi ý đổi về: `/thong-tac-cong-nha-hang-ha-long/`
- Submit lại sitemap/recrawl các URL có rich result cũ trong GSC.

## Việc đã làm được

- Đã submit lại sitemap qua Google Search Console API:
  - `https://thongtaccongquangninh.com/sitemap_index.xml`
  - Report: `reports/search-console-sitemap-submit-2026-06-03T11-44-56.md`
  - Report JSON: `reports/search-console-sitemap-submit-2026-06-03T11-44-56.json`

Lưu ý: GSC API báo submit sitemap thành công, nhưng điều này không chứng minh WordPress đã phục hồi. Kiểm tra HTTP live vẫn đang lỗi 500.

## Bằng chứng HTTP live

Kết quả kiểm tra live:

| URL | HTTP |
|---|---:|
| `https://thongtaccongquangninh.com/` | 500 |
| `https://thongtaccongquangninh.com/wp-json/` | 500 |
| `https://thongtaccongquangninh.com/wp-json/wp/v2/posts?per_page=1` | 500 |
| `https://thongtaccongquangninh.com/wp-json/mcp` | 500 |
| `https://thongtaccongquangninh.com/wp-json/mcp/wp-mcp-ultimate` | 500 |
| `https://thongtaccongquangninh.com/sitemap_index.xml` | 500 |
| `https://thongtaccongquangninh.com/wp-login.php` | 500 |
| `https://thongtaccongquangninh.com/wp-admin/` | 500 |
| `https://thongtaccongquangninh.com/robots.txt` | 200 |

## Mốc thời gian

- `logs/uptime.log` ghi site còn **200 OK** lúc `2026-06-03 10:59:48`.
- Từ `2026-06-03 11:04:48`, uptime chuyển sang lỗi `Status=0 | OK=False` và tiếp tục lỗi đến ít nhất `11:44:48`.
- `reports/gsc-404-redirect-audit-2026-06-03T03-59-24.md` chạy lúc `11:02:17` vẫn ghi:
  - 97 URL OK
  - 16 URL 404
  - 0 lỗi 500/timeout
- Vì vậy cửa sổ phát sinh lỗi live nằm trong khoảng sau audit `11:02:17` và trước uptime check `11:04:48`.

## Điểm cần kiểm tra thêm

Có một pipeline gần thời điểm lỗi:

- Report: `reports/pipeline-gia-hut-be-phot-quang-ninh-2026-20260603-1055.json`
- Thời gian: `2026-06-03T10:55:41`
- Post mới: `2449`
- URL: `https://thongtaccongquangninh.com/gia-hut-be-phot-quang-ninh-2026/`
- Ảnh upload: `2450`, `2451`, `2452`
- Status report: `ok`

Chưa có PHP error log nên chưa kết luận đây là nguyên nhân. Đây chỉ là mốc thao tác live gần nhất trước khi site chuyển sang 500.

## Việc không làm

- Không sửa tiêu đề bài `2377` hoặc `2378`.
- Không sửa internal link trong bài `2412`.
- Không upload plugin.
- Không gọi REST write/update.
- Không dùng WP-CLI.
- Không publish thêm nội dung.

## Kết luận

P0 SEO chưa thể triển khai vì WordPress live đang lỗi **HTTP 500 toàn hệ thống**. Cần khôi phục lỗi fatal trước, sau đó mới quay lại backup, sửa P0, kiểm frontend và re-audit.

## Một việc tiếp theo nên làm

Mở hosting/cPanel/SSH hoặc recovery email WordPress để lấy **PHP error log trong khoảng 11:02-11:05 ngày 2026-06-03**, rồi tạm vô hiệu hóa plugin/theme hoặc draft post `2449` nếu log chỉ đúng nguồn lỗi.
