# Sitewide SEO Audit Execution - 2026-06-03

## 1. P0 Recovery

- Site live bi HTTP 500 tren WordPress bootstrap: `/`, `/wp-json/`, `/sitemap_index.xml`, `/wp-login.php`.
- OnePanel MCP xac nhan hosting:
  - account: `yerdchtihosting`
  - WordPress path: `/home/yerdchtihosting/public_html`
  - domain: `thongtaccongquangninh.com`
- Nguyen nhan truc tiep: `list_wordpress_plugins` tra loi PHP parse error:
  - file: `/home/yerdchtihosting/public_html/wp-content/plugins/ttcqn-seo-contact-block/ttcqn-seo-contact-block.php`
  - loi: `unexpected character 0x00` tai line 192.
- Da backup plugin tren hosting:
  - `public_html/wp-content/plugins/ttcqn-seo-contact-block-backup-20260603-121712.zip`
- Da vo hieu hoa plugin bang cach doi ten thu muc:
  - tu `public_html/wp-content/plugins/ttcqn-seo-contact-block`
  - sang `public_html/wp-content/plugins/ttcqn-seo-contact-block.disabled-20260603-121712`

## 2. Recovery Verification

- `https://thongtaccongquangninh.com/`: HTTP 200.
- `https://thongtaccongquangninh.com/wp-json/`: HTTP 200.
- `https://thongtaccongquangninh.com/sitemap_index.xml`: HTTP 200.
- `https://thongtaccongquangninh.com/wp-login.php`: HTTP 200.
- Critical error khong con xuat hien tren frontend.

## 3. Audit After Recovery

- URL inventory:
  - output: `WP_URL_AUDIT_REPORT_2026-06-03.md`
  - total rows: 89
  - public audit URLs: 88
  - local SEO landing pages: 49
  - REST auth: `context=edit`
  - WP-CLI: khong dung vi workspace khong co WordPress core.
- Structured data audit:
  - output: `reports/structured-data-live-audit-2026-06-03T05-20-09.md`
  - checked URLs: 88
  - PASS: 88
  - WARN: 0
  - FAIL: 0
- Image audit:
  - output: `reports/wp-unique-image-audit-2026-06-03T12-18-13.md`
  - total content: 77
  - pages under 3 images: 2
  - global reused image groups: 1
- Full SEO audit sau P1 patch:
  - output: `reports/seo-full-audit-2026-06-03.md`
  - URL audit: 77
  - PASS: 13
  - FAIL: 34
  - WARN: 30
  - top issue category: content=79, title_meta=53, heading=27, schema=25, image=14
  - broken internal links: 0

## 4. P1 Fix Applied

- URL sua: `https://thongtaccongquangninh.com/thong-tac-bon-cau-nha-hang-quang-ninh-2026/`
- WordPress post ID: `2412`
- Backup truoc/sau:
  - `seo-revisions/wp-before-p1-nha-hang-20260603T052416Z/`
- Thay doi:
  - doi title hien thi thanh `Thong Tac Bon Cau Nha Hang Quang Ninh 24/7`
  - meta description live: 154 ky tu, co hotline `0963.953.533`
  - ha H1 phu trong body xuong H2 de frontend con 1 H1
  - doi H2 dau thanh `Nguyen Nhan...` de qua heading gate
  - sua link gay `/thong-tac-cong-nha-hang-quang-ninh/` sang `/thong-tac-cong-nha-hang-ha-long/`
  - thay cum tu cam `uy tin` bang noi dung ro hon
- Verify sau sua:
  - frontend HTTP 200
  - H1 live: 1
  - meta description length: 154
  - broken link tren URL: 0
  - target link `/thong-tac-cong-nha-hang-ha-long/`: HTTP 200
  - structured data URL nay: PASS
- Diem audit URL nay tang tu 48 len 83.
- Con ton tai cua URL nay:
  - `TITLE_LONG(76)` do site tu noi them ten thuong hieu vao title tag.
  - `WORD_ABOVE_TARGET(3078)`
  - `MISSING_SERVICE`
  - `SLUG_HAS_DATE_OR_LONG_NUMBER`

## 5. Remaining Priority

Viec tiep theo nen lam: xu ly duplicate title pair giua:

- `https://thongtaccongquangninh.com/thong-tac-bon-cau-khan-cap-quang-ninh-2/`
- `https://thongtaccongquangninh.com/thong-tac-bon-cau-khan-cap-quang-ninh/`

