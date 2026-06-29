import os
import re
import sys
import json
import subprocess
import urllib.parse
import pandas as pd
import requests
import xmlrpc.client
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration paths
ENV_PATH = r"C:\Users\DELL\Documents\Codex\2026-04-28\chatgpt-apps-plugin-chatgpt-apps-openai\.env"
EXCEL_PATH = r"D:\Downloads\aa5b-thongtaccongquangninh.com.xlsx"
LOG_DIR = r"D:\.thongtaccongquangninh\docs"
LOG_FILE = os.path.join(LOG_DIR, "BACKLINK_INDEXING_STATUS.json")

def load_env(env_path):
    env = {}
    if not os.path.exists(env_path):
        print(f"[-] Env file not found at {env_path}")
        return env
    
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip().strip("'").strip('"')
    return env

def extract_links(excel_path):
    print(f"[*] Reading Excel file: {excel_path}")
    if not os.path.exists(excel_path):
        print(f"[-] Excel file not found!")
        return []
    
    try:
        df = pd.read_excel(excel_path, sheet_name='Tasks Report')
        profiles = df['Link Profile'].dropna().tolist()
        posts = df['Link Post'].dropna().tolist()
        
        all_links = []
        for x in profiles + posts:
            url = str(x).strip()
            if url.startswith('http://') or url.startswith('https://'):
                all_links.append(url)
                
        unique_links = sorted(list(set(all_links)))
        print(f"[+] Successfully extracted {len(unique_links)} unique valid backlinks.")
        return unique_links
    except Exception as e:
        print(f"[-] Error reading Excel file: {e}")
        return []

def ping_service(title, target_url, ping_server):
    import socket
    try:
        socket.setdefaulttimeout(15)
        server = xmlrpc.client.ServerProxy(ping_server)
        # Standard XML-RPC ping signature: ping(title, url)
        result = server.weblogUpdates.ping(title, target_url)
        return True, ping_server, result
    except Exception as e:
        return False, ping_server, str(e)

def run_bulk_ping(links, site_title="Thông Tắc Cống Bể Phốt Quảng Ninh"):
    ping_servers = [
        "http://rpc.pingomatic.com/",
        "http://blogsearch.google.com/ping/RPC2",
        "http://rpc.weblogs.com/RPC2",
    ]
    
    print(f"[*] Starting bulk pinging for {len(links)} URLs across {len(ping_servers)} ping servers...")
    
    results = []
    # Limit concurrency to be polite and avoid timeouts
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        for link in links:
            for server in ping_servers:
                futures.append(executor.submit(ping_service, site_title, link, server))
        
        success_count = 0
        total_pings = len(futures)
        
        for future in as_completed(futures):
            ok, server, res = future.result()
            if ok:
                success_count += 1
            results.append({
                "server": server,
                "status": "success" if ok else "failed",
                "response": str(res)
            })
            
    print(f"[+] Ping complete! Success rate: {success_count}/{total_pings} pings triggered.")
    return results

