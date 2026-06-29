# AUDIT TOÀN DIỆN — thongtaccongquangninh.com
**Ngày**: 2026-06-21 | **Phạm vi**: 87 URL publish | **Nguồn**: LIVE (WP REST + HTTP fetch)

---

## TÓM TẮT EXECUTIVE

| Trọng tâm | Trạng thái | Vấn đề nghiêm trọng |
|---|---|---|
| Technical SEO | ✅ XANH | 0 HIGH |
| On-page + Schema | ✅ XANH | 1 MEDIUM (meta dài, breadcrumb) |
| Chất lượng nội dung | 🟡 VÀNG | 39 WARN word-count (không có lỗi nội dung thật) |
| Clean code / Plugin | 🔴 ĐỎ | ≈41 one-shot/debug plugin còn ACTIVE (riêng cụm wr2…wr25 = 22) |
| NAP / Schema địa chỉ | 🟡 VÀNG | 2 địa chỉ xung đột trong JSON-LD (Organization vs LocalBusiness) |

**Kết luận nhanh**: Site SEO on-page + schema sạch (FAIL=0). Technical OK (0 lỗi 404, sitemap/redirect/index sạch). Hai vấn đề chính:
1. **Rác plugin nghiêm trọng** — tổng 78 plugin, ~70 active, trong đó **≈41 plugin custom one-shot/debug vẫn ACTIVE** (riêng cụm `ttcqn-wr2…wr25` = 22 plugin, cộng ~19 plugin meta/title/fix một-lần gồm cả cụm post-282). Không gây lỗi SEO ngay nhưng tăng attack surface, PHP memory, và là nguồn của schema/meta chồng lớp.
2. **NAP địa chỉ không nhất quán** — JSON-LD Organization còn mang địa chỉ cũ "111 Cái Lân, Bãi Cháy" trong khi LocalBusiness dùng địa chỉ khác → cần Tuyền chốt địa chỉ trụ sở chính (CODEX_CONTEXT để trống "xác nhận với Tuyền").

---

## 1. TECHNICAL SEO

### 1.1 robots.txt
```
User-agent: *
Allow: /
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Sitemap: https://thongtaccongquangninh.com/sitemap_index.xml
```
**Đánh giá**: ✅ Sạch. Không chặn CSS/JS, không chặn nội dung quan trọng. Sitemap pointer đúng.

### 1.2 Sitemap
- Sitemap index: 200 OK → 3 child sitemaps → 85 URL
- Bao gồm `locations.kml` (KML file địa lý) — không phải HTML, không hại SEO
- Thực tế indexable: 84 URL (85 − 1 kml)
- REST published: 87 = 84 indexable + 3 noindex utility pages (chinh-sach-bao-mat, dieu-khoan-dich-vu, he-thong-lien-ket-doi-tac) ✅ khớp đúng

**Phát hiện**: `sitemapThinContent: 1` — 1 URL trong sitemap bị đánh dấu thin content bởi tool. Cần xác định URL nào.

### 1.3 404 / Redirect
- ❌ 404: **0** ✅
- ↪️ Redirect 301→200: **27** (tất cả đều hợp lệ)
  - www/http → https (4 redirect canonical)
  - Old slugs → new slugs (lien-he-2, contact, ve-chung-toi, about, tin-tuc, news, blog-2, etc.)
  - Old service paths → new (dich-vu-hut-be-phot, dich-vu-thong-tac-cong)
- ✅ Không có chain redirect dài. Tất cả đều 1 bước.

### 1.4 Indexability
- Sitemap có URL: 0 redirect, 0 not-200, 0 noindex, 0 canonical sai
- Internal link graph: HBP main và TTC main đều đủ link đến các trang area con ✅
- Internal link audit (87 link): 0 broken ✅

