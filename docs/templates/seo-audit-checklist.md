# SEO Audit Checklist — Audit on-page & Checklist xuất bản

> File này dùng khi user yêu cầu **audit bài viết**, **audit URL**, **chấm điểm SEO**, hoặc cần **checklist trước khi publish**.

---

## 1. CÁC TIÊU CHÍ AUDIT (30 TIÊU CHÍ — TƯƠNG THÍCH RANK MATH)

### A. Basic SEO (6 tiêu chí — 30 điểm)

| # | Tiêu chí | Điểm | Cách kiểm tra |
|---|----------|------|---------------|
| 1 | Keyword chính trong **Meta Title** | 5 | Title chứa keyword (ưu tiên đầu) |
| 2 | Keyword chính trong **Meta Description** | 5 | Desc chứa keyword chính |
| 3 | Keyword chính trong **URL slug** | 5 | Slug không dấu, có keyword |
| 4 | Keyword chính trong **100 từ đầu** bài | 5 | Mở bài có keyword |
| 5 | Keyword chính trong ít nhất 1 **H2 / H3** | 5 | Có biến thể keyword ở heading |
| 6 | Keyword chính trong **alt ảnh** | 5 | Ít nhất 1 ảnh có alt chứa keyword |

### B. Additional (5 tiêu chí — 25 điểm)

| # | Tiêu chí | Điểm | Cách kiểm tra |
|---|----------|------|---------------|
| 7 | **Mật độ keyword** 1–1.5% | 5 | (số lần keyword xuất hiện ÷ tổng số từ) × 100 |
| 8 | **URL ngắn** < 75 ký tự | 5 | Đếm ký tự URL |
| 9 | Có **external link DoFollow** đến trang authority | 5 | Ít nhất 1 link ra ngoài |
| 10 | Có **internal link** đến bài cùng site | 5 | Ít nhất 2 internal link |
| 11 | Bài đủ dài **≥ 2.000 từ** | 5 | Đếm tổng số từ |

### C. Title Readability (4 tiêu chí — 20 điểm)

| # | Tiêu chí | Điểm | Cách kiểm tra |
|---|----------|------|---------------|
| 12 | Title có **số** | 5 | "10 cách", "5 lý do", "2025"... |
| 13 | Title có **power word** | 5 | "tốt nhất", "uy tín", "chuyên gia", "bí mật"... |
| 14 | Title có **từ chỉ cảm xúc** (sentiment) | 5 | "đỉnh", "tuyệt", "đáng tin", "an tâm"... |
| 15 | Keyword chính đặt ở **đầu Title** | 5 | Keyword trong 3 từ đầu |

### D. Content Readability (15 tiêu chí — 25 điểm)

| # | Tiêu chí | Điểm | Cách kiểm tra |
|---|----------|------|---------------|
| 16 | Có **Table of Contents** (TOC) | 2 | Plugin TOC hoặc HTML thủ công |
| 18 | Có **ảnh / video** | 2 | Ít nhất 2 hình hoặc 1 video |
| 19 | Có **subheading** (H2, H3, H4) | 2 | Heading sau mỗi ~300 từ |
| 21 | Có **câu hỏi** trong bài | 2 | Q&A hoặc câu gợi mở |
| 22 | Có **bullet list / numbered list** | 2 | Ít nhất 2 list |
| 24 | Có **bảng** (table) khi có số liệu | 2 | Bảng giá / so sánh |
| 25 | **CTA** xuất hiện ≥ 2 lần | 2 | Giữa bài + cuối bài |
| 26 | **NAP đầy đủ** (nếu local) | 2 | Tên + địa chỉ + hotline |
| 27 | Có **FAQ** ≥ 3 câu | 1 | Voice-search friendly |
| 28 | **Hotline / Zalo** ≥ 3 lần | 1 | Trải đều bài |
| 29 | Có **schema markup** | 1 | Article / Service / FAQPage |

**Tổng điểm: 100**

---

## 2. MẪU OUTPUT AUDIT

Khi user yêu cầu audit, **luôn xuất theo template dưới**:

```markdown
# AUDIT SEO: [URL hoặc tiêu đề bài]

**Ngày audit**: [ngày]
**Keyword chính**: [keyword]
**Tổng số từ**: [X từ]
**Mật độ keyword**: [X.X%]

---

## 📊 Điểm tổng

**Điểm hiện tại: XX / 100**
**Mục tiêu sau sửa: 90+ / 100**

---

## ✅ Đã đạt (Y / 30)

- ✅ [Tiêu chí 1]: [chi tiết]
- ✅ [Tiêu chí 2]: [chi tiết]
- …

---

## ❌ PHẢI SỬA NGAY (Z lỗi quan trọng)

### Lỗi 1: [Tên tiêu chí]
**Hiện tại**: "[trích nguyên văn vấn đề]"
**Sửa thành**:
```
[Copy-paste-ready fix]
```

### Lỗi 2: [Tên tiêu chí]
**Hiện tại**: "[trích nguyên văn]"
**Sửa thành**:
```
[Copy-paste-ready fix]
```

(Tiếp tục cho mọi lỗi…)

---

## ⚠️ NÊN CẢI THIỆN

- ⚠️ [Mục 1]: [gợi ý cụ thể]
- ⚠️ [Mục 2]: [gợi ý cụ thể]

---

## ✅ TO-DO CHECKLIST (làm theo thứ tự)

### Ưu tiên 1 — Basic SEO
- [ ] Sửa Meta Title thành: `"[Meta Title 60–70 ký tự sẵn copy]"`
- [ ] Sửa Meta Description thành: `"[Meta Desc 150–160 ký tự + hotline sẵn copy]"`
- [ ] Đổi URL slug thành: `/slug-moi/`
- [ ] Thêm keyword vào 100 từ đầu (gợi ý câu mở: "...")
- [ ] Thêm alt cho ảnh: `"[alt 1]"`, `"[alt 2]"`, `"[alt 3]"`

### Ưu tiên 2 — Title Readability
- [ ] Thêm số vào title (gợi ý: "[ví dụ]")
- [ ] Thêm power word: "[ví dụ]"
- [ ] Đảo keyword lên đầu

### Ưu tiên 3 — Content Readability
- [ ] Chèn TOC ngay sau mở bài
- [ ] Tách đoạn dài > 120 từ thành 2–3 đoạn
- [ ] Thêm bảng giá / bảng so sánh
- [ ] Bold các từ: "[keyword]", "[hotline]", "[cam kết]"
- [ ] Bổ sung FAQ với 3 câu: "[câu 1?]", "[câu 2?]", "[câu 3?]"

### Ưu tiên 4 — Additional
- [ ] Thêm 1 external link DoFollow đến: `[URL gợi ý]`
- [ ] Thêm 3 internal link:
  - `[URL nội bộ 1]` — anchor "[anchor 1]"
  - `[URL nội bộ 2]` — anchor "[anchor 2]"
  - `[URL nội bộ 3]` — anchor "[anchor 3]"
- [ ] Bổ sung [X] từ để đạt 2.000+ (gợi ý: thêm H2 "[tên H2]" với nội dung "[mô tả]")

### Ưu tiên 5 — Schema
- [ ] Thêm schema `Article` + `FAQPage` (xem `schema-guide.md`)

---

## 📈 Điểm dự kiến sau khi sửa

**Sau khi hoàn tất to-do trên: ~XX / 100**

---

## 📋 Ghi chú thêm

```

---

## 3. NGUYÊN TẮC AUDIT

1. **Trích nguyên văn vấn đề** — không nói chung chung "title chưa tối ưu"
2. **Đưa ra fix copy-paste-ready** — user copy thẳng vào WordPress được
3. **Meta Title** đề xuất luôn 60–70 ký tự, có keyword đầu
4. **Meta Desc** đề xuất luôn 150–160 ký tự + hotline (nếu có)
5. **Tính mật độ chính xác** = số lần keyword ÷ tổng số từ × 100
6. **Nếu bài < 2.000 từ** → gợi ý cụ thể H2 nào cần thêm + nội dung mô tả
7. **Thứ tự ưu tiên fix**: Basic SEO → Title → Content → Additional → Schema

---

## 4. CHECKLIST TRƯỚC KHI PUBLISH (DÙNG TRƯỚC MỖI BÀI ĐĂNG)

