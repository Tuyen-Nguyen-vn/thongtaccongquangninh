"""
Fix image reuse cho các bài 2026 batch.
Với mỗi post "recipient": download ảnh dùng chung, crop 12%, upload WP, swap URL trong content.

Usage:
  python tools/fix_image_reuse_2026_batch.py --dry-run
  python tools/fix_image_reuse_2026_batch.py --write
"""
import sys, os, re, io, json, time, base64, hashlib, tempfile, argparse
import urllib.request, ssl
from pathlib import Path
import requests
from PIL import Image

# SSL context bỏ verify cho urllib
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

# ── Config ───────────────────────────────────────────────────────────────────
ENV_PATH = r"C:\Users\DELL\Documents\Codex\2026-04-28\chatgpt-apps-plugin-chatgpt-apps-openai\.env"
WP_BASE  = "https://thongtaccongquangninh.com"
WP_HOST  = "thongtaccongquangninh.com"
CSV_PATH = r"D:\.thongtaccongquangninh\docs\SEO_PROGRESS.csv"
CROP_PCT = 0.12   # crop 12% từ bottom

def load_env(path):
    env = {}
    for line in open(path, encoding="utf-8"):
        m = re.match(r"^([^#=\s]+)\s*=\s*(.+)$", line.strip())
        if m:
            env[m.group(1)] = m.group(2).strip().strip("\"'")
    return env

env = load_env(ENV_PATH)
WP_USER = env.get("WP_USERNAME", "")
WP_PASS = env.get("WP_APP_PASSWORD", "")
AUTH    = base64.b64encode(f"{WP_USER}:{WP_PASS}".encode()).decode()

HEADERS = {
    "Authorization": f"Basic {AUTH}",
}

SESSION = requests.Session()
SESSION.verify = False
SESSION.headers.update(HEADERS)
import urllib3; urllib3.disable_warnings()

