# Fix P0 — gia-thong-tac-cong-quang-ninh-2026 — 2026-06-12

URL: https://thongtaccongquangninh.com/gia-thong-tac-cong-quang-ninh-2026/
Post ID: 2787

## Đã sửa live

- Đổi title từ bản dài/lặp từ khóa sang: `Giá Thông Tắc Cống Quảng Ninh 2026: Từ 200.000đ, Không Phát Sinh` (64 ký tự).
- Đổi meta description sang 157 ký tự, có hotline `0963.953.533`.
- Đổi H2 đầu tiên thành `Nguyên Nhân Nhiều Người Bị Chặt Chém Khi Thông Tắc Cống?`.
- Xóa block biên tập bị lộ public: `GỢI Ý ẢNH`, `INTERNAL LINK`, `EXTERNAL LINK`, `CHECKLIST RANK MATH`, `ĐIỂM ƯỚC TÍNH`.
- Xóa từ cấm trong nội dung live: `uy tín`, `chuyên nghiệp`.
- Thêm `Service` JSON-LD khớp nội dung bảng giá và khu vực phục vụ.
- Giữ dòng tác giả cuối bài trỏ về Nguyễn Song Hào.

## Backup

- `backups/live-audit-fix-2026-06-12/post-2787-before.json`
- `backups/live-audit-fix-2026-06-12/post-2787-before-content.html`
- `backups/live-audit-fix-2026-06-12/post-2787-after-preview.html`
- `backups/live-audit-fix-2026-06-12/gia-ttc-after.html`

## Kết quả audit sau sửa

- Trước sửa: score 67, severity HIGH.
- Sau sửa: score 94, severity MEDIUM.
- Đã hết:
  - `MISSING_H2:Nguyên nhân`
  - `FORBIDDEN_WORD`
  - `TITLE_LONG`
  - `MISSING_SERVICE`
- Còn:
  - `WORD_ABOVE_TARGET(3215)` do audit live tính cả form/footer; content raw sau sửa khoảng 2633 từ.
  - `SLUG_HAS_DATE_OR_LONG_NUMBER`; chưa đổi slug để tránh rủi ro redirect/canonical.

## Lệnh đã chạy

- `node .\tools\fix_gia_ttc_2026_p0.mjs`
- `node --check .\tools\fix_gia_ttc_2026_p0.mjs`
- `node .\tools\fix_gia_ttc_2026_p0.mjs --write`
- Public HTML verify bằng cache-buster `?nowprocket=1&codex=afterfix`
- `node .\tools\audit_seo_full.mjs --limit 90 --no-csv`