### 1.5 CWV / Performance [VERIFY-LIVE]
- WP Rocket active → caching OK
- ttcqn-perf-helpers active → performance helpers
- **Không thể đo PageSpeed trong môi trường này**
- URL cần đo thủ công: `/`, `/hut-be-phot-quang-ninh/`, `/thong-tac-cong-quang-ninh/`, `/thong-tac-bon-cau-quang-ninh/`, `/bang-gia/`, `/nao-vet-ho-ga-quang-ninh/`

---

## 2. ON-PAGE + SCHEMA

### 2.1 Kết quả Full Audit (87 URL)
| Metric | Kết quả |
|---|---|
| FAIL | **0** |
| PASS | **48** |
| WARN | **39** (toàn bộ word count) |
| Duplicate title ≥85% | **0** |
| Thiếu H1 / multi-H1 | **0** |
| Thiếu H2 bắt buộc | **0** |
| Ảnh < 3 / thiếu alt | **0** |
| Từ cấm | **0** |
| Thiếu hotline trong body | **0** |
| robots conflict | **0** |

### 2.2 Issues phát hiện
| URL | Issue | Mức | Ghi chú |
|---|---|---|---|
| /gioi-thieu/ | META_LONG(167) | MEDIUM | Vượt 160 ký tự 7 ký tự. Cắt bớt nhẹ. |

### 2.3 Schema
- Phân phối: 87/87 có LocalBusiness+HomeAndConstructionBusiness, Place, BreadcrumbList, WebSite, WebPage, ImageObject ✅
- FAQPage: 85/87 ✅ | Service: 75/87 ✅ | HowTo: 5/87 | VideoObject: 3/87
- **WARN**: BreadcrumbList homepage có < 2 item (chỉ 1 ListItem). Google yêu cầu ≥ 2 để hiển thị breadcrumb trong SERP. **MEDIUM**
- Structured data live audit (84 URL): **PASS 83 / WARN 1 / FAIL 0**. JSON-LD parse sạch, không conflict @type, không forbidden review marker.
- **AI Overview (check_ai_schema, 77 trang)**: phần lớn PASS. Một số trang khu vực + `/gioi-thieu/` **thiếu FAQPage schema** (vd `hut-be-phot-van-don`, `thong-tac-cong-dong-trieu`, `gioi-thieu`) → cơ hội tăng eligibility AI Overview (**MEDIUM**). Vài slug bị cảnh báo dài/stop-word (`cach-xu-ly-cong-thoat-nuoc-tac`) → **LOW**, không nên đổi slug (rủi ro redirect). Trang `dieu-khoan-dich-vu` FAIL là **false positive** (trang pháp lý không cần FAQ).

### 2.4 NAP + Social
**Social** (khớp CODEX_CONTEXT.md):
| Profile | Status |
|---|---|
| Facebook facebook.com/moitruongquangninh | ✅ (đúng nguồn chuẩn) |
| TikTok @thongtaccongquangninh | ✅ |
| Zalo 0931156756 | ✅ |
| YouTube @moitruongdothiso1quangninh | ✅ |
| Hotline 0963.953.533 / 0931.156.756 | ✅ xuất hiện nhiều trên home |

**⚠️ NAP địa chỉ — KHÔNG NHẤT QUÁN (MEDIUM)**:
- JSON-LD **Organization** (homepage): `streetAddress: "111 Cái Lân", addressLocality: "Bãi Cháy"` — đây là **địa chỉ cũ** (tool đánh dấu `oldMarker: "111 Cái Lân"`).
- JSON-LD **LocalBusiness** (homepage): dùng địa chỉ khác (khu Hà Lầm / Hạ Long theo cấu hình NAP).
- → Hai schema trên cùng 1 trang khai báo 2 địa chỉ khác nhau. Google đọc tín hiệu NAP mâu thuẫn, hại local ranking.
- **Hành động**: Tuyền chốt 1 địa chỉ trụ sở chính (CODEX_CONTEXT.md đang để "xác nhận địa chỉ cụ thể với Tuyền"), sau đó đồng bộ cả Organization + LocalBusiness về cùng địa chỉ. **Không tự bịa địa chỉ.**

