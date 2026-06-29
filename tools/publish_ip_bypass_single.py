#!/usr/bin/env python3
"""
publish_ip_bypass_single.py
===========================
Publish một bài đơn lẻ lên WordPress qua IP bypass (bỏ qua DNS).

Usage:
    python tools/publish_ip_bypass_single.py <file_draft.md>

Ví dụ:
    python tools/publish_ip_bypass_single.py content-drafts/blog/be-phot-day-phai-lam-sao-2026.md
"""

from __future__ import annotations
import base64
import json
import os
import re
import ssl
import socket
import sys
from pathlib import Path
from datetime import datetime

try:
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.connection import create_connection
    from urllib3.poolmanager import PoolManager
    import urllib3
    urllib3.disable_warnings()
except ImportError:
    sys.exit("❌ Thiếu thư viện requests. Chạy: pip install requests --break-system-packages")

try:
    import markdown
except ImportError:
    sys.exit("❌ Thiếu thư viện markdown. Chạy: pip install markdown --break-system-packages")

# ── Cấu hình ──────────────────────────────────────────────────────────────────
PROJECT    = Path(__file__).resolve().parents[1]
ENV_FILE   = PROJECT / ".env"
SERVER_IP  = "103.57.220.210"
WP_HOST    = "thongtaccongquangninh.com"
LOG_DIR    = PROJECT / "reports"
LOG_DIR.mkdir(exist_ok=True)

def load_env(path: Path) -> dict:
    env = {}
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env

_ENV     = load_env(ENV_FILE)
WP_USER  = _ENV.get("WP_USERNAME", "cuben01")
WP_PASS  = _ENV.get("WP_APP_PASSWORD", "")
CREDS_B64 = base64.b64encode(f"{WP_USER}:{WP_PASS}".encode()).decode()

# ── IP Transport Adapter ───────────────────────────────────────────────────────
class IPAdapter(HTTPAdapter):
    """Redirect hostname requests to a fixed IP while keeping SNI/Host header."""
    def __init__(self, ip: str, *args, **kwargs):
        self.ip = ip
        super().__init__(*args, **kwargs)

    def send(self, request, **kwargs):
        # Patch the URL to use IP directly
        from urllib.parse import urlparse, urlunparse
        parsed = urlparse(request.url)
        # Keep original host in headers
        request.headers["Host"] = parsed.hostname
        # Replace hostname with IP
        new_netloc = f"{self.ip}:{parsed.port}" if parsed.port else self.ip
        request.url = urlunparse(parsed._replace(netloc=new_netloc))
        kwargs["verify"] = False  # SNI mismatch bypass
        return super().send(request, **kwargs)

# ── Đọc metadata ──────────────────────────────────────────────────────────────
def extract_meta(pattern: str, text: str) -> str:
    m = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
    return m.group(1).strip() if m else ""

def read_draft(path: Path) -> tuple[str, str, str, str, str]:
    raw = path.read_text(encoding="utf-8")
    seo_title = extract_meta(r"\*\*SEO TITLE:\*\*\s*(.+)", raw)
    slug      = extract_meta(r"\*\*SLUG:\*\*\s*(.+)", raw)
    meta_desc = extract_meta(r"\*\*META DESCRIPTION:\*\*\s*(.+)", raw)
    focus_kw  = extract_meta(r"\*\*FOCUS KEYWORD:\*\*\s*(.+)", raw)
    # Strip appendix trước khi convert
    body = re.split(r"<!--\s*SEO APPENDIX", raw, flags=re.IGNORECASE)[0]
    # Xoá 6 dòng metadata đầu
    lines = body.splitlines()
    content_lines = []
    skip = 0
    for line in lines:
        if skip < 7 and re.match(r"^\*\*[A-Z\s]+:\*\*|^Secondary|^Search Intent|^Published:", line):
            skip += 1
            continue
        content_lines.append(line)
    content_body = "\n".join(content_lines).strip()
    html = markdown.markdown(content_body, extensions=["tables", "fenced_code"])
    return seo_title, slug, meta_desc, focus_kw, html

# ── Publish lên WordPress ──────────────────────────────────────────────────────
def publish(draft_rel: str):
    draft_path = PROJECT / draft_rel
    if not draft_path.exists():
        sys.exit(f"❌ File không tồn tại: {draft_path}")

    print(f"\n{'='*60}")
    print(f"🚀 IP BYPASS PUBLISH")
    print(f"   File: {draft_path.name}")
    print(f"   IP:   {SERVER_IP} → {WP_HOST}")
    print(f"   Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    # Đọc metadata
    print("📋 Đọc metadata...")
    seo_title, slug, meta_desc, focus_kw, html = read_draft(draft_path)
    if not seo_title or not slug:
        sys.exit("❌ Thiếu SEO TITLE hoặc SLUG")
    print(f"  Title: {seo_title}")
    print(f"  Slug:  {slug}")
    print(f"  HTML:  {len(html)} ký tự")

    # Session với IP adapter
    session = requests.Session()
    session.mount("https://", IPAdapter(SERVER_IP))
    headers = {
        "Authorization": f"Basic {CREDS_B64}",
        "Content-Type": "application/json",
        "User-Agent": "SEO-Agent/2026",
    }

    # Tạo/cập nhật bài
    print("\n📤 Đăng lên WordPress...")
    wp_url = f"https://{WP_HOST}/wp-json/wp/v2/posts"

    # Kiểm tra slug đã tồn tại chưa
    check_resp = session.get(
        wp_url,
        params={"slug": slug, "status": "any", "per_page": 1},
        headers=headers,
        timeout=30,
    )
    existing = check_resp.json() if check_resp.ok else []
    post_id  = existing[0]["id"] if existing else None

    payload = {
        "title":   seo_title,
        "slug":    slug,
        "status":  "publish",
        "content": html,
        "excerpt": meta_desc,
        "meta": {
            "rank_math_title":         seo_title,
            "rank_math_description":   meta_desc,
            "rank_math_focus_keyword": focus_kw,
        },
    }

    if post_id:
        print(f"  Bài đã tồn tại (ID={post_id}) — cập nhật...")
        resp = session.post(
            f"{wp_url}/{post_id}",
            json=payload,
            headers=headers,
            timeout=60,
        )
    else:
        resp = session.post(wp_url, json=payload, headers=headers, timeout=60)

    if not resp.ok:
        print(f"  ❌ WordPress lỗi {resp.status_code}: {resp.text[:300]}")
        result = {
            "status": "error",
            "http_code": resp.status_code,
            "error": resp.text[:300],
            "draft": str(draft_path),
        }
    else:
        data    = resp.json()
        post_id = data["id"]
        post_url = data.get("link", f"https://{WP_HOST}/?p={post_id}")
        print(f"  ✅ Thành công! ID={post_id}")
        print(f"  🔗 {post_url}")
        result = {
            "status": "published",
            "wp_id": post_id,
            "url": post_url,
            "slug": slug,
            "title": seo_title,
            "focus_keyword": focus_kw,
            "draft": str(draft_path),
            "published_at": datetime.now().isoformat(),
        }

    # Lưu log
    log_path = LOG_DIR / f"publish-ip-bypass-{slug}-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    log_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n📄 Log: {log_path}")
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Usage: python publish_ip_bypass_single.py <draft-file.md>")
    result = publish(sys.argv[1])
    if result.get("status") == "published":
        print(f"\n✅ HOÀN THÀNH — WP ID={result['wp_id']} | {result['url']}")
    else:
        print(f"\n❌ THẤT BẠI — Bài draft đã lưu tại {result['draft']}")
        sys.exit(1)
