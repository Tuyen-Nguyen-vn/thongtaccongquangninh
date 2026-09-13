# Việc còn lại — cập nhật 2026-09-13

Đọc từ trên xuống, làm theo thứ tự. Mỗi việc chỉ mất vài phút.

## ✅ Đã xong (không cần làm lại)
- [x] Chẩn đoán nguyên nhân mất thứ hạng "tại X" — xem `bao-cao-tu-khoa-tai.md`
- [x] 16 trang dịch vụ đã sửa Title/Meta trên WordPress sống (7 địa bàn × hút bể phốt + thông tắc cống, + trang hầm cầu)
- [x] Crawl kiểm tra 122/122 URL từ máy bạn — xác nhận không bị chặn

## ☐ Việc 1 — Tạo 20 bài blog "cẩm nang tại X" (5 phút)

Mở PowerShell:
```
cd D:\.thongtaccongquangninh
git pull
```
Sau đó bấm đúp vào file `tools\chay-tat-ca-bai-blog.bat` (hoặc gõ `tools\chay-tat-ca-bai-blog.bat` trong PowerShell).

→ Tạo xong 20 bài NHÁP trên WordPress (chưa công khai). Mỗi bài in ra 1 link dạng
`https://thongtaccongquangninh.com/wp-admin/post.php?post=XXXX&action=edit`.

## ☐ Việc 2 — Hoàn thiện từng bài blog (làm tay trong WordPress)

Với mỗi link ở Việc 1:
1. Mở link, đăng nhập WordPress
2. Thêm 2 ảnh thật (gợi ý alt text đã in kèm trong log console)
3. Đọc lướt lại nội dung
4. Bấm **Đăng (Publish)**

## ☐ Việc 3 — Dán đoạn bổ sung cho trang "hút hầm cầu"

Mở trang `hut-ham-cau-quang-ninh` trong WordPress, thêm vào cuối nội dung:

**H2:** Hút Hầm Cầu Tại Hạ Long, Cẩm Phả, Uông Bí — Xe Có Mặt Trong Bao Lâu?

**Đoạn văn:**
> Xe hút hầm cầu điều phối theo khu vực: có mặt sau 20–30 phút tại nội thành Hạ Long và Cẩm Phả, sau 30–45 phút tại Uông Bí, Quảng Yên, Đông Triều. Hầm cầu và bể phốt dùng chung một loại xe bồn và quy trình khảo sát, nên báo giá và thời gian xử lý tương tự dịch vụ hút bể phốt tại từng khu vực.

## ☐ Việc 4 — Lưu mốc Google Search Console để đối chiếu sau 2-4 tuần

1. Vào https://search.google.com/search-console
2. Performance → Search results → lọc Query chứa "tại"
3. Xuất CSV, lưu tên `gsc-truoc-khi-sua-2026-09-13.csv`
4. Lặp lại đúng bước này sau 2 tuần và 4 tuần để so sánh Position/CTR/Impression

## ☐ Việc 5 (không bắt buộc) — Phân tích sâu Giai đoạn 2

Nếu muốn có bảng phân tích chi tiết anchor text + schema:
```
cd D:\.thongtaccongquangninh
node tools\tai-keyword-crawl-audit.mjs
node tools\phan-tich-ket-qua-crawl.mjs
```
Kết quả nằm ở `reports\phan-tich-tai-<ngày giờ>.md` — mở bằng Notepad, copy toàn bộ dán vào chat với Claude để được tư vấn tiếp.
