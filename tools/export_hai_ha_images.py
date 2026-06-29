from pathlib import Path
import json
from PIL import Image

ROOT = Path(r"D:\.thongtaccongquangninh")
PKG_PATH = ROOT / "image-briefs" / "hut-be-phot-hai-ha-rankmath-90-image-package.json"
STATUS_PATH = ROOT / "image-briefs" / "hut-be-phot-hai-ha-rankmath-90-image-status.json"
OUT_DIR = ROOT / "Ảnh Đã Xử Lý SEO" / "hut-be-phot-hai-ha-rankmath-90"
SIZE = (1200, 800)

CROPS = {
    "anh-dau-bai": (0.02, 0.05, 0.98, 0.88),
    "dau-hieu-be-day": (0.08, 0.05, 0.92, 0.90),
    "quy-trinh-keo-ong": (0.04, 0.06, 0.96, 0.90),
    "case-study-nha-dan": (0.05, 0.08, 0.95, 0.92),
    "case-study-co-so-hai-san": (0.03, 0.06, 0.97, 0.90),
}

def process_image(src_path: Path, out_webp: Path, crop_box, size=SIZE):
    img = Image.open(src_path).convert("RGB")
    w, h = img.size
    l = int(w * crop_box[0])
    t = int(h * crop_box[1])
    r = int(w * crop_box[2])
    b = int(h * crop_box[3])
    img = img.crop((l, t, r, b)).resize(size, Image.LANCZOS)
    out_webp.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_webp, "WEBP", quality=82, method=6)
    out_jpg = out_webp.with_suffix(".jpg")
    img.save(out_jpg, "JPEG", quality=84, optimize=True)
    return {
        "webp": out_webp,
        "jpg": out_jpg,
        "size_kb": out_webp.stat().st_size // 1024,
    }

pkg = json.loads(PKG_PATH.read_text(encoding="utf-8"))
OUT_DIR.mkdir(parents=True, exist_ok=True)

processed = []
for img in pkg["images"]:
    slot = img["slot"]
    crop = CROPS[slot]
    src = Path(img["sourcePath"])
    out_webp = OUT_DIR / img["fileName"]
    result = process_image(src, out_webp, crop)
    img["outputPath"] = str(result["webp"])
    img["filePath"] = str(result["jpg"])
    img["fileNameJpg"] = result["jpg"].name
    img["fileSizeKb"] = result["size_kb"]
    processed.append({
        "slot": slot,
        "webp": str(result["webp"]),
        "jpg": str(result["jpg"]),
        "size_kb": result["size_kb"],
    })

pkg["status"] = "READY_FOR_REVIEW"
pkg["processedAt"] = "2026-06-27T03:00:00+07:00"
pkg["outputDir"] = str(OUT_DIR)
PKG_PATH.write_text(json.dumps(pkg, ensure_ascii=False, indent=2), encoding="utf-8")

status = {
    "status": "READY_FOR_REVIEW",
    "slug": "hut-be-phot-hai-ha-rankmath-90",
    "briefPath": str(ROOT / "image-briefs" / "hut-be-phot-hai-ha-rankmath-90-image-brief.json"),
    "packagePath": str(PKG_PATH),
    "outputDir": str(OUT_DIR),
    "imageCount": len(processed),
    "updatedAt": "2026-06-27T03:00:00+07:00",
    "processed": processed,
}
STATUS_PATH.write_text(json.dumps(status, ensure_ascii=False, indent=2), encoding="utf-8")

print(json.dumps(status, ensure_ascii=False, indent=2))
