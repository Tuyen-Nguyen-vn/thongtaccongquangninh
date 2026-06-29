# Audit SEO/GEO nhóm ưu tiên — thongtaccongquangninh.com

- **Ngày:** 2026-06-05
- **Phạm vi:** 10 URL ưu tiên (`reports/priority-urls-2026-06-05.txt`)
- **Khung đối chiếu:** 5 đòn bẩy từ `D:\Downloads\Nghiên cứu Case Study SEO Google.md` + chuẩn nội bộ (`docs/SEO_CHECKLIST.md`, `AGENTS.md`, `docs/SEO_RULES.md`).
- **Chế độ:** READ-ONLY (chỉ audit, chưa sửa site).

## ⚠️ Giới hạn môi trường audit (đọc trước)

Môi trường chạy **không resolve được DNS** cho `thongtaccongquangninh.com` (Google.com fetch 200, domain dự án trả `ENOTFOUND`/không có IP). Vì vậy **không chạy được các tool fetch live** (`audit_seo_full.mjs`, `audit_live_*`, `audit_live_structured_data.mjs`).

Audit này dùng **3 nguồn dữ liệu thật offline**:
1. **Snapshot live** `wp-url-audit-list.json` (chụp 2026-06-04, REST + sitemap) — title/slug/sitemap/dates thật của 77 trang public.
2. **Source plugin** sinh schema/meta ở template (`ttcqn-doorway-schema`, `ttcqn-seo-cleanup-redirects`, `ttcqn-home-emergency-renderer`, `ttcqn-co-so-renderer`) — logic thật đang chạy.
3. **Drafts + gate** `seo_score.py`, `check_image_seo_gate.mjs` — chấm điểm thật.

Các mục cần HTML render thật (meta robots thực tế, canonical thực tế, GSC index) được đánh dấu **`[VERIFY-LIVE]`** — Tuyền chạy lại trên máy có mạng bằng lệnh ghi ở cuối.

---

## Bảng tổng hợp: 10 URL ưu tiên × 5 đòn bẩy

| URL | Title len | In sitemap | #1 Schema template | #2 max-img-preview | #3 Canonical/Dup | #4 Pre-click schema | #5 Index/GSC |
|---|---|---|---|---|---|---|---|
| `/` (home) | — | yes | LocalBusiness+Breadcrumb+WebSite ✅ | [VERIFY-LIVE] | OK | Service/Offer ✅ | [VERIFY-LIVE] |
| `/hut-be-phot-quang-ninh/` | 56 | yes | LocalBusiness+Service ✅ / **Breadcrumb?** | [VERIFY-LIVE] | dup 0.65 vs xe-hut | Service+FAQ ✅ | [VERIFY-LIVE] |
| `/thong-tac-cong-quang-ninh/` | 68 | yes | Service ✅ / **Breadcrumb?** | [VERIFY-LIVE] | OK | Service+FAQ ✅ | [VERIFY-LIVE] |
| `/thong-tac-cong-ha-long/` | 60 | yes | Service ✅ / **Breadcrumb?** | [VERIFY-LIVE] | dup 0.63 vs bồn cầu HL | Service+FAQ ✅ | [VERIFY-LIVE] |
| `/bang-gia/` | 52 | yes | OfferCatalog ✅ | [VERIFY-LIVE] | OK | OfferCatalog ✅ | [VERIFY-LIVE] |
| `/lien-he/` | 60 | yes | ContactPage ✅ | [VERIFY-LIVE] | OK | ContactPage ✅ | [VERIFY-LIVE] |
| `/thong-tac-cong-tuan-chau/` | 62 | yes | Service ✅ / **Breadcrumb?** | [VERIFY-LIVE] | OK | Service+FAQ ✅ | live OK |
| `/thong-tac-cong-bai-chay/` | 70 | yes | Service ✅ / **Breadcrumb?** | [VERIFY-LIVE] | OK | Service+FAQ ✅ | live OK |
| `/thong-tac-cong-cao-xanh/` | 61 | yes | Service ✅ / **Breadcrumb?** | [VERIFY-LIVE] | OK | Service+FAQ ✅ | live OK |
| `/thong-tac-cong-gieng-day/` | 60 | yes | Service ✅ / **Breadcrumb?** | [VERIFY-LIVE] | OK | Service+FAQ ✅ | live OK |

