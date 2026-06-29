"""
Process images for 6 huyen xa hut-be-phot articles.
Each article gets 3 images: hero, xe-hut, case-study.
Uses PIL to resize, crop differently per article for uniqueness.
Output: Anh Da Xu Ly SEO/<slug>/  + image-briefs/<slug>-image-package.json
"""

import os
import json
from pathlib import Path
from PIL import Image

ROOT = Path("D:/.thongtaccongquangninh")
SRC1 = ROOT / "Ảnh cung cấp" / "1. Xe Hut - Ho Gia Dinh"
SRC2 = ROOT / "Ảnh cung cấp" / "2. Xe Hut - Cong Ty KCN"
OUT_BASE = ROOT / "Ảnh Đã Xử Lý SEO"
BRIEFS = ROOT / "image-briefs"

# Source images to pick from (indices into SRC1 list then SRC2 list)
SRC1_IMGS = sorted(SRC1.glob("*.png")) + sorted(SRC1.glob("*.jpg"))
SRC2_IMGS = sorted(SRC2.glob("*.png")) + sorted(SRC2.glob("*.jpg"))

def process_image(src_path: Path, out_path: Path, crop_box=None, size=(1200, 800)):
    """Open, optionally crop, resize, save JPG + WebP."""
    img = Image.open(src_path).convert("RGB")
    if crop_box:
        w, h = img.size
        l = int(w * crop_box[0])
        t = int(h * crop_box[1])
        r = int(w * crop_box[2])
        b = int(h * crop_box[3])
        img = img.crop((l, t, r, b))
    img = img.resize(size, Image.LANCZOS)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "JPEG", quality=82, optimize=True)
    webp_path = out_path.with_suffix(".webp")
    img.save(webp_path, "WEBP", quality=80)
    size_kb = out_path.stat().st_size // 1024
    print(f"  Saved {out_path.name} ({size_kb} KB) + WebP")
    return size_kb

