# Global Styles Layer Cleanup - 2026-05-21

## Summary

Removed the legacy inner-page CSS block `GENERATEPRESS THEME OVERRIDE` from live HTML output. The newer scoped renderer CSS remains active.

## Fixed

- Updated `ttcqn-home-emergency-renderer` to version `2026.05.21.3`.
- Extended the existing legacy output buffer to strip any `<style>` block containing `GENERATEPRESS THEME OVERRIDE`.
- Uploaded the renderer plugin to live WordPress.
- Archived local root `global-styles.php`.

## Verification

- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`: passed.
- `python3 tools/_pack_zips.py`: rebuilt renderer zip successfully.
- Upload summary: success and active confirmed.
- Live `/`: HTTP 200, H1 count 1, renderer marker `2026.05.21.3; direct-template`.
- Live `/blog/`: HTTP 200, H1 count 1, `GENERATEPRESS THEME OVERRIDE` count 0, `ttcqn-gp-pages-css` count 1.
- Live `/hut-be-phot-quang-ninh/`: HTTP 200, H1 count 1, `GENERATEPRESS THEME OVERRIDE` count 0, `ttcqn-gp-pages-css` count 1.
- Old performance style marker `ttcqn-home-performance-tune` count 0 on tested URLs.

## Archived

- `backups/cleanup-global-styles-2026-05-21/root-files/global-styles.php`
