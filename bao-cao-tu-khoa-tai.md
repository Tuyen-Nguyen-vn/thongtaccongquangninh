# Chẩn đoán mất thứ hạng nhóm từ khóa có chữ "TẠI" — thongtaccongquangninh.com

- Ngày lập báo cáo: 2026-09-03, cập nhật tiến độ: 2026-09-06
- Điểm khôi phục Git trước khi sửa: commit `c96a148` (nhánh `claude/keyword-ranking-tai-diagnosis-98yzvx`, working tree sạch, không có gì cần commit thêm trước khi bắt đầu — đây chính là điểm rollback nếu cần quay lại).

## ✅ Cập nhật tiến độ thật (2026-09-06) — đã chạy thật trên WordPress sống

Đã xác nhận qua git log + kết quả script (không suy đoán): **16/16 trang dịch vụ đã sửa Title/Meta thành công (status 200)** trên site sống, chạy từ máy thật của chủ site (không bị WAF chặn):

- Đợt 1 (`fix_tai_title_meta_batch1.mjs`): 10 trang — `thong-tac-cong-quang-ninh`, `hut-be-phot-ha-long`, `hut-be-phot-cam-pha`, `thong-tac-cong-ha-long`, `thong-tac-cong-cam-pha`, `hut-be-phot-quang-ninh`, `hut-be-phot-uong-bi`, `hut-be-phot-quang-yen`, `thong-tac-cong-quang-yen`, `hut-ham-cau-quang-ninh` (sửa xong bug loại post/page ở đợt sau).
- Đợt 2 (`fix_tai_title_meta_batch2.mjs`): 6 trang — `hut-be-phot-mong-cai`, `thong-tac-cong-mong-cai`, `hut-be-phot-dong-trieu`, `thong-tac-cong-dong-trieu`, `hut-be-phot-van-don`, `thong-tac-cong-van-don`.
- Mỗi lần ghi đều tự backup title/content cũ vào `backups/fix-tai-batch*-<thời gian>/` trên máy chủ site — dùng để rollback tay nếu cần (PUT lại title/content cũ qua REST API).

**Sửa lại nhận định về WAF ở mục ⚠️ ngay dưới đây:** đã chạy `tools/tai-keyword-crawl-audit.mjs` thành công **122/122 URL** từ máy thật của chủ site — xác nhận WAF **không** chặn truy cập bình thường, chỉ chặn dải IP datacenter/proxy (như máy ảo sandbox nơi tôi chạy). Không cần lo về việc Googlebot bị chặn.

**Việc còn lại (chưa làm hoặc cần bạn xác nhận):**
- File kết quả crawl (`reports/tai-keyword-crawl-*.json/.md`) đang nằm trên máy bạn, **chưa gửi lại/commit** — gửi 2 file này để tôi đọc và cập nhật chính xác Giai đoạn 2 (anchor text nội bộ + schema areaServed, phần trước đây thiếu dữ liệu).
- Đoạn H2 "hút hầm cầu tại X" cần dán tay vào trang `hut-ham-cau-quang-ninh` (nội dung có sẵn trong `tools/fix_tai_title_meta_batch1.mjs`, cuối file) — chưa xác nhận đã dán chưa.
- 20 bài blog "cẩm nang tại X" (3 dịch vụ × 7 địa bàn) — đã có script tạo bài NHÁP, chưa xác nhận đã chạy/đăng bài nào chưa.
- Xuất GSC CSV mốc trước khi sửa (Giai đoạn 3.1) — nên làm ngay nếu chưa làm, để so sánh được sau 2-4 tuần.
- Nguồn dữ liệu THẬT đã đọc trực tiếp (không suy đoán):
  - `reports/seo-full-audit-2026-07-31.json` — audit từng URL (title, meta, H1/H2/H3, ảnh+alt, schema, word count) của 111 URL, crawl ngày 2026-07-31.
  - `reports/site-full-audit-2026-07-31.json` — audit kỹ thuật (canonical, robots, link status, hash trùng footer).
  - `reports/gsc-performance-2026-07-22.json` — dữ liệu Google Search Console THẬT, khoảng 2026-06-24 → 2026-07-19 (347 click / 8.279 impression), có breakdown theo truy vấn và theo URL.
  - `reports/gsc-url-inspection-2026-07-22T16-44-17.md` — trạng thái index thật của 31 URL qua GSC URL Inspection API.
  - `tools/*.mjs` — script đã dùng để sửa các đợt trước, xác nhận cơ chế: `title` (WP post_title) = H1 hiển thị trên theme này; SEO title tag và H1 **là cùng một trường**; `meta.rank_math_description` là field Rank Math ghi qua REST API.

## ⚠️ Giới hạn dữ liệu — đã thử và không lấy được, cần bạn bổ sung

Tôi đã thử crawl trực tiếp site sống (`curl`, rồi dựng Chromium headless qua Playwright, thử cả `/`, `/sitemap.xml`, `/wp-json/wp/v2/pages`) từ môi trường sandbox đang chạy phiên này. **Toàn bộ request đều bị OnePanel WAF của site chặn** và trả về trang thử thách "Just a moment… — OnePanel" (proof-of-work JavaScript), kể cả với REST API công khai. Đây là chặn theo dải IP nguồn (datacenter/proxy), **không phải bằng chứng Googlebot cũng bị chặn** — nhưng cần bạn xác minh riêng (xem Giai đoạn 3, mục 3).

Vì vậy Giai đoạn 1 dưới đây dùng dữ liệu **audit thật đã lưu sẵn trong repo** (2026-07-31, cách đây ~5 tuần) làm nền, cộng với dữ liệu GSC thật (2026-06-24 → 2026-07-19). Hai phần **không có sẵn** trong audit cũ và cũng không lấy lại được từ sandbox này:

1. **Toàn văn body text** từng trang (audit cũ chỉ lưu H1/H2/H3/alt/meta/word count, không lưu full text đoạn văn) → không đếm chính xác tuyệt đối số lần "tại Hạ Long" xuất hiện *trong đoạn văn thường*, chỉ đếm được trong heading/alt/meta/title.
2. **Anchor text của internal link trỏ ĐẾN từng URL** (audit cũ chỉ lưu danh sách URL outbound, không lưu chữ anchor) và **schema `areaServed`/`addressLocality`** đầy đủ (audit cũ chỉ lưu danh sách *loại* schema, không lưu nội dung field).

