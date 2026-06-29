---
name: seo-rankmath-100
description: Chấm và tối ưu bài viết đạt Rank Math 100/100 cho thongtaccongquangninh.com. Kích hoạt khi user nói "chấm rank math", "tối ưu rank math 100", "vì sao bài chưa 100 điểm", "sửa bài lên 100 điểm", "kiểm 24 test rank math", "rank math còn thiếu gì", hoặc cần tối ưu on-page theo điểm Rank Math. Skill map đủ 24 test Rank Math sang luật cụ thể của dự án + cách vá từng test, và chỉ rõ test nào tools/seo_score.py CHƯA phủ để bắt buộc kiểm tay.
metadata:
  short-description: Đưa bài đạt Rank Math 100/100 (24 test)
---

# SEO Rank Math 100 — Đưa bài đạt 100/100 từng test


## 1. Khi nào dùng skill này

Kích hoạt khi cần:

- Chấm điểm Rank Math cho 1 bài và biết test nào đang đỏ/vàng.
- Tối ưu 1 bài draft trước khi public để chạm 100/100.
- Vá 1 bài đã public nhưng Rank Math còn 80–97.
- Hiểu vì sao bài đạt ngưỡng nội bộ (`seo_score.py`) nhưng Rank Math vẫn chưa 100.

Phân biệt với skill anh em:

- `seo-rankmath-100` (skill này) → lo **điểm Rank Math on-page**. Đọc khi cần chạm 100/100.

Hai skill bổ sung nhau, không thay thế.

## 2. Nguyên tắc cốt lõi

- Rank Math 100 = đạt **100% TỪNG test**, không phải chỉ "pass" tổng thể.
- Tool nội bộ `tools/seo_score.py` (**v2, 2026-06-23**) đã tự bắt phần lớn test chấm offline được — gồm cả slug-keyword, keyword trong subheading/ALT, số trong title, external-link, ≥2500 từ, ≥4 ảnh (các dòng gắn nhãn `[RM]`). Nhưng vẫn còn **9 test tool KHÔNG kiểm được** vì cần ngữ cảnh nhiều bài hoặc cấu hình WordPress. Đạt ngưỡng nội bộ (easy 80 / medium 84 / hard 88) **KHÔNG** đảm bảo Rank Math = 100.
- Vì vậy: dùng `seo_score.py` cho phần tự động, rồi **kiểm tay 9 test** tool bỏ sót (mục 4).
- Điểm Rank Math thật chỉ thấy được **trong WordPress sau khi gắn focus keyword**. Offline chỉ tối ưu cho đạt, sau public phải mở Rank Math xác nhận 100.

## 3. Bản đồ 24 test Rank Math → luật dự án

Cột "Tool" = `tools/seo_score.py` v2 có phủ không: ✅ có · ⚠️ phủ một phần · ❌ chưa phủ (kiểm tay).

### Nhóm Basic SEO

| # | Test Rank Math | Ngưỡng đạt | Áp cho dự án | Tool |
|---|---|---|---|---|
| 2 | Focus keyword trong meta description | Có | Meta 150–160 ký tự, có hotline 0963.953.533 | ✅ |
| 4 | Focus keyword đầu nội dung | Trong 10% đầu (hoặc 300 từ đầu) | Nhắc keyword ngay đoạn mở | ✅ (500 ký tự đầu) |
| 5 | Focus keyword trong toàn bài | Có (cả biến thể số ít/nhiều) | Rải tự nhiên | ✅ |
| 6 | Độ dài nội dung | **2500+ từ = 100%** | Mục tiêu 2500–3000 từ | ✅ (có dòng `[RM] >= 2500 từ`) |

### Nhóm Additional

