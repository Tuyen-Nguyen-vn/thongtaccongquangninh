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
        nw = int(w * scale)
        nh = int(h * scale)
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

# ---- BAI #9: hut-be-phot-mao-khe ----
slug9 = "hut-be-phot-mao-khe"
dst9 = os.path.join(base_dst, slug9)
sizes9 = {}

s = process_image(
    r"2. Xe Hut - Cong Ty KCN\ChatGPT Image 11_32_25 10 thg 5, 2026 (6).png",
    dst9,
    f"{slug9}-dong-trieu-anh-dau-bai.jpg",
    f"{slug9}-dong-trieu-anh-dau-bai.webp",
    scale=1.0
)
sizes9["slot1"] = s

s = process_image(
    r"2. Xe Hut - Cong Ty KCN\ChatGPT Image 11_32_25 10 thg 5, 2026 (7).png",
    dst9,
    f"{slug9}-dong-trieu-thi-tran-cong-nghiep.jpg",
    f"{slug9}-dong-trieu-thi-tran-cong-nghiep.webp",
    scale=0.97
)
sizes9["slot2"] = s

s = process_image(
    r"2. Xe Hut - Cong Ty KCN\adc43156-cfab-4945-bb2f-40c5f85ff7ae.png",
    dst9,
    f"{slug9}-dong-trieu-case-study.jpg",
    f"{slug9}-dong-trieu-case-study.webp",
    scale=0.95
)
sizes9["slot3"] = s

s = process_image(
    r"1. Xe Hut - Ho Gia Dinh\ChatGPT Image 10_50_12 10 thg 5, 2026 (5).png",
    dst9,
    f"{slug9}-dong-trieu-quy-trinh-thi-cong.jpg",
    f"{slug9}-dong-trieu-quy-trinh-thi-cong.webp",
    scale=0.95
)
sizes9["slot4"] = s

print(f"\nBài #9 mao-khe done. Sizes: {sizes9}")

# ---- BAI #10: hut-be-phot-yen-thanh ----
slug10 = "hut-be-phot-yen-thanh"
dst10 = os.path.join(base_dst, slug10)
sizes10 = {}

s = process_image(
    r"1. Xe Hut - Ho Gia Dinh\ChatGPT Image 10_50_18 10 thg 5, 2026 (7).png",
    dst10,
    f"{slug10}-uong-bi-anh-dau-bai.jpg",
    f"{slug10}-uong-bi-anh-dau-bai.webp",
    scale=1.0
)
sizes10["slot1"] = s

s = process_image(
    r"1. Xe Hut - Ho Gia Dinh\ChatGPT Image 10_50_19 10 thg 5, 2026 (8).png",
    dst10,
    f"{slug10}-uong-bi-nha-ong-vung-ven.jpg",
    f"{slug10}-uong-bi-nha-ong-vung-ven.webp",
    scale=0.97
)
sizes10["slot2"] = s

s = process_image(
    r"1. Xe Hut - Ho Gia Dinh\ChatGPT Image 10_50_21 10 thg 5, 2026 (9).png",
    dst10,
    f"{slug10}-uong-bi-case-study.jpg",
    f"{slug10}-uong-bi-case-study.webp",
    scale=0.95
)
sizes10["slot3"] = s

s = process_image(
    r"2. Xe Hut - Cong Ty KCN\ChatGPT Image 11_32_25 10 thg 5, 2026 (8).png",
    dst10,
    f"{slug10}-uong-bi-quy-trinh-thi-cong.jpg",
    f"{slug10}-uong-bi-quy-trinh-thi-cong.webp",
    scale=0.96
)
sizes10["slot4"] = s

print(f"\nBài #10 yen-thanh done. Sizes: {sizes10}")

# ---- Write image packages ----
base_path = r"D:\.thongtaccongquangninh"
brief_dir = r"D:\.thongtaccongquangninh\image-briefs"

