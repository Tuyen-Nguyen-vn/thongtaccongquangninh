# TOOL STACK SEO — thongtaccongquangninh

> Danh sách công cụ SEO sử dụng cho dự án. Mọi agent đọc file này trước khi audit đối thủ, viết bài, hoặc check chính tả.

## Bảng tool

| # | Tool | Loại | Mục đích sử dụng | Khi nào dùng |
|---|------|------|------------------|--------------|
| 1 | **SEO META in 1 CLICK** | Extension trình duyệt | Soi nhanh meta tag, heading, OG, canonical, hreflang, robots, schema của 1 trang | Khi audit 1 URL đối thủ hoặc kiểm tra trang của mình trước khi public |
| 2 | **Wappalyzer** | Extension trình duyệt | Phát hiện công nghệ đối thủ đang dùng (CMS, theme, plugin SEO, analytics, CDN, ngôn ngữ) | Khi nghiên cứu đối thủ top Quảng Ninh để biết họ dựng site bằng gì |
| 3 | **LanguageTool** | Web / extension | Bắt lỗi chính tả, ngữ pháp tiếng Việt khi viết bài SEO | Trước khi đưa bài qua `docs/SEO_CHECKLIST.md` |
| 4 | **Claude SEO** | Repo skill/script local | Checklist phụ cho technical SEO, local SEO, content/E-E-A-T, schema, image SEO, AI Search/GEO | Khi cần audit sâu; đọc `docs/CLAUDE_SEO_TTCQN_INTEGRATION_2026-06-27.md`, chạy script trong `_tmp/claude-seo` nếu đã có venv |
| 5 | **Google Labs DESIGN.md** | Local design-system gate | Lint `DESIGN.md` và kiểm mapping token với CSS renderer | Trước khi nghiệm thu mọi sửa UI, màu, typography, CTA, card, hero, footer hoặc spacing: chạy `npm run design:check` |
| 6 | **Footer Back-Top Live Deploy** | Local deploy script | Backup-first deploy footer interaction renderer live qua hosting MCP | Chỉ dùng khi cần tách bước để debug hoặc rerun riêng phần deploy |
| 7 | **Footer Live Verify** | Local QA script | Verify public footer interaction, mobile overflow, map, CTA và back-top trên 7 scenario | Khi cần xác nhận public footer sau deploy hoặc sau cache purge: chạy `npm run verify:footer-live` |
| 8 | **Footer Back-Top Live Release** | Local wrapper script | Chạy trọn vòng deploy rồi verify footer interaction bằng 1 lệnh | Đây là lệnh mặc định cho mọi lần sửa footer interaction: chạy `npm run release:footer-backtop-live`; nếu chỉ muốn test workflow không ghi live, chạy `npm run release:footer-backtop-dry-run` |
| 9 | **Footer Back-Top Latest Report** | Local report helper | In tóm tắt report footer release mới nhất: success, purge status, HTTP status, strict matches | Khi cần xem nhanh kết quả gần nhất mà không tự mở JSON: chạy `npm run report:footer-backtop-latest` |
| 10 | **Footer Back-Top Postcheck** | Local post-deploy helper | Chạy verify public rồi in ngay summary ngắn gọn của report footer gần nhất | Khi cần recheck nhanh sau cache hoặc sau vài phút: chạy `npm run footer:postcheck` hoặc alias ngắn `npm run footer:status` |
| 11 | **Footer Back-Top Help** | Local command helper | In cheat sheet các lệnh footer: release, dry-run, report, verify, deploy-debug | Khi không muốn nhớ lệnh tay: chạy `npm run help:footer-backtop` hoặc alias ngắn `npm run footer:help` |
| 12 | **Footer Back-Top Status Short** | Local status helper | In 1 dòng summary footer live cho terminal/script/cron, vẫn trả exit code 0/1 | Khi cần log ngắn hoặc gate tự động: chạy `npm run footer:status-short` |
| 13 | **Google Chrome Web Vitals** | JS library / reference | Đo lường Core Web Vitals thực tế của người dùng (RUM) gửi về GA4 | Khi tối ưu hóa PageSpeed Mobile, chẩn đoán LCP/CLS/INP thực tế của người dùng |

