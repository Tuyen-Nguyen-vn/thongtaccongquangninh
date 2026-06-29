# Website Structure — Cấu trúc website chuẩn SEO

> File này dùng khi user cần lập kế hoạch cấu trúc website mới hoặc tái cấu trúc website cũ. Áp dụng cho website dịch vụ, bán hàng, doanh nghiệp địa phương tiếng Việt.

---

## 1. NGUYÊN TẮC NỀN TẢNG

### Cấu trúc Silo (Hub-and-Spoke)

Website được chia thành các **silo chủ đề** (cụm chủ đề). Mỗi silo:
- Có 1 **pillar page** (trang trung tâm, dài, bao quát)
- Có nhiều **supporting articles** (bài hỗ trợ, đào sâu từng khía cạnh)
- **Liên kết nội bộ chặt chẽ** trong silo

```
                    [Trang chủ]
                         |
        ┌────────────────┼────────────────┐
        |                |                |
    [Silo 1]          [Silo 2]         [Silo 3]
    Pillar A          Pillar B         Pillar C
        |                |                |
    ┌───┼───┐        ┌───┼───┐        ┌───┼───┐
   A1  A2  A3       B1  B2  B3       C1  C2  C3
   (supporting)     (supporting)     (supporting)
```

### Quy tắc 3 click
Mọi trang phải đến được trong **≤ 3 click** từ trang chủ.

### Quy tắc URL phẳng vs phân cấp
- **Phẳng** (`domain.com/bai-viet/`): dễ rank, ít deep, phù hợp blog nhỏ
- **Phân cấp** (`domain.com/dich-vu/thong-tac-cong/`): rõ ngữ cảnh, tốt cho website nhiều silo, e-commerce, dịch vụ

→ Khuyến nghị: **phân cấp 2 tầng** cho website dịch vụ địa phương.

---

## 2. CẤU TRÚC SILO MẪU — WEBSITE DỊCH VỤ ĐỊA PHƯƠNG

Ví dụ: Công ty dịch vụ môi trường ở Quảng Ninh

```
domain.com/
│
├── / (Trang chủ — giới thiệu tổng quan + CTA chính)
│
├── /dich-vu/ (Hub trang dịch vụ)
│   ├── /dich-vu/thong-tac-cong/                 → Pillar Silo 1
│   ├── /dich-vu/hut-be-phot/                    → Pillar Silo 2
│   ├── /dich-vu/nao-vet-ho-ga/                  → Pillar Silo 3
│   └── /dich-vu/xu-ly-mui-hoi/                  → Pillar Silo 4
│
├── /khu-vuc/ (Hub trang địa phương)
│   ├── /khu-vuc/thong-tac-cong-ha-long/         → Silo địa phương 1
│   │   ├── /khu-vuc/ha-long/bai-chay/
│   │   ├── /khu-vuc/ha-long/hong-gai/
│   │   └── /khu-vuc/ha-long/tuan-chau/
│   ├── /khu-vuc/thong-tac-cong-cam-pha/
│   └── /khu-vuc/thong-tac-cong-uong-bi/
│
├── /bang-gia/ (Trang bảng giá tổng + chi tiết theo dịch vụ)
│
├── /blog/ (Supporting articles)
│   ├── /blog/nguyen-nhan-tac-cong-chung-cu/
│   ├── /blog/cach-thong-cong-tai-nha/
│   ├── /blog/dau-hieu-be-phot-day/
│   └── ...
│
├── /gioi-thieu/
├── /lien-he/
└── /chinh-sach/ (Điều khoản, bảo mật)
```

### Internal link trong silo

Mỗi pillar (`/dich-vu/thong-tac-cong/`) liên kết tới:
- Tất cả supporting articles trong silo của nó
- Trang địa phương liên quan (`/khu-vuc/thong-tac-cong-ha-long/`)
- Trang bảng giá
- Trang liên hệ

Mỗi supporting article:
- Link ngược về pillar
- Link tới 1–2 supporting article cùng silo
- **KHÔNG** link sang silo khác (trừ khi có lý do mạnh)

---

## 3. CẤU TRÚC SILO MẪU — E-COMMERCE

```
domain.com/
│
├── /
├── /danh-muc/
│   ├── /danh-muc/giay-nam/
│   │   ├── /danh-muc/giay-nam/giay-the-thao/
│   │   ├── /danh-muc/giay-nam/giay-tay/
│   │   └── /danh-muc/giay-nam/giay-luoi/
│   ├── /danh-muc/giay-nu/
│   └── /danh-muc/phu-kien/
│
├── /san-pham/
│   └── /san-pham/[ten-san-pham-slug]/
│
├── /blog/ (Buyer's guide, so sánh, hướng dẫn chọn size…)
├── /khuyen-mai/
├── /gioi-thieu/
├── /chinh-sach/
└── /lien-he/
```

---

## 4. CẤU TRÚC SILO MẪU — THƯƠNG HIỆU CÁ NHÂN

```
domain.com/
│
├── / (Hero giới thiệu + CTA)
├── /ve-toi/
├── /dich-vu/
│   ├── /dich-vu/coaching-1-1/
│   ├── /dich-vu/khoa-hoc/
│   └── /dich-vu/tu-van-doanh-nghiep/
├── /blog/
│   ├── /blog/danh-muc-1/
│   └── /blog/danh-muc-2/
├── /podcast/ hoặc /youtube/
├── /lien-he/
└── /tai-lieu-mien-phi/ (lead magnet)
```

---

## 5. CHUẨN URL SLUG

