# Google Search Central modules cho AI Web SEO Agent

Ngày tổng hợp: 2026-05-23

File này giữ các phần cần vận hành từ toàn bộ tài liệu Google Search Central user gửi bổ sung và nối vào `docs/AI_WEB_SEO_AGENT_PROCESS.md`.

Nguồn trong batch:

1. Flexible Sampling Guidelines.
2. Get on Discover.
3. Define Website Favicon for Search Results.
4. Featured Snippets and Your Website.
5. AI Features and Your Website.
6. Image SEO Best Practices.
7. Add a Byline Date to Google Search Results.

## 1. Ma trận áp dụng

|---|---|---|

## 2. Flexible Sampling và paywall

### 2.1. Khi nào dùng

Chỉ dùng khi website có:

- subscription;
- registration wall;
- paywall;
- sampling giới hạn bài article.

### 2.2. Hai kiểu sampling

1. `Metering`: user đọc một quota article trước khi bị yêu cầu đăng nhập, đăng ký hoặc trả phí.
2. `Lead-in`: cho xem phần mở đầu hoặc một phần article, phần còn lại bị khóa.

Trong module này, paywall bao gồm cả rào cản yêu cầu subscription và rào cản chỉ yêu cầu registration.

### 2.3. Quy tắc vận hành

1. Ưu tiên meter theo tháng hơn meter theo ngày khi thử nghiệm.
2. Với daily news publisher, điểm khởi đầu để test thường quanh 6-10 bài/tháng; có thể bắt đầu từ 10 bài/tháng rồi đo lại.
3. Lead-in giúp người đọc thấy giá trị bài trước khi chạm paywall.
4. Khi đổi sampling phải theo dõi referral traffic, conversion và user satisfaction.
5. Tài liệu nguồn cảnh báo cần thận trọng khi paywall view tiến gần khoảng 10% vì UX và sự quan tâm có thể giảm; nguồn cũng liên hệ ngưỡng đó với khoảng 3% audience đã bị expose paywall.
6. Nếu có segmentation tốt, có thể siết allowance cho nhóm user đã thường xuyên dùng hết quota và nới hơn cho user mới hoặc ít tương tác.

### 2.4. Paywall và Search

2. Nếu không muốn nội dung paywalled có mặt trong browser tại thời điểm serve, chọn implementation không gửi phần nội dung bị khóa xuống browser.
3. Nếu paywall dùng JavaScript, kiểm thêm guidance JavaScript/paywall.

## 3. Discover

### 3.1. Điều kiện và giới hạn

1. Nội dung tự động đủ điều kiện Discover khi đã được Google index và tuân Discover content policies.
4. Discover dùng nhiều tín hiệu giống Search và ưu tiên helpful, reliable, people-first content.
5. Nội dung cũ vẫn có thể xuất hiện nếu vẫn hữu ích và phù hợp sở thích người dùng.

### 3.2. Nội dung và preview

1. Title/headline phải nắm đúng bản chất nội dung.
4. Ưu tiên nội dung đúng mối quan tâm hiện tại, kể chuyện tốt hoặc có insight riêng.
5. Page experience phải tốt.

### 3.3. Ảnh cho Discover

1. Dùng ảnh hấp dẫn, chất lượng cao, liên quan nội dung.
2. Ưu tiên ảnh lớn:
   - rộng tối thiểu 1200 px;
   - tổng pixel lớn hơn 300,000;
   - phù hợp landscape/16:9 khi tự crop.
3. Cho phép large image preview bằng `max-image-preview:large` hoặc giải pháp phù hợp khác.
4. Dùng `og:image` hoặc schema/image metadata để chỉ preferred image.
6. Nếu dùng `max-image-preview:large`, giữ preview control đúng; AMP là một đường khác mà tài liệu nguồn nêu cho large image preview.

### 3.4. Traffic và monitoring

