import os
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/blogger']
BLOG_ID = '2990849741025760292'

def check_posts():
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
        
        # Lấy thông tin Blog để kiểm tra URL chính thức
        blog_info = service.blogs().get(blogId=BLOG_ID).execute()
        print(f"\n=== THÔNG TIN BLOG ===")
        print(f"Ten Blog: {blog_info.get('name')}")
        print(f"URL Blog: {blog_info.get('url')}")
        print(f"Blog ID : {blog_info.get('id')}")
        
        # Lấy danh sách bài viết (bao gồm cả Draft và Published)
        request = service.posts().list(blogId=BLOG_ID, view='AUTHOR', maxResults=50)
        response = request.execute()
        
        posts = response.get('items', [])
        print(f"\n=== DANH SÁCH BÀI VIẾT THỰC TẾ TRÊN API (Tong so: {len(posts)}) ===")
        
        if not posts:
            print("Khong tim thay bat ky bai viet nao tren blog nay!")
            return
            
        for idx, post in enumerate(posts, 1):
            print(f"\nBài {idx}:")
            print(f"- Tiêu đề   : {post.get('title')}")
            print(f"- ID        : {post.get('id')}")
            print(f"- Trạng thái: {post.get('status')}")
            print(f"- Link Live : {post.get('url')}")
            print(f"- Published : {post.get('published')}")
            
    except Exception as e:
        print(f"Da xay ra loi khi kiem tra: {e}")

if __name__ == '__main__':
    check_posts()
