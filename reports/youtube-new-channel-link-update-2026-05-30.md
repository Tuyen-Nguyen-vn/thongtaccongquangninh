# Cập nhật link kênh YouTube mới 2026-05-30

## Input

- User cung cấp: `youtube.com/moitruongdothiso1quangninh`
- URL không có `@` kiểm tra trả HTTP `404`.
- URL chuẩn đã kiểm tra trả HTTP `200`: `https://www.youtube.com/@moitruongdothiso1quangninh`

## Đã sửa

- Footer homepage renderer:
  - `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/shared-footer.php`
  - `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`
- Schema `sameAs` trong homepage renderer:
  - `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- Script tạo draft sau này:
  - `tools/generate_remaining_seo_drafts.mjs`

## Deploy

- Đóng gói lại `tools/wp-plugins/ttcqn-home-emergency-renderer.zip`.
- Upload và active plugin bằng `node tools/upload_home_emergency_renderer_plugin.mjs`.
- Kết quả upload:
  - `uploadSuccess: true`
  - `activeConfirmed: true`
  - `success: true`

## Verify live

Cache-buster: `?nowprocket=1&codex=youtube-new-channel-*`

| URL | HTTP | Có kênh mới | Còn kênh cũ | Còn brand cũ |
|---|---:|---:|---:|---:|
| `/` | 200 | Có | Không | Không |
| `/hut-be-phot-quang-ninh/` | 200 | Có | Không | Không |
| `/thong-tac-cong-quang-ninh/` | 200 | Có | Không | Không |
| `/lien-he/` | 200 | Có | Không | Không |

Kênh mới dùng trên site: `https://www.youtube.com/@moitruongdothiso1quangninh`