→ Tôi đã viết sẵn `tools/tai-keyword-crawl-audit.mjs` để lấy đủ 2 phần này. **Bạn chạy file này trên máy Windows của bạn** (không bị WAF chặn vì không phải IP datacenter) rồi gửi lại `reports/tai-keyword-crawl-*.json` — tôi sẽ đọc và cập nhật lại Giai đoạn 2 chính xác hơn. Cách chạy ở Giai đoạn 3.

---

## GIAI ĐOẠN 1 — Dữ liệu thật đã trích xuất

### 1.1 Bảng n-gram: "tại X" so với "X" (không "tại"), trên các trường đo được

Đo trên 107 URL còn phân tích được (đã loại 4 URL redirect 301). Vì thiếu body text thô, cột "Body" lấy từ tổng hợp H2+H3 (phần nội dung văn bản duy nhất có lưu) — **không phải toàn văn**, ghi rõ để không hiểu nhầm là đã đếm hết bài.

| Biến thể | Số URL có "X" trong Title | Số URL có "tại X" trong Title | Số URL có "tại X" trong H1 | Số URL có "tại X" trong H2/H3 | Số URL có "tại X" trong Alt ảnh | Số URL có "tại X" trong Meta |
|---|---:|---:|---:|---:|---:|---:|
| Hạ Long | 10 | 0 | 0 | 8 | 8 | 1 |
| Cẩm Phả | 5 | 0 | 0 | 5 | 4 | 2 |
| Uông Bí | 4 | 0 | 0 | 4 | 3 | 2 |
| Móng Cái | 4 | 0 | 0 | 4 | 3 | 0 |
| Quảng Yên | 5 | 0 | 0 | 5 | 4 | 2 |
| Đông Triều | 4 | 0 | 0 | 4 | 3 | 0 |
| Vân Đồn | 4 | 0 | 0 | 4 | 3 | 0 |
| Quảng Ninh (toàn tỉnh) | 42 | 1* | 0 | 33 | 27 | 2 |

\* Chỉ có `cam-nang-thong-tac-cong-tai-ha-long` (bài blog/cẩm nang) có "tại" trong title — không phải trang dịch vụ chính, nên không tính là trang đích thật của cụm "thông tắc cống tại Hạ Long".

**Kết luận số liệu — mẫu hình lặp lại 100% nhất quán trên toàn bộ 78 trang dịch vụ kiểm tra được:**
- **Title = 0/78 trang chứa "tại X"** — tất cả đều viết dạng "[Dịch vụ] [Thành phố] – [USP]" (không "tại").
- **H1 = 0/78 trang chứa "tại X"** — vì trên theme này, trường `title` (WP post_title) **chính là H1** hiển thị (đã xác nhận bằng cách so khớp `title` và `headings.h1[0]` của từng trang trong audit — giống hệt nhau ở mọi trang kiểm tra).
- **H2/H3 = phần lớn (≈70-90%) trang ĐÃ có "tại X"** một cách tự nhiên (ví dụ trang chủ có H2 "Đơn vị thông tắc cống, hút bể phốt **tại Quảng Ninh**"; trang `hut-be-phot-ha-long` có H2 "Nguyên nhân bể phốt **tại Hạ Long** nhanh đầy...", "Cam Kết 3 Không Khi Hút bể phốt **Tại Hạ Long**").
- **Alt ảnh = phần lớn trang đã có "tại X"** (ví dụ `hut-be-phot-mong-cai` có alt "xe bồn hút bể phốt **tại Móng Cái**").
- **Meta description = gần như không có "tại X"** (chỉ viết thẳng tên thành phố, không chèn "tại").

### 1.2 Dữ liệu GSC thật (2026-06-24 → 2026-07-19) — các truy vấn chứa "tại"

Đây là dữ liệu thật, KHÔNG phải suy đoán — trích trực tiếp từ `reports/gsc-performance-2026-07-22.json`. **Bảng này tự nó đã bác bỏ một phần giả định "không thấy kết quả"**: nhiều cụm "tại X" thực ra CÓ impression và CÓ vị trí xếp hạng, chỉ là CTR cực thấp hoặc vị trí kém, không phải "biến mất khỏi Google".

| Truy vấn | Impression | Click | Vị trí TB | CTR |
|---|---:|---:|---:|---:|
| hút bể phốt tại uông bí | 736 | 1 | 6,0 | 0,14% |
| hút bể phốt tại quảng ninh | 653 | 1 | 14,0 | 0,15% |
| thông tắc cống tại cẩm phả | 546 | 32 | 9,6 | 5,86% |
| thông tắc cống tại hạ long | 360 | 24 | 12,9 | 6,67% |
| hút bể phốt tại quảng yên | 332 | 0 | 8,9 | 0,00% |
| hút bể phốt tại cẩm phả | 169 | 0 | 10,5 | 0,00% |
| thông tắc cống tại quảng yên | 98 | 0 | 8,9 | 0,00% |
| hút bể phốt tại hạ long | 87 | 1 | 23,8 | 1,15% |
| thông tắc cống tại móng cái | 74 | 0 | 8,6 | 0,00% |
| thông tắc cống tại quảng ninh | 58 | 1 | 13,3 | 1,72% |

**Đọc đúng bảng này:**
- **"hút bể phốt tại uông bí"**: vị trí trung bình **6,0** (trang 1!) với 736 impression trong 4 tuần — nhưng chỉ **1 click**. Đây KHÔNG phải lỗi "không xếp hạng", mà là lỗi **snippet không hấp dẫn / không khớp cảm nhận với truy vấn** khiến người tìm không bấm dù thấy kết quả ở vị trí tốt. Đối chiếu URL `hut-be-phot-uong-bi/`: tổng 913 impression cho MỌI truy vấn, position TB 6,08 — tức gần như toàn bộ traffic của trang này đến từ đúng truy vấn "tại Uông Bí", và CTR toàn trang chỉ 0,22%. **Đây là vấn đề ưu tiên cao nhất, không phải vấn đề "chưa được nhắm".**
- **"thông tắc cống tại cẩm phả"** và **"thông tắc cống tại hạ long"**: CTR tốt (5,86% và 6,67%) dù vị trí chỉ ở khoảng 10-13 — hai cụm NÀY đang hoạt động tương đối ổn, ưu tiên thấp hơn.
- **"hút bể phốt tại hạ long"**: vị trí 23,8 (trang 3) — đây MỚI thực sự là xếp hạng yếu.
- Các cụm còn lại (Quảng Yên, Cẩm Phả-bể phốt, Móng Cái, Quảng Ninh chung): vị trí 8-14 (trang 1 cuối — trang 2 đầu) nhưng CTR gần như 0% — cùng nhóm lỗi snippet như Uông Bí.

