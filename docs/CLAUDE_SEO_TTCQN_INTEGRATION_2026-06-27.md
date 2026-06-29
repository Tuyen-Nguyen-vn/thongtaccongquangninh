# Tích hợp Claude SEO cho quy trình TTCQN

Ngày lập: 2026-06-27  
Repo tham chiếu: `git@github.com:AgriciDaniel/claude-seo.git`  
Vị trí local hiện tại: `_tmp/claude-seo`  
HEAD đã kiểm tra: `d830cdb2ad339bb7f062339fe82228b072e98061`  
Phiên bản khai báo trong `pyproject.toml`: `2.2.0`

## Kết luận vận hành

`claude-seo` là bộ checklist/skill/script phụ để tăng độ phủ audit SEO. Không dùng repo này làm remote chính, không merge trực tiếp vào workspace TTCQN, không thay `AGENTS.md`, `CODEX_CONTEXT.md`, `skills/seo-local-audit-strict/SKILL.md` hoặc quy trình backup-first của dự án.

Khi có xung đột:

1. Luật TTCQN trong `AGENTS.md`, `CODEX_CONTEXT.md`, `TASKS.md`, `skills/seo-local-audit-strict/SKILL.md`.
2. Quy trình nền `docs/AI_WEB_SEO_AGENT_PROCESS.md`.
3. Checklist/script tham khảo từ `_tmp/claude-seo`.

## Phần nên dùng cho TTCQN

### 1. Technical SEO

Nguồn tham khảo: `_tmp/claude-seo/skills/seo-technical/SKILL.md`

Áp dụng cho:

- robots, sitemap, canonical, noindex/index, redirect chain;
- mobile-first, Core Web Vitals, LCP/INP/CLS;
- kiểm raw HTML so với rendered HTML khi nghi WordPress/template/cache khác nhau;
- rà AI crawler trong `robots.txt` khi làm AI Overview/AI Mode.

Điều chỉnh cho TTCQN:

- Không kết luận từ HTML cache duy nhất; URL live nên có cache-buster như `?nowprocket=1&codex=<moc-kiem-tra>`.
- Không chạy sửa live khi chưa backup và chưa rõ source of truth: `post_content`, option renderer, plugin, template PHP hay cache.

### 2. Local SEO

Nguồn tham khảo: `_tmp/claude-seo/skills/seo-local/SKILL.md`

Áp dụng cho:

- phân loại website là service-area business/local service;
- kiểm NAP, `LocalBusiness`, `areaServed`, dịch vụ theo địa phương;
- dùng "swap test" để phát hiện doorway page: đổi tên địa phương mà nội dung vẫn đúng thì trang có rủi ro trùng/lỏng;
- rà location page có thực thể địa phương, tình huống riêng, ảnh/caption riêng.

Điều chỉnh cho TTCQN:

- Không dùng review/rating/testimonial nếu chưa có bằng chứng thật.
- Case study chỉ ghi là `case thực tế` khi có dữ liệu xác minh; nếu chưa có, dùng `tình huống thường gặp`.
- Với nhóm trang địa phương, phải audit trước, backup, sửa tối thiểu, kiểm schema/canonical/robots/internal link rồi mới báo.

### 3. Content và E-E-A-T

Nguồn tham khảo: `_tmp/claude-seo/skills/seo-content/SKILL.md`

Áp dụng cho:

- bài phải trả lời rõ Who/How/Why;
- kiểm nội dung AI máy móc, thiếu kinh nghiệm thực tế, thiếu bằng chứng;
- cấu trúc đoạn ngắn, H2/H3 rõ, bảng/FAQ dễ trích dẫn;
- rà AI citation readiness cho đoạn trả lời tự chứa.

Điều chỉnh cho TTCQN:

- Vẫn giữ chuẩn bài địa phương 2500-3000 từ khi user yêu cầu bài hoàn chỉnh.
- Mật độ từ khóa chỉ là kiểm soát biên tập, không được nhồi keyword.
- Ưu tiên ngách theo loại công trình, tình huống, thiết bị và địa bàn thay vì nhân bản bài.

### 4. Schema

Nguồn tham khảo: `_tmp/claude-seo/skills/seo-schema/SKILL.md`

Áp dụng cho:

- JSON-LD là định dạng ưu tiên;
- rà `Organization`, `LocalBusiness`, `Service`, `BreadcrumbList`, `Article/BlogPosting`, `FAQPage` nếu FAQ hiển thị;
- phát hiện schema deprecated hoặc schema mâu thuẫn với nội dung visible.

Điều chỉnh cho TTCQN:

- Schema phải khớp nội dung người dùng nhìn thấy.
- Không thêm `AggregateRating` hoặc `Review` nếu không có review thật.
- `FAQPage` không còn là lợi thế rich result phổ thông; chỉ giữ nếu FAQ hiển thị và có ích cho hiểu thực thể/nội dung.

