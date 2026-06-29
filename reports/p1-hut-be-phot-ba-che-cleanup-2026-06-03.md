# P1 cleanup - /hut-be-phot-ba-che/

Ngay 2026-06-03, da xu ly trang:

- URL: https://thongtaccongquangninh.com/hut-be-phot-ba-che/
- WordPress ID: 2047
- Trang thai: publish
- Diem truoc sua: 83/HIGH
- Loi truoc sua: `WORD_ABOVE_TARGET(3149)`, `KEYWORD_STUFFING(4.60%)`, `IMG:ALT_NO_SERVICE_OR_LOCATION(1)`, `MISSING_SERVICE`
- Diem sau sua: 100/PASS
- Loi sau sua: khong con loi trong audit hien tai

## Da lam

- Rut gon noi dung public bang cach go khoi tac gia phu trung lap, khoi "Ghi nho" lap CTA va doan schema bi escape thanh text.
- Giam lap cum keyword chinh tu muc nhieu lan ve muc an toan: raw content con 6 lan, density 1.26%; audit public main con 1.06%.
- Doi cac H2 bi nhồi keyword sang bien the tu nhien nhung van giu du H2 bat buoc: Nguyen nhan, Cam ket, Bang gia, Quy trinh, NAP, FAQ.
- Sua alt anh case study tu `Doi tho xu ly bun cung nhieu nam tai Ba Che` sang alt co ro dich vu va dia phuong.
- Them `Service` schema bang JSON-LD voi marker `hut-be-phot-ba-che`.
- Doi author link cu ve author archive `https://thongtaccongquangninh.com/author/nguyensonghao/`.
- Them dong tac gia cuoi bai voi marker `ttcqn-hut-be-phot-ba-che-p1-cleanup-2026-06-03`.
- Cap nhat Rank Math title, description va focus keyword qua REST endpoint neu endpoint cho phep.

## File va artifact

- Script fix: `tools/fix_hut_be_phot_ba_che_p1_2026_06_03.mjs`
- Dry-run report: `reports/p1-hut-be-phot-ba-che-fix-dryrun-2026-06-03T16-46-26-255Z.json`
- Apply report: `reports/p1-hut-be-phot-ba-che-fix-apply-2026-06-03T16-46-35-069Z.json`
- Backup: `seo-revisions/wp-before-p1-hut-be-phot-ba-che-2026-06-03T16-46-35-069Z`
- Full audit JSON: `reports/seo-full-audit-2026-06-03.json`
- Full audit MD: `reports/seo-full-audit-2026-06-03.md`

## Kiem tra

- `node --check tools/fix_hut_be_phot_ba_che_p1_2026_06_03.mjs`: PASS
- Dry-run: `rawWordCount=2387`, `keywordDensity=1.26%`, co `Service` schema, co author archive, alt loi da het
- Apply: `ok=true`, co backup truoc khi ghi live
- Public verify: HTTP 200, title 64 ky tu, meta 158 ky tu, canonical self, 1 H1, Service schema OK, author archive OK, final author OK
- Re-audit full: score 100, severity PASS, problems 0, wordCount 2831, keyword density 1.06%, image issues 0, schema problems 0

## Viec tiep theo

- Sua URL diem thap tiep theo trong audit: `https://thongtaccongquangninh.com/hut-be-phot-binh-lieu/`.
