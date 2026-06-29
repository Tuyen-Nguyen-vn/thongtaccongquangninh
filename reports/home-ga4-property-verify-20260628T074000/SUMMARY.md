# Homepage GA4 property verify 2026-06-28

## Scope

- Re-authenticated the stored Google Analytics readonly token.
- Verified that the GA4 property configured in this workspace can be queried successfully.
- Queried homepage (`pagePath=/`) data for `today` from the GA4 property.

## Auth result

- Refreshed `secrets/token_analytics.readonly.json` successfully.
- Workspace GA4 configuration used:
  - `GA4_PROPERTY_ID=540663909`
  - `GA4_MEASUREMENT_ID=G-F2BXPJYKEG`

## GA4 property result

- GA4 API query for `pagePath=/` returned rows successfully for `today`.
- Observed homepage rows in the property:
  - `pageTitle="Thông Tắc Cống, Hút Bể Phốt Quảng Ninh - Gọi Thợ Tới Nhanh"` with `screenPageViews=7`, `sessions=6`, `activeUsers=6`
  - `pageTitle="Thông Tắc Cống, Hút Bể Phốt Quảng Ninh 24/7 - Gọi Thợ Tới Nhanh"` with `screenPageViews=4`, `sessions=4`, `activeUsers=4`
  - Additional timestamp-suffixed homepage titles also appeared with low counts.

## Interpretation

- The configured GA4 property is receiving homepage data.
- The auth blocker is resolved.
- This confirms measurement exists at the property level after re-auth.
- It does not, by itself, prove clean one-to-one parity between every renderer-side tag and every GTM-fired event.

## Follow-up signal

- The property currently contains multiple homepage title variants for `pagePath=/`, including older `24/7` title variants and timestamp-suffixed variants.
- Any next analytics cleanup should inspect how those title variants are being emitted or cached, but that is separate from the property-access blocker.
