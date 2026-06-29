# Kế hoạch tích hợp YouTube SEO cho thongtaccongquangninh.com

Ngày audit: 2026-05-30  
Phạm vi: website `https://thongtaccongquangninh.com`, inventory `wp-url-audit-list.json` tạo lúc 2026-05-28, kiểm public HTML bằng cache-buster `?nowprocket=1&codex=yt-audit-20260530`.

## Cập nhật triển khai 2026-05-30

- Đã sửa plugin `TTCQN Service Schema` lên version `2026.05.30.2`.
- Đã chặn `VideoObject` Rank Math tự kéo metadata YouTube có brand/hotline không đúng.
- Đã bổ sung `VideoObject` chuẩn **Môi Trường Đô Thị Số 1 Quảng Ninh** cho:
  - `/hut-be-phot-quang-ninh/`
  - `/thong-tac-cong-quang-ninh/`
- Verify live bằng cache-buster `?nowprocket=1&codex=yt-hotline-fix2-20260530`:
  - Trang chủ: không còn `0981.306.307`, không còn `Môi Trường Đông Bắc`, còn 1 `VideoObject` MP4 nội bộ đúng hotline **0963.953.533**.
  - `/hut-be-phot-quang-ninh/`: không còn `0981.306.307`, không còn `Môi Trường Đông Bắc`, còn 1 `VideoObject` đúng **0963.953.533 / 0931.156.756**.
  - `/thong-tac-cong-quang-ninh/`: không còn `0981.306.307`, không còn `Môi Trường Đông Bắc`, còn 1 `VideoObject` đúng **0963.953.533 / 0931.156.756**.

## 1. Kết luận nhanh

- Website có **77 URL public**, trong đó **38 landing local**. Nhóm nên ưu tiên gắn video là trang dịch vụ tiền và bài hướng dẫn có intent gọi thợ.
- Kênh YouTube tìm thấy từ footer/plugin: `https://www.youtube.com/@hutbephothalong14`. Khi kiểm oEmbed, video lại trả về author `Môi Trường Đông Bắc - Hút Bể Phốt` và handle `https://www.youtube.com/@moitruongdongbac`.
- Chỉ tìm được 3 video đang dùng/phù hợp trực tiếp:
  - `vcVjDZLV_O0`: tổng quan hút bể phốt/thông tắc cống Quảng Ninh.
  - `oWFUTKj4O18`: thông tắc cống Quảng Ninh 24/7.
  - `52u9a3u86uk`: xử lý mùi hôi/cống thoát nước tại Hải Phòng.
- Lỗi cần sửa trước khi triển khai: tiêu đề/mô tả video YouTube đang có **hotline 0981.306.307** và brand `Môi Trường Đông Bắc`. Đây **không phải hotline chuẩn của khu vực Quảng Ninh trong dự án này**. Chuẩn phải dùng là **0963.953.533 / 0931.156.756** cho `thongtaccongquangninh.com`. Không được nhúng mở rộng các video này cho tới khi metadata YouTube được sửa hoặc phần hiển thị trên website đã thay bằng nội dung/hotline đúng.

## 2. Trạng thái nhúng video hiện tại

| URL | Video hiện có | VideoObject schema | Nhận xét |
|---|---:|---:|---|
| `/` | Không thấy iframe YouTube | Có `VideoObject` | Schema video đang có nhưng frontend không có iframe tương ứng. Cần đồng bộ hoặc bỏ schema nếu không hiển thị video. |
| `/hut-be-phot-quang-ninh/` | `vcVjDZLV_O0` | Chưa thấy | Đã có iframe lazy-load, thiếu `VideoObject`. |
| `/thong-tac-cong-quang-ninh/` | `oWFUTKj4O18` | Có | Đúng nhóm dịch vụ, cần rà schema khớp metadata mới sau khi sửa YouTube. |
| `/hut-be-phot-ha-long/` | Chưa có | Chưa có | Nên dùng video tổng quan Quảng Ninh nếu chưa có video Hạ Long riêng. |
| `/thong-tac-bon-cau-ha-long/` | Chưa có | Chưa có | Chưa có video bồn cầu riêng, nên chờ quay video hoặc dùng video tổng quan có giới hạn. |
| `/nao-vet-ho-ga-quang-ninh/` | Chưa có | Chưa có | Không nên gắn video không đúng hố ga. Cần quay video mới. |
| `/xu-ly-mui-hoi-quang-ninh/` | Chưa có | Chưa có | Có thể dùng `52u9a3u86uk` sau khi sửa brand/hotline, vì video đang là Hải Phòng. |
| `/xu-ly-mui-hoi-nha-ve-sinh/` | Chưa có | Chưa có | Có thể dùng `52u9a3u86uk` nếu mô tả đặt rõ là quy trình xử lý mùi/thoát nước. |
| `/thong-tac-bon-cau-bi-tac/` | Chưa có | Chưa có | Cần video bồn cầu riêng; không nên dùng video cống nếu không có đoạn bồn cầu rõ. |
| `/cam-nang-thong-tac-cong-tai-ha-long/` | Chưa có | Chưa có | Có thể dùng `oWFUTKj4O18`, đặt sau phần nguyên nhân hoặc quy trình. |

