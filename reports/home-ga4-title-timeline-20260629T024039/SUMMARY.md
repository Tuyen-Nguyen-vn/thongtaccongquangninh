# Homepage title timeline trace 2026-06-29

## Scope

- Verified current live homepage title on public HTML
- Ran a browser trace on the live homepage to compare:
  - `document.title` lifecycle
  - analytics request timing
  - `dt` title parameter on outgoing `page_view` requests

## Public HTML at verification time

- Verified at `2026-06-29T02:40:39+07:00`
- Current live homepage title:
  - `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
- `og:title` and `twitter:title` matched the same value

## Timeline trace result

- `document.title` was already stable as:
  - `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
- No meaningful post-load title rewrite was observed before the delayed analytics requests fired

## Request order observed

- `gtag/js?id=AW-18031795119`
- `gtm.js?id=GTM-5N59RCXC`
- GTM-followed `gtag/js` requests for:
  - `G-KDPB94Y7Y7`
  - `AW-18031795119`
  - `G-F2BXPJYKEG`
- Then homepage `page_view` requests carried:
  - `tid=AW-18031795119` with `dt=Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
  - `tid=G-F2BXPJYKEG` with `dt=Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`

## Conclusion

- On the current live homepage, `page_view` is not firing against a half-updated or later-mutated title.
- The `dt` value in outgoing pageview requests matches the stable live title.
- This makes the old mixed-title GA4 rows much more consistent with mixed HTML/cache states during earlier rollout windows, not with an active client-side title mutation bug on the current page.
