# PROJECT STATE — thongtaccongquangninh.com

> Tổng hợp trạng thái dự án SEO local Quảng Ninh.
> File này là snapshot khởi tạo theo quy trình PDF mục 4 (ngày 2026-05-06). Trạng thái sống cập nhật theo `SEO_STATUS_*.md` mới nhất ở root và `docs/SEO_PROGRESS.csv`.

## Bối cảnh dự án

- **Người phụ trách**: Tuyền.
- **Website**: `thongtaccongquangninh.com` — Môi Trường Đô Thị Số 1 Quảng Ninh.
- **Hotline**: 0963.953.533 / 0931.156.756.
- **Dịch vụ chính**: hút bể phốt, hút hầm cầu, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi.
- **Khu vực**: Quảng Ninh (chính), Hải Phòng và miền Bắc (phụ).
- **Thế mạnh**: 24/7, có mặt 15 phút, không đục phá, bảo hành dài hạn, máy lò xo + xe bồn hiện đại.

Chi tiết đầy đủ tại `CODEX_CONTEXT.md` và `AGENTS.md`.

## Hạ tầng đã có

### Tài liệu quản trị

- `CLAUDE.md` — luật tổng cho mọi agent (mới tạo 2026-05-06).
- `AGENTS.md` — chuẩn SEO, văn phong, quality gate, image SEO, doorway, MCP/ChatGPT Apps.
- `CODEX_CONTEXT.md` — thông tin công ty, dịch vụ, văn phong (cập nhật 2026-04-28).
- `TASKS.md` — quy trình SEO local hiện hành.
- `IMAGE_SEO_WORKFLOW_2026-05-06.md` — quy trình ảnh SEO bắt buộc.
- `LOCAL_SEO_DOORWAY_SAFE_WORKFLOW_2026-05-05.md` — quy trình chống doorway.

### Skill và checklist

- `skills/seo-local-audit-strict/SKILL.md` — skill audit SEO local strict.
- `seo-checklists/seo-local-preflight-checklist.json` — checklist máy đọc, hiện là **warning-only** (không hard gate).
- `docs/SEO_CHECKLIST.md` — checklist viết bài/public theo PDF mục 9 (mới tạo 2026-05-06).

### Tool

- `tools/check_seo_local_preflight_gate.mjs` — gate cảnh báo, không chặn.
- `tools/check_image_seo_gate.mjs`, `tools/create_image_seo_brief.mjs`, `tools/generate_all_image_briefs.mjs`, `tools/image_seo_gate.mjs` — bộ ảnh SEO.
- `tools/push_new_landing.mjs`, `tools/push_seo_revisions.mjs`, `tools/publish_uong_bi_bon_cau_if_rankmath_90.mjs`, `tools/update_quang_yen_bon_cau_page.mjs` — push live có gate Image SEO.
- `tools/execute_seo_doorway_fix_phase1.mjs`, `tools/fix_doorway_content_batch2.mjs` — sửa doorway.
- `tools/upload_and_insert_seo_images_from_zip.mjs` — upload ảnh ZIP lên WordPress.
- `tools/project_folder_manager.py` — quét read-only thư mục dự án.
- `tools/seo_score.py` — chấm điểm SEO nội bộ theo PDF mục 11/15 (mới tạo 2026-05-06).
- Tổng cộng `tools/` có 51+ script automation.

### Audit và báo cáo

- `wp-url-audit-list.csv` / `wp-url-audit-list.json` — inventory toàn site (snapshot trước doorway phase 1).
- `WP_URL_AUDIT_REPORT_2026-05-06.md` — báo cáo URL audit.
- `WORDPRESS_PHASE1_FIX_REPORT_2026-05-06.json` — kết quả fix doorway phase 1.
- `WORDPRESS_UPDATE_DOORWAY_BATCH2_2026-05-06.json` — kết quả batch 2 doorway.
- `WORDPRESS_UPLOAD_INSERT_SEO_IMAGES_2026-05-06.json` / `WORDPRESS_FINAL_VERIFY_SEO_IMAGES_2026-05-06.json` — kết quả upload + verify ảnh SEO.
- Các `SEO_STATUS_YYYY-MM-DD.md` — trạng thái theo ngày, mới nhất là `SEO_STATUS_2026-05-06.md`.

### Content

