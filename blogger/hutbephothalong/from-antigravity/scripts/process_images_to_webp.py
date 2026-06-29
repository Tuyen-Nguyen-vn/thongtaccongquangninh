import os
import time
from PIL import Image

def process_images():
    source_dir = r"D:\.thongtaccongquangninh\Ảnh cung cấp\1. Xe Hut - Ho Gia Dinh"
    dest_dir = r"d:\.Antigravity\Projects\images_seo"
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        print(f"Da tao thu muc luu anh toi uu tai: {dest_dir}")
        
    if not os.path.exists(source_dir):
        print(f"Loi: Khong tim thay thu muc nguon tai {source_dir}!")
        return
        
    print("\n--- BAT DAU TOI UU HOA HINH ANH SANG WEBP CHUAN SEO ---")
    
    # Lay danh sach file trong thu muc nguon
    files = [f for f in os.listdir(source_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    print(f"Tim thay {len(files)} file anh goc.")
    
    # Lay toi da 4 anh tieu bieu de toi uu
    selected_files = files[:4]
    
    success_count = 0
    for idx, filename in enumerate(selected_files):
        src_path = os.path.join(source_dir, filename)
        new_name = f"xe-hut-be-phot-ha-long-quang-ninh-{idx+1}.webp"
        dest_path = os.path.join(dest_dir, new_name)
        
        print(f"\nDang xu ly file: {filename}")
        orig_size = os.path.getsize(src_path) / (1024 * 1024) # MB
        print(f"Dung luong goc: {orig_size:.2f} MB")
        
        try:
            with Image.open(src_path) as img:
                # 1. Tu dong resize ve chieu rong toi da 1200px (giu nguyen ty le anh 16:9)
                max_width = 1200
                if img.width > max_width:
                    ratio = max_width / float(img.width)
                    new_height = int(float(img.height) * float(ratio))
                    img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                    print(f"Da thay doi kich thuoc: {max_width}x{new_height}px")
                
                # 2. Nen va luu sang dinh dang WebP voi chat luong 82%
                img.save(dest_path, "WEBP", quality=82)
                
            new_size = os.path.getsize(dest_path) / 1024 # KB
            reduction = (1 - (new_size / (orig_size * 1024))) * 100
            print(f"Dung luong sau toi uu: {new_size:.1f} KB (Giam {reduction:.1f}%!)")
            print(f"File duoc luu tai: {dest_path}")
            success_count += 1
            
        except Exception as e:
            print(f"Da xay ra loi khi toi uu file {filename}: {e}")
            
    print(f"\n--- TOI UU THANH CONG {success_count}/{len(selected_files)} ANH SANG WEBP ---")

if __name__ == "__main__":
    process_images()
