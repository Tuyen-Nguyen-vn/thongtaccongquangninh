# Quy tắc chung của dự án D:\.thongtaccongquangninh

## ƯU TIÊN LÀM VIỆC TRONG CURSOR / CLAUDE CODE / CODEX

- Hỏi ít, tự làm nếu yêu cầu đã đủ rõ.
- Mặc định đi theo chuỗi: `đọc ngữ cảnh -> sửa/tạo -> kiểm tra -> báo kết quả`.
- Chỉ hỏi lại khi có rủi ro thật: xóa dữ liệu, publish live, mật khẩu/OTP/captcha, thanh toán, sửa hàng loạt hoặc mục tiêu mâu thuẫn.
- Khi báo cáo, chỉ đưa **1 việc tiếp theo nên làm**, không liệt kê nhiều hướng.
- Cursor Agent phải ưu tiên đọc `.cursor/rules/tuyen-focused-workflow.mdc` nếu có.
- Claude Code phải ưu tiên đọc `CLAUDE.md` và rule Cursor trước khi tự lập kế hoạch dài.

## GSTACK — BỘ QUY TRÌNH PHỤ TRỢ CHO AI AGENT

- GStack đã có ở cấp máy cho Codex: `~/.codex/skills/gstack-*`. Dùng các skill này như checklist/quy trình khi phù hợp; không dùng `https://github.com/garrytan/gstack.git` làm remote lưu code website.
- Các workflow nên áp dụng trong dự án:
  - `gstack-review`: trước khi deploy plugin, sửa renderer, sửa script automation hoặc thay đổi SEO kỹ thuật.
  - `gstack-qa` / `gstack-qa-only`: sau khi sửa giao diện hoặc cần kiểm trang public bằng trình duyệt thật.
  - `gstack-investigate`: khi lỗi live/local/cache/WordPress khó phân biệt nguyên nhân.
  - `gstack-cso`: khi chạm auth, secret, upload plugin, connector, WordPress live, file `.env`, backup hoặc quyền ghi.
  - `gstack-design-review`: khi sửa UI, phối hợp với `DESIGN.md` để giữ màu, typography, spacing và CTA đồng bộ.
- GStack checkpoint auto-commit đã được Tuyền cho phép ở mức local/continuous; không auto-push. Không chạy `setup --team` hoặc vendored toàn bộ gstack vào repo này nếu chưa có yêu cầu rõ.
- Khi gstack gợi ý quy trình mâu thuẫn với luật backup-first/live-verify của TTCQN, ưu tiên luật TTCQN trong file này.

## CLAUDE SEO — CHECKLIST PHỤ ĐÃ CLONE

- Repo `git@github.com:AgriciDaniel/claude-seo.git` đã clone read-only vào `_tmp/claude-seo` để tham khảo skill/script SEO, không dùng làm remote chính và không merge trực tiếp vào workspace TTCQN.
- Tài liệu tích hợp hiện hành: `docs/CLAUDE_SEO_TTCQN_INTEGRATION_2026-06-27.md`.
- Chỉ dùng `claude-seo` như checklist phụ cho technical SEO, local SEO, content/E-E-A-T, schema, image SEO và AI Search/GEO; luật TTCQN, `skills/seo-local-audit-strict/SKILL.md`, backup-first và live-verify luôn ưu tiên cao hơn.
- Nếu cần chạy script Python từ repo này, tạo venv riêng trong `_tmp/claude-seo`; không cài dependency global, không lưu API key vào repo, memory hoặc plugin file.

## Bối cảnh người dùng

- Tôi là Tuyền, quản lý SEO cho website `thongtaccongquangninh.com` (Môi Trường Đô Thị Số 1 Quảng Ninh).
- Hotline: **0963.953.533 / 0931.156.756**.
- Dịch vụ: hút bể phốt, thông tắc cống, nạo vét, xử lý mùi hôi tại Quảng Ninh, Hải Phòng và miền Bắc.
- Thế mạnh: 24/7, có mặt 15 phút, không đục phá, bảo hành dài hạn, máy lò xo + xe bồn hiện đại.

## NGÔN NGỮ & VĂN PHONG

- Luôn trả lời bằng tiếng Việt có dấu đầy đủ.
- Văn phong trực diện, khẩn cấp, đoạn ngắn 2-3 câu, dùng bullet point, bôi đậm từ khóa và hotline.

## CHUẨN SEO BẮT BUỘC KHI VIẾT BÀI

