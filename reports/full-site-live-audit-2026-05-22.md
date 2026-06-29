# Audit toàn site live - 2026-05-22

## Phạm vi

- Sitemap index: `https://thongtaccongquangninh.com/sitemap_index.xml`
- Số URL sitemap audit: 78
- REST đối chiếu: 23 posts, 42 pages, 13 categories.
- Kiểm: HTTP, title, meta description, canonical, H1, robots, OG, JSON-LD schema, ảnh lỗi/timeout, Markdown artifact, featured image, Uncategorized.

## Tổng quan

- HTTP 200: 78/78.
- Điểm trung bình: 90/100.
- Theo sitemap: post-sitemap.xml: 22; page-sitemap.xml: 41; category-sitemap.xml: 12; author-sitemap.xml: 3.

## Lỗi theo nhóm

- httpNot200: 0.
- title: 3.
- meta: 32.
- canonical: 0.
- h1: 0.
- ogImage: 16.
- schema: 0.
- brokenImages: 0.
- markdown: 12.
- featured: 13.
- uncategorized: 19.
- bannedImageLabels: 2.

## URL cần xử lý

| # | URL | Loại | Điểm | Vấn đề |
|---|---|---|---:|---|
| 1 | https://thongtaccongquangninh.com/author/chatgpt/ | author | 72 | thiếu meta description; OG title/description thiếu; thiếu og:image; còn Markdown ** |
| 2 | https://thongtaccongquangninh.com/category/bang-gia/ | category | 72 | thiếu meta description; OG title/description thiếu; thiếu og:image; còn Markdown ** |
| 3 | https://thongtaccongquangninh.com/category/blog/ | category | 72 | thiếu meta description; OG title/description thiếu; thiếu og:image; còn Markdown ** |
| 4 | https://thongtaccongquangninh.com/category/canh-bao/ | category | 72 | thiếu meta description; OG title/description thiếu; thiếu og:image; còn Markdown ** |
| 5 | https://thongtaccongquangninh.com/category/huong-dan-tai-nha/ | category | 72 | thiếu meta description; OG title/description thiếu; thiếu og:image; còn Markdown ** |
| 6 | https://thongtaccongquangninh.com/category/hut-be-phot/ | category | 72 | thiếu meta description; OG title/description thiếu; thiếu og:image; còn Markdown ** |
| 7 | https://thongtaccongquangninh.com/category/nao-vet-ho-ga/ | category | 72 | thiếu meta description; OG title/description thiếu; thiếu og:image; còn Markdown ** |
| 8 | https://thongtaccongquangninh.com/category/thong-tac-bon-cau/ | category | 72 | thiếu meta description; OG title/description thiếu; thiếu og:image; còn Markdown ** |
| 9 | https://thongtaccongquangninh.com/category/thong-tac-cong/ | category | 72 | thiếu meta description; OG title/description thiếu; thiếu og:image; còn Markdown ** |
| 10 | https://thongtaccongquangninh.com/category/uncategorized/ | category | 72 | thiếu meta description; OG title/description thiếu; thiếu og:image; còn Markdown ** |
| 11 | https://thongtaccongquangninh.com/category/xu-ly-mui-hoi/ | category | 72 | thiếu meta description; OG title/description thiếu; thiếu og:image; còn Markdown ** |
| 12 | https://thongtaccongquangninh.com/author/admin/ | author | 79 | thiếu meta description; OG title/description thiếu; thiếu og:image |
| 13 | https://thongtaccongquangninh.com/author/cuben01/ | author | 79 | thiếu meta description; OG title/description thiếu; thiếu og:image |
| 14 | https://thongtaccongquangninh.com/category/bang-gia-blog/ | category | 79 | thiếu meta description; OG title/description thiếu; thiếu og:image |
| 15 | https://thongtaccongquangninh.com/category/huong-dan/ | category | 79 | thiếu meta description; OG title/description thiếu; thiếu og:image |
| 16 | https://thongtaccongquangninh.com/cau-hoi-thuong-gap-thong-tac-cong/ | post | 79 | thiếu og:image; post thiếu featured image; post còn Uncategorized |
| 17 | https://thongtaccongquangninh.com/bon-cau-rut-cham-nguyen-nhan-3/ | post | 86 | post thiếu featured image; post còn Uncategorized |
| 18 | https://thongtaccongquangninh.com/chinh-sach-bao-mat/ | page | 86 | title length 39; còn nhãn ảnh cấm/không nên dùng |
| 19 | https://thongtaccongquangninh.com/chu-ky-hut-be-phot-3/ | post | 86 | post thiếu featured image; post còn Uncategorized |
| 20 | https://thongtaccongquangninh.com/hoa-chat-tu-thong-cong-3/ | post | 86 | post thiếu featured image; post còn Uncategorized |
| 21 | https://thongtaccongquangninh.com/hut-be-phot-ba-che-2/ | post | 86 | post thiếu featured image; post còn Uncategorized |
| 22 | https://thongtaccongquangninh.com/hut-be-phot-binh-lieu-2/ | post | 86 | post thiếu featured image; post còn Uncategorized |
| 23 | https://thongtaccongquangninh.com/hut-be-phot-co-to-2/ | post | 86 | post thiếu featured image; post còn Uncategorized |
| 24 | https://thongtaccongquangninh.com/hut-be-phot-dam-ha-2/ | post | 86 | post thiếu featured image; post còn Uncategorized |
| 25 | https://thongtaccongquangninh.com/mui-hoi-cong-nguyen-nhan-xu-ly-4/ | post | 86 | post thiếu featured image; post còn Uncategorized |
| 26 | https://thongtaccongquangninh.com/nao-vet-ho-ga/ | post | 86 | post thiếu featured image; post còn Uncategorized |
| 27 | https://thongtaccongquangninh.com/thong-tac-bon-cau-bi-tac/ | post | 86 | post thiếu featured image; post còn Uncategorized |
| 28 | https://thongtaccongquangninh.com/thong-tac-cong-bai-chay/ | post | 86 | còn Markdown **; post còn Uncategorized |
| 29 | https://thongtaccongquangninh.com/thong-tac-cong-tuan-chau/ | post | 86 | post thiếu featured image; post còn Uncategorized |
| 30 | https://thongtaccongquangninh.com/xu-ly-mui-hoi-nha-ve-sinh/ | post | 86 | post thiếu featured image; post còn Uncategorized |
| 31 | https://thongtaccongquangninh.com/ | page | 93 | còn nhãn ảnh cấm/không nên dùng |
| 32 | https://thongtaccongquangninh.com/gioi-thieu/ | page | 93 | title length 44 |
| 33 | https://thongtaccongquangninh.com/he-thong-lien-ket-doi-tac/ | page | 93 | meta length 73 |
| 34 | https://thongtaccongquangninh.com/hut-be-phot-hai-ha-2/ | post | 93 | post còn Uncategorized |
| 35 | https://thongtaccongquangninh.com/hut-be-phot-mong-cai/ | page | 93 | meta length 118 |
| 36 | https://thongtaccongquangninh.com/hut-be-phot-quang-ninh/ | page | 93 | meta length 103 |
| 37 | https://thongtaccongquangninh.com/hut-be-phot-tien-yen-2/ | post | 93 | post còn Uncategorized |
| 38 | https://thongtaccongquangninh.com/hut-be-phot-van-don/ | page | 93 | meta length 110 |
| 39 | https://thongtaccongquangninh.com/lien-he/ | page | 93 | title length 41 |
| 40 | https://thongtaccongquangninh.com/nao-vet-ho-ga-quang-ninh/ | page | 93 | meta length 75 |
| 41 | https://thongtaccongquangninh.com/nguyen-nhan-cong-tac-thuong-xuyen-ha-long/ | page | 93 | meta length 99 |
| 42 | https://thongtaccongquangninh.com/thong-tac-bon-cau-cam-pha/ | page | 93 | meta length 118 |
| 43 | https://thongtaccongquangninh.com/thong-tac-bon-cau-mong-cai/ | page | 93 | meta length 116 |
| 44 | https://thongtaccongquangninh.com/thong-tac-bon-cau-uong-bi/ | page | 93 | meta length 116 |
| 45 | https://thongtaccongquangninh.com/thong-tac-bon-cau-van-don/ | page | 93 | meta length 117 |
| 46 | https://thongtaccongquangninh.com/thong-tac-chau-rua-quang-ninh/ | page | 93 | meta length 71 |
| 47 | https://thongtaccongquangninh.com/thong-tac-cong-cao-xanh-2/ | post | 93 | post còn Uncategorized |
| 48 | https://thongtaccongquangninh.com/thong-tac-cong-chung-cu-ha-long/ | page | 93 | meta length 96 |
| 49 | https://thongtaccongquangninh.com/thong-tac-cong-dong-trieu/ | page | 93 | meta length 85 |
| 50 | https://thongtaccongquangninh.com/thong-tac-cong-gieng-day-2/ | post | 93 | post còn Uncategorized |
| 51 | https://thongtaccongquangninh.com/thong-tac-cong-hong-gai-2/ | post | 93 | post còn Uncategorized |
| 52 | https://thongtaccongquangninh.com/thong-tac-cong-mong-cai/ | page | 93 | meta length 83 |
| 53 | https://thongtaccongquangninh.com/thong-tac-cong-ngo-nho-ha-long/ | page | 93 | meta length 93 |
| 54 | https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/ | page | 93 | meta length 101 |
| 55 | https://thongtaccongquangninh.com/thong-tac-cong-van-don/ | page | 93 | meta length 102 |

