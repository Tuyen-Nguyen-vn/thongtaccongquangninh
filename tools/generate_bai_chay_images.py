import os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

INPUT_DIR = r"D:\.thongtaccongquangninh\Ảnh cung cấp"
OUTPUT_DIR = r"D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO"

images_to_process = [
    {
        "src": os.path.join(INPUT_DIR, "3. Tho Thong Tac Cong", "anh-seo-091.png"),
        "dest": os.path.join(OUTPUT_DIR, "thong-tac-cong-bai-chay-anh-dau-bai.webp"),
        "text": "Thông Tắc Cống Bãi Cháy"
    },
    {
        "src": os.path.join(INPUT_DIR, "3. Tho Thong Tac Cong", "anh-seo-063.png"),
        "dest": os.path.join(OUTPUT_DIR, "thong-tac-cong-bai-chay-quy-trinh-thi-cong.webp"),
        "text": "Kiểm Tra Hố Ga Bãi Cháy"
    },
    {
        "src": os.path.join(INPUT_DIR, "1. Xe Hut - Ho Gia Dinh", "thong-tac-cong-quang-ninh-anh-ai-2.png"),
        "dest": os.path.join(OUTPUT_DIR, "thong-tac-cong-bai-chay-case-study.webp"),
        "text": "Xe Hút Bể Phốt Bãi Cháy"
    }
]

def process_image(src, dest, text):
    if not os.path.exists(src):
        print(f"Skipping {src}, not found.")
        return
        
    try:
        img = Image.open(src).convert('RGB')
        
        # Crop 10%
        width, height = img.size
        crop_amount = int(min(width, height) * 0.05)
        img = img.crop((crop_amount, crop_amount, width - crop_amount, height - crop_amount))
        
        # Enhance contrast slightly
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.05)
        
        # Add watermark
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("arial.ttf", 60)
        except:
            font = ImageFont.load_default()
            
        # Draw text at bottom right
        w, h = img.size
        
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_w = text_bbox[2] - text_bbox[0]
        text_h = text_bbox[3] - text_bbox[1]
        
        x = w - text_w - 40
        y = h - text_h - 40
        
        # Add a semi-transparent black background
        padding = 20
        draw.rectangle([x - padding, y - padding, x + text_w + padding, y + text_h + padding], fill=(0, 0, 0, 150))
        draw.text((x, y), text, fill=(255, 255, 255), font=font)
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        
        # Save as webp
        img.save(dest, "WEBP", quality=85)
        print(f"Saved: {dest}")
        
    except Exception as e:
        print(f"Error processing {src}: {e}")

if __name__ == "__main__":
    for item in images_to_process:
        process_image(item['src'], item['dest'], item['text'])