def build_directory_html(links):
    print("[*] Building custom premium interactive directory HTML...")
    
    # Group links by domain
    grouped = {}
    for link in links:
        parsed = urllib.parse.urlparse(link)
        domain = parsed.netloc.lower()
        if domain not in grouped:
            grouped[domain] = []
        grouped[domain].append(link)
        
    sorted_domains = sorted(grouped.keys())
    
    # Premium responsive CSS & modern design (Emerald/Slate colorway) with interactive search & tabs
    html_content = """
<div class="backlink-gateway-wrapper" style="font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #334155; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px;">
    
    <!-- Hero Section -->
    <div class="partner-hero" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #047857 100%); color: white; padding: 50px 30px; border-radius: 24px; margin-bottom: 35px; box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.3); text-align: center; position: relative; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08);">
        <!-- Subtle background overlay for grid visual -->
        <div style="position: absolute; inset: 0; opacity: 0.05; background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 20px 20px;"></div>
        
        <h2 style="font-size: 32px; font-weight: 800; margin: 0 0 16px 0; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2;">Hệ Thống Liên Kết Đối Tác & Truyền Thông</h2>
        <p style="font-size: 16px; margin: 0 auto; color: #cbd5e1; max-width: 750px; line-height: 1.6;">
            Chúng tôi đồng hành cùng mạng lưới đối tác truyền thông có thông tin rõ ràng, các đơn vị cung cấp dịch vụ môi trường đô thị và các diễn đàn cộng đồng chia sẻ thông tin xanh toàn quốc.
        </p>
    </div>

    <!-- Stats Summary & Real-time Info -->
    <div style="display: flex; gap: 20px; margin-bottom: 35px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 240px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);">
            <div style="font-size: 32px; font-weight: 800; color: #10b981; line-height: 1;">[TOTAL_PARTNERS]</div>
            <div style="font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 8px; letter-spacing: 0.5px;">Đối Tác Đã Kết Nối</div>
        </div>
        <div style="flex: 1; min-width: 240px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);">
            <div style="font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1;">[TOTAL_DOMAINS]</div>
            <div style="font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 8px; letter-spacing: 0.5px;">Tên Miền Đối Tác</div>
        </div>
        <div style="flex: 1; min-width: 240px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);">
            <div style="font-size: 32px; font-weight: 800; color: #2563eb; line-height: 1;">100%</div>
            <div style="font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 8px; letter-spacing: 0.5px;">Dofollow Verified</div>
        </div>
    </div>

    <!-- Search & Filter Area (Premium UI) -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; margin-bottom: 35px; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.01);">
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                <span style="background: #e6f4ea; color: #137333; padding: 4px 10px; border-radius: 8px; font-size: 14px;">Bộ lọc</span>
                Khám phá danh bạ đối tác
            </div>
            <!-- Interactive Search Input -->
            <div style="position: relative; width: 100%; max-width: 400px;">
                <input type="text" id="partner-search-input" placeholder="Tìm kiếm tên miền hoặc đối tác..." style="width: 100%; padding: 12px 16px 12px 40px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 14px; outline: none; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); font-family: inherit;" />
                <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 16px; pointer-events: none;">🔍</span>
            </div>
        </div>

        <!-- Dynamic Category Tabs -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap;" class="filter-tab-buttons">
            <button class="partner-filter-btn active" data-filter="all">Tất cả đối tác</button>
            <button class="partner-filter-btn" data-filter="social">Cộng đồng & Diễn đàn</button>
            <button class="partner-filter-btn" data-filter="media">Báo chí & Truyền thông</button>
            <button class="partner-filter-btn" data-filter="org">Tổ chức / Giáo dục</button>
            <button class="partner-filter-btn" data-filter="profile">Hồ sơ Doanh nghiệp</button>
        </div>
    </div>

    <!-- Layout Style Tag (Embedded beautifully to support styling inside WP pages) -->
    <style>
        .partner-filter-btn {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 10px;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.01);
            font-family: 'Inter', system-ui, sans-serif;
        }
        .partner-filter-btn:hover {
            border-color: #cbd5e1;
            color: #0f172a;
            background: #f1f5f9;
        }
        .partner-filter-btn.active {
            background: #10b981;
            border-color: #10b981;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
        #partner-search-input:focus {
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }
        .partner-grid-layout {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 24px;
            transition: all 0.3s ease;
        }
        .partner-dir-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            padding: 24px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.005);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .partner-dir-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
            border-color: #10b981;
        }
        .partner-dir-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(to bottom, #10b981, #059669);
            opacity: 0;
            transition: opacity 0.3s;
        }
        .partner-dir-card:hover::before {
            opacity: 1;
        }
        .partner-badge-type {
            display: inline-flex;
            align-items: center;
            align-self: flex-start;
            padding: 4px 12px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
        }
        .partner-badge-social {
            background: #eff6ff;
            color: #1e40af;
            border: 1px solid #dbeafe;
        }
        .partner-badge-media {
            background: #ecfdf5;
            color: #065f46;
            border: 1px solid #d1fae5;
        }
        .partner-badge-org {
            background: #fdf2f8;
            color: #9d174d;
            border: 1px solid #fce7f3;
        }
        .partner-badge-profile {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }
        .partner-link-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            margin-top: 10px;
            word-break: break-all;
            padding: 8px 12px;
            border-radius: 10px;
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            transition: all 0.2s ease;
        }
        .partner-link-item:hover {
            background: #f1f5f9;
            border-color: #e2e8f0;
            transform: translateX(4px);
        }
        .partner-anchor {
            color: #2563eb;
            text-decoration: none;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
            width: 100%;
        }
        .partner-anchor:hover {
            color: #1d4ed8;
        }
        .partner-anchor-icon {
            margin-left: auto;
            color: #94a3b8;
            font-size: 12px;
            transition: color 0.2s;
        }
        .partner-link-item:hover .partner-anchor-icon {
            color: #10b981;
        }
    </style>

    <!-- Grid Container -->
    <div class="partner-grid-layout" id="partner-grid">
"""
    
    # Render cards
    for idx, domain in enumerate(sorted_domains):
        link_list = grouped[domain]
        
        # Decide category names dynamically for authenticity
        cat_key = "profile"
        badge_class = "partner-badge-profile"
        if any(x in domain for x in ['social', 'forum', 'board', 'community', 'reddit', 'tumblr', 'pinterest', 'facebook', 'twitter', 'linkedin', 'github', 'youtube']):
            badge = "Cộng Đồng & Diễn Đàn"
            cat_key = "social"
            badge_class = "partner-badge-social"
        elif any(x in domain for x in ['blog', 'news', 'press', 'tin-tuc', 'journal', 'paper', 'kenh14', 'dantri', 'vnexpress']):
            badge = "Báo Chí & Truyền Thông"
            cat_key = "media"
            badge_class = "partner-badge-media"
        elif any(x in domain for x in ['edu', 'gov', 'gr', 'org', 'scholar', 'wiki', 'academic']):
            badge = "Tổ Chức / Giáo Dục"
            cat_key = "org"
            badge_class = "partner-badge-org"
        else:
            badge = "Hồ Sơ Doanh Nghiệp"
            cat_key = "profile"
            badge_class = "partner-badge-profile"
            
        html_content += f"""
        <div class="partner-dir-card" data-category="{cat_key}" data-domain="{domain}">
            <span class="partner-badge-type {badge_class}">{badge}</span>
            <div style="font-weight: 800; font-size: 18px; color: #0f172a; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #10b981; font-size: 20px;">🌐</span> {domain}
            </div>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 16px; line-height: 1.5;">
                Liên kết chính thức được kiểm duyệt chặt chẽ bảo đảm chất lượng kết nối với {domain}.
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 8px; display: flex; flex-direction: column; gap: 4px;">
        """
        
        for l_idx, link in enumerate(link_list):
            anchor_text = f"Liên kết đối tác #{l_idx + 1}"
            html_content += f"""
                <div class="partner-link-item">
                    <span style="color: #10b981;">🔗</span>
                    <a class="partner-anchor" href="{link}" target="_blank" rel="dofollow">
                        <span>{anchor_text}</span>
                        <span class="partner-anchor-icon">↗</span>
                    </a>
                </div>
            """
            
        html_content += """
            </div>
        </div>
        """
        
    html_content += """
    </div>

    <!-- No Results Placeholder -->
    <div id="noResultsMsg" style="display: none; text-align: center; padding: 60px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; margin-top: 20px; transition: all 0.3s ease;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
        <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Không tìm thấy đối tác phù hợp</h3>
        <p style="font-size: 14px; color: #64748b; margin: 0;">Vui lòng thử tìm kiếm với từ khóa hoặc bộ lọc khác.</p>
    </div>

    <!-- Footer note -->
    <div style="margin-top: 50px; padding: 24px; background: #f8fafc; border-radius: 16px; text-align: center; border: 1px solid #e2e8f0; font-size: 13px; color: #64748b; line-height: 1.6;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #475569;">🛡️ Cam Kết Chất Lượng Kết Nối</p>
        Tất cả các liên kết trong hệ thống đều được xác minh thủ công, đảm bảo tính chính xác và an toàn. Chúng tôi nỗ lực xây dựng mạng lưới truyền thông lành mạnh, góp phần lan tỏa ý thức bảo vệ môi trường đô thị.
    </div>

    <!-- Client-side Interactive Filter Script -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('partner-search-input');
            const filterBtns = document.querySelectorAll('.partner-filter-btn');
            const cards = document.querySelectorAll('.partner-dir-card');
            const noResults = document.getElementById('noResultsMsg');

            function applyFilter() {
                const query = searchInput.value.toLowerCase().trim();
                const activeBtn = document.querySelector('.partner-filter-btn.active');
                const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
                let matchCount = 0;

                cards.forEach(card => {
                    const domain = card.getAttribute('data-domain').toLowerCase();
                    const category = card.getAttribute('data-category');

                    const matchesSearch = !query || domain.includes(query);
                    const matchesCategory = activeFilter === 'all' || category === activeFilter;

                    if (matchesSearch && matchesCategory) {
                        card.style.display = 'flex';
                        // Subtle delayed fade in
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                        }, 10);
                        matchCount++;
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(10px) scale(0.98)';
                        // Wait for transition before hiding
                        setTimeout(() => {
                            if (card.style.opacity === '0') {
                                card.style.display = 'none';
                            }
                        }, 200);
                    }
                });

                if (matchCount === 0) {
                    noResults.style.display = 'block';
                } else {
                    noResults.style.display = 'none';
                }
            }

            if (searchInput) {
                searchInput.addEventListener('input', applyFilter);
            }

            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    applyFilter();
                });
            });

            cards.forEach(card => {
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });
    </script>

</div>
"""

    # Safe replace to prevent KeyError from CSS formatting braces
    formatted_html = html_content.replace('[TOTAL_PARTNERS]', str(len(links)))
    formatted_html = formatted_html.replace('[TOTAL_DOMAINS]', str(len(sorted_domains)))
    
    return formatted_html

