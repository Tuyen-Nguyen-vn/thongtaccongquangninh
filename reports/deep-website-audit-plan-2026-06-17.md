# Kế Hoạch Audit Chuyên Sâu Website

Website: https://thongtaccongquangninh.com
Ngày lập plan: 2026-06-17
Phạm vi mặc định: audit read-only trước, không sửa live, không publish, không xóa file.

## 1. Mục tiêu audit

- Xác định lỗi ảnh hưởng trực tiếp đến crawl, index, canonical, snippet, schema, ảnh SEO, internal link và chuyển đổi hotline.
- Đối chiếu lại các fix đã làm ngày 2026-06-08 đến 2026-06-16, tránh sửa lại việc đã xong.
- Ưu tiên lỗi có impact thật: noindex bất thường, trang thiếu ảnh, URL lỗi từ GSC, content quá dài/mỏng, ảnh dùng lại, schema trùng hoặc không khớp nội dung hiển thị.
- Tạo danh sách việc sửa theo batch nhỏ, có backup và verify frontend trước khi báo xong live.

## 2. Nguồn dữ liệu bắt buộc

- `AGENTS.md`
- `CODEX_CONTEXT.md`
- `TASKS.md`
- `docs/PROJECT_STATE.md`
- `SEO_STATUS_*.md` mới nhất
- `wp-url-audit-list.json`
- `reports/seo-full-audit-2026-06-16.md`
- `reports/site-full-audit-2026-06-16.md`
- `reports/wp-unique-image-audit-2026-06-16T05-38-19.md`
- `reports/gsc-404-redirect-audit-2026-06-16T04-30-43.md`
- `SEO_RULES.md`
- `CONTENT_RULES.md`
- `ARTICLE_SEO_AI_OVERVIEW_CHECKLIST.md`
- `skills/seo-local-audit-strict/SKILL.md`

## 3. Pha audit

### Pha 0 - Pre-flight và inventory

Lệnh dự kiến:

```powershell
node .\tools\refresh_url_audit.mjs
node .\tools\audit_site_full.mjs
node .\tools\audit_seo_full.mjs
```

Việc kiểm:

- Tổng URL published, pages/posts, sitemap coverage.
- URL canonical/indexable thật.
- URL public 200, redirect, 404, 5xx.
- So sánh report mới với report ngày 2026-06-16.

Output:

- `reports/site-full-audit-YYYY-MM-DD.md/json`
- `reports/seo-full-audit-YYYY-MM-DD.md/json`
- Danh sách P0/P1/P2.

### Pha 1 - Crawl, index, canonical, sitemap

Lệnh dự kiến:

```powershell
node .\tools\audit_indexability_2026_06_12.mjs
node .\tools\audit_gsc_404_redirect.mjs
```

Việc kiểm:

- `robots.txt`, sitemap, canonical, meta robots.
- URL đang muốn SEO nhưng bị `noindex`.
- URL redirect còn trong sitemap.
- 404/5xx còn tồn tại từ GSC hoặc inventory.

Điểm ưu tiên hiện tại:

- Kiểm lại `https://thongtaccongquangninh.com/xe-hut-be-phot-quang-ninh/` vì report 2026-06-16 báo `NOINDEX_UNEXPECTED`.
- Kiểm lại 2 URL lỗi tạm trong report GSC: `/page/3/` status 502 và `/?page_id=2/` status 503.

### Pha 2 - On-page SEO và content quality

Lệnh dự kiến:

```powershell
node .\tools\audit_seo_full.mjs
python .\tools\seo_score.py content-drafts\thong-tac-cong-bai-chay-rankmath-draft.md "thông tắc cống Bãi Cháy"
```

Việc kiểm:

- Title/meta length, hotline trong meta, focus keyword.
- 1 H1, H2 bắt buộc, CTA giữa/cuối, hotline trong body.
- Từ cấm: "chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm".
- Word count bất thường: quá mỏng, quá dài, filler, nội dung lặp.
- Dòng tác giả cuối bài đúng link Nguyễn Song Hào.
- Intent từng page: landing tiền, local subpage, informational, policy/contact.

