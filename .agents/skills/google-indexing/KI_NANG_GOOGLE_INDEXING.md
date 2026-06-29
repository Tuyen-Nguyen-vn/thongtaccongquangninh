---
name: google-indexing
description: Quy trình submit URL lên Google Index qua Rank Math Instant Indexing API cho thongtaccongquangninh.com. Sử dụng khi cần index nhanh bài mới, kiểm tra trạng thái indexing, hoặc re-index bài đã cập nhật.
---

# Kỹ năng Google Indexing — Gửi URL qua Rank Math Instant Indexing API

Kỹ năng này hướng dẫn quy trình submit URL lên Google Index thông qua Rank Math Instant Indexing API cho website `thongtaccongquangninh.com`.

## Khi nào sử dụng

- Vừa publish hoặc update bài trên WordPress
- Cần index nhanh landing page mới
- Kiểm tra trạng thái indexing của các URL
- Re-index hàng loạt sau khi cập nhật nội dung

## Thông tin kết nối

- **Website**: `https://thongtaccongquangninh.com`
- **WordPress User**: `chatgpt`
- **Auth**: Basic Auth (Base64 encoded `user:app-password`)
- **Script có sẵn**: `D:\.thongtaccongquangninh\tools\submit_google_index.mjs`

## Quy trình submit URL

### Bước 1: Chuẩn bị danh sách URL

Xác định các URL cần submit. Các URL phải:
- Bắt đầu bằng `https://thongtaccongquangninh.com/`
- Kết thúc bằng dấu `/`
- Đã publish (không phải draft)

### Bước 2: Gọi Rank Math Instant Indexing API

**Endpoint**: `POST /wp-json/rankmath/v1/in/submitUrls`

```javascript
const response = await fetch('https://thongtaccongquangninh.com/wp-json/rankmath/v1/in/submitUrls', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa('user:app-password')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ urls: ['https://thongtaccongquangninh.com/slug/'] }),
});
```

### Bước 3: Kiểm tra log

**Endpoint**: `GET /wp-json/rankmath/v1/in/getLog`

```javascript
const logRes = await fetch('https://thongtaccongquangninh.com/wp-json/rankmath/v1/in/getLog', {
  headers: { 'Authorization': `Basic ${auth}` },
});
const logData = await logRes.json();
```

### Bước 4: Lưu kết quả

Lưu file JSON kết quả với format: `SEO_GOOGLE_INDEX_YYYY-MM-DD.json`

```json
{
  "submittedAt": "2026-04-30T...",
  "urlCount": 45,
  "submitStatus": 200,
  "submitOk": true
}
```

## Sử dụng script có sẵn

Chạy script đã có trong workspace:

```bash
node D:\.thongtaccongquangninh\tools\submit_google_index.mjs
```

Script này sẽ:
1. Submit tất cả URL trong danh sách `ALL_URLS`
2. Kiểm tra log kết quả
3. Lưu file JSON vào workspace

## Cây quyết định

```
Cần index URL?
├── Bài mới vừa publish
│   → Thêm URL vào ALL_URLS trong script → Chạy script
├── Bài cũ vừa update nội dung
│   → URL đã có trong script → Chạy lại script để re-index
├── Kiểm tra trạng thái
│   → Gọi GET /wp-json/rankmath/v1/in/getLog
└── Index hàng loạt sau khi optimize
    → Chạy script full (submit tất cả URL)
```

## Thêm URL mới vào script

Khi có bài mới, thêm URL vào mảng `ALL_URLS` trong file `tools/submit_google_index.mjs`:

```javascript
const ALL_URLS = [
  // ... existing URLs
  `${SITE}/slug-bai-moi/`,  // ← Thêm ở đây
];
```

## Lưu ý quan trọng

- ⚠️ Rank Math Instant Indexing có giới hạn quota hàng ngày
- ⚠️ Chỉ submit URL đã publish, không submit draft
- ⚠️ Không spam submit quá nhiều lần trong ngày
- ⚠️ Kiểm tra HTTP status 200 để xác nhận submit thành công
- ⚠️ Nếu status khác 200, kiểm tra lại App Password và quyền user

## Quality Gate

Sau khi submit:

- [ ] HTTP status trả về 200?
- [ ] File JSON kết quả đã được lưu?
- [ ] Log xác nhận URL đã được gửi?
- [ ] Nếu lỗi — đã ghi rõ nguyên nhân và cách fix?
