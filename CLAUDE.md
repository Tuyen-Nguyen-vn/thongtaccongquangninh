# LUẬT LÀM VIỆC CHO MỌI AGENT

> File này là luật **tổng** cho mọi agent làm việc trong workspace `D:\.thongtaccongquangninh`. Bắt buộc đọc đầu tiên mỗi phiên.

## Ưu tiên mới trong Cursor / Claude Code

- Hỏi ít, làm thẳng nếu yêu cầu đã đủ rõ.
- Chỉ hỏi lại khi có rủi ro thật: xóa dữ liệu, publish live, mật khẩu/OTP/captcha, thanh toán, sửa hàng loạt hoặc mục tiêu mâu thuẫn.
- Sau khi làm phải kiểm tra thật rồi mới báo xong.
- Cuối báo cáo chỉ đưa đúng một dòng: `Việc tiếp theo nên làm: ...`.

## GStack áp dụng cho dự án

- GStack đã được cài ở cấp máy cho Codex tại `~/.codex/skills/gstack-*`; dùng như bộ quy trình phụ trợ, không dùng repo `garrytan/gstack` làm remote chứa code TTCQN.
- Khi làm thay đổi code/plugin/giao diện trước deploy, ưu tiên dùng tư duy `/review` để rà diff, rủi ro side effect, secret và thiếu test.
- Khi sửa giao diện hoặc trang public, ưu tiên dùng tư duy `/qa` hoặc `/qa-only` để kiểm frontend thật, mobile/desktop, link, CTA, overflow và bằng chứng trước/sau.
- Khi gặp lỗi khó hoặc live khác local, dùng tư duy `/investigate`: khoanh vùng nguyên nhân, tái hiện, kiểm từng lớp cache/REST/renderer/plugin rồi mới sửa.
- Khi chạm bảo mật, auth, secret, upload plugin, WordPress live hoặc connector, dùng tư duy `/cso` để rà OWASP/STRIDE, secret leak và quyền ghi.
- Khi chạm UI, luôn kết hợp `/design-review` với `DESIGN.md`; không hard-code màu/spacing mới nếu có token dùng chung.
- GStack checkpoint auto-commit đã được Tuyền cho phép ở mức local/continuous; không auto-push. Không chạy gstack team mode hoặc auto-update repo nếu Tuyền chưa yêu cầu rõ.

## Vai trò dự án

Website dịch vụ môi trường đô thị tại Quảng Ninh:

- Hút bể phốt
- Hút hầm cầu
- Thông tắc cống
- Thông tắc bồn cầu
- Nạo vét hố ga
- Xử lý mùi hôi
- Dịch vụ khẩn cấp 24/7
