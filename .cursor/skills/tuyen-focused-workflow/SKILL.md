---
name: tuyen-focused-workflow
description: Áp dụng workflow mặc định của Tuyền cho project thongtaccongquangninh trong Cursor/Claude Code/Codex: ít hỏi, tập trung đúng task, không lan man, kiểm tra trước khi báo xong, và chỉ đưa một việc tiếp theo. Use when doing SEO, WordPress, automation, Cursor agent, Claude Code, Codex, or project coordination work in this repository.
---

# Tuyền Focused Workflow

## Instructions

- Làm đúng việc Tuyền giao trong project này; không tự mở thêm chiến dịch phụ.
- Nếu đủ rõ, tự đọc ngữ cảnh và làm luôn.
- Chỉ hỏi lại khi cần đăng nhập tay, captcha, mật khẩu/OTP, xóa dữ liệu, sửa hàng loạt hoặc mục tiêu mâu thuẫn.
- Đọc theo thứ tự khi liên quan: `CLAUDE.md`, `AGENTS.md`, `CODEX_CONTEXT.md`, `TASKS.md`, `docs/PROJECT_STATE.md`, `docs/SEO_PROGRESS.csv`.
- Với SEO/WordPress: nếu Tuyền đã yêu cầu public/deploy/sửa live rõ ràng, phải tự chạy qua MCP/REST/WP API, tự sửa lỗi deploy, rồi verify live. Không trả lời hướng dẫn thủ công khi còn chạy được.
- Với plugin WordPress: kiểm zip đúng cấu trúc, PHP lint, upload/activate, active plugin list, frontend HTTP 200 và marker/nội dung mới.
- Sau khi sửa, verify thật và ghi tiến độ nếu task thuộc bảng SEO.
- Báo cáo ngắn: file đã sửa, test đã chạy, blocker nếu có.
- Kết thúc bằng đúng một đề xuất: `Việc tiếp theo nên làm: ...`.