- Độ dài 2500-3000 từ, mật độ từ khóa chính khoảng 1-1.5%.
- Cấu trúc: Meta Title 60-70 ký tự | Meta Description 150-160 ký tự có hotline | 1 H1 duy nhất | Mở bài đánh nỗi đau.
- H2 bắt buộc: Nguyên nhân | Tại sao chọn (Cam kết 3 Không: Không đục phá / báo giá ảo / tái phát) | Bảng giá | Quy trình 5 bước | Case study E-E-A-T | NAP liên hệ | FAQ 3-4 câu voice search.
- Rải LSI dài: "tìm thợ thông cống không đục phá", "xe hút bể phốt vào ngõ sâu", "hút bể phốt giá rẻ Quảng Ninh", "thông tắc cống tại nhà Quảng Ninh", "thợ xử lý mùi hôi nhà vệ sinh".
- CTA hotline chèn giữa và cuối bài.
- Xuất kết quả dưới dạng markdown để paste WordPress.

## QUY ƯỚC CODE & AUTOMATION

- Khi viết script Python/Node, ưu tiên chạy được trên Windows, hướng dẫn từng bước.
- Khi làm Make/n8n/webhook WordPress, ghi rõ endpoint, payload JSON mẫu, header `Authorization`.
- Khi gặp lỗi, đề xuất nguyên nhân + cách fix cụ thể, không nói chung chung.

## DESIGN.md / GOOGLE LABS — GATE GIAO DIỆN

- Repo dùng `DESIGN.md` theo chuẩn Google Labs `google-labs-code/design.md` làm nguồn chuẩn visual identity cho agent.
- Trước khi sửa UI, renderer, màu, typography, CTA, card, hero, footer hoặc spacing, phải đọc `DESIGN.md` và `docs/DESIGN_TOKEN_MAPPING.md`.
- Sau mọi thay đổi UI/design token, bắt buộc chạy:
  `npm run design:check`
- Lệnh này kiểm cả `npx @google/design.md lint DESIGN.md` và mapping token giữa `DESIGN.md` với `tools/wp-plugins/ttcqn-home-emergency-renderer/assets/ttcqn-home.min.css`.
- Chỉ nghiệm thu khi linter báo `0 errors / 0 warnings` và script mapping trả `ok: true`.
- Không thêm màu/gradient/CTA style rời rạc. Nếu thêm token mới, cập nhật đồng thời `DESIGN.md`, CSS renderer, `tools/check_design_token_mapping.mjs` và `docs/DESIGN_TOKEN_MAPPING.md`.



## MẶC ĐỊNH CHATGPT APPS SEO

- ChatGPT Apps MCP connector mặc định của Tuyền là app SEO cho `thongtaccongquangninh.com`.
- Khi người dùng nhắc "plugin ChatGPT Apps", "app SEO", "connector", "MCP", "việc SEO tiếp theo", hoặc muốn làm với ChatGPT Apps mà không nói rõ project khác, mặc định dùng project này:
  `C:\Users\DELL\Documents\Codex\2026-04-28\chatgpt-apps-plugin-chatgpt-apps-openai`
- MCP local mặc định: `http://localhost:8787/mcp`
- MCP public tunnel hiện tại: `https://patients-locked-ended-tuesday.trycloudflare.com/mcp`
- File trạng thái mặc định: `TASKS.md` và `CONNECTOR.md` trong project trên.
- Trước khi báo "dùng được", phải kiểm tra `/health`, OAuth metadata, `tools/list`, `get_next_seo_tasks`, `check_wordpress_auth`.
- Nếu ChatGPT báo "does not implement OAuth", kiểm tra lại các endpoint: `/.well-known/oauth-protected-resource/mcp`, `/.well-known/oauth-authorization-server`, `/register`, `/authorize`, `/token`.

## WORDPRESS / WP-CLI CHO DỰ ÁN WEB

- Trước khi làm bất kỳ việc WordPress, SEO live, Rank Math, nội dung hoặc connector nào trong dự án này, agent phải đọc qua `AGENTS.md`, `CODEX_CONTEXT.md`, `TASKS.md`, file trạng thái SEO mới nhất, `docs/PROJECT_STATE.md` nếu cần snapshot tổng quan, và file `WORDPRESS_*.json` liên quan nếu có.
- WP-CLI đã được cài trên máy:
  - `wp`: `C:\Users\DELL\AppData\Local\Programs\WP-CLI\wp.cmd`
  - `php`: `C:\Users\DELL\AppData\Local\Programs\PHP\8.4.20\php.exe`
