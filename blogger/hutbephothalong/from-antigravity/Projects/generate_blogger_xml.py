import os
import re
import xml.etree.ElementTree as ET

DRAFT_DIR = r"d:\blogger\draft-posts-2026-05-29"
OUTPUT_XML = r"d:\blogger\Blogger_SEO_Posts_Import_New.xml"

# Hàm chuyển đổi Markdown sang HTML chất lượng cao (giống trong script upload)
def markdown_to_html(md_text):
    if md_text.startswith('---'):
        parts = md_text.split('---', 2)
        if len(parts) >= 3:
            md_text = parts[2].strip()

    md_text = re.sub(r'^#\s+.*$', '', md_text, flags=re.MULTILINE)
    html = md_text.strip()

    # 1. Blockquote
    def replace_blockquote(match):
        lines = match.group(0).strip().split('\n')
        clean_lines = [line.lstrip('>').strip() for line in lines]
        return f'<blockquote style="background-color: #fafafa; border-left: 4px solid #d4d4d8; padding: 15px; margin: 15px 0; font-style: italic;">{"<br>".join(clean_lines)}</blockquote>'
    html = re.sub(r'((?:^>.*$\n?)+)', replace_blockquote, html, flags=re.MULTILINE)

    # 2. Table
    def replace_table(match):
        table_text = match.group(0).strip()
        lines = table_text.split('\n')
        if len(lines) < 3:
            return match.group(0)
        
        headers = [c.strip() for c in lines[0].split('|')[1:-1]]
        
        rows_html = []
        for line in lines[2:]:
            if '|' in line:
                cols = [c.strip() for c in line.split('|')[1:-1]]
                row_cols = "".join([f'<td style="border: 1px solid #e4e4e7; padding: 10px;">{col}</td>' for col in cols])
                rows_html.append(f'<tr>{row_cols}</tr>')
        
        headers_html = "".join([f'<th style="border: 1px solid #e4e4e7; padding: 10px; background-color: #f4f4f5; text-align: left;">{h}</th>' for h in headers])
        
        return f'<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15px;"><thead><tr>{headers_html}</tr></thead><tbody>{"".join(rows_html)}</tbody></table>'
    
    html = re.sub(r'((?:^\|.*\|$\n?)+)', replace_table, html, flags=re.MULTILINE)

    # 3. H2, H3
    html = re.sub(r'^##\s+(.*)$', r'<h2 style="color: #1f2937; margin-top: 30px; border-left: 4px solid #ff4d4f; padding-left: 10px;">\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^###\s+(.*)$', r'<h3 style="color: #374151; margin-top: 25px;">\1</h3>', html, flags=re.MULTILINE)

    # 4. Images
    def format_img(match):
        img_tag = match.group(0)
        formatted = f'<div style="text-align: center; margin: 25px 0;">{img_tag}</div>'
        formatted = formatted.replace('<img ', '<img style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" ')
        return formatted
    html = re.sub(r'<img\s+[^>]*src="[^"]+"[^>]*>', format_img, html)

    html = re.sub(r'^\*\s*(Hình\s+\d+:.*?)\s*\*$', r'<p style="text-align: center; font-style: italic; color: #71717a; font-size: 14px; margin-top: -15px;">\1</p>', html, flags=re.MULTILINE)
    html = re.sub(r'^\*\s*(Sơ\s+đồ\s+\d+:.*?)\s*\*$', r'<p style="text-align: center; font-style: italic; color: #71717a; font-size: 14px; margin-top: -15px;">\1</p>', html, flags=re.MULTILINE)

    # 5. Bold
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)

    # 6. Links
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" target="_blank" style="color: #1890ff; font-weight: bold; text-decoration: underline;">\1</a>', html)

    # 7. Lists
    def replace_ul(match):
        items = match.group(0).strip().split('\n')
        li_html = "".join([f'<li style="margin-bottom: 8px;">{item.strip()[2:]}</li>' for item in items if item.strip()])
        return f'<ul style="margin: 15px 0; padding-left: 20px; line-height: 1.6;">{li_html}</ul>'
    html = re.sub(r'((?:^\s*[-*]\s+.*$\n?)+)', replace_ul, html, flags=re.MULTILINE)

    def replace_ol(match):
        items = match.group(0).strip().split('\n')
        li_html = []
        for item in items:
            if item.strip():
                content = re.sub(r'^\d+\.\s+', '', item.strip())
                li_html.append(f'<li style="margin-bottom: 8px;">{content}</li>')
        return f'<ol style="margin: 15px 0; padding-left: 20px; line-height: 1.6;">{"".join(li_html)}</ol>'
    html = re.sub(r'((?:^\s*\d+\.\s+.*$\n?)+)', replace_ol, html, flags=re.MULTILINE)

    # 8. Paragraphs
    paragraphs = html.split('\n\n')
    formatted_paras = []
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if para.startswith('<h2') or para.startswith('<h3') or para.startswith('<table') or para.startswith('<ul') or para.startswith('<ol') or para.startswith('<blockquote') or para.startswith('<div'):
            formatted_paras.append(para)
        else:
            para_with_br = para.replace('\n', '<br>')
            formatted_paras.append(f'<p style="line-height: 1.8; margin-bottom: 15px; color: #374151; font-size: 16px; text-align: justify;">{para_with_br}</p>')
            
    html = "\n\n".join(formatted_paras)

    # 9. Hotline CTAs
    middle_cta = """
    <div style="background-color: #f6ffed; border-left: 4px solid #52c41a; padding: 20px; margin: 35px 0; text-align: center; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <p style="font-size: 18px; font-weight: bold; margin: 0; color: #1f2937; letter-spacing: 0.5px;">CẦN THỢ THÔNG TẮC KHẨN CẤP PHỤC VỤ 24/7?</p>
        <p style="margin: 8px 0; font-size: 15px; color: #4b5563;">Môi Trường Đô Thị Số 1 Quảng Ninh - Có mặt ngay sau 15-30 phút:</p>
        <p style="font-size: 26px; font-weight: bold; margin: 0;"><a href="tel:0963953533" style="color: #ff4d4f; text-decoration: none;">0963.953.533</a> / <a href="tel:0931156756" style="color: #ff4d4f; text-decoration: none;">0931.156.756</a></p>
    </div>
    """
    html = html.replace('Môi Trường Đô Thị Số 1 Quảng Ninh qua đường dẫn sau: [https://thongtaccongquangninh.com/](https://thongtaccongquangninh.com/).', f'Môi Trường Đô Thị Số 1 Quảng Ninh qua website chính: <a href="https://thongtaccongquangninh.com" target="_blank" style="color: #1890ff; font-weight: bold; text-decoration: underline;">thongtaccongquangninh.com</a>.{middle_cta}')
    
    hp_cta = """
    <div style="background-color: #f0f5ff; border-left: 4px solid #2f54eb; padding: 20px; margin: 35px 0; text-align: center; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <p style="font-size: 18px; font-weight: bold; margin: 0; color: #1f2937; letter-spacing: 0.5px;">DỊCH VỤ THÔNG HÚT BỂ PHỐT HẢI PHÒNG 24H</p>
        <p style="margin: 8px 0; font-size: 15px; color: #4b5563;">Môi Trường Đông Bắc - Khảo sát miễn phí, xử lý triệt để 100%:</p>
        <p style="font-size: 26px; font-weight: bold; margin: 0;"><a href="tel:0981306307" style="color: #2f54eb; text-decoration: none;">0981.306.307</a></p>
    </div>
    """
    html = html.replace('Hotline: 0981.306.307.', f'Hotline: <a href="tel:0981306307" style="color: #ff4d4f; font-weight: bold;">0981.306.307</a>.{hp_cta}')

    return html

