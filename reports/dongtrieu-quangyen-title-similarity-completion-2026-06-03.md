# Báo cáo sửa title giống nhau: Đông Triều / Quảng Yên - 2026-06-03

## Kết quả

- Đã xử lý cặp title giống nhẹ:
  - `https://thongtaccongquangninh.com/thong-tac-bon-cau-dong-trieu/`
  - `https://thongtaccongquangninh.com/thong-tac-bon-cau-quang-yen/`
- Không viết lại toàn trang. Chỉ sửa title, meta description, H1 và Service schema description theo bối cảnh địa phương thật đã có trong nội dung.
- Đông Triều tách intent sang nhà trong ngõ, khu trọ, cửa hàng mặt đường.
- Quảng Yên tách intent sang nhà nền thấp, ven sông, khu trọ, trào sau mưa.

## Nội dung đã áp dụng

| URL | Title mới | Meta length |
|---|---|---:|
| `/thong-tac-bon-cau-dong-trieu/` | Thông tắc bồn cầu Đông Triều cho nhà trong ngõ, khu trọ và cửa hàng | 152 |
| `/thong-tac-bon-cau-quang-yen/` | Thông tắc bồn cầu Quảng Yên cho nhà nền thấp, ven sông, khu trọ | 150 |

## Backup

- `seo-revisions/wp-before-dongtrieu-quangyen-title-2026-06-03T06-10-36-191Z/`
- `seo-revisions/wp-before-dongtrieu-quangyen-title-2026-06-03T06-12-15-743Z/`

## Báo cáo kỹ thuật

- Apply content/H1/schema: `reports/dongtrieu-quangyen-title-fix-2026-06-03T06-10-36-191Z.md`
- Apply Rank Math meta: `reports/dongtrieu-quangyen-title-fix-2026-06-03T06-12-15-743Z.md`
- Public verifier sau khi bổ sung script: `reports/dongtrieu-quangyen-title-fix-2026-06-03T06-14-25-176Z.md`
- Audit URL toàn site: `WP_URL_AUDIT_REPORT_2026-06-03.md`

## Verification

- `node --check tools/fix_dong_trieu_quang_yen_title_similarity_2026_06_03.mjs`: PASS.
- Dry-run: 2 page đúng scope.
- Apply 1: cập nhật 2 page, mỗi page thay 1 Service schema description.
- Apply 2: cập nhật Rank Math title/description/focus keyword cho 2 page.
- Public Đông Triều: HTTP 200, canonical self, robots index, 1 H1, title 67 ký tự, meta 152 ký tự.
- Public Quảng Yên: HTTP 200, canonical self, robots index, 1 H1, title 63 ký tự, meta 150 ký tự.
- Public verifier mới: `publicVerified = 2/2`, `titleTokenSimilarity = 0.4`, title/meta/OG/canonical/hero/Service schema đều PASS.
- Re-audit URL: `duplicateGroups = 0`, `similarPairs = 1`.
- Cặp Đông Triều/Quảng Yên đã không còn trong phần `Title trùng hoặc quá giống`.

## Tồn đọng ngoài scope

- Còn 1 cặp title giống nhẹ: `/gioi-thieu/` với `/lien-he/`.

## Trạng thái

PASS. Đã tách intent và metadata cho cặp Đông Triều/Quảng Yên, verify live xong.
