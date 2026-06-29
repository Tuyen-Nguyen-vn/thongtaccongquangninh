# Báo cáo xử lý HTTP 500 - 2026-06-03

Thời điểm kiểm: 2026-06-03 12:08 +07  
Website: `https://thongtaccongquangninh.com`

## Kết luận nhanh

Chưa khôi phục được live từ workspace hiện tại vì WordPress đang fatal toàn hệ thống và repo không có quyền filesystem hosting.

Web server vẫn sống vì `robots.txt` trả 200, nhưng mọi request đi qua WordPress bootstrap đều trả 500:

| URL | Kết quả |
|---|---:|
| `/` | 500 |
| `/sitemap_index.xml` | 500 |
| `/wp-json/` | 500 |
| `/wp-login.php` | 500 |
| REST deactivate plugin bằng app password | 500 |

## Nguồn nghi vấn cao nhất

Mốc lỗi bắt đầu sau khi uptime còn 200 lúc `2026-06-03 10:59:48` và trước lần kiểm lỗi `2026-06-03 11:04:48`.

Đúng cửa sổ này có thao tác upload/activate plugin:

- `WORDPRESS_SEO_CONTACT_BLOCK_PLUGIN_UPLOAD_2026-06-03T03-58-06.json`
  - generatedAt: `2026-06-03T03:58:10.817Z`
  - local time: khoảng `10:58:10 +07`
  - pluginActive: `true`
  - success: `true`
- `WORDPRESS_SEO_CONTACT_BLOCK_PLUGIN_UPLOAD_2026-06-03T04-04-43.json`
  - generatedAt: `2026-06-03T04:04:46.761Z`
  - local time: khoảng `11:04:46 +07`
  - uploadStatus: `200`
  - uploadResponse: plugin installed and activated
  - pluginActive: `false` ở bước verify, vì WordPress bắt đầu lỗi ngay sau đó

Plugin nghi vấn:

```text
wp-content/plugins/ttcqn-seo-contact-block/ttcqn-seo-contact-block.php
```

## Đã kiểm tại workspace

- `.env` chỉ có `WP_USERNAME`, `WP_APP_PASSWORD`, `WP_BASE_URL` và khóa Google/PageSpeed. Không có SSH/SFTP/FTP/cPanel.
- Project ChatGPT Apps SEO mặc định cũng chỉ có WordPress app password, không có quyền file hosting.
- Workspace không có WordPress core local, không có `wp-config.php` / `wp-load.php`.
- Không tìm thấy file cấu hình FTP/SFTP/cPanel/SSH trong phạm vi đã quét.
- ZIP plugin nghi vấn hợp lệ:
  - `tools/wp-plugins/ttcqn-seo-contact-block.zip`
  - `zipfile.testzip()` = OK.
- PHP syntax local pass:
  - `php -l tools/wp-plugins/ttcqn-seo-contact-block/ttcqn-seo-contact-block.php`
  - `php -l` toàn bộ `tools/wp-plugins/**/*.php`
- REST deactivate plugin bằng app password đã thử nhưng vẫn HTTP 500 vì WordPress bootstrap bị fatal.
- `/wp-login.php` chỉ hiển thị critical error và yêu cầu kiểm email admin, không lộ stack trace/file lỗi.

## Không làm

- Không sửa live qua REST vì REST đang 500.
- Không upload plugin mới vì MCP/REST đang 500.
- Không đụng database.
- Không cố chạy WP-CLI vì workspace không phải WordPress core.
- Không xóa file/plugin local.

## Cách khôi phục cần làm trên hosting

Thao tác tối thiểu, có rollback:

1. Vào cPanel/File Manager hoặc SSH/SFTP của hosting.
2. Mở thư mục:

```text
/home/yerdchtihosting/public_html/wp-content/plugins/
```

3. Đổi tên thư mục:

```text
ttcqn-seo-contact-block
```

thành:

```text
ttcqn-seo-contact-block.disabled
```

4. Kiểm lại:

```bash
curl -I -L 'https://thongtaccongquangninh.com/?nowprocket=1&codex=recover-check'
curl -I -L 'https://thongtaccongquangninh.com/wp-json/?codex=recover-check'
curl -I -L 'https://thongtaccongquangninh.com/sitemap_index.xml?codex=recover-check'
```

5. Nếu site về 200, giữ plugin này disabled, rồi chạy lại audit:

```bash
node tools/collect_wp_url_audit_list.mjs
node tools/audit_seo_full.mjs --no-csv
node tools/audit_live_structured_data.mjs
python3 tools/audit_unique_wp_images.py --no-hash
```

## Nếu đổi tên plugin vẫn chưa hết 500

Lấy PHP error log trong khoảng `2026-06-03 11:02-11:05 +07`, thường nằm ở một trong các vị trí:

```text
/home/yerdchtihosting/public_html/error_log
/home/yerdchtihosting/public_html/wp-content/debug.log
/home/yerdchtihosting/logs/
```

Sau đó cô lập tiếp theo đúng file trong log. Không tắt toàn bộ plugin nếu chưa cần.

## Trạng thái

P0 chưa hoàn tất vì thiếu quyền filesystem hosting hoặc recovery email WordPress. Từ workspace hiện tại chỉ có thể xác định nguồn nghi vấn và đưa lệnh khôi phục chính xác.

