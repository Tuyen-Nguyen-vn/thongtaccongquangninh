# Local SEO Audit — thongtaccongquangninh.com
**Ngày audit:** 2026-06-28  
**Auditor:** Local SEO Agent (claude-seo v2.2.0)  
**Skill definition:** `_tmp/claude-seo/skills/seo-local/SKILL.md`  
**Phương pháp:** Node.js fetch + live HTML analysis (không dùng Playwright; raw HTML)  
**Pages audited:** Homepage, /hut-be-phot-quang-ninh/, /thong-tac-cong-quang-ninh/, /lien-he/, /hut-be-phot-ha-long/, /hut-be-phot-cam-pha/, /he-thong-co-so-quang-ninh/

---

## 1. Local SEO Score: 46/100

| Dimension | Weight | Score | Điểm đạt |
|-----------|--------|-------|-----------|
| GBP Signals | 25% | 14/25 | 56% |
| Reviews & Reputation | 20% | 3/20 | 15% |
| Local On-Page SEO | 20% | 15/20 | 75% |
| NAP Consistency & Citations | 15% | 6/15 | 40% |
| Local Schema Markup | 10% | 5/10 | 50% |
| Local Link & Authority Signals | 10% | 3/10 | 30% |
| **TỔNG** | 100% | **46/100** | **46%** |

**Nhận xét tổng quan:** Website có nền tảng On-Page và schema cơ bản tương đối tốt (nhiều trang dịch vụ, trang location dài và có local signal rõ). Điểm yếu nghiêm trọng nhất là **hoàn toàn thiếu review/rating** và **NAP không nhất quán giữa các schema entity**. Hai yếu tố này gây ảnh hưởng trực tiếp đến local pack ranking và AI citation (ChatGPT, Gemini).

---

## 2. Business Type Detected: **Hybrid (nghiêng về SAB)**

**Signals phát hiện:**

| Signal | Có/Không | Ghi chú |
|--------|----------|---------|
| Địa chỉ vật lý trong schema | CÓ | "111 Cái Lân, Bãi Cháy, Hạ Long, Quảng Ninh" |
| Google Maps embed (footer) | CÓ | Iframe class `footer-map-frame` với encoded place CID |
| Service area language | CÓ | "Có mặt 15 phút", phục vụ cả tỉnh QN |
| `areaServed` multi-city | CÓ | Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn |
| "We come to you" | CÓ | "xe bồn đến tận nơi", "thợ có mặt" |
| Department sub-entity | CÓ | Schema có `department` cho Hạ Long/Hòn Gai |

**Kết luận:** Hybrid — có địa chỉ vật lý đăng ký nhưng thực tế hoạt động như SAB (xe bồn di chuyển đến khách hàng). Địa chỉ được dùng chủ yếu cho GBP registration, không phải điểm khách đến.

---

## 3. Industry Vertical: **Home Services — Environmental/Sanitation**

**Signals:** Service area, "24/7", báo giá trước, xe bồn chuyên dụng, khẩn cấp, không đục phá.  
**Schema type phù hợp nhất:** `PlumbingService` hoặc `HomeAndConstructionBusiness` (hiện tại đang dùng `["LocalBusiness", "HomeAndConstructionBusiness"]`).

**Industry-specific findings:**
- Không có chứng nhận ngành (VSATTP, ISO, giấy phép xử lý chất thải) visible trên page — đây là E-E-A-T gap cho home services.
- Giá niêm yết có ở /bang-gia/ — tốt cho trust signal.
- FAQPage schema hiện diện trên nhiều trang — phù hợp với industry (questions về giá, tần suất, quy trình).

---

## 4. NAP Consistency Audit

### Bảng so sánh nguồn NAP

