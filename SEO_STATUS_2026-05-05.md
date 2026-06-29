# Trạng thái SEO - 2026-05-05

## Connector ChatGPT Apps

- Public tunnel hiện dùng được: `https://resource-ports-papua-computers.trycloudflare.com/mcp`.
- Local MCP vẫn chạy tại `http://localhost:8787/mcp`.
- Đã test public connector trước khi lấy task:
  - `/health`: OK.
  - OAuth metadata: OK.
  - OAuth flow `register -> authorize -> token`: OK.
  - `tools/list`: OK, đủ `13` tool.
  - `resources/read` widget: OK.
  - `get_next_seo_tasks`: OK.
  - `check_wordpress_auth`: OK.
- Domain đẹp `https://apps.thongtaccongquangninh.com` vẫn chưa phân giải DNS.

## Task SEO tiếp theo từ Notion

- Task đầu tiên: `Landing phường Bãi Cháy - Thông tắc cống`.
- Task ID: `35088fe5-c7e2-8179-a6bf-f6309ca07a87`.
- Service: `Thông tắc cống`.
- Area: `Hạ Long`.
- Article type: `Landing phường`.
- Focus keyword: `thông tắc cống Bãi Cháy`.
- Deadline: `2026-05-22`.
- Trạng thái Notion tại thời điểm lấy task: `Chưa làm`.

## Đã làm local

- Đã tạo draft local:
  `D:\.thongtaccongquangninh\content-drafts\thong-tac-cong-bai-chay-rankmath-draft.md`
- Đã tạo thêm draft local:
  `D:\.thongtaccongquangninh\content-drafts\thong-tac-cong-cao-xanh-rankmath-draft.md`
- Chưa tạo WordPress draft.
- Chưa publish live.
- Chưa cập nhật Notion hoàn thành.

## Quality gate local - Bãi Cháy

Lệnh kiểm:

```powershell
node .\tools\check_content_quality.mjs .\content-drafts\thong-tac-cong-bai-chay-rankmath-draft.md
```

Kết quả:

- Meta Title: `65` ký tự.
- Meta Description: `156` ký tự.
- Word count: `2788`.
- Focus keyword count: `28`.
- Keyword density: `1%`.
- H1: `1`.
- H2: `14`.
- CTA hotline: `5`.
- Internal links: `13`.
- Từ cấm: không có.
- Emoji: không có.
- Điểm mô phỏng Rank Math: `100/100`.

## Quality gate local - Cao Xanh

Lệnh kiểm:

```powershell
node .\tools\check_content_quality.mjs .\content-drafts\thong-tac-cong-cao-xanh-rankmath-draft.md
```

Kết quả:

- Meta Title: `65` ký tự.
- Meta Description: `156` ký tự.
- Word count: `2814`.
- Focus keyword count: `29`.
- Keyword density: `1.03%`.
- H1: `1`.
- H2: `14`.
- CTA hotline: `5`.
- Internal links: `13`.
- Từ cấm: không có.
- Emoji: không có.
- Điểm mô phỏng Rank Math: `100/100`.

## Việc còn lại

- Tuyền duyệt draft Bãi Cháy và Cao Xanh.
- Việc local tiếp theo theo Notion: `Landing phường Hồng Gai - Thông tắc cống`.
- Sau khi duyệt mới tạo WordPress draft hoặc chuẩn bị ảnh SEO.
- Nếu muốn dùng connector ổn định, cần xử lý DNS/public hostname cho `apps.thongtaccongquangninh.com`.

## Cập nhật live chống Doorway - Hạ Long

- Đã sửa live page `https://thongtaccongquangninh.com/hut-be-phot-ha-long/`, WordPress page ID `52`.
- Backup trước sửa:
  `D:\.thongtaccongquangninh\seo-revisions\wp-before-doorway-safe-hut-be-phot-ha-long-2026-05-05T16-35-57-539Z\pages-52-hut-be-phot-ha-long.json`
