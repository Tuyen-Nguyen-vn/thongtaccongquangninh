import os
import os.path
import urllib.request
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Quyen doc/ghi du lieu Blogger
SCOPES = ['https://www.googleapis.com/auth/blogger']

def main():
    print("--- CHUONG TRINH XAC THUC BLOGGER API ---")
    creds = None
    
    # File token.json luu thong tin dang nhap sau khi xac thuc thanh cong
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Token het han, dang tu dong lam moi (Refresh)...")
            creds.refresh(Request())
        else:
            print("Dang doc file client_secrets.json...")
            if not os.path.exists('client_secrets.json'):
                print("Loi: Khong tim thay file client_secrets.json tai thu muc d:\\.Antigravity\\")
                return
            
            flow = InstalledAppFlow.from_client_secrets_file('client_secrets.json', SCOPES)
            print("Trinh duyet se tu dong mo ra. Vui long chon tai khoan Gmail va bam 'Allow' (Cho phep) de cap quyen.")
            creds = flow.run_local_server(port=0)
            
        # Luu lai token cho cac lan chay sau
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
            print("Da luu thong tin xac thuc vao file token.json thanh cong!")

    try:
        # Khoi tao dich vu Blogger
        service = build('blogger', 'v3', credentials=creds)
        
        # Lay danh sach cac blog cua nguoi dung de kiem tra ket noi
        print("\nDang kiem tra ket noi den tai khoan Blogger cua ban...")
        blogs_result = service.blogs().listByUser(userId='self').execute()
        
        blogs = blogs_result.get('items', [])
        if not blogs:
            print("Ket noi thanh cong! Nhung tai khoan Gmail nay cua ban chua co Blog nao duoc tao tren Blogger (Blogspot).")
        else:
            print(" KET NOI THANH CONG 100%!")
            print(f"Tim thay {len(blogs)} Blog trong tai khoan cua ban:")
            for idx, blog in enumerate(blogs):
                print(f"--- Blog {idx+1} ---")
                print(f"Ten Blog: {blog.get('name')}")
                print(f"ID Blog  : {blog.get('id')}")
                print(f"Dia chi  : {blog.get('url')}")
                
    except Exception as e:
        print(f"\nDa xay ra loi khi kiem tra ket noi API: {e}")
        print("Goi y: Hay chac chan anh da them dung Gmail cua minh vao muc 'Test Users' trong OAuth Consent Screen tren Google Cloud.")

if __name__ == '__main__':
    main()
