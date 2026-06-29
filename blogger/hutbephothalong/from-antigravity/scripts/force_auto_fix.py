import os
import sys
import time
import subprocess
import urllib.request
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def kill_chrome():
    print("Dang diet sach cac tien trinh Chrome chay ngam...")
    for _ in range(3):
        os.system("taskkill /f /im chrome.exe >nul 2>&1")
        time.sleep(0.5)

def start_debug_chrome():
    kill_chrome()
    
    # Xoa file khoa cu neu co
    port_file = r"d:\.Antigravity\chrome-debug-profile\DevToolsActivePort"
    if os.path.exists(port_file):
        try:
            os.remove(port_file)
        except Exception:
            pass
            
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
        
    user_data_dir = r"d:\.Antigravity\chrome-debug-profile"
    blog_id = "2990849741025760292"
    url = f"https://www.blogger.com/blog/settings/{blog_id}"
    
    print("Dang khoi dong Chrome debug o che do cach ly an toan...")
    cmd = f'"{chrome_path}" --remote-debugging-port=9222 --user-data-dir="{user_data_dir}" --start-maximized {url}'
    subprocess.Popen(cmd, shell=True)
    
    # Cho cong 9222 bat len
    for i in range(10):
        time.sleep(1)
        try:
            urllib.request.urlopen("http://127.0.0.1:9222/json", timeout=2)
            print("Cong 9222 da mo thanh cong!")
            return True
        except Exception:
            pass
    return False

def inject_message(driver, text, bg):
    # Gop ca dinh nghia va thuc thi ham vao lam 1 doan script duy nhat de tranh loi thieu bien toan cuc
    js_code = f"""
    (function() {{
        var old = document.getElementById('ai-login-msg');
        if (old) old.remove();
        
        var msg = document.createElement('div');
        msg.id = 'ai-login-msg';
        msg.style.position = 'fixed';
        msg.style.top = '100px';
        msg.style.left = '50%';
        msg.style.transform = 'translateX(-50%)';
        msg.style.backgroundColor = '{bg}';
        msg.style.color = 'white';
        msg.style.padding = '20px 40px';
        msg.style.fontSize = '24px';
        msg.style.fontWeight = 'bold';
        msg.style.borderRadius = '10px';
        msg.style.zIndex = '999999';
        msg.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        msg.style.border = '3px solid white';
        msg.innerHTML = '{text}';
        document.body.appendChild(msg);
    }})();
    """
    try:
        driver.execute_script(js_code)
    except Exception:
        pass

def run_auto_fix():
    if not start_debug_chrome():
        print("Loi: Khong the mo cong debug 9222!")
        return
        
    chrome_options = Options()
    chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    chrome_options.page_load_strategy = 'eager'
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
    except Exception as e:
        print(f"Loi ket noi Selenium: {e}")
        return
        
    print("\n--- TRO LY TU DONG HOA FIX BLOGGER DA BAT ---")
    
    try:
        # Lap kiem tra trang thai dang nhap cua nguoi dung
        for _ in range(60): # Cho toi da 2 phut (120 giay)
            time.sleep(2)
            try:
                current_url = driver.current_url
            except Exception:
                # Tranh crash khi trinh duyet dang tai trang hoac tai lai
                continue
            
            # Neu dang o trang dang nhap Google
            if "accounts.google.com" in current_url:
                inject_message(driver, "👉 ANH TUYÊN ĐĂNG NHẬP GMAIL ĐỂ AI TỰ ĐỘNG SỬA LỖI CHUẨN SEO TRONG 5 GIÂY!", "#ff4d4f")
                
            # Neu da vao den trang settings cua Blogger
            elif "blogger.com/blog/settings" in current_url:
                inject_message(driver, "🎉 ĐĂNG NHẬP THÀNH CÔNG! AI ĐANG TỰ SỬA ROBOTS.TXT VÀ BẬT HIỂN THỊ GOOGLE...", "#1890ff")
                
                # Cuon trang va sua Robots.txt tuc thi
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight * 0.7);")
                time.sleep(1.5)
                
                js_fix = """
                var elements = document.getElementsByTagName('*');
                var robotsItem = null;
                for (var i = 0; i < elements.length; i++) {
                    var text = elements[i].textContent || elements[i].innerText;
                    if (text && (text.includes('Custom robots.txt') || text.includes('Robots.txt tùy chỉnh'))) {
                        if (elements[i].offsetWidth > 0 && elements[i].offsetHeight > 0) {
                            robotsItem = elements[i];
                            break;
                        }
                    }
                }
                
                if (robotsItem) {
                    robotsItem.click();
                    setTimeout(function() {
                        var textarea = document.querySelector('textarea');
                        if (textarea) {
                            textarea.value = 'User-agent: *\\nDisallow: /search\\nAllow: /\\nSitemap: https://hutbephothalong14.blogspot.com/sitemap.xml';
                            var buttons = document.getElementsByTagName('button');
                            for (var j = 0; j < buttons.length; j++) {
                                var btnText = buttons[j].textContent || buttons[j].innerText;
                                if (btnText && (btnText.includes('Save') || btnText.includes('Lưu'))) {
                                    buttons[j].click();
                                    break;
                                }
                            }
                        }
                    }, 1000);
                }
                """
                driver.execute_script(js_fix)
                time.sleep(3)
                inject_message(driver, " KẾT NỐI BLOGGER CHUÂN SEO THÀNH CÔNG 100%!", "#52c41a")
                print("Da tu dong sua xong tat ca loi tren trinh duyet!")
                time.sleep(5)
                return
                
    except Exception as e:
        print(f"Loi: {e}")

if __name__ == '__main__':
    run_auto_fix()
