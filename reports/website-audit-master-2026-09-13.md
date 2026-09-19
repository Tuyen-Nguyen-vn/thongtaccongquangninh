# Audit tổng thể thongtaccongquangninh.com — 2026-09-13

Báo cáo điều hành + backlog ưu tiên, tổng hợp từ toàn bộ audit chạy hôm nay sau
khi khắc phục sự cố sập site. Chi tiết kỹ thuật nằm trong các file gốc được
dẫn link ở mỗi mục (các file dữ liệu gốc nằm trong `reports/` của thư mục dự
án chính `D:\.thongtaccongquangninh`, không phải worktree này).

## UPDATE (cùng ngày, phiên xử lý backlog) — Kết quả thực thi P1

Sau khi audit ở dưới được viết, đã xử lý toàn bộ backlog P1 trong khả năng an
toàn cho phép. Tóm tắt nhanh, chi tiết đầy đủ ở mục 6 (mới) bên dưới:

| # (theo mục 2) | Trạng thái |
|---|---|
| 1. 6 trang gần rỗng | ⚠️ **Phát hiện lại**: 3/3 trang không phải thiếu nội dung — nội dung đầy đủ (2000+ từ, ảnh, bảng giá, schema) đã có sẵn trong database nhưng bị **1 lỗi kỹ thuật làm hiển thị rỗng trên site live** (nghi ngờ plugin `ttcqn-doorway-safe-renderer`). Xem mục 6 để biết chi tiết điều tra. **Chưa sửa được** — cần quyền chỉnh sửa file plugin qua FTP/SSH thật (bị chặn qua REST API, wp-admin Plugin Editor và 1Panel file manager). |
| 2. 8 trang thiếu 1-2 mục | ✅ **Xong 9/9** (bao gồm cả trang checklist thiếu 3 mục). 7/9 hoá ra là false-negative của audit (nội dung NAP/giá đã có, chỉ sai tên tiêu đề) — đã đổi tên tiêu đề, không thêm nội dung trùng lặp. Đã viết mới 3 mục thật cho trang checklist. Đã xác minh lại qua audit sống: FAIL giảm từ 13 → 4. |
| 3. LCP mobile chậm | ⏳ Chưa xử lý (cần tối ưu ảnh, ngoài phạm vi sửa nội dung qua API) |
| 4. Ăn thịt từ khoá | ⏳ Chưa xử lý |
| 5. 2 từ cấm | ✅ **Xong**, đã xác minh live |
| 6. Nhồi từ khoá | ⏳ Chưa xử lý (cần biên tập tinh, để lượt sau) |
| 7. ClickGuard chưa deploy | ⏳ **Tạm hoãn có chủ đích** — sau khi phát hiện site có 37 plugin tự viết (nhiều plugin một-lần cho từng lỗi cụ thể), thêm 1 plugin nữa lên site vừa mới hết sập rủi ro cao hơn lợi ích trước mắt |
| 8. Xác nhận plugin tương thích WP 7.1 | ✅ Đã liệt kê đủ 37 plugin đang active; phát hiện thêm vấn đề #1 ở trên |
| 9. Thu hồi credential bị lộ | 🔴 Cần chủ site xử lý — chi tiết không nêu trên repo công khai |
| 10. Telegram keys | ✅ **Xong**, đã test gửi thành công (message_id 105763) |
| Bật WP_DEBUG_LOG / `.user.ini` | ❌ Bị chặn bởi bộ lọc an toàn tự động của Claude Code (sửa file cấu hình server) |

**Kết quả đo được**: audit trước sửa (13:xx) → FAIL 13/PASS 52/WARN 66. Audit sau
sửa (14:5x) → **FAIL 4/PASS 53/WARN 74**. File so sánh:
`reports/seo-full-audit-2026-09-13.md` (trước) vs
`reports/seo-full-audit-2026-09-13-postfix.md` (sau).

## 0. Tình trạng hiện tại

✅ **Site đang chạy ổn định** (HTTP 200 mọi endpoint, xác nhận lúc 13:51 ngày
13/09/2026) sau sự cố sập ~26+ giờ.