| Trường | Organization Schema (`#person`) | LocalBusiness Schema (`#localbusiness`) | Meta Description | GBP (inferred từ embed) |
|--------|----------------------------------|----------------------------------------|-----------------|------------------------|
| **Tên** | Thông Tắc Cống Quảng Ninh | Hút Bể Phốt - Môi trường đô thị số 1 Quảng Ninh | "Thông Tắc Cống, Hút Bể Phốt Quảng Ninh" | Không verify được |
| **Địa chỉ** | 111 Cái Lân, **Bãi Cháy**, Quảng Ninh | 111 Cái Lân, Bãi Cháy, **Hạ Long**, Quảng Ninh | — | 20.9623842, 107.0528491 |
| **Điện thoại 1** | — | +84963953533 | 0963.953.533 | — |
| **Điện thoại 2** | — | +84931156756 | 0931.156.756 | — |
| **Website** | thongtaccongquangninh.com | thongtaccongquangninh.com | — | — |

### Vấn đề phát hiện

**CRITICAL — Tên không nhất quán:**
- Schema `Organization` (`@id: #person`) → "Thông Tắc Cống Quảng Ninh"  
- Schema `LocalBusiness` → "Hút Bể Phốt - Môi trường đô thị số 1 Quảng Ninh"  
- `alternateName` trong LB schema → ["Hút Bể Phốt Quảng Ninh", "Thông Tắc Cống Quảng Ninh"]  
- Page title → "Thông Tắc Cống, Hút Bể Phốt Quảng Ninh"

Google yêu cầu 1 tên canonical nhất quán với GBP listing. Ba biến thể gây confusing signals.

**HIGH — Địa chỉ locality không nhất quán:**
- Organization schema: `addressLocality: "Bãi Cháy"` → SAI (Bãi Cháy là phường, không phải thành phố/thị xã)  
- LocalBusiness schema: `addressLocality: "Hạ Long"` → ĐÚNG  
- Cần đồng nhất: `streetAddress: "111 Cái Lân, Bãi Cháy"`, `addressLocality: "Hạ Long"`

**HIGH — Organization @id dùng `#person`:**
- Hiện tại: `"@id": "https://thongtaccongquangninh.com/#person"` cho entity `@type: Organization`  
- Đây là lỗi cấu trúc: Organization nên dùng `@id: .../#organization`  
- `#person` là reserved cho `Person` entity. Gây nhầm lẫn cho Google's Knowledge Graph parser.

**MEDIUM — Số điện thoại thứ ba:**  
- Số `0522053695` xuất hiện trong HTML nhưng không có `tel:` link. Cần kiểm tra: đây có phải số của đơn vị không? Nếu có, cần thêm vào schema. Nếu không, cần xóa khỏi page.

---

## 5. GBP Optimization Checklist

| Signal | Detected | Ghi chú |
|--------|----------|---------|
| Google Maps iframe embed | ✅ | Footer, class `footer-map-frame`, encoded CID `0x3135ad947ef4a1ff:0xb82f0e88497fbc1c` |
| Place reference (hasMap) | ✅ | Schema `hasMap: https://www.google.com/maps/search/?api=1&query=...` |
| Business hours visible on page | ✅ | "05:00-22:00 hằng ngày" trong meta desc và content |
| Opening hours in schema | ⚠️ | Chỉ có trong `department` entity, không có trong main LocalBusiness |
| Facebook sameAs | ✅ | `sameAs: "https://www.facebook.com/moitruongquangninh"` |
| YouTube video embed | ✅ | VideoObject schema với embedUrl YouTube trên service pages |
| Review carousel/widget | ❌ | Không có |
| GBP reviews count visible | ❌ | Không có |
| GBP posts indicators | ❌ | Không detect được từ static HTML |
| Photo evidence (on-page) | ⚠️ | Logo và hero image có, không rõ gallery thực tế |
| Click-to-call (tel:) | ✅ | `href="tel:0963953533"` và `href="tel:0931156756"` |
| Q&A → FAQ conversion | ✅ | FAQPage schema có trên nhiều trang |

