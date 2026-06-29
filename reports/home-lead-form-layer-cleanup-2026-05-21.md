# Home Lead Form Layer Cleanup - 2026-05-21

## Summary

Removed the separate `ttcqn-home-lead-form` plugin from the live active plugin stack by moving its backend responsibility into `ttcqn-home-emergency-renderer`.

## Fixed

- Added `ttcqn_lead` post type registration to `ttcqn-home-emergency-renderer`.
- Added `/wp-json/ttcqn/v1/lead` REST handler to `ttcqn-home-emergency-renderer`.
- Uploaded renderer version `2026.05.21.4`.
- Deactivated live plugin `ttcqn-home-lead-form`.
- Archived local plugin source, zip and old upload script.

## Verification

- Live renderer: active version `2026.05.21.4`.
- Live `ttcqn-home-lead-form`: inactive.
- Homepage: HTTP 200, one H1, renderer marker `2026.05.21.4; direct-template`.
- Old lead frontend markers: `ttcqn-home-lead-form-css` = 0, `ttcqn-home-lead-form-js` = 0.
- Renderer callback forms: present.
- `OPTIONS /wp-json/ttcqn/v1/lead`: HTTP 200, allow `POST`.
- Honeypot `POST /wp-json/ttcqn/v1/lead`: HTTP 200, `{"ok":true,"ignored":true}`.

## Archived

- `backups/cleanup-home-lead-form-2026-05-21/tools/wp-plugins/ttcqn-home-lead-form/`
- `backups/cleanup-home-lead-form-2026-05-21/tools/wp-plugins/ttcqn-home-lead-form.zip`
- `backups/cleanup-home-lead-form-2026-05-21/tools/upload_home_lead_form_plugin.mjs`
