#!/usr/bin/env python3
import base64
import json
import re
import time
import urllib.request
import urllib.parse
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
DEFAULT_ENV_PATH = Path("C:/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env")
BASE_URL = "https://thongtaccongquangninh.com"

def parse_env(path: Path) -> dict:
    env = {}
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            match = re.match(r"^\s*([^#=\s]+)\s*=\s*(.*)\s*$", line)
            if match:
                env[match.group(1)] = match.group(2).strip().strip("\"'")
    return env

def request_json(url: str, headers=None, method="GET", body: bytes = None):
    req = urllib.request.Request(url, data=body, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read()
            return json.loads(raw.decode("utf-8-sig") or "{}")
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {error.code} {url}: {raw[:500]}") from error

def wp_request(base_url: str, auth: str, path: str, method="GET", body: bytes = None):
    return request_json(
        f"{base_url}/wp-json{path}",
        method=method,
        body=body,
        headers={"Authorization": auth, "User-Agent": "Codex SEO Content Fixer"}
    )

def fetch_content(base_url: str, auth: str) -> list:
    rows = []
    for type_name in ("pages", "posts"):
        page = 1
        while True:
            items = wp_request(base_url, auth, f"/wp/v2/{type_name}?status=publish,draft&context=edit&per_page=100&page={page}")
            if not items: break
            for item in items:
                raw = item.get("content", {}).get("raw") or item.get("content", {}).get("rendered") or ""
                rows.append({
                    "type": type_name,
                    "id": item.get("id"),
                    "title": item.get("title", {}).get("raw") or item.get("title", {}).get("rendered") or "",
                    "link": item.get("link"),
                    "slug": item.get("slug"),
                    "content": raw,
                    "status": item.get("status")
                })
            if len(items) < 100: break
            page += 1
    return rows

def fix_seo_leak_content(html: str) -> tuple[str, list]:
    changes = []
    new_html = html

    # 1. Fix "Case study E-E-A-T" heading
    if re.search(r"(?i)<h[2-4][^>]*>.*?(?:Case study E-E-A-T|Case Study EEAT).*?</h[2-4]>", new_html):
        def repl_case_study(m):
            inner = re.sub(r"(?i)Case study E-E-A-T:?\s*", "", m.group(2))
            return f"{m.group(1)}Kinh nghiệm thực tế: {inner.strip()}{m.group(3)}"
        new_html = re.sub(r"(?i)(<h[2-4][^>]*>)(.*?Case study E-E-A-T.*?)(</h[2-4]>)", repl_case_study, new_html)
        changes.append("Fixed 'Case study E-E-A-T' heading")

    # 2. Fix "NAP liên hệ" heading
    if re.search(r"(?i)<h[2-4][^>]*>.*?NAP liên hệ.*?</h[2-4]>", new_html):
        new_html = re.sub(r"(?i)(<h[2-4][^>]*>).*?NAP liên hệ.*?(</h[2-4]>)", r"\1Thông tin liên hệ & Đặt lịch\2", new_html)
        changes.append("Fixed 'NAP liên hệ' heading")

    # 3. Remove "Internal link liên quan" heading but keep the links paragraph
    if re.search(r"(?i)<h[2-4][^>]*>.*?Internal link liên quan.*?</h[2-4]>", new_html):
        new_html = re.sub(r"(?i)<h[2-4][^>]*>.*?Internal link liên quan.*?</h[2-4]>", "", new_html)
        changes.append("Removed 'Internal link liên quan' heading")

    # 4. Remove meta-text paragraphs
    bad_phrases = [
        r"Ca này cho thấy cùng một dịch vụ nhưng địa bàn khác nhau cần phương án khác nhau",
        r"Nội dung, FAQ, case study và schema của trang .*? phải bám đúng .*? không dùng chung",
        r"Các link nội bộ này giữ khách trong cụm dịch vụ liên quan",
        r"tránh để trang địa phương hoạt động như trang cô lập",
        r"Khi thêm link mới, phải kiểm tra HTTP 200",
        r"không xóa link hợp lệ đang có",
        r"Các link cần giữ trong cụm địa phương gồm",
    ]
    for phrase in bad_phrases:
        if re.search(phrase, new_html, flags=re.IGNORECASE):
            # Try to remove the entire paragraph containing the phrase
            pattern = re.compile(r"<p[^>]*>.*?" + phrase + r".*?</p>", flags=re.IGNORECASE | re.DOTALL)
            if pattern.search(new_html):
                new_html = pattern.sub("", new_html)
                changes.append(f"Removed paragraph containing meta-text: {phrase[:30]}...")

    # 5. Fix Image Alt/Caption if it says "thợ kéo ống" but it's a truck image
    # Note: We can't see the image content, but if we see 'xe-hut-be-phot' in src and 'thợ kéo ống' in alt/caption, it's wrong.
    # We will replace 'thợ kéo ống...' with 'xe bồn hút bể phốt chuyên dụng' for truck images.
    truck_img_pattern = re.compile(r"(<img[^>]+src=[\"'][^\"']*xe-(?:hut-be-phot|bon)[^\"']*[\"'][^>]*>)", flags=re.IGNORECASE)
    def repl_truck_img(m):
        img_tag = m.group(1)
        if "thợ" in img_tag.lower() and "kéo ống" in img_tag.lower():
            img_tag = re.sub(r"(alt=[\"']).*?thợ.*?kéo ống.*?([\"'])", r"\1Xe bồn hút bể phốt chuyên dụng\2", img_tag, flags=re.IGNORECASE)
            return img_tag
        return img_tag
    new_html_after_truck = truck_img_pattern.sub(repl_truck_img, new_html)
    if new_html_after_truck != new_html:
        new_html = new_html_after_truck
        changes.append("Fixed mismatched truck image alt text")
        
    return new_html, changes

def main():
    env = parse_env(Path(DEFAULT_ENV_PATH))
    base_url = (env.get("WP_BASE_URL") or BASE_URL).rstrip("/")
    auth = "Basic " + base64.b64encode(f"{env['WP_USERNAME']}:{env['WP_APP_PASSWORD']}".encode()).decode()
    
    print("Fetching all posts and pages...")
    rows = fetch_content(base_url, auth)
    print(f"Found {len(rows)} items.")
    
    stamp = time.strftime("%Y-%m-%dT%H-%M-%S")
    backup_dir = PROJECT / "seo-revisions" / f"seo-content-fix-{stamp}"
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    fixed_count = 0
    
    for row in rows:
        content = row["content"]
        new_content, changes = fix_seo_leak_content(content)
        
        if changes:
            print(f"[{row['type'].upper()} {row['id']}] {row['title']}")
            for c in set(changes):
                print(f"  - {c}")
            
            # Backup original
            backup_path = backup_dir / f"{row['type']}-{row['id']}-backup.json"
            backup_path.write_text(json.dumps(row, ensure_ascii=False, indent=2), encoding="utf-8")
            
            # Update via REST
            try:
                wp_request(
                    base_url,
                    auth,
                    f"/wp/v2/{row['type']}/{row['id']}",
                    method="POST",
                    body=json.dumps({"content": new_content}, ensure_ascii=False).encode("utf-8")
                )
                fixed_count += 1
            except Exception as e:
                print(f"  -> Error updating: {e}")

    print(f"\nDone! Fixed {fixed_count} items across the website.")

if __name__ == "__main__":
    main()
