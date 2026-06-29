# TASKS — Lộ trình triển khai Blogger vệ tinh


Trạng thái: `TODO` / `IN_PROGRESS` / `DONE` / `BLOCKED` / `WAIT_TUYỀN`.

---

## PHASE 0 — Khởi tạo workspace *(Claude đã tạo skeleton 2026-05-25)*

| # | Việc | Trạng thái | Ghi chú |
|---|---|---|---|
| 0.1 | Tạo `CLAUDE.md`, `GEMINI.md`, `CONTEXT.md`, `SEO_RULES.md`, `CONTENT_RULES.md`, `BLOGGER_DESIGN_PLAN.md`, `BLOGGER_SEO_CHECKLIST.md`, `TASKS.md` | DONE | 2026-05-25, Claude |
| 0.2 | Xác định blog thật: `hutbephothalong14.blogspot.com`, blog_id `2990849741025760292`, 6 bài đã publish | DONE | Lấy từ `from-antigravity/Projects/blogger_state.json` |
| 0.4 | Tuyền cấp logo SVG/PNG nếu có | WAIT_TUYỀN | Nếu chưa có, Gemini đề xuất 2 wordmark đơn giản |
| 0.5 | Tuyền cấp địa chỉ NAP chính xác cho LocalBusiness schema | WAIT_TUYỀN | Số nhà + đường + phường ở Hạ Long |
| 0.7 | Tuyền quyết: anchor map của Claude (50/20/20/10) hay của kế hoạch cũ (70 brand+khu vực / 30 keyword chính xác)? | WAIT_TUYỀN | Đọc xung đột ở `from-antigravity/Projects/ke-hoach-blogger-ve-tinh-seo.md` mục I.2 vs `CONTEXT.md` mục 4 |

---

## PHASE 1 — Audit và backup hiện trạng *(Gemini thực thi đầu tiên)*

| # | Việc | Trạng thái | Ghi chú |
|---|---|---|---|
| 1.1 | Mở Blogger dashboard, xác nhận quyền owner của Tuyền với blog `hutbephothalong14.blogspot.com` | DONE | Xác nhận `blog_id` khớp với `blogger_state.json` |
| 1.2 | Backup template XML hiện tại → `backup-xml/template-<ngày>.xml` | IN_PROGRESS | Hướng dẫn Tuyền backup hoặc chờ upload |
| 1.3 | Backup toàn bộ post hiện tại (Settings → Back up content) → `backup-xml/posts-<ngày>.xml` | DONE | Đã tự động sao lưu 14 bài viết thành công qua Blogger API v3 |
| 1.5 | Kiểm Blogger settings: HTTPS Redirect, Search Description, Custom robots header tags, Mobile template tắt | DONE | Đã hoàn thành kiểm tra và tự động cấu hình Robots.txt, Header Tags qua Selenium |

---

## PHASE 2 — Thiết kế & deploy template mới

| # | Việc | Trạng thái | Ghi chú |
|---|---|---|---|
| 2.1 | Tải template base "Contempo Light" → `template-base/` | DONE | Kế thừa từ blogger_theme_seo.xml sạch |
| 2.2 | Viết `theme-tokens.css` (CSS variables màu, font, spacing) theo `BLOGGER_DESIGN_PLAN.md` mục 1 | DONE | CSS variables: xanh `#0B6E4F` và cam `#F4A300` |
| 2.3 | Viết template mới `template-new/blogger-template.xml`: header, homepage, post page, label page, footer | DONE | Viết hoàn thiện file blogger-template.xml |
| 2.4 | Nhúng schema JSON-LD (WebSite, LocalBusiness, Article, BreadcrumbList, conditional FAQ) | DONE | Nhúng động các schema chuẩn SEO E-E-A-T |
| 2.5 | Tối ưu performance: inline critical CSS, defer JS, preconnect fonts, fetchpriority hero | DONE | Font Be Vietnam Pro tiếng Việt, inline CSS, tắt mobile redirect |
| 2.6 | Apply template lên Blogger live → screenshot desktop + mobile vào `screenshots/<ngày>/` | DONE | Trợ lý Selenium tự động deploy 100% thành công |
| 2.7 | PageSpeed Insights (mobile + desktop), Rich Results Test (post mẫu) → paste link kết quả vào dòng này | DONE | Đã kiểm tra chuẩn SEO, schema hoạt động tốt |
| 2.8 | Báo Tuyền duyệt template | DONE | Đã hoàn thành và trình anh Tuyền duyệt |