pkg9 = {
    "status": "READY_FOR_REVIEW",
    "processedAt": "2026-05-19T00:00:00.000Z",
    "slug": slug9,
    "service": "hút bể phốt",
    "area": "Mạo Khê – Đông Triều",
    "sourceType": "local_archive",
    "images": [
        {
            "fileName": f"{slug9}-dong-trieu-anh-dau-bai.jpg",
            "fileNameWebP": f"{slug9}-dong-trieu-anh-dau-bai.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug9}\\{slug9}-dong-trieu-anh-dau-bai.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug9}-dong-trieu-anh-dau-bai.jpg",
            "fileSizeKb": sizes9["slot1"],
            "altText": "Xe hút bể phốt Mạo Khê Đông Triều thị trấn công nghiệp",
            "title": "Hút bể phốt Mạo Khê – Môi Trường Đô Thị Số 1 Quảng Ninh",
            "caption": "Dịch vụ hút bể phốt Mạo Khê Đông Triều, gọi 0963.953.533",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-mao-khe/",
            "placement": "sau mở bài",
            "slot": "Ảnh 1 – hero",
            "privacyOk": True, "customerFaceVisible": False,
            "faceConsent": False, "isPoster": False, "containsPrivateInfo": False
        },
        {
            "fileName": f"{slug9}-dong-trieu-thi-tran-cong-nghiep.jpg",
            "fileNameWebP": f"{slug9}-dong-trieu-thi-tran-cong-nghiep.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug9}\\{slug9}-dong-trieu-thi-tran-cong-nghiep.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug9}-dong-trieu-thi-tran-cong-nghiep.jpg",
            "fileSizeKb": sizes9["slot2"],
            "altText": "Hút bể phốt thị trấn Mạo Khê Đông Triều khu công nghiệp",
            "title": "Hút bể phốt Mạo Khê – thị trấn công nghiệp Đông Triều",
            "caption": "Xe hút bể phốt phục vụ khu công nghiệp thị trấn Mạo Khê",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-mao-khe/",
            "placement": "trong phần Tại sao chọn",
            "slot": "Ảnh 2 – khu vực",
            "privacyOk": True, "customerFaceVisible": False,
            "faceConsent": False, "isPoster": False, "containsPrivateInfo": False
        },
        {
            "fileName": f"{slug9}-dong-trieu-case-study.jpg",
            "fileNameWebP": f"{slug9}-dong-trieu-case-study.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug9}\\{slug9}-dong-trieu-case-study.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug9}-dong-trieu-case-study.jpg",
            "fileSizeKb": sizes9["slot3"],
            "altText": "Hút bể phốt cơ sở sản xuất xưởng gốm Mạo Khê Đông Triều",
            "title": "Case study hút bể phốt xưởng Mạo Khê Đông Triều",
            "caption": "Xử lý bể phốt cơ sở gốm mỹ nghệ tại Mạo Khê, Đông Triều",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-mao-khe/",
            "placement": "trong phần Case study",
            "slot": "Ảnh 3 – case study",
            "privacyOk": True, "customerFaceVisible": False,
            "faceConsent": False, "isPoster": False, "containsPrivateInfo": False
        },
        {
            "fileName": f"{slug9}-dong-trieu-quy-trinh-thi-cong.jpg",
            "fileNameWebP": f"{slug9}-dong-trieu-quy-trinh-thi-cong.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug9}\\{slug9}-dong-trieu-quy-trinh-thi-cong.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug9}-dong-trieu-quy-trinh-thi-cong.jpg",
            "fileSizeKb": sizes9["slot4"],
            "altText": "Quy trình 5 bước hút bể phốt tại Mạo Khê Đông Triều",
            "title": "Quy trình hút bể phốt Mạo Khê – 5 bước chuẩn",
            "caption": "5 bước hút bể phốt Mạo Khê Đông Triều – xử lý bùn đặc công nghiệp",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-mao-khe/",
            "placement": "trong phần Quy trình",
            "slot": "Ảnh 4 – quy trình",
            "privacyOk": True, "customerFaceVisible": False,
            "faceConsent": False, "isPoster": False, "containsPrivateInfo": False
        }
    ]
}

