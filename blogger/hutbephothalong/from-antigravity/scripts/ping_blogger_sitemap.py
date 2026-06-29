import urllib.request

def ping_sitemap():
    sitemap_url = "https://hutbephothalong14.blogspot.com/sitemap.xml"
    
    # Cac cong ping sitemap chinh thuc cua Google va Bing
    google_ping = f"https://www.google.com/ping?sitemap={sitemap_url}"
    bing_ping = f"https://www.bing.com/ping?sitemap={sitemap_url}"
    
    print("--- DANG THUC HIEN PING SITEMAP BLOGGER LEN GOOGLE & BING ---")
    print(f"Sitemap: {sitemap_url}\n")
    
    # 1. Gửi tin hiệu ping Googlebot
    try:
        req_google = urllib.request.Request(
            google_ping,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req_google, timeout=5) as resp:
            print(" Kich hoat Googlebot thanh cong! Google da nhan tin hieu de index blog ve tinh.")
    except Exception as e:
        print(f" Loi khi ping Google: {e}")
        
    # 2. Gửi tin hiệu ping Bingbot
    try:
        req_bing = urllib.request.Request(
            bing_ping,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req_bing, timeout=5) as resp:
            print(" Kich hoat Bingbot (Microsoft) thanh cong!")
    except Exception as e:
        print(f" Loi khi ping Bing: {e}")

if __name__ == '__main__':
    ping_sitemap()
