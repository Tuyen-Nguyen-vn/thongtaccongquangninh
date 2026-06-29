# Báo cáo Google Search Console và SEO website - 2026-06-03

Website: `https://thongtaccongquangninh.com/`

Thời điểm kiểm tra: `2026-06-03 02:09 +0700`

## Phạm vi đã kiểm

- Google Search Console Performance API: top query và top page 28 ngày, xấp xỉ `2026-05-03` đến `2026-05-31`.
- Google Search Console URL Inspection API: 9 URL ưu tiên theo impression, CTR thấp và lỗi rich result.
- Search Console Sitemap API: sitemap index đã submit và có trong danh sách GSC.
- Live audit public HTML: `76` page/post publish.
- Inventory REST + sitemap: `88` URL sitemap, `87` URL publish cần audit, `48` URL local SEO landing.
- Structured data live audit: `88/88` PASS.
- Image SEO audit: `76` nội dung.

## Kết luận nhanh

Website không bị chặn index ở nhóm URL chính. Các URL ưu tiên đều `Submitted and indexed`, canonical khớp, robots cho phép crawl.

Vấn đề lớn nhất hiện tại là hiệu suất tìm kiếm chưa tận dụng được impression: nhiều trang đang có vị trí 7-12 nhưng CTR bằng 0 hoặc rất thấp. Nguyên nhân chính là title/meta chưa đủ sắc, title trùng hoặc quá dài, một số trang local mỏng, và GSC còn giữ lỗi rich result từ bản crawl cũ.

## Dữ liệu GSC quan trọng

### Query có click

| Query | Clicks | Impressions | CTR | Position | Nhận định |
|---|---:|---:|---:|---:|---|
| hút bể phốt hạ long | 16 | 67 | 23.88% | 18.4 | Trang có nhu cầu thật, cần đẩy lên top 10. |
| thông tắc cống hạ long | 8 | 19 | 42.11% | 29.1 | CTR tốt, ranking còn xa. |
| thông tắc cống quảng ninh | 3 | 14 | 21.43% | 23.5 | Cần sửa rich result và tăng nội dung/local proof. |
| hút bể phốt quảng ninh | 2 | 91 | 2.20% | 25.0 | CTR thấp, trang pillar cần rewrite title/meta. |

### Query có impression cao nhưng 0 click

| Query | Impressions | Position | Trang ưu tiên |
|---|---:|---:|---|
| hút bể phốt cẩm phả vietanhgroup24h | 262 | 9.0 | `/hut-be-phot-cam-pha/` |
| hút bể phốt tại uông bí | 186 | 8.4 | `/hut-be-phot-uong-bi/` |
| hút bể phốt tại quảng ninh | 180 | 19.7 | `/hut-be-phot-quang-ninh/` |
| hút bể phốt tại cẩm phả | 153 | 18.8 | `/hut-be-phot-cam-pha/` |
| hút bể phốt đông triều vietanhgroup24h | 148 | 6.8 | `/hut-be-phot-dong-trieu/` |

### Page có impression cao nhưng CTR yếu

| URL | Clicks | Impressions | CTR | Position | Vấn đề |
|---|---:|---:|---:|---:|---|
| `/` | 14 | 593 | 2.36% | 9.2 | Meta ngắn, title dài, alt homepage còn lỗi. |
| `/hut-be-phot-cam-pha/` | 5 | 480 | 1.04% | 11.8 | Vị trí gần top 10 nhưng CTR thấp. |
| `/hut-be-phot-uong-bi/` | 0 | 325 | 0% | 10.0 | Cần rewrite title/meta ngay. |
| `/hut-be-phot-dong-trieu/` | 0 | 157 | 0% | 7.2 | GSC rich result FAIL: duplicate FAQ. |
| `/hut-be-phot-mong-cai/` | 1 | 138 | 0.72% | 21.4 | GSC rich result FAIL: review snippet. |

