# Kế hoạch Local SEO, NAP và liên kết ngoài 2026-05-31

## Phạm vi đã kiểm tra

- Website: `https://thongtaccongquangninh.com`
- Trang kiểm tra nhanh: `/`, `/hut-be-phot-quang-ninh/`, `/thong-tac-cong-quang-ninh/`, `/lien-he/`, `/gioi-thieu/`, `/bang-gia/`
- Liên kết ngoài trọng yếu:
  - YouTube: `https://www.youtube.com/@moitruongdothiso1quangninh`
  - Facebook: `https://www.facebook.com/thongtacconghalong24h`
  - TikTok: `https://www.tiktok.com/@thongtaccongquangninh`
  - Zalo chính: `https://zalo.me/0931156756`
- Hotline chuẩn dự án: `0963.953.533 / 0931.156.756`
- Báo cáo máy đọc: `reports/nap-social-audit-2026-05-31.json`

## Kết quả đạt

- 6 trang đã kiểm tra đều trả HTTP `200`.
- Footer/trang hiển thị đúng các liên kết YouTube, Facebook, TikTok, Zalo đang kỳ vọng.
- Không thấy marker sai trên 6 trang đã kiểm:
  - Không còn `0981.306.307`.
  - Không còn `Môi Trường Đông Bắc`.
  - Không còn YouTube cũ `@hutbephothalong14` hoặc `@moitruongdongbac`.
- YouTube mới trả `200`; 3 video đã upload lại đều có oEmbed author là `Môi Trường Đô Thị Số 1 Quảng Ninh`.
- `robots.txt` public mở crawl site và trỏ sitemap Rank Math.
- `sitemap_index.xml` trả HTTP `200`, có `post-sitemap.xml`, `page-sitemap.xml`, `category-sitemap.xml`, `author-sitemap.xml`.

## Vấn đề cần xử lý trước

### P0 - Xung đột NAP trong schema

Trang chủ đang phát nhiều node `LocalBusiness`/`Organization`. Có ít nhất 2 NAP khác nhau:

- Node cũ từ plugin schema:
  - `streetAddress`: `161 Liên Phường`
  - `addressLocality`: `Hà Lầm`
  - `legalName`: `Công Ty TNHH Môi Trường Thoát Nước Đông Bắc`
  - `email`: `moitruongdongbac@gmail.com`
  - `sameAs`: Facebook chính kèm rất nhiều Facebook group
- Node cũ từ home renderer trước khi chốt lại NAP:
  - `streetAddress`: `111 Cái Lân, Phường Bãi Cháy`
  - `addressLocality`: `Hạ Long`
  - `telephone`: `+84963953533`, `+84931156756`
  - `sameAs`: website, YouTube mới, Facebook, TikTok

NAP gốc đã chốt: `Gần Nhà Văn hóa, khu 3, Hà Lầm, Quảng Ninh 01111, Việt Nam`. Toàn bộ schema, footer, trang liên hệ và profile ngoài cần đồng bộ theo địa chỉ này. Không dùng `111 Cái Lân` như NAP chính; chỉ giữ dạng chi nhánh/điểm điều phối phụ nếu địa chỉ này có thật và có thể xác minh.

### P0 - `sameAs` đang bị loãng

`sameAs` của LocalBusiness không nên chứa hàng chục Facebook group. Giữ lại các profile chính thức:

- `https://thongtaccongquangninh.com/`
- `https://www.facebook.com/thongtacconghalong24h` hoặc profile Facebook chính thức đã chốt
- `https://www.youtube.com/@moitruongdothiso1quangninh`
- `https://www.tiktok.com/@thongtaccongquangninh`

Zalo số điện thoại nên dùng làm CTA; chỉ đưa vào `sameAs` nếu đó là Official Account/brand profile công khai.

### P0 - Facebook canonical chưa thống nhất

Footer và một số code dùng `https://www.facebook.com/thongtacconghalong24h`, nhưng schema ở một số trang có `https://www.facebook.com/moitruongdothiso1quangninh`.

Khuyến nghị: chốt 1 URL Facebook chính thức, rồi đồng bộ ở footer, JSON-LD, bài viết, mô tả YouTube/TikTok và trang liên hệ.

### P1 - Zalo và hotline cần phân vai rõ

Hotline dự án là `0963.953.533 / 0931.156.756`. Zalo CTA chính đã chốt là `zalo.me/0931156756`.

Khuyến nghị:

- `0963.953.533`: số chính trong NAP và CTA gọi nhanh.
- `0931.156.756`: số phụ/điều phối, đồng thời là Zalo CTA chính.
- Zalo: ưu tiên `https://zalo.me/0931156756` ở footer/CTA; `zalo.me/0963953533` chỉ giữ nếu có vị trí phụ thật sự cần.

### P1 - External link phụ

Một số trang dịch vụ còn external link `https://generatepress.com`. Đây không phải lỗi NAP, nhưng nên kiểm tra footer theme credit để tránh liên kết ngoài không cần thiết trên landing page SEO.

