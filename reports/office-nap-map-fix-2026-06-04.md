# Office NAP + Google Maps Fix - 2026-06-04

## Scope

- Update homepage footer map section from generic service area to office address section.
- Sync Hạ Long office NAP to: `111 Cái Lân, Bãi Cháy, Quảng Ninh`.
- Link address to Google Maps query URL.
- Remove stale public NAP strings from service pages, footer widget, contact block, and LocalBusiness schema.

## Changed

- `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
  - Version: `2026.06.04.3`
  - LocalBusiness `streetAddress`: `111 Cái Lân, Bãi Cháy`
  - `hasMap`: Google Maps query URL for the new address
  - Removed old Hà Lầm geo coordinates from the homepage schema.

- `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`
  - Section title: `Các địa chỉ văn phòng tại Quảng Ninh`
  - Card label: `Văn phòng Hạ Long`
  - Visible address: `111 Cái Lân, Bãi Cháy, Quảng Ninh`
  - Added clickable address and `Mở Google Maps` button.
  - Replaced generic footer address with linked office address.

- `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/shared-footer.php`
  - Replaced generic `TP. Hạ Long, Quảng Ninh` with linked office address.

- `tools/wp-plugins/ttcqn-doorway-schema/ttcqn-doorway-schema.php`
  - Version: `2026.06.04.1`
  - Synced LocalBusiness address and `hasMap`.
  - Removed old Hà Lầm geo coordinates.

- `tools/wp-plugins/ttcqn-doorway-schema/gbp_data.json`
  - Synced mock GBP address to `111 Cái Lân, Bãi Cháy, Quảng Ninh`.

- `tools/wp-plugins/ttcqn-seo-contact-block/ttcqn-seo-contact-block.php`
  - Version: `2026.06.04.1`
  - Synced contact block address to `111 Cái Lân, Bãi Cháy, Quảng Ninh`.
  - Added Google Maps link for the address.
  - Added GeneratePress footer copyright filter so `.footer-nap-info` outputs the new linked NAP.

- Live REST content fix:
  - Updated 10 published pages and 1 footer widget containing old address strings.
  - Report: `reports/office-nap-live-rest-apply-2026-06-04.json`

## Backups

- Source and plugin zip backups: `backups/office-nap-map-2026-06-04/`
- Live REST backups before apply: `backups/office-nap-map-2026-06-04/live-rest-before/`

## Verification

- PHP lint passed:
  - `ttcqn-home-emergency-renderer.php`
  - `page-home-direct.php`
  - `shared-footer.php`
  - `ttcqn-doorway-schema.php`
  - `ttcqn-seo-contact-block.php`
- Node checks passed:
  - `tools/upload_home_emergency_renderer_plugin.mjs`
  - `tools/upload_doorway_schema_plugin.mjs`
  - `tools/upload_seo_contact_block_plugin.mjs`
  - `tools/fix_office_nap_2026_06_04.mjs`
- Zip checks passed for:
  - `ttcqn-home-emergency-renderer.zip`
  - `ttcqn-doorway-schema.zip`
  - `ttcqn-seo-contact-block.zip`
- Plugin uploads succeeded:
  - `ttcqn-home-emergency-renderer`: active, `2026.06.04.3`
  - `ttcqn-doorway-schema`: active, `2026.06.04.1`
  - `ttcqn-seo-contact-block`: active, `2026.06.04.1`

## Public HTML Final Check

Checked with `?nowprocket=1&codex=office-nap-final-20260604-0132`.

All checked URLs returned `200`, included the new address, included a Google Maps link, included schema address, and had no hits for:

- `Gần Nhà Văn hóa, khu 3, Hà Lầm`
- `161 Liên Phường, Hà Lầm`
- `TP. Hạ Long, Quảng Ninh |`
- `Vị trí phục vụ tại Quảng Ninh`
- `Cơ sở Hạ Long`
- `Cơ sở Quảng Ninh`
- `20.9770511628745`

URLs checked:

- `/`
- `/hut-be-phot-quang-ninh/`
- `/thong-tac-cong-quang-ninh/`
- `/thong-tac-chau-rua-quang-ninh/`
- `/nao-vet-ho-ga-quang-ninh/`
- `/gioi-thieu/`
- `/lien-he/`
- `/xu-ly-mui-hoi-quang-ninh/`
- `/thong-tac-cong-chung-cu-ha-long/`
- `/thong-tac-cong-nha-hang-ha-long/`
