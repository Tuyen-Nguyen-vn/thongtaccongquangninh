# Homepage cache and Best Practices follow-up 2026-06-28

## Scope

- Re-verified homepage after BOM source cleanup to ensure cached public HTML no longer prepends bytes before `<!DOCTYPE html>`.
- Cleared stale WP Rocket homepage cache files still serving a BOM-prefixed cached page.
- Fixed a runtime footer script error that Lighthouse reported as `SyntaxError: Illegal return statement`.
- Fixed deprecated media overflow behavior on homepage service card images.

## What changed

- Removed stale cached homepage files from:
  - `public_html/wp-content/cache/wp-rocket/thongtaccongquangninh.com/index-https.html`
  - `public_html/wp-content/cache/wp-rocket/thongtaccongquangninh.com/index-https.html_gzip`
- Wrapped shared footer inline interactions in an IIFE:
  - `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/shared-footer-interactions-inline.php`
- Bumped renderer versions:
  - `2026.06.27.3` -> `2026.06.28.1` for footer console fix
  - `2026.06.28.1` -> `2026.06.28.2` for media overflow fix
- Added scoped overflow guard for service card images:
  - `tools/wp-plugins/ttcqn-home-emergency-renderer/assets/ttcqn-home.min.css`

## Verification

- Public homepage without cache-buster now starts with `<!DOCTYPE html>` and no BOM.
- Regenerated WP Rocket homepage cache file also starts with `<!DOCTYPE html>` and no BOM.
- Footer browser verification passed `7/7` scenarios via `npm run verify:footer-live`.
- Puppeteer DOM probe after CSS fix found `0` media elements with computed `overflow: visible`.
- `npm run design:check` passed with `0 errors / 0 warnings` and token mapping `ok: true`.
- PageSpeed full on normal homepage URL after final fix:
  - Mobile: Performance `0.87`, Accessibility `0.93`, Best Practices `1.00`, SEO `1.00`, LCP `3.1 s`, CLS `0`, TBT `230 ms`
  - Desktop: Performance `0.76`, Accessibility `0.94`, Best Practices `1.00`, SEO `1.00`, LCP `0.9 s`, CLS `0`, TBT `510 ms`
- SEO technical audits in PSI all pass:
  - `doctype = 1`
  - `metaDescription = 1`
  - `documentTitle = 1`
  - `errorsInConsole = 1`
  - `deprecations = 1`

## Backups and evidence

- Cache backup before delete: `backups/bom-cache-followup-20260628T001507/`
- Footer fix backups: `backups/footer-console-fix-20260628T001507/`
- Media overflow fix backups: `backups/media-overflow-fix-20260628T001507/`
- Intermediate evidence:
  - `reports/bom-cache-followup-20260628T001507/`
  - `reports/footer-console-fix-20260628T001507/`
  - `reports/media-overflow-fix-20260628T001507/`