- `content-drafts/` — chứa landing page MD và 2 thư mục `hut-be-phot/`, `thong-tac-cong/`. Có 53 Image Briefs (chưa có image package).
- Drafts mới nhất đạt content gate 100/100, đang ở trạng thái `PENDING_IMAGE_SEO`:
  - `thong-tac-cong-bai-chay-rankmath-draft.md` (2788 từ).
  - `thong-tac-cong-cao-xanh-rankmath-draft.md` (2814 từ).
  - `thong-tac-cong-tuan-chau-ha-long-rankmath-draft.md` (2989 từ).
  - `thong-tac-cong-gieng-day-ha-long-rankmath-draft.md` (2664 từ).

## Đã làm gần đây (theo SEO_STATUS_2026-05-06.md)

- Thêm gate Image SEO bắt buộc, áp 4 script publish.
- Upload 10 ảnh WebP lên WordPress, chèn vào 16 URL local.
- Audit toàn bộ URL WordPress qua REST + sitemap (55 dòng, 38 landing local nghi vấn).
- Fix doorway phase 1: đưa 10 URL về draft, rewrite title/excerpt 31 URL.
- Fix doorway batch 2 live: 7 URL (Đông Triều, Móng Cái, Vân Đồn, bồn cầu Hạ Long), bỏ heading "Case study E-E-A-T" chưa xác minh.
- Bỏ hard gate SEO strict, chuyển checklist sang warning-only.
- Tạo 53 Image Briefs cho toàn bộ content-drafts.
- 2026-05-10: Đổi tên bộ icon trong `Favicon/`, tạo favicon 512x512, upload media ID 1228, set WordPress `site_icon`, cài plugin `TTCQN Favicon Override` để thay bộ favicon cũ trên frontend; verify OK trên `/`, `/bang-gia/`, `/lien-he/`.
- 2026-05-14: Cập nhật live trang chủ qua plugin `TTCQN Home Emergency Renderer` version `2026.05.14.1`; thêm section `DỰ ÁN ĐÃ HOÀN THÀNH`, `QUY TRÌNH 5 BƯỚC`, `ĐỐI TÁC LÂU NĂM & KHÁCH HÀNG TIÊU BIỂU`, thêm anchor menu `Dự án` / `Đối tác`; verify live HTTP 200, 1 H1, 14 ảnh, không trùng src trong trang chủ.
- 2026-06-01: Cập nhật skill `google-seo-foundation` theo Search Central updates 2026, audit 38 URL local theo Googlebot byte/render risk và spam/AI policy, chèn 6 ảnh WebP đã xử lý SEO vào 2 post thông tắc bồn cầu khẩn cấp Quảng Ninh; audit ảnh sau cùng đạt `pagesWithIssues=0`, `pagesUnderThreeImages=0`.
- 2026-06-02: Triển khai thử author box + JSON-LD `BlogPosting` cho 2 post `2377` và `2378`; verify public HTTP 200, có author text/link/schema, audit ảnh vẫn đạt `pagesWithIssues=0`, `pagesUnderThreeImages=0`. Chuẩn URL tác giả hiện hành xem mục 2026-06-03.
- 2026-06-03: Cập nhật luật bài SEO và tool author inserter: dòng cuối bài bắt buộc là `Tác giả: [Nguyễn Song Hào](https://thongtaccongquangninh.com/author/nguyensonghao/)`, link về user WordPress `nguyensonghao`; không để tên tác giả dạng text không link.
- 2026-06-05: Audit SEO/GEO nhóm ưu tiên (10 URL) offline theo 5 đòn bẩy Google Case Study; sửa 4 image packages khu vực từ PENDING_IMAGE_SEO → READY_FOR_REVIEW (gate PASS); tạo `tools/push_area_pages_ip_bypass.mjs` bypass DNS dùng IP trực tiếp `103.57.220.210`; **publish thành công 4 trang khu vực** thông tắc cống (Bãi Cháy/Cao Xanh/Tuần Châu/Giếng Đáy) lên WordPress với ảnh SEO thật, author link, Rank Math meta; verify REST API status=publish 4/4. Bật `max-image-preview:large` site-wide qua mu-plugin `ttcqn-max-image-preview` (ghi via 1Panel MCP); verify live trên 3 URL chính.
- 2026-06-08: (i) **HBP area pages audit+fix (18 trang)**: 16/18 fixed link→/hut-be-phot-quang-ninh/ + author byline; 2 đã đủ (Móng Cái, Đông Triều). Scripts: `tools/audit_hbp_area_pages.mjs`. Posts 1576–1621 (10 bài, 0 ảnh ban đầu): thêm 3 ảnh/bài từ media pool `tools/add_images_hbp_area_posts.mjs` — 10/10 ✓. Post 1581 HBP Cao Xanh: FORBIDDEN_WORD "uy tín" → FIXED ("hình ảnh kinh doanh").
- 2026-06-08: (p) **Fix /bon-cau-rut-cham-nguyen-nhan/** (id=2043): WORD_LOW(1406→2099) + ALT×2 — insert sections 6+7 (khu vực + FAQ 4 Q&A, ~700 từ) via WP REST Gutenberg blocks; fix 2 img alts thêm "tại Quảng Ninh"; live audit method: 2093 words ✓, section 6 ✓, section 7 ✓, all 3 bon-cau imgs alt CLEAN ✓.
- 2026-06-08: (j) **TTC area pages audit+fix (15 trang)**: 14/15 fixed link+byline via `tools/audit_ttc_area_pages.mjs`; page 426 Móng Cái retry `tools/retry_ttc_mong_cai_426.mjs` → 15/15 ✓. Giếng Đáy (992) + Tuần Châu (993) bổ sung ảnh thứ 3 via `tools/add_image_ttc_giengday_tuanchau.mjs` — 2/2 ✓.
- 2026-06-08: (k) **BC area pages audit+fix (7 trang)**: 7/7 fixed link+byline via `tools/audit_bc_area_pages.mjs`. **BC/HBP service posts audit+fix (9 bài)**: thêm link ngược → landing cho 9/9 via `tools/add_reverse_links_bc_hbp_service.mjs`. Author byline fix 2 pages (386, 2025) via `tools/fix_missing_author_byline.mjs`.
- 2026-06-08: (o) **Fix /chinh-sach-bao-mat/** (id=282): 0→3 ảnh SEO (media 2375/2370/2373) + 859→2013 từ (+FAQ 5 Q&A section 11 + legal section 12 + khu vực section 13) + FAQPage JSON-LD (5 Q&A) + title 64 chars via `pre_get_document_title` filter plugin `ttcqn-title-override-282` + Rank Math title filter; alt image 3 thêm "tại Quảng Ninh"; score 86→97 MEDIUM. Scripts: `tools/fix_chinh_sach_bao_mat.mjs`, `tools/fix_baomat_v2.mjs`, `tools/patch_baomat_final.mjs`, `tools/patch_baomat_top21.mjs`, `tools/deploy_title_filter.mjs`, `tools/add_faqpage_baomat.mjs`. [VERIFY-LIVE]
- 2026-06-08: (n) **Fix /chinh-sach-bao-hanh/** (id=64): trim KW "chính sách bảo hành" 27→14 lần (4.24%→2.05%) qua 14 targeted replacements (`tools/check_and_add_faqpage_schema.mjs`); inject FAQPage JSON-LD (4 Q&A) trước author byline. [VERIFY-LIVE]
- 2026-06-08: (m) **Fix homepage img alt**: Deploy plugin `ttcqn-fix-home-img-alt` v2026.06.08.1 (WP plugin, active) via `tools/deploy_img_alt_plugin_via_ability.mjs` + WP MCP Ultimate `plugins/upload-base64`; patch alt 18 ảnh homepage (SEO-mapped filenames), 5 ảnh decorative giữ alt="". Plugin verified active. [VERIFY-LIVE]
- 2026-06-08: (l) **Full SEO audit smoke (12 URL)** via `tools/audit_seo_full.mjs --limit 12`: PASS 0 / WARN 11 / FAIL 1. Top issues: `/chinh-sach-bao-hanh/` score 86 (KEYWORD_STUFFING 3.96% + MISSING_FAQ), trang chủ score 88 (8 empty alt + 12 alt thiếu service/location). Structured data: WARN home BreadcrumbList<2-item (minor). NAP/social: tất cả social links + YouTube OK. Report: `reports/seo-full-audit-2026-06-08-smoke.md`.
- 2026-06-08: (f) Rank Math meta coverage mở rộng thêm 29 trang (BC/HBP extra 9 + final batch 20): **tổng 71/75 published+public** có focus KW + description. 4 bỏ qua đúng chủ ý (trang-chu, blog, partner, author page). Scripts: `tools/set_rankmath_meta_bc_extra.mjs`, `tools/set_rankmath_meta_final_batch.mjs`, `tools/find_missing_rankmath_meta.mjs`.
- 2026-06-08: (g) Reverse links informational → landing: thêm CTA vào 2 bài còn thiếu (`thong-tac-bon-cau-bi-tac` → BC QN, `gia-thong-tac-bon-cau-quang-ninh` → BC QN); tổng 7/7 bài informational đã có link về landing tương ứng.
- 2026-06-08: (h) Audit nội dung 6 bài huyện HBP (2047–2052): **6/6 đạt 8/8 tiêu chí** (độ dài 2396–2898 từ, ảnh 3+, FAQ, local entity, hotline, H2, không từ cấm, author byline). Không bài nào cần sửa.
- 2026-06-08: (e) Set Rank Math focus keyword + meta description cho **42 trang** (5 landing chính + 14 khu vực + 23 còn lại gồm BC/TTC huyện, HBP huyện xa, informational) — hotline, địa phương, CTA ≤ 160 chars, 42/42 ✓.
- 2026-06-08: (d) Internal link audit + fix 5 landing chính: thêm 28 link về huyện/phường/informational vào HBP/TTC/BC/HHC/NVHG landing; verify live OK.
- 2026-06-08: (a) Fix canonical cannibalization HBP: set `noindex` trên post 2554 (`/xe-hut-be-phot-quang-ninh-2026/`) via Rank Math updateMeta; verify `follow, noindex` live OK. (b) Refresh `wp-url-audit-list.csv/json`: 149 entries, 61 local landing published. (c) Fix 5 cặp title gần trùng HBP huyện (Jaccard ≥ 0.6): Móng Cái, Đông Triều, Đầm Hà, Hải Hà, Tiên Yên — rewrite theo địa đặc thù (cửa khẩu, công nghiệp, ven biển, thị trấn).
- 2026-06-06: Thêm BreadcrumbList schema vào `ttcqn-doorway-schema.php` (v2026.06.05.2): 3 hàm mới (`breadcrumb_node`, `service_parent_info`, `area_posts_map`); 3-item cho landing area/ward (Home→TTC QN→City), 2-item cho main service/Bảng giá/Liên hệ, 3-item cho post Bãi Cháy. Verify live 8/8 URL OK. Sự cố: `ttcqn-home-emergency-renderer.php` bị truncate trên server gây site 500 → phát hiện via 1Panel MCP `deactivate_wordpress_plugin` error message → khôi phục từ backup local `2026-06-05` qua `write_file`; site up lại HTTP 200.

## Đang làm dở

- **[P0 — DONE 2026-06-05]** Push 4 trang khu vực thông tắc cống lên WordPress: đã publish thành công via `tools/push_area_pages_ip_bypass.mjs --publish`.
  - thong-tac-cong-bai-chay (id=2054, post): publish, 16 116 chars, 3 imgs ✓
  - thong-tac-cong-cao-xanh (id=991, page): publish, 19 660 chars, 3 imgs ✓
  - thong-tac-cong-tuan-chau (id=993, page): publish, 19 776 chars, 2 imgs ✓
  - thong-tac-cong-gieng-day (id=992, page): publish, 17 880 chars, 2 imgs ✓
- **[DONE 2026-06-08]** Refresh `wp-url-audit-list.csv/json`: 149 entries (54 pages + 95 posts), 61 local landing đang publish. Script: `tools/refresh_url_audit.mjs`.
- **[P1 — DONE 2026-06-05]** Bật `max-image-preview:large` site-wide via mu-plugin `ttcqn-max-image-preview` (ghi bằng 1Panel MCP `write_file`); verify live: `/`, `/thong-tac-cong-quang-ninh/`, `/thong-tac-cong-bai-chay/` đều có `max-image-preview:large` trong robots meta.
- **[P1 — DONE 2026-06-06]** Thêm `BreadcrumbList` vào template `ttcqn-doorway-schema.php` (version 2026.06.05.2): 3-item cho city/ward pages (Home→TTC QN→City), 2-item cho main service pages, posts, Bảng giá, Liên hệ. Verify live 8/8 URL OK. Kèm sự cố: `ttcqn-home-emergency-renderer.php` bị truncate trên server → khôi phục từ backup `2026-06-05` qua 1Panel MCP `write_file`.
- **[P1 — DONE 2026-06-08]** Fix canonical cannibalization: `/hut-be-phot-quang-ninh/` vs `/xe-hut-be-phot-quang-ninh-2026/` — set `noindex` trên post 2554 via Rank Math updateMeta; verify live `follow, noindex` OK. Canonical bị suppress do design Rank Math (đúng). Cần monitor GSC Coverage → Excluded trong 7 ngày.

## Còn thiếu / rủi ro SEO hiện tại

- **[DONE 2026-06-08]** `/chinh-sach-bao-hanh/` (id=64): trim KW "chính sách bảo hành" 27→14 lần (4.24%→2.05%) + inject FAQPage JSON-LD (4 Q&A) trước author byline. [VERIFY-LIVE via Rich Results Test]
- **[DONE 2026-06-08]** Trang chủ: deploy plugin `ttcqn-fix-home-img-alt` v2026.06.08.1 (WP plugin, active) — output-buffer patch 18 ảnh homepage theo bảng MAP_ALT; 5 ảnh decorative giữ nguyên alt="". [VERIFY-LIVE]
- **[DONE 2026-06-08]** `/chinh-sach-bao-mat/` (id=282): 0→3 ảnh + 859→2013 từ + FAQPage JSON-LD (5 Q&A) + title 64 chars + alt "tại Quảng Ninh" → score 86→97 MEDIUM. Plugin `ttcqn-title-override-282` active (pre_get_document_title). [VERIFY-LIVE]
- **[DONE 2026-06-09]** Trang chủ: EXTERNAL_HOTLINK×1 (ytimg.com YouTube facade thumb) → upload WP media + ob_start priority -2500 str_replace → ✓ CLEAN. EMPTY_ALT 8→6, ALT_NO_SVC_LOC 12→2 (tổng 20→8 issues, còn lại là decorative + 2 generic). Plugin `ttcqn-fix-home-img-alt` v2026.06.08.3 active.
- **[DONE 2026-06-08]** META_SHORT: 8 trang (bang-gia, bon-cau, 6 bài info) đã fix via plugin `ttcqn-meta-batch-fix` — audit 2026-06-09 không còn META_SHORT trong 15 URL đầu ✓.
- **[DONE 2026-06-08]** Post 1581 HBP Cao Xanh: "uy tín kinh doanh" → "hình ảnh kinh doanh" via WP REST; live CLEAN.
- `globalReuseGroups=8` — ảnh dùng lại giữa nhiều URL; cần review giảm reuse (P2).
- Trang `/` render bằng `TTCQN Home Emergency Renderer` — theo dõi xung đột cache/plugin khi chỉnh.
- **Rank Math meta**: 71/75 published+public trang có focus KW + description. 4 bỏ qua có chủ ý.
- **HBP area posts 1576–1621**: đã thêm 3 ảnh (pool từ media library); cần verify alt text thực tế trong WP editor — alt đã đặt qua REST API nhưng nên kiểm.
- Monitor GSC Coverage: post 2554 cần → Excluded trong 7 ngày kể từ 2026-06-08.
- Monitor SERP snippet cập nhật meta description mới (7–14 ngày).
- **[DONE]** TTC/BC/HBP area pages: tất cả đã có link ngược → landing + author byline.

## Kế hoạch SEO 30 ngày (theo PDF mục 12)

| Tuần | Mục tiêu | Trạng thái hiện tại |
|---|---|---|
| 1 — Dọn nền móng | Quét toàn site, lập danh sách URL, kiểm title/meta/slug, ảnh/alt/internal link/FAQ, tạo `SEO_PROGRESS.csv`, chấm điểm bài quan trọng. | 70% — đã có audit, chưa hoàn tất chấm điểm hàng loạt. |
| 2 — Tối ưu landing tiền | `/hut-be-phot-quang-ninh/`, `/thong-tac-cong-quang-ninh/`, `/thong-tac-bon-cau-quang-ninh/`, `/hut-ham-cau-quang-ninh/`, `/nao-vet-ho-ga-quang-ninh/` — sửa H1/H2, CTA, ảnh thật, alt, FAQ, schema, internal link, public, chấm Rank Math. | 50% — đã có ảnh + content fix doorway, còn thiếu chấm Rank Math sau publish. |
| 3 — Bài local theo khu vực | hút bể phốt / thông tắc cống / thông tắc bồn cầu cho Hạ Long, Cẩm Phả, Uông Bí, Móng Cái. | **95%** — 4 trang TTC phường publish 2026-06-05; 6 trang HBP huyện live; audit chất lượng 2026-06-08 đạt 6/6; internal link đủ. |
| 4 — Cụm bài hỗ trợ + internal link | Dấu hiệu bể phốt đầy, bồn cầu rút chậm, mùi hôi cống, hóa chất tự thông, chu kỳ hút, chi phí. | **90%** — đã publish, có Rank Math meta, internal link 2 chiều (landing→info + info→landing). Còn: audit nội dung chất lượng từng bài. |

## Quy ước cập nhật file này

- Mỗi khi có thay đổi lớn (publish bài, sửa cấu trúc, đổi quy tắc), cập nhật mục "Đã làm gần đây" và "Đang làm dở".
- Trạng thái chi tiết theo task ghi vào `docs/SEO_PROGRESS.csv`, không ghi vào file này.
- Khi `SEO_STATUS_*.md` mới được tạo ở root, tham chiếu nó tại mục "Đã làm gần đây".
