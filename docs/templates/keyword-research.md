# Keyword Research — Quy trình nghiên cứu từ khóa tiếng Việt

> File này dùng khi cần mở rộng từ khóa, phân loại intent, ưu tiên keyword target cho bài viết hoặc topical map.

---

## 1. QUY TRÌNH 6 BƯỚC

### Bước 1 — Xác định seed keyword
Seed = 1–3 từ khóa gốc của ngành/dịch vụ.

Ví dụ:
- Dịch vụ môi trường: `thông tắc cống`, `hút bể phốt`
- Spa: `spa massage`, `phun xăm thẩm mỹ`
- Nha khoa: `niềng răng`, `trồng răng implant`
- Bất động sản: `mua bán nhà đất`, `cho thuê chung cư`

### Bước 2 — Mở rộng theo 5 hướng

Với mỗi seed keyword, mở rộng theo 5 trục:

| Trục | Công thức | Ví dụ (seed = "thông tắc cống") |
|------|-----------|----------------------------------|
| **Địa phương** | seed + [tỉnh/quận/phường] | thông tắc cống Hạ Long, thông tắc cống Bãi Cháy |
| **Khách hàng** | seed + [đối tượng] | thông tắc cống chung cư, thông tắc cống nhà hàng |
| **Vấn đề** | [vấn đề] + seed | nguyên nhân tắc cống, cống bị tắc do dầu mỡ |
| **Giải pháp** | seed + [cách/hướng dẫn] | cách thông cống tại nhà, thông cống không đục phá |
| **Thương mại** | seed + [giá/báo giá/dịch vụ] | giá thông tắc cống, dịch vụ thông cống 24/7 |

### Bước 3 — Phân loại theo intent

Mỗi keyword phải gán 1 trong 4 intent:

- **I** = Informational (thông tin, học hỏi)
- **C** = Commercial (so sánh, đánh giá)
- **T** = Transactional (mua, thuê, đặt)
- **N** = Navigational (tìm thương hiệu)

### Bước 4 — Đánh giá ưu tiên

Mỗi keyword cho điểm 3 trục (1–5):

| Trục | Ý nghĩa |
|------|---------|
| **Volume** | Lượng tìm kiếm/tháng (cao = 5) |
| **KD** | Keyword Difficulty (dễ = 5, khó = 1) |
| **CV** | Khả năng chuyển đổi (T cao nhất, I thấp nhất) |

**Priority score** = (Volume + KD + CV) / 3

Ưu tiên viết: keyword có score ≥ 3.5 + intent T/C trước.

### Bước 5 — Loại keyword trùng intent

Nếu 2 keyword cùng intent + cùng SERP (kết quả Google giống nhau) → **gộp** vào 1 bài, chọn keyword chính có volume cao hơn.

### Bước 6 — Map keyword về bài viết

Mỗi bài viết = 1 keyword chính + 3–10 keyword phụ (LSI, biến thể, long-tail).

---

## 2. TEMPLATE BẢNG KEYWORD

Output dạng bảng Markdown để user copy thẳng vào Google Sheets / Notion:

| # | Keyword | Volume | KD | CV | Score | Intent | Cluster | Keyword phụ | URL gợi ý |
|---|---------|--------|----|----|-------|--------|---------|-------------|-----------|
| 1 | thông tắc cống Hạ Long | 4 | 4 | 5 | 4.3 | T | Địa phương | thợ thông cống Hạ Long, dịch vụ thông cống Hạ Long | /thong-tac-cong-ha-long/ |
| 2 | giá hút bể phốt Quảng Ninh | 3 | 4 | 5 | 4.0 | T | Giá | bảng giá hút bể phốt, chi phí hút bể phốt | /gia-hut-be-phot-quang-ninh/ |

---

## 3. CÔNG CỤ GỢI Ý (User tự dùng)

- **Google Suggest** (gõ keyword vào Google, xem auto-complete)
- **People Also Ask** (Google SERP, mục "Mọi người cũng hỏi")
- **Related searches** (cuối trang Google)
- **Keyword Tool** (keywordtool.io)
- **Ahrefs / SEMrush / Ubersuggest** (có volume, KD)
- **Google Trends** (xu hướng theo thời gian + địa phương)
- **Google Search Console** (keyword đang có impression nhưng chưa rank cao)

Lưu ý: Volume từ tool quốc tế thường thấp hơn thực tế ở thị trường VN. Ưu tiên kết hợp tool + Google Suggest + kinh nghiệm ngành.

---

## 4. NGUYÊN TẮC LOCAL SEO (cho doanh nghiệp địa phương)

Với doanh nghiệp có địa điểm vật lý:

- **Long-tail địa phương** quan trọng hơn keyword chung
- Ưu tiên: `[dịch vụ] + [phường/quận/thành phố]`
- Ví dụ: "thông tắc cống Bãi Cháy" > "thông tắc cống" (đối với 1 thợ cụ thể)
- Mỗi phường/quận có thể là 1 landing page riêng (ward-level page)
- Keyword "gần đây", "uy tín", "giá rẻ", "24/7" thường đi kèm long-tail địa phương

---

## 5. KEYWORD CẦN TRÁNH

- Keyword brand đối thủ (vd: "Dr. Hiền nha khoa") — chỉ nên rank phụ
- Keyword quá rộng không có chuyển đổi (vd: "nha khoa" — quá chung)
- Keyword có ý định tiêu cực (vd: "lừa đảo [brand]")
- Keyword không phù hợp với ngành nghề (medical / finance phải có chuyên môn thật)

---

## 6. CÁC CÂU HỎI GIÚP MỞ RỘNG KEYWORD

Khi cạn ý, dùng 7 câu hỏi:

1. Khách hàng tìm kiếm gì trước khi mua dịch vụ này?
2. Khách hàng hỏi gì sau khi mua dịch vụ này?
3. Vấn đề gì khiến khách phải tìm đến dịch vụ?
4. Đối thủ đang rank những từ khóa gì?
5. Có biến thể địa phương nào chưa khai thác?
6. Có ngách sản phẩm/dịch vụ chuyên biệt nào không?
7. Có sự kiện / mùa / xu hướng nào liên quan?

---

## 7. CHECKLIST KHI TRẢ KẾT QUẢ KEYWORD CHO USER

- [ ] Có ≥ 20 keyword đã mở rộng
- [ ] Đã phân loại intent (I/C/T/N) cho từng keyword
- [ ] Đã có score ưu tiên
- [ ] Đã nhóm thành cluster
- [ ] Đã gợi ý URL slug cho keyword cluster lớn
- [ ] Đã loại trùng SERP
- [ ] Có ít nhất 5 keyword Transactional (kiếm tiền) ở top ưu tiên
- [ ] Định dạng bảng Markdown dễ copy
