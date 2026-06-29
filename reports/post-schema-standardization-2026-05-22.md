# Chuẩn hóa schema Cẩm nang 2026-05-22

Thời gian kiểm: 2026-05-22 23:39 +07

## Phạm vi

- Audit toàn bộ post public qua REST API WordPress: 23 mục.
- Kiểm live từng URL bằng `?nowprocket=1` và cache-buster.
- Riêng bài `chi-phi-hut-be-phot-quang-ninh` đang 301 sang `https://thongtaccongquangninh.com/chi-phi-hut-be-phot-quang-ninh-2/`; URL đích là page ID 2025 nhưng vẫn thuộc nhóm Cẩm nang nên được gắn `BlogPosting`.

## Đã triển khai

- Nâng `TTCQN Service Schema` lên version `2026.05.22.3`.
- Thêm `BlogPosting` JSON-LD cho toàn bộ bài Cẩm nang public.
- Thêm ngoại lệ article schema cho page ID 2025: `chi-phi-hut-be-phot-quang-ninh-2`.
- Chỉ thêm `FAQPage` khi nội dung thật có cặp hỏi/đáp hiển thị trong bài, không tạo FAQ ẩn.
- Xóa đoạn JSON-LD bị escape trong nội dung front-end để không còn hiện `&lt;script type="application/ld+json"&gt;` như văn bản.

## Kết quả live

| Hạng mục | Kết quả |
|---|---:|
| URL Cẩm nang kiểm sau redirect | 23 |
| HTTP 200 sau redirect | 23/23 |
| Có `BlogPosting` | 23/23 |
| Có marker `data-ttcqn-post-schema` cho BlogPosting | 23/23 |
| JSON-LD parse error | 0 |
| Bài có `FAQPage` | 23/23 sau follow-up |
| Đoạn JSON-LD bị escape còn hiển thị | 0 |

## Ghi chú

- Hai bài `cach-xu-ly-cong-thoat-nuoc-tac` và `dau-hieu-be-phot-can-hut` đã được bổ sung FAQ thật trong follow-up `reports/post-faq-completion-2026-05-22.md`; audit lại cho thấy 23/23 bài có `FAQPage`.
- Một redirect hợp lệ còn tồn tại: `chi-phi-hut-be-phot-quang-ninh` -> `chi-phi-hut-be-phot-quang-ninh-2`.
- Không sửa Rank Math global options.

## Kiểm hồi quy

- `php -l tools/wp-plugins/ttcqn-doorway-schema/ttcqn-doorway-schema.php`: OK.
- `python3 tools/_pack_zips.py`: OK.
- Upload plugin qua MCP `plugins/upload-base64`: success.
- Hồi quy schema dịch vụ:
  - `/thong-tac-bon-cau-quang-ninh/`: HTTP 200, `Service` còn hoạt động.
  - `/bang-gia/`: HTTP 200, `OfferCatalog` còn hoạt động.
  - `/lien-he/`: HTTP 200, `ContactPage` còn hoạt động.
  - `/hut-be-phot-ha-long/`: HTTP 200, doorway `Service` còn hoạt động.
  - Trang chủ: HTTP 200, home schema marker còn hoạt động, không bị inject post schema.

## Việc tiếp theo

Rà 23 bài Cẩm nang còn thiếu ảnh đại diện/ảnh đầu bài để cải thiện CTR và giao diện archive.
