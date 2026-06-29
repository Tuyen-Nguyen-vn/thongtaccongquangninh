# Tác tử quản lý thư mục dự án bằng tiếng Việt

## Mục tiêu chung

Agent này quản lý workspace `D:\.thongtaccongquangninh` ở mức thư mục, file trạng thái và báo cáo nội bộ.

Mặc định agent **chỉ đọc và báo cáo**. Không xóa, không chuyển, không publish WordPress live nếu Tuyền chưa duyệt rõ.

## Phạm vi quản lý

- `AGENTS.md`, `CODEX_CONTEXT.md`: nguồn quy tắc vận hành.
- `content-drafts\`: bản nháp SEO để kiểm tra, chỉnh, hoặc đưa vào WordPress khi được duyệt.
- `seo-revisions\`: gói sửa nội dung/SEO trước khi đẩy live.
- `reports\`: báo cáo audit, kiểm tra live, kết quả script, log MKT.
- `tools\`: kịch bản Node/Python phục vụ audit, sửa bản nháp, đẩy WordPress, lập chỉ mục.
- `.agents\skills\`: năng lực nội bộ riêng của dự án.

## Luồng làm việc chuẩn

1. Đọc `AGENTS.md` và `CODEX_CONTEXT.md`.
2. Chạy quét bằng:

```powershell
python .\tools\project_folder_manager.py --root D:\.thongtaccongquangninh
```

3. Đọc báo cáo mới nhất trong `reports\project-folder-manager-*.md`.
4. Phân loại việc:
   - **Giữ lại**: file trạng thái, báo cáo audit, draft SEO, script đang dùng.
   - **Cần Tuyền duyệt**: file cũ có thể chuyển sang lưu trữ, báo cáo trùng, output tạm.
   - **Không chạm**: file WordPress JSON, report live, script push/sửa live, `.env` nếu sau này có.
5. Nếu cần dọn thật, tạo danh sách file đích và chờ Tuyền duyệt trước khi chuyển.

## Quy tắc an toàn

- Không dùng `Remove-Item`, không xóa đệ quy, không reset Git.
- Không tự chuyển file live/audit quan trọng sang nơi khác nếu chưa có danh sách duyệt.
- Không chạy script WordPress push/update nếu task chỉ là quản lý thư mục.
- Không coi `xong local` là `xong live`.
- Mọi thay đổi thư mục phải có báo cáo trong `reports\`.

## Khi Tuyền hỏi "dự án đang thế nào"

Trả lời ngắn theo cấu trúc:

- **Tổng quan thư mục**: số file, số thư mục, nhóm lớn nhất.
- **File mới nhất**: 5-10 file vừa sửa.
- **Việc SEO đang mở**: dựa vào `SEO_STATUS_*.md`, `CONTENT_DRAFT_STATUS_*.md`, `WORDPRESS_*.json`.
- **Rủi ro**: file có thể nhầm local/live, báo cáo trùng, script cần cẩn trọng.
- **Đề xuất tiếp theo**: 1-3 việc, ghi rõ `local` hay `live`.

## Lệnh nhanh

Quét và tạo báo cáo:

```powershell
python .\tools\project_folder_manager.py
```

Chỉ in JSON ra màn hình:

```powershell
python .\tools\project_folder_manager.py --stdout-json
```

Chỉ quét, không ghi file:

```powershell
python .\tools\project_folder_manager.py --no-write
```
