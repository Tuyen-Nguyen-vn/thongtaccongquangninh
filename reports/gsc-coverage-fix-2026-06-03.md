# GSC Coverage Fix - 2026-06-03

Website: `https://thongtaccongquangninh.com/`

## Nguồn vào

- File Coverage: `D:\Downloads\thongtaccongquangninh.com-Coverage-2026-06-03.zip`
- Nhóm lỗi trong CSV:
  - `Trang có lệnh chuyển hướng`: 13
  - `Không tìm thấy (404)`: 11
  - `bị chặn bằng tệp robots.txt`: 1
  - `Trang thay thế có thẻ chính tắc thích hợp`: 1
  - `Đã thu thập dữ liệu - hiện chưa được lập chỉ mục`: 1

## Việc đã làm

- Thêm 16 redirect 301 cho URL legacy 404 có intent rõ vào plugin `TTCQN SEO Cleanup Redirects`.
- Upload lại plugin `ttcqn-seo-cleanup-redirects` thành công.
- Sửa `tools/audit_gsc_404_redirect.mjs` để dùng project root hiện tại thay vì hard-code `D:\...`.
- Sửa `tools/audit_live_links_assets.mjs` để dùng `.env` trong project thay vì hard-code env path Windows.
- Backup ZIP plugin cũ: `backups/ttcqn-seo-cleanup-redirects-before-gsc-coverage-2026-06-03.zip`.

## Bằng chứng sau sửa

- Redirect verify thủ công: 16/16 URL legacy trả `301` đúng `Location`.
- GSC 404/redirect audit: `reports/gsc-404-redirect-audit-2026-06-03T06-00-42.md`
  - 404: `0`
  - Redirect chain dài: `0`
  - Redirect một bước: `26`
- URL inventory mới nhất: `WP_URL_AUDIT_REPORT_2026-06-03.md`
  - URL trong sitemap: `88`
  - `restOnlyUrls`: `0`
  - permalink/slug lệch sitemap: `0`
  - duplicate title groups: `0`
  - similar title pairs: `0`
- Sitemap status verify: `88` URL, `0` redirect/404 trong sitemap.
- Robots live: `200`, chỉ chặn `/wp-admin/`, có sitemap `https://thongtaccongquangninh.com/sitemap_index.xml`.
- Structured data live audit: `reports/structured-data-live-audit-2026-06-03T06-14-47.md`
  - PASS: `88`
  - WARN: `0`
  - FAIL: `0`
- Link nội bộ bài nhà hàng:
  - `/thong-tac-cong-nha-hang-quang-ninh/`: `0` lần
  - `/thong-tac-cong-nha-hang-ha-long/`: `1` lần

## Search Console API sau sửa

- Submit lại sitemap index qua API: `reports/search-console-sitemap-submit-2026-06-03T17-05-57.md`
  - Submit status: `submitted`
  - Last submitted trong GSC: `2026-06-03T10:05:50.188Z`
  - Pending: `True`
  - Warnings: `0`
  - Errors: `1`
- Submit riêng từng sitemap con để khoanh vùng lỗi:
  - `post-sitemap.xml`: `reports/search-console-sitemap-submit-2026-06-03T17-07-00.md` - Warnings `0`, Errors `0`
  - `page-sitemap.xml`: `reports/search-console-sitemap-submit-2026-06-03T17-07-11.md` - Warnings `0`, Errors `0`
  - `category-sitemap.xml`: `reports/search-console-sitemap-submit-2026-06-03T17-07-21.md` - Warnings `0`, Errors `0`
- Kiểm live sitemap index sau submit:
  - `post-sitemap.xml`: HTTP `200`, XML, `31` URL
  - `page-sitemap.xml`: HTTP `200`, XML, `46` URL
  - `category-sitemap.xml`: HTTP `200`, XML, `12` URL
- Kết luận: lỗi `Errors: 1` đang còn ở bản xử lý sitemap index trong GSC, trong khi 3 sitemap con live đều truy cập được và khi submit riêng đều `Errors: 0`. Cần chờ GSC xử lý pending hoặc dùng UI để validate/follow-up nhóm Page indexing.

## Ghi chú

- Nhóm `Trang có lệnh chuyển hướng` trong GSC không phải luôn là lỗi cần xóa; URL cũ có 301 đúng đích là trạng thái hợp lệ. Điều cần tránh là sitemap/internal link trỏ vào URL redirect, hiện đã kiểm không còn trong sitemap.
- Nhóm rich result cũ trong GSC cần validate/recrawl vì live structured data hiện PASS 88/88.
- Không thể tự bấm `Validate fix` trong Search Console từ repo nếu không thao tác UI tài khoản GSC. Phiên này chưa có tool Chrome/Node REPL an toàn để điều khiển Search Console UI, nên không xác nhận đã bấm Validate fix.

## Việc tiếp theo nên làm

Vào Search Console, mở từng nhóm Coverage rồi bấm `Validate fix`; với URL còn báo robots/canonical/crawled-not-indexed, export URL mẫu nếu GSC vẫn giữ lỗi sau lần validate này.
