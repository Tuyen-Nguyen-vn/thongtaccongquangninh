# Service Schema Extension 2026-05-22

## Phạm vi đã triển khai

- Mở rộng plugin `ttcqn-doorway-schema` thành `TTCQN Service Schema` version `2026.05.22.2`.
- Giữ nguyên 14 trang doorway đang có `Service schema`.
- Bổ sung schema cho 6 trang dịch vụ chính:
  - `/hut-be-phot-quang-ninh/`
  - `/thong-tac-cong-quang-ninh/`
  - `/thong-tac-bon-cau-quang-ninh/`
  - `/thong-tac-chau-rua-quang-ninh/`
  - `/nao-vet-ho-ga-quang-ninh/`
  - `/xu-ly-mui-hoi-quang-ninh/`
- Bổ sung `OfferCatalog` cho `/bang-gia/`.
- Bổ sung `ContactPage` cho `/lien-he/`.

## Cấu trúc chính

- Mỗi `Service` có `@id` dạng `<url>#service`.
- `provider` trỏ về `https://thongtaccongquangninh.com/#localbusiness`.
- `areaServed` cho dịch vụ chính là `AdministrativeArea: Quảng Ninh`.
- `areaServed` cho trang địa phương là `City` + `containedInPlace: Quảng Ninh` + `GeoCoordinates`.
- Các block `Service` cũ thiếu `@id` hoặc thiếu `name` bị loại trên trang target để tránh trùng schema yếu.

## Kiểm tra live

- 6/6 trang dịch vụ chính HTTP 200, 1 H1, JSON-LD parse 0 lỗi.
- 6/6 trang dịch vụ chính có đúng 1 `Service` marked bằng `data-ttcqn-doorway-schema`.
- 6/6 trang dịch vụ chính không còn `weakService`.
- `/bang-gia/` HTTP 200, có `OfferCatalog`, JSON-LD parse 0 lỗi.
- `/lien-he/` HTTP 200, có `ContactPage`, JSON-LD parse 0 lỗi.
- 14/14 trang doorway cũ vẫn HTTP 200, còn `Service` đúng `@id`, JSON-LD parse 0 lỗi.
- Trang chủ HTTP 200, không bị inject schema doorway/service; schema trang chủ vẫn dùng `data-ttcqn-home-schema`.

## File đã sửa

- `tools/wp-plugins/ttcqn-doorway-schema/ttcqn-doorway-schema.php`
- `tools/_pack_zips.py`
- `WORDPRESS_SERVICE_SCHEMA_UPLOAD_2026-05-22.json`
- `reports/service-schema-extension-2026-05-22.md`
- `docs/SEO_PROGRESS.csv`
