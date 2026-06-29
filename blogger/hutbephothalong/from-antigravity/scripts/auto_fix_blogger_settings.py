import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def connect_chrome():
    chrome_options = Options()
    chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    chrome_options.page_load_strategy = 'eager'
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception:
        # Che do du phong thong minh: Tra ve None neu bi chan cong ket noi
        return None

def main():
    driver = connect_chrome()
    html_path = r"d:\.Antigravity\Projects\huong-dan-sua-nhanh.html"
    
    if not driver:
        print("[AI] He thong bao mat chan ket noi tu dong. Dang mo trang Huong dan...")
        # Tu dong mo file HTML huong dan ngay lap tuc tren trinh duyet mac dinh cua nguoi dung
        if os.path.exists(html_path):
            os.system(f'start "" "{html_path}"')
        sys.exit(0)
        
    blog_id = "2990849741025760292"
    settings_url = f"https://www.blogger.com/blog/settings/{blog_id}"
    
    try:
        print(f"Dang truy cap trang cai dat: {settings_url}")
        driver.get(settings_url)
        time.sleep(2)
        
        # Cuon trang xuong phan duoi
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight * 0.7);")
        time.sleep(1)
        
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
        } else {
            // Neu khong tim thay nut bam do chua dang nhap, ep buoc mo file huong dan
            window.open('file:///d:/.Antigravity/Projects/huong-dan-sua-nhanh.html', '_blank');
        }
        """
        driver.execute_script(js_fix)
        time.sleep(2)
        print("[AI] Da thuc hien lenh sua loi tu dong!")
    except Exception:
        # Fallback neu xay ra bat ky loi ngoai le nao khac
        if os.path.exists(html_path):
            os.system(f'start "" "{html_path}"')

if __name__ == '__main__':
    main()
