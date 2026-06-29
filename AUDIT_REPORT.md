# AUDIT REPORT - Technical SEO, Legacy Code, Google Policy Risk

Ngày audit: 2026-05-20  
Website: https://thongtaccongquangninh.com  
Phạm vi kiểm trong lượt này: workspace local `D:\.thongtaccongquangninh`, source plugin trong `tools/wp-plugins`, script vận hành `tools/`, content draft, asset/report/backup cục bộ và các báo cáo live đã có trong repo.

Nguồn chuẩn Google đã đối chiếu:
- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Technical requirements: https://developers.google.com/search/docs/essentials/technical-requirements
- SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- AI-generated content guidance: https://developers.google.com/search/blog/2023/02/google-search-and-ai-content
- AI features / AI Overviews guidance: https://developers.google.com/search/docs/appearance/ai-features

## Executive Summary

Workspace này là kho vận hành/audit WordPress live, không phải một codebase app thuần React/Next có build thống nhất. Vì vậy không được xóa hàng loạt backup, media, ZIP plugin, report hoặc file source plugin chỉ vì ít reference trong repo.

Đã sửa ngay các mục **SAFE_DELETE** có bằng chứng chắc chắn: `tmp_fix.py`, file rỗng `.*`, file rỗng `]*`.

Sau phản hồi của Tuyền ngày 2026-05-21, đã làm sạch thêm các mục có đủ bằng chứng: xóa nhãn `CTA cuối bài:` khỏi 51 file draft/generator, xóa snippet cũ `sticky_cta_zalo_phone.html`, cập nhật và upload plugin `ttcqn-seo-cleanup-redirects` bản `2026.05.21.2` để loại URL redirect khỏi sitemap, gộp plugin phụ `ttcqn-home-performance-tune`, backend `ttcqn-home-lead-form`, `ttcqn-scroll-guide-assistant` và `ttcqn-mobile-left-sticky-cta` vào renderer chính, deactivate/delete các plugin phụ này trên live, archive local source/zip/upload script, đồng thời loại block CSS cũ `GENERATEPRESS THEME OVERRIDE` khỏi HTML live.

Batch nội dung chuyên sâu ngày 2026-05-21 đã sửa trực tiếp 54 URL publish: rewrite toàn phần các trang/bài mỏng, gỡ cú pháp Markdown bị lọt ra HTML, gỡ nhãn `Case study E-E-A-T`, `NAP liên hệ`, `Internal link liên quan`, `CTA cuối bài`, gỡ nhãn ảnh generic `ảnh minh họa`, cập nhật option renderer cũ của `/thong-tac-cong-ha-long/`, và verify public HTML sạch.

Các rủi ro chính còn lại:

| Mức độ | Nhóm lỗi | Bằng chứng | Trạng thái |
|---|---|---|---|
| Critical | Sitemap/live SEO còn URL redirect cần xử lý | Live sitemap đã kiểm lại, chỉ còn URL đích `/thong-tac-bon-cau-quang-ninh/`; URL cũ `/thong-tac-toilet-quang-ninh/` 301 về URL đích | Fixed |
| High | Duplicate/near-duplicate content | Bãi Cháy `-2` và `-3` đã 301 về URL chính; 63 local draft không chuẩn SEO đã xóa sau backup; active duplicate slug = 0 | Fixed |
| High | Draft còn lộ nhãn kỹ thuật `CTA cuối bài:` | Đã backup và xóa nhãn khỏi 51 file trong `content-drafts/**` và generator liên quan | Fixed |
| High | Live content mỏng/lọt nhãn SEO/editorial | REST audit trước sửa flag 37 URL; sau 3 batch rewrite/expand, REST audit final 54/54 URL publish flagged = 0, public verify 54/54 bad = 0 | Fixed |
| High | CSS/JS chồng lớp trên homepage | `ttcqn-home-performance-tune`, `ttcqn-home-lead-form`, `ttcqn-scroll-guide-assistant`, `ttcqn-mobile-left-sticky-cta` đã được gộp vào `ttcqn-home-emergency-renderer` v2026.05.21.5; 4 plugin phụ đã inactive/deleted live và archive local | Fixed / Monitor |
| Medium | File snippet CTA cũ dùng số giả | `sticky_cta_zalo_phone.html` chứa `0900000000`, không có reference thật, đã xóa | Fixed |
| Medium | Root plugin/source có nguy cơ trùng deploy | `ttcqn-home-performance-tune.php` khác file trong `tools/wp-plugins/ttcqn-home-performance-tune/` dù cùng 233 dòng; active/source upload path là `tools/wp-plugins/ttcqn-home-performance-tune/` | Fixed: archived |
| Medium | CSS override quá rộng | `global-styles.php` chứa nhiều `!important`, `display:none`, can thiệp toàn trang con; renderer v2026.05.21.3 đã strip block `GENERATEPRESS THEME OVERRIDE` khỏi HTML live và local file đã archive | Fixed |
| Low | Artifact lớn trong root/reports/_tmp | `_tmp_home_reference_preview.html` đã chuyển vào backup cleanup; `reports/tmp-*.html`, `_tmp/**`, backup/report nhiều phiên bản giữ theo lịch sử audit | Partially Fixed |

## Danh Sách Lỗi Nghiêm Trọng

### 1. Sitemap chứa URL redirect

- URL nghi vấn: `https://thongtaccongquangninh.com/thong-tac-toilet-quang-ninh/`
- Bằng chứng trước sửa: `AUDIT_REPORT.md` vòng trước và `SEO_FIX_PLAN.md` đã ghi URL này redirect sang `/thong-tac-bon-cau-quang-ninh/`.
- Bằng chứng sau sửa: `curl -Ls https://thongtaccongquangninh.com/page-sitemap.xml -o /tmp/ttcqn-page-sitemap.xml` và `rg` chỉ còn `/thong-tac-bon-cau-quang-ninh/`, không còn `/thong-tac-toilet-quang-ninh/`.
- Rủi ro: sitemap nên chỉ chứa URL canonical, indexable, trả 200 cuối cùng.
- Đã sửa: plugin `ttcqn-seo-cleanup-redirects` bản `2026.05.21.2` active live; draft WP ID 1801 giữ draft/noindex/canonical về URL đích; redirect 301 vẫn hoạt động.
- Trạng thái: Fixed.

### 2. Duplicate title/content và doorway risk

- Bằng chứng: báo cáo trước ghi nhóm Bãi Cháy publish trùng title và nhiều draft trùng title; live hiện `thong-tac-cong-bai-chay-2` và `thong-tac-cong-bai-chay-3` trả 301 về `/thong-tac-cong-bai-chay/`.
- Rủi ro Google: duplicate/near-duplicate local page, doorway pages, scaled content abuse nếu publish hàng loạt chỉ đổi địa danh.
- Đã sửa phần live publish: alias Bãi Cháy redirect về URL chính.
- Đã review: scan 80 draft, phát hiện 5 slug trùng tuyệt đối và các cụm near-duplicate 0.80-0.98; lập publish gate trong `DRAFT_DUPLICATE_REVIEW.md`.
- Đã xóa: 63 local draft bị đánh dấu `DO_NOT_PUBLISH`/`MERGE_SOURCE_ONLY`/`REWRITE_REQUIRED`, slug sai rõ ràng, fail score hoặc fail keyword stuffing.
- Backup tại `backups/delete-nonseo-drafts-2026-05-21/` và `backups/delete-rewrite-required-drafts-2026-05-21/`.
- Backup bổ sung tại `backups/delete-final-nonseo-drafts-2026-05-21/`.
- Verify sau xóa: còn 17 draft active, duplicate slug active = 0, cặp similarity >= 0.70 = 0, score fail = 0, keyword stuffing fail = 0.
- Đã bổ sung ảnh/schema: 13 file thiếu đã được chỉnh sau backup tại `backups/enrich-remaining-drafts-2026-05-21/`.
- Verify sau bổ sung: 17/17 draft có tối thiểu 2 ảnh, 17/17 có JSON-LD hợp lệ, không còn cụm `ảnh minh họa` trong active draft.
- Còn cần làm: rewrite/merge các file đã bị đánh dấu trước khi publish, không publish trực tiếp.
- Trạng thái: Fixed for review / Rewrite backlog.

