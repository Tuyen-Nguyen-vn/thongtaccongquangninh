# PLAN FIX HIỆU SUẤT + MỤC KHÔNG HỢP LỆ GSC — 2026-06-12

Nguồn: PageSpeed mobile 65 (FCP 3,5s / LCP 6,8s), GSC "Đoạn trích đánh giá" 2 lỗi.

## A. CHẨN ĐOÁN HIỆU SUẤT (đã đo thực tế)

| # | Vấn đề | Vị trí | Ảnh hưởng |
|---|--------|--------|-----------|
| 1 | HTML trang chủ **519KB**, trong đó **285KB CSS inline (21 khối `<style>`)**, khối lớn nhất **184KB** | `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php` (432KB) + file plugin chính | Mobile phải tải + parse toàn bộ trước khi vẽ → FCP 3,5s, LCP 6,8s. Đây là nguyên nhân chính. |
| 2 | CSS trùng lặp/ghi đè chồng: 3 khối `:root` lặp biến màu, nhiều khối "fix" chồng nhau (`layout-guard`, `clean-custom-css`, khối ẩn trợ lý cũ 8,5KB…) | Cùng file trên | Vi phạm AI_RULES (no messy overwrite), phình HTML |
| 4 | 2 lần tải `gtag.js` (AW-18031795119 + G-F2BXPJYKEG) | head trang chủ | ~100KB JS bên thứ 3, tốn main-thread mobile |
| 5 | 73 `<img>` trên trang chủ | page-home-direct.php | Cần xác minh lazy-load + kích thước thực tế từng ảnh |

Điểm tốt đã có: TTFB ~0,7s, hero preload + fetchpriority=high + srcset đúng, chỉ 2 file CSS external nhỏ, WP Rocket đang chạy.

## B. PLAN FIX HIỆU SUẤT

### P0 — làm ngay (tác động lớn nhất)
1. **Tách CSS khỏi HTML**: gom 21 khối `<style>` → 1 file `ttcqn-home.min.css` enqueue qua `wp_enqueue_style` (cache được giữa các lần truy cập). Giữ inline duy nhất ~15–20KB critical CSS above-the-fold (header, hero, stats bar).
2. **Dedupe CSS** khi gộp: bỏ khối `:root` lặp, gộp các khối fix chồng nhau, xoá CSS cho component đã gỡ (khối "ẩn trợ lý dẫn đường cũ" 8,5KB).
3. **Defer 2 JS theme** (`menu.min.js`, `back-to-top.min.js`) qua filter `script_loader_tag`.
4. Deploy plugin bản mới → purge WP Rocket → đo lại PageSpeed mobile + desktop.

Kỳ vọng: HTML 519KB → ~100–150KB; FCP < 1,8s; LCP < 2,5s; mobile ~85–95.

### P1 — sau khi P0 ổn định
5. Gộp 2 gtag thành 1 lần tải (`gtag('config', ...)` cho ID thứ hai) + cân nhắc delay JS analytics bằng WP Rocket.
6. Audit 73 ảnh trang chủ: ảnh ngoài màn hình đầu phải `loading="lazy"`, đúng kích thước hiển thị.
7. Áp dụng cùng cách tách CSS cho shared-footer/subpage banner (các trang con cũng bị bơm inline CSS).

### Rollback
Backup file plugin hiện tại vào `backups/perf-fix-2026-06-12/` trước khi deploy. Nếu trang trắng/lỗi layout → upload lại bản backup (đã có sẵn quy trình upload-base64).

## C. PLAN FIX "MỤC KHÔNG HỢP LỆ" GSC (Đoạn trích đánh giá)

Lỗi: (1) Loại đối tượng cho trường `<parent_node>` không hợp lệ; (2) Bài đánh giá có nhiều xếp hạng tổng hợp. Cả 2 trạng thái xác thực: **Đạt**.

Đã quét live toàn bộ **87 URL** trong sitemap (12/6): **không còn bất kỳ schema `review`/`aggregateRating` nào** trên site → mã lỗi thuộc phiên bản schema cũ đã gỡ; GSC đang hiển thị dữ liệu trễ.

Việc cần làm:
1. Mở chi tiết từng lỗi trong GSC → lấy danh sách URL mẫu bị ảnh hưởng (cần thao tác trong trình duyệt).
2. Với từng URL: kiểm tra HTML live (đã có script quét) — nếu sạch thì chỉ cần purge WP Rocket cache URL đó + dùng "Kiểm tra URL trực tiếp" trong GSC để xác nhận Google thấy bản mới.
3. Nếu trạng thái xác thực đã "Đạt": không cần làm gì thêm ngoài theo dõi; báo cáo sẽ tự xanh sau chu kỳ re-crawl (≤28 ngày).

## D. LỘ TRÌNH
- Hôm nay: B-P0 (tách CSS, defer JS, deploy, đo lại) + C-1/2.
- Tuần này: B-P1 (gtag, ảnh, trang con) + theo dõi GSC.
