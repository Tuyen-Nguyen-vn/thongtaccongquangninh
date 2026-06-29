# P1 Gia + Bang Gia Duplicate Cleanup — 2026-06-03

## Pham vi

- Post `2449`: `/gia-hut-be-phot-quang-ninh-2026/`
- Post duplicate `2519`: `/bang-gia-hut-be-phot-quang-ninh-2026-3/`
- Canonical giu lai: `/bang-gia-hut-be-phot-quang-ninh-2026/` post `217`
- Plugin redirect: `tools/wp-plugins/ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects.php`

## Thay doi live

| URL | Truoc | Sau | Ket qua |
|---|---:|---:|---|
| `/gia-hut-be-phot-quang-ninh-2026/` | 67 | 86 | Sua title/meta/H1/H2, go block `Thong Tin SEO`, giu canonical self. |
| `/bang-gia-hut-be-phot-quang-ninh-2026-3/` | 67 | removed from publish audit | Dua post `2519` ve draft, them 301 ve `/bang-gia-hut-be-phot-quang-ninh-2026/`. |
| `/bang-gia-hut-be-phot-quang-ninh-2026/` | 97 | 97 | Giu URL canonical dang sach, khong sua content. |

## Backup

- `seo-revisions/wp-before-p1-gia-hut-be-phot-20260603T064500Z`
- `seo-revisions/wp-before-duplicate-bang-gia-hbp-20260603T070000Z`
- `seo-revisions/wp-before-duplicate-bang-gia-hbp-20260603T070000Z/ttcqn-seo-cleanup-redirects-before-20260603T070000Z.php`

## Plugin redirect

- Version: `2026.06.03.5`
- Mapping moi:

```php
'/bang-gia-hut-be-phot-quang-ninh-2026-3' => '/bang-gia-hut-be-phot-quang-ninh-2026/',
```

## Kiem tra da chay

- `php -l tools/wp-plugins/ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects.php` pass.
- Rebuild zip: `tools/wp-plugins/ttcqn-seo-cleanup-redirects.zip`.
- Upload plugin: `WORDPRESS_SEO_CLEANUP_REDIRECTS_UPLOAD_2026-06-03T10-12-09-170Z.json`, `success=true`.
- Public verify:
  - `/bang-gia-hut-be-phot-quang-ninh-2026-3/?nowprocket=1&codex=dup2519-301` -> `301`, `x-redirect-by: TTCQN SEO Cleanup Redirects`.
  - `/bang-gia-hut-be-phot-quang-ninh-2026/?nowprocket=1&codex=dup2519-canonical` -> `200`.
  - `/gia-hut-be-phot-quang-ninh-2026/?nowprocket=1&codex=dup2519-gia` -> `200`.
- `node tools/collect_wp_url_audit_list.mjs`:
  - `duplicateGroups=0`
  - `similarPairs=0`
  - post `2519` khong con trong public slug result; REST edit xac nhan `afterStatus=draft`.
- `node tools/audit_seo_full.mjs --no-csv`:
  - URL audit: `76`
  - Duplicate title: `0`
  - Broken internal link: `0`
  - `/gia-hut-be-phot-quang-ninh-2026/`: score `86`, meta `154`, H2 bat buoc du, canonical self.
  - `/bang-gia-hut-be-phot-quang-ninh-2026/`: score `97`, co `Service`, canonical self.
  - `/bang-gia-hut-be-phot-quang-ninh-2026-3/`: khong con trong `seo-full-audit` publish set.

## Con lai

- `/gia-hut-be-phot-quang-ninh-2026/` con `WORD_ABOVE_TARGET(3363)`, `MISSING_SERVICE`, `SLUG_HAS_DATE_OR_LONG_NUMBER`.
- URL thap nhat tiep theo: `/hut-be-phot-24-7-quang-ninh-2026/` score `70`, loi chinh `MISSING_H2:Nguyen nhan`, `MISSING_H2:NAP / Lien he`, `TITLE_LONG(92)`, `MISSING_SERVICE`.

