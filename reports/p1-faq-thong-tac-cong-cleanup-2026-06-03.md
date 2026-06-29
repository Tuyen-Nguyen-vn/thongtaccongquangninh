# P1 FAQ thong tac cong cleanup - 2026-06-03

## Muc tieu

- URL: `https://thongtaccongquangninh.com/cau-hoi-thuong-gap-thong-tac-cong/`
- Post ID: `1377`
- Slug: `cau-hoi-thuong-gap-thong-tac-cong`
- Score truoc: `83`
- Loi truoc: `WORD_ABOVE_TARGET(3458)`, `KEYWORD_STUFFING(5.06%)`, `META_SHORT(144)`, `MISSING_SERVICE`.

## Da lam

- Tao script rieng: `tools/fix_faq_thong_tac_cong_p1_2026_06_03.mjs`.
- Chay syntax check va dry-run truoc khi apply.
- Backup truoc khi ghi live:
  - `seo-revisions/wp-before-p1-faq-thong-tac-cong-2026-06-03T16-19-29-608Z/post-1377-before.json`
  - `seo-revisions/wp-before-p1-faq-thong-tac-cong-2026-06-03T16-19-29-608Z/post-1377-before-content.html`
  - `seo-revisions/wp-before-p1-faq-thong-tac-cong-2026-06-03T16-21-18-573Z/post-1377-before.json`
  - `seo-revisions/wp-before-p1-faq-thong-tac-cong-2026-06-03T16-21-18-573Z/post-1377-before-content.html`
- Rut gon cac doan lap trong body de dua word count ve nguong.
- Giam lap cum focus keyword tu `27` lan raw ban dau ve muc audit PASS.
- Sua meta description len `154` ky tu va cap nhat Rank Math meta.
- Doi author URL cu ve archive `nguyensonghao`.
- Them `Service` JSON-LD.
- Them dong tac gia cuoi bai dung dinh dang author archive.

## Kiem tra

- `node --check tools/fix_faq_thong_tac_cong_p1_2026_06_03.mjs`: PASS.
- Dry-run cuoi: PASS.
- Apply report cuoi: `reports/p1-faq-thong-tac-cong-fix-apply-2026-06-03T16-21-18-573Z.json`.
- Public verify cache-buster:
  - HTTP `200`.
  - Title len `61`.
  - Meta len `154`.
  - Canonical self.
  - 1 H1.
  - Co `Service` schema.
  - Co author archive, khong con old author URL.
  - Co dong tac gia cuoi bai.
- Full audit: `node tools/audit_seo_full.mjs --no-csv`.
  - Score sau: `100`.
  - Severity: `PASS`.
  - Word count: `2974`.
  - Required H2: day du.
  - Problems: `[]`.
  - Image issues: `[]`.
- Structured data live audit:
  - Report: `reports/structured-data-live-audit-2026-06-03T16-23-57.md`.
  - URL target: PASS.
  - Toan batch: PASS `87`, WARN `1`, FAIL `0`.

## Ket qua

- URL da tang score `83 -> 100`.
- Khong doi slug, khong doi anh, khong publish bai moi.
- URL thap nhat tiep theo: `/he-thong-lien-ket-doi-tac/` score `83`.
