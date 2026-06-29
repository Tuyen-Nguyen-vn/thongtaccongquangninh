# Báo cáo sửa chống Doorway - Hạ Long - 2026-05-05

## Phạm vi đã làm live

- URL: `https://thongtaccongquangninh.com/hut-be-phot-ha-long/`
- WordPress: page ID `52`, trạng thái `publish`.
- Không đổi URL, không đổi slug, không redirect mới, không noindex, không đổi canonical.
- Backup trước sửa:
  `D:\.thongtaccongquangninh\seo-revisions\wp-before-doorway-safe-hut-be-phot-ha-long-2026-05-05T16-35-57-539Z\pages-52-hut-be-phot-ha-long.json`

## File/script đã chỉnh

- `AGENTS.md`: thêm quy trình Local SEO chống Doorway.
- `LOCAL_SEO_DOORWAY_SAFE_WORKFLOW_2026-05-05.md`: lưu quy trình audit/sửa an toàn.
- `tools/audit_doorway_safe_page.mjs`: script audit theo bảng trước sửa.
- `tools/fix_hut_be_phot_ha_long_doorway_safe.mjs`: script backup và sửa tối thiểu page Hạ Long.
- `WORDPRESS_UPDATE_HUT_BE_PHOT_HA_LONG_DOORWAY_SAFE_2026-05-05.json`: log cập nhật WordPress.

## Nội dung đã thay đổi

- Bổ sung tín hiệu địa phương trong mở bài: `Hồng Hải`, `Hồng Hà`, `Giếng Đáy`.
- Sửa lặp địa bàn trong NAP: bỏ cụm `Hạ Long, Hạ Long`.
- Thêm đoạn link liên quan tại Hạ Long:
  - `/hut-be-phot/`
  - `/thong-tac-cong-ha-long/`
  - `/thong-tac-bon-cau-ha-long/`
  - `/cau-hoi-thuong-gap-thong-tac-cong/`
  - `/lien-he/`
- Giữ nguyên case study Bãi Cháy và FAQ hiển thị hiện có.

## SEO meta

- Meta Title giữ nguyên: `Hút bể phốt Hạ Long 24/7, hút sạch, báo giá rõ, có mặt nhanh`
- Meta Description giữ nguyên: `Hút bể phốt Hạ Long 24/7, xe bồn hút sạch, không tràn bẩn, báo giá rõ. Gọi 0963.953.533 / 0931.156.756 để xử lý bể đầy, mùi hôi ngay trong ngày tại nhà.`
- Canonical giữ self-reference: `https://thongtaccongquangninh.com/hut-be-phot-ha-long/`
- Robots: `index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large`

## Schema

- Trước sửa: có LocalBusiness + BreadcrumbList nhưng thiếu FAQPage.
- Sau sửa: có LocalBusiness, BreadcrumbList, FAQPage.
- FAQPage schema khớp 4 FAQ đang hiển thị trên trang.

## Kiểm tra sau sửa

- `node .\tools\audit_doorway_safe_page.mjs hut-be-phot-ha-long`: `0` issue.
- `node .\tools\audit_live_seo_page.mjs hut-be-phot-ha-long`: `100/100`.
- Word count sau sửa: `2829`.
- Keyword density: `1.17%`.
- H1 live: `1`.
- Nội dung không có từ cấm, không emoji.
- Live HTML: HTTP `200`.
- Sitemap `page-sitemap.xml`: có URL Hạ Long.
- Internal link trong trang: kiểm `25` link, không có 404.
- CTA gọi điện: có `tel:` cho hotline.
- Zalo: có link/nút Zalo.
- Screenshot desktop: `reports\visual-hut-be-phot-ha-long-desktop-2026-05-05.png`.
- Screenshot mobile: `reports\visual-hut-be-phot-ha-long-mobile-2026-05-05.png`.

## Report audit

- Audit chống Doorway: `D:\.thongtaccongquangninh\reports\doorway-audit-hut-be-phot-ha-long-2026-05-05.md`
- JSON chi tiết: `D:\.thongtaccongquangninh\reports\doorway-audit-hut-be-phot-ha-long-2026-05-05.json`
- Gate SEO live: `D:\.thongtaccongquangninh\reports\website-check-hut-be-phot-ha-long-2026-05-05.md`
- HTML live sau sửa: `D:\.thongtaccongquangninh\reports\tmp-hut-be-phot-ha-long-after-doorway-fix.html`

## Rủi ro còn tồn tại

- Rủi ro Doorway toàn cụm chưa đóng vì các trang còn lại trong nhóm hút bể phốt vẫn giống Hạ Long khoảng `81%` theo kiểm tra shingle 5 từ:
  - Hạ Long vs Uông Bí: `81.52%`
  - Hạ Long vs Quảng Yên: `81.55%`
  - Hạ Long vs Cẩm Phả: `81.18%`
- `/hut-be-phot/` đang redirect về `/hut-be-phot-quang-ninh/`; đã thêm theo yêu cầu, nhưng về SEO nên cân nhắc dùng URL đích chính nếu muốn tránh internal link qua redirect.
- Chưa kiểm GSC URL Inspection vì cần thao tác/quyền GSC.
- Ảnh thực địa Hạ Long mới có alt bản địa trên ảnh xe dùng chung; vẫn nên bổ sung ảnh thực địa riêng nếu có.

## Việc tiếp theo

- Tuần 2 theo kế hoạch: audit và rewrite độc bản cho `/hut-be-phot-uong-bi/`, `/hut-be-phot-quang-yen/`, `/hut-be-phot-cam-pha/`.
- Mục tiêu bắt buộc: kéo tỉ lệ giống nhau xuống dưới `70%`, tốt hơn là dưới `60%` ở các đoạn mở bài, địa phương, case study, FAQ.
- Sau mỗi trang: chạy lại audit Doorway, gate Rank Math, link 404, canonical/robots/schema.

## GSC sau deploy

- Vào Google Search Console.
- Chạy URL Inspection cho `https://thongtaccongquangninh.com/hut-be-phot-ha-long/`.
- Kiểm tra trạng thái indexed, canonical do Google chọn, sitemap và last crawl.
- Nếu HTML live đã ổn, bấm Request Indexing.