Điểm ưu tiên hiện tại:

- `/dieu-khoan-dich-vu/`: 1049 từ, 0 ảnh.
- `/xe-hut-be-phot-quang-ninh/`: 3857 từ và noindex bất thường.
- Nhóm bài quá dài >3500 từ: homepage, `gia-hut-be-phot-quang-ninh`, `hut-be-phot-bai-chay`, `hut-be-phot-co-to`, `hut-be-phot-tien-yen`, `thong-tac-bon-cau-khach-san-quang-ninh`, `thong-tac-cong-ngo-nho-ha-long`.
- Nhóm bài mỏng 2000-2300 từ: blog, chính sách bảo mật, giới thiệu, hóa chất tự thông cống, liên hệ, trang tác giả.

### Pha 3 - Doorway, duplicate và local entity

Lệnh dự kiến:

```powershell
node .\tools\audit_hbp_area_pages.mjs
node .\tools\audit_ttc_area_pages.mjs
node .\tools\audit_bc_area_pages.mjs
node .\tools\audit_hbp_cannibalization.mjs
```

Việc kiểm:

- Trang địa phương có khác nhau thật về intent, địa hình, loại công trình, FAQ, case/tình huống.
- Không dùng chung case study giữa khu vực.
- Không chỉ thay địa danh trên cùng khung nội dung.
- Internal link về landing đúng dịch vụ, đúng địa phương.
- Anchor có dấu, tự nhiên, không spam.

Output:

- Bảng nhóm URL có nguy cơ doorway/cannibalization.
- Đề xuất rewrite từng cụm, không sửa hàng loạt khi chưa duyệt.

### Pha 4 - Image SEO

Lệnh dự kiến:

```powershell
python .\tools\audit_unique_wp_images.py
node .\tools\audit_homepage_images.mjs
node .\tools\check_homepage_hotlink.mjs
```

Việc kiểm:

- Mỗi URL quan trọng có tối thiểu 3 ảnh nội dung.
- Ảnh không trùng trong cùng page, không reuse quá mức giữa nhiều page.
- Tên file không dấu, alt tự nhiên có dịch vụ/khu vực, không nhồi keyword.
- Không hotlink ngoài domain.
- Ảnh hero/LCP không lazy-load sai.
- Không dùng poster quảng cáo thay ảnh thi công.

Điểm ưu tiên hiện tại:

- `/dieu-khoan-dich-vu/` thiếu 3 ảnh.
- Report 2026-06-16 còn `Global reused image groups: 2`, cần review thủ công trước khi fix.

### Pha 5 - Schema và Search appearance

Lệnh dự kiến:

```powershell
node .\tools\audit_live_structured_data.mjs
node .\tools\check_ai_schema.mjs
```

Việc kiểm:

- `LocalBusiness`, `Service`, `FAQPage`, `BreadcrumbList`, `BlogPosting` parse được.
- Schema khớp nội dung visible: giá, FAQ, NAP, hotline, author, ngày.
- Không có rating/review/case giả.
- Không duplicate schema do nhiều plugin/filter cùng bơm.
- `max-image-preview:large`, favicon, OG image, image sitemap.

Output:

- Danh sách URL schema lỗi hoặc schema thừa cần gỡ.
- Danh sách URL cần test bằng Rich Results Test thủ công nếu cần.

### Pha 6 - Internal link, menu, footer, NAP

Lệnh dự kiến:

```powershell
node .\tools\audit_internal_links.mjs
node .\tools\audit_live_links_assets.mjs
node .\tools\audit_nap_social_links.mjs
```

Việc kiểm:

- Broken internal links = 0.
- Link không trỏ qua redirect nếu có URL đích trực tiếp.
- Menu/footer không kéo nhãn sai từ title dài.
- NAP/hotline/social nhất quán.
- Footer variant: report 2026-06-16 ghi 2 variant, cần xác định đó là chủ ý hay lệch renderer.

### Pha 7 - Frontend render, mobile, conversion

Việc kiểm:

- Homepage và 5 landing tiền trên desktop/mobile.
- CTA gọi điện/Zalo click được.
- Floating CTA không che nội dung, không che form/link.
- Trang render bằng option/plugin custom phải kiểm cả REST và HTML live.
- Cache-buster khi verify: `?nowprocket=1&codex=<timestamp>`.

URL spot-check bắt buộc:

- `/`
- `/hut-be-phot-quang-ninh/`
- `/thong-tac-cong-quang-ninh/`
- `/thong-tac-bon-cau-quang-ninh/`
- `/nao-vet-ho-ga-quang-ninh/`
- `/xu-ly-mui-hoi-quang-ninh/`
- `/bang-gia/`
- `/lien-he/`

### Pha 8 - Performance và technical debt

Lệnh dự kiến:

```powershell
python .\tools\project_folder_manager.py --root D:\.thongtaccongquangninh
```

Việc kiểm:

- Script/plugin đang còn marker live hay đã dead code.
- Không xóa plugin/source/report/media nếu chưa phân loại `SAFE_DELETE`.
- Homepage renderer, favicon override, cleanup redirects, schema plugin, Google Ads tag: mặc định KEEP nếu còn tác dụng live.
- PageSpeed/Lighthouse: LCP image, unused JS/CSS, render-blocking, ảnh trang chủ.

Output:

- Report dead code dạng `KEEP / REVIEW_REQUIRED / SAFE_DELETE`.
- Không tự xóa nếu chưa có bằng chứng và chưa được duyệt.

## 4. Ưu tiên xử lý sau audit

### P0 - Cần xử lý trước

- URL quan trọng bị `noindex` bất thường.
- 404/5xx public hoặc URL GSC lỗi còn tái hiện.
- Sitemap chứa URL redirect/noindex/draft.
- Broken internal link hoặc CTA/hotline sai.
- Schema spam hoặc schema không khớp nội dung visible.

### P1 - Cần xử lý trong batch gần nhất

- `/dieu-khoan-dich-vu/` thiếu ảnh và quá mỏng.
- Các trang quá dài >3500 từ cần cắt filler, giữ intent và CTA.
- Các trang 2000-2300 từ cần bổ sung nội dung có ích nếu là page SEO cần rank.
- 2 global image reuse groups cần thay ảnh hoặc đổi lớp vỏ nếu có rủi ro trùng tín hiệu.
- Footer variant cần xác nhận nguồn renderer.

### P2 - Theo dõi

- SERP snippet cập nhật sau đổi meta.
- GSC Coverage cho URL đã noindex có chủ ý.
- Core Web Vitals sau các thay đổi homepage/ảnh.
- Rank Math score và focus keyword coverage sau batch mới.

## 5. Deliverable sau khi chạy audit thật

- `reports/deep-website-audit-YYYY-MM-DD.md`
- `reports/deep-website-audit-YYYY-MM-DD.json`
- Bảng lỗi theo `P0 / P1 / P2`.
- Bảng URL: status, canonical, index, title/meta, H1, words, images, schema, internal links, score, action.
- Danh sách batch fix đề xuất, mỗi batch tối đa 3-5 URL.
- Cập nhật `docs/SEO_PROGRESS.csv` với task audit và trạng thái.

## 6. Gate trước khi chuyển từ audit sang sửa live

- Có danh sách URL/Post ID/option/plugin/file sẽ sửa.
- Có backup trước sửa live.
- Có lệnh verify sau sửa.
- Với ảnh: lấy từ `Ảnh cung cấp`, xử lý sang `Ảnh Đã Xử Lý SEO`, không dùng poster quảng cáo.
- Với WordPress live: kiểm REST và frontend public, không kết luận từ REST một mình.
- Không publish/sửa hàng loạt nếu Tuyền chưa duyệt batch.

## 7. Việc tiếp theo nên làm

Chạy audit read-only theo Pha 0 và Pha 1, sau đó xử lý trước URL `https://thongtaccongquangninh.com/xe-hut-be-phot-quang-ninh/` nếu vẫn còn `NOINDEX_UNEXPECTED`.
