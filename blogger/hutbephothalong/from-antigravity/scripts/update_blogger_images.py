import os
import requests
import time
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/blogger']

def upload_to_catbox(file_path):
    if not os.path.exists(file_path):
        return None
    url = "https://catbox.moe/user/api.php"
    try:
        with open(file_path, 'rb') as f:
            files = {'fileToUpload': f}
            data = {'reqtype': 'fileupload'}
            r = requests.post(url, files=files, data=data, timeout=25)
            if r.status_code == 200 and r.text.startswith("https://"):
                return r.text.strip()
    except Exception:
        pass
    return None

def get_blogger_service():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            return None
    return build('blogger', 'v3', credentials=creds)

def main():
    print("--- QUY TRÌNH TỰ ĐỘNG THAY THẾ ẢNH THẬT CHUẨN WEBP CHO BLOGGER ---")
    
    # 1. Upload 4 anh WebP da toi uu len Catbox de lay link online
    img_dir = r"d:\.Antigravity\Projects\images_seo"
    online_urls = []
    
    for i in range(1, 5):
        img_path = os.path.join(img_dir, f"xe-hut-be-phot-ha-long-quang-ninh-{i}.webp")
        if os.path.exists(img_path):
            print(f"Dang upload anh that {i}/4 len may chu anh...")
            url = upload_to_catbox(img_path)
            if url:
                print(f"-> Link online: {url}")
                online_urls.append(url)
            else:
                # Fallback link neu loi
                online_urls.append("https://files.catbox.moe/pyb8rf.webp")
        else:
            online_urls.append("https://files.catbox.moe/pyb8rf.webp")
            
    # 2. Ket noi Blogger API
    service = get_blogger_service()
    if not service:
        print("Loi: Chua ket noi Blogger API!")
        return
        
    blog_id = "2990849741025760292"
    
    try:
        # Lay danh sach tat ca cac bai viet tren Blog
        print("\nDang quet danh sach bai viet da dang de cap nhat anh that...")
        posts_result = service.posts().list(blogId=blog_id).execute()
        posts = posts_result.get('items', [])
        
        updated_count = 0
        for idx, post in enumerate(posts):
            post_id = post.get('id')
            post_title = post.get('title')
            content = post.get('content', '')
            
            # Thay the link anh mau (Unsplash) bang link anh online that tuong ung
            # Su dung xoay vong 4 anh cho cac bai viet
            replacement_url = online_urls[idx % len(online_urls)]
            
            if "images.unsplash.com" in content:
                print(f"\nCap nhat anh cho bai: {post_title}")
                
                # Script thuc hien thay the chuoi chua Unsplash
                # Tìm va thay the src trong thẻ img
                import re
                new_content = re.sub(r'src="https://images\.unsplash\.com/[^"]+"', f'src="{replacement_url}"', content)
                
                # Cap nhat lai bai viet qua API
                body = {
                    "kind": "blogger#post",
                    "title": post_title,
                    "content": new_content
                }
                service.posts().update(blogId=blog_id, postId=post_id, body=body).execute()
                print("-> Da thay anh that WebP thanh cong!")
                updated_count += 1
                time.sleep(1)
                
        print(f"\n🎉 HOÀN TẤT! Da tu dong cap nhat anh that WebP cho {updated_count} bai viet Blogger!")
        
    except Exception as e:
        print(f"Loi khi cap nhat anh: {e}")

if __name__ == '__main__':
    main()
