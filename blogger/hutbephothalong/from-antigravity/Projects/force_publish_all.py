import os
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/blogger']
BLOG_ID = '2990849741025760292'
STATE_FILE = r"d:\blogger\hutbephothalong\upload_state.json"

def force_publish():
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
            print("Loi: token.json thieu quyen!")
            return

    try:
        service = build('blogger', 'v3', credentials=creds)
        print("Ket noi Blogger API thanh cong!")
        
        print("\n=== TIẾN HÀNH CƯỠNG CHẾ XUẤT BẢN CẢ 8 BÀI VIẾT NGAY LẬP TỨC ===")
        for filename, info in uploaded_files.items():
            post_id = info.get("id")
            title = info.get("title")
            
            print(f"\nDang xu ly bài: '{title}' (ID: {post_id})...")
            try:
                # Gọi thẳng API publish không điều kiện
                request = service.posts().publish(blogId=BLOG_ID, postId=post_id)
                response = request.execute()
                
                info["url"] = response.get("url")
                print(f"-> CUONG CHE XUAT BAN THANH CONG!")
                print(f"-> Link live moi: {response.get('url')}")
            except Exception as publish_err:
                # Nếu bài viết đã xuất bản rồi, Blogger API có thể báo lỗi "Post already published"
                # Ta sẽ bắt lỗi này và in ra thông báo an toàn
                err_msg = str(publish_err)
                if "alreadyPublished" in err_msg or "400" in err_msg:
                    print(f"-> Bai viet da duoc xuat ban Live tu truoc. Giu nguyen trang thai.")
                else:
                    print(f"-> Gap loi khi xuat ban: {publish_err}")
                    
        # Cập nhật lại file trạng thái
        state["uploaded_files"] = uploaded_files
        with open(STATE_FILE, 'w', encoding='utf-8') as f_out:
            json.dump(state, f_out, indent=2, ensure_ascii=False)
            
        print("\n=== HOAN THANH XUAT BAN DIEN RONG ===")
        
    except Exception as e:
        print(f"Da xay ra loi: {e}")

if __name__ == '__main__':
    force_publish()