- Workspace này là nơi vận hành/audit WordPress cho site live, không mặc định là thư mục chứa WordPress core. Chỉ chạy `wp ...` khi đã xác minh đúng thư mục WordPress local hoặc có `--path=...` rõ ràng.
- GitHub CLI đã cài bằng lệnh `gh`; dùng để xem PR/CI/log khi dự án có GitHub repo, nhưng phải kiểm tra `gh auth status` trước.
- Nếu cần smoke test WordPress MCP qua REST auth, có thể chạy `node .\tools\wp_mcp_smoke.mjs`; script ghi report theo ngày chạy vào `WORDPRESS_MCP_SMOKE_YYYY-MM-DD.json`. Endpoint chuẩn hiện dùng là `https://thongtaccongquangninh.com/wp-json/mcp/wp-mcp-ultimate`; endpoint cũ `/wp-json/mcp` có thể trả `404`.
- Nếu cần sửa lại nhãn menu Blog bị kéo dài từ page title, dùng `node .\tools\fix_blog_menu_label_and_audit.mjs`; script backup menu/page Blog, đổi menu item `/blog/` về `Blog`, kiểm frontend và audit nhanh nội dung Blog.
- Mặc định khi deploy fix hành vi nút `footer-back-top` hoặc partial JS footer chung của home renderer theo cách backup-first, dùng `npm run release:footer-backtop-live`; workflow này tự làm backup-first deploy + verify public 7 scenario.
- Nếu cần xem nhanh bộ lệnh footer nên dùng lệnh nào, chạy `npm run help:footer-backtop`.
- Alias ngắn ưu tiên khi thao tác nhanh: `npm run footer:release`, `footer:dry-run`, `footer:report`, `footer:verify`, `footer:postcheck`, `footer:status`, `footer:status-short`, `footer:help`, `footer:deploy`.
- Nếu chỉ cần verify public footer interaction sau deploy hoặc sau khi cache ổn định, dùng `npm run verify:footer-live`; script tự dò Chrome/Chromium, kiểm 7 scenario public và chỉ chốt khi `passed 7/7`.
- Nếu cần recheck nhanh sau cache hoặc sau vài phút mà vẫn muốn nhìn report gần nhất ngay sau đó, dùng `npm run footer:postcheck`; lệnh này trả summary ngắn gọn thay vì đổ toàn bộ JSON verify.
- Nếu mục tiêu chỉ là xem **footer live hiện tại có đang ổn không**, ưu tiên dùng `npm run footer:status`.
- Nếu cần 1 dòng gọn để paste log hoặc dùng trong script/cron, dùng `npm run footer:status-short`.
- `npm run deploy:footer-backtop-live` chỉ dùng khi cần tách bước để debug hoặc rerun riêng phần deploy; để test workflow không ghi live, dùng `npm run release:footer-backtop-dry-run`.
- Nếu cần xem nhanh kết quả lần release footer gần nhất mà không tự mở report JSON, dùng `npm run report:footer-backtop-latest`.
- Host hiện có thể trả `purgeOk=false` vì thiếu lệnh `wp litespeed-purge`; coi đây là **warning đã biết**, không coi là fail nếu report vẫn `success: true` và verify public vẫn `passed 7/7`.
- Nếu push/publish qua REST bị lỗi DNS kiểu `ENOTFOUND` nhưng host/IP live đã xác minh, có thể dùng fallback `node .\tools\push_area_pages_ip_bypass.mjs [--publish] [--slug=<slug>]`; script đang bypass DNS qua IP `103.57.220.210` với SNI `thongtaccongquangninh.com`, và mọi kết quả live phải ghi tiếp vào `docs\SEO_PROGRESS.csv`.
- Nếu cần audit/fix nhanh nhóm trang khu vực trước khi sửa batch, có thể dùng `node .\tools\audit_hbp_area_pages.mjs [--write]`, `node .\tools\audit_ttc_area_pages.mjs [--write]`, `node .\tools\audit_bc_area_pages.mjs [--write]`; mặc định là audit-only/dry-run, thêm `--write` mới ghi sửa link về landing và author byline khi script hỗ trợ.
- Nếu cần làm mới inventory URL live trước audit hoặc báo cáo, dùng `node .\tools\refresh_url_audit.mjs`; kết quả cập nhật vào `wp-url-audit-list.csv` và `wp-url-audit-list.json`.

