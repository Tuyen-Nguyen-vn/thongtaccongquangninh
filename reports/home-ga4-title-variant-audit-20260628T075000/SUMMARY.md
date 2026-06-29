# Homepage GA4 title variant audit 2026-06-28

## Scope

- Audited why GA4 still shows multiple title variants for homepage `pagePath=/`.
- Verified the current live homepage title directly from public HTML.
- Queried GA4 property history to separate historical live titles from probable synthetic/test artifacts.

## Live result now

- Current public homepage title is:
  - `Thông Tắc Cống, Hút Bể Phốt Quảng Ninh - Gọi Thợ Tới Nhanh`
- Current public homepage `og:title` and `twitter:title` match the same non-`24/7` title.

## Historical GA4 result

- GA4 property history shows the old homepage title variant:
  - `Thông Tắc Cống, Hút Bể Phốt Quảng Ninh 24/7 - Gọi Thợ Tới Nhanh`
- This old title is not speculative. It matches multiple archived live audit artifacts from:
  - `2026-06-12`
  - `2026-06-13`
  - `2026-06-14`
  - `2026-06-15`
  - `2026-06-16`
  - `2026-06-17`
  - `2026-06-19`
  - `2026-06-20`
  - `2026-06-21`
  - `2026-06-22`
  - `2026-06-23`

## Date breakdown from GA4

- Over the last 7 days, the dominant homepage title in GA4 was still the historical `24/7` title, for example:
  - `2026-06-26`: `326` homepage views
  - `2026-06-27`: `106` homepage views
  - `2026-06-25`: `105` homepage views
- The corrected current title appears on `2026-06-28` with new homepage rows.

## Timestamp-suffixed variants

- Timestamp-suffixed homepage titles exist only as tiny-count rows, e.g. `1` view each.
- Observed examples are on `2026-06-22` only.
- These do not match the current live HTML and are not present in current renderer source.
- Most likely interpretation: these are test or synthetic hits where the page title was temporarily mutated client-side during measurement or debugging, not an active live homepage title variant now.

## Conclusion

- There is no current evidence that the live homepage is still emitting the old `24/7` title.
- The `24/7` variant in GA4 is historical carry-over from when that title was genuinely live.
- The timestamp variants are low-volume anomalies and do not justify further renderer churn.
