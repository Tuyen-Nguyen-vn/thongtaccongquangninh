# Báo cáo Hợp nhất: Comprehensive Deep SEO Audit (2026-06-04)
**Website:** `thongtaccongquangninh.com`  
**Đơn vị thực hiện:** Agentic SEO Team  
**Người duyệt:** Tuyền (SEO Manager)  

---

## 1. TỔNG QUAN HỆ THỐNG
* **Tổng số URL kiểm tra:** 76 URL hoạt động (REST API + Sitemap).
* **Kết quả phân loại trạng thái:**
  * **PASS:** 22 URL (Tối ưu tốt, không lỗi đỏ)
  * **FAIL (Lỗi Đỏ - Ưu tiên cao):** 23 URL (Thiếu H2 bắt buộc, thiếu Service schema, hoặc dính doorway cao)
  * **WARN (Cảnh báo - Ưu tiên trung bình):** 31 URL (Word count ngắn/dài quá mức, Alt text thiếu chuẩn địa phương)
* **Tổng số lỗi theo danh mục:** Content & H2 (69) | Title & Meta (28) | Schema (15) | Image SEO (12) | Heading (7).

---

## 2. CHI TIẾT KẾT QUẢ ĐÁNH GIÁ (FINDINGS)

### A. Phân Tích Chống Doorway Pages (44 Trang Local SEO)
* **Trang có rủi ro Doorway HIGH (Cực kỳ nguy hiểm - cần viết lại hoặc bổ sung):**
  1. `/hut-be-phot-dong-trieu/`: Word count quá thấp (1374 từ). Thiếu H2 "Nguyên nhân". Case study bị copy-paste nhầm lẫn địa danh khác ("Bình Dương"). Keyword stuffing (2.55%).
  2. `/hut-be-phot-mong-cai/`: Word count quá thấp (1381 từ). Thiếu H2 "Nguyên nhân". Rập khuôn cấu trúc.
  3. `/thong-tac-cong-dong-trieu/`: Word count thấp (1272 từ). Thiếu H2 "Nguyên nhân".
  4. `/thong-tac-cong-mong-cai/`: Word count thấp (1257 từ). Thiếu H2 "Nguyên nhân".
  5. `/thong-tac-cong-van-don/`: Word count thấp (1252 từ). Thiếu H2 "Nguyên nhân".
* **Trang có rủi ro Doorway MEDIUM (Cần tinh chỉnh nhẹ):**
  * `/hut-be-phot-uong-bi/` và `/hut-be-phot-quang-yen/`: Cấu trúc H2 đã rewrite nhưng FAQ vẫn trùng lặp khuôn mẫu cũ. Thiếu thực thể địa hình bản địa sâu hơn.
* **Trang đạt chuẩn LOW Risk (Đã tối ưu hóa tốt):**
  * `/hut-be-phot-ha-long/` và `/hut-be-phot-cam-pha/`: Word count > 2500 từ. H2 và FAQ được viết riêng cho bối cảnh địa phương (nhà trong ngõ hẹp, khu mỏ, khách sạn, đồi dốc).

### B. Audit Hình Ảnh & GEO Metadata (Image SEO)
* **Thống kê kho ảnh:**
  * **Ảnh nguồn:** ~133 ảnh thực tế tại `Ảnh cung cấp` chia làm 16 thư mục dịch vụ (xe hút, thợ thông cống, máy lò xo...).
  * **Ảnh đã xử lý:** 113 ảnh chuẩn SEO tại `Ảnh Đã Xử Lý SEO`.
* **Vấn đề Alt Text & Số lượng ảnh:**
  * `/chinh-sach-bao-mat/` và `/dieu-khoan-dich-vu/`: Thiếu ảnh (0 ảnh).
  * `/` (Trang chủ): Gặp lỗi nặng nhất với **8 ảnh trống Alt** và **12 ảnh Alt thiếu từ khóa dịch vụ/địa phương** (`ALT_NO_SERVICE_OR_LOCATION`).
