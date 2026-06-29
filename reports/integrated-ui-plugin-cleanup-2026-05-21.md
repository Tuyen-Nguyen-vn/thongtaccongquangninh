# Integrated UI Plugin Cleanup - 2026-05-21

## Summary

Gộp hai plugin UI riêng vào `ttcqn-home-emergency-renderer` để giảm lớp plugin/CSS/JS chồng trên WordPress live:

- `ttcqn-scroll-guide-assistant`
- `ttcqn-mobile-left-sticky-cta`

Renderer live sau deploy: `ttcqn-home-emergency-renderer` v2026.05.21.5.

## Fixed

| Mục | Trạng thái | Ghi chú |
|---|---|---|
| Scroll guide | Fixed | Chuyển vào `tools/wp-plugins/ttcqn-home-emergency-renderer/includes/scroll-guide-assistant.php` |
| Mobile left sticky CTA | Fixed | Chuyển vào `tools/wp-plugins/ttcqn-home-emergency-renderer/includes/mobile-left-sticky-cta.php` |
| Plugin gốc live | Fixed | Deactivate và delete `ttcqn-scroll-guide-assistant`, `ttcqn-mobile-left-sticky-cta` |
| Source local cũ | Fixed | Archive source/zip/upload scripts vào `backups/cleanup-integrated-ui-2026-05-21/` |

## Verification

- `php -l` toàn bộ PHP trong `tools/wp-plugins`: không lỗi.
- Rebuilt `tools/wp-plugins/ttcqn-home-emergency-renderer.zip`.
- Upload renderer bằng `tools/upload_home_emergency_renderer_plugin.mjs`: `uploadSuccess=true`, `activeConfirmed=true`.
- Live `/`: HTTP 200, H1 = 1, renderer marker `2026.05.21.5; direct-template`.
- Live `/blog/`: HTTP 200, H1 = 1.
- Live `/hut-be-phot-quang-ninh/`: HTTP 200, H1 = 1.
- Scroll guide marker còn xuất hiện sau khi plugin gốc bị delete: `ttcqn-scroll-guide-css`, `ttcqn-scroll-guide-js`, `data-ttcqn-scroll-guide`.
- Mobile CTA marker còn xuất hiện sau khi plugin gốc bị delete: `ttcqn-mls-style`, `ttcqn-mls`.
- Old markers absent: `ttcqn-home-performance-tune=0`, `ttcqn-home-lead-form-css=0`, `GENERATEPRESS THEME OVERRIDE=0`.
- REST lead endpoint vẫn trả 200 cho honeypot POST.
- `page-sitemap.xml` HTTP 200 và không còn URL retired `/thong-tac-toilet-quang-ninh/`.

## Live Plugin State After Cleanup

Deleted/integrated plugins:

- `ttcqn-home-lead-form`
- `ttcqn-home-performance-tune`
- `ttcqn-mobile-left-sticky-cta`
- `ttcqn-scroll-guide-assistant`

Active TTCQN plugins còn lại:

- `ttcqn-doorway-safe-renderer`
- `ttcqn-favicon-override-v3`
- `ttcqn-google-ads-tag`
- `ttcqn-home-emergency-renderer`
- `ttcqn-home-service-images`
- `ttcqn-mobile-image-optimizer`
- `ttcqn-seo-cleanup-redirects`
- `ttcqn-subpage-banner-dedupe`

Không xóa tiếp các plugin còn lại trong batch này vì chưa đủ bằng chứng SAFE_DELETE. Scan live vẫn thấy marker/tác dụng của một số plugin như `ttcqn-home-service-images`, `ttcqn-mobile-image-optimizer`, Google Ads conversion id và favicon URLs.

## Remaining Plugin Decision

| Plugin | Decision | Evidence |
|---|---|---|
| `ttcqn-favicon-override-v3` | KEEP | Favicon URLs vẫn xuất hiện trong HTML live |
| `ttcqn-google-ads-tag` | KEEP | Google Ads conversion id vẫn xuất hiện trong HTML live |
| `ttcqn-home-service-images` | REVIEW_REQUIRED | Marker còn trên homepage |
| `ttcqn-mobile-image-optimizer` | REVIEW_REQUIRED | Marker còn trên homepage, blog và page dịch vụ |
| `ttcqn-subpage-banner-dedupe` | REVIEW_REQUIRED | Plugin active nhưng marker public hiện không thấy; cần inspect source/visual riêng |