1. Discover traffic biến động hơn keyword-driven Search traffic.
2. Biến động có thể đến từ thay đổi mối quan tâm, thay đổi content type được feed ưu tiên hoặc Search updates.
3. Discover hợp article/video/feed content hơn và có thể lọc bớt bề mặt dễ gây nhầm như job applications, petitions, forms, code repositories hoặc satire thiếu ngữ cảnh.
4. Nếu site đủ data, monitor bằng Discover Performance report trong Search Console: impressions, clicks, CTR và khoảng dữ liệu Search Console cung cấp; tài liệu nguồn nêu report theo ngưỡng impression, có dữ liệu tới 16 tháng khi đủ điều kiện và bao gồm Discover traffic từ Chrome.

## 4. Favicon trong Search

Module này áp cho organic Search favicon, không phải business logo trong Google Ads.

### 4.1. Implementation

1. Tạo favicon theo guideline.
2. Đặt `<link>` favicon trong `<head>` của home page cấp hostname.
3. `href` có thể là relative URL hoặc absolute URL; CDN có thể dùng nếu URL truy cập được.
4. Google hỗ trợ các rel favicon liên quan:
   - `icon`;
   - `shortcut icon`;
   - `apple-touch-icon`;
   - `apple-touch-icon-precomposed`.

### 4.2. Eligibility và kiểm tra

2. Googlebot phải crawl được home page.
3. Googlebot-Image phải crawl được favicon file.
4. Favicon phải đại diện brand, square 1:1, tối thiểu 8x8, nên lớn hơn 48x48, URL ổn định và không chứa biểu tượng không phù hợp.
5. Sau đổi favicon phải chờ recrawl/process; có thể request indexing home page khi có quyền.

## 5. Featured Snippets và preview controls

### 5.1. Điều cần nhớ

1. Featured snippet do hệ thống Google chọn.
3. Click vào featured snippet có thể đưa user tới section được trích trên page khi hệ thống xác định được.
4. Featured snippet có thể xuất hiện trong kết quả đặc biệt và trong nhóm câu hỏi liên quan kiểu People Also Ask.

### 5.2. Kiểm soát hiển thị snippet

1. Muốn chặn cả regular snippet và featured snippet: dùng `nosnippet`.
2. Muốn chặn text cụ thể khỏi snippet: dùng `data-nosnippet`.
3. Nếu `nosnippet` và `data-nosnippet` cùng xuất hiện, `nosnippet` có ưu tiên cao hơn.
4. Muốn giảm khả năng featured snippet nhưng vẫn giữ regular snippet: thử `max-snippet` thấp hơn.
5. `max-snippet` thấp không bảo đảm ngừng featured snippet; nếu cần chặn chắc chắn thì dùng `nosnippet`.

## 6. AI Features / AI Overviews / AI Mode

### 6.1. Điều kiện thực tế

1. Best practice SEO nền tảng vẫn áp dụng.
3. Để đủ điều kiện hỗ trợ link trong AI features, page phải được index, snippet-eligible, đáp ứng Search technical requirements và tuân Search policies.
4. Đủ điều kiện không bảo đảm Google crawl, index hoặc serve page.
5. AI Overviews và AI Mode có thể dùng query fan-out qua nhiều subtopic/data source; hai bề mặt có model/kỹ thuật khác nhau và AI Overviews chỉ hiện khi hệ thống thấy bổ sung giá trị cho Search thường.

### 6.2. Best practices cần kiểm

1. Crawl được qua robots, CDN và hosting.
2. Nội dung dễ tìm qua internal links.
3. Page experience tốt.
4. Nội dung quan trọng có dạng text.
5. Ảnh/video chất lượng cao khi phù hợp.
6. Structured data khớp visible text.
7. Merchant Center và Business Profile cập nhật nếu site dùng.

### 6.3. Measurement và controls

