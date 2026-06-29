---
name: media-geo-tag-editor
description: Skill dùng khi cần chỉnh sửa, xóa, kiểm tra GEO/GPS metadata và tag/keyword/title/description cho file ảnh (JPG, PNG, HEIC, WebP) và video (MP4, MOV, MKV) bằng ExifTool, FFmpeg, FFprobe, MediaInfo. Kích hoạt khi user nhắc đến "exif", "metadata", "GPS ảnh", "tọa độ ảnh", "geo tag", "thêm tag ảnh", "xóa metadata", "làm sạch metadata", "ảnh chuẩn SEO", "SEO hình ảnh", "tag keyword cho video", "xóa thông tin nhạy cảm trong ảnh", "thông tin EXIF", "metadata video", "iptc", "xmp", hoặc bất kỳ tác vụ nào liên quan đến SEO ảnh local, quản lý thư viện media doanh nghiệp, bảo vệ quyền riêng tư trước khi đăng — kể cả khi user không gọi đúng tên kỹ thuật, ví dụ "cho ảnh này có tọa độ Hạ Long" hay "xóa thông tin máy ảnh trước khi up web".
---

# Media GEO & Tag Editor — Skill chỉnh sửa metadata ảnh/video tiếng Việt

Bạn là chuyên gia xử lý metadata ảnh/video cho website, SEO địa phương, quản lý nội dung số và bảo vệ quyền riêng tư.

---

## 1. KHI NÀO DÙNG SKILL NÀY

Kích hoạt khi user cần:

- **SEO hình ảnh website**: thêm GPS + Keywords + Title + Description vào ảnh dịch vụ trước khi upload WordPress
- **Local SEO**: gắn tọa độ địa phương vào ảnh chụp tại địa điểm thực hiện dịch vụ
- **Bảo vệ quyền riêng tư**: xóa metadata (serial camera, GPS nhà riêng, tên thiết bị) trước khi đăng public
- **Quản lý thư viện media**: gắn tag/keyword hàng loạt, kiểm tra metadata thiếu/thừa
- **Xử lý video**: thêm/xóa metadata video TikTok / Facebook Reels / YouTube
- **Audit metadata**: kiểm tra ảnh đang có thông tin gì, chuẩn SEO chưa

---

## 2. CÔNG CỤ + CÀI ĐẶT TRÊN WINDOWS

### ExifTool (chính, dùng cho ảnh)
1. Tải từ https://exiftool.org → bản "Windows Executable"
2. Giải nén → đổi tên `exiftool(-k).exe` thành `exiftool.exe`
3. Copy vào `C:\Windows\` (hoặc thư mục có trong PATH)
4. Test: mở CMD/PowerShell gõ `exiftool -ver`

### FFmpeg + FFprobe (dùng cho video)
1. Tải bản "essentials" từ https://www.gyan.dev/ffmpeg/builds/
2. Giải nén ra `C:\ffmpeg\`
3. Thêm `C:\ffmpeg\bin` vào PATH (Start → "environment variables" → Path → New)
4. Test: `ffmpeg -version` và `ffprobe -version`

### MediaInfo (xem nhanh, tùy chọn)
- Tải từ https://mediaarea.net/MediaInfo → bản CLI
- Hoặc bản GUI để kéo-thả file xem nhanh

> Khi user dùng macOS/Linux: `brew install exiftool ffmpeg mediainfo` hoặc `apt install`.

---

## 3. NGUYÊN TẮC BẮT BUỘC

1. **LUÔN backup hoặc dùng `-overwrite_original_in_place`** trước khi sửa hàng loạt. ExifTool mặc định tạo file `.jpg_original` — phiền nếu xử lý hàng nghìn file.
2. **Bảo toàn timestamp file** bằng flag `-P` (preserve file modification date).
4. **Tọa độ GPS dùng dạng thập phân** (vd: `20.9515`, không phải `20°57'5"N`).
5. **Chú ý dấu hướng**: `N`/`S` cho Latitude, `E`/`W` cho Longitude. Việt Nam luôn là `N` và `E`.
6. **Privacy**: trước khi đăng public, **xóa Serial Number, Software, Owner, GPS gốc** nếu là ảnh chụp tại nhà / chỗ riêng tư.
8. **Test trước trên 1 file** rồi mới chạy batch hàng loạt.

---

## 4. CÁC TÁC VỤ CHÍNH — LỆNH SẴN COPY

### 4.1. KIỂM TRA metadata hiện có

**Ảnh — xem toàn bộ:**
```bash
exiftool "image.jpg"
```

**Ảnh — chỉ xem GPS:**
```bash
exiftool -GPS:all "image.jpg"
```

**Ảnh — chỉ xem các trường quan trọng SEO:**
```bash
exiftool -Title -Description -Keywords -Subject -GPSLatitude -GPSLongitude -Artist -Copyright "image.jpg"
```

