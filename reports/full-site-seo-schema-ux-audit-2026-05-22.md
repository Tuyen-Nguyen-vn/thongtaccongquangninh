# Full Site SEO, Schema, Tracking, UX Audit - 2026-05-22

## Phạm vi kiểm tra

- Website: `https://thongtaccongquangninh.com`
- Nguồn URL: `sitemap_index.xml`
- Tổng URL trong sitemap: 78
  - `post-sitemap.xml`: 24 URL
  - `page-sitemap.xml`: 42 URL
  - `category-sitemap.xml`: 12 URL
- Cách kiểm: public live HTML, robots.txt, sitemap XML, WordPress MCP read-only `plugins/list`, DNS TXT/MX/DMARC, Chrome/Puppeteer mobile + desktop sample.
- Không sửa live trong lượt audit này.

## Bảng điểm theo mục trong ảnh

| Hạng mục | Điểm hiện tại | Trạng thái | Kết luận ngắn |
|---|---:|---|---|
| SMTP, GTM, Analytics, Pixel | 45/100 | Chưa đủ | GTM/Google Ads có; Meta Pixel không thấy; SMTP/DNS mail chưa đạt chuẩn public. |
| Plugin SEO Rank Math | 80/100 | Đạt nền, còn lỗi vận hành | Rank Math + Rank Math Pro active; sitemap chạy; nhưng sitemap còn 404 và nhiều meta category rỗng. |
| Cấu hình robots.txt | 90/100 | Đạt | Robots mở crawl, không chặn uploads/CSS/JS, có sitemap. |
| Schema | 72/100 | Có nhưng cần rà chất lượng | 77/78 URL có JSON-LD, không lỗi parse; cần rà claim `AggregateRating`/review và schema category. |
| Khắc phục lỗi GSC | 55/100 | Chưa đạt | Sitemap còn 3 URL 404; category indexable nhưng meta rỗng; một URL từng trả 502 trong audit đầu, recheck hiện 200. |
| Open Graph cho MXH | 60/100 | Chưa đủ | 25/78 URL thiếu OG hoàn chỉnh, chủ yếu thiếu `og:image` và mô tả category. |
| Cải thiện UX mobile | 78/100 | Khá | Không overflow ngang, H1 ổn; còn ảnh thiếu width/height ở một số trang và tải mobile 2.2-3.5s ở sample. |
| Cải thiện UX desktop | 82/100 | Khá | Không overflow ngang, load sample 2.2-2.3s; còn ảnh thiếu width/height và page weight lớn. |

## Chi tiết từng mục

### 1. SMTP, GTM, Analytics, Pixel

Đã thấy trên live:

- `GTM-5N59RCXC`
- `AW-18031795119`
- `gtag()`
- Không thấy `fbq()`, `fbevents.js` hoặc marker Meta Pixel thật.

Plugin active liên quan:

- `ttcqn-google-ads-tag` active.
- Không thấy plugin SMTP/Mailer active như WP Mail SMTP, FluentSMTP, Post SMTP.

DNS public:

- MX: không có dữ liệu public (`ENODATA`).
- TXT: chỉ thấy `openai-domain-verification=...`.
- DMARC: không có (`ENOTFOUND`).

Chưa đạt:

- Chưa xác minh được SMTP gửi mail WordPress.
- Thiếu SPF/DKIM/DMARC public cho mail domain.
- Không thấy Meta Pixel.
- Có GTM và Ads nhưng chưa audit được bên trong container GTM.

Phương án:

1. Nếu website dùng form nhận lead qua email: cài/cấu hình SMTP bằng WP Mail SMTP hoặc FluentSMTP.
2. Cấu hình DNS mail:
   - SPF theo nhà gửi mail thực tế.
   - DKIM theo nhà gửi mail.
   - DMARC tối thiểu: `v=DMARC1; p=none; rua=mailto:...`
3. Nếu chạy Facebook Ads/remarketing: thêm Meta Pixel qua GTM hoặc plugin chính, rồi kiểm `fbq('init', ...)`.
4. Audit GTM container: GA4, Ads conversion, click hotline, submit lead, click Zalo.

### 2. Plugin SEO Rank Math

Đã đạt:

- `Rank Math SEO` active version `1.0.269`.
- `Rank Math SEO PRO` active version `3.0.107`.
- `sitemap_index.xml` trả 200.
- Rank Math marker xuất hiện trên đa số URL.

Chưa đạt:

