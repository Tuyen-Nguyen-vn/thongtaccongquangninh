# Audit đối thủ — thongtacquangninh.com/hut-be-phot-tai-uong-bi

- **Ngày audit**: 2026-05-17
- **URL**: https://thongtacquangninh.com/hut-be-phot-tai-uong-bi/
- **Từ khóa target của đối thủ**: hút bể phốt tại Uông Bí
- **Tool sử dụng**: WebFetch (thay thế cho SEO META in 1 CLICK + Wappalyzer khi audit từ CLI)

## 1. META TAGS

| Item | Đối thủ | Đánh giá | Khuyến nghị site mình |
|------|---------|----------|------------------------|
| Title | "Hút Bể Phốt Giá Rẻ tại Uông Bí - Quảng Ninh - Thông Tắc Số 1 Quảng Ninh" (94 ký tự) | **Quá dài** (>60 ký tự, Google cắt) | Title 50–60 ký tự, kw chính đứng đầu |
| Meta description | Không tìm thấy trong HTML render | Mất cơ hội CTR | Bắt buộc viết 140–160 ký tự, có hotline + khu vực |
| Canonical | Không phát hiện | Rủi ro duplicate | Đặt canonical self-reference |
| OG tags | Không phát hiện | Mất chia sẻ MXH | Set OG title/description/image |
| Schema | Không phát hiện JSON-LD | Mất rich snippet | Bắt buộc LocalBusiness + Service + BreadcrumbList + FAQPage |

## 2. HEADING STRUCTURE

- **H1**: "Hút Bể Phốt Giá Rẻ tại Uông Bí – Quảng Ninh" ✅ có kw chính
- **H2** (6 cái):
  1. Hút Bể Phốt Giá Rẻ Tại Uông Bí – Quảng Ninh | Công Ty Môi Trường Uông Bí *(trùng ý H1)*
  2. Báo giá dịch vụ hút bể phốt tại Uông Bí – Quảng Ninh
  3. Các dịch vụ hút bể phốt chúng tôi đang cung cấp
  4. Vì sao nên hút bể phốt định kỳ?
  5. Lý do khách hàng tại Uông Bí tin chọn…
  6. Quy trình hút bể phốt tại Công ty Môi Trường Uông Bí
- **H3**: 6 bước quy trình (Bước 1–6)

**Điểm yếu**: H2 đầu tiên trùng H1 (lỗi cấu trúc). Thiếu H2 "FAQ", "Cam kết", "Liên hệ".

## 3. NỘI DUNG

| Tiêu chí | Đối thủ | Site mình cần đạt |
|----------|---------|---------------------|
| Độ dài | ~800–900 từ | **≥ 1.500 từ** theo AGENTS.md |
| KW trong title/H1/intro | ✅ có cả 3 | Giữ nguyên chuẩn này |
| FAQ | ❌ không có | Bắt buộc 5–8 câu + FAQPage schema |
| Bảng giá | ✅ "500.000đ – 1.500.000đ/khối" | Có bảng chi tiết theo m³ + loại bể |
| Hotline | ✅ 0888 122 286 (3 lần) | Hotline mình theo CODEX_CONTEXT, ≥ 4 lần |
| Form liên hệ | ❌ không có | Có form Contact Form 7 hoặc tương đương |
| Ảnh | 4 ảnh, **không có alt** | ≥ 6 ảnh, alt chứa kw + khu vực |
| Breadcrumb | ❌ không có | Bắt buộc breadcrumb + schema |

## 4. INTERNAL LINKS

- Ước lượng ~20 link nội bộ — mức ổn nhưng phân bổ chưa rõ.
- **Thiếu**: link sang dịch vụ liên quan (thông tắc cống, nạo vét hố ga tại Uông Bí), link sang trang chủ khu vực Uông Bí.

## 5. CÔNG NGHỆ

- **CMS**: WordPress (xác nhận qua wp-content).
- **Theme/Plugin SEO**: Không nhận diện được qua WebFetch — cần chạy **Wappalyzer** trên trình duyệt để bổ sung (theme, Rank Math/Yoast, plugin cache, plugin schema).
- **Hotline thể hiện**: text thường, chưa thấy click-to-call `tel:` rõ ràng → cần verify trên browser.

## 6. CƠ HỘI VƯỢT ĐỐI THỦ (action cho site mình)

1. Viết bài "Hút bể phốt tại Uông Bí" mới với **≥ 1.500 từ**, có FAQ + bảng giá chi tiết + schema đầy đủ.
2. Title đúng 50–60 ký tự, meta description 140–160 ký tự (đối thủ thiếu cả 2).
3. Bắt buộc schema **LocalBusiness + Service + FAQPage + BreadcrumbList** (đối thủ trống schema).
4. Ảnh ≥ 6, alt chứa "hút bể phốt Uông Bí" + biến thể (đối thủ 0 alt).
5. Có form đặt lịch + click-to-call `tel:` rõ ràng.
6. Internal link sang: thông tắc cống Uông Bí, nạo vét hố ga Uông Bí, dịch vụ khẩn cấp 24/7 Uông Bí.

## 7. Việc còn thiếu trong audit

- Chưa chạy được **SEO META in 1 CLICK** và **Wappalyzer** trên browser → chưa có: meta description thực tế (nếu có trong `<head>` mà WebFetch bỏ qua), plugin SEO đối thủ dùng, theme.
- Khi Tuyền online thì mở 2 extension này trên Chrome rồi paste kết quả vào mục bổ sung dưới đây.

### Bổ sung manual (chờ điền)

- Meta description thực: `…`
- Schema thực: `…`
- Theme: `…`
- Plugin SEO: `…`
- Plugin cache: `…`
