# Hướng dẫn Setup Google APIs cho thongtaccongquangninh.com

## Bước 1 — Tạo Google Cloud Project

1. Vào [console.cloud.google.com](https://console.cloud.google.com)
2. Tạo project mới: tên `thongtaccongquangninh-seo`
3. Bật các APIs sau (vào "APIs & Services → Library"):
   - **Google Search Console API**
   - **Indexing API**
   - **PageSpeed Insights API**
   - **Google Analytics Data API**
   - **Custom Search JSON API** *(tuỳ chọn)*

---

## Bước 2 — Tạo OAuth Client (cho Search Console + GA4)

1. Vào "APIs & Services → Credentials"
2. Click "+ Create Credentials → OAuth client ID"
3. Application type: **Desktop app**
4. Tải file JSON → đổi tên thành `oauth_credentials.json`
5. Đặt file vào: `secrets/oauth_credentials.json`
6. Vào "OAuth consent screen" → thêm email `hutbephothalong@gmail.com` vào **Test users**

---

## Bước 3 — Tạo Service Account (cho Indexing API)

1. Vào "APIs & Services → Credentials"
2. Click "+ Create Credentials → Service account"
3. Đặt tên: `indexing-bot`
4. Sau khi tạo xong → click vào service account → tab "Keys" → "Add key → Create new key (JSON)"
5. Tải file JSON → đổi tên thành `indexing_service_account.json`
6. Đặt file vào: `secrets/indexing_service_account.json`
7. **Quan trọng:** Thêm email của service account (dạng `indexing-bot@...iam.gserviceaccount.com`) vào Google Search Console với quyền Owner

---

## Bước 4 — Tạo API Key (cho PageSpeed Insights)

1. Vào "APIs & Services → Credentials"
2. Click "+ Create Credentials → API key"
3. Giới hạn key: chỉ cho phép "PageSpeed Insights API"
4. Thêm vào `.env`:

```
PAGESPEED_API_KEY=AIza...
```

---

## Bước 5 — Lấy GA4 Property ID

1. Vào [analytics.google.com](https://analytics.google.com)
2. Chọn property của thongtaccongquangninh.com
3. Vào "Admin → Property → Property details" → copy **Property ID** (dạng số, vd: `312345678`)
4. Thêm vào `.env`:

```
GA4_PROPERTY_ID=312345678
```

---

## Bước 6 — Chạy thử

### PageSpeed (không cần OAuth, chỉ cần API key):
```bash
python tools/seo_weekly_report.py --pagespeed-only
```

### Báo cáo đầy đủ (cần OAuth):
```bash
python tools/seo_weekly_report.py
```
Lần đầu sẽ mở trình duyệt để đăng nhập — đăng nhập bằng `hutbephothalong@gmail.com`.

### Push 1 URL lên Google Index:
```bash
node tools/google_indexing_direct.mjs https://thongtaccongquangninh.com/bai-viet/ten-bai/
```

### Push nhiều URLs:
```bash
node tools/google_indexing_direct.mjs --file reports/new-urls.txt
```

---

## Cài đặt Python packages

```bash
pip install google-api-python-client google-auth-oauthlib google-analytics-data
```

---

## Cấu trúc secrets/ (tất cả đều gitignored)

```
secrets/
├── oauth_credentials.json          # OAuth client (Search Console, GA4)
├── indexing_service_account.json   # Service Account (Indexing API)
├── token_*.json                    # Token tự động tạo sau lần xác thực đầu
└── .gitkeep
```

---

## Quota & Giới hạn

| API | Giới hạn miễn phí |
|---|---|
| PageSpeed Insights | 25.000 req/ngày |
| Search Console API | 1.200 req/phút |
| Indexing API | 200 URL/ngày |
| GA4 Data API | 200.000 token/ngày |
| Custom Search JSON | 100 req/ngày (free tier) |

---

## Business Profile API (cần xin allowlist riêng)

Google Business Profile API **không mở public** — phải điền form xin quyền:
[Xin quyền Business Profile API](https://developers.google.com/my-business/content/prereqs)

Chờ 1–2 tuần Google duyệt. Sau khi được duyệt mới viết code `tools/gbp_sync.py`.