## URL đạt 100

- https://thongtaccongquangninh.com/dau-hieu-be-phot-can-hut/
- https://thongtaccongquangninh.com/cach-xu-ly-cong-thoat-nuoc-tac/
- https://thongtaccongquangninh.com/bang-gia-hut-be-phot-quang-ninh-2026/
- https://thongtaccongquangninh.com/thong-tac-cong-quang-yen/
- https://thongtaccongquangninh.com/hut-be-phot-cam-pha/
- https://thongtaccongquangninh.com/blog/
- https://thongtaccongquangninh.com/thong-tac-bon-cau-quang-ninh/
- https://thongtaccongquangninh.com/hut-be-phot-ha-long/
- https://thongtaccongquangninh.com/hut-be-phot-uong-bi/
- https://thongtaccongquangninh.com/thong-tac-cong-ha-long/
- https://thongtaccongquangninh.com/thong-tac-cong-uong-bi/
- https://thongtaccongquangninh.com/hut-be-phot-quang-yen/
- https://thongtaccongquangninh.com/thong-tac-bon-cau-dong-trieu/
- https://thongtaccongquangninh.com/thong-tac-bon-cau-ha-long/
- https://thongtaccongquangninh.com/thong-tac-bon-cau-quang-yen/
- https://thongtaccongquangninh.com/chi-phi-hut-be-phot-quang-ninh-2/
- https://thongtaccongquangninh.com/bang-gia/
- https://thongtaccongquangninh.com/chinh-sach-bao-hanh/
- https://thongtaccongquangninh.com/thong-tac-cong-nha-hang-ha-long/
- https://thongtaccongquangninh.com/thong-tac-cong-cam-pha/
- https://thongtaccongquangninh.com/hut-be-phot-dong-trieu/
- https://thongtaccongquangninh.com/hut-be-phot-bai-chay/
- https://thongtaccongquangninh.com/xu-ly-mui-hoi-quang-ninh/

## Ưu tiên sửa

1. Sửa URL HTTP khác 200 và canonical mismatch trước.
2. Gán featured image/OG image cho bài thiếu ảnh.
3. Loại `Uncategorized` khỏi posts.
4. Chuẩn hóa title/meta cho URL dài/ngắn bất thường.
5. Rà schema cho category/author/page thiếu JSON-LD nếu cần index.

## File dữ liệu chi tiết

- `reports/full-site-live-audit-2026-05-22.json`
