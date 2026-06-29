# Home Performance Layer Cleanup - 2026-05-21

## Summary

Removed one legacy homepage CSS/preload layer by integrating `ttcqn-home-performance-tune` into the active homepage renderer.

## Fixed

- Added the former performance plugin hero background preload into `ttcqn-home-emergency-renderer/templates/page-home-direct.php`.
- Integrated the former performance CSS rules into the direct homepage template.
- Bumped `ttcqn-home-emergency-renderer` to version `2026.05.21.2`.
- Uploaded the renderer plugin to live WordPress.
- Deactivated live plugin `ttcqn-home-performance-tune/ttcqn-home-performance-tune.php`.
- Archived local performance plugin source, zip, old upload/deactivate scripts, and temp zip check artifact.
- Updated `_pack_zips.py` so it no longer packages the retired plugin.

## Verification

- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`: passed.
- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`: passed.
- All active local plugin PHP files under `tools/wp-plugins`: passed.
- `tools/_pack_zips.py` AST syntax check: passed.
- Live homepage with cache buster: HTTP 200.
- Live homepage marker: `ttcqn-home-emergency-renderer` = `2026.05.21.2; direct-template`.
- Live homepage old style id count `ttcqn-home-performance-tune`: 0.
- Live homepage integrated performance marker: present.
- Live hero background preload: present.
- Live `/blog/`: HTTP 200.
- Live `page-sitemap.xml`: HTTP 200, retired `/thong-tac-toilet-quang-ninh/` absent.

## Files Changed

- `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`
- `tools/_pack_zips.py`
- `AUDIT_REPORT.md`
- `DEAD_CODE_CANDIDATES.md`
- `SEO_FIX_PLAN.md`
- `backups/cleanup-home-performance-tune-2026-05-21/manifest.md`

## Archived

- `backups/cleanup-home-performance-tune-2026-05-21/tools/wp-plugins/ttcqn-home-performance-tune/`
- `backups/cleanup-home-performance-tune-2026-05-21/tools/wp-plugins/ttcqn-home-performance-tune.zip`
- `backups/cleanup-home-performance-tune-2026-05-21/tools/upload_home_performance_tune_plugin.mjs`
- `backups/cleanup-home-performance-tune-2026-05-21/tools/deactivate_home_performance_tune_plugin.mjs`
- `backups/cleanup-home-performance-tune-2026-05-21/_tmp/check-ttcqn-home-performance-tune-zip/`
