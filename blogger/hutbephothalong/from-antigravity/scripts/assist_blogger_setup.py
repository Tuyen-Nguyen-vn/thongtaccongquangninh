import time
import os
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def connect_chrome():
    print("Dang ket noi den Google Chrome dang mo...")
    chrome_options = Options()
    chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        print("KET NOI THANH CONG!")
        return driver
    except Exception as e:
        print(f"Loi ket noi: {e}")
        return None

def inject_guide_js(driver, text, target_selector_or_text, is_text=True):
    # Doan script JS de tao mot thong bao huong dan to, nhap nhay tren man hinh
    js_code = f"""
    // 1. Xoa thong bao cu neu co
    var oldTip = document.getElementById('ai-guide-tip');
    if (oldTip) oldTip.remove();
    
    // 2. Tao thong bao moi
    var tip = document.createElement('div');
    tip.id = 'ai-guide-tip';
    tip.style.position = 'fixed';
    tip.style.bottom = '20px';
    tip.style.right = '20px';
    tip.style.backgroundColor = '#ff4d4f';
    tip.style.color = 'white';
    tip.style.padding = '15px 25px';
    tip.style.fontSize = '20px';
    tip.style.fontWeight = 'bold';
    tip.style.borderRadius = '10px';
    tip.style.zIndex = '999999';
    tip.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    tip.style.border = '2px solid white';
    tip.innerHTML = '{text}';
    document.body.appendChild(tip);
    
    // 3. Tim phan tu can bam de khoanh do
    var targetEl = null;
    if ({str(is_text).lower()}) {{
        var elements = document.getElementsByTagName('*');
        for (var i = 0; i < elements.length; i++) {{
            var el = elements[i];
            if (el.offsetWidth > 0 && el.offsetHeight > 0) {{
                var elText = el.textContent || el.innerText;
                if (elText && elText.trim() === '{target_selector_or_text}') {{
                    targetEl = el;
                    break;
                }}
            }}
        }}
    }} else {{
        targetEl = document.querySelector('{target_selector_or_text}');
    }}
    
    // 4. Neu tim thay, khoanh do phan tu do
    if (targetEl) {{
        // Xoa o khoanh cu neu co
        var oldBorder = document.getElementById('ai-guide-border');
        if (oldBorder) oldBorder.remove();
        
        var rect = targetEl.getBoundingClientRect();
        var border = document.createElement('div');
        border.id = 'ai-guide-border';
        border.style.position = 'absolute';
        border.style.top = (rect.top + window.scrollY - 4) + 'px';
        border.style.left = (rect.left + window.scrollX - 4) + 'px';
        border.style.width = (rect.width + 8) + 'px';
        border.style.height = (rect.height + 8) + 'px';
        border.style.border = '4px dashed #ff4d4f';
        border.style.borderRadius = '5px';
        border.style.pointerEvents = 'none';
        border.style.zIndex = '999998';
        
        // Them hieu ung nhap nhay
        border.animate([
            {{ opacity: 1 }},
            {{ opacity: 0.3 }},
            {{ opacity: 1 }}
        ], {{
            duration: 1000,
            iterations: Infinity
        }});
        
        document.body.appendChild(border);
        targetEl.scrollIntoView({{behavior: 'smooth', block: 'center'}});
    }}
    """
    try:
        driver.execute_script(js_code)
    except Exception:
        pass

def main():
    driver = connect_chrome()
    if not driver:
        print("Vui long dam bao Chrome debug dang chay tren cong 9222!")
        sys.exit(1)
        
    print("\n--- BAT DAU TRO LY HUONG DAN TRUC QUAN ---")
    print("Hay nhin vao man hinh Chrome dang mo de lam theo cac o khoanh do!")
    
    # Kiem tra thu muc tai ve
    download_dir = r"C:\Users\DELL\Downloads"
    target_dir = r"d:\.Antigravity"
    
    try:
        while True:
            current_url = driver.current_url
            
            # Buoc 1: Kich hoat Blogger API
            if "library/blogger.googleapis.com" in current_url:
                # Kiem tra xem da enabled chua
                page_source = driver.page_source
                if "API Enabled" in page_source or "Manage" in page_source or "Quan ly" in page_source:
                    inject_guide_js(driver, "Buoc 1 Xong! Chuyen sang trang tiep theo...", "Manage", is_text=True)
                    time.sleep(2)
                    driver.get("https://console.cloud.google.com/apis/credentials")
                else:
                    inject_guide_js(driver, "ANH TUYEN BAM NUT 'ENABLE' (BAT) MAU XANH DE KICH HOAT!", "Enable", is_text=True)
            
            # Buoc 2: Màn hinh Credentials
            elif "apis/credentials" in current_url:
                page_source = driver.page_source
                
                # Neu da co OAuth Client ID trong danh sach
                if "Blogger Desktop Client" in page_source or "Desktop client" in page_source:
                    inject_guide_js(driver, "ANH BAM VAO BIEU TUONG MUI TEN TAI XUONG (DOWNLOAD) PHIA NGOAI CUNG DONG 'Blogger Desktop Client'!", "Blogger Desktop Client", is_text=True)
                else:
                    inject_guide_js(driver, "ANH BAM NUT '+ CREATE CREDENTIALS' (TAO THONG TIN XAC THUC) PHIA TREN!", "Create Credentials", is_text=True)
                    
            # Buoc 3: Buoc tao OAuth Client ID
            elif "apis/credentials/oauthclient" in current_url:
                inject_guide_js(driver, "ANH CHON 'Desktop app' (Ung dung may tinh) TAI O APPLICATION TYPE!", "Application type", is_text=True)
                
            # Tu dong quet file tai ve
            for file in os.listdir(download_dir):
                if file.startswith("client_secret_") and file.endswith(".json"):
                    src_file = os.path.join(download_dir, file)
                    dest_file = os.path.join(target_dir, "client_secrets.json")
                    
                    # Di chuyen file ve dung vi tri
                    try:
                        import shutil
                        shutil.move(src_file, dest_file)
                        print(f"\nDa tu dong phat hien va di chuyen file credential thanh cong!")
                        print(f"File duoc luu tai: {dest_file}")
                        
                        # Hien thong bao chuc mung tren trinh duyet
                        js_success = """
                        var oldTip = document.getElementById('ai-guide-tip');
                        if (oldTip) oldTip.remove();
                        var oldBorder = document.getElementById('ai-guide-border');
                        if (oldBorder) oldBorder.remove();
                        
                        var success = document.createElement('div');
                        success.style.position = 'fixed';
                        success.style.top = '50%';
                        success.style.left = '50%';
                        success.style.transform = 'translate(-50%, -50%)';
                        success.style.backgroundColor = '#52c41a';
                        success.style.color = 'white';
                        success.style.padding = '30px';
                        success.style.fontSize = '24px';
                        success.style.fontWeight = 'bold';
                        success.style.borderRadius = '15px';
                        success.style.zIndex = '999999';
                        success.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
                        success.innerHTML = ' CHUC MUNG ANH TUYEN!<br><br>Da ket noi Blogger API thanh cong 100%! AI dang thuc hien dang bai...';
                        document.body.appendChild(success);
                        """
                        driver.execute_script(js_success)
                        time.sleep(5)
                        return
                    except Exception as e:
                        print(f"Loi khi di chuyen file: {e}")
                        
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nDa dung tro ly.")
    except Exception as e:
        print(f"\nLoi trong qua trinh ho tro: {e}")

if __name__ == "__main__":
    main()
