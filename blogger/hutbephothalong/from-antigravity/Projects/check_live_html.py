import urllib.request
import re

URL = "https://hutbephothalong14.blogspot.com/"

def check_live():
    try:
        print(f"Dang tai du lieu trang chu: {URL}...")
        req = urllib.request.Request(
            URL, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
        print("\nTải dữ liệu HTML trang chủ thành công!")
        
        # Danh sách tiêu đề bài viết cần quét
        target_titles = [
            "Tự Thông Bồn Cầu Bằng Băng Dính Tại Nhà",
            "Cách Thông Cống Thoát Nước Sàn Nhà Tắm",
            "5 Dấu Hiệu Bể Phốt Bị Đầy Sớm Nhất",
            "Đánh Giá 5 Công Ty Hút Bể Phốt",
            "Dịch Vụ Hút Bể Phốt Tại Hải Phòng",
            "Mẹo Thông Chậu Rửa Bát Bị Nghẹt Mỡ",
            "Dịch Vụ Thông Tắc Cống Tại Hải Phòng",
            "Cách Thông Tắc Đường Ống Thoát Nước Mưa"
        ]
        
        print("\n=== KẾT QUẢ QUÉT LIVE TRÊN TRANG CHỦ ===")
        found_any = False
        for title in target_titles:
            # Tìm kiếm tiêu đề trong HTML (không phân biệt hoa thường)
            match = re.search(re.escape(title), html, re.IGNORECASE)
            if match:
                print(f"✓ ĐÃ THẤY: '{title}' xuất hiện công khai trên trang chủ live!")
                found_any = True
            else:
                print(f"✗ CHƯA THẤY: '{title}' không có trên trang chủ live.")
                
        if not found_any:
            print("\nCảnh báo: Không có bài viết mới nào xuất hiện trên trang chủ live!")
            print("Hãy kiểm tra xem cấu trúc template hoặc danh sách bài viết có bị lọc/chặn hiển thị không.")
            
    except Exception as e:
        print(f"Loi khi tai trang chu live: {e}")

if __name__ == '__main__':
    check_live()
