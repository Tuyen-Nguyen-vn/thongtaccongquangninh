# Prompt cho Claude Code CLI — Tối ưu website để xuất hiện trong câu trả lời AI (GEO/AEO)

> Copy toàn bộ nội dung dưới đây và dán vào một phiên `claude` mới, chạy từ
> thư mục gốc dự án `D:\.thongtaccongquangninh` (hoặc worktree tương ứng).
> Mục tiêu: không chỉ SEO cho Google truyền thống, mà tối ưu để ChatGPT,
> Gemini, Perplexity, Copilot, AI Overviews của Google... **trích dẫn hoặc
> giới thiệu trực tiếp** website này khi người dùng hỏi về dịch vụ hút bể
> phốt / thông tắc cống / nạo vét hố ga tại Quảng Ninh.

---

## PROMPT (bắt đầu từ đây)

Bạn là chuyên gia AI Search Optimization (GEO — Generative Engine
Optimization / AEO — Answer Engine Optimization) cho website
`thongtaccongquangninh.com` — dịch vụ hút bể phốt, thông tắc cống, thông
tắc bồn cầu, nạo vét hố ga, xử lý mùi hôi tại Quảng Ninh (Hạ Long, Cẩm
Phả, Uông Bí, Quảng Yên, Đông Triều, Móng Cái, Vân Đồn...). Đơn vị: Môi
Trường Đô Thị Số 1 Quảng Ninh, hotline 0963.953.533 / 0931.156.756, giờ
tiếp nhận 05:00–22:00 hằng ngày.

Nhiệm vụ của bạn gồm 4 giai đoạn, làm tuần tự, xác nhận kết quả từng
giai đoạn trước khi sang giai đoạn tiếp theo.

### Giai đoạn 1 — Kiểm tra khả năng AI crawl được site

1. Lấy `https://thongtaccongquangninh.com/robots.txt`, kiểm tra các bot AI
   sau có bị chặn không: `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`,
   `ClaudeBot`, `Claude-Web`, `anthropic-ai`, `PerplexityBot`, `CCBot`,
   `Google-Extended`, `Applebot-Extended`, `Bingbot`.
2. Kiểm tra site có file `/llms.txt` chưa (chuẩn mới nhiều AI agent đang
   dùng để hiểu nhanh cấu trúc site). Nếu chưa có, sẽ tạo ở Giai đoạn 3.
3. Báo cáo: bot nào đang bị chặn (nếu có), có cần mở không.

### Giai đoạn 2 — Nghiên cứu câu truy vấn AI thực tế (không phải từ khoá Google truyền thống)

Đây là điểm khác biệt quan trọng nhất: người dùng hỏi AI bằng **câu hỏi
tự nhiên, đầy đủ ngữ cảnh**, khác hẳn cách gõ từ khoá vào Google. Ví dụ
khác biệt:
- Kiểu Google: "hút bể phốt Hạ Long giá"
- Kiểu hỏi AI: "tôi ở Hạ Long, bể phốt nhà tôi có mùi hôi và bồn cầu rút
  chậm mấy hôm nay, có phải bể đầy không và nên gọi ai xử lý, chi phí
  khoảng bao nhiêu?"

Hãy tạo ra **tối thiểu 60 câu truy vấn kiểu hỏi-AI** (không phải từ khoá
ngắn), chia theo các nhóm:
1. **Chẩn đoán triệu chứng** (15 câu): mô tả hiện tượng cụ thể (mùi hôi,
   rút chậm, trào ngược, tiếng ục ục...) và hỏi nguyên nhân + có cần gọi
   thợ không.
2. **So sánh & quyết định** (10 câu): "có nên tự xử lý bằng hoá chất hay
   gọi thợ", "hút bể phốt khác nạo vét hố ga thế nào", "bao lâu thì nên
   hút bể phốt định kỳ".
3. **Giá cả & minh bạch** (10 câu): "hút bể phốt có bị chặt chém không",
   "giá hút bể phốt Quảng Ninh tính theo gì", "làm sao biết báo giá có
   hợp lý không".
