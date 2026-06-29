# Quy trình Image SEO bắt buộc cho bài SEO địa phương

Ngày áp dụng: 2026-05-06  
Website: `thongtaccongquangninh.com`

## Quy tắc gốc

Sau khi viết bất kỳ bài SEO địa phương nào, Codex/Agent bắt buộc phải tạo task ảnh SEO và gọi bước ChatGPT/Image Agent thiết kế ảnh trước khi hoàn thành bài.


Nếu chưa tạo được ảnh, trạng thái bắt buộc là:

```text
PENDING_IMAGE_SEO
```

## Khuyến nghị ảnh SEO

Nguồn ảnh mặc định:

- Chọn ảnh gốc phù hợp nội dung trong `D:\.thongtaccongquangninh\Ảnh cung cấp`.
- Sau khi tối ưu SEO, lưu ảnh thành phẩm vào `D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO`.
- Chỉ upload/chèn WordPress từ ảnh đã tối ưu trong thư mục `Ảnh Đã Xử Lý SEO`, trừ khi Tuyền chỉ định nguồn khác.


Nếu tái sử dụng ảnh nguồn, nên tạo biến thể riêng cho từng bài:

- Đổi tên file theo keyword/dịch vụ/địa phương của bài, không dấu, dùng dấu `-`.
- Viết alt text mới theo ngữ cảnh đoạn văn chứa ảnh.
- Viết caption mới, đúng dịch vụ, địa phương và bối cảnh; chỉ ghi là ảnh thực tế khi đã có căn cứ xác nhận.
- Xóa EXIF cũ khi xuất ảnh; chỉ thêm geotag khi có căn cứ.
- Crop nhẹ hoặc đổi khung hình 10-15%.
- Chỉnh sáng/tương phản/filter nhẹ.
- Thêm text overlay/watermark nhỏ theo địa danh/cam kết, không biến ảnh thành poster quảng cáo.
- Xuất WebP/JPG tối ưu dung lượng.

Trước khi publish/nghiệm thu ảnh SEO, chạy audit:

```powershell
python tools/audit_unique_wp_images.py
```

Tool mặc định chỉ đọc và tạo report. Chỉ dùng `--fix` khi Tuyền duyệt sửa live rõ ràng.

Nếu thiếu ảnh, báo cụ thể chủ đề cần bổ sung, ví dụ:

```text
Bài này thiếu 2 hình về thông tắc cống tại nhà dân ở Hạ Long.
Bài này thiếu 1 hình kiểm tra hố ga khu bếp nhà hàng tại Bãi Cháy.
```

## 8 bước sau khi viết bài

### Bước 1: Xác định thông tin bài

- URL bài viết.
- Từ khóa chính.
- Dịch vụ chính.
- Địa phương SEO.
- Phường/xã/khu vực phụ.
- Search intent.
- Case study trong bài.

### Bước 2: Xác định loại ảnh cần dùng

| --- | --- | --- |
| Hút bể phốt | Xe bồn, ống hút, hố ga, bể phốt, thợ kéo ống | Ảnh chỉ có máy lò xo trong nhà vệ sinh |
| Thông tắc bồn cầu | Bồn cầu, máy lò xo, nhà vệ sinh, thợ kiểm tra xả nước | Ảnh xe bồn, ảnh hố ga công nghiệp |
| Thông tắc chậu rửa | Chậu rửa, tủ bếp, ống thoát, thợ xử lý dưới lavabo/bồn rửa | Ảnh bể phốt, xe bồn |
| Nạo vét hố ga | Hố ga, nắp cống, bùn thải, xe hút, ống hút | Ảnh bồn cầu trong nhà vệ sinh |
| Trang chủ | Đội xe, đội thợ, xe bồn, ảnh thương hiệu, ảnh thi công đa dịch vụ | Ảnh quá bẩn hoặc quá hẹp làm ảnh hero |

### Bước 3: Tạo Image Brief

Mỗi bài cần tối thiểu:

- 1 ảnh đầu bài.
- 1 ảnh case study.
- 1 ảnh quy trình thi công.
- 1 ảnh CTA/niềm tin nếu có.
- 1 ảnh bổ sung nếu bài dài.

### Bước 4: Gọi ChatGPT/Image Agent thiết kế ảnh

Gửi đầy đủ Image Brief theo format chuẩn ở cuối file này.

### Bước 5: Nhận ảnh và metadata

Mỗi ảnh phải có:

- Tên file không dấu.
- Alt text.
- Caption.
- Trang sử dụng.
- Vị trí chèn trong bài.
- Ghi chú nguồn ảnh nếu cần.

### Bước 6: Chèn ảnh vào bài

Vị trí chèn ảnh:

- Ảnh 1: sau mở bài.
- Ảnh 2: trong phần khu vực phục vụ.
- Ảnh 3: trong phần case study.
- Ảnh 4: trong phần quy trình.
- Ảnh 5: trước CTA cuối bài.

### Bước 7: Kiểm tra SEO ảnh

- [ ] Tên file không dấu.
- [ ] Có keyword hoặc dịch vụ trong tên file.
- [ ] Có địa phương trong tên file nếu phù hợp.
- [ ] Alt text chứa dịch vụ + địa phương.
- [ ] Caption đúng bối cảnh.
- [ ] Ảnh đúng intent bài viết.
- [ ] Chỉ ghi ảnh là thực tế khi đã có căn cứ xác nhận.
- [ ] Nếu ảnh tái sử dụng từ nguồn cũ, đã tạo biến thể riêng bằng crop/filter/overlay và tên file/alt/caption mới.
- [ ] Đã xóa EXIF cũ khi xuất ảnh.
- [ ] Ảnh được nén WebP/JPG.

