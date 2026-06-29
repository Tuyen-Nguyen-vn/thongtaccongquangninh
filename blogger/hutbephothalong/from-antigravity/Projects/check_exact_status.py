import os
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/blogger']
BLOG_ID = '2990849741025760292'
STATE_FILE = r"d:\blogger\hutbephothalong\upload_state.json"

def check_exact_status():
    if not os.path.exists(STATE_FILE):
        print("Loi: File upload_state.json khong ton tai!")
        return
        
    with open(STATE_FILE, 'r', encoding='utf-8') as f:
        state = json.load(f)
        
    uploaded_files = state.get("uploaded_files", {})
    
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            print("Loi: token.json loi!")
            return

    try:
        service = build('blogger', 'v3', credentials=creds)
        print("Ket noi Blogger API thanh cong!")
        
        print("\n=== KIỂM TRA TRẠNG THÁI CHI TIẾT 8 BÀI VIẾT QUA API ===")
        for filename, info in uploaded_files.items():
            post_id = info.get("id")
            title = info.get("title")
            
            try:
                # Truy vấn chi tiết bài viết theo ID
                post = service.posts().get(blogId=BLOG_ID, postId=post_id).execute()
                print(f"\nFile: {filename}")
                print(f"- Tiêu đề   : {post.get('title')}")
                print(f"- Trạng thái: {post.get('status')}")
                print(f"- Published : {post.get('published')}")
                print(f"- URL Live  : {post.get('url')}")
            except Exception as post_err:
                print(f"\nLoi khi truy van bai viết '{title}' (ID: {post_id}): {post_err}")
                
    except Exception as e:
        print(f"Da xay ra loi: {e}")

if __name__ == '__main__':
    check_exact_status()
