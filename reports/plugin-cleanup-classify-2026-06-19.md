# Phân loại plugin để dọn (clean-code) — thongtaccongquangninh.com
Ngày: 2026-06-19 · Nguồn: `list_wordpress_plugins` (live)

**Tổng:** 127 plugin · **75 active** trước dọn. Sau bước này: 73 active (gỡ 2 throwaway).

> Luật: deactivate hàng loạt = đổi cấu hình rủi ro → chỉ tự gỡ nhóm **zero render-impact**;
> các nhóm khác cần Tuyền duyệt vì có thể **revert nội dung live**.

## ĐÃ GỠ (đã verify HTTP 200, meta live không đổi)
- `ttcqn-oneshot-dump3` — dump file→options, "Delete after use", không hook output.
- `ttcqn-oneshot-scan` — scan brand cũ, throwaway, không hook output.
- `ttcqn-fix-home-15phut` — superseded by v3; home title/desc live giữ nguyên sau gỡ.
- `ttcqn-fix-home-15phut-v2` — superseded by v3; idem.
- `ttcqn-fix-missing-meta` — one-time set meta 7 post (postmeta đã ghi cố định, không revert).
→ Active: 75 → **70**.

## XÁC MINH lever #2 (Discover)
4/4 trang ưu tiên ĐÃ phát `max-image-preview:large` (Rank Math). Plugin `ttcqn-max-image-preview`
THỪA → để OFF, không bật lại.

## CỤM 282 — KHÔNG GỠ (cần Tuyền quyết)
Page 282 = `/chinh-sach-bao-mat/`. `<title>` live còn đuôi brand cũ **"| Môi Trường Đô Thị Số 1"**
(tên "Số 1" Google bỏ qua). 5 plugin `*-282` tranh title trang này — gỡ sai sẽ đổi title.
Cần quyết hướng brand-name trước khi dọn cụm này.

## NHÓM A — One-time DB-writer qua `init` (an toàn gỡ, giá trị đã nằm trong DB)
Hiệu lực đã ghi vào postmeta/options; deactivate vẫn giữ giá trị. Đề xuất gỡ:
- `ttcqn-fix-home-15phut`  — set rank_math_description home (ID23). **Superseded by v3.**
- `ttcqn-fix-home-15phut-v2` — bản v2 của trên. **Superseded by v3.**
- `ttcqn-fix-missing-meta` — set focus_keyword/description cho 7 post (DB write, đã chạy).
- `ttcqn-rm-fix-key-282` — fix RM title page 282 (DB write, đã chạy).
- `ttcqn-rm-title-clear-282` — xoá _rank_math_title page 282 (đã xoá xong).
- `ttcqn-rm-title-hook-282` — hook save_post (chỉ chạy khi lưu, không render).
- `ttcqn-rm-meta-debug` — REST debug endpoint page 282 (diagnostic).
> Lưu ý cụm 282 (`rm-fix-key-282`, `rm-title-clear-282`, `rm-title-hook-282`, `rm-meta-debug`,
> `ttcqn-title-override-282`) đang chồng chéo trên 1 page. Nên giữ DUY NHẤT `ttcqn-title-override-282`
> (runtime, đang quyết định title hiển thị) và gỡ 4 cái còn lại — nhưng cần kiểm title page 282 live trước/sau.

## NHÓM B — REVERT-RISK runtime (KHÔNG tự gỡ; cần duyệt + verify từng cái)
Chạy `template_redirect`/`shutdown` + `ob_start` → deactivate là mất hiệu lực ngay trên live:
- `ttcqn-fix-home-img-alt` — ob thay alt ảnh trang chủ. Một phần đã bake vào template renderer;
  cần đối chiếu alt còn lại trước khi gỡ.
- `ttcqn-fix-meta-html` — ob thay "15-30"→"15" trong meta home.
- `ttcqn-fix-meta-v2` — bản shutdown của trên (trùng chức năng — ít nhất 1 trong 2 là thừa).
- `ttcqn-fix-home-v3` — runtime init re-write meta mỗi lần (giữ, là bản "final" của cụm home meta).

## NHÓM C — Orphan upload temp (rác, đã inactive sẵn) — nên XOÁ THƯ MỤC
Hàng loạt `mcp-temp-6a*/...` (upload plugin hỏng dở). Đã off, chỉ chiếm chỗ. Xoá file = thao tác
xoá nên cần duyệt; gợi ý xoá toàn bộ tiền tố `mcp-temp-6a*`.

## NHÓM D — ESSENTIAL (GIỮ ACTIVE, KHÔNG đụng)
elementor(+pro), seo-by-rank-math(+pro), google-site-kit, wp-rocket, akismet, wpforms-lite,
wp-file-manager, wp-mcp-ultimate-main, ttcqn-doorway-schema, ttcqn-doorway-safe-renderer,
ttcqn-co-so-renderer, ttcqn-home-emergency-renderer, ttcqn-home-service-images,
ttcqn-qn-service-landing, ttcqn-www-redirect, ttcqn-google-analytics-tag, ttcqn-google-ads-tag,
ttcqn-gsc-verify, ttcqn-favicon-override-v3, ttcqn-mobile-image-optimizer, ttcqn-perf-helpers,
ttcqn-seo-cleanup-redirects, ttcqn-redirect-category-bang-gia, ttcqn-subpage-banner-dedupe,
ttcqn-seo-contact-block, ttcqn-wr2..wr25 (cụm renderer khu vực — cần soi riêng).

## QUAN SÁT THÊM (liên quan plan SEO)
- `ttcqn-max-image-preview` đang **OFF**. Đây là đòn bẩy #2 (Discover CTR) trong plan. Cần xác minh
  Rank Math đã phát `max-image-preview:large` chưa; nếu chưa → bật lại plugin này là quick-win.

## Việc cần Tuyền duyệt
1. Gỡ Nhóm A (7 plugin) — an toàn, có thể làm theo lô + verify meta live.
2. Nhóm B: quyết bỏ trùng `fix-meta-html` vs `fix-meta-v2`, và `fix-home-img-alt` sau khi đối chiếu alt.
3. Nhóm C: xoá thư mục `mcp-temp-6a*`.
4. Bật lại `ttcqn-max-image-preview` nếu RM chưa phát max-image-preview:large.