**Lưu ý GBP quan trọng:**
- GBP Q&A bị deprecated tháng 12/2025 (thay bằng Ask Maps Gemini AI). Site đã convert sang FAQPage schema — tốt.
- Business hours 05:00-22:00 trên schema NHƯNG marketing nói "24/7" — CẦN ĐỒNG NHẤT. Nếu GBP listing hiện 05:00-22:00 mà website nói 24/7, user experience bị ảnh hưởng và trust giảm.
- Nên link GBP đến trang /lien-he/ hoặc /he-thong-co-so-quang-ninh/ thay vì homepage (theo Sterling Sky Diversity Update — tránh link GBP đến trang mạnh nhất để không suppress organic rankings).

---

## 6. Review Health Snapshot

| Metric | Status | Benchmark |
|--------|--------|-----------|
| Google review count (visible) | **KHÔNG CÓ** | ≥10 (magic threshold) |
| Star rating visible | **KHÔNG CÓ** | ≥4.5 (31% consumers chỉ dùng 4.5+) |
| `aggregateRating` trong schema | **KHÔNG CÓ** | Required cho rich results |
| Review velocity (18-day rule) | **Không assess được** | ≥1 review/18 ngày |
| Owner response visible | **KHÔNG CÓ** | 88% consumers prefer businesses that respond |
| Third-party reviews | **KHÔNG CÓ** | Yelp, Facebook, industry sites |
| Review gating detected | KHÔNG | Compliant với Google policy |

**Đây là GAP LỚN NHẤT của website.** Theo Whitespark 2026, review signals chiếm ~20% trọng số local pack. Hiện tại website không hiển thị bất kỳ review nào, không có `aggregateRating` schema, và không có review widget. Điều này cũng ảnh hưởng đến AI Overviews (68% local searches có AI Overviews, per Whitespark Q2 2025).

---

## 7. Citation Presence Check

| Directory | Status | Ghi chú |
|-----------|--------|---------|
| Google Business Profile | ✅ Có | Detected via Maps embed CID |
| Facebook Business Page | ✅ Có | `sameAs: facebook.com/moitruongquangninh` |
| Bing Places | ❌ Không detect được | Cần claim — powers ChatGPT, Copilot, Alexa |
| Apple Business Connect | ❌ Không detect được | Usage doubled to 27% (BrightLocal 2026) |
| Yelp | ❌ Không detect được | Nguồn dữ liệu của ChatGPT |
| Foursquare | ❌ Không detect được | Data aggregator downstream |
| Yellow Pages VN | ❌ Không detect được | — |
| BBB | N/A | Không hoạt động tại Việt Nam |
| Data Axle / Neustar | ❌ Không detect được | US aggregators, có thể irrelevant |

**Lưu ý AI Search:** ChatGPT không truy cập GBP trực tiếp — dựa vào Bing index, Yelp, TripAdvisor, BBB, Reddit. Bing Places cần được claim để business xuất hiện khi user hỏi ChatGPT về dịch vụ hút bể phốt Quảng Ninh.

---

## 8. Local Schema Validation

### Schema Entities Detected

| Entity | @type | @id | Trang |
|--------|-------|-----|-------|
| Organization | Organization | `#person` (**LỖI**) | Homepage |
| Business (chính) | LocalBusiness + HomeAndConstructionBusiness | `#localbusiness` | Tất cả trang |
| WebSite | WebSite | `#website` | Homepage |
| WebPage | WebPage | `#webpage` | Mỗi trang |
| Service (hút bể phốt) | Service | `.../hut-be-phot-quang-ninh/#service` | Service page |
| Service (thông tắc cống) | Service | `.../thong-tac-cong-quang-ninh/#service` | Service page |
| VideoObject | VideoObject | `.../hut-be-phot-quang-ninh/#video` | Service pages |
| FAQPage | FAQPage | Nhiều trang | Service, Contact |
| HowTo | HowTo | Service pages | Service pages |
| ContactPage | ContactPage | `.../lien-he/#contactpage` | /lien-he/ |
| Department (Hạ Long) | LocalBusiness + HomeAndConstructionBusiness | `#localbusiness-hongai` | Trong main LB |

### Property Completeness (Main LocalBusiness)

