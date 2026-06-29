# Báo cáo xử lý lập chỉ mục Google Search Console - 2026-06-12

## 1. Tình trạng trong Search Console

Ảnh GSC Tuyền gửi đang có các nhóm không lập chỉ mục:

- Trang có lệnh chuyển hướng: 18 URL.
- Trang trùng lặp, người dùng chưa chọn trang chính tắc: 1 URL.
- Đã phát hiện thấy - hiện chưa được lập chỉ mục: 68 URL.
- Không tìm thấy 404: 10 URL.
- Bị chặn bằng robots.txt: 1 URL.
- Đã thu thập dữ liệu - hiện chưa được lập chỉ mục: 1 URL.

## 2. Kết luận nguyên nhân sau audit live

### 2.1. 404 trong GSC là dữ liệu trễ, hiện live không còn 404 trong danh sách audit

Audit redirect/404 mới:

- Report: `reports/gsc-404-redirect-audit-2026-06-12T11-38-35.md`
- Kết quả: `404: 0 | redirect chain dài: 0 | redirect: 26`.

Đối chiếu với report cũ ngày 2026-06-03, các URL 404 cũ đã được chuyển hướng về trang đúng. GSC vẫn hiển thị 10 URL 404 vì báo cáo Coverage cập nhật chậm theo lần Googlebot crawl lại.

### 2.2. Robots.txt không chặn sitemap hoặc trang dịch vụ chính

Robots live:

```txt
User-agent: *
Allow: /
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Sitemap: https://thongtaccongquangninh.com/sitemap_index.xml
```

Không có luật chặn trang dịch vụ, bài viết hoặc sitemap. Mục "bị chặn bằng robots.txt" trong GSC nhiều khả năng là URL quản trị/tài nguyên cũ ngoài sitemap. Cần mở chi tiết dòng đó trong GSC để lấy URL chính xác nếu muốn xử lý riêng.

### 2.3. 68 URL "Đã phát hiện thấy - hiện chưa được lập chỉ mục" chủ yếu do sitemap từng phình bởi archive/category

Trước khi sửa:

- Sitemap index: 3 child sitemap.
- Tổng sitemap URL: 99.
- Sitemap-only: 12 URL category archive.
- Các category archive có trong sitemap nhưng không phải landing page SEO chính.

Các URL category archive làm Google phát hiện thêm nhiều URL ít giá trị, dễ bị đưa vào nhóm "Discovered - currently not indexed".

### 2.4. 1 nguy cơ trùng lặp/cannibalization ở cụm hút bể phốt

URL cạnh tranh:

- `https://thongtaccongquangninh.com/xe-hut-be-phot-quang-ninh-2026/`

URL chính cần ưu tiên:

- `https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/`

Bài `xe-hut-be-phot-quang-ninh-2026` vẫn có nội dung dày, nhưng cùng cụm intent với landing `hut-be-phot-quang-ninh`. Để giảm tín hiệu trùng lặp, bài này được giữ cho người dùng đọc nhưng chuyển sang `noindex, follow` và loại khỏi XML sitemap.

## 3. Việc đã khắc phục live

Plugin đã deploy:

- File local: `tools/wp-plugins/ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects.php`
- Version: `2026.06.12.1`
- Upload report: `WORDPRESS_SEO_CLEANUP_REDIRECTS_UPLOAD_2026-06-12T11-49-15-849Z.json`

Thay đổi đã áp dụng:

- Loại `category-sitemap.xml` khỏi `sitemap_index.xml`.
- Loại category URL khỏi XML sitemap nếu vẫn bị Rank Math render.
- Gắn `noindex, follow, max-image-preview:large` cho category archive.
- Gắn `noindex, follow, max-image-preview:large` cho bài cạnh tranh `xe-hut-be-phot-quang-ninh-2026`.
- Loại bài `xe-hut-be-phot-quang-ninh-2026` khỏi XML sitemap.
- Purge WP Rocket cache toàn site sau deploy.
- Sửa script upload để không báo `success` giả khi MCP trả lỗi plugin ZIP bên trong.

## 4. Bằng chứng kiểm tra sau sửa

### 4.1. Verify public live

Đã kiểm qua IP bypass/SNI + cache-buster:

- `/sitemap_index.xml?nowprocket=1&codex=indexfix3`
  - HTTP 200.
  - Không còn `category-sitemap.xml`.
  - Không có `xe-hut-be-phot-quang-ninh-2026`.
- `/category/hut-be-phot/?nowprocket=1&codex=indexfix3`
  - HTTP 200.
  - Robots: `noindex, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large`.
- `/xe-hut-be-phot-quang-ninh-2026/?nowprocket=1&codex=indexfix3`
  - HTTP 200.
  - Robots: `noindex, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large`.

### 4.2. Audit indexability sau sửa

Report mới:

- `reports/indexability-audit-2026-06-12T11-49-47.md`
- `reports/indexability-audit-2026-06-12T11-49-47.json`

Kết quả:

```json
{
  "sitemapIndexStatus": 200,
  "childSitemaps": 2,
  "sitemapUrls": 86,
  "restPublished": 87,
  "restOnly": 1,
  "sitemapOnly": 0,
  "sitemapRedirects": 0,
  "sitemapNot200": 0,
  "sitemapNoindex": 0,
  "sitemapCanonicalOther": 0,
  "sitemapThinContent": 0
}
```

`restOnly=1` là URL đã cố ý loại khỏi sitemap:

- `https://thongtaccongquangninh.com/xe-hut-be-phot-quang-ninh-2026/`

Không còn URL lỗi trong sitemap.

## 5. Plan tiếp theo trong Google Search Console

### P0 - Làm ngay trong GSC

1. Vào `Sơ đồ trang web`.
2. Submit lại:
   - `https://thongtaccongquangninh.com/sitemap_index.xml`
3. Vào từng nhóm lỗi:
   - `Không tìm thấy (404)`
   - `Trang có lệnh chuyển hướng`
   - `Đã phát hiện thấy - hiện chưa được lập chỉ mục`
4. Bấm `Xác thực bản sửa lỗi` cho nhóm 404 và redirect.

### P1 - Request indexing thủ công cho trang tiền chính

Ưu tiên kiểm tra URL và yêu cầu lập chỉ mục cho các trang:

- `https://thongtaccongquangninh.com/`
- `https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/`
- `https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/`
- `https://thongtaccongquangninh.com/thong-tac-bon-cau-quang-ninh/`
- `https://thongtaccongquangninh.com/nao-vet-ho-ga-quang-ninh/`
- `https://thongtaccongquangninh.com/xu-ly-mui-hoi-quang-ninh/`
- `https://thongtaccongquangninh.com/bang-gia/`
- `https://thongtaccongquangninh.com/lien-he/`

### P2 - Theo dõi sau 7-14 ngày

Nếu nhóm `Đã phát hiện thấy - hiện chưa được lập chỉ mục` vẫn cao:

- Xuất danh sách URL từ GSC.
- Đối chiếu URL nào còn nằm ngoài sitemap.
- Tăng internal link từ trang chủ, Blog, trang dịch vụ chính về URL tiền.
- Gộp/noindex/redirect các bài có intent trùng nhau.
- Không tạo thêm category/tag archive trong sitemap.

## 6. Lưu ý

Không thể ép Google lập chỉ mục ngay lập tức. Việc đã xử lý là dọn tín hiệu kỹ thuật để Googlebot thấy sitemap sạch, trang chính indexable, URL phụ/trùng được loại khỏi sitemap hoặc noindex rõ ràng.
