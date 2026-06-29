"""Tối ưu 5 icon mạng xã hội (phone, zalo, facebook, tiktok, youtube) — phiên bản v2.

- Đầu vào: 5 PNG ChatGPT trong D:/Downloads
- Đầu ra: PNG + WebP 4 kích thước (512/256/128/64) tên SEO
- Lưu: D:/.thongtaccongquangninh/Ảnh Đã Xử Lý SEO/icon-mang-xa-hoi-quang-ninh-2026-05-16-v2-final/
- Manifest JSON liệt kê path + alt/title đề xuất
"""
from __future__ import annotations
import json
import shutil
from pathlib import Path
from PIL import Image

DOWNLOADS = Path(r"D:/Downloads")
OUT_DIR = Path(r"D:/.thongtaccongquangninh/Ảnh Đã Xử Lý SEO/icon-mang-xa-hoi-quang-ninh-2026-05-16-v2-final")
SIZES = [512, 256, 128, 64]

ICON_MAP = [
    {
        "src": "ChatGPT Image 16_44_11 16 thg 5, 2026 (1).png",
        "slug": "icon-dien-thoai-hut-be-phot-quang-ninh",
        "alt": "Icon điện thoại gọi thợ hút bể phốt Quảng Ninh 24/7",
        "title": "Gọi ngay 0963.953.533 - Hút bể phốt, thông tắc cống Quảng Ninh",
        "link": "tel:0963953533",
    },
    {
        "src": "ChatGPT Image 16_44_12 16 thg 5, 2026 (2).png",
        "slug": "icon-zalo-tu-van-thong-tac-cong-quang-ninh",
        "alt": "Icon Zalo tư vấn thông tắc cống Quảng Ninh miễn phí",
        "title": "Nhắn Zalo 0931.156.756 - Tư vấn miễn phí hút bể phốt, thông tắc cống",
        "link": "https://zalo.me/0931156756",
    },
    {
        "src": "ChatGPT Image 16_44_12 16 thg 5, 2026 (3).png",
        "slug": "icon-facebook-moi-truong-do-thi-quang-ninh",
        "alt": "Icon Facebook Môi Trường Đô Thị Số 1 Quảng Ninh",
        "title": "Fanpage Facebook - Thông tắc cống Hạ Long 24h",
        "link": "https://www.facebook.com/thongtacconghalong24h",
    },
    {
        "src": "ChatGPT Image 16_44_13 16 thg 5, 2026 (4).png",
        "slug": "icon-tiktok-thong-tac-cong-quang-ninh",
        "alt": "Icon TikTok dịch vụ thông tắc cống Quảng Ninh",
        "title": "TikTok @thongtaccongquangninh - Mẹo xử lý tắc cống, bể phốt",
        "link": "https://www.tiktok.com/@thongtaccongquangninh",
    },
    {
        "src": "ChatGPT Image 16_44_15 16 thg 5, 2026 (5).png",
        "slug": "icon-youtube-hut-be-phot-ha-long",
        "alt": "Icon YouTube kênh hút bể phốt Hạ Long Quảng Ninh",
        "title": "YouTube @hutbephothalong14 - Quy trình hút bể phốt thực tế",
        "link": "https://www.youtube.com/@hutbephothalong14",
    },
]


def process_icon(entry: dict) -> dict:
    src_path = DOWNLOADS / entry["src"]
    if not src_path.exists():
        raise FileNotFoundError(src_path)
    img = Image.open(src_path).convert("RGBA")
    w, h = img.size
    # Crop tới hình vuông trung tâm để bỏ lề trắng PNG
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))

    outputs = []
    for size in SIZES:
        resized = img.resize((size, size), Image.LANCZOS)
        png_path = OUT_DIR / f"{entry['slug']}-{size}.png"
        webp_path = OUT_DIR / f"{entry['slug']}-{size}.webp"
        resized.save(png_path, format="PNG", optimize=True)
        resized.save(webp_path, format="WEBP", quality=92, method=6)
        outputs.append({
            "size": size,
            "png": str(png_path).replace("\\", "/"),
            "webp": str(webp_path).replace("\\", "/"),
            "png_bytes": png_path.stat().st_size,
            "webp_bytes": webp_path.stat().st_size,
        })
    # Bản gốc 512 dùng làm "main"
    main_png = OUT_DIR / f"{entry['slug']}.png"
    main_webp = OUT_DIR / f"{entry['slug']}.webp"
    shutil.copy2(OUT_DIR / f"{entry['slug']}-512.png", main_png)
    shutil.copy2(OUT_DIR / f"{entry['slug']}-512.webp", main_webp)
    return {
        "slug": entry["slug"],
        "alt": entry["alt"],
        "title": entry["title"],
        "link": entry["link"],
        "main_png": str(main_png).replace("\\", "/"),
        "main_webp": str(main_webp).replace("\\", "/"),
        "variants": outputs,
    }


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {"generated_at": "2026-05-16", "set": "icon-mang-xa-hoi-quang-ninh-v2", "items": []}
    for entry in ICON_MAP:
        manifest["items"].append(process_icon(entry))
    manifest_path = OUT_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"out_dir": str(OUT_DIR), "manifest": str(manifest_path), "count": len(manifest["items"])}, ensure_ascii=False))


if __name__ == "__main__":
    main()
