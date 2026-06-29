# Audit nội dung SEO Cẩm nang - 2026-05-23

Thời gian kiểm: 2026-05-23 00:27 +07

## Phạm vi

- Corpus kiểm: 23 post public đang đi vào luồng `/blog/` qua WordPress REST.
- Kiểm thêm section `CẨM NANG THÔNG MINH` trên trang chủ bằng URL public có `?nowprocket=1` và cache-buster.
- Đối chiếu báo cáo ảnh/schema gần nhất:
  - `reports/handbook-image-completion-2026-05-23.md`
  - `reports/handbook-image-current-audit-2026-05-22.json`
  - `reports/post-schema-standardization-2026-05-22.md`
  - `reports/post-faq-completion-2026-05-22.md`
- Lượt này là audit read-only cho nội dung hiện tại. Không sửa live hàng loạt bài viết.

## Kết luận nhanh

Đã kiểm hết 23 bài Cẩm nang. Lớp kỹ thuật ảnh/schema đã ổn hơn trước: 23/23 bài đã có featured image, tối thiểu 3 ảnh nội dung, `BlogPosting` và `FAQPage` theo các report follow-up ngày 2026-05-22 đến 2026-05-23.

Nhưng nhóm Cẩm nang chưa đạt chất lượng nội dung/UX archive. Sau lượt audit sâu, cần nâng mức ưu tiên vì có lỗi **rò ghi chú nội bộ ra bài public**:

- `thong-tac-cong-gieng-day-2` còn đoạn nghiệm thu ảnh: `Trạng thái nghiệm thu PENDING_IMAGE_SEO` và câu `Chưa được publish...`.
- `thong-tac-cong-tuan-chau` còn đoạn nghiệm thu ảnh cùng kiểu trên.
- `thong-tac-cong-cao-xanh-2` còn cụm `Checklist Rank Math tự chấm` và dòng `Điểm Rank Math ước tính: 100/100`.

Ngoài lỗi P0 trên, nhóm Cẩm nang còn 4 vấn đề lớn:

1. Ảnh card trang chủ bị giống nhau theo cụm:
   - 4/6 card mới nhất cùng ảnh `service-thong-tac-cong-quang-ninh-may-chuyen-dung`.
   - 2/6 card còn lại cùng ảnh `service-hut-be-phot-quang-ninh-xe-bon-chuyen-dung`.
   - Toàn corpus có 7 bài dùng featured media `2196` và 7 bài dùng featured media `2197`.
2. Intent Cẩm nang đang lẫn landing dịch vụ địa phương:
   - 11/23 post là landing/local service style, không phải bài hướng dẫn thuần.
   - 6 card trang chủ hiện kéo 4 bài thông tắc cống phường và 2 bài hút bể phốt huyện vì query lấy bài mới.
3. Văn bản từng còn dấu xuất bản từ Markdown trước follow-up:
   - 16/23 post có raw Markdown H1 dạng `# ...` trong content ở lượt audit gốc; sau batch fix artifact ngày 2026-05-23, REST scan corpus 23 post đã về 0.
   - 3 post còn escaped `<strong>` hiển thị như văn bản trong lead.
   - `thong-tac-cong-cao-xanh-2` còn raw Markdown image syntax ở đầu bài.
   - `thong-tac-cong-bai-chay` còn anchor fragment `{#...}` và dấu check emoji trong heading content.
4. Nội dung còn template/reuse:
   - 9 landing địa phương còn heading `Case study E-E-A-T`; một bài còn dùng `Case study thực tế` nhưng chưa thấy bằng chứng xác minh trong audit này.
   - 6 bài hút bể phốt huyện mới chia sẻ nhiều câu giống nguyên văn.
   - 6 bài informational cũ chia sẻ cụm block cuối kiểu `Phần kiểm tra chuyên sâu`, `Bảng quyết định nhanh`, `Checklist an toàn`.

## Cách audit sâu

### Lớp 1 - Technical/live

- Fetch 23 post public qua WordPress REST.
- Fetch public HTML từng URL với `?nowprocket=1&codex=deep-metrics-20260523`.
- Kiểm HTTP render, `<title>`, meta description, canonical, H1, H2, ảnh trong `post_content`, internal link, featured media và JSON-LD type.
- Kiểm riêng redirect `chi-phi-hut-be-phot-quang-ninh` -> page đích `chi-phi-hut-be-phot-quang-ninh-2`.