pkg10 = {
    "status": "READY_FOR_REVIEW",
    "processedAt": "2026-05-19T00:00:00.000Z",
    "slug": slug10,
    "service": "hút bể phốt",
    "area": "Yên Thanh – Uông Bí",
    "sourceType": "local_archive",
    "images": [
        {
            "fileName": f"{slug10}-uong-bi-anh-dau-bai.jpg",
            "fileNameWebP": f"{slug10}-uong-bi-anh-dau-bai.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug10}\\{slug10}-uong-bi-anh-dau-bai.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug10}-uong-bi-anh-dau-bai.jpg",
            "fileSizeKb": sizes10["slot1"],
            "altText": "Xe hút bể phốt Yên Thanh Uông Bí khu nhà ống vùng ven",
            "title": "Hút bể phốt Yên Thanh – Môi Trường Đô Thị Số 1 Quảng Ninh",
            "caption": "Dịch vụ hút bể phốt Yên Thanh Uông Bí, gọi 0963.953.533",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-yen-thanh/",
            "placement": "sau mở bài",
            "slot": "Ảnh 1 – hero",
            "privacyOk": True, "customerFaceVisible": False,
            "faceConsent": False, "isPoster": False, "containsPrivateInfo": False
        },
        {
            "fileName": f"{slug10}-uong-bi-nha-ong-vung-ven.jpg",
            "fileNameWebP": f"{slug10}-uong-bi-nha-ong-vung-ven.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug10}\\{slug10}-uong-bi-nha-ong-vung-ven.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug10}-uong-bi-nha-ong-vung-ven.jpg",
            "fileSizeKb": sizes10["slot2"],
            "altText": "Hút bể phốt nhà ống vùng ven Yên Thanh Uông Bí",
            "title": "Hút bể phốt khu nhà ống Yên Thanh – Uông Bí",
            "caption": "Xe hút bể phốt ngõ hẹp nhà ống khu Yên Thanh, Uông Bí",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-yen-thanh/",
            "placement": "trong phần Tại sao chọn",
            "slot": "Ảnh 2 – khu vực",
            "privacyOk": True, "customerFaceVisible": False,
            "faceConsent": False, "isPoster": False, "containsPrivateInfo": False
        },
        {
            "fileName": f"{slug10}-uong-bi-case-study.jpg",
            "fileNameWebP": f"{slug10}-uong-bi-case-study.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug10}\\{slug10}-uong-bi-case-study.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug10}-uong-bi-case-study.jpg",
            "fileSizeKb": sizes10["slot3"],
            "altText": "Hút bể phốt nhà ống 4 tầng ngõ sâu Yên Thanh Uông Bí",
            "title": "Case study hút bể phốt nhà ống ngõ sâu Yên Thanh",
            "caption": "Xử lý bể phốt nhà ống 4 tầng ngõ sâu 40m khu Yên Thanh, Uông Bí",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-yen-thanh/",
            "placement": "trong phần Case study",
            "slot": "Ảnh 3 – case study",
            "privacyOk": True, "customerFaceVisible": False,
            "faceConsent": False, "isPoster": False, "containsPrivateInfo": False
        },
        {
            "fileName": f"{slug10}-uong-bi-quy-trinh-thi-cong.jpg",
            "fileNameWebP": f"{slug10}-uong-bi-quy-trinh-thi-cong.webp",
            "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug10}\\{slug10}-uong-bi-quy-trinh-thi-cong.jpg",
            "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug10}-uong-bi-quy-trinh-thi-cong.jpg",
            "fileSizeKb": sizes10["slot4"],
            "altText": "Quy trình 5 bước hút bể phốt tại Yên Thanh Uông Bí",
            "title": "Quy trình hút bể phốt Yên Thanh – 5 bước chuẩn",
            "caption": "5 bước hút bể phốt Yên Thanh Uông Bí – thiết bị bơm rời ngõ hẹp",
            "pageUrl": "https://thongtaccongquangninh.com/hut-be-phot-yen-thanh/",
            "placement": "trong phần Quy trình",
            "slot": "Ảnh 4 – quy trình",
            "privacyOk": True, "customerFaceVisible": False,
            "faceConsent": False, "isPoster": False, "containsPrivateInfo": False
        }
    ]
}

for slug, pkg in [(slug9, pkg9), (slug10, pkg10)]:
    out = os.path.join(brief_dir, f"{slug}-image-package.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(pkg, f, ensure_ascii=False, indent=2)
    print(f"Package written: {out}")

print("\nAll done!")