### Quy tắc:
- **Không dấu**, không khoảng trắng, dùng dấu gạch ngang `-`
- **Ngắn**: 3–6 từ, ≤ 75 ký tự
- **Có keyword chính** ngay đầu
- **Không stop-word** (và, hoặc, với, của, cho…) trừ khi cần thiết
- **Số có ý nghĩa** ok (vd: `10-cach-thong-cong`)
- **Không thay đổi URL** sau khi đã đăng — nếu phải đổi → redirect 301

### Ví dụ tốt vs xấu

| ❌ Xấu | ✅ Tốt |
|--------|--------|
| `/p?id=123` | `/thong-tac-cong-ha-long/` |
| `/bai-viet-moi-nhat-ve-dich-vu-thong-tac-cong-tai-ha-long-quang-ninh-2024/` | `/thong-tac-cong-ha-long/` |
| `/THONG-TAC-CONG/` (uppercase) | `/thong-tac-cong/` |
| `/dịch-vụ-thông-tắc-cống/` (có dấu) | `/dich-vu-thong-tac-cong/` |

---

## 6. NAVIGATION (MENU) CHUẨN

### Header Menu
Tối đa 7 mục chính:

```
[Logo] | Trang chủ | Dịch vụ ▼ | Bảng giá | Khu vực ▼ | Blog | Liên hệ | [📞 Hotline]
```

Dropdown "Dịch vụ":
- Thông tắc cống
- Hút bể phốt
- Nạo vét hố ga
- Xử lý mùi hôi
- → Xem tất cả dịch vụ

Dropdown "Khu vực":
- Hạ Long
- Cẩm Phả
- Uông Bí
- → Xem tất cả khu vực

### Footer
4 cột:

```
Cột 1 — Về chúng tôi    Cột 2 — Dịch vụ        Cột 3 — Khu vực        Cột 4 — Liên hệ
- Giới thiệu             - Thông tắc cống        - Hạ Long              📍 Địa chỉ
- Tại sao chọn           - Hút bể phốt           - Cẩm Phả              📞 Hotline
- Đội ngũ                - Nạo vét hố ga         - Uông Bí              💬 Zalo
- Tuyển dụng             - Xử lý mùi hôi         - …                    📧 Email
                                                                         🕐 24/7
```

Bên dưới footer: copyright + chính sách + sitemap link.

### Breadcrumb
Bắt buộc trên mọi trang ngoài trang chủ:

```
Trang chủ > Dịch vụ > Thông tắc cống > Thông tắc cống Hạ Long
```

---

## 7. SƠ ĐỒ TRANG (SITEMAP)

### XML Sitemap (cho Google)
- File `/sitemap.xml` ở root
- Submit lên Google Search Console
- Cập nhật tự động khi đăng bài mới
- Plugin gợi ý: Rank Math / Yoast (WordPress)

### HTML Sitemap (cho user)
- Trang `/sitemap/` hoặc `/so-do-trang/`
- Liệt kê toàn bộ trang chính + danh mục
- Link từ footer

---

## 8. CẤU TRÚC TRANG QUAN TRỌNG

### Trang chủ
1. Hero: H1 + USP + CTA chính + ảnh nền
2. Block dịch vụ (3–4 dịch vụ chính, link tới pillar)
3. Tại sao chọn chúng tôi (USP)
4. Khu vực phục vụ (link tới các trang địa phương)
5. Bảng giá rút gọn / dịch vụ nổi bật
6. Testimonial / case study
7. Blog mới nhất (3–6 bài)
8. CTA cuối + form / hotline
9. Map + NAP

### Trang Pillar dịch vụ (`/dich-vu/thong-tac-cong/`)
- Theo `seo-article-template.md` mục 3
- Link tới: tất cả supporting articles trong silo + trang địa phương cùng dịch vụ

### Trang địa phương (`/khu-vuc/thong-tac-cong-ha-long/`)
- Như pillar nhưng nhấn mạnh:
  - Tên địa phương trong H1, H2, mở bài
  - Số liệu/case study tại địa phương đó
  - Đường đi, thời gian di chuyển, khu vực phục vụ chi tiết (theo phường)
  - Map embed địa phương đó
  - Schema `LocalBusiness` với `areaServed`

### Trang bảng giá
- Bảng giá rõ ràng theo dịch vụ
- Ghi rõ "giá tham khảo"
- CTA gọi báo giá chính xác
- Schema `Service` với `offers`

### Trang liên hệ
- NAP đầy đủ
- Form liên hệ
- Map embed
- Schema `LocalBusiness` + `ContactPoint`

---

## 9. CHECKLIST CẤU TRÚC WEBSITE

- [ ] Trang chủ có H1, hero, CTA chính
- [ ] Mỗi dịch vụ có 1 pillar page riêng
- [ ] Có hệ thống trang địa phương (nếu local business)
- [ ] URL slug không dấu, ngắn, có keyword
- [ ] Mọi trang đến được trong ≤ 3 click
- [ ] Menu ≤ 7 mục chính
- [ ] Breadcrumb trên mọi trang
- [ ] Footer có NAP + sitemap rút gọn
- [ ] Có `/sitemap.xml` submit Google Search Console
- [ ] Mỗi pillar có ≥ 5 supporting articles
- [ ] Internal link trong silo chặt chẽ
- [ ] Responsive 100% mobile-first
- [ ] Tốc độ tải < 3s (Core Web Vitals)
- [ ] HTTPS bắt buộc
- [ ] 404 page có CTA về trang chủ
