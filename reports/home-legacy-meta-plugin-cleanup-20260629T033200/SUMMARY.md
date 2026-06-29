# Home Legacy Meta Plugin Cleanup 2026-06-29

- Time: 2026-06-29 03:32 +07
- Scope: dọn tiếp các plugin homepage meta legacy còn active sau khi đã xử lý `ttcqn-meta-final`

## Findings

- `ttcqn-meta-15phut` đang active và chứa runtime override description homepage về copy cũ:
  - `Hút bể phốt ... Quảng Ninh 24/7. Có mặt 15 phút ...`
  - hook `rank_math/frontend/description`
  - hook `rank_math/opengraph/facebook/description`
  - hook `rank_math/opengraph/twitter/description`
- `ttcqn-fix-home-v3` đang active và còn chạy:
  - `update_post_meta(23, 'rank_math_description', ...)`
  - nội dung cũng là bản cũ `24/7`

## Change applied

- Deactivated live plugins:
  - `ttcqn-meta-15phut`
  - `ttcqn-fix-home-v3`
- Backed up plugin inventory before change:
  - `backups/plugin-status-20260629T033200/plugins.before.json`

## Live verify

- Current live plugin inventory shows:
  - `ttcqn-meta-15phut` = `inactive`
  - `ttcqn-fix-home-v3` = `inactive`
- Public homepage with cache-buster still returns:
  - `<title>` = `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
  - `<meta name="description">` = `Hút bể phốt, thông tắc cống, bồn cầu, hố ga tại Quảng Ninh. Hoạt động 05:00-22:00 hằng ngày, có mặt 15 phút, báo giá trước, không đục phá. Gọi ngay 0963.953.533 / 0931.156.756 để xử lý.`
  - `og:description` = same current public description
  - `twitter:description` = same current public description
- Public homepage no longer contains:
  - `TTCQN_DEBUG`
  - stale meta description copy with `24/7`

## Interpretation

- Two more stale homepage meta runtime paths have been removed from live.
- The current homepage meta output remains stable without depending on those legacy plugins.
- The next cleanup target should be whichever remaining active plugin still touches homepage Rank Math/meta behavior, not renderer markup.
