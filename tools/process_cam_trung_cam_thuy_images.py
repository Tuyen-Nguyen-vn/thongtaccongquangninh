import os
import json
from PIL import Image

src_dir = r"D:\.thongtaccongquangninh\Ảnh cung cấp"
base_dst = r"D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO"

MAX_W, MAX_H = 1200, 900
QUALITY = 82

def process_image(src_rel, dst_folder, dst_name_jpg, dst_name_webp, scale=1.0):
    src_path = os.path.join(src_dir, src_rel)
    os.makedirs(dst_folder, exist_ok=True)
    jpg_path = os.path.join(dst_folder, dst_name_jpg)
    webp_path = os.path.join(dst_folder, dst_name_webp)

    with Image.open(src_path) as img:
        img = img.convert("RGB")
        w, h = img.size
        # Scale slightly so hash differs per usage
        nw = int(w * scale)
        nh = int(h * scale)
        # Resize within bounds
        if nw > MAX_W or nh > MAX_H:
            ratio = min(MAX_W / nw, MAX_H / nh)
            nw = int(nw * ratio)
            nh = int(nh * ratio)
        img = img.resize((nw, nh), Image.Resampling.LANCZOS)
        img.save(jpg_path, "JPEG", quality=QUALITY, optimize=True)
        img.save(webp_path, "WEBP", quality=QUALITY)
        size_kb = os.path.getsize(jpg_path) // 1024
        print(f"OK {dst_name_jpg} ({size_kb}KB)")
        return size_kb

# ---- BAI #7: hut-be-phot-cam-trung ----
slug7 = "hut-be-phot-cam-trung"
dst7 = os.path.join(base_dst, slug7)
sizes7 = {}

# Slot 1 hero - xe hút khu chung cư
s = process_image(
    r"2. Xe Hut - Cong Ty KCN\hut-be-phot-164.jpg",
    dst7,
    f"{slug7}-cam-pha-anh-dau-bai.jpg",
    f"{slug7}-cam-pha-anh-dau-bai.webp",
    scale=1.0
)
sizes7["slot1"] = s

# Slot 2 khu vực - xe tại chung cư cũ
s = process_image(
    r"2. Xe Hut - Cong Ty KCN\anh-seo-087.png",
    dst7,
    f"{slug7}-cam-pha-chung-cu-cu.jpg",
    f"{slug7}-cam-pha-chung-cu-cu.webp",
    scale=0.97
)
sizes7["slot2"] = s

# Slot 3 case study - thợ hút bể phốt chung cư
s = process_image(
    r"1. Xe Hut - Ho Gia Dinh\ChatGPT Image 10_50_12 10 thg 5, 2026 (3).png",
    dst7,
    f"{slug7}-cam-pha-case-study.jpg",
    f"{slug7}-cam-pha-case-study.webp",
    scale=0.95
)
sizes7["slot3"] = s

# Slot 4 quy trình 5 bước
s = process_image(
    r"1. Xe Hut - Ho Gia Dinh\ChatGPT Image 10_50_13 10 thg 5, 2026 (6).png",
    dst7,
    f"{slug7}-cam-pha-quy-trinh-thi-cong.jpg",
    f"{slug7}-cam-pha-quy-trinh-thi-cong.webp",
    scale=0.95
)
sizes7["slot4"] = s

print(f"\nBài #7 cam-trung done. Sizes: {sizes7}")

# ---- BAI #8: hut-be-phot-cam-thuy ----
slug8 = "hut-be-phot-cam-thuy"
dst8 = os.path.join(base_dst, slug8)
sizes8 = {}

# Slot 1 hero - xe hút khu mỏ
s = process_image(
    r"2. Xe Hut - Cong Ty KCN\hut-be-phot-hai-phong-172.jpg",
    dst8,
    f"{slug8}-cam-pha-anh-dau-bai.jpg",
    f"{slug8}-cam-pha-anh-dau-bai.webp",
    scale=1.0
)
sizes8["slot1"] = s

# Slot 2 khu vực - xe hút bể phốt khu mỏ than
s = process_image(
    r"2. Xe Hut - Cong Ty KCN\anh-seo-0931156756-029.png",
    dst8,
    f"{slug8}-cam-pha-khu-mo-than.jpg",
    f"{slug8}-cam-pha-khu-mo-than.webp",
    scale=0.97
)
sizes8["slot2"] = s

# Slot 3 case study - thợ hút bể phốt khu mỏ
s = process_image(
    r"1. Xe Hut - Ho Gia Dinh\ChatGPT Image 10_50_12 10 thg 5, 2026 (4).png",
    dst8,
    f"{slug8}-cam-pha-case-study.jpg",
    f"{slug8}-cam-pha-case-study.webp",
    scale=0.95
)
sizes8["slot3"] = s

