# Material gốc từ `D:\.Antigravity\`

Folder này chứa **bản copy** các file Blogger lấy từ workspace Antigravity cũ. Mục đích: Gemini có đủ context lịch sử (plan vệ tinh, script automation, state hiện tại) để tiếp tục mà không cần truy ngược ra `D:\.Antigravity\`.

## Nguồn gốc

- Snapshot: 2026-05-25 bởi Claude.
- Đường dẫn nguồn: `D:\.Antigravity\` và `D:\.Antigravity\Projects\`.

## Quan trọng

  - `D:\.Antigravity\client_secrets.json`
  - `D:\.Antigravity\token.json`
- **Đây là snapshot tham khảo, không phải nguồn truth.** Nguồn truth là các file luật + plan ở root `D:\blogger\hutbephothalong\` (CLAUDE.md, GEMINI.md, CONTEXT.md, ...).
- Nếu material trong folder này **xung đột** với luật mới ở root, ưu tiên luật mới và hỏi Tuyền duyệt thay đổi.

## Cấu trúc

```
from-antigravity/
├── Projects/
│   ├── ke-hoach-blogger-ve-tinh-seo.md      <- Kế hoạch gốc vệ tinh (đọc kỹ, đây là plan cha)
│   ├── huong-dan-ket-noi-blogger-api.md     <- Hướng dẫn kết nối Blogger API
│   ├── blogger_theme_seo.xml                <- Template XML đang dùng (backup gốc)
│   ├── blogger_state.json                   <- State 6 bài đã publish, blog_id, backlink_url
│   └── blogger_automation_flow.py           <- Flow tự động chính
└── scripts/                                  <- 14 script Python vận hành Blogger
    ├── assist_blogger_setup.py
    ├── auto_fix_blogger_settings.py
    ├── auto_fix_blogger_settings_default.py
    ├── dang_bai_mau_blogger.py
    ├── dang_bai_seo_blogger.py
    ├── dang_bai_nap_vet_ho_ga.py
    ├── dang_bai_thong_bon_cau.py
    ├── ping_blogger_sitemap.py
    ├── submit_blogger_to_google_index.py
    ├── update_blogger_images.py
    ├── xac_thuc_blogger.py
    ├── xuat_ban_bai_blogger.py
    ├── force_auto_fix.py
    └── process_images_to_webp.py
```

## Điểm xung đột đã phát hiện (chờ Tuyền quyết)

| Vấn đề | Plan cũ (`ke-hoach-blogger-ve-tinh-seo.md`) | Luật mới (`CONTEXT.md` mục 4) |
|---|---|---|
| Anchor map về site mẹ | 70% brand+khu vực, 30% keyword chính xác | 50% brand / 20% URL trần / 20% generic / 10% keyword |
| Số link về site mẹ/bài | Tối đa 1 link trang chủ + 1 link nội bộ | 1-3 link contextual về site mẹ |

→ Đã ghi vào `TASKS.md` Phase 0 mục 0.7. Tuyền duyệt trước khi Gemini viết bài mới.

## Bài đã publish (`blogger_state.json`)

6 bài, blog `https://hutbephothalong14.blogspot.com/`:
1. 5 cách xử lý mùi hôi cống thoát sàn nhà vệ sinh triệt để
2. Dịch vụ thông tắc cống tại Phường Hồng Hà Hạ Long sạch sẽ
3. Dịch vụ hút bể phốt tại Bãi Cháy Quảng Ninh phục vụ 24/7
4. Bảng giá thông hút bể phốt tại Cẩm Phả bao nhiêu tiền một khối?
5. Cảnh báo chiêu trò hút bể phốt lừa đảo tại Quảng Ninh
6. Tại sao công nghệ hút bể phốt chân không không cần đục phá?

→ Gemini cần audit 6 bài này theo `BLOGGER_SEO_CHECKLIST.md` mục A trước khi viết bài mới (xem `TASKS.md` Phase 5).
