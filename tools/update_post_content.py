#!/usr/bin/env python3
"""
update_post_content.py
Cập nhật nội dung (content) một WordPress post đã tồn tại theo Post ID.
Dùng Markdown → HTML giống auto_publish_pipeline.py.

Usage:
    python tools/update_post_content.py <post_id> <draft_file.md>

Ví dụ:
    python tools/update_post_content.py 2687 content-drafts/blog/hut-be-phot-nha-hang-quang-ninh-2026.md
"""

import base64, json, re, sys
from pathlib import Path
import requests, markdown

PROJECT  = Path(__file__).resolve().parents[1]
ENV_FILE = PROJECT / ".env"

def load_env(path):
    env = {}
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"')
    return env

def md_to_html(text):
    return markdown.markdown(text, extensions=["tables", "fenced_code"])

def parse_meta(text):
    meta = {}
    for key, pat in [
        ("title",   r"\*\*SEO TITLE:\*\*\s*(.+)"),
        ("slug",    r"\*\*SLUG:\*\*\s*(.+)"),
        ("meta_desc", r"\*\*META DESCRIPTION:\*\*\s*(.+)"),
        ("focus_kw",  r"\*\*FOCUS KEYWORD:\*\*\s*(.+)"),
    ]:
        m = re.search(pat, text)
        meta[key] = m.group(1).strip() if m else ""
    return meta

def get_body(text):
    """Lấy phần body bài viết (bỏ block metadata đầu file)."""
    # Bỏ mọi thứ trước dòng "# H1" (heading level 1 bài viết)
    m = re.search(r'^(# [^\n]+\n)', text, re.MULTILINE)
    return text[m.start():] if m else text

def main():
    if len(sys.argv) < 3:
        print("Usage: python tools/update_post_content.py <post_id> <draft_file.md>")
        sys.exit(1)

    post_id   = int(sys.argv[1])
    draft_path = PROJECT / sys.argv[2]

    if not draft_path.exists():
        print(f"❌ File không tồn tại: {draft_path}")
        sys.exit(1)

    env = load_env(ENV_FILE)
    base_url = env.get("WP_BASE_URL", "").rstrip("/")
    username = env.get("WP_USERNAME", "")
    password = env.get("WP_APP_PASSWORD", "")

    if not all([base_url, username, password]):
        print("❌ Thiếu WP_BASE_URL / WP_USERNAME / WP_APP_PASSWORD trong .env")
        sys.exit(1)

    raw = draft_path.read_text(encoding="utf-8")
    meta = parse_meta(raw)
    body_md = get_body(raw)
    body_html = md_to_html(body_md)

    token = base64.b64encode(f"{username}:{password}".encode()).decode()
    headers = {
        "Authorization": f"Basic {token}",
        "Content-Type":  "application/json",
    }

    payload = {
        "content": body_html,
        "title":   meta.get("title", ""),
        "meta": {
            "rank_math_description": meta.get("meta_desc", ""),
            "rank_math_focus_keyword": meta.get("focus_kw", ""),
        },
        "status": "publish",
    }

    url = f"{base_url}/wp-json/wp/v2/posts/{post_id}"
    print(f"📤 Đang update post {post_id} → {url}")
    r = requests.post(url, headers=headers, json=payload, timeout=30)

    if r.status_code in (200, 201):
        data = r.json()
        print(f"✅ Update thành công!")
        print(f"   URL : {data.get('link', '')}")
        print(f"   ID  : {data.get('id', post_id)}")
        print(f"   Date: {data.get('modified', '')}")
    else:
        print(f"❌ Lỗi {r.status_code}: {r.text[:300]}")
        sys.exit(1)

if __name__ == "__main__":
    main()
