# SEO FIX PLAN

Ngày cập nhật: 2026-05-21

Mục tiêu: sửa lỗi kỹ thuật SEO và content risk theo Google Search Essentials, Spam Policies, Helpful Content và guidance AI features. Không dùng thủ thuật “AI Overview bait”, không hứa hẹn đảm bảo xuất hiện AI Overview / AI Mode.

## Technical SEO Fixes

| Ưu tiên | Việc cần làm | URL/nguồn | Cách xử lý | Trạng thái |
|---|---|---|---|---|
| Critical | Xóa URL redirect khỏi sitemap | `/thong-tac-toilet-quang-ninh/` redirect sang `/thong-tac-bon-cau-quang-ninh/` | Đã cập nhật/upload `ttcqn-seo-cleanup-redirects` v2026.05.21.2; sitemap chỉ còn URL đích canonical | Fixed |
| High | Resolve duplicate publish Bãi Cháy | `/thong-tac-cong-bai-chay-2/`, `/thong-tac-cong-bai-chay-3/` | Live đã 301 về `/thong-tac-cong-bai-chay/`; draft trùng title vẫn cần review riêng | Partially Fixed / Needs Review |
| High | Rà chồng lớp plugin homepage | `tools/wp-plugins/ttcqn-home-*`, `ttcqn-scroll-guide-assistant`, `ttcqn-mobile-left-sticky-cta` | Đã archive diagnostic plugin/source duplicate; đã gộp/deactivate/delete live `ttcqn-home-performance-tune`, `ttcqn-home-lead-form`, `ttcqn-scroll-guide-assistant`, `ttcqn-mobile-left-sticky-cta` vào renderer v2026.05.21.5 | Fixed / Monitor |
| Medium | Rà CSS override toàn trang con | `global-styles.php` | Renderer v2026.05.21.3 đã strip block legacy `GENERATEPRESS THEME OVERRIDE`; local file đã archive; CSS scoped `ttcqn-gp-pages-css` vẫn giữ | Fixed / Monitor |
| Medium | Rà schema khớp content | Draft/page có `FAQPage`, `LocalBusiness`, `BreadcrumbList` | Chỉ giữ schema có nội dung visible tương ứng; không thêm review/rating/case giả | Needs Review |
| Low | Dọn artifact local | `_tmp`, root HTML snapshot, ZIP/plugin cũ | Đã archive root preview, old favicon packages/scripts, diagnostics plugin/scripts, 0-byte asset vào `backups/cleanup-review-required-2026-05-21/` | Partially Fixed |

## Content SEO Fixes

| Ưu tiên | Việc cần làm | Nguồn | Cách xử lý | Trạng thái |
|---|---|---|---|---|
| High | Xóa nhãn `CTA cuối bài:` trong draft | `content-drafts/**` | Đã backup 51 file và xóa tiền tố nhãn; không xóa nội dung draft | Fixed |
| High | Sửa generator không tái tạo nhãn kỹ thuật | `tools/generate_hut_be_phot_drafts.mjs`, `tools/generate_thong_tac_cong_drafts.mjs`, `tools/generate_remaining_seo_drafts.mjs` | Đã bỏ tiền tố `CTA cuối bài:` khỏi template CTA; `node --check` OK | Fixed |
| High | Rà nhóm draft trùng title/near-duplicate | `DRAFT_DUPLICATE_REVIEW.md`, `DRAFT_REMAINING_AUDIT.md` | Đã scan 80 draft; xóa 63 local draft không chuẩn SEO sau backup; còn 17 draft active; duplicate slug = 0; similarity >= 0.70 = 0 | Fixed |
| High | Sửa live content mỏng/lọt nhãn kỹ thuật | 54 URL publish live | Đã rewrite/expand/sanitize live content; REST audit final flagged = 0; public verify bad = 0 | Fixed |
| Medium | Giảm claim chưa xác minh | Page/draft có `case thực tế`, `ảnh thực tế`, review/rating | Nếu không có bằng chứng, đổi thành `tình huống thường gặp` hoặc `ảnh minh họa quy trình` | Needs Review |
| Medium | Chống doorway | Nhóm page địa phương | Mỗi page phải có intent/ngách/local entity/câu trả lời riêng, không chỉ thay địa danh | Ongoing |

## Structured Data Fixes

1. `FAQPage`: chỉ dùng khi FAQ thật hiển thị trên page.
2. `Article/BlogPosting`: title, description, image, datePublished/dateModified khớp page.
3. `LocalBusiness`/`Service`: NAP, hotline, areaServed đúng; không thêm claim không có trên page.
4. `Review`/`AggregateRating`: không dùng nếu không có review/rating thật và visible.
5. Sau mỗi batch sửa content, fetch HTML live và kiểm JSON-LD bằng parser trước khi nghiệm thu.

## Internal Linking Fixes

