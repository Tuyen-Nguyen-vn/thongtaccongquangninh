# Hướng dẫn Kết nối Blogger API v3 cho Automation & Script Windows

Tài liệu này hướng dẫn chi tiết cách kết nối và sử dụng Google Blogger API v3 để tự động hóa đăng bài viết chuẩn SEO lên hệ thống blog Blogger (Blogspot).

---

## Bước 1: Thiết lập trên Google Cloud Console (Bắt buộc)

Để kết nối với Blogger, bạn cần tạo một ứng dụng trên Google Cloud để lấy thông tin xác thực (`Client ID` và `Client Secret`).

1. Truy cập vào **[Google Cloud Console](https://console.cloud.google.com/)** và đăng nhập bằng tài khoản Gmail quản lý Blog.
2. Tạo một dự án mới (Project) bằng cách bấm vào danh sách dự án ở góc trên bên trái -> **New Project** -> Đặt tên dự án (ví dụ: `Blogger Automation`) -> Bấm **Create**.
3. Bật API Blogger:
   - Vào thanh tìm kiếm gõ **Blogger API v3**.
   - Bấm vào kết quả tìm thấy và nhấn nút **Enable** (Bật).
4. Thiết lập màn hình đồng ý OAuth (OAuth consent screen):
   - Menu bên trái -> **APIs & Services** -> **OAuth consent screen**.
   - Chọn **External** -> Bấm **Create**.
   - Điền thông tin cơ bản: Tên app (ví dụ: `My Blogger Tool`), Email hỗ trợ của bạn, Email liên hệ nhà phát triển. Bấm **Save and Continue**.
   - Phần **Scopes**: Bấm **Add or Remove Scopes**, tìm và chọn phạm vi `.../auth/blogger` (quyền đọc/ghi dữ liệu Blogger).
   - Phần **Test users**: Thêm chính địa chỉ Gmail của bạn vào danh sách để có quyền kiểm tra.
5. Tạo thông tin xác thực (Credentials):
   - Menu bên trái -> **Credentials** -> Bấm **+ Create Credentials** -> Chọn **OAuth client ID**.
   - Chọn **Application type** phù hợp:
     - Chọn **Web application** (Nếu kết nối qua n8n, Make).
     - Chọn **Desktop app** (Nếu chạy script Python/Node.js trực tiếp trên máy tính Windows).
   - Nếu chọn Web application, tại mục **Authorized redirect URIs**, bạn điền URL callback của công cụ automation (Ví dụ với n8n là `https://oauth.tool.com/oauth2/callback`).
   - Bấm **Create**.
6. Tải file cấu hình:
   - Copy lại **Client ID** và **Client Secret** xuất hiện trên màn hình.
   - Hoặc bấm nút Tải xuống (biểu tượng mũi tên đi xuống) để lưu file dưới dạng `client_secrets.json`. Lưu file này vào thư mục chạy code trên máy tính.

---

## Bước 2: Kết nối qua công cụ Automation (n8n / Make)

Đây là cách dễ nhất vì n8n/Make tự xử lý quá trình lấy và tự động gia hạn token (Refresh Token).

### Cấu hình trong n8n:
- **Credential Type**: Chọn `Google OAuth2 API`.
- **Client ID** & **Client Secret**: Nhập 2 mã đã lấy ở Bước 1.
- **Auth URI**: `https://accounts.google.com/o/oauth2/auth`
- **Token URI**: `https://oauth2.googleapis.com/token`
- **Scope**: Điền `https://www.googleapis.com/auth/blogger`
- Bấm **Connect my account** để đăng nhập Gmail và cấp quyền.

### API Endpoint & Payload JSON gọi qua HTTP Request node:

Khi đã kết nối OAuth2, bạn có thể gọi trực tiếp API để đăng bài.

- **Method**: `POST`
- **URL**: `https://www.googleapis.com/blogger/v3/blogs/{BLOG_ID}/posts`
- **Headers**:
  ```json
  {
    "Authorization": "Bearer {{ $credentials.oauth2.accessToken }}",
    "Content-Type": "application/json"
  }
  ```
- **Payload JSON (Body)**:
  ```json
  {
    "kind": "blogger#post",
    "blog": {
      "id": "1234567890123456789"
    },
    "title": "Dịch vụ thông tắc cống tại Hạ Long giá rẻ 100k - Môi Trường Đông Bắc",
    "content": "<p>Đường cống nhà bạn đang bị tắc nghẽn nghiêm trọng? Môi Trường Đông Bắc cam kết xử lý triệt để với hotline 0981.306.307.</p><h2>Cam kết 3 Không khi thông tắc cống</h2><ul><li>Không đục phá làm hỏng kết cấu công trình.</li><li>Không báo giá ảo, phát sinh chi phí sau khảo sát.</li><li>Không tái phát tắc nghẽn trong thời gian dài.</li></ul>"
  }
  ```

---

## Bước 3: Chạy Script Python đăng bài tự động trên Windows

Nếu bạn muốn chạy script trực tiếp trên máy tính Windows, thực hiện theo các bước sau:

### 1. Cài đặt thư viện cần thiết
Mở **Command Prompt (cmd)** hoặc **PowerShell** trên Windows và chạy lệnh:
```bash
pip install google-api-python-client google-auth-oauthlib google-auth-httplib2
```

### 2. Viết Script Python (`dang_bai_blogger.py`)
Đặt file `client_secrets.json` vừa tải ở Bước 1 vào cùng thư mục với script này.

```python
import os
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Phạm vi quyền hạn cần thiết để đăng bài viết
SCOPES = ['https://www.googleapis.com/auth/blogger']

def get_blogger_service():
    creds = None
    # File token.json lưu thông tin đăng nhập sau lần chạy đầu tiên để không phải đăng nhập lại
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('client_secrets.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Lưu lại token cho lần chạy sau
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    # Khởi tạo kết nối tới Blogger API v3
    service = build('blogger', 'v3', credentials=creds)
    return service

def post_to_blogger(blog_id, title, html_content):
    try:
        service = get_blogger_service()
        
        # Dữ liệu bài viết gửi lên API
        body = {
            "kind": "blogger#post",
            "title": title,
            "content": html_content
        }
        
        # Gọi API tạo bài viết mới
        request = service.posts().insert(blogId=blog_id, body=body)
        response = request.execute()
        
        print("Đăng bài viết thành công!")
        print(f"Tiêu đề: {response.get('title')}")
        print(f"Địa chỉ bài viết: {response.get('url')}")
        return response
    except Exception as e:
        print(f"Đã xảy ra lỗi khi đăng bài: {e}")
        return None

if __name__ == '__main__':
    # THAY THẾ BLOG_ID CỦA BẠN VÀO ĐÂY (Lấy số ID trên URL của trang quản trị Blogger)
    MY_BLOG_ID = 'YOUR_BLOG_ID_HERE' 
    
    TIEU_DE = "Hút bể phốt tại Hạ Long giá rẻ 100k - Môi Trường Đông Bắc"
    NOI_DUNG_HTML = """
    <p>Nhà bạn bị đầy bể phốt gây mùi hôi khó chịu? Hãy liên hệ ngay Môi Trường Đông Bắc qua hotline 0981.306.307 để được phục vụ nhanh chóng.</p>
    <h2>Cam kết 3 Không của chúng tôi</h2>
    <ul>
        <li>Không đục phá kết cấu công trình.</li>
        <li>Không báo giá ảo, báo giá khống.</li>
        <li>Không tái phát tắc nghẽn hay đầy ứ nhanh chóng.</li>
    </ul>
    """
    
    post_to_blogger(MY_BLOG_ID, TIEU_DE, NOI_DUNG_HTML)
```

### 3. Cách chạy trên Windows:
1. Đảm bảo đã có file `client_secrets.json` trong thư mục.
2. Thay thế `YOUR_BLOG_ID_HERE` bằng ID blog của bạn (ID là dãy số cuối cùng trên URL khi bạn vào trang quản lý Blogger, ví dụ `https://www.blogger.com/blog/posts/847294829...` thì ID là `847294829`).
3. Chạy lệnh trong Terminal:
   ```bash
   python dang_bai_blogger.py
   ```
4. Ở lần chạy đầu tiên, trình duyệt web sẽ tự động mở ra yêu cầu bạn chọn tài khoản Gmail và cấp quyền. Sau khi cấp quyền xong, file `token.json` sẽ tự động được tạo ra trên máy tính của bạn và các lần chạy sau sẽ hoàn toàn tự động mà không cần đăng nhập lại.
