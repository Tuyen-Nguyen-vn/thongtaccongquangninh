import base64
import json
import re
import urllib.request
import urllib.parse
import os
from pathlib import Path
from datetime import datetime
from PIL import Image

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
ROOT = Path(r"D:\.thongtaccongquangninh")
SOURCE_IMAGE = ROOT / "Favicon" / "favicon-thong-tac-cong-quang-ninh.png"
OPTIMIZED_IMAGE = ROOT / "Favicon" / "favicon-thong-tac-cong-quang-ninh-512.png"
REPORT_PATH = ROOT / "WORDPRESS_UPDATE_FAVICON_2026-05-10.json"

def parse_env(path: Path):
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
    with urllib.request.urlopen(request, timeout=60) as response:
        raw = response.read()
        if "application/json" in response.headers.get("Content-Type", ""):
            return json.loads(raw.decode("utf-8-sig") or "{}")
        return raw

def public_request(url):
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Codex SEO favicon verify",
            "Cache-Control": "no-cache",
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return {
            "status": response.status,
            "content_type": response.headers.get("Content-Type", ""),
            "body": response.read().decode("utf-8", errors="replace"),
        }

def main():
    print("1. Chuẩn bị xử lý ảnh làm Favicon...")
    src = SOURCE_IMAGE
    dest = OPTIMIZED_IMAGE

    if not src.exists():
        print(f"Không tìm thấy file: {src}")
        return

    img = Image.open(src).convert("RGBA")

    # Favicon cần hình vuông, resize thành 512x512
    width, height = img.size
    new_size = min(width, height)
    left = (width - new_size) / 2
    top = (height - new_size) / 2
    right = (width + new_size) / 2
    bottom = (height + new_size) / 2

    img = img.crop((left, top, right, bottom))
    img = img.resize((512, 512), Image.Resampling.LANCZOS)
    img.save(dest, "PNG")
    print(f"=> Đã resize và lưu ảnh tối ưu SEO tại: {dest.name}")

    print("2. Đọc settings hiện tại để backup...")
    env = parse_env(ENV_PATH)
    base_url = env.get("WP_BASE_URL", BASE_URL)
    auth = "Basic " + base64.b64encode(f"{env['WP_USERNAME']}:{env['WP_APP_PASSWORD']}".encode()).decode()

    before_settings = wp_request(base_url, auth, "/wp/v2/settings")
    before_site_icon = before_settings.get("site_icon")
    before_media = None
    if before_site_icon:
        try:
            before_media = wp_request(base_url, auth, f"/wp/v2/media/{before_site_icon}")
        except Exception as exc:
            before_media = {"error": str(exc)}

    print("3. Đang tải lên WordPress...")
    media = wp_request(
        base_url, auth, "/wp/v2/media", method="POST", body=dest.read_bytes(),
        headers={"Content-Type": "image/png", "Content-Disposition": f'attachment; filename="{dest.name}"'}
    )
    media_id = media["id"]
    print(f"=> Upload thành công! Media ID: {media_id}")
    
    print("4. Cập nhật Meta ảnh chuẩn SEO...")
    alt_text = "Favicon Thông Tắc Cống Quảng Ninh"
    wp_request(
        base_url, auth, f"/wp/v2/media/{media_id}", method="POST",
        body=json.dumps({
            "alt_text": alt_text,
            "caption": alt_text,
            "title": alt_text,
            "description": "Biểu tượng website thongtaccongquangninh.com."
        }, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    print("5. Cập nhật Favicon (Site Icon) trên WordPress...")
    wp_request(
        base_url, auth, "/wp/v2/settings", method="POST",
        body=json.dumps({"site_icon": media_id}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    after_settings = wp_request(base_url, auth, "/wp/v2/settings")
    after_media = wp_request(base_url, auth, f"/wp/v2/media/{media_id}")
    home = public_request(f"{base_url}/?codex_favicon_verify={int(datetime.now().timestamp())}")
    icon_links = re.findall(r'<link[^>]+rel=["\'][^"\']*(?:icon|apple-touch-icon)[^"\']*["\'][^>]*>', home["body"], flags=re.I)
    report = {
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "source": str(src),
        "optimized": str(dest),
        "optimizedSizeBytes": dest.stat().st_size,
        "before": {
            "siteIcon": before_site_icon,
            "media": {
                "id": before_media.get("id") if isinstance(before_media, dict) else None,
                "source_url": before_media.get("source_url") if isinstance(before_media, dict) else None,
                "title": before_media.get("title", {}).get("rendered") if isinstance(before_media, dict) else None,
                "error": before_media.get("error") if isinstance(before_media, dict) else None,
            },
        },
        "after": {
            "siteIcon": after_settings.get("site_icon"),
            "mediaId": media_id,
            "sourceUrl": after_media.get("source_url"),
            "altText": after_media.get("alt_text"),
        },
        "frontend": {
            "status": home["status"],
            "contentType": home["content_type"],
            "iconLinks": icon_links,
            "mentionsUploadedIcon": after_media.get("source_url", "") in home["body"],
        },
        "ok": after_settings.get("site_icon") == media_id,
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"=> Cập nhật Favicon thành công. Report: {REPORT_PATH.name}")

if __name__ == "__main__":
    main()