Gate kỹ thuật trong `tools/check_image_seo_gate.mjs` sẽ chặn nếu:

- Thiếu ảnh đầu bài, ảnh case study hoặc ảnh quy trình.
- Ảnh không phải `.webp`, `.jpg`, `.jpeg`.
- Thiếu `fileSizeKb` hoặc `filePath` để kiểm tra dung lượng.
- Metadata đánh dấu lộ thông tin riêng tư, lộ mặt khách chưa có phép, poster quảng cáo, hoặc reuse/trùng 100% với trang khác.

### Bước 8: Báo cáo task ảnh

Báo cáo phải có:

- Ảnh đã tạo.
- Ảnh đã chèn vào bài.
- Alt text.
- Caption.
- Vị trí chèn.
- TODO còn lại nếu thiếu ảnh thật.

## Caption ảnh

Caption nên bám đúng dịch vụ, địa phương và bối cảnh ảnh. Chỉ ghi ảnh là thực tế khi đã có căn cứ xác nhận.

Ví dụ:

```text
Thợ xử lý [dịch vụ] tại [khu vực], [địa phương]
```

```text
Đội xe xử lý [dịch vụ] tại [địa phương]
```

```text
Kiểm tra hệ thống thoát nước trước khi báo phương án thi công
```

## Format Image Brief gửi ChatGPT/Image Agent

```markdown
# IMAGE BRIEF SEO LOCAL

## 1. Thông tin bài viết
- URL:
- Từ khóa chính:
- Dịch vụ:
- Địa phương:
- Khu vực/phường/xã phụ:
- Search intent:
- Loại trang: dịch vụ / landing page / blog / trang phường

## 2. Nội dung bài
- Tóm tắt bài:
- Case study chính:
- Nỗi đau khách hàng:
- CTA chính:

## 3. Ảnh cần tạo
Tạo bộ 3-5 ảnh SEO cho bài này.

Ảnh 1 - Ảnh đầu bài:
- Mục đích:
- Bối cảnh:
- Nhân vật:
- Thiết bị:
- Địa phương cần thể hiện:
- Tỉ lệ ảnh:

Ảnh 2 - Ảnh case study:
- Mục đích:
- Bối cảnh:
- Công việc đang làm:
- Thiết bị:
- Địa phương/khu vực:
- Tỉ lệ ảnh:

Ảnh 3 - Ảnh quy trình thi công:
- Mục đích:
- Bối cảnh:
- Công việc đang làm:
- Thiết bị:
- Tỉ lệ ảnh:

Ảnh 4 - Ảnh niềm tin/đội xe/thương hiệu:
- Mục đích:
- Bối cảnh:
- Tỉ lệ ảnh:

Ảnh 5 - Ảnh CTA nếu cần:
- Mục đích:
- Bối cảnh:
- Tỉ lệ ảnh:

## 4. Yêu cầu phong cách ảnh
- Ảnh thực tế, tự nhiên, giống ảnh chụp điện thoại.
- Ưu tiên cảm giác thi công thật, có thiết bị, có thợ, có bối cảnh công trình.
- Nếu dùng ảnh AI/chỉnh sửa thì caption phải ghi là ảnh minh họa.

## 5. Metadata cần trả về
Với mỗi ảnh, trả về:
- Tên file:
- Alt text:
- Caption:
- Trang sử dụng:
- Vị trí chèn:
- Ghi chú:
```

## File bắt buộc trong repo

Mỗi bài địa phương phải có:

- `image-briefs/<slug>-image-brief.md`
- `image-briefs/<slug>-image-brief.json`
- `image-briefs/<slug>-image-package.json` sau khi nhận ảnh

Nếu chưa có package ảnh hợp lệ, bài vẫn ở `PENDING_IMAGE_SEO`.

Package ảnh tối thiểu:

```json
{
  "status": "READY_FOR_REVIEW",
  "slug": "thong-tac-cong-bai-chay",
  "service": "thông tắc cống",
  "area": "Bãi Cháy",
  "sourceType": "ai",
  "images": [
    {
      "fileName": "thong-tac-cong-bai-chay-anh-dau-bai.webp",
      "altText": "Thông tắc cống tại Bãi Cháy cho nhà hàng và hộ kinh doanh",
      "caption": "Thông tắc cống tại Bãi Cháy, xử lý nhanh bằng máy lò xo",
      "pageUrl": "https://thongtaccongquangninh.com/thong-tac-cong-bai-chay/",
      "placement": "sau mở bài",
      "note": "ai",
      "fileSizeKb": 280,
      "reusedAcrossPages": 1,
      "privacyOk": true,
      "containsPrivateInfo": false,
      "customerFaceVisible": false,
      "faceConsent": false,
      "isPoster": false
    }
  ]
}
```

## Lệnh bắt buộc

Tạo Image Brief:

```powershell
node .\tools\create_image_seo_brief.mjs <file-md>
```

Kiểm tra gate ảnh SEO:

```powershell
node .\tools\check_image_seo_gate.mjs <file-md-or-slug>
```