| # | Test Rank Math | Ngưỡng đạt | Áp cho dự án | Tool |
|---|---|---|---|---|
| 7 | Keyword trong subheading | Có trong H2/H3 | ≥1 H2/H3 chứa keyword chính/phụ | ✅ (dòng `[RM] Từ khóa trong subheading`) |
| 8 | Keyword trong ALT ảnh | ≥1 ảnh có keyword trong alt | Alt = dịch vụ + địa phương (chứa keyword) | ✅ (dòng `[RM] Từ khóa trong ALT ảnh`) |
| 10 | Độ dài URL | ≤ 75 ký tự (cả domain) | Slug ngắn gọn | ❌ |
| 11 | Link ra nguồn ngoài | ≥1 external link | Link tới nguồn uy tín liên quan | ✅ (dòng `[RM] Có external link`) |
| 13 | Link nội bộ | ≥1 internal link | ≥2–5 internal, anchor tiếng Việt có dấu | ✅ (≥2) |

### Nhóm Title Readability

| # | Test Rank Math | Ngưỡng đạt | Áp cho dự án | Tool |
|---|---|---|---|---|
| 15 | Keyword ở nửa đầu title | Trong 50% đầu tiêu đề | Đưa keyword lên đầu | ❌ (tool chỉ kiểm keyword có trong title) |
| 16 | Sentiment trong title | Title có cảm xúc (tích cực/tiêu cực) | Xem caveat mục 5 | ❌ |
| 17 | Power words trong title | Có ≥1 power word | Xem caveat mục 5 | ❌ |
| 18 | Có số trong title | Có ≥1 chữ số | Thêm số: 2026 / "15 phút" / "5 bước" / giá | ✅ (dòng `[RM] Có số trong title`) |

### Nhóm Content Readability

| # | Test Rank Math | Ngưỡng đạt | Áp cho dự án | Tool |
|---|---|---|---|---|
| 19 | Table of Contents | Có TOC plugin/block | Bật Rank Math TOC block hoặc plugin TOC | ❌ |
| 21 | Dùng media | **≥4 ảnh/video = 100%** | Đạt ≥4 ảnh (tên file + alt chuẩn) | ✅ (dòng `[RM] >= 4 ảnh`; draft `.md` thường chưa có ảnh nên FAIL tới khi lên WordPress) |

### N/A cho site dịch vụ (không tính)

- Product Schema, Allow Customer Reviews → chỉ áp WooCommerce/EDD.

## 4. Khoảng trống `seo_score.py` v2 — BẮT BUỘC kiểm tay

Tool v2 đã tự bắt: slug-keyword (3), keyword trong subheading (7), keyword trong ALT (8), external-link tồn tại (11), số trong title (18), ≥2500 từ (6), ≥4 ảnh (21). **Không cần kiểm tay lại các test này** (trừ caveat ở mục 3).

Còn **9 test tool KHÔNG kiểm được**, phải tự rà từng bài:

1. **Mật độ sàn 1%** (test 9) — tool chỉ chặn trần ~1.8%, không cảnh báo khi density < 1%.
2. **URL ≤ 75 ký tự** (test 10).
3. **External link DOFOLLOW** (test 12) — tool đếm external nhưng *giả định* dofollow; phải tự kiểm `rel` + setting nofollow toàn site (mục 9).
4. **Keyword uniqueness** giữa các bài (test 14) — tool chấm 1 file, không biết bài khác.
5. Keyword nằm **nửa đầu title** (test 15) — tool chỉ kiểm keyword *có* trong title, không kiểm vị trí.
6. **Sentiment** trong title (test 16).
7. **Power word** trong title (test 17).
8. **Table of Contents** (test 19).
9. **Đoạn ≤ 120 từ** (test 20).


- **Hotline:** 0963.953.533 / 0931.156.756
- **Brand:** Môi Trường Đô Thị Số 1 Quảng Ninh — `thongtaccongquangninh.com`
- **Dòng tác giả cuối bài (bắt buộc, dạng link):**
  `Tác giả: [Nguyễn Song Hào](https://thongtaccongquangninh.com/author/nguyensonghao/)`
- **Dịch vụ:** hút bể phốt · thông tắc cống · nạo vét · xử lý mùi hôi
- **Chuẩn bài:** 2500–3000 từ · density 1–1.5% · Meta Title 60–70 ký tự · Meta Description 150–160 ký tự (có hotline) · đúng 1 H1
- **NAP cuối bài:** chèn block "Văn phòng phục vụ khu vực" theo logic địa bàn trong `CODEX_CONTEXT.md`.

