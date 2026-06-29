# AI_AGENT_RULES

Áp dụng cho mọi AI Agent sửa code, WordPress, SEO, content, ảnh, schema trong repo này.

## Luật Trước Khi Làm

1. Đọc `AGENTS.md`, `AI_RULES.md`, `TASKS.md`, `CODEX_CONTEXT.md`.
2. Nếu làm website/SEO có phạm vi thiết kế, audit, tối ưu hoặc quy trình đa dự án, đọc `docs/AI_WEB_SEO_AGENT_PROCESS.md` rồi mới áp overlay riêng của dự án; nếu task chạm Discover, favicon Search, featured snippets, AI features controls, Image SEO, byline date hoặc paywall thì đọc thêm `docs/GOOGLE_SEARCH_CENTRAL_MODULES_2026-05-23.md`.
3. Nếu đụng SEO/local page/WordPress, đọc `skills/seo-local-audit-strict/SKILL.md`.
4. Nếu sửa live WordPress, backup page/post/option/meta trước.

## Luật Sửa Code

12. Sau sửa phải chạy kiểm tra phù hợp: syntax/build/lint/smoke/visual.

## Luật Viết/Sửa Content

1. Mỗi bài có một intent chính.
2. Mỗi bài có câu trả lời ngắn ở đầu.
3. Outline phải logic, không filler.
12. Hotline chuẩn: `0963.953.533 / 0931.156.756`.

## Luật Sử Dụng Hình Ảnh Chuẩn SEO

2. Nguồn ảnh thi công thực tế **BẮT BUỘC** phải lấy từ thư mục nguồn: `D:\.thongtaccongquangninh\Ảnh cung cấp`.
3. Mọi hình ảnh trước khi chèn hoặc upload lên WordPress **BẮT BUỘC** phải được xử lý tối ưu SEO (đổi tên không dấu phân tách bằng `-`, crop/filter nhẹ, tối ưu dung lượng) và xuất ra thư mục đích: `D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO`.
5. Mỗi ảnh chèn vào bài viết phải có alt text phản ánh đúng ngữ cảnh đoạn văn xung quanh và có caption mô tả chân thực (bám sát địa phương, dịch vụ).



## Quality Gate

Trước khi báo xong:

- Đã backup nếu sửa live.
- Đã kiểm title/meta/H1/H2.
- Đã kiểm canonical/noindex/sitemap nếu là URL SEO.
- Đã kiểm schema khớp nội dung.
- Đã ghi report nếu task có thay đổi live hoặc audit.
- Chỉ báo `Fixed` cho mục đã có lệnh kiểm chứng; mục chưa chắc phải ghi `Needs Review`.
