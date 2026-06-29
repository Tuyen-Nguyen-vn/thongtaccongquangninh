# Báo cáo sửa title/meta ngắn live — 2026-06-12

## Phạm vi
- Sửa nhóm lỗi `TITLE_SHORT` và `META_SHORT` còn lại trong audit SEO live.
- Tổng URL tác động: 7.
- Script: `tools/fix_title_meta_short_2026_06_12.mjs`.
- Plugin live: `ttcqn-title-meta-short-2026-06-12/ttcqn-title-meta-short-2026-06-12.php`.

## URL đã sửa
- `/` — sửa title trang chủ từ 44 ký tự lên 63 ký tự.
- `/dau-hieu-be-phot-bi-day-2026/` — meta description 155 ký tự.
- `/hut-be-phot-quang-ninh/` — meta description 151 ký tự.
- `/nguyen-nhan-cong-tac-thuong-xuyen-ha-long/` — meta description 154 ký tự.
- `/thong-tac-cong-chung-cu-ha-long/` — meta description 158 ký tự.
- `/thong-tac-cong-ngo-nho-ha-long/` — meta description 151 ký tự.
- `/thong-tac-cong-quang-ninh/` — meta description 156 ký tự.

## Cách triển khai
- Tạo plugin filter priority cao cho:
  - `rank_math/frontend/description`
  - `rank_math/frontend/title`
  - `pre_get_document_title`
  - `document_title_parts`
- Ghi thêm `rank_math_title`, `rank_math_description`, `rank_math_focus_keyword` vào post meta để lưu bền.
- Backup REST JSON trước deploy trong `backups/live-audit-fix-2026-06-12/`.

## Kiểm tra sau sửa
- `node --check tools/fix_title_meta_short_2026_06_12.mjs`: OK.
- Dry-run: 7/7 title/meta đạt range 150-160 ký tự cho meta, 60-70 ký tự cho title cần sửa.
- Deploy plugin qua WordPress MCP: OK, plugin installed and activated.
- `node tools/audit_seo_full.mjs --limit 90 --no-csv`:
  - URL audit: 87
  - PASS: 31
  - FAIL: 0
  - WARN: 56
  - Broken internal links: 0
  - Title/meta length bất thường: không phát hiện
  - Title duplicate >=85%: không phát hiện