# ── Reuse groups: (owner_slug, recipient_slug, shared_filename, new_name_for_recipient, new_alt) ──
REUSE_FIXES = [
    # G01: khu-nha-tro-01.webp shared in nha-hang, dau-hieu
    {
        "file": "hut-be-phot-khu-nha-tro-quang-ninh-2026-01.webp",
        "owner_slug": "hut-be-phot-khu-nha-tro-quang-ninh-2026",
        "recipients": [
            {"slug": "hut-be-phot-nha-hang-quang-ninh-2026",
             "new_name": "hut-be-phot-nha-hang-quang-ninh-2026-xe-bom.webp",
             "new_alt": "xe hút bể phốt nhà hàng Quảng Ninh"},
            {"slug": "dau-hieu-be-phot-bi-day-2026",
             "new_name": "dau-hieu-be-phot-bi-day-xe-hut-quang-ninh.webp",
             "new_alt": "dấu hiệu bể phốt bị đầy cần hút Quảng Ninh"},
        ]
    },
    # G02: khu-nha-tro-03.webp shared in khach-san, khan-cap
    {
        "file": "hut-be-phot-khu-nha-tro-quang-ninh-2026-03.webp",
        "owner_slug": "hut-be-phot-khu-nha-tro-quang-ninh-2026",
        "recipients": [
            {"slug": "hut-be-phot-khach-san-quang-ninh-2026",
             "new_name": "hut-be-phot-khach-san-quang-ninh-2026-tho-xu-ly.webp",
             "new_alt": "thợ hút bể phốt khách sạn Quảng Ninh"},
            {"slug": "hut-be-phot-khan-cap-quang-ninh-2026",
             "new_name": "hut-be-phot-khan-cap-quang-ninh-2026-xe-bom.webp",
             "new_alt": "xe hút bể phốt khẩn cấp Quảng Ninh 24/7"},
        ]
    },
    # G10: khan-cap-01.webp shared in cong-ty
    {
        "file": "thong-tac-cong-khan-cap-quang-ninh-2026-01.webp",
        "owner_slug": "thong-tac-cong-khan-cap-quang-ninh-2026",
        "recipients": [
            {"slug": "hut-be-phot-cong-ty-quang-ninh-2026",
             "new_name": "hut-be-phot-cong-ty-quang-ninh-2026-tho-may-bom.webp",
             "new_alt": "thợ hút bể phốt công ty khu công nghiệp Quảng Ninh"},
        ]
    },
    # G11: khu-nha-tro-02.webp shared in hut-ham-cau
    {
        "file": "hut-be-phot-khu-nha-tro-quang-ninh-2026-02.webp",
        "owner_slug": "hut-be-phot-khu-nha-tro-quang-ninh-2026",
        "recipients": [
            {"slug": "hut-ham-cau-quang-ninh-2026",
             "new_name": "hut-ham-cau-quang-ninh-2026-xe-bom-lon.webp",
             "new_alt": "xe hút hầm cầu Quảng Ninh bơm hút sạch"},
        ]
    },
    # G12: khach-san-03.webp shared in hut-ham-cau
    {
        "file": "hut-be-phot-khach-san-quang-ninh-2026-03.webp",
        "owner_slug": "hut-be-phot-khach-san-quang-ninh-2026",
        "recipients": [
            {"slug": "hut-ham-cau-quang-ninh-2026",
             "new_name": "hut-ham-cau-quang-ninh-2026-quy-trinh-thi-cong.webp",
             "new_alt": "quy trình hút hầm cầu đúng kỹ thuật Quảng Ninh"},
        ]
    },
    # G14: nha-hang-03.webp shared in dau-hieu
    {
        "file": "hut-be-phot-nha-hang-quang-ninh-2026-03.webp",
        "owner_slug": "hut-be-phot-nha-hang-quang-ninh-2026",
        "recipients": [
            {"slug": "dau-hieu-be-phot-bi-day-2026",
             "new_name": "dau-hieu-be-phot-bi-day-mui-hoi-nha-hang.webp",
             "new_alt": "dấu hiệu bể phốt bị đầy mùi hôi nhà hàng"},
        ]
    },
    # G15: nha-hang-01.webp shared in dau-hieu
    {
        "file": "hut-be-phot-nha-hang-quang-ninh-2026-01.webp",
        "owner_slug": "hut-be-phot-nha-hang-quang-ninh-2026",
        "recipients": [
            {"slug": "dau-hieu-be-phot-bi-day-2026",
             "new_name": "dau-hieu-be-phot-bi-day-anh-thuc-te.webp",
             "new_alt": "ảnh thực tế bể phốt đầy tại Quảng Ninh"},
        ]
    },
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def get_post_by_slug(slug):
    """Return (id, content_raw) or None."""
    for post_type in ["posts", "pages"]:
        r = SESSION.get(f"{WP_BASE}/wp-json/wp/v2/{post_type}",
                        params={"slug": slug, "_fields": "id,content,slug"},
                        timeout=20)
        if r.ok and r.json():
            item = r.json()[0]
            return item["id"], item["content"].get("raw") or item["content"].get("rendered","")
    return None, None


def find_image_url_in_content(content, filename):
    """Find the full URL of an image by filename in post content."""
    pattern = r'https?://[^\s"\'<>]*' + re.escape(filename)
    m = re.search(pattern, content)
    if m:
        return m.group(0)
    # Try /wp-content/uploads/...
    pattern2 = r'/wp-content/uploads/[^\s"\'<>]*' + re.escape(filename)
    m2 = re.search(pattern2, content)
    if m2:
        return "https://" + WP_HOST + m2.group(0)
    return None


def download_image(url):
    """Download image bằng urllib (tránh requests redirect bug). Return (PIL Image, bytes)."""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=_ssl_ctx, timeout=30) as resp:
        img_bytes = resp.read()
    return Image.open(io.BytesIO(img_bytes)), img_bytes


def crop_image(img_bytes, crop_pct=CROP_PCT):
    """Crop bottom crop_pct from image. Return bytes (webp)."""
    img = Image.open(io.BytesIO(img_bytes))
    w, h = img.size
    new_h = int(h * (1 - crop_pct))
    cropped = img.crop((0, 0, w, new_h))
    out = io.BytesIO()
    fmt = "WEBP" if cropped.mode in ("RGB", "RGBA") else "JPEG"
    cropped.save(out, format=fmt, quality=88)
    return out.getvalue()


def upload_to_wp(img_bytes, filename):
    """Upload image to WP media library. Return media URL or None."""
    headers = {
        "Authorization": f"Basic {AUTH}",
        "Host": WP_HOST,
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Content-Type": "image/webp" if filename.endswith(".webp") else "image/jpeg",
    }
    r = SESSION.post(f"{WP_BASE}/wp-json/wp/v2/media",
                     data=img_bytes, headers=headers, timeout=60)
    if r.ok:
        data = r.json()
        return data.get("source_url",""), data.get("id","")
    print(f"    Upload FAIL {r.status_code}: {r.text[:200]}")
    return None, None


def update_post_content(post_id, content):
    """Update post content."""
    r = SESSION.post(f"{WP_BASE}/wp-json/wp/v2/posts/{post_id}",
                     json={"content": content}, timeout=20)
    if not r.ok:
        r2 = SESSION.post(f"{WP_BASE}/wp-json/wp/v2/pages/{post_id}",
                           json={"content": content}, timeout=20)
        return r2.ok
    return True


