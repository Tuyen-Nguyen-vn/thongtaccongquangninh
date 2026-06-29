"""Submit news-sitemap.xml to GSC using service account."""
import json, sys
from google.oauth2 import service_account
from googleapiclient.discovery import build

SA_FILE = r'D:\.thongtaccongquangninh\secrets\indexing_service_account.json'
SITE_URL = 'https://thongtaccongquangninh.com/'
SITEMAP_URL = 'https://thongtaccongquangninh.com/news-sitemap.xml'

SCOPES = ['https://www.googleapis.com/auth/webmasters']

creds = service_account.Credentials.from_service_account_file(SA_FILE, scopes=SCOPES)
svc = build('searchconsole', 'v1', credentials=creds)

# List existing sitemaps
try:
    result = svc.sitemaps().list(siteUrl=SITE_URL).execute()
    print("Sitemaps hiện có:")
    for s in result.get('sitemap', []):
        print(f"  - {s['path']} | errors:{s.get('errors',0)} | lastDownloaded:{s.get('lastDownloaded','?')}")
except Exception as e:
    print("List error (service account có thể chưa được add vào GSC property):", e)

# Submit news sitemap
try:
    svc.sitemaps().submit(siteUrl=SITE_URL, feedpath=SITEMAP_URL).execute()
    print(f"\n✓ Submitted {SITEMAP_URL}")
except Exception as e:
    print(f"\nSubmit error: {e}")
    print("\nService account cần được thêm vào Google Search Console property.")
    print("SA email:", json.load(open(SA_FILE)).get('client_email'))
