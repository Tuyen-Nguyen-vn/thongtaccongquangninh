import os
import random
import glob
from PIL import Image, ImageEnhance, ImageDraw, ImageFont

def process_images():
    input_base = r"D:\.thongtaccongquangninh\Ảnh cung cấp"
    out_dir = r"D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO"
    logo_path = r"D:\.thongtaccongquangninh\logo.png"
    
    os.makedirs(out_dir, exist_ok=True)
    print("Bắt đầu xử lý hình ảnh SEO...")
    
    # Danh sách các ảnh ĐÃ CÓ SẴN LOGO/SĐT (Không chèn đè)
    skip_watermark_files = {
        "4c7841c3-97cf-4bab-abc0-b5724f6d85c0.png",
        "9f0becfa-f7be-420a-b834-43daab61b7e4.png",
        "760e2309-8232-4604-81e5-cf2dc7f3355b.png",
        "63b66537-c482-45f8-99e2-41109d36aa0f.png",
        "9b6fb9e7-96e7-42e1-9559-027832aba90f.png",
        "b19d90b6-740e-47bf-b4db-02fa41e39f90.png"
    }
    
    try:
        logo = Image.open(logo_path).convert("RGBA")
    except Exception as e:
        print(f"Không thể tải logo: {e}")
        return
        
    logo_width = 300
    wpercent = (logo_width/float(logo.size[0]))
    hsize = int((float(logo.size[1])*float(wpercent)))
    logo = logo.resize((logo_width, hsize), Image.Resampling.LANCZOS)
    
    folders = {
        "1. Xe Hut - Ho Gia Dinh": "XE HÚT BỂ PHỐT", 
        "2. Xe Hut - Cong Ty KCN": "HÚT BỂ PHỐT KHU CÔNG NGHIỆP", 
        "3. Tho Thong Tac Cong": "THÔNG TẮC CỐNG", 
        "4. Tho Thong Bon Cau": "THÔNG TẮC BỒN CẦU", 
        "5. Tho Thong Chau Rua": "THÔNG TẮC CHẬU RỬA", 
        "6. Tho Xu Ly Mui Hoi": "XỬ LÝ MÙI HÔI TRIỆT ĐỂ", 
        "7. Tho Nao Vet Ho Ga": "NẠO VÉT HỐ GA", 
        "8. Hop Dong - Hoa Don VAT": "CUNG CẤP HÓA ĐƠN VAT"
    }
    
    try:
        font_path = "arialbd.ttf"
        title_font = ImageFont.truetype(font_path, 45)
        phone_font = ImageFont.truetype(font_path, 35)
    except:
        title_font = ImageFont.load_default()
        phone_font = ImageFont.load_default()
    
    cities = ["Hạ Long", "Cẩm Phả", "Uông Bí", "Móng Cái", "Đông Triều", "Quảng Yên", "Vân Đồn", "Tiên Yên", "Hải Hà", "Đầm Hà", "Bình Liêu", "Ba Chẽ"]
    
    count = 0
    for folder, service_name in folders.items():
        folder_path = os.path.join(input_base, folder)
        if not os.path.exists(folder_path): continue
        
        images = glob.glob(os.path.join(folder_path, "*.jpg")) + glob.glob(os.path.join(folder_path, "*.png"))
        for i, img_path in enumerate(images):
            try:
                filename = os.path.basename(img_path)
                img = Image.open(img_path).convert("RGBA")
                
                is_skip = filename in skip_watermark_files
                
                if not is_skip:
                    # 1. Smart Crop
                    w, h = img.size
                    crop_margin_w = int(w * 0.1)
                    crop_margin_h = int(h * 0.1)
                    left = random.randint(0, crop_margin_w)
                    top = random.randint(0, crop_margin_h)
                    right = w - random.randint(0, crop_margin_w)
                    bottom = h - random.randint(0, crop_margin_h)
                    img = img.crop((left, top, right, bottom))
                    
                    # 2. Color Grading
                    enhancer = ImageEnhance.Brightness(img)
                    img = enhancer.enhance(random.uniform(0.95, 1.05))
                    enhancer_contrast = ImageEnhance.Contrast(img)
                    img = enhancer_contrast.enhance(random.uniform(0.95, 1.05))
                    
                    # Standardize size
                    img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
                    bg_w, bg_h = img.size
                    
                    # 3. Text Overlay (Geo-Watermark)
                    draw = ImageDraw.Draw(img, "RGBA")
                    city = random.choice(cities)
                    main_text = f"{service_name} TẠI {city.upper()}"
                    sub_text = "☎ Hotline: 0931.156.756"
                    
                    rect_height = 130
                    rect_top = bg_h - rect_height
                    draw.rectangle([(0, rect_top), (bg_w, bg_h)], fill=(0, 0, 0, 200))
                    
                    draw.text((30, rect_top + 20), main_text, fill=(255, 255, 255, 255), font=title_font)
                    draw.text((30, rect_top + 75), sub_text, fill=(255, 215, 0, 255), font=phone_font)
                    
                    # 4. Logo Overlay (Top Right)
                    offset = (bg_w - logo_width - 20, 20)
                    img.paste(logo, offset, logo)
                else:
                    # Nếu là ảnh có sẵn logo, chỉ thu phóng về kích thước chuẩn và giữ nguyên
                    img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
                
                # Convert & Save as WebP
                final_img = img.convert("RGB")
                safe_folder_name = folder.split('. ')[1].replace(' ', '-').lower()
                save_name = f"{safe_folder_name}-{i}.webp"
                save_path = os.path.join(out_dir, save_name)
                
                final_img.save(save_path, "webp", quality=85)
                
                if is_skip:
                    print(f"Đã xử lý (GIỮ NGUYÊN BẢN GỐC): {save_name}")
                else:
                    print(f"Đã xử lý: {save_name} ({main_text})")
                    
                count += 1
                
            except Exception as e:
                print(f"Lỗi xử lý {img_path}: {e}")
                
    print(f"HOÀN THÀNH! Đã xử lý {count} hình ảnh.")

if __name__ == "__main__":
    process_images()
