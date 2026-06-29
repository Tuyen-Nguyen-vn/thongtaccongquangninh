# DRAFT REMAINING AUDIT

Ngày audit: 2026-05-21  
Phạm vi: 17 file markdown còn lại trong `content-drafts/**`.

## Kết Luận

- Active draft: 17.
- Internal SEO score fail: 0.
- Duplicate slug active: 0.
- Similarity >= 0.70: 0 cặp.
- Pattern xấu còn lại: 0 match cho `24/7, xử lý nhanh trong ngày`, `24/7 24/7`, slug rộng bồn cầu, `thong-tac-toilet-quang-ninh`, `CTA cuối bài:`, `0900000000`.
- Đã xóa thêm 2 draft không đạt gate sau backup tại `backups/delete-final-nonseo-drafts-2026-05-21/`.
- Đã backup và bổ sung ảnh/schema cho 13 file còn thiếu tại `backups/enrich-remaining-drafts-2026-05-21/`.
- Sau bổ sung: 17/17 draft có tối thiểu 2 ảnh, 17/17 có JSON-LD hợp lệ, 17/17 pass score nội bộ.
- Đã xóa cụm caption/alt `Ảnh minh họa`; không còn match `ảnh minh họa` trong active draft.

## Đã Xóa Sau Audit 19 Draft

| File | Lý do | Backup |
|---|---|---|

## Draft Còn Lại

| File | Điểm nội bộ | Trạng thái | Ghi chú trước publish |
|---|---:|---|---|
| `content-drafts/blog/bon-cau-rut-cham-nguyen-nhan-rankmath-90.md` | 95/80 | PASS | Đã bổ sung 2 ảnh + schema |
| `content-drafts/blog/chi-phi-hut-be-phot-quang-ninh-rankmath-90.md` | 95/84 | PASS | Đã bổ sung 2 ảnh + schema |
| `content-drafts/blog/chu-ky-hut-be-phot-quang-ninh-rankmath-90.md` | 95/80 | PASS | Đã bổ sung 2 ảnh + schema |
| `content-drafts/blog/hoa-chat-tu-thong-cong-rankmath-90.md` | 95/80 | PASS | Đã bổ sung 2 ảnh + schema |
| `content-drafts/blog/mui-hoi-cong-nguyen-nhan-xu-ly-rankmath-90.md` | 95/80 | PASS | Đã bổ sung 2 ảnh + schema |
| `content-drafts/hut-be-phot/hut-be-phot-ba-che-rankmath-90.md` | 95/80 | PASS | Đã bổ sung schema |
| `content-drafts/hut-be-phot/hut-be-phot-binh-lieu-rankmath-90.md` | 95/80 | PASS | Đã bổ sung schema |
| `content-drafts/hut-be-phot/hut-be-phot-co-to-rankmath-90.md` | 95/80 | PASS | Đã bổ sung schema |
| `content-drafts/hut-be-phot/hut-be-phot-dam-ha-rankmath-90.md` | 95/80 | PASS | Đã bổ sung schema |
| `content-drafts/hut-be-phot/hut-be-phot-hai-ha-rankmath-90.md` | 95/80 | PASS | Đã bổ sung schema |
| `content-drafts/hut-be-phot/hut-be-phot-tien-yen-rankmath-90.md` | 95/80 | PASS | Đã bổ sung schema |
| `content-drafts/thong-tac-cong/thong-tac-cong-hong-gai-rankmath-90.md` | 95/80 | PASS | Đã bổ sung 2 ảnh + schema |
| `content-drafts/trang-faq-tong-hop-thong-tac-cong-rankmath-draft.md` | 95/80 | PASS | Đã bổ sung schema |

## Lệnh Verify

```bash
find content-drafts -type f -name '*.md' | wc -l
python3 <script import tools/seo_score.py, chấm 17 draft còn lại>
python3 <script duplicate slug + shingle similarity>
rg -n "24/7, xử lý nhanh trong ngày|24/7 24/7|Slug: (ha-long|quang-ninh|uong-bi|dong-trieu|mong-cai|van-don|quang-yen)$|thong-tac-toilet-quang-ninh|CTA cuối bài:|0900000000" content-drafts --glob '*.md'
rg -in "ảnh minh họa" content-drafts --glob '*.md'
```