1. Traffic từ AI features nằm trong Search Console Performance report loại Web.
2. Có thể theo dõi conversion/time spent bằng Analytics nếu site có.
3. Quản lý preview trong Search bằng `nosnippet`, `data-nosnippet`, `max-snippet` hoặc `noindex`.
4. Crawl access cho Search dùng Googlebot controls.
5. Google-Extended liên quan tới một số hệ thống khác của Google, không đồng nghĩa điều khiển AI features trong Search.
6. Nếu preview control đã đổi nhưng kết quả chưa đổi:
   - kiểm implementation bằng URL Inspection;
   - chờ recrawl/process;
   - request recrawl khi có quyền.

## 7. Image SEO

### 7.1. Discover và index ảnh

1. Image SEO có hai lớp: giúp Google discover/index ảnh và tối ưu landing page chứa ảnh.
3. Có thể dùng image sitemap cho ảnh khó discover.
4. Image sitemap có thể chứa image URLs trên domain khác hoặc CDN; nên verify ownership domain CDN trong Search Console nếu dùng.

### 7.2. Responsive image và format

1. Dùng `srcset`/`sizes` hoặc `<picture>` khi phù hợp.
2. Luôn có fallback `<img src="...">`.
3. Định dạng Google Search hỗ trợ qua `img src`: BMP, GIF, JPEG, PNG, WebP, SVG và AVIF.
4. Extension nên khớp file type.
5. Data URI có thể dùng nhưng phải cân nhắc tăng page size.
6. Tối ưu đồng thời chất lượng ảnh, dung lượng, responsive delivery và speed/PageSpeed.

### 7.3. Landing page và preferred image

1. Nội dung và metadata của landing page ảnh hưởng khả năng xuất hiện của ảnh.
2. Có thể chỉ preferred image bằng `primaryImageOfPage`, image trên main entity/mainEntityOfPage hoặc `og:image`.
4. Title và description của page vẫn quan trọng cho preview/image result context.
5. Structured data có thể giúp rich appearance khi page type hỗ trợ và field image hợp lệ.

### 7.4. Filename, caption, alt và accessibility

1. Ảnh nên nằm gần text liên quan.
3. Caption, title và page context đều góp phần giúp hiểu ảnh.
5. Với inline SVG, dùng `<title>`/accessibility pattern phù hợp.
6. Nên kiểm accessibility và slow network.
7. Nếu cùng ảnh được dùng ở nhiều page quy mô lớn, cân nhắc crawl budget và dùng URL nhất quán khi mục tiêu là cache/reuse có kiểm soát.

### 7.5. Controls khác

1. Có thể opt out inline linking trong Google Images bằng xử lý request/referrer theo guidance riêng; tài liệu nguồn nêu request từ Google domain có thể được trả `200` hoặc `204` không nội dung theo flow opt-out.
2. Nếu site có explicit content risk, áp SafeSearch labeling phù hợp.

## 8. Byline Date / Publication Date

### 8.1. Cách cung cấp date

2. Đặt date visible nổi bật trên page và label rõ như `Published`, `Posted`, `Last updated`, `Updated`.
3. Có thể cung cấp publish date, last updated date hoặc cả hai.
4. Dùng structured data trên subtype phù hợp của `CreativeWork`, ví dụ `Article`, `BlogPosting`, `VideoObject`.
5. Field cần xem: `datePublished`, `dateModified`.

### 8.2. Best practices

2. Nếu có time/timezone trong markup, dùng timezone đúng.
3. Visible date và structured date phải nhất quán.
5. Nếu page có nhiều date gây chọn sai, giảm các date phụ không cần thiết.
6. Nếu page nhắm Google News, áp thêm News guideline.

## 9. Coverage checklist cho agent

- [ ] Ghi rõ nguồn nào áp dụng mọi site, nguồn nào áp dụng theo module.
- [ ] Đối chiếu với Search Essentials, spam policies và structured data policies.
- [ ] Ghi rõ preview controls (`nosnippet`, `data-nosnippet`, `max-snippet`, `noindex`) khi tài liệu nhắc tới.
- [ ] Ghi rõ điều Google không bảo đảm: Discover, favicon, byline date, featured snippet, AI feature serving.
- [ ] Cập nhật canonical process và project memory copies nếu user yêu cầu lưu cho agent.