- Đã thêm FAQPage schema, link liên quan Hạ Long, tín hiệu địa phương `Hồng Hải`, `Hồng Hà`, `Giếng Đáy`.
- Audit sau sửa:
  - `node .\tools\audit_doorway_safe_page.mjs hut-be-phot-ha-long`: `0` issue.
  - `node .\tools\audit_live_seo_page.mjs hut-be-phot-ha-long`: `100/100`.
  - Live HTTP `200`, canonical self-reference, robots `index, follow`, sitemap có URL.
- Báo cáo chi tiết:
  `D:\.thongtaccongquangninh\SEO_DOORWAY_FIX_REPORT_HA_LONG_2026-05-05.md`
- Rủi ro còn lại: cụm `/hut-be-phot-uong-bi/`, `/hut-be-phot-quang-yen/`, `/hut-be-phot-cam-pha/` vẫn giống Hạ Long khoảng `81%`, cần xử lý ở batch tiếp theo.

## Cập nhật live chống Doorway - Nhóm thành phố 8 URL

- Đã sửa live 8 trang dịch vụ thành phố hiện có:
  - `/hut-be-phot-ha-long/` - page ID `52`.
  - `/hut-be-phot-uong-bi/` - page ID `54`.
  - `/hut-be-phot-quang-yen/` - page ID `57`.
  - `/hut-be-phot-cam-pha/` - page ID `53`.
  - `/thong-tac-cong-ha-long/` - page ID `296`.
  - `/thong-tac-cong-cam-pha/` - page ID `400`.
  - `/thong-tac-cong-uong-bi/` - page ID `405`.
  - `/thong-tac-cong-quang-yen/` - page ID `424`.
- Backup trước batch:
  `D:\.thongtaccongquangninh\seo-revisions\wp-before-city-doorway-safe-2026-05-05T16-58-49-651Z\`
- Backup bổ sung trước xử lý renderer trang `/thong-tac-cong-ha-long/`:
  `D:\.thongtaccongquangninh\seo-revisions\wp-before-disable-elementor-thong-tac-cong-ha-long-2026-05-05T17-03-15-352Z\`
- Nội dung đã chuẩn hóa:
  - Mở bài riêng theo địa bàn.
  - Đoạn đặc thù địa phương riêng.
  - Case study riêng.
  - FAQ riêng.
  - LocalBusiness + FAQPage + BreadcrumbList schema.
  - Internal link về dịch vụ chính, dịch vụ liên quan, FAQ và liên hệ.
- Kết quả quality gate:
  - 8/8 URL audit Doorway live: `0` issue.
  - 8/8 URL điểm SEO mô phỏng live: từ `95/100` đến `100/100`.
  - Tỉ lệ giống nhau sau sửa: khoảng `62.27%` đến `63.45%`, không URL nào vượt ngưỡng `70%`.
  - Internal link 404: `0`.
  - Sitemap `page-sitemap.xml` có đủ 8 URL.
  - PHP syntax plugin renderer: OK.
  - Marker debug renderer: không còn lộ trên HTML live.
- Báo cáo cuối:
  `D:\.thongtaccongquangninh\SEO_DOORWAY_FIX_REPORT_CITY_GROUP_2026-05-05.md`
- Sửa bổ sung sau audit:
  - Đã sửa meta description/excerpt của 4 trang `/thong-tac-cong-[thanh-pho]/` để bỏ đuôi câu gượng.
  - Backup trước sửa meta:
    `D:\.thongtaccongquangninh\seo-revisions\wp-before-city-meta-descriptions-2026-05-05T17-34-02-378Z\`
  - Report kỹ thuật:
    `D:\.thongtaccongquangninh\WORDPRESS_FIX_CITY_META_DESCRIPTIONS_2026-05-05.json`
  - Audit lại 4/4 URL sau sửa meta: Doorway `0` issue, điểm SEO `100/100`.
- Ghi chú an toàn:
  - Quyết định cũ "các trang Uông Bí/Quảng Yên/Cẩm Phả còn giống Hạ Long 81%" đã được thay thế bằng batch sửa mới này.
  - Chưa auto-publish trang phường mới và chưa tạo `/cau-hoi-thuong-gap/` để tránh duplicate/publish khi chưa duyệt.
  - Việc còn lại: bổ sung ảnh thực địa, kiểm GSC URL Inspection và xử lý batch phường sau khi Tuyền duyệt.
