# GSC Review Snippet - 36 Lỗi

- Ngày kiểm: 2026-06-03
- Mục Search Console: Đoạn trích đánh giá
- Trạng thái GSC từ ảnh: Không hợp lệ 36, Hợp lệ 4

## Kết luận ngắn

36 lỗi không phải BigQuery. Đây là lỗi rich result `Review snippets`.

Repo đã có lần xử lý trước đó bằng cách gỡ `Review`, `aggregateRating`, `reviewRating` khỏi JSON-LD public. GSC URL Inspection sau đó cho thấy trang chủ đã PASS, còn 2 URL mẫu vẫn FAIL vì Google đang giữ dữ liệu crawl cũ:

| URL | Last crawl trong GSC | Rich result |
|---|---:|---|
| `/` | 2026-06-02T16:20:54Z | PASS |
| `/thong-tac-cong-quang-ninh/` | 2026-06-01T03:25:45Z | FAIL Review snippets |
| `/hut-be-phot-mong-cai/` | 2026-05-30T20:08:26Z | FAIL Review snippets |

Nguồn đối chiếu nội bộ:

- `reports/review-snippet-cleanup-followup-2026-06-03.md`
- `reports/gsc-url-inspection-review-snippet-2026-06-03.md`

## Trạng thái live hiện tại

Hiện chưa thể kết luận 36 lỗi đã sạch hoàn toàn trên HTML live vì WordPress đang trả HTTP 500:

| URL kiểm | HTTP |
|---|---:|
| `https://thongtaccongquangninh.com/` | 500 |
| `https://thongtaccongquangninh.com/wp-json/` | 500 |
| `https://thongtaccongquangninh.com/sitemap_index.xml` | 500 |

Smoke test structured data mới:

- Report: `reports/structured-data-live-audit-2026-06-03T05-00-10.md`
- Kết quả: FAIL 1/1 do HTTP 500

## Việc đã sửa thêm trong repo

Sửa `tools/audit_live_structured_data.mjs` để tránh báo sai PASS khi WordPress 500 trả trang lỗi có `noindex`.

Trước sửa: trang 500 có `noindex` có thể bị bỏ qua gate schema và hiện PASS.

Sau sửa: `noindex` chỉ được bỏ qua khi không có HTTP/error issue; HTTP 500 luôn là FAIL.

Đã test:

- `node --check tools/audit_live_structured_data.mjs`: PASS
- `node tools/audit_live_structured_data.mjs --url=https://thongtaccongquangninh.com/`: FAIL đúng vì HTTP 500

## Nguồn nghi vấn gây HTTP 500

Mốc lỗi live nằm sau khi site còn OK lúc 2026-06-03 10:59:48 và trước khi uptime báo lỗi lúc 11:04:48.

Gần đúng mốc này có upload/activate plugin:

- `WORDPRESS_SEO_CONTACT_BLOCK_PLUGIN_UPLOAD_2026-06-03T03-58-06.json`
- `WORDPRESS_SEO_CONTACT_BLOCK_PLUGIN_UPLOAD_2026-06-03T04-04-43.json`
- Plugin: `ttcqn-seo-contact-block/ttcqn-seo-contact-block.php`

PHP local syntax check plugin này không lỗi:

- `php -l tools/wp-plugins/ttcqn-seo-contact-block/ttcqn-seo-contact-block.php`: PASS

Chưa có PHP error log hosting nên chưa kết luận chắc chắn plugin này là nguyên nhân.

## Thử khôi phục live sau lệnh `làm đi`

Đã kiểm các đường có thể thao tác từ workspace:

| Đường thử | Kết quả |
|---|---|
| WordPress core local trong workspace | Không có `wp-config.php` / `wp-load.php` |
| `/wp-login.php` | HTTP 500 |
| `/wp-json/` | HTTP 500 |
| `/wp-json/mcp/wp-mcp-ultimate` | HTTP 500 |
| REST deactivate plugin bằng WP app password | HTTP 500 `internal_server_error` |
| MCP/resources hosting trong Codex | Không có resource/template |
| Cấu hình `.env` | Chỉ có WP app password, không có SSH/SFTP/cPanel |
| `robots.txt` | HTTP 200, chứng tỏ web server còn sống nhưng WordPress bootstrap lỗi |

Kết luận: không thể vô hiệu hóa plugin bằng REST/MCP/WP Admin khi WordPress đang fatal toàn hệ thống. Cần truy cập filesystem hosting để đổi tên thư mục plugin hoặc dùng recovery email WordPress.

## Một việc tiếp theo

Khôi phục HTTP 500 trước: vào hosting/cPanel/SSH đổi tên thư mục `wp-content/plugins/ttcqn-seo-contact-block` thành `ttcqn-seo-contact-block.disabled`, rồi kiểm lại trang chủ, `/wp-json/` và sitemap về HTTP 200. Sau đó mới chạy lại structured data audit và bấm Validate Fix cho 36 lỗi Review snippets trong Search Console.
