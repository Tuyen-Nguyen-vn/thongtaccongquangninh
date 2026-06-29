#!/usr/bin/env python3
"""
auto_publish_pipeline.py
========================
Pipeline tự động đăng bài SEO lên WordPress + gắn ảnh + Google Indexing API.

Dùng cho mọi bài SEO trong scheduled task:
    python tools/auto_publish_pipeline.py <đường_dẫn_file_draft.md>

Ví dụ:
    python tools/auto_publish_pipeline.py content-drafts/blog/thong-tac-bon-cau-khan-cap-quang-ninh-2026.md

Các bước tự động:
  1. Đọc metadata SEO từ file draft (title, slug, meta, focus_kw)
  2. Chuyển Markdown → HTML
  3. Publish lên WordPress (status: publish)
  4. Chọn 3 ảnh phù hợp theo loại dịch vụ từ "Ảnh cung cấp"
  5. Optimize → WebP → thêm watermark nhẹ → lưu "Ảnh Đã Xử Lý SEO"
  6. Upload lên WP Media Library
  7. Gắn ảnh vào content bài (vị trí: sau mở bài, trước bảng giá, sau case study)
  8. Set featured image (ảnh đại diện)
  9. Gọi Google Indexing API để request index ngay
 10. Ghi kết quả ra JSON log + in báo cáo

Yêu cầu:
  pip install requests Pillow markdown google-auth google-api-python-client

Config lấy từ D:\\.thongtaccongquangninh\\.env (WP_BASE_URL, WP_USERNAME, WP_APP_PASSWORD)
Google Indexing SA: D:\\.thongtaccongquangninh\\secrets\\indexing_service_account.json
"""

from __future__ import annotations

import base64
import json
import os
import random
import re
import sys
from datetime import datetime
from pathlib import Path

# ── Đường dẫn project ─────────────────────────────────────────────────────────
PROJECT = Path(__file__).resolve().parents[1]
ENV_FILE   = PROJECT / ".env"
SECRETS    = PROJECT / "secrets"
IMG_SRC    = PROJECT / "Ảnh cung cấp"
IMG_OUT    = PROJECT / "Ảnh Đã Xử Lý SEO"
LOG_DIR    = PROJECT / "reports"

IMG_OUT.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)

# ── Đọc .env ──────────────────────────────────────────────────────────────────
def load_env(path: Path) -> dict:
    env = {}
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env

_ENV = load_env(ENV_FILE)
WP_BASE = _ENV.get("WP_BASE_URL", "https://thongtaccongquangninh.com").rstrip("/")
WP_USER = _ENV.get("WP_USERNAME", "cuben01")
WP_PASS = _ENV.get("WP_APP_PASSWORD", "")
SA_FILE = SECRETS / "indexing_service_account.json"

CREDS_B64 = base64.b64encode(f"{WP_USER}:{WP_PASS}".encode()).decode()
WP_HEADERS = {"Authorization": f"Basic {CREDS_B64}"}

# ── Thư viện ảnh theo loại dịch vụ ───────────────────────────────────────────
# Mỗi key là pattern regex match với focus_keyword (lowercase không dấu)
# Value là list thư mục con trong IMG_SRC theo thứ tự ưu tiên
IMAGE_POOLS = {
    r"bon.cau|bong.cau|toilet": [
        "4. Tho Thong Bon Cau",
        "3. Tho Thong Tac Cong",
    ],
    r"chau.rua|chau.rua|lavabo": [
        "5. Tho Thong Chau Rua",
        "3. Tho Thong Tac Cong",
    ],
    r"cong|thoat.nuoc|ong.nuoc": [
        "3. Tho Thong Tac Cong",
        "May Thong Cong",
    ],
    r"be.phot|ham.cau|hut.be|hut.ham": [
        "1. Xe Hut - Ho Gia Dinh",
        "2. Xe Hut - Cong Ty KCN",
    ],
    r"nao.vet|ho.ga": [
        "7. Tho Nao Vet Ho Ga",
        "3. Tho Thong Tac Cong",
    ],
    r"mui.hoi": [
        "6. Tho Xu Ly Mui Hoi",
        "3. Tho Thong Tac Cong",
    ],
}
DEFAULT_POOLS = ["3. Tho Thong Tac Cong", "4. Tho Thong Bon Cau"]

