# P0 TTC Local Batch - 2026-06-05

## Phạm vi
- Sửa 3 URL P0 Doorway HIGH: `/thong-tac-cong-dong-trieu/`, `/thong-tac-cong-mong-cai/`, `/thong-tac-cong-van-don/`.
- Mục tiêu: đóng lỗi thiếu H2 `Nguyên nhân`, tăng local entity/proof, chuẩn hóa title/meta public, giữ Service + FAQPage schema, loại từ cấm.

## Thay đổi đã apply
- Bổ sung nội dung riêng theo từng địa phương: nguyên nhân, case study E-E-A-T, Cam kết 3 Không, FAQ bản địa hóa, NAP liên hệ.
- Cập nhật title, excerpt/Rank Math meta cho 3 page qua REST API.
- Cập nhật meta public override trong plugin `ttcqn-seo-cleanup-redirects` lên version `2026.06.05.2`.
- Sửa footer site-wide trong plugin `ttcqn-home-emergency-renderer` từ `Kinh nghiệm - Tận tâm` thành `Kinh nghiệm thực tế`, version `2026.06.05.1`.

## Backup và artifact
- Page backup gốc trước apply: `seo-revisions/wp-before-p0-ttc-local-batch-2026-06-04T17-36-51-713Z/`.
- Apply report PASS sau sửa footer: `reports/p0-ttc-local-batch-apply-2026-06-04T17-38-53-703Z.json`.
- Plugin meta backup: `backups/ttcqn-seo-cleanup-redirects-before-ttc-local-p0-2026-06-05/`.
- Renderer footer backup: `backups/ttcqn-home-emergency-renderer-before-footer-forbidden-2026-06-05/`.
- Plugin meta upload report: `WORDPRESS_SEO_CLEANUP_REDIRECTS_UPLOAD_2026-06-04T17-36-37-648Z.json`.

## Public verify
| URL | Status | Title | Meta | Word count | Schema | Kết quả |
|---|---:|---:|---:|---:|---|---|
| `/thong-tac-cong-dong-trieu/` | 200 | 62 | 158 | 2629 | Service, FAQPage | PASS 100 |
| `/thong-tac-cong-mong-cai/` | 200 | 67 | 153 | 2546 | Service, FAQPage | PASS 100 |
| `/thong-tac-cong-van-don/` | 200 | 63 | 152 | 2557 | Service, FAQPage | PASS 100 |

## Re-audit
- SEO full audit: `reports/seo-full-audit-2026-06-05.md` và `reports/seo-full-audit-2026-06-05.json`.
- Tổng quan sau batch: 78 URL audit, PASS 25, FAIL 21, WARN 32.
- 3 URL batch đều `score=100`, `severity=PASS`, không còn `probs`, đủ H2 bắt buộc, không còn từ cấm, ảnh target không có issue.
- URL inventory audit: `WP_URL_AUDIT_REPORT_2026-06-05.md` - 89 public URL, duplicate groups 0, similar pairs 1.
- Image audit: `reports/wp-unique-image-audit-2026-06-05T00-42-45.md` - toàn site còn 2 page có issue ảnh, 8 global reuse groups; không phát sinh lỗi ảnh ở 3 URL batch.

## Ghi chú
- Lần apply đầu đã cập nhật page thành công nhưng fail gate vì footer public chứa từ cấm `tận tâm`; đã sửa đúng nguồn renderer footer và verify lại PASS.
- Không chạy MCP smoke trong batch này vì không chạm connector/MCP; WordPress REST và plugin upload đều đã verify bằng apply script, public HTML và audit live.
- Việc tiếp theo nên làm: xử lý `/hut-be-phot-dong-trieu/` vì audit còn từ cấm `hàng đầu` và cần kiểm lại case study sai địa phương.