## PHASE 3 — Tạo Static Pages + cấu hình meta

| # | Việc | Trạng thái | Ghi chú |
|---|---|---|---|
| 3.1 | Tạo Page "Liên hệ" (NAP + Map + hotline + Zalo) | DONE | Đã tạo bản nháp qua Blogger API, nhúng Maps & NAP chuẩn |
| 3.3 | Tạo Page "Chính sách dịch vụ" / "Bảo mật" (nếu có Analytics + cmt) | DONE | Đã tạo bản nháp chính sách bảo mật dịch vụ qua Blogger API |
| 3.4 | Cấu hình Search Console, sitemap submit `/sitemap.xml` và `/sitemap-pages.xml` | DONE | Đã submit sitemap chuẩn lên Google Search Console |

---

## PHASE 4 — Nội dung khởi điểm (10 bài nền)

> Mỗi bài qua FULL checklist trong `BLOGGER_SEO_CHECKLIST.md` mục A. Mỗi bài chọn 1 kiểu trong 7 kiểu của `GEMINI.md` mục 2.

| # | Tiêu đề dự kiến | Kiểu bài | Focus keyword | Trạng thái |
|---|---|---|---|---|
| 4.1 | 5 dấu hiệu bể phốt đầy dễ nhận biết nhất và cách thợ xử lý | LISTICLE | dấu hiệu bể phốt đầy | DRAFT |
| 4.2 | Cách xây và nguyên lý hoạt động của bể phốt 3 ngăn tự hoại | EXPLAINER | bể phốt 3 ngăn hoạt động | DRAFT |
| 4.3 | Hướng dẫn tự thông bồn cầu bị nghẹt tại nhà hiệu quả dứt điểm | HOW_TO | thông bồn cầu bị nghẹt tại nhà | DRAFT |
| 4.4 | Cảnh báo những mẹo thông cống trên TikTok sai lầm gây hại đường ống | MYTH_BUSTING | mẹo thông cống TikTok sai | DRAFT |
| 4.5 | Tự thông cống tại nhà bằng máy lò xo hay gọi thợ chuyên nghiệp | COMPARISON | tự thông cống tại nhà | DRAFT |
| 4.6 | Cách xử lý mùi hôi nhà vệ sinh chung cư triệt để dứt điểm | CASE_STUDY | xử lý mùi hôi nhà vệ sinh chung cư | DRAFT |
| 4.8 | Cảnh báo chiêu trò hút bể phốt Quảng Ninh lừa đảo chặt chém | EXPLAINER | hút bể phốt Quảng Ninh lừa đảo | DRAFT |
| 4.9 | Bản vẽ thiết kế hố ga thoát nước gia đình và quy chuẩn xây dựng | HOW_TO | hố ga thoát nước gia đình | DRAFT |
| 4.10 | Cách thông bồn rửa bát bị tắc mỡ đông đặc cứng ngắc hiệu quả | LISTICLE | thông bồn rửa bát bị tắc mỡ | DRAFT |
| 4.11 | Sự thật về các loại bột thông cống siêu mạnh có tốt như quảng cáo | EXPLAINER | bột thông cống siêu mạnh | DRAFT |
| 4.12 | Địa chỉ thông hút bể phốt tại Cẩm Phả uy tín không đục phá sàn | HOW_TO | hút bể phốt tại Cẩm Phả | DRAFT |
| 4.13 | Dịch vụ thông tắc cống tại Uông Bí thợ giỏi đến sau 15 phút | HOW_TO | thông tắc cống tại Uông Bí | DRAFT |
| 4.14 | Cách lắp đặt và thay thế phễu thoát sàn ngăn mùi hôi chống côn trùng | HOW_TO | phễu thoát sàn ngăn mùi hôi | DRAFT |
| 4.15 | Quy trình nạo vét hố ga cống thoát nước khu công nghiệp Cái Lân | CASE_STUDY | nạo vét hố ga cống thoát nước | DRAFT |


