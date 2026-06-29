#!/usr/bin/env python3
"""Fix unique image issues and fill missing images for the final 4 pages to hit 100% compliance."""

import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from PIL import Image, ImageOps

# Configuration paths
PROJECT = Path("D:/.thongtaccongquangninh")
ENV_PATH = PROJECT / ".env"
SOURCE_DIR = PROJECT / "Ảnh cung cấp"
OUTPUT_DIR = PROJECT / "Ảnh Đã Xử Lý SEO"

def parse_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        raise FileNotFoundError(f"Environment file not found at {path}")
    for line in path.read_text(encoding="utf-8").splitlines():
        match = re.match(r"^\s*([^#=\s]+)\s*=\s*(.*)\s*$", line)
        if match:
            env[match.group(1)] = match.group(2).strip().strip("\"'")
    return env

# Initialize env
env = parse_env(ENV_PATH)
base_url = env.get("WP_BASE_URL") or "https://thongtaccongquangninh.com"
username = env["WP_USERNAME"]
password = env["WP_APP_PASSWORD"]
auth = "Basic " + base64.b64encode(f"{username}:{password}".encode()).decode()

def wp_request(path: str, method: str = "GET", body: bytes | None = None, headers=None):
    request = urllib.request.Request(
        f"{base_url}/wp-json{path}",
        data=body,
        method=method,
        headers={
            "Authorization": auth,
            "User-Agent": "Codex SEO unique image corrector",
            **(headers or {}),
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            raw = response.read()
            ctype = response.headers.get("Content-Type", "")
            if "application/json" in ctype:
                return json.loads(raw.decode("utf-8-sig") or "{}")
            return raw
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw)
            message = payload.get("message", raw)
        except Exception:
            message = raw
        raise RuntimeError(f"WordPress {error.code} {path}: {message}") from error

def optimize_image(src: Path, dest: Path, max_kb: int = 450) -> dict:
    image = ImageOps.exif_transpose(Image.open(src))
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")
    if image.mode == "RGBA":
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.getchannel("A"))
        image = background
    original_size = image.size
    max_side = 1600
    if max(image.size) > max_side:
        image.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    quality = 82
    while True:
        dest.parent.mkdir(parents=True, exist_ok=True)
        image.save(dest, "WEBP", quality=quality, method=6)
        size_kb = round(dest.stat().st_size / 1024, 1)
        if size_kb <= max_kb or quality <= 58:
            break
        quality -= 6
    return {
        "source": str(src),
        "output": str(dest),
        "originalSize": original_size,
        "outputSize": image.size,
        "quality": quality,
        "fileSizeKb": size_kb,
    }

def find_existing_media(file_name: str):
    stem = Path(file_name).stem
    items = wp_request(f"/wp/v2/media?search={urllib.parse.quote(stem)}&per_page=20")
    if isinstance(items, list):
        for item in items:
            if file_name in str(item.get("source_url", "")):
                return item
    return None

