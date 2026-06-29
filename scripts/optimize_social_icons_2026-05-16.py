"""Tối ưu 5 icon mạng xã hội trong suốt (transparent PNG).

- Crop center hình vuông chặt (tight crop vào phần không trong suốt)
- Resize: 256×256 (desktop) và 128×128 (mobile/CTA)
- Giữ kênh alpha (RGBA)
- Export PNG + WebP (lossless cho transparent)
- Copy vào cả 2 plugin asset dir
"""
from __future__ import annotations
import shutil
import json
from pathlib import Path
import numpy as np
from PIL import Image

SRC_DIR = Path(r"C:\Users\DELL\Desktop\icon_trong_suot_png")
HOME_RENDERER_ASSETS = Path(r"D:\.thongtaccongquangninh\tools\wp-plugins\ttcqn-home-emergency-renderer\assets\contact-icons")
MOBILE_STICKY_ASSETS = Path(r"D:\.thongtaccongquangninh\tools\wp-plugins\ttcqn-mobile-left-sticky-cta\assets")
OUT_DIR = Path(r"D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO\social-icons-2026-05-16")

ICONS = [
    {
        "src": "phone_transparent.png",
        "slug": "icon-goi-dien-thoai-hut-be-phot-quang-ninh",
        "alt": "Gọi điện thoại hút bể phốt Quảng Ninh 0963953533",
        "copy_mobile": True,
    },
    {
        "src": "zalo_transparent.png",
        "slug": "icon-zalo-thong-tac-cong-quang-ninh",
        "alt": "Zalo tư vấn thông tắc cống Quảng Ninh",
        "copy_mobile": True,
    },
    {
        "src": "facebook_transparent.png",
        "slug": "icon-facebook-thong-tac-cong-ha-long-24h",
        "alt": "Facebook thông tắc cống Hạ Long 24h",
        "copy_mobile": False,
    },
    {
        "src": "youtube_transparent.png",
        "slug": "icon-youtube-hut-be-phot-ha-long",
        "alt": "YouTube kênh hút bể phốt Hạ Long Quảng Ninh",
        "copy_mobile": False,
    },
    {
        "src": "tiktok_transparent.png",
        "slug": "icon-tiktok-thong-tac-cong-quang-ninh",
        "alt": "TikTok thông tắc cống Quảng Ninh",
        "copy_mobile": False,
    },
]

SIZES = [256, 128]


def tight_crop_square(img: Image.Image) -> Image.Image:
    """Crop vào bounding box của phần không trong suốt, rồi pad thành vuông."""
    arr = np.array(img)
    if arr.shape[2] < 4:
        return img  # no alpha
    alpha = arr[:, :, 3]
    rows = np.any(alpha > 10, axis=1)
    cols = np.any(alpha > 10, axis=0)
    if not rows.any():
        return img
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    # Thêm 4px padding mỗi chiều (2% buffer)
    pad = 6
    rmin = max(0, rmin - pad)
    rmax = min(arr.shape[0] - 1, rmax + pad)
    cmin = max(0, cmin - pad)
    cmax = min(arr.shape[1] - 1, cmax + pad)
    cropped = img.crop((cmin, rmin, cmax + 1, rmax + 1))
    # Pad thành vuông
    w, h = cropped.size
    side = max(w, h)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(cropped, ((side - w) // 2, (side - h) // 2))
    return sq


def process(entry: dict) -> dict:
    src_path = SRC_DIR / entry["src"]
    img = Image.open(src_path).convert("RGBA")
    cropped = tight_crop_square(img)

    results = []
    for size in SIZES:
        resized = cropped.resize((size, size), Image.LANCZOS)
        slug = entry["slug"]
        suffix = f"-{size}x{size}"

        png_path = OUT_DIR / f"{slug}{suffix}.png"
        webp_path = OUT_DIR / f"{slug}{suffix}.webp"
        resized.save(png_path, format="PNG", optimize=True)
        resized.save(webp_path, format="WEBP", lossless=True, quality=90, method=6)
        results.append({
            "size": size,
            "png": str(png_path),
            "webp": str(webp_path),
            "png_kb": round(png_path.stat().st_size / 1024, 1),
            "webp_kb": round(webp_path.stat().st_size / 1024, 1),
        })

        # Copy 256px vào home-emergency-renderer assets
        if size == 256:
            HOME_RENDERER_ASSETS.mkdir(parents=True, exist_ok=True)
            shutil.copy(png_path, HOME_RENDERER_ASSETS / f"{slug}.png")
            shutil.copy(webp_path, HOME_RENDERER_ASSETS / f"{slug}.webp")

        # Copy 128px phone+zalo vào mobile-sticky assets
        if size == 128 and entry["copy_mobile"]:
            MOBILE_STICKY_ASSETS.mkdir(parents=True, exist_ok=True)
            shutil.copy(png_path, MOBILE_STICKY_ASSETS / f"{slug}.png")
            shutil.copy(webp_path, MOBILE_STICKY_ASSETS / f"{slug}.webp")

    return {"slug": entry["slug"], "alt": entry["alt"], "sizes": results}


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    all_results = []
    for entry in ICONS:
        r = process(entry)
        all_results.append(r)
        s256 = r["sizes"][0]
        s128 = r["sizes"][1]
        print(f"OK {r['slug']}")
        print(f"   256px: png={s256['png_kb']}KB webp={s256['webp_kb']}KB")
        print(f"   128px: png={s128['png_kb']}KB webp={s128['webp_kb']}KB")

    manifest_path = OUT_DIR / "manifest.json"
    manifest_path.write_text(
        json.dumps({"generated_at": "2026-05-16", "icons": all_results}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\nManifest: {manifest_path}")
    print("\n=== Copy summary ===")
    print(f"Home renderer assets: {HOME_RENDERER_ASSETS}")
    print(f"Mobile sticky assets: {MOBILE_STICKY_ASSETS}")


if __name__ == "__main__":
    main()
