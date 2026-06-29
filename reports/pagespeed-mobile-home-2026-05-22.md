# PageSpeed Mobile Homepage Audit - 2026-05-22

## Scope

- URL: `https://thongtaccongquangninh.com/`
- Trigger: PageSpeed mobile link from Search Console.
- Live renderer observed before local patch: `ttcqn-home-emergency-renderer` `2026.05.21.5; direct-template`.

## Current Live Findings

- PageSpeed API returned `429 Too Many Requests`, so the live audit used Chrome/Puppeteer mobile emulation.
- Live mobile helper audit:
  - HTML size: ~367 KB.
  - TTFB: ~1186 ms.
  - DOMContentLoaded: ~2459 ms.
  - LCP element: `.ttcqn-seo-hero-staff`.
  - LCP observed locally: ~2460 ms.
- Wasteful critical requests before patch:
  - Old hero background preload: `/wp-content/uploads/2026/04/moi-truong-do-thi-so-1-1-scaled.webp` ~164 KB.
  - Truck preload competing with LCP: `/assets/septic-truck-real.webp` ~206 KB.
  - Header/floating phone and Zalo icons were ~65 KB each while rendered at 24-46 px.

## Local Fix Applied

- Bumped `ttcqn-home-emergency-renderer` to `2026.05.22.1`.
- Removed non-LCP image preloads from homepage head.
- Kept a single preload for the LCP staff image and added responsive `imagesrcset/imagesizes`.
- Added `srcset` for `.ttcqn-seo-hero-staff` so mobile can use the existing 640px WebP asset.
- Set hero truck `fetchpriority="low"` so it does not compete with the LCP staff image.
- Kept the existing visible phone/Zalo icon assets unchanged after Tuyền confirmed the mobile interface must stay the same.

## Files Changed

- `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/includes/mobile-left-sticky-cta.php`

## Verification

- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`: passed.
- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`: passed.
- `php -l tools/wp-plugins/ttcqn-home-emergency-renderer/includes/mobile-left-sticky-cta.php`: passed.
- `node --check tools/upload_home_emergency_renderer_plugin.mjs`: passed.
- `python3 tools/_pack_zips.py`: passed; rebuilt `tools/wp-plugins/ttcqn-home-emergency-renderer.zip`.
- ZIP check: 63 entries; required changed files/assets present.

## Live Upload

- Uploaded live after Tuyền confirmed: "giữ nguyên giao diện trên mobile... có làm được nó tối ưu bằng cách gì thì làm".
- Upload report: `WORDPRESS_HOME_EMERGENCY_RENDERER_PLUGIN_UPLOAD_2026-05-18.json`.
- Upload result: `uploadSuccess=true`, `activeConfirmed=true`, `success=true`.
- Live marker after upload: `ttcqn-home-emergency-renderer` `2026.05.22.1; direct-template`.

## Live Verification After Upload

- `curl -sSI 'https://thongtaccongquangninh.com/?nowprocket=1&verify_ps=20260522v2'`: HTTP 200.
- Image preloads reduced from 4 to 2:
  - Kept header logo preload.
  - Kept LCP staff image preload with responsive `imagesrcset/imagesizes`.
  - Removed old background image preload.
  - Removed truck image preload.
- Existing visible phone/Zalo icons remain unchanged:
  - `icon-goi-dien-thoai-hut-be-phot-quang-ninh.webp`
  - `icon-zalo-thong-tac-cong-quang-ninh.webp`
- Hero truck remains visible but now has `fetchpriority="low"`.
- Mobile screenshot after upload saved at `reports/pagespeed-mobile-home-2026-05-22/mobile-after.png`.
- Mobile screenshot before upload saved at `reports/pagespeed-mobile-home-2026-05-22/mobile-before.png`.
- PageSpeed API retry still returned `429 Too Many Requests`, so final PageSpeed score must be rerun in the browser/PageSpeed UI later.

## Status

- Live optimization applied.
- Mobile visual layout intentionally unchanged.
