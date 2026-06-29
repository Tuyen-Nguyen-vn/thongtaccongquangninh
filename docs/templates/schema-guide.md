# Schema Guide — Hướng dẫn Schema Markup tiếng Việt

> File này chứa **code JSON-LD sẵn dùng** cho 8 loại schema phổ biến nhất. Chèn vào `<head>` hoặc dùng plugin Rank Math / Yoast SEO trên WordPress.

---

## 1. KHI NÀO DÙNG SCHEMA NÀO

| Loại trang | Schema khuyên dùng |
|------------|-------------------|
| Trang chủ doanh nghiệp địa phương | `LocalBusiness` + `Organization` |
| Trang dịch vụ | `Service` + `FAQPage` + `BreadcrumbList` |
| Bài blog | `Article` / `BlogPosting` + `BreadcrumbList` |
| Trang sản phẩm | `Product` + `AggregateRating` + `Review` |
| Trang liên hệ | `LocalBusiness` + `ContactPoint` |
| Trang FAQ chuyên biệt | `FAQPage` |
| Trang khóa học | `Course` |
| Trang công thức / hướng dẫn | `HowTo` |

---

## 2. SCHEMA `LocalBusiness` (cho doanh nghiệp địa phương)

Đặt vào trang chủ + trang liên hệ + mỗi trang địa phương.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://thongtaccongquangninh.com/#localbusiness",
  "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
  "image": "https://thongtaccongquangninh.com/wp-content/uploads/logo.jpg",
  "url": "https://thongtaccongquangninh.com",
  "telephone": "+84963953533",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Số nhà, đường]",
    "addressLocality": "Hạ Long",
    "addressRegion": "Quảng Ninh",
    "postalCode": "200000",
    "addressCountry": "VN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 20.9515,
    "longitude": 107.0784
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday", "Tuesday", "Wednesday", "Thursday",
      "Friday", "Saturday", "Sunday"
    ],
    "opens": "00:00",
    "closes": "23:59"
  },
  "areaServed": [
    {"@type": "City", "name": "Hạ Long"},
    {"@type": "City", "name": "Cẩm Phả"},
    {"@type": "City", "name": "Uông Bí"}
  ],
  "sameAs": [
    "https://www.facebook.com/[fanpage]",
    "https://www.youtube.com/[channel]"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "127"
  }
}
</script>
```

**Lưu ý**:
- Đổi `LocalBusiness` thành type cụ thể nếu phù hợp: `Plumber`, `Restaurant`, `DentalClinic`, `BeautySalon`, `RealEstateAgent`...
- `priceRange` dùng `$`, `$$`, `$$$`
- Tọa độ lấy từ Google Maps (chuột phải → "What's here?")

---

## 3. SCHEMA `Service` (cho trang dịch vụ)

Đặt vào mỗi pillar dịch vụ (`/dich-vu/thong-tac-cong/`).

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Thông tắc cống",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
    "telephone": "+84963953533",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Hạ Long",
      "addressRegion": "Quảng Ninh",
      "addressCountry": "VN"
    }
  },
  "areaServed": {
    "@type": "AdministrativeArea",
    "name": "Quảng Ninh"
  },
  "description": "Dịch vụ thông tắc cống 24/7 tại Quảng Ninh — không đục phá, có mặt trong 15 phút, bảo hành 12 tháng.",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "VND",
    "price": "300000",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "priceCurrency": "VND",
      "price": "300000",
      "description": "Giá tham khảo từ 300.000đ, có thể thay đổi theo hiện trạng thực tế"
    }
  }
}
</script>
```

---

## 4. SCHEMA `FAQPage` (cho mục FAQ trong bài)

Bắt buộc cho mọi bài có mục FAQ. Tăng cơ hội rank rich snippet.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Thông tắc cống ở Hạ Long mất bao lâu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Thời gian thông tắc cống thường từ 30 phút đến 2 giờ tùy mức độ tắc. Với trường hợp đơn giản, thợ hoàn thành trong vòng 30–45 phút. Trường hợp tắc nghẽn sâu cần máy chuyên dụng có thể mất 1–2 giờ."
      }
    },
    {
      "@type": "Question",
      "name": "Giá thông tắc cống tại Hạ Long bao nhiêu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Giá thông tắc cống tại Hạ Long từ 300.000đ tùy hiện trạng và loại cống. Gọi 0963.953.533 để được báo giá chính xác sau khi khảo sát miễn phí."
      }
    },
    {
      "@type": "Question",
      "name": "Có làm việc ban đêm không?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Có. Chúng tôi phục vụ 24/7 kể cả đêm khuya, ngày lễ. Có mặt trong 15 phút tại khu vực nội thành Hạ Long."
      }
    }
  ]
}
</script>
```

**Quy tắc**:
- Mỗi `Question` phải khớp **chính xác** câu hỏi xuất hiện trong bài

---

## 5. SCHEMA `Article` / `BlogPosting` (cho bài blog)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "10 Nguyên Nhân Tắc Cống Chung Cư Và Cách Xử Lý",
  "description": "Tìm hiểu 10 nguyên nhân tắc cống phổ biến ở chung cư và cách xử lý nhanh không đục phá. Liên hệ 0963.953.533 để được hỗ trợ 24/7.",
  "image": "https://example.com/anh-tac-cong-chung-cu.jpg",
  "author": {
    "@type": "Person",
    "name": "Nguyễn Văn A",
    "url": "https://example.com/tac-gia/nguyen-van-a/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2026-05-17",
  "dateModified": "2026-05-17",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/nguyen-nhan-tac-cong-chung-cu/"
  }
}
</script>
```

