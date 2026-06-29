
## Mục tiêu

- Chuẩn hóa trang dịch vụ địa phương theo Local SEO, E-E-A-T, internal link, schema, FAQ, case study.
- Mọi sửa live phải đi theo chuỗi: audit trước -> backup -> sửa tối thiểu -> kiểm tra kỹ thuật -> báo cáo.



## Tiêu chuẩn bắt buộc mỗi trang dịch vụ

- Canonical phải tự trỏ về chính URL đó.
- Nội dung độc bản tối thiểu 30-40% so với trang cùng cụm.
- Tỉ lệ giống nhau giữa các trang phải dưới 70%.
- Có mô tả địa phương riêng.
- Có FAQ riêng, ưu tiên câu hỏi voice search.
- Có LocalBusiness schema riêng, `areaServed` đúng địa bàn.
- Nếu có FAQ hiển thị, FAQPage schema phải khớp nội dung trên trang.
- Có BreadcrumbList schema.
- Title, Meta Description, H1 riêng.
- Ảnh thi công nếu có phải có alt text chứa dịch vụ + địa phương; nếu chưa có ảnh thực địa thì ghi TODO ảnh.
- Bài địa phương mới phải có Image Brief và package ảnh SEO trước khi nghiệm thu/publish; nếu chưa có ảnh thì trạng thái là `PENDING_IMAGE_SEO`.
- Internal link tối thiểu: trang dịch vụ chính, trang liên quan cùng địa bàn, FAQ tổng hợp, liên hệ.
- Sau sửa phải kiểm tra mobile/desktop, CTA gọi điện, Zalo nếu có, link 404, schema JSON, canonical, robots, sitemap.

## Audit trước khi sửa từng trang

Mỗi trang phải có bảng audit gồm:

| Trường | Nội dung cần lấy |
| --- | --- |
| URL | URL live hiện tại |
| Post ID | ID WordPress |
| Title hiện tại | Title bài/trang |
| Meta title | Rank Math hoặc title live |
| Meta description | Rank Math/excerpt/meta live |
| H1 | H1 live |
| Canonical | Canonical live |
| Robots meta | Robots live |
| Schema | Loại schema đang có |
| FAQ hiện tại | Danh sách FAQ hiển thị |
| Internal link | Danh sách link nội bộ |
| Ảnh + alt | Danh sách ảnh quan trọng và alt |
| Vấn đề | Trùng lặp, thiếu schema, case study copy, link thiếu, ảnh thiếu alt |

## Nhóm triển khai

### Nhóm 1 - Trang thành phố

- `/hut-be-phot-ha-long/`
- `/hut-be-phot-uong-bi/`
- `/hut-be-phot-quang-yen/`
- `/hut-be-phot-cam-pha/`
- `/thong-tac-cong-ha-long/`
- `/thong-tac-cong-cam-pha/`
- `/thong-tac-cong-uong-bi/`
- `/thong-tac-cong-quang-yen/`

### Nhóm 2 - FAQ tổng hợp

- URL ưu tiên: `/cau-hoi-thuong-gap/` nếu chưa có trang phù hợp.

### Nhóm 3 - Trang phường

- `/thong-tac-cong-bai-chay-ha-long/`
- `/thong-tac-cong-cao-xanh-ha-long/`
- `/thong-tac-cong-hong-gai-ha-long/`
- `/hut-be-phot-tuan-chau-ha-long/`
- `/thong-tac-cong-gieng-day-ha-long/`

## Thứ tự triển khai theo tuần

- Tuần 1: Hạ Long, schema Hạ Long, canonical audit Hạ Long, GSC index check.
- Tuần 2: Uông Bí, Quảng Yên, Cẩm Phả, internal link audit.
- Tuần 3: FAQ tổng hợp, Bãi Cháy, Cao Xanh.
- Tuần 4: Hồng Gai, Tuần Châu, Giếng Đáy, schema hoàn chỉnh, sitemap và request index.

## Báo cáo sau sửa

Sau mỗi batch phải báo cáo:

- URL đã sửa.
- File/script/report/post đã chỉnh.
- Nội dung đã thay đổi: mở bài, case study, FAQ, CTA.
- SEO meta đã thay đổi: Title, Meta Description, Canonical.
- Schema đã thêm/sửa.
- Internal link đã thêm.
- TODO còn lại: ảnh, review, GSC inspection.
- Trạng thái Image SEO: `READY_FOR_REVIEW` hoặc `PENDING_IMAGE_SEO`.
- Rủi ro còn tồn tại.
- Hướng dẫn kiểm tra sau deploy trong GSC.

## Gate Image SEO trước nghiệm thu/publish

Sau khi viết xong bài địa phương:

1. Tạo brief:

```powershell
node .\tools\create_image_seo_brief.mjs <file-md>
```

2. Gửi brief trong `image-briefs\` sang ChatGPT/Image Agent.
3. Nhận lại ảnh, tên file, alt text, caption và vị trí gắn.
4. Lưu package ảnh tại `image-briefs\<slug>-image-package.json`.
5. Chạy gate:

```powershell
node .\tools\check_image_seo_gate.mjs <file-md-or-slug>
```

Nếu gate trả `PENDING_IMAGE_SEO`, dừng publish và báo rõ ảnh SEO còn thiếu.

## Lệnh gợi ý

```powershell
node .\tools\audit_live_seo_page.mjs hut-be-phot-ha-long
node .\tools\audit_live_links_assets.mjs
node .\tools\create_image_seo_brief.mjs .\content-drafts\thong-tac-cong-bai-chay-rankmath-draft.md
node .\tools\check_image_seo_gate.mjs .\content-drafts\thong-tac-cong-bai-chay-rankmath-draft.md
```
