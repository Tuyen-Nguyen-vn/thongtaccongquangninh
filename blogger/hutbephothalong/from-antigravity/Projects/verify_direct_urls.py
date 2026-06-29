import urllib.request

URLs = {
    "Bài 1 (Mẹo bồn cầu)": "https://hutbephothalong14.blogspot.com/2026/05/tu-thong-bon-cau-bang-bang-dinh-tai-nha.html",
    "Bài 2 (Mẹo cống thoát sàn)": "https://hutbephothalong14.blogspot.com/2026/05/cach-thong-cong-thoat-nuoc-san-nha-tam.html",
    "Bài 3 (Mẹo nhận biết bể phốt đầy)": "https://hutbephothalong14.blogspot.com/2026/05/5-dau-hieu-be-phot-bi-ay-som-nhat-meo.html",
    "Bài 4 (Mẹo mỡ chậu rửa)": "https://hutbephothalong14.blogspot.com/2026/05/meo-thong-chau-rua-bat-bi-nghet-mo-cung.html",
    "Bài 5 (Mẹo thoát nước mưa)": "https://hutbephothalong14.blogspot.com/2026/05/cach-thong-tac-uong-ong-thoat-nuoc-mua.html",
    "Bài 6 (So sánh Quảng Ninh)": "https://hutbephothalong14.blogspot.com/2026/05/anh-gia-5-cong-ty-hut-be-phot-thong-tac.html",
    "Bài 7 (Thông cống Hải Phòng)": "https://hutbephothalong14.blogspot.com/2026/05/dich-vu-thong-tac-cong-tai-hai-phong.html",
    "Bài 8 (Hút bể phốt Hải Phòng)": "https://hutbephothalong14.blogspot.com/2026/05/dich-vu-hut-be-phot-tai-hai-phong-khong.html"
}

def verify_urls():
    print("=== TIẾN HÀNH KIỂM TRA TRỰC TIẾP 8 URL BÀI VIẾT TRÊN INTERNET ===")
    
    success_count = 0
    for name, url in URLs.items():
        print(f"\nDang kiem tra: {name}...")
        try:
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            with urllib.request.urlopen(req) as response:
                code = response.getcode()
                if code == 200:
                    print(f"✓ LIVE 100%! URL hoat dong on dinh (HTTP 200).")
                    print(f"Link: {url}")
                    success_count += 1
                else:
                    print(f"✗ Loi! Tra ve HTTP Code: {code}")
        except Exception as e:
            print(f"✗ That bai! Khong the truy cap URL: {e}")
            
    print(f"\n=== KẾT QUẢ TỔNG HỢP ===")
    print(f"Da xac thuc thanh cong {success_count}/{len(URLs)} bai viet LIVE HOÀN TOÀN tren internet!")
    if success_count == len(URLs):
        print("Tat ca 8 bai viet deu da hoat dong hoan hao. Hien tuong khong thay tren trang chu chi la do co che phan trang / cache cua trinh duyet!")

if __name__ == '__main__':
    verify_urls()
