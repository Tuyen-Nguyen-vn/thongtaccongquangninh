# Quy chuẩn viết bài SEO — System Prompt cho AI

> File này là luật bắt buộc cho mọi AI (hoặc người) viết nội dung SEO cho `thongtaccongquangninh.com`.
> Cập nhật: 2026-05-11

---


### 1.1 CẤM dùng tiếng Việt không dấu (teencode)

- Mọi tên riêng phải viết hoa, có dấu: **Hạ Long**, **Đông Triều**, **Cẩm Phả**, **Móng Cái**, **Quảng Yên**, **Uông Bí**, **Vân Đồn**, **Bãi Cháy**, **Hoành Bồ**.
- Mọi anchor text link nội bộ phải dùng tiếng Việt có dấu đầy đủ.


- Mỗi link nội bộ trong danh sách chỉ cần: `<li><a href="URL">Tên dịch vụ/khu vực có dấu</a></li>`.


- Danh sách khu vực phục vụ: mỗi địa danh chỉ xuất hiện **1 lần** trong 1 câu liệt kê.
- Sai: "Đông Triều, Mạo Khê, Đông Triều, Yên Thọ". Đúng: "Đông Triều, Mạo Khê, Yên Thọ".
- Không liệt kê quá 12 địa danh trong 1 câu. Nếu cần nhiều hơn, tách thành 2 đoạn hoặc dùng danh sách `<ul>`.





---

## 2. QUY ĐỊNH XUẤT NỘI DUNG HTML / MARKDOWN

### 2.1 Định dạng bắt buộc cho nội dung bài viết (.md)

Website dùng pipeline publish tự convert Markdown → HTML trước khi đẩy vào WordPress. File draft .md PHẢI:

- Dùng cú pháp Markdown chuẩn GFM (GitHub Flavored Markdown).
- Bảng: dùng pipe table GFM với header row + separator row `|---|---|`.
- Bold: `**text**`. Italic: `*text*`.

### 2.2 Script publish PHẢI xử lý

Mọi script push bài lên WordPress bắt buộc dùng module `tools/lib/markdown_to_html.mjs` để convert, bao gồm:

- `[text](url)` → `<a href="url">text</a>`
- `**bold**` → `<strong>bold</strong>`
- `![alt](src)` → `<img src="src" alt="alt" loading="lazy">`
- Table GFM → `<table><thead>...<tbody>...`
- HTML inline (dòng bắt đầu `<`) → giữ nguyên, không escape


### 2.3 Nếu paste trực tiếp vào WordPress Editor

Chuyển sang tab "Code Editor" (hoặc Custom HTML block) và paste HTML đã render. KHÔNG paste Markdown vào Visual Editor — WordPress sẽ hiển thị raw `[text](url)` và `| bảng |`.

---

## 3. VĂN PHONG BẮT BUỘC

### 3.1 Nguyên tắc chung

- Mỗi đoạn 2-3 câu. Không đoạn nào quá 5 câu.
- Câu ngắn, rõ ý. Không lòng vòng.
- Tập trung vào: vấn đề khách đang gặp → cách xử lý → thời gian → giá → hotline.

### 3.2 CTA (Call-to-Action)

- Hotline xuất hiện ít nhất 2 lần trong bài, bôi đậm: **0963.953.533 / 0931.156.756**.

### 3.3 Thông tin chính xác

- Tên công ty: **Môi Trường Đô Thị Số 1 Quảng Ninh** (lấy từ CODEX_CONTEXT.md).
- Hotline: **0963.953.533 / 0931.156.756**.
- Thế mạnh: 24/7, có mặt nhanh, không đục phá, bảo hành dài hạn, xe bồn + máy lò xo hiện đại.

---

## 4. CẤU TRÚC BÀI SEO CHUẨN

### 4.1 Frontmatter bắt buộc

```
Meta Title: [55-70 ký tự, chứa focus keyword]
Meta Description: [145-160 ký tự, chứa focus keyword + hotline]
Focus Keyword: [từ khóa chính]
Slug: [slug-khong-dau]
```

### 4.2 Các section bắt buộc (H2)

1. **Giới thiệu dịch vụ** — focus keyword trong 100 từ đầu
2. **Nguyên nhân / Tình trạng** — giải thích vấn đề khách gặp
3. **Quy trình xử lý** — từng bước cụ thể
4. **Bảng giá tham khảo** — bảng GFM có header
5. **Cam kết** — bằng chứng, không lời hứa suông
7. **FAQ** — 3-5 câu hỏi thực tế khách hay hỏi
8. **Dịch vụ liên quan** — 4-7 link nội bộ, anchor có dấu

### 4.3 Độ dài

- Bài dịch vụ/khu vực: 2500-3100 từ.
- Internal link: 4-8 link, anchor text tự nhiên và có dấu.

---

## 5. CHECKLIST TRƯỚC KHI PUBLISH

- [ ] Focus keyword có trong title, meta desc, slug, H2, 100 từ đầu
- [ ] Meta title 55-70 ký tự, meta desc 145-160 ký tự
- [ ] Hotline xuất hiện ít nhất 2 lần, bôi đậm
- [ ] Không có anchor text không dấu
- [ ] Bảng giá dùng pipe table GFM đúng chuẩn (có separator row)
- [ ] Link nội bộ dùng cú pháp `[text](url)` chuẩn
- [ ] Số từ trong khoảng 2500-3100
- [ ] Chạy `tools/seo_score.py` — score >= 88/100
- [ ] File markdown không chứa HTML tag (để module convert xử lý)
