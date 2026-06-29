# BLOGGER_DESIGN_PLAN — Kế hoạch thiết kế template Blogger


## 0. Nguyên tắc thiết kế

- **Mobile-first.** 80% trafic Quảng Ninh đọc bằng điện thoại.
- **Tối giản.** Không widget thừa, không slider hero hoành tráng, không popup.
- **Tốc độ trên hết.** Core Web Vitals mobile ≥ 80.
- **Brand-safe.** Trông như blog kiến thức ngành thật, không trông như PBN.

## 1. Bộ nhận diện (Brand)

| Yếu tố | Spec |
|---|---|
| Logo | Wordmark "Hút Bể Phốt Hạ Long" hoặc tuỳ Tuyền cấp. SVG inline trong header. Cao 40px mobile, 56px desktop. |
| Màu phụ | `#F4A300` (cam cảnh báo, dùng cho CTA hotline và badge "24/7"). |
| Màu nền | `#FFFFFF` body, `#F7F7F5` section. |
| Màu text | `#1A1A1A` body, `#5A5A5A` meta. |
| Font heading | `Be Vietnam Pro` 600/700 (Google Fonts, subset Vietnamese, swap). |
| Cỡ chữ body | 17px mobile, 18px desktop, line-height 1.7. |


## 2. Layout

**Layout duy nhất:** 2 columns desktop, 1 column mobile.

```
[ Header sticky: logo + nav + nút gọi hotline ]
[ Main content (8/12) | Sidebar (4/12) ]
[ Footer: NAP + Map + Label cloud + Link site mẹ ]
```

### 2.1 Header (sticky)

- Logo trái.
- Menu giữa: `Trang chủ`, `Kiến thức bể phốt`, `Thông tắc cống`, `Tin Quảng Ninh`, `Liên hệ`.
- **Nút gọi hotline** bên phải, màu cam `#F4A300`, icon điện thoại + text "0963.953.533". Trên mobile thu thành icon tròn nổi.
- Search icon mở overlay search Blogger native.

### 2.2 Trang chủ

- **Hero gọn:** tiêu đề blog 1 dòng + 1 câu mô tả + chip "24/7 - Có mặt 15 phút". Không slide.
- **Grid bài viết mới nhất:** 6 bài, card có thumbnail 16:9, title, label, ngày đăng, excerpt 2 dòng.
- **Section "Chủ đề nổi bật"** theo label: 3 cụm (Kiến thức, Hướng dẫn, Tin địa phương), mỗi cụm 3 bài.
- **CTA block** giữa trang: "Cần thợ gấp tại Quảng Ninh? Gọi 0963.953.533" nền cam.
- **Footer** đầy đủ NAP.

### 2.3 Trang bài viết

- Breadcrumb: Home → Label → Tiêu đề.
- H1 = post title.
- Meta: ngày đăng, ngày cập nhật (Blogger lưu modified date — phải hiển thị), label.
- Cover image 16:9, có caption.
- Toc tự động (JS đơn giản scan H2/H3, hiện collapsed trên mobile).
- Content area max-width 720px desktop để dễ đọc.
- Sticky right sidebar (desktop) hiện: "Liên hệ nhanh" (hotline + Zalo), "Bài liên quan" (3 bài cùng label).
- Sau bài: "Bài liên quan" 4 cái, "Để lại bình luận" (Blogger native, kiểm tra spam Akismet-like nếu có).
- CTA hotline cuối bài (đã quy định trong `CONTENT_RULES.md`).

### 2.4 Trang label (Archive)

- H1 = "Chủ đề: <Label>".
- Grid bài giống trang chủ.
- Pagination native Blogger.

### 2.5 Trang Liên hệ (Static Page)

- NAP đầy đủ.
- Form liên hệ Blogger native HOẶC link Zalo + Facebook Messenger.


| Widget | Trạng thái |
|---|---|
| Header (Image/Title) | Bắt buộc — custom thành logo SVG inline. |
| Blog (post list/post page) | Bắt buộc — phải sửa XML để post title là `<h1>` ở post page, `<h2>` ở list page. |
| Labels (cloud) | Có ở sidebar và footer. |
| Search bar Blogger | Có. |

## 4. Schema JSON-LD nhúng template

Trong `<head>` của template Blogger, nhúng schema động:

### 4.1 Mọi page

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "<TÊN BLOG>",
  "url": "<BLOGSPOT_URL>",
  "publisher": { "@type": "Organization", "name": "Môi Trường Đô Thị Số 1 Quảng Ninh" }
}
```

### 4.2 Trang chủ + footer (LocalBusiness, 1 lần duy nhất trong template)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
  "telephone": ["+84963953533", "+84931156756"],
  "address": { "@type": "PostalAddress", "addressLocality": "Hạ Long", "addressRegion": "Quảng Ninh", "addressCountry": "VN" },
  "areaServed": ["Quảng Ninh", "Hải Phòng"],
  "url": "https://thongtaccongquangninh.com/"
}
```


### 4.3 Trang post

`Article` schema có `headline`, `image`, `author`, `datePublished`, `dateModified`, `publisher`, `mainEntityOfPage`.

### 4.4 Breadcrumb

`BreadcrumbList` cho trang post và trang label.

### 4.5 FAQ

Chỉ nhúng khi có khối FAQ thật trong bài. Gắn condition trong template: chỉ render khi post có label `has-faq` HOẶC bài chứa block `<div class="faq">`.

## 5. Performance

- Inline critical CSS (font + above-the-fold) trong `<head>`.
- Defer JS không quan trọng.
- Ảnh dùng `loading="lazy"` trừ ảnh hero (eager + fetchpriority high).
- Google Fonts: preconnect + display=swap.
- Đo PageSpeed mobile + desktop sau khi deploy template, mục tiêu ≥ 80 mobile.

## 6. SEO meta trong template

- `<title>` custom: `<post.title> | <blog.title>` cho post, `<blog.title> - <tagline>` cho homepage.
- `<meta name="description">` lấy từ Search Description của Blogger (đã bật trong settings).
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type` (article cho post, website cho home).
- Twitter Card: `summary_large_image`.
- Canonical: `<link rel="canonical">` trỏ về URL hiện tại không tham số.

## 7. Phân biệt mobile redirect

- **Tắt `mobile=true`** trong Blogger settings, dùng template responsive duy nhất.
- Trong template, redirect `?m=1` về URL gốc bằng JS đơn giản (hoặc rel canonical sạch).

## 8. Quy trình triển khai template (cho Gemini)

1. Backup template hiện tại vào `backup-xml/template-<ngày>.xml`.
2. Tải template "Contempo Light" gốc, lưu vào `template-base/contempo-light.xml`.
3. Tạo file `template-new/blogger-template.xml` — đây là output cuối.
4. Sửa từng phần theo plan trên, mỗi sửa đổi viết ngắn vào `TASKS.md` cột "Đã làm".
5. Test XML hợp lệ bằng Blogger preview mode trước khi apply.
6. Apply lên blog live → mở blog public → chụp screenshot desktop + mobile vào `screenshots/<ngày>/`.
7. Chạy PageSpeed Insights → paste link kết quả vào `TASKS.md`.
8. Chạy Rich Results Test cho 1 trang post → paste link.
9. Báo Tuyền duyệt.