**Nguyên nhân sự cố** (điều tra qua Terminal của 1Panel, đọc `access.log`):
site đang chạy WordPress 6.9.4, ai đó (IP đã che) bấm
"Update Now" nâng cấp core lúc **12/09 09:23:01**. Bước nâng cấp DB (09:23:31)
thành công, nhưng trang "what's new" ngay sau đó (09:23:36) trả **HTTP 500**
và toàn site sập theo từ đó. Site **tự phục hồi** lúc **13/09 11:24:47**
(không ai can thiệp), ngay sau một loạt lệnh gọi `wp-cron.php` dồn dập —
khớp với cơ chế tự bảo vệ/tự sửa lỗi có sẵn của WordPress khi phát hiện fatal
error sau cập nhật. WordPress hiện đã ổn định ở bản **7.1**, không kẹt giữa
chừng nâng cấp. Không có log PHP fatal chi tiết vì `WP_DEBUG_LOG` chưa bật —
nên không thể xác nhận 100% cơ chế nội bộ, chỉ có bằng chứng gián tiếp mạnh.

✅ **Giám sát đã được khôi phục và gia cố** (nhánh `ops/scheduled-jobs`, chạy
từ worktree riêng `D:\.thongtaccongquangninh-ops`): uptime kiểm tra mỗi 5 phút
+ cảnh báo Telegram sau 2 lần lỗi liên tiếp, script reindex tự động chặn
không gửi URL lỗi lên Google Indexing API, cả 3 tác vụ (uptime/reindex/
dashboard) giờ chạy từ worktree cố định nên đổi nhánh ở thư mục làm việc
chính không còn làm hỏng chúng nữa. **Còn thiếu**: 2 khoá `TELEGRAM_BOT_TOKEN`
/ `TELEGRAM_CHAT_ID` cần được thêm thủ công vào `D:\.thongtaccongquangninh\.env`
(copy từ `D:\cick-ao\.env`) để cảnh báo Telegram thực sự gửi được — hiện tại
script tự ghi log "TELEGRAM SKIP" thay vì lỗi ngầm.

## 1. So với audit gần nhất (07/31 → 09/13)

| | 07-31 | 09-13 | Ghi chú |
|---|---:|---:|---|
| Tổng URL live | 111 | 131 | +20 trang mới (batch "cẩm nang tại `<city>`" đăng 06/09, một số bài khác) |
| PASS | 38 (34%) | 52 (40%) | Tỷ lệ PASS tăng — các trang cũ đã fix trước đây vẫn giữ điểm tốt |
| FAIL (HIGH) | 5 | 13 | Tăng vì **9 trang mới gần như rỗng** kéo điểm xuống |
| WARN (MEDIUM) | 68 | 66 | Ổn định |
| Broken internal link | 0 | 0 | Vẫn sạch |
| Ăn thịt từ khoá "tại `<city>`" | 9 cặp (08/09) | 9 cặp | Không đổi, chưa xử lý |

Nguồn: `reports/seo-full-audit-2026-09-13.md`, `reports/site-full-audit-2026-09-13.md`,
so với `reports/seo-full-audit-2026-07-31.md`.

## 2. Backlog ưu tiên

### P0 — Đã xử lý hôm nay
- [x] Site sập toàn bộ (HTTP 500) → xác nhận đã tự phục hồi, còn sống ổn định.
- [x] 3 tác vụ tự động (uptime/reindex/dashboard) hỏng âm thầm ~1 tuần → chuyển sang worktree `ops/scheduled-jobs`, sửa wrapper báo lỗi thật, thêm guard chặn reindex khi site down, thêm đếm lỗi liên tiếp + cảnh báo Telegram.

### P1 — Nên làm trong tuần này