**Lưu ý**: Báo cáo trước ghi Facebook `thongtacconghalong24h` là sai — nguồn chuẩn (CODEX_CONTEXT.md) và schema live đều là `facebook.com/moitruongquangninh`.

---

## 3. CHẤT LƯỢNG NỘI DUNG

### 3.1 Informational content (12 bài)
- **12/12 đạt 8/8 điểm** ✅ — tất cả đủ: từ ≥ 2000, ảnh ≥ 3, FAQ, internal link, hotline, H2, không từ cấm, author byline.

### 3.2 Phân tích 39 WARN word-count

**WORD_TOO_LONG (>3500 từ)** — 9 URL:
| URL | Từ |
|---|---|
| /xe-hut-be-phot-quang-ninh/ | 3845 |
| /thong-tac-cong-ngo-nho-ha-long/ | 3555 |
| /thong-tac-bon-cau-khach-san-quang-ninh/ | 3553 |
| /thong-tac-cong-tuan-chau/ | 3504 |
| /hut-be-phot-tien-yen/ | 3534 |
| /hut-be-phot-co-to/ | 3518 |
| /hut-be-phot-bai-chay/ | 3525 |
| /gia-hut-be-phot-quang-ninh/ | 3539 |
| / | 3533 |

**Đánh giá**: Không cần cắt. Nội dung dài + đầy đủ → tốt cho SEO local service. Google không phạt bài dài có chất lượng.

**WORD_ABOVE_TARGET (3000–3500 từ)** — ~22 URL: Tương tự — OK.

**WORD_BELOW_TARGET / WORD_LOW (<2500 từ)** — 7 URL:
| URL | Từ | Loại | Ưu tiên |
|---|---|---|---|
| /lien-he/ | 1994 | Trang contact — word count thấp là bình thường | THẤP |
| /nguyen-song-hao/ | 1993 | Author page — bình thường | THẤP |
| /gioi-thieu/ | 2017 | About page — có thể bổ sung nhẹ | THẤP |
| /hoa-chat-tu-thong-cong/ | 2019 | Informational — borderline | THẤP |
| /thong-tac-cong-bai-chay/ | 2493 | Landing area — nếu là key landing, bổ sung thêm | MEDIUM |
| /blog/ | 2308 | Blog index — không phải content page | THẤP |
| /chinh-sach-bao-hanh/ | ~2000 | Policy page — bình thường | THẤP |

**Kết luận**: 39 WARN đều không phải lỗi thật. Chỉ `/thong-tac-cong-bai-chay/` (2493 từ) và `/hoa-chat-tu-thong-cong/` (2019 từ) đáng bổ sung nội dung nếu muốn tăng độ dày.

### 3.3 Cannibalization
- Tool `audit_hbp_cannibalization.mjs` chỉ audit slugs cụ thể theo danh sách cứng.
- Không phát hiện URL mồ côi trong nhóm HBP được audit.
- `/xe-hut-be-phot-quang-ninh-2026/` NOT FOUND (REST API) → bài có thể bị xóa/draft, không vấn đề.

---

## 4. CLEAN CODE / KỸ THUẬT

### 4.1 Plugin Active Trên Live — PHÂN LOẠI

**✅ PERMANENT (giữ)**:
| Plugin | Ghi chú |
|---|---|
| akismet | Spam |
| code-snippets | Snippets utility |
| elementor / elementor-pro | Page builder |
| seo-by-rank-math / rank-math-pro | SEO core |
| google-site-kit | GA/GSC |
| wp-rocket | Caching |
| wp-file-manager | Quản lý file |
| wpforms-lite | Form liên hệ |
| wp-mcp-ultimate | WP REST API qua MCP |
| ttcqn-co-so-renderer | Cơ sở renderer |
| ttcqn-doorway-safe-renderer | Doorway safe |
| ttcqn-home-emergency-renderer | Home emergency |
| ttcqn-favicon-override-v3 | Favicon |
| ttcqn-google-ads-tag | GA Ads |
| ttcqn-google-analytics-tag | Analytics |
| ttcqn-gsc-verify | GSC verify |
| ttcqn-qn-service-landing | Service landing |
| ttcqn-www-redirect | www redirect |
| ttcqn-mobile-image-optimizer | Mobile img |
| ttcqn-perf-helpers | Performance |
| ttcqn-redirect-category-bang-gia | Redirect |
| ttcqn-home-service-images | Home images |

