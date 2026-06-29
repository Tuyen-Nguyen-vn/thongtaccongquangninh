# P1 Cam Nang Ha Long Cleanup - 2026-06-03

## Pham vi

- Post `2332`: `/cam-nang-thong-tac-cong-tai-ha-long/`
- Muc tieu: sua URL score `75` trong audit P1, khong doi slug public.
- Nguon that: WordPress post content + Rank Math meta + HTML public.

## Thay doi live

| Hang muc | Truoc | Sau |
|---|---|---|
| Internal score | `75` | `100` |
| Title public | `Thong Tac Cong Tai Ha Long: Cam Nang Xu Ly Nhanh Theo Tung Khu` | `Cam nang thong tac cong tai Ha Long: xu ly nhanh theo tung khu` |
| Meta description | `136` ky tu | `159` ky tu, co `0963.953.533 / 0931.156.756` |
| H1 | Bi audit bao thieu focus keyword | H1 bat dau bang `Cam nang thong tac cong...` |
| Word count audit | `4208`, qua dai | `2852`, dat vung 2500-3000 tu |
| Tu cam | Co `chuyen nghiep`, `uy tin` | Khong con |
| Schema | Thieu `Service` | Co `Service`, khong parse error |
| Author link | Con link `/nguyen-song-hao/` | Doi ve `/author/nguyensonghao/`, co final author line |
| Image SEO | 5 anh | 3 anh, alt/filename hop le, khong issue |

## File va noi dung da sua

- Them script van hanh: `tools/fix_cam_nang_ha_long_p1_2026_06_03.mjs`
- Backup/apply report:
  - `seo-revisions/wp-before-p1-cam-nang-ha-long-2026-06-03T15-05-40-509Z`
  - `reports/p1-cam-nang-ha-long-fix-apply-2026-06-03T15-05-40-509Z.json`

## Kiem tra da chay

- `node --check tools/fix_cam_nang_ha_long_p1_2026_06_03.mjs` pass.
- `node tools/fix_cam_nang_ha_long_p1_2026_06_03.mjs --dry-run` pass.
- `node tools/fix_cam_nang_ha_long_p1_2026_06_03.mjs --apply` pass.
- Public verify voi `?nowprocket=1&codex=cam-nang-*`:
  - HTTP `200`
  - title `62`
  - meta `159`
  - canonical self
  - 1 H1 dung focus
  - co schema `Service`
  - co author archive `/author/nguyensonghao/`
  - khong con `/nguyen-song-hao/`
  - khong con tu cam
- `node tools/audit_seo_full.mjs --no-csv`:
  - URL audit: `76`
  - Duplicate title: `0`
  - Broken internal link: `0`
  - `/cam-nang-thong-tac-cong-tai-ha-long/`: score `100`, severity `PASS`, problems `[]`.

## Con lai

- Khong doi slug/permalink trong batch nay.
- URL thap nhat tiep theo: `/gia-thong-tac-bon-cau-quang-ninh/` score `78`.
- Loi chinh URL tiep theo: `MISSING_H2:Nguyen nhan`, `TITLE_LONG(103)`, `META_LONG(165)`, `MISSING_SERVICE`.
