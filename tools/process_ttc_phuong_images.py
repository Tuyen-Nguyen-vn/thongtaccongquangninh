"""Process 3 images each for 4 thong-tac-cong phuong articles."""
import json, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent.parent
SRC = ROOT / "Ảnh cung cấp" / "3. Tho Thong Tac Cong"
OUT_BASE = ROOT / "Ảnh Đã Xử Lý SEO"
BRIEFS = ROOT / "image-briefs"
MAX_W, MAX_H, Q = 1200, 900, 82

# 4 articles, 3 images each — use different source images per article
ARTICLES = [
    {
        "slug": "thong-tac-cong-bai-chay",
        "area": "Bãi Cháy",
        "sources": [
            "ChatGPT Image 07_47_46 10 thg 5, 2026 (1).png",
            "ChatGPT Image 07_47_47 10 thg 5, 2026 (1).png",
            "anh-seo-085.png",
        ],
        "images": [
            {
                "base": "thong-tac-cong-bai-chay-may-lo-xo-quang-ninh-01",
                "altText": "Thông tắc cống Bãi Cháy bằng máy lò xo – Môi Trường Đô Thị Số 1 Quảng Ninh",
                "title": "Thông tắc cống Bãi Cháy",
                "caption": "Dịch vụ thông tắc cống Bãi Cháy 24/7 – không đục phá, xử lý nhanh",
            },
            {
                "base": "thong-tac-cong-bai-chay-kiem-tra-ho-ga-02",
                "altText": "Thợ kiểm tra hố ga khi thông tắc cống Bãi Cháy",
                "title": "Kiểm tra hố ga thông tắc cống Bãi Cháy",
                "caption": "Quy trình 5 bước thông tắc cống Bãi Cháy – kiểm tra, lò xo, xả thử, bảo hành",
            },
            {
                "base": "thong-tac-cong-bai-chay-xu-ly-nha-hang-03",
                "altText": "Xử lý cống tắc nhà hàng khách sạn Bãi Cháy Quảng Ninh",
                "title": "Thông cống nhà hàng Bãi Cháy",
                "caption": "Thông tắc cống cho nhà hàng, khách sạn, homestay tại Bãi Cháy – gọi 0963.953.533",
            },
        ],
    },
    {
        "slug": "thong-tac-cong-cao-xanh",
        "area": "Cao Xanh",
        "sources": [
            "ChatGPT Image 07_47_47 10 thg 5, 2026 (3) (1).png",
            "anh-seo-063.png",
            "ChatGPT Image 07_47_48 10 thg 5, 2026 (6) (1).png",
        ],
        "images": [
            {
                "base": "thong-tac-cong-cao-xanh-ha-long-01",
                "altText": "Thông tắc cống Cao Xanh Hạ Long – xử lý tắc nghẽn khu dân cư đông",
                "title": "Thông tắc cống Cao Xanh",
                "caption": "Dịch vụ thông tắc cống Cao Xanh – khu dân cư đông đúc, ngõ hẹp",
            },
            {
                "base": "thong-tac-cong-cao-xanh-quy-trinh-02",
                "altText": "Quy trình thông tắc cống Cao Xanh Hạ Long bằng máy lò xo chuyên dụng",
                "title": "Quy trình thông cống Cao Xanh",
                "caption": "Thợ Môi Trường Đô Thị Số 1 xử lý cống tắc Cao Xanh không đục phá",
            },
            {
                "base": "thong-tac-cong-cao-xanh-chung-cu-03",
                "altText": "Thông tắc cống chung cư khu dân cư Cao Xanh Hạ Long",
                "title": "Thông cống chung cư Cao Xanh",
                "caption": "Xử lý cống tắc chung cư, nhà liền kề tại Cao Xanh – gọi 0963.953.533",
            },
        ],
    },
    {
        "slug": "thong-tac-cong-tuan-chau",
        "area": "Tuần Châu",
        "sources": [
            "ChatGPT Image 07_47_49 10 thg 5, 2026 (7) (1).png",
            "9f0becfa-f7be-420a-b834-43daab61b7e4.png",
            "thong-tac-cong-quang-ninh-anh-ai-3.png",
        ],
        "images": [
            {
                "base": "thong-tac-cong-tuan-chau-resort-01",
                "altText": "Thông tắc cống Tuần Châu – xử lý tắc nghẽn resort nhà hàng đảo Tuần Châu",
                "title": "Thông tắc cống Tuần Châu",
                "caption": "Dịch vụ thông tắc cống Tuần Châu cho resort, nhà hàng, căn hộ cao cấp",
            },
            {
                "base": "thong-tac-cong-tuan-chau-may-ap-luc-02",
                "altText": "Máy rửa áp lực cao thông tắc cống Tuần Châu Hạ Long",
                "title": "Máy rửa áp lực cao tại Tuần Châu",
                "caption": "Thông tắc cống Tuần Châu bằng máy rửa áp lực cao – không đục phá",
            },
            {
                "base": "thong-tac-cong-tuan-chau-kiem-tra-03",
                "altText": "Kiểm tra đường ống camera nội soi thông tắc cống Tuần Châu",
                "title": "Kiểm tra camera nội soi Tuần Châu",
                "caption": "Camera nội soi đường ống thông tắc cống Tuần Châu – xác định chính xác điểm tắc",
            },
        ],
    },
    {
        "slug": "thong-tac-cong-gieng-day",
        "area": "Giếng Đáy",
        "sources": [
            "da05f701-3797-49ad-a8da-3241a11a5189.png",
            "anh-seo-091.png",
            "ChatGPT Image 07_47_48 10 thg 5, 2026 (5) (1).png",
        ],
        "images": [
            {
                "base": "thong-tac-cong-gieng-day-ha-long-01",
                "altText": "Thông tắc cống Giếng Đáy Hạ Long – khu công nghiệp và khu dân cư",
                "title": "Thông tắc cống Giếng Đáy",
                "caption": "Dịch vụ thông tắc cống Giếng Đáy – khu công nghiệp, nhà dân, xưởng sản xuất",
            },
            {
                "base": "thong-tac-cong-gieng-day-tho-xu-ly-02",
                "altText": "Thợ thông tắc cống Giếng Đáy xử lý cống khu công nghiệp nhỏ",
                "title": "Thợ thông cống Giếng Đáy",
                "caption": "Thợ Môi Trường Đô Thị Số 1 xử lý cống tắc nặng khu công nghiệp Giếng Đáy",
            },
            {
                "base": "thong-tac-cong-gieng-day-may-lo-xo-03",
                "altText": "Máy lò xo thông tắc cống Giếng Đáy Hạ Long không đục phá",
                "title": "Máy lò xo thông cống Giếng Đáy",
                "caption": "Thông tắc cống Giếng Đáy bằng lò xo chuyên dụng – bảo hành dài hạn",
            },
        ],
    },
]


