import os
import glob
from PIL import Image

try:
    from rembg import remove
except ImportError:
    print("Vui lòng đợi cài đặt thư viện rembg hoàn tất...")
    exit(1)

def process():
    input_dir = r"C:\Users\DELL\Desktop\Ảnh cung cấp"
    bg_dir = r"C:\Users\DELL\.gemini\antigravity\brain\b4684879-a059-4532-abe5-1eafe68dba48"
    out_dir = r"C:\Users\DELL\Desktop\Anh-Demo-AI\Kết Quả Ghép"
    os.makedirs(out_dir, exist_ok=True)
    
    bgs = glob.glob(os.path.join(bg_dir, "*chuan_100*.png"))
    if not bgs:
        print("Không tìm thấy bối cảnh AI.")
        return
        
    bg_img = Image.open(bgs[0]).convert("RGBA")
    
    fg_path = os.path.join(input_dir, "IMG_20260130_063106.png")
    if not os.path.exists(fg_path):
        fgs = glob.glob(os.path.join(input_dir, "*.png")) + glob.glob(os.path.join(input_dir, "*.jpg"))
        if not fgs:
            print("Không có ảnh nguyên liệu.")
            return
        fg_path = fgs[0]
        
    print(f"Đang bóc tách nền bằng AI (rembg) cho ảnh: {os.path.basename(fg_path)}...")
    with open(fg_path, "rb") as i:
        fg_data = remove(i.read())
        
    temp_fg = os.path.join(out_dir, "temp_fg_transparent.png")
    with open(temp_fg, "wb") as o:
        o.write(fg_data)
        
    fg_img = Image.open(temp_fg).convert("RGBA")
    
    max_size = (int(bg_img.width * 0.8), int(bg_img.height * 0.8))
    fg_img.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    x = (bg_img.width - fg_img.width) // 2
    y = bg_img.height - fg_img.height - 20
    
    print("Đang Composite (Ghép đè) vật thể vào bối cảnh AI...")
    bg_img.paste(fg_img, (x, y), fg_img)
    
    out_path = os.path.join(out_dir, "Demo_Ghep_Tu_Dong_100_Phan_Tram.png")
    bg_img.convert("RGB").save(out_path, "PNG")
    print(f"Đã lưu kết quả tại: {out_path}")

if __name__ == "__main__":
    process()