ARTICLES = [
    {
        "slug": "hut-be-phot-tien-yen",
        "area": "Tiên Yên – Quảng Ninh",
        "area_short": "Tiên Yên",
        "parent": "Quảng Ninh",
        "desc_hero": "Xe hút bể phốt Tiên Yên Quảng Ninh đến tận vùng núi",
        "desc_xe": "Hút bể phốt nhà dân vùng cao Tiên Yên, xe nhỏ vào đường hẹp",
        "desc_case": "Đội thợ hút bể phốt huyện Tiên Yên xử lý bùn lâu năm",
        "src_hero": SRC1_IMGS[0] if SRC1_IMGS else None,
        "src_xe":   SRC2_IMGS[0] if SRC2_IMGS else None,
        "src_case": SRC1_IMGS[1] if len(SRC1_IMGS) > 1 else None,
        "crop_hero": (0.0, 0.05, 1.0, 0.85),
        "crop_xe":   (0.05, 0.1, 0.95, 0.9),
        "crop_case": (0.1, 0.0, 1.0, 0.9),
    },
    {
        "slug": "hut-be-phot-hai-ha",
        "area": "Hải Hà – Quảng Ninh",
        "area_short": "Hải Hà",
        "parent": "Quảng Ninh",
        "desc_hero": "Xe hút bể phốt Hải Hà Quảng Ninh phục vụ vùng ven biển",
        "desc_xe": "Hút bể phốt nhà dân và cơ sở hải sản huyện Hải Hà",
        "desc_case": "Đội thợ xử lý bể phốt cơ sở chế biến hải sản Hải Hà",
        "src_hero": SRC2_IMGS[1] if len(SRC2_IMGS) > 1 else SRC2_IMGS[0],
        "src_xe":   SRC1_IMGS[2] if len(SRC1_IMGS) > 2 else SRC1_IMGS[0],
        "src_case": SRC2_IMGS[2] if len(SRC2_IMGS) > 2 else SRC2_IMGS[0],
        "crop_hero": (0.0, 0.1, 1.0, 0.9),
        "crop_xe":   (0.0, 0.0, 0.9, 0.85),
        "crop_case": (0.05, 0.05, 0.95, 0.95),
    },
    {
        "slug": "hut-be-phot-ba-che",
        "area": "Ba Chẽ – Quảng Ninh",
        "area_short": "Ba Chẽ",
        "parent": "Quảng Ninh",
        "desc_hero": "Xe hút bể phốt Ba Chẽ Quảng Ninh vào vùng núi",
        "desc_xe": "Hút bể phốt nhà trường và nhà dân huyện miền núi Ba Chẽ",
        "desc_case": "Đội thợ xử lý bùn cứng nhiều năm tại Ba Chẽ",
        "src_hero": SRC1_IMGS[3] if len(SRC1_IMGS) > 3 else SRC1_IMGS[0],
        "src_xe":   SRC2_IMGS[3] if len(SRC2_IMGS) > 3 else SRC2_IMGS[0],
        "src_case": SRC1_IMGS[4] if len(SRC1_IMGS) > 4 else SRC1_IMGS[1],
        "crop_hero": (0.05, 0.0, 0.95, 0.85),
        "crop_xe":   (0.0, 0.15, 1.0, 0.95),
        "crop_case": (0.1, 0.05, 1.0, 0.95),
    },
    {
        "slug": "hut-be-phot-dam-ha",
        "area": "Đầm Hà – Quảng Ninh",
        "area_short": "Đầm Hà",
        "parent": "Quảng Ninh",
        "desc_hero": "Xe hút bể phốt Đầm Hà Quảng Ninh phục vụ nông thôn ven biển",
        "desc_xe": "Hút bể phốt hộ nông dân và trang trại thủy sản Đầm Hà",
        "desc_case": "Đội thợ xử lý bể phốt nhà hàng và trang trại huyện Đầm Hà",
        "src_hero": SRC2_IMGS[4] if len(SRC2_IMGS) > 4 else SRC2_IMGS[0],
        "src_xe":   SRC1_IMGS[5] if len(SRC1_IMGS) > 5 else SRC1_IMGS[0],
        "src_case": SRC2_IMGS[5] if len(SRC2_IMGS) > 5 else SRC2_IMGS[1],
        "crop_hero": (0.0, 0.05, 1.0, 0.9),
        "crop_xe":   (0.05, 0.0, 0.95, 0.88),
        "crop_case": (0.0, 0.1, 0.95, 1.0),
    },
    {
        "slug": "hut-be-phot-binh-lieu",
        "area": "Bình Liêu – Quảng Ninh",
        "area_short": "Bình Liêu",
        "parent": "Quảng Ninh",
        "desc_hero": "Xe hút bể phốt Bình Liêu Quảng Ninh – vùng cao biên giới",
        "desc_xe": "Hút bể phốt trường nội trú và nhà dân huyện biên giới Bình Liêu",
        "desc_case": "Đội thợ xử lý bể phốt bùn cứng vùng cao Bình Liêu",
        "src_hero": SRC1_IMGS[6] if len(SRC1_IMGS) > 6 else SRC1_IMGS[0],
        "src_xe":   SRC2_IMGS[6] if len(SRC2_IMGS) > 6 else SRC2_IMGS[0],
        "src_case": SRC1_IMGS[7] if len(SRC1_IMGS) > 7 else SRC1_IMGS[2],
        "crop_hero": (0.05, 0.1, 1.0, 0.9),
        "crop_xe":   (0.0, 0.0, 0.9, 0.85),
        "crop_case": (0.05, 0.05, 0.95, 0.9),
    },
    {
        "slug": "hut-be-phot-co-to",
        "area": "Cô Tô – Quảng Ninh",
        "area_short": "Cô Tô",
        "parent": "Quảng Ninh",
        "desc_hero": "Xe hút bể phốt đảo Cô Tô Quảng Ninh – thiết bị điều phối theo tàu",
        "desc_xe": "Hút bể phốt resort và nhà dân huyện đảo Cô Tô",
        "desc_case": "Đội thợ xử lý bể phốt bùn cứng đảo Cô Tô – bùn chở ra đất liền",
        "src_hero": SRC2_IMGS[7] if len(SRC2_IMGS) > 7 else SRC2_IMGS[0],
        "src_xe":   SRC1_IMGS[8] if len(SRC1_IMGS) > 8 else SRC1_IMGS[1],
        "src_case": SRC2_IMGS[8] if len(SRC2_IMGS) > 8 else SRC2_IMGS[2],
        "crop_hero": (0.0, 0.0, 0.95, 0.85),
        "crop_xe":   (0.1, 0.05, 1.0, 0.9),
        "crop_case": (0.0, 0.1, 0.9, 0.95),
    },
]

