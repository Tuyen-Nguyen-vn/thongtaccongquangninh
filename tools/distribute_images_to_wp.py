import base64
import json
import os
import random
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

def first_existing_file(paths):
    for p in paths:
        path = Path(p)
        if path.is_file():
            return path
    return None

ENV_PATH = first_existing_file([
    "D:/.thongtaccongquangninh/.env",
    "C:/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env"
])
BASE_URL = "https://thongtaccongquangninh.com"

def parse_env(path: Path) -> dict[str, str]:
    env = {}
    if not path or not path.exists(): return env
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

def main():
    env = parse_env(ENV_PATH)
    base_url = env.get("WP_BASE_URL", BASE_URL)
    
    if 'WP_USERNAME' not in env or 'WP_APP_PASSWORD' not in env:
        print(f"Vui lòng thiết lập WP_USERNAME và WP_APP_PASSWORD trong file {ENV_PATH}")
        return
        
    auth = "Basic " + base64.b64encode(f"{env['WP_USERNAME']}:{env['WP_APP_PASSWORD']}".encode()).decode()
    
    img_dir = Path(r"D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO")
    all_images = list(img_dir.glob("*.webp"))
    if not all_images:
        print("Không tìm thấy ảnh đã xử lý.")
        return
        
    print(f"Đang kết nối lấy danh sách các Bản Nháp (Drafts) từ Website...")
    try:
        posts = wp_request(base_url, auth, "/wp/v2/posts?status=draft&per_page=100&context=edit")
        pages = wp_request(base_url, auth, "/wp/v2/pages?status=draft&per_page=100&context=edit")
    except Exception as e:
        print(f"Lỗi kết nối WordPress: {e}")
        return
    
    all_drafts = [(p, "posts") for p in posts] + [(p, "pages") for p in pages]
    print(f"Tìm thấy {len(all_drafts)} bản nháp chờ xử lý ảnh.")
    
    count = 0
    for draft, post_type in all_drafts:
        slug = draft.get('slug', '')
        title = draft.get('title', {}).get('raw', draft.get('title', {}).get('rendered', ''))
        content = draft.get('content', {}).get('raw', draft.get('content', {}).get('rendered', ''))
        
        # Nhận dạng loại dịch vụ
        prefix = "tho-thong-tac-cong"
        if "hut-be-phot" in slug or "hut-ham-cau" in slug:
            prefix = "xe-hut"
        elif "bon-cau" in slug:
            prefix = "tho-thong-bon-cau"
        elif "chau-rua" in slug:
            prefix = "tho-thong-chau-rua"
        elif "mui-hoi" in slug:
            prefix = "tho-xu-ly-mui-hoi"
        elif "ho-ga" in slug:
            prefix = "tho-nao-vet-ho-ga"
            
        matching_images = [img for img in all_images if img.name.startswith(prefix)]
        if not matching_images:
            matching_images = all_images # Dùng tạm ảnh bất kỳ nếu thiếu
            
        # Chọn ngẫu nhiên 2 ảnh không trùng lặp
        selected = random.sample(matching_images, min(2, len(matching_images)))
        print(f"Đang tải {len(selected)} ảnh cho bài: {title}...")
        
        inserted_figures = []
        for img_path in selected:
            # Tải ảnh lên Media Library
            media = wp_request(
                base_url, auth, "/wp/v2/media", method="POST", body=img_path.read_bytes(),
                headers={"Content-Type": "image/webp", "Content-Disposition": f'attachment; filename="{img_path.name}"'}
            )
            media_id = media["id"]
            media_url = media["source_url"]
            
            # Cập nhật Thẻ Alt chuẩn SEO
            alt_text = f"Ảnh thi công thực tế {title}"
            wp_request(
                base_url, auth, f"/wp/v2/media/{media_id}", method="POST",
                body=json.dumps({"alt_text": alt_text, "caption": alt_text, "title": alt_text}).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            
            figure = f'<!-- wp:image {{"id":{media_id},"sizeSlug":"large","linkDestination":"none"}} -->\n<figure class="wp-block-image size-large"><img src="{media_url}" alt="{alt_text}" class="wp-image-{media_id}"/><figcaption class="wp-element-caption">{alt_text}</figcaption></figure>\n<!-- /wp:image -->'
            inserted_figures.append(figure)
            
        if not inserted_figures: continue
        
        # Chèn ảnh vào bài viết
        paragraphs = content.split("<!-- wp:paragraph -->")
        if len(paragraphs) > 2:
            paragraphs.insert(2, inserted_figures[0] + "\n")
            if len(inserted_figures) > 1:
                paragraphs.insert(len(paragraphs) - 1, inserted_figures[1] + "\n")
            new_content = "<!-- wp:paragraph -->".join(paragraphs)
        else:
            new_content = inserted_figures[0] + "\n\n" + content
            if len(inserted_figures) > 1:
                new_content += "\n\n" + inserted_figures[1]
            
        # Update WordPress
        wp_request(
            base_url, auth, f"/wp/v2/{post_type}/{draft['id']}", method="POST",
            body=json.dumps({"content": new_content}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        print(f"   => ✅ Đã nhúng ảnh thành công vào bài: /{slug}/")
        count += 1
        
    print(f"\nHOÀN TẤT! Đã phủ ảnh SEO lên {count} Bản Nháp.")

if __name__ == "__main__":
    main()