def replace_image_in_content(content, old_filename, new_url, new_alt):
    """Replace old img src and alt in content."""
    # Replace src URL
    old_pattern = r'(https?://[^\s"\'<>]*' + re.escape(old_filename) + r')'
    content = re.sub(old_pattern, new_url, content)
    # Also handle /wp-content/... relative
    old_pattern2 = r'(/wp-content/uploads/[^\s"\'<>]*' + re.escape(old_filename) + r')'
    content = re.sub(old_pattern2, new_url, content)
    # Replace alt text in the same figure block
    # Find img tag containing new_url and update alt
    def replace_alt(m):
        img_tag = m.group(0)
        img_tag = re.sub(r'alt="[^"]*"', f'alt="{new_alt}"', img_tag)
        if 'alt=' not in img_tag:
            img_tag = img_tag.replace('/>', f'alt="{new_alt}" />')
        return img_tag
    # Replace alt in img tags that now contain new_url
    content = re.sub(r'<img[^>]*' + re.escape(new_url.split('/')[-1]) + r'[^>]*>', replace_alt, content)
    return content


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--dry-run", action="store_true", default=True)
    args = parser.parse_args()
    WRITE = args.write

    if WRITE:
        print("=== WRITE MODE ===\n")
    else:
        print("=== DRY-RUN (thêm --write để thực hiện) ===\n")

    total_ok = 0
    total_fail = 0

    for group in REUSE_FIXES:
        shared_file = group["file"]
        owner_slug = group["owner_slug"]
        print(f"── Group: {shared_file}")
        print(f"   Owner: {owner_slug}")

        # Find image URL from owner post content
        owner_id, owner_content = get_post_by_slug(owner_slug)
        if not owner_content:
            print(f"   ❌ Không tìm được content owner {owner_slug}")
            total_fail += 1
            continue

        img_url = find_image_url_in_content(owner_content, shared_file)
        if not img_url:
            print(f"   ❌ Không tìm được URL ảnh {shared_file} trong {owner_slug}")
            total_fail += 1
            continue

        print(f"   Image URL: ...{img_url[-60:]}")

        if WRITE:
            # Download image once
            try:
                _, img_bytes = download_image(img_url)
                print(f"   Downloaded: {len(img_bytes)//1024}KB")
            except Exception as e:
                print(f"   ❌ Download fail: {e}")
                total_fail += 1
                continue

        for rec in group["recipients"]:
            rec_slug = rec["slug"]
            new_name = rec["new_name"]
            new_alt  = rec["new_alt"]
            print(f"\n   Recipient: {rec_slug}")
            print(f"   New file : {new_name}")
            print(f"   New alt  : {new_alt}")

            if not WRITE:
                print(f"   → DRY-RUN: skip")
                continue

            # Get recipient post
            rec_id, rec_content = get_post_by_slug(rec_slug)
            if not rec_id:
                print(f"   ❌ Không tìm được post {rec_slug}")
                total_fail += 1
                continue

            # Check if this post actually uses the shared image
            if not find_image_url_in_content(rec_content, shared_file):
                print(f"   ⚠️ {rec_slug} không dùng {shared_file}, bỏ qua")
                continue

            # Crop image
            cropped = crop_image(img_bytes)
            print(f"   Cropped: {len(cropped)//1024}KB")

            # Upload
            new_url, media_id = upload_to_wp(cropped, new_name)
            if not new_url:
                print(f"   ❌ Upload fail")
                total_fail += 1
                continue
            print(f"   Uploaded: {new_url[-60:]} (media_id={media_id})")

            # Replace in content
            new_content = replace_image_in_content(rec_content, shared_file, new_url, new_alt)
            if new_content == rec_content:
                print(f"   ⚠️ Content không thay đổi sau replace")
            else:
                ok = update_post_content(rec_id, new_content)
                if ok:
                    print(f"   ✅ Updated content post {rec_id}")
                    total_ok += 1
                else:
                    print(f"   ❌ Update content fail")
                    total_fail += 1

            time.sleep(1)

        print()

    print(f"\n=== Kết quả: {total_ok} OK / {total_fail} FAIL ===")
    if WRITE:
        from datetime import date
        with open(CSV_PATH, "a", encoding="utf-8") as f:
            f.write(f"\n{date.today()},image_reuse_fix,BATCH-2026,fix image reuse {total_ok} swaps,{'done' if total_fail==0 else 'partial'},crop 12% + upload + replace content. OK={total_ok} FAIL={total_fail}")

if __name__ == "__main__":
    main()