### 3. Draft còn lộ nhãn biên tập `CTA cuối bài:`

- File/khu vực: nhiều file trong `content-drafts/hut-be-phot/**`, `content-drafts/thong-tac-cong/**`, `content-drafts/remaining/**`.
- Bằng chứng trước sửa: `rg -n "CTA cuối bài" content-drafts`.
- Bằng chứng sau sửa: `rg -n "CTA cuối bài:|0900000000|mobile-sticky-cta" content-drafts tools/generate_hut_be_phot_drafts.mjs tools/generate_thong_tac_cong_drafts.mjs tools/generate_remaining_seo_drafts.mjs` không còn kết quả.
- Rủi ro: nếu publish thẳng, nhãn prompt lọt ra frontend, tạo tín hiệu nội dung kém tự nhiên.
- Đã sửa: backup 51 file vào `backups/cleanup-cta-label-2026-05-21/source-files.tar.gz`, xóa tiền tố nhãn khỏi draft và 3 generator.
- Trạng thái: Fixed.

## Code Cũ / Bị Ghi Đè / Không Dùng

| Mục | Loại | Bằng chứng | Đánh giá | Trạng thái |
|---|---|---|---|---|
| `tmp_fix.py` | Temp script | Nội dung 15 bytes: `print(" Hello\)`; không reference | SAFE_DELETE | Fixed |
| `.*` | Temp/broken filename | File root 0 bytes | SAFE_DELETE | Fixed |
| `]*` | Temp/broken filename | File root 0 bytes | SAFE_DELETE | Fixed |
| `sticky_cta_zalo_phone.html` | HTML snippet cũ | Chứa `tel:0900000000`, `zalo.me/0900000000`; chỉ tự reference | SAFE_DELETE sau khi đối chiếu không có reference | Fixed |
| `global-styles.php` | Plugin/CSS override | Live `/blog/` từng có block `GENERATEPRESS THEME OVERRIDE`; renderer v2026.05.21.3 strip block này, CSS scoped mới vẫn còn | REVIEW_REQUIRED -> SAFE_ARCHIVE | Fixed: archived to `backups/cleanup-global-styles-2026-05-21/` |
| `ttcqn-home-performance-tune.php` root | Plugin source duplicate | MCP active plugin là `ttcqn-home-performance-tune/ttcqn-home-performance-tune.php`; upload script canonical dùng `tools/wp-plugins/...` | Root duplicate không deploy | Fixed: archived to `backups/cleanup-review-required-2026-05-21/` |
| `tools/wp-plugins/ttcqn-home-performance-tune/` + zip + upload script | Plugin/CSS patch cũ | CSS/preload đã gộp vào `ttcqn-home-emergency-renderer/templates/page-home-direct.php`; live deactivated; homepage còn 200 và không còn style id `ttcqn-home-performance-tune` | SAFE_ARCHIVE | Fixed: archived to `backups/cleanup-home-performance-tune-2026-05-21/` |
| `tools/wp-plugins/ttcqn-home-lead-form/` + zip + upload script | Plugin backend/UI cũ | Frontend đã không còn render vì emergency renderer active; backend CPT/REST đã gộp vào renderer v2026.05.21.4; live plugin inactive | SAFE_ARCHIVE | Fixed: archived to `backups/cleanup-home-lead-form-2026-05-21/` |
| `tools/wp-plugins/ttcqn-scroll-guide-assistant/` + zip + upload script | Plugin UI cũ | CSS/JS scroll guide đã gộp vào `ttcqn-home-emergency-renderer/includes/scroll-guide-assistant.php`; marker live vẫn có sau khi plugin gốc bị delete | SAFE_ARCHIVE | Fixed: archived to `backups/cleanup-integrated-ui-2026-05-21/` |
| `tools/wp-plugins/ttcqn-mobile-left-sticky-cta/` + zip + upload script | Plugin UI cũ | Mobile CTA đã gộp vào `ttcqn-home-emergency-renderer/includes/mobile-left-sticky-cta.php`; marker live vẫn có sau khi plugin gốc bị delete | SAFE_ARCHIVE | Fixed: archived to `backups/cleanup-integrated-ui-2026-05-21/` |
| `tools/wp-plugins/ttcqn-favicon-override*` | Plugin cũ | MCP active plugin hiện là `ttcqn-favicon-override-v3/ttcqn-favicon-override-v3.php`; HTML live dùng favicon 2026-05 v3 URLs | Local obsolete package | Fixed: archived to `backups/cleanup-review-required-2026-05-21/` |
| `tools/wp-plugins/ttcqn-home-template-diagnostics` | Diagnostic plugin | MCP active plugin list không còn diagnostics; report cũ ghi đã deactivate | Công cụ debug cũ | Fixed: archived |
| `_tmp_home_reference_preview.html` | HTML/CSS snapshot | File lớn ở root, có schema/CSS/JS preview | Không phải production source | Fixed: archived |
| `image-briefs/assets-backup-2026-05-10/hut-be-phot-van-don-case-study.jpg` | Asset backup | File 0 bytes | Placeholder lỗi trong backup ảnh | Fixed: archived |

