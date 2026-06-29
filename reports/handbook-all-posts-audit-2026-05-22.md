# Audit toàn bộ bài Cẩm nang - 2026-05-22

## Phạm vi

- Audit 23 bài public từ WP REST posts endpoint, tương ứng luồng bài viết của /blog/.
- Kiểm live HTML từng bài với cache-buster.
- Kiểm title, meta description, canonical, H1, robots, og:image, featured image, ảnh lỗi, Markdown artifact, category và intent Cẩm nang.

## Tổng quan

- HTTP 200: 23/23.
- Điểm trung bình: 83/100.
- Thiếu featured image: 14/23.
- Còn Markdown **: 1/23.
- H1 sai số lượng: 0/23.
- Còn Uncategorized: 20/23.
- Landing địa phương lẫn Cẩm nang: 11/23.
- OG image lỗi/thiếu: 1/23.

## Bài cần xử lý

| # | Slug | Điểm | Featured | Vấn đề |
|---|---|---:|---:|---|
| 1 | `thong-tac-cong-gieng-day-2` | 84 | 2196 | còn category Uncategorized; intent landing địa phương đang nằm trong luồng Cẩm nang |
| 2 | `thong-tac-cong-cao-xanh-2` | 84 | 2196 | còn category Uncategorized; intent landing địa phương đang nằm trong luồng Cẩm nang |
| 3 | `thong-tac-cong-bai-chay` | 76 | 2196 | còn Markdown ** trong nội dung/excerpt; còn category Uncategorized; intent landing địa phương đang nằm trong luồng Cẩm nang |
| 4 | `thong-tac-cong-hong-gai-2` | 84 | 2196 | còn category Uncategorized; intent landing địa phương đang nằm trong luồng Cẩm nang |
| 5 | `hut-be-phot-tien-yen-2` | 84 | 2197 | còn category Uncategorized; intent landing địa phương đang nằm trong luồng Cẩm nang |
| 6 | `hut-be-phot-hai-ha-2` | 84 | 2197 | còn category Uncategorized; intent landing địa phương đang nằm trong luồng Cẩm nang |
| 7 | `hut-be-phot-dam-ha-2` | 76 | 0 | thiếu featured image; còn category Uncategorized; intent landing địa phương đang nằm trong luồng Cẩm nang |
| 8 | `hut-be-phot-co-to-2` | 76 | 0 | thiếu featured image; còn category Uncategorized; intent landing địa phương đang nằm trong luồng Cẩm nang |
| 9 | `hut-be-phot-binh-lieu-2` | 76 | 0 | thiếu featured image; còn category Uncategorized; intent landing địa phương đang nằm trong luồng Cẩm nang |
| 10 | `hut-be-phot-ba-che-2` | 76 | 0 | thiếu featured image; còn category Uncategorized; intent landing địa phương đang nằm trong luồng Cẩm nang |
| 11 | `mui-hoi-cong-nguyen-nhan-xu-ly-4` | 84 | 0 | thiếu featured image; còn category Uncategorized |
| 12 | `hoa-chat-tu-thong-cong-3` | 84 | 0 | thiếu featured image; còn category Uncategorized |
| 13 | `chu-ky-hut-be-phot-3` | 84 | 0 | thiếu featured image; còn category Uncategorized |
| 14 | `bon-cau-rut-cham-nguyen-nhan-3` | 84 | 0 | thiếu featured image; còn category Uncategorized |
| 15 | `thong-tac-cong-tuan-chau` | 76 | 0 | thiếu featured image; còn category Uncategorized; intent landing địa phương đang nằm trong luồng Cẩm nang |
| 16 | `chi-phi-hut-be-phot-quang-ninh` | 76 | 0 | canonical không khớp link; thiếu featured image; còn category Uncategorized |
| 17 | `cau-hoi-thuong-gap-thong-tac-cong` | 76 | 0 | thiếu og:image; thiếu featured image; còn category Uncategorized |
| 18 | `xu-ly-mui-hoi-nha-ve-sinh` | 84 | 0 | thiếu featured image; còn category Uncategorized |
| 19 | `nao-vet-ho-ga` | 84 | 0 | thiếu featured image; còn category Uncategorized |
| 20 | `thong-tac-bon-cau-bi-tac` | 84 | 0 | thiếu featured image; còn category Uncategorized |
| 21 | `bang-gia-hut-be-phot-quang-ninh-2026` | 100 | 352 | OK |
| 22 | `cach-xu-ly-cong-thoat-nuoc-tac` | 100 | 348 | OK |
| 23 | `dau-hieu-be-phot-can-hut` | 100 | 352 | OK |

## Ưu tiên sửa

1. Gán featured image cho 14 bài còn thiếu.
2. Loại category `Uncategorized` khỏi các bài Cẩm nang/Blog.
3. Tách landing địa phương khỏi section Cẩm nang nếu muốn section này chỉ là hướng dẫn.
4. Sửa các bài còn Markdown `**...**` trong nội dung hoặc excerpt.
5. Re-audit lại /blog/ và trang chủ sau khi sửa.

## File dữ liệu chi tiết

- `reports/handbook-all-posts-audit-2026-05-22.json`
