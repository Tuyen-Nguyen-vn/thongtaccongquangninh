"""Process images for hoa-chat-tu-thong-cong blog article."""
import json, os, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent.parent
OUT_BASE = ROOT / "Ảnh Đã Xử Lý SEO"
BRIEFS = ROOT / "image-briefs"

SLUG = "hoa-chat-tu-thong-cong"
OUT_DIR = OUT_BASE / SLUG
OUT_DIR.mkdir(parents=True, exist_ok=True)

SOURCES = [
    ROOT / "Ảnh cung cấp" / "3. Tho Thong Tac Cong" / "ChatGPT Image 07_47_48 10 thg 5, 2026 (4) (1).png",
    ROOT / "Ảnh cung cấp" / "3. Tho Thong Tac Cong" / "ChatGPT Image 07_47_49 10 thg 5, 2026 (8) (1).png",
]

IMAGES = [
    {
        "slot": "hero",
        "filename_base": f"hoa-chat-thong-cong-an-toan-quang-ninh-01",
        "alt": "Hóa chất thông cống an toàn tại Quảng Ninh – so sánh muối nở, giấm và NaOH",
        "title": "Hóa chất thông cống an toàn",
        "caption": "Phân biệt các loại hóa chất thông cống để dùng đúng và an toàn",
    },
    {
        "slot": "supporting",
        "filename_base": f"thong-tac-cong-dung-ky-thuat-quang-ninh-02",
        "alt": "Thợ thông tắc cống đúng kỹ thuật Quảng Ninh - Môi Trường Đô Thị Số 1",
        "title": "Thông tắc cống đúng kỹ thuật Quảng Ninh",
        "caption": "Khi hóa chất không hiệu quả - gọi thợ thông cống tại Quảng Ninh 0963.953.533",
    },
]

MAX_W, MAX_H, QUALITY = 1200, 900, 82

package_images = []

for src_path, img_meta in zip(SOURCES, IMAGES):
    if not src_path.exists():
        print(f"MISSING: {src_path}")
        sys.exit(1)

    with Image.open(src_path) as im:
        im = im.convert("RGB")
        w, h = im.size
        scale = min(MAX_W / w, MAX_H / h, 1.0)
        new_w, new_h = int(w * scale), int(h * scale)
        if scale < 1.0:
            im = im.resize((new_w, new_h), Image.LANCZOS)

        jpg_name = img_meta["filename_base"] + ".jpg"
        webp_name = img_meta["filename_base"] + ".webp"

        jpg_path = OUT_DIR / jpg_name
        webp_path = OUT_DIR / webp_name

        im.save(jpg_path, "JPEG", quality=QUALITY, optimize=True)
        im.save(webp_path, "WEBP", quality=QUALITY)

        print(f"OK {jpg_name} ({new_w}x{new_h})")
        print(f"OK {webp_name}")

    package_images.append({
        "slot": img_meta["slot"],
        "local_jpg": str(jpg_path.relative_to(ROOT)),
        "local_webp": str(webp_path.relative_to(ROOT)),
        "filename": jpg_name,
        "alt": img_meta["alt"],
        "title": img_meta["title"],
        "caption": img_meta["caption"],
    })

package = {
    "slug": SLUG,
    "status": "READY_FOR_REVIEW",
    "images": package_images,
}

pkg_path = BRIEFS / f"{SLUG}-image-package.json"
with open(pkg_path, "w", encoding="utf-8") as f:
    json.dump(package, f, ensure_ascii=False, indent=2)

print(f"\nPackage: {pkg_path}")
print("DONE")
