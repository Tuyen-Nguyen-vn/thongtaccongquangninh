# SEO Full Audit — 2026-05-24 (smoke)

## 0. Tổng quan
- URL audit: 3 | PASS: 0 | FAIL: 2 | WARN: 1
- Raw technical: reports/site-full-audit-2026-05-24-smoke.json
- Top 5 issue category: content=6 | title_meta=4 | heading=3 | image=2 | schema=2

## 1. Title/Meta

### Cặp title duplicate ≥85%
_Không phát hiện._

### URL meta/title length bất thường hoặc không có hotline trong meta
| URL | Issues |
|---|---|
| https://thongtaccongquangninh.com/ | META_SHORT(143) |
| https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh-2026/ | TITLE_SHORT(56), META_NO_HOTLINE |
| https://thongtaccongquangninh.com/bang-gia/ | TITLE_SHORT(52) |

## 2. Heading & Content

### URL thiếu H1, nhiều H1 hoặc thiếu H2 bắt buộc
| URL | Issues |
|---|---|
| https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh-2026/ | MISSING_H2:Nguyên nhân, MISSING_H2:Tại sao chọn / Cam kết, MISSING_H2:FAQ / Câu hỏi |

### URL word count out of range
| URL | Issues |
|---|---|
| https://thongtaccongquangninh.com/ | WORD_BELOW_TARGET(2399) |
| https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh-2026/ | WORD_LOW(1525) |
| https://thongtaccongquangninh.com/bang-gia/ | WORD_ABOVE_TARGET(3096) |

### URL chứa từ cấm
- https://thongtaccongquangninh.com/ — "chuyên nghiệp" x2, "uy tín" x1
- https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh-2026/ — "chuyên nghiệp" x1

### URL thiếu hotline trong body/main content
_Không phát hiện._

## 3. Image SEO

### URL < 3 ảnh nội dung
_Không phát hiện._

### URL có ảnh thiếu alt / alt sai / hotlink ngoài domain
| URL | Số ảnh | Vấn đề |
|---|---:|---|
| https://thongtaccongquangninh.com/ | 42 | EMPTY_ALT x2, ALT_NO_SERVICE_OR_LOCATION x7 |

## 4. Schema

| Schema type | Số page |
|---|---:|
| FAQPage | 3 |
| WebSite | 2 |
| LocalBusiness | 2 |
| BreadcrumbList | 2 |
| Organization | 1 |
| ImageObject | 1 |
| WebPage | 1 |
| Article | 1 |
| VideoObject | 1 |
| LocalBusiness\|HomeAndConstructionBusiness | 1 |
| BlogPosting | 1 |
| OfferCatalog | 1 |

### URL thiếu schema bắt buộc, JSON-LD lỗi hoặc hotline schema sai
| URL | Issues |
|---|---|
| https://thongtaccongquangninh.com/ | MISSING_BREADCRUMBLIST |
| https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh-2026/ | MISSING_SERVICE |

## 5. Technical (kế thừa site-full audit)

- Broken internal link: 0
- Footer variant: 1
### Canonical / viewport / noindex bất thường
_Không phát hiện._

## 6. Top 20 URL ưu tiên fix

| URL | Score | Issues | Next action |
|---|---:|---|---|
| https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh-2026/ | 48 | MISSING_H2:Nguyên nhân; MISSING_H2:Tại sao chọn / Cam kết; MISSING_H2:FAQ / Câu hỏi; WORD_LOW(1525); FORBIDDEN_WORD | Bổ sung section Nguyên nhân |
| https://thongtaccongquangninh.com/ | 72 | WORD_BELOW_TARGET(2399); FORBIDDEN_WORD; META_SHORT(143); IMG:EMPTY_ALT(2); IMG:ALT_NO_SERVICE_OR_LOCATION(7) | Xem chi tiết trong seo-full-audit-2026-05-24-smoke.md |
| https://thongtaccongquangninh.com/bang-gia/ | 94 | WORD_ABOVE_TARGET(3096); TITLE_SHORT(52) | Xem chi tiết trong seo-full-audit-2026-05-24-smoke.md |

## 7. Đã ghi vào SEO_PROGRESS.csv

- `--no-csv`: không ghi CSV.

## 8. Bảng audit từng URL

| # | URL | Type | Kind | Sev | Score | Words | Imgs | H1 | Schema | Issues |
|---:|---|---|---|---|---:|---:|---:|---:|---|---:|
| 1 | https://thongtaccongquangninh.com/ | page | other | HIGH | 72 | 2399 | 42 | 1 | Organization, WebSite, ImageObject, WebPage, Article, VideoObject, LocalBusiness\|HomeAndConstructionBusiness, WebSite, FAQPage | 6 |
| 2 | https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh-2026/ | post | service_subpage | HIGH | 48 | 1525 | 3 | 1 | LocalBusiness, BreadcrumbList, FAQPage, BlogPosting | 9 |
| 3 | https://thongtaccongquangninh.com/bang-gia/ | page | other | MEDIUM | 94 | 3096 | 3 | 1 | LocalBusiness, BreadcrumbList, OfferCatalog, FAQPage | 2 |

---

Việc tiếp theo nên làm: https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh-2026/