## SEO Violations / Risk

| Mức độ | Lỗi/rủi ro | Bằng chứng | Theo Google risk | Trạng thái |
|---|---|---|---|---|
| High | Doorway/local template risk | Nhiều draft theo địa phương và generator tạo template giống nhau | Doorway pages / scaled content abuse | Needs Review |
| High | Draft lộ nhãn kỹ thuật | Đã xóa `CTA cuối bài:` khỏi 51 file và generator | Helpful content / content quality | Fixed |
| High | Live URL có nội dung mỏng hoặc nhãn biên tập/SEO lộ ra frontend | Đã rewrite/expand 54 URL publish; final REST audit `flagged=0`; final public verify `bad=0` | Helpful content / people-first content | Fixed |
| High | URL redirect trong sitemap | Live sitemap không còn `/thong-tac-toilet-quang-ninh/` | Crawl/index hygiene | Fixed |
| Medium | Schema trong draft cần khớp nội dung visible | Nhiều draft có `FAQPage`, `LocalBusiness`, `BreadcrumbList` | Structured data spam nếu dữ liệu không hiển thị/không đúng | Needs Review |
| Medium | Homepage CSS/JS chồng lớp | Đã loại bốn plugin phụ: `ttcqn-home-performance-tune`, `ttcqn-home-lead-form`, `ttcqn-scroll-guide-assistant`, `ttcqn-mobile-left-sticky-cta`; chức năng chuyển vào renderer chính | Performance/CLS/maintainability risk | Fixed / Monitor |
| Medium | Hidden/override CSS | Legacy `global-styles.php` block đã bị strip khỏi live HTML; renderer vẫn có một số `display:none` có mục tiêu rõ để thay header/footer cũ và điều khiển responsive | Có thể che nội dung hoặc gây accessibility issue nếu sai mục tiêu | Partially Fixed / Monitor |
| Low | Backup/report phình lớn | Repo 1.2GB; `image-briefs` 382MB, `backups` 258MB, `reports` 156MB | Không ảnh hưởng crawl trực tiếp, nhưng giảm maintainability | KEEP/Archive plan |

