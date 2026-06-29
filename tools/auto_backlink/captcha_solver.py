import time
import urllib.request
import urllib.parse
import json

def _make_request(url, data=None):
    """Helper method to send HTTP requests using standard urllib (dependency-free)"""
    try:
        if data:
            encoded_data = urllib.parse.urlencode(data).encode("utf-8")
            req = urllib.request.Request(url, data=encoded_data)
        else:
            req = urllib.request.Request(url)
            
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read().decode("utf-8")
    except Exception as e:
        print(f"[Captcha Solver Error] Request failed: {e}")
        return None

def poll_for_result(api_key, task_id, retries=24, delay=5):
    """Poll 2captcha res.php API until the CAPTCHA is solved or fails"""
    poll_url = f"https://2captcha.com/res.php?key={api_key}&action=get&id={task_id}&json=1"
    
    print(f"Waiting for CAPTCHA {task_id} to be solved...")
    for i in range(retries):
        time.sleep(delay)
        response_text = _make_request(poll_url)
        if not response_text:
            continue
            
        try:
            res = json.loads(response_text)
            if res.get("status") == 1:
                print("CAPTCHA solved successfully!")
                return res.get("request")
            elif res.get("request") == "CAPCHA_NOT_READY":
                # Still working on it
                continue
            else:
                print(f"2Captcha returned error: {res.get('request')}")
                return None
        except Exception as e:
            print(f"Error parsing 2captcha response: {e}")
            
    print("CAPTCHA solving timed out.")
    return None

def solve_image_captcha(api_key, image_base64):
    """Solve standard image CAPTCHA using Base64 string"""
    if not api_key:
        print("API Key for 2Captcha is empty.")
        return None
        
    url = "https://2captcha.com/in.php"
    data = {
        "key": api_key,
        "method": "base64",
        "body": image_base64,
        "json": 1
    }
    
    response_text = _make_request(url, data)
    if not response_text:
        return None
        
    try:
        res = json.loads(response_text)
        if res.get("status") == 1:
            task_id = res.get("request")
            return poll_for_result(api_key, task_id)
        else:
            print(f"Failed to submit image CAPTCHA: {res.get('request')}")
            return None
    except Exception as e:
        print(f"Error submitting image CAPTCHA: {e}")
        return None

def solve_recaptcha_v2(api_key, page_url, site_key):
    """Solve Google reCAPTCHA v2 and return token"""
    if not api_key:
        print("API Key for 2Captcha is empty.")
        return None
        
    url = "https://2captcha.com/in.php"
    data = {
        "key": api_key,
        "method": "userrecaptcha",
        "googlekey": site_key,
        "pageurl": page_url,
        "json": 1
    }
    
    response_text = _make_request(url, data)
    if not response_text:
        return None
        
    try:
        res = json.loads(response_text)
        if res.get("status") == 1:
            task_id = res.get("request")
            return poll_for_result(api_key, task_id, retries=30, delay=5)
        else:
            print(f"Failed to submit reCAPTCHA v2: {res.get('request')}")
            return None
    except Exception as e:
        print(f"Error submitting reCAPTCHA v2: {e}")
        return None

def solve_hcaptcha(api_key, page_url, site_key):
    """Solve hCaptcha and return token"""
    if not api_key:
        print("API Key for 2Captcha is empty.")
        return None
        
    url = "https://2captcha.com/in.php"
    data = {
        "key": api_key,
        "method": "hcaptcha",
        "sitekey": site_key,
        "pageurl": page_url,
        "json": 1
    }
    
    response_text = _make_request(url, data)
    if not response_text:
        return None
        
    try:
        res = json.loads(response_text)
        if res.get("status") == 1:
            task_id = res.get("request")
            return poll_for_result(api_key, task_id, retries=30, delay=5)
        else:
            print(f"Failed to submit hCaptcha: {res.get('request')}")
            return None
    except Exception as e:
        print(f"Error submitting hCaptcha: {e}")
        return None

def solve_turnstile(api_key, page_url, site_key):
    """Solve Cloudflare Turnstile and return token"""
    if not api_key:
        print("API Key for 2Captcha is empty.")
        return None
        
    url = "https://2captcha.com/in.php"
    data = {
        "key": api_key,
        "method": "turnstile",
        "sitekey": site_key,
        "pageurl": page_url,
        "json": 1
    }
    
    response_text = _make_request(url, data)
    if not response_text:
        return None
        
    try:
        res = json.loads(response_text)
        if res.get("status") == 1:
            task_id = res.get("request")
            return poll_for_result(api_key, task_id, retries=30, delay=5)
        else:
            print(f"Failed to submit Turnstile: {res.get('request')}")
            return None
    except Exception as e:
        print(f"Error submitting Turnstile: {e}")
        return None

if __name__ == "__main__":
    # Small self-test block
    print("Captcha solver module loaded.")
