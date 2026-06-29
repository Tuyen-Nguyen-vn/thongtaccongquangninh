"""Create image packages for thong-tac-bon-cau landing pages."""
import json
from pathlib import Path

ROOT = Path(r"D:\.thongtaccongquangninh")
ASSETS = ROOT / "image-briefs" / "assets"
BRIEFS = ROOT / "image-briefs"

CONFIGS = [
    ("landing-ha-long-thong-tac-bon-cau", "thong-tac-bon-cau-ha-long", "Hạ Long"),
    ("landing-cam-pha-thong-tac-bon-cau", "thong-tac-bon-cau-cam-pha", "Cẩm Phả"),
    ("landing-dong-trieu-thong-tac-bon-cau", "thong-tac-bon-cau-dong-trieu", "Đông Triều"),
    ("landing-mong-cai-thong-tac-bon-cau", "thong-tac-bon-cau-mong-cai", "Móng Cái"),
    ("landing-quang-ninh-thong-tac-bon-cau", "thong-tac-bon-cau-quang-ninh", "Quảng Ninh"),
    ("landing-quang-yen-thong-tac-bon-cau", "thong-tac-bon-cau-quang-yen", "Quảng Yên"),
    ("landing-uong-bi-thong-tac-bon-cau", "thong-tac-bon-cau-uong-bi", "Uông Bí"),
    ("landing-van-don-thong-tac-bon-cau", "thong-tac-bon-cau-van-don", "Vân Đồn"),
]

SLOT_ALTS = {
    "anh-dau-bai": "Thông tắc bồn cầu {area} – Môi Trường Đô Thị Số 1 Quảng Ninh",
    "quy-trinh-thi-cong": "Quy trình thông tắc bồn cầu {area} – không đục phá",
    "case-study": "Case study thực tế thông tắc bồn cầu {area}",
    "cta-niem-tin": "Dịch vụ thông tắc bồn cầu {area} – cam kết 3 không",
    "khu-vuc-phuc-vu": "Khu vực phục vụ thông tắc bồn cầu {area} và lân cận",
}

for slug, asset_prefix, area in CONFIGS:
    images = []
    for slot, alt_tpl in SLOT_ALTS.items():
        candidates = list(ASSETS.glob(f"{asset_prefix}-{slot}.*"))
        if not candidates:
            print(f"MISSING: {asset_prefix}-{slot}.*")
            continue
        f = candidates[0]
        images.append({
            "slot": slot,
            "fileName": f.name,
            "filePath": str(f),
            "altText": alt_tpl.replace("{area}", area),
            "title": f"Thông tắc bồn cầu {area}",
            "caption": f"Dịch vụ thông tắc bồn cầu {area} 24/7 – 0963.953.533",
        })
    pkg = {
        "slug": slug,
        "status": "READY_FOR_REVIEW",
        "images": images,
    }
    out = BRIEFS / f"{slug}-image-package.json"
    with open(out, "w", encoding="utf-8") as wf:
        json.dump(pkg, wf, ensure_ascii=False, indent=2)
    print(f"Created: {out.name} ({len(images)} images)")

print("DONE")