## BỔ SUNG ĐÃ XÁC THỰC TỪ REPO

- Repo hiện có file ngữ cảnh nguồn là [`D:\.thongtaccongquangninh\CODEX_CONTEXT.md`](D:\.thongtaccongquangninh\CODEX_CONTEXT.md); nếu cần rà nhanh workflow nội bộ, ưu tiên đọc file này trước.
- Workspace hiện đã có Git commit đầu tiên và remote thật `origin` trỏ tới `https://github.com/Tuyen-Nguyen-vn/thongtaccongquangninh.git`. Remote tham khảo `gstack-source` trỏ tới `https://github.com/garrytan/gstack.git` chỉ để nhận diện/fetch nguồn gstack, đã khóa push URL thành `DISABLED`. GStack local đang bật checkpoint auto-commit (`checkpoint_mode=continuous`) và tắt auto-push (`checkpoint_push=false`).
- Bot Telegram không phải thành phần cốt lõi của workspace SEO này; ghi chú liên quan đã chuyển sang thư mục bot riêng:
  `C:\Users\DELL\Documents\Codex\2026-04-28\skill-creator-c-users-dell-codex\telegram-codex-bot\THONGTACCONGQUANGNINH_NOTES.md`.

## AGENT QUẢN LÝ THƯ MỤC

- Agent quản lý thư mục nằm tại `.agents\tac-tu-quan-ly-thu-muc-du-an.md`.
- Script quét read-only nằm tại `tools\project_folder_manager.py`.
- Lệnh chạy nhanh:
  `python .\tools\project_folder_manager.py --root D:\.thongtaccongquangninh`

## QUALITY GATE BẮT BUỘC

- Sau mỗi lần làm xong task, phải test thật phù hợp rồi mới báo xong.
- Với code/script: chạy syntax check, smoke test, test command hoặc build nếu có.
- Với sửa giao diện/design token: chạy `npm run design:check`; nếu có sửa frontend thực tế thì kiểm thêm preview/public bằng cache-buster phù hợp.
- Với `tools/seo_score.py`, ưu tiên smoke test thật bằng `python3 tools/seo_score.py content-drafts/thong-tac-cong-bai-chay-rankmath-draft.md "thông tắc cống Bãi Cháy"`; draft trong repo đang dùng metadata dạng dòng markdown (`Meta Title:`, `Meta Description:`, `Focus Keyword:`), không mặc định là YAML frontmatter.
- Với MCP/ChatGPT Apps: kiểm tra `/health`, OAuth metadata, `tools/list`, tool nghiệp vụ chính và auth WordPress nếu có.
- Với bài SEO địa phương: sau khi viết xong phải tạo Image Brief, gửi sang ChatGPT/Image Agent, nhận ảnh + tên file + alt text + caption, gắn ảnh vào bài và kiểm đúng intent/đúng địa phương trước khi nghiệm thu hoặc publish.
- Với verify live WordPress/frontend, ưu tiên gọi URL public kèm `?nowprocket=1&codex=<moc-kiem-tra>` hoặc cache-buster tương đương để giảm nhiễu cache LiteSpeed/WP Rocket; không kết luận chỉ từ REST hoặc HTML đang cache.
- Nếu chưa test được do quota/API/mạng, phải nêu rõ phần đã test, phần chưa test và lý do.

## IMAGE SEO - QUY TẮC BẮT BUỘC VẬN HÀNH

- Mọi AI Agent khi cần ảnh viết bài **BẮT BUỘC** phải thực hiện theo quy trình 3 bước sau:
  1. **Bước 1**: Lấy ảnh thi công thực tế từ thư mục nguồn: `D:\.thongtaccongquangninh\Ảnh cung cấp`.
  2. **Bước 2**: Thực hiện tối ưu chuẩn SEO hình ảnh (đổi tên file không dấu, phân tách bằng `-`, crop/filter nhẹ, xóa EXIF cũ...).
  3. **Bước 3**: Xuất ảnh đã tối ưu sang thư mục đầu ra: `D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO` rồi mới được upload/chèn vào bài viết.
