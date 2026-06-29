# P0 URL Cleanup Summary - 2026-05-28

Website: `https://thongtaccongquangninh.com`

## Phạm Vi

Xử lý nhóm P0 sau full site audit ngày 2026-05-28:

- 1 URL có trùng public object: `/thong-tac-cong-tuan-chau/`.
- 4 URL REST-public không nằm trong sitemap nhưng đã có redirect cleanup: `/hut-be-phot-hoanh-bo/`, `/chi-phi-hut-be-phot-quang-ninh/`, `/thong-tac-cong-cao-xanh-2/`, `/thong-tac-cong-gieng-day-2/`.

## Backup Trước Sửa

Backup REST object đã tạo tại:

`seo-revisions/wp-before-p0-url-cleanup-2026-05-28T14-35-40/`

- `posts-2041-thong-tac-cong-tuan-chau.json`
- `pages-59-hut-be-phot-hoanh-bo.json`
- `posts-2026-chi-phi-hut-be-phot-quang-ninh.json`
- `posts-2055-thong-tac-cong-cao-xanh-2.json`
- `posts-2056-thong-tac-cong-gieng-day-2.json`

## Thay Đổi Đã Áp Dụng

Các object phụ đã chuyển từ `publish` sang `draft`:

| Object | Slug | Trạng thái sau sửa |
|---|---|---|
| `posts/2041` | `thong-tac-cong-tuan-chau` | `draft` |
| `pages/59` | `hut-be-phot-hoanh-bo` | `draft` |
| `posts/2026` | `chi-phi-hut-be-phot-quang-ninh` | `draft` |
| `posts/2055` | `thong-tac-cong-cao-xanh-2` | `draft` |
| `posts/2056` | `thong-tac-cong-gieng-day-2` | `draft` |

Report JSON chi tiết:

`reports/p0-url-cleanup-2026-05-28T14-35-40.json`

## Verify Live Sau Sửa

| URL | Kết quả |
|---|---|
| `/thong-tac-cong-tuan-chau/` | HTTP 200, REST alternate trỏ `pages/993` |
| `/hut-be-phot-hoanh-bo/` | HTTP 301 tới `/hut-be-phot-ha-long/`, `x-redirect-by: TTCQN SEO Cleanup Redirects` |
| `/chi-phi-hut-be-phot-quang-ninh/` | HTTP 301 tới `/chi-phi-hut-be-phot-quang-ninh-2/`, `x-redirect-by: TTCQN SEO Cleanup Redirects` |
| `/thong-tac-cong-cao-xanh-2/` | HTTP 301 tới `/thong-tac-cong-cao-xanh/`, `x-redirect-by: TTCQN SEO Cleanup Redirects` |
| `/thong-tac-cong-gieng-day-2/` | HTTP 301 tới `/thong-tac-cong-gieng-day/`, `x-redirect-by: TTCQN SEO Cleanup Redirects` |

## Re-audit Sau Sửa

- `node tools/collect_wp_url_audit_list.mjs`: `totalRows=78`, `totalPublicAuditUrls=77`, `totalSitemapUrls=78`, `restOnlyUrls=0`, `duplicateGroups=0`.
- `node tools/audit_seo_full.mjs`: 64 URL audit HTML, `HIGH=28`, `MEDIUM=28`, `PASS=8`, duplicate title pairs `0`.
- Broken internal links: `0`.

## Trạng Thái

P0 URL/canonical/sitemap cleanup: `Fixed`.

## Việc Tiếp Theo

Xử lý P1 cho `/thong-tac-cong-tuan-chau/`: giảm keyword stuffing, bổ sung ảnh nội dung, kiểm lại H2/CTA/hotline và schema `Service`.