def process_image(src_path, out_path):
    with Image.open(src_path) as im:
        im = im.convert("RGB")
        w, h = im.size
        scale = min(MAX_W / w, MAX_H / h, 1.0)
        if scale < 1.0:
            im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
        jpg = out_path.with_suffix(".jpg")
        webp = out_path.with_suffix(".webp")
        im.save(jpg, "JPEG", quality=Q, optimize=True)
        im.save(webp, "WEBP", quality=Q)
        return jpg, webp


for article in ARTICLES:
    slug = article["slug"]
    out_dir = OUT_BASE / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    pkg_images = []
    for src_name, img_meta in zip(article["sources"], article["images"]):
        src = SRC / src_name
        if not src.exists():
            print(f"MISSING: {src}")
            sys.exit(1)
        base = img_meta["base"]
        jpg, webp = process_image(src, out_dir / base)
        print(f"  OK {jpg.name}")
        pkg_images.append({
            "slot": "content",
            "filePath": str(jpg.relative_to(ROOT)),
            "fileName": jpg.name,
            "altText": img_meta["altText"],
            "title": img_meta["title"],
            "caption": img_meta["caption"],
        })

    package = {
        "slug": slug,
        "status": "READY_FOR_REVIEW",
        "images": pkg_images,
    }
    pkg_path = BRIEFS / f"{slug}-image-package.json"
    with open(pkg_path, "w", encoding="utf-8") as f:
        json.dump(package, f, ensure_ascii=False, indent=2)
    print(f"Package: {pkg_path.name}")
    print()

print("ALL DONE")
