# Homepage analytics rollback 2026-06-28

## Scope

- Reviewed the homepage-only analytics dedupe released earlier on 2026-06-28.
- Treated performance gain as provisional until live tracking behavior was re-verified.
- Rolled the homepage renderer back to a tracking-safe delayed analytics block.

## Decision

- The dedupe variant reduced request volume and unused JavaScript, but live trace no longer showed a confident equivalent of the previous homepage Ads/GA firing pattern.
- Because this was a measurement-risk change, the performance variant was not kept live.
- Homepage renderer was rolled back to version `2026.06.28.6`.

## Code and deploy

- Updated `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- Restored delayed direct `gtag` config for:
  - `AW-18031795119`
  - `G-F2BXPJYKEG`
- Kept delayed GTM container loading:
  - `GTM-5N59RCXC`
- Rebuilt `tools/wp-plugins/ttcqn-home-emergency-renderer.zip`
- Deployed live and cleared homepage WP Rocket cache files.

## Live verification

- Public homepage serves renderer version `2026.06.28.6`
- Public homepage HTML contains:
  - `gtag/js?id=AW-18031795119`
  - `gtag('config', 'AW-18031795119')`
  - `gtag('config', 'G-F2BXPJYKEG')`
  - `gtm.js?id=GTM-5N59RCXC`

## Request trace after rollback

- Analytics-related requests observed again across the previous Ads/GA paths, including:
  - `https://www.googletagmanager.com/gtm.js?id=GTM-5N59RCXC`
  - `https://www.googletagmanager.com/gtag/js?id=AW-18031795119`
  - `https://www.googletagmanager.com/gtag/js?id=G-F2BXPJYKEG&cx=c&gtm=4e66o1`
  - `https://stats.g.doubleclick.net/g/collect?...tid=G-KDPB94Y7Y7...`
  - `https://googleads.g.doubleclick.net/pagead/viewthroughconversion/18031795119/...`

## Outcome

- Homepage is back on the tracking-safe renderer path.
- The previous performance win from homepage analytics dedupe was intentionally reverted.
- Any future attempt to reduce homepage analytics weight should be validated at the GTM/container level, not only by removing direct renderer-side loading.