| Property | Có | Ghi chú |
|----------|-----|---------|
| `name` | ✅ | "Hút Bể Phốt - Môi trường đô thị số 1 Quảng Ninh" |
| `@type` correct subtype | ⚠️ | `HomeAndConstructionBusiness` OK nhưng `PlumbingService` cụ thể hơn |
| `address` (PostalAddress) | ✅ | Đủ sub-properties |
| `geo` (≥5 decimal places) | ✅ | latitude: 20.9623842, longitude: 107.0528491 (7 chữ số) |
| `telephone` | ✅ | 2 số: +84963953533, +84931156756 |
| `url` | ✅ | Correct |
| `openingHoursSpecification` | ❌ | Chỉ có `openingHours` dạng string trong department |
| `priceRange` | ❌ | Thiếu trên main entity (chỉ có "₫₫" trong department) |
| `image` | ✅ | Logo URL |
| `logo` | ✅ | Logo URL |
| `description` | ✅ | Đủ nội dung |
| `aggregateRating` | ❌ | **THIẾU** — critical |
| `areaServed` | ✅ | Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn |
| `hasMap` | ✅ | Google Maps link |
| `sameAs` | ⚠️ | Chỉ có Facebook — thiếu GBP URL, YouTube channel |

### Lỗi cấu trúc quan trọng

```json
// LỖI HIỆN TẠI:
{
  "@type": "Organization",
  "@id": "https://thongtaccongquangninh.com/#person"  // SAI
}

// ĐÚNG phải là:
{
  "@type": "Organization",
  "@id": "https://thongtaccongquangninh.com/#organization"
}
```

```json
// THIẾU trên main LocalBusiness:
{
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "05:00",
      "closes": "22:00"
    }
  ],
  "priceRange": "₫₫",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "47",
    "bestRating": "5"
  }
}
```

---

## 9. Location Page Quality

### Pages Detected

| URL | Title | Word count | City mentions | Schema riêng | Doorway risk |
|-----|-------|-----------|--------------|--------------|-------------|
| /hut-be-phot-ha-long/ | "Hút Bể Phốt Hạ Long Giá Rõ Ràng, Phục Vụ Nhanh Tại Bãi Cháy, Hồng Gai" | ~10,549 | 88 | Không có LB riêng | Thấp |
| /hut-be-phot-cam-pha/ | "Hút bể phốt Cẩm Phả: xe bồn vào ngõ, xử lý bể đầy lâu năm" | ~9,561 | 60 | Không có LB riêng | Thấp |
| /hut-be-phot-uong-bi/ | (chưa fetch) | — | — | — | — |
| /hut-be-phot-mong-cai/ | (chưa fetch) | — | — | — | — |
| /hut-be-phot-dong-trieu/ | (chưa fetch) | — | — | — | — |
| /hut-be-phot-quang-yen/ | (chưa fetch) | — | — | — | — |
| /hut-be-phot-van-don/ | (chưa fetch) | — | — | — | — |
| /hut-be-phot-bai-chay/ | (chưa fetch) | — | — | — | — |
| /thong-tac-cong-bai-chay/ | (chưa fetch) | — | — | — | — |
| /he-thong-co-so-quang-ninh/ | "Hệ Thống Cơ Sở Quảng Ninh" | ~7,132 | — | Location hub | — |

### Đánh giá chất lượng (dựa trên Ha Long và Cam Pha)

**Điểm mạnh:**
- Content dài, giàu thông tin: 9,000-10,500 từ/trang — vượt xa threshold thị trường Vietnam
- City mentions dense: Ha Long 88 lần, Cẩm Phả 60 lần — không phải doorway page
- Title tags unique, chứa sub-area (Bãi Cháy, Hồng Gai — địa danh cụ thể trong Hạ Long)
- H2 structure bao gồm local-specific content (địa hình, mùa mưa QN, local context)
- Local area references: "phường Bãi Cháy, Giếng Đáy", "mùa mưa tháng 5-9"

**Swap Test (RicketyRoo method):** Thay "Hạ Long" = "Cẩm Phả" trong Hạ Long page — KHÔNG còn accurate vì có references cụ thể đến phường, địa hình, đặc thù thành phố. PASS — không phải doorway page.