- Khi chọn ảnh, ưu tiên ảnh đúng dịch vụ và bối cảnh nội dung: xe hút, thợ thông tắc cống, thợ thông bồn cầu, thợ thông chậu rửa, xử lý mùi hôi, nạo vét hố ga.
- Mỗi lần chèn ảnh vào bài khác phải đổi "lớp vỏ":
  - Tên file không dấu, có keyword/dịch vụ/địa phương của bài, cách nhau bằng dấu `-`.
  - Caption bám đúng dịch vụ, địa phương, bối cảnh; chỉ ghi là ảnh thực tế khi đã có căn cứ xác nhận.
  - Xóa EXIF cũ khi xuất ảnh. Nếu cần geotag thì chỉ thêm tọa độ phù hợp mục tiêu SEO và có căn cứ.
- Nếu tái dùng ảnh nguồn, phải đổi "lõi" ảnh:
  - Crop nhẹ 10-15% hoặc thay khung hình đủ khác biệt.
  - Chỉnh sáng/tương phản/filter nhẹ.
  - Xuất WebP/JPG tối ưu dung lượng.
- Trước khi publish/nghiệm thu ảnh SEO phải chạy audit:
  - `python tools/audit_unique_wp_images.py` để audit read-only.
  - Chỉ chạy `--fix` khi Tuyền đã duyệt sửa live hoặc yêu cầu rõ.


- Quy trình strict mới nằm tại `skills/seo-local-audit-strict/SKILL.md`.
- Checklist machine-readable nằm tại `seo-checklists/seo-local-preflight-checklist.json`.
- Quy trình ảnh SEO bắt buộc nằm tại `IMAGE_SEO_WORKFLOW_2026-05-06.md`.
- Khi sửa nhóm trang thành phố/phường, luôn audit trước, backup, sửa tối thiểu, kiểm tra schema/canonical/robots/internal link, rồi mới báo cáo.
- Khi viết bài địa phương mới, chạy `node .\tools\create_image_seo_brief.mjs <file-md>` sau khi bài đạt SEO content gate.

## BỘ KỸ NĂNG VÀ QUY TRÌNH CHUẨN SEO CODEX (CẬP NHẬT 2026)

### PHẦN 1: NGUYÊN TẮC HOẠT ĐỘNG TỐI THƯỢNG CỦA CODEX
3. **Khai thác Ngách (Sub-topics):** Nếu phải viết nhiều bài cho cùng một chủ đề, bắt buộc phải tìm ra các khía cạnh ngách khác nhau để khai thác.

### PHẦN 2: DANH SÁCH LỖI TỬ HUYỆT CẦN LOẠI BỎ
*(Rút kinh nghiệm từ phân tích hệ thống thongtaccongquangninh.com)*
* **Lỗi Sao chép Case Study (Nghiêm trọng nhất):** Bê nguyên một dự án thực tế (VD: Xử lý ở Cửa Ông) để gắn vào trang của khu vực khác (VD: Uông Bí, Hạ Long) làm mất đi tính xác thực (E-E-A-T).
* **Lỗi Thiếu Thực thể Địa phương (Local Entities):** Nội dung không phản ánh được đặc thù địa hình, giao thông, hạ tầng của khu vực đó.

### PHẦN 3: BỘ KỸ NĂNG TỐI ƯU SEO ĐỊA PHƯƠNG (KHUYẾN NGHỊ ÁP DỤNG)
#### Kỹ năng 1: Tiêm Thực Thể Địa Phương (Localized Entity Injection)
#### Kỹ năng 2: Cá nhân hóa Bằng Chứng Công Việc (Proof of Work)
* Mỗi trang đích khu vực phải có nội dung và câu chuyện giải quyết vấn đề (Case Study) ĐỘC BẢN.
#### Kỹ năng 3: Xây dựng UGC & FAQ Bản địa hóa
* Tạo ra các bộ Câu hỏi thường gặp (FAQ) sát với tình hình thực tế của địa phương đó.
* Mô phỏng hoặc sử dụng các đánh giá (Review) có nhắc đến các bối cảnh cụ thể của khu vực.
#### Kỹ năng 4: Tối ưu Cấu trúc Kỹ thuật (Schema)
* Đảm bảo đề xuất hoặc triển khai mã Schema Markup LocalBusiness chứa tọa độ, địa chỉ cụ thể cho từng trang khu vực để định danh rõ ràng với Google.
#### Kỹ năng 5: Tiêu Chuẩn Hiển Thị (Luật 13/03/2026)
* **Tiêu đề (Headline):** Nên chứa từ khóa địa phương trong tiêu đề để tăng nhận diện và SEO.

## AGENT OWNERSHIP — 1 cửa / 1 owner / 1 AI agent


## QUY TẮC SỬA / AUDIT / REFACTOR WEBSITE (BẮT BUỘC)

