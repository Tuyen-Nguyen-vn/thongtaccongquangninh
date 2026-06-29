"""
Process 2 images per blog article for 5 informational articles:
1. dau-hieu-be-phot-can-hut (from remaining/)
2. chu-ky-hut-be-phot
3. chi-phi-hut-be-phot-quang-ninh
4. bon-cau-rut-cham-nguyen-nhan
5. mui-hoi-cong-nguyen-nhan-xu-ly
"""
import os
import json
from PIL import Image

src_dir = r"D:\.thongtaccongquangninh\Ảnh cung cấp"
base_dst = r"D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO"
brief_dir = r"D:\.thongtaccongquangninh\image-briefs"
base_path = r"D:\.thongtaccongquangninh"

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
        nw, nh = int(w * scale), int(h * scale)
        if nw > MAX_W or nh > MAX_H:
            ratio = min(MAX_W / nw, MAX_H / nh)
            nw, nh = int(nw * ratio), int(nh * ratio)
        img = img.resize((nw, nh), Image.Resampling.LANCZOS)
        img.save(jpg_path, "JPEG", quality=QUALITY, optimize=True)
        img.save(webp_path, "WEBP", quality=QUALITY)
        size_kb = os.path.getsize(jpg_path) // 1024
        print(f"  OK {dst_name_jpg} ({size_kb}KB)")
        return size_kb