**🟡 CẦN ĐÁNH GIÁ LẠI (có thể gỡ nếu Rank Math đã handle)**:
| Plugin | Ghi chú |
|---|---|
| ttcqn-fix-home-v3 | Fix meta home — nếu RM đã OK thì có thể gỡ |
| ttcqn-fix-home-img-alt | Alt fix home — test kỹ trước khi gỡ |
| ttcqn-meta-dau-hieu-fix | Meta fix cho /dau-hieu-be-phot-bi-day/ |
| ttcqn-meta-desc-fix | Meta desc fix — kiểm tra còn cần không |
| ttcqn-meta-15phut | Meta "15 phút" override |
| ttcqn-meta-dieu-khoan-fix | Meta fix /dieu-khoan-dich-vu/ |
| ttcqn-meta-final | Final meta override |
| ttcqn-missing-meta | Audit tool — nên gỡ sau khi audit xong |
| ttcqn-purge-meta-posts | Purge cache helper |
| ttcqn-purge-word-fix | Word fix purge |
| ttcqn-page-296-meta | Meta fix page 296 cụ thể |
| ttcqn-title-long-fix | Cắt title dài — kiểm RM đã handle chưa |
| ttcqn-title-meta-short-2026-06-12 | Title/meta short batch — one-shot theo ngày |

**🔴 CỤM POST-282 — 1 BÀI, 4 PLUGIN RIÊNG (ví dụ điển hình rác chồng lớp)**:
> 4 plugin active chỉ để sửa title/meta/key của **1 post id 282**. Đây là minh hoạ rõ nhất cho việc vá tạm chồng chất. Hợp nhất thành 1 (hoặc đưa vào Rank Math) rồi gỡ cả 4.

| Plugin | Mục đích |
|---|---|
| ttcqn-rm-fix-key-282 | Fix focus keyword post 282 |
| ttcqn-rm-title-clear-282 | Clear title post 282 |
| ttcqn-rm-title-hook-282 | Hook title post 282 |
| ttcqn-title-override-282 | Override title post 282 |

**🔴 ĐỀ XUẤT GỠ — ONE-SHOT / DEBUG (pure one-shot, ưu tiên gỡ trước)**:
> Tất cả là plugin chạy 1 lần (one-shot) / debug. Đã hoàn thành nhiệm vụ, không phục vụ runtime. Gỡ trước vì rủi ro thấp nhất.

| Plugin | Tên | Lý do gỡ |
|---|---|---|
| ttcqn-debug-filter | TTCQN Debug Meta Filter | Debug tool, không cần production |
| ttcqn-rm-meta-debug | Rank Math meta debug | Debug tool |
| ttcqn-wr2 | one-shot (chuỗi wr) | Done |
| ttcqn-wr3 | one-shot (chuỗi wr) | Done |
| ttcqn-wr4 | one-shot (chuỗi wr) | Done |
| ttcqn-wr5 | one-shot (chuỗi wr) | Done |
| ttcqn-wr6 | one-shot (chuỗi wr) | Done |
| ttcqn-wr7 | one-shot (chuỗi wr) | Done |
| ttcqn-wr8 | one-shot (chuỗi wr) | Done |
| ttcqn-wr9 | one-shot literal finder | Done |
| ttcqn-wr10 | one-shot logo caption fix | Done |
| ttcqn-wr11 | one-shot code grep | Done |
| ttcqn-wr12 | one-shot theme reader | Done |
| ttcqn-wr13 | one-shot theme writer | Done |
| ttcqn-wr14 | one-shot opcache reset | Done |
| ttcqn-wr15 | one-shot cache diag + flush | Done |
| ttcqn-wr16 | one-shot json_ld capture | Done |
| ttcqn-wr17 | one-shot live home fetch + grep "So 1" | Done |
| ttcqn-wr18 | one-shot logo caption source diag | Done |
| ttcqn-wr19 | one-shot rank_math schema postmeta dump | Done |
| ttcqn-wr20 | one-shot wp_posts caption hunt | Done |
| ttcqn-wr21 | one-shot fs grep for old caption | Done |
| ttcqn-wr24 | one-shot read fix-10 + mob context | Done |
| ttcqn-wr25 | one-shot mu-plugin brand rename writer | Done |

