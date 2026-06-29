# Review gate SEO Tuần 1 - trước khi tạo draft WordPress

Áp dụng cho 4 bài trong `docs/SEO_WEEK1_ASSIGNMENTS_2026-06-03.md`.


## Luồng xử lý khi nhận bài

1. Lưu bài Markdown vào đường dẫn dự kiến trong `docs/SEO_WEEK1_SUBMISSION_REVIEW_2026-06.csv`.
2. Kiểm bài có đủ metadata: Meta Title, Meta Description, URL slug, Focus Keyword.
3. Kiểm dòng cuối bài:

```markdown
Tác giả: [Nguyễn Song Hào](https://thongtaccongquangninh.com/author/nguyensonghao/)
```

4. Kiểm trùng lặp với URL live cùng cụm.
7. Kiểm Image Brief: 3-5 ảnh, có vị trí chèn, alt, caption, phân biệt ảnh thực tế/ảnh minh họa.
8. Chạy `tools/seo_score.py` nếu file đã đủ metadata.
9. Chạy `tools/create_image_seo_brief.mjs` sau khi nội dung pass.
10. Chỉ tạo draft WordPress khi `decision=READY_TO_DRAFT`.

## Gate 1 - Trùng lặp nội dung

Mỗi bài phải đối chiếu ít nhất với các URL live cùng cụm trong bảng dưới.

| Bài | URL live cần đối chiếu |
|---|---|
| `dau-hieu-be-phot-day-khach-san-ha-long` | `/hut-be-phot-ha-long/`, `/hut-be-phot-bai-chay/`, `/dau-hieu-be-phot-can-hut/`, `/chu-ky-hut-be-phot/` |
| `thong-tac-cong-bep-nha-hang-ha-long` | `/thong-tac-cong-nha-hang-ha-long/`, `/thong-tac-chau-rua-quang-ninh/`, `/hoa-chat-tu-thong-cong/`, `/cach-xu-ly-cong-thoat-nuoc-tac/` |
| `bon-cau-khach-san-bai-chay-bi-tac` | `/thong-tac-bon-cau-ha-long/`, `/thong-tac-bon-cau-khach-san-quang-ninh-2026/`, `/thong-tac-bon-cau-bi-tac/`, `/bon-cau-rut-cham-nguyen-nhan/` |
| `nao-vet-ho-ga-nha-hang-ha-long-mua-mua` | `/nao-vet-ho-ga-quang-ninh/`, `/nao-vet-ho-ga/`, `/thong-tac-cong-nha-hang-ha-long/`, `/xu-ly-mui-hoi-quang-ninh/` |

Chặn tạo draft nếu:

- Mở bài giống bài live cùng cụm.
- H2/H3 lặp y hệt theo thứ tự.
- Bảng giá/cam kết/quy trình copy nguyên xi.
- FAQ chỉ thay địa danh.
- Case/tình huống dùng lại từ bài khác.

## Gate 2 - Cấu trúc SEO

- Meta Title 60-70 ký tự.
- Meta Description 150-160 ký tự, có hotline.
- 1 H1 duy nhất.
- Có H2 nguyên nhân/dấu hiệu.
- Có bảng giá hoặc yếu tố ảnh hưởng giá.
- Có quy trình xử lý.
- Có NAP liên hệ.
- Có FAQ 3-4 câu voice search.
- CTA hotline ở giữa và cuối bài.

## Gate 3 - Local entity và E-E-A-T

- Có bối cảnh riêng theo ngách đã giao.
- Nếu chưa có bằng chứng, dùng `tình huống thường gặp`.
- Có cảnh báo an toàn khi nhắc hóa chất, khí hôi, hố ga, bể phốt, nước thải.

## Gate 4 - Ảnh SEO

- Ảnh nguồn phải lấy từ `D:\.thongtaccongquangninh\Ảnh cung cấp` khi bước xử lý ảnh bắt đầu.
- Ảnh xuất sang `D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO`.
- Nếu thiếu ảnh, ghi rõ thiếu chủ đề nào, ví dụ: `thiếu 1 ảnh hố ga bếp nhà hàng Hạ Long sau mưa`.

## Gate 5 - Quyết định

| Decision | Ý nghĩa |
|---|---|
| `PENDING_IMAGE_BRIEF` | Nội dung tạm đạt nhưng thiếu Image Brief |
| `READY_TO_DRAFT` | Đủ nội dung + Image Brief, được tạo draft WordPress |

## Lệnh kiểm gợi ý

```bash
python3 tools/seo_score.py content-drafts/week1/<file>.md "<focus keyword>"
node tools/create_image_seo_brief.mjs content-drafts/week1/<file>.md
node tools/check_image_seo_gate.mjs content-drafts/week1/<file>.md
```

Nếu các tool chưa chạy được vì file chưa tồn tại, để trạng thái `WAITING_SUBMISSION`.
