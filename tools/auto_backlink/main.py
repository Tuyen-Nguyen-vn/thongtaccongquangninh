import sys
import os
import json
import argparse
import random

# Add parent path to import sibling modules if run directly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import captcha_solver
import content_generator
import browser_bot

CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")

def load_config():
    """Load configuration from config.json"""
    if not os.path.exists(CONFIG_FILE):
        print(f"[Error] Không tìm thấy file cấu hình tại: {CONFIG_FILE}")
        print("Vui lòng sao chép config.json.example sang config.json và điền đầy đủ thông tin.")
        sys.exit(1)
        
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except Exception as e:
            print(f"[Error] Lỗi phân tích cú pháp JSON trong file cấu hình: {e}")
            sys.exit(1)

def test_proxy(config):
    """Test proxy connections configured in config.json"""
    print("=== KIỂM TRA KẾT NỐI PROXY ===")
    proxies = config.get("proxies", [])
    if not proxies:
        print("Không có proxy nào được cấu hình. Tool sẽ sử dụng IP mặc định của máy.")
        return
        
    if not browser_bot.PLAYWRIGHT_AVAILABLE:
        print("[Lỗi] Playwright chưa được cài đặt. Vui lòng chạy lệnh:")
        print("pip install playwright && playwright install chromium")
        return

    from playwright.sync_api import sync_playwright
    
    for idx, prx in enumerate(proxies):
        print(f"Thử nghiệm Proxy {idx+1}: {prx}")
        try:
            with sync_playwright() as p:
                browser, context = browser_bot.init_context(p, proxy_str=prx, headless=True)
                page = context.new_page()
                page.goto("https://api.ipify.org?format=json", timeout=15000)
                ip_json = page.inner_text("body")
                print(f"-> Kết nối thành công! IP trả về: {ip_json.strip()}")
                browser.close()
        except Exception as e:
            print(f"-> Thất bại: {e}")

def test_gen(config):
    """Test content generation module"""
    print("=== KIỂM TRA SINH NỘI DUNG AI ===")
    api_key = config.get("gemini_api_key")
    keywords = config.get("seo_keywords", ["thông tắc cống tại Quảng Ninh"])
    kw = random.choice(keywords)
    
    print(f"Đang sinh thử bài viết cho từ khóa: '{kw}'")
    article = content_generator.generate_article(
        api_key=api_key,
        keyword=kw,
        hotline1=config.get("hotlines", ["0963.953.533"])[0],
        hotline2=config.get("hotlines", ["0931.156.756"])[0] if len(config.get("hotlines", [])) > 1 else "0931.156.756"
    )
    print("\nNỘI DUNG SINH RA:")
    print("-" * 50)
    print(article)
    print("-" * 50)

def test_captcha(config):
    """Test 2Captcha API connection and balance"""
    print("=== KIỂM TRA KẾT NỐI 2CAPTCHA ===")
    api_key = config.get("two_captcha_api_key")
    if not api_key:
        print("[Lỗi] Chưa điền 'two_captcha_api_key' trong file config.json")
        return
        
    url = f"https://2captcha.com/res.php?key={api_key}&action=getbalance&json=1"
    response_text = captcha_solver._make_request(url)
    if response_text:
        try:
            res = json.loads(response_text)
            if res.get("status") == 1:
                print(f"-> Kết nối thành công! Số dư tài khoản 2Captcha: {res.get('request')} USD")
            else:
                print(f"-> Lỗi 2Captcha: {res.get('request')}")
        except Exception as e:
            print(f"-> Lỗi phân tích phản hồi: {e}. Phản hồi thô: {response_text}")
    else:
        print("-> Không kết nối được tới máy chủ 2Captcha.")

def run_registration(config):
    """Register accounts on all configured forums"""
    print("=== TIẾN HÀNH ĐĂNG KÝ TÀI KHOẢN HÀNG LOẠT ===")
    if not browser_bot.PLAYWRIGHT_AVAILABLE:
        print("[Lỗi] Playwright chưa cài đặt. Chạy 'pip install playwright && playwright install chromium'")
        return
        
    forums = config.get("target_forums", [])
    proxies = config.get("proxies", [])
    captcha_key = config.get("two_captcha_api_key")
    
    from playwright.sync_api import sync_playwright
    
    for idx, forum in enumerate(forums):
        url = forum.get("url")
        ftype = forum.get("type", "xenforo")
        username = forum.get("username")
        password = forum.get("password")
        email = forum.get("email")
        
        if not (username and password and email):
            print(f"Bỏ qua {url}: Thiếu username/password/email trong cấu hình.")
            continue
            
        proxy = proxies[idx % len(proxies)] if proxies else None
        print(f"\n[{idx+1}/{len(forums)}] Đang đăng ký tại: {url} | Proxy: {proxy or 'Không dùng'}")
        
        # Determine register path
        reg_url = url.rstrip("/") + "/register/"
        
        try:
            with sync_playwright() as p:
                browser, context = browser_bot.init_context(p, proxy_str=proxy, headless=False) # Run with browser UI visible for tracking
                page = context.new_page()
                success = browser_bot.xenforo_register(
                    page, 
                    register_url=reg_url, 
                    username=username, 
                    password=password, 
                    email=email,
                    captcha_api_key=captcha_key
                )
                if success:
                    print(f"-> Gửi form đăng ký cho {url} hoàn tất!")
                else:
                    print(f"-> Đăng ký thất bại cho {url}.")
                browser.close()
        except Exception as e:
            print(f"-> Lỗi khi xử lý đăng ký cho {url}: {e}")

