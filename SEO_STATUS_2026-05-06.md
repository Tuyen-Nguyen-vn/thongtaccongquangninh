# Trạng thái SEO - 2026-05-06

## Image SEO gate bắt buộc

- Đã thêm quy trình bắt buộc: `IMAGE_SEO_WORKFLOW_2026-05-06.md`.
- Từ giờ, sau khi viết bài SEO địa phương, agent phải tạo Image Brief và gọi bước ChatGPT/Image Agent trước khi nghiệm thu hoặc publish.
- Nếu chưa có ảnh + tên file + alt text + caption + vị trí chèn, trạng thái là `PENDING_IMAGE_SEO`.
- Ảnh AI/chỉnh sửa chỉ được ghi caption dạng “Ảnh minh họa...”; không ghi “Ảnh thi công thực tế...” nếu chưa xác minh đúng địa bàn.

## Tool đã thêm

- `tools/image_seo_gate.mjs`
- `tools/create_image_seo_brief.mjs`
- `tools/check_image_seo_gate.mjs`

## File đã cập nhật

- `AGENTS.md`
- `CODEX_CONTEXT.md`
- `LOCAL_SEO_DOORWAY_SAFE_WORKFLOW_2026-05-05.md`
- `C:\Users\DELL\Documents\Codex\2026-04-28\chatgpt-apps-plugin-chatgpt-apps-openai\TASKS.md`
- `C:\Users\DELL\Documents\Codex\2026-04-28\chatgpt-apps-plugin-chatgpt-apps-openai\CONNECTOR.md`

## Publish gate đã chặn

Các script sau đã kiểm Image SEO trước khi publish bài địa phương mới:

- `tools/push_new_landing.mjs`
- `tools/publish_uong_bi_bon_cau_if_rankmath_90.mjs`
- `tools/update_quang_yen_bon_cau_page.mjs`
- `tools/push_seo_revisions.mjs`

## Smoke test

- Draft test: `content-drafts\thong-tac-cong-bai-chay-rankmath-draft.md`.
- Content SEO gate: `100/100`.
- Đã tạo Image Brief:
  `image-briefs\thong-tac-cong-bai-chay-image-brief.md`
- Gate ảnh hiện đúng trạng thái:
  `PENDING_IMAGE_SEO`
- Thử publish bằng `tools/push_new_landing.mjs --publish`: đã bị chặn trước khi ghi WordPress vì chưa có image package.

## Cập nhật checklist Image SEO chi tiết

- Đã thêm checklist bắt buộc:
  - Bài có ít nhất 3 ảnh.
  - Ảnh đúng dịch vụ.
  - Ảnh đúng địa phương hoặc caption an toàn.
  - Có ảnh đầu bài, ảnh case study, ảnh quy trình.
  - Tên file không dấu, có keyword/dịch vụ và địa phương nếu phù hợp.
  - Alt text có dịch vụ + địa phương.
  - Caption không bịa “thực tế” nếu chưa xác minh.
  - Ảnh không trùng 100% với trang địa phương khác.
  - Ảnh WebP/JPG, không quá nặng.
  - Không lộ thông tin riêng tư khách hàng.
  - Không lộ mặt khách nếu chưa xin phép.
  - Không dùng poster quảng cáo thay cho ảnh thi công.
- Gate kỹ thuật hiện chặn ảnh thiếu `fileSizeKb/filePath`, ảnh > `450KB`, ảnh không `.webp/.jpg/.jpeg`, ảnh lộ privacy/face chưa phép, poster, reuse nhiều trang hoặc duplicate 100%.
- Đã tạo trang Notion lưu checklist:
  `https://www.notion.so/35788fe5c7e2816ea740ee3655247a95`
- Ghi chú Notion: thử tạo row trong database task bị `validation_error` do chưa fetch được schema hiện hành, nên đã tạo page con dưới `SEO Project — thongtaccongquangninh.com` để lưu checklist an toàn.

## Việc còn lại

- Gửi `image-briefs\thong-tac-cong-bai-chay-image-brief.md` sang ChatGPT/Image Agent.
- Nhận lại 3-5 ảnh + metadata.
- Lưu package tại:
  `image-briefs\thong-tac-cong-bai-chay-image-package.json`
- Gắn ảnh vào draft Bãi Cháy rồi chạy lại `tools/check_image_seo_gate.mjs`.

## Upload ảnh SEO local từ ZIP

