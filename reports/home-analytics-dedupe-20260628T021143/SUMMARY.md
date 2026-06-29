# Homepage analytics dedupe 2026-06-28

## Scope

- Reduced duplicate analytics loading on homepage only.
- Kept delayed GTM container loading.
- Removed direct delayed `gtag` loading/config for homepage renderer.

## Code change

- Updated `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- Renderer version bumped to `2026.06.28.4`
- Rebuilt `tools/wp-plugins/ttcqn-home-emergency-renderer.zip`

## Live verification

- Public homepage serves renderer version `2026.06.28.4`
- Homepage HTML no longer includes direct delayed:
  - `gtag/js?id=AW-18031795119`
  - `gtag/js?id=G-F2BXPJYKEG`
- Homepage still includes delayed GTM container:
  - `gtm.js?id=GTM-5N59RCXC`

## Request reduction

- Before dedupe on homepage: `6` analytics-related requests
- After dedupe on homepage: `2` analytics-related requests
- Remaining unique requests observed:
  - `https://www.googletagmanager.com/gtm.js?id=GTM-5N59RCXC`
  - `https://www.googletagmanager.com/gtag/js?id=G-KDPB94Y7Y7&cx=c&gtm=4e66o1`

## PageSpeed after change

- Mobile:
  - Performance `0.85`
  - Best Practices `1.00`
  - SEO `1.00`
  - Unused JS savings `167 KiB`
  - Bootup time `0.2 s`
  - TBT `60 ms`
- Desktop:
  - Performance `0.93`
  - Best Practices `1.00`
  - SEO `1.00`
  - Unused JS savings `167 KiB`
  - Bootup time `0.2 s`
  - TBT `210 ms`

## Comparison to previous step

- `unused-javascript` dropped from about `371 KiB` to `167 KiB`
- Desktop performance improved from `0.80` to `0.93`
- Mobile TBT improved from `180 ms` to `60 ms`

## Residual risk

- Homepage tracking is now more dependent on the GTM container configuration.
- Performance verification passed, but marketing validation for Ads/GA business events should be done in GTM/GA if those exact IDs must still fire on homepage pageview.
