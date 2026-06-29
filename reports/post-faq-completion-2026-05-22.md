# Hoàn tất FAQ schema cho Cẩm nang 2026-05-22

Thời gian kiểm: 2026-05-22 23:49 +07

## Phạm vi

- Hai bài còn thiếu FAQ thật:
  - `https://thongtaccongquangninh.com/dau-hieu-be-phot-can-hut/`
  - `https://thongtaccongquangninh.com/cach-xu-ly-cong-thoat-nuoc-tac/`

## Backup

- Đã backup nội dung trước khi sửa tại `backups/post-faq-before-2026-05-22/`.
- File cập nhật WordPress: `WORDPRESS_POST_FAQ_UPDATE_2026-05-22.json`.

## Đã sửa

- Thêm block `Câu hỏi thường gặp` hiển thị thật vào 2 bài.
- Mỗi bài có 4 cặp hỏi/đáp đúng intent:
  - Dấu hiệu bể phốt cần hút: phân biệt bể đầy/tắc cục bộ, chu kỳ hút, xử lý mùi hôi, xử lý trong ngày.
  - Cách xử lý cống thoát nước tắc: tự xử lý tắc nhẹ, khi không dùng hóa chất, nguyên nhân tắc lặp lại, thời gian thợ xử lý.
- Xóa 1 cụm nội dung lặp ở cuối mỗi bài: `Phân tích thêm trước khi quyết định xử lý` + `Checklist an toàn`.

## Kết quả live 2 bài

| URL | HTTP | BlogPosting | FAQPage | Số câu FAQ | JSON-LD lỗi | Nội dung lặp còn lại |
|---|---:|---:|---:|---:|---:|---:|
| `/dau-hieu-be-phot-can-hut/` | 200 | 1 | 1 | 4 | 0 | 1 lần |
| `/cach-xu-ly-cong-thoat-nuoc-tac/` | 200 | 1 | 1 | 4 | 0 | 1 lần |

## Audit toàn bộ Cẩm nang sau sửa

| Hạng mục | Kết quả |
|---|---:|
| URL Cẩm nang public kiểm qua REST | 23 |
| HTTP 200 sau redirect | 23/23 |
| Thiếu `BlogPosting` | 0 |
| Thiếu `FAQPage` | 0 |
| JSON-LD parse error | 0 |

## Việc tiếp theo

Rà 23 bài Cẩm nang còn thiếu ảnh đại diện/ảnh đầu bài để cải thiện CTR và giao diện archive.