- Nguồn ảnh: `C:\Users\DELL\Desktop\anh-seo-local-da-toi-uu-doi-ten.zip`.
- Đã giải nén vào: `_tmp\anh-seo-local-da-toi-uu-doi-ten`.
- Đã upload 10 ảnh WebP lên WordPress Media Library, tất cả ảnh trả HTTP 200 và `content-type: image/webp`.
- Script thực thi: `tools\upload_and_insert_seo_images_from_zip.mjs`.
- Báo cáo upload/chèn: `WORDPRESS_UPLOAD_INSERT_SEO_IMAGES_2026-05-06.json`.
- Báo cáo verify live cuối: `WORDPRESS_FINAL_VERIFY_SEO_IMAGES_2026-05-06.json`.
- Backup trước sửa content: `seo-revisions\wp-before-insert-seo-images-2026-05-06`.
- Riêng `/thong-tac-cong-ha-long/` đã đồng bộ option renderer `ttcqn_doorway_safe_page_296_content_v2`; backup option nằm trong thư mục backup trên.

### URL đã có ảnh mới trong nội dung SEO

- `/gioi-thieu/`
- `/hut-be-phot-ha-long/`
- `/hut-be-phot-quang-yen/`
- `/hut-be-phot-cam-pha/`
- `/hut-be-phot-uong-bi/`
- `/hut-be-phot-quang-ninh/`
- `/nao-vet-ho-ga-quang-ninh/`
- `/thong-tac-bon-cau-ha-long/`
- `/thong-tac-bon-cau-quang-ninh/`
- `/thong-tac-cong-ha-long/`
- `/thong-tac-cong-cam-pha/`
- `/thong-tac-cong-uong-bi/`
- `/thong-tac-cong-quang-yen/`
- `/thong-tac-cong-quang-ninh/`
- `/thong-tac-chau-rua-quang-ninh/`
- `/thong-tac-cong-nha-hang-ha-long/`

### Thiếu ảnh hoặc cần xử lý tiếp

- `/` đã có ảnh trong REST content nhưng live template `page-home.php` chưa render ảnh mới.
- Các URL còn dưới chuẩn tối thiểu 3 ảnh trong phần nội dung bài:
  - `/hut-be-phot-ha-long/`
  - `/hut-be-phot-quang-ninh/`
  - `/hut-be-phot-uong-bi/`
  - `/thong-tac-bon-cau-ha-long/`
  - `/thong-tac-bon-cau-quang-ninh/`
  - `/thong-tac-cong-cam-pha/`
  - `/thong-tac-cong-quang-ninh/`
  - `/thong-tac-cong-uong-bi/`
  - `/thong-tac-cong-quang-yen/`
  - `/thong-tac-chau-rua-quang-ninh/`
  - `/thong-tac-cong-nha-hang-ha-long/`
- Các URL trong mapping ZIP không tồn tại đúng slug live:
  - `/nao-vet-ho-ga/` đã dùng alias `/nao-vet-ho-ga-quang-ninh/`.
  - `/hut-be-phot/` đã dùng alias `/hut-be-phot-quang-ninh/`.
  - `/thong-tac-cong/` đã dùng alias `/thong-tac-cong-quang-ninh/`.
  - `/thong-tac-bon-cau/` đã dùng alias `/thong-tac-bon-cau-quang-ninh/`.
  - `/thong-tac-chau-rua/` đã dùng alias `/thong-tac-chau-rua-quang-ninh/`.
  - `/thong-tac-cong-nha-hang/` đã dùng alias `/thong-tac-cong-nha-hang-ha-long/`.
  - `/thong-tac-cong-bai-chay-ha-long/` chưa có page/post live để chèn ảnh.

## WordPress URL audit inventory

- Đã chạy audit chỉ đọc toàn bộ URL/content WordPress bằng REST API + sitemap.
- Không dùng WP-CLI vì workspace không có `wp-config.php` hoặc `wp-load.php`.
- Auth REST: `context=edit`, lấy được cả nội dung không public.
- File CSV: `wp-url-audit-list.csv`.
- File JSON: `wp-url-audit-list.json`.
- Báo cáo Markdown: `WP_URL_AUDIT_REPORT_2026-05-06.md`.
- Notion page: `https://www.notion.so/35788fe5c7e281edaa28ebf180636981`.
- Tổng dòng audit: 55.
- URL public cần audit SEO: 54.
- Landing page local SEO nghi vấn: 38.
- Status: `publish` 54, `draft` 1.
- Post type: `page` 45, `post` 7, `sitemap_only` 3.
- Cảnh báo: 10 URL REST public không thấy trong sitemap, 84 cặp title giống nhau >=85%, không có title trùng tuyệt đối.
- Xác minh: `node --check` pass, grep script chỉ có WordPress method `GET`, CSV/JSON parse OK.

