# DRAFT DUPLICATE / NEAR-DUPLICATE REVIEW

Ngày review: 2026-05-21  
Phạm vi ban đầu: 80 file markdown trong `content-drafts/**`.  
Sau cleanup lần 1: còn 67 file markdown active trong `content-drafts/**`.  
Sau cleanup lần 2 theo yêu cầu "bài nào không chuẩn SEO thì xóa": còn 19 file markdown active trong `content-drafts/**`.  
Sau audit 19 draft còn lại: xóa thêm 2 file fail gate, còn 17 file markdown active.


## Cleanup Đã Thực Hiện 2026-05-21


Backup trước khi xóa:

- `backups/delete-nonseo-drafts-2026-05-21/manifest.md`
- `backups/delete-nonseo-drafts-2026-05-21/content-drafts/**`
- `backups/delete-rewrite-required-drafts-2026-05-21/manifest.md`
- `backups/delete-rewrite-required-drafts-2026-05-21/content-drafts/**`
- `backups/delete-final-nonseo-drafts-2026-05-21/manifest.md`
- `backups/delete-final-nonseo-drafts-2026-05-21/content-drafts/**`

Kết quả verify:

- Trước xóa: 80 draft markdown.
- Sau xóa lần 1: 67 draft markdown.
- Sau xóa lần 2: 19 draft markdown.
- Sau audit 19 draft: 17 draft markdown.
- Duplicate slug active còn lại: 0.
- Similarity active còn lại >= 0.70: 0 cặp.
- Internal SEO score fail còn lại: 0.
- Số file backup lần 1: 13 draft + 1 manifest.
- Số file backup lần 2: 48 draft + 1 manifest.
- Số file backup lần 3: 2 draft + 1 manifest.

## Kết Luận Nhanh

| Nhóm | Phát hiện | Mức rủi ro | Quyết định |
|---|---|---:|---|
| Cụm `remaining/*` | Nhiều H1/title sinh máy móc kiểu `24/7, xử lý nhanh trong ngày` | High | Fixed local cleanup: đã xóa các file xấu rõ ràng |
| Cụm landing bồn cầu | Slug quá rộng như `ha-long`, `quang-ninh`, `uong-bi` | High | Fixed local cleanup: đã xóa 7 draft slug sai, giữ `landing-cam-pha` |

## Luật Publish Gate

- `CANONICAL_CANDIDATE`: có thể là bản giữ lại, nhưng vẫn phải qua checklist content, image, schema, internal link.


| Slug | File | Đánh giá | Action |
|---|---|---|---|
| `hut-be-phot-cam-pha` | `content-drafts/hut-be-phot/hut-be-phot-cam-pha-rankmath-90.md` | Bản dài hơn, có ảnh/package, nhưng template giống nhiều trang hút bể phốt khác | `CANONICAL_CANDIDATE`, phải merge proof từ bản root và rewrite giảm trùng |
| `hut-be-phot-ha-long` | `content-drafts/hut-be-phot/hut-be-phot-ha-long-rankmath-90.md` | Bản dài hơn, có ảnh/package, nhưng template giống cụm hút bể phốt | `CANONICAL_CANDIDATE`, phải rewrite proof riêng |
| `hut-be-phot-mong-cai` | `content-drafts/hut-be-phot/hut-be-phot-mong-cai-rankmath-90.md` | Bản dài hơn, nhưng giống template cụm hút bể phốt | `CANONICAL_CANDIDATE`, phải rewrite proof riêng |
| `hut-be-phot-uong-bi` | `content-drafts/hut-be-phot/hut-be-phot-uong-bi-rankmath-90.md` | Bản dài hơn, nhưng giống template cụm hút bể phốt | `CANONICAL_CANDIDATE`, phải rewrite proof riêng |
| `thong-tac-cong-cam-pha` | `content-drafts/thong-tac-cong-cam-pha-rankmath-draft.md` | Bản có local proof rõ hơn: Cửa Ông, Cẩm Trung, Cẩm Thành, Cẩm Thủy, cặn than, nhà hàng ven biển | `CANONICAL_CANDIDATE`, ưu tiên giữ |


## Cụm Hút Bể Phốt Near-Duplicate