### Thêm SỐ vào title (test 18 — dễ, làm luôn)

Luôn nhét ≥1 chữ số tự nhiên: năm `2026`, cam kết `15 phút`, `5 bước`, mức giá, `24/7`.
Ví dụ: `Hút Bể Phốt Khẩn Cấp Quảng Ninh – 24/7, Có Mặt 15 Phút [2026]`.

### Caveat power word / sentiment (test 16–17)


- Vẫn viết title mạnh, có cảm xúc tự nhiên (vd "khẩn cấp", "triệt để", "tận gốc", "ngay", "nhanh").
- Nếu 2 test này vẫn vàng do giới hạn ngôn ngữ → **chấp nhận**, ghi rõ trong report là "giới hạn ngôn ngữ Rank Math", và đảm bảo các test còn lại đều 100. Đa số test khác đủ để tổng đạt 100.

## 6. Quy trình đạt 100 (B1 → B7)

1. **Đọc bài + chốt focus keyword** (1 keyword chính duy nhất cho bài).
2. **Chạy tool tự động:**
   ```powershell
   python tools\seo_score.py content-drafts\blog\<bai>.md "<focus keyword>"
   ```
   Vá hết dòng `FAIL` tool báo; ưu tiên các dòng gắn `[RM]` (sát Rank Math nhất).
   ℹ️ Tool v2 đã đọc đúng nhãn draft `**SEO TITLE:**` / `**META DESCRIPTION:**` / `**SLUG:**` (KHÔNG còn "FAIL giả" title/meta như bản cũ). Lưu ý: chấm **draft `.md`** thì ảnh / internal link / schema / TOC thường FAIL vì các thứ đó gắn ở WordPress — điểm thấp ở các mục này là bình thường, điểm Rank Math thật chỉ thấy sau khi lên WordPress.
3. **Duyệt 9 điểm kiểm tay** ở mục 4.
4. **Vá theo Bảng cách vá nhanh** (mục 7).
5. **Rà lại:** chạy lại `seo_score.py` + tự tick checklist tay (mục 8).
6. **Sau public:** mở bài trong WordPress, gắn focus keyword, xem điểm Rank Math. Test nào còn đỏ/vàng → vá tiếp (trừ caveat ngôn ngữ mục 5).
7. **Ghi tiến độ:** thêm 1 dòng vào `docs/SEO_PROGRESS.csv` (kể cả khi dở dang) — **bắt buộc, không ngoại lệ**.

## 7. Bảng cách vá nhanh (test fail → fix)

| Test đỏ | Cách vá |
|---|---|
| Keyword đầu title / nửa đầu | Viết lại title cho keyword đứng đầu |
| Số trong title | Thêm `2026` / `15 phút` / `5 bước` / giá |
| Keyword trong subheading | Sửa ≥1 H2/H3 để chứa keyword chính/phụ |
| Keyword trong ALT | Đặt alt ảnh = keyword + địa phương, vd `giá hút bể phốt Quảng Ninh` |
| Mật độ 1–1.5% | Đếm `(số lần keyword / tổng từ)`; thêm/bớt cho vào dải |
| Độ dài < 2500 | Bổ sung nội dung thật (tình huống, quy trình, FAQ địa phương) tới ≥2500 |
| URL > 75 ký tự | Rút gọn slug |
| Internal link | Thêm 2–5 link nội bộ, anchor tiếng Việt có dấu |
| Keyword uniqueness | Đổi focus keyword cho khác mọi bài đã làm (nhất là trang area) |
| Table of Contents | Chèn TOC block của Rank Math hoặc plugin TOC |
| Đoạn > 120 từ | Tách thành các đoạn 2–3 câu |
| < 4 ảnh | Bổ sung đủ ≥4 ảnh, mỗi ảnh tên file + alt + caption riêng |

## 8. Self-check trước khi báo "đạt 100"

