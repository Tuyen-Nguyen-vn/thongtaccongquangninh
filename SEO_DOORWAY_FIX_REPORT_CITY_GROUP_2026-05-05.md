# Báo cáo sửa Local SEO chống Doorway - Nhóm thành phố

Ngày thực hiện: 2026-05-05  
Website: `https://thongtaccongquangninh.com`  
Phạm vi đã xử lý live: 8 trang dịch vụ địa phương hiện có theo thành phố.

## 1. URL đã sửa live

| Nhóm | URL | Post ID | Trạng thái |
|---|---:|---:|---|
| Hút bể phốt | `https://thongtaccongquangninh.com/hut-be-phot-ha-long/` | 52 | Đã sửa live |
| Hút bể phốt | `https://thongtaccongquangninh.com/hut-be-phot-uong-bi/` | 54 | Đã sửa live |
| Hút bể phốt | `https://thongtaccongquangninh.com/hut-be-phot-quang-yen/` | 57 | Đã sửa live |
| Hút bể phốt | `https://thongtaccongquangninh.com/hut-be-phot-cam-pha/` | 53 | Đã sửa live |
| Thông tắc cống | `https://thongtaccongquangninh.com/thong-tac-cong-ha-long/` | 296 | Đã sửa live |
| Thông tắc cống | `https://thongtaccongquangninh.com/thong-tac-cong-cam-pha/` | 400 | Đã sửa live |
| Thông tắc cống | `https://thongtaccongquangninh.com/thong-tac-cong-uong-bi/` | 405 | Đã sửa live |
| Thông tắc cống | `https://thongtaccongquangninh.com/thong-tac-cong-quang-yen/` | 424 | Đã sửa live |

## 2. File, script và backup

