# P1 thong tac bon cau khan cap cleanup - 2026-06-03

## Muc tieu

- URL: `https://thongtaccongquangninh.com/thong-tac-bon-cau-khan-cap-quang-ninh/`
- Post ID: `2377`
- Slug: `thong-tac-bon-cau-khan-cap-quang-ninh`
- Score truoc: `81`
- Loi truoc: `MISSING_H2:Nguyen nhan`, `WORD_BELOW_TARGET(2407)`, `MISSING_SERVICE`.

## Da lam

- Tao script rieng: `tools/fix_bon_cau_khan_cap_p1_2026_06_03.mjs`.
- Chay dry-run truoc khi apply.
- Backup truoc khi ghi live:
  - `seo-revisions/wp-before-p1-bon-cau-khan-cap-2026-06-03T16-05-14-062Z/post-2377-before.json`
  - `seo-revisions/wp-before-p1-bon-cau-khan-cap-2026-06-03T16-05-14-062Z/post-2377-before-content.html`
- Sync H1 raw content ve title hien hanh.
- Chen H2 `Nguyen nhan can thong tac bon cau khan cap Quang Ninh trong ngay`.
- Bo sung doan nguyen nhan: giay/khan uot, vat di, be phot day, ong nho va goc cua nha ong.
- Them `Service` JSON-LD truoc dong tac gia cuoi bai.
- Cap nhat BlogPosting JSON-LD theo title/meta hien hanh.
- Giu dong tac gia cuoi bai ve user archive `nguyensonghao`.

## Kiem tra

- `node --check tools/fix_bon_cau_khan_cap_p1_2026_06_03.mjs`: PASS.
- Dry-run: PASS.
- Apply report: `reports/p1-bon-cau-khan-cap-fix-apply-2026-06-03T16-05-14-062Z.json`.
- Public verify cache-buster:
  - HTTP `200`.
  - Title len `62`.
  - Meta len `155`.
  - Canonical self.
  - 1 H1.
  - Co H2 Nguyen nhan.
  - Co `Service` schema.
  - Co author archive, khong con old author URL.
- Full audit: `node tools/audit_seo_full.mjs --no-csv`.
  - Score sau: `100`.
  - Severity: `PASS`.
  - Word count: `2627`.
  - Required H2: day du.
  - Problems: `[]`.
  - Image issues: `[]`.

## Ket qua

- URL da tang score `81 -> 100`.
- Khong doi slug, khong doi anh, khong publish bai moi.
- URL thap nhat tiep theo: `/cau-hoi-thuong-gap-thong-tac-cong/` score `83`.
