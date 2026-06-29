# Home Local Title Source Sync 2026-06-29

- Time: 2026-06-29 03:15 +07
- Scope: sync stale local homepage title override source with current live homepage title

## Changes

- Updated local plugin source:
  - `tools/wp-plugins/ttcqn-title-meta-short-2026-06-12/ttcqn-title-meta-short-2026-06-12.php`
- Bumped plugin header version from `2026.06.28.1` to `2026.06.29.1`
- Replaced page `23` title override in both filter return and init meta-fix array:
  - from `Thông Tắc Cống, Hút Bể Phốt Quảng Ninh - Gọi Thợ Tới Nhanh`
  - to `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`

## Verification

- `php -l tools/wp-plugins/ttcqn-title-meta-short-2026-06-12/ttcqn-title-meta-short-2026-06-12.php`
  - result: no syntax errors
- Public homepage fetch with cache-buster:
  - URL: `https://thongtaccongquangninh.com/?nowprocket=1&codex=home-title-sync-20260629`
  - renderer marker: `2026.06.28.7; direct-template`
  - `<title>`: `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
  - `og:title`: `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
  - `twitter:title`: `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`

## Rationale

- Live homepage title had already changed via verified-hours public meta batch on 2026-06-28.
- Local plugin source still carried an older homepage override string, which could mislead future audits.
- This step aligns local source with current public output without changing renderer/live behavior.