⚠️ Lưu ý quan trọng: dữ liệu GSC này lấy **trước** đợt sửa nội dung 2026-07-31 (12 trang P1 đã được viết lại theo `reports/fix-batch5/6-2026-07-31...json`). Vị trí hiện tại (tháng 9) có thể đã thay đổi — **bắt buộc phải lấy GSC mới** để xác nhận (xem Giai đoạn 3).

### 1.3 Trạng thái index thật (GSC URL Inspection, 2026-07-22)

8 trang mục tiêu chính đều có verdict **PASS — "Submitted and indexed"**: `hut-be-phot-ha-long`, `hut-be-phot-cam-pha`, `hut-be-phot-quang-ninh`, `hut-be-phot-uong-bi`, `hut-be-phot-quang-yen` (x2 do trùng dòng), `thong-tac-cong-quang-ninh`, `thong-tac-cong-quang-yen`, `hut-be-phot-van-don`. → **Loại trừ nguyên nhân kỹ thuật (không index) cho toàn bộ nhóm trang ưu tiên.**

Riêng các URL con cấp phường/xã (`hut-be-phot-yen-thanh`, `hut-be-phot-cam-thuy`, `hut-be-phot-bach-dang`, `hoa-chat-tu-thong-cong`, `thong-tac-bon-cau-hong-gai`, `thong-tac-bon-cau-khan-cap-quang-ninh`, `thong-tac-bon-cau-tuan-chau`, `thong-tac-cong-gieng-day`, `hut-be-phot-chung-cu-quang-ninh-2026`) có verdict **NEUTRAL — "Discovered - currently not indexed"** tại thời điểm 2026-07-22. Đây không phải nhóm từ khóa "tại" trong yêu cầu này nhưng là rủi ro kỹ thuật cần theo dõi riêng (không mở rộng phạm vi báo cáo này).

---

## GIAI ĐOẠN 2 — Phân loại nguyên nhân theo từng từ khóa

| Từ khóa | URL chủ lực | Title/H1 có "tại"? | H2/H3/Alt có "tại"? | GSC vị trí / CTR | **Phân loại** | Bằng chứng |
|---|---|:---:|:---:|---|---|---|
| thông tắc cống tại quảng ninh | `/thong-tac-cong-quang-ninh/` | ❌ Không | ✅ Có (H2 "Dịch vụ thông tắc cống **tại Quảng Ninh**") | 58 impr, vị trí 13,3, CTR 1,72% | **B — nhắm yếu** | Title/H1 hiện tại: "Thông Tắc Cống Quảng Ninh – Dịch Vụ, Điều Phối Nhanh" — không có "tại" |
| hút bể phốt tại quảng ninh | `/hut-be-phot-quang-ninh/` | ❌ Không | ✅ Có | 653 impr, vị trí 14,0, CTR **0,15%** | **B — nhắm yếu, CTR nguy cấp** | Title: "Hút Bể Phốt Quảng Ninh – Xe Bồn Lớn, Có Mặt Trong 30 Phút" |
| hút bể phốt tại hạ long | `/hut-be-phot-ha-long/` | ❌ Không | ✅ Có (H2 "Nguyên nhân bể phốt **tại Hạ Long**...") | 87 impr, vị trí **23,8** (trang 3), CTR 1,15% | **B — nhắm yếu + vị trí thật sự kém** | Title: "Hút Bể Phốt Hạ Long – Xe Bồn, Giá Minh Bạch Không Phát Sinh" |
| hút bể phốt tại cẩm phả | `/hut-be-phot-cam-pha/` | ❌ Không | ✅ Có | 169 impr, vị trí 10,5, CTR 0,00% | **B — nhắm yếu, CTR = 0** | Title: "Hút Bể Phốt Cẩm Phả – Xe Bồn Lớn, Tận Tâm, Điều Phối Nhanh" |
| thông tắc cống tại hạ long | `/thong-tac-cong-ha-long/` | ❌ Không | ✅ Có (H2) nhưng **Alt ảnh KHÔNG có "tại"** (5 alt đầu đều thiếu) | 360 impr, vị trí 12,9, CTR 6,67% (đang ổn) | **B nhẹ — vẫn nên bổ sung Title/H1/Alt để lên vị trí** | Alt hiện tại: "thông tắc cống Hạ Long bằng máy lò xo" (thiếu "tại") |
| thông tắc cống tại cẩm phả | `/thong-tac-cong-cam-pha/` | ❌ Không | ✅ Có | 546 impr, vị trí 9,6, CTR 5,86% (đang ổn) | **B nhẹ** | Title: "Thông Tắc Cống Cẩm Phả – Không Đục Phá, Đến Tận Nơi Nhanh" |
| hút bể phốt tại uông bí | `/hut-be-phot-uong-bi/` | ❌ Không | ✅ Có | 736 impr, vị trí **6,0**, CTR **0,14%** | **B — CTR là điểm nghẽn số 1 toàn site** | Meta hiện tại không có "tại Uông Bí" literal |
| hút bể phốt tại quảng yên | `/hut-be-phot-quang-yen/` | ❌ Không | ✅ Có | 332 impr, vị trí 8,9, CTR 0,00% | **B — CTR = 0 dù trang 1** | — |
| thông tắc cống tại quảng yên | `/thong-tac-cong-quang-yen/` | ❌ Không | ✅ Có | 98 impr, vị trí 8,9, CTR 0,00% | **B** | — |
| thông tắc cống tại móng cái | `/thong-tac-cong-mong-cai/` | ❌ Không | ✅ Có | 74 impr, vị trí 8,6, CTR 0,00% | **B** | — |
| hút bể phốt tại đông triều, tại vân đồn | `/hut-be-phot-dong-trieu/`, `/hut-be-phot-van-don/` | ❌ Không | ✅ Có | Chưa có trong snapshot GSC (impression quá thấp giai đoạn đó hoặc chưa lọc được) | **B (suy từ mẫu hình chung, cần GSC mới xác nhận)** | Cùng mẫu Title/H1 như 9 trang trên |
| hút bể phốt / thông tắc cống tại uông bí, móng cái, đông triều, vân đồn, quảng yên (các trang còn lại) | các URL tương ứng | ❌ Không | ✅ Có | — | **B (đồng dạng)** | Cùng mẫu hình 100% |
| **hút hầm cầu tại [bất kỳ thành phố nào]** | Không có trang cấp thành phố, chỉ có `/hut-ham-cau-quang-ninh/` (toàn tỉnh) | ❌ Không | Chỉ nói chung "Quảng Ninh", không có H2 theo từng thành phố | — | **A — chưa có trang/section nhắm theo thành phố** | Audit xác nhận CHỈ có 1 URL `hut-ham-cau-quang-ninh`, không có `hut-ham-cau-ha-long`, `hut-ham-cau-cam-pha`... |
| **thông cống nghẹt tại [thành phố]** | Không có trang riêng — nội dung đã gộp vào các trang `thong-tac-cong-*` (cùng ý định tìm kiếm) | — | Có xuất hiện rải rác trong H3 dạng câu hỏi ("Cống bị tắc do hố ga...") | — | **Không phải lỗi — KHÔNG nên tạo trang riêng** (sẽ cannibalize với `thong-tac-cong-*`); chỉ cần đảm bảo cụm "cống nghẹt"/"nghẹt cống" xuất hiện tự nhiên trong FAQ của trang `thong-tac-cong-*` hiện có | — |
| Cannibalization (2 URL cùng nhắm 1 cụm "tại X") | — | — | — | — | **C — KHÔNG phát hiện** trong 78 trang kiểm tra (mỗi thành phố × dịch vụ chỉ có đúng 1 URL cấp tỉnh/thành, các URL phường/xã như `hut-be-phot-bach-dang` là intent khác — cấp phường, không cạnh tranh trực tiếp với cấp thành phố) | — |
| Vấn đề kỹ thuật (noindex/canonical sai/thin content/tốc độ) | — | — | — | — | **D — KHÔNG phát hiện** cho 8/9 trang ưu tiên (GSC Inspection = PASS/indexed, `site-full-audit`: "Canonical/viewport/robots bất thường: Không phát hiện", word count 2.000-5.000 từ, không phải thin content) | — |

