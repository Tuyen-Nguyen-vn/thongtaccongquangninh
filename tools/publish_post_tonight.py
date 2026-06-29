import requests
import base64
import re
import sys

WP_USER = "cuben01"
WP_APP_PASS = "NXHb SFQD MxYN jI4q YhyZ JkWS"
WP_BASE_URL = "https://thongtaccongquangninh.com"

credentials = base64.b64encode(f"{WP_USER}:{WP_APP_PASS}".encode()).decode("utf-8")
headers = {
    "Authorization": f"Basic {credentials}",
    "Content-Type": "application/json"
}

def md_to_html(md):
    md = re.sub(r'^# (.+)$', r'<h1>\1</h1>', md, flags=re.MULTILINE)
    md = re.sub(r'^## (.+)$', r'<h2>\1</h2>', md, flags=re.MULTILINE)
    md = re.sub(r'^### (.+)$', r'<h3>\1</h3>', md, flags=re.MULTILINE)
    md = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', md)
    md = re.sub(r'^> (.+)$', r'<blockquote><p>\1</p></blockquote>', md, flags=re.MULTILINE)
    md = re.sub(r'^---$', r'<hr>', md, flags=re.MULTILINE)
    md = re.sub(r'^- (.+)$', r'<li>\1</li>', md, flags=re.MULTILINE)
    md = re.sub(r'(<li>.*?</li>\n?)+', lambda m: '<ul>\n' + m.group(0) + '</ul>\n', md, flags=re.DOTALL)
    lines = md.split('\n')
    result = []
    in_table = False
    table_rows = []
    for line in lines:
        if '|' in line and line.strip().startswith('|'):
            if not in_table:
                in_table = True
                table_rows = []
            if re.match(r'^\|[\s\-:|]+\|', line):
                continue
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            table_rows.append(cells)
        else:
            if in_table:
                html = '<table style="width:100%;border-collapse:collapse;">\n'
                for i, row in enumerate(table_rows):
                    html += '<tr>'
                    tag = 'th' if i == 0 else 'td'
                    st = ' style="border:1px solid #ddd;padding:8px;"'
                    for cell in row:
                        html += f'<{tag}{st}>{cell}</{tag}>'
                    html += '</tr>\n'
                html += '</table>'
                result.append(html)
                in_table = False
                table_rows = []
            result.append(line)
    if in_table:
        html = '<table style="width:100%;border-collapse:collapse;">\n'
        for i, row in enumerate(table_rows):
            html += '<tr>'
            tag = 'th' if i == 0 else 'td'
            st = ' style="border:1px solid #ddd;padding:8px;"'
            for cell in row:
                html += f'<{tag}{st}>{cell}</{tag}>'
            html += '</tr>\n'
        html += '</table>'
        result.append(html)
    md = '\n'.join(result)
    paragraphs = []
    current_block = []
    for line in md.split('\n'):
        stripped = line.strip()
        if stripped == '' or stripped.startswith('<'):
            if current_block:
                para_text = ' '.join(current_block).strip()
                if para_text and not para_text.startswith('<'):
                    paragraphs.append(f'<p>{para_text}</p>')
                else:
                    paragraphs.append(para_text)
                current_block = []
            if stripped:
                paragraphs.append(stripped)
        else:
            current_block.append(stripped)
    if current_block:
        para_text = ' '.join(current_block).strip()
        if para_text and not para_text.startswith('<'):
            paragraphs.append(f'<p>{para_text}</p>')
    return '\n'.join(paragraphs)

md_file = r"D:\.thongtaccongquangninh\content-drafts\thong-tac-bon-cau-ban-dem-quang-ninh.md"
with open(md_file, 'r', encoding='utf-8') as f:
    full_md = f.read()

article_start = full_md.find('# Thông Tắc Bồn Cầu Ban Đêm')
article_end = full_md.find('\n## Gợi Ý Ảnh')
article_md = full_md[article_start:article_end].strip()
article_html = md_to_html(article_md)

payload = {
    "title": "Thông Tắc Bồn Cầu Ban Đêm Quảng Ninh – Gọi Là Có Ngay 2026",
    "content": article_html,
    "excerpt": "Thông tắc bồn cầu ban đêm Quảng Ninh – gọi 0963.953.533, thợ có mặt trong 15 phút. Xử lý nhanh, không đục phá, phục vụ 24/7 tại Hạ Long, Cẩm Phả, Uông Bí.",
    "slug": "thong-tac-bon-cau-ban-dem-quang-ninh",
    "status": "publish",
    "meta": {
        "rank_math_title": "Thông Tắc Bồn Cầu Ban Đêm Quảng Ninh – Gọi Là Có Ngay 2026",
        "rank_math_description": "Thông tắc bồn cầu ban đêm Quảng Ninh – gọi 0963.953.533, thợ có mặt trong 15 phút. Xử lý nhanh, không đục phá, phục vụ 24/7 tại Hạ Long, Cẩm Phả, Uông Bí.",
        "rank_math_focus_keyword": "thông tắc bồn cầu ban đêm Quảng Ninh"
    }
}

print("Posting to WordPress...")
try:
    response = requests.post(
        f"{WP_BASE_URL}/wp-json/wp/v2/posts",
        headers=headers,
        json=payload,
        timeout=30
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"SUCCESS|{data.get('link')}|{data.get('id')}")
    else:
        print(f"ERROR|{response.status_code}|{response.text[:300]}")
except Exception as e:
    print(f"EXCEPTION|{str(e)[:300]}")