### 🔧 Cài đặt SEO cơ bản
- [ ] Focus keyword đã set trong plugin SEO
- [ ] Meta Title 60–70 ký tự, có keyword
- [ ] Meta Description 150–160 ký tự, có hotline + CTA
- [ ] URL slug ngắn, không dấu, có keyword
- [ ] Không tick "noindex" (trừ trang riêng tư)

### 📝 Nội dung
- [ ] H1 duy nhất, chứa keyword
- [ ] Đủ 4–8 H2 theo cấu trúc bài
- [ ] Keyword trong 100 từ đầu
- [ ] Mật độ keyword 1–1.5%
- [ ] Có biến thể / LSI / long-tail
- [ ] Có bullet list / bảng / bold
- [ ] CTA giữa bài + cuối bài
- [ ] FAQ ≥ 3 câu (nếu phù hợp)
- [ ] NAP đầy đủ (nếu local)
- [ ] Độ dài đạt mục tiêu (1.500–3.000 từ)

### 🖼️ Ảnh & Media
- [ ] Tất cả ảnh có **alt text** (chứa keyword biến thể)
- [ ] Ảnh nén dung lượng < 200 KB
- [ ] Định dạng WebP (hoặc JPG tối ưu)
- [ ] Tên file ảnh không dấu, có keyword (`thong-tac-cong-ha-long-1.webp`)
- [ ] Lazy load bật
- [ ] Ảnh đại diện (featured) đã set
- [ ] OG image (1200×630) đã set cho social share

### 🔗 Internal & External link
- [ ] ≥ 2 internal link đến bài cùng silo / pillar
- [ ] ≥ 1 external link DoFollow đến trang authority
- [ ] Anchor text đa dạng, không trùng 100% mỗi lần
- [ ] Link mở tab mới cho external (`target="_blank" rel="noopener"`)

### 🏷️ Schema & Social
- [ ] Schema phù hợp đã chèn (Article / Service / FAQ / LocalBusiness)
- [ ] Open Graph (og:title, og:description, og:image) đã set
- [ ] Twitter Card đã set
- [ ] Test schema bằng Rich Results Test (search.google.com/test/rich-results)

### 📂 Phân loại & Tag
- [ ] Đã chọn đúng Category (chỉ 1 category chính)

### 📱 Trải nghiệm
- [ ] Đọc thử trên mobile — đoạn không vỡ, ảnh không tràn
- [ ] CTA / hotline bấm gọi được trên mobile (`tel:` link)
- [ ] Tốc độ load < 3s (test PageSpeed Insights)
- [ ] Form (nếu có) test thử gửi ok

### 🔍 Sau khi publish
- [ ] Submit URL lên **Google Search Console** (URL Inspection → Request Indexing)
- [ ] Submit URL lên **Bing Webmaster Tools**
- [ ] Share lên Facebook / Zalo / fanpage thương hiệu
- [ ] Kiểm tra rank sau 7–14 ngày
- [ ] Cập nhật internal link từ bài cũ trỏ về bài mới

---

## 5. CÁCH TÍNH MẬT ĐỘ KEYWORD CHÍNH XÁC

**Công thức**: `(số lần keyword chính xuất hiện ÷ tổng số từ) × 100`

**Quy tắc đếm**:
- Tính cả khi keyword nằm trong heading, bold, link
- Không tính keyword trong code, schema, meta
- Mục tiêu: **1.0% – 1.5%** (vd: bài 2.000 từ → keyword chính xuất hiện 20–30 lần)
- Trên 2% = nhồi nhét → giảm
- Dưới 0.5% = thiếu → bổ sung tự nhiên

---

## 6. CÁCH ĐÁNH GIÁ NHANH 1 BÀI (≤ 2 PHÚT)

1. **Liếc title** → có keyword đầu? có số? có power word?
2. **Liếc meta** → đúng độ dài? có hotline?
3. **Scroll nhanh** → có TOC? có bảng? có bullet? có ảnh?
4. **Đọc mở bài** → có chạm nỗi đau? có keyword?
5. **Đếm H2** → ≥ 4? có biến thể keyword?
6. **Xem có FAQ + NAP + CTA không**
7. **Xem độ dài tổng** ≥ 2.000?
8. **Có schema không** (xem source code hoặc plugin)

→ Quick score ≈ tổng cảm nhận. Sau đó audit chi tiết theo 30 tiêu chí ở mục 1.