**Tóm tắt phân loại:** Đây **không phải** hiện tượng "trang biến mất khỏi Google cho cụm 'tại X'". Đó là ba lớp vấn đề chồng lên nhau, cùng gốc:

1. **Lớp gốc (B, 100% các trang):** Title tag và H1 — tín hiệu on-page mạnh nhất cho việc khớp cụm từ chính xác — **không bao giờ** chứa "tại X", chỉ chứa "X". Google vẫn hiểu ngữ nghĩa gần đúng (đó là lý do vẫn có impression), nhưng khi người dùng gõ đúng "tại X" và thấy snippet tiêu đề không có chữ "tại" y hệt, cảm giác "không khớp" làm giảm khả năng bấm và có thể ảnh hưởng vị trí xếp hạng cho biến thể dài hơn.
2. **Hệ quả trực tiếp đo được (CTR):** 7/10 truy vấn "tại X" có CTR ~0% dù vị trí không tệ (6-14) — đúng như dự đoán từ lớp 1.
3. **Một khoảng trống thật (A) duy nhất:** "hút hầm cầu tại [thành phố]" — chưa có trang/section nào nhắm theo từng thành phố.

---

## GIAI ĐOẠN 3 — Dữ liệu cần bạn lấy tay

### 3.1 Xuất Google Search Console → Performance → Queries chứa "tại" (BẮT BUỘC — dữ liệu trong báo cáo này đã 5-8 tuần, cần bản mới)

1. Vào https://search.google.com/search-console → chọn property `thongtaccongquangninh.com`.
2. Menu trái → **Hiệu suất (Performance)** → tab **Kết quả tìm kiếm (Search results)**.
3. Đặt khoảng ngày **28 ngày gần nhất** (hoặc so sánh với 28 ngày trước đó để thấy xu hướng).
4. Nhấn **+ Mới (+ New)** → **Truy vấn (Query)** → **Lọc chứa (Query containing)** → gõ `tại` → Áp dụng.
5. Bảng bên dưới hiện danh sách truy vấn chứa "tại" kèm Click / Impression / CTR / Vị trí trung bình.
6. Nhấn nút **Xuất (Export)** góc trên phải → **Tải CSV (Download CSV)**.
7. Lặp lại bước 4 nhưng đổi bộ lọc sang **Trang (Page)** đồng thời giữ bộ lọc Query chứa "tại" — bảng sẽ hiện **Trang nào đang nhận impression cho truy vấn đó** → xuất CSV riêng file này (đặt tên `gsc-tai-by-page.csv`). File này là bắt buộc để xác nhận có Cannibalization (C) hay không — bảng aggregate query trong báo cáo này KHÔNG tách theo trang.

Gửi 2 file CSV này lại, tôi sẽ đọc trực tiếp và cập nhật lại Giai đoạn 2.

### 3.2 Cách phân biệt "impression thấp = chưa xếp hạng" và "vị trí thấp = xếp hạng kém"

Nhìn cột **Vị trí trung bình (Position)** trong CSV vừa xuất:
- Có dòng nhưng **Impression = 0 hoặc không xuất hiện** → khả năng cao Category A (chưa được nhắm / chưa index cho cụm đó).
- **Impression > 0** nhưng **Position > 20** → xếp hạng yếu thật (trang 2-3), khớp Category B mức nặng — giống trường hợp "hút bể phốt tại hạ long" đã phát hiện ở trên (vị trí 23,8).
- **Impression > 0**, **Position 1-15**, nhưng **CTR < 1%** → đúng như 7 cụm đã phát hiện — vấn đề snippet/Title, không phải vấn đề xếp hạng.

### 3.3 Kiểm tra site có được index cho cụm "tại X" — và kiểm tra riêng Googlebot có bị WAF chặn không

Vào Google, gõ (thay X theo từng cụm cần kiểm):
```
site:thongtaccongquangninh.com "thông tắc cống tại hạ long"
site:thongtaccongquangninh.com "hút bể phốt tại uông bí"
```
Nếu ra kết quả → trang đã được Google crawl và lưu nội dung chứa đúng cụm đó (thường nằm trong H2/alt, không phải title). Nếu KHÔNG ra kết quả nào cho toàn site (`site:thongtaccongquangninh.com` không ra gì) → có vấn đề index nghiêm trọng hơn, báo lại ngay.

