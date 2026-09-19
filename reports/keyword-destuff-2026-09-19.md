# Dọn nhồi từ khoá — 2026-09-19

Kết quả audit: trang > 2.5% mật độ **18 → 2** (2 trang còn lại là báo động giả:
`co-nen-dung-bot-thong-cong-cho-bon-cau` chỉ 1 lần lặp trên trang ngắn;
`nguyen-song-hao` là trang tên tác giả). Từ cấm: 0. Site HTTP 200.

## Đã sửa (16 trang, thay chuỗi chính xác, dry-run → backup → ghi → readback → permalink 200)

| ID | Trang | Lần lặp trước → sau |
|---|---|---|
| 2047 | hut-be-phot-ba-che | 24 → 8 |
| 2050 | hut-be-phot-dam-ha | 24 → 6 (+ sửa `# ` markdown thừa trong H2) |
| 3553 | thong-tac-cong-ha-khau | 26 → 10 |
| 3278 | thong-tac-bon-cau-hung-thang | 16 → 9 (+ gỡ từ cấm "chuyên nghiệp") |
| 3275 / 3274 / 3276 | thong-tac-bon-cau cao-xanh / gieng-day / ha-khau | 17→11, 17→11, 12→7 |
| 2053 | thong-tac-cong-hong-gai | 14 → 10 |
| 216 | cach-xu-ly-cong-thoat-nuoc-tac | 12 → 8 (+ sửa 2 câu vỡ ngữ pháp) |
| 1487 / 1485 / 1616 | thong-tac-bon-cau van-don / quang-yen, hut-be-phot-mao-khe | 14→8, 12→8, 11→6 (+ sửa lỗi "Mão Khê") |
| 4683 / 4692 / 4687 | bon-cau-trao-nguoc..., mui-hoi-...cam-pha, dau-hieu-...ha-long | 10→6, 7→4, 6→5 |
| 2687 | hut-be-phot-nha-hang-quang-ninh | 11 → 8 |

## Phát hiện phụ và đã xử lý: ghi chú SEO nội bộ bị đăng lên trang thật

Các đoạn "SEO TITLE / SLUG / META DESCRIPTION / FOCUS KEYWORD / SECONDARY
KEYWORDS / SEARCH INTENT" (kèm `<h1>` thừa hoặc `<h2>Thông Tin SEO</h2>`) hiển
thị công khai trên **4 trang**: 2687, 2554 (xe-hut-be-phot-quang-ninh),
2559 (hut-ham-cau-quang-ninh), 2412 (thong-tac-bon-cau-nha-hang-quang-ninh).
Đã gỡ từng đoạn (mỗi nhãn khớp đúng 1 lần), quét lại toàn bộ 131 bài/trang:
không còn marker nội bộ nào. Các đoạn đó còn lộ cả câu "bảo hành 12 tháng" (2412).

## KHÔNG sửa có chủ đích (chờ số liệu thật từ chủ doanh nghiệp)

- Khối "seo-supplement → Case Study E-E-A-T" ("Tháng 5/2026, khách hàng ... hoàn toàn trong 45-60 phút", "bảo hành 30 ngày") ở nhiều trang (vd 3275, 3274, 2687, 1487, 1485, 1616): ví dụ/thời gian/bảo hành không có căn cứ.
- Trang 3276: "đã xử lý hàng nghìn ca", "kinh nghiệm nhiều năm".
- Chỉ nên gỡ/viết lại các khối này khi chủ doanh nghiệp xác nhận dữ kiện (xem `reports/seo-geo-remediation-2026-09-17/pending-input.md`).

## Lưu ý: số trang HIGH của audit tăng (5 → 23) — không do đợt này

Đó là các trang mà dự án remediation 17–19/09 đã cố ý cắt nội dung chưa xác minh
(vd hut-be-phot-ha-long ~3700 → ~1360 từ nên thiếu mục Quy trình/Tại sao chọn).
Đừng thêm lại các mục đó bằng nội dung bịa; chờ dữ liệu thật.

## Công cụ tái sử dụng

- `tools/kw_occurrences.mjs <id> <posts|pages> "<focus ascii>"` — liệt kê từng lần lặp kèm ngữ cảnh.
- `tools/apply_kw_replacements.mjs <id> <type> <file.json> "<focus>" [--dry]` — thay chuỗi, mỗi chuỗi phải khớp đúng 1 lần, chặn từ cấm mới, backup vào `backups/`, readback + kiểm tra permalink 200.
- `tools/remove_editorial_notes.mjs <id> [--h1] [--h2seo] [--dry]` — gỡ ghi chú SEO nội bộ.
- `tools/kw-fixes/*.json` — danh sách thay thế đã áp dụng cho từng trang.