**✅ INACTIVE (đã ok, không cần làm gì)**:
- ttcqn-fix-home-15phut, -v2, ttcqn-fix-meta-html, -v2, ttcqn-fix-missing-meta
- ttcqn-meta-batch-fix, ttcqn-oneshot-dump3, ttcqn-oneshot-scan, integromat-connector

### 4.2 Footer Legacy Sources
- Quét `audit_footer_legacy_sources.mjs`: **95 finding, 100% chỉ là needle "GỌI NGAY"** (49 draft + 46 publish) — đây là CTA hợp lệ, không phải rác legacy.
- Các needle legacy thật (exit-popup `ai-exit-popup-overlay`, "Đừng rời đi", overlay cũ…): **0 finding** → ✅ exit-popup/footer cũ đã được dọn sạch hoàn toàn.
- Footer variant (từ audit_site_full hashGroups): 3 nhóm hash — 85 URL dùng footer chuẩn, home 1 biến thể, `/thong-tac-cong-ha-long/` 1 biến thể lạ → kiểm tra trang ha-long có footer khác thường (**LOW**).

### 4.3 MD Artifacts Scan
- Script `scan_live_md_artifacts.mjs` cần context=edit (admin) → fail 401.
- **[VERIFY-LIVE]**: Kiểm tra thủ công xem có Markdown leak ra frontend không.

---

## 5. [VERIFY-LIVE] — CẦN KIỂM TRA THỦ CÔNG

| Item | Cách kiểm |
|---|---|
| CWV/PageSpeed 6 URL chính | PageSpeed Insights hoặc Lighthouse |
| sitemap thin content URL | Xem raw JSON indexability report |
| MD artifact frontend | Duyệt source HTML trang bất kỳ, Ctrl+F `##` hoặc `**` |
| Plugin gỡ an toàn | Deactivate 1 WR* plugin → check homepage không vỡ |

---

## 6. ĐỀ XUẤT FIX — THEO ƯU TIÊN

### HIGH
| # | Việc | URL / Phạm vi | Ước lượng |
|---|---|---|---|
| H1 | Gỡ cụm pure one-shot/debug: `ttcqn-wr2…wr25` (22) + `ttcqn-debug-filter` + `ttcqn-rm-meta-debug` (~24 plugin). Deactivate trước, verify home/landing không vỡ, rồi xóa. | WP Admin → Plugins | 30 phút |
| H2 | Hợp nhất **cụm post-282** (4 plugin: rm-fix-key-282, rm-title-clear-282, rm-title-hook-282, title-override-282) về Rank Math của post 282 rồi gỡ cả 4. | WP Admin + post 282 | 20 phút |
| H3 | Đồng bộ **địa chỉ NAP** trong JSON-LD: bỏ "111 Cái Lân, Bãi Cháy" ở Organization, dùng đúng 1 địa chỉ trụ sở (Tuyền chốt). | Schema plugin / home | Cần Tuyền xác nhận địa chỉ |

