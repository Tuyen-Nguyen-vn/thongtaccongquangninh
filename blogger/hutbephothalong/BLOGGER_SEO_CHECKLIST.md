# BLOGGER_SEO_CHECKLIST — Checklist bắt buộc trước publish

> Mỗi bài viết HOẶC mỗi lần sửa template **PHẢI** chạy hết checklist này trước khi báo "xong". Đánh dấu `[x]` vào từng dòng trong báo cáo.

## A. Cho mỗi bài viết

### A.1 Anti-template (xem GEMINI.md mục 2)

- [ ] Đã ghi block `<!-- ANTI-TEMPLATE-DECLARATION -->` đầu file draft.
- [ ] Kiểu bài đã chọn rõ (LISTICLE / CASE_STUDY / HOW_TO / COMPARISON / EXPLAINER / NEWS_LOCAL / MYTH_BUSTING).
- [ ] Mở bài không bắt đầu bằng "Trong bài viết này…" / "Bạn đang gặp tình trạng…".

### A.2 Cấu trúc SEO

- [ ] Meta Title 55-65 ký tự, chứa từ khoá chính ở đầu.
- [ ] Meta Description 145-160 ký tự, có hotline `0963.953.533`.
- [ ] URL slug ≤ 60 ký tự, không dấu, chứa từ khoá chính.
- [ ] **1 H1 duy nhất** = post title.
- [ ] Mật độ từ khoá chính 0.8-1.2%.
- [ ] LSI/từ đồng nghĩa rải tự nhiên.
- [ ] Độ dài đúng range (1500-2200 / 800-1400 / 1200-1800 tuỳ kiểu — xem `CONTENT_RULES.md`).

### A.3 Hình ảnh

- [ ] 3-6 ảnh, đúng ngữ cảnh, không poster quảng cáo.
- [ ] Tên file `<keyword>-<dia-phuong>-<n>.webp`.
- [ ] Các ảnh khác `loading="lazy"`.

### A.4 Internal & external link

- [ ] 1-3 link contextual về site mẹ `thongtaccongquangninh.com`, anchor đa dạng (xem `CONTEXT.md` mục 4).
- [ ] 0-2 external link đến nguồn uy tín nếu cite, link bình thường (không nofollow).

### A.5 Schema

- [ ] Post page có `Article` schema đủ field.
- [ ] Có `BreadcrumbList`.
- [ ] FAQ schema CHỈ nhúng nếu có khối FAQ thật hiển thị (≥ 3 Q/A).
- [ ] Test bằng [Rich Results Test](https://search.google.com/test/rich-results), paste link kết quả vào `TASKS.md`.

### A.6 CTA

- [ ] Hotline `0963.953.533` (hoặc `0931.156.756`) xuất hiện 2 lần: giữa + cuối bài.
- [ ] Bôi đậm hotline.

### A.7 E-E-A-T

- [ ] Có dấu hiệu kinh nghiệm thật của đội thợ (số liệu cụ thể, loại máy, năm kinh nghiệm).
- [ ] Nếu bài local: có thực thể địa phương cụ thể (đường/phường/đặc thù hạ tầng).



### A.9 Publish & Index

- [ ] Bật Search Description trong Settings → đã điền cho bài này.
- [ ] Label gán 1-3 cái, đúng bộ label trong `CONTEXT.md` mục 6.
- [ ] Publish → mở URL public → kiểm desktop + mobile.
- [ ] Search Console → Inspect URL → Request Indexing.
- [ ] Ghi 1 dòng log vào `TASKS.md` (URL, ngày, người làm, trạng thái).

---

## B. Cho mỗi lần sửa template

- [ ] Đã backup XML cũ vào `backup-xml/template-<ngày>.xml`.
- [ ] XML hợp lệ (preview Blogger không lỗi parse).
- [ ] Trang chủ render đúng layout theo `BLOGGER_DESIGN_PLAN.md`.
- [ ] Trang post: 1 H1, breadcrumb, TOC, sticky sidebar (desktop), CTA hotline cuối bài.
- [ ] Trang label: H1 đúng, description tay, grid OK.
- [ ] Trang liên hệ: NAP + Map + hotline.
- [ ] Logo SVG inline, KHÔNG bị stretch.
- [ ] Font load đúng (Be Vietnam Pro hoặc Inter), Vietnamese subset.
- [ ] Màu hex đúng spec (`#0B6E4F`, `#F4A300`, ...).
- [ ] Sticky header hoạt động trên mobile.
- [ ] Nút gọi hotline click ra `tel:+84963953533`.
- [ ] Schema WebSite + LocalBusiness render trong `<head>` mọi page.
- [ ] Open Graph + Twitter Card có đủ.
- [ ] Canonical sạch.
- [ ] Mobile redirect (`?m=1`) đã tắt hoặc redirect về URL gốc.
- [ ] PageSpeed Insights mobile ≥ 80, desktop ≥ 90. Paste link.
- [ ] Rich Results Test pass cho 1 post mẫu. Paste link.
- [ ] Screenshot desktop + mobile vào `screenshots/<ngày>/`.

---

## C. Khi import bài từ file XML có sẵn (`D:\blogger\Blogger_SEO_Posts_Import*.xml`)

- [ ] Loại bỏ bài trùng nhau, bài chất lượng thấp, bài dạng template rập khuôn.
- [ ] Bài giữ lại phải qua mục A.1 → A.9 ở trên trước khi publish.
- [ ] Báo Tuyền danh sách bài giữ / bài loại trước khi import.

---

## D. Quy tắc báo cáo cuối mỗi turn

```
Đã test:
- [kiểm tra]: OK / FAIL + lý do

Chưa test được:
- [nếu có] vì [lý do cụ thể]

Việc tiếp theo nên làm: <1 câu>
```