### Lớp 2 - Text hygiene

- Quét raw Markdown và dấu xuất bản lỗi:
  - `# H1` trong paragraph/content.
  - `![markdown image](...)`.
  - `{#anchor}`.
  - escaped `&lt;strong&gt;`.
  - emoji còn trong heading.
- Quét nhãn nội bộ/rò workflow:
  - `Rank Math`.
  - `Focus keyword`, `Meta Description`, `SEO Title`.
  - `PENDING_IMAGE_SEO`, `package ảnh SEO`, `Chưa được publish`.

### Lớp 3 - Content quality

- Đọc mở bài, đoạn cuối, heading đầu và link nội bộ từng bài.
- Tách intent:
  - bài hướng dẫn/FAQ/bảng giá;
  - bài landing dịch vụ địa phương đang nằm trong luồng Cẩm nang.
- Quét câu lặp và 8-gram sau khi chuẩn hóa địa danh để phát hiện lõi template.
- Flag claim cần kiểm chứng khi nội dung dùng số liệu/case/bảo hành/phí/điều phối đảo cụ thể.

## Điểm theo nhóm tiêu chí

| Nhóm kiểm | Kết quả | Đánh giá |
|---|---:|---|
| Post Cẩm nang đã kiểm | 23 | Đủ phạm vi |
| Featured image sau fix ảnh | 23/23 | Đạt kỹ thuật |
| Ảnh nội dung tối thiểu 3 | 23/23 | Đạt kỹ thuật |
| `BlogPosting` + `FAQPage` sau follow-up | 23/23 | Đạt schema hiện tại |
| Card trang chủ có ảnh unique | 0/6 theo card mới nhất | Chưa đạt UX/CTR |
| Post có raw Markdown H1 | 16/23 trước fix -> 0/23 sau follow-up | Đã sửa artifact |
| Post có 0 internal link trong content rendered | 13/23 | Phải tối ưu SEO |
| Local landing đang nằm trong luồng Cẩm nang | 11/23 | Phải tách intent |
| Featured media reuse group lớn | 2 nhóm x 7 bài | Phải làm biến thể/ảnh riêng |
| Post rò ghi chú nội bộ SEO/publish | 3/23 | P0 |
| Post có claim/case cần kiểm chứng thêm | 11+ | Review trước khi giữ claim mạnh |

## Ma trận định lượng 23 bài

Ký hiệu:

- `B/F`: live có `BlogPosting` / `FAQPage`.
- `canonical=check`: canonical không khớp link post đang audit, cần xem redirect/page đích.
- `artifact`: dấu text/render lỗi quét thấy trong content.

