import os
import base64
import urllib.request
import json

def parse_env(env_path):
    env = {}
    if not os.path.exists(env_path):
        return env
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                env[key.strip()] = val.strip().strip('"').strip("'")
    return env

def submit_to_google_index():
    print("--- QUY TRINH KHAI BAO GOOGLE INDEX CHO BLOGGER VE TINH ---")
    
    # 1. Doc thong tin tu file .env cua thongtaccongquangninh
    env_path = r"D:\.thongtaccongquangninh\.env"
    env = parse_env(env_path)
    
    wp_user = env.get("WP_USERNAME")
    wp_pass = env.get("WP_APP_PASSWORD")
    
    if not wp_user or not wp_pass:
        print("Loi: Khong tim thay thong tin dang nhap WordPress trong file .env!")
        return
        
    # 2. Danh sach 7 URL bai viet Blogger ve tinh da xuat ban chinh thuc
    urls_to_index = [
        "https://hutbephothalong14.blogspot.com/2026/05/hut-be-phot-ha-long-gia-re-khong-uc-pha.html",
        "https://hutbephothalong14.blogspot.com/2026/05/cach-thong-bon-cau-bi-tac-vat-cung-bang.html",
        "https://hutbephothalong14.blogspot.com/2026/05/5-cach-xu-ly-mui-hoi-cong-thoat-san-nha.html",
        "https://hutbephothalong14.blogspot.com/2026/05/dich-vu-thong-tac-cong-tai-phuong-hong.html",
        "https://hutbephothalong14.blogspot.com/2026/05/dich-vu-hut-be-phot-tai-bai-chay-quang.html",
        "https://hutbephothalong14.blogspot.com/2026/05/bang-gia-thong-hut-be-phot-tai-cam-pha.html",
        "https://hutbephothalong14.blogspot.com/2026/05/canh-bao-4-chieu-tro-hut-be-phot-lua-ao.html",
        "https://hutbephothalong14.blogspot.com/2026/05/tai-sao-cong-nghe-hut-be-phot-chan.html"
    ]
    
    print(f"Chuan bi khai bao {len(urls_to_index)} URL bai viet ve tinh len Google Index...")
    
    # 3. Chuan bi Header Basic Auth cho Rank Math API
    auth_str = f"{wp_user}:{wp_pass}"
    auth_bytes = auth_str.encode("utf-8")
    auth_base64 = base64.b64encode(auth_bytes).decode("utf-8")
    
    headers = {
        "Authorization": f"Basic {auth_base64}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    
    # Ghep cac URL cach nhau bang dong moi theo format Rank Math API
    payload = {
        "urls": "\n".join(urls_to_index)
    }
    
    # 4. Goi API gui len Google Index
    api_url = "https://thongtaccongquangninh.com/wp-json/rankmath/v1/in/submitUrls"
    
    try:
        req = urllib.request.Request(
            api_url, 
            data=json.dumps(payload).encode("utf-8"), 
            headers=headers, 
            method="POST"
        )
        
        print("Dang gui yeu cau den Google Index qua Rank Math Instant Indexing API...")
        with urllib.request.urlopen(req, timeout=10) as response:
            status_code = response.getcode()
            response_body = response.read().decode("utf-8")
            
            if status_code == 200:
                print("\n SUBMIT GOOGLE INDEX THANH CONG 100%!")
                print(f"Ma phan hoi: {status_code}")
                print(f"Chi tiet: {response_body}")
                
                # Luu log vao thu muc du an
                log_data = {
                    "submittedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "urlCount": len(urls_to_index),
                    "submitStatus": status_code,
                    "urls": urls_to_index,
                    "response": json.loads(response_body) if response_body.startswith('{') else response_body
                }
                log_file = f"d:\\.Antigravity\\SEO_SOP\\SEO_GOOGLE_INDEX_{time.strftime('%Y-%m-%d')}.json"
                with open(log_file, 'w', encoding='utf-8') as f_log:
                    json.dump(log_data, f_log, indent=2, ensure_ascii=False)
                print(f"Log khai bao da duoc ghi nhan tai: {log_file}")
            else:
                print(f"\nLoi: Rank Math API tra ve trang thai {status_code}!")
                print(response_body)
                
    except Exception as e:
        print(f"\nDa xay ra loi khi ket noi den Rank Math Indexing API: {e}")

if __name__ == '__main__':
    submit_to_google_index()