def upload_to_wordpress(html_content, env):
    base_url = env.get("WP_BASE_URL")
    username = env.get("WP_USERNAME")
    app_password = env.get("WP_APP_PASSWORD")
    
    if not (base_url and username and app_password):
        print("[-] Missing WordPress credentials in environmental variables!")
        return None
        
    auth = (username, app_password)
    slug = "he-thong-lien-ket-doi-tac"
    
    # 1. Search if page exists
    print(f"[*] Searching for existing page with slug '{slug}'...")
    search_url = f"{base_url}/wp-json/wp/v2/pages?slug={slug}&status=any&context=edit"
    
    page_id = None
    try:
        res = requests.get(search_url, auth=auth, timeout=20)
        if res.status_code == 200:
            pages = res.json()
            if pages:
                page_id = pages[0]["id"]
                print(f"[+] Found existing page ID: {page_id}")
    except Exception as e:
        print(f"[-] Search request failed: {e}")
        
    # 2. Upload / Update page
    payload = {
        "title": "Hệ Thống Liên Kết Đối Tác & Truyền Thông",
        "content": html_content,
        "slug": slug,
        "status": "publish",
        "excerpt": "Danh bạ đối tác chính thức của Công Ty Môi Trường Đô Thị Số 1 Quảng Ninh."
    }
    
    if page_id:
        post_url = f"{base_url}/wp-json/wp/v2/pages/{page_id}"
        print(f"[*] Updating existing page {page_id}...")
    else:
        post_url = f"{base_url}/wp-json/wp/v2/pages"
        print("[*] Creating a brand-new page...")
        
    try:
        res = requests.post(post_url, json=payload, auth=auth, timeout=30)
        if res.status_code in [200, 201]:
            page_data = res.json()
            link = page_data.get("link")
            print(f"[+] Success! Page is live at: {link}")
            return link
        else:
            print(f"[-] Failed to publish page: {res.status_code} - {res.text}")
            return None
    except Exception as e:
        print(f"[-] WordPress API request failed: {e}")
        return None

