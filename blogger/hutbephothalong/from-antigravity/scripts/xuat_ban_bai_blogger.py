import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/blogger']

def xuat_ban_bai_viet(blog_id, post_id):
    """
    Chuyen trang thai bai viet tu Draft (nhap) sang Published (cong khai).
    """
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    else:
        print("Loi: Chua co file token.json, vui long xac thuc truoc!")
        return None
        
    try:
        service = build('blogger', 'v3', credentials=creds)
        
        # Goi API xuat ban chinh thuc
        request = service.posts().publish(blogId=blog_id, postId=post_id)
        response = request.execute()
        
        print("\n XUAT BAN BAI VIET CHINH THUC THANH CONG!")
        print(f"Tieu de : {response.get('title')}")
        print(f"Link live: {response.get('url')}")
        return response
    except Exception as e:
        print(f"Da xay ra loi khi xuat ban: {e}")
        return None

if __name__ == '__main__':
    # ID Blog va ID bai viet nhap vua tao o buoc truoc
    BLOG_ID = "2990849741025760292"
    POST_ID = "5450859883367118487"
    
    xuat_ban_bai_viet(BLOG_ID, POST_ID)