## Quy trình áp dụng

### Audit đối thủ
1. Mở URL đối thủ.
2. Chạy **SEO META in 1 CLICK** → ghi lại: title length, meta description, H1, H2, schema có hay không.
3. Chạy **Wappalyzer** → ghi lại: CMS (WordPress/Wix/Haravan…), theme, plugin SEO (Rank Math/Yoast), analytics.
4. Lưu kết quả vào file audit cùng task, không lưu vào TOOLS.md.

### Viết bài SEO
1. Hoàn thành bản nháp theo `AGENTS.md` + `docs/SEO_RULES.md`.
2. Dán bài vào **LanguageTool** → fix toàn bộ lỗi chính tả/ngữ pháp tiếng Việt.
3. Chạy `tools/seo_score.py`.
4. Chạy `docs/SEO_CHECKLIST.md`.
5. Public.

### Sửa giao diện / renderer
1. Đọc `DESIGN.md` và `docs/DESIGN_TOKEN_MAPPING.md`.
2. Sửa UI/CSS/renderer theo token có sẵn, không hard-code palette mới.
3. Chạy `npm run design:check`.
4. Nếu có thay đổi frontend thật, kiểm preview hoặc public URL với cache-buster.
5. Chỉ nghiệm thu khi linter `0 errors / 0 warnings` và mapping trả `ok: true`.

### Deploy footer interaction live
1. Sửa 1 nguồn chung tại `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/shared-footer-interactions-inline.php` nếu thay đổi chỉ là accordion/footer back-top.
2. Chạy `npm run release:footer-backtop-live`.
3. Chỉ khi cần tách bước hoặc điều tra lỗi mới dùng riêng `npm run deploy:footer-backtop-live` rồi `npm run verify:footer-live`.
4. Chỉ chốt khi report deploy `success: true` và verify trả `passed 7/7`.
5. Nếu report có `purgeOk=false`, coi là warning đã biết của host hiện tại; không fail workflow nếu các điều kiện ở bước 4 đều đạt.
6. Nếu chỉ cần xem workflow sẽ chạy gì mà không ghi live, dùng `npm run release:footer-backtop-dry-run`.
7. Nếu cần xem nhanh kết quả gần nhất, dùng `npm run report:footer-backtop-latest`.
8. Nếu cần xem nhanh nên dùng lệnh nào, dùng `npm run help:footer-backtop`.
9. Khi muốn verify lại rồi nhìn report gần nhất ngay sau đó, dùng `npm run footer:postcheck`.
10. Khi chỉ muốn xem footer live hiện tại có ổn không, dùng `npm run footer:status`.
11. Khi cần 1 dòng log ngắn cho shell/cron, dùng `npm run footer:status-short`.
12. Khi muốn gõ nhanh hơn, dùng alias `npm run footer:release`, `footer:dry-run`, `footer:report`, `footer:verify`, `footer:postcheck`, `footer:status`, `footer:status-short`, `footer:help`, `footer:deploy`.

### Đo lường hiệu suất Live (Real User Monitoring)
1. Đọc hướng dẫn tích hợp tại [WEB_VITALS_TTCQN_INTEGRATION_2026-06-28.md](file:///D:/.thongtaccongquangninh/docs/WEB_VITALS_TTCQN_INTEGRATION_2026-06-28.md).
2. Sử dụng đoạn mã module/classic script tích hợp `web-vitals` vào footer của site.
3. Thực hiện QA & Smoke test qua tab Network và GA4 Realtime để đảm bảo các metric gửi lên đúng cấu trúc.



## Cập nhật

Khi bổ sung tool mới: thêm dòng vào bảng, thêm bước vào quy trình tương ứng, ghi 1 dòng vào `docs/SEO_PROGRESS.csv`.
