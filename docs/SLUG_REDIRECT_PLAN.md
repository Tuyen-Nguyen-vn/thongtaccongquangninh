# Kế hoạch redirect slug có năm 2026

Ngày lập: 2026-06-16  
Mục tiêu: Trước 2027-01-01 — đổi slug, setup 301 redirect, không bị cũ hóa URL.

## Danh sách redirect

| # | Old slug | New slug | Type | ID | Conflict? |
|---|---|---|---|---|---|
| 1 | `bang-gia-hut-be-phot-quang-ninh-2026` | `bang-gia-hut-be-phot-quang-ninh` | posts | 217 | OK |
| 2 | `dau-hieu-be-phot-bi-day-2026` | `dau-hieu-be-phot-bi-day` | posts | 2589 | OK |
| 3 | `hut-ham-cau-quang-ninh-2026` | `hut-ham-cau-quang-ninh` | posts | 2559 | OK |
| 4 | `xe-hut-be-phot-quang-ninh-2026` | `xe-hut-be-phot-quang-ninh` | posts | 2554 | OK |
| 5 | `gia-hut-be-phot-quang-ninh-2026` | `gia-hut-be-phot-quang-ninh` | posts | 2449 | OK |
| 6 | `hut-be-phot-24-7-quang-ninh-2026` | `hut-be-phot-24-7-quang-ninh` | posts | 2439 | OK |
| 7 | `gia-thong-tac-cong-quang-ninh-2026` | `gia-thong-tac-cong-quang-ninh` | posts | 2787 | OK |
| 8 | `hut-be-phot-khan-cap-quang-ninh-2026` | `hut-be-phot-khan-cap-quang-ninh` | posts | 2430 | OK |
| 9 | `hut-be-phot-cong-ty-quang-ninh-2026` | `hut-be-phot-cong-ty-quang-ninh` | posts | 2694 | OK |
| 10 | `hut-be-phot-nha-hang-quang-ninh-2026` | `hut-be-phot-nha-hang-quang-ninh` | posts | 2687 | OK |
| 11 | `hut-be-phot-khach-san-quang-ninh-2026` | `hut-be-phot-khach-san-quang-ninh` | posts | 2702 | OK |
| 12 | `hut-be-phot-khu-nha-tro-quang-ninh-2026` | `hut-be-phot-khu-nha-tro-quang-ninh` | posts | 2708 | OK |
| 13 | `thong-tac-bon-cau-khach-san-quang-ninh-2026` | `thong-tac-bon-cau-khach-san-quang-ninh` | posts | 2417 | OK |
| 14 | `hut-be-phot-khu-cong-nghiep-quang-ninh-2026` | `hut-be-phot-khu-cong-nghiep-quang-ninh` | posts | 2769 | OK |
| 15 | `thong-tac-cong-khan-cap-quang-ninh-2026` | `thong-tac-cong-khan-cap-quang-ninh` | posts | 2777 | OK |
| 16 | `thong-tac-bon-cau-nha-hang-quang-ninh-2026` | `thong-tac-bon-cau-nha-hang-quang-ninh` | posts | 2412 | OK |
| 17 | `thong-tac-bon-cau-nha-dan-quang-ninh-2026` | `thong-tac-bon-cau-nha-dan-quang-ninh` | posts | 2407 | OK |

## Ghi chú

### Cách thực hiện (từng bước)

1. **Backup** trước khi thay đổi slug.
   - Rank Math tự tạo redirect 301 từ old → new khi slug đổi qua WP Admin.
   - Nếu dùng REST API, cần thêm redirect thủ công qua Rank Math Redirections.
3. Với trang CONFLICT: hợp nhất nội dung hai bài (giữ bài clean slug, merge nội dung quan trọng từ bài 2026) → sau đó xóa hoặc redirect bài 2026 sang bài đích.
4. Submit lại sitemap qua Google Search Console sau khi hoàn tất.

### Thời điểm nên thực hiện

- **Ưu tiên sớm** nếu bài đang không rank tốt hoặc cần tái cấu trúc nội dung.
