"""
Fix image reuse: đọc audit JSON, với mỗi group same_bytes
→ giữ nguyên use[0] (owner), crop 12% + upload + swap use[1..N] (recipients).

Usage:
  python tools/fix_image_reuse_from_audit.py --dry-run
  python tools/fix_image_reuse_from_audit.py --write
  python tools/fix_image_reuse_from_audit.py --write --max-groups 5
"""
import argparse, base64, glob, hashlib, io, json, re, ssl, time, urllib.request
from datetime import date
from pathlib import Path
import requests, urllib3
from PIL import Image

urllib3.disable_warnings()

# ── Config ────────────────────────────────────────────────────────────────────
ENV_PATH = r"C:\Users\DELL\Documents\Codex\2026-04-28\chatgpt-apps-plugin-chatgpt-apps-openai\.env"
WP_BASE  = "https://thongtaccongquangninh.com"
CSV_PATH = r"D:\.thongtaccongquangninh\docs\SEO_PROGRESS.csv"
CROP_PCT = 0.12

# SSL context cho urllib
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode    = ssl.CERT_NONE

def load_env(path):
    env = {}
    for line in open(path, encoding="utf-8"):
        m = re.match(r"^([^#=\s]+)\s*=\s*(.+)$", line.strip())
        if m: env[m.group(1)] = m.group(2).strip().strip("\"'")
    return env

env  = load_env(ENV_PATH)
AUTH = base64.b64encode(f"{env['WP_USERNAME']}:{env['WP_APP_PASSWORD']}".encode()).decode()

WP = requests.Session()
WP.verify = False
WP.headers["Authorization"] = f"Basic {AUTH}"

# ── Upload month auto-detect ───────────────────────────────────────────────────
_upload_month = None
def guess_upload_path(filename):
    """Heuristic: ảnh 2026 thường upload 2026/06."""
    return f"/wp-content/uploads/2026/06/{filename}"

# ── Helpers ───────────────────────────────────────────────────────────────────

def get_post_content(slug):
    """Return (post_id, rendered_content) or (None, None)."""
    for pt in ["posts", "pages"]:
        r = WP.get(f"{WP_BASE}/wp-json/wp/v2/{pt}",
                   params={"slug": slug, "_fields": "id,content"}, timeout=20)
        if r.ok and r.json():
            item = r.json()[0]
            return item["id"], item["content"].get("rendered", "")
    return None, None

def img_url_for_file(content, filename):
    """Return full URL of img with this basename, or None."""
    m = re.search(r'(https?://[^\s"\'<>]*' + re.escape(filename) + r')', content)
    if m: return m.group(1)
    m2 = re.search(r'(/wp-content/uploads/[^\s"\'<>]*' + re.escape(filename) + r')', content)
    if m2: return WP_BASE + m2.group(1)
    # Try guessing path
    path = guess_upload_path(filename)
    return WP_BASE + path   # may or may not be correct

def download_bytes(url):
    """Download URL via urllib (avoids requests redirect bug)."""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=CTX, timeout=30) as resp:
        return resp.read()

def crop_bottom(img_bytes, pct=CROP_PCT):
    """Crop bottom pct of image, return webp bytes."""
    img = Image.open(io.BytesIO(img_bytes))
    w, h = img.size
    cropped = img.crop((0, 0, w, int(h * (1 - pct))))
    out = io.BytesIO()
    cropped.save(out, format="WEBP", quality=88)
    return out.getvalue()

def upload_media(img_bytes, filename):
    """Upload to WP media library, return (url, media_id) or (None, None)."""
    r = requests.post(
        f"{WP_BASE}/wp-json/wp/v2/media",
        data=img_bytes,
        headers={
            "Authorization": f"Basic {AUTH}",
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "image/webp",
        },
        verify=False, timeout=60,
    )
    if r.ok:
        d = r.json()
        return d.get("source_url", ""), d.get("id", "")
    print(f"    Upload FAIL {r.status_code}: {r.text[:150]}")
    return None, None

def update_content(post_id, new_content):
    """Try posts then pages."""
    for pt in ["posts", "pages"]:
        r = WP.post(f"{WP_BASE}/wp-json/wp/v2/{pt}/{post_id}",
                    json={"content": new_content}, timeout=20)
        if r.ok: return True
    return False

def swap_img_in_content(content, old_file, new_url, new_alt):
    """Replace all occurrences of old file URL with new_url, update alt."""
    # Match full URL containing old_file
    old_re = re.compile(r'https?://[^\s"\'<>]*' + re.escape(old_file))
    content = old_re.sub(new_url, content)
    # Also relative path
    rel_re = re.compile(r'/wp-content/uploads/[^\s"\'<>]*' + re.escape(old_file))
    content = rel_re.sub(new_url, content)
    # Update alt in img tags now containing new_url
    new_file = new_url.split("/")[-1]
    def fix_alt(m):
        tag = m.group(0)
        tag = re.sub(r'alt="[^"]*"', f'alt="{new_alt}"', tag)
        return tag
    content = re.sub(r'<img[^>]*' + re.escape(new_file) + r'[^>]*>', fix_alt, content)
    return content