4. **Theo địa điểm cụ thể** (15 câu): lặp lại một số câu ở nhóm 1-2 nhưng
   gắn với từng thành phố (Hạ Long, Cẩm Phả, Uông Bí, Quảng Yên, Móng
   Cái, Vân Đồn, Đông Triều) và loại hình (nhà dân, nhà trọ, khách sạn,
   nhà hàng, chung cư).
5. **Khẩn cấp / ngoài giờ** (10 câu): "nửa đêm bồn cầu trào ngược phải
   làm sao", "có dịch vụ hút bể phốt ban đêm không", "gọi thợ dịp Tết
   được không".

Với MỖI câu, ghi rõ:
- Câu hỏi đầy đủ (viết như người dùng thật hỏi AI, có thể hơi dài dòng,
  có ngữ cảnh).
- Trang hiện có trên site trả lời được câu này chưa (tra trong
  `reports/tai-keyword-crawl-*.json` hoặc gọi `wp-json/wp/v2/posts` +
  `/pages` để tìm theo slug/nội dung gần đúng).
- Nếu CÓ trang phù hợp: URL cụ thể.
- Nếu CHƯA có: đề xuất trang nào nên bổ sung 1 đoạn FAQ trả lời câu này,
  hoặc có cần bài viết mới không (ưu tiên bổ sung vào trang có sẵn hơn là
  tạo trang mới, để tránh thêm vào tình trạng ăn thịt từ khoá đã biết —
  xem `reports/website-audit-master-2026-09-13.md` mục 2 và
  `reports/phan-tich-tai-*.md`).

Xuất kết quả giai đoạn này ra `reports/ai-search-queries-<ngày>.md`
dạng bảng.

### Giai đoạn 3 — Tối ưu on-page để AI trích dẫn được

Cho mỗi câu ở Giai đoạn 2 đã có trang trả lời nhưng CHƯA tối ưu tốt cho
AI, hoặc trang cần bổ sung, áp dụng các nguyên tắc sau (đây là cách AI
Overviews/ChatGPT/Perplexity chọn nguồn trích dẫn):

1. **Câu trả lời trực tiếp, ngắn, đứng ngay đầu đoạn** — 1-2 câu đầu tiên
   của mỗi mục FAQ/H2 phải trả lời thẳng câu hỏi, không mào đầu dài dòng.
   AI thường trích nguyên câu đầu tiên.
2. **Giữ đúng format Q&A đã có** (`<h3>Câu hỏi?</h3><p>Trả lời...</p>` +
   `FAQPage` JSON-LD) — site đã dùng pattern này nhất quán, tiếp tục theo
   đúng mẫu, không đổi cấu trúc.
3. **Số liệu cụ thể, có thể trích dẫn được**: thay vì "giá rẻ", ghi rõ
   khoảng giá tham khảo (đã có ở nhiều trang, xem mẫu bảng giá hiện có).
   Không bịa số liệu không có căn cứ — chỉ dùng số đã xác nhận trong nội
   dung site hoặc hỏi lại nếu cần số mới.
4. **Trả lời được cả câu hỏi phủ định/so sánh** ("có nên tự xử lý không",
   "khác gì với...") — AI hay được hỏi dạng so sánh, cần có đoạn so sánh
   rõ ràng thay vì chỉ mô tả một chiều.
5. **Nhất quán NAP** (tên đơn vị, hotline, giờ làm việc) ở mọi đoạn được
   AI có khả năng trích riêng lẻ — không phụ thuộc người đọc phải cuộn
   xuống cuối bài mới thấy thông tin liên hệ.
6. **Không nhồi từ khoá** trong các đoạn mới viết — đây chính là lỗi đã
   phát hiện và đang sửa dần ở 36 trang khác (xem
   `tools/destuff_*.mjs` làm mẫu cách viết tự nhiên).

Cách triển khai: viết script Node theo đúng mẫu đã dùng trong dự án
(`tools/fix_missing_h2_batch_2026_09_13.mjs`, `tools/destuff_378_2026_09_14.mjs`)
— đọc `.env` lấy `WP_USERNAME`/`WP_APP_PASSWORD`, gọi
`GET /wp-json/wp/v2/{posts|pages}/{id}?context=edit` lấy `content.raw`,
sửa bằng cách thay thế chuỗi chính xác (không dùng regex mù), backup vào
`backups/`, rồi `POST` cập nhật. Luôn `--dry` trước, xác nhận số lần khớp
đúng dự kiến rồi mới ghi thật.

