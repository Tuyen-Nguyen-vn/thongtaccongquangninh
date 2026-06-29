# P1 Hút Bể Phốt Đông Triều Cleanup - 2026-06-05

## Phạm vi
- Target: `/hut-be-phot-dong-trieu/`.
- Lỗi trước sửa: `FORBIDDEN_WORD` với từ `hàng đầu`, case study dùng `Bình Dương` dễ gây hiểu nhầm và có claim quá cụ thể không đủ bằng chứng.
- Score trước sửa theo `reports/seo-full-audit-2026-06-05.json`: `92`, severity `HIGH`.

## Thay đổi đã apply
- Sửa nguồn draft: `content-drafts/hut-be-phot-dong-trieu-optimized.md`.
- Bỏ cụm `chất lượng hàng đầu`.
- Rewrite phần nguyên nhân và case study để bám Đông Triều rõ hơn: Tràng An, Việt Dân, An Sinh, Mạo Khê.
- Thay case `Bình Dương` bằng tình huống khu nhà vườn Mạo Khê, bỏ mốc tháng, khối lượng và nhận xét khách hàng không có bằng chứng.
- Chuẩn hóa meta description mới 157 ký tự, có hotline.
- Siết script verify `tools/fix_hut_be_phot_dong_trieu_p1_2026_06_04.mjs` để gate từ cấm và `Bình Dương`.
- Cập nhật plugin `ttcqn-doorway-schema` version `2026.06.05.1` cho page ID 56 để title/description schema override đồng bộ.

## Backup và artifact
- Page backup: `seo-revisions/wp-before-p1-hut-be-phot-dong-trieu-2026-06-04T18-04-05-262Z/`.
- Dry-run: `reports/p1-hut-be-phot-dong-trieu-fix-dryrun-2026-06-04T18-03-09-232Z.json`.
- Apply report: `reports/p1-hut-be-phot-dong-trieu-fix-apply-2026-06-04T18-04-05-262Z.json`.
- Plugin schema backup: `backups/ttcqn-doorway-schema-before-hbp-dong-trieu-2026-06-05/`.
- Plugin schema upload report: `WORDPRESS_DOORWAY_SCHEMA_UPLOAD_2026-05-30.json`.

## Public verify
- HTTP: 200.
- Canonical: `https://thongtaccongquangninh.com/hut-be-phot-dong-trieu/`.
- Title length: 66.
- Meta description length: 157.
- H1: 1.
- Word count theo audit SEO full: 2676.
- Required H2: đủ Nguyên nhân, Tại sao chọn/Cam kết, Bảng giá, Quy trình, NAP/Liên hệ, FAQ.
- Schema: LocalBusiness, HomeAndConstructionBusiness, BreadcrumbList, FAQPage, Service.
- Image SEO target: 3 ảnh, không có issue.
- Từ cấm public: không còn `hàng đầu`, `chuyên nghiệp`, `uy tín`, `tận tâm`.
- Public HTML không còn `Bình Dương`.

## Re-audit
- SEO full audit: `reports/seo-full-audit-2026-06-05.md`.
- Target sau sửa: `score=100`, `severity=PASS`, `probs=[]`.
- Tổng site sau batch: 78 URL audit, PASS 26, FAIL 20, WARN 32.
- URL inventory: `WP_URL_AUDIT_REPORT_2026-06-05.md` - 89 public URL, duplicate groups 0, similar pairs 1.
- Image audit: `reports/wp-unique-image-audit-2026-06-05T01-04-31.md` - toàn site còn 2 page issue ảnh và 8 global reuse groups; target không phát sinh lỗi ảnh.

## Ghi chú
- Không chạy MCP smoke vì không chạm connector/MCP. Các thay đổi live đã verify bằng REST apply, plugin upload report, public HTML cache-buster và audit live.
- Việc tiếp theo nên làm: xử lý `/hoa-chat-tu-thong-cong/` vì còn từ cấm `chuyên nghiệp` x3.
