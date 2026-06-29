# Audit SEO live moitruongdongbac.com

Ngày kiểm: 2026-05-23  
Phạm vi: audit read-only live website ngoài dự án TTCQN để kiểm thử quy trình `ai-web-seo-workflow`.

## 1. Phạm vi đã kiểm

### URL và bề mặt live

- Trang chủ `https://moitruongdongbac.com/`.
- `robots.txt`, `sitemap.xml`, `sitemap_index.xml`.
- 30 URL trong `page-sitemap.xml` và `post-sitemap.xml`.
- Mẫu landing quan trọng:
  - `/thong-tac-cong`
  - `/thong-tac-cong-hai-phong`
  - `/thong-tac-cong/hai-phong`
  - `/hut-be-phot`
  - `/hut-be-phot-hai-phong`
  - `/hut-be-phot/hai-phong`
  - `/thong-tac-bon-cau`
  - `/hai-phong`
  - `/quang-ninh`
  - `/bao-gia`
  - `/tin-tuc`

### Tín hiệu đã quét

- HTTP status, canonical, robots meta.
- Title, meta description, H1, H2.
- JSON-LD types.
- Sitemap inventory.
- OG/Twitter image trên các trang đại diện.
- Mức trùng nội dung 6-gram trên một số cặp landing địa phương.
- Nội dung visible trang chủ và footer/NAP trên trang giá.

## 2. Kết luận nhanh

Website đang có nền crawl/index cơ bản hoạt động: trang live trả `200`, robots có chỉ dẫn sitemap, Rank Math sitemap hoạt động, canonical self-referencing xuất hiện trên phần lớn URL được quét.

Điểm nghẽn lớn không nằm ở việc website bị chặn crawl. Điểm nghẽn nằm ở **kiến trúc URL, index hygiene, tính nhất quán thương hiệu/khu vực và chuẩn on-page cho các landing kiếm lead**.

## 3. Điểm đang đạt

| Mục | Bằng chứng kiểm |
|---|---|
| Trang chủ và URL sitemap mẫu trả HTTP 200 | Fetch live trực tiếp trong phiên audit. |
| `robots.txt` có `Sitemap: https://moitruongdongbac.com/sitemap_index.xml` | Fetch live `robots.txt`. |
| Sitemap index hoạt động | `sitemap_index.xml` có sitemap post, page, blocks, category và local. |
| Homepage có 1 H1, title, meta description, canonical, robots index/follow | Quét HTML live homepage. |
| Ảnh trong 7 trang đại diện không phát hiện `<img>` thiếu `alt` theo regex HTML | Quét homepage, service, location và bảng giá mẫu. |
| Trang dịch vụ Hải Phòng mới có outline dài hơn | `/thong-tac-cong-hai-phong`, `/hut-be-phot-hai-phong`, `/nao-vet-ho-ga-hai-phong` có nhiều H2 hơn nhóm trang generic. |

## 4. Phát hiện ưu tiên

## P0 - Cần sửa trước

### P0.1. Trang bản nháp SEO đang indexable và nằm trong sitemap

URL:

- `https://moitruongdongbac.com/noi-dung-trang-chu-ban-nhap-seo`

Kết quả live:

- Trả `200`.
- Có canonical self.
- Robots meta `follow, index`.
- Nằm trong `page-sitemap.xml`.
- Title vẫn mang nghĩa bản nháp trang chủ SEO.

Rủi ro:

- Lộ trang vận hành/nội dung thử ra Search.
- Tạo thêm trang cạnh tranh với trang chủ và landing dịch vụ chính.
- Làm index inventory bẩn ngay ở lớp sitemap.

Phương án:

1. Xác định trang này còn dùng để render homepage hay chỉ là bản nháp.
2. Nếu chỉ là bản nháp: đưa về draft/private hoặc `noindex`, loại khỏi sitemap.
3. Nếu nội dung đang cần dùng: hợp nhất vào homepage/landing đích rồi xóa đường index public của bản nháp.

### P0.2. Landing thông tắc cống generic thiếu H1

URL:

- `https://moitruongdongbac.com/thong-tac-cong`

Kết quả live:

- Title và meta description đã nhắm truy vấn thương mại.
- HTML live có `0` thẻ H1.
- JSON-LD trên trang chỉ thấy `SiteNavigationElement` trong lượt parse hiện tại.

Rủi ro:

- Landing tiền có tín hiệu cấu trúc yếu.
- H1 thiếu trong khi site còn có các biến thể URL thông tắc cống Hải Phòng khác đang indexable.