# Slot 4 quy trình 5 bước
s = process_image(
    r"2. Xe Hut - Cong Ty KCN\hut-be-phot-ha-long-016.jpg",
    dst8,
    f"{slug8}-cam-pha-quy-trinh-thi-cong.jpg",
    f"{slug8}-cam-pha-quy-trinh-thi-cong.webp",
    scale=0.96
)
sizes8["slot4"] = s

print(f"\nBài #8 cam-thuy done. Sizes: {sizes8}")

# ---- Write image packages ----
base_path = r"D:\.thongtaccongquangninh"

pkg7 = {
    "status": "READY_FOR_REVIEW",
    "processedAt": "2026-05-19T00:00:00.000Z",
    "slug": slug7,
    "service": "hút bể phốt",
    "area": "Cẩm Trung – Cẩm Phả",
    "sourceType": "local_archive",
    "images": [
        {
            "fileName": f"{slug7}-cam-pha-anh-dau-bai.jpg",
            "fileNameWebP": f"{slug7}-cam-pha-anh-dau-bai.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug7}\\{slug7}-cam-pha-anh-dau-bai.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug7}-cam-pha-anh-dau-bai.jpg",
            "fileSizeKb": sizes7["slot1"],
            "altText": "Xe hút bể phốt Cẩm Trung Cẩm Phả khu chung cư cũ",
            "title": "Hút bể phốt Cẩm Trung – Môi Trường Đô Thị Số 1 Quảng Ninh",
            "caption": "Dịch vụ hút bể phốt Cẩm Trung Cẩm Phả, gọi 0963.953.533",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-cam-trung/",
            "placement": "sau mở bài",
            "slot": "Ảnh 1 – hero",
            "privacyOk": True,
            "customerFaceVisible": False,
            "faceConsent": False,
            "isPoster": False,
            "containsPrivateInfo": False
        },
        {
            "fileName": f"{slug7}-cam-pha-chung-cu-cu.jpg",
            "fileNameWebP": f"{slug7}-cam-pha-chung-cu-cu.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug7}\\{slug7}-cam-pha-chung-cu-cu.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug7}-cam-pha-chung-cu-cu.jpg",
            "fileSizeKb": sizes7["slot2"],
            "altText": "Hút bể phốt chung cư cũ Cẩm Trung Cẩm Phả",
            "title": "Hút bể phốt chung cư Cẩm Trung – Cẩm Phả",
            "caption": "Xe hút bể phốt phục vụ chung cư cũ khu Cẩm Trung, Cẩm Phả",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-cam-trung/",
            "placement": "trong phần Tại sao chọn",
            "slot": "Ảnh 2 – khu vực",
            "privacyOk": True,
            "customerFaceVisible": False,
            "faceConsent": False,
            "isPoster": False,
            "containsPrivateInfo": False
        },
        {
            "fileName": f"{slug7}-cam-pha-case-study.jpg",
            "fileNameWebP": f"{slug7}-cam-pha-case-study.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug7}\\{slug7}-cam-pha-case-study.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug7}-cam-pha-case-study.jpg",
            "fileSizeKb": sizes7["slot3"],
            "altText": "Hút bể phốt tập thể cũ Cẩm Trung Cẩm Phả",
            "title": "Case study hút bể phốt tập thể Cẩm Trung Cẩm Phả",
            "caption": "Xử lý bể phốt chung cư tập thể 5 tầng tại Cẩm Trung, Cẩm Phả",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-cam-trung/",
            "placement": "trong phần Case study",
            "slot": "Ảnh 3 – case study",
            "privacyOk": True,
            "customerFaceVisible": False,
            "faceConsent": False,
            "isPoster": False,
            "containsPrivateInfo": False
        },
        {
            "fileName": f"{slug7}-cam-pha-quy-trinh-thi-cong.jpg",
            "fileNameWebP": f"{slug7}-cam-pha-quy-trinh-thi-cong.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug7}\\{slug7}-cam-pha-quy-trinh-thi-cong.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug7}-cam-pha-quy-trinh-thi-cong.jpg",
            "fileSizeKb": sizes7["slot4"],
            "altText": "Quy trình 5 bước hút bể phốt tại Cẩm Trung Cẩm Phả",
            "title": "Quy trình hút bể phốt Cẩm Trung – 5 bước chuẩn",
            "caption": "5 bước hút bể phốt Cẩm Trung Cẩm Phả – an toàn hệ thống cũ",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-cam-trung/",
            "placement": "trong phần Quy trình",
            "slot": "Ảnh 4 – quy trình",
            "privacyOk": True,
            "customerFaceVisible": False,
            "faceConsent": False,
            "isPoster": False,
            "containsPrivateInfo": False
        }
    ]
}

