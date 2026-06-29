# P1 Bon Cau Ban Dem Cleanup - 2026-06-03

## Pham vi

- Post `2379`: `/thong-tac-bon-cau-ban-dem-quang-ninh/`
- Muc tieu: sua URL score `78` trong audit P1, khong doi slug public.
- Nguon that: WordPress post content + Rank Math meta + HTML public.

## Thay doi live

| Hang muc | Truoc | Sau |
|---|---|---|
| Internal score | `78` | `100` |
| Title public | `92` ky tu, bi append site name | `63` ky tu |
| Meta description | `154` ky tu, 1 hotline | `153` ky tu, co hotline va intent 24/7 |
| Word count audit | `2434`, thieu nhe | `2518`, dat vung 2500-3000 tu |
| H2 bat buoc | Thieu `Nguyen nhan` | Du ca 6 nhom H2 bat buoc |
| Schema | Thieu `Service` | Co `Service`, khong parse error |
| Author link | Con link `/nguyen-song-hao/` | Doi ve `/author/nguyensonghao/`, co final author line |
| Image SEO | 3 anh, khong issue | Giu nguyen, khong issue |

## File va noi dung da sua

- Them script van hanh: `tools/fix_bon_cau_ban_dem_p1_2026_06_03.mjs`
- Backup/apply report:
  - `seo-revisions/wp-before-p1-bon-cau-ban-dem-2026-06-03T15-30-31-266Z`
  - `reports/p1-bon-cau-ban-dem-fix-apply-2026-06-03T15-30-31-266Z.json`

## Kiem tra da chay

- `node --check tools/fix_bon_cau_ban_dem_p1_2026_06_03.mjs` pass.
- `node tools/fix_bon_cau_ban_dem_p1_2026_06_03.mjs --dry-run` pass.
- `node tools/fix_bon_cau_ban_dem_p1_2026_06_03.mjs --apply` pass.
- Public verify voi `?nowprocket=1&codex=bon-cau-ban-dem-*`:
  - HTTP `200`
  - title `63`
  - meta `153`
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
  - `/thong-tac-bon-cau-ban-dem-quang-ninh/`: score `100`, severity `PASS`, problems `[]`.

## Con lai

- Khong doi slug/permalink trong batch nay.
- URL thap nhat tiep theo: `/thong-tac-cong-hong-gai/` score `78`.
- Loi chinh URL tiep theo: `MISSING_H2:NAP / Lien he`, `WORD_BELOW_TARGET(2282)`, `IMG:ALT_NO_SERVICE_OR_LOCATION(1)`, `MISSING_SERVICE`.