# Danh sách ảnh gần đây đã dùng (tránh trùng) — lưu trong file json
USED_LOG = LOG_DIR / "pipeline_used_images.json"

def load_used_images() -> set:
    if USED_LOG.exists():
        try:
            data = json.loads(USED_LOG.read_text(encoding="utf-8"))
            # chỉ giữ 200 ảnh gần nhất
            return set(data[-200:])
        except Exception:
            pass
    return set()

def save_used_images(used: set, new_ones: list):
    existing = load_used_images()
    combined = list(existing | set(new_ones))[-200:]
    USED_LOG.write_text(json.dumps(combined, ensure_ascii=False, indent=2), encoding="utf-8")

# ── Helpers ───────────────────────────────────────────────────────────────────
def to_ascii_lower(text: str) -> str:
    """Bỏ dấu tiếng Việt, chuyển thường, để match pool."""
    replace_map = str.maketrans(
        "àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ"
        "ÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ",
        "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd"
        "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd",
    )
    return text.lower().translate(replace_map)

def extract_meta(pattern: str, text: str) -> str:
    m = re.search(pattern, text, re.MULTILINE)
    return m.group(1).strip() if m else ""

def pick_images(focus_kw: str, n: int = 3) -> list[Path]:
    """Chọn n ảnh không trùng từ pool phù hợp với từ khóa."""
    kw_ascii = to_ascii_lower(focus_kw)
    folders = DEFAULT_POOLS
    for pattern, pools in IMAGE_POOLS.items():
        if re.search(pattern, kw_ascii):
            folders = pools
            break

    candidates: list[Path] = []
    for folder in folders:
        folder_path = IMG_SRC / folder
        if folder_path.exists():
            for f in folder_path.iterdir():
                if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp") and f.is_file():
                    candidates.append(f)

    if not candidates:
        # Fallback: lấy toàn bộ ảnh
        for f in IMG_SRC.rglob("*"):
            if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp") and f.is_file():
                candidates.append(f)

    used = load_used_images()
    fresh = [c for c in candidates if str(c) not in used]
    if len(fresh) < n:
        fresh = candidates  # nếu hết ảnh mới thì dùng lại

    random.shuffle(fresh)
    return fresh[:n]

