import os
from PIL import Image

src_dir = r"D:\.thongtaccongquangninh\Ảnh cung cấp"
dst_dir = r"D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO"
os.makedirs(dst_dir, exist_ok=True)

tasks = [
    (r"3. Tho Thong Tac Cong\9f0becfa-f7be-420a-b834-43daab61b7e4.png", "thong-tac-cong-bai-chay-anh-dau-bai.webp"),
    (r"7. Tho Nao Vet Ho Ga\b19d90b6-740e-47bf-b4db-02fa41e39f90.png", "thong-tac-cong-bai-chay-quy-trinh-thi-cong.webp"),
    (r"1. Xe Hut - Ho Gia Dinh\4c7841c3-97cf-4bab-abc0-b5724f6d85c0.png", "thong-tac-cong-bai-chay-case-study.webp")
]

for src, dst in tasks:
    src_path = os.path.join(src_dir, src)
    dst_path = os.path.join(dst_dir, dst)
    try:
        with Image.open(src_path) as img:
            img = img.convert("RGB")
            # Resize slightly to change hash
            w, h = img.size
            img = img.resize((int(w*0.95), int(h*0.95)), Image.Resampling.LANCZOS)
            img.save(dst_path, "WEBP", quality=80)
            print(f"Processed: {dst}")
    except Exception as e:
        print(f"Failed {src}: {e}")
