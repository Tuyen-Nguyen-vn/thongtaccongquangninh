"""Tối ưu 7 ảnh đối tác từ Doi Tac folder.

- Crop center 4:3 (800×600)
- Xuất PNG + WebP
- Đặt tên SEO chuẩn
- Lưu manifest JSON
"""
from __future__ import annotations
import json
from pathlib import Path
from PIL import Image

SRC_DIR = Path(r"D:\.thongtaccongquangninh\Ảnh cung cấp\Doi Tac")
OUT_DIR = Path(r"D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO\doi-tac-thong-tac-cong-quang-ninh-2026-05-16")
OUT_W, OUT_H = 800, 600  # 4:3

SEO_NAMES = [
    {
        "src": "ChatGPT Image 00_43_57 16 thg 5, 2026.png",
        "slug": "doi-tac-cong-ty-xu-ly-nuoc-thai-quang-ninh",
        "alt": "Đối tác công ty xử lý nước thải Quảng Ninh",
        "title": "Đối tác xử lý nước thải – Hút bể phốt thông tắc cống Quảng Ninh",
    },
    {
        "src": "ChatGPT Image 00_43_58 16 thg 5, 2026.png",
        "slug": "doi-tac-thiet-bi-hut-be-phot-quang-ninh",
        "alt": "Đối tác cung cấp thiết bị hút bể phốt Quảng Ninh",
        "title": "Đối tác thiết bị hút bể phốt chuyên dụng tại Quảng Ninh",
    },
    {
        "src": "ChatGPT Image 00_44_01 16 thg 5, 2026.png",
        "slug": "doi-tac-may-bom-thong-cong-ha-long",
        "alt": "Đối tác cung cấp máy bơm thông cống Hạ Long Quảng Ninh",
        "title": "Đối tác máy bơm thông tắc cống – Hạ Long Quảng Ninh",
    },
    {
        "src": "ChatGPT Image 00_44_08 16 thg 5, 2026.png",
        "slug": "doi-tac-hoa-chat-xu-ly-moi-truong-quang-ninh",
        "alt": "Đối tác hóa chất xử lý môi trường Quảng Ninh",
        "title": "Đối tác hóa chất xử lý môi trường tại Quảng Ninh",
    },
    {
        "src": "ChatGPT Image 00_44_15 16 thg 5, 2026.png",
        "slug": "doi-tac-xe-hut-be-phot-chuyen-dung-ha-long",
        "alt": "Đối tác xe hút bể phốt chuyên dụng Hạ Long",
        "title": "Đối tác xe bồn hút bể phốt chuyên dụng – Hạ Long Quảng Ninh",
    },
    {
        "src": "ChatGPT Image 00_44_23 16 thg 5, 2026.png",
        "slug": "doi-tac-vat-tu-thong-tac-cong-quang-ninh",
        "alt": "Đối tác vật tư thông tắc cống Quảng Ninh",
        "title": "Đối tác vật tư thiết bị thông tắc cống tại Quảng Ninh",
    },
    {
        "src": "ChatGPT Image 00_44_28 16 thg 5, 2026.png",
        "slug": "doi-tac-moi-truong-do-thi-quang-ninh",
        "alt": "Đối tác môi trường đô thị số 1 Quảng Ninh",
        "title": "Đối tác môi trường đô thị – Hút bể phốt thông tắc cống Quảng Ninh",
    },
]


def crop_center_4x3(img: Image.Image) -> Image.Image:
    """Crop center của ảnh theo tỉ lệ 4:3."""
    w, h = img.size
    target_ratio = 4 / 3
    if w / h > target_ratio:
        # ảnh quá rộng → cắt ngang
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        img = img.crop((left, 0, left + new_w, h))
    elif w / h < target_ratio:
        # ảnh quá cao → cắt dọc
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        img = img.crop((0, top, w, top + new_h))
    return img.resize((OUT_W, OUT_H), Image.LANCZOS)


def process(entry: dict) -> dict:
    src_path = SRC_DIR / entry["src"]
    if not src_path.exists():
        raise FileNotFoundError(src_path)
    img = Image.open(src_path).convert("RGB")
    cropped = crop_center_4x3(img)

    png_path  = OUT_DIR / f"{entry['slug']}.png"
    webp_path = OUT_DIR / f"{entry['slug']}.webp"
    cropped.save(png_path,  format="PNG",  optimize=True)
    cropped.save(webp_path, format="WEBP", quality=88, method=6)

    return {
        "slug":     entry["slug"],
        "alt":      entry["alt"],
        "title":    entry["title"],
        "png":      str(png_path).replace("\\", "/"),
        "webp":     str(webp_path).replace("\\", "/"),
        "png_kb":   round(png_path.stat().st_size / 1024),
        "webp_kb":  round(webp_path.stat().st_size / 1024),
    }


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for entry in SEO_NAMES:
        r = process(entry)
        results.append(r)
        print(f"OK {r['slug']}  png={r['png_kb']}KB  webp={r['webp_kb']}KB")

    manifest = {
        "generated_at": "2026-05-16",
        "size": f"{OUT_W}x{OUT_H}",
        "ratio": "4:3",
        "items": results,
    }
    manifest_path = OUT_DIR / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nManifest: {manifest_path}")


if __name__ == "__main__":
    main()
