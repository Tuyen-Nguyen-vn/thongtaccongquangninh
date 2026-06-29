# Quy trình AI Agent xây dựng và tối ưu website SEO

Ngày hợp nhất: 2026-05-23

Nguồn hợp nhất:

- `docs/source-materials/SEO Action Plan.docx`
- `AI_AGENT_RULES.md`
- `SEO_RULES.md`
- `CONTENT_RULES.md`
- `CODE_CLEANUP_RULES.md`
- `ARTICLE_SEO_AI_OVERVIEW_CHECKLIST.md`
- `AGENTS.md`
- `CLAUDE.md`
- `CODEX_CONTEXT.md`
- `docs/seo-rules-for-ai-agents.md`
- `docs/GOOGLE_SEARCH_CENTRAL_MODULES_2026-05-23.md`

Tài liệu này là **quy trình chuẩn dùng lại cho AI Agent khi làm website SEO**. Nó không thay thế luật riêng của từng dự án. Khi có xung đột:

1. Yêu cầu mới nhất của user trong phiên hiện tại.
2. Luật an toàn hệ thống và chính sách nền tảng.
3. Luật dự án đang làm như `AGENTS.md`, `CLAUDE.md`, `CODEX_CONTEXT.md`, checklist và SOP địa phương.
4. Quy trình dùng chung trong file này.

## 1. Kết luận sau khi đối chiếu

### 1.1. Phần trong DOCX đã trùng với luật dự án


| Chủ đề | Đã có ở đâu | Quyết định hợp nhất |
|---|---|---|
| Mobile-first, title/meta/H1/canonical/robots/sitemap | `SEO_RULES.md`, checklist bài, SOP kỹ thuật | Giữ gate hiện tại. |

### 1.2. Phần mới đáng nhập từ DOCX

Các ý dưới đây là phần có giá trị dùng lại cho website khác:

1. Chia quy trình theo vòng đời website: intake -> ownership/measurement -> architecture -> implementation -> content/schema -> security -> monitoring.
2. Tách **việc trong code** khỏi **việc cần tài khoản/quyền ngoài code** như Search Console, Google Business Profile, Analytics, Looker Studio, submit sitemap.
3. Chọn module theo loại website:
   - local business;
   - ecommerce;
   - news;
   - multilingual/international;
   - blog/service website.
4. Bổ sung security và anti-spam vào quy trình SEO thay vì coi đó là việc ngoài phạm vi.
5. Bổ sung vòng monitoring: Search Console, sitemap/robots, index/rich result errors, Core Web Vitals, query/page CTR, traffic drop review.
6. Yêu cầu agent phải để lại tài liệu vận hành, test và bằng chứng sau thay đổi.
7. Bổ sung module Search appearance theo tài liệu Google user gửi thêm: paywall sampling, Discover, favicon Search, featured snippets, AI features controls, Image SEO và byline date.

### 1.3. Điểm cần chuẩn hóa lại trước khi dùng

| Ý từ DOCX | Rủi ro nếu bê nguyên | Quy tắc hợp nhất |
|---|---|---|
| Case study thực tế trong mọi bài | Dễ bịa hoặc gắn case sai địa phương | Chỉ dùng `case thực tế` khi có bằng chứng; nếu chưa có dùng `tình huống thường gặp`. |
| Business Profile, Search Console, Analytics | Có thể cần đăng nhập/quyền chủ sở hữu | Agent chuẩn bị checklist/code/hướng dẫn; chỉ thao tác khi có quyền hoặc user cho phép. |

## 2. Nguyên tắc bắt buộc cho mọi AI Agent


1. Đọc context dự án trước khi sửa.
2. Xác định rõ loại website, mục tiêu chuyển đổi, đối tượng người dùng, vùng SEO, stack kỹ thuật và quyền thao tác.
   - thông tin doanh nghiệp;
   - địa chỉ/hotline;
   - review/rating;
   - case;
   - chứng chỉ;
   - thông số;
   - claim ảnh thực tế.

### 2.2. Ranh giới việc trong code và ngoài code

| Nhóm việc | Agent được tự làm khi có repo/quyền | Cần xác nhận hoặc quyền ngoài |
|---|---|---|
| Search Console verification, submit sitemap, URL inspection, Business Profile claim, Analytics/Tag Manager property, Merchant Center | Chuẩn bị code/checklist/evidence | Cần tài khoản hoặc user duyệt |
| Live CMS update, plugin upload, publish, bulk change | Chỉ làm khi dự án/user cho phép và có backup | Phải tôn trọng gate dự án |

## 3. Quy trình chuẩn 10 pha

## Pha 0 - Intake và overlay dự án

Agent phải chốt:

1. Loại website:
   - local service;
   - ecommerce;
   - publisher/news;
   - SaaS/product;
   - portfolio/brand;
   - multilingual.