- Sitemap vẫn chứa URL 404.
- Nhiều category trong sitemap có meta description rỗng.
- Một số service/local page có meta description quá ngắn.

Phương án:

1. Xóa hoặc redirect các URL 404 khỏi sitemap.
2. Với category không cần SEO: đặt `noindex` và loại khỏi sitemap.
3. Với category cần SEO: viết mô tả 140-160 ký tự, thêm OG image mặc định.
4. Chạy lại sitemap cache Rank Math sau khi sửa.

### 3. robots.txt

Đã đạt:

```txt
User-agent: *
Allow: /
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Sitemap: https://thongtaccongquangninh.com/sitemap_index.xml
```

Không thấy chặn:

- `/wp-content/`
- `/wp-content/uploads/`
- CSS/JS cần render.

Phương án:

- Giữ nguyên robots hiện tại.
- Chỉ bổ sung rule nếu sau này cần chặn file nội bộ rõ ràng, không chặn media/CSS/JS.

### 4. Schema

Đã đạt:

- 77/78 URL có JSON-LD.
- Không phát hiện lỗi parse JSON-LD.
- Các type phổ biến:
  - `LocalBusiness`: 77 URL
  - `WebSite`: 77 URL
  - `BreadcrumbList`: 76 URL
  - `WebPage`: 65 URL
  - `Article`: 42 URL
  - `Service`: 12 URL
  - `FAQPage`: 10 URL

Chưa đạt/rủi ro:

- `LocalBusiness` xuất hiện gần như toàn site, cần rà không bị spam hoặc sai ngữ cảnh.
- Trang chủ có claim dạng rating/review trong schema; cần có bằng chứng visible/thật trước khi giữ.
- Category có `CollectionPage`, nhưng meta/OG rỗng nên chất lượng entity yếu.

Phương án:

1. Giữ `LocalBusiness` global nếu NAP đúng, nhưng không nhồi rating/review nếu không có nguồn thật.
2. Trang dịch vụ chính: dùng `Service + FAQPage + BreadcrumbList`.
3. Bài blog: dùng `Article/BlogPosting + BreadcrumbList`.
4. Category: chỉ index khi có mô tả/intro/OG; nếu không thì `noindex`.

### 5. Khắc phục lỗi GSC

Lỗi public có thể gây báo trong GSC:

- Sitemap hiện còn 3 URL trả 404:
  - `https://thongtaccongquangninh.com/thong-tac-cong-tuan-chau/`
  - `https://thongtaccongquangninh.com/thong-tac-cong-bai-chay/`
  - `https://thongtaccongquangninh.com/chi-phi-hut-be-phot-quang-ninh/`
- Các URL này vẫn nằm trong `post-sitemap.xml`.
- `https://thongtaccongquangninh.com/xu-ly-mui-hoi-nha-ve-sinh/` từng trả 502 trong lượt scan đầu, recheck hiện trả 200. Cần theo dõi cache/server.
- `category/uncategorized/` vẫn nằm trong sitemap và indexable.

Phương án:

1. Ưu tiên sửa sitemap 404:
   - Nếu có bản canonical: 301 về bản đúng.
   - Nếu bài đã bị xóa thật: remove khỏi sitemap/cache Rank Math.
2. Với `chi-phi-hut-be-phot-quang-ninh/`: hiện có bản `-2`; cần quyết định canonical rồi redirect bản cũ về bản đang live.
3. Với `thong-tac-cong-tuan-chau/`, `thong-tac-cong-bai-chay/`: nếu chưa muốn public, loại khỏi sitemap; nếu muốn SEO, restore/publish đúng URL.
4. Category rỗng hoặc mỏng: `noindex` hoặc viết mô tả + OG.
5. Sau sửa: clear Rank Math sitemap cache và re-submit sitemap trong GSC.

### 6. Open Graph cho MXH

Đã đạt:

- Nhiều trang chính có `og:title`, `og:description`, `og:url`, `og:image`.
- Twitter card hầu hết có.

Chưa đạt:

- 25/78 URL thiếu OG hoàn chỉnh.
- Lỗi chính là thiếu `og:image`.
- Các category gần như thiếu `og:description` và `og:image`.
- Một số bài/service thiếu ảnh OG dù title/desc có.

Ví dụ thiếu `og:image`:

- `cau-hoi-thuong-gap-thong-tac-cong/`
- `chi-phi-hut-be-phot-quang-ninh-2/`
- `he-thong-lien-ket-doi-tac/`
- `thong-tac-bon-cau-dong-trieu/`
- `thong-tac-bon-cau-ha-long/`
- `thong-tac-bon-cau-mong-cai/`
- `thong-tac-bon-cau-quang-yen/`
- `thong-tac-bon-cau-uong-bi/`
- `thong-tac-bon-cau-van-don/`
- Các category sitemap.

Phương án:

1. Đặt OG image mặc định toàn site trong Rank Math.
2. Với trang tiền/dịch vụ: đặt OG riêng 1200x630, đúng dịch vụ/địa phương.
3. Với category cần SEO: thêm description + OG image.
4. Với category không cần SEO: noindex, không cần tối ưu OG sâu.

### 7. UX mobile

Sample kiểm:

- Trang chủ: load ~2.9s, 45 ảnh, 0 ảnh thiếu size, không overflow ngang.
- `/hut-be-phot-quang-ninh/`: load ~3.5s, 9 ảnh, 1 ảnh thiếu size, không overflow ngang.
- `/thong-tac-cong-quang-ninh/`: load ~2.3s, 21 ảnh, 1 ảnh thiếu size, không overflow ngang.
- `/blog/`: load ~2.3s, 7 ảnh, 1 ảnh thiếu size, không overflow ngang.

Chưa đạt:

- Một số trang còn ảnh thiếu `width/height`, có nguy cơ CLS.
- Trang chủ nhiều ảnh/CTA, page weight lớn.
- PageSpeed API đang quota 429 nên chưa lấy điểm Lighthouse mới được.

Phương án:

1. Fix toàn site ảnh thiếu `width/height`.
2. Ưu tiên preload chỉ ảnh LCP, không preload ảnh dưới fold.
3. Lazy-load ảnh dưới fold; không lazy-load hero/LCP.
4. Giữ giao diện mobile hiện tại, chỉ tối ưu tải tài nguyên và kích thước ảnh responsive.

### 8. UX desktop

Sample kiểm:

- Trang chủ: load ~2.3s, không overflow ngang.
- `/hut-be-phot-quang-ninh/`: load ~2.3s, 1 ảnh thiếu size.
- `/thong-tac-cong-quang-ninh/`: load ~2.3s, 1 ảnh thiếu size.
- `/blog/`: load ~2.3s, 1 ảnh thiếu size.

Chưa đạt:

- Vẫn có ảnh thiếu size ở một số template/trang.
- Nội dung trang chủ nặng, nhiều ảnh và nhiều nút/CTA.

Phương án:

1. Audit ảnh thiếu size theo selector, sửa tại renderer/template nguồn.
2. Dọn CSS/JS không cần cho trang không dùng Elementor nếu có thể làm an toàn.
3. Giữ WP Rocket nhưng kiểm không xung đột với renderer homepage.

## Ưu tiên sửa

### Critical

1. Xóa 3 URL 404 khỏi sitemap hoặc 301 về URL đúng:
   - `/thong-tac-cong-tuan-chau/`
   - `/thong-tac-cong-bai-chay/`
   - `/chi-phi-hut-be-phot-quang-ninh/`

### High

2. Sửa OG image/meta cho 25 URL thiếu OG hoàn chỉnh.
3. Quyết định category sitemap:
   - Nếu không SEO category: noindex và loại khỏi sitemap.
   - Nếu SEO category: viết mô tả + OG + intro.

### Medium

4. Rà schema rating/review/LocalBusiness để bỏ claim chưa có bằng chứng.
5. Fix ảnh thiếu `width/height` trên service/blog sample.
6. Thiết lập SMTP + SPF/DKIM/DMARC nếu website cần nhận lead qua email.

### Optional theo chiến dịch quảng cáo

7. Thêm Meta Pixel nếu chạy Facebook Ads/remarketing.
8. Audit GTM container để đo click hotline, click Zalo, submit form.

## Kết luận

Website đã có nền SEO kỹ thuật khá tốt: Rank Math active, robots đúng, schema có nhiều, sitemap chạy, GTM/Ads có mặt. Điểm chưa đạt nằm ở vận hành SEO: sitemap còn 404, OG thiếu ảnh/mô tả nhiều URL, category đang indexable nhưng mỏng, SMTP/mail public chưa chuẩn, Meta Pixel chưa thấy.

Việc nên làm trước tiên: xử lý 3 URL 404 đang nằm trong sitemap.