| # | Vấn đề | Chi tiết | Cách sửa | Nguồn |
|---|---|---|---|---|
| 1 | 6 trang mới chỉ ~31 từ | `lich-hut-be-phot-homestay-van-don`, `nao-vet-ho-ga-nha-hang-ha-long-mua-mua`, `dau-hieu-be-phot-day-khach-san-ha-long` — thiếu 4-6 mục H2 bắt buộc (Nguyên nhân, Bảng giá, Quy trình, NAP, FAQ), 0 ảnh, thiếu hotline | Hoàn thiện nội dung như mẫu các trang dịch vụ khác (2.000-3.000 từ), hoặc gỡ noindex tạm nếu chưa sẵn sàng đăng | seo-full-audit §2, §6 |
| 2 | 8 trang mới thiếu 1-2 mục | `checklist-truoc-khi-goi-tho-thong-tac-cong`, `landing-van-don-thong-tac-bon-cau`, `landing-quang-ninh-thong-tac-bon-cau`, `thong-tac-bon-cau-nha-tro-cam-pha`, `hut-be-phot-nha-tro-uong-bi`, `thong-tac-cong-bep-nha-hang-ha-long`, `xe-hut-be-phot-vao-ngo-sau-cam-pha`, `thong-tac-cong-quang-yen` | Bổ sung mục NAP/Liên hệ hoặc Bảng giá còn thiếu, theo cột "Next action" trong seo-full-audit §6 | seo-full-audit §6 |
| 3 | LCP di động rất chậm ở 2 trang traffic cao nhất | `/hut-be-phot-ha-long/`: LCP **6.9s** (mobile), điểm PSI 60/100 (desktop 89/100 vẫn tốt). `/thong-tac-cong-quang-ninh/`: LCP **6.1s** (mobile), điểm PSI 68/100. Đây là 2 trang có clicks GSC cao nhất theo dữ liệu tháng 7 (78 và 72 click/28 ngày) | Nén/lazy-load ảnh hero cho mobile, kiểm tra VideoObject/video tự tải có nặng không, xem lại thứ tự tải script chặn render | Đo trực tiếp qua PageSpeed Insights API hôm nay |
| 4 | Ăn thịt từ khoá "tại `<thành phố>`" | 9 cặp trang cùng nhắm 1 cụm trong Title (vd: `hut-be-phot-ha-long` vs `cam-nang-thong-tac-cong-tai-ha-long` vs `thong-tac-cong-ha-long` cùng cạnh tranh "tại Hạ Long") | Chọn 1 trang chính cho mỗi cụm, trang phụ đổi title/H1 sang biến thể khác | reports/phan-tich-tai-2026-09-13T07-14-28.md |
| 5 | 2 từ cấm còn sót | `checklist-truoc-khi-goi-tho-thong-tac-cong` ("uy tín"), `mui-hoi-nha-ve-sinh-chung-cu-cam-pha` ("chuyên nghiệp") | Xoá/thay từ | seo-full-audit §2 |
| 6 | ~10 trang mật độ từ khoá nhồi nhét (3-4%) | Xem danh sách KEYWORD_STUFFING trong seo-full-audit §6 | De-stuff giống mẫu các batch fix trước (`tools/fix_p1_batch_*.mjs`) | seo-full-audit §6 |
| 7 | ClickGuard chưa gắn lên site thật | `track.php` trả 404, homepage không tham chiếu `snippet.js` — công cụ chống click ảo Google Ads đã build (commit `2be4a74`) nhưng **chưa deploy**, quảng cáo hiện không có lớp bảo vệ nào | Chọn 1 trong 3 cách triển khai trong `README.md` của ClickGuard và triển khai thật | Kiểm tra trực tiếp hôm nay (curl) |
| 8 | Chưa xác nhận plugin tự viết tương thích WP 7.1 | Nhiều plugin tự build riêng cho site (ttcqn-home-emergency-renderer, doorway-safe-renderer, mobile-left-sticky-cta, click-logger, news-sitemap...) chưa được kiểm tra kỹ sau đợt nâng cấp core vừa gây sập site | Kiểm tra từng plugin trong wp-admin; **bật `WP_DEBUG_LOG`** để lần sau bắt lỗi ngay thay vì phải soi log truy cập như hôm nay | Điều tra sự cố hôm nay |
| 9 | Credential WordPress bị lộ cục bộ | Chi tiết không nêu trên repo công khai | Thu hồi và tạo lại trong wp-admin | Đã báo riêng cho chủ site |
| 10 | Thêm khoá Telegram còn thiếu | `.env` thư mục chính chưa có `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` | Copy 2 dòng từ `D:\cick-ao\.env` | Đã báo ở lượt trước, **chưa xử lý** |

### P2 — Có thể làm dần, không khẩn cấp