## Kiểm tra index và rich result

| URL | Index | Last crawl | Canonical | Rich result | Lỗi GSC |
|---|---|---|---|---|---|
| `/hut-be-phot-ha-long/` | PASS, Submitted and indexed | 2026-06-02T10:01:07Z | match | PASS | Không |
| `/` | PASS, Submitted and indexed | 2026-06-02T16:20:54Z | match | PASS | Không |
| `/hut-be-phot-cam-pha/` | PASS, Submitted and indexed | 2026-05-27T04:53:58Z | match | PASS | Không |
| `/hut-be-phot-uong-bi/` | PASS, Submitted and indexed | 2026-05-27T05:23:43Z | match | PASS | Không |
| `/hut-be-phot-dong-trieu/` | PASS, Submitted and indexed | 2026-05-23T20:51:08Z | match | FAIL | FAQ duplicate field |
| `/hut-be-phot-mong-cai/` | PASS, Submitted and indexed | 2026-05-30T20:08:26Z | match | FAIL | Review snippet invalid parent |
| `/thong-tac-cong-quang-ninh/` | PASS, Submitted and indexed | 2026-06-01T03:25:45Z | match | FAIL | Review snippet invalid parent |
| `/thong-tac-cong-ha-long/` | PASS, Submitted and indexed | 2026-04-11T07:50:38Z | match | PASS | Không |
| `/category/thong-tac-bon-cau/` | PASS, Submitted and indexed | 2026-05-22T17:12:28Z | match | PASS | Không |

Live structured data audit hiện tại lại `PASS` cho 3 URL lỗi GSC. Nghĩa là HTML public hiện đã sạch, nhưng GSC vẫn giữ bản crawl cũ. Cần request recrawl/validation, không nên vá plugin thêm nếu live Rich Results Test cũng PASS.

## Lỗi kỹ thuật và on-page hiện tại

### Ưu tiên P0

- `thong-tac-bon-cau-khan-cap-quang-ninh` và `thong-tac-bon-cau-khan-cap-quang-ninh-2` trùng title 100%.
- `/thong-tac-bon-cau-nha-hang-quang-ninh-2026/` có internal link 404 tới `/thong-tac-cong-nha-hang-quang-ninh/`.
- GSC rich result vẫn FAIL trên `/hut-be-phot-dong-trieu/`, `/hut-be-phot-mong-cai/`, `/thong-tac-cong-quang-ninh/`.
- Sitemap có 12 category URL đang nằm trong sitemap, gồm `category/uncategorized`, `category/blog`, `category/thong-tac-bon-cau`, `category/hut-be-phot`...

### Ưu tiên P1

- Audit SEO full: `76` URL, chỉ `13` PASS, `33` FAIL, `30` WARN.
- Top issue: content `78`, title/meta `53`, heading `27`, schema `24`, image `14`.
- Nhiều meta description ngắn: `/hut-be-phot-quang-ninh/` 125 ký tự, `/hut-be-phot-mong-cai/` 126, `/thong-tac-cong-quang-ninh/` 130, `/thong-tac-cong-mong-cai/` 121.
- Một số trang local mỏng: `/hut-be-phot-dong-trieu/` 1218 từ, `/hut-be-phot-mong-cai/` 1225 từ, `/thong-tac-cong-dong-trieu/` 1116 từ, `/thong-tac-cong-mong-cai/` 1101 từ.

### Ưu tiên P2

- 6 URL còn từ cấm như `chuyên nghiệp`, `uy tín`.
- Homepage có 8 ảnh alt rỗng và 12 alt chưa bám dịch vụ/địa phương.
- Image audit chỉ còn 2 trang thiếu ảnh: `/dieu-khoan-dich-vu/` và `/chinh-sach-bao-mat/`.
- Có 2 footer variant trên 76 URL; cần giữ theo dõi nếu sau này sửa footer/template.

## Giải pháp cụ thể