Phương án:

1. Chốt vai trò trang này: hub dịch vụ chung hay landing Hải Phòng.
2. Thêm đúng 1 H1 visible khớp intent đã chọn.
3. Nếu đây không phải URL cần rank cho Hải Phòng, đổi title/meta/copy để không tranh intent với `/thong-tac-cong-hai-phong` và `/thong-tac-cong/hai-phong`.

### P0.3. Template block đang public và được đưa vào sitemap

Sitemap:

- `blocks-sitemap.xml`

URL trong sitemap:

- `https://moitruongdongbac.com/blocks/top`
- `https://moitruongdongbac.com/blocks/foot`

Kết quả live:

- Cả 2 URL trả `200`.
- Không có title, canonical, robots meta, H1, H2, JSON-LD trong lượt quét.

Rủi ro:

- Template fragment đi vào crawl/index surface.
- Sitemap chứa URL không phải landing cho người dùng.

Phương án:

1. Loại post type/template block khỏi sitemap Rank Math.
2. Nếu URL bắt buộc public cho render kỹ thuật, đặt kiểm soát index phù hợp và không để nó xuất hiện trong XML sitemap công khai.

## P1 - Sửa trong batch kế tiếp

### P1.1. Kiến trúc URL đang tạo nhiều trang cùng intent dịch vụ - địa phương

Ví dụ cùng cụm Hải Phòng:

- `/thong-tac-cong-hai-phong`
- `/thong-tac-cong/hai-phong`
- `/thong-tac-cong`

Ví dụ cùng cụm hút bể phốt Hải Phòng:

- `/hut-be-phot-hai-phong`
- `/hut-be-phot/hai-phong`
- `/hut-be-phot`

Kết quả:

- Các URL đều nằm trong sitemap, trả `200` và tự canonical về chính nó trong lượt quét.
- Cặp direct landing và nested landing không trùng nguyên văn cao, nhưng vẫn đè lên cùng intent chính theo title/H1/slug.

Rủi ro:

- Cannibalization.
- Internal link khó dồn sức về một URL tiền.
- Agent về sau dễ tiếp tục viết thêm biến thể cùng ý định tìm kiếm.

Phương án:

1. Lập bảng mapping `intent -> URL primary`.
2. Chọn một URL primary cho từng cặp `dịch vụ + địa phương`.
3. Với URL còn lại: redirect, noindex/hub hóa, hoặc đổi intent rõ ràng; không để nhiều landing giao dịch cùng target như hiện tại.

### P1.2. Trang địa phương Hải Phòng và Quảng Ninh còn template hóa cao

Mẫu đã đo:

- `/hai-phong`
- `/quang-ninh`

Kết quả 6-gram:

- Jaccard khoảng `0.643`.
- Hai trang đều còn nhắc khu vực còn lại nhiều lần do footer/copy dùng chung.

Rủi ro:

- Location page thiếu khác biệt thực thể địa phương.
- Khó thuyết phục Search và người đọc rằng từng trang có giá trị riêng.

Phương án:

1. Giữ mỗi trang địa phương một vai trò rõ: hub khu vực hoặc landing chuyển đổi.
2. Thêm bằng chứng riêng: khu vực phục vụ, loại công trình, logistics, ảnh/case có căn cứ, FAQ địa phương, internal links riêng.
3. Giảm block dùng chung chiếm tỷ trọng quá lớn trên trang location.

### P1.3. NAP và vùng ưu tiên chưa nhất quán

Quan sát live:

- Homepage hiện nói tập trung Hải Phòng, Quảng Ninh là khu vực hỗ trợ phụ.
- Trang `/bao-gia` vẫn hiển thị cả địa chỉ Quảng Ninh và Hải Phòng trong footer/NAP.
- Menu và một số nội dung vẫn xen tín hiệu Quảng Ninh/Hải Phòng theo các lớp template khác nhau.

Rủi ro:

- Entity doanh nghiệp và vùng phục vụ chính bị nhiễu.
- Khó quyết định schema `address`, `areaServed`, LocalBusiness/ProfessionalService cho site.

Phương án:

1. Chốt chiến lược thật: Hải Phòng primary, Quảng Ninh secondary hay hai vùng ngang nhau.
2. Chuẩn hóa NAP/footer/schema theo chiến lược đó.
3. Nếu có nhiều địa chỉ thật, quyết định mô hình entity/address rõ thay vì footer mỗi template một kiểu.

### P1.4. Structured data còn rời rạc

Kết quả parse live:

