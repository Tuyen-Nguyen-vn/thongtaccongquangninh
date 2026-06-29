# Home Meta Runtime Plugin Cleanup 2026-06-29

- Time: 2026-06-29 03:39 +07
- Scope: rà nhóm plugin meta/debug còn active sau lượt dọn `ttcqn-meta-15phut` và `ttcqn-fix-home-v3`

## Findings

- `ttcqn-missing-meta`
  - chỉ mở REST endpoint `ttcqn/v1/missing-rankmath`
  - không ghi đè homepage meta/runtime
  - được giữ lại ở lượt này
- `ttcqn-rm-meta-debug`
  - đang active
  - chạy `update_post_meta(282, '_rank_math_title', ...)` trên mọi `init`
  - đây là debug/runtime write path không nên để active
- `ttcqn-purge-meta-posts`
  - đang active
  - là one-shot purge cũ cho một nhóm post meta fix
  - không còn cần giữ active sau khi workflow cũ đã xong

## Change applied

- Deactivated live plugins:
  - `ttcqn-rm-meta-debug`
  - `ttcqn-purge-meta-posts`
- Backed up plugin inventory before change:
  - `backups/plugin-status-20260629T033900/plugins.before.json`

## Live verify

- Current live plugin inventory shows:
  - `ttcqn-missing-meta` = `active`
  - `ttcqn-rm-meta-debug` = `inactive`
  - `ttcqn-purge-meta-posts` = `inactive`
- Public homepage with cache-buster still returns:
  - `<title>` = `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
  - `<meta name="description">` = `Hút bể phốt, thông tắc cống, bồn cầu, hố ga tại Quảng Ninh. Hoạt động 05:00-22:00 hằng ngày, có mặt 15 phút, báo giá trước, không đục phá. Gọi ngay 0963.953.533 / 0931.156.756 để xử lý.`
  - `og:description` = same current public description
  - `twitter:description` = same current public description
- Public homepage still does not contain:
  - `TTCQN_DEBUG`
  - stale meta copy with `24/7`

## Interpretation

- Homepage runtime is now cleaner: the remaining active plugin in this group is the read-only audit helper `ttcqn-missing-meta`.
- The two write/purge legacy plugins are no longer in the live execution path.
