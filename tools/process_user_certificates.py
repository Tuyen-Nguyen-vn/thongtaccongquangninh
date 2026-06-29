import os
from PIL import Image
import piexif

def decimal_to_dms(val):
    degrees = int(val)
    minutes_float = (val - degrees) * 60
    minutes = int(minutes_float)
    seconds = (minutes_float - minutes) * 60
    return (
        (degrees, 1),
        (minutes, 1),
        (int(round(seconds * 100)), 100)
    )

def main():
    brain_dir = r"C:\Users\DELL\.gemini\antigravity\brain\519eba44-962d-44b9-8d0d-b8728bef74ce"
    out_dir = r"D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO"
    
    os.makedirs(out_dir, exist_ok=True)
    
    # 6 images mapping (first 3 and 3 new ones)
    images_config = [
        {
            "src": "media__1782583337677.jpg",
            "dest": "bang-khen-bo-tai-nguyen-moi-truong-moi-truong-do-thi-so-1-quang-ninh-2023-ha-long.jpg",
            "title": "Bằng khen Bộ trưởng Bộ Tài nguyên và Môi trường tặng Công ty CP Môi trường Đô thị Số 1 Quảng Ninh - 2023",
            "desc": "Bằng khen của Bộ trưởng Bộ Tài nguyên và Môi trường trao tặng cho Công ty Cổ phần Môi trường Đô thị Số 1 Quảng Ninh vì đã có thành tích tiêu biểu trong lĩnh vực tài nguyên và môi trường năm 2023. Đơn vị uy tín chuyên thông tắc cống, hút bể phốt tại Quảng Ninh. Hotline: 0963.953.533 / 0931.156.756",
            "keywords": "bằng khen bộ tài nguyên môi trường, công ty môi trường đô thị số 1 quảng ninh, thông tắc cống quảng ninh, hút bể phốt quảng ninh, thông tắc cống hạ long, hút bể phốt hạ long, dịch vụ vệ sinh môi trường quảng ninh"
        },
        {
            "src": "media__1782583337680.jpg",
            "dest": "nguyen-song-hao-ky-niem-chuong-doanh-nhan-tre-viet-nam-2022-ha-long.jpg",
            "title": "Kỷ niệm chương Vì sự phát triển phong trào Doanh nhân trẻ Việt Nam tặng Anh Nguyễn Song Hào",
            "desc": "Giấy chứng nhận Kỷ niệm chương Vì sự phát triển phong trào Doanh nhân trẻ Việt Nam trao tặng cho Anh Nguyễn Song Hào - Phó Chủ tịch Hội Doanh nhân trẻ tỉnh Quảng Ninh, Phó Chủ tịch Công ty CP Môi trường Đô thị Số 1 Quảng Ninh (Môi trường Đông Bắc). Hotline hỗ trợ: 0963.953.533 / 0931.156.756",
            "keywords": "nguyễn song hào, kỷ niệm chương doanh nhân trẻ, hội doanh nhân trẻ quảng ninh, công ty môi trường đô thị số 1 quảng ninh, thông tắc cống quảng ninh, hút bể phốt quảng ninh, hạ long"
        },
        {
            "src": "media__1782583337690.jpg",
            "dest": "bang-khen-bo-tai-nguyen-moi-truong-moi-truong-do-thi-so-1-quang-ninh-2024-ha-long.jpg",
            "title": "Bằng khen Bộ trưởng Bộ Tài nguyên và Môi trường tặng Môi trường Đô thị Số 1 Quảng Ninh - 2024",
            "desc": "Bằng khen của Bộ trưởng Bộ Tài nguyên và Môi trường trao tặng cho Môi trường Đô thị Số 1 Quảng Ninh vì đã có thành tích đóng góp vào sự phát triển ngành Tài nguyên và Môi trường năm 2024. Hotline hỗ trợ 24/7: 0963.953.533 / 0931.156.756",
            "keywords": "bằng khen bộ tài nguyên môi trường 2024, môi trường đô thị số 1 quảng ninh, thông tắc cống quảng ninh, hút bể phốt quảng ninh, thông tắc cống hạ long, hút bể phốt hạ long, môi trường quảng ninh"
        },
        {
            "src": "media__1782585583664.jpg",
            "dest": "giay-chung-nhan-dao-tao-nghiep-vu-bao-ve-moi-truong-ha-long.jpg",
            "title": "Giấy chứng nhận Đào tạo Nghiệp vụ Bảo vệ Môi trường",
            "desc": "Giấy chứng nhận Đào tạo Nghiệp vụ Bảo vệ Môi trường do cơ quan chức năng cấp cho cán bộ nhân viên Công ty Cổ phần Môi trường Đô thị Số 1 Quảng Ninh. Hotline hỗ trợ dịch vụ: 0963.953.533 / 0931.156.756",
            "keywords": "giấy chứng nhận bảo vệ môi trường, đào tạo nghiệp vụ bảo vệ môi trường, công ty môi trường đô thị số 1 quảng ninh, thông tắc cống quảng ninh, hút bể phốt quảng ninh, hạ long"
        },
        {
            "src": "media__1782585583693.jpg",
            "dest": "chung-nhan-iso-9001-2015-moi-truong-do-thi-so-1-quang-ninh-ha-long.jpg",
            "title": "Giấy chứng nhận ISO 9001:2015 - Công ty Môi trường Đô thị Số 1 Quảng Ninh",
            "desc": "Chứng nhận hệ thống quản lý chất lượng ISO 9001:2015 cấp cho Công ty Cổ phần Môi trường Đô thị Số 1 Quảng Ninh (HTI Investment and Technologies Joint Stock Company) cho phạm vi Dịch vụ Vệ sinh Môi trường Đô thị tại địa chỉ 111 Cái Lân, Bãi Cháy, Hạ Long. Hotline: 0963.953.533 / 0931.156.756",
            "keywords": "iso 9001 2015, chứng nhận iso 9001, công ty môi trường đô thị số 1 quảng ninh, vệ sinh môi trường đô thị, thông tắc cống hạ long, hút bể phốt hạ long, bãi cháy"
        },
        {
            "src": "media__1782585583776.png",
            "dest": "chung-chi-cong-nhan-iso-iec-17025-2017-phong-quan-ly-chat-luong-moi-truong-ha-long.jpg",
            "title": "Chứng chỉ công nhận ISO/IEC 17025:2017 - Phòng Quản lý Chất lượng và Môi trường",
            "desc": "Chứng chỉ công nhận phòng thí nghiệm đạt chuẩn ISO/IEC 17025:2017 cấp cho Phòng Quản lý Chất lượng và Môi trường thuộc Công ty Môi trường Đô thị Số 1 Quảng Ninh cho lĩnh vực Thử nghiệm Hóa. Địa chỉ: 111 Cái Lân, Bãi Cháy, Hạ Long. Hotline liên hệ: 0963.953.533 / 0931.156.756",
            "keywords": "iso iec 17025 2017, chứng chỉ công nhận phòng thí nghiệm, phòng quản lý chất lượng môi trường, công ty môi trường đô thị số 1 quảng ninh, thử nghiệm hóa, hạ long, bãi cháy"
        }
    ]
    
    # Coordinates for Ha Long
    lat = 20.9508
    lon = 107.0733
    
    for cfg in images_config:
        src_path = os.path.join(brain_dir, cfg["src"])
        dest_path = os.path.join(out_dir, cfg["dest"])
        
        if not os.path.exists(src_path):
            print(f"Lỗi: Không tìm thấy file nguồn {src_path}")
            continue
            
        print(f"Đang xử lý {cfg['src']} -> {cfg['dest']}...")
        
        # 1. Open and resize to standard size (max 1200px width/height)
        img = Image.open(src_path)
        img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
        
        # 2. Build EXIF
        exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": None}
        
        # GPS tags
        exif_dict["GPS"][piexif.GPSIFD.GPSLatitudeRef] = b"N"
        exif_dict["GPS"][piexif.GPSIFD.GPSLatitude] = decimal_to_dms(lat)
        exif_dict["GPS"][piexif.GPSIFD.GPSLongitudeRef] = b"E"
        exif_dict["GPS"][piexif.GPSIFD.GPSLongitude] = decimal_to_dms(lon)
        
        # Image description and titles
        exif_dict["0th"][piexif.ImageIFD.ImageDescription] = cfg["desc"].encode("utf-8")
        exif_dict["0th"][piexif.ImageIFD.XPTitle] = cfg["title"].encode("utf-16le")
        exif_dict["0th"][piexif.ImageIFD.XPKeywords] = cfg["keywords"].encode("utf-16le")
        
        # Dump exif
        exif_bytes = piexif.dump(exif_dict)
        
        # Save as JPG with exif and optimal quality
        # convert to RGB if it was RGBA or other modes
        if img.mode != "RGB":
            img = img.convert("RGB")
            
        img.save(dest_path, "JPEG", quality=85, exif=exif_bytes)
        
        # Verify sizes
        out_size_kb = os.path.getsize(dest_path) / 1024
        print(f"Đã lưu thành công: {dest_path} ({out_size_kb:.2f} KB)")
        
        # Simple verification of written EXIF
        verify_data = piexif.load(dest_path)
        title_verified = bytes(verify_data["0th"].get(piexif.ImageIFD.XPTitle, [])).decode("utf-16le")
        gps_verified = verify_data["GPS"].get(piexif.GPSIFD.GPSLatitude)
        print(f"  [Xác thực EXIF] Tiêu đề: '{title_verified}'")
        print(f"  [Xác thực EXIF] Tọa độ GPS: {gps_verified}")

if __name__ == "__main__":
    main()
