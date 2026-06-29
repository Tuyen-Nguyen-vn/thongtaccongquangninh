import os
import json
import urllib.request
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/blogger']
BLOG_ID = '2990849741025760292'
STATE_FILE = r"d:\blogger\hutbephothalong\upload_state.json"

def publish_and_ping():
    if not os.path.exists(STATE_FILE):
        print(f"Loi: File trang thai {STATE_FILE} khong ton tai!")
        return
        
    with open(STATE_FILE, 'r', encoding='utf-8') as f:
        state = json.load(f)
        
    uploaded_files = state.get("uploaded_files", {})
    if not uploaded_files:
        print("Chua co bai viet nao duoc upload de xuat ban!")
        return

    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            print("Loi: Thieu quyen xac thuc token.json!")
            return

    try:
        service = build('blogger', 'v3', credentials=creds)
        print("Ket noi Blogger API thanh cong!")
        
        published_urls = {}
        
        for filename, info in uploaded_files.items():
            post_id = info.get("id")
            title = info.get("title")
            current_url = info.get("url", "")
            
            # KIỂM TRA CHÍNH XÁC: Nếu URL là trang chủ hoặc không kết thúc bằng .html -> Chắc chắn là Draft!
            is_draft = (not current_url or 
                        current_url == "https://hutbephothalong14.blogspot.com/" or 
                        current_url == "https://hutbephothalong14.blogspot.com" or
                        not current_url.endswith(".html"))
            
            if is_draft:
                print(f"\nDang tien hanh Xuat ban (Publish) bai: '{title}'...")
                
                request = service.posts().publish(blogId=BLOG_ID, postId=post_id)
                response = request.execute()
                
                info["url"] = response.get("url")
                print(f"-> Xuat ban thanh cong!")
                print(f"-> Link live: {response.get('url')}")
            else:
                print(f"\nBai viet '{title}' da o trang thai Live tu truoc:")
                print(f"-> Link live: {current_url}")
                
            published_urls[title] = info.get("url")
            
        state["uploaded_files"] = uploaded_files
        with open(STATE_FILE, 'w', encoding='utf-8') as f_out:
            json.dump(state, f_out, indent=2, ensure_ascii=False)

        print("\n=== HOAN THANH XUAT BAN TOAN BO 8 BAI VIET ===")
        print("Danh sach URL cong khai cua ca 8 bai viet:")
        for idx, (title, url) in enumerate(published_urls.items(), 1):
            print(f"{idx}. {title}: {url}")
            
    except Exception as e:
        print(f"Da xay ra loi: {e}")

if __name__ == '__main__':
    publish_and_ping()