QUY TẮC BẮT BUỘC CỦA DỰ ÁN:


## BỘ LUẬT AUDIT / SEO / AI OVERVIEW CẬP NHẬT 2026-05-20

Trước mọi task audit, refactor, cleanup code, sửa WordPress live, viết bài SEO hoặc tối ưu Google AI features, agent phải đọc thêm các file sau:

- `AI_AGENT_RULES.md` — luật chung cho AI Agent.
- `docs/AI_WEB_SEO_AGENT_PROCESS.md` — quy trình website SEO dùng chung đã hợp nhất từ action plan và luật repo; dùng làm baseline đa dự án, không thay overlay dự án.
- `docs/GOOGLE_SEARCH_CENTRAL_MODULES_2026-05-23.md` — module Search appearance/publisher từ tài liệu Google mới; đọc khi task chạm Discover, favicon, featured snippet, AI features controls, Image SEO, byline date hoặc paywall.
- `SEO_RULES.md` — luật technical SEO, Google Search Essentials, Spam Policies, Helpful Content.
- `CONTENT_RULES.md` — luật viết/sửa nội dung website.
- `CODE_CLEANUP_RULES.md` — luật phân loại SAFE_DELETE / REVIEW_REQUIRED / KEEP trước khi xóa code.
- `ARTICLE_SEO_AI_OVERVIEW_CHECKLIST.md` — checklist cho từng bài trước khi publish.
- `DRAFT_DUPLICATE_REVIEW.md` — danh sách draft trùng slug/near-duplicate bị chặn publish hoặc cần rewrite/merge.
- `DRAFT_REMAINING_AUDIT.md` — audit 17 draft còn lại sau cleanup, dùng làm gate trước publish.
- `AUDIT_REPORT.md`, `DEAD_CODE_CANDIDATES.md`, `SEO_FIX_PLAN.md` — báo cáo audit nền và kế hoạch sửa.


Sau audit ngày 2026-05-20 và follow-up ngày 2026-05-21, agent phải coi các file sau là bộ luật hiện hành khi audit/sửa SEO/code: `AUDIT_REPORT.md`, `DEAD_CODE_CANDIDATES.md`, `SEO_FIX_PLAN.md`, `DRAFT_DUPLICATE_REVIEW.md`, `DRAFT_REMAINING_AUDIT.md`, `AI_AGENT_RULES.md`, `SEO_RULES.md`, `CONTENT_RULES.md`, `CODE_CLEANUP_RULES.md`, `ARTICLE_SEO_AI_OVERVIEW_CHECKLIST.md`. Chỉ đánh dấu `Fixed` khi đã có bằng chứng kiểm tra; mục chưa chắc phải để `Needs Review`.

Mỗi khi sửa website, audit, refactor hoặc thay đổi giao diện/chức năng:

- Trước khi viết code mới, phải đọc kỹ các file liên quan.
- Sau khi sửa xong, phải tự audit lại toàn bộ thay đổi.

CHECKLIST BẮT BUỘC SAU MỖI LẦN SỬA:

Trước khi kết thúc task, phải kiểm tra:

- Có code cũ nào còn sót không?
- Có file thừa không?
- Có CSS class thừa không?
- Có logic bị lặp không?
- Có đoạn code nào chỉ là vá tạm không?
- Website có sạch hơn trước không?
- Cấu trúc có dễ bảo trì hơn không?



- File .env
- File cấu hình deploy
- Database
- Migration quan trọng
- Media thật của website
- Ảnh khách hàng
- Logo, brand asset
- Nội dung thật của khách hàng
- File cấu hình thanh toán, email, analytics, tracking
- Key, secret hoặc cấu hình production



NGUYÊN TẮC LÀM VIỆC:

Ưu tiên refactor sạch thay vì vá lỗi tạm.

Không tối ưu nửa vời.


Không che lỗi bằng code mới.


Mỗi thay đổi phải giúp website sạch hơn, dễ hiểu hơn, dễ bảo trì hơn.

MỤC TIÊU CUỐI CÙNG:

Clean website.
Clean codebase.
No legacy junk.
No messy overwrite.
No duplicated old/new code.
No dead code.
No temporary patch unless explicitly required and documented.

## VIỆC CẦN LÀM

- Xác nhận sau này nếu repo phát sinh thêm script/lệnh vận hành thực tế ngoài `CODEX_CONTEXT.md` thì cập nhật tiếp vào `AGENTS.md` thay vì tự suy diễn.