2. Mục tiêu:
   - lead;
   - call;
   - form;
   - checkout;
   - booking;
   - traffic/information.
3. Tài liệu phải đọc:
   - `AGENTS.md` hoặc file luật tương đương;
   - context thương hiệu;
   - task/status/audit gần nhất;
   - stack/config liên quan;
   - SOP publish/live nếu có.
4. Source of truth:
   - code template;
   - CMS `post_content`;
   - option/meta/plugin renderer;
   - external service.
5. Rủi ro:
   - live publish;
   - bulk edit;
   - delete;
   - tài khoản/OTP/captcha;
   - claim pháp lý hoặc giá.

Output pha 0:

- phạm vi sửa;
- file/URL chịu tác động;
- test dự kiến;
- gate cần tuân theo.

## Pha 1 - Ownership, crawlability và measurement

Mục tiêu là để website có nền kiểm tra được.

Checklist:

1. HTTPS hoạt động và redirect chuẩn.
2. URL quan trọng crawl được.
3. XML sitemap có nguồn sinh rõ.
5. Search Console verification plan có sẵn.
6. Analytics/Tag Manager plan rõ, không gắn tag trùng.
7. Với local business: Business Profile/NAP/photo verification được đưa vào checklist ngoài code.


- tự tuyên bố đã verify Search Console/Business Profile nếu chưa thao tác thực;
- submit sitemap hoặc đổi DNS nếu chưa có quyền.

## Pha 2 - Information architecture

Agent thiết kế hoặc audit:

1. Navigation, footer, breadcrumb, depth click.
2. URL pattern đọc được, canonical logic rõ.
3. Page type templates:
   - home;
   - service/product;
   - category/archive;
   - article/blog;
   - about/contact/policy;
   - location page nếu có giá trị thật.
4. Internal link graph:
   - pillar;
   - cluster;
   - conversion pages;
   - related pages.

Gate:


## Pha 3 - Technical SEO baseline

Mỗi template/page type phải kiểm:

1. HTTP status, redirect chain, canonical.
2. Index/noindex và robots.
3. Title/meta unique ở mức cần thiết.
4. Một H1 rõ.
5. Semantic HTML và heading hierarchy.
6. Image dimensions, LCP image policy, alt text.
7. Mobile responsive, CLS-sensitive elements.
8. Performance:
   - cache/compression;
   - responsive images;
   - font/JS/CSS cost;
   - intrusive interstitials.

Gate:

- test thực tế theo stack;

## Pha 4 - Content system

Mọi nội dung phải đi qua:

1. Intent map.
2. User pain/problem.
3. Unique value và bằng chứng.
4. Outline hợp loại page.
5. CTA đúng intent.
6. Internal link.
7. Fact/claim review.
8. Readability mobile.

Content phải:

- trả lời người đọc trước;

## Pha 5 - Structured data

Chọn schema theo page type, không theo tham vọng rich result.

Baseline thường gặp:

| Page type | Schema xem xét |
|---|---|
| Home | `Organization`, `WebSite`, `LocalBusiness` nếu phù hợp |
| Article | `Article` hoặc `BlogPosting`, `BreadcrumbList` |
| Service | `Service`, `BreadcrumbList`, FAQ nếu FAQ visible |
| Product/ecommerce | `Product`, merchant-related markup khi có dữ liệu thật |
| Contact | Organization/LocalBusiness contact data nếu visible |
| News | `NewsArticle` khi thực sự là publisher/news |

Gate:

1. JSON-LD parse được.
2. URL, image, author/date/provider khớp page.
3. FAQ chỉ sinh khi FAQ hiển thị.
4. Review/rating chỉ sinh khi dữ liệu thật và chính sách cho phép.

## Pha 6 - Module theo loại website

### 6.1. Local business

Kiểm:

- NAP;
- service area;
- local entity có căn cứ;
- location/service intent riêng;
- Business Profile checklist;
- local image/proof policy.

### 6.2. Ecommerce

Kiểm thêm:

- Product detail data;
- availability/price/shipping/return policy nếu thật;
- Merchant Center feed/rules nếu có;
- crawlable product/category navigation.

### 6.3. News/publisher

Kiểm thêm:

- article date/author/editorial policy;
- news schema nếu phù hợp;
- archive/category chronology;
- preferred source chỉ là module riêng, không áp cho site dịch vụ.

### 6.4. Multilingual

Kiểm thêm:

- translation quality;
- `hreflang`;
- canonical theo phiên bản;
- URL/language switch.

### 6.5. Publisher, paywall và subscription

Nếu site có article bị khóa nội dung, registration wall hoặc subscription:

1. Đọc module Flexible Sampling trong `docs/GOOGLE_SEARCH_CENTRAL_MODULES_2026-05-23.md`.
2. Tách rõ `metering` và `lead-in`.

### 6.6. Search appearance modules