def make_pkg(slug, area_label, page_url, images_data):
    pkg = {
        "status": "READY_FOR_REVIEW",
        "processedAt": "2026-05-20T00:00:00.000Z",
        "slug": slug,
        "service": "hút bể phốt",
        "area": area_label,
        "sourceType": "local_archive",
        "images": images_data
    }
    out = os.path.join(brief_dir, f"{slug}-image-package.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(pkg, f, ensure_ascii=False, indent=2)
    print(f"  Package: {out}")
    return pkg

# ─── 1. dau-hieu-be-phot-can-hut ─────────────────────────────────────────────
print("\n=== 1. dau-hieu-be-phot-can-hut ===")
slug = "dau-hieu-be-phot-can-hut"
dst = os.path.join(base_dst, slug)
s1 = process_image(r"1. Xe Hut - Ho Gia Dinh\4c7841c3-97cf-4bab-abc0-b5724f6d85c0.png",
    dst, f"{slug}-anh-dau-bai.jpg", f"{slug}-anh-dau-bai.webp", 1.0)
s2 = process_image(r"3. Tho Thong Tac Cong\ChatGPT Image 07_47_46 10 thg 5, 2026 (1).png",
    dst, f"{slug}-dau-hieu-nhan-biet.jpg", f"{slug}-dau-hieu-nhan-biet.webp", 0.96)
make_pkg(slug, "Quảng Ninh", "https://thongtaccongquangninh.com/dau-hieu-be-phot-can-hut/", [
    {"fileName": f"{slug}-anh-dau-bai.jpg", "fileNameWebP": f"{slug}-anh-dau-bai.webp",
     "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug}\\{slug}-anh-dau-bai.jpg",
     "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug}-anh-dau-bai.jpg",
     "fileSizeKb": s1, "altText": "Dấu hiệu bể phốt đầy cần hút tại nhà",
     "title": "Dấu hiệu bể phốt cần hút – Nhận biết sớm tránh tràn bể",
     "caption": "Nhận biết đúng 5 dấu hiệu bể phốt sắp đầy để xử lý kịp thời",
     "pageUrl": "https://thongtaccongquangninh.com/dau-hieu-be-phot-can-hut/",
     "placement": "sau mở bài", "slot": "Ảnh 1 – hero",
     "privacyOk": True, "customerFaceVisible": False, "faceConsent": False, "isPoster": False, "containsPrivateInfo": False},
    {"fileName": f"{slug}-dau-hieu-nhan-biet.jpg", "fileNameWebP": f"{slug}-dau-hieu-nhan-biet.webp",
     "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug}\\{slug}-dau-hieu-nhan-biet.jpg",
     "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug}-dau-hieu-nhan-biet.jpg",
     "fileSizeKb": s2, "altText": "Kiểm tra bể phốt nhận biết dấu hiệu đầy",
     "title": "Kiểm tra bể phốt – Dấu hiệu bể phốt cần hút",
     "caption": "Thợ kiểm tra bể phốt phát hiện sớm dấu hiệu cần xử lý",
     "pageUrl": "https://thongtaccongquangninh.com/dau-hieu-be-phot-can-hut/",
     "placement": "trong nội dung", "slot": "Ảnh 2 – minh họa",
     "privacyOk": True, "customerFaceVisible": False, "faceConsent": False, "isPoster": False, "containsPrivateInfo": False}
])

# ─── 2. chu-ky-hut-be-phot ───────────────────────────────────────────────────
print("\n=== 2. chu-ky-hut-be-phot ===")
slug = "chu-ky-hut-be-phot"
dst = os.path.join(base_dst, slug)
s1 = process_image(r"1. Xe Hut - Ho Gia Dinh\thong-tac-cong-quang-ninh-anh-ai-2.png",
    dst, f"{slug}-anh-dau-bai.jpg", f"{slug}-anh-dau-bai.webp", 1.0)
s2 = process_image(r"7. Tho Nao Vet Ho Ga\b19d90b6-740e-47bf-b4db-02fa41e39f90.png",
    dst, f"{slug}-minh-hoa.jpg", f"{slug}-minh-hoa.webp", 0.95)
make_pkg(slug, "Quảng Ninh", "https://thongtaccongquangninh.com/chu-ky-hut-be-phot/", [
    {"fileName": f"{slug}-anh-dau-bai.jpg", "fileNameWebP": f"{slug}-anh-dau-bai.webp",
     "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug}\\{slug}-anh-dau-bai.jpg",
     "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug}-anh-dau-bai.jpg",
     "fileSizeKb": s1, "altText": "Xe hút bể phốt theo chu kỳ định kỳ tại nhà",
     "title": "Chu kỳ hút bể phốt bao lâu một lần – Hướng dẫn 2026",
     "caption": "Lên lịch hút bể phốt định kỳ đúng chu kỳ để tránh tràn và mùi hôi",
     "pageUrl": "https://thongtaccongquangninh.com/chu-ky-hut-be-phot/",
     "placement": "sau mở bài", "slot": "Ảnh 1 – hero",
     "privacyOk": True, "customerFaceVisible": False, "faceConsent": False, "isPoster": False, "containsPrivateInfo": False},
    {"fileName": f"{slug}-minh-hoa.jpg", "fileNameWebP": f"{slug}-minh-hoa.webp",
     "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug}\\{slug}-minh-hoa.jpg",
     "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug}-minh-hoa.jpg",
     "fileSizeKb": s2, "altText": "Kiểm tra bể phốt trước khi hút theo lịch định kỳ",
     "title": "Kiểm tra bể phốt – Tư vấn chu kỳ hút đúng chuẩn",
     "caption": "Kỹ thuật viên kiểm tra và tư vấn chu kỳ hút phù hợp từng hộ gia đình",
     "pageUrl": "https://thongtaccongquangninh.com/chu-ky-hut-be-phot/",
     "placement": "trong nội dung", "slot": "Ảnh 2 – minh họa",
     "privacyOk": True, "customerFaceVisible": False, "faceConsent": False, "isPoster": False, "containsPrivateInfo": False}
])

# ─── 3. chi-phi-hut-be-phot-quang-ninh ───────────────────────────────────────
print("\n=== 3. chi-phi-hut-be-phot-quang-ninh ===")
slug = "chi-phi-hut-be-phot-quang-ninh"
dst = os.path.join(base_dst, slug)
s1 = process_image(r"3. Tho Thong Tac Cong\ChatGPT Image 07_47_47 10 thg 5, 2026 (1).png",
    dst, f"{slug}-anh-dau-bai.jpg", f"{slug}-anh-dau-bai.webp", 1.0)
s2 = process_image(r"3. Tho Thong Tac Cong\9f0becfa-f7be-420a-b834-43daab61b7e4.png",
    dst, f"{slug}-bang-gia.jpg", f"{slug}-bang-gia.webp", 0.95)
make_pkg(slug, "Quảng Ninh", "https://thongtaccongquangninh.com/chi-phi-hut-be-phot-quang-ninh/", [
    {"fileName": f"{slug}-anh-dau-bai.jpg", "fileNameWebP": f"{slug}-anh-dau-bai.webp",
     "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug}\\{slug}-anh-dau-bai.jpg",
     "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug}-anh-dau-bai.jpg",
     "fileSizeKb": s1, "altText": "Chi phí hút bể phốt Quảng Ninh 2026 bảng giá rõ ràng",
     "title": "Chi phí hút bể phốt Quảng Ninh 2026 – Bảng giá chi tiết",
     "caption": "Bảng giá hút bể phốt Quảng Ninh 2026 – báo giá rõ, không phát sinh phí",
     "pageUrl": "https://thongtaccongquangninh.com/chi-phi-hut-be-phot-quang-ninh/",
     "placement": "sau mở bài", "slot": "Ảnh 1 – hero",
     "privacyOk": True, "customerFaceVisible": False, "faceConsent": False, "isPoster": False, "containsPrivateInfo": False},
    {"fileName": f"{slug}-bang-gia.jpg", "fileNameWebP": f"{slug}-bang-gia.webp",
     "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug}\\{slug}-bang-gia.jpg",
     "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug}-bang-gia.jpg",
     "fileSizeKb": s2, "altText": "Hút bể phốt Quảng Ninh giá rẻ minh bạch",
     "title": "Hút bể phốt Quảng Ninh – Giá minh bạch không phát sinh",
     "caption": "Dịch vụ hút bể phốt Quảng Ninh – giá báo trước, không phát sinh phí ngoài",
     "pageUrl": "https://thongtaccongquangninh.com/chi-phi-hut-be-phot-quang-ninh/",
     "placement": "trong nội dung", "slot": "Ảnh 2 – minh họa",
     "privacyOk": True, "customerFaceVisible": False, "faceConsent": False, "isPoster": False, "containsPrivateInfo": False}
])

# ─── 4. bon-cau-rut-cham-nguyen-nhan ─────────────────────────────────────────
print("\n=== 4. bon-cau-rut-cham-nguyen-nhan ===")
slug = "bon-cau-rut-cham-nguyen-nhan"
dst = os.path.join(base_dst, slug)
s1 = process_image(r"4. Tho Thong Bon Cau\hut-be-phot-ha-long-181.jpg",
    dst, f"{slug}-anh-dau-bai.jpg", f"{slug}-anh-dau-bai.webp", 1.0)
s2 = process_image(r"4. Tho Thong Bon Cau\760e2309-8232-4604-81e5-cf2dc7f3355b.png",
    dst, f"{slug}-thong-bon-cau.jpg", f"{slug}-thong-bon-cau.webp", 0.95)
make_pkg(slug, "Quảng Ninh", "https://thongtaccongquangninh.com/bon-cau-rut-cham-nguyen-nhan/", [
    {"fileName": f"{slug}-anh-dau-bai.jpg", "fileNameWebP": f"{slug}-anh-dau-bai.webp",
     "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug}\\{slug}-anh-dau-bai.jpg",
     "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug}-anh-dau-bai.jpg",
     "fileSizeKb": s1, "altText": "Bồn cầu rút nước chậm nguyên nhân xử lý",
     "title": "Bồn cầu rút nước chậm – Nguyên nhân và cách xử lý 2026",
     "caption": "Nguyên nhân bồn cầu rút chậm và cách xử lý nhanh tại nhà",
     "pageUrl": "https://thongtaccongquangninh.com/bon-cau-rut-cham-nguyen-nhan/",
     "placement": "sau mở bài", "slot": "Ảnh 1 – hero",
     "privacyOk": True, "customerFaceVisible": False, "faceConsent": False, "isPoster": False, "containsPrivateInfo": False},
    {"fileName": f"{slug}-thong-bon-cau.jpg", "fileNameWebP": f"{slug}-thong-bon-cau.webp",
     "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug}\\{slug}-thong-bon-cau.jpg",
     "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug}-thong-bon-cau.jpg",
     "fileSizeKb": s2, "altText": "Thợ thông tắc bồn cầu rút chậm tại Quảng Ninh",
     "title": "Thông tắc bồn cầu Quảng Ninh – Xử lý bồn cầu rút chậm",
     "caption": "Thợ xử lý bồn cầu rút nước chậm tại Quảng Ninh",
     "pageUrl": "https://thongtaccongquangninh.com/bon-cau-rut-cham-nguyen-nhan/",
     "placement": "trong nội dung", "slot": "Ảnh 2 – minh họa",
     "privacyOk": True, "customerFaceVisible": False, "faceConsent": False, "isPoster": False, "containsPrivateInfo": False}
])

# ─── 5. mui-hoi-cong-nguyen-nhan-xu-ly ───────────────────────────────────────
print("\n=== 5. mui-hoi-cong-nguyen-nhan-xu-ly ===")
slug = "mui-hoi-cong-nguyen-nhan-xu-ly"
dst = os.path.join(base_dst, slug)
s1 = process_image(r"6. Tho Xu Ly Mui Hoi\9b6fb9e7-96e7-42e1-9559-027832aba90f.png",
    dst, f"{slug}-anh-dau-bai.jpg", f"{slug}-anh-dau-bai.webp", 1.0)
s2 = process_image(r"5. Tho Thong Chau Rua\63b66537-c482-45f8-99e2-41109d36aa0f.png",
    dst, f"{slug}-xu-ly-mui.jpg", f"{slug}-xu-ly-mui.webp", 0.95)
make_pkg(slug, "Quảng Ninh", "https://thongtaccongquangninh.com/mui-hoi-cong-nguyen-nhan-xu-ly/", [
    {"fileName": f"{slug}-anh-dau-bai.jpg", "fileNameWebP": f"{slug}-anh-dau-bai.webp",
     "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug}\\{slug}-anh-dau-bai.jpg",
     "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug}-anh-dau-bai.jpg",
     "fileSizeKb": s1, "altText": "Mùi hôi từ cống bể phốt trong nhà nguyên nhân xử lý",
     "title": "Mùi hôi từ cống – Nguyên nhân và cách xử lý dứt điểm",
     "caption": "Nguyên nhân mùi hôi từ cống, bể phốt và cách xử lý dứt điểm tại nhà",
     "pageUrl": "https://thongtaccongquangninh.com/mui-hoi-cong-nguyen-nhan-xu-ly/",
     "placement": "sau mở bài", "slot": "Ảnh 1 – hero",
     "privacyOk": True, "customerFaceVisible": False, "faceConsent": False, "isPoster": False, "containsPrivateInfo": False},
    {"fileName": f"{slug}-xu-ly-mui.jpg", "fileNameWebP": f"{slug}-xu-ly-mui.webp",
     "filePath": f"{base_path}\\Ảnh Đã Xử Lý SEO\\{slug}\\{slug}-xu-ly-mui.jpg",
     "assetsPath": f"{base_path}\\image-briefs\\assets\\{slug}-xu-ly-mui.jpg",
     "fileSizeKb": s2, "altText": "Xử lý mùi hôi cống bể phốt trong nhà Quảng Ninh",
     "title": "Xử lý mùi hôi từ cống tại Quảng Ninh – 24/7",
     "caption": "Đội thợ xử lý mùi hôi từ cống, bể phốt tại Quảng Ninh",
     "pageUrl": "https://thongtaccongquangninh.com/mui-hoi-cong-nguyen-nhan-xu-ly/",
     "placement": "trong nội dung", "slot": "Ảnh 2 – minh họa",
     "privacyOk": True, "customerFaceVisible": False, "faceConsent": False, "isPoster": False, "containsPrivateInfo": False}
])

print("\n=== ALL DONE ===")