### MEDIUM
| # | Việc | URL | Ghi chú |
|---|---|---|---|
| M1 | Fix BreadcrumbList homepage < 2 item | / | Thêm ListItem thứ 2 trong schema plugin |
| M2 | Cắt meta /gioi-thieu/ từ 167 → ≤160 ký tự | /gioi-thieu/ | Sửa Rank Math meta desc |
| M3 | Thêm FAQPage schema cho trang khu vực thiếu (hut-be-phot-van-don, thong-tac-cong-dong-trieu, gioi-thieu…) | nhiều URL | Tăng AI Overview eligibility |
| M4 | Rà ~17 plugin meta/title "CẦN ĐÁNH GIÁ LẠI" — gỡ dần nếu Rank Math đã đảm nhận | WP Admin | Test từng cái, đây là nguồn schema/meta chồng lớp |
| M5 | Đo CWV 6 URL chính và fix nếu LCP > 2.5s | 6 URL | [VERIFY-LIVE] |

### LOW
| # | Việc | URL | Ghi chú |
|---|---|---|---|
| L1 | Bổ sung nội dung /thong-tac-cong-bai-chay/ lên ~2800 từ | /thong-tac-cong-bai-chay/ | Nếu cần tăng cạnh tranh |
| L2 | Rà lại 11 plugin "CẦN ĐÁNH GIÁ LẠI" — gỡ nếu RM đã handle | WP Admin | Cẩn thận test trước |
| L3 | Kiểm tra sites.kml trong sitemap — có thể remove để sitemap gọn | sitemap | Không ảnh hưởng index |

---

## 7. TOP URL ƯU TIÊN THEO DÕI

| URL | Lý do chú ý |
|---|---|
| / | Schema BreadcrumbList < 2 item; word 3533 (OK) |
| /gioi-thieu/ | META_LONG(167); word 2017 (borderline) |
| /thong-tac-cong-bai-chay/ | Word thấp nhất trong cluster TTC (2493) |
| /xe-hut-be-phot-quang-ninh/ | Bài dài nhất toàn site (3845 từ) — theo dõi bounce rate |
| /hoa-chat-tu-thong-cong/ | Word 2019 — informational borderline |

---

## 8. SCRIPTS ĐÃ CHẠY

| Script | Output |
|---|---|
| audit_seo_full.mjs (87 URL) | reports/seo-full-audit-2026-06-21.json/.md |
| audit_indexability_2026_06_12.mjs | (inline, sitemapThinContent=1) |
| audit_gsc_404_redirect.mjs | reports/gsc-404-redirect-audit-2026-06-21.md |
| audit_internal_links.mjs | (inline, 0 gap) |
| audit_hbp_cannibalization.mjs | (inline, no cannibalization) |
| audit_live_structured_data.mjs | reports/structured-data-live-audit-2026-06-21.md |
| audit_nap_social_links.mjs | (inline, all 200) |
| audit_informational_content.mjs | reports/audit-informational-2026-06-21.md |
| inspect_wp_plugins.mjs | 78 plugin tổng, ~70 active, ≈41 custom one-shot/debug active |
| audit_footer_legacy_sources.mjs | 95 finding = 100% CTA "GỌI NGAY"; 0 legacy thật |
| audit_nap_social_links.mjs | Social OK; ⚠️ Organization schema còn địa chỉ cũ "111 Cái Lân" |
| scan_live_md_artifacts.mjs | FAIL 401 (cần context=edit) → [VERIFY-LIVE]; Bước 1 đã quét forbidden-word 87 trang = 0 |
| check_ai_schema.mjs | **Đã fix** key đọc list (entries) → 77 trang; vài trang thiếu FAQPage |
| audit_live_structured_data.mjs | **Đã fix** key đọc list → 84 URL: PASS 83 / WARN 1 / FAIL 0 |

> Ghi chú clean-code tooling: 2 script `check_ai_schema.mjs` + `audit_live_structured_data.mjs` đọc key chết `publicAuditUrls` (generator giờ ghi `entries`) → đã sửa đọc `entries` lọc `is_public`. Không đụng live site.

---

**Việc tiếp theo nên làm: Vào WP Admin → Plugins → deactivate cụm pure one-shot `ttcqn-wr2…wr25` + `ttcqn-debug-filter` + `ttcqn-rm-meta-debug` (~24 plugin, chỉ deactivate, chưa xóa) → verify homepage + 2 landing chính còn hiện đúng.**
