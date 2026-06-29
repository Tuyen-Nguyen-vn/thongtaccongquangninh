# Home Title Source Tool Sync 2026-06-29

- Time: 2026-06-29 03:23 +07
- Scope: sync remaining operational tool sources that could reintroduce stale homepage title/meta for page `23`

## Changes

- Updated [tools/deploy_verified_hours_copy_fix_live.mjs](/mnt/d/.thongtaccongquangninh/tools/deploy_verified_hours_copy_fix_live.mjs)
  - local verification snippet for `ttcqn-title-meta-short-2026-06-12.php`
  - from old homepage title string
  - to `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`
- Updated [tools/fix_title_meta_short_2026_06_12.mjs](/mnt/d/.thongtaccongquangninh/tools/fix_title_meta_short_2026_06_12.mjs)
  - page `23` title
  - page `23` description
  - removed stale `24/7` homepage copy from that write path

## Verification

- `node --check tools/deploy_verified_hours_copy_fix_live.mjs`
- `node --check tools/fix_title_meta_short_2026_06_12.mjs`
- grep on both tool files now returns only:
  - `Thông Tắc Cống Quảng Ninh - Hút Bể Phốt`

## Rationale

- The PHP plugin source was already synced in the previous step.
- These two tool files were still stale and could either:
  - fail local verification against the corrected plugin source, or
  - write the old homepage title/description back if re-run.
- This change keeps homepage title sources consistent across local operational tooling.