### 5. Image SEO

Nguồn tham khảo: `_tmp/claude-seo/skills/seo-images/SKILL.md`

Áp dụng cho:

- alt text mô tả đúng ảnh, không nhồi keyword;
- WebP/JPG tối ưu dung lượng;
- ảnh dưới fold dùng lazy-load, ảnh hero/LCP không lazy-load;
- ảnh có `width`/`height` hoặc `aspect-ratio` để tránh CLS.

Điều chỉnh cho TTCQN:

- Nguồn ảnh bắt buộc: `Ảnh cung cấp`.
- Đầu ra bắt buộc: `Ảnh Đã Xử Lý SEO`.
- Trước nghiệm thu ảnh SEO chạy `python tools/audit_unique_wp_images.py` ở chế độ read-only.
- Chỉ chạy `--fix` khi Tuyền duyệt sửa live hoặc yêu cầu rõ.

### 6. AI Search / GEO

Nguồn tham khảo: `_tmp/claude-seo/skills/seo-geo/SKILL.md`

Áp dụng cho:

- coi GEO/AEO là SEO nền tảng áp dụng cho AI Search, không phải quy trình tách rời;
- tăng đoạn trả lời ngắn, rõ, có nguồn và có thể trích dẫn;
- kiểm khả năng crawler AI truy cập trang;
- cân nhắc `llms.txt` như tài liệu điều hướng, không coi là yếu tố xếp hạng chắc chắn.

Điều chỉnh cho TTCQN:

- Nếu task chạm Google AI features, đọc thêm `docs/GOOGLE_SEARCH_CENTRAL_MODULES_2026-05-23.md`.
- Không hứa xuất hiện AI Overview, AI Mode, ChatGPT hay Perplexity.

## Phần chưa dùng mặc định

- DataForSEO, Firecrawl, Ahrefs, SERanking, Banana, Profound: chỉ dùng khi đã có credential/plugin và Tuyền yêu cầu rõ.
- PDF report enterprise của `claude-seo`: chỉ tạo khi cần báo cáo khách hàng hoặc audit lớn.
- Crawl 500 trang: không dùng mặc định cho TTCQN; ưu tiên `wp-url-audit-list.json`, sitemap live và nhóm URL cụ thể để tránh nhiễu cache/rate limit.
- Community footer của repo gốc: không đưa vào báo cáo TTCQN.

## Lệnh đã kiểm tra trong phiên này

Chạy từ root TTCQN:

```bash
git ls-remote git@github.com:AgriciDaniel/claude-seo.git HEAD
git clone git@github.com:AgriciDaniel/claude-seo.git _tmp/claude-seo
python3 _tmp/claude-seo/scripts/portability_check.py
```

Kết quả `portability_check.py`: `33 SKILL.md files checked`, `errors: 0`, `warnings: 0`.

Các lệnh help đã chạy được:

```bash
python3 _tmp/claude-seo/scripts/pagespeed_check.py --help
python3 _tmp/claude-seo/scripts/render_page.py --help
```

Lưu ý: `python3 _tmp/claude-seo/scripts/parse_html.py --help` báo thiếu `beautifulsoup4` trong Python hiện tại. Nếu muốn chạy đầy đủ script HTML/parser, tạo venv riêng trong `_tmp/claude-seo`; không cài global.

## Cách chạy an toàn khi cần dùng script

Thiết lập venv riêng:

```bash
cd _tmp/claude-seo
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Ví dụ audit read-only:

```bash
cd _tmp/claude-seo
.venv/bin/python scripts/render_page.py "https://thongtaccongquangninh.com/?nowprocket=1&codex=claude-seo-check" --mode auto --json
.venv/bin/python scripts/pagespeed_check.py "https://thongtaccongquangninh.com/" --strategy mobile --json
```

Nếu dùng PageSpeed API key, chỉ truyền qua biến môi trường hoặc shell local:

```bash
PAGESPEED_API_KEY="..." .venv/bin/python scripts/pagespeed_check.py "https://thongtaccongquangninh.com/" --strategy both --json
```

Không lưu API key vào repo, memory, plugin file hoặc tài liệu dự án.

## Quy trình tích hợp vào task TTCQN

Khi làm audit/sửa SEO:

1. Đọc `AGENTS.md`, `CODEX_CONTEXT.md`, `TASKS.md`, `skills/seo-local-audit-strict/SKILL.md`.
2. Xác định URL, source of truth và rủi ro live.
3. Dùng checklist `claude-seo` phù hợp: technical, local, content, schema, image hoặc GEO.
4. Nếu cần chạy script, chạy trong `_tmp/claude-seo/.venv`, read-only trước.
5. Với WordPress live: backup trước, sửa tối thiểu, verify public bằng cache-buster.
6. Ghi kết quả vào report/task log phù hợp; chỉ đánh dấu `Fixed` khi có bằng chứng.