| Nhóm file | Vấn đề | Action trước publish / cập nhật live |
|---|---|---|
| `content-drafts/hut-be-phot/hut-be-phot-ba-che-rankmath-90.md`, `binh-lieu`, `co-to`, `dam-ha`, `hai-ha`, `tien-yen` | Có vài entity địa phương tốt hơn, nhưng vẫn cùng khung | `REVIEW_REQUIRED`: kiểm live nếu đã publish; nếu chưa publish thì rewrite mở bài/case/bảng giá theo địa bàn |

## Cụm Thông Tắc Cống Near-Duplicate

Bằng chứng: nhiều cặp trong `content-drafts/thong-tac-cong/*.md` có shingle similarity 0.81-0.98. Theo `docs/SEO_PROGRESS.csv`, nhiều slug đang là `draft_wp`, nên phải chặn publish cho đến khi rewrite.

| File/Nhóm | Tình trạng | Action |
|---|---|---|
| `content-drafts/thong-tac-cong-cam-pha-rankmath-draft.md` | Bản Cẩm Phả tốt hơn, đã local hóa sâu hơn | `CANONICAL_CANDIDATE`, vẫn cần giảm lặp keyword và kiểm ảnh/schema |

## Cụm `remaining/*` Cần Chặn Publish

| File | Vấn đề chính | Action |
|---|---|---|


## Cụm Landing Bồn Cầu Cần Sửa Slug


| File | Slug hiện tại | Slug đề xuất |
|---|---|---|
| `content-drafts/landing-ha-long-thong-tac-bon-cau-rankmath-90.md` | `ha-long` | `thong-tac-bon-cau-ha-long` |
| `content-drafts/landing-quang-ninh-thong-tac-bon-cau-rankmath-90.md` | `quang-ninh` | `thong-tac-bon-cau-quang-ninh` |
| `content-drafts/landing-uong-bi-thong-tac-bon-cau-rankmath-90.md` | `uong-bi` | `thong-tac-bon-cau-uong-bi` |
| `content-drafts/landing-dong-trieu-thong-tac-bon-cau-rankmath-90.md` | `dong-trieu` | `thong-tac-bon-cau-dong-trieu` |
| `content-drafts/landing-mong-cai-thong-tac-bon-cau-rankmath-90.md` | `mong-cai` | `thong-tac-bon-cau-mong-cai` |
| `content-drafts/landing-van-don-thong-tac-bon-cau-rankmath-90.md` | `van-don` | `thong-tac-bon-cau-van-don` |
| `content-drafts/landing-quang-yen-thong-tac-bon-cau-rankmath-90.md` | `quang-yen` | `thong-tac-bon-cau-quang-yen` |

`content-drafts/landing-cam-pha-thong-tac-bon-cau-rankmath-90.md` đã có slug `thong-tac-bon-cau-cam-pha`, nhưng vẫn phải kiểm near-duplicate/content proof trước publish.

## Evidence

Lệnh đã chạy:

```bash
find content-drafts -type f \( -name '*.md' -o -name '*.markdown' -o -name '*.txt' \) | wc -l
rg -n "^(# |H1:|Meta Title:|Title:|title:|slug:|Slug:|keyword:|Keyword:)" content-drafts --glob '*.md'
python3 <script đọc 80 draft, trích Meta Title/Slug/H1, tính duplicate slug và shingle similarity>
```

Kết quả chính:

- Tổng file scan: 80.
- Near-duplicate rất cao:
  - `thong-tac-cong-mong-cai` vs `thong-tac-cong-quang-ninh`: 0.98.
  - `thong-tac-cong-quang-ninh` vs `thong-tac-cong-quang-yen`: 0.98.
  - `hut-be-phot-quang-ninh` vs `hut-be-phot-quang-yen`: 0.98.
  - Nhiều cặp `hut-be-phot/*` và `thong-tac-cong/*` khác nằm trong khoảng 0.80-0.97.
- Pattern xấu: nhiều file `remaining/*` có H1 dạng `... 24/7, xử lý nhanh trong ngày`, không khớp intent trang/chính sách/blog.

## Quy Trình Sửa Trước Publish

1. Chọn đúng bản canonical theo bảng trên.
3. Rewrite tối thiểu 30-40% cấu trúc section cho từng địa phương/ngách.
4. Mỗi bài địa phương phải có:
   - một nhóm khách riêng;
   - một bối cảnh đường/ngõ/khu dân cư thật;
   - một nguyên nhân/tình huống nổi bật riêng;
   - ảnh/alt/caption riêng.
