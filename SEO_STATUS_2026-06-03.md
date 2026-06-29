# Trạng thái SEO - 2026-06-03

## Cập nhật author user cho bài SEO

- Chuẩn dòng cuối bài SEO hiện hành: `Tác giả: [Nguyễn Song Hào](https://thongtaccongquangninh.com/author/nguyensonghao/)`.
- Đã cập nhật tool `tools/insert_author_nguyen_song_hao.mjs` để dùng user archive `nguyensonghao`, thêm `rel="author"` và final author line cuối nội dung.
- Đã thêm option `--include-drafts` để sửa draft mà không đổi trạng thái publish.

## Apply live / draft

- Report apply: `WORDPRESS_AUTHOR_NGUYEN_SONG_HAO_2026-06-03T05-48-15-755Z.json`.
- Backup trước khi ghi:
  - `seo-revisions/wp-before-author-nguyen-song-hao-2026-06-03T05-48-15-755Z/posts-2377-thong-tac-bon-cau-khan-cap-quang-ninh.json`
  - `seo-revisions/wp-before-author-nguyen-song-hao-2026-06-03T05-48-15-755Z/posts-2378-thong-tac-bon-cau-khan-cap-quang-ninh-2.json`
- Post `2377` đang `publish`: đã cập nhật và verify public HTTP 200.
- Post `2378` đang `draft`: đã cập nhật raw content qua REST edit, không publish.

## Bằng chứng kiểm tra

- Post `2377` public HTML:
  - Có `https://thongtaccongquangninh.com/author/nguyensonghao/`.
  - Không còn `https://thongtaccongquangninh.com/nguyen-song-hao/`.
  - Có marker `ttcqn-author-final`, `ttcqn-author-byline`, `BlogPosting`.
- Post `2378` draft raw content:
  - Status REST: `draft`.
  - Có `https://thongtaccongquangninh.com/author/nguyensonghao/`.
  - Không còn `https://thongtaccongquangninh.com/nguyen-song-hao/`.
  - Có marker `ttcqn-author-final`, `ttcqn-author-byline`, `BlogPosting`.

## Lưu ý

- Không đổi trạng thái publish của post `2378`.
- Không sửa page profile riêng `/nguyen-song-hao/`; page đó vẫn là hồ sơ cá nhân, không phải link byline bắt buộc của bài SEO.

## Prompt 4 nhân sự SEO luân phiên

- Đã tạo bộ prompt vận hành: `docs/PROMPTS_4_NHAN_SU_SEO_LUAN_PHIEN_2026-06-03.md`.
- Đã tạo bảng theo dõi tháng 06/2026: `docs/SEO_CONTENT_ROTATION_2026-06.csv`.
- Bảng có 16 dòng: 4 tuần, 4 nhân sự, 4 chuyên mục A/B/C/D luân phiên đều.
- CSV parse OK: mỗi tuần 4 việc, mỗi nhân sự 4 việc, mỗi chuyên mục 4 việc.
- Tuần 1 đã có 4 keyword để giao ngay:
  - Nhân sự 1: `dau hieu be phot day khach san Ha Long`.
  - Nhân sự 2: `thong tac cong bep nha hang Ha Long`.
  - Nhân sự 3: `bon cau khach san Bai Chay bi tac`.
  - Nhân sự 4: `nao vet ho ga nha hang Ha Long mua mua`.

## Giao việc Tuần 1

- Đã tạo file giao việc copy-paste cho 4 nhân sự: `docs/SEO_WEEK1_ASSIGNMENTS_2026-06-03.md`.
- Đã cập nhật 4 dòng tuần 1 trong `docs/SEO_CONTENT_ROTATION_2026-06.csv` sang `ASSIGNMENT_READY`.
- Kiểm CSV OK: 16 dòng tổng, tuần 1 có 4 dòng `ASSIGNMENT_READY`, đủ Nhân sự 1-4.
- File giao việc có đủ 4 block: `Tin nhắn giao Nhân sự 1`, `Tin nhắn giao Nhân sự 2`, `Tin nhắn giao Nhân sự 3`, `Tin nhắn giao Nhân sự 4`.

## Review gate Tuần 1

- Đã tạo cổng review trước khi tạo draft: `docs/SEO_WEEK1_REVIEW_GATE_2026-06-03.md`.
- Đã tạo bảng nhận bài: `docs/SEO_WEEK1_SUBMISSION_REVIEW_2026-06.csv`.
- Đã cập nhật 4 dòng tuần 1 trong `docs/SEO_CONTENT_ROTATION_2026-06.csv` sang `WAITING_SUBMISSION`.
- CSV nhận bài parse OK: 4 dòng, cả 4 đều `WAITING_SUBMISSION`.
- Gate bắt buộc: kiểm trùng URL live cùng cụm, `tools/seo_score.py`, Image Brief, author link, internal link, từ cấm trước khi đặt `READY_TO_DRAFT`.