### 1. Sửa CTR cho nhóm đang có impression cao

Ưu tiên sửa title/meta theo thứ tự:

1. `/hut-be-phot-uong-bi/`
2. `/hut-be-phot-dong-trieu/`
3. `/hut-be-phot-cam-pha/`
4. `/hut-be-phot-quang-ninh/`
5. `/hut-be-phot-mong-cai/`

Mục tiêu: title riêng 60-70 ký tự, không nhồi năm nếu không cần; meta 150-160 ký tự, có địa phương + tình huống + hotline `0963.953.533`.

### 2. Dọn rich result đang báo lỗi trong GSC

- Chạy live Rich Results Test hoặc URL Inspection live cho 3 URL lỗi.
- Nếu live vẫn PASS, request indexing/validate fix trong GSC.
- Nếu GSC crawl mới sau `2026-06-03` vẫn FAIL, kiểm lại nguồn schema từ Rank Math, plugin `ttcqn-doorway-schema`, plugin cleanup redirect và renderer custom.

### 3. Xóa nhiễu sitemap category

- Loại các `category/*` khỏi sitemap nếu không phải landing có nội dung SEO riêng.
- Đặc biệt xử lý `category/uncategorized/` và các taxonomy rỗng/mỏng.
- Sau khi sửa, submit lại `https://thongtaccongquangninh.com/sitemap_index.xml`.

### 4. Sửa lỗi trùng nội dung và 404

- Gộp hoặc đổi intent 2 bài bồn cầu khẩn cấp trùng title:
  - Giữ 1 bài chính transactional.
  - Bài còn lại đổi thành ngách khác, ví dụ `thông tắc bồn cầu ban đêm Quảng Ninh` hoặc redirect nếu trùng nội dung thật.
- Sửa link 404 trong `/thong-tac-bon-cau-nha-hang-quang-ninh-2026/` sang URL live đúng: `/thong-tac-cong-nha-hang-ha-long/` hoặc trang dịch vụ nhà hàng phù hợp.

### 5. Nâng chất lượng local page mỏng

Với Đông Triều, Móng Cái, Vân Đồn, Quảng Ninh pillar:

- Bổ sung H2 `Nguyên nhân` và `NAP / Liên hệ` nơi thiếu.
- Thêm bối cảnh địa phương thật: tuyến phố, khu chợ, khu dân cư, nhà hàng/khách sạn/khu công nghiệp.
- Thay case study chung bằng tình huống riêng, không copy case từ địa phương khác.
- Giảm keyword stuffing ở trang có mật độ cao.

## File bằng chứng

- `reports/seo-full-audit-2026-06-03.md`
- `reports/site-full-audit-2026-06-03.md`
- `reports/structured-data-live-audit-2026-06-02T19-04-52.md`
- `reports/wp-unique-image-audit-2026-06-03T02-02-44.md`
- `reports/gsc-url-inspection-review-snippet-2026-06-03.md`
- `reports/search-console-sitemap-submit-2026-06-03T01-39-33.md`
- `WP_URL_AUDIT_REPORT_2026-06-02.md`

## Lệnh đã chạy

- `.venv-google/bin/python` gọi Search Console Performance API.
- `.venv-google/bin/python` gọi URL Inspection API cho 9 URL ưu tiên.
- `node tools/collect_wp_url_audit_list.mjs`
- `node tools/audit_seo_full.mjs --no-csv`
- `node tools/audit_live_structured_data.mjs`
- `python3 tools/audit_unique_wp_images.py --no-hash`
- `curl -I -L https://thongtaccongquangninh.com/sitemap_index.xml`
- `curl https://thongtaccongquangninh.com/robots.txt`

## Việc tiếp theo nên làm

Sửa batch P0 gồm: trùng title 2 bài bồn cầu khẩn cấp, link 404, và request recrawl 3 URL rich result đang FAIL trong GSC.