def upload_media(file_path: Path, new_file: str, alt: str, caption: str):
    existing = find_existing_media(new_file)
    if existing:
        print(f"Media {new_file} already exists in WP library. Using existing media ID: {existing['id']}")
        return existing
    
    print(f"Uploading new media {new_file} to WP library...")
    media = wp_request(
        "/wp/v2/media",
        method="POST",
        body=file_path.read_bytes(),
        headers={
            "Content-Type": "image/webp",
            "Content-Disposition": f'attachment; filename="{new_file}"',
        },
    )
    wp_request(
        f"/wp/v2/media/{media['id']}",
        method="POST",
        body=json.dumps(
            {
                "alt_text": alt,
                "caption": caption,
                "description": "Ảnh thi công thực tế chuẩn SEO độc bản.",
                "title": Path(new_file).stem.replace("-", " "),
            },
            ensure_ascii=False,
        ).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    return media

def find_content_object(slug: str):
    slug_encoded = urllib.parse.quote(slug)
    for type_name in ("pages", "posts"):
        items = wp_request(
            f"/wp/v2/{type_name}?slug={slug_encoded}&status=publish,draft,pending,private,future&context=edit",
        )
        if isinstance(items, list) and items:
            return type_name, items[0]
    return None

def figure_html(media: dict, alt: str, caption: str) -> str:
    return (
        f'<!-- wp:image {{"id":{media["id"]},"sizeSlug":"large","linkDestination":"none"}} -->\n'
        f'<figure class="wp-block-image size-large"><img src="{media["source_url"]}" '
        f'alt="{alt}" class="wp-image-{media["id"]}"/>'
        f'<figcaption class="wp-element-caption">{caption}</figcaption></figure>\n'
        "<!-- /wp:image -->"
    )

def insert_figure(content: str, figure: str, position: str) -> str:
    if re.search(r"đầu bài|sau mở bài|gioi thieu|giới thiệu", position, flags=re.I):
        match = re.search(r"</p>", content or "", flags=re.I)
        if match:
            index = match.end()
            return f"{content[:index]}\n\n{figure}\n\n{content[index:]}"
    if re.search(r"case|khách hàng|tình huống", position, flags=re.I):
        match = re.search(r"<h2[^>]*>[\s\S]*?(case|khách hàng|tình huống|e-e-a-t|niềm tin)[\s\S]*?</h2>", content or "", flags=re.I)
        if match:
            return f"{content[:match.start()]}\n\n{figure}\n\n{content[match.start():]}"
    if re.search(r"quy trình|thi công|xử lý", position, flags=re.I):
        match = re.search(r"<h2[^>]*>[\s\S]*?(quy trình|thi công|xử lý)[\s\S]*?</h2>", content or "", flags=re.I)
        if match:
            return f"{content[:match.start()]}\n\n{figure}\n\n{content[match.start():]}"
    match = re.search(r"<h2[^>]*>[\s\S]*?(gọi|liên hệ|nap)[\s\S]*?</h2>", content or "", flags=re.I)
    if match:
        return f"{content[:match.start()]}\n\n{figure}\n\n{content[match.start():]}"
    return f"{content}\n\n{figure}"

def main():
    print("=== STARTING WP UNIQUE IMAGE REPAIR FOR 4 KEY PAGES ===")
    
    # -------------------------------------------------------------
    # PAGE 1: Quảng Yên (thong-tac-cong-quang-yen)
    # Lỗi: thong-tac-cong-quang-yen-may-lo-xo-thong-cong-2.webp và thong-tac-cong-quang-yen-may-lo-xo-thong-cong-3.webp trùng pixel
    # Khắc phục: Thay thế ảnh 3 bằng ảnh nạo vét hố ga độc bản
    # -------------------------------------------------------------
    print("\n--- Repairing Page: /thong-tac-cong-quang-yen/ ---")
    page_1 = find_content_object("thong-tac-cong-quang-yen")
    if page_1:
        type_name, obj = page_1
        content = obj.get("content", {}).get("raw") or ""
        
        src_img = SOURCE_DIR / "7. Tho Nao Vet Ho Ga" / "b19d90b6-740e-47bf-b4db-02fa41e39f90.png"
        dest_img = OUTPUT_DIR / "thong-tac-cong-quang-yen-nao-vet-ho-ga-3.webp"
        
        alt_text = "Thợ nạo vét bùn hố ga cống thoát nước tại Quảng Yên tránh trào ngược"
        caption_text = "Thợ nạo vét hố ga cống thoát nước chuyên nghiệp tại Quảng Yên. Hotline: **0963.953.533 / 0931.156.756**"
        
        optimize_image(src_img, dest_img)
        media = upload_media(dest_img, "thong-tac-cong-quang-yen-nao-vet-ho-ga-3.webp", alt_text, caption_text)
        new_figure = figure_html(media, alt_text, caption_text)
        
        # Regex to find figure with the duplicated image name
        pattern = r"<!-- wp:image\b(?:(?!-- wp:image).)*?thong-tac-cong-quang-yen-may-lo-xo-thong-cong-3\.webp[\s\S]*?<!-- /wp:image -->"
        if re.search(pattern, content):
            new_content = re.sub(pattern, new_figure, content)
            wp_request(
                f"/wp/v2/{type_name}/{obj['id']}",
                method="POST",
                body=json.dumps({"content": new_content}, ensure_ascii=False).encode("utf-8"),
                headers={"Content-Type": "application/json"},
            )
            print("Successfully replaced duplicated image on Quảng Yên page!")
        else:
            print("Warning: Duplicated image filename not found in post_content! Trying fallback...")
            alt_pattern = r"<!-- wp:image\b(?:(?!-- wp:image).)*?may-lo-xo-thong-cong-3\.webp[\s\S]*?<!-- /wp:image -->"
            if re.search(alt_pattern, content):
                new_content = re.sub(alt_pattern, new_figure, content)
                wp_request(
                    f"/wp/v2/{type_name}/{obj['id']}",
                    method="POST",
                    body=json.dumps({"content": new_content}, ensure_ascii=False).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                )
                print("Successfully replaced duplicated image using fallback pattern on Quảng Yên page!")
            else:
                print("Duplicate image figure could not be replaced dynamically.")
    else:
        print("Page /thong-tac-cong-quang-yen/ not found.")

    # -------------------------------------------------------------
    # PAGE 2: Bãi Cháy (thong-tac-cong-bai-chay)
    # Lỗi: thong-tac-cong-bai-chay-may-lo-xo-quang-ninh-01.webp và thong-tac-cong-bai-chay-kiem-tra-ho-ga-02.webp trùng pixel
    # Khắc phục: Thay thế ảnh 2 bằng ảnh thợ cống độc bản
    # -------------------------------------------------------------
    print("\n--- Repairing Page: /thong-tac-cong-bai-chay/ ---")
    page_2 = find_content_object("thong-tac-cong-bai-chay")
    if page_2:
        type_name, obj = page_2
        content = obj.get("content", {}).get("raw") or ""
        
        src_img = SOURCE_DIR / "3. Tho Thong Tac Cong" / "ChatGPT Image 20_57_46 21 thg 5, 2026 (9).png"
        dest_img = OUTPUT_DIR / "thong-tac-cong-bai-chay-tho-thong-cong-02.webp"
        
        alt_text = "Thợ dùng máy lò xo thông tắc cống không đục phá tại Bãi Cháy"
        caption_text = "Thợ thi công máy lò xo thông cống công nghệ hiện đại tại Bãi Cháy. Hotline: **0963.953.533 / 0931.156.756**"
        
        optimize_image(src_img, dest_img)
        media = upload_media(dest_img, "thong-tac-cong-bai-chay-tho-thong-cong-02.webp", alt_text, caption_text)
        new_figure = figure_html(media, alt_text, caption_text)
        
        pattern = r"<!-- wp:image\b(?:(?!-- wp:image).)*?thong-tac-cong-bai-chay-kiem-tra-ho-ga-02\.webp[\s\S]*?<!-- /wp:image -->"
        if re.search(pattern, content):
            new_content = re.sub(pattern, new_figure, content)
            wp_request(
                f"/wp/v2/{type_name}/{obj['id']}",
                method="POST",
                body=json.dumps({"content": new_content}, ensure_ascii=False).encode("utf-8"),
                headers={"Content-Type": "application/json"},
            )
            print("Successfully replaced duplicated image on Bãi Cháy page!")
        else:
            print("Warning: Duplicated image filename not found in post_content! Trying fallback...")
            alt_pattern = r"<!-- wp:image\b(?:(?!-- wp:image).)*?kiem-tra-ho-ga-02\.webp[\s\S]*?<!-- /wp:image -->"
            if re.search(alt_pattern, content):
                new_content = re.sub(alt_pattern, new_figure, content)
                wp_request(
                    f"/wp/v2/{type_name}/{obj['id']}",
                    method="POST",
                    body=json.dumps({"content": new_content}, ensure_ascii=False).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                )
                print("Successfully replaced duplicated image using fallback pattern on Bãi Cháy page!")
            else:
                print("Duplicate image figure could not be replaced dynamically.")
    else:
        print("Page /thong-tac-cong-bai-chay/ not found.")

    # -------------------------------------------------------------
    # PAGE 3: Bồn cầu rút nước chậm (bon-cau-rut-cham-nguyen-nhan-3)
    # Lỗi: bon-cau-rut-cham-nguyen-nhan-thong-bon-cau-1.webp và bon-cau-rut-cham-nguyen-nhan-3-tho-thong-bon-cau-3.webp trùng pixel
    # Khắc phục: Thay thế ảnh 3 bằng ảnh thợ bồn cầu độc bản
    # -------------------------------------------------------------
    print("\n--- Repairing Page: /bon-cau-rut-cham-nguyen-nhan-3/ ---")
    page_3 = find_content_object("bon-cau-rut-cham-nguyen-nhan-3")
    if page_3:
        type_name, obj = page_3
        content = obj.get("content", {}).get("raw") or ""
        
        src_img = SOURCE_DIR / "4. Tho Thong Bon Cau" / "thong-tac-cong-quang-ninh-anh-ai-1.png"
        dest_img = OUTPUT_DIR / "bon-cau-rut-cham-nguyen-nhan-3-tho-thong-bon-cau-3-new.webp"
        
        alt_text = "Thợ thông tắc bồn cầu triệt để không đục phá tại Quảng Ninh"
        caption_text = "Quy trình thông tắc bồn cầu nhanh gọn bằng máy lò xo tại nhà Quảng Ninh. Hotline: **0963.953.533 / 0931.156.756**"
        
        optimize_image(src_img, dest_img)
        media = upload_media(dest_img, "bon-cau-rut-cham-nguyen-nhan-3-tho-thong-bon-cau-3-new.webp", alt_text, caption_text)
        new_figure = figure_html(media, alt_text, caption_text)
        
        pattern = r"<!-- wp:image\b(?:(?!-- wp:image).)*?bon-cau-rut-cham-nguyen-nhan-3-tho-thong-bon-cau-3\.webp[\s\S]*?<!-- /wp:image -->"
        if re.search(pattern, content):
            new_content = re.sub(pattern, new_figure, content)
            wp_request(
                f"/wp/v2/{type_name}/{obj['id']}",
                method="POST",
                body=json.dumps({"content": new_content}, ensure_ascii=False).encode("utf-8"),
                headers={"Content-Type": "application/json"},
            )
            print("Successfully replaced duplicated image on Bồn cầu rút chậm page!")
        else:
            print("Warning: Duplicated image filename not found in post_content! Trying fallback...")
            alt_pattern = r"<!-- wp:image\b(?:(?!-- wp:image).)*?tho-thong-bon-cau-3\.webp[\s\S]*?<!-- /wp:image -->"
            if re.search(alt_pattern, content):
                new_content = re.sub(alt_pattern, new_figure, content)
                wp_request(
                    f"/wp/v2/{type_name}/{obj['id']}",
                    method="POST",
                    body=json.dumps({"content": new_content}, ensure_ascii=False).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                )
                print("Successfully replaced duplicated image using fallback pattern on Bồn cầu rút chậm page!")
            else:
                print("Duplicate image figure could not be replaced dynamically.")
    else:
        print("Page /bon-cau-rut-cham-nguyen-nhan-3/ not found.")

    # -------------------------------------------------------------
    # PAGE 4: Chi phí hút bể phốt (chi-phi-hut-be-phot-quang-ninh)
    # Lỗi: Chỉ có 2 ảnh, thiếu 1 ảnh.
    # Khắc phục: Bổ sung xe bồn độc bản
    # -------------------------------------------------------------
    print("\n--- Repairing Page: /chi-phi-hut-be-phot-quang-ninh/ ---")
    page_4 = find_content_object("chi-phi-hut-be-phot-quang-ninh")
    if page_4:
        type_name, obj = page_4
        content = obj.get("content", {}).get("raw") or ""
        
        src_img = SOURCE_DIR / "1. Xe Hut - Ho Gia Dinh" / "ChatGPT Image 10_50_21 10 thg 5, 2026 (9).png"
        dest_img = OUTPUT_DIR / "chi-phi-hut-be-phot-quang-ninh-xe-bon-gia-dinh.webp"
        
        alt_text = "Xe bồn hút bể phốt công nghệ chân không tại hộ dân Quảng Ninh"
        caption_text = "Hút bể phốt sạch triệt để không đục phá cho hộ gia đình tại Quảng Ninh. Hotline: **0963.953.533 / 0931.156.756**"
        
        optimize_image(src_img, dest_img)
        media = upload_media(dest_img, "chi-phi-hut-be-phot-quang-ninh-xe-bon-gia-dinh.webp", alt_text, caption_text)
        new_figure = figure_html(media, alt_text, caption_text)
        
        if "chi-phi-hut-be-phot-quang-ninh-xe-bon-gia-dinh.webp" not in content:
            new_content = insert_figure(content, new_figure, "quy trình")
            wp_request(
                f"/wp/v2/{type_name}/{obj['id']}",
                method="POST",
                body=json.dumps({"content": new_content}, ensure_ascii=False).encode("utf-8"),
                headers={"Content-Type": "application/json"},
            )
            print("Successfully inserted 3rd image on Chi phí hút bể phốt page!")
        else:
            print("3rd image already inserted in post_content.")
    else:
        print("Page /chi-phi-hut-be-phot-quang-ninh/ not found.")

    print("\n=== WP UNIQUE IMAGE REPAIR WORK COMPLETED ===")

if __name__ == "__main__":
    main()