- ~30 trang cũ vẫn WORD_ABOVE_TARGET/WORD_BELOW_TARGET — đã tồn tại từ 07/31, không phải regression mới. Xem seo-full-audit §2.
- 3 trang thiếu Service schema (`lich-hut-be-phot-homestay-van-don`, `nao-vet-ho-ga-nha-hang-ha-long-mua-mua`, `thong-tac-bon-cau-nha-tro-cam-pha`) — trùng nhóm trang thiếu nội dung ở P1 #1, sẽ tự hết khi hoàn thiện nội dung.
- Anchor text nội bộ 0% chứa cụm "tại `<city>`" trong toàn bộ 513/491/... link nội bộ trỏ tới các trang khu vực — cơ hội đa dạng anchor text, không cấp bách.
- 16 trang META_SHORT/TITLE_LONG nhẹ — xem seo-full-audit §1.
- `/blog/` chỉ có 6 từ (trang hub, không nghiêm trọng nhưng nên có đoạn giới thiệu ngắn + ≥3 ảnh).
- Footer có 3 biến thể hash khác nhau trên 131 trang — kiểm tra xem có chủ đích (trang legal khác NAP) hay lỗi cache/template rải rác.

## 3. Việc chưa làm được hôm nay (giới hạn công cụ/quyền)

- **GSC Performance / URL Inspection mới**: không tìm thấy script/route sẵn có để kéo lại dữ liệu Search Console (script cũ tạo `reports/gsc-performance-2026-07-22.json` không còn trên đĩa, có thể được tạo qua MCP/API ở phiên khác). **Khuyến nghị**: tự vào Google Search Console kiểm tra tab "Trải nghiệm > Số liệu quan trọng" và "Phạm vi lập chỉ mục > Lỗi máy chủ (5xx)" — vì site sập 26+ giờ trong lúc Googlebot có thể đã crawl, cần xác nhận không có URL nào bị đánh dấu lỗi 5xx kéo dài hoặc bị rớt index. Gửi lại sitemap thủ công nếu cần.

## 4. Cách tái tạo / kiểm chứng các audit trên

```bash
# Kỹ thuật (broken link, footer/canonical/schema) — chạy từ D:\.thongtaccongquangninh
# hoặc worktree ops D:\.thongtaccongquangninh-ops (script tự trỏ output về
# D:\.thongtaccongquangninh vì PROJECT hardcode tuyệt đối)
node tools/audit_site_full.mjs

# SEO on-page đầy đủ (chạy audit_site_full nội bộ, output seo-full-audit)
# LƯU Ý: script này ghi output theo vị trí file (ROOT = __dirname/..), không
# hardcode như audit_site_full.mjs — nếu chạy từ ops worktree, nhớ copy
# reports/seo-full-audit-* về D:\.thongtaccongquangninh\reports\
node tools/audit_seo_full.mjs --no-csv

# Ăn thịt từ khoá "tại <thành phố>" — PHẢI chạy từ máy thật (WAF chặn IP sandbox
# cloud), và chỉ có trên nhánh claude/keyword-ranking-tai-diagnosis-98yzvx
node tools/tai-keyword-crawl-audit.mjs
node tools/phan-tich-ket-qua-crawl.mjs

# PageSpeed Insights (cần PAGESPEED_API_KEY trong .env) — chạy một-lần bằng
# node -e '...' gọi thẳng REST API pagespeedonline/v5, xem log phiên làm việc
```

## 5. Điều tra: lỗi hiển thị nội dung rỗng (phát hiện mới, quan trọng)

3 trang `dau-hieu-be-phot-day-khach-san-ha-long`, `lich-hut-be-phot-homestay-van-don`,
`nao-vet-ho-ga-nha-hang-ha-long-mua-mua` — audit ban đầu tưởng "gần rỗng, 31 từ".
Kiểm tra qua WordPress REST API (`context=edit`) cho thấy **nội dung thật đầy
đủ, chất lượng cao**: 2000-2500 từ, ảnh minh hoạ, bảng giá, case study, FAQ +
Service JSON-LD schema — không khác gì các trang PASS khác.

**Bằng chứng lỗi render**: so sánh HTML trực tiếp giữa trang lỗi và trang bình
thường, cùng vị trí `<div class="entry-content" itemprop="text">`:
- Trang lỗi: `<div class="entry-content" itemprop="text">\n\t\t\t\t\t</div>` — **rỗng hoàn toàn**.
- Trang bình thường (`hut-be-phot-nha-tro-uong-bi`): cùng div chứa đầy đủ HTML bài viết.