## NAP đề xuất sau khi chốt

```text
Tên: Môi Trường Đô Thị Số 1 Quảng Ninh
Website: https://thongtaccongquangninh.com/
Hotline: 0963.953.533 / 0931.156.756
Điện thoại schema: +84963953533 / +84931156756
Khu vực chính: Hạ Long, Quảng Ninh
Địa chỉ schema: Gần Nhà Văn hóa, khu 3, Hà Lầm, Quảng Ninh 01111, Việt Nam
YouTube: https://www.youtube.com/@moitruongdothiso1quangninh
Facebook: cần chốt 1 URL chính thức
TikTok: https://www.tiktok.com/@thongtaccongquangninh
Zalo CTA chính: https://zalo.me/0931156756
```

Google Maps chính:

```html
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d238424.87560477422!2d106.86333517321793!3d20.9770511628745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a57004d9f94d7%3A0xd77fae8cd1341d70!2zVGjDtG5nIFThuq9jIEPhu5FuZyBI4bqhIExvbmcgLSBNw7RpIFRyxrDhu51uZyDEkMO0IFRo4buLIFPhu5EgMQ!5e0!3m2!1svi!2s!4v1780200986872!5m2!1svi!2s" width="400" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
```

## Kế hoạch Local SEO

### Giai đoạn 1 - Chuẩn hóa Entity/NAP

1. Tạo một nguồn dữ liệu NAP dùng chung trong code/plugin thay vì rải literal ở nhiều file.
2. Sửa `ttcqn-doorway-schema` để:
   - Không phát thêm LocalBusiness trang chủ nếu home renderer đã phát node chuẩn.
   - Hoặc đổi node cũ sang NAP chuẩn và loại bỏ node trùng.
   - Xóa Facebook group khỏi `sameAs`.
   - Đồng bộ Facebook, YouTube, TikTok, hotline.
3. Đồng bộ footer, trang liên hệ, trang giới thiệu, schema page/service theo cùng NAP.
4. Upload plugin sau backup, rồi verify live bằng cache-buster.
5. Nếu dùng 2 chi nhánh tại Hạ Long, tạo schema `department` hoặc `location` cho chi nhánh phụ; không trộn chi nhánh phụ vào NAP chính.

### Giai đoạn 2 - Đồng bộ profile ngoài

1. YouTube: giữ tên kênh, handle, phần giới thiệu, mô tả video theo NAP mới.
2. Facebook: chốt page chính; cập nhật About, website, hotline, khu vực phục vụ, mô tả ngắn.
3. TikTok: cập nhật bio, website/YouTube nếu có, hotline hoặc CTA phù hợp.
4. Zalo: xác định link chính là số cá nhân hay OA; nếu có OA thì ưu tiên OA làm entity link.
5. Google Business Profile: đối chiếu địa chỉ, số điện thoại, website, danh mục, giờ mở cửa, khu vực phục vụ.

### Giai đoạn 3 - Audit landing page địa phương

1. Refresh danh sách URL live từ sitemap và WordPress, không dựa hoàn toàn vào snapshot cũ.
2. Ưu tiên audit các trang:
   - Hạ Long
   - Bãi Cháy
   - Cẩm Phả
   - Uông Bí
   - Móng Cái
   - Vân Đồn
3. Với mỗi trang: kiểm Title, H1, FAQ, LocalBusiness/Service schema, canonical, internal link, video/image SEO.
4. Loại doorway: mỗi trang phải có entity địa phương, vấn đề thật, case study riêng, ảnh/video đúng ngữ cảnh.

### Giai đoạn 4 - Nội dung và media

1. Dùng 3 video YouTube mới cho các trang liên quan, tránh nhúng tràn lan.
2. Viết/cập nhật cụm bài hỗ trợ:
   - Hút bể phốt xe vào ngõ sâu tại Hạ Long
   - Thông tắc cống không đục phá tại nhà dân Quảng Ninh
   - Xử lý mùi hôi nhà vệ sinh mùa nồm ẩm
   - Dấu hiệu bể phốt đầy ở nhà hàng, khách sạn Bãi Cháy
3. Ảnh SEO phải lấy từ `Ảnh cung cấp`, tối ưu sang `Ảnh Đã Xử Lý SEO`, không dùng poster quảng cáo làm ảnh bài viết.

### Giai đoạn 5 - Đo lường

1. Sau khi sửa P0, chạy lại audit NAP/social và lưu report mới.
2. Kiểm tra sitemap, schema bằng Rich Results/Test Schema khi cần.
3. Theo dõi Google Search Console: index, query địa phương, CTR, trang tụt/tăng sau đổi schema.
4. Chỉ đánh dấu `Fixed` khi đã có bằng chứng public HTML hoặc API chính thức.

## Việc tiếp theo nên làm

Thực hiện P0: chốt NAP gốc và sửa `ttcqn-doorway-schema` để loại schema trang chủ bị trùng, xóa Facebook group khỏi `sameAs`, đồng bộ Facebook/YouTube/TikTok/hotline trong JSON-LD.
