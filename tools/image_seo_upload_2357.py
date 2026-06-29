import os, requests, base64
from PIL import Image, ImageDraw, ImageFont

# ── Cấu hình ──────────────────────────────────────────────────
WP_BASE = "https://thongtaccongquangninh.com"
WP_USER = "cuben01"
WP_PASS = "NXHb SFQD MxYN jI4q YhyZ JkWS"
POST_ID  = 2357

OUT_DIR = r"D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO"
os.makedirs(OUT_DIR, exist_ok=True)

CREDS   = base64.b64encode(f"{WP_USER}:{WP_PASS}".encode()).decode()
HEADERS = {"Authorization": f"Basic {CREDS}"}

# ── 3 ảnh nguồn + thông tin SEO ───────────────────────────────
ANHCC = r"D:\.thongtaccongquangninh\Ảnh cung cấp"
images = [
    {
        "src": os.path.join(ANHCC, "4. Tho Thong Bon Cau", "760e2309-8232-4604-81e5-cf2dc7f3355b.png"),
        "out": "gia-thong-tac-bon-cau-quang-ninh-may-lo-xo.webp",
        "alt": "Thợ dùng máy lò xo thông tắc bồn cầu tại nhà dân Hạ Long Quảng Ninh",
        "caption": "Thông tắc bồn cầu bằng máy lò xo Tornado D200 - Môi Trường Đô Thị Số 1 Quảng Ninh",
        "description": "Dịch vụ thông tắc bồn cầu tại Quảng Ninh - có mặt 15 phút, không đục phá",
    },
    {
        "src": os.path.join(ANHCC, "4. Tho Thong Bon Cau", "hut-be-phot-ha-long-181.jpg"),
        "out": "bang-gia-thong-tac-bon-cau-quang-ninh-2026.webp",
        "alt": "Bảng giá thông tắc bồn cầu Quảng Ninh 2026 cập nhật mới nhất",
        "caption": "Giá thông tắc bồn cầu Quảng Ninh 2026 - báo giá trước khi làm, không phát sinh",
        "description": "Bảng giá dịch vụ thông tắc bồn cầu tại Hạ Long, Cẩm Phả, Uông Bí - Quảng Ninh 2026",
    },
    {
        "src": os.path.join(ANHCC, "3. Tho Thong Tac Cong", "anh-seo-085.png"),
        "out": "thong-tac-bon-cau-khach-san-bai-chay-ha-long.webp",
        "alt": "Thợ thông tắc bồn cầu khách sạn tại Bãi Cháy Hạ Long không đục phá",
        "caption": "Xử lý tắc bồn cầu khách sạn Bãi Cháy Hạ Long - Môi Trường Đô Thị Số 1",
        "description": "Thông tắc bồn cầu khách sạn nhà hàng tại Bãi Cháy Hạ Long - phục vụ 24/7",
    },
]

# ── Hàm xử lý ảnh ─────────────────────────────────────────────
def process_image(src_path, out_name, max_width=1200):
    img = Image.open(src_path)
    if img.mode in ("RGBA", "P", "LA"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        bg.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    w, h = img.size
    if w > max_width:
        img = img.resize((max_width, int(h * max_width / w)), Image.LANCZOS)
    try:
        draw = ImageDraw.Draw(img)
        iw, ih = img.size
        draw.text((iw - 250, ih - 22), "thongtaccongquangninh.com", fill=(200, 200, 200))
    except Exception:
        pass
    out_path = os.path.join(OUT_DIR, out_name)
    img.save(out_path, "WEBP", quality=82, method=6)
    size_kb = os.path.getsize(out_path) // 1024
    print(f"  Saved: {out_name} ({size_kb} KB)")
    return out_path

# ── Hàm upload ảnh ────────────────────────────────────────────
def upload_image(file_path, alt, caption, description):
    filename = os.path.basename(file_path)
    with open(file_path, "rb") as f:
        data = f.read()
    r = requests.post(
        f"{WP_BASE}/wp-json/wp/v2/media",
        headers={**HEADERS, "Content-Disposition": f'attachment; filename="{filename}"', "Content-Type": "image/webp"},
        data=data, timeout=60,
    )
    if r.status_code not in (200, 201):
        print(f"  FAIL {r.status_code}: {r.text[:300]}")
        return None
    media_id  = r.json().get("id")
    media_url = r.json().get("source_url")
    requests.post(
        f"{WP_BASE}/wp-json/wp/v2/media/{media_id}",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"alt_text": alt, "caption": caption, "description": description},
        timeout=30,
    )
    print(f"  Uploaded: {filename} -> ID {media_id} | {media_url}")
    return {"id": media_id, "url": media_url, "alt": alt, "caption": caption}

# ── Main ───────────────────────────────────────────────────────
uploaded = []

print("=== BUOC 1: Xu ly anh ===")
for img_info in images:
    print(f"\nXu ly: {os.path.basename(img_info['src'])}")
    out_path = process_image(img_info["src"], img_info["out"])
    img_info["out_path"] = out_path

print("\n=== BUOC 2: Upload len WordPress ===")
for img_info in images:
    print(f"\nUpload: {img_info['out']}")
    result = upload_image(img_info["out_path"], img_info["alt"], img_info["caption"], img_info["description"])
    if result:
        uploaded.append({**img_info, **result})

if not uploaded:
    print("\nKhong co anh nao upload thanh cong.")
    exit(1)

print(f"\n=== BUOC 3: Chen anh vao Post {POST_ID} ===")
get_h = {**HEADERS, "Content-Type": "application/json"}
r = requests.get(f"{WP_BASE}/wp-json/wp/v2/posts/{POST_ID}?context=edit", headers=get_h, timeout=30)
content = r.json().get("content", {}).get("raw", "")
print(f"  Content hien tai: {len(content)} chars")

def make_figure(u):
    return (
        f'\n\n<figure class="wp-block-image size-large">'
        f'<img src="{u["url"]}" alt="{u["alt"]}" loading="lazy"/>'
        f'<figcaption>{u["caption"]}</figcaption>'
        f'</figure>\n\n'
    )

# Anh 1: sau </p> dau tien (doan mo bai)
if len(uploaded) >= 1:
    pos = content.find("</p>")
    if pos > 0:
        content = content[:pos+4] + make_figure(uploaded[0]) + content[pos+4:]

# Anh 2: truoc <table> (bang gia)
if len(uploaded) >= 2:
    pos = content.find("<table>")
    if pos > 0:
        content = content[:pos] + make_figure(uploaded[1]) + content[pos:]

# Anh 3: sau heading case study
if len(uploaded) >= 3:
    for marker in ["Th&#7921;c T&#7871;", "Thực Tế", "Thuc Te", "Th&#7921"]:
        pos = content.find(marker)
        if pos > 0:
            h2end = content.find("</h2>", pos)
            if h2end > 0:
                content = content[:h2end+5] + make_figure(uploaded[2]) + content[h2end+5:]
            break

update_r = requests.post(
    f"{WP_BASE}/wp-json/wp/v2/posts/{POST_ID}",
    headers=get_h, json={"content": content}, timeout=30,
)
print(f"  Update status: {update_r.status_code}")
if update_r.status_code in (200, 201):
    print(f"\n[OK] Gan anh thanh cong! Link: {update_r.json().get('link')}")
else:
    print(f"  Loi: {update_r.text[:300]}")

print("\n=== KET QUA ===")
for u in uploaded:
    print(f"  Media ID {u['id']}: {u['out']}")
    print(f"    alt: {u['alt']}")