1. Audit link nội bộ trỏ redirect hoặc 404.
2. Alias `thong-tac-toilet-quang-ninh` đã 301 sang `thong-tac-bon-cau-quang-ninh`; tiếp tục dùng URL đích trong internal link mới.
3. Mỗi bài blog hỗ trợ link về 1 pillar dịch vụ và 2-4 bài liên quan.
4. Anchor text có dấu, tự nhiên, không lặp exact-match 100%.

## Performance Fixes

1. Không lazy-load ảnh hero/LCP chính.
2. Ảnh quan trọng phải có `width`, `height`, `alt` phù hợp.
3. Giữ homepage/UI trong renderer chính; không tạo lại plugin phụ performance/scroll/lead-form/mobile CTA nếu không có lý do kỹ thuật rõ.
4. Không thêm `!important` mới nếu chưa chứng minh cần.
5. Với plugin live: backup, upload, active check, frontend HTTP 200, visual check mobile/desktop trước khi kết luận.
6. Các plugin còn lại chưa đủ SAFE_DELETE: giữ favicon/Ads; review thủ công `ttcqn-home-service-images`, `ttcqn-mobile-image-optimizer`, `ttcqn-subpage-banner-dedupe` trước khi hợp nhất hoặc xóa.

## AI Overview Readiness Fixes

1. Mỗi bài có một intent chính và câu trả lời ngắn 40-80 từ ở đầu.
2. Mỗi H2 trả lời một ý cụ thể; dùng bảng/checklist/bước khi phù hợp.
3. Có kinh nghiệm thật, quy trình thật, ảnh thật hoặc ghi rõ `ảnh minh họa`/`tình huống thường gặp`.
4. Dữ kiện kỹ thuật/số liệu phải có nguồn hoặc nói rõ là ước tính/kinh nghiệm.
5. Không dùng `nosnippet`, `max-snippet:0`, `data-nosnippet` trên phần nội dung chính nếu muốn đủ điều kiện snippet/AI features.
6. Không viết “tối ưu AI Overview”, không nhồi câu hỏi, không FAQ giả, không schema sai nội dung.

## Fixed Trong Lượt Audit Này

| Mục | File | Lý do | Trạng thái |
|---|---|---|---|
| Xóa temp script lỗi | `tmp_fix.py` | File tạm 15 bytes, không reference | Fixed |
| Xóa file tên lỗi rỗng | `.*` | 0 bytes, không reference | Fixed |
| Xóa file tên lỗi rỗng | `]*` | 0 bytes, không reference | Fixed |
| Xóa nhãn CTA kỹ thuật | `content-drafts/**`, `tools/generate_*_drafts.mjs` | Nhãn biên tập không được lộ ra nội dung publish | Fixed |
| Xóa snippet CTA số giả | `sticky_cta_zalo_phone.html` | Chứa `0900000000`, không thấy reference thật | Fixed |
| Sửa sitemap redirect | `tools/wp-plugins/ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects.php` | URL redirect không được nằm trong sitemap | Fixed |
| Gộp plugin homepage patch | `ttcqn-home-emergency-renderer`, `ttcqn-home-performance-tune` | Giảm một lớp CSS/preload chồng trên homepage | Fixed |
| Gộp backend lead form | `ttcqn-home-emergency-renderer`, `ttcqn-home-lead-form` | Giảm một plugin active nhưng vẫn giữ REST endpoint nhận lead | Fixed |
| Gộp scroll guide UI | `ttcqn-home-emergency-renderer`, `ttcqn-scroll-guide-assistant` | Giảm một plugin UI active nhưng vẫn giữ scroll guide trên live HTML | Fixed |
| Gộp mobile left sticky CTA | `ttcqn-home-emergency-renderer`, `ttcqn-mobile-left-sticky-cta` | Giảm một plugin UI active nhưng vẫn giữ CTA mobile và dùng asset renderer | Fixed |
| Strip CSS override cũ trang con | `global-styles.php`, `ttcqn-home-emergency-renderer` | Giảm lớp CSS `GENERATEPRESS THEME OVERRIDE` bị chồng với CSS scoped mới | Fixed |
| Review/xóa/bổ sung draft còn lại | `DRAFT_REMAINING_AUDIT.md`, `backups/delete-final-nonseo-drafts-2026-05-21/manifest.md`, `backups/enrich-remaining-drafts-2026-05-21/manifest.md` | Xóa tổng 63 local draft không chuẩn; bổ sung ảnh/schema cho 13 file còn thiếu; 17/17 draft active pass score | Fixed |
| Archive obsolete REVIEW_REQUIRED artifacts | `backups/cleanup-review-required-2026-05-21/manifest.md` | Old favicon packages/scripts, diagnostics plugin, root duplicate, root preview, 0-byte asset không còn là source active | Fixed |

## Verification 2026-05-20