- Homepage có graph chứa `ProfessionalService|Organization`, `WebSite`, `WebPage`, `VideoObject`.
- `/thong-tac-cong-hai-phong` và `/hut-be-phot-hai-phong` có thêm `FAQPage`.
- Nhiều trang còn lại chỉ có `SiteNavigationElement`.
- `/bao-gia` không thấy JSON-LD trong lượt quét.

Rủi ro:

- Schema không phản ánh nhất quán page type.
- Trang service/location không tận dụng schema hợp nội dung visible.

Phương án:

1. Chốt entity business thật và NAP trước.
2. Chuẩn hóa:
   - home: Organization/LocalBusiness hoặc ProfessionalService theo dữ liệu thật;
   - service page: Service + Breadcrumb khi visible content hỗ trợ;
   - FAQPage chỉ khi có FAQ visible thật;
   - article: BlogPosting/Article khi phù hợp.
3. Không thêm rating/review/case chưa xác minh.

### P1.5. Archive/news và trang giá còn yếu on-page

Kết quả quét:

- `/tin-tuc`: không có H1 và meta description rỗng trong lượt quét.
- `/bao-gia`: có H1 nhưng `0` H2 và không thấy JSON-LD.
- Bài `be-phot-day-mui-hoi-boc-len-goi-xu-ly-ngay-keo-trao-nguoc.html` có `0` H2.

Phương án:

1. Thêm H1/meta description cho archive Tin tức.
2. Tổ chức bảng giá thành section rõ: phạm vi giá, yếu tố làm giá đổi, quy trình báo giá, FAQ, CTA.
3. Sửa bài informational có outline quá mỏng trước khi đẩy thêm bài mới.

## P2 - Nên dọn để tăng trust và CTR

### P2.1. Homepage có lỗi copy và claim thời gian không đồng nhất

Ví dụ quan sát visible text:

- Có cụm lặp `Hải Phòng, Hải Phòng`.
- Một đoạn nói có mặt sau `15 phút`.
- Một CTA khác nói có mặt tại Hải Phòng trong `30-60 phút`.

Phương án:

1. Chốt claim thời gian theo bằng chứng vận hành.
2. Dọn copy lặp địa danh.
3. Tách rõ vùng primary và vùng hỗ trợ để hero, service section, footer nói cùng một thông điệp.

### P2.2. Preferred image/OG image chưa đều

Kết quả kiểm mẫu:

- Homepage không thấy `og:image`.
- `/tin-tuc` không thấy `og:image`.
- `/bao-gia` không thấy `og:image`.
- Landing dịch vụ như `/thong-tac-cong` và `/thong-tac-cong-hai-phong` đã có OG/Twitter image.

Phương án:

1. Gắn preferred image/OG image hợp intent cho homepage, archive quan trọng và trang giá.
2. Tránh logo generic hoặc ảnh text-heavy làm preview chính.

## 5. Gợi ý thứ tự xử lý

## Batch 1 - Index hygiene

1. Xử lý `/noi-dung-trang-chu-ban-nhap-seo`.
2. Loại `blocks/top` và `blocks/foot` khỏi sitemap/index surface.
3. Sửa H1 `/thong-tac-cong`.
4. Sửa H1 + meta description `/tin-tuc`.

## Batch 2 - URL và intent

1. Mapping toàn bộ cặp direct/nested URL theo `dịch vụ + địa phương`.
2. Chọn primary URL cho Hải Phòng trước.
3. Dồn title, H1, internal links, CTA, schema vào URL primary.

## Batch 3 - Entity/schema/content

1. Chốt chiến lược NAP/vùng phục vụ.
2. Chuẩn hóa footer/home/contact/schema.
3. Rewrite location hubs còn template hóa cao.
4. Củng cố trang giá và bài informational outline yếu.

## 6. Điều chưa kiểm xong

- Chưa đăng nhập Search Console, GA4, Business Profile.
- Chưa kiểm index/rich result report trong tài khoản Google.
- Chưa có kết quả PageSpeed Insights trong phiên này vì API PageSpeed trả quota `429` cho cả mobile và desktop.
- Chưa kiểm rendering bằng screenshot mobile/desktop trên trình duyệt thật.

## 7. Kết luận hành động

Website có thể tiếp tục tối ưu được ngay. Nhưng trước khi viết thêm nhiều landing mới, cần dọn **trang nháp indexable**, **template block trong sitemap**, **cấu trúc URL trùng intent** và **NAP/vùng SEO chưa thống nhất**. Nếu không, nội dung mới sẽ tiếp tục đổ vào một hệ thống còn nhiễu.
