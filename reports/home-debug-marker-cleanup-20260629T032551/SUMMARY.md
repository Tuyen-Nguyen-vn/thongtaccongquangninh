# Home Debug Marker Cleanup 2026-06-29

- Time: 2026-06-29 03:25 +07
- Scope: truy nguồn comment `TTCQN_DEBUG` trên homepage live và dọn runtime path cũ liên quan meta homepage

## Root cause

- Marker public `<!-- TTCQN_DEBUG is_front=yes is_home=no -->` không đến từ repo-local renderer.
- Nguồn live thực tế là plugin:
  - `public_html/wp-content/plugins/ttcqn-meta-final/ttcqn-meta-final.php`
- File này đang hook `wp_head` với:
  - `echo '<!-- TTCQN_DEBUG is_front=' . $f . ' is_home=' . $h . ' -->';`
- Cùng plugin còn chứa nhánh override meta description homepage kiểu cũ.

## Change applied

- Deactivated live plugin:
  - `ttcqn-meta-final`
- Backup trạng thái plugin trước thay đổi:
  - `backups/plugin-status-20260629T031000/ttcqn-meta-final.before.json`

## Live verify

- Current live plugin inventory shows:
  - `ttcqn-meta-final` = `inactive`
- Public homepage with cache-buster now returns:
  - `<title>` = `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
  - `<meta name="description">` = `Hút bể phốt, thông tắc cống, bồn cầu, hố ga tại Quảng Ninh. Hoạt động 05:00-22:00 hằng ngày, có mặt 15 phút, báo giá trước, không đục phá. Gọi ngay 0963.953.533 / 0931.156.756 để xử lý.`
  - `og:title` = `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
  - `og:description` = same current public description
  - `twitter:title` = `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
  - `twitter:description` = same current public description
- Public HTML no longer contains:
  - `TTCQN_DEBUG`

## Cache / purge note

- Hosting MCP purge attempt still reports known warning:
  - `wp-mcp-ultimate/discover-abilities does not exist`
  - `'litespeed-purge' is not a registered wp command`
- This did not block acceptance because public cache-buster verify already reflects the cleaned output.

## Interpretation

- The homepage debug marker issue is resolved on live.
- Deactivating `ttcqn-meta-final` also removes one more stale homepage meta runtime path that could have reintroduced old output later.
- Remaining homepage meta/plugin cleanup should focus on other legacy actives, not this marker anymore.
