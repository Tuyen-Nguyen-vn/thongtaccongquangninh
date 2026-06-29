import sys
import os
import re
import time
from urllib.parse import urlparse

# Add parent path to import sibling modules if run directly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import captcha_solver

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

def parse_proxy(proxy_str):
    """
    Parse standard proxy string 'http://username:password@ip:port' 
    into Playwright proxy dict format.
    """
    if not proxy_str:
        return None
    try:
        parsed = urlparse(proxy_str)
        server = f"{parsed.scheme}://{parsed.hostname}:{parsed.port}"
        proxy_dict = {"server": server}
        if parsed.username and parsed.password:
            proxy_dict["username"] = parsed.username
            proxy_dict["password"] = parsed.password
        return proxy_dict
    except Exception as e:
        print(f"Error parsing proxy string '{proxy_str}': {e}")
        return None

def init_context(playwright, proxy_str=None, headless=True):
    """Initialize Chromium browser context with optional proxy and anti-bot headers"""
    proxy_dict = parse_proxy(proxy_str)
    
    # Launch browser
    browser = playwright.chromium.launch(
        headless=headless,
        proxy=proxy_dict,
        args=["--disable-blink-features=AutomationControlled"]
    )
    
    # Create context with standard user agent and viewport size
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        viewport={"width": 1280, "height": 720}
    )
    
    # Inject JavaScript to bypass simple webdriver detection
    context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    return browser, context

def detect_captcha(page):
    """
    Detect CAPTCHA types and extract their sitekeys from the current page.
    Returns a dict: {'type': 'recaptcha'|'hcaptcha'|'turnstile', 'sitekey': '...'} or None.
    """
    # 1. Look for reCAPTCHA v2/v3
    recaptcha_el = page.locator(".g-recaptcha, [data-sitekey]").first
    if recaptcha_el.count() > 0:
        sitekey = recaptcha_el.get_attribute("data-sitekey")
        # Ensure it's Google Recaptcha, not hCaptcha
        class_attr = recaptcha_el.get_attribute("class") or ""
        if "h-captcha" not in class_attr and sitekey:
            return {"type": "recaptcha", "sitekey": sitekey}

    # 2. Look for hCaptcha
    hcaptcha_el = page.locator(".h-captcha").first
    if hcaptcha_el.count() > 0:
        sitekey = hcaptcha_el.get_attribute("data-sitekey")
        if sitekey:
            return {"type": "hcaptcha", "sitekey": sitekey}
            
    # 3. Look for Cloudflare Turnstile
    turnstile_el = page.locator(".cf-turnstile").first
    if turnstile_el.count() > 0:
        sitekey = turnstile_el.get_attribute("data-sitekey")
        if sitekey:
            return {"type": "turnstile", "sitekey": sitekey}
            
    # 4. Check iframe sources for sitekeys
    iframes = page.frames
    for frame in iframes:
        url = frame.url
        if "google.com/recaptcha" in url:
            match = re.search(r"k=([^&]+)", url)
            if match:
                return {"type": "recaptcha", "sitekey": match.group(1)}
        elif "hcaptcha.com" in url:
            match = re.search(r"sitekey=([^&]+)", url)
            if match:
                return {"type": "hcaptcha", "sitekey": match.group(1)}
                
    return None

def inject_captcha_token(page, captcha_type, token):
    """Inject the solved CAPTCHA token into the page inputs"""
    if captcha_type == "recaptcha":
        # Google Recaptcha uses g-recaptcha-response
        page.evaluate(f'document.getElementById("g-recaptcha-response").innerHTML="{token}";')
    elif captcha_type == "hcaptcha":
        # hCaptcha uses h-captcha-response and g-recaptcha-response
        page.evaluate(f'document.getElementsByName("h-captcha-response")[0].innerHTML="{token}";')
        page.evaluate(f'document.getElementsByName("g-recaptcha-response")[0].innerHTML="{token}";')
    elif captcha_type == "turnstile":
        # Cloudflare Turnstile uses cf-turnstile-response
        page.evaluate(f'document.getElementsByName("cf-turnstile-response")[0].value="{token}";')
        
    print(f"Injected token for {captcha_type} successfully.")