| Slug | Words | Title | Meta | H2 | Img | Internal | Featured | Canonical | Schema | Artifact |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| `thong-tac-cong-gieng-day-2` | 2712 | 62 | 152 | 13 | 3 | 6 | `2196` | self | B/F | `raw#`, `escaped-strong`, publish note |
| `thong-tac-cong-cao-xanh-2` | 2909 | 65 | 156 | 14 | 3 | 7 | `2196` | self | B/F | `raw#`, markdown image, escaped strong, Rank Math note |
| `thong-tac-cong-bai-chay` | 2190 | 70 | 158 | 12 | 3 | 7 | `2196` | self | B/F | `raw#`, `{#anchor}`, emoji |
| `thong-tac-cong-hong-gai-2` | 1753 | 68 | 151 | 10 | 3 | 0 | `2196` | self | B/F | `raw#` |
| `hut-be-phot-tien-yen-2` | 2845 | 65 | 150 | 14 | 3 | 4 | `2197` | self | B/F | `raw#`, case template |
| `hut-be-phot-hai-ha-2` | 2693 | 67 | 153 | 15 | 3 | 4 | `2197` | self | B/F | `raw#`, case template |
| `hut-be-phot-dam-ha-2` | 2625 | 70 | 156 | 15 | 3 | 4 | `2197` | self | B/F | `raw#`, case template |
| `hut-be-phot-co-to-2` | 2828 | 64 | 152 | 14 | 3 | 4 | `2197` | self | B/F | `raw#`, case template |
| `hut-be-phot-binh-lieu-2` | 2573 | 66 | 159 | 15 | 3 | 4 | `2197` | self | B/F | `raw#`, case template |
| `hut-be-phot-ba-che-2` | 2639 | 64 | 158 | 15 | 3 | 4 | `2197` | self | B/F | `raw#`, case template |
| `mui-hoi-cong-nguyen-nhan-xu-ly-4` | 1186 | 53 | 147 | 5 | 3 | 0 | `2200` | self | B/F | `raw#` |
| `hoa-chat-tu-thong-cong-3` | 1302 | 65 | 157 | 7 | 3 | 0 | `2196` | self | B/F | `raw#`, từ cấm |
| `chu-ky-hut-be-phot-3` | 1103 | 59 | 164 | 9 | 3 | 0 | `2197` | self | B/F | `raw#`, meta dài |
| `bon-cau-rut-cham-nguyen-nhan-3` | 1159 | 62 | 157 | 5 | 3 | 0 | `2198` | self | B/F | `raw#` |
| `thong-tac-cong-tuan-chau` | 3049 | 62 | 154 | 13 | 3 | 6 | `2196` | self | B/F | `raw#`, escaped strong, publish note |
| `chi-phi-hut-be-phot-quang-ninh` | 967 | 69 | 160 | 6 | 3 | 0 | `2100` | check | B/F | `raw#`, redirect source |
| `cau-hoi-thuong-gap-thong-tac-cong` | 2971 | 61 | 155 | 19 | 5 | 0 | `2196` | self | B/F | không lỗi artifact chính |
| `xu-ly-mui-hoi-nha-ve-sinh` | 1023 | 63 | 155 | 13 | 3 | 0 | `2200` | self | B/F | block cuối trùng |
| `nao-vet-ho-ga` | 1054 | 62 | 154 | 14 | 3 | 0 | `2199` | self | B/F | block cuối trùng |
| `thong-tac-bon-cau-bi-tac` | 1042 | 64 | 154 | 12 | 3 | 0 | `2198` | self | B/F | block cuối trùng |
| `bang-gia-hut-be-phot-quang-ninh-2026` | 1081 | 56 | 155 | 14 | 3 | 0 | `352` | self | B/F | block cuối trùng, title ngắn |
| `cach-xu-ly-cong-thoat-nuoc-tac` | 1156 | 70 | 155 | 12 | 3 | 0 | `348` | self | B/F | block cuối trùng |
| `dau-hieu-be-phot-can-hut` | 1130 | 55 | 155 | 13 | 3 | 0 | `352` | self | B/F | block cuối trùng, title ngắn |

## Lỗi P0 đang lộ ra bài public

| Slug | Bằng chứng live trong content | Rủi ro |
|---|---|---|
| `thong-tac-cong-gieng-day-2` | Có đoạn `PENDING_IMAGE_SEO`, `Chưa được publish...`, nhắc package ảnh SEO. | Người đọc thấy quy trình nội bộ; bài public bị mất độ tin cậy. |
| `thong-tac-cong-cao-xanh-2` | Có `Checklist Rank Math tự chấm`, `SEO Title`, `Focus keyword`, `Điểm Rank Math ước tính: 100/100`. | Nội dung bị lộ nhãn SEO; nhìn như draft chưa biên tập. |
| `thong-tac-cong-tuan-chau` | Có đoạn `PENDING_IMAGE_SEO`, `Chưa được publish...`, nhắc package ảnh SEO. | Lỗi biên tập public, cần gỡ trước các tối ưu khác. |

## Follow-up fix P0 - 2026-05-23 00:54 +07

Đã sửa live đúng 3 bài P0:

- `thong-tac-cong-gieng-day-2`: gỡ raw Markdown H1, escaped `<strong>`, escaped JSON-LD text, đoạn chờ package ảnh SEO và section nghiệm thu nội bộ.
- `thong-tac-cong-cao-xanh-2`: gỡ 5 paragraph Markdown image lỗi, cụm gợi ý ảnh/link công khai, checklist Rank Math tự chấm và escaped JSON-LD text.
- `thong-tac-cong-tuan-chau`: gỡ raw Markdown H1, escaped `<strong>`, escaped JSON-LD text, đoạn chờ package ảnh SEO và section nghiệm thu nội bộ.

Bằng chứng vận hành:

- Backup gốc trước sửa nằm tại `backups/handbook-p0-text-leaks-before-2026-05-23/`.
- Script fix có guard chống lưu content ngắn bất thường: `tools/fix_handbook_p0_text_leaks_2026_05_23.mjs`.
- Trong lượt đầu, Giếng Đáy và Tuần Châu bị content rỗng do rule cắt quá rộng; đã restore ngay từ backup bằng `tools/restore_handbook_p0_empty_posts_2026_05_23.mjs` trước khi chạy lại fix có guard.
- REST sau sửa: 3/3 bài không còn `PENDING_IMAGE_SEO`, `Chưa được publish`, `package ảnh SEO`, checklist/điểm Rank Math, raw Markdown image, raw Markdown H1 hoặc escaped `<strong>`.
- Public HTML với `?nowprocket=1&codex=handbook-p0-20260523`: 3/3 URL HTTP 200, mỗi trang 1 H1, vẫn có `BlogPosting` + `FAQPage`, JSON-LD parse error = 0.
- `python3 tools/audit_unique_wp_images.py --no-hash`: `pagesWithIssues=0`, `samePageDuplicatePages=0`, `pagesUnderThreeImages=0`.

## Follow-up fix artifact render - 2026-05-23 01:14 +07

Đã sửa batch artifact còn lại của Cẩm nang:

- 13 post public/source post đã gỡ raw H1 dạng `<p># ...</p>`.
- Bài `thong-tac-cong-bai-chay` đã chuyển `{#anchor}` trong heading thành `id` sạch và bỏ dấu check trong 3 H3.
- Redirect chi phí đã xử lý đủ 2 lớp:
  - post nguồn `chi-phi-hut-be-phot-quang-ninh`;
  - page đích ID `2025` slug `chi-phi-hut-be-phot-quang-ninh-2`.

Bằng chứng vận hành:

- Backup batch nằm tại `backups/handbook-render-artifacts-before-2026-05-23/`.
- Script fix có guard độ dài nội dung và hỗ trợ cả `posts`/`pages`: `tools/fix_handbook_render_artifacts_2026_05_23.mjs`.
- REST scan lại corpus 23 post Cẩm nang: `badCount=0` cho raw Markdown H1, visible `{#anchor}` và check emoji trong heading.
- Public HTML batch với `?nowprocket=1&codex=handbook-artifact-20260523`: 12 URL direct post sạch artifact, HTTP 200, mỗi trang 1 H1, `BlogPosting` + `FAQPage`, JSON-LD parse error = 0.
- Public HTML redirect chi phí sau fix cuối: URL nguồn vẫn redirect sang page đích, cả URL nguồn và page đích đều sạch raw H1/anchor/check emoji, vẫn có `BlogPosting` + `FAQPage`, JSON-LD parse error = 0.
- `python3 tools/audit_unique_wp_images.py --no-hash`: `pagesWithIssues=0`, `samePageDuplicatePages=0`, `pagesUnderThreeImages=0`.

## Độ tự nhiên câu chữ theo cụm

### Cụm A - Landing địa phương đang chen vào Cẩm nang

Nhóm:

- `thong-tac-cong-gieng-day-2`
- `thong-tac-cong-cao-xanh-2`
- `thong-tac-cong-bai-chay`
- `thong-tac-cong-hong-gai-2`
- `thong-tac-cong-tuan-chau`
- `hut-be-phot-tien-yen-2`
- `hut-be-phot-hai-ha-2`
- `hut-be-phot-dam-ha-2`
- `hut-be-phot-co-to-2`
- `hut-be-phot-binh-lieu-2`
- `hut-be-phot-ba-che-2`

Đánh giá:

- Mở bài phần lớn có bối cảnh địa phương, có ý bán hàng và đủ CTA.
- Nhưng cấu trúc quá gần landing chuyển đổi: `Tại sao chọn`, `Cam kết 3 Không`, `Bảng giá`, `Quy trình 5 bước`, `Case study`, `Khu vực phục vụ`.
- Khi section trang chủ gọi là `Cẩm nang` và CTA là xem hướng dẫn, việc kéo toàn bộ nhóm này lên trước làm intent người dùng bị lệch.
- Nhóm hút bể phốt huyện còn chia sẻ nhiều câu điều phối và cảnh báo giống nguyên văn; ví dụ scan câu lặp cho thấy cùng một câu xuất hiện ở cả 6 bài như câu yêu cầu nói rõ đường xe vào, vị trí bể và câu dặn không xả nước nhiều khi bể đầy nặng.

### Cụm B - Bài informational mới, viết gần người đọc hơn

Nhóm:

- `mui-hoi-cong-nguyen-nhan-xu-ly-4`
- `hoa-chat-tu-thong-cong-3`
- `chu-ky-hut-be-phot-3`
- `bon-cau-rut-cham-nguyen-nhan-3`
- `chi-phi-hut-be-phot-quang-ninh`

Đánh giá:

- Intent rõ hơn Cẩm nang: giải thích nguyên nhân, tự xử lý, chu kỳ, chi phí.
- Mở bài nhìn tự nhiên hơn nhóm landing.
- Raw Markdown H1 đã được làm sạch ở follow-up artifact; phần còn lại là thiếu internal link và một số title/meta chưa đều theo chuẩn nội bộ.
- `hoa-chat-tu-thong-cong-3` cần sửa ngay từ cấm và tăng cảnh báo an toàn/điểm dẫn về dịch vụ.

### Cụm C - Bài informational cũ đã có lead tốt nhưng dùng lõi block cuối lặp

Nhóm:

- `xu-ly-mui-hoi-nha-ve-sinh`
- `nao-vet-ho-ga`
- `thong-tac-bon-cau-bi-tac`
- `bang-gia-hut-be-phot-quang-ninh-2026`
- `cach-xu-ly-cong-thoat-nuoc-tac`
- `dau-hieu-be-phot-can-hut`

Đánh giá:

- 2 câu đầu thường trả lời thẳng vấn đề và dễ đọc.
- Tuy nhiên scan 8-gram cho thấy nhóm này trùng rất cao ở block cuối. Cặp cao nhất trong nhóm đạt khoảng `0.484` theo tập 8-gram chuẩn hóa.
- Câu cuối lặp rõ: `Trước khi gọi thợ, nên chuẩn bị địa chỉ, ảnh hiện trường, thời điểm bắt đầu...`.
- Nhóm này cần viết lại block chốt riêng theo chủ đề, không chỉ đổi tiêu đề.

## Top cặp trùng nội dung cần xử lý

Tỷ lệ dưới đây là Jaccard tương đối theo tập 8-gram chuẩn hóa; dùng để xếp ưu tiên review, không thay cho công cụ plagiarism bên ngoài.

| Cặp bài | Tỷ lệ |
|---|---:|
| `thong-tac-cong-cao-xanh-2` ↔ `thong-tac-cong-bai-chay` | 0.510 |
| `xu-ly-mui-hoi-nha-ve-sinh` ↔ `nao-vet-ho-ga` | 0.484 |
| `xu-ly-mui-hoi-nha-ve-sinh` ↔ `bang-gia-hut-be-phot-quang-ninh-2026` | 0.484 |
| `nao-vet-ho-ga` ↔ `bang-gia-hut-be-phot-quang-ninh-2026` | 0.468 |
| `hut-be-phot-binh-lieu-2` ↔ `hut-be-phot-ba-che-2` | 0.364 |
| `hut-be-phot-hai-ha-2` ↔ `hut-be-phot-dam-ha-2` | 0.336 |
| `hut-be-phot-tien-yen-2` ↔ `hut-be-phot-binh-lieu-2` | 0.319 |

## Claim/case cần kiểm chứng trước khi giữ nguyên

Không kết luận claim sai trong lượt audit này, nhưng các cụm dưới đây không nên giữ dưới nhãn `case thực tế` nếu chưa có bằng chứng nội bộ:

- Bảo hành `12 tháng` trên bài thông tắc cống địa phương.
- Case có số phòng, số học sinh, thể tích bể, thời gian thi công cụ thể ở nhóm huyện.
- `Cô Tô`: claim xe/bùn điều phối theo chuyến tàu, chở về trạm xử lý đúng quy định, không xả ra biển.
- Phí di chuyển và mức giá phụ thu cụ thể ở một số huyện vùng xa.

Nếu không có ảnh, hóa đơn, nhật ký ca hoặc xác nhận của Tuyền, đổi nhãn sang `Tình huống thường gặp` và giảm số liệu quá cụ thể.

## Bằng chứng ảnh card giống nhau

Section Cẩm nang trang chủ đang render 6 card mới nhất:

| Card | Slug | Ảnh card live |
|---|---|---|
| 1 | `thong-tac-cong-gieng-day-2` | `service-thong-tac-cong-quang-ninh-may-chuyen-dung-768x768.webp` |
| 2 | `thong-tac-cong-cao-xanh-2` | `service-thong-tac-cong-quang-ninh-may-chuyen-dung-768x768.webp` |
| 3 | `thong-tac-cong-bai-chay` | `service-thong-tac-cong-quang-ninh-may-chuyen-dung-768x768.webp` |
| 4 | `thong-tac-cong-hong-gai-2` | `service-thong-tac-cong-quang-ninh-may-chuyen-dung-768x768.webp` |
| 5 | `hut-be-phot-tien-yen-2` | `service-hut-be-phot-quang-ninh-xe-bon-chuyen-dung-768x768.webp` |
| 6 | `hut-be-phot-hai-ha-2` | `service-hut-be-phot-quang-ninh-xe-bon-chuyen-dung-768x768.webp` |

Featured media reuse toàn corpus:

| Media ID | Số bài | Nhóm bài |
|---|---:|---|
| `2196` | 7 | Thông tắc cống + FAQ tổng hợp |
| `2197` | 7 | Hút bể phốt huyện + chu kỳ hút |
| `2200` | 2 | Mùi hôi |
| `2198` | 2 | Bồn cầu |
| `352` | 2 | Bể phốt informational cũ |

Kết luận: ảnh không còn vỡ, nhưng card trang chủ nhìn lặp rõ vì bài mới đang dùng chung featured image theo loại dịch vụ.

## Audit từng bài

