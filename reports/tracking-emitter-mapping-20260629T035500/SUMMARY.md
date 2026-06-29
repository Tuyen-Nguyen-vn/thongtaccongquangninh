# Tracking Emitter Mapping 2026-06-29

- Time: 2026-06-29 03:55 +07
- Scope: gắn từng tracking ID với đúng emitter trên homepage và non-home page để tránh tắt nhầm lớp sitewide

## Confirmed emitter mapping

### Homepage

- `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
  - inject `#ttcqn-delayed-analytics`
  - delay-load:
    - `AW-18031795119`
    - `G-F2BXPJYKEG`
    - `GTM-5N59RCXC`
- Homepage public HTML confirms this inline delayed loader is present near the end of `<body>`.

### Sitewide TTCQN plugins

- `ttcqn-google-ads-tag`
  - emits `gtag/js?id=AW-18031795119`
  - emits `gtag('config', 'AW-18031795119')`
- `ttcqn-google-analytics-tag`
  - emits `gtag/js?id=<ttcqn_ga4_measurement_id>`
  - current public non-home output shows this path resolves to `G-F2BXPJYKEG`
- MU plugin `ttcqn-gtm`
  - emits `GTM-5N59RCXC`

### Site Kit

- Plugin `google-site-kit` is active on live
- Public non-home HTML shows Site Kit injects:
  - `GT-WKPJJQ2K`
  - separate inline `gtag('config', 'G-F2BXPJYKEG', {'anonymize_ip': true})`

## Page-level interpretation

- Homepage:
  - uses renderer-delayed `AW + G-F2BXPJYKEG + GTM`
  - renderer also strips some pre-existing `GTM/gtag` markup before appending its delayed loader
- Non-home sample page:
  - still contains:
    - `GTM-5N59RCXC`
    - `AW-18031795119`
    - `G-F2BXPJYKEG`
    - `GT-WKPJJQ2K`
  - therefore duplication is not only a homepage renderer problem

## Decision

- No live deactivation in this step
- Reason:
  - `AW-18031795119` and `G-F2BXPJYKEG` are each emitted by multiple layers
  - non-home pages also have Site Kit in the path
  - changing one plugin without validating business measurement would be a sitewide analytics risk

## Practical conclusion

- The safe cleanup order is:
  1. decide whether Site Kit remains authoritative for GA
  2. decide whether GTM remains authoritative for Ads/GA orchestration
  3. only then remove duplicate TTCQN plugins and homepage renderer delayed tags
