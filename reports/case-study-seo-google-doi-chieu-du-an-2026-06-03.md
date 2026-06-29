# Đối chiếu Case Study SEO Google với dự án TTCQN

Ngày lập: 2026-06-03

Tài liệu nguồn: `/mnt/d/Downloads/Nghiên cứu Case Study SEO Google.md`

Phạm vi đối chiếu: `thongtaccongquangninh.com`, repo vận hành tại `/mnt/d/.thongtaccongquangninh`. Không sửa WordPress live trong lần này.

## 1. Kết luận nhanh

Tài liệu case study của Google không đưa ra một mẹo SEO đơn lẻ. Mẫu chung là: đưa SEO vào tầng hệ thống, dùng dữ liệu cấu trúc đúng loại trang, kiểm lỗi bằng Search Console, rồi đo tác động bằng click, impression, CTR và chuyển đổi.

Dự án TTCQN đã có nền khá mạnh:

- Đã có báo cáo Search Console và URL Inspection ngày 2026-06-01.
- Live HTML đã có `max-image-preview:large`, canonical, `og:image`, `LocalBusiness`, `FAQPage`, `Service`, `VideoObject` trên các URL mẫu.
- Đã có plugin riêng để kiểm soát schema dịch vụ/video và cleanup sitemap/robots.
- Đã có SOP ảnh SEO, audit ảnh, video SEO, author/schema thử nghiệm.

Khoảng trống lớn nhất không phải là thiếu schema, mà là thiếu một gate định kỳ gom đủ 4 lớp: Search Console, rich result, schema visible-match, image/video preview. GSC hiện vẫn báo rich result fail ở 3 URL mẫu do Review snippet.

## 2. Ma trận đối chiếu

| Case study Google | Áp dụng cho TTCQN | Trạng thái hiện tại | Khoảng trống | Hành động đề xuất |
|---|---|---|---|---|
| Wix: tích hợp Search Console/API vào dashboard vận hành | Rất phù hợp. Site cần theo dõi URL tiền, sitemap, index và query địa phương. | Có `reports/google-search-console-2026-06-01.md`, URL Inspection PASS cho 6 URL chính; có script `tools/submit_search_console_sitemap.py`. | Chưa thành lịch/gate định kỳ. Sitemap summary trong report trả `Submitted: 0`, `Indexed: 0` và đã ghi chú không dùng số đó để kết luận. | Tạo một báo cáo tuần tự động: top queries/pages, URL Inspection URL tiền, rich result issues, sitemap/canonical drift. |
| Vidio/Vimeo/Italiaonline: VideoObject, contentUrl, video index monitoring | Phù hợp ở mức chọn lọc cho trang chủ và trang dịch vụ tiền. Không cần HLS/M3U8 phức tạp. | Live trang chủ và 2 trang `/hut-be-phot-quang-ninh/`, `/thong-tac-cong-quang-ninh/` có `VideoObject`; report video SEO đã verify MP4/YouTube metadata. | Chưa mở rộng có kiểm soát cho các trang tiền khác; chưa có `Clip`/`SeekToAction` cho key moments nếu video đủ nội dung; chưa có video riêng cho bồn cầu, hố ga, mùi hôi. | Chỉ nhân rộng video khi video đúng dịch vụ. Trang thiếu video riêng giữ `PENDING_VIDEO_ASSET`, không gắn nhầm. |
| Eventbrite: schema trong base template | Rất phù hợp với local service page. | Plugin `ttcqn-doorway-schema` đã sinh `Service`, `LocalBusiness`, `VideoObject`, `BlogPosting`, `FAQPage`; home renderer có graph schema riêng. | Có nguy cơ nhiều lớp schema cùng tồn tại: Rank Math + plugin custom + JSON-LD trong content. GSC đang báo Review snippet fail ở `/`, `/thong-tac-cong-quang-ninh/`, `/hut-be-phot-mong-cai/`. | Ưu tiên audit/gỡ schema Review/AggregateRating sai hoặc trùng trước khi thêm schema mới. |
| Saramin/JobPosting, Eventbrite/Event, Rakuten/Recipe | Không áp trực tiếp. TTCQN là site dịch vụ địa phương, không phải tuyển dụng, event, recipe. | Dự án đã có mapping schema đúng hơn: `LocalBusiness`, `Service`, `FAQPage`, `BreadcrumbList`, `BlogPosting`. | Nếu bê nguyên JobPosting/Event/Recipe sẽ thành structured data spam. | Không áp các schema không khớp nội dung visible. |
| Kirbie/Istoé: `max-image-preview:large` cho Discover/ảnh lớn | Phù hợp cho blog, trang dịch vụ có ảnh lớn, video/ảnh thực tế. | Live HTML URL mẫu có robots `max-image-preview:large`; `og:image` có trên home và trang dịch vụ. | Cần audit preferred image toàn site: ảnh nào đang là `og:image`, kích thước có đủ 1200px/300k pixels không, có phải poster/banner nhiều chữ không. | Thêm cột `preferredImageOk` vào audit ảnh/SEO URL tiền. |
| Rakuten: structured data + tốc độ/mobile + monitoring | Phù hợp. Site local cần schema đúng, ảnh nhẹ, mobile CTA không che nội dung. | Có nhiều báo cáo visual/mobile, audit ảnh đạt `pagesWithIssues=0` gần đây. | Còn `globalReuseGroups=8` cần review; chưa thấy gate định kỳ Core Web Vitals/PageSpeed trong cùng báo cáo SEO tuần. | Gộp PageSpeed/mobile snapshot vào báo cáo SEO tuần cho 5 URL tiền. |
| Google AI features/AI Overview | Áp dụng ở mức điều kiện nền: indexable, snippet-eligible, content hữu ích, schema khớp visible. | Repo đã có `ARTICLE_SEO_AI_OVERVIEW_CHECKLIST.md` và module Google Search Central. | Không được hứa “đảm bảo lên AI Overview”. Cần tiếp tục loại schema sai và nội dung local trùng. | Giữ hướng hiện tại: helpful content, local entity riêng, kiểm snippet controls. |