Tick đủ trước khi nói xong:

- [ ] Title: có keyword ở đầu + có số + 60–70 ký tự
- [ ] Meta description: có keyword + có hotline + 150–160 ký tự
- [ ] Slug: không dấu, có keyword, URL ≤ 75 ký tự
- [ ] Keyword xuất hiện đầu bài + ≥1 subheading + ≥1 ALT ảnh
- [ ] Mật độ keyword trong 1–1.5%
- [ ] Bài ≥ 2500 từ
- [ ] ≥1 external link dofollow + ≥2 internal link
- [ ] Focus keyword không trùng bài khác
- [ ] Có Table of Contents
- [ ] ≥ 4 ảnh, alt chuẩn
- [ ] Đã chạy `seo_score.py` đạt + (sau public) Rank Math = 100 đã xác nhận
- [ ] Đã ghi `docs/SEO_PROGRESS.csv`

## 9. Bẫy hay gặp

- **Bẫy nofollow toàn site (test 12) — ĐÃ GẶP THẬT trên site này:** Rank Math có setting **General Settings → Links → "Nofollow External Links"**. Nếu BẬT, plugin tự thêm `rel="nofollow"` vào **MỌI** link ngoài qua filter `the_content` → test external-dofollow FAIL trên **toàn bộ trang** dù bạn không hề tự gắn nofollow. Ngày 2026-06-23 setting này đang BẬT chính là lý do không trang nào qua test này; đã tắt (option `nofollow_external_links='off'` trong wp_option `rank-math-options-general`).
  - *Sửa:* Rank Math → General Settings → Links → tắt "Nofollow External Links". Đây là setting **TOÀN SITE**, ảnh hưởng mọi trang — đổi xong nên báo/xác nhận với Tuyền.
- **Trang area trùng focus keyword** (Bãi Cháy / Hồng Gai / Cẩm Phả…) → fail uniqueness. Mỗi trang 1 keyword riêng.
- **Quên external dofollow** — dự án thiên internal link nên hay thiếu hẳn link ra ngoài.
- **Power word/sentiment title tiếng Việt** — Rank Math chỉ nhận từ điển tiếng Anh nên test 16–17 hay đỏ dù title đã mạnh; chấp nhận, ghi rõ "giới hạn ngôn ngữ" (mục 5), đừng nhồi từ tiếng Anh.
- **Đoạn quá dài** — copy từ nơi khác dễ vượt 120 từ/đoạn.
- **Tin tool nội bộ là đủ** — `seo_score.py` v2 vẫn không bắt 9 test ở mục 4 (nhất là dofollow, uniqueness, URL≤75, vị trí keyword trong title, TOC, đoạn ≤120 từ).
- **Chấm draft tưởng là chấm bài thật** — draft `.md` chưa có ảnh / internal / schema / TOC (gắn ở WordPress) nên điểm tool thấp là bình thường; điểm Rank Math thật chỉ thấy sau khi lên WordPress.

## 10. Tóm tắt nhanh

> Rank Math 100 = đạt 100% **từng** trong 24 test (4 nhóm: Basic / Additional / Title / Content readability).
> `seo_score.py` v2 phủ phần lớn test tự động → chạy tool xong vẫn **phải kiểm tay 9 test** ở mục 4 (dofollow, uniqueness, URL≤75, density sàn, vị trí/power/sentiment title, TOC, đoạn ≤120 từ).
> Title: keyword đầu + có số. Bài ≥2500 từ, density 1–1.5%, ≥4 ảnh, có TOC, ≥1 external dofollow.
> **Bẫy lớn:** Rank Math "Nofollow External Links" (toàn site) nếu BẬT sẽ nofollow mọi link ngoài → fail test 12 mọi trang. Đã tắt 2026-06-23.
> Power word/sentiment tiếng Việt có thể không xanh do giới hạn ngôn ngữ — chấp nhận, ghi rõ.
> Sau public xác nhận Rank Math = 100, rồi ghi `docs/SEO_PROGRESS.csv`.
