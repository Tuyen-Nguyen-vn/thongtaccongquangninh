# Schema Rich Result Fix 2026-06-01

## Scope

- Removed Review rich result markup from live JSON-LD sources.
- Affected URLs checked from GSC: homepage, /thong-tac-cong-quang-ninh/, /hut-be-phot-mong-cai/.

## Files changed

- tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php
- tools/wp-plugins/ttcqn-doorway-schema/ttcqn-doorway-schema.php

## Backup

- backups/schema-rich-result-2026-06-01/

## Verification

- PHP syntax check: pass for both plugin files.
- Plugin upload: TTCQN Home Emergency Renderer success, active confirmed.
- Plugin upload: TTCQN Service Schema success.
- Active plugin versions: both `2026.06.01.1`.
- Rank Math Instant Indexing: Successfully submitted 3 URLs.
- Public HTML cache-buster check: 0 aggregateRating, 0 review, 0 reviewRating on checked URLs.

## Notes

- Visible testimonial/review UI was not removed; only structured data review/rating markup was removed.
- GSC URL Inspection rich result status can remain stale until Google recrawls.
