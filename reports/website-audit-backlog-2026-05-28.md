# Website Audit Backlog - 2026-05-28

Website: `https://thongtaccongquangninh.com`  
Phạm vi ban đầu: full site audit read-only trên live site. Không sửa WordPress, không publish, không xóa file trong bước audit.

Ghi chú cập nhật: sau audit, Tuyền đã duyệt xử lý P0. Batch P0 đã được thực hiện riêng, có backup và verify live, xem `reports/p0-url-cleanup-summary-2026-05-28.md`.

Ghi chú cập nhật P1: `/thong-tac-cong-tuan-chau/`, `/thong-tac-cong-quang-yen/`, `/thong-tac-cong-uong-bi/`, `/thong-tac-cong-ha-long/` và `/hut-be-phot-van-don/` đã sửa live, có backup và re-audit PASS 100. Xem `reports/tuan-chau-p1-fix-summary-2026-05-28.md`, `reports/quang-yen-uong-bi-p1-fix-summary-2026-05-28.md`, `reports/ha-long-p1-fix-summary-2026-05-28.md` và `reports/hut-be-phot-van-don-p1-fix-summary-2026-05-28.md`.

## Bằng Chứng Đã Chạy

- `node tools/collect_wp_url_audit_list.mjs`: OK sau khi sửa đường dẫn WSL-safe cho script. Output: `WP_URL_AUDIT_REPORT_2026-05-28.md`, `wp-url-audit-list.csv`, `wp-url-audit-list.json`.
- `node tools/audit_seo_full.mjs`: OK. Output: `reports/site-full-audit-2026-05-28.md/json`, `reports/seo-full-audit-2026-05-28.md/json`. Tool đã append 46 dòng vào `docs/SEO_PROGRESS.csv`.
- `python3 tools/audit_unique_wp_images.py --no-hash`: OK. Output: `reports/wp-unique-image-audit-2026-05-28T14-23-13.md/json`.
- `node tools/wp_mcp_smoke.mjs`: OK, output `WORDPRESS_MCP_SMOKE_2026-05-28.json`. Endpoint đúng `https://thongtaccongquangninh.com/wp-json/mcp/wp-mcp-ultimate`; endpoint cũ `/wp-json/mcp` trả 404.
- Kiểm tra tay: `robots.txt` HTTP 200, Allow `/`, Disallow `/wp-admin/`, sitemap trỏ về `sitemap_index.xml`; `page-sitemap.xml` HTTP 200, không còn `/thong-tac-toilet-quang-ninh/`, có `/thong-tac-bon-cau-quang-ninh/`.

## Kết Quả Tổng Quan

- Inventory REST/sitemap: 83 dòng, 82 URL public, 79 URL trong sitemap, 40 landing local SEO nghi vấn.
- Full SEO public HTML: 69 dòng audit, 68 URL unique, PASS 6, FAIL/HIGH 37, WARN/MEDIUM 26.
- Broken internal links: 0.
- Canonical / viewport / noindex bất thường: không phát hiện trong `site-full-audit`.
- Top issue category: content 68, title/meta 49, heading 18, schema 16, image 13.
- Image audit: 69 nội dung, 1 trang thiếu ảnh, 0 trang trùng ảnh trong cùng page, 4 nhóm ảnh reuse toàn site.

## P0 - Cần Xử Lý Trước Khi Sửa Nội Dung Hàng Loạt

| Vấn đề | Bằng chứng | Hướng xử lý |
|---|---|---|
| Coverage lệch giữa inventory và full SEO audit | Trước sửa: inventory có 82 URL public; `audit_seo_full` audit 69 dòng / 68 URL unique. Sau sửa: inventory còn `restOnlyUrls=0`, `duplicateGroups=0`, SEO audit còn 64 URL HTML chính. | `Fixed` cho phần REST-only/duplicate public. Archive author/category vẫn cần quyết định index/noindex ở batch riêng nếu muốn đưa vào scoring. |
| 4 URL public REST không nằm trong sitemap | Trước sửa: `/hut-be-phot-hoanh-bo/`, `/chi-phi-hut-be-phot-quang-ninh/`, `/thong-tac-cong-cao-xanh-2/`, `/thong-tac-cong-gieng-day-2/`. Sau sửa: các object phụ đã chuyển `draft`; live URL vẫn 301 đúng đích qua plugin cleanup redirect. | `Fixed`. Backup tại `seo-revisions/wp-before-p0-url-cleanup-2026-05-28T14-35-40/`. |
| Cùng URL `/thong-tac-cong-tuan-chau/` xuất hiện 2 lần trong full audit | Trước sửa: page 993 và post 2041 cùng link. Sau sửa: post 2041 chuyển `draft`; live `/thong-tac-cong-tuan-chau/` HTTP 200 và REST alternate trỏ `pages/993`. | `Fixed` phần duplicate object. Content P1 của URL này vẫn cần sửa keyword stuffing/ảnh/schema. |

## P1 - Landing/Blog Ảnh Hưởng Lead Và Chất Lượng SEO