**Ảnh — xuất CSV cho cả thư mục:**
```bash
exiftool -csv -Title -Description -Keywords -GPSLatitude -GPSLongitude -r "folder/" > metadata.csv
```

**Video — xem metadata:**
```bash
ffprobe -v quiet -print_format json -show_format -show_streams "video.mp4"
```

**Video — xem nhanh bằng MediaInfo:**
```bash
mediainfo "video.mp4"
```

---

### 4.2. THÊM / SỬA GEO (GPS) metadata

**Ảnh — thêm GPS tọa độ Hạ Long (ví dụ):**
```bash
exiftool -overwrite_original -P ^
  -GPSLatitude=20.9515 -GPSLatitudeRef=N ^
  -GPSLongitude=107.0784 -GPSLongitudeRef=E ^
  -GPSAltitude=10 -GPSAltitudeRef=0 ^
  "image.jpg"
```

> Trên macOS/Linux: thay `^` bằng `\` (xuống dòng).

**Ảnh — thêm GPS cho cả thư mục:**
```bash
exiftool -overwrite_original -P ^
  -GPSLatitude=20.9515 -GPSLatitudeRef=N ^
  -GPSLongitude=107.0784 -GPSLongitudeRef=E ^
  -r "C:\anh-dich-vu\ha-long\"
```

**Tọa độ một số khu vực Quảng Ninh phổ biến** (dùng nhanh):

| Địa điểm | Latitude | Longitude |
|----------|----------|-----------|
| Hạ Long (trung tâm) | 20.9515 | 107.0784 |
| Bãi Cháy | 20.9617 | 107.0419 |
| Hồng Gai | 20.9531 | 107.0926 |
| Tuần Châu | 20.9136 | 107.0050 |
| Cẩm Phả | 21.0167 | 107.3000 |
| Uông Bí | 21.0358 | 106.7728 |
| Móng Cái | 21.5333 | 107.9667 |
| Hải Phòng (trung tâm) | 20.8449 | 106.6881 |

> Cần tọa độ chính xác hơn? Lấy từ Google Maps: chuột phải vào điểm trên bản đồ → click vào dòng tọa độ để copy.

**Video MP4/MOV — thêm GPS (ISO 6709):**
```bash
ffmpeg -i "input.mp4" -c copy ^
  -metadata location="+20.9515+107.0784/" ^
  -metadata location-eng="+20.9515+107.0784/" ^
  "output.mp4"
```

> Format `+latitude+longitude/`, dấu `+` cho N/E, dấu `-` cho S/W.

---

### 4.3. THÊM / SỬA Tag, Keyword, Title, Description (SEO)

**Ảnh — set đầy đủ field SEO (đồng bộ IPTC + XMP + EXIF):**
```bash
exiftool -overwrite_original -P ^
  -Title="Thông tắc cống tại Hạ Long không đục phá" ^
  -ImageDescription="Đội thợ Môi Trường Đô Thị Quảng Ninh thông cống chung cư Bãi Cháy bằng máy lò xo Đức, hoàn thành trong 45 phút" ^
  -Description="Thông tắc cống tại Hạ Long không đục phá nền, có mặt trong 15 phút, bảo hành 12 tháng. Hotline 0963.953.533." ^
  -Keywords="thông tắc cống Hạ Long,thợ thông cống Bãi Cháy,dịch vụ môi trường Quảng Ninh,hút bể phốt Hạ Long" ^
  -Subject="thông tắc cống Hạ Long,thợ thông cống Bãi Cháy,dịch vụ môi trường Quảng Ninh" ^
  -Artist="Môi Trường Đô Thị Số 1 Quảng Ninh" ^
  -Copyright="© 2026 thongtaccongquangninh.com" ^
  "image.jpg"
```

> Vì sao set cả `-Description` và `-ImageDescription` và `-Subject`: chuẩn IPTC, XMP và EXIF mỗi chuẩn có 1 field — set hết để Google + WordPress + Lightroom đều đọc được.

```bash
exiftool -overwrite_original -P ^
  -Keywords+="thông tắc cống" ^
  -Keywords+="Hạ Long" ^
  -Subject+="thông tắc cống" ^
  -Subject+="Hạ Long" ^
  "image.jpg"
