# Báo cáo internal link trang chủ - 2026-05-29

## File đã sửa

- `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/includes/mobile-left-sticky-cta.php`
- `tools/wp-plugins/ttcqn-home-emergency-renderer/templates/shared-footer.php`
- `tools/render_home_preview.php`

## Audit cấu trúc link

- Header/menu: đã có link dịch vụ, khu vực, bảng giá, blog, liên hệ, hotline.
- Hero: giữ form gọi lại và CTA hiện có, không nhồi thêm link trong hero.
- Giới thiệu công ty: thêm link tự nhiên tới dịch vụ hút bể phốt, thông tắc cống, đội ngũ kỹ thuật, bảng giá.
- Dịch vụ của chúng tôi: thêm section hub dịch vụ mới, 6 card dịch vụ click được toàn card, không lồng thẻ `a`.
- Dự án đã hoàn thành: ảnh dự án, tên dự án và link xem chi tiết trỏ về trang dự án chi tiết thực tế.
- Quy trình 5 bước: thêm link nhẹ tới form liên hệ và CTA gửi yêu cầu tư vấn.
- Khu vực phục vụ: 8 khu vực có link về landing page đã kiểm tra 200.
- Bảng giá: link từng dòng dịch vụ về trang dịch vụ tương ứng, CTA về `/bang-gia/`.
- Blog/Tin tức: card blog đã click được về bài/trang thực tế.
- Đối tác: không link logo ra ngoài vì chưa xác minh URL đối tác.
- Footer: nhóm lại link Công ty/Hỗ trợ, Dịch vụ, Khu vực, nguồn tham khảo.

## URL nội bộ đã gắn

| Nhóm | URL |
|---|---|
| Công ty | `/gioi-thieu/`, `/lien-he/`, `/bang-gia/`, `/blog/`, `/chinh-sach-bao-hanh/`, `/he-thong-co-so-quang-ninh/` |
| Dịch vụ | `/hut-be-phot-quang-ninh/`, `/thong-tac-cong-quang-ninh/`, `/thong-tac-bon-cau-quang-ninh/`, `/thong-tac-chau-rua-quang-ninh/`, `/nao-vet-ho-ga-quang-ninh/`, `/xu-ly-mui-hoi-quang-ninh/` |
| Khu vực | `/hut-be-phot-ha-long/`, `/hut-be-phot-cam-pha/`, `/hut-be-phot-uong-bi/`, `/hut-be-phot-mong-cai/`, `/hut-be-phot-dong-trieu/`, `/hut-be-phot-quang-yen/`, `/hut-be-phot-van-don/`, `/hut-be-phot-bai-chay/` |
| Dự án chi tiết | 6 URL dự án thực tế trong sitemap và live site |

## Anchor đã dùng

- Thương hiệu/tổng quát: `Môi Trường Đô Thị Số 1 Quảng Ninh`, `Giới thiệu công ty`, `Đội ngũ kỹ thuật`, `Công trình tiêu biểu`, `Khách hàng tiêu biểu`.
- Dịch vụ: `Hút bể phốt Quảng Ninh`, `Thông tắc cống Quảng Ninh`, `Thông tắc bồn cầu`, `Thông tắc chậu rửa`, `Nạo vét hố ga`, `Xử lý mùi hôi cống`.
- CTA: `Gửi yêu cầu dịch vụ`, `Xem bảng giá`, `Xem bảng giá đầy đủ`, `Gửi yêu cầu tư vấn`, `Gọi 0963.953.533`.

## External link đã thêm/chuẩn hóa

| Anchor | URL | Rel |
|---|---|---|
| Sở Tài nguyên và Môi trường Quảng Ninh | `https://www.quangninh.gov.vn/so/sotainguyenmt/Trang/default.aspx` | `noopener noreferrer` |
| Báo Tài nguyên & Môi trường | `https://baotainguyenmoitruong.vn/` | `noopener noreferrer` |
| Social/Zalo | Facebook, Zalo, YouTube, TikTok | `nofollow noopener noreferrer` |

## Chưa thêm vì thiếu page/slug an toàn

- Không link `/du-an/` vì live trả 404, thay bằng `/#du-an` và link từng dự án chi tiết.
- Không link `/doi-tac/` vì live trả 404, thay bằng `/#doi-tac`.
- Không link `/ve-sinh-duong-ong/` vì live trả 404.
- Không link Hoành Bồ, Hồng Gai, Cửa Ông, Quang Hanh, Mông Dương vì chưa có landing page an toàn hoặc đang redirect về trang chủ.

## Kiểm tra sau triển khai

- PHP lint: pass cho template chính, plugin chính, shared footer, mobile sticky CTA, render preview.
- Render preview local: pass, không có `href=""`, không có `href="#"`, không có nested `a`.
- Live HTML: 200, marker `2026.05.29.7; direct-template`.
- Live link audit: 140 anchor, 0 href rỗng, 0 nested `a`, 32 internal URL kiểm tra đều 200.
- External link audit: 9 external link, 0 link thiếu `target/rel`.
- Chrome headless desktop/mobile: 0 console error, 6 service card click được, không overflow ngang.

## Đề xuất tiếp theo

Tạo landing page riêng cho `/du-an/`, `/doi-tac/`, `/ve-sinh-duong-ong/` và các khu vực còn thiếu để mở rộng hub nội bộ mà không trỏ vào 404.