def parse_markdown_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    frontmatter = {}
    body_content = content
    
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            fm_text = parts[1].strip()
            body_content = parts[2].strip()
            
            for line in fm_text.split('\n'):
                if ':' in line:
                    key, val = line.split(':', 1)
                    key = key.strip()
                    val = val.strip()
                    if val.startswith('[') and val.endswith(']'):
                        val = [item.strip().strip("'").strip('"') for item in val[1:-1].split(',')]
                    else:
                        val = val.strip("'").strip('"')
                    frontmatter[key] = val
                    
    return frontmatter, body_content

def generate_xml():
    if not os.path.exists(DRAFT_DIR):
        print(f"Loi: Thu muc {DRAFT_DIR} khong ton tai!")
        return

    files = [f for f in os.listdir(DRAFT_DIR) if f.endswith('.md')]
    if not files:
        print("Khong tim thay file .md nao!")
        return

    print(f"Tim thay {len(files)} file de ghi vao XML...")

    xml_header = """<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns='http://www.w3.org/2005/Atom' 
      xmlns:openSearch='http://a9.com/-/spec/opensearchrss/1.0/' 
      xmlns:gd='http://schemas.google.com/g/2005' 
      xmlns:thr='http://purl.org/syndication/thread/1.0' 
      xmlns:georss='http://www.georss.org/georss'>
  <id>tag:blogger.com,1999:blog-2990849741025760292.archive</id>
  <updated>2026-05-29T13:00:00.000Z</updated>
  <title type='text'>Hút Bể Phốt Hạ Long</title>
"""

    entries = []
    
    for filename in files:
        filepath = os.path.join(DRAFT_DIR, filename)
        fm, body = parse_markdown_file(filepath)
        
        title = fm.get('title', filename.replace('.md', '').replace('-', ' ').title())
        labels = fm.get('labels', [])
        
        html_content = markdown_to_html(body)
        
        # Tạo danh mục nhãn (Labels) cho Blogger
        categories_xml = "\n".join([f"    <category scheme='http://www.blogger.com/atom/ns#' term='{label}'/>" for label in labels])
        
        # Cấu hình để bài viết import vào ở trạng thái Draft (Bản nháp)
        draft_xml = """    <app:control xmlns:app='http://www.w3.org/2007/app'>
      <app:draft>yes</app:draft>
    </app:control>"""
        
        entry = f"""  <entry>
    <category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/blogger/2008/kind#post'/>
{categories_xml}
    <title type='text'>{title}</title>
    <content type='html'>
      <![CDATA[
{html_content}
      ]]>
    </content>
    <published>2026-05-29T12:00:00Z</published>
{draft_xml}
  </entry>"""
        entries.append(entry)

    xml_footer = "\n</feed>"
    
    full_xml = xml_header + "\n\n".join(entries) + xml_footer
    
    with open(OUTPUT_XML, 'w', encoding='utf-8') as f:
        f.write(full_xml)
        
    print(f"\nDa tao file XML thanh cong tai: {OUTPUT_XML}!")
    print(f"File XML chua day du ca 8 bai viet duoi dang DRAFT (Ban nhap).")

if __name__ == '__main__':
    generate_xml()
