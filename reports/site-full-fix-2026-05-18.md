# Site Full Fix Log — 2026-05-18

Phiên audit + fix toàn site theo plan `documentation-index-optimized-sedgewick.md`.

## Tóm tắt audit (xem [site-full-audit-2026-05-18.md](site-full-audit-2026-05-18.md))

- **51 URL published** (42 page + 9 post) — 50 fetch OK, 1 lỗi 404
- **50/51 page có schema** đầy đủ (LocalBusiness + Org + WebSite + Breadcrumb + WebPage + Article) — Rank Math đã làm tốt
- **4 broken internal link** phát hiện
- **Meta home dài 178 ký tự** (vượt 165)
- **10 footer variants** (41 page dùng cùng footer chính → consistent với non-home; home + 8 blog post mỗi cái 1 variant do widget gắn vào content)

## Đã fix

### 1. Footer link gãy (`page-home-direct.php`)

Backup: `backups/2026-05-18/page-home-direct.php.bak`

| Line | Old | New |
|------|-----|-----|
| 6249 | `<a href="/hut-be-phot-tien-yen/">` (area-card) | **Xóa** — page chưa tồn tại |
| 6529 | `<a href="/hut-be-phot-tien-yen/">` (footer link Tiên Yên) | **Xóa** |
| 6542 | `<a href="/ve-chung-toi/">Giới thiệu</a>` | `<a href="/gioi-thieu/">Giới thiệu</a>` |

Deploy: `ttcqn-home-emergency-renderer.zip` qua MCP `plugins/upload-base64` lúc 2026-05-18 → activated.

Verify live: `curl https://thongtaccongquangninh.com/` không còn `/ve-chung-toi/`, `/hut-be-phot-tien-yen/`. Link `/gioi-thieu/` xuất hiện đúng 1 lần.

### 2. Meta description trang chủ (Rank Math REST)

Backup: `seo-revisions/wp-before-home-meta-2026-05-18/pages-23-trang-chu.json`

- **Old** (178 ký tự): `Trang chủ Môi Trường Đô Thị Số 1 Quảng Ninh. Dịch vụ hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi tại Quảng Ninh. Gọi 0963.953.533 / 0931.156.756.`
- **New** (143 ký tự): `Hút bể phốt, thông tắc cống, bồn cầu, hố ga tại Quảng Ninh. Có mặt 15-30 phút, báo giá trước, không phát sinh. Gọi 0963.953.533 / 0931.156.756.`
- Title cũng update: `Hút bể phốt, thông tắc cống Quảng Ninh 24/7 — có mặt 15-30 phút`

Verify live: `<meta name="description">` đã = new value.

### 3. Submit Google Index (Rank Math Instant Indexing)

Tool: `tools/submit_google_index.mjs` (rewrite để đọc động từ `reports/url-inventory-*.json`)

- **50 URL** submitted thành công
- Status 200, response: `Successfully submitted 50 URLs.`
- Output log: `SEO_GOOGLE_INDEX_2026-05-18.json`

## Chưa fix — cần Tuyền thao tác

### 1. Post 1377 `cau-hoi-thuong-gap-thong-tac-cong-qn` trả 404

- WP REST publish OK (`status=publish`, `link` đúng) nhưng frontend URL trả 404.
- Nguyên nhân: rewrite rule cho post này không tồn tại trong DB.
- Cách fix duy nhất: **WP Admin → Settings → Permalinks → click "Save Changes"** (không cần đổi gì) để flush rewrite rules.
- MCP từ chối edit option `rewrite_rules` (protected for security).
- Sau khi flush, link FAQ từ 7 page non-home (`/cau-hoi-thuong-gap-thong-tac-cong/` → 301 → `/-qn/`) sẽ hoạt động.

### 2. Link `/hanh-trinh-10-nam-bao-ve-moi-truong-quang-ninh` trên home (404)

- Class CSS `ai-pr-cta-btn` không có trong source local — đến từ widget/plugin chưa được sync về local (có thể là content trực tiếp trong Elementor editor của trang chủ).
- Đề xuất: Tuyền vào Elementor editor trang chủ → tìm section có nút "Xem hành trình 10 năm" → đổi link hoặc xóa nút.
- Hoặc tạo URL `/hanh-trinh-10-nam-bao-ve-moi-truong-quang-ninh/` (page giới thiệu).

### 3. Phase A.3 responsive check (Chrome MCP)

- Defer sang phiên sau. Audit hiện chỉ check viewport meta (50/51 page có) → responsive về cơ bản OK.
- Việc visual test desktop vs mobile cho 8 URL đại diện nên làm khi có thay đổi UI lớn.

## Files changed

- `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php` (3 edits)
- `tools/submit_google_index.mjs` (rewrite — đọc động từ inventory)
- `tools/audit_site_full.mjs` (mới)
- `tools/update_home_meta.mjs` (mới)
- `reports/url-inventory-2026-05-18.json` (mới)
- `reports/site-full-audit-2026-05-18.md` (mới)
- `reports/site-full-audit-2026-05-18.json` (mới)
- `SEO_GOOGLE_INDEX_2026-05-18.json` (mới)
- `backups/2026-05-18/page-home-direct.php.bak`
- `backups/2026-05-18/submit_google_index.mjs.bak`
- `seo-revisions/wp-before-home-meta-2026-05-18/pages-23-trang-chu.json`

## Việc tiếp theo nên làm

Tuyền vào **WP Admin → Settings → Permalinks → Save Changes** để flush rewrite rules → fix post 1377 và đường link FAQ trên 7 page non-home (cả 2 vấn đề cùng giải quyết bởi 1 thao tác này).
