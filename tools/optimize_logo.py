import os
from PIL import Image

src_path = r"d:\.thongtaccongquangninh\tools\wp-plugins\ttcqn-home-emergency-renderer\assets\logo-moi-truong-do-thi-so-1-quang-ninh-header.png"
dest_path = r"d:\.thongtaccongquangninh\tools\wp-plugins\ttcqn-home-emergency-renderer\assets\logo-moi-truong-do-thi-so-1-quang-ninh-header.webp"

if not os.path.exists(src_path):
    print("Source logo not found!")
    exit(1)

img = Image.open(src_path)

# Resize to 356x94
try:
    resampling = Image.Resampling.LANCZOS
except AttributeError:
    resampling = Image.ANTIALIAS

resized_img = img.resize((356, 94), resampling)

# Save as webp with quality 90 to keep text crisp and preserve transparency
resized_img.save(dest_path, "WEBP", quality=90)

print(f"Optimized logo saved: {dest_path}")
print(f"Original size: {os.path.getsize(src_path)} bytes")
print(f"Optimized size: {os.path.getsize(dest_path)} bytes")
