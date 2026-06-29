# Live Deep Content Cleanup - 2026-05-21

## Summary

Đã sửa nội dung chuyên sâu trên live WordPress cho 54 URL publish.

Mục tiêu:

- Xóa cú pháp Markdown bị lọt ra HTML: `#`, `[link](#id)`, `{#id}`, blockquote `>`.
- Xóa nhãn biên tập/SEO: `Case study E-E-A-T`, `NAP liên hệ`, `Internal link liên quan`, `CTA cuối bài`.
- Xóa nhãn ảnh generic `ảnh minh họa` theo quy tắc mô tả trực tiếp chủ thể/dịch vụ.
- Rewrite các bài/trang mỏng dưới 1.000 từ thành nội dung có intent rõ, bảng/checklist/quy trình/cảnh báo an toàn/FAQ.
- Cập nhật option render stale của `/thong-tac-cong-ha-long/`.

## Changed

- Batch 1: `reports/deep-content-rewrite-2026-05-21T10-33-32-959Z.md`
  - 52 item changed.
  - 17 full rewrites.
  - 35 sanitize-only fixes.
- Batch 2: `reports/deep-content-completion-2026-05-21T10-42-11-048Z.md`
  - 17 item changed.
  - Sửa nhãn còn sót và bổ sung nội dung cho nhóm còn mỏng.
- Batch 3: `reports/deep-content-final-expand-2026-05-21T10-44-51-578Z.md`
  - 15 item changed.
  - Đưa các URL còn dưới 1.000 từ lên trên ngưỡng rule nội bộ.
- Doorway option fix: `reports/doorway-option-content-fix-2026-05-21.json`
  - Updated `ttcqn_doorway_safe_page_296_content`.
  - Updated `ttcqn_doorway_safe_page_296_content_v2`.

## Verification

- REST content audit: `reports/deep-content-audit-final-2026-05-21.json`
  - Total publish items: 54.
  - Flagged: 0.
- Public HTML verify: `reports/live-content-final-verify-3-2026-05-21.json`
  - Total public URLs: 54.
  - Bad: 0.
- Spot checks:
  - `/thong-tac-cong-ha-long/`: HTTP 200, H1 = 1, bad labels = false.
  - `/blog/`: HTTP 200, H1 = 1, bad labels = false.
  - `/thong-tac-bon-cau-quang-yen/`: HTTP 200, H1 = 1, bad labels = false.
  - `/hut-be-phot-ha-long/`: HTTP 200, H1 = 1, bad labels = false.
  - `page-sitemap.xml`: HTTP 200, retired URL absent.

## Backups

- `seo-revisions/deep-content-rewrite-2026-05-21T10-33-32-959Z/`
- `seo-revisions/deep-content-completion-2026-05-21T10-42-11-048Z/`
- `seo-revisions/deep-content-final-expand-2026-05-21T10-44-51-578Z/`
- `seo-revisions/doorway-option-content-2026-05-21/`

## Remaining Notes

Không dùng thủ thuật AI Overview bait, không thêm review/rating giả, không bịa nguồn hoặc số liệu. Các phần bổ sung tập trung vào intent, dấu hiệu, quy trình, bảng quyết định, cảnh báo an toàn và thông tin chuẩn bị khi gọi thợ.