## AI Overview Content Gaps

Không có thủ thuật riêng để ép AI Overviews / AI Mode. Theo Google, điều kiện nền là trang crawl/render được, indexable, đủ điều kiện snippet và nội dung hữu ích, đáng tin, dễ hiểu.

Checklist gap hiện tại:

- Nhiều draft cần bỏ nhãn biên tập trước khi publish.
- Mỗi bài cần câu trả lời ngắn 40-80 từ ngay đầu, không vòng vo.
- Bài giá/quy trình/dấu hiệu cần bảng, checklist hoặc bước rõ.
- FAQ chỉ giữ khi câu hỏi thật sự giúp người đọc.
- Case/review/ảnh thực tế phải có căn cứ; nếu không, đổi thành `tình huống thường gặp` hoặc `ảnh minh họa`.
- Schema chỉ thêm khi dữ liệu tương ứng hiển thị trên page.

## Ưu Tiên Sửa

### Critical

1. Xử lý URL redirect trong sitemap: `/thong-tac-toilet-quang-ninh/` - Fixed 2026-05-21.

### High

1. Rewrite/merge các draft bị đánh dấu trong `DRAFT_DUPLICATE_REVIEW.md`.
2. Theo dõi renderer chính sau khi hợp nhất 4 plugin phụ homepage/UI; không tạo lại plugin phụ nếu renderer đang xử lý ổn.

### Medium

1. Theo dõi visual regression sau khi strip `global-styles.php`; nếu ổn, giữ local file trong backup, không đưa lại root.
2. Rà schema từng draft trước khi publish.

### Low

1. Tiếp tục lập retention/move-plan cho `reports`, `_tmp/**` và backup/report nhiều phiên bản; nhóm obsolete plugin/local snapshot đã archive vào `backups/cleanup-review-required-2026-05-21/`.

## Test Đã Chạy