## 3. Ma trận triển khai ưu tiên

| Ưu tiên | Trang | Video đề xuất | Vị trí chèn | Tiêu đề hiển thị | CTA |
|---:|---|---|---|---|---|
| 1 | `/hut-be-phot-quang-ninh/` | `vcVjDZLV_O0` | Giữ video hiện có, bổ sung schema ngay sau block video hoặc qua plugin schema | Video quy trình hút bể phốt tại Quảng Ninh | Gọi ngay **0963.953.533** |
| 1 | `/thong-tac-cong-quang-ninh/` | `oWFUTKj4O18` | Giữ sau phần nguyên nhân/quy trình, kiểm lại schema | Đội thợ thông tắc cống Quảng Ninh xử lý nhanh trong ngày | Gọi ngay **0963.953.533** |
| 2 | Trang chủ `/` | `vcVjDZLV_O0` | Sau phần giới thiệu dịch vụ, không đặt ngay hero nếu làm nặng LCP | Video giới thiệu dịch vụ môi trường Quảng Ninh 24/7 | Gọi **0963.953.533** / Zalo **0931.156.756** |
| 2 | `/hut-be-phot-ha-long/` | `vcVjDZLV_O0` | Sau H2 nguyên nhân hoặc trước bảng giá | Xe hút bể phốt phục vụ Hạ Long - Quảng Ninh | Gọi **0963.953.533** |
| 2 | `/cam-nang-thong-tac-cong-tai-ha-long/` | `oWFUTKj4O18` | Sau H2 nguyên nhân đặc thù tại Hạ Long | Quy trình thông tắc cống không đục phá tại Hạ Long | Xem bảng giá / Gọi **0963.953.533** |
| 3 | `/xu-ly-mui-hoi-quang-ninh/` | Chỉ dùng `52u9a3u86uk` sau khi sửa metadata YouTube | Sau H2 nguyên nhân mùi hôi quay lại | Quy trình kiểm tra và xử lý mùi hôi cống thoát nước | Nhắn Zalo **0931.156.756** |
| 3 | `/xu-ly-mui-hoi-nha-ve-sinh/` | Chỉ dùng `52u9a3u86uk` sau khi sửa metadata YouTube | Sau phần tự kiểm tra trước khi gọi thợ | Cách đội thợ xử lý mùi hôi nhà vệ sinh và cống thoát | Gọi **0963.953.533** |
| 4 | `/thong-tac-bon-cau-ha-long/` | Cần quay mới | Sau H2 quy trình xử lý 5 bước | Quy trình xử lý bồn cầu bị tắc tại Hạ Long | Đặt lịch khảo sát |
| 4 | `/thong-tac-bon-cau-bi-tac/` | Cần quay mới | Sau H2 cách xử lý an toàn tại nhà | Quy trình thông tắc bồn cầu bị trào ngược | Gọi ngay **0963.953.533** |
| 4 | `/nao-vet-ho-ga-quang-ninh/` | Cần quay mới | Sau H2 đội thợ làm gì khi nạo vét hố ga | Quy trình nạo vét hố ga, xử lý bùn lắng tại Quảng Ninh | Đặt lịch khảo sát |

## 4. Nội dung đi kèm từng video

