# SEO RULES — Quy tắc & sơ đồ vận hành cho agent SEO

> Quy tắc ngắn gọn để agent yếu vẫn định hướng đúng. Phần *chuẩn nội dung chi tiết* (số từ, mật độ từ khóa, bộ H2 bắt buộc, LSI, cam kết 3 Không, văn phong) có trong `AGENTS.md`. File này chỉ chuẩn hoá **quy trình + ngưỡng điểm + ràng buộc**.

## Nguyên tắc lõi

```
ĐỌC TRƯỚC -> LÀM ĐÚNG -> CHECKLIST -> CHẤM ĐIỂM -> PUBLIC -> CHẤM LẠI -> GHI TIẾN ĐỘ
```

## Sơ đồ quy trình cho mọi agent

| Bước | Agent phải làm | Điều kiện chuyển bước |
|---|---|---|
| 2 | Đọc `CLAUDE.md`, `AGENTS.md`, `CODEX_CONTEXT.md`, `TASKS.md`, `docs/PROJECT_STATE.md`, `docs/SEO_PROGRESS.csv`, `docs/SEO_RULES.md`, `docs/SEO_CHECKLIST.md` | Biết việc đã làm đến đâu |
| 3 | Xác định task ưu tiên | Có task rõ: viết, tối ưu, kiểm tra, public hoặc sửa lỗi |
| 4 | Lập kế hoạch ngắn | Biết file nào sẽ sửa, mục tiêu là gì |
| 6 | Nếu là bài SEO: chạy `docs/SEO_CHECKLIST.md` | Bài đạt tối thiểu 90% checklist |
| 7 | Chạy `tools/seo_score.py` | Đạt điểm theo độ khó: dễ ≥ 80, trung bình ≥ 84, khó ≥ 88 |
| 9 | Sau public chấm Rank Math | Đạt **100/100** Rank Math mới chốt DONE |

```
Bắt đầu -> Đọc file quản lý -> Xác định việc đã làm/chưa làm -> Chọn task -> Thực hiện
       -> Checklist -> Chấm điểm nội bộ -> Public nếu đạt -> Chấm Rank Math -> Ghi tiến độ -> Báo cáo
```

## Ngưỡng điểm bắt buộc

Tool `tools/seo_score.py` chấm bảo thủ hơn Rank Math 3-8 điểm để agent không chủ quan.

| Loại bài | Yêu cầu điểm nội bộ | Ghi chú |
|---|---|---|
| Bài trung bình (1-2 huyện ngoài Hạ Long) | ≥ 84 | Ví dụ: "hút bể phốt Vân Đồn" |



## Tiêu chí chấm điểm nội bộ (rút gọn)

Tool `tools/seo_score.py` cộng điểm theo:

- Nội dung ≥ 900 từ (+10), ≥ 1300 từ (+5).
- Đúng 1 H1 (+8), ≥ 4 H2 (+8), có H3 (+4).
- Title có từ khóa (+8), Meta description có từ khóa (+8), Meta dài 120-165 ký tự (+5).
- Có "quảng ninh" (+7), có địa danh phụ (+5).
- Có ≥ 2 ảnh (+6), ảnh có alt đầy đủ (+6), có ≥ 2 internal link (+7).
- Có FAQ (+5), có schema FAQ/LocalBusiness (+5), có CTA mạnh "gọi ngay/zalo/hotline/tư vấn miễn phí" (+5).

Điểm thô tối đa cộng dồn 100; điểm nội bộ = điểm thô − 5 (bảo thủ hơn).

Lệnh chạy trên Windows:

```cmd
python tools\seo_score.py content-drafts\<file>.md "từ khóa chính"
```

Hoặc với HTML xuất từ WordPress:

```cmd
python tools\seo_score.py exports\<slug>.html "hút bể phốt Quảng Ninh"
```

## Phạm vi sửa file

- **Được** sửa: `docs/PROJECT_STATE.md`, `docs/SEO_PROGRESS.csv`, file draft trong `content-drafts/`, file image-brief trong `image-briefs/`, file báo cáo `WORDPRESS_*.json` mới.
- **Khi sửa live WordPress**: bắt buộc backup vào `backups/` trước, sau đó verify REST + frontend, ghi report `WORDPRESS_*.json` mới.

## Nguồn quy tắc chi tiết

| Câu hỏi | Tìm trong file |
|---|---|
| Văn phong, độ dài bài, mật độ từ khóa, các H2 bắt buộc | `AGENTS.md` mục "CHUẨN SEO BẮT BUỘC KHI VIẾT BÀI" |
| Hotline, dịch vụ, thế mạnh, khu vực | `CODEX_CONTEXT.md` |
| Quy trình ảnh SEO | `IMAGE_SEO_WORKFLOW_2026-05-06.md` |
| Quality gate kỹ thuật | `AGENTS.md` mục "QUALITY GATE BẮT BUỘC" |
| Checklist trước public | `docs/SEO_CHECKLIST.md` + `seo-checklists/seo-local-preflight-checklist.json` |
| Lệnh chạy script automation | `AGENTS.md` mục cuối + `TASKS.md` |


Mỗi task phải có **một dòng** trong `docs/SEO_PROGRESS.csv`, kể cả khi:

- Task thành công.
- Task lỗi.
- Task dở dang.
- Thiếu dữ liệu (ghi vào `issues` và `next_action`).

17 cột bắt buộc, xem mẫu CSV và mô tả trong `docs/SEO_PROGRESS.csv`.