- Đã scan local bằng `find`, `rg`, `wc`, `du`.
- Đã kiểm reference trước khi xóa 3 file SAFE_DELETE.
- Đã verify 3 file SAFE_DELETE không còn trong root.
- Đã chạy `php -l` toàn bộ PHP plugin trong `tools/wp-plugins`: không lỗi.
- Đã chạy `node --check` cho 3 script ảnh SEO lõi: không lỗi.
- Đã chạy `python3 -m py_compile` cho `tools/project_folder_manager.py` và `tools/seo_score.py`: không lỗi.
- Chưa chạy build vì repo không có build app; `package.json` chỉ có test placeholder `exit 1`.
- 2026-05-21: REST plugin live `ttcqn-seo-cleanup-redirects` active version `2026.05.21.2`.
- 2026-05-21: `page-sitemap.xml` không còn `/thong-tac-toilet-quang-ninh/`, vẫn có `/thong-tac-bon-cau-quang-ninh/`.
- 2026-05-21: `/thong-tac-toilet-quang-ninh/`, `/thong-tac-cong-bai-chay-2/`, `/thong-tac-cong-bai-chay-3/` đều trả 301 đúng qua `TTCQN SEO Cleanup Redirects`.
- 2026-05-21: `rg -n "CTA cuối bài:|0900000000|mobile-sticky-cta"` trong draft/generator mục tiêu không còn kết quả.
- 2026-05-21: scan 80 draft trong `content-drafts/**`; phát hiện 5 slug trùng tuyệt đối và nhiều cụm near-duplicate 0.80-0.98; ghi publish gate vào `DRAFT_DUPLICATE_REVIEW.md`.
- 2026-05-21: xóa 63 local draft không chuẩn SEO sau backup; còn 17 active draft; duplicate slug active = 0; high similarity >= 0.70 = 0; score fail = 0; keyword stuffing fail = 0.
- 2026-05-21: bổ sung ảnh/schema cho 13 file còn thiếu; 17/17 draft có tối thiểu 2 ảnh, 17/17 có JSON-LD hợp lệ, không còn cụm `ảnh minh họa` trong active draft.
- 2026-05-21: MCP active plugin check xác nhận favicon v3, home performance tune, home emergency renderer và SEO cleanup redirects active; old favicon/diagnostics không active.
- 2026-05-21: live `/blog/` xác nhận `global-styles.php` từng active; sau renderer v2026.05.21.3, block `GENERATEPRESS THEME OVERRIDE` không còn trong HTML live.
- 2026-05-21: archived obsolete REVIEW_REQUIRED artifacts vào `backups/cleanup-review-required-2026-05-21/`; root và `tools/wp-plugins` không còn các bản favicon/diagnostics cũ.
- 2026-05-21: uploaded `ttcqn-home-emergency-renderer` v2026.05.21.2; deactivated live `ttcqn-home-performance-tune`; homepage 200; old style id count `ttcqn-home-performance-tune` = 0; `/blog/` và `page-sitemap.xml` vẫn 200.
- 2026-05-21: archived local `tools/wp-plugins/ttcqn-home-performance-tune/`, zip, old upload/deactivate scripts and `_tmp` check artifact into `backups/cleanup-home-performance-tune-2026-05-21/`.
- 2026-05-21: archived local `global-styles.php` into `backups/cleanup-global-styles-2026-05-21/`; live `/blog/` and `/hut-be-phot-quang-ninh/` remain HTTP 200 with one H1 and scoped CSS markers present.
- 2026-05-21: uploaded `ttcqn-home-emergency-renderer` v2026.05.21.4 with lead CPT/REST backend; deactivated live `ttcqn-home-lead-form`; REST `/wp-json/ttcqn/v1/lead` still allows POST and honeypot POST returns 200.
- 2026-05-21: archived local `tools/wp-plugins/ttcqn-home-lead-form/`, zip and upload script into `backups/cleanup-home-lead-form-2026-05-21/`.
- 2026-05-21: uploaded `ttcqn-home-emergency-renderer` v2026.05.21.5 with integrated scroll guide and mobile left sticky CTA; deactivated/deleted live `ttcqn-scroll-guide-assistant` and `ttcqn-mobile-left-sticky-cta`; archived local source/zip/upload scripts into `backups/cleanup-integrated-ui-2026-05-21/`.
- 2026-05-21: final live verification after deletion: `/`, `/blog/`, `/hut-be-phot-quang-ninh/` all HTTP 200, H1 = 1, no critical marker, renderer version `2026.05.21.5`, scroll/mobile CTA markers present, old performance/lead/global override markers absent, `page-sitemap.xml` 200 and no retired URL.
- 2026-05-21: live content deep rewrite completed. Reports: `reports/deep-content-rewrite-2026-05-21T10-33-32-959Z.md`, `reports/deep-content-completion-2026-05-21T10-42-11-048Z.md`, `reports/deep-content-final-expand-2026-05-21T10-44-51-578Z.md`, `reports/doorway-option-content-fix-2026-05-21.json`, `reports/deep-content-audit-final-2026-05-21.json`, `reports/live-content-final-verify-3-2026-05-21.json`.