pkg8 = {
    "status": "READY_FOR_REVIEW",
    "processedAt": "2026-05-19T00:00:00.000Z",
    "slug": slug8,
    "service": "hút bể phốt",
    "area": "Cẩm Thủy – Cẩm Phả",
    "sourceType": "local_archive",
    "images": [
        {
            "fileName": f"{slug8}-cam-pha-anh-dau-bai.jpg",
            "fileNameWebP": f"{slug8}-cam-pha-anh-dau-bai.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug8}\\{slug8}-cam-pha-anh-dau-bai.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug8}-cam-pha-anh-dau-bai.jpg",
            "fileSizeKb": sizes8["slot1"],
            "altText": "Xe hút bể phốt Cẩm Thủy Cẩm Phả khu mỏ than",
            "title": "Hút bể phốt Cẩm Thủy – Môi Trường Đô Thị Số 1 Quảng Ninh",
            "caption": "Dịch vụ hút bể phốt Cẩm Thủy Cẩm Phả, gọi 0963.953.533",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-cam-thuy/",
            "placement": "sau mở bài",
            "slot": "Ảnh 1 – hero",
            "privacyOk": True,
            "customerFaceVisible": False,
            "faceConsent": False,
            "isPoster": False,
            "containsPrivateInfo": False
        },
        {
            "fileName": f"{slug8}-cam-pha-khu-mo-than.jpg",
            "fileNameWebP": f"{slug8}-cam-pha-khu-mo-than.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug8}\\{slug8}-cam-pha-khu-mo-than.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug8}-cam-pha-khu-mo-than.jpg",
            "fileSizeKb": sizes8["slot2"],
            "altText": "Hút bể phốt khu mỏ than Cẩm Thủy Cẩm Phả",
            "title": "Hút bể phốt khu mỏ Cẩm Thủy – Cẩm Phả",
            "caption": "Xe hút bể phốt xử lý bùn đặc khu mỏ than Cẩm Thủy, Cẩm Phả",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-cam-thuy/",
            "placement": "trong phần Tại sao chọn",
            "slot": "Ảnh 2 – khu vực",
            "privacyOk": True,
            "customerFaceVisible": False,
            "faceConsent": False,
            "isPoster": False,
            "containsPrivateInfo": False
        },
        {
            "fileName": f"{slug8}-cam-pha-case-study.jpg",
            "fileNameWebP": f"{slug8}-cam-pha-case-study.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug8}\\{slug8}-cam-pha-case-study.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug8}-cam-pha-case-study.jpg",
            "fileSizeKb": sizes8["slot3"],
            "altText": "Hút bể phốt nhà công nhân mỏ Cẩm Thủy Cẩm Phả",
            "title": "Case study hút bể phốt nhà công nhân mỏ Cẩm Thủy",
            "caption": "Xử lý bể phốt nhà ở công nhân mỏ than khu Cẩm Thủy, Cẩm Phả",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-cam-thuy/",
            "placement": "trong phần Case study",
            "slot": "Ảnh 3 – case study",
            "privacyOk": True,
            "customerFaceVisible": False,
            "faceConsent": False,
            "isPoster": False,
            "containsPrivateInfo": False
        },
        {
            "fileName": f"{slug8}-cam-pha-quy-trinh-thi-cong.jpg",
            "fileNameWebP": f"{slug8}-cam-pha-quy-trinh-thi-cong.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug8}\\{slug8}-cam-pha-quy-trinh-thi-cong.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug8}-cam-pha-quy-trinh-thi-cong.jpg",
            "fileSizeKb": sizes8["slot4"],
            "altText": "Quy trình 5 bước hút bể phốt tại Cẩm Thủy Cẩm Phả",
            "title": "Quy trình hút bể phốt Cẩm Thủy – 5 bước chuẩn",
            "caption": "5 bước hút bể phốt Cẩm Thủy Cẩm Phả – xử lý bùn than đặc",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-cam-thuy/",
            "placement": "trong phần Quy trình",
            "slot": "Ảnh 4 – quy trình",
            "privacyOk": True,
            "customerFaceVisible": False,
            "faceConsent": False,
            "isPoster": False,
            "containsPrivateInfo": False
        }
    ]
}

# Write packages
brief_dir = r"D:\.thongtaccongquangninh\image-briefs"
for slug, pkg in [(slug7, pkg7), (slug8, pkg8)]:
    out = os.path.join(brief_dir, f"{slug}-image-package.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(pkg, f, ensure_ascii=False, indent=2)
    print(f"Package written: {out}")

print("\nAll done!")
