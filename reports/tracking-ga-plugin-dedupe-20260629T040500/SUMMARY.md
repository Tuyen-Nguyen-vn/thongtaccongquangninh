# Tracking GA Plugin Dedupe 2026-06-29

- Time: 2026-06-29 04:05 +07
- Scope: giảm một lớp GA duplicate sitewide bằng cách tắt `ttcqn-google-analytics-tag` sau khi đã xác nhận homepage và non-home còn emitter thay thế

## Pre-change reasoning

- Homepage vẫn có `G-F2BXPJYKEG` trong renderer delayed loader
- Non-home sample page vẫn có `G-F2BXPJYKEG` qua Site Kit inline config
- Vì vậy có thể tắt plugin `ttcqn-google-analytics-tag` mà không làm biến mất hoàn toàn GA4 config trên homepage/non-home

## Change applied

- Deactivated live plugin:
  - `ttcqn-google-analytics-tag`
- Backed up plugin inventory before change:
  - `backups/plugin-status-20260629T040500/plugins.before.json`

## Live verify

- Current live plugin inventory shows:
  - `ttcqn-google-analytics-tag` = `inactive`
  - `ttcqn-google-ads-tag` = `active`
  - `google-site-kit` = `active`

### Homepage verify

- Public homepage still returns:
  - current verified description `05:00-22:00`
  - `#ttcqn-delayed-analytics`
  - delayed `G-F2BXPJYKEG`
  - delayed `AW-18031795119`
  - delayed `GTM-5N59RCXC`

### Non-home verify

- Sample page `/thong-tac-cong-quang-ninh/` still returns:
  - `GT-WKPJJQ2K` from Site Kit
  - inline `gtag('config', 'G-F2BXPJYKEG', {'anonymize_ip': true})`
  - `AW-18031795119`
  - `GTM-5N59RCXC`
- The old direct TTCQN GA plugin layer for `G-F2BXPJYKEG` is no longer present in non-home HTML.

## Interpretation

- This removes one duplicate GA emitter with low blast radius.
- Homepage tracking path is unchanged because renderer still owns homepage delayed analytics.
- Non-home pages still keep GA via Site Kit, so this step reduces duplication without cutting the only visible GA path there.