### Video `vcVjDZLV_O0`

- URL: `https://www.youtube.com/watch?v=vcVjDZLV_O0`
- Embed URL: `https://www.youtube.com/embed/vcVjDZLV_O0`
- Thumbnail: `https://i.ytimg.com/vi/vcVjDZLV_O0/hqdefault.jpg`
- Upload date: `2026-03-28T02:33:11-07:00`
- Dùng cho: trang chủ, `/hut-be-phot-quang-ninh/`, `/hut-be-phot-ha-long/`, các trang hút bể phốt địa phương chưa có video riêng.

Đoạn mô tả nên đặt dưới video:

> Video giúp khách xem nhanh cách đội thợ tiếp nhận ca hút bể phốt, thông tắc cống tại Quảng Ninh, từ kiểm tra hiện trạng đến chọn xe bồn hoặc máy lò xo phù hợp. Nếu nhà có mùi hôi, nước trào hoặc bể phốt đầy, gọi **0963.953.533** để được hỗ trợ 24/7.

### Video `oWFUTKj4O18`

- URL: `https://www.youtube.com/watch?v=oWFUTKj4O18`
- Embed URL: `https://www.youtube.com/embed/oWFUTKj4O18`
- Thumbnail: `https://i.ytimg.com/vi/oWFUTKj4O18/hqdefault.jpg`
- Upload date: `2026-04-29T08:59:55-07:00`
- Dùng cho: `/thong-tac-cong-quang-ninh/`, `/cam-nang-thong-tac-cong-tai-ha-long/`, `/thong-tac-cong-ha-long/`, `/thong-tac-cong-cam-pha/`, `/thong-tac-cong-uong-bi/` nếu chưa có video local riêng.

Đoạn mô tả nên đặt dưới video:

> Video minh họa cách đội thợ kiểm tra đường cống, xác định điểm nghẹt và xử lý bằng thiết bị phù hợp để hạn chế đục phá. Với cống bếp, cống nhà tắm hoặc đường thoát nước bị trào tại Quảng Ninh, gọi **0963.953.533** để được hỏi nhanh tình trạng và điều thợ gần nhất.

### Video `52u9a3u86uk`

- URL: `https://www.youtube.com/watch?v=52u9a3u86uk`
- Embed URL: `https://www.youtube.com/embed/52u9a3u86uk`
- Thumbnail: `https://i.ytimg.com/vi/52u9a3u86uk/hqdefault.jpg`
- Upload date: `2026-04-29T09:49:00-07:00`
- Dùng cho: `/xu-ly-mui-hoi-quang-ninh/`, `/xu-ly-mui-hoi-nha-ve-sinh/`, landing Hải Phòng nếu có.

Đoạn mô tả nên đặt dưới video:

> Video cho thấy quy trình kiểm tra nguồn mùi từ cống thoát nước, hố ga hoặc khu vệ sinh trước khi chọn phương án xử lý. Nếu mùi hôi quay lại sau khi xịt khử mùi hoặc đổ hóa chất, gọi **0963.953.533** để kỹ thuật kiểm tra đúng nguyên nhân.

## 5. Iframe chuẩn dùng trên website

Áp dụng mỗi trang 1 video chính. Không autoplay. Có lazy-load, responsive và title rõ.

```html
<section class="ttcqn-video-block" aria-labelledby="video-quy-trinh-hut-be-phot">
  <h2 id="video-quy-trinh-hut-be-phot">Video quy trình hút bể phốt tại Quảng Ninh</h2>
  <p>Khách có thể xem nhanh cách đội thợ kiểm tra hiện trạng, chọn thiết bị và xử lý bể phốt đầy hoặc cống trào tại Quảng Ninh.</p>
  <div class="ttcqn-video-frame">
    <iframe
      src="https://www.youtube.com/embed/vcVjDZLV_O0"
      title="Video quy trình hút bể phốt tại Quảng Ninh"
      loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen></iframe>
  </div>
  <p class="ttcqn-video-note">Cần hút bể phốt hoặc thông tắc cống tại Quảng Ninh? Gọi ngay <strong>0963.953.533</strong> để được hỗ trợ 24/7.</p>
  <div class="ttcqn-video-cta">
    <a href="tel:0963953533">Gọi ngay 0963.953.533</a>
    <a href="https://zalo.me/0931156756" rel="nofollow noopener">Nhắn Zalo 0931.156.756</a>
    <a href="/bang-gia/">Xem bảng giá</a>
  </div>
</section>
```