## SEO Local Audit Strict gate

- Đã tạo skill bắt buộc: `skills\seo-local-audit-strict\SKILL.md`.
- Đã cập nhật `AGENTS.md` để bắt buộc đọc skill trước mọi task viết/sửa SEO, landing page hoặc WordPress.
- Đã cập nhật `CODEX_CONTEXT.md` với cảnh báo lỗi AI SEO máy móc, case/review/claim chưa xác minh, similarity title/excerpt, sitemap và ảnh SEO.
- Đã tạo `TASKS.md` trong workspace để ghi quy trình bắt buộc.
- Đã ghi thêm gate strict vào ChatGPT Apps SEO `C:\Users\DELL\Documents\Codex\2026-04-28\chatgpt-apps-plugin-chatgpt-apps-openai\TASKS.md`.
- Đã tạo checklist machine-readable: `seo-checklists\seo-local-preflight-checklist.json`.
- Đã tạo gate script: `tools\check_seo_local_preflight_gate.mjs`.
- Gate script chặn nghiệm thu nếu thiếu evidence về đọc skill, URL liên quan, similarity, fake case/review, sitemap, image package, frontend live hoặc backup khi sửa.
- Test:
  - `node --check .\tools\check_seo_local_preflight_gate.mjs`: OK.
  - JSON checklist parse OK.
  - Evidence pass trả `ok: true`.
  - Ghi chú cập nhật: gate này đã đổi sang warning-only ở mục `Cập nhật bỏ hard gate SEO strict` bên dưới.

## Phase 1 doorway fix live

- Đã chạy live theo lệnh Tuyền duyệt: `node D:\.thongtaccongquangninh\tools\execute_seo_doorway_fix_phase1.mjs`.
- Backup trước chạy: `backups\wordpress-phase1-before-execute-2026-05-05T21-33-13-647Z.json`.
- Report sau chạy: `WORDPRESS_PHASE1_FIX_REPORT_2026-05-06.json`.
- Kết quả script:
  - Đưa về draft: 10 URL.
  - Rewrite title/excerpt: 31 URL.
  - Lỗi script: 0.
- Verify REST sau chạy:
  - Kiểm tra lại: 41 URL.
  - Draft đúng: 10/10.
  - Rewrite có title/excerpt: 31/31.
  - Vấn đề phát hiện: 0.
- Lưu ý: `wp-url-audit-list.csv/json` là snapshot trước khi chạy phase 1; cần refresh audit nếu dùng làm nguồn trạng thái mới.

## Draft SEO mới - Tuần Châu

- Task nguồn: Notion `Landing phường Tuần Châu — Thông tắc cống`.
- File draft: `content-drafts\thong-tac-cong-tuan-chau-ha-long-rankmath-draft.md`.
- Focus keyword: `thông tắc cống Tuần Châu`.
- Slug đề xuất theo gate hiện tại: `thong-tac-cong-tuan-chau`.
- Content gate: `100/100`.
- Word count: 2989 từ.
- Meta Title: 62 ký tự.
- Meta Description: 154 ký tự.
- Keyword density: 1.00%.
- H1: 1, H2: 13, internal links: 6, hotline CTA: 8.
- Similarity shingle 5 từ so với draft gần nhất:
  - Bãi Cháy: 6.74%.
  - Cao Xanh: 6.60%.
  - Hồng Gai: 7.22%.
- Image Brief đã tạo: `image-briefs\thong-tac-cong-tuan-chau-image-brief.md`.
- Trạng thái ảnh: `PENDING_IMAGE_SEO`; chưa có package ảnh nên không được publish/nghiệm thu live.

## Kiểm tra lại Bãi Cháy và Cao Xanh

- `content-drafts\thong-tac-cong-bai-chay-rankmath-draft.md`:
  - Content gate: `100/100`.
  - Word count: 2788 từ.
  - Keyword density: 1.00%.
  - Image status: `PENDING_IMAGE_SEO`, đã có Image Brief, thiếu image package.
- `content-drafts\thong-tac-cong-cao-xanh-rankmath-draft.md`:
  - Content gate: `100/100`.
  - Word count: 2814 từ.
  - Keyword density: 1.03%.
  - Đã tạo Image Brief: `image-briefs\thong-tac-cong-cao-xanh-image-brief.md`.
  - Image status: `PENDING_IMAGE_SEO`, thiếu image package.

## Draft SEO mới - Giếng Đáy

