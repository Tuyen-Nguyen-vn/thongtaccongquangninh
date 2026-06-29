"""
Script đăng bài SEO: thong-tac-bon-cau-khan-cap-quang-ninh
Chạy: python tools/wp_publish_bon_cau_khan_cap.py
"""
import sys, re, base64, json
try:
    import requests
except ImportError:
    print("Cài requests: pip install requests"); sys.exit(1)

try:
    import markdown as md_lib
    def md2html(text):
        return md_lib.markdown(text, extensions=["tables", "nl2br"])
except ImportError:
    # Fallback: chuyển thủ công các thẻ cơ bản
    def md2html(text):
        lines = text.split("\n")
        out = []
        in_table = False
        in_ul = False
        for line in lines:
            if line.startswith("# "):
                if in_ul: out.append("</ul>"); in_ul=False
                out.append(f"<h1>{line[2:].strip()}</h1>")
            elif line.startswith("## "):
                if in_ul: out.append("</ul>"); in_ul=False
                out.append(f"<h2>{line[3:].strip()}</h2>")
            elif line.startswith("### "):
                if in_ul: out.append("</ul>"); in_ul=False
                out.append(f"<h3>{line[4:].strip()}</h3>")
            elif line.startswith("- ") or line.startswith("* "):
                if not in_ul: out.append("<ul>"); in_ul=True
                li = line[2:].strip()
                li = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', li)
                out.append(f"<li>{li}</li>")
            elif line.startswith("|"):
                if in_ul: out.append("</ul>"); in_ul=False
                cells = [c.strip() for c in line.split("|")[1:-1]]
                if all(re.match(r'^[-:]+$', c) for c in cells if c): continue
                tag = "th" if not in_table else "td"
                in_table = True
                row = "".join(f"<{tag}>{c}</{tag}>" for c in cells)
                if tag == "th":
                    out.append(f"<table><thead><tr>{row}</tr></thead><tbody>")
                else:
                    out.append(f"<tr>{row}</tr>")
            else:
                if in_table and not line.startswith("|"):
                    out.append("</tbody></table>"); in_table=False
                if in_ul and line.strip() == "":
                    out.append("</ul>"); in_ul=False
                if line.strip():
                    l = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', line)
                    l = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', l)
                    out.append(f"<p>{l}</p>")
        if in_ul: out.append("</ul>")
        if in_table: out.append("</tbody></table>")
        return "\n".join(out)

# === Đọc bài viết ===
DRAFT_PATH = r"D:\.thongtaccongquangninh\content-drafts\blog\thong-tac-bon-cau-khan-cap-quang-ninh-2026.md"
with open(DRAFT_PATH, "r", encoding="utf-8") as f:
    raw = f.read()

def extract(pattern, text):
    m = re.search(pattern, text)
    return m.group(1).strip() if m else ""

seo_title = extract(r"\*\*SEO TITLE:\*\*\s*(.+)", raw)
slug      = extract(r"\*\*SLUG:\*\*\s*(.+)", raw)
meta_desc = extract(r"\*\*META DESCRIPTION:\*\*\s*(.+)", raw)
focus_kw  = extract(r"\*\*FOCUS KEYWORD:\*\*\s*(.+)", raw)

print("📋 SEO TITLE:", seo_title)
print("📋 SLUG:", slug)
print("📋 FOCUS KW:", focus_kw)

# Lấy phần bài viết (H1 → trước "## Gợi Ý Ảnh")
m = re.search(r'(# Bồn Cầu.+?)(?=\n## Gợi Ý Ảnh)', raw, re.DOTALL)
if not m:
    print("❌ Không tìm thấy nội dung bài viết"); sys.exit(1)

article_md = m.group(1)
# Chuyển HR sang paragraph break
article_md = re.sub(r'\n---\n', '\n\n', article_md)
# Xóa dòng > blockquote → chuyển thành <strong>
article_md = re.sub(r'^>\s*(.+)$', r'**\1**', article_md, flags=re.MULTILINE)

html_content = md2html(article_md)

# === Đăng WordPress ===
WP_URL  = "https://thongtaccongquangninh.com"
WP_USER = "cuben01"
WP_PASS = "NXHb SFQD MxYN jI4q YhyZ JkWS"

creds   = base64.b64encode(f"{WP_USER}:{WP_PASS}".encode()).decode()
headers = {"Authorization": f"Basic {creds}", "Content-Type": "application/json"}

payload = {
    "title": seo_title,
    "content": html_content,
    "excerpt": meta_desc,
    "slug": slug,
    "status": "publish",
    "meta": {
        "rank_math_title": seo_title,
        "rank_math_description": meta_desc,
        "rank_math_focus_keyword": focus_kw
    }
}

print("\n📤 Đang đăng lên WordPress...")
try:
    resp = requests.post(f"{WP_URL}/wp-json/wp/v2/posts", headers=headers, json=payload, timeout=30)
    print(f"HTTP {resp.status_code}")
    if resp.status_code in (200, 201):
        data = resp.json()
        print(f"🟢 Đã đăng public: {data.get('link')} | Post ID: {data.get('id')}")
        with open(r"D:\.thongtaccongquangninh\tools\wp_publish_bon_cau_result.json", "w", encoding="utf-8") as out:
            json.dump({"status": "ok", "id": data.get("id"), "link": data.get("link"), "slug": slug}, out, ensure_ascii=False, indent=2)
    else:
        print(f"🔴 Lỗi {resp.status_code}: {resp.text[:400]}")
        print("→ Bài viết đã được lưu tại:", DRAFT_PATH)
        print("→ Đăng thủ công qua WP Admin > Posts > Add New > Copy nội dung")
except Exception as e:
    print(f"🔴 Lỗi kết nối: {e}")
    print("→ Bài viết đã lưu tại:", DRAFT_PATH)
    print("→ Đăng thủ công qua WP Admin hoặc chạy lại script khi có mạng")