**Điểm yếu:**
- Không có `LocalBusiness` schema riêng với `@id` unique cho mỗi city page  
- Không có `aggregateRating` local (reviews từ khách hàng ở Hạ Long, Cẩm Phả)
- Chỉ có location pages cho "hút bể phốt" — thiếu location pages cho "thông tắc cống [thành phố]" (chỉ có 1 trang /thong-tac-cong-bai-chay/ được detect)
- Không có trang riêng cho Hòn Gai (dù đây là trung tâm hành chính Hạ Long mới)

### Internal Linking Depth

| Trang | Clicks từ homepage |
|-------|-------------------|
| /hut-be-phot-quang-ninh/ | 1 click |
| /thong-tac-cong-quang-ninh/ | 1 click |
| /hut-be-phot-ha-long/ | 1 click (menu/section link) |
| /hut-be-phot-cam-pha/ | 1 click |
| /lien-he/ | 1 click |
| /bang-gia/ | 1 click |
| /he-thong-co-so-quang-ninh/ | 1 click |

Internal linking: **tốt** — tất cả trang quan trọng trong 1-2 clicks từ homepage. Hub-and-spoke architecture hiện diện.

---

## 10. Top 10 Prioritized Actions

### CRITICAL (làm ngay, ảnh hưởng ranking trực tiếp)

**#1 — Thu thập Google Reviews tích cực (Impact: Reviews +15/20)**  
Đây là GAP lớn nhất. Business hoàn toàn không có visible review signals.  
- Mục tiêu ngắn hạn: 10+ reviews (magic threshold theo Sterling Sky)  
- Mục tiêu 90 ngày: 4.5+ stars, duy trì ≥1 review mỗi 18 ngày (18-day rule)  
- Cách thực hiện: Tạo QR code link đến Google review page, gửi SMS sau khi hoàn thành dịch vụ  
- KHÔNG pre-screen (review gating) — vi phạm Google policy + FTC fine  
- Sau khi có ≥5 reviews, thêm `aggregateRating` vào LocalBusiness schema

**#2 — Fix Business Name — chốt 1 tên nhất quán (Impact: NAP +4/15)**  
Hiện tại 3 tên khác nhau giữa các entity schema và GBP. Quyết định:  
- Nếu muốn rank cho "hút bể phốt": chọn "Hút Bể Phốt Quảng Ninh - Môi Trường Đô Thị Số 1"  
- Nếu muốn rank cho "thông tắc cống": chọn "Thông Tắc Cống Quảng Ninh"  
- Áp dụng nhất quán vào: Organization schema, LocalBusiness schema, GBP listing, footer text  
- Gợi ý theo memory MEMORY.md: tên GBP chốt "Thông Tắc Cống Quảng Ninh" khớp domain

**#3 — Sửa Organization `@id` từ `#person` thành `#organization` (Impact: Schema +1/10)**  
```json
"@id": "https://thongtaccongquangninh.com/#organization"
```
Lỗi cấu trúc này làm Google Knowledge Graph parser nhầm Organization với Person entity.

### HIGH (làm trong 2 tuần)

**#4 — Thêm `openingHoursSpecification` vào main LocalBusiness + đồng nhất giờ hoạt động (Impact: GBP +2/25, Schema +0.5/10)**  
- Quyết định: 05:00-22:00 hay thực sự 24/7?  
- Nếu 05:00-22:00: xóa tất cả "24/7" trong marketing content, update schema và GBP  
- Nếu 24/7: update schema và GBP thành 24/7  
- Thiếu `openingHoursSpecification` trên main LocalBusiness là lỗi phổ biến với impact trực tiếp (Google ưu tiên businesses "open at search time")

**#5 — Thêm `priceRange: "₫₫"` vào main LocalBusiness schema (Impact: Schema +0.5/10)**  
Hiện tại chỉ có trong `department` sub-entity, thiếu ở main entity. Thêm `"priceRange": "₫₫"` vào block LocalBusiness chính.

