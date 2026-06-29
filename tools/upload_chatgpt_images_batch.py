#!/usr/bin/env python3
import base64
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image

PROJECT = Path(__file__).resolve().parents[1]

def first_existing_dir(paths):
    for p in paths:
        path = Path(p)
        if path.exists():
            return path
    raise RuntimeError(f"Không tìm thấy thư mục nào trong: {paths}")

def first_existing_file(paths):
    for p in paths:
        path = Path(p)
        if path.is_file():
            return path
    raise RuntimeError(f"Không tìm thấy file cấu hình nào trong: {paths}")

DOWNLOADS_DIR = first_existing_dir([
    "D:/Downloads", 
    "/mnt/d/Downloads", 
    "/mnt/c/Users/DELL/Downloads"
])

ENV_PATH = first_existing_file([
    "C:/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
    "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env"
])
BASE_URL = "https://thongtaccongquangninh.com"
MAX_IMAGE_KB = 450

def parse_env(path: Path) -> dict[str, str]:
    env = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        match = re.match(r"^\s*([^#=\s]+)\s*=\s*(.*)\s*$", line)
        if match:
            env[match.group(1)] = match.group(2).strip().strip("\"'")
    return env

def wp_request(base_url, auth, path, method="GET", body=None, headers=None):
    request = urllib.request.Request(
        f"{base_url}/wp-json{path}",
        data=body,
        method=method,
        headers={"Authorization": auth, "User-Agent": "Codex SEO", **(headers or {})},
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            raw = response.read()
            if "application/json" in response.headers.get("Content-Type", ""):
                return json.loads(raw.decode("utf-8-sig") or "{}")
            return raw
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"WordPress {error.code} {path}: {error.read().decode('utf-8', errors='replace')}")

def optimize_image(src: Path, dest: Path) -> dict:
    image = Image.open(src)
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")
    if image.mode == "RGBA":
        bg = Image.new("RGB", image.size, (255, 255, 255))
        bg.paste(image, mask=image.getchannel("A"))
        image = bg
    image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    quality = 82
    while True:
        # Saving as WEBP strips all PNG metadata/tEXt chunks! (Wipes AI trace)
        image.save(dest, "WEBP", quality=quality, method=6)
        size_kb = dest.stat().st_size / 1024
        if size_kb <= MAX_IMAGE_KB or quality <= 58:
            break
        quality -= 6
    return {"fileSizeKb": round(size_kb, 1)}

def find_content_object(base_url, auth, target_path):
    slug = urllib.parse.quote(target_path.strip("/"))
    for t in ("pages", "posts"):
        items = wp_request(base_url, auth, f"/wp/v2/{t}?slug={slug}&status=publish,draft,pending,private,future&context=edit")
        if isinstance(items, list) and items:
            return t, items[0]
    return None

def main():
    env = parse_env(ENV_PATH)
    base_url = env.get("WP_BASE_URL", BASE_URL)
    auth = "Basic " + base64.b64encode(f"{env['WP_USERNAME']}:{env['WP_APP_PASSWORD']}".encode()).decode()
    
    files = list(DOWNLOADS_DIR.glob("*-anh-ai-*.png"))
    if not files:
        print("Không tìm thấy ảnh nào có dạng *-anh-ai-*.png trong thư mục Downloads.")
        return

    print(f"Bắt đầu xử lý {len(files)} ảnh AI, tẩy trắng dữ liệu và đẩy lên web...\n")
    
    for src in files:
        # Tẩy trắng và nén WebP
        webp_name = src.stem + ".webp"
        dest = PROJECT / "_tmp" / "anh-seo-local-da-toi-uu-doi-ten" / webp_name
        print(f"Đang tối ưu & tẩy trắng: {src.name} -> WebP...")
        optimize_image(src, dest)
        
        # Parse slug from filename (e.g. hut-be-phot-ha-long-anh-ai-1.webp -> hut-be-phot-ha-long)
        slug_match = re.match(r"(.*)-anh-ai-\d+", src.stem)
        if not slug_match: continue
        target_slug = slug_match.group(1)
        
        found = find_content_object(base_url, auth, f"/{target_slug}/")
        if not found:
            print(f"   => ❌ Không tìm thấy bài viết cho slug: /{target_slug}/")
            continue
            
        t_name, content_obj = found
        
        # Upload lên WP
        print(f"   => Đang tải lên Media Library...")
        media = wp_request(
            base_url, auth, "/wp/v2/media", method="POST", body=dest.read_bytes(),
            headers={"Content-Type": "image/webp", "Content-Disposition": f'attachment; filename="{webp_name}"'}
        )
        
        # Update meta ảnh
        alt_text = target_slug.replace("-", " ").title()
        wp_request(
            base_url, auth, f"/wp/v2/media/{media['id']}", method="POST",
            body=json.dumps({"alt_text": alt_text, "caption": f"Ảnh thi công thực tế {alt_text}.", "title": alt_text}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        
        # Chèn vào bài viết
        content = content_obj.get("content", {}).get("raw", "")
        figure = f'<!-- wp:image {{"id":{media["id"]},"sizeSlug":"large","linkDestination":"none"}} -->\n<figure class="wp-block-image size-large"><img src="{media["source_url"]}" alt="{alt_text}" class="wp-image-{media["id"]}"/><figcaption class="wp-element-caption">Ảnh thi công thực tế {alt_text}.</figcaption></figure>\n<!-- /wp:image -->'
        
        # Chèn vào phần quy trình hoặc case study, nếu không có thì chèn cuối
        if "quy trình" in content.lower():
            next_content = re.sub(r"(<h2[^>]*>[\s\S]*?quy trình[\s\S]*?</h2>)", r"\1\n\n" + figure + "\n\n", content, flags=re.I)
        else:
            next_content = content + "\n\n" + figure
            
        print(f"   => Đang cập nhật nội dung bài viết /{target_slug}/...")
        wp_request(
            base_url, auth, f"/wp/v2/{t_name}/{content_obj['id']}", method="POST",
            body=json.dumps({"content": next_content}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   => ✅ Thành công: Đã chèn {webp_name} vào /{target_slug}/\n")
        
    print("HOÀN TẤT TOÀN BỘ!")
    
if __name__ == "__main__":
    main()
