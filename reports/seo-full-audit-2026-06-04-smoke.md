# SEO Full Audit — 2026-06-04 (smoke)

## 0. Tổng quan
- URL audit: 3 | PASS: 0 | FAIL: 0 | WARN: 3
- Raw technical: reports/site-full-audit-2026-06-04-smoke.json
- Top 5 issue category: content=3 | image=2 | title_meta=1

## 1. Title/Meta

### Cặp title duplicate ≥85%
_Không phát hiện._

### URL meta/title length bất thường hoặc không có hotline trong meta
| URL | Issues |
|---|---|
| https://thongtaccongquangninh.com/bang-gia/ | TITLE_SHORT(52) |

## 2. Heading & Content

### URL thiếu H1, nhiều H1 hoặc thiếu H2 bắt buộc
_Không phát hiện._

### URL word count out of range
| URL | Issues |
|---|---|
| https://thongtaccongquangninh.com/ | WORD_TOO_LONG(3654) |
| https://thongtaccongquangninh.com/bang-gia/ | WORD_ABOVE_TARGET(3252) |

### URL chứa từ cấm
_Không phát hiện._

### URL thiếu hotline trong body/main content
_Không phát hiện._

## 3. Image SEO

### URL < 3 ảnh nội dung
_Không phát hiện._

### URL có ảnh thiếu alt / alt sai / hotlink ngoài domain
| URL | Số ảnh | Vấn đề |
|---|---:|---|
| https://thongtaccongquangninh.com/ | 62 | EMPTY_ALT x8, ALT_NO_SERVICE_OR_LOCATION x12 |

## 4. Schema

| Schema type | Số page |
|---|---:|
| BreadcrumbList | 4 |
| LocalBusiness\|HomeAndConstructionBusiness | 3 |
| FAQPage | 3 |
| WebSite | 2 |
| BlogPosting | 2 |
| Organization | 1 |
| ImageObject | 1 |
| WebPage | 1 |
| Article | 1 |
| VideoObject | 1 |
| LocalBusiness | 1 |
| Service | 1 |
| OfferCatalog | 1 |

### URL thiếu schema bắt buộc, JSON-LD lỗi hoặc hotline schema sai
_Không phát hiện._

## 5. Technical (kế thừa site-full audit)

- Broken internal link: 0
- Footer variant: 2
### Canonical / viewport / noindex bất thường
_Không phát hiện._

## 6. Top 20 URL ưu tiên fix

| URL | Score | Issues | Next action |
|---|---:|---|---|
| https://thongtaccongquangninh.com/ | 91 | WORD_TOO_LONG(3654); IMG:EMPTY_ALT(8); IMG:ALT_NO_SERVICE_OR_LOCATION(12) | Xem chi tiết trong seo-full-audit-2026-06-04-smoke.md |
| https://thongtaccongquangninh.com/bang-gia/ | 94 | WORD_ABOVE_TARGET(3252); TITLE_SHORT(52) | Xem chi tiết trong seo-full-audit-2026-06-04-smoke.md |
| https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh-2026/ | 97 | SLUG_HAS_DATE_OR_LONG_NUMBER | Xem chi tiết trong seo-full-audit-2026-06-04-smoke.md |

## 7. Đã ghi vào SEO_PROGRESS.csv

- `--no-csv`: không ghi CSV.

## 8. Bảng audit từng URL

| # | URL | Type | Kind | Sev | Score | Words | Imgs | H1 | Schema | Issues |
|---:|---|---|---|---|---:|---:|---:|---:|---|---:|
| 1 | https://thongtaccongquangninh.com/ | page | other | MEDIUM | 91 | 3654 | 62 | 1 | Organization, WebSite, ImageObject, WebPage, Article, LocalBusiness\|HomeAndConstructionBusiness, WebSite, BreadcrumbList, FAQPage, VideoObject | 3 |
| 2 | https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh-2026/ | post | service_subpage | MEDIUM | 97 | 2727 | 3 | 1 | LocalBusiness\|HomeAndConstructionBusiness, BreadcrumbList, BlogPosting, LocalBusiness, BreadcrumbList, Service, FAQPage, BlogPosting | 1 |
| 3 | https://thongtaccongquangninh.com/bang-gia/ | page | other | MEDIUM | 94 | 3252 | 3 | 1 | LocalBusiness\|HomeAndConstructionBusiness, BreadcrumbList, OfferCatalog, FAQPage | 2 |

---

Việc tiếp theo nên làm: https://thongtaccongquangninh.com/