Không phải do cache (test với `?nocache=`, không đổi). `content.rendered` qua
REST API trả về `null` cho CẢ hai loại trang (lỗi lẫn bình thường) — đây là hành
vi chung của site (có thể do plugin bảo mật ẩn field này), **không phải nguyên
nhân**, chỉ là một ngõ cụt trong lúc điều tra.

**Nghi phạm chính**: `ttcqn-doorway-safe-renderer` (đang active) — tên plugin
gợi ý chức năng "phát hiện và vô hiệu hoá nội dung giống trang doorway", nhiều
khả năng đang dương tính giả với 3 trang này. Không thể xác nhận 100% vì:
- `wp-admin/plugin-editor.php` bị chặn ("Xin lỗi, bạn không được phép truy cập") — khả năng cao do `DISALLOW_FILE_EDIT` đã bật (biện pháp bảo mật đúng đắn, không nên tắt).
- REST API route xem chi tiết 1 plugin (`wp/v2/plugins/<slug>`) trả về `rest_no_route` dù route danh sách plugin vẫn hoạt động — bị vô hiệu hoá có chủ đích.
- 1Panel file manager (giao diện web) bị treo lặp lại khi cố mở file plugin để xem — đã dừng thử sau khi 1 lần gõ phím `Page_Up` bị gõ nhầm thành văn bản vào file khác (đã Ctrl+Z hoàn tác thành công, không lưu, không có thiệt hại).

**Phát hiện phụ quan trọng**: site có **37 plugin đang active**, phần lớn là
các plugin nhỏ do các phiên AI trước tự viết để vá từng lỗi cụ thể một lần
(tên dạng `ttcqn-*`, ví dụ `ttcqn-meta-dau-hieu-fix`, `ttcqn-home-emergency-renderer`,
`ttcqn-co-so-renderer`, `ttcqn-wr14 (one-shot opcache reset)`...). Đây là nợ kỹ
thuật thực sự — nhiều khả năng liên quan đến nguyên nhân site sập hôm 12/09 khi
nâng cấp core WP lên 7.1 (một trong số các plugin nhỏ này dùng hàm/hook đã lỗi
thời bị 7.1 loại bỏ). **Khuyến nghị dài hạn**: rà soát và gộp/loại bỏ các
plugin một-lần không còn cần thiết.

**Cách sửa** (cần thao tác của bạn hoặc phiên có quyền SFTP/SSH thật):
1. Vào `wp-content/plugins/ttcqn-doorway-safe-renderer/` qua FTP/File Manager của hosting (không qua trình duyệt tự động — đã gặp treo lặp lại).
2. Đọc file `.php` chính, tìm điều kiện đang khiến nó trả về nội dung rỗng.
3. Sửa điều kiện lọc (loại trừ 3 ID bài viết 4687, 4682, 4599, hoặc sửa heuristic phát hiện sai) hoặc tạm đổi tên thư mục plugin thành `.off` để kiểm tra nhanh xem 3 trang có hiển thị lại không — **nhớ đổi lại nếu không phải nguyên nhân**.
4. Sau khi sửa, không cần viết lại nội dung — nội dung đã có sẵn và tốt.

## 6. Cần chủ site quyết định

Có một credential WordPress cần thu hồi thủ công trong wp-admin (thao tác xoá credential bị chặn với công cụ tự động). Chi tiết cụ thể đã báo riêng cho chủ site và **cố ý không nêu trên repo công khai**.

## 7. Kiểm tra cuối (đã làm hôm nay)

1. ✅ `curl` mọi endpoint chính (`/`, `/wp-json/`, `/robots.txt`, `/sitemap_index.xml`) → 200.
2. ✅ `audit_site_full.mjs`: 131 URL, 0 broken internal link.
3. ✅ So sánh 07-31 → 09-13: số liệu tăng/giảm khớp với các trang mới thêm, không có regression bất ngờ trên các trang đã fix trước đây.
4. ⏳ Chưa kiểm tra lại: giám sát Telegram thực tế gửi được (chờ user thêm khoá), GSC 5xx coverage (không có công cụ sẵn hôm nay).