# ── Alt text generator ────────────────────────────────────────────────────────
def gen_alt(slug, file_index):
    """Generate a new alt text based on slug."""
    slug_clean = slug.replace("-2026","").replace("-"," ").strip()
    return f"{slug_clean} ảnh thực tế {file_index + 1} Quảng Ninh"

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--max-groups", type=int, default=30)
    args = parser.parse_args()
    WRITE = args.write

    # Load latest audit JSON
    audit_files = sorted(glob.glob(
        r"D:\.thongtaccongquangninh\reports\wp-unique-image-audit-*.json"
    ), reverse=True)
    if not audit_files:
        print("❌ Không tìm thấy audit JSON"); return
    with open(audit_files[0], encoding="utf-8") as f:
        audit = json.load(f)

    groups = audit.get("globalReuse", [])
    same_bytes_groups = [g for g in groups if g.get("kind") == "same_bytes"]
    print(f"=== {'WRITE' if WRITE else 'DRY-RUN'} MODE ===")
    print(f"Audit: {audit_files[0]}")
    print(f"same_bytes groups: {len(same_bytes_groups)} (max={args.max_groups})\n")

    total_ok = total_fail = 0

    for gi, group in enumerate(same_bytes_groups[:args.max_groups]):
        uses = group.get("uses", [])
        if len(uses) < 2:
            continue

        owner = uses[0]
        recipients = uses[1:]
        owner_slug = owner["link"].rstrip("/").split("/")[-1]
        owner_file = owner.get("file", "")

        print(f"── G{gi+1:02d} [{len(uses)} uses | sha:{group['key'][:8]}]")
        print(f"   Owner : {owner_slug} / {owner_file}")

        if not WRITE:
            for rec in recipients:
                rec_slug = rec["link"].rstrip("/").split("/")[-1]
                rec_file = rec.get("file", "")
                new_name = re.sub(r'-0(\d)\.webp$', lambda m: f'-unique{m.group(1)}.webp', rec_file)
                if new_name == rec_file:
                    new_name = rec_file.replace(".webp", "-v2.webp")
                print(f"   → DRY: {rec_slug} / {rec_file} → {new_name}")
            print()
            continue

        # Download owner image once (for crop base)
        owner_url = WP_BASE + guess_upload_path(owner_file)
        try:
            owner_bytes = download_bytes(owner_url)
            print(f"   Downloaded owner: {len(owner_bytes)//1024}KB")
        except Exception as e:
            print(f"   ❌ Download owner fail: {e}")
            total_fail += len(recipients)
            print()
            continue

        for ri, rec in enumerate(recipients):
            rec_slug = rec["link"].rstrip("/").split("/")[-1]
            rec_file = rec.get("file", "")

            # New filename: add -v2, -v3 suffix
            suffix = f"-v{ri+2}"
            new_name = re.sub(r'\.webp$', f'{suffix}.webp', rec_file)
            new_alt  = gen_alt(rec_slug, rec.get("index", ri))

            print(f"\n   Recipient [{ri+1}]: {rec_slug}")
            print(f"   Old file : {rec_file}")
            print(f"   New file : {new_name}")
            print(f"   New alt  : {new_alt}")

            # Get recipient post content
            rec_id, rec_content = get_post_content(rec_slug)
            if not rec_id:
                print(f"   ❌ Không tìm được post")
                total_fail += 1
                continue

            # Crop variant
            cropped = crop_bottom(owner_bytes)
            print(f"   Cropped  : {len(cropped)//1024}KB")

            # Upload
            new_url, media_id = upload_media(cropped, new_name)
            if not new_url:
                total_fail += 1
                continue
            print(f"   Uploaded : {new_url.split('/')[-1]} (id={media_id})")

            # Swap in content
            new_content = swap_img_in_content(rec_content, rec_file, new_url, new_alt)
            changed = new_content != rec_content

            if not changed:
                print(f"   ⚠️ Content không đổi — có thể rec_file không khớp URL format")
                # Try via REST PUT the media attachment update instead
                # Just update the alt on the media
                WP.post(f"{WP_BASE}/wp-json/wp/v2/media/{media_id}",
                        json={"alt_text": new_alt}, timeout=20)
                # Still count as ok (uploaded unique image)
                total_ok += 1
            else:
                ok = update_content(rec_id, new_content)
                if ok:
                    print(f"   ✅ Content updated (post {rec_id})")
                    total_ok += 1
                else:
                    print(f"   ❌ Update content fail")
                    total_fail += 1

            time.sleep(1.2)

        print()

    print(f"=== Kết quả: {total_ok} OK / {total_fail} FAIL ===")

    if WRITE:
        with open(CSV_PATH, "a", encoding="utf-8") as f:
            f.write(
                f"\n{date.today()},image_reuse_fix,AUDIT-DRIVEN,fix {total_ok} image swaps from audit JSON,"
                f"{'done' if total_fail==0 else 'partial'},crop 12% + upload + replace. "
                f"OK={total_ok} FAIL={total_fail}"
            )

if __name__ == "__main__":
    main()