## 3. Bằng chứng đã kiểm

### File/report trong project

- `reports/google-search-console-2026-06-01.md`: có top queries/pages, URL Inspection, rich result issues.
- `reports/google-search-console-url-inspection-2026-06-01.json`: 6 URL chính đều `verdict: PASS`, `INDEXING_ALLOWED`, canonical khớp; 3 URL rich result `FAIL`.
- `reports/ai_overview_schema_audit.md`: 39/44 trang đạt chuẩn schema/index theo audit ngày 2026-05-22.
- `reports/HOME_VIDEO_SEO_REPORT_2026-05-30.md`: video trang chủ đã có `VideoObject`, verify live và browser.
- `tools/wp-plugins/ttcqn-doorway-schema/ttcqn-doorway-schema.php`: sinh schema dịch vụ, video, blog, local business.
- `tools/wp-plugins/ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects.php`: kiểm soát robots/noindex author archive và `max-image-preview:large`.

### Public HTML đã kiểm bằng cache-buster

- `/`: có `index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large`, canonical self, `og:image`, `LocalBusiness`, `FAQPage`, `VideoObject`.
- `/hut-be-phot-quang-ninh/`: có canonical self, `og:image`, `LocalBusiness`, `BreadcrumbList`, `Service`, `VideoObject`, `FAQPage`.
- `/thong-tac-cong-quang-ninh/`: có canonical self, `og:image`, `LocalBusiness`, `BreadcrumbList`, `Service`, `VideoObject`, `FAQPage`.
- `/robots.txt`: allow crawl, chặn `/wp-admin/`, khai báo `Sitemap: https://thongtaccongquangninh.com/sitemap_index.xml`.

## 4. Rủi ro cần xử lý trước khi mở rộng

1. Rich result fail do Review snippet là điểm đỏ rõ nhất từ GSC. Không nên thêm schema mới trước khi dọn nguồn sinh review/rating sai.
2. Video schema chỉ nên dùng khi video visible và đúng dịch vụ. Không lấy video tổng quan gắn sang bồn cầu/hố ga nếu nội dung video không thể hiện dịch vụ đó.
3. Ảnh Discover/large preview cần ảnh đại diện rõ dịch vụ, ít chữ, đủ lớn. Không dùng poster quảng cáo làm ảnh chính cho bài SEO.
4. Schema template phải khớp nội dung visible. Với local page, tránh copy cùng FAQ/case/CTA giữa nhiều địa phương.
5. Các case study về JobPosting/Event/Recipe không phù hợp với site này; chỉ lấy nguyên tắc template + monitoring, không lấy loại schema.

## 5. Việc nên làm tiếp theo

Ưu tiên 1 việc: xử lý rich result Review snippet fail trên 3 URL đang bị GSC báo lỗi: `/`, `/thong-tac-cong-quang-ninh/`, `/hut-be-phot-mong-cai/`.

Lý do: đây là lỗi có bằng chứng từ URL Inspection, ảnh hưởng trực tiếp khả năng eligible rich result. Sau khi sạch lỗi Review snippet, mới nên mở rộng gate tự động cho video/image/schema theo mô hình case study Google.
