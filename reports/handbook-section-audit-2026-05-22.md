# Audit Cẩm nang trang chủ - 2026-05-22

## Phạm vi kiểm tra

- Trang live: `https://thongtaccongquangninh.com/`, section `CẨM NANG THÔNG MINH`.
- Hub liên quan: `/blog/`, vì nút `Xem tất cả hướng dẫn` của section trỏ về đây.
- Nguồn render local: `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`.
- Bằng chứng ảnh chụp: `reports/handbook-audit-homepage-2026-05-22.png`.

## Kết luận nhanh

Section Cẩm nang đang hiển thị đúng khung giao diện và 6 link bài đều còn sống, nhưng chưa đạt vì 6/6 ảnh thẻ bị vỡ. Nguyên nhân chính là các bài mới không có `featured_media`, sau đó template rơi về ảnh fallback hard-code nhưng URL fallback đang 404.

Điểm hiện trạng:

- Ảnh thẻ: 0/100.
- Link bài: 100/100.
- Đúng intent Cẩm nang: 55/100.
- Nội dung excerpt: 70/100.
- UX desktop: 45/100.
- SEO thẻ bài: 60/100.

## Bằng chứng kỹ thuật

Template đang query 6 bài mới nhất:

- `post_type`: `post`
- `post_status`: `publish`
- `posts_per_page`: `6`
- `orderby`: `date`
- `category_name`: `blog,tin-tuc`

Vị trí code:

- `page-home-direct.php:6979-6987`: cấu hình `WP_Query`.
- `page-home-direct.php:6996-6999`: lấy featured image, nếu không có thì dùng fallback hard-code.
- `page-home-direct.php:7027-7034`: render link, ảnh, tiêu đề và excerpt.

Fallback đang dùng:

`https://thongtaccongquangninh.com/wp-content/uploads/2026/05/mac-dinh-thong-tac-quang-ninh.jpg`

Kết quả kiểm tra HTTP:

- Ảnh fallback: `404`.
- `/thong-tac-cong-gieng-day-2/`: `200`.
- `/thong-tac-cong-cao-xanh-2/`: `200`.
- `/thong-tac-cong-bai-chay/`: `200`.
- `/thong-tac-cong-hong-gai-2/`: `200`.
- `/hut-be-phot-tien-yen-2/`: `200`.
- `/hut-be-phot-hai-ha-2/`: `200`.

## Các lỗi cần sửa

1. **6/6 ảnh Cẩm nang bị vỡ**

- Tất cả ảnh trong 6 thẻ đều trỏ về ảnh fallback `mac-dinh-thong-tac-quang-ninh.jpg`.
- Ảnh fallback trả `404`, browser ghi nhận `naturalWidth = 0`.
- Lỗi này làm section nhìn giống đang lỗi tải ảnh, ảnh hưởng UX và độ tin cậy.

2. **6 bài đang được kéo vào section đều thiếu featured image**

- `thong-tac-cong-gieng-day-2`: `featured_media = 0`.
- `thong-tac-cong-cao-xanh-2`: `featured_media = 0`.
- `thong-tac-cong-bai-chay`: `featured_media = 0`.
- `thong-tac-cong-hong-gai-2`: `featured_media = 0`.
- `hut-be-phot-tien-yen-2`: `featured_media = 0`.
- `hut-be-phot-hai-ha-2`: `featured_media = 0`.

3. **Logic fallback chưa an toàn**

- Template chỉ kiểm tra có thumbnail hay không, nhưng không kiểm tra URL fallback có tồn tại hay không.
- Khi fallback chết, toàn bộ section hỏng ảnh cùng lúc.
- Nên dùng fallback từ asset chắc chắn nằm trong plugin hoặc media đã kiểm HTTP 200.

4. **Intent Cẩm nang đang bị lẫn với landing/dịch vụ địa phương**

- Section có tên là Cẩm nang/hướng dẫn, nhưng 6 bài đang hiển thị phần lớn là trang dịch vụ địa phương: Giếng Đáy, Cao Xanh, Bãi Cháy, Hồng Gai, Tiên Yên, Hải Hà.
- Category hiển thị đều là `Bảng giá dịch vụ`, chưa đúng kỳ vọng của một khu “Cẩm nang thông minh”.
- Nếu giữ như hiện tại, người dùng kỳ vọng đọc hướng dẫn nhưng lại thấy danh sách landing dịch vụ.

5. **Excerpt còn rò Markdown**

- Bài Bãi Cháy đang lộ `**0963.953.533 / 0931.156.756**` trong excerpt.
- HTML live render nguyên dấu `**`, cần strip Markdown trước khi cắt excerpt hoặc sửa excerpt trong bài.

6. **Alt text quá dài và lặp thương hiệu**

- Khi không có alt ảnh thật, template dùng `get_the_title() . ' - Môi Trường Đô Thị Số 1 Quảng Ninh'`.
- Với tiêu đề dài, alt trở nên dài, lặp từ khóa và không mô tả đúng hình ảnh.
- Nên có alt ngắn theo ảnh fallback, ví dụ `Xe thông tắc cống phục vụ tại Quảng Ninh`.

7. **Hub `/blog/` cũng đang thiếu featured image diện rộng**

- 20 bài mới nhất qua REST đều có `featured_media = 0`.
- Nếu archive `/blog/` hoặc block khác cần ảnh đại diện, nguy cơ vỡ ảnh/lặp fallback sẽ còn tái diễn.

## Phương án xử lý đề xuất

1. Sửa ngay ảnh fallback trong template Cẩm nang:

- Không dùng URL upload hard-code chưa xác minh.
- Chuyển sang asset có sẵn trong plugin hoặc media đã kiểm `200`.
- Thêm lớp bảo vệ: nếu bài không có featured image thì dùng fallback chắc chắn tồn tại.

2. Gán featured image cho nhóm bài đang xuất hiện trong Cẩm nang:

- Ưu tiên 6 bài đang hiển thị trước.
- Ảnh phải đúng ngữ cảnh: thông tắc cống, xe hút bể phốt, xử lý tại nhà dân/khu dân cư.
- Không dùng nhãn chung kiểu "ảnh minh họa"; alt/caption phải mô tả trực tiếp dịch vụ.

3. Làm sạch excerpt:

- Strip Markdown `**...**` trước khi render excerpt.
- Rà riêng bài `thong-tac-cong-bai-chay` vì đang lộ Markdown hotline.

4. Tách intent Cẩm nang khỏi landing dịch vụ:

- Nếu section này là cẩm nang thật, query nên ưu tiên tag/category chuyên biệt như `cam-nang`, `huong-dan`, `faq`, thay vì kéo mọi bài mới từ `blog,tin-tuc`.
- Nếu vẫn muốn show bài dịch vụ địa phương, nên đổi nhãn section/CTA để không mâu thuẫn intent.

5. Re-audit sau sửa:

- Kiểm 6 thẻ desktop/mobile.
- Kiểm tất cả ảnh trong section có `naturalWidth > 0`.
- Kiểm 6 link trả `200`.
- Chụp lại screenshot trước/sau.
- Kiểm `/blog/` để không còn ảnh vỡ trên hub Cẩm nang.

## Mức ưu tiên

- P0: Sửa ảnh fallback 404 để hết ảnh vỡ trên trang chủ.
- P1: Gán featured image cho 6 bài đang lên section.
- P2: Làm sạch excerpt Markdown và alt text.
- P3: Tách lại category/tag để section đúng intent Cẩm nang.
