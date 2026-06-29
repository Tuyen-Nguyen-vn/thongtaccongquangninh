# Tracking Stack Audit 2026-06-29

- Time: 2026-06-29 03:45 +07
- Scope: xác định các lớp tracking còn active trên homepage và non-home trước khi đụng live analytics tiếp

## Findings

### 1) Homepage renderer vẫn tự bơm tracking

- File local:
  - `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- Renderer homepage hiện đang:
  - delay-load `gtag/js?id=AW-18031795119`
  - `gtag('config', 'AW-18031795119')`
  - `gtag('config', 'G-F2BXPJYKEG')`
  - delay-load `gtm.js?id=GTM-5N59RCXC`
- Đồng thời renderer có regex strip để loại bớt một số tag `GTM` / `gtag` chèn trước đó riêng cho homepage.

### 2) Plugin tracking sitewide vẫn đang active

- `ttcqn-google-analytics-tag`
  - chèn sitewide `gtag/js?id=<measurement_id>`
  - `gtag('config', measurement_id)`
- `ttcqn-google-ads-tag`
  - chèn sitewide `gtag/js?id=AW-18031795119`
  - `gtag('config', 'AW-18031795119')`
- MU plugin `ttcqn-gtm`
  - chèn sitewide `GTM-5N59RCXC`

### 3) Non-home page còn có thêm lớp Site Kit / Google tag khác

- Sample page:
  - `https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/`
- Public HTML sample shows:
  - `GTM-5N59RCXC`
  - `AW-18031795119`
  - `G-F2BXPJYKEG`
  - `GT-WKPJJQ2K`
- Tức là stack hiện tại không chỉ là plugin TTCQN + GTM, mà còn có thêm nhánh Google/Site Kit khác trên non-home pages.

## Interpretation

- Homepage duplication hiện không thể giải quyết an toàn bằng cách chỉ tắt 1 plugin sitewide.
- Nếu deactive `ttcqn-google-analytics-tag` hoặc `ttcqn-google-ads-tag` ngay, homepage có thể vẫn còn tracking do renderer; nhưng non-home pages sẽ đổi measurement path theo cách chưa verify business-safe.
- Bước đúng tiếp theo là validate stack ở cấp GTM/GA/Site Kit trước, rồi mới quyết định dọn plugin sitewide hay dọn renderer homepage.

## Decision

- No live plugin deactivation in this step.
- This step is audit-only because current risk is sitewide analytics drift, not homepage SEO/meta regression.