CSS gợi ý nếu cần bổ sung vào component/plugin hiện có:

```css
.ttcqn-video-block {
  margin: 28px 0;
}
.ttcqn-video-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, .14);
  background: #111827;
}
.ttcqn-video-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
.ttcqn-video-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.ttcqn-video-cta a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #0f766e;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
}
```

## 6. VideoObject schema mẫu

Chỉ thêm schema nếu video thật sự hiển thị trên trang. Không dùng schema trên trang chủ nếu không có iframe/video preview visible.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Video quy trình hút bể phốt tại Quảng Ninh",
  "description": "Video minh họa quy trình đội thợ tiếp nhận, kiểm tra và xử lý hút bể phốt, thông tắc cống tại Quảng Ninh. Liên hệ 0963.953.533 để được hỗ trợ 24/7.",
  "thumbnailUrl": [
    "https://i.ytimg.com/vi/vcVjDZLV_O0/hqdefault.jpg"
  ],
  "uploadDate": "2026-03-28T02:33:11-07:00",
  "embedUrl": "https://www.youtube.com/embed/vcVjDZLV_O0",
  "contentUrl": "https://www.youtube.com/watch?v=vcVjDZLV_O0",
  "publisher": {
    "@type": "Organization",
    "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
    "logo": {
      "@type": "ImageObject",
      "url": "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/logo-cong-ty-mobile-optimized.webp"
    }
  }
}
</script>
```

Schema cho video thông tắc cống:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Đội thợ thông tắc cống Quảng Ninh xử lý nhanh trong ngày",
  "description": "Video minh họa quy trình kiểm tra đường cống, xác định điểm nghẹt và xử lý không đục phá tại Quảng Ninh. Gọi 0963.953.533 để được hỗ trợ 24/7.",
  "thumbnailUrl": ["https://i.ytimg.com/vi/oWFUTKj4O18/hqdefault.jpg"],
  "uploadDate": "2026-04-29T08:59:55-07:00",
  "embedUrl": "https://www.youtube.com/embed/oWFUTKj4O18",
  "contentUrl": "https://www.youtube.com/watch?v=oWFUTKj4O18",
  "publisher": {
    "@type": "Organization",
    "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
    "logo": {
      "@type": "ImageObject",
      "url": "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/logo-cong-ty-mobile-optimized.webp"
    }
  }
}
```

Schema cho video xử lý mùi hôi:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Quy trình kiểm tra và xử lý mùi hôi cống thoát nước",
  "description": "Video minh họa cách kiểm tra nguồn mùi hôi từ cống thoát nước, hố ga hoặc khu vệ sinh trước khi xử lý. Gọi 0963.953.533 nếu mùi hôi quay lại nhiều lần.",
  "thumbnailUrl": ["https://i.ytimg.com/vi/52u9a3u86uk/hqdefault.jpg"],
  "uploadDate": "2026-04-29T09:49:00-07:00",
  "embedUrl": "https://www.youtube.com/embed/52u9a3u86uk",
  "contentUrl": "https://www.youtube.com/watch?v=52u9a3u86uk",
  "publisher": {
    "@type": "Organization",
    "name": "Môi Trường Đô Thị Số 1 Quảng Ninh",
    "logo": {
      "@type": "ImageObject",
      "url": "https://thongtaccongquangninh.com/wp-content/uploads/2026/05/logo-cong-ty-mobile-optimized.webp"
    }
  }
}
```

## 7. Gợi ý sửa tiêu đề và mô tả YouTube

### `vcVjDZLV_O0`

Tiêu đề hiện tại có brand `Môi Trường Đông Bắc`. Đề xuất:

`Hút bể phốt, thông tắc cống Quảng Ninh 24/7 | Môi Trường Đô Thị Số 1 Quảng Ninh`

Mô tả nên đổi:

```text
Môi Trường Đô Thị Số 1 Quảng Ninh hỗ trợ hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh 24/7.

