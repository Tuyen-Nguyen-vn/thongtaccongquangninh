# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ClickGuard — a standalone Google Ads click-fraud (click ảo) protection tool for a drain-unblocking business in Quảng Ninh, Vietnam. It detects suspicious IPs clicking on ads (via `gclid`/`gbraid`/`wbraid` URL params), reports them, auto-blocks them, and exports IP lists for manual paste into Google Ads → IP exclusions. It deliberately avoids the Google Ads API and external services: the only runtime requirement is Python 3 standard library.

All documentation, comments, log output, and commit messages are in **Vietnamese** — keep that convention.

## Commands

```bash
python3 clickguard.py --simulate     # smoke test with fake data (real visitor vs. attacker vs. bot); no real data needed
python3 clickguard.py --mode log     # tail an nginx/apache access log (or track.php log)
python3 clickguard.py --mode server  # built-in HTTP tracking server on :8088 (/track pixel, /stats JSON)
python3 clickguard.py --export-ads   # print blocked IPs for Google Ads IP-exclusion paste
```

There is no build step, no dependencies to install, no test framework, and no linter. `--simulate` is the de-facto test: run it after changes to verify detection and blocking still work end-to-end.

Running creates a gitignored `data/` directory (`state.json`, `blocked_ips.txt`, `suspicious.log`) next to the script — paths are resolved relative to the script file, not the CWD.

## Architecture

Everything lives in a single file, `clickguard.py`, organized as three decoupled components wired together by `Engine`:

- **`Engine`** (detector) — `process_hit(ip, ts, path, ua)` is the single entry point all data sources feed into. Keeps per-IP sliding windows (`deque`s) of ad clicks and pageviews, checks bot user-agents and whitelist (CIDR-aware), and on threshold breach calls the blocker + reporter. Blocked state persists in `data/state.json` so restarts don't lose blocks; `expire_blocks()` auto-unblocks after `blocking.duration_hours`.
- **`Reporter`** — console + `data/suspicious.log` (kept as evidence for Google refund claims) + optional Telegram.
- **`Blocker`** — pluggable methods chosen in `config.json`: `file`, `htaccess`, `iptables`, `windows_firewall`. The detection/action split is intentional: Phase 2 (see PLAN.md) adds a Google Ads API method here without touching detection.

Three interchangeable data sources feed `process_hit`:

1. **log mode** — tails an access log, handling rotation via inode checks. Two parsers: `parse_combined` (nginx/apache combined format) and `parse_track` (the `ISO_TIME|IP|URI|USER_AGENT` format written by `website/track.php`). Selected by `log.format` in config.
2. **server mode** — `ThreadingHTTPServer` serving a tracking pixel at `/track` (called by `website/snippet.js`) and stats at `/stats`.
3. **simulate** — synthetic hits for testing.

`website/` contains the deploy-to-customer-site pieces: `track.php` (PHP hosting/WordPress: logs hits in `track` format AND returns 403 to IPs in an uploaded `clickguard_blocked.txt`) and `snippet.js` (JS pixel for server mode). The `track` log format and the pipe-delimited line written by `track.php` must stay in sync with `parse_track`.

## Configuration

`config.json` is deep-merged over `DEFAULT_CONFIG` in `clickguard.py` — every key has a default, so partial configs are valid. If you add a config key, add it to `DEFAULT_CONFIG` too. Detection thresholds, whitelist (supports CIDR), blocking methods, and Telegram credentials all live here; README.md documents the user-facing keys in a table — update it when they change.
