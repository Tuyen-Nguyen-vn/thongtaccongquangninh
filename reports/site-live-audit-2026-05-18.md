# Site Live Audit — 2026-05-18

> Audit read-only `https://thongtaccongquangninh.com` qua WP REST API. **KHÔNG sửa live trong phiên này.**

## Theme

Active theme: **GeneratePress** `v3.6.1` (`generatepress`)

## Plugins (26 tổng)

- **Active:** 23
- **Inactive:** 3

### Inactive — đề xuất xóa khỏi WP (khi Tuyền duyệt)

| Plugin | Version | Slug |
|--------|---------|------|
| TTCQN Floating CTA | 1.3.0 | `ttcqn-floating-cta/ttcqn-floating-cta` |
| TTCQN Home Template Diagnostics | 2026.05.13.1 | `ttcqn-home-template-diagnostics/ttcqn-home-template-diagnostics` |
| WPCode Lite | 2.3.5 | `insert-headers-and-footers/ihaf` |

### NGHI VẤN TRÙNG CHỨC NĂNG (đang ACTIVE cả hai)

| Plugin | Version |
|--------|---------|
| TTCQN Favicon Override | 2026.05.10 |
| TTCQN Favicon Override 20260512 | 2026.05.14 |

→ Có 2 plugin favicon override cùng chạy. Cần Tuyền kiểm: giữ lại bản mới hơn (20260512), tắt bản cũ.

### Active plugins thiết yếu (giữ)

Elementor + Pro, LiteSpeed Cache, Rank Math + Pro, WPForms Lite, WP Rocket, Akismet, Make Connector, WP MCP Ultimate, WP File Manager, và 9 plugin TTCQN custom (doorway renderer, home lead form, performance tune, scroll guide, banner dedupe, v.v.).

## Pages draft (11 — tất cả < 14 ngày, KEEP)

Toàn bộ pages draft đều modified >= 2026-05-10. Không có draft cũ cần xóa.

Lưu ý: ID=33 là `Elementor #33` (page test cũ — có thể xem xét xóa nếu không dùng), ID=3 là `Privacy Policy` draft (đáng giữ).

## Posts draft (11 — tất cả < 14 ngày, KEEP)

Toàn bộ posts draft đều modified >= 2026-05-10. Không có draft cũ cần xóa.

## Posts trash

**0** — không có gì cần empty.

## Media library

Tổng số chưa lấy được qua header `X-WP-Total` (Invoke-WebRequest không expose trong PowerShell hiện tại). Đề xuất chạy `python tools/audit_unique_wp_images.py` ở phiên sau với credential phù hợp để liệt kê đầy đủ.

## Kết luận

Site live tương đối sạch. Cần Tuyền duyệt:

1. **Xóa hẳn 3 plugin inactive** khỏi WP admin (TTCQN Floating CTA, TTCQN Home Template Diagnostics, WPCode Lite). KHÔNG tự xóa trong phiên này.
2. **Quyết định 2 plugin favicon override**: giữ bản mới `20260512`, deactivate + xóa bản cũ.
3. Optional: xóa `Page ID=33 (Elementor #33)` nếu không dùng.

Sửa live cần Tuyền giao lệnh riêng — không tự ý thay đổi WordPress production.
