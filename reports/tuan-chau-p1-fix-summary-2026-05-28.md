# Tuần Châu P1 Fix Summary - 2026-05-28

URL: `https://thongtaccongquangninh.com/thong-tac-cong-tuan-chau/`

## Phạm Vi

Xử lý P1 sau P0 cleanup:

- Giảm keyword stuffing.
- Khôi phục 3 ảnh nội dung đúng package ảnh đã có.
- Làm sạch Markdown render hỏng: caption rơi thành text, link Markdown, anchor H2 bị escape.
- Thêm `Service` schema khớp nội dung visible.
- Gỡ nhãn nội bộ `PENDING_IMAGE_SEO` / trạng thái nghiệm thu khỏi public.

## Backup

- Backup trước lần apply đầu: `seo-revisions/wp-before-tuan-chau-p1-2026-05-28T07:55:37/pages-993-thong-tac-cong-tuan-chau.json`
- Backup trước lần rút gọn cuối: `seo-revisions/wp-before-tuan-chau-p1-2026-05-28T07:57:56/pages-993-thong-tac-cong-tuan-chau.json`

## File / Script

- Script: `tools/fix_tuan_chau_p1_2026_05_28.mjs`
- Report apply cuối: `reports/tuan-chau-p1-fix-2026-05-28T07:57:56.json`
- Nguồn draft: `content-drafts/thong-tac-cong-tuan-chau-ha-long-rankmath-draft.md`
- Package ảnh: `image-briefs/thong-tac-cong-tuan-chau-image-package.json`

## Kết Quả

| Hạng mục | Trước | Sau |
|---|---:|---:|
| Word count audit | 3503 | 2909 |
| Keyword exact count | 30 | 7 |
| Keyword density audit | 4.28% | 1.20% |
| Ảnh nội dung | 0 | 3 |
| Service schema | Thiếu | Có |
| SEO score | 83 | 100 |
| Severity | HIGH | PASS |

## Ảnh Đã Gắn

| Media ID | File | Alt |
|---:|---|---|
| 2254 | `thong-tac-cong-tuan-chau-resort-01.jpg` | Thông tắc cống Tuần Châu - xử lý tắc nghẽn resort nhà hàng đảo Tuần Châu |
| 2255 | `thong-tac-cong-tuan-chau-may-ap-luc-02.jpg` | Máy rửa áp lực cao thông tắc cống Tuần Châu Hạ Long |
| 2256 | `thong-tac-cong-tuan-chau-kiem-tra-03.jpg` | Kiểm tra đường ống camera nội soi thông tắc cống Tuần Châu |

## Verify

- Live URL HTTP 200.
- Canonical đúng URL chính.
- Không `noindex`.
- Render live có 1 H1, 9 thẻ ảnh toàn trang, có `wp-image-2254`.
- Không còn nhãn nội bộ: `PENDING_IMAGE_SEO`, `Trạng thái nghiệm thu`, `Chưa được publish`, `TODO`.
- `node tools/audit_seo_full.mjs`: URL Tuần Châu `score=100`, `severity=PASS`, schemas gồm `LocalBusiness`, `BreadcrumbList`, `FAQPage`, `Service`.
- `python3 tools/audit_unique_wp_images.py --no-hash`: `pagesWithIssues=0`, `pagesUnderThreeImages=0`, `samePageDuplicatePages=0`.

## Trạng Thái

P1 Tuần Châu: `Fixed`.

## Việc Tiếp Theo

Xử lý P1 cho nhóm landing còn `MISSING_H2` nặng: `/thong-tac-cong-quang-yen/` và `/thong-tac-cong-uong-bi/`.