Khi task chạm các bề mặt Search đặc thù, agent phải đọc module tương ứng trong `docs/GOOGLE_SEARCH_CENTRAL_MODULES_2026-05-23.md`:

| Task | Module bắt buộc đọc |
|---|---|
| Discover/article thumbnail/large preview | Discover + Image SEO |
| Favicon hiển thị trên Search | Favicon |
| Featured snippet/snippet preview controls | Featured Snippets + AI Features controls |
| AI Overviews/AI Mode | AI Features |
| Ảnh trong Search/Google Images/OG thumbnail | Image SEO |
| Ngày xuất bản/cập nhật trên Search | Byline Date |

## Pha 7 - Security, spam và trust

SEO không tách rời trust.

Agent phải kiểm khi phạm vi có liên quan:

1. CMS/core/theme/plugin/dependency hygiene.
2. Form validation, captcha/rate limit nếu spam risk.
3. Admin hardening/2FA checklist.
4. User-generated links dùng `ugc`/`nofollow` khi phù hợp.
5. Malware/phishing/manual action/security issue monitoring plan.


- nâng cấp production hàng loạt;
- tắt plugin live;
- sửa auth/security config không backup và không test.

## Pha 8 - Implement và change control

Mọi thay đổi phải theo chuỗi:

1. Đọc file thật đang render.
2. Backup khi live/CMS/options/meta/plugin.
3. Sửa đúng nguồn.
5. Chạy syntax/lint/build/smoke/test phù hợp.
6. Verify output:
   - rendered HTML;
   - frontend public;
   - REST/CMS khi có;
   - mobile/desktop nếu sửa UI.
7. Ghi report/log/progress.

## Pha 9 - Monitoring và cải tiến liên tục

Lịch audit nên có:

1. Index/crawl:
   - sitemap;
   - robots;
   - index/noindex;
   - canonical;
   - redirect/404.
2. Search performance:
   - impressions;
   - clicks;
   - CTR;
   - query/page groups.
3. Rich results/schema errors.
4. Core Web Vitals/page experience.
5. Broken links, thin/duplicate content, stale claims.
6. Security/manual actions.

Khi traffic giảm:

- kiểm thời điểm update, query/page bị ảnh hưởng, index/crawl/security trước;
- ghi giả thuyết và bằng chứng.

## Pha 10 - Handoff

Khi kết thúc, agent phải báo:

1. Đã làm gì.
2. File/URL đã sửa.
3. Đã test gì.
4. Chưa test gì và lý do.
5. Rủi ro còn lại.
6. Một việc tiếp theo nên làm.

## 4. Publish gate dùng chung

Không public/nghiệm thu nếu chưa đạt gate phù hợp:

| Gate | Bắt buộc |
|---|---|
| Technical | HTTP/canonical/index/robots/H1/meta/schema baseline |
| Media | Ảnh/alt/caption khớp SOP dự án |
| Search appearance | Module đặc thù như Discover/favicon/snippet/date/image/paywall đã đọc nếu task liên quan |
| Change control | Backup, test, report |

## 5. Mẫu lệnh vận hành cho agent

Agent có thể dùng khung sau khi nhận task website mới:

```text
1. Đọc luật dự án và tài liệu trạng thái gần nhất.
2. Xác định site type, intent, source of truth, quyền live.
3. Audit nhanh nền: crawl/index/meta/canonical/schema/performance/content/security theo phạm vi.
4. Chốt lỗi ưu tiên theo impact và risk.
5. Backup nếu sửa live.
6. Sửa đúng nguồn, không vá chồng.
7. Verify code + rendered output + frontend public.
8. Ghi report/progress và nêu một next action.
```

## 6. Overlay hiện tại của TTCQN

Khi làm `thongtaccongquangninh.com`, quy trình chung này phải nhường cho:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `CODEX_CONTEXT.md`
4. `AI_AGENT_RULES.md`
5. `SEO_RULES.md`
6. `CONTENT_RULES.md`
7. `CODE_CLEANUP_RULES.md`
8. `ARTICLE_SEO_AI_OVERVIEW_CHECKLIST.md`
10. `IMAGE_SEO_WORKFLOW_2026-05-06.md`
11. report/audit/status mới nhất


- hotline;
- địa danh Quảng Ninh;
- SOP ảnh từ thư mục ảnh dự án;
- gate WordPress/live/plugin cụ thể;
- owner agent cụ thể;

## 7. Nguồn Google cần dùng khi cập nhật quy trình

Khi luật SEO cần refresh, ưu tiên nguồn chính thức:

- Google Search Essentials và SEO Starter Guide.
- General Structured Data Guidelines.
- AI features and your website.
- Discover, Flexible Sampling, Favicon, Featured Snippets, Image SEO và Byline Date modules khi task chạm search appearance đặc thù.
- Tài liệu riêng của schema/page type nếu site dùng rich result đặc thù.