| URL / nhóm | Lỗi chính | Hướng xử lý |
|---|---|---|
| Trang chủ `/` | `FORBIDDEN_WORD`, meta 143 ký tự, 2 ảnh empty alt, 11 alt chưa rõ service/location, thiếu `BreadcrumbList`. | Loại từ cấm, sửa alt theo ngữ cảnh, bổ sung schema breadcrumb nếu phù hợp visible nav. |
| `/cam-nang-thong-tac-cong-tai-ha-long/` | H1 chưa khớp keyword, 4126 từ quá dài, có từ cấm, meta 136 ký tự, thiếu `Service`. | Rút gọn bài, sửa H1/meta, bỏ từ cấm; chỉ thêm Service schema nếu visible content là trang dịch vụ rõ ràng. |
| `/thong-tac-cong-tuan-chau/` | Trước sửa: 3503 từ, keyword stuffing 4.28%, 0 ảnh nội dung, thiếu `Service`. Sau sửa: score 100, PASS, 2909 từ, keyword density 1.20%, 3 ảnh, có `Service`. | `Fixed`. Xem `reports/tuan-chau-p1-fix-summary-2026-05-28.md`. |
| `/thong-tac-cong-quang-yen/`, `/thong-tac-cong-uong-bi/` | Trước sửa: thiếu H2 `Tại sao chọn / Cam kết`, thiếu `NAP / Liên hệ`, nội dung thấp, title ngắn. Sau sửa: cả 2 URL score 100, PASS, đủ H2 bắt buộc, 3 ảnh, đủ `Service`. | `Fixed`. Xem `reports/quang-yen-uong-bi-p1-fix-summary-2026-05-28.md`. |
| `/thong-tac-cong-ha-long/` | Trước sửa: thiếu H2 `Tại sao chọn / Cam kết`, thiếu `NAP / Liên hệ`, nội dung thấp, title ngắn. Sau sửa: score 100, PASS, 2597 từ, đủ H2 bắt buộc, đủ `Service`; đã đồng bộ `post_content` và 2 option renderer. | `Fixed`. Xem `reports/ha-long-p1-fix-summary-2026-05-28.md`. |
| `/hut-be-phot-van-don/` | Trước sửa: thiếu H2 `Nguyên nhân`, word low, keyword density 2.88%, title/meta ngắn. Sau sửa: score 100, PASS, 2546 từ, keyword density 0.98%, title 63 ký tự, meta 152 ký tự, đủ H2 bắt buộc. | `Fixed`. Xem `reports/hut-be-phot-van-don-p1-fix-summary-2026-05-28.md`. |
| `/hut-be-phot-dong-trieu/`, `/hut-be-phot-mong-cai/` | Thiếu H2 `Nguyên nhân`, word low, một số trang có keyword density cao, title/meta cần rà lại. | Bổ sung section nguyên nhân theo địa phương, giảm lặp keyword, cập nhật meta ngắn. |
| `/he-thong-lien-ket-doi-tac/` | 10457 từ quá dài, có từ cấm, hotline body = 0, meta 121 ký tự. | Tách/trim nội dung, thêm NAP/hotline nếu page vẫn cần index; nếu chỉ là internal hub thì cần review noindex. |
| `/cau-hoi-thuong-gap-thong-tac-cong/`, `/nguyen-nhan-cong-tac-thuong-xuyen-ha-long/`, `/chinh-sach-bao-hanh/`, `/hoa-chat-tu-thong-cong-3/` | Keyword stuffing / từ cấm / schema thiếu hoặc word count thấp. | Sửa từng bài theo intent, không thêm schema nếu FAQ/Service không hiển thị thật. |

## P2 - Tối Ưu Sau Batch P0/P1

| Nhóm | Bằng chứng | Hướng xử lý |
|---|---|---|
| Meta/title ngắn nhẹ | 27 URL bị `TITLE_SHORT`, `META_SHORT` hoặc meta chưa tối ưu. | Xử lý theo batch meta, ưu tiên landing tiền trước. |
| Ảnh có alt chưa rõ service/location | 10 URL có `ALT_NO_SERVICE_OR_LOCATION`, trang chủ nhiều nhất. | Đổi alt/caption theo ngữ cảnh, không dùng nhãn generic. |
| Word count lệch mục tiêu nhẹ | Nhiều URL `WORD_BELOW_TARGET` 2200-2490 hoặc trên 3000 nhẹ. | Chỉ sửa khi trang là landing SEO; archive/hub/chính sách không áp cứng máy móc. |
| 4 nhóm ảnh reuse toàn site | Image audit có `globalReuseGroups=4`, không có duplicate trong cùng page. | Review reuse theo ngữ cảnh; nếu tái dùng ảnh thì đổi lớp vỏ/crop/filter/alt/caption theo workflow ảnh SEO. |

## Ghi Chú Vận Hành

- Đã sửa local tool `tools/collect_wp_url_audit_list.mjs` để root dự án tự tính theo `import.meta.url`, hỗ trợ WSL/Linux và biến `TTCQN_PROJECT_ROOT` / `TTCQN_WP_ENV`.
- Đã sửa local tool `tools/wp_mcp_smoke.mjs` để report MCP dùng ngày hiện tại, tránh ghi đè file smoke cũ.
- Lượt audit ban đầu không sửa WordPress live. Batch P0 sau duyệt đã chuyển 5 object phụ sang `draft` và có backup trước sửa.
- Các mục trên là `Needs Review` hoặc `Pending Fix`, không đánh dấu `Fixed` nếu chưa có batch sửa và verify riêng.

## Việc Tiếp Theo Nên Làm

Xử lý P1 cho `/hut-be-phot-dong-trieu/`.