- Workflow chuẩn: `LOCAL_SEO_DOORWAY_SAFE_WORKFLOW_2026-05-05.md`.
- Script cập nhật batch: `tools/fix_city_pages_doorway_safe.mjs`.
- Script sửa meta description nhóm thông tắc: `tools/fix_city_meta_descriptions.mjs`.
- Script audit Doorway/live SEO: `tools/audit_doorway_safe_page.mjs`, `tools/audit_live_seo_page.mjs`.
- Plugin renderer riêng cho trang bị filter cũ: `tools/wp-plugins/ttcqn-doorway-safe-renderer/`.
- File zip plugin: `tools/wp-plugins/ttcqn-doorway-safe-renderer.zip`.
- Backup chính trước batch live:
  `D:\.thongtaccongquangninh\seo-revisions\wp-before-city-doorway-safe-2026-05-05T16-58-49-651Z\`
- Backup bổ sung trước xử lý renderer trang `thong-tac-cong-ha-long`:
  `D:\.thongtaccongquangninh\seo-revisions\wp-before-disable-elementor-thong-tac-cong-ha-long-2026-05-05T17-03-15-352Z\`
- Backup trước sửa meta description nhóm thông tắc:
  `D:\.thongtaccongquangninh\seo-revisions\wp-before-city-meta-descriptions-2026-05-05T17-34-02-378Z\`

## 3. Nội dung đã thay đổi

- Viết lại mở bài theo từng địa bàn: Hạ Long, Uông Bí, Quảng Yên, Cẩm Phả.
- Thêm đoạn đặc thù địa phương riêng cho từng trang: tuyến phố, khu dân cư, nhà hàng, khách sạn, khu công nghiệp, nhà trọ, ngõ hẹp, đường dốc, khu mỏ hoặc khu du lịch.
- Thêm case study riêng cho từng địa bàn, không copy nguyên văn giữa các trang.
- Thêm FAQ riêng theo kiểu voice search, khớp với nội dung hiển thị trên trang.
- Bổ sung CTA hotline giữa và cuối bài với **0963.953.533 / 0931.156.756**.
- Bổ sung TODO ảnh thực địa trong nội dung khi chưa có ảnh thi công thật để tránh bịa ảnh.

## 4. SEO meta và index

- Giữ nguyên URL và slug hiện tại.
- Giữ canonical tự trỏ về chính URL.
- Robots meta kiểm tra sau sửa: `index, follow`.
- Không xóa bài, không redirect, không đặt `noindex`, không canonical sang trang khác.
- Title, H1 và nội dung chính được chuẩn hóa theo keyword từng trang.
- Rank Math/meta được chỉnh hẹp: sửa excerpt/meta description nhóm thông tắc để bỏ câu gượng ở cuối và giữ độ dài 150-160 ký tự.

## 5. Schema đã thêm/sửa

Mỗi trang đã có schema riêng:

- `LocalBusiness`: `areaServed` và `addressLocality` theo từng địa bàn.
- `FAQPage`: câu hỏi/trả lời khớp với FAQ hiển thị trên trang.
- `BreadcrumbList`: đúng phân cấp trang dịch vụ.

Schema không dùng chung y hệt giữa các trang. Trang `thong-tac-cong-ha-long` có thêm renderer plugin để đảm bảo HTML/schema mới hiển thị trên live do theme/filter cũ đang ghi đè `the_content`.

## 6. Internal link đã thêm

Mỗi trang có link về:

- Trang dịch vụ chính: `/hut-be-phot/` hoặc trang thông tắc liên quan.
- Trang cùng địa bàn/cùng nhóm dịch vụ.
- Trang bồn cầu liên quan khi có URL phù hợp.
- Trang FAQ tổng hợp hiện có: `/cau-hoi-thuong-gap-thong-tac-cong/`.
- Trang liên hệ: `/lien-he/`.

Kết quả audit link:

- Tổng link nội bộ duy nhất kiểm tra: 29.
- Link 404 phát hiện: 0.
- Số link nội bộ mỗi trang: 23-25 link.

## 7. Kết quả quality gate

| Slug | Word count | Mật độ keyword preflight | Điểm live SEO |
|---|---:|---:|---:|
| `hut-be-phot-ha-long` | 2661 | 0.94% | 100/100 |
| `hut-be-phot-uong-bi` | 2667 | 0.94% | 100/100 |
| `hut-be-phot-quang-yen` | 2613 | 0.92% | 95/100 |
| `hut-be-phot-cam-pha` | 2600 | 0.92% | 100/100 |
| `thong-tac-cong-ha-long` | 2563 | 0.98% | 100/100 |
| `thong-tac-cong-cam-pha` | 2512 | 0.96% | 100/100 |
| `thong-tac-cong-uong-bi` | 2547 | 0.98% | 100/100 |
| `thong-tac-cong-quang-yen` | 2526 | 0.95% | 100/100 |

So sánh nội dung cùng nhóm dịch vụ:

- Nhóm hút bể phốt: khoảng 62.31%-63.45%.
- Nhóm thông tắc cống: khoảng 62.27%-62.96%.
- Trang vượt ngưỡng 70%: 0.

Kiểm tra sau sửa:

- Audit Doorway live: 8/8 pass.
- Canonical self-reference: pass.
- Robots `index, follow`: pass.
- FAQ schema khớp nội dung: pass.
- Breadcrumb schema: pass.
- Sitemap `page-sitemap.xml` có đủ 8 URL: pass.
- PHP syntax plugin renderer: pass.
- HTML live trang `thong-tac-cong-ha-long` không còn marker debug: pass.
- Meta description nhóm thông tắc sau sửa: 150-152 ký tự, có keyword và hotline.
- Ảnh chụp mobile/desktop đã lưu tại `reports\visual-*-2026-05-05.png`.

## 8. TODO còn lại

- Ảnh thực địa: cần Tuyền bổ sung ảnh thật theo từng địa bàn để thay TODO ảnh và tối ưu alt/caption.
- GSC: cần inspect thủ công 8 URL sau khi cache ổn định.
- FAQ tổng hợp URL `/cau-hoi-thuong-gap/`: chưa tạo vì live đã có `/cau-hoi-thuong-gap-thong-tac-cong/`; cần quyết định tránh duplicate.
- Trang phường mới như Bãi Cháy, Cao Xanh, Tuần Châu, Giếng Đáy: chưa auto-publish vì quy tắc yêu cầu không publish bài mới khi chưa duyệt.
- Trang `thong-tac-cong-hong-gai-ha-long` đang live, nên audit riêng trước khi sửa ở batch phường.

## 9. Rủi ro còn tồn tại

- Trang `thong-tac-cong-ha-long` cần plugin renderer mục tiêu do filter/theme cũ ghi đè nội dung. Plugin hiện chỉ áp dụng cho page ID 296 và cần giữ bật cho tới khi xử lý triệt để nguồn filter cũ.
- Chưa thể xác nhận Google đã re-crawl nội dung mới nếu chưa dùng GSC URL Inspection.
- Ảnh thực địa chưa có đủ, nên tín hiệu E-E-A-T hình ảnh còn thiếu.
- Nếu cache/CDN thay đổi, cần recheck lại 8 URL sau deploy/cache purge.

## 10. Hướng dẫn kiểm tra sau deploy/GSC

1. Mở Google Search Console.
2. Inspect từng URL trong danh sách 8 trang đã sửa.
3. Kiểm tra `User-declared canonical` và `Google-selected canonical`.
4. Nếu URL vẫn index bình thường, bấm `Request indexing`.
5. Sau 24-72 giờ, kiểm tra lại Coverage, Enhancements và Page indexing.
6. Nếu thấy schema warning, lấy URL chạy lại Rich Results Test trước khi sửa.