**Quan trọng**: nếu phát hiện nội dung DB đầy đủ nhưng hiển thị rỗng trên
live site (giống lỗi đã gặp), đừng viết lại nội dung — kiểm tra trước
bằng cách so `content.raw` (REST API) với HTML live thật
(`curl` trang đó và tìm trong `<div class="entry-content">`). Nếu là lỗi
render, xem `GET /wp-json/` để tìm route `code-snippets/v1/snippets`
tương tự cách đã sửa ở commit `4caff0f` — không cần SSH.

### Giai đoạn 4 — Hạ tầng kỹ thuật cho AI crawler

1. Tạo file `llms.txt` ở gốc site (`public_html/llms.txt` qua REST API
   nếu có route ghi file, hoặc qua 1Panel file manager — **thao tác cẩn
   thận, xem cảnh báo về file manager hay treo trong lịch sử dự án**).
   Nội dung: tên đơn vị, mô tả dịch vụ 1 dòng, danh sách URL chính theo
   dịch vụ và khu vực, NAP, link `sitemap.xml`.
2. Nếu robots.txt đang chặn bot AI nào ở Giai đoạn 1 mà không có lý do
   bảo mật rõ ràng, đề xuất mở (không tự sửa `robots.txt`/file server nếu
   không chắc — việc sửa file cấu hình từng bị chặn bởi bộ lọc an toàn,
   xin phép trước khi làm).
3. Kiểm tra `Organization`/`LocalBusiness` schema đã có `sameAs`,
   `areaServed`, số điện thoại chuẩn E.164 chưa (AI dùng schema để xác
   thực thực thể trước khi trích dẫn).

### Báo cáo cuối

Viết `reports/ai-search-optimization-<ngày>.md` tổng hợp:
- Danh sách 60+ câu hỏi AI đã nghiên cứu + trạng thái (đã trả lời được /
  đã bổ sung / còn thiếu).
- Danh sách trang đã sửa, kèm before/after (số câu trả lời trực tiếp,
  có FAQPage schema hay chưa).
- Trạng thái robots.txt / llms.txt.
- Việc còn tồn đọng cần người thật quyết định (vd: có nên viết bài mới
  hẳn cho một nhóm câu hỏi lớn chưa được phủ, việc này tốn công hơn chỉ
  bổ sung FAQ).

Không tự ý tạo trang mới hàng loạt — ưu tiên bổ sung vào trang sẵn có.
Nếu thấy cần trang mới, liệt kê đề xuất và hỏi trước khi tạo, vì site
đang có vấn đề ăn thịt từ khoá do tạo trang mới không kiểm soát (xem
lịch sử: batch "cẩm nang tại `<city>`" đăng 06/09/2026 từng gây ra 9 cặp
ăn thịt từ khoá).

## PROMPT (kết thúc)

---

## Ghi chú khi dùng prompt này

- Prompt trên giả định chạy trong đúng repo này (`D:\.thongtaccongquangninh`),
  có `.env` chứa `WP_USERNAME`/`WP_APP_PASSWORD`/`WP_BASE_URL` sẵn.
- Nếu muốn giới hạn phạm vi (vd chỉ làm Giai đoạn 1-2, chưa cho sửa live
  site), xoá phần "Giai đoạn 3" và "Giai đoạn 4", hoặc thêm dòng "Chỉ làm
  đến hết Giai đoạn 2, dừng lại xin xác nhận trước khi sửa bất kỳ trang
  nào" vào cuối prompt trước khi chạy.
- Có thể chạy nhiều lần, mỗi lần giới hạn Giai đoạn 2 vào 1 nhóm câu hỏi
  (vd chỉ nhóm "Khẩn cấp / ngoài giờ") để dễ review từng phần thay vì làm
  hết 60 câu một lượt.
