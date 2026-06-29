# Agent Ownership Rules

> Cơ chế **1 cửa / 1 owner / 1 AI agent** cho từng nhóm việc trong dự án `D:\.thongtaccongquangninh`. Mọi AI/agent bắt buộc đọc file này trước khi nhận task.

## Quy tắc 1 cửa

Dự án này sử dụng cơ chế 1 cửa / 1 owner / 1 AI agent cho từng nhóm việc.

Một nhóm việc chỉ được một AI agent phụ trách tại một thời điểm.


## Bảng ownership

| Nhóm việc | Owner |
|-----------|-------|
| Website/UI/frontend WordPress (theme, layout, CSS, responsive, UX) | **Web Agent** |
| Backend/API WordPress (REST endpoint, MCP plugin, hooks) | **Backend Agent** |
| Database/schema WP (option, post meta, custom table) | **Database Agent** |
| SEO content & on-page (viết bài, meta, schema, internal link) | **SEO Agent** |
| Image SEO (chọn ảnh, rename, alt, caption, EXIF) | [`tác-tử-xử-lý-ảnh-seo`](.agents/tac-tu-xu-ly-anh-seo.md) |
| Quản lý thư mục/cleanup workspace | [`tác-tử-quản-lý-thư-mục-dự-án`](.agents/tac-tu-quan-ly-thu-muc-du-an.md) |
| Inspector / audit độc lập | [`inspector-agent-ben`](.agents/inspector-agent-ben.md) |
| Deployment/infra (plugin upload, WP-CLI, hosting) | **DevOps Agent** |

Nếu task chưa có owner xác định, agent đầu tiên được Tuyền giao sẽ là **owner tạm thời** cho task đó.

## Website owner

Mọi việc liên quan đến website đều thuộc phạm vi của **Web Agent**.

Bao gồm:
- Sửa giao diện
- Sửa layout
- Sửa component
- Sửa page
- Sửa CSS/Tailwind
- Sửa responsive
- Sửa UX/UI
- Refactor frontend
- Audit frontend
- Clean code frontend
- Xóa file rác frontend
- Gộp component/frontend files
- Tối ưu cấu trúc website

Nếu task thuộc nhóm website, **chỉ Web Agent** được xử lý.



Nếu Tuyền đã giao task cho agent hiện tại, agent hiện tại phải xử lý trong phạm vi được giao.

- "Bạn nên giao việc này cho agent khác."
- "Hãy hỏi agent kia."
- "Việc này nên để agent khác làm."
- "Tôi đề xuất chuyển sang agent khác."

Trừ khi task **thật sự** nằm ngoài quyền truy cập hoặc ngoài khả năng kỹ thuật, agent phải tiếp tục xử lý.

## Khi phát hiện conflict ownership

Nếu phát hiện một file hoặc một nhóm việc đang được agent khác xử lý:

3. Báo rõ file nào đang bị conflict.
4. Đề xuất phương án hợp nhất.
5. Chờ Tuyền quyết định nếu cần.



- Tạo component mới khi component tương tự đã tồn tại.
- Tạo file helper mới khi helper tương tự đã tồn tại.
- Tạo layout mới khi layout cũ có thể refactor.
- Tạo CSS mới khi class/style cũ có thể sửa sạch.
- Tạo page copy khi có thể dùng dynamic route hoặc shared component.
- Tạo version mới với tên `new`, `v2`, `final`, `copy`, `backup`.

## Bắt buộc đọc trước khi sửa

Trước khi sửa code/website/content, mọi AI agent phải đọc theo thứ tự:

1. `CLAUDE.md` — luật tổng.
2. `AI_RULES.md` — clean code / no legacy junk.
3. `AGENT_OWNERSHIP.md` (file này) — cơ chế 1 cửa.
4. `AGENTS.md` — chuẩn SEO + workflow.
5. `CODEX_CONTEXT.md` — bối cảnh dự án.
6. `TASKS.md` + `docs/PROJECT_STATE.md` — trạng thái hiện hành.


## Liên hệ

Mọi quyết định cuối cùng về phân chia ownership, chuyển task giữa các agent, gỡ conflict — do **Tuyền** quyết.
