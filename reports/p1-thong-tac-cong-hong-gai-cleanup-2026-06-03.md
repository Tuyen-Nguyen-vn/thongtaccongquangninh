# P1 Thong Tac Cong Hong Gai Cleanup - 2026-06-03

## Pham vi

- Post `2053`: `/thong-tac-cong-hong-gai/`
- Muc tieu: sua URL score `78` trong audit P1, khong doi slug public.
- Nguon that: WordPress post content + Rank Math meta + HTML public.

## Thay doi live

| Hang muc | Truoc | Sau |
|---|---|---|
| Internal score | `78` | `100` |
| Word count audit | `2282`, thieu muc tieu | `2517`, dat vung 2500-3000 tu |
| H2 bat buoc | Thieu `NAP / Lien he` | Du ca 6 nhom H2 bat buoc |
| Image SEO | 1 alt thieu service/location | 3 anh khong issue |
| Schema | Thieu `Service` | Co `Service`, khong parse error |
| Author link | Con link `/nguyen-song-hao/` | Doi ve `/author/nguyensonghao/`, co final author line |
| Title/meta/canonical | Da dat | Giu dat: title `68`, meta `151`, canonical self |

## File va noi dung da sua

- Them script van hanh: `tools/fix_thong_tac_cong_hong_gai_p1_2026_06_03.mjs`
- Backup/apply report:
  - `seo-revisions/wp-before-p1-thong-tac-cong-hong-gai-2026-06-03T15-36-31-585Z`
  - `reports/p1-thong-tac-cong-hong-gai-fix-apply-2026-06-03T15-36-31-585Z.json`

## Kiem tra da chay

- `node --check tools/fix_thong_tac_cong_hong_gai_p1_2026_06_03.mjs` pass.
- `node tools/fix_thong_tac_cong_hong_gai_p1_2026_06_03.mjs --dry-run` pass.
- `node tools/fix_thong_tac_cong_hong_gai_p1_2026_06_03.mjs --apply` pass.
- Public verify voi `?nowprocket=1&codex=hong-gai-*`:
  - HTTP `200`
  - title `68`
  - meta `151`
  - canonical self
  - 1 H1 dung focus
  - co H2 `NAP lien he...`
  - co schema `Service`
  - co author archive `/author/nguyensonghao/`
  - khong con `/nguyen-song-hao/`
  - alt cu khong con, alt moi co `2`
- `node tools/audit_seo_full.mjs --no-csv`:
  - URL audit: `76`
  - Duplicate title: `0`
  - Broken internal link: `0`
  - `/thong-tac-cong-hong-gai/`: score `100`, severity `PASS`, problems `[]`.

## Con lai

- Khong doi slug/permalink trong batch nay.
- URL thap nhat tiep theo: `/` score `80`.
- Loi chinh URL tiep theo: `WORD_TOO_LONG(3658)`, `META_SHORT(143)`, `IMG:EMPTY_ALT(8)`, `IMG:ALT_NO_SERVICE_OR_LOCATION(12)`, `MISSING_BREADCRUMBLIST`.
