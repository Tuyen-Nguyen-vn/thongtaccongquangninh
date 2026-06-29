# P1 Fix Summary - Quảng Yên và Uông Bí - 2026-05-28

Website: `https://thongtaccongquangninh.com`

## Phạm Vi

- Sửa live 2 landing page:
  - `/thong-tac-cong-quang-yen/`
  - `/thong-tac-cong-uong-bi/`
- Không sửa giao diện, plugin, public API hoặc schema bằng code mới.
- Có backup WordPress trước mỗi lượt apply.

## File Bằng Chứng

- Script: `tools/fix_quang_yen_uong_bi_p1_2026_05_28.mjs`
- Report apply cuối: `reports/quang-yen-uong-bi-p1-fix-2026-05-28T08:20:39.json`
- Backup content chính: `seo-revisions/wp-before-quang-yen-uong-bi-p1-2026-05-28T08:18:53/`
- Backup title chốt: `seo-revisions/wp-before-quang-yen-uong-bi-p1-2026-05-28T08:20:39/`
- Re-audit SEO: `reports/seo-full-audit-2026-05-28.md`, `reports/seo-full-audit-2026-05-28.json`
- Image audit: `reports/wp-unique-image-audit-2026-05-28T15-19-11.md`, `reports/wp-unique-image-audit-2026-05-28T15-19-11.json`

## Kết Quả Trước / Sau

| URL | Trước sửa | Sau sửa | Trạng thái |
|---|---:|---:|---|
| `/thong-tac-cong-quang-yen/` | Score 78, HIGH, 1478 từ, thiếu H2 `Tại sao chọn / Cam kết`, thiếu `NAP / Liên hệ`, title ngắn | Score 100, PASS, 2615 từ, title 64 ký tự, meta 152 ký tự, đủ H2 bắt buộc, 3 ảnh, đủ `LocalBusiness`, `BreadcrumbList`, `FAQPage`, `Service` | Fixed |
| `/thong-tac-cong-uong-bi/` | Score 78, HIGH, 1487 từ, thiếu H2 `Tại sao chọn / Cam kết`, thiếu `NAP / Liên hệ`, title ngắn | Score 100, PASS, 2584 từ, title 65 ký tự, meta 150 ký tự, đủ H2 bắt buộc, 3 ảnh, đủ `LocalBusiness`, `BreadcrumbList`, `FAQPage`, `Service` | Fixed |

## Live Verify

| URL | HTTP | Canonical | Noindex | H1 | Ảnh live | Service schema | H2 cam kết | NAP |
|---|---:|---|---|---:|---:|---|---|---|
| `/thong-tac-cong-quang-yen/` | 200 | OK | false | 1 | 9 | OK | OK | OK |
| `/thong-tac-cong-uong-bi/` | 200 | OK | false | 1 | 9 | OK | OK | OK |

## Image Audit

- `totalContent`: 64
- `pagesWithIssues`: 0
- `samePageDuplicatePages`: 0
- `pagesUnderThreeImages`: 0
- `globalReuseGroups`: 1

## Next Action

Xử lý P1 cho `/thong-tac-cong-ha-long/`: còn thiếu H2 `Tại sao chọn / Cam kết` và `NAP / Liên hệ`.
