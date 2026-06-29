# Upload 3 anh SEO cho Post ID 2379 - bai thong tac bon cau ban dem Quang Ninh
import requests, base64, shutil, os, json

WP_USER = "cuben01"
WP_APP_PASS = "NXHb SFQD MxYN jI4q YhyZ JkWS"
WP_BASE_URL = "https://thongtaccongquangninh.com"
POST_ID = 2379

ANH_DA_XU_LY = r"D:\.thongtaccongquangninh\Ảnh Đã Xử Lý SEO"

# 3 anh chon + ten SEO moi + alt text
IMAGES = [
    {
        "src": os.path.join(ANH_DA_XU_LY, "tho-thong-bon-cau-1.webp"),
        "filename": "thong-tac-bon-cau-ban-dem-ha-long.webp",
        "alt": "Thợ thông tắc bồn cầu ban đêm tại nhà dân Hạ Long Quảng Ninh",
        "title": "Thông tắc bồn cầu ban đêm Hạ Long – Môi Trường Đô Thị Số 1",
        "caption": "Thợ có mặt trong 15 phút, xử lý tắc bồn cầu ban đêm tại Hạ Long",
        "featured": True,
        "insert_after": "<h2>Quy Trình Thông Tắc Bồn Cầu Ban Đêm"
    },
    {
        "src": os.path.join(ANH_DA_XU_LY, "thong-tac-bon-cau-khach-san-bai-chay-ha-long.webp"),
        "filename": "may-lo-xo-thong-bon-cau-ban-dem-quang-ninh.webp",
        "alt": "Máy lò xo Tornado thông tắc bồn cầu ban đêm tại khách sạn Bãi Cháy Quảng Ninh",
        "title": "Máy lò xo thông bồn cầu ban đêm không đục phá – Quảng Ninh",
        "caption": "Máy lò xo Tornado D200 xử lý tắc bồn cầu ban đêm, không đục phá gạch",
        "featured": False,
        "insert_after": "<h2>Tại Sao Chọn Môi Trường Đô Thị Số 1"
    },
    {
        "src": os.path.join(ANH_DA_XU_LY, "bang-gia-thong-tac-bon-cau-quang-ninh-2026.webp"),
        "filename": "bang-gia-thong-tac-bon-cau-ban-dem-quang-ninh-2026.webp",
        "alt": "Bảng giá thông tắc bồn cầu ban đêm Quảng Ninh 2026",
        "title": "Bảng giá thông tắc bồn cầu ban đêm tại Quảng Ninh 2026",
        "caption": "Bảng giá thông tắc bồn cầu ban đêm tại Quảng Ninh 2026 – minh bạch, báo trước khi làm",
        "featured": False,
        "insert_after": "<h2>Bảng Giá Thông Tắc Bồn Cầu Ban Đêm"
    }
]

credentials = base64.b64encode(f"{WP_USER}:{WP_APP_PASS}".encode()).decode("utf-8")
auth_headers = {"Authorization": f"Basic {credentials}"}

def upload_image(img_info):
    src = img_info["src"]
    filename = img_info["filename"]
    if not os.path.exists(src):
        print(f"  SKIP (file khong ton tai): {src}")
        return None
    # Copy sang ten moi neu ten khac
    if os.path.basename(src) != filename:
        dest = os.path.join(os.path.dirname(src), filename)
        shutil.copy2(src, dest)
        upload_path = dest
    else:
        upload_path = src
    # Xac dinh mime type
    ext = filename.lower().rsplit('.', 1)[-1]
    mime = {"webp": "image/webp", "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png"}.get(ext, "image/webp")
    with open(upload_path, "rb") as f:
        file_data = f.read()
    headers = {
        **auth_headers,
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Content-Type": mime,
    }
    r = requests.post(f"{WP_BASE_URL}/wp-json/wp/v2/media", headers=headers, data=file_data, timeout=60)
    if r.status_code == 201:
        media = r.json()
        media_id = media["id"]
        media_url = media["source_url"]
        # Cap nhat alt text, title, caption
        requests.post(
            f"{WP_BASE_URL}/wp-json/wp/v2/media/{media_id}",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={
                "alt_text": img_info["alt"],
                "title": img_info["title"],
                "caption": img_info["caption"]
            },
            timeout=15
        )
        print(f"  OK: {filename} -> ID {media_id} | {media_url}")
        return {"id": media_id, "url": media_url, "info": img_info}
    else:
        print(f"  LOI {r.status_code}: {r.text[:200]}")
        return None

# Upload tung anh
uploaded = []
for img in IMAGES:
    print(f"Uploading: {img['filename']}")
    result = upload_image(img)
    if result:
        uploaded.append(result)

if not uploaded:
    print("Khong upload duoc anh nao.")
    exit(1)

print(f"\nDa upload {len(uploaded)}/{len(IMAGES)} anh.")

# Lay noi dung post hien tai
r = requests.get(f"{WP_BASE_URL}/wp-json/wp/v2/posts/{POST_ID}", headers=auth_headers, timeout=15)
post_data = r.json()
content = post_data.get("content", {}).get("rendered", "")

# Set featured image (anh dau tien)
featured = next((u for u in uploaded if u["info"]["featured"]), uploaded[0])
r2 = requests.post(
    f"{WP_BASE_URL}/wp-json/wp/v2/posts/{POST_ID}",
    headers={**auth_headers, "Content-Type": "application/json"},
    json={"featured_media": featured["id"]},
    timeout=15
)
print(f"Featured image set: {'OK' if r2.status_code == 200 else r2.status_code}")

# Chen anh vao noi dung bai sau cac heading tuong ung
updated_content = content
for u in uploaded:
    insert_marker = u["info"]["insert_after"]
    img_html = (
        f'\n<figure class="wp-block-image">'
        f'<img src="{u["url"]}" alt="{u["info"]["alt"]}" title="{u["info"]["title"]}" loading="lazy"/>'
        f'<figcaption>{u["info"]["caption"]}</figcaption>'
        f'</figure>\n'
    )
    # Tim heading va chen anh ngay sau the <h2> tuong ung
    h2_close = '</h2>'
    idx = updated_content.find(insert_marker)
    if idx != -1:
        close_idx = updated_content.find(h2_close, idx)
        if close_idx != -1:
            insert_pos = close_idx + len(h2_close)
            updated_content = updated_content[:insert_pos] + img_html + updated_content[insert_pos:]
            print(f"  Inserted image after: {insert_marker[:50]}...")

# Cap nhat noi dung bai
r3 = requests.post(
    f"{WP_BASE_URL}/wp-json/wp/v2/posts/{POST_ID}",
    headers={**auth_headers, "Content-Type": "application/json"},
    json={"content": updated_content},
    timeout=20
)
if r3.status_code == 200:
    link = r3.json().get("link", "")
    print(f"\nSUCCESS: Bai da cap nhat anh - {link}")
else:
    print(f"\nLOI cap nhat noi dung: {r3.status_code} - {r3.text[:200]}")
