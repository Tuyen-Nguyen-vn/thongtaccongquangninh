# P1 Gia Bon Cau Cleanup - 2026-06-03

## Pham vi

- Post `2357`: `/gia-thong-tac-bon-cau-quang-ninh/`
- Muc tieu: sua URL score `78` trong audit P1, khong doi slug public.
- Nguon that: WordPress post content + Rank Math meta + HTML public.

## Thay doi live

| Hang muc | Truoc | Sau |
|---|---|---|
| Internal score | `78` | `100` |
| Title public | `103` ky tu, bi append site name | `65` ky tu |
| Meta description | `165` ky tu | `150` ky tu |
| H2 bat buoc | Thieu `Nguyen nhan` | Du ca 6 nhom H2 bat buoc |
| Schema | Thieu `Service` | Co `Service`, khong parse error |
| Author link | Con link `/nguyen-song-hao/` | Doi ve `/author/nguyensonghao/`, co final author line |
| Image SEO | 3 anh, khong issue | Giu nguyen, khong issue |

## File va noi dung da sua

- Them script van hanh: `tools/fix_gia_thong_tac_bon_cau_p1_2026_06_03.mjs`
- Backup/apply report:
  - `seo-revisions/wp-before-p1-gia-bon-cau-2026-06-03T15-15-18-512Z`
  - `reports/p1-gia-bon-cau-fix-apply-2026-06-03T15-15-18-512Z.json`

## Kiem tra da chay

- `node --check tools/fix_gia_thong_tac_bon_cau_p1_2026_06_03.mjs` pass.
- `node tools/fix_gia_thong_tac_bon_cau_p1_2026_06_03.mjs --dry-run` pass.
- `node tools/fix_gia_thong_tac_bon_cau_p1_2026_06_03.mjs --apply` pass.
- Public verify voi `?nowprocket=1&codex=gia-bon-cau-*`:
  - HTTP `200`
  - title `65`
  - meta `150`
  - canonical self
  - 1 H1 dung focus
  - co H2 `Nguyen nhan...`
  - co schema `Service`
  - co author archive `/author/nguyensonghao/`
  - khong con `/nguyen-song-hao/`
- `node tools/audit_seo_full.mjs --no-csv`:
  - URL audit: `76`
  - Duplicate title: `0`
  - Broken internal link: `0`
  - `/gia-thong-tac-bon-cau-quang-ninh/`: score `100`, severity `PASS`, problems `[]`.

## Con lai

- Khong doi slug/permalink trong batch nay.
- URL thap nhat tiep theo: `/thong-tac-bon-cau-ban-dem-quang-ninh/` score `78`.
- Loi chinh URL tiep theo: `MISSING_H2:Nguyen nhan`, `WORD_BELOW_TARGET(2434)`, `TITLE_LONG(92)`, `MISSING_SERVICE`.
