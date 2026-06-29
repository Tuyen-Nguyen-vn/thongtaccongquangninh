# REVIEW_REQUIRED Cleanup - 2026-05-21

## Summary

Đã xử lý nhóm `REVIEW_REQUIRED` có đủ bằng chứng mà không xóa cứng dữ liệu rollback. Các artifact cũ được chuyển vào `backups/cleanup-review-required-2026-05-21/`.

## Archived

- Root duplicate `ttcqn-home-performance-tune.php`.
- Root preview snapshot `_tmp_home_reference_preview.html`.
- Old favicon plugin folders/zips:
  - `tools/wp-plugins/ttcqn-favicon-override/`
  - `tools/wp-plugins/ttcqn-favicon-override.zip`
  - `tools/wp-plugins/ttcqn-favicon-override-20260512/`
  - `tools/wp-plugins/ttcqn-favicon-override-20260512.zip`
- Diagnostic plugin folder/zip:
  - `tools/wp-plugins/ttcqn-home-template-diagnostics/`
  - `tools/wp-plugins/ttcqn-home-template-diagnostics.zip`
- Old one-off upload/cleanup scripts:
  - `tools/upload_favicon_override_plugin.mjs`
  - `tools/upload_favicon_override_20260512_plugin.mjs`
  - `tools/force_disable_old_favicon_plugin.mjs`
  - `tools/cleanup_old_favicon_mcp.mjs`
  - `tools/upload_home_template_diagnostics_plugin.mjs`
  - `tools/mcp_upload_favicon_plugin.mjs`
- 0-byte backup asset:
  - `image-briefs/assets-backup-2026-05-10/hut-be-phot-van-don-case-study.jpg`

## Kept

- `global-styles.php`: live `/blog/` still emits the `GENERATEPRESS THEME OVERRIDE` CSS block, so this is active code and must not be deleted blindly.
- `tools/wp-plugins/ttcqn-home-performance-tune/` and zip: active live plugin/source package.
- Historical `WORDPRESS_*.json`, `reports/**`, `backups/**`: kept as audit evidence/rollback history.

## Verification

- MCP active plugins: `ttcqn-favicon-override-v3`, `ttcqn-home-performance-tune`, `ttcqn-home-emergency-renderer`, `ttcqn-seo-cleanup-redirects` active.
- `tools/wp-plugins` PHP lint: no syntax errors.
- Remaining active `tools` scan: no old favicon upload scripts or diagnostics upload script remain outside backup.
- Live smoke:
  - `/` status `200`, no critical error, old favicon marker absent.
  - `/blog/` status `200`, no critical error, old favicon marker absent, `global-styles.php` CSS present.
  - `/wp-json/` status `200`.
  - `/page-sitemap.xml` status `200`.
  - `/thong-tac-toilet-quang-ninh/` status `301` to `/thong-tac-bon-cau-quang-ninh/` via `TTCQN SEO Cleanup Redirects`.

## Remaining

- Refactor `global-styles.php` only after visual comparison on key inner pages.
- Homepage active plugins still need visual regression before any consolidation:
  - `ttcqn-home-emergency-renderer`
  - `ttcqn-home-performance-tune`
  - `ttcqn-home-lead-form`
  - `ttcqn-scroll-guide-assistant`
  - `ttcqn-mobile-left-sticky-cta`