> Tất cả title ≤ 70 ký tự, đều có trong sitemap. 4 trang khu vực **đã LIVE** (bản nâng cấp 95/100 trong `content-drafts/` đang bị chặn publish bởi image gate — xem P0).

---

## Đối chiếu 5 đòn bẩy Case Study → hiện trạng

### Đòn bẩy #1 — Structured data ở TEMPLATE (Eventbrite)
**Hiện trạng: TỐT.** Plugin `ttcqn-doorway-schema.php` tự sinh ở template: `LocalBusiness`, `Service`, `VideoObject`, `OfferCatalog`, `ContactPage`, `BlogPosting`, `FAQPage`, `WebSite`+`SearchAction`. Đây đúng mô hình "nhúng schema vào base template" của Eventbrite.
**Khoảng trống thật:** `BreadcrumbList` **chỉ có ở homepage** (`ttcqn-home-emergency-renderer.php:285`), **không có trong template** trang dịch vụ/khu vực — đang phụ thuộc Rank Math. → đưa Breadcrumb vào doorway-schema để nhất quán + tăng rich snippet (P1).

### Đòn bẩy #2 — `max-image-preview:large` cho Discover (Kirbie's +79%, Istoé +332%)
**Hiện trạng: RỦI RO / CHƯA XÁC MINH.** Trong source, `max-image-preview:large` **chỉ áp cho author archive (noindex)** (`ttcqn-seo-cleanup-redirects.php:163,173`). Với trang/bài **index** thì phụ thuộc setting Image SEO global của Rank Math — **chưa xác minh**. Đây là **quick-win CTR Discover** rõ nhất từ case study. → `[VERIFY-LIVE]` + bật nếu thiếu (P1).

### Đòn bẩy #3 — Dọn meta rác + canonical (Saramin +102%)
**Hiện trạng: PHẦN LỚN ĐÃ LÀM.** Trên 77 trang public: **0 title > 70 ký tự**, **0 trang public thiếu sitemap** (mục "10 URL ngoài sitemap" trong PROJECT_STATE đã hết trong snapshot mới). Title đã đa dạng hóa mạnh: chỉ còn **6 cặp gần trùng (Jaccard ≥ 0.6)** so với 84 cặp ghi trong PROJECT_STATE.
**Còn lại (P1/P2):**
- `Hút Bể Phốt Đông Triều …` vs `… Móng Cái …` (0.78) — cùng khuôn title.
- `Hút bể phốt Đầm Hà / Hải Hà / Tiên Yên …` (0.60–0.65) — cụm huyện cùng khuôn.
- `Hút Bể Phốt Quảng Ninh …` vs `Xe Hút Bể Phốt Quảng Ninh 2026 …` (0.65) — nguy cơ ăn thịt từ khóa (cannibalization), cần phân vai canonical/intent.
- Canonical thực tế từng URL: `[VERIFY-LIVE]`.

### Đòn bẩy #4 — Schema "bộ lọc pre-click" (ZipRecruiter ×4.5)
**Hiện trạng: TỐT.** `Service` + `FAQPage` + `LocalBusiness` cấp đủ thông tin pre-click (giá, khu vực, hotline, FAQ) ngay trên SERP. `OfferCatalog` ở trang bảng giá đóng vai filter giá.
**Lưu ý compliance (không phải lỗi):** plugin **chủ động xóa `aggregateRating`/`review`** (`ttcqn-home-emergency-renderer.php:2836-2840`) — đúng chính sách Google chống self-serving review. **Không khuyến nghị thêm review giả** (vi phạm policy + luật dự án cấm bịa). Nếu sau này có review thật của bên thứ ba mới cân nhắc.

### Đòn bẩy #5 — Giám sát kỹ thuật bằng Search Console
**Hiện trạng: CÓ TOOLING, CHƯA CHẠY ĐƯỢC Ở ĐÂY.** Tool `audit_gsc_404_redirect.mjs` tồn tại nhưng cần mạng + quyền GSC (đều thiếu trong môi trường này). → `[VERIFY-LIVE]`: chạy GSC coverage + URL Inspection trên 10 URL ưu tiên định kỳ (đỏ→xanh như Saramin).

---

## Image SEO & GEO (Local + Generative)

### Image gate — 4 trang khu vực: **FAIL (PENDING_IMAGE_SEO)**
`check_image_seo_gate.mjs` cho cả 4 slug (`bai-chay`, `cao-xanh`, `tuan-chau`, `gieng-day`): `status=PENDING_IMAGE_SEO`, `pass=false`. Lỗi chung: thiếu ảnh đầu bài, thiếu ảnh case study, **Ảnh 3 thiếu vị trí chèn / trang dùng / ghi chú thật-minh họa**. → bản nâng cấp 95/100 không qua gate publish. **Đây là chặn P0 đang giữ traffic local.**

