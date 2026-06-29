# TTCQN homepage PageSpeed fix - 2026-06-03

URL: https://thongtaccongquangninh.com/

## Baseline PageSpeed

Mobile:
- Performance: 54/100
- FCP: 2.5s
- LCP: 6.4s
- CLS: 0
- TBT: 590ms
- Speed Index: 5.9s

Desktop:
- Performance: 80/100
- FCP: 0.6s
- LCP: 1.3s
- CLS: 0
- TBT: 360ms
- Speed Index: 1.2s

## Applied changes

- Published `ttcqn-home-emergency-renderer` version `2026.06.03.4`.
- Added responsive first-viewport hero assets:
  - `assets/septic-truck-real-640.webp` - 42KB
  - `assets/septic-truck-real-768.webp` - 61KB
  - `assets/hero-worker-tho-thong-tac-cong-quang-ninh-480.webp` - 27KB
- Updated hero `srcset` and preload hints so mobile/desktop select smaller assets instead of the 210KB truck image and larger staff image.
- Changed below-fold homepage images to lazy loading.
- Replaced the initial YouTube iframe with a lightweight click-to-load video button.
- Moved non-critical homepage JavaScript enhancements to idle scheduling.

## Verification

PHP lint:
- `ttcqn-home-emergency-renderer.php`: pass
- `templates/page-home-direct.php`: pass

Upload:
- WordPress plugin upload success: true
- Active plugin confirmed: true

Live HTML:
- Meta version: `2026.06.03.4; direct-template`
- YouTube lite trigger present: yes
- Initial YouTube iframe present: no
- Idle enhancement function present: yes

Live asset checks:
- `septic-truck-real-768.webp`: HTTP 200, 60,814 bytes
- `hero-worker-tho-thong-tac-cong-quang-ninh-480.webp`: HTTP 200, 26,556 bytes

Chrome local mobile selection:
- Truck current source: `septic-truck-real-768.webp`
- Staff current source: `hero-worker-tho-thong-tac-cong-quang-ninh-480.webp`

Screenshots:
- `reports/pagespeed-2026-06-03/mobile-after-v4.png`
- `reports/pagespeed-2026-06-03/desktop-after-v4.png`

## Post-fix PageSpeed

Last successful PageSpeed run after the first public patch:

Mobile:
- Performance: 72/100
- FCP: 1.8s
- LCP: 5.1s
- CLS: 0
- TBT: 300ms
- Speed Index: 4.2s

Desktop:
- Performance: 81/100
- FCP: 0.8s
- LCP: 1.6s
- CLS: 0
- TBT: 270ms
- Speed Index: 1.7s

The later `2026.06.03.4` image selection patch was verified live with Chrome, but PageSpeed was not rerun because `PAGESPEED_API_KEY` was not available in the environment and the unauthenticated PSI endpoint returned quota 429.

## Remaining work

- Mobile LCP is still the main issue in PSI and should be rechecked with an authenticated PageSpeed key after cache settles.
- Google Tag Manager, Google Ads, and analytics scripts still run on initial load and can affect TBT.
- Server response time should continue to be watched. A later curl sample returned TTFB about 0.33s, but previous warm samples ranged from about 1.1s to 1.6s.