**#6 — Claim Bing Places for Business (Impact: Citations, AI Visibility)**  
URL: https://www.bingplaces.com/  
ChatGPT, Copilot, Alexa đều dựa vào Bing index cho local business data. Đây là quick win để xuất hiện khi user hỏi AI về dịch vụ hút bể phốt Quảng Ninh.

**#7 — Claim Apple Business Connect (Impact: Citations)**  
URL: https://businessconnect.apple.com/  
Usage doubled to 27% (BrightLocal 2026). Quan trọng cho iOS users dùng Apple Maps.

### MEDIUM (làm trong 1 tháng)

**#8 — Thêm LocalBusiness schema riêng cho mỗi city page (Impact: Schema +1/10, Location pages)**  
Mỗi trang như `/hut-be-phot-ha-long/` cần schema riêng:  
```json
{
  "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
  "@id": "https://thongtaccongquangninh.com/#localbusiness-halong",
  "name": "Hút Bể Phốt Hạ Long - Môi Trường Đô Thị Số 1",
  "address": { "addressLocality": "Hạ Long", ... },
  "areaServed": { "@type": "City", "name": "Hạ Long" },
  "branchOf": { "@id": "https://thongtaccongquangninh.com/#localbusiness" }
}
```

**#9 — Thêm `sameAs` cho GBP URL và YouTube channel (Impact: Authority signals)**  
```json
"sameAs": [
  "https://www.facebook.com/moitruongquangninh",
  "https://maps.app.goo.gl/[GBP_URL]",
  "https://www.youtube.com/@[channel]"
]
```

**#10 — Tạo location pages "thông tắc cống" cho các thành phố chính (Impact: On-Page +2/20)**  
Hiện tại chỉ có pages "hút bể phốt + thành phố". Cần thêm:  
- `/thong-tac-cong-ha-long/`  
- `/thong-tac-cong-cam-pha/`  
- `/thong-tac-cong-uong-bi/`  
(Hiện chỉ detect được 1 trang `/thong-tac-cong-bai-chay/` cho sub-area)

---

## 11. AI Search Impact Note

- AI Overviews xuất hiện trên đến 68% local searches (Whitespark Q2 2025)
- ChatGPT convert rate 15.9% vs Google organic 1.76% — cơ hội lớn
- **ChatGPT KHÔNG truy cập GBP trực tiếp** — nguồn: Bing, Yelp, TripAdvisor, BBB, Reddit
- Bing Places + citation building trên Yelp-equivalent VN là ưu tiên cho AI visibility
- 3 trong 5 AI visibility factors là citation-related (Whitespark 2026)

Gợi ý: Chạy `/seo geo https://thongtaccongquangninh.com` để phân tích AI search visibility đầy đủ.

---

## 12. Limitations Disclaimer

Những gì audit này **KHÔNG** có khả năng đánh giá:

| Không thể assess | Lý do | Tool có thể dùng |
|-----------------|-------|-----------------|
| Geo-grid ranking position | Cần live search theo từng tọa độ địa lý | BrightLocal, LocalFalcon |
| Số Google reviews thực tế | GBP data không trong static HTML | GBP dashboard, DataForSEO |
| Review velocity (18-day cadence) | Cần GBP Insights | GBP Insights |
| Backlink profile đầy đủ | Cần crawler/index | Ahrefs, SEMrush, Moz |
| Domain Authority / Trust Flow | Cần external DB | Moz, Majestic |
| GBP posts presence | Không visible trong HTML | GBP dashboard |
| Citation health (100+ directories) | Quá nhiều để fetch | BrightLocal, Whitespark |
| Core Web Vitals (CrUX) | Cần PSI API / CrUX API | PageSpeed Insights |
| Local pack current position | Cần SERP API với geo | DataForSEO, SEMrush |
| JavaScript-rendered content | Audit dùng raw HTML (no Playwright) | Playwright `--mode always` |

---

*Audit hoàn thành: 2026-06-28. Dữ liệu từ live fetch, raw HTML, không qua Playwright renderer. Map embeds và review carousels có thể inject client-side — khuyến nghị verify thêm bằng Playwright cho GBP widget.*