### Local Geo
- NAP hotline `0963.953.533 / 0931.156.756` xuất hiện nhất quán trong excerpt/title các trang (snapshot). Schema `LocalBusiness` có `address`, `geo`, `sameAs` ở template. → `[VERIFY-LIVE]` đối chiếu NAP hiển thị vs schema bằng `audit_nap_social_links.mjs`.
- Title trang khu vực đã nhúng đặc thù (nhà hàng/khách sạn Bãi Cháy, kho xưởng Giếng Đáy, quán ăn Cao Xanh) — tốt cho local entity. Drafts đạt PASS local entity trong `seo_score.py`.

### Generative (AI Overview / Discover) eligibility
- Điều kiện nền: indexable + helpful + schema giàu → phần lớn đạt ở template. **Nút thắt là #2 (max-image-preview) chưa chắc + ảnh chưa đủ** → giảm cơ hội Discover. Ưu tiên đóng #2 và image gate trước.

---

## Backlog fix xếp ưu tiên

### P0 — Chặn traffic, làm ngay
1. **Hoàn tất image package cho 4 trang khu vực** (bai-chay, cao-xanh, tuan-chau, gieng-day): bổ sung ảnh đầu bài + case study + Ảnh 3 (vị trí chèn, trang dùng, ghi chú thật/minh họa) → qua `check_image_seo_gate.mjs` → push bản 95/100 đã sẵn trong `content-drafts/`.

### P1 — Quick-win đòn bẩy cao, ít rủi ro
2. **[VERIFY-LIVE] + bật `max-image-preview:large` site-wide** cho trang/bài index (đòn bẩy #2 — CTR Discover). Kiểm Rank Math Global Meta; nếu thiếu, thêm qua filter `rank_math/frontend/robots` cho mọi singular (không chỉ author).
3. **Thêm `BreadcrumbList` vào `ttcqn-doorway-schema`** cho trang dịch vụ/khu vực (đòn bẩy #1) — nhất quán template, tăng rich snippet pre-click.
4. **Phân vai `/hut-be-phot-quang-ninh/` vs `/xe-hut-be-phot-quang-ninh-2026/`** (dup 0.65): chốt trang canonical chính + khác hóa intent/title để hết cannibalization.

### P2 — Dọn dài hạn
5. **Đa dạng hóa 6 cặp title gần trùng** còn lại (Đông Triều/Móng Cái; cụm Đầm Hà/Hải Hà/Tiên Yên) — khác khuôn theo đặc thù từng địa bàn.
6. **[VERIFY-LIVE] GSC coverage + URL Inspection** định kỳ cho 10 URL ưu tiên (đòn bẩy #5).
7. **Giảm `globalReuseGroups`** (ảnh dùng lại giữa nhiều URL) theo audit ảnh trước đó.

---

## Lệnh verify-live (Tuyền chạy trên máy có mạng)

```bash
# Đòn bẩy #2,#3 — meta robots + canonical thực tế + on-page
node tools/audit_seo_full.mjs
node tools/audit_live_structured_data.mjs        # #1,#4 schema thực tế
node tools/audit_nap_social_links.mjs            # NAP local
node tools/audit_gsc_404_redirect.mjs            # #5 GSC coverage
# Soi sâu 1 URL:
node tools/audit_live_seo_page.mjs thong-tac-cong-ha-long
```
Đối chiếu kết quả với bảng trên; mục `[VERIFY-LIVE]` chuyển thành PASS/FAIL thật.

## Verification của phiên audit này
- 4 draft khu vực: `seo_score.py` = 95/100 (ĐẠT) — log thật.
- 4 image gate: `PENDING_IMAGE_SEO` (FAIL) — report JSON trong `reports/image-gate-*.json`.
- Snapshot 77 trang public: 0 title>70, 0 sitemap-gap, 6 cặp dup title — tính từ `wp-url-audit-list.json`.
- Source 5 đòn bẩy: trích dẫn file:dòng ở từng mục trên.

**Việc tiếp theo nên làm: Hoàn tất image package cho 4 trang khu vực (P0) để mở khoá publish bản 95/100 đang bị image gate chặn.**
