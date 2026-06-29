# BOM cleanup homepage verify 2026-06-27

## Scope

- Removed UTF-8 BOM from local plugin PHP sources that could emit bytes before `<!DOCTYPE html>`.
- Bumped deployed plugin versions to `2026.06.27.3`.
- Deployed only these live files through panel MCP:
  - `public_html/wp-content/plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
  - `public_html/wp-content/plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`
  - `public_html/wp-content/plugins/ttcqn-home-emergency-renderer/templates/shared-footer.php`
  - `public_html/wp-content/plugins/ttcqn-doorway-schema/ttcqn-doorway-schema.php`

## Backups

- Local zip backups: `backups/bom-cleanup-20260627T113856/`
- Remote file backups: `backups/bom-cleanup-20260627T113856/panel-live-backup/`

## Verification

- PHP lint passed for renderer main, homepage template, shared footer, and doorway schema plugin.
- Rebuilt plugin zips and checked zip-contained PHP byte starts: no BOM.
- Local homepage preview starts with `<!DOCTYPE html>`.
- Live panel verification saved `home-live-after.html`: HTTP 200, first bytes `3c21444f4354595045206874`, renderer version `2026.06.27.3`, meta description present.
- Public curl verification saved `home-final-curl.html`: HTTP 200, no BOM, starts with `<!DOCTYPE html>`, renderer version `2026.06.27.3`, meta description present.
- PageSpeed API verification:
  - Mobile: SEO `1.00`, doctype `1`, meta description `1`, document title `1`.
  - Desktop: SEO `1.00`, doctype `1`, meta description `1`, document title `1`.

## Notes

- Old WP MCP Ultimate upload script failed because `wp-mcp-ultimate-execute-ability` was not available.
- Panel cache purge call returned an invalid-params error, but cache-busted live output verified the deployed version directly.