- Đọc luật: `AGENTS.md`, `CLAUDE.md`, `CODEX_CONTEXT.md`, `TASKS.md`, `AGENT_OWNERSHIP.md`, `docs/PROJECT_STATE.md`, các file rule/report hiện có.
- Scan cấu trúc: `find . -maxdepth 2 -type d`, `rg --files`, thống kê extension.
- Scan code/content: `rg` cho `CTA cuối bài`, `loading="lazy" loading="lazy"`, `nosnippet`, `noindex`, `!important`, `display:none`, `legacy`, `temporary fix`.
- Scan reference file tạm: `rg` với `tmp_fix.py`, `sticky_cta_zalo_phone`, `global-styles`, `ttcqn-home-performance-tune.php`.
- Kiểm dung lượng: repo 1.2GB; `_tmp` 87MB, `backups` 258MB, `reports` 156MB, `image-briefs` 382MB, `node_modules` 33MB.
- Xóa SAFE_DELETE bằng `apply_patch`: `tmp_fix.py`, `.*`, `]*`.
- Verify xóa file: `ls -lab . | sed -n '/ tmp_fix.py$/p;/ \.\*$/p;/ \]\*$/p'` không còn trả kết quả.
- Syntax check PHP: `php -l` toàn bộ file PHP trong `tools/wp-plugins` đều không lỗi.
- Syntax check Node script lõi: `node --check tools/image_seo_gate.mjs`, `tools/check_image_seo_gate.mjs`, `tools/create_image_seo_brief.mjs` đều không lỗi.
- Syntax check Python: `python3 -m py_compile tools/project_folder_manager.py tools/seo_score.py` không lỗi.
- Backup trước batch cleanup CTA: `backups/cleanup-cta-label-2026-05-21/source-files.tar.gz` chứa 51 file.
- Verify CTA/số giả: `rg -n "CTA cuối bài:|0900000000|mobile-sticky-cta" content-drafts tools/generate_hut_be_phot_drafts.mjs tools/generate_thong_tac_cong_drafts.mjs tools/generate_remaining_seo_drafts.mjs` không còn kết quả.
- Verify plugin redirect live: REST plugin `ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects` active, version `2026.05.21.2`.
- Verify sitemap: `page-sitemap.xml` chỉ còn `/thong-tac-bon-cau-quang-ninh/`, không còn `/thong-tac-toilet-quang-ninh/`.
- Verify redirects: `/thong-tac-toilet-quang-ninh/` 301 sang `/thong-tac-bon-cau-quang-ninh/`; `/thong-tac-cong-bai-chay-2/` và `/thong-tac-cong-bai-chay-3/` 301 sang `/thong-tac-cong-bai-chay/`.
- Verify duplicate draft review: scan 80 file trong `content-drafts/**`; ghi kết quả vào `DRAFT_DUPLICATE_REVIEW.md` và cập nhật publish gate trong `CONTENT_RULES.md`, `ARTICLE_SEO_AI_OVERVIEW_CHECKLIST.md`.
- Verify MCP active plugins 2026-05-21 trước cleanup homepage: `ttcqn-favicon-override-v3`, `ttcqn-home-performance-tune`, `ttcqn-home-emergency-renderer`, `ttcqn-seo-cleanup-redirects` active; old favicon/diagnostics plugins không active.
- Verify sau cleanup homepage giai đoạn 1: `ttcqn-home-emergency-renderer` v2026.05.21.4 active; `ttcqn-home-performance-tune` và `ttcqn-home-lead-form` inactive; live homepage 200; style id cũ `ttcqn-home-performance-tune` = 0; old lead CSS/JS = 0; REST `/wp-json/ttcqn/v1/lead` vẫn POST được.
- Verify sau cleanup UI giai đoạn 2: `ttcqn-home-emergency-renderer` v2026.05.21.5 active; `ttcqn-scroll-guide-assistant` và `ttcqn-mobile-left-sticky-cta` đã inactive/delete live; `/`, `/blog/`, `/hut-be-phot-quang-ninh/` đều 200, H1 = 1, scroll guide marker và mobile CTA marker vẫn có trong HTML; old perf/lead/global override marker đều = 0.
- Verify content chuyên sâu 2026-05-21: `reports/deep-content-audit-final-2026-05-21.json` ghi 54 URL publish, flagged = 0; `reports/live-content-final-verify-3-2026-05-21.json` ghi 54 URL public, bad = 0; spot check `/thong-tac-cong-ha-long/`, `/blog/`, `/thong-tac-bon-cau-quang-yen/`, `/hut-be-phot-ha-long/` đều HTTP 200, H1 = 1, không còn nhãn xấu.
- Verify live `/blog/` trước strip: `global-styles.php` đang in block `GENERATEPRESS THEME OVERRIDE`.
- Verify live `/blog/` sau strip: `GENERATEPRESS THEME OVERRIDE` = 0, `ttcqn-gp-pages-css` = 1, HTTP 200, H1 = 1.
- Archive REVIEW_REQUIRED đã đủ bằng chứng vào `backups/cleanup-review-required-2026-05-21/manifest.md`.

## Fixed Trong Lượt Này

