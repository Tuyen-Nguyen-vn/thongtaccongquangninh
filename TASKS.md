# TASKS - SEO Local Workflow

## Quy trình cập nhật từ 2026-05-06

- Mọi task viết bài SEO, sửa bài SEO, sửa landing page, sửa WordPress, tối ưu SEO, chèn ảnh SEO, audit sitemap/index nên đọc `skills/seo-local-audit-strict/SKILL.md` trước để lấy bối cảnh.
- Gate script hiện chỉ cảnh báo:

```powershell
node .\tools\check_seo_local_preflight_gate.mjs <evidence.json>
```

## Lỗi nền cần luôn nhớ

- Nội dung AI máy móc, local page giống nhau, chỉ thay địa danh.
- Title/excerpt giống nhau hàng loạt, nhiều cặp >=85%.
- Ảnh/caption có nguy cơ sai địa phương hoặc ghi sai “thực tế”.
- Nếu tái dùng ảnh nguồn, nên tạo biến thể riêng: đổi tên file/alt/caption, xóa EXIF, crop/filter/overlay nhẹ, xuất WebP/JPG tối ưu dung lượng.
- Alias slug dịch vụ chung cần map sang URL live thật.
- REST content không luôn đồng nghĩa frontend render đúng.
- Khi làm ảnh SEO, mặc định chọn ảnh gốc trong `D:\.thongtaccongquangninh\Ảnh cung cấp` và lưu bản đã tối ưu vào `D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO` trước khi upload/chèn.

## Trạng thái

- Skill strict: `skills/seo-local-audit-strict/SKILL.md`
- Checklist JSON: `seo-checklists/seo-local-preflight-checklist.json`
- Gate script: `tools/check_seo_local_preflight_gate.mjs` (warning-only)
- URL inventory mới nhất: `wp-url-audit-list.json`
- Unique image audit: `tools/audit_unique_wp_images.py` (read-only mặc định; `--fix` chỉ khi Tuyền duyệt live)