def xenforo_register(page, register_url, username, password, email, captcha_api_key=None):
    """
    Automated registration on XenForo forums
    """
    print(f"Navigating to registration page: {register_url}")
    page.goto(register_url)
    page.wait_for_load_state("networkidle")
    
    # Fill standard fields
    # Note: field selectors can vary slightly, so we try multiple common selectors
    username_selectors = ["input[name='username']", "input[id='ctrl_username']", "#username"]
    email_selectors = ["input[name='email']", "input[id='ctrl_email']", "#email"]
    password_selectors = ["input[name='password']", "input[id='ctrl_password']", "#password"]
    
    username_filled = False
    for sel in username_selectors:
        if page.locator(sel).first.count() > 0:
            page.fill(sel, username)
            username_filled = True
            break
            
    if not username_filled:
        print("Could not find username field!")
        return False
        
    for sel in email_selectors:
        if page.locator(sel).first.count() > 0:
            page.fill(sel, email)
            break
            
    for sel in password_selectors:
        if page.locator(sel).first.count() > 0:
            page.fill(sel, password)
            break
            
    # Agree to terms checkmark if exists
    terms_selectors = ["input[name='agree']", "input[id='ctrl_agree']", "input[type='checkbox']"]
    for sel in terms_selectors:
        checkbox = page.locator(sel).first
        if checkbox.count() > 0:
            try:
                checkbox.check()
            except Exception:
                pass

    # Detect and solve CAPTCHA
    captcha_info = detect_captcha(page)
    if captcha_info and captcha_api_key:
        print(f"Found {captcha_info['type']} with sitekey: {captcha_info['sitekey']}")
        token = None
        if captcha_info['type'] == "recaptcha":
            token = captcha_solver.solve_recaptcha_v2(captcha_api_key, register_url, captcha_info['sitekey'])
        elif captcha_info['type'] == "hcaptcha":
            token = captcha_solver.solve_hcaptcha(captcha_api_key, register_url, captcha_info['sitekey'])
        elif captcha_info['type'] == "turnstile":
            token = captcha_solver.solve_turnstile(captcha_api_key, register_url, captcha_info['sitekey'])
            
        if token:
            inject_captcha_token(page, captcha_info['type'], token)
        else:
            print("Failed to solve CAPTCHA. Cannot proceed with registration.")
            return False
    elif captcha_info:
        print("CAPTCHA detected, but no API Key provided for 2Captcha.")
        return False
        
    # Submit form
    submit_btn = page.locator("button[type='submit'], input[type='submit'], .button--primary").first
    if submit_btn.count() > 0:
        submit_btn.click()
        page.wait_for_load_state("networkidle")
        time.sleep(3)
        print("Registration form submitted. Please verify if email verification is needed.")
        return True
    else:
        print("Could not find submit button!")
        return False

def xenforo_post_thread(page, post_url, title, content):
    """
    Automated posting on XenForo forums
    """
    print(f"Navigating to thread post page: {post_url}")
    page.goto(post_url)
    page.wait_for_load_state("networkidle")
    
    # Fill Title
    title_selectors = ["input[name='title']", "#ctrl_title", "input[placeholder*='Title']"]
    title_filled = False
    for sel in title_selectors:
        if page.locator(sel).first.count() > 0:
            page.fill(sel, title)
            title_filled = True
            break
            
    if not title_filled:
        print("Could not find thread title field!")
        return False
        
    # For XenForo, the rich text editor is Froala/Redactor.
    # The easiest way to enter text is to toggle to "BB code mode" or find the hidden textarea.
    # XenForo 2 has a button: button[title*='Toggle BB code'] or class .js-bbCodeTab
    bbcode_btn = page.locator("button[title*='Toggle BB code'], button[data-cmd='xfBbCode']").first
    if bbcode_btn.count() > 0:
        try:
            bbcode_btn.click()
            time.sleep(1)
        except Exception as e:
            print(f"Failed to click BB code toggle button: {e}")
            
    # Locate body textarea (often name='message' or class .js-editor)
    body_selectors = ["textarea[name='message']", "textarea.js-editor", "#ctrl_message"]
    body_filled = False
    for sel in body_selectors:
        if page.locator(sel).first.count() > 0:
            # We can write plain BB code now, e.g.:
            # [URL='https://thongtaccongquangninh.com/']thông tắc cống tại Quảng Ninh[/URL]
            # Let's convert HTML links to BBCode links
            bbcode_content = content
            bbcode_content = re.sub(r'<a\s+[^>]*href=["\'](https?://[^"\']+)["\'][^>]*>(.*?)</a>', r"[URL='\1']\2[/URL]", bbcode_content)
            # Remove any other HTML tags
            bbcode_content = re.sub(r'<[^>]+>', '', bbcode_content)
            
            page.fill(sel, bbcode_content)
            body_filled = True
            break
            
    if not body_filled:
        # Try writing into froala editor directly if BBCode toggle didn't work
        editor = page.locator(".fr-element.fr-view").first
        if editor.count() > 0:
            editor.fill(content)
            body_filled = True
            
    if not body_filled:
        print("Could not find message editor field!")
        return False
        
    # Submit thread
    submit_btn = page.locator("button[type='submit'], .button--icon--preview + button, .button--primary").first
    if submit_btn.count() > 0:
        submit_btn.click()
        page.wait_for_load_state("networkidle")
        time.sleep(3)
        print("Thread submitted! Live URL:", page.url)
        return page.url
    else:
        print("Could not find post button!")
        return False

if __name__ == "__main__":
    if not PLAYWRIGHT_AVAILABLE:
        print("Playwright is NOT installed. Run 'pip install playwright && playwright install chromium' first.")
    else:
        print("Playwright module is successfully loaded and ready.")