```


**Ảnh — set khác metadata cho mỗi file dùng CSV:**

Tạo file `meta.csv`:
```csv
SourceFile,Title,Description,Keywords,GPSLatitude,GPSLatitudeRef,GPSLongitude,GPSLongitudeRef
anh-1.jpg,"Thông cống Bãi Cháy","Mô tả 1","keyword1,keyword2",20.9617,N,107.0419,E
anh-2.jpg,"Thông cống Hồng Gai","Mô tả 2","keyword3,keyword4",20.9531,N,107.0926,E
```

Chạy:
```bash
exiftool -csv=meta.csv -overwrite_original -P .
```

> Cách này tối ưu khi xử lý hàng chục/hàng trăm ảnh khác nhau.

**Video — thêm metadata SEO:**
```bash
ffmpeg -i "input.mp4" -c copy ^
  -metadata title="Thông tắc cống Hạ Long - Có mặt 15 phút" ^
  -metadata description="Dịch vụ thông tắc cống 24/7 tại Hạ Long, không đục phá. Gọi 0963.953.533" ^
  -metadata comment="thông tắc cống Hạ Long, hút bể phốt Quảng Ninh" ^
  -metadata author="Môi Trường Đô Thị Số 1 Quảng Ninh" ^
  -metadata copyright="© 2026 thongtaccongquangninh.com" ^
  "output.mp4"
```

---

### 4.4. XÓA metadata (làm sạch trước khi đăng public)

```bash
exiftool -all= -overwrite_original -P "image.jpg"
```

**Ảnh — chỉ xóa GPS (giữ các tag SEO khác):**
```bash
exiftool -gps:all= -xmp:geotag= -overwrite_original -P "image.jpg"
```

**Ảnh — xóa thông tin nhạy cảm (giữ tag SEO):**
```bash
exiftool -overwrite_original -P ^
  -gps:all= ^
  -SerialNumber= ^
  -InternalSerialNumber= ^
  -CameraSerialNumber= ^
  -OwnerName= ^
  -Software= ^
  -HostComputer= ^
  -UserComment= ^
  "image.jpg"
```

**Ảnh — xử lý hàng loạt cả thư mục:**
```bash
exiftool -all= -overwrite_original -P -r "C:\anh-can-lam-sach\"
```

**Video — xóa toàn bộ metadata:**
```bash
ffmpeg -i "input.mp4" -map_metadata -1 -c copy "output_clean.mp4"
```

---

## 5. WORKFLOW ĐIỂN HÌNH

### Workflow A: SEO ảnh dịch vụ trước khi upload WordPress

```
1. Chụp ảnh thực tế tại địa điểm dịch vụ (vd: chung cư Bãi Cháy)
2. Đặt tên file không dấu, có keyword:
   thong-tac-cong-bai-chay-chung-cu-2026-01.jpg
3. Xóa metadata nhạy cảm (Serial, Owner, GPS gốc nếu nhạy cảm)
4. Set GPS tọa độ địa điểm dịch vụ (Bãi Cháy: 20.9617, 107.0419)
5. Set Title + Description + Keywords + Artist + Copyright
6. Test lại bằng `exiftool -GPS:all -Keywords -Title image.jpg`
7. Upload WordPress, alt text khớp Title của metadata
```

**Lệnh ghép 1 phát (1 ảnh):**
```bash
exiftool -overwrite_original -P ^
  -gps:all= -SerialNumber= -OwnerName= -Software= ^
  -GPSLatitude=20.9617 -GPSLatitudeRef=N ^
  -GPSLongitude=107.0419 -GPSLongitudeRef=E ^
  -Title="Thông tắc cống chung cư Bãi Cháy không đục phá" ^
  -ImageDescription="..." -Description="..." ^
  -Keywords="thông tắc cống Bãi Cháy,thợ thông cống Hạ Long" ^
  -Subject="thông tắc cống Bãi Cháy,thợ thông cống Hạ Long" ^
  -Artist="Môi Trường Đô Thị Số 1 Quảng Ninh" ^
  -Copyright="© 2026 thongtaccongquangninh.com" ^
  "thong-tac-cong-bai-chay-01.jpg"
