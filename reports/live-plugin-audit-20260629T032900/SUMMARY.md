# Live Plugin Audit 2026-06-29

- Time: 2026-06-29 03:29 +07
- Scope: verify current live TTCQN plugin state related to homepage/meta legacy cleanup

## Current live findings

- WordPress REST plugin endpoint is available at `/wp-json/wp/v2/plugins`
- Current TTCQN active plugins on live: `59`
- Classified as suspicious legacy/debug/one-shot: `33`
- Notable suspicious actives include:
  - `ttcqn-debug-filter/ttcqn-debug-filter`
  - `ttcqn-fix-home-v3/ttcqn-fix-home-v3`
  - `ttcqn-meta-final/ttcqn-meta-final`
  - `ttcqn-missing-meta/ttcqn-missing-meta`
  - `ttcqn-purge-meta-posts/ttcqn-purge-meta-posts`
  - `ttcqn-purge-word-fix/ttcqn-purge-word-fix`
  - `ttcqn-rm-*` page 282 debug/fix stack
  - `ttcqn-wr2` to `ttcqn-wr25` one-shot/debug/helper stack

## Change applied

- Deactivated live plugin:
  - `ttcqn-debug-filter/ttcqn-debug-filter`
- REST verify after write confirms plugin status is now `inactive`

## Public verify

- Homepage still returns:
  - `<title>` = `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
  - `og:title` = `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
  - `twitter:title` = `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
- Unexpected result:
  - HTML public still contains comment `TTCQN_DEBUG is_front=yes is_home=no`

## Interpretation

- Deactivating `ttcqn-debug-filter` did not remove the public debug marker.
- Local repo search does not contain the `TTCQN_DEBUG` literal.
- Most likely causes now:
  - live file drift outside repo-local source, or
  - cached/generated output from another runtime path

## Evidence

- `backups/plugin-status-20260629T031000/ttcqn-debug-filter.before.json`
  - note: initial backup attempt used the wrong REST route and returned `rest_plugin_not_found`
- REST direct verify after deactivation confirmed `status=inactive`
- Public cache-buster fetch still showed the marker