**Quan trọng — kiểm tra riêng vì tôi không tự làm được từ sandbox này:** vào GSC → **Kiểm tra URL (URL Inspection)** → dán URL `https://thongtaccongquangninh.com/hut-be-phot-uong-bi/` → nhấn **Kiểm tra trực tiếp (Test Live URL)** → xem tab **Ảnh chụp màn hình (Screenshot)**. Nếu ảnh chụp hiện đúng trang dịch vụ bình thường → Googlebot **không** bị WAF chặn, an toàn. Nếu ảnh chụp hiện trang "Just a moment... OnePanel" (giống những gì tôi gặp phải) → **đây là sự cố kỹ thuật nghiêm trọng ảnh hưởng toàn site**, cần liên hệ nhà cung cấp hosting/WAF OnePanel để whitelist Googlebot ngay lập tức (ưu tiên P0 tuyệt đối, trên cả các việc sửa nội dung bên dưới).

### 3.4 Xem 5 kết quả top đầu để biết đối thủ đặt cụm "tại X" ở đâu

Với mỗi cụm ưu tiên, gõ trên Google (chế độ ẩn danh, để tránh cá nhân hoá):
```
hút bể phốt tại hạ long
thông tắc cống tại quảng ninh
```
Với 5 kết quả đầu, ghi lại: (1) họ có chữ "tại" trong tiêu đề xanh không, (2) có trong URL không, (3) có Google Business Profile / bản đồ (map pack) chiếm vị trí trên cùng không — nếu map pack luôn xuất hiện trên các cụm "tại + thành phố", đó là lý do CTR tổ chức (organic) thấp dù vị trí organic không tệ, và nên ưu tiên tối ưu Google Business Profile song song (ngoài phạm vi báo cáo on-page này, nhưng nên biết).

### 3.5 Chạy script crawl sâu để có anchor text + schema areaServed thật (đã viết sẵn)

```powershell
cd D:\.thongtaccongquangninh
node tools\tai-keyword-crawl-audit.mjs
```
Script tự phát hiện nếu bị WAF chặn ngay cả từ máy bạn (báo lỗi rõ ràng, không âm thầm sai). Nếu chạy được, gửi lại 2 file `reports/tai-keyword-crawl-*.json` và `.md`.

---

## GIAI ĐOẠN 4 — Nội dung sửa (copy-paste được, không tạo trang mới)

Nguyên tắc áp dụng cho toàn bộ 9 gói dưới: **giữ nguyên cụm gốc đã lên top ở đầu Title/H1, chèn thêm cụm "tại X" vào vế sau** — không xoá, không đảo vị trí cụm gốc. Trên theme này, trường Title = H1 (một trường duy nhất), nên mỗi trang chỉ có **một** dòng Title/H1 dùng chung.

### 4.1 `/thong-tac-cong-quang-ninh/` — P0 (khối lượng tìm kiếm lớn nhất trong nhóm "thông tắc cống")

- **Title/H1 cũ:** `Thông Tắc Cống Quảng Ninh – Dịch Vụ, Điều Phối Nhanh` (52 ký tự)
- **Title/H1 mới:** `Thông Tắc Cống Quảng Ninh – Thợ Có Mặt Tại Quảng Ninh Nhanh` (59 ký tự)
- **Meta description mới (154 ký tự, có hotline):** `Thông tắc cống tại Quảng Ninh — thợ có mặt tại Quảng Ninh trong 20-30 phút, máy lò xo chuyên dụng, báo giá trước khi làm, không đục phá. Gọi 0963.953.533.`
- **H2 mới bổ sung (trang đã có H2 "Dịch vụ thông tắc cống tại Quảng Ninh" — giữ nguyên, thêm 1 H2 mới ngay sau phần Quy trình):**
  `## Thông Tắc Cống Tại Quảng Ninh Có Mặt Trong Bao Lâu?`
- **FAQ mới (thêm vào khối FAQPage đã có sẵn trên trang):**
  - Hỏi: *Thông tắc cống tại Quảng Ninh có mặt trong bao lâu?* — Đáp: *Ở khu vực trung tâm Hạ Long, Cẩm Phả, thợ có mặt sau 20–30 phút kể từ cuộc gọi. Xe mang sẵn máy lò xo và máy áp lực, không phải quay về lấy thêm thiết bị. Báo giá xong mới thi công.*
  - Hỏi: *Thông tắc cống tại Quảng Ninh có đục phá nền nhà không?* — Đáp: *Không. Thợ dùng máy lò xo hoặc máy áp lực đẩy qua điểm tắc trước, chỉ đề xuất đục khi đường ống vỡ hoặc sập, và luôn báo trước khi làm.*
  - Hỏi: *Giá thông tắc cống tại Quảng Ninh ngoài giờ có cao hơn không?* — Đáp: *Ca ngoài khung 05:00–22:00 tính thêm phụ phí di chuyển, báo rõ số tiền qua điện thoại trước khi thợ xuất phát, không phát sinh thêm khi đến nơi.*
- **Alt ảnh mới (2 ảnh đầu, thay ảnh hiện tại):**
  1. `Thợ thông tắc cống tại Quảng Ninh chuẩn bị máy lò xo trước công trình`
  2. `Kỹ thuật viên thông tắc cống tại Quảng Ninh kiểm tra hố ga trước khi xử lý`

### 4.2 `/hut-be-phot-ha-long/` — P0 (vị trí thật sự kém: 23,8 — trang 3)

- **Title/H1 cũ:** `Hút Bể Phốt Hạ Long – Xe Bồn, Giá Minh Bạch Không Phát Sinh` (59)
- **Title/H1 mới:** `Hút Bể Phốt Hạ Long – Xe Bồn Có Mặt Tại Hạ Long Trong 30 Phút` (61)
- **Meta mới (152 ký tự):** `Hút bể phốt tại Hạ Long — xe bồn có mặt sau 20-30 phút, vào ngõ sâu Bãi Cháy, Hồng Gai, Hà Khẩu, báo giá trước khi hút. Gọi 0963.953.533 / 0931.156.756.`
- **H2 mới bổ sung:** `## Xe Hút Bể Phốt Có Mặt Tại Hạ Long Nhanh Nhất Khu Vực Nào?`
- **FAQ mới:**
  - Hỏi: *Hút bể phốt tại Hạ Long có mặt nhanh không?* — Đáp: *Khu Bãi Cháy, Hồng Gai, Hà Khẩu xe bồn có mặt sau 20–30 phút. Với ngõ nhỏ dưới 1,2m, thợ mang ống nối dài để kéo vào sâu thay vì để xe đứng ngoài đường lớn.*
  - Hỏi: *Hút bể phốt tại Hạ Long giá bao nhiêu?* — Đáp: *Giá theo dung tích bể và khoảng cách đỗ xe, báo qua điện thoại hoặc ảnh chụp trước khi xe xuất phát. Không thu thêm ngoài số đã báo trừ khi khối lượng bùn thực tế đo tại chỗ khác mô tả ban đầu.*
  - Hỏi: *Hút xong bể phốt tại Hạ Long bao lâu thì đầy lại?* — Đáp: *Bể phốt hộ gia đình dùng đúng công năng thường 2–3 năm mới cần hút lại. Nếu chưa đến 6 tháng đã đầy lại, thợ quay lại kiểm tra đường ống miễn phí trong thời gian bảo hành.*
