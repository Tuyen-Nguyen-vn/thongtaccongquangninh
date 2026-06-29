# Final report: reupload YouTube videos to new Quang Ninh channel

## Completed

Uploaded 3 videos to the new official channel:

- Channel: `Môi Trường Đô Thị Số 1 Quảng Ninh`
- Channel ID: `UCwwTwTl7rm83e4xtIY9Hmqw`
- Handle: `@moitruongdothiso1quangninh`

## New video IDs

| Old video | New video | Status |
|---|---|---|
| `vcVjDZLV_O0` | `DmiPD6WM9Jg` | public |
| `oWFUTKj4O18` | `pXSJIOhrO3Q` | public |
| `52u9a3u86uk` | `IlNPZHmrYss` | public |

## Website updates

Updated live WordPress content:

- `/hut-be-phot-quang-ninh/`
  - Replaced `vcVjDZLV_O0` with `DmiPD6WM9Jg`
- `/thong-tac-cong-quang-ninh/`
  - Replaced `oWFUTKj4O18` with `pXSJIOhrO3Q`

Updated plugin schema:

- `tools/wp-plugins/ttcqn-doorway-schema/ttcqn-doorway-schema.php`

Updated supporting scripts:

- `tools/insert_youtube_videos.mjs`
- `tools/update_live_youtube_iframes_to_new_channel.mjs`
- `tools/reupload_youtube_videos_to_new_channel.py`

## Verification

Live pages checked with cache-buster:

| URL | HTTP | Old video IDs | New video ID | Old brand | Bad hotline |
|---|---:|---|---|---|---|
| `/hut-be-phot-quang-ninh/` | 200 | none | `DmiPD6WM9Jg` | none | none |
| `/thong-tac-cong-quang-ninh/` | 200 | none | `pXSJIOhrO3Q` | none | none |

YouTube oEmbed verified:

| Video | Author | Bad hotline |
|---|---|---|
| `DmiPD6WM9Jg` | `Môi Trường Đô Thị Số 1 Quảng Ninh` | false |
| `pXSJIOhrO3Q` | `Môi Trường Đô Thị Số 1 Quảng Ninh` | false |
| `IlNPZHmrYss` | `Môi Trường Đô Thị Số 1 Quảng Ninh` | false |

## Evidence files

- `reports/youtube-reupload-2026-05-30/youtube-reupload-result.json`
- `reports/youtube-reupload-2026-05-30/live-iframe-update.json`
- `WORDPRESS_DOORWAY_SCHEMA_UPLOAD_2026-05-30.json`
- `WORDPRESS_HOME_EMERGENCY_RENDERER_PLUGIN_UPLOAD_2026-05-29.json`