| # | Slug | Trạng thái | Vấn đề chính | Phương án xử lý |
|---|---|---|---|---|
| 1 | `thong-tac-cong-gieng-day-2` | `FIX_TEXT_P0 + CURATE` | Raw `#` H1, escaped `<strong>`, rò `PENDING_IMAGE_SEO`/`Chưa được publish`, heading `Case study E-E-A-T`, ảnh `2196` dùng chung, là landing local trong Cẩm nang. | Gỡ ghi chú nội bộ trước; chuyển Markdown sang block/HTML sạch; đổi heading case sang tình huống đã xác minh; gắn featured biến thể riêng; đưa khỏi card Cẩm nang nếu section chỉ giữ bài hướng dẫn. |
| 2 | `thong-tac-cong-cao-xanh-2` | `FIX_TEXT_P0 + CURATE` | Raw `#` H1, raw Markdown image syntax ở lead, escaped `<strong>`, rò `Checklist Rank Math`/điểm tự chấm, heading case template, ảnh `2196` dùng chung. | Gỡ block checklist Rank Math trước; sửa phần mở bài/ảnh Markdown; kiểm live không còn đường dẫn `../image-briefs`; làm ảnh card riêng và tách intent khỏi Cẩm nang. |
| 3 | `thong-tac-cong-bai-chay` | `FIX_TEXT_P0 + CURATE` | Raw `#` H1, `{#anchor}` trong heading content, dấu check emoji, excerpt/meta từng lộ Markdown hotline, ảnh `2196` dùng chung. | Làm sạch Markdown/anchor/emoji trong post content và meta; giữ CTA plain text; cân nhắc chuyển bài sang landing/service stream. |
| 4 | `thong-tac-cong-hong-gai-2` | `FIX_TEXT + SEO` | Raw `#` H1, heading `Case study thực tế` cần căn cứ, 0 internal link, ảnh `2196` dùng chung. | Đổi claim case nếu chưa có bằng chứng; thêm internal link về dịch vụ/trang hướng dẫn liên quan; tạo featured riêng. |
| 5 | `hut-be-phot-tien-yen-2` | `REWRITE_REVIEW + CURATE` | Raw `#` H1, heading `Case study E-E-A-T`, nhiều câu trùng cụm 6 bài huyện, ảnh `2197` dùng chung. | Giữ entity Tiên Yên nhưng rewrite phần tình huống/bảng giá/FAQ theo huyện; tạo ảnh featured riêng; không để bài landing chiếm card hướng dẫn. |
| 6 | `hut-be-phot-hai-ha-2` | `REWRITE_REVIEW + CURATE` | Raw `#` H1, case heading template, câu trùng nhóm huyện, ảnh `2197` dùng chung. | Tùy biến theo Hải Hà, bỏ câu chung nguyên văn, thay case bằng tình huống có căn cứ hoặc tình huống thường gặp. |
| 7 | `hut-be-phot-dam-ha-2` | `REWRITE_REVIEW + CURATE` | Raw `#` H1, case heading template, câu trùng nhóm huyện, ảnh `2197` dùng chung. | Rewrite theo bối cảnh Đầm Hà; làm featured/card image khác nhóm Tiên Yên/Hải Hà. |
| 8 | `hut-be-phot-co-to-2` | `REWRITE_REVIEW + CURATE` | Raw `#` H1, case heading template, câu trùng nhóm huyện, claim điều phối đảo cần đọc kỹ, ảnh `2197` dùng chung. | Rà claim vận chuyển/điều phối đảo, rewrite phần logic phục vụ Cô Tô, tạo ảnh riêng. |
| 9 | `hut-be-phot-binh-lieu-2` | `REWRITE_REVIEW + CURATE` | Raw `#` H1, case heading template, câu trùng nhóm huyện, ảnh `2197` dùng chung. | Tùy biến theo vùng cao/đường khó nếu có căn cứ; giảm đoạn mẫu chung. |
| 10 | `hut-be-phot-ba-che-2` | `REWRITE_REVIEW + CURATE` | Raw `#` H1, case heading template, câu trùng nhóm huyện, ảnh `2197` dùng chung. | Rewrite phần mở bài, case, FAQ và CTA theo Ba Chẽ; tạo featured riêng. |
| 11 | `mui-hoi-cong-nguyen-nhan-xu-ly-4` | `FIX_TEXT + SEO` | Raw `#` H1, 0 internal link, bài còn ngắn so với cụm cạnh tranh hơn. | Làm sạch lead Markdown; thêm link về xử lý mùi hôi/dấu hiệu bể đầy; bổ sung ví dụ tình huống nếu cần. |
| 12 | `hoa-chat-tu-thong-cong-3` | `FIX_TEXT_P0 + SEO` | Raw `#` H1, có từ cấm theo rule (`chuyên nghiệp`/biến thể), 0 internal link, ảnh `2196` dùng chung. | Thay từ cấm bằng mô tả kỹ thuật cụ thể; thêm cảnh báo an toàn + internal link; đổi featured khỏi ảnh service lặp. |
| 13 | `chu-ky-hut-be-phot-3` | `FIX_TEXT + SEO` | Raw `#` H1, 0 internal link, ảnh `2197` dùng chung. | Làm sạch lead; link sang dấu hiệu bể phốt đầy/bảng giá; dùng ảnh featured theo chủ đề chu kỳ. |
| 14 | `bon-cau-rut-cham-nguyen-nhan-3` | `FIX_TEXT + SEO` | Raw `#` H1, 0 internal link. | Làm sạch lead; link sang thông tắc bồn cầu và bài cống thoát nước; rà FAQ giọng nói. |
| 15 | `thong-tac-cong-tuan-chau` | `FIX_TEXT_P0 + CURATE` | Raw `#` H1, escaped `<strong>`, rò `PENDING_IMAGE_SEO`/`Chưa được publish`, heading `Case study E-E-A-T`, ảnh `2196` dùng chung, là landing local trong Cẩm nang. | Gỡ ghi chú nội bộ trước; chuyển Markdown sang HTML/block sạch; đổi case heading; tạo ảnh riêng; tách khỏi stream hướng dẫn nếu giữ section Cẩm nang. |
| 16 | `chi-phi-hut-be-phot-quang-ninh` | `REDIRECT_REVIEW + SEO` | Post vẫn có raw `#` H1 và 0 internal link; URL post redirect sang page `chi-phi-hut-be-phot-quang-ninh-2`. Page đích đang ngắn hơn post. | Chốt 1 canonical content source; nếu giữ page đích thì làm sạch Markdown, tăng outline/nội dung/link cho page đó rồi giữ redirect nhất quán. |
| 17 | `cau-hoi-thuong-gap-thong-tac-cong` | `FIX_SEO_IMAGE` | Nội dung FAQ dài và đúng intent hơn, nhưng 0 internal link và featured `2196` vẫn dùng chung. | Thêm link tới dịch vụ/bài hướng dẫn liên quan; dùng ảnh featured FAQ riêng để card không giống landing thông cống. |
| 18 | `xu-ly-mui-hoi-nha-ve-sinh` | `FIX_TEXT + SEO` | 0 internal link; chia sẻ block cuối lặp với nhóm informational cũ. | Rút gọn block lặp, tăng phần kiểm nguyên nhân theo nguồn mùi, thêm link xử lý mùi hôi/bể phốt. |
| 19 | `nao-vet-ho-ga` | `FIX_TEXT + SEO` | 0 internal link; block cuối lặp với nhóm informational cũ. | Tăng phần quyết định khi tự xử lý/khi gọi thợ riêng cho hố ga; thêm link dịch vụ liên quan. |
| 20 | `thong-tac-bon-cau-bi-tac` | `FIX_TEXT + SEO` | 0 internal link; block cuối lặp với nhóm informational cũ. | Giảm block mẫu, thêm link đến bài bồn cầu rút chậm và dịch vụ thông tắc bồn cầu. |
| 21 | `bang-gia-hut-be-phot-quang-ninh-2026` | `FIX_TEXT + SEO` | 0 internal link; block cuối lặp; title 56 ký tự thấp hơn chuẩn title 60-70 của dự án. | Tăng liên kết sang chi phí/chu kỳ/dịch vụ; chỉnh title khi làm batch meta. |
| 22 | `cach-xu-ly-cong-thoat-nuoc-tac` | `FIX_TEXT + SEO` | 0 internal link; block cuối lặp dù FAQ/schema đã đủ. | Giữ phần FAQ mới, rút block lặp, thêm link sang hóa chất tự thông cống và dịch vụ thông cống. |
| 23 | `dau-hieu-be-phot-can-hut` | `FIX_TEXT + SEO` | 0 internal link; block cuối lặp; title 55 ký tự thấp hơn chuẩn title 60-70 của dự án. | Giữ FAQ mới, làm đoạn chốt riêng cho dấu hiệu bể đầy, thêm link chu kỳ/bảng giá/hút bể phốt. |