- **Alt ảnh mới (2 ảnh):**
  1. `Xe bồn hút bể phốt tại Hạ Long đang đỗ trước ngõ khu Bãi Cháy`
  2. `Thợ kéo ống hút bể phốt tại Hạ Long vào ngõ nhỏ khu Hà Khẩu`

### 4.3 `/hut-be-phot-cam-pha/` — P0 (CTR = 0% dù vị trí 10,5)

- **Title/H1 cũ:** `Hút Bể Phốt Cẩm Phả – Xe Bồn Lớn, Tận Tâm, Điều Phối Nhanh` (58)
- **Title/H1 mới:** `Hút Bể Phốt Cẩm Phả – Xe Bồn Lớn, Điều Phối Tại Cẩm Phả Nhanh` (61)
- **Meta mới (150 ký tự):** `Hút bể phốt tại Cẩm Phả — xe bồn lớn vào ngõ nhỏ Cửa Ông, Mông Dương, báo giá trước khi làm, không phát sinh phụ phí. Gọi 0963.953.533 / 0931.156.756.`
- **H2 mới bổ sung:** `## Hút Bể Phốt Tại Cẩm Phả — Khu Vực Nào Xe Bồn Có Mặt Trước?`
- **FAQ mới:**
  - Hỏi: *Xe hút bể phốt tại Cẩm Phả có vào được khu Cửa Ông, Mông Dương không?* — Đáp: *Có. Xe bồn nhỏ và ống nối dài phục vụ cả khu dân cư trong ngõ tại Cửa Ông, Mông Dương, Cẩm Thủy, không chỉ khu trung tâm.*
  - Hỏi: *Hút bể phốt tại Cẩm Phả có báo giá trước không?* — Đáp: *Có, báo giá qua điện thoại dựa trên dung tích bể trước khi xe xuất phát. Nếu khối lượng bùn thực tế khác báo giá ban đầu, thợ báo lại tại chỗ trước khi tiếp tục, không tự ý thu thêm.*
- **Alt ảnh mới:**
  1. `Xe bồn hút bể phốt tại Cẩm Phả chuẩn bị vào khu Cửa Ông`

### 4.4 `/thong-tac-cong-ha-long/` — P1 (đang ổn CTR, nhưng Alt hoàn toàn thiếu "tại")

- **Title/H1 cũ:** `Thông Tắc Cống Hạ Long – Dịch Vụ, Thợ Điều Phối Nhanh` (53)
- **Title/H1 mới:** `Thông Tắc Cống Hạ Long – Thợ Điều Phối Có Mặt Tại Hạ Long Nhanh` (63)
- **Meta mới (152 ký tự):** `Thông tắc cống tại Hạ Long — thợ điều phối có mặt sau 20-30 phút khu Bãi Cháy, Hòn Gai, Hà Khẩu, máy lò xo công nghiệp, không đục phá. Gọi 0963.953.533.`
- **Alt ảnh cần sửa (5 ảnh đầu hiện KHÔNG có "tại" — đây là lỗi cụ thể, không phải chung chung):**
  - Cũ: `thông tắc cống Hạ Long bằng máy lò xo` → Mới: `Thông tắc cống tại Hạ Long bằng máy lò xo công nghiệp`
  - Cũ: `Thông tắc cống ngoài trời Hạ Long Quảng Ninh không đục phá` → Mới: `Thông tắc cống ngoài trời tại Hạ Long, không đục phá nền`
- **FAQ mới:** Hỏi: *Thông tắc cống tại Hạ Long mất bao lâu?* — Đáp: *Ca thường 30–45 phút với điểm tắc đơn giản. Điểm tắc sâu hoặc gãy đường ống cần khảo sát thêm bằng camera trước khi báo giá thời gian chính xác.*

### 4.5 `/thong-tac-cong-cam-pha/` — P1

- **Title/H1 mới:** `Thông Tắc Cống Cẩm Phả – Không Đục Phá, Đến Tận Nơi Tại Cẩm Phả` (63)
- **Meta mới (152 ký tự):** `Thông tắc cống tại Cẩm Phả — thợ đến tận nơi khu Cửa Ông, Mông Dương, Cẩm Thủy, xử lý nước trào và mùi hôi, báo giá rõ. Gọi 0963.953.533 / 0931.156.756.`

### 4.6 `/hut-be-phot-quang-ninh/` — P0 (653 impression, CTR 0,15% — mất traffic nhiều nhất)

- **Title/H1 mới:** `Hút Bể Phốt Quảng Ninh – Xe Bồn Có Mặt Tại Quảng Ninh 30 Phút` (61)
- **Meta mới (148 ký tự):** `Hút bể phốt tại Quảng Ninh — xe bồn lớn có mặt trong 30 phút khắp Hạ Long, Cẩm Phả, Uông Bí, báo giá trước khi hút. Gọi 0963.953.533 / 0931.156.756.`

### 4.7 `/hut-be-phot-uong-bi/` — P0 (CTR thấp nhất toàn site: 0,14% ở vị trí 6,0)

- **Title/H1 cũ:** `Hút bể phốt Uông Bí cho nhà trọ, khu dân cư, cơ sở kinh doanh` (61)
- **Title/H1 mới:** `Hút Bể Phốt Uông Bí – Xe Bồn Có Mặt Tại Uông Bí Trong 30 Phút` (61)
- **Meta mới (146 ký tự):** `Hút bể phốt tại Uông Bí — xe bồn điều phối theo khu vực Vàng Danh, Quang Trung, Yên Thanh, báo giá trước khi làm. Gọi 0963.953.533 / 0931.156.756.`

### 4.8 `/hut-be-phot-quang-yen/` — P1

- **Title/H1 mới:** `Hút Bể Phốt Quảng Yên – Xe Bồn Lớn, Có Mặt Tại Quảng Yên Nhanh` (62)
- **Meta mới (149 ký tự):** `Hút bể phốt tại Quảng Yên — xe bồn vào khu ven sông, khu công nghiệp Đông Mai, báo giá trước khi làm, không đục phá. Gọi 0963.953.533 / 0931.156.756.`

