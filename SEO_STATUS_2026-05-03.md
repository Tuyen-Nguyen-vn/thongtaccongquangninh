# Trạng thái SEO và ChatGPT Apps - 2026-05-03

## Cập nhật ChatGPT Apps public tunnel - 2026-05-05

- Tunnel cũ `https://delivery-browse-owen-large.trycloudflare.com/mcp` đã chết DNS.
- Đã mở tunnel mới: `https://resource-ports-papua-computers.trycloudflare.com/mcp`.
- Đã cập nhật `.env`, `.env.example` trong project ChatGPT Apps SEO và restart `node server.js`.
- Đã test public `/health`, OAuth metadata, OAuth flow, `tools/list`, widget `resources/read`, `get_next_seo_tasks`, `check_wordpress_auth`: OK.
- `apps.thongtaccongquangninh.com` vẫn chưa phân giải DNS, nên URL đẹp vẫn là blocker hạ tầng.
- Trạng thái: connector dùng được qua tunnel tạm mới; chưa phải custom domain live ổn định.

## Đã kiểm tra lại live

- Full-site audit live: `51/51` URL publish HTTP `200`.
- URL dưới 90 điểm: `0`.
- File bằng chứng: `D:\.thongtaccongquangninh\reports\audit-live-full-site-2026-05-03.csv`.
- Trang từng hiện 96 trong batch `hut-be-phot-ha-long-xe-hut-24-7` đã audit riêng lại: `100/100`.
- Link/asset audit: `51` page, `323` target, còn `1` target HTTP `403` là `xmlrpc.php?rsd`; đây là endpoint kỹ thuật WordPress, không phải link khách hàng.

## Đã kiểm tra ChatGPT Apps MCP

- `npm run check`: pass.
- Local `/health`: OK tại `http://localhost:8787/health`.
- Local MCP `tools/list`: OK, có đủ tool.
- Local MCP `check_wordpress_auth`: OK, user `chatgpt`, role `administrator`.
- Local MCP `get_next_seo_tasks`: OK.
- Widget resource `ui://widget/seo-dashboard-v1.html`: OK, có `ui.domain` và `openai/widgetDomain`.
- Public domain `https://apps.thongtaccongquangninh.com`: chưa phân giải DNS từ máy này, nên ChatGPT chưa dùng được custom domain public.

## Đã đồng bộ Notion

- Notion trước đó vẫn trả 4 landing đã live là `Chưa làm`.
- Đã đánh dấu hoàn thành và thêm URL live cho:
  - `Landing Uông Bí - Thông tắc bồn cầu`: `https://thongtaccongquangninh.com/thong-tac-bon-cau-uong-bi/`
  - `Landing Quảng Yên - Thông tắc bồn cầu`: `https://thongtaccongquangninh.com/thong-tac-bon-cau-quang-yen/`
  - `Landing Đông Triều - Thông tắc bồn cầu`: `https://thongtaccongquangninh.com/thong-tac-bon-cau-dong-trieu/`
  - `Landing Móng Cái - Thông tắc bồn cầu`: `https://thongtaccongquangninh.com/thong-tac-bon-cau-mong-cai/`
- Sau đồng bộ, MCP trả task tiếp theo đúng là `Trang FAQ tổng hợp`.

## Đã làm tiếp công việc kế tiếp

- Đã tạo draft local cho task `Trang FAQ tổng hợp`.
- File draft: `D:\.thongtaccongquangninh\content-drafts\trang-faq-tong-hop-thong-tac-cong-rankmath-draft.md`.
- Focus keyword: `câu hỏi thường gặp thông tắc cống`.
- Tự kiểm draft:
  - Số từ: `2045`.
  - Meta Title: `61` ký tự.
  - Meta Description: `154` ký tự.
  - H1: `1`.
  - H2: `15`.
  - Hotline: có đủ `0963.953.533 / 0931.156.756`.
  - Từ cấm: không có.
  - Emoji: không có.
  - Có block schema `FAQPage`.