---

## 6. SCHEMA `BreadcrumbList` (cho mọi trang ngoài trang chủ)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Trang chủ",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Dịch vụ",
      "item": "https://example.com/dich-vu/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Thông tắc cống",
      "item": "https://example.com/dich-vu/thong-tac-cong/"
    }
  ]
}
</script>
```

---

## 7. SCHEMA `Product` (cho trang sản phẩm e-commerce)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Giày thể thao Nam ABC-2026",
  "image": [
    "https://example.com/san-pham/giay-abc-1.jpg",
    "https://example.com/san-pham/giay-abc-2.jpg"
  ],
  "description": "Giày thể thao nam ABC-2026, đế cao su mềm, nhẹ, thoáng khí, phù hợp chạy bộ và đi hàng ngày.",
  "sku": "GTT-ABC-2026",
  "brand": {
    "@type": "Brand",
    "name": "ABC"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/san-pham/giay-abc-2026/",
    "priceCurrency": "VND",
    "price": "590000",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "89"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Trần Văn B"
      },
      "reviewBody": "Giày nhẹ, đi êm, đáng tiền."
    }
  ]
}
</script>
```

---

## 8. SCHEMA `Organization` (cho trang chủ + giới thiệu)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
  "url": "https://thongtaccongquangninh.com",
  "logo": "https://thongtaccongquangninh.com/wp-content/uploads/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+84963953533",
    "contactType": "customer service",
    "areaServed": "VN",
    "availableLanguage": ["Vietnamese"]
  },
  "sameAs": [
    "https://www.facebook.com/[fanpage]",
    "https://www.youtube.com/[channel]",
    "https://www.tiktok.com/@[username]"
  ]
}
</script>
```

---

## 9. SCHEMA `HowTo` (cho bài hướng dẫn từng bước)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Cách thông cống bồn rửa bị tắc tại nhà",
  "description": "Hướng dẫn 4 bước thông cống bồn rửa đơn giản tại nhà không cần thợ.",
  "totalTime": "PT15M",
  "tool": [
    {"@type": "HowToTool", "name": "Pittông cao su"},
    {"@type": "HowToTool", "name": "Baking soda"},
    {"@type": "HowToTool", "name": "Giấm trắng"}
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Đổ nước nóng",
      "text": "Đun 1 ấm nước sôi, từ từ đổ vào miệng cống để làm tan dầu mỡ."
    },
    {
      "@type": "HowToStep",
      "name": "Đổ hỗn hợp baking soda + giấm",
      "text": "Đổ 1/2 cốc baking soda, sau đó 1 cốc giấm trắng. Đậy nắp cống 15 phút."
    },
    {
      "@type": "HowToStep",
      "name": "Xả nước nóng lần 2",
      "text": "Sau 15 phút, xả nước sôi thêm 1 lần để rửa sạch."
    },
    {
      "@type": "HowToStep",
      "name": "Dùng pittông nếu vẫn tắc",
      "text": "Nếu cống vẫn không thoát, dùng pittông hút mạnh 5–10 lần."
    }
  ]
}
</script>
```

---

## 10. CÁCH KIỂM TRA SCHEMA HOẠT ĐỘNG

Sau khi chèn schema, **bắt buộc test**:

1. **Rich Results Test**: https://search.google.com/test/rich-results
   - Dán URL hoặc code → xem schema có hợp lệ không, có rich result nào không

2. **Schema Markup Validator**: https://validator.schema.org/
   - Kiểm tra cú pháp JSON-LD

3. **Google Search Console** → Enhancements
   - Theo dõi schema sau khi index, xem có lỗi không

---

## 11. CÁCH CHÈN SCHEMA TRÊN WORDPRESS

### Cách 1: Dùng plugin Rank Math (khuyên dùng)
- Vào bài viết → tab **Schema** trong Rank Math
- Chọn loại schema → điền field
- Plugin tự render JSON-LD

### Cách 2: Dùng plugin "Insert Headers and Footers"
- Cài WPCode hoặc Header Footer Code Manager
- Paste code `<script>...</script>` vào header
- Chỉ phù hợp với schema sitewide (LocalBusiness, Organization)

### Cách 3: Chèn thủ công vào theme
- Edit `header.php` hoặc `functions.php`
- Dùng `wp_head` hook
- Cần biết code

### Cách 4: Dùng Google Tag Manager
- Tạo Custom HTML tag
- Paste schema vào
- Trigger trên trang cần dùng

---

## 12. NGUYÊN TẮC CHỌN SCHEMA

3. **Câu hỏi FAQ schema phải đúng câu hỏi trên trang**
4. **AggregateRating chỉ dùng khi có review thật** — không fake
5. **Schema chỉ là gợi ý cho Google** — không đảm bảo rich result
6. **Cập nhật `dateModified`** mỗi khi sửa bài

---

## 13. CHECKLIST CHO MỌI TRANG

- [ ] Trang chủ: `LocalBusiness` (hoặc type cụ thể) + `Organization`
- [ ] Trang dịch vụ: `Service` + `FAQPage` + `BreadcrumbList`
- [ ] Bài blog: `BlogPosting` + `BreadcrumbList` + `FAQPage` (nếu có FAQ)
- [ ] Trang sản phẩm: `Product` + `AggregateRating` + `BreadcrumbList`
- [ ] Trang liên hệ: `LocalBusiness` + `ContactPoint`
- [ ] Đã test bằng Rich Results Test
- [ ] Đã submit Google Search Console
- [ ] Theo dõi tỷ lệ rich result trong Search Console sau 14 ngày