- Task nguồn: Notion `Landing phường Giếng Đáy — Thông tắc cống`.
- File draft: `content-drafts\thong-tac-cong-gieng-day-ha-long-rankmath-draft.md`.
- Focus keyword: `thông tắc cống Giếng Đáy`.
- Slug đề xuất: `thong-tac-cong-gieng-day`.
- Content gate: `100/100`.
- Word count: 2664 từ.
- Meta Title: 62 ký tự.
- Meta Description: 152 ký tự.
- Keyword density: 1.05%.
- H1: 1, H2: 13, internal links: 6, hotline CTA: 8.
- Similarity shingle 5 từ so với draft gần nhất:
  - Bãi Cháy: 6.88%.
  - Cao Xanh: 6.86%.
  - Tuần Châu: 22.05%.
  - Hồng Gai: 8.65%.
- Image Brief đã tạo: `image-briefs\thong-tac-cong-gieng-day-image-brief.md`.
- Trạng thái ảnh: `PENDING_IMAGE_SEO`; chưa có package ảnh nên không được publish/nghiệm thu live.

## Doorway content batch 2 live

- Lệnh Tuyền yêu cầu: `node .\tools\fix_doorway_content_batch2.mjs`.
- Trước khi chạy live đã vá script để:
  - Có `--dry-run` hoạt động thật.
  - Tự backup REST `context=edit` trước khi ghi.
  - Đổi các `Case study E-E-A-T` chưa xác minh thành `Tình huống thường gặp`.
  - Bỏ chi tiết thời gian/khách hàng cụ thể chưa có nguồn xác minh.
- Dry-run: pass, 7/7 page đọc được, lỗi 0.
- Backup dry-run: `backups\wordpress-before-doorway-batch2-2026-05-05T22-03-24-923Z.json`.
- Backup live: `backups\wordpress-before-doorway-batch2-2026-05-05T22-03-47-525Z.json`.
- Report live: `WORDPRESS_UPDATE_DOORWAY_BATCH2_2026-05-06.json`.
- URL đã update live:
  - `/hut-be-phot-dong-trieu/`
  - `/hut-be-phot-mong-cai/`
  - `/hut-be-phot-van-don/`
  - `/thong-tac-cong-dong-trieu/`
  - `/thong-tac-cong-mong-cai/`
  - `/thong-tac-cong-van-don/`
  - `/thong-tac-bon-cau-ha-long/`
- Verify REST sau chạy:
  - 7/7 URL vẫn `publish`.
  - 7/7 có `LocalBusiness`, `FAQPage`, `BreadcrumbList`.
  - Không còn heading `Case study E-E-A-T` trong content mới.
  - Không phát hiện từ cấm: `chuyên nghiệp`, `uy tín`, `hàng đầu`, `tận tâm`.
- Verify frontend:
  - 7/7 URL trả HTTP 200.
- Lưu ý: batch này chỉ cập nhật nội dung/schema trong post content; chưa xử lý ảnh SEO riêng cho từng trang.

## Cập nhật bỏ hard gate SEO strict

- Theo yêu cầu mới của Tuyền: bỏ hard gate `không bịa case/review/claim` và `không publish/sửa live nếu chưa qua checklist`.
- Đã cập nhật `seo-checklists\seo-local-preflight-checklist.json`: bỏ mục `check_fake_case_review_claim`.
- Đã cập nhật `tools\check_seo_local_preflight_gate.mjs`: thiếu checklist chỉ còn warning, không exit code lỗi.
- Đã cập nhật `AGENTS.md`, `CODEX_CONTEXT.md`, `TASKS.md`, `skills\seo-local-audit-strict\SKILL.md`: quy trình strict chỉ còn là khuyến nghị/warning khi Tuyền đã giao lệnh rõ.
- Vẫn giữ kiểm tra kỹ thuật tối thiểu nên làm: syntax check, backup/report khi sửa live, verify REST/frontend sau khi chạy.

## Generate all image briefs

- Đã chạy lệnh Tuyền yêu cầu: `node .\tools\generate_all_image_briefs.mjs`.
- Trước khi chạy đã kiểm tra script: chỉ quét `content-drafts` và tạo file local trong `image-briefs`, không gọi WordPress.
- Syntax check: `node --check .\tools\generate_all_image_briefs.mjs` OK.
- Kết quả: tạo/cập nhật thành công 53 Image Briefs.
- Verify sau chạy:
  - `*-image-brief.md`: 53 file.
  - `*-image-status.json`: 53 file.
  - `*-image-package.json`: 0 file.
- Trạng thái: đã có brief, chưa có image package/ảnh thật để chèn.
