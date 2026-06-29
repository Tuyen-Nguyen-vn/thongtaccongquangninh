# Tracking Ads Plugin Rollback 2026-06-29

- Time: 2026-06-29 04:15 +07
- Scope: thử tắt `ttcqn-google-ads-tag` với verify runtime thật, và rollback nếu non-home mất AW/conversion path

## Pre-change state

- `ttcqn-google-ads-tag` was active
- Runtime request trace before change showed:
  - homepage had `AW-18031795119` and `viewthroughconversion`
  - non-home sample page also had `AW-18031795119` and `viewthroughconversion`

## Change attempted

- Deactivated live plugin:
  - `ttcqn-google-ads-tag`
- Backup before change:
  - `backups/plugin-status-20260629T041500/plugins.before.json`

## Runtime verification after deactivation

### Homepage

- Homepage still kept:
  - `AW-18031795119`
  - `viewthroughconversion`
  - because homepage renderer still delay-loads Ads/GA/GTM

### Non-home

- Sample page `/thong-tac-cong-quang-ninh/` lost:
  - `AW-18031795119`
  - `viewthroughconversion`
- Remaining non-home stack after deactivation was only:
  - `G-F2BXPJYKEG`
  - `G-KDPB94Y7Y7`
  - `GT-WKPJJQ2K`
  - `GTM-5N59RCXC`

## Decision

- Rollback applied immediately:
  - re-activated `ttcqn-google-ads-tag`

## Runtime verification after rollback

- Non-home runtime trace again shows:
  - `AW-18031795119`
  - `viewthroughconversion`
  - `1p-user-list` requests
- Therefore `ttcqn-google-ads-tag` is currently still the live emitter that keeps Ads measurement alive on non-home pages.

## Interpretation

- `ttcqn-google-ads-tag` cannot be removed safely yet.
- Homepage Ads can survive without it because renderer owns homepage delayed Ads.
- Non-home Ads currently still depend on this plugin, so removing it would create sitewide tracking loss outside homepage.
