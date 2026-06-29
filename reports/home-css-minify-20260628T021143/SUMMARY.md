# Homepage CSS minify follow-up 2026-06-28

## Scope

- Minified homepage renderer CSS assets flagged by PSI as unminified.
- Deployed the minified assets live with renderer version bump `2026.06.28.3`.
- Cleared WP Rocket homepage cache and re-ran PageSpeed on the normal homepage URL.

## Files changed

- `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/assets/ttcqn-home.min.css`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/assets/ttcqn-shared-footer.css`
- `tools/wp-plugins/ttcqn-home-emergency-renderer.zip`

## Size reduction

- `ttcqn-home.min.css`: `185786` -> `168147` bytes
- `ttcqn-shared-footer.css`: `25411` -> `23437` bytes

## Verification

- `npm run design:check` passed with `0 errors / 0 warnings`; token mapping `ok: true`.
- Public homepage serves renderer version `2026.06.28.3`.
- `ttcqn-home.min.css` cache-buster query updated to `?ver=2026.06.28.3`.
- PageSpeed after minify:
  - Mobile: Performance `0.86`, Best Practices `1.00`, SEO `1.00`, `unminified-css = 1`, TBT `180 ms`, unused CSS savings `27 KiB`, unused JS savings `371 KiB`
  - Desktop: Performance `0.80`, Best Practices `1.00`, SEO `1.00`, `unminified-css = 1`, TBT `330 ms`, unused CSS savings `93 KiB`, unused JS savings `371 KiB`

## Conclusion

- The CSS minify penalty is fully cleared.
- Remaining homepage performance drag is now dominated by unused third-party JavaScript, especially Google tag / GTM related scripts.