* **Bảng tọa độ GPS thập phân đề xuất nhúng cho ảnh địa phương:**
  * **Hạ Long:** `20.87333` | `107.08972`
  * **Cẩm Phả:** `21.06167` | `107.28944`
  * **Uông Bí:** `21.03556` | `106.76444`
  * **Quảng Yên:** `20.92778` | `106.85139`
  * **Đông Triều:** `21.08444` | `106.51028`
  * **Móng Cái:** `21.52694` | `107.96694`
  * **Vân Đồn:** `21.07111` | `107.42056`
  * **Ba Chẽ:** `21.27398` | `107.28321`

### C. Audit Schema & Structured Data
* **12 URL thiếu Service Schema bắt buộc (Lỗi Nghiêm Trọng):**
  * Bao gồm các trang con huyện xã và bảng giá dịch vụ bổ sung: `/hut-be-phot-binh-lieu/`, `/hut-be-phot-co-to/`, `/hut-be-phot-dam-ha/`, `/hut-be-phot-hai-ha/`, `/hut-be-phot-tien-yen/`, `/thong-tac-bon-cau-khach-san-quang-ninh-2026/`, `/thong-tac-bon-cau-khong-duc-pha-quang-ninh/`, `/thong-tac-bon-cau-nha-dan-quang-ninh-2026/`, `/thong-tac-bon-cau-nha-hang-quang-ninh-2026/`, `/thong-tac-cong-bai-chay/`, `/gia-hut-be-phot-quang-ninh-2026/`, `/hut-be-phot-khan-cap-quang-ninh-2026/`.
* **Trang thiếu FAQPage Schema:** `/chinh-sach-bao-hanh/`, `/lien-he/`, `/nguyen-nhan-cong-tac-thuong-xuyen-ha-long/`.
* **Xác thực NAP Hệ Thống:**
  * **Name:** `Môi Trường Đô Thị Số 1 Quảng Ninh`
  * **Hotline:** `0963.953.533 / 0931.156.756` (Trùng khớp 100% trên footer và header widget).
  * **Address:** `111 Cái Lân, Bãi Cháy, Quảng Ninh` (Địa chỉ văn phòng chuẩn, đã xóa sạch địa chỉ cũ tại Hà Lầm).

---

## 3. DANH SÁCH ƯU TIÊN SỬA LỖI (ACTION PLAN)

### 🥇 Nhóm Ưu Tiên 1: Khẩn Cấp (P0 - Sửa trong 24h)
1. **Bổ sung H2 bắt buộc "Nguyên nhân" và tăng Word Count lên > 2500 từ cho 5 trang Doorway HIGH:**
   * `/hut-be-phot-dong-trieu/`, `/hut-be-phot-mong-cai/`, `/thong-tac-cong-dong-trieu/`, `/thong-tac-cong-mong-cai/`, `/thong-tac-cong-van-don/`.
2. **Khai báo Service Schema cho 12 URL bị thiếu:**
   * Gắn schema JSON-LD chuẩn có `@id` liên kết về `#localbusiness` của trang chủ để Google hiểu dịch vụ của trang con.
3. **Loại bỏ từ cấm "chuyên nghiệp"** tại trang `/hoa-chat-tu-thong-cong/` (xuất hiện 3 lần trong body).

### 🥈 Nhóm Ưu Tiên 2: Quan Trọng (P1 - Hoàn thành trong 3 ngày)
1. **Sửa Alt text cho Trang chủ (/) và các trang tin tức:**
   * Bổ sung Alt text chứa từ khóa `[Dịch vụ] tại [Địa phương]` thay vì Alt trống hoặc Alt chung chung.
2. **Bổ sung hình ảnh chuẩn địa phương cho 2 trang pháp lý:** `/chinh-sach-bao-mat/`, `/dieu-khoan-dich-vu/`.
3. **Nhúng GPS Tag thực tế cho ảnh thi công trước khi đăng:**
   * Áp dụng tool ExifTool với bộ tọa độ chuẩn thập phân ở Mục 2.B cho các bài viết tương ứng.

---
**Tác giả:** [Nguyễn Song Hào](https://thongtaccongquangninh.com/author/nguyensonghao/)