### 4.9 `/thong-tac-cong-quang-yen/` — P1

- **Title/H1 mới:** `Thông Tắc Cống Quảng Yên – Điều Phối Thợ Có Mặt Tại Quảng Yên` (61)
- **Meta mới (141 ký tự):** `Thông tắc cống tại Quảng Yên — thợ điều phối nhanh khu Hà An, Tiền An, Đông Mai, xử lý bùn cặn và nước trào. Gọi 0963.953.533 / 0931.156.756.`

### 4.10 Nhóm P2 — cùng mẫu sửa, áp dụng khi rảnh (Móng Cái, Đông Triều, Vân Đồn)

Áp dụng **đúng công thức trên** (giữ cụm gốc đầu Title/H1, thêm "Tại [Thành phố]" ở vế sau, meta có hotline + tên phường/xã cụ thể) cho:
`/thong-tac-cong-mong-cai/`, `/hut-be-phot-mong-cai/`, `/hut-be-phot-dong-trieu/`, `/thong-tac-cong-dong-trieu/`, `/hut-be-phot-van-don/`, `/thong-tac-cong-van-don/`. Chưa đưa nội dung viết sẵn ở đây vì **chưa có bằng chứng GSC** cho các cụm này (Giai đoạn 3.1 sẽ cho biết có cần ưu tiên gấp không).

### 4.11 Khoảng trống thật (Category A) — "hút hầm cầu tại X"

**Không tạo trang mới theo thành phố** (sẽ phá vỡ cấu trúc hiện có và có nguy cơ cannibalize với `hut-be-phot-*`, vì "hầm cầu" và "bể phốt" gần như cùng ý định tìm kiếm ở Quảng Ninh). Thay vào đó, bổ sung vào trang `/hut-ham-cau-quang-ninh/` hiện có:
- 1 H2 mới: `## Hút Hầm Cầu Tại Hạ Long, Cẩm Phả, Uông Bí — Xe Có Mặt Trong Bao Lâu?`
- Nội dung đoạn văn (viết sẵn, chèn ngay dưới H2 trên):
  > Xe hút hầm cầu điều phối theo khu vực: có mặt sau 20–30 phút tại nội thành Hạ Long và Cẩm Phả, sau 30–45 phút tại Uông Bí, Quảng Yên, Đông Triều. Hầm cầu và bể phốt dùng chung một loại xe bồn và quy trình khảo sát, nên báo giá và thời gian xử lý tương tự dịch vụ hút bể phốt tại từng khu vực.

### 4.12 Internal link — bảng anchor text cần sửa (đa dạng, không lặp)

| Trang nguồn | Trang đích | Anchor text mới |
|---|---|---|
| `/` (trang chủ) | `/hut-be-phot-ha-long/` | "hút bể phốt tại Hạ Long, có mặt sau 20-30 phút" |
| `/` (trang chủ) | `/hut-be-phot-cam-pha/` | "dịch vụ hút bể phốt tại Cẩm Phả" |
| `/` (trang chủ) | `/thong-tac-cong-quang-ninh/` | "thông tắc cống tại Quảng Ninh 20-30 phút có mặt" |
| `/bang-gia/` | `/thong-tac-cong-ha-long/` | "bảng giá thông tắc cống tại Hạ Long" |
| `/gia-hut-be-phot-quang-ninh/` | `/hut-be-phot-quang-ninh/` | "giá hút bể phốt tại Quảng Ninh mới nhất" |
| `/hut-be-phot-quang-ninh/` (hub tỉnh) | `/hut-be-phot-uong-bi/` | "xem thêm hút bể phốt tại Uông Bí" |
| `/hut-be-phot-quang-ninh/` (hub tỉnh) | `/hut-be-phot-quang-yen/` | "khu vực Quảng Yên xem tại đây" |
| `/thong-tac-cong-quang-ninh/` (hub tỉnh) | `/thong-tac-cong-ha-long/` | "thông tắc cống khu vực Hạ Long" |
| `/thong-tac-cong-quang-ninh/` (hub tỉnh) | `/thong-tac-cong-cam-pha/` | "xử lý cống tại Cẩm Phả xem chi tiết" |
| `/hut-ham-cau-quang-ninh/` | `/hut-be-phot-ha-long/` | "dịch vụ hút bể phốt cùng khu vực tại Hạ Long" |
| `/lien-he/` | `/hut-be-phot-uong-bi/` | "liên hệ đội hút bể phốt tại Uông Bí" |
| `/blog/` hoặc bài cẩm nang liên quan | `/thong-tac-cong-quang-yen/` | "thông tắc cống tại Quảng Yên — quy trình 5 bước" |

*Không xác nhận được đầy đủ tất cả anchor text HIỆN TẠI (thiếu dữ liệu, xem mục ⚠️ Giới hạn dữ liệu) — bảng trên là danh sách CẦN THÊM/SỬA dựa trên cấu trúc internal link đã biết từ `internalLinks` (outbound) của trang chủ và các hub trang tỉnh. Chạy `tools/tai-keyword-crawl-audit.mjs` để có danh sách đầy đủ anchor hiện tại trước khi sửa hàng loạt.*

### 4.13 Schema LocalBusiness — areaServed

⚠️ Quảng Ninh đã sáp nhập đơn vị hành chính cấp xã/phường năm 2025 — **tôi không có danh sách phường/xã MỚI đã xác minh** để đưa vào schema (tránh đoán sai gây sai lệch pháp lý địa danh trong schema). Danh sách dưới đây chỉ dùng **tên khu vực đã xuất hiện thật trong nội dung site hiện tại** (từ slug các trang con đã có), dùng tạm — bạn xác minh lại tên hành chính chính thức hiện hành tại cổng thông tin tỉnh Quảng Ninh trước khi đăng:

```json
"areaServed": [
  { "@type": "City", "name": "Hạ Long", "sameAs": "https://vi.wikipedia.org/wiki/H%E1%BA%A1_Long" },
  { "@type": "Place", "name": "Bãi Cháy, Hạ Long" },
  { "@type": "Place", "name": "Hồng Gai, Hạ Long" },
  { "@type": "Place", "name": "Hà Khẩu, Hạ Long" },
  { "@type": "Place", "name": "Cao Xanh, Hạ Long" },
  { "@type": "Place", "name": "Giếng Đáy, Hạ Long" },
  { "@type": "Place", "name": "Hùng Thắng, Hạ Long" },
  { "@type": "Place", "name": "Tuần Châu, Hạ Long" },
  { "@type": "City", "name": "Cẩm Phả" },
  { "@type": "Place", "name": "Cẩm Thủy, Cẩm Phả" },
  { "@type": "Place", "name": "Cẩm Trung, Cẩm Phả" },
  { "@type": "City", "name": "Uông Bí" },
  { "@type": "City", "name": "Móng Cái" },
  { "@type": "City", "name": "Quảng Yên" },
  { "@type": "City", "name": "Đông Triều" },
  { "@type": "City", "name": "Vân Đồn" }
]
```
Việc này cần dev đã xây plugin `ttcqn-home-emergency-renderer` (thấy trong đường dẫn ảnh của trang chủ) chỉnh trực tiếp trong code render schema — **không sửa được qua giao diện Rank Math thông thường** nếu schema LocalBusiness đang được render bằng plugin tuỳ biến này chứ không phải Rank Math Schema Generator. Kiểm tra trước: vào Rank Math → chỉnh sửa trang chủ → tab Schema → xem loại "Local Business" có sẵn field areaServed để điền tay không; nếu có, ưu tiên điền qua đó thay vì sửa code.

---

## GIAI ĐOẠN 5 — Lộ trình & checklist

### Việc tôi (Claude) đã làm bằng code trong nhánh `claude/keyword-ranking-tai-diagnosis-98yzvx`

| File | Nội dung |
|---|---|
| `bao-cao-tu-khoa-tai.md` | Báo cáo này |
| `tools/fix_tai_title_meta_batch1.mjs` | Script sửa Title (=H1) + Rank Math meta description + focus keyword cho 9 trang P0/P1 qua WP REST API — **chỉ sửa title/meta, KHÔNG đụng vào nội dung/H2/FAQ/block bên trong trang** để tránh rủi ro vỡ layout. Chạy `--dry` trước để xem trước, chạy thật để ghi. Tự backup title/content cũ vào `backups/fix-tai-batch1-<thời gian>/` trước khi ghi. |
| `tools/tai-keyword-crawl-audit.mjs` | Script crawl sống lấy anchor text + schema + body text đầy đủ (audit cũ thiếu) — chạy trên máy bạn vì sandbox bị WAF chặn |

**Việc này KHÔNG tự chạy được từ phiên làm việc hiện tại** vì file `D:/.thongtaccongquangninh/.env` chứa `WP_USERNAME`/`WP_APP_PASSWORD` chỉ có trên máy Windows của bạn, và site chặn IP sandbox bằng WAF. Bạn cần chạy 2 script trên từ máy có `.env` thật.

### Checklist theo mức ưu tiên

**P0 — sửa ngay, tác động lớn, rủi ro thấp (làm trong 24-48h)**
- [ ] Xác minh Googlebot có bị WAF OnePanel chặn không (Giai đoạn 3.3) — nếu có, đây là việc khẩn cấp nhất, trên cả các mục dưới.
- [ ] Chạy `node tools/fix_tai_title_meta_batch1.mjs --dry` để xem trước, rồi chạy thật cho 4 trang CTR nguy cấp nhất: `hut-be-phot-uong-bi` (CTR 0,14%), `hut-be-phot-quang-ninh` (CTR 0,15%, 653 impr), `hut-be-phot-cam-pha` (CTR 0%), `hut-be-phot-ha-long` (vị trí 23,8).
- [ ] Sửa 5 alt ảnh đầu của `/thong-tac-cong-ha-long/` (mục 4.4) — làm tay qua WordPress Media Library, vì script không đụng vào ảnh.
- [ ] Xuất GSC CSV theo Giai đoạn 3.1 để lưu **vị trí TRƯỚC khi sửa** làm mốc đối chiếu.

**P1 — trong tuần**
- [ ] Chạy batch title/meta còn lại (`thong-tac-cong-quang-ninh`, `thong-tac-cong-ha-long`, `thong-tac-cong-cam-pha`, `hut-be-phot-quang-yen`, `thong-tac-cong-quang-yen`).
- [ ] Thêm FAQ mới (mục 4.1-4.3) qua WordPress/Elementor — làm tay, vì FAQ nằm trong block content, script không tự sửa để tránh vỡ layout.
- [ ] Sửa 12 anchor text nội bộ (mục 4.12) — làm tay trong từng trang nguồn qua trình soạn thảo WordPress.
- [ ] Chạy `tools/tai-keyword-crawl-audit.mjs` trên máy bạn, gửi lại kết quả để tôi xác nhận lại phần anchor/schema.

**P2 — trong tháng**
- [ ] Áp dụng công thức Title/Meta cho nhóm Móng Cái/Đông Triều/Vân Đồn (mục 4.10) sau khi có GSC xác nhận mức ưu tiên thật.
- [ ] Bổ sung H2 + đoạn văn "hút hầm cầu tại X" vào `/hut-ham-cau-quang-ninh/` (mục 4.11).
- [ ] Kiểm tra khả năng điền `areaServed` qua Rank Math Schema Generator (mục 4.13); nếu không có field, làm việc với dev phụ trách plugin `ttcqn-home-emergency-renderer`.
- [ ] Theo dõi các URL `NEUTRAL — Discovered currently not indexed` phát hiện ở mục 1.3 (ngoài phạm vi từ khóa "tại" nhưng cùng nhóm rủi ro kỹ thuật).

### Mốc thời gian dự kiến thấy kết quả & cách đo

- **CTR** (do sửa Title/Meta): thường thấy thay đổi rõ trong **7-14 ngày** sau khi Google crawl lại và cập nhật snippet hiển thị — nhanh hơn thay đổi vị trí.
- **Vị trí xếp hạng**: cần **2-4 tuần** để ổn định sau khi Google đánh giá lại tín hiệu on-page mới, đúng như khung thời gian bạn đã đề ra.
- **Cách đo, bắt buộc làm TRƯỚC khi sửa bất kỳ trang nào ở trên**: xuất GSC CSV (Giai đoạn 3.1) lưu lại làm "ảnh chụp trước" (`before-fix-<ngày>.csv`), rồi lặp lại đúng bộ lọc đó sau 2 tuần và 4 tuần, so sánh Position + CTR + Impression cho từng truy vấn trong bảng Giai đoạn 1.2 — không so sánh tổng site (tổng site bị nhiễu bởi các từ khóa khác không liên quan đến đợt sửa này).