1. Xóa `tmp_fix.py` - temp script lỗi cú pháp, không reference.
2. Xóa file rỗng root `.*`.
3. Xóa file rỗng root `]*`.
4. Xóa `CTA cuối bài:` khỏi 51 file draft/generator sau backup.
5. Xóa snippet cũ `sticky_cta_zalo_phone.html` chứa số giả `0900000000`.
6. Cập nhật/upload `ttcqn-seo-cleanup-redirects` bản `2026.05.21.2` để loại URL redirect khỏi sitemap và giữ redirect canonical.
7. Review nhóm draft trùng title/near-duplicate; tạo `DRAFT_DUPLICATE_REVIEW.md` để chặn publish nhầm.
8. Xóa 63 local draft không chuẩn SEO thuộc nhóm `DO_NOT_PUBLISH`/`MERGE_SOURCE_ONLY`/`REWRITE_REQUIRED`/slug sai/fail score/fail stuffing sau backup.
9. Bổ sung ảnh/schema cho 13 draft còn thiếu; chuẩn hóa caption/alt không dùng `ảnh minh họa`.
9. Archive root duplicate `ttcqn-home-performance-tune.php`, `_tmp_home_reference_preview.html`, old favicon plugin packages/scripts, diagnostics plugin/scripts và asset backup 0 byte vào `backups/cleanup-review-required-2026-05-21/`.
10. Gộp/deactivate/archive plugin phụ `ttcqn-home-performance-tune` vào `backups/cleanup-home-performance-tune-2026-05-21/`.
11. Strip block legacy `GENERATEPRESS THEME OVERRIDE` khỏi live HTML bằng renderer v2026.05.21.3 và archive local `global-styles.php`.
12. Gộp backend lead vào renderer v2026.05.21.4; deactivate/archive `ttcqn-home-lead-form`.
13. Gộp scroll guide và mobile left sticky CTA vào renderer v2026.05.21.5; deactivate/delete live plugin gốc và archive local source/zip/upload script vào `backups/cleanup-integrated-ui-2026-05-21/`.
14. Rewrite/expand/sanitize toàn bộ live content publish: 52 item ở batch rewrite, 17 item completion, 15 item final expand; backup tại `seo-revisions/deep-content-*`; cập nhật option renderer stale của page 296.

## Chưa Sửa Vì Cần Review

- Không xóa backup/report/media đang có giá trị lịch sử.
- `global-styles.php` đã được archive sau khi live HTML không còn block legacy; cần theo dõi visual regression thêm nếu tiếp tục gộp CSS sâu hơn.
- Không xóa nhóm draft cần rewrite nếu còn khả năng sửa thành bài chuẩn SEO; các file còn lại vẫn phải audit riêng trước publish.
- Đã hợp nhất `ttcqn-home-performance-tune`, `ttcqn-home-lead-form`, `ttcqn-scroll-guide-assistant` và `ttcqn-mobile-left-sticky-cta` vào renderer chính. Không xóa tiếp các plugin còn lại như favicon, Ads, mobile image optimizer, home service images, subpage banner dedupe khi chưa có bằng chứng SAFE_DELETE; scan live cho thấy một số plugin này vẫn có marker hoặc tác dụng runtime.

## Quyết Định Với Plugin Live Còn Lại

| Plugin | Quyết định | Lý do |
|---|---|---|
| `ttcqn-home-emergency-renderer` | KEEP | Renderer chính đang phục vụ homepage, lead backend, scroll guide và mobile CTA |
| `ttcqn-seo-cleanup-redirects` | KEEP | Đang xử lý redirect/sitemap canonical; sitemap sạch phụ thuộc plugin này |
| `ttcqn-doorway-safe-renderer` | KEEP | Đang phục vụ render an toàn cho nhóm page dịch vụ, không xóa trong batch homepage/UI |
| `ttcqn-favicon-override-v3` | KEEP | Live HTML vẫn có favicon URL; xóa có thể mất icon site |
| `ttcqn-google-ads-tag` | KEEP | Live HTML vẫn có conversion id Google Ads; xóa sẽ mất tracking |
| `ttcqn-home-service-images` | REVIEW_REQUIRED | Live homepage còn marker plugin; cần so sánh ảnh trước/sau nếu muốn hợp nhất |
| `ttcqn-mobile-image-optimizer` | REVIEW_REQUIRED | Live `/`, `/blog/`, trang dịch vụ đều còn marker; khả năng đang tối ưu ảnh/caption runtime |
| `ttcqn-subpage-banner-dedupe` | REVIEW_REQUIRED | Marker không còn trong HTML public nhưng plugin vẫn active; cần kiểm tra source live hoặc visual trang con trước khi xóa |
