"""Rename accented filenames in huyen xa image folders to ASCII."""
import os
from pathlib import Path

BASE = Path("D:/.thongtaccongquangninh/Ảnh Đã Xử Lý SEO")
BRIEFS = Path("D:/.thongtaccongquangninh/image-briefs")
SLUGS = [
    "hut-be-phot-tien-yen",
    "hut-be-phot-hai-ha",
    "hut-be-phot-ba-che",
    "hut-be-phot-dam-ha",
    "hut-be-phot-binh-lieu",
    "hut-be-phot-co-to",
]

REPLACEMENTS = [
    ("quảng-ninh", "quang-ninh"),
    ("Quảng-Ninh", "quang-ninh"),
]

for slug in SLUGS:
    d = BASE / slug
    if not d.exists():
        print(f"Missing folder: {d}")
        continue
    for f in list(d.iterdir()):
        old = f.name
        new = old
        for old_str, new_str in REPLACEMENTS:
            new = new.replace(old_str, new_str)
        if old != new:
            f.rename(d / new)
            print(f"Renamed: {old} -> {new}")
    # Fix paths in package JSON
    pkg_path = BRIEFS / f"{slug}-image-package.json"
    if pkg_path.exists():
        content = pkg_path.read_text(encoding="utf-8")
        for old_str, new_str in REPLACEMENTS:
            content = content.replace(old_str, new_str)
        pkg_path.write_text(content, encoding="utf-8")
        print(f"Fixed pkg: {pkg_path.name}")

print("Done.")