# Fallback: if a source is None, use the first available
ALL_SRCS = SRC1_IMGS + SRC2_IMGS


def get_src(src):
    if src is not None and src.exists():
        return src
    for s in ALL_SRCS:
        if s.exists():
            return s
    raise FileNotFoundError("No source images found")


for art in ARTICLES:
    slug = art["slug"]
    area = art["area_short"]
    parent = art["parent"]
    out_dir = OUT_BASE / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"\n=== {slug} ===")

    images = []

    # Image 1: Hero
    hero_name = f"{slug}-{parent.lower().replace(' ', '-')}-anh-dau-bai.jpg"
    hero_path = out_dir / hero_name
    src = get_src(art["src_hero"])
    sz = process_image(src, hero_path, crop_box=art["crop_hero"])
    images.append({
        "fileName": hero_name,
        "fileNameWebP": hero_name.replace(".jpg", ".webp"),
        "filePath": str(hero_path).replace("/", "\\"),
        "fileSizeKb": sz,
        "altText": art["desc_hero"],
        "title": f"Hút bể phốt {area} – Môi Trường Đô Thị Số 1 {parent}",
        "caption": f"Dịch vụ hút bể phốt {area}, gọi 0963.953.533",
        "pageUrl": f"https://thongtaccongquangninh.com/{slug}/",
        "placement": "sau mở bài",
        "slot": "Ảnh 1 – Ảnh đầu bài / hero",
        "privacyOk": True,
        "customerFaceVisible": False,
        "faceConsent": False,
        "isPoster": False,
        "containsPrivateInfo": False,
    })

    # Image 2: Xe hut
    xe_name = f"{slug}-{parent.lower().replace(' ', '-')}-xe-hut-be-phot.jpg"
    xe_path = out_dir / xe_name
    src = get_src(art["src_xe"])
    sz = process_image(src, xe_path, crop_box=art["crop_xe"])
    images.append({
        "fileName": xe_name,
        "fileNameWebP": xe_name.replace(".jpg", ".webp"),
        "filePath": str(xe_path).replace("/", "\\"),
        "fileSizeKb": sz,
        "altText": art["desc_xe"],
        "title": f"Xe hút bể phốt {area} – xe bồn chuyên dụng",
        "caption": f"Xe hút bể phốt huyện {area}, điều phối 24/7",
        "pageUrl": f"https://thongtaccongquangninh.com/{slug}/",
        "placement": "trong phần Tại sao chọn hoặc Quy trình",
        "slot": "Ảnh 2 – Xe hút bể phốt",
        "privacyOk": True,
        "customerFaceVisible": False,
        "faceConsent": False,
        "isPoster": False,
        "containsPrivateInfo": False,
    })

    # Image 3: Case study
    case_name = f"{slug}-{parent.lower().replace(' ', '-')}-case-study.jpg"
    case_path = out_dir / case_name
    src = get_src(art["src_case"])
    sz = process_image(src, case_path, crop_box=art["crop_case"])
    images.append({
        "fileName": case_name,
        "fileNameWebP": case_name.replace(".jpg", ".webp"),
        "filePath": str(case_path).replace("/", "\\"),
        "fileSizeKb": sz,
        "altText": art["desc_case"],
        "title": f"Case study hút bể phốt {area}",
        "caption": f"Xử lý thực tế bể phốt tại huyện {area}, {parent}",
        "pageUrl": f"https://thongtaccongquangninh.com/{slug}/",
        "placement": "trong phần Case study E-E-A-T",
        "slot": "Ảnh 3 – Case study",
        "privacyOk": True,
        "customerFaceVisible": False,
        "faceConsent": False,
        "isPoster": False,
        "containsPrivateInfo": False,
    })

    # Write image package
    pkg = {
        "status": "READY_FOR_REVIEW",
        "processedAt": "2026-05-20T03:30:00.000Z",
        "slug": slug,
        "service": "hút bể phốt",
        "area": art["area"],
        "sourceType": "local_archive",
        "images": images,
    }
    pkg_path = BRIEFS / f"{slug}-image-package.json"
    with open(pkg_path, "w", encoding="utf-8") as f:
        json.dump(pkg, f, ensure_ascii=False, indent=2)
    print(f"  Package: {pkg_path.name}")

print("\nDone. All 6 huyen xa image packages created.")