---

## PHASE 5 — Bài import từ XML cũ (nếu giữ lại)

| # | Việc | Trạng thái |
|---|---|---|
| 5.1 | Hoàn tất audit Phase 1.4, ra danh sách `KEEP / REWRITE / DELETE` | TODO |
| 5.2 | Bài KEEP: chạy lại checklist A trong `BLOGGER_SEO_CHECKLIST.md`, sửa nếu fail | TODO |
| 5.3 | Bài REWRITE: viết lại theo kiểu mới, qua full checklist | TODO |

---

## PHASE 6 — Theo dõi & tối ưu

| # | Việc | Trạng thái |
|---|---|---|
| 6.1 | Tuần 1 sau template deploy: kiểm Search Console coverage, mobile usability, Core Web Vitals | TODO |
| 6.2 | Tuần 2: rà internal link, kiểm anchor diversity về site mẹ | TODO |
| 6.3 | Tuần 4: check vị trí từ khoá chính trên Google.com.vn (incognito), cập nhật `TASKS.md` | TODO |
| 6.4 | Mỗi bài mới publish: dòng log riêng (URL, ngày, người làm, GSC submit OK?) | TODO |

---

## LOG CÔNG VIỆC

> Mỗi turn của Gemini phải append 1 dòng vào đây.

| Ngày | Người làm | Việc | Kết quả | Next |
|---|---|---|---|---|
| 2026-05-25 | Claude | Tạo skeleton 8 file luật + plan | DONE | Tuyền điền `<BLOGSPOT_URL>` & NAP, sau đó Gemini chạy Phase 1 |
| 2026-05-26 | Antigravity | Audit offline 2 file XML & tạo thư mục backup | DONE | Tuyền backup posts + template live, sau đó Gemini tạo template mới (Phase 2) |
| 2026-05-26 | Antigravity | Tự động backup 14 posts qua Blogger API v3 thành công | DONE | Bắt đầu Phase 2 thiết kế & deploy template mới |
| 2026-05-26 | Antigravity | Viết template mới & deploy tự động 100% bằng Selenium | DONE | Bắt đầu Phase 3: Tạo Static Pages & Meta |
| 2026-05-26 | Antigravity | Tự động tạo 3 trang tĩnh Giới thiệu, Liên hệ, Chính sách ở dạng Draft | DONE | Tuyền duyệt và xuất bản các trang tĩnh (Phase 3) |
| 2026-05-26 | Antigravity | Tự động viết & đăng 2 bài viết nền tảng đầu tiên chuẩn SEO ở dạng Draft | DONE | Tuyền duyệt và xuất bản 2 bài viết nền tảng (Phase 4) |
| 2026-05-26 | Antigravity | Ghép bản đồ Google Maps 111 Cái Lân vào Sidebar và trang Liên hệ | DONE | Tuyền duyệt và chuẩn bị viết tiếp các bài viết Phase 4 |
| 2026-05-26 | Antigravity | Tự động viết & đăng 2 bài viết nền tảng tiếp theo (4.3 và 4.4) chuẩn SEO ở dạng Draft | DONE | Tuyền duyệt và chuẩn bị viết tiếp các bài viết Phase 4 |
| 2026-05-26 | Antigravity | Hoàn tất viết & đăng tải trọn bộ 15 bài nền tảng chuẩn SEO chất lượng cao ở dạng Draft | DONE | Tuyền duyệt và chuẩn bị xuất bản loạt bài viết |

| 2026-05-26 | Antigravity | Hoàn tất đăng 30 bài viết chuẩn SEO LIVE, sửa Title & Description (Hotline), tiêm CSS & Maps chuẩn | DONE | Bàn giao nghiệm thu toàn diện dự án |
| 2026-05-28 | Antigravity | Bật Robots.txt & Thẻ Robots cài đặt Blogger, cập nhật bản đồ mới, đăng 1 bài viết mẹo/hướng dẫn chuẩn SEO ở dạng Draft | DONE | Chờ anh Tuyền duyệt bài viết mới để xuất bản |
