# Workspace Cleanup Audit — 2026-05-18

> Audit read-only trước khi dọn workspace `D:\.thongtaccongquangninh`. Cutoff "cũ hơn 14 ngày" = trước **2026-05-04**.

## Tổng quan trước cleanup

- File root: **207**
- Folder root: **26**
- Reports cũ: **160** file
- Backups cũ: **0** subdir
- Seo-revisions cũ: **62** subdir
- Empty `.mjs` stub trong `tools/`: **10**
- File tên hỏng (path bug): **2**
- Folder path bug: **1** (`D:.thongtaccongquangninh\`)
- Tmp rỗng: **2** (`.tmp.drivedownload/`, `.tmp.driveupload/`)

## Batch 2.1 — 100% chắc chắn rác (DELETE_NOW)

### File/folder bị tạo do bug parse path Windows (`:` và `\` trong tên)

Tên thực có chứa Unicode Private Use Area `` (thay `:`) và `` (thay `\`):

| Path | Kind | Size | Last modified |
|------|------|------|---------------|
| `D:.thongtaccongquangninh\` | DIR | — | 2026-05-18 |
| `D:.thongtaccongquangninhWORDPRESS_HOME_LEAD_FORM_PLUGIN_UPLOAD_2026-05-12.json` | FILE | 821 B | 2026-05-12 |
| `D:.thongtaccongquangninhWORDPRESS_HOME_PERFORMANCE_TUNE_PLUGIN_UPLOAD_2026-05-11.json` | FILE | 694 B | 2026-05-11 |

### Tmp folders rỗng

| Path | Kind |
|------|------|
| `.tmp.drivedownload\` | DIR (empty) |
| `.tmp.driveupload\` | DIR (empty) |

### Empty `.mjs` stub trong `tools/` (size = 0)

10 file size 0, không có nội dung, không thể chạy. Sẽ liệt kê trong file `_tmp_audit_empty_mjs.txt`.

## Batch 2.2 — Log/report cũ > 14 ngày (< 2026-05-04)

### Root files (70 file) — DELETE_NOW

Bao gồm:
- `CHATGPT_APPS_*_2026-04-29.md` (2 file)
- `CONTENT_DRAFT_STATUS_2026-04-29.md`
- `LOCAL_FIX_*.json` (1 file)
- `SEO_FIX_STATUS_*`, `SEO_INSTANT_INDEXING_*`, `SEO_NEXT_ACTION_*`, `SEO_PUSH_*`, `SEO_RANKMATH_AUDIT_*` (8 file)
- `WORDPRESS_*_2026-04-*.json` và `WORDPRESS_*_2026-05-03*.json` (58 file)

### Reports/ (160 file) — DELETE_NOW

Tất cả `reports/*_2026-04-*.md` và `reports/*_2026-05-{01,02,03}.md`.

### Seo-revisions/ (62 subdir) — DELETE_NOW

Subdir có ngày `<2026-05-04`.

### Backups/ (0 subdir) — KEEP

Tất cả backup hiện đều mới (>= 2026-05-04).

## Batch 2.3 — File test/throwaway

| Path | Kind | Lý do |
|------|------|-------|
| `TEST_AGENT_QUYEN.md` | FILE | Tên `TEST_*` rõ ràng là test, không có evidence dùng |
| `DEACTIVATE_OLD_FLOATING_CTA_2026-05-16.json` | FILE | One-shot action đã hoàn thành (deactivate plugin cũ) |

## NEEDS_REVIEW — KHÔNG tự xóa trong phiên này

- `content-drafts/` (60 file) — có thể là draft chưa publish
- `tools/` (140 script) — cần audit riêng để tìm trùng chức năng
- File config: `.env`, `.env.example`, `Makefile`, `.cursorrules`, `.clinerules`
- Folder dữ liệu thật: `Favicon/`, `Ảnh cung cấp/`, `Ảnh Đã Xử Lý SEO/`, `node_modules/`

## KEEP (sống động)

- File `*_2026-05-{04..18}.md/json` (trong 14 ngày)
- `DASHBOARD_2026-05-{10..18}.md` (9 file daily mới)
- `CLAUDE.md`, `AGENTS.md`, `AI_RULES.md`, `CODEX_CONTEXT.md`, `TASKS.md`
- `IMAGE_SEO_WORKFLOW_2026-05-06.md`, `LOCAL_SEO_DOORWAY_SAFE_WORKFLOW_2026-05-05.md` (workflow docs)
- `docs/`, `.agents/`, `.codex/`, `.cursor/`, `.claude/`, `.sixth/`, `.vscode/`
- `scripts/`, `logs/`, `image-briefs/`, `seo-checklists/`, `skills/`, `terminal/`

## Phương thức xóa

PowerShell + `Microsoft.VisualBasic.FileIO.FileSystem.DeleteFile(...,SendToRecycleBin)` — file vào Recycle Bin, có thể khôi phục.

## Ước tính sau cleanup

- File root: **207 → ~137** (giảm 70 file log cũ + 2 file tên hỏng + 2 file test ≈ 74 file)
- Folder root: **26 → ~22** (giảm 1 path bug + 2 tmp rỗng + 1 chưa rõ)
- Reports/: giảm 160 file
- Seo-revisions/: giảm 62 subdir
- Tools/: giảm 10 empty stub
