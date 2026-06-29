import time
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def connect_chrome():
    chrome_options = Options()
    # Ket noi truc tiep vao Chrome mac dinh cua nguoi dung dang mo tren cong 9222
    chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    chrome_options.page_load_strategy = 'eager'
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"Loi ket noi: {e}")
        return None

def main():
    driver = connect_chrome()
    if not driver:
        print("Vui long dam bao Chrome debug dang hoat dong tren cong 9222!")
        sys.exit(1)
        
    blog_id = "2990849741025760292"
    settings_url = f"https://www.blogger.com/blog/settings/{blog_id}"
    
    print(f"Dang truy cap trang cai dat Blogger cua anh: {settings_url}")
    driver.get(settings_url)
    time.sleep(3) # Cho 3 giay de render trang cai dat vi anh da dang nhap san
    
    # Cuon xuong phan Robots.txt
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
                
                // Click nut Save/Luu
                var buttons = document.getElementsByTagName('button');
                for (var j = 0; j < buttons.length; j++) {
                    var btnText = buttons[j].textContent || buttons[j].innerText;
                    if (btnText && (btnText.includes('Save') || btnText.includes('Lưu'))) {
                        buttons[j].click();
                        break;
                    }
                }
            }
        }, 1500);
    }
    """
    try:
        driver.execute_script(js_fix)
        time.sleep(3)
        print("Da tu dong sua loi va luu Robots.txt thanh cong!")
    except Exception as e:
        print(f"Loi khi thuc thi JS: {e}")

if __name__ == '__main__':
    main()
