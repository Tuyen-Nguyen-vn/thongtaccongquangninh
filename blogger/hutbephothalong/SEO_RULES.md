# SEO_RULES — Blogger vệ tinh

Adapt từ `D:\.thongtaccongquangninh\SEO_RULES.md` cho ngữ cảnh Blogger. Các điều khoản dưới đây là **bắt buộc**.

## 1. Technical SEO bắt buộc trên Blogger

1. Mỗi bài/page indexable phải trả HTTP 200, không bị redirect.
2. **Sitemap Blogger** `/sitemap.xml` chỉ chứa URL canonical, indexable, HTTP 200. Submit Search Console.
3. Mỗi bài có **1 canonical** đúng. Blogger mặc định canonical về URL `https://<blog>/yyyy/mm/slug.html`; nếu dùng custom domain, kiểm canonical không bị trỏ về `blogspot.com` cũ.
5. Robots tag custom (Settings → Crawlers and indexing → Custom robots header tags):
   - `archive.html` → `noindex,follow`.
   - `search` → `noindex,follow`.
   - `homepage` → `all`.
   - Posts/pages → `all`.
6. Mỗi page có **1 H1** duy nhất (Blogger có thể tự gen H3 từ widget — phải sửa template để post title là `<h1>` trong post page, `<h2>` trong list page).
8. **Meta description riêng cho từng bài** (Blogger có ô "Search Description", phải bật trong Settings → Meta tags → Enable search description).
15. **Tắt** mobile redirect (`?m=1`) gây duplicate. Cấu hình template responsive duy nhất.
16. Bật **HTTPS Redirect** và **HTTPS Availability** trong Blogger Settings.



## 3. Structured Data trên Blogger


1. **Article schema** cho mỗi bài: `@type: Article` (hoặc `BlogPosting`), đủ `headline`, `author`, `datePublished`, `dateModified`, `image`, `publisher`, `mainEntityOfPage`.
2. **Organization/LocalBusiness schema** nhúng 1 lần trong template (footer), khớp NAP của Môi Trường Đô Thị Số 1 Quảng Ninh.
3. **BreadcrumbList** cho post: Home → Label → Post title.
4. **FAQPage** chỉ dùng khi FAQ thật hiển thị trong bài. Không gắn FAQ schema rỗng.
6. Test mỗi schema bằng [Rich Results Test](https://search.google.com/test/rich-results) sau khi publish.

## 4. AI Features / AI Overviews

3. Trang muốn đủ điều kiện AI features phải indexable, snippet-eligible, không bị chặn render.
5. Cách tối ưu duy nhất: viết rõ ràng, hữu ích, có nguồn/kinh nghiệm thật, cấu trúc dễ trích xuất (heading rõ, đoạn ngắn, danh sách có cấu trúc).

## 5. Local SEO trên Blogger

1. Bài có chứa địa danh Quảng Ninh phải có bối cảnh thật: loại công trình, hạ tầng, ngõ/khu dân cư khi chắc chắn.

## 6. Performance / Core Web Vitals

1. Mục tiêu PageSpeed Insights mobile ≥ 80, desktop ≥ 90.
2. CLS < 0.1: ảnh luôn có `width` + `height`.

## 7. External link policy

1. Link ra ngoài (không phải site mẹ) phải `rel="nofollow"` hoặc `rel="ugc"` nếu là comment.

## 8. Indexing & Submit

- Sitemap Blogger: `/sitemap.xml` và `/sitemap-pages.xml`, submit GSC.

## 9. Khi sửa template hay nội dung

Áp dụng nguyên tắc clean code từ workspace cha:

- Mỗi sửa đổi template phải để website sạch hơn, dễ bảo trì hơn.
- Backup XML trước khi sửa.
