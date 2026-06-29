# Trạng thái SEO - 2026-06-02

## Tình hình hiện tại

- Đã triển khai thử phần tác giả SEO cho 2 bài live theo tác giả Nguyễn Song Hào.
- Trang tác giả dùng làm nguồn: `https://thongtaccongquangninh.com/nguyen-song-hao/` — kiểm tra live HTTP 200.
- Không áp toàn site trong bước này; mới chạy batch thử để kiểm author box, link tác giả và schema.

## Việc vừa làm

- Tạo tool reusable `tools/insert_author_nguyen_song_hao.mjs`.
- Tool có cơ chế upsert bằng marker `ttcqn-author-nguyen-song-hao`, tránh chèn trùng khi chạy lại.
- Chèn vào 2 post:
  - Post `2377`: `/thong-tac-bon-cau-khan-cap-quang-ninh/`
  - Post `2378`: `/thong-tac-bon-cau-khan-cap-quang-ninh-2/`
- Mỗi bài được thêm:
  - Byline sau đoạn đầu: `Tác giả: Nguyễn Song Hào`.
  - Author box cuối bài trước phần liên hệ/CTA.
  - JSON-LD `BlogPosting` có `author.name` và `author.url`.
  - `dateModified` theo thời điểm cập nhật ngày 02/06/2026.

## Backup

- Backup trước lần apply cuối:
  - `seo-revisions/wp-before-author-nguyen-song-hao-2026-06-02T02-40-00-572Z/posts-2377-thong-tac-bon-cau-khan-cap-quang-ninh.json`
  - `seo-revisions/wp-before-author-nguyen-song-hao-2026-06-02T02-40-00-572Z/posts-2378-thong-tac-bon-cau-khan-cap-quang-ninh-2.json`

## Báo cáo / bằng chứng

- Report apply live: `WORDPRESS_AUTHOR_NGUYEN_SONG_HAO_2026-06-02T02-40-00-572Z.json`
- Public verify:
  - Cả 2 URL HTTP 200.
  - Public HTML có `Nguyễn Song Hào`.
  - Public HTML có link `https://thongtaccongquangninh.com/nguyen-song-hao/`.
  - Public HTML có marker `ttcqn-author-nguyen-song-hao`.
  - Public HTML có `BlogPosting`.
  - Public HTML có ngày cập nhật `2/6/2026`.
- Audit ảnh toàn site sau khi thêm author:
  - JSON: `reports/wp-unique-image-audit-2026-06-02T09-40-27.json`
  - Markdown: `reports/wp-unique-image-audit-2026-06-02T09-40-27.md`

## Kết quả audit ảnh sau cùng

- `totalContent`: 74
- `pagesWithIssues`: 0
- `samePageDuplicatePages`: 0
- `pagesUnderThreeImages`: 0
- `globalReuseGroups`: 8

## Việc tiếp theo

- Nhân rộng author box Nguyễn Song Hào cho toàn bộ bài SEO publish sau khi rà danh sách URL và tránh các page renderer/plugin custom.
