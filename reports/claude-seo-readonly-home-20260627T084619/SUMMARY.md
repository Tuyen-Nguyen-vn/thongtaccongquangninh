# Claude SEO read-only audit homepage

Ngày chạy: 2026-06-27 08:46-08:50  
URL kiểm tra: `https://thongtaccongquangninh.com/?nowprocket=1&codex=claude-seo-20260627T084619`  
Phạm vi: read-only, không sửa WordPress live.

## Artifact

- `home-cachebuster.html`: HTML public tải bằng `curl`, cache-buster.
- `parse-home.json`: kết quả `claude-seo/scripts/parse_html.py`.
- `robots.txt`: robots public.
- `sitemap_index.xml`: sitemap index public.
- `pagespeed-mobile.json`: PageSpeed mobile, bị Google rate limit.
- `pagespeed-mobile-retry-20260627T111649.json`: PageSpeed mobile retry, vẫn bị Google rate limit.
- `crux-phone-retry-20260627T111649.json`: CrUX PHONE retry, bị chặn vì thiếu API key.
- `pagespeed-both-env-20260627T112350.json`: PageSpeed mobile + desktop chạy thành công bằng `PAGESPEED_API_KEY` từ môi trường local.
- `crux-phone-env-20260627T112350.json`, `crux-desktop-env-20260627T112350.json`: CrUX-only với key hiện có, trả 403 Forbidden.
- `home-root-20260627T112350.html`: HTML root không cache-buster để đối chiếu cảnh báo Lighthouse.

## Kết quả chính

### Pass

- HTTP header homepage trả `200` khi kiểm bằng `curl -I -L`.
- `robots.txt` cho phép crawl toàn site, chặn `/wp-admin/`, cho phép `admin-ajax.php`, khai báo `sitemap_index.xml` và `news-sitemap.xml`.
- `sitemap_index.xml` đọc được, có `post-sitemap.xml`, `page-sitemap.xml`, `video-sitemap.xml`.
- Canonical: `https://thongtaccongquangninh.com/`.
- Meta robots: `follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large`.
- H1 duy nhất: `HÚT BỂ PHỐT, THÔNG TẮC CỐNG QUẢNG NINH 24/7`.
- Title dài 63 ký tự, trong ngưỡng tốt.
- Meta description dài 157 ký tự, có hotline.
- 67 ảnh đều có alt text.
- 67 ảnh đều có width/height.
- JSON-LD parse được: 2 script, không lỗi JSON.
- Không thấy `aggregateRating`, `ratingValue`, `reviewCount` hoặc `Review` schema trong HTML.
- Các link icon không có text hiển thị đều có `aria-label` hoặc `title`.
- PageSpeed chạy thành công bằng key trong `.env`:
  - Mobile: Performance 95, Accessibility 93, Best Practices 77, SEO 92.
  - Desktop: Performance 80, Accessibility 94, Best Practices 77, SEO 92.
  - Mobile lab: FCP 1.4s, LCP 2.1s, TBT 190ms, CLS 0.01, Speed Index 2.3s, TTI 9.4s.
  - Desktop lab: FCP 0.6s, LCP 0.8s, TBT 420ms, CLS 0.006, Speed Index 1.3s, TTI 2.3s.

### Cần theo dõi

- Homepage có 3 ảnh `loading="eager"`/`lazy_method=none`; hiện có thể hợp lý vì là logo/hero/LCP, nhưng nếu LCP xấu thì cần rà lại ảnh nào thật sự above-fold.
- Homepage có nhiều heading cấp H3 (67 mục). Đây không phải lỗi kỹ thuật, nhưng khi tối ưu UX/SEO tiếp theo nên kiểm xem các card/list có đang làm cây heading quá dày không.
- Có section `CHIA SẺ TRẢI NGHIỆM`, `Đánh giá trên Google`, `Đối tác lâu năm & khách hàng tiêu biểu`. Hiện nội dung không dùng sao/rating schema và có câu "không hiển thị điểm sao tổng hợp khi chưa có dữ liệu được xác minh", nên rủi ro đã thấp hơn review giả. Vẫn nên giữ nguyên tắc không thêm lời chứng thực định danh nếu chưa có bằng chứng.
- Lighthouse báo các audit cần rà: `color-contrast`, `target-size`, `label-content-name-mismatch`, `unused-css-rules`, `render-blocking-insight`, `forced-reflow-insight`, `deprecations`.
- Lighthouse báo `Page lacks the HTML doctype` và `Document does not have a meta description`, nhưng HTML tải bằng `curl` ở cả root và cache-buster đều có `<!DOCTYPE html>` và meta description 157 ký tự. Điểm đáng nghi là HTML bắt đầu bằng 2 ký tự BOM trước doctype (`\ufeff\ufeff<!DOCTYPE html>`), có thể làm Lighthouse rơi vào quirks-mode hoặc đọc head khác với parser thường.

### Chưa kiểm được

- `render_page.py` raw fetch của `claude-seo` lỗi `no.access` do cơ chế URL safety/DNS pinning trong repo này, trong khi `curl` trực tiếp trả HTTP 200. Vì vậy audit lần này dùng `curl` tải HTML rồi đưa file vào `parse_html.py`.
- PageSpeed mobile trả lỗi quota/rate limit: `PSI rate limit exceeded (240 QPM / 25,000 QPD). Wait and retry.` Không có dữ liệu Lighthouse/CWV từ lần này.
- Retry PageSpeed lúc 2026-06-27 11:16 vẫn bị rate limit.
- CrUX-only lúc 2026-06-27 11:17 không chạy được vì endpoint yêu cầu API key (`--api-key` hoặc `GOOGLE_API_KEY`).
- CrUX-only lúc 2026-06-27 11:23 có key nhưng trả `403 Client Error: Forbidden` từ `chromeuxreport.googleapis.com`. Cần kiểm quyền/API enablement của key nếu muốn lấy field data CrUX.

## Lệnh đã chạy

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python scripts/portability_check.py
.venv/bin/python scripts/parse_html.py /mnt/d/.thongtaccongquangninh/reports/claude-seo-readonly-home-20260627T084619/home-cachebuster.html --url "https://thongtaccongquangninh.com/" --json
.venv/bin/python scripts/pagespeed_check.py "https://thongtaccongquangninh.com/" --strategy mobile --json
.venv/bin/python scripts/pagespeed_check.py "https://thongtaccongquangninh.com/" --crux-only --form-factor PHONE --json
.venv/bin/python scripts/pagespeed_check.py "https://thongtaccongquangninh.com/" --strategy both --json
.venv/bin/python scripts/pagespeed_check.py "https://thongtaccongquangninh.com/" --crux-only --form-factor PHONE --json
.venv/bin/python scripts/pagespeed_check.py "https://thongtaccongquangninh.com/" --crux-only --form-factor DESKTOP --json
```

## Kết luận

`claude-seo` đã dùng được ở chế độ local venv cho parser/checklist/PageSpeed. Homepage public hiện pass các gate SEO kỹ thuật cơ bản trong phạm vi read-only: indexable, canonical đúng, sitemap/robots đọc được, H1 duy nhất, image alt/dimensions đầy đủ, schema parse được và không có rating/review schema giả.

Việc tiếp theo: điều tra và loại bỏ 2 BOM trước `<!DOCTYPE html>` ở nguồn render/plugin/theme trước khi sửa các lỗi Lighthouse phụ.