Hotline Quảng Ninh: 0963.953.533
Zalo: 0931.156.756
Website: https://thongtaccongquangninh.com

Khu vực phục vụ: Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn và các khu vực lân cận.
```

### `oWFUTKj4O18`

Tiêu đề hiện có icon và hotline Zalo. Đề xuất:

`Thông tắc cống Quảng Ninh 24/7, không đục phá | Gọi 0963.953.533`

Mô tả nên thêm:

```text
Video minh họa quy trình kiểm tra và xử lý cống tắc tại Quảng Ninh bằng thiết bị phù hợp, ưu tiên hạn chế đục phá và báo phương án trước khi làm.

Hotline: 0963.953.533
Zalo: 0931.156.756
Website: https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/
```

### `52u9a3u86uk`

Tiêu đề hiện có hotline `0981.306.307`, đây là **sai với khu vực Quảng Ninh của dự án này**. Không dùng số này trên website. Đề xuất sửa:

`Xử lý mùi hôi cống thoát nước tại Hải Phòng - Quảng Ninh | Gọi 0963.953.533`

Mô tả nên đổi:

```text
Video ghi lại quy trình kiểm tra nguồn mùi từ cống thoát nước, hố ga và khu vệ sinh. Đội kỹ thuật xác định nguyên nhân trước khi xử lý để hạn chế tái phát.

Hotline Quảng Ninh: 0963.953.533
Zalo: 0931.156.756
Website: https://thongtaccongquangninh.com/xu-ly-mui-hoi-quang-ninh/
```

## 8. Bài SEO mới có thể tạo từ video

1. `Quy trình hút bể phốt Quảng Ninh bằng xe bồn: khi nào cần gọi thợ?`
2. `Cống thoát nước có mùi hôi: cách kiểm tra nguồn hôi trước khi xử lý`
3. `Thông tắc cống Hạ Long không đục phá: tình huống nhà hàng, khách sạn, nhà dân`
4. `Xe hút bể phốt vào ngõ sâu tại Hạ Long: cần chuẩn bị gì trước khi thợ đến?`
5. `Mùi hôi nhà vệ sinh sau mưa tại Quảng Ninh: nguyên nhân và cách xử lý`

## 9. Điều kiện trước khi triển khai live

- Xác nhận kênh `@hutbephothalong14` / `@moitruongdongbac` là kênh chính thức được phép dùng cho website này.
- Sửa tiêu đề, mô tả, hotline và link website trên YouTube để đồng nhất với **0963.953.533 / 0931.156.756**.
- Với trang chủ: hoặc thêm iframe/video preview visible, hoặc gỡ `VideoObject` nếu không hiển thị video.
- Với `/hut-be-phot-quang-ninh/`: bổ sung `VideoObject` cho `vcVjDZLV_O0`.
- Với các trang chưa có video đúng dịch vụ như bồn cầu/hố ga: quay video ngắn riêng trước khi nhúng, không dùng video sai intent.

## 10. Cập nhật kênh YouTube 2026-05-30

Đã chạy `tools/update_youtube_channel_branding.py --apply` bằng YouTube Data API.

Kết quả:

- Đã đổi mô tả kênh sang nội dung riêng cho **Môi Trường Đô Thị Số 1 Quảng Ninh**.
- Đã loại khỏi mô tả kênh các hotline ngoài Quảng Ninh như `0981.306.307` và `0939.89.35.37`.
- Mô tả kênh hiện chỉ dùng:
  - Hotline Quảng Ninh: **0963.953.533**
  - Zalo: **0931.156.756**
  - Website: `https://thongtaccongquangninh.com`

Giới hạn còn lại:

- API không đổi được tên kênh chính `Môi Trường Đông Bắc - Hút Bể Phốt`.
- Theo tài liệu `channels.update` của YouTube Data API, khi cập nhật `brandingSettings`, trường `brandingSettings.channel.title` phải giữ nguyên title hiện tại hoặc bỏ trống; đổi title chính phải làm trong YouTube Studio.
- oEmbed vì vậy vẫn trả `author_name: Môi Trường Đông Bắc - Hút Bể Phốt`, nhưng không còn trả hotline sai `0981.306.307`.

File bằng chứng:

- `reports/youtube-channel-branding-update-2026-05-30.json`