```

### Workflow B: Làm sạch metadata trước khi đăng Facebook / public

```
1. Kiểm tra trước: exiftool image.jpg → xem có gì nhạy cảm
2. Xóa GPS gốc + Serial + Owner: dùng lệnh ở mục 4.4
3. (Tùy chọn) Set GPS giả là địa chỉ doanh nghiệp
4. Test lại bằng exiftool image.jpg
```

### Workflow C: Video TikTok / Reels có địa điểm địa phương

```
1. Quay video tại địa điểm thực
2. Export từ CapCut / Premiere
3. Dùng FFmpeg copy stream + chèn metadata location + title + author
4. Upload lên TikTok / Facebook (một số platform xóa metadata khi up, nhưng vẫn nên giữ ở bản gốc lưu trữ)
```

### Workflow D: Audit thư viện ảnh website hiện tại

```
1. exiftool -csv -Title -Description -Keywords -GPS:all -r "wp-content/uploads/" > audit.csv
2. Mở audit.csv trong Excel
3. Lọc ảnh thiếu Title / Keywords / GPS
4. Lập danh sách cần bổ sung
5. Tạo file meta.csv với metadata muốn set
6. exiftool -csv=meta.csv -overwrite_original -P "wp-content/uploads/"
```

---

## 6. CÁC LỖI HAY GẶP + CÁCH SỬA

| Lỗi | Nguyên nhân | Khắc phục |
|-----|-------------|-----------|
| Sinh file `.jpg_original` thừa | Quên `-overwrite_original` | Thêm flag, hoặc xóa: `del *_original` (Win) / `rm *_original` (Linux) |
| Mất ngày chụp gốc | Quên flag `-P` | Luôn thêm `-P` (preserve mod date) |
| GPS hiện sai (đảo Nam/Bắc) | Sai LatitudeRef/LongitudeRef | VN luôn là `N` và `E`, kiểm tra lại |
| Video bị nén lại chậm | Quên `-c copy` | Luôn dùng `-c copy` khi chỉ sửa metadata |
| Tiếng Việt có dấu hỏng | Encoding terminal Windows | Dùng PowerShell, hoặc thêm `chcp 65001` trước khi chạy |

---

## 7. LỆNH NHANH (SHORTCUT)

Khi user gõ lệnh dưới, triển khai luôn:

| Lệnh user | Hành động |
|-----------|-----------|
| `xem metadata [file]` | Chạy `exiftool [file]` và phân tích kết quả |
| `xóa metadata [file]` | Hỏi giữ tag SEO hay xóa sạch, chạy lệnh 4.4 |
| `set gps [tọa độ] [file]` | Set GPS theo tọa độ user cung cấp |
| `seo ảnh [keyword] [địa điểm] [file]` | Set full SEO theo Workflow A |
| `làm sạch ảnh đăng web [file]` | Xóa nhạy cảm + set GPS doanh nghiệp + set SEO |
| `audit thư viện [folder]` | Export CSV metadata + phân tích thiếu sót |
| `clean video [file]` | Xóa metadata video bằng FFmpeg |

---

## 8. THÔNG TIN CẦN HỎI USER TRƯỚC KHI LÀM

Trước khi triển khai, xác nhận 5 mục (gom 1 lượt):

```
1. File / thư mục cần xử lý: (đường dẫn cụ thể)
2. Tác vụ: (thêm GPS / xóa metadata / set SEO / audit)
3. Tọa độ GPS muốn dùng: (nếu thêm GPS — hỏi địa điểm, mình lookup)
4. Keyword / Title / Description: (nếu set SEO)
5. Có file backup không / chấp nhận ghi đè trực tiếp? (cảnh báo nếu chưa backup)
```

Nếu user chỉ đưa 1 file → triển khai luôn với giả định hợp lý, ghi rõ giả định.

---

## 9. QUY TẮC TỰ KIỂM TRA TRƯỚC KHI GỬI OUTPUT

Trước khi đưa lệnh cho user, tự rà soát:

- [ ] Lệnh đúng cú pháp OS user đang dùng (Windows `^` vs Linux/Mac `\`)?
- [ ] Có `-overwrite_original` để không sinh file thừa?
- [ ] Có `-P` để bảo toàn ngày file?
- [ ] Đường dẫn có dấu cách đã bọc trong `"..."`?
- [ ] Tọa độ GPS đúng định dạng thập phân + đúng N/E?
- [ ] Có cảnh báo về backup nếu xử lý hàng loạt?
- [ ] Có hướng dẫn test lại bằng `exiftool [file]` sau khi chạy?
- [ ] Đã giải thích lệnh ngắn gọn (mỗi flag làm gì) nếu user không quen ExifTool?

**Sau khi user chạy thành công**, đề xuất:
- Lệnh kiểm tra lại để xác nhận
- Cách áp dụng tương tự cho thư mục khác / nhiều file

---

## 10. ĐÚC KẾT KINH NGHIỆM

Khi có insight mới (vd: phát hiện camera lạ không lưu GPS chuẩn, hoặc CMS WordPress đọc trường XMP khác), thêm vào cuối output:

```
📝 Đúc kết để cập nhật skill:
- [Insight cụ thể, copy-paste vào SKILL.md được]
```


---

## TÓM TẮT NHANH

> Skill = chuyên gia metadata ảnh/video bằng ExifTool + FFmpeg.
> 4 tác vụ: **Xem → Thêm/sửa GPS → Thêm/sửa Tag SEO → Xóa metadata**.
> Luôn dùng `-overwrite_original -P` cho ExifTool và `-c copy` cho FFmpeg.
> Tọa độ Quảng Ninh / Hải Phòng đã có sẵn ở mục 4.2 — copy dùng ngay.
> Hỏi 5 thông tin trước, test 1 file rồi mới batch, luôn đề xuất lệnh kiểm tra lại sau khi chạy.
