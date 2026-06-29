# Schema Blueprint 2026-05-22

## Mục tiêu

- Dùng cấu trúc mạnh giống đoạn LocalBusiness Tuyền cung cấp.
- Mỗi schema có `@id` ổn định để Google nối thực thể, không phải đọc nhiều mảng rời rạc.
- Không copy nguyên LocalBusiness lên mọi URL. Trang con chỉ tham chiếu về `https://thongtaccongquangninh.com/#localbusiness`.
- Schema phải khớp nội dung hiển thị trên trang.

## Node gốc toàn site

- `LocalBusiness`: `https://thongtaccongquangninh.com/#localbusiness`
- `WebSite`: `https://thongtaccongquangninh.com/#website`
- `OfferCatalog`: `https://thongtaccongquangninh.com/#service-catalog`

## Mẫu trang chủ

Trang chủ dùng `@graph` gồm:

- `LocalBusiness`
- `WebSite`
- `FAQPage` nếu FAQ đang hiển thị trên trang

Đã triển khai trong `TTCQN Home Emergency Renderer` version `2026.05.22.13`.

## Mẫu trang dịch vụ chính

Đã triển khai cho 6 trang dịch vụ chính trong `TTCQN Service Schema` version `2026.05.22.2`.

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/#service",
  "name": "Hút bể phốt Quảng Ninh",
  "serviceType": "Hút bể phốt",
  "url": "https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/",
  "provider": {
    "@id": "https://thongtaccongquangninh.com/#localbusiness"
  },
  "areaServed": {
    "@type": "AdministrativeArea",
    "name": "Quảng Ninh"
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "servicePhone": "+84963953533",
    "availableLanguage": ["vi"]
  }
}
```

## Mẫu trang khu vực

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://thongtaccongquangninh.com/thong-tac-cong-ha-long/#service",
  "name": "Thông tắc cống Hạ Long",
  "serviceType": "Thông tắc cống",
  "url": "https://thongtaccongquangninh.com/thong-tac-cong-ha-long/",
  "provider": {
    "@id": "https://thongtaccongquangninh.com/#localbusiness"
  },
  "areaServed": {
    "@type": "City",
    "name": "Hạ Long",
    "containedInPlace": {
      "@type": "AdministrativeArea",
      "name": "Quảng Ninh"
    }
  }
}
```

## Mẫu bài cẩm nang

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": "https://thongtaccongquangninh.com/dau-hieu-be-phot-day/#article",
  "headline": "Dấu hiệu bể phốt đầy cần xử lý sớm",
  "mainEntityOfPage": "https://thongtaccongquangninh.com/dau-hieu-be-phot-day/",
  "publisher": {
    "@id": "https://thongtaccongquangninh.com/#localbusiness"
  },
  "inLanguage": "vi-VN"
}
```

## Mẫu trang liên hệ

Đã triển khai cho `/lien-he/` trong `TTCQN Service Schema` version `2026.05.22.2`.

```json
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://thongtaccongquangninh.com/lien-he/#contactpage",
  "url": "https://thongtaccongquangninh.com/lien-he/",
  "about": {
    "@id": "https://thongtaccongquangninh.com/#localbusiness"
  }
}
```

## Quy tắc triển khai tiếp

- Trang chủ: dùng node đầy đủ.
- Trang dịch vụ/khu vực: dùng `Service` và trỏ `provider` về LocalBusiness.
- Bài cẩm nang: dùng `BlogPosting`; chỉ thêm `FAQPage` khi FAQ thật hiển thị. Đã triển khai cho 23/23 URL Cẩm nang public trong `TTCQN Service Schema` version `2026.05.22.3`.
- Bảng giá: dùng `OfferCatalog` nếu bảng giá hiển thị rõ. Đã triển khai cho `/bang-gia/` trong `TTCQN Service Schema` version `2026.05.22.3`.
- Breadcrumb: thêm `BreadcrumbList` sau khi kiểm tra Rank Math không xuất trùng.
