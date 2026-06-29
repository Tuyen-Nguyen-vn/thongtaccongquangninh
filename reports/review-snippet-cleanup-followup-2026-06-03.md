# Review Snippet Cleanup Follow-up

Ngày chạy: 2026-06-03

Phạm vi: 3 URL từng bị Google Search Console báo lỗi Review snippet trong report ngày 2026-06-01:

- `https://thongtaccongquangninh.com/`
- `https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/`
- `https://thongtaccongquangninh.com/hut-be-phot-mong-cai/`

## Kết luận

Không cần patch thêm plugin/schema trong lần này vì HTML live hiện tại đã sạch `Review` / `AggregateRating` / rating marker.

Đã submit lại sitemap qua Search Console API để thúc Google crawl lại. Trang chủ đã được Google crawl lại ngày 2026-06-02 và GSC chuyển `richResultsVerdict` sang `PASS`. Hai URL còn lại vẫn `FAIL` trong GSC nhưng `lastCrawlTime` đang cũ hơn trạng thái HTML live sạch hiện tại.

## Kiểm tra live structured data

| URL | Live audit | Review/rating marker | Báo cáo |
|---|---|---|---|
| `/` | PASS | Không thấy | `reports/structured-data-live-audit-2026-06-02T18-39-53.json` |
| `/thong-tac-cong-quang-ninh/` | PASS | Không thấy | `reports/structured-data-live-audit-2026-06-02T18-39-01.json` |
| `/hut-be-phot-mong-cai/` | PASS | Không thấy | `reports/structured-data-live-audit-2026-06-02T18-39-04.json` |

Đã kiểm thêm bằng User-Agent Googlebot với cache-buster `?nowprocket=1&codex=googlebot-review-20260603`: không thấy `AggregateRating`, `Review`, `reviewRating`, `ratingValue`, `bestRating`, `worstRating`, `reviewCount`, `ratingCount`.

## GSC URL Inspection mới

Báo cáo: `reports/gsc-url-inspection-review-snippet-2026-06-03.md`

| URL | Last crawl | Rich result hiện trong GSC | Ghi chú |
|---|---|---|---|
| `/` | 2026-06-02T16:20:54Z | PASS | Đã hết Review snippet fail; GSC chỉ phát hiện FAQ và Videos. |
| `/thong-tac-cong-quang-ninh/` | 2026-06-01T03:25:45Z | FAIL | GSC vẫn dựa trên crawl cũ; live HTML hiện không còn review/rating marker. |
| `/hut-be-phot-mong-cai/` | 2026-05-30T20:08:26Z | FAIL | GSC vẫn dựa trên crawl cũ; live HTML hiện không còn review/rating marker. |

## Search Console sitemap submit

Báo cáo: `reports/search-console-sitemap-submit-2026-06-03T01-39-33.md`

- Submit status: `submitted`
- Sitemap: `https://thongtaccongquangninh.com/sitemap_index.xml`
- Found in GSC sitemap list: có
- Pending: `True`
- Warnings: `0`
- Errors: `0`

## Trạng thái

- `Fixed live`: 3/3 URL sạch Review/rating marker trên HTML public.
- `Fixed in GSC`: 1/3 URL đã PASS (`/`).
- `Pending Google recrawl`: 2/3 URL còn lại.

## Việc tiếp theo

Sau 24-48 giờ, chạy lại URL Inspection cho:

- `/thong-tac-cong-quang-ninh/`
- `/hut-be-phot-mong-cai/`

Nếu `lastCrawlTime` đã mới hơn 2026-06-03 mà vẫn còn Review snippet fail, lúc đó mới cần điều tra sâu Rank Math cache/plugin output theo Googlebot.
