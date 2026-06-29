import os
import re
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Cấu hình
SCOPES = ['https://www.googleapis.com/auth/blogger']
BLOG_ID = '2990849741025760292'
DRAFT_DIR = r"d:\blogger\draft-posts-2026-05-29"
STATE_FILE = r"d:\blogger\hutbephothalong\upload_state.json"

# Hàm chuyển đổi Markdown cơ bản sang HTML
def markdown_to_html(md_text):
    if md_text.startswith('---'):
        parts = md_text.split('---', 2)
        if len(parts) >= 3:
            md_text = parts[2].strip()

    # Bỏ tiêu đề H1 ở đầu bài viết vì Blogger dùng tiêu đề riêng
    md_text = re.sub(r'^#\s+.*$', '', md_text, flags=re.MULTILINE)

    html = md_text.strip()

    # 1. Chuyển đổi Blockquote
    def replace_blockquote(match):
        lines = match.group(0).strip().split('\n')
        clean_lines = [line.lstrip('>').strip() for line in lines]
        return f'<blockquote style="background-color: #fafafa; border-left: 4px solid #d4d4d8; padding: 15px; margin: 15px 0; font-style: italic;">{"<br>".join(clean_lines)}</blockquote>'
    html = re.sub(r'((?:^>.*$\n?)+)', replace_blockquote, html, flags=re.MULTILINE)

    # 2. Chuyển đổi bảng biểu (Table)
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

    # 3. Chuyển đổi H2, H3
    html = re.sub(r'^##\s+(.*)$', r'<h2 style="color: #1f2937; margin-top: 30px; border-left: 4px solid #ff4d4f; padding-left: 10px;">\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^###\s+(.*)$', r'<h3 style="color: #374151; margin-top: 25px;">\1</h3>', html, flags=re.MULTILINE)

    # 4. Chuyển đổi ảnh
    def format_img(match):
        img_tag = match.group(0)
        formatted = f'<div style="text-align: center; margin: 25px 0;">{img_tag}</div>'
        formatted = formatted.replace('<img ', '<img style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" ')
        return formatted
    html = re.sub(r'<img\s+[^>]*src="[^"]+"[^>]*>', format_img, html)

    html = re.sub(r'^\*\s*(Hình\s+\d+:.*?)\s*\*$', r'<p style="text-align: center; font-style: italic; color: #71717a; font-size: 14px; margin-top: -15px;">\1</p>', html, flags=re.MULTILINE)
    html = re.sub(r'^\*\s*(Sơ\s+đồ\s+\d+:.*?)\s*\*$', r'<p style="text-align: center; font-style: italic; color: #71717a; font-size: 14px; margin-top: -15px;">\1</p>', html, flags=re.MULTILINE)

    # 5. Chuyển đổi định dạng chữ đậm
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)

    # 6. Chuyển đổi liên kết
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" target="_blank" style="color: #1890ff; font-weight: bold; text-decoration: underline;">\1</a>', html)

    # 7. Danh sách
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

    # 8. Xử lý Paragraphs
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

def load_upload_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"uploaded_files": {}}

def save_upload_state(state):
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def upload_all_drafts():
    # Đọc trạng thái đã upload
    state = load_upload_state()
    uploaded_files = state.get("uploaded_files", {})
    
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            print("Loi: File token.json khong hop le hoac thieu quyen xac thuc!")
            return

    try:
        service = build('blogger', 'v3', credentials=creds)
        print("Ket noi Blogger API thanh cong!")
        
        if not os.path.exists(DRAFT_DIR):
            print(f"Loi: Thu muc draft khong ton tai tai {DRAFT_DIR}!")
            return
            
        files = [f for f in os.listdir(DRAFT_DIR) if f.endswith('.md')]
        if not files:
            print("Khong tim thay bat ky file .md nao trong thu muc draft!")
            return
            
        print(f"Tim thay {len(files)} file .md. Kiem tra file chua upload...")
        
        pending_files = [f for f in files if f not in uploaded_files]
        if not pending_files:
            print("Toan bo 8 bai viet da duoc upload len Blogger thanh cong truoc do!")
            return
            
        print(f"Phat hien {len(pending_files)} bai viet chua duoc upload. Bat dau...")
        
        uploaded_count = 0
        for filename in pending_files:
            filepath = os.path.join(DRAFT_DIR, filename)
            print(f"\nDang xu ly file: {filename}")
            
            fm, body = parse_markdown_file(filepath)
            title = fm.get('title', filename.replace('.md', '').replace('-', ' ').title())
            labels = fm.get('labels', [])
            
            html_content = markdown_to_html(body)
            
            post_body = {
                "kind": "blogger#post",
                "title": title,
                "content": html_content,
                "labels": labels
            }
            
            request = service.posts().insert(blogId=BLOG_ID, body=post_body, isDraft=True)
            response = request.execute()
            
            uploaded_count += 1
            
            # Lưu trạng thái upload thành công ngay lập tức để tránh mất mát
            uploaded_files[filename] = {
                "title": title,
                "id": response.get("id"),
                "url": response.get("url")
            }
            state["uploaded_files"] = uploaded_files
            save_upload_state(state)
            
            print(f"-> Day ban nhap (DRAFT) thanh cong cho bai: '{title}'")
            print(f"-> ID: {response.get('id')}")
            
        print(f"\n=== HOAN THANH ===")
        print(f"Da day them {uploaded_count} bai viet moi duoi dang Draft len Blogger!")
        
    except Exception as e:
        print(f"Da xay ra loi trong qua trinh upload: {e}")

if __name__ == '__main__':
    upload_all_drafts()
