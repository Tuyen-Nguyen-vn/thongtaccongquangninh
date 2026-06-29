# Technical SEO SOP — thongtaccongquangninh.com

> Tạo: 2026-05-11 | Cập nhật khi có thay đổi chuẩn

---

## 1. SCHEMA STRUCTURED DATA

### 1.1 Trang chủ — BẮT BUỘC có 2 schema block
| Schema | Trạng thái |
|---|---|
| `LocalBusiness` + `HomeAndConstructionBusiness` | ✅ Đã thêm 2026-05-11 |
| `FAQPage` | ✅ Có sẵn |

**Các trường BẮT BUỘC trong LocalBusiness:**
```json
{
  "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
  "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
  "telephone": ["+84931156756", "+84963953533"],
  "address": { "@type": "PostalAddress", "addressLocality": "Hạ Long", "addressRegion": "Quảng Ninh", "addressCountry": "VN" },
  "geo": { "@type": "GeoCoordinates", "latitude": 20.9517, "longitude": 107.0742 },
  "areaServed": [...],
  "openingHours": "Mo,Tu,We,Th,Fr,Sa,Su 00:00-23:59",
  "priceRange": "₫₫",
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "200" }
}
```

### 1.2 Trang dịch vụ / bài viết — BẮT BUỘC
- Rank Math sinh tự động `Article` hoặc `WebPage` — kiểm tra bằng Google Rich Results Test
- Nếu bài có phần FAQ: bật FAQPage trong Rank Math → không cần viết tay

- Nếu phát hiện chồng chéo: giữ lại Rank Math, xóa thủ công

---

## 2. HEADING HIERARCHY (HẾT SỨC QUAN TRỌNG)

### Quy tắc
| Thẻ | Số lượng | Nội dung |
|---|---|---|
| `<h1>` | **Đúng 1** | Chứa keyword chính + địa danh |
| `<h2>` | 4–8 | Các section nội dung chính — có từ khóa |
| `<h3>` | Không giới hạn | Sub-topic trong từng section |

- `<h2>` làm tagline trang trí (vd: "VÌ MÔI TRƯỜNG XANH") → dùng `<p class="tagline">` thay thế
- H1 không chứa keyword mục tiêu

---

## 3. SEMANTIC HTML — BẮT BUỘC

```html
<body>
  <header role="banner">
    <nav role="navigation" aria-label="Menu chính">...</nav>
  </header>

  <main id="main-content">
    <section aria-labelledby="section-heading-id">
      <h2 id="section-heading-id">Tiêu đề section</h2>
      ...
    </section>
    ...
  </main>

  <footer role="contentinfo">...</footer>
</body>
```

### Checklist semantic
- [ ] `<header>` bọc nav — `role="banner"`
- [ ] `<main>` bọc toàn bộ content — `id="main-content"`
- [ ] `<footer>` — `role="contentinfo"`
- [ ] Mỗi `<section>` có `aria-labelledby` trỏ đúng ID của H2/H3 bên trong
- [ ] `<article>` cho các card/bài viết độc lập

---

## 4. IMAGE SEO — TIÊU CHUẨN BẮT BUỘC

### 4.1 Thuộc tính bắt buộc
```html
<!-- LCP image (ảnh xuất hiện first viewport): KHÔNG lazy load -->
<img src="..." alt="..." width="W" height="H" loading="eager" fetchpriority="high" decoding="async">

<!-- Ảnh dưới fold: BẮT BUỘC lazy load -->
<img src="..." alt="..." width="W" height="H" loading="lazy" decoding="async">
```

### 4.2 ALT text — quy tắc
- Mô tả nội dung ảnh + keyword + địa danh tự nhiên
- Tối đa 125 ký tự

### 4.3 Định dạng ưu tiên
1. `.webp` — mặc định cho ảnh mới
2. Kích thước: tối đa 200KB sau khi tối ưu
3. Tên file: `ten-dich-vu-thanh-pho-mo-ta.webp` (có dấu gạch ngang, không dấu, có keyword)

### 4.4 CLS Prevention
- LUÔN khai báo `width` và `height` trên thẻ `<img>`

---

## 5. INTERNAL LINKING

### Từ trang chủ đến trang con
- Section "Khu vực": mỗi city card PHẢI link đến trang dịch vụ phù hợp nhất của city đó
- Footer "Khu vực": đảm bảo ít nhất 1 link từ homepage đến mỗi page khu vực
- Trang dịch vụ chính: link chéo giữa các dịch vụ (hút bể phốt ↔ thông tắc cống)

### Anchor text
- **BẮT BUỘC tiếng Việt có dấu:** "hút bể phốt Hạ Long", "thông tắc cống Đông Triều"
- **CẤM:** anchor không dấu, anchor chung chung ("xem thêm", "click vào đây")

---

## 6. MOBILE-FIRST CHECKLIST

### Core Web Vitals mục tiêu
| Chỉ số | Mục tiêu | Tool kiểm tra |
|---|---|---|
| LCP | < 2.5s | PageSpeed Insights |
| CLS | < 0.1 | PageSpeed Insights |
| FID/INP | < 200ms | PageSpeed Insights |

### UI Mobile
- Tất cả nút bấm/link: tối thiểu `44×44px` tap target
- Font-size tối thiểu: `14px` — không nhỏ hơn
- Slider container: dùng `aspect-ratio:16/9` — KHÔNG cố định `height` pixel

---

## 7. KIỂM TRA TRƯỚC KHI DEPLOY

```
[ ] Google Rich Results Test: https://search.google.com/test/rich-results
    - LocalBusiness: PASS
    - FAQPage: PASS
    - Không cảnh báo lỗi

[ ] Schema Validator: https://validator.schema.org
    - 0 error, 0 critical warning

[ ] PageSpeed Insights Mobile > 75 điểm
[ ] H1 duy nhất, chứa keyword chính
[ ] Không còn <h2> làm tagline trang trí
[ ] <main> và <header> có mặt trong HTML
[ ] Không còn Markdown rò rỉ ra HTML render
```

---

## 8. FILES LIÊN QUAN

| File | Mục đích |
|---|---|
| `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php` | Template trang chủ đang render live qua plugin `TTCQN Home Emergency Renderer` |
| `global-styles.php` | CSS + schema override cho trang con |
| `seo-content-guidelines.md` | Luật viết bài cho AI content writer |
| `tools/auto_publish_pipeline.mjs` | Pipeline publish bài SEO |
| `tools/repair_live_wp_content.mjs` | Fix Markdown rò rỉ trên live site |
