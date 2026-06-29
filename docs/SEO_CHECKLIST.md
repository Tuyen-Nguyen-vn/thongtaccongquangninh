# SEO CHECKLIST — Trước khi public

> Checklist con người đọc, kiểm thủ công trước khi public bất kỳ bài SEO nào. Phải đạt **tối thiểu 90%**.
> Phiên bản máy đọc (cho gate script): `seo-checklists/seo-local-preflight-checklist.json`.
> Quy trình ảnh SEO chi tiết: `IMAGE_SEO_WORKFLOW_2026-05-06.md`.

## Thông tin chính

- [ ] Có từ khóa chính xác định rõ ràng.
- [ ] Có từ khóa phụ / LSI rải đều bài.
- [ ] Có địa phương Quảng Ninh hoặc thành phố / huyện / phường cụ thể (Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn, Tiên Yên, Hải Hà, Đầm Hà, Bình Liêu, Ba Chẽ, Cô Tô, hoặc tên phường cụ thể).
- [ ] Đúng intent khách hàng (mua dịch vụ / khẩn cấp / so sánh giá / tra cứu thông tin).

## Title, meta, slug

- [ ] SEO title 60-70 ký tự, có từ khóa chính.
- [ ] Meta description 150-160 ký tự, có từ khóa và CTA + hotline.
- [ ] Slug ngắn, rõ, có từ khóa, không dấu, không số ngày.

## Cấu trúc bài

- [ ] Đúng 1 H1 duy nhất, có từ khóa chính.
- [ ] Có ít nhất 4 H2 rõ ràng, theo các mục bắt buộc trong `AGENTS.md`: Nguyên nhân / Tại sao chọn (Cam kết 3 Không) / Bảng giá / Quy trình 5 bước / Tình huống thường gặp / NAP liên hệ / FAQ.
- [ ] Có H3 bổ trợ khi cần.
- [ ] Mở bài đánh vào nỗi đau khách hàng (tắc nghẽn, mùi hôi, trào ngược, gián đoạn sinh hoạt).
- [ ] Có quy trình, cam kết, khu vực phục vụ, FAQ, CTA cuối bài.

## Nội dung

- [ ] Có yếu tố địa phương: tên đường, khu dân cư, đặc thù địa hình (xem `AGENTS.md` mục "Tiêm Thực Thể Địa Phương").
- [ ] Có thông tin hữu ích và ngôn ngữ chuyển đổi.

## Ảnh

- [ ] Có ít nhất 3 ảnh trong bài (1 đầu bài + 1 case/quy trình + 1 phụ).
- [ ] Tên file không dấu, có keyword/dịch vụ và địa phương khi phù hợp.
- [ ] Alt text có dịch vụ + địa phương.
- [ ] Ảnh đúng dịch vụ, không trùng 100% với trang địa phương khác.
- [ ] Đã chạy `node tools\check_image_seo_gate.mjs <slug>` trả không phải `PENDING_IMAGE_SEO`.

## Link

- [ ] Có ít nhất 2 internal link (về dịch vụ chính + khu vực liên quan), anchor có dấu, tự nhiên.
- [ ] Có CTA gọi điện 0963.953.533 hoặc 0931.156.756 và Zalo.

## Schema

- [ ] Có FAQ schema nếu bài có FAQ.
- [ ] Có LocalBusiness schema nếu là landing page khu vực, kèm `address`, `geo`, `telephone` đúng.
- [ ] Có BreadcrumbList schema.
- [ ] Schema validate qua https://validator.schema.org/ không lỗi.

## Điểm số

- [ ] Đã chạy `python tools\seo_score.py <file> "<từ khóa>"`.
- [ ] Đạt điểm tối thiểu theo độ khó: dễ ≥ 80, trung bình ≥ 84, khó ≥ 88.
- [ ] Sau public đã chấm Rank Math thực tế — **phải đạt 100/100**.
- [ ] Nếu Rank Math < 100: xác định tiêu chí còn thiếu (thường là ảnh, schema, alt text, internal link) → sửa → chấm lại → đến khi đạt 100 mới chốt DONE.
- [ ] Đã ghi `internal_score_before/after` và `rank_math_before/after` vào `docs/SEO_PROGRESS.csv`.

## Quy tắc kết luận

- **Nếu chưa đạt** ≥ 90% mục trên hoặc điểm `seo_score.py` chưa đủ ngưỡng → **KHÔNG PUBLIC**. Sửa, chấm lại, ghi log.
- **Nếu đạt checklist** → đánh dấu `READY_TO_PUBLIC`, push WordPress.
- **Sau public** → chấm Rank Math, nhập điểm thật vào `docs/SEO_PROGRESS.csv`.
- **Bắt buộc Rank Math = 100/100** trước khi chốt bài là DONE. Nếu < 100: xác định tiêu chí thiếu → sửa → chấm lại → ghi log.

## Đầu ra báo cáo sau khi chạy checklist

- Kết luận PASS / FAIL.
- Điểm SEO nội bộ (số / yêu cầu).
- Danh sách mục FAIL trong checklist này.
- Việc cần sửa.
- Có được public không.
- Dòng log đã thêm vào `docs/SEO_PROGRESS.csv`.
