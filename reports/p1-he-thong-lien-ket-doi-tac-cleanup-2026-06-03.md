# P1 cleanup - /he-thong-lien-ket-doi-tac/

Ngay 2026-06-03, da xu ly trang:

- URL: https://thongtaccongquangninh.com/he-thong-lien-ket-doi-tac/
- WordPress ID: 2022
- Trang thai: publish
- Diem truoc sua: 83/HIGH
- Loi truoc sua: `WORD_TOO_LONG(10457)`, `FORBIDDEN_WORD`, `HOTLINE_LOW(0)`, `META_SHORT(121)`
- Diem sau sua: 100/PASS
- Loi sau sua: khong con loi trong audit hien tai

## Da lam

- Rut gon trang danh ba lien ket doi tac tu ban public qua dai 446KB ve noi dung gon, doc duoc va dung intent.
- Go 352 external link khoi noi dung public de tranh trang trong nhu link directory/link farm.
- Go tu cam trong noi dung chinh.
- Bo sung NAP, hotline `0963.953.533 / 0931.156.756`, CTA lien he va dong tac gia link ve author archive.
- Giu lai 3 anh hien co, khong chen poster quang cao va khong doi anh trong batch nay.
- Them marker noi dung `ttcqn-doi-tac-p1-cleanup-2026-06-03`.
- Them `FAQPage` JSON-LD khop voi FAQ hien thi tren trang.
- Sua meta description bi plugin override ghi de, do dai hien tai 150 ky tu.
- Rebuild va upload plugin `ttcqn-seo-cleanup-redirects` phien ban `2026.06.03.6` vi script upload chi day file zip san co, khong tu rebuild zip.

## File va artifact

- Script fix: `tools/fix_he_thong_lien_ket_doi_tac_p1_2026_06_03.mjs`
- Plugin override: `tools/wp-plugins/ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects.php`
- Plugin zip: `tools/wp-plugins/ttcqn-seo-cleanup-redirects.zip`
- Upload report: `WORDPRESS_SEO_CLEANUP_REDIRECTS_UPLOAD_2026-06-03T16-33-57-800Z.json`
- Dry-run report: `reports/p1-he-thong-lien-ket-doi-tac-fix-dryrun-2026-06-03T16-37-34-249Z.json`
- Apply report: `reports/p1-he-thong-lien-ket-doi-tac-fix-apply-2026-06-03T16-37-44-965Z.json`
- Backup ban goc truoc khi rut gon: `seo-revisions/wp-before-p1-he-thong-lien-ket-doi-tac-2026-06-03T16-31-29-965Z`
- Backup truoc khi them FAQ schema: `seo-revisions/wp-before-p1-he-thong-lien-ket-doi-tac-2026-06-03T16-37-44-965Z`
- Full audit JSON: `reports/seo-full-audit-2026-06-03.json`
- Full audit MD: `reports/seo-full-audit-2026-06-03.md`

## Kiem tra

- `node --check tools/fix_he_thong_lien_ket_doi_tac_p1_2026_06_03.mjs`: PASS
- `php -l tools/wp-plugins/ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects.php`: PASS
- Dry-run cuoi: `rawWordCount=2548`, `externalLinks=0`, `forbidden=0`, `hotlineRaw=16`, `images=3`
- Apply cuoi: `ok=true`, co backup truoc khi ghi live
- Public verify: HTTP 200, title 61 ky tu, meta 150 ky tu, canonical self, 1 H1, co author archive, co marker cleanup
- Schema verify: co `LocalBusiness|HomeAndConstructionBusiness`, `BreadcrumbList`, `FAQPage`
- Re-audit full: score 100, severity PASS, problems 0, wordCount 2544, image issues 0

## Rui ro con lai

- `tools/index_external_backlinks.py` van la script nguon co the tao lai trang danh ba lien ket qua lon neu duoc chay lai ma khong cap/kiem soat output. Batch nay chi xu ly live page va meta override, chua refactor generator.

## Viec tiep theo

- Sua URL diem thap tiep theo trong audit: `https://thongtaccongquangninh.com/hut-be-phot-ba-che/`.