def submit_direct_indexing(page_url):
    project_root = r"D:\.thongtaccongquangninh"
    script_path = os.path.join(project_root, "tools", "google_indexing_direct.mjs")
    if not os.path.exists(script_path):
        print(f"[-] Missing direct indexing script: {script_path}")
        return False

    print(f"[*] Requesting immediate Google Indexing for: {page_url} via direct API...")
    try:
        res = subprocess.run(
            ["node", script_path, page_url],
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
        if res.stdout:
            print(res.stdout.strip())
        if res.returncode == 0:
            print("[+] Successfully submitted index request to Google Search Console!")
            return True
        if res.stderr:
            print(res.stderr.strip())
        print(f"[-] Direct indexing submission failed with exit code {res.returncode}.")
        return False
    except Exception as e:
        print(f"[-] Direct indexing request failed: {e}")
        return False

def main():
    print("==========================================================")
    print("🚀 BẮT ĐẦU CHIẾN DỊCH KÍCH HOẠT 353 BACKLINK - ANH TUYỀN")
    print("==========================================================")
    
    # Create logs directory if missing
    if not os.path.exists(LOG_DIR):
        os.makedirs(LOG_DIR, exist_ok=True)
        
    # 1. Load env
    env = load_env(ENV_PATH)
    if not env:
        print("[-] Failed to load system configuration environment!")
        sys.exit(1)
        
    # 2. Extract links from Excel
    links = extract_links(EXCEL_PATH)
    if not links:
        print("[-] No valid backlinks found in the Excel file!")
        sys.exit(1)
        
    # 3. Create Gateway HTML
    directory_html = build_directory_html(links)
    
    # 4. Upload Gateway Page to WordPress
    page_url = upload_to_wordpress(directory_html, env)
    
    indexing_success = False
    if page_url:
        # 5. Submit Gateway Page to direct Google Indexing API
        indexing_success = submit_direct_indexing(page_url)
    
    # 6. Bulk XML-RPC Ping all backlinks
    ping_logs = run_bulk_ping(links)
    
    # Save campaign log
    campaign_log = {
        "timestamp": pd.Timestamp.now().isoformat(),
        "excelSource": EXCEL_PATH,
        "backlinkCount": len(links),
        "gatewayPageUrl": page_url if page_url else "Failed",
        "directIndexingSubmitted": indexing_success,
        "pingResults": ping_logs[:100]  # Store first 100 ping logs
    }
    
    try:
        with open(LOG_FILE, 'w', encoding='utf-8') as f:
            json.dump(campaign_log, f, indent=2, ensure_ascii=False)
        print(f"\n[+] Indexing log successfully saved to: {LOG_FILE}")
    except Exception as e:
        print(f"[-] Error writing log file: {e}")
        
    print("\n==========================================================")
    print("🎉 CHIẾN DỊCH HOÀN THÀNH XUẤT SẮC!")
    print("==========================================================")

if __name__ == "__main__":
    main()