def run_posting(config):
    """Post articles/backlinks on configured forums using logged accounts"""
    print("=== TIẾN HÀNH ĐĂNG BÀI VIẾT ĐI LINK ===")
    if not browser_bot.PLAYWRIGHT_AVAILABLE:
        print("[Lỗi] Playwright chưa cài đặt.")
        return
        
    forums = config.get("target_forums", [])
    proxies = config.get("proxies", [])
    keywords = config.get("seo_keywords", ["thông tắc cống tại Quảng Ninh"])
    api_key = config.get("gemini_api_key")
    
    from playwright.sync_api import sync_playwright
    
    for idx, forum in enumerate(forums):
        url = forum.get("url")
        username = forum.get("username")
        password = forum.get("password")
        
        if not (username and password):
            print(f"Bỏ qua {url}: Thiếu thông tin đăng nhập.")
            continue
            
        proxy = proxies[idx % len(proxies)] if proxies else None
        print(f"\n[{idx+1}/{len(forums)}] Đang đăng bài tại: {url} | Proxy: {proxy or 'Không dùng'}")
        
        # 1. Generate article content using Gemini
        kw = random.choice(keywords)
        print(f"Sinh nội dung bài viết đi link cho từ khóa: '{kw}'")
        article_content = content_generator.generate_article(
            api_key=api_key,
            keyword=kw,
            hotline1=config.get("hotlines", ["0963.953.533"])[0],
            hotline2=config.get("hotlines", ["0931.156.756"])[0] if len(config.get("hotlines", [])) > 1 else "0931.156.756"
        )
        
        title = f"Cách tự thông tắc nhanh tại nhà - Hướng dẫn từ thợ {kw}"
        
        # 2. Start browser automation
        try:
            with sync_playwright() as p:
                browser, context = browser_bot.init_context(p, proxy_str=proxy, headless=False)
                page = context.new_page()
                
                # Navigate to login
                login_url = url.rstrip("/") + "/login/"
                print(f"Đăng nhập vào: {login_url}")
                page.goto(login_url)
                page.wait_for_load_state("networkidle")
                
                # Fill login form
                # Xenforo fields are usually login / password
                page.fill("input[name='login'], input[name='username']", username)
                page.fill("input[name='password']", password)
                
                # Submit login
                submit_btn = page.locator("button[type='submit'], input[type='submit'], .button--primary").first
                submit_btn.click()
                page.wait_for_load_state("networkidle")
                time.sleep(2)
                
                # Determine forum target block (can be configured per forum or default forum 2)
                # For Xenforo, posting url is usually /forums/{forum_id}/post-thread or we navigate to /create-thread
                post_url = url.rstrip("/") + "/forums/2/post-thread" # Defaults to Forum ID 2 (often general discussion)
                
                # Attempt to post
                live_url = browser_bot.xenforo_post_thread(
                    page,
                    post_url=post_url,
                    title=title,
                    content=article_content
                )
                
                if live_url:
                    print(f"-> [SUCCESS] Bài viết đã đăng thành công! Link live: {live_url}")
                else:
                    print(f"-> [FAILED] Đăng bài thất bại trên {url}")
                    
                browser.close()
        except Exception as e:
            print(f"-> Lỗi khi đăng bài trên {url}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Auto Backlink Tool - Công cụ đi backlink tự động")
    parser.add_argument("--test-proxy", action="store_true", help="Kiểm tra trạng thái kết nối của proxy")
    parser.add_argument("--test-gen", action="store_true", help="Kiểm tra sinh bài viết từ Gemini API")
    parser.add_argument("--test-captcha", action="store_true", help="Kiểm tra kết nối và số dư tài khoản 2Captcha")
    parser.add_argument("--register-only", action="store_true", help="Chỉ chạy quy trình đăng ký tài khoản")
    parser.add_argument("--post-only", action="store_true", help="Chỉ chạy quy trình đăng bài đi link")
    parser.add_argument("--run-all", action="store_true", help="Chạy toàn bộ quy trình: Đăng ký rồi Đăng bài")
    
    args = parser.parse_args()
    config = load_config()
    
    # Run test flags
    if args.test_proxy:
        test_proxy(config)
    elif args.test_gen:
        test_gen(config)
    elif args.test_captcha:
        test_captcha(config)
    elif args.register_only:
        run_registration(config)
    elif args.post_only:
        run_posting(config)
    elif args.run_all:
        run_registration(config)
        run_posting(config)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