## Việc còn lại

- Chờ Tuyền duyệt nội dung FAQ trước khi tạo WordPress draft.
- Chưa public FAQ live.
- Chưa xử lý DNS `apps.thongtaccongquangninh.com`; cần trỏ domain/tunnel về local server `http://localhost:8787` nếu muốn ChatGPT dùng connector public.

## Log sửa xưng hô Anh/Chị - 2026-05-03

- Yêu cầu: đổi cách xưng hô trong bài từ `Anh/anh` sang `Anh/Chị` hoặc `anh/chị`.
- Đã thêm script: `D:\.thongtaccongquangninh\tools\fix_anh_chi_wording.mjs`.
- Đã sửa local: `1` file draft, là `content-drafts\trang-faq-tong-hop-thong-tac-cong-rankmath-draft.md`.
- Đã sửa WordPress: `1` bản nháp post ID `538`, slug `thong-tac-bon-cau-quang-yen`.
- Backup WordPress trước sửa: `D:\.thongtaccongquangninh\seo-revisions\wp-before-anh-chi-wording-2026-05-03T05-09-11`.
- Report local: `D:\.thongtaccongquangninh\LOCAL_FIX_ANH_CHI_WORDING_2026-05-03T05-09-11.json`.
- Report WordPress: `D:\.thongtaccongquangninh\WORDPRESS_FIX_ANH_CHI_WORDING_2026-05-03T05-09-11.json`.
- Verify local: `49` draft Markdown, còn `0` file có `Anh/anh` độc lập.
- Verify WordPress: `58` page/post publish/draft/pending/private, còn `0` bản có `Anh/anh` độc lập trong content/excerpt.
- Full-site audit live sau sửa: `51/51` URL HTTP `200`, `0` URL dưới 90.

## Log public FAQ tổng hợp - 2026-05-03

- Yêu cầu: Tuyền duyệt public task `Trang FAQ tổng hợp`.
- Đã nâng draft FAQ lên gate public toàn site trước khi publish:
  - Meta Title: `61` ký tự.
  - Meta Description: `154` ký tự.
  - Word count live: `2872`.
  - Focus keyword: `câu hỏi thường gặp thông tắc cống`.
  - Keyword density: `1.01%`.
  - H1 live: `1`.
  - H2: `20`.
  - Có Nguyên nhân, Cam kết 3 Không, Bảng giá, Quy trình 5 bước, Case study E-E-A-T, NAP, FAQ.
  - Không từ cấm, không emoji.
- Đã public WordPress page ID `649`.
- Live URL: `https://thongtaccongquangninh.com/cau-hoi-thuong-gap-thong-tac-cong/`.
- Featured media ID: `375`.
- Rank Math:
  - `updateMeta`: OK.
  - `updateSeoScore`: `1`.
  - Batch Rank Math chứa page tại offset `50`, keyword đúng.
- Instant Indexing: `Successfully submitted 1 URL.`
- Audit riêng: `cau-hoi-thuong-gap-thong-tac-cong` đạt `100/100`.
- Full-site audit sau public: `52/52` URL HTTP `200`, `0` URL dưới 90.
- Report audit riêng:
  - `D:\.thongtaccongquangninh\reports\website-check-cau-hoi-thuong-gap-thong-tac-cong-2026-05-03.json`
  - `D:\.thongtaccongquangninh\reports\website-check-cau-hoi-thuong-gap-thong-tac-cong-2026-05-03.md`
- Report publish:
  - `D:\.thongtaccongquangninh\WORDPRESS_PUBLISH_FAQ_TONG_HOP_2026-05-03T05-17-51.json`
- Backup trước lần update cuối:
  - `D:\.thongtaccongquangninh\seo-revisions\wp-before-faq-publish-2026-05-03T05-17-51`
- Đã cập nhật Notion task `Trang FAQ tổng hợp`: đánh dấu hoàn thành, thêm URL live, ngày hoàn thành `2026-05-03`.
