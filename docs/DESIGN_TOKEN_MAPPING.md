# DESIGN.md Token Mapping

Ngay khi sửa UI, agent phải coi `DESIGN.md` là nguồn chuẩn và renderer CSS là nơi thực thi. File này ghi mapping bắt buộc giữa token Google Labs `DESIGN.md` và biến CSS của homepage renderer.

## Gate Bắt Buộc

Chạy trước khi nghiệm thu mọi thay đổi màu, typography, CTA, card, hero, footer hoặc spacing:

```bash
npm run design:check
```

Lệnh này chạy:

- `npx @google/design.md lint DESIGN.md`
- `node tools/check_design_token_mapping.mjs`

Kết quả hợp lệ phải là `0 errors`, `0 warnings` từ linter và `ok: true` từ script mapping.

## Color Tokens

| DESIGN.md token | Renderer CSS variable | Vai trò |
|---|---|---|
| `colors.primary` | `--ttcqn-color-primary` | Xanh môi trường, hành động chính, trạng thái hoàn tất |
| `colors.primaryHover` | `--ttcqn-color-primary-hover` | Hover/action đậm hơn |
| `colors.primaryBright` | `--ttcqn-color-primary-bright` | Highlight trên nền tối |
| `colors.secondary` | `--ttcqn-color-secondary` | Xanh dịch vụ, heading/link/card |
| `colors.secondaryHover` | `--ttcqn-color-secondary-hover` | Hover xanh dịch vụ |
| `colors.accent` | `--ttcqn-color-accent` | Nhấn mạnh, badge, giá |
| `colors.warning` | `--ttcqn-color-warning` | Cảnh báo, CTA khẩn cấp phụ |
| `colors.info` | `--ttcqn-color-info` | Thông tin/phụ trợ |
| `colors.error` | `--ttcqn-color-error` | Hotline khẩn cấp, cảnh báo thật |
| `colors.success` | `--ttcqn-color-success` | Xác nhận hoàn tất |
| `colors.background` | `--ttcqn-color-background` | Nền trang sáng |
| `colors.surface` | `--ttcqn-color-surface` | Card/nền trắng |
| `colors.surfaceMuted` | `--ttcqn-color-surface-muted` | Nền phụ sáng |
| `colors.border` | `--ttcqn-color-border` | Viền nhẹ |
| `colors.textPrimary` | `--ttcqn-color-text-primary` | Text chính nền sáng |
| `colors.textSecondary` | `--ttcqn-color-text-secondary` | Text phụ nền sáng |
| `colors.textMuted` | `--ttcqn-color-text-muted` | Caption/metadata |
| `colors.onDark` | `--ttcqn-color-on-dark` | Text chính nền tối |
| `colors.onDarkMuted` | `--ttcqn-color-on-dark-muted` | Text phụ nền tối |
| `colors.dark` | `--ttcqn-color-dark` | Nav/hero/footer nền tối |
| `colors.darkSecondary` | `--ttcqn-color-dark-2` | Nền tối lớp 2 |
| `colors.darkTertiary` | `--ttcqn-color-dark-3` | Nền tối lớp 3 |

## Shadow Tokens

| DESIGN.md token | Renderer CSS variable | Vai trò |
|---|---|---|
| `shadows.soft` | `--ttcqn-shadow-soft` | Bóng nhẹ cho panel/section |
| `shadows.card` | `--ttcqn-shadow-card` | Bóng card nổi rõ hơn |

## Footer Tokens

Shared footer được phép có alias `--footer-*` để CSS dễ đọc, nhưng alias phải trỏ về token TTCQN. `npm run design:check` sẽ fail nếu các giá trị này lệch.

| Footer variable | Token source | Vai trò |
|---|---|---|
| `--footer-bg` | `var(--ttcqn-color-dark-2)` | Nền footer chính |
| `--footer-card` | `var(--ttcqn-color-dark-3)` | Nền card tối |
| `--footer-card-2` | `color-mix(... --ttcqn-color-dark-3 ... --ttcqn-color-secondary ...)` | Nền card tối pha xanh dịch vụ |
| `--footer-blue` | `color-mix(... --ttcqn-color-secondary ... transparent)` | Hiệu ứng xanh phụ |
| `--footer-green` | `var(--ttcqn-color-primary-bright)` | Highlight trên nền tối |
| `--footer-green-2` | `var(--ttcqn-color-primary)` | CTA xanh đậm hơn |
| `--footer-text` | `var(--ttcqn-color-on-dark)` | Text chính trên nền tối |
| `--footer-text-soft` | `var(--ttcqn-color-on-dark)` | Link/text cần sáng rõ |
| `--footer-muted` | `var(--ttcqn-color-on-dark-muted)` | Text phụ trên nền tối |

## Quy Tắc Sửa

- Thêm màu mới: thêm vào `DESIGN.md`, thêm biến CSS tương ứng, cập nhật `tools/check_design_token_mapping.mjs`, rồi chạy `npm run design:check`.
- Sửa màu cũ: sửa `DESIGN.md` và CSS trong cùng lượt, không sửa một phía.
- Footer có biến riêng `--footer-*`, nhưng palette phải bám `colors.dark*`, `colors.onDark*`, `colors.primaryBright`, `colors.primary`, `colors.secondary`; không tạo bảng màu footer độc lập nếu không có lý do rõ.
- Gradient chưa được gate theo token vì `@google/design.md` alpha hiện tập trung vào token nền tảng. Khi sửa gradient, vẫn phải dùng màu từ `colors.*`.
