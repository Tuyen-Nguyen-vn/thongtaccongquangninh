# Homepage GA4 event mix 2026-06-28

## Scope

- Checked GA4 event mix for homepage `pagePath=/` on `2026-06-28`
- Focused on the transition window already isolated earlier: `dateHour=2026062802` and `2026062803`
- Verified whether the odd title variants were tied to unusual events or just normal pageview hits

## Result

- For homepage `pagePath=/` on `2026-06-28`, the property returned only one event type:
  - `page_view`
- Total homepage `page_view` count returned for the day:
  - `13`

## Transition-window breakdown

- `2026062802`
  - old title `24/7` -> `page_view=2`
  - new title -> `page_view=1`
  - timestamp title `(3:09:48 AM)` -> `page_view=1`
  - timestamp title `(3:42:29 AM)` -> `page_view=1`
- `2026062803`
  - new title -> `page_view=6`

## Conclusion

- The strange title variants are not caused by a separate GA4 custom event stream.
- They were recorded as ordinary `page_view` hits.
- That keeps the root cause narrowed to title state at the moment of pageview emission, not to an unrelated event name or secondary GA4 metric event.