def optimize_to_webp(src: Path, out_name: str, max_width: int = 1200) -> Path:
    """Optimize ảnh → WebP, thêm watermark, lưu vào Ảnh Đã Xử Lý SEO."""
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        sys.exit("Cài Pillow: pip install Pillow")

    img = Image.open(src)
    # Chuyển về RGB
    if img.mode in ("RGBA", "P", "LA"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        alpha = img.convert("RGBA").split()[-1]
        bg.paste(img.convert("RGB"), mask=alpha)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")

    # Resize nếu quá to
    w, h = img.size
    if w > max_width:
        img = img.resize((max_width, int(h * max_width / w)), Image.LANCZOS)

    # Watermark nhẹ góc dưới phải
    try:
        draw = ImageDraw.Draw(img)
        iw, ih = img.size
        draw.text((iw - 260, ih - 22), "thongtaccongquangninh.com", fill=(200, 200, 200))
    except Exception:
        pass

    out_path = IMG_OUT / out_name
    img.save(out_path, "WEBP", quality=82, method=6)
    size_kb = out_path.stat().st_size // 1024
    print(f"  ✅ Optimize: {out_name} ({size_kb} KB)")
    return out_path

def upload_media(file_path: Path, alt: str, caption: str) -> dict | None:
    """Upload ảnh lên WP Media Library. Trả về dict {id, url}."""
    import requests
    filename = file_path.name
    with open(file_path, "rb") as f:
        data = f.read()

    resp = requests.post(
        f"{WP_BASE}/wp-json/wp/v2/media",
        headers={
            **WP_HEADERS,
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "image/webp",
        },
        data=data,
        timeout=90,
    )
    if resp.status_code not in (200, 201):
        print(f"  ❌ Upload thất bại {resp.status_code}: {resp.text[:200]}")
        return None

    media = resp.json()
    media_id = media.get("id")
    media_url = media.get("source_url")

    # Cập nhật alt text và caption
    requests.post(
        f"{WP_BASE}/wp-json/wp/v2/media/{media_id}",
        headers={**WP_HEADERS, "Content-Type": "application/json"},
        json={"alt_text": alt, "caption": {"raw": caption}},
        timeout=30,
    )
    print(f"  ✅ Upload: {filename} → ID {media_id} | {media_url}")
    return {"id": media_id, "url": media_url, "alt": alt, "caption": caption}

def insert_images_into_html(html: str, images: list[dict]) -> str:
    """Chèn 3 ảnh vào HTML tại các vị trí chuẩn."""
    def figure(img):
        return (
            f'\n\n<figure class="wp-block-image size-large">'
            f'<img src="{img["url"]}" alt="{img["alt"]}" loading="lazy">'
            f'<figcaption>{img["caption"]}</figcaption>'
            f'</figure>\n\n'
        )

    # Ảnh 1: sau </p> đầu tiên (sau mở bài)
    if len(images) >= 1:
        pos = html.find("</p>")
        if pos >= 0:
            html = html[:pos+4] + figure(images[0]) + html[pos+4:]

    # Ảnh 2: trước <table> đầu tiên (trước bảng giá)
    if len(images) >= 2:
        pos = html.find("<table>")
        if pos >= 0:
            html = html[:pos] + figure(images[1]) + html[pos:]

    # Ảnh 3: sau </h2> cuối cùng của phần "Thực tế" / "Case study" hoặc sau </h2> thứ 5
    if len(images) >= 3:
        # Tìm h2 chứa "Thực" hoặc "Case"
        m = re.search(r'(</h2>)(?=.{0,2000}(Thực|Case|thực|case|xử lý|tình huống))', html, re.DOTALL | re.IGNORECASE)
        if m:
            pos = m.end(1)
            html = html[:pos] + figure(images[2]) + html[pos:]
        else:
            # Fallback: sau </h2> lần 5
            h2s = [m.end() for m in re.finditer(r'</h2>', html)]
            if len(h2s) >= 5:
                pos = h2s[4]
                html = html[:pos] + figure(images[2]) + html[pos:]

    return html

def set_featured_image(post_id: int, media_id: int):
    """Set featured image cho bài viết."""
    import requests
    r = requests.post(
        f"{WP_BASE}/wp-json/wp/v2/posts/{post_id}",
        headers={**WP_HEADERS, "Content-Type": "application/json"},
        json={"featured_media": media_id},
        timeout=30,
    )
    ok = r.status_code in (200, 201)
    print(f"  {'✅' if ok else '❌'} Featured image: media_id={media_id} → post {post_id}")
    return ok

def google_index_url(url: str) -> bool:
    """Gọi Google Indexing API để request index URL mới publish."""
    if not SA_FILE.exists():
        print(f"  ⚠️  Không tìm thấy {SA_FILE} — bỏ qua Indexing API")
        return False
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError:
        print("  ⚠️  Chưa cài google-api-python-client — bỏ qua Indexing API")
        print("       pip install google-api-python-client google-auth")
        return False

    try:
        creds = service_account.Credentials.from_service_account_file(
            str(SA_FILE),
            scopes=["https://www.googleapis.com/auth/indexing"],
        )
        service = build("indexing", "v3", credentials=creds, cache_discovery=False)
        body = {"url": url, "type": "URL_UPDATED"}
        resp = service.urlNotifications().publish(body=body).execute()
        print(f"  ✅ Google Indexing API: {resp.get('urlNotificationMetadata', {}).get('url', url)}")
        return True
    except Exception as e:
        print(f"  ❌ Indexing API lỗi: {e}")
        return False

# ── Markdown → HTML ───────────────────────────────────────────────────────────
def md_to_html(text: str) -> str:
    try:
        import markdown
        return markdown.markdown(text, extensions=["tables", "nl2br"])
    except ImportError:
        pass

    # Fallback thủ công
    lines = text.split("\n")
    out = []
    in_table = False
    in_ul = False
    for line in lines:
        if line.startswith("# "):
            if in_ul: out.append("</ul>"); in_ul = False
            out.append(f"<h1>{line[2:].strip()}</h1>")
        elif line.startswith("## "):
            if in_ul: out.append("</ul>"); in_ul = False
            out.append(f"<h2>{line[3:].strip()}</h2>")
        elif line.startswith("### "):
            if in_ul: out.append("</ul>"); in_ul = False
            out.append(f"<h3>{line[4:].strip()}</h3>")
        elif line.startswith(("- ", "* ")):
            if not in_ul: out.append("<ul>"); in_ul = True
            li = line[2:].strip()
            li = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', li)
            out.append(f"<li>{li}</li>")
        elif line.startswith("|"):
            if in_ul: out.append("</ul>"); in_ul = False
            cells = [c.strip() for c in line.split("|")[1:-1]]
            if all(re.match(r'^[-:]+$', c) for c in cells if c):
                continue
            if not in_table:
                out.append("<table><thead><tr>" + "".join(f"<th>{c}</th>" for c in cells) + "</tr></thead><tbody>")
                in_table = True
            else:
                out.append("<tr>" + "".join(f"<td>{c}</td>" for c in cells) + "</tr>")
        else:
            if in_table:
                out.append("</tbody></table>"); in_table = False
            if in_ul and not line.strip():
                out.append("</ul>"); in_ul = False
            if line.strip():
                l = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', line)
                l = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', l)
                l = re.sub(r'^> ?', '', l)
                out.append(f"<p>{l}</p>")
    if in_ul: out.append("</ul>")
    if in_table: out.append("</tbody></table>")
    return "\n".join(out)

# ── MAIN PIPELINE ─────────────────────────────────────────────────────────────
def run(draft_path_arg: str) -> dict:
    import requests as req

    draft_path = Path(draft_path_arg)
    if not draft_path.is_absolute():
        draft_path = PROJECT / draft_path_arg
    if not draft_path.exists():
        sys.exit(f"❌ Không tìm thấy file: {draft_path}")

    print(f"\n{'='*60}")
    print(f"🚀 AUTO PUBLISH PIPELINE")
    print(f"   Draft: {draft_path.name}")
    print(f"   Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    raw = draft_path.read_text(encoding="utf-8")

    # ── Bước 1: Đọc metadata ────────────────────────────────────────
    print("📋 BƯỚC 1: Đọc metadata SEO")
    seo_title = extract_meta(r"\*\*SEO TITLE:\*\*\s*(.+)", raw)
    slug      = extract_meta(r"\*\*SLUG:\*\*\s*(.+)", raw)
    meta_desc = extract_meta(r"\*\*META DESCRIPTION:\*\*\s*(.+)", raw)
    focus_kw  = extract_meta(r"\*\*FOCUS KEYWORD:\*\*\s*(.+)", raw)

    if not seo_title or not slug:
        sys.exit("❌ Thiếu SEO TITLE hoặc SLUG trong file draft")

    print(f"  Title: {seo_title}")
    print(f"  Slug: {slug}")
    print(f"  Focus KW: {focus_kw}")

    # ── Bước 2: Markdown → HTML ─────────────────────────────────────
    print("\n📝 BƯỚC 2: Chuyển Markdown → HTML")
    m = re.search(r'(# .+?)(?=\n## Gợi Ý Ảnh|\n## Internal Links|\Z)', raw, re.DOTALL)
    article_md = m.group(1) if m else raw
    article_md = re.sub(r'\n---\n', '\n\n', article_md)
    article_md = re.sub(r'^> ?', '', article_md, flags=re.MULTILINE)
    html_content = md_to_html(article_md)
    print(f"  HTML: {len(html_content)} ký tự")

    # ── Bước 3: Publish WP ──────────────────────────────────────────
    print("\n📤 BƯỚC 3: Đăng lên WordPress")
    payload = {
        "title": seo_title,
        "content": html_content,
        "excerpt": meta_desc,
        "slug": slug,
        "status": "publish",
        "meta": {
            "rank_math_title": seo_title,
            "rank_math_description": meta_desc,
            "rank_math_focus_keyword": focus_kw,
        },
    }
    resp = req.post(
        f"{WP_BASE}/wp-json/wp/v2/posts",
        headers={**WP_HEADERS, "Content-Type": "application/json"},
        json=payload,
        timeout=30,
    )
    if resp.status_code not in (200, 201):
        sys.exit(f"❌ WP publish lỗi {resp.status_code}: {resp.text[:300]}")

    post_data = resp.json()
    post_id   = post_data["id"]
    post_link = post_data["link"]
    print(f"  ✅ Đã publish: {post_link} | ID: {post_id}")

    # ── Bước 4–6: Ảnh ───────────────────────────────────────────────
    print(f"\n🖼️  BƯỚC 4–6: Chọn ảnh → Optimize → Upload")
    img_paths = pick_images(focus_kw, n=3)
    print(f"  Đã chọn {len(img_paths)} ảnh từ pool '{focus_kw}'")

    slug_safe = re.sub(r'[^a-z0-9-]', '-', slug)[:40]
    uploaded_images = []
    used_src = []

    for i, src_path in enumerate(img_paths, 1):
        out_name = f"{slug_safe}-{i:02d}.webp"
        # Alt text theo vị trí
        alts = [
            f"{focus_kw.title()} tại Quảng Ninh – thợ kỹ thuật xử lý tại nhà",
            f"Máy thông tắc chuyên dụng – {focus_kw} Hạ Long Cẩm Phả",
            f"Kết quả xử lý {focus_kw} Quảng Ninh – sạch hoàn toàn",
        ]
        captions = [
            f"Thợ Môi Trường Đô Thị Số 1 xử lý {focus_kw} tại Quảng Ninh",
            f"Thiết bị hiện đại cho dịch vụ {focus_kw} tại Hạ Long",
            f"Kết quả thực tế sau khi xử lý {focus_kw} – Quảng Ninh 2026",
        ]
        alt     = alts[i-1]
        caption = captions[i-1]

        try:
            out_path = optimize_to_webp(src_path, out_name)
            result   = upload_media(out_path, alt, caption)
            if result:
                uploaded_images.append(result)
                used_src.append(str(src_path))
        except Exception as e:
            print(f"  ⚠️  Lỗi ảnh {i}: {e}")

    # ── Bước 7: Gắn ảnh vào content ─────────────────────────────────
    if uploaded_images:
        print(f"\n🔗 BƯỚC 7: Gắn ảnh vào content (POST ID {post_id})")
        # Lấy content hiện tại (raw)
        get_resp = req.get(
            f"{WP_BASE}/wp-json/wp/v2/posts/{post_id}?context=edit",
            headers={**WP_HEADERS, "Content-Type": "application/json"},
            timeout=30,
        )
        current_html = get_resp.json().get("content", {}).get("raw", html_content)
        new_html = insert_images_into_html(current_html, uploaded_images)

        req.post(
            f"{WP_BASE}/wp-json/wp/v2/posts/{post_id}",
            headers={**WP_HEADERS, "Content-Type": "application/json"},
            json={"content": new_html},
            timeout=30,
        )
        print(f"  ✅ Đã cập nhật content với {len(uploaded_images)} ảnh")

        # ── Bước 8: Featured image ───────────────────────────────────
        print(f"\n⭐ BƯỚC 8: Set featured image")
        set_featured_image(post_id, uploaded_images[0]["id"])

        # Ghi log ảnh đã dùng
        save_used_images(load_used_images(), used_src)
    else:
        print("  ⚠️  Không upload được ảnh nào — bài vẫn publish nhưng không có ảnh")

    # ── Bước 9: Google Indexing API ──────────────────────────────────
    print(f"\n🔍 BƯỚC 9: Google Indexing API")
    indexed = google_index_url(post_link)

    # ── Bước 10: Ghi kết quả ─────────────────────────────────────────
    result = {
        "timestamp": datetime.now().isoformat(),
        "draft": str(draft_path),
        "post_id": post_id,
        "post_link": post_link,
        "slug": slug,
        "seo_title": seo_title,
        "focus_keyword": focus_kw,
        "images_uploaded": len(uploaded_images),
        "images": [{"id": u["id"], "url": u["url"]} for u in uploaded_images],
        "indexed": indexed,
        "status": "ok",
    }

    log_name = f"pipeline-{slug_safe}-{datetime.now().strftime('%Y%m%d-%H%M')}.json"
    log_path = LOG_DIR / log_name
    log_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n{'='*60}")
    print(f"✅ HOÀN TẤT")
    print(f"   🟢 Bài publish: {post_link}")
    print(f"   📸 Ảnh đã gắn: {len(uploaded_images)}/3")
    print(f"   🔍 Google Index: {'đã gửi' if indexed else 'bỏ qua (xem log)'}")
    print(f"   📄 Log: {log_path.name}")
    print(f"{'='*60}\n")

    return result

# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(
            "Cách dùng:\n"
            "  python tools/auto_publish_pipeline.py <đường_dẫn_file_draft.md>\n\n"
            "Ví dụ:\n"
            "  python tools/auto_publish_pipeline.py "
            "content-drafts/blog/thong-tac-bon-cau-khan-cap-quang-ninh-2026.md"
        )
    run(sys.argv[1])
