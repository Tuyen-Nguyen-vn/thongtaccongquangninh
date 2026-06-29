# Homepage analytics validation 2026-06-28

## Scope

- Attempted to validate homepage tracking beyond frontend request traces.
- Checked GA4 API readiness for realtime verification.
- Re-checked live homepage HTML to isolate which IDs are injected directly by the renderer and which arrive through GTM.

## GA4 API result

- OAuth credentials and token files exist in `secrets/`.
- `GA4_PROPERTY_ID` exists in `.env` and resolves to property `540663909`.
- `GA4_MEASUREMENT_ID` exists in `.env` and resolves to stream `G-F2BXPJYKEG`.
- Realtime API check could not complete because the stored `analytics.readonly` token refresh failed with:
  - `invalid_grant`

## Live HTML result

- Public homepage HTML currently serves renderer `2026.06.28.6`.
- The homepage HTML contains a single delayed analytics block from the renderer that directly loads:
  - `AW-18031795119`
  - `G-F2BXPJYKEG`
  - `GTM-5N59RCXC`
- The public homepage HTML does **not** contain a direct inline or head-loaded `G-KDPB94Y7Y7` snippet.

## Inference from prior request traces

- `G-KDPB94Y7Y7` appeared in request traces only when GTM executed.
- That means `G-KDPB94Y7Y7` is very likely coming from the GTM container path, not from the homepage renderer source itself.
- `G-F2BXPJYKEG` is the measurement ID explicitly configured in this workspace and is directly loaded by the renderer.

## Outcome

- A true GA4 realtime confirmation is currently blocked by expired or invalid OAuth state, not by missing code or missing local configuration.
- The next safe place to reduce duplication is GTM/container-side validation of `G-KDPB94Y7Y7` versus `G-F2BXPJYKEG`, rather than more renderer-side churn.