## Phương án xử lý theo thứ tự

### P0 - Sửa lỗi văn bản đang lộ ra người đọc

1. Backup 16 post có raw Markdown.
2. Chuyển raw Markdown H1, escaped `<strong>`, image syntax, `{#anchor}` và emoji heading sang WordPress HTML/block sạch.
3. Kiểm live từng URL sau sửa bằng REST + public HTML `?nowprocket=1`.

Batch P0 nên bắt đầu từ:

- `thong-tac-cong-cao-xanh-2`
- `thong-tac-cong-bai-chay`
- `thong-tac-cong-gieng-day-2`
- `thong-tac-cong-tuan-chau`
- `hoa-chat-tu-thong-cong-3`

### P1 - Làm lại card Cẩm nang và ảnh featured

1. Chốt section trang chủ:
   - Nếu là `Cẩm nang/hướng dẫn`, query chỉ lấy informational/FAQ/bảng giá thực sự phù hợp.
   - Nếu muốn đẩy landing địa phương, đổi nhãn section/CTA để không nói là hướng dẫn.
2. Tạo featured/card image riêng cho các bài đang reuse `2196` và `2197`.
3. Ưu tiên 6 bài đang hiện ở trang chủ trước để giao diện không còn 4 card giống ảnh.

### P1 - Tăng chất lượng SEO on-page

1. Thêm internal link tự nhiên cho 13 bài đang có 0 link nội bộ.
2. Chốt canonical bài chi phí hút bể phốt đang redirect post -> page.
3. Rà title/meta batch informational có title ngắn hơn chuẩn nội bộ.

### P2 - Giảm nội dung template

1. Rewrite nhóm 6 bài hút bể phốt huyện để phần mở bài, case/tình huống, FAQ và CTA không lặp nguyên văn.
2. Đổi `Case study E-E-A-T` thành `Tình huống thường gặp` nếu không có bằng chứng case thật.
3. Rút hoặc viết lại block cuối lặp ở 6 bài informational cũ.

## Dữ liệu kiểm tra đã dùng

- Public REST post corpus: `/wp-json/wp/v2/posts?per_page=100&status=publish`.
- Live home section parse: `/?nowprocket=1&codex=home-handbook-audit-20260523`.
- Duplicate featured groups: `reports/handbook-image-current-audit-2026-05-22.json`.
- Repeated sentence scan: so câu rendered content sau khi chuẩn hóa địa danh.
- Metadata/technical baseline: `reports/handbook-all-posts-audit-2026-05-22.json` và `reports/full-site-live-audit-after-fix-2026-05-22.json`.

## Việc tiếp theo

Backup và sửa batch P0 gồm 5 bài có lỗi văn bản lộ rõ nhất: `thong-tac-cong-cao-xanh-2`, `thong-tac-cong-bai-chay`, `thong-tac-cong-gieng-day-2`, `thong-tac-cong-tuan-chau`, `hoa-chat-tu-thong-cong-3`.
