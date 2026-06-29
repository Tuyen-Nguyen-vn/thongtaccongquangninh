import requests, base64, re, sys

try:
    import markdown
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown", "-q"])
    import markdown

# ── Đọc file markdown ──────────────────────────────────────────
with open(r'D:\.thongtaccongquangninh\docs\bai-seo-gia-thong-tac-bon-cau-quang-ninh-2026.md', 'r', encoding='utf-8') as f:
    raw = f.read()

# ── Tách metadata ──────────────────────────────────────────────
def get_meta(label, text):
    m = re.search(rf'\*\*{label}:\*\*\s*(.+)', text)
    return m.group(1).strip() if m else ''

seo_title = get_meta('SEO Title', raw)
slug      = get_meta('Slug', raw)
focus_kw  = get_meta('Focus Keyword', raw)

meta_m = re.search(r'\*\*Meta Description:\*\*\s*(.+?)(?=\n\n|\*\*Focus)', raw, re.DOTALL)
meta_desc = re.sub(r'\*\*|[\n]', '', meta_m.group(1)).strip() if meta_m else ''

print(f"Title : {seo_title}")
print(f"Slug  : {slug}")
print(f"KW    : {focus_kw}")

# ── Cắt phần bài viết (H1 đến trước Gợi ý ảnh) ────────────────
article_start = raw.find('\n# Giá Thông Tắc')
article_md    = raw[article_start:].strip()
cut_at = article_md.find('\n---\n\n## Gợi Ý Ảnh')
if cut_at > 0:
    article_md = article_md[:cut_at].strip()

# ── Convert sang HTML ──────────────────────────────────────────
md = markdown.Markdown(extensions=['tables', 'nl2br'])
html_content = md.convert(article_md)
html_content = html_content.replace('0963.953.533', '<strong>0963.953.533</strong>')
html_content = html_content.replace('0931.156.756', '<strong>0931.156.756</strong>')

print(f"HTML  : {len(html_content)} chars")

# ── WordPress credentials ──────────────────────────────────────
WP_BASE = "https://thongtaccongquangninh.com"
WP_USER = "cuben01"
WP_PASS = "NXHb SFQD MxYN jI4q YhyZ JkWS"

creds   = base64.b64encode(f"{WP_USER}:{WP_PASS}".encode()).decode("utf-8")
headers = {"Authorization": f"Basic {creds}", "Content-Type": "application/json"}

payload = {
    "title":   seo_title,
    "content": html_content,
    "excerpt": meta_desc,
    "slug":    slug,
    "status":  "publish",
    "meta": {
        "rank_math_title":         seo_title,
        "rank_math_description":   meta_desc,
        "rank_math_focus_keyword": focus_kw
    }
}

print(f"\nGửi POST đến {WP_BASE}/wp-json/wp/v2/posts ...")
response = requests.post(
    f"{WP_BASE}/wp-json/wp/v2/posts",
    headers=headers,
    json=payload,
    timeout=30
)

print(f"HTTP Status: {response.status_code}")
if response.status_code == 201:
    data = response.json()
    print(f"\n[OK] Da dang public!")
    print(f"     Post ID : {data.get('id')}")
    print(f"     Link    : {data.get('link')}")
    print(f"     Slug    : {data.get('slug')}")
elif response.status_code == 200:
    data = response.json()
    print(f"\n[OK] Cap nhat thanh cong!")
    print(f"     Post ID : {data.get('id')}")
    print(f"     Link    : {data.get('link')}")
else:
    print(f"\n[LOI] {response.status_code}:")
    try:
        err = response.json()
        print(f"     Code   : {err.get('code')}")
        print(f"     Message: {err.get('message')}")
    except:
        print(response.text[:500])
