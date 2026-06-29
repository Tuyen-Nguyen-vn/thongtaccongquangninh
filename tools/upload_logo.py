import base64
import json
import re
import urllib.request
from pathlib import Path

DEFAULT_ENV_PATH = Path('C:/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env')
BASE_URL = 'https://thongtaccongquangninh.com'
LOGO_PATH = Path('D:\\.thongtaccongquangninh\\reports\\logo-cong-ty-small.webp')

def parse_env(path: Path):
    env = {}
    if path.exists():
        for line in path.read_text(encoding='utf-8').splitlines():
            m = re.match(r'^\s*([^#=\s]+)\s*=\s*(.*)\s*$', line)
            if m: env[m.group(1)] = m.group(2).strip().strip('"\'')
    return env

env = parse_env(DEFAULT_ENV_PATH)
base_url = (env.get('WP_BASE_URL') or BASE_URL).rstrip('/')
auth = 'Basic ' + base64.b64encode(f"{env['WP_USERNAME']}:{env['WP_APP_PASSWORD']}".encode()).decode()

def request(url, method='GET', body=None, headers=None):
    h = {'User-Agent': 'Codex SEO Content Fixer'}
    if headers: h.update(headers)
    req = urllib.request.Request(url, data=body, method=method, headers=h)
    with urllib.request.urlopen(req, timeout=90) as res:
        return json.loads(res.read().decode('utf-8-sig') or '{}')

print('Uploading new logo to WP Media Library...')
logo_data = LOGO_PATH.read_bytes()
media = request(
    f'{base_url}/wp-json/wp/v2/media',
    method='POST',
    body=logo_data,
    headers={
        'Authorization': auth,
        'Content-Type': 'image/webp',
        'Content-Disposition': 'attachment; filename="logo-cong-ty-small.webp"'
    }
)
new_logo_url = media['source_url']
print(f'Uploaded! New logo URL: {new_logo_url}')

print('Scanning all posts/pages to replace old logo in content...')
fixed = 0
for type_name in ('pages', 'posts'):
    page = 1
    while True:
        items = request(f'{base_url}/wp-json/wp/v2/{type_name}?status=publish,draft&context=edit&per_page=100&page={page}', headers={'Authorization': auth})
        if not items: break
        for item in items:
            content = item.get('content', {}).get('raw') or item.get('content', {}).get('rendered') or ''
            if 'logo-cong-ty.png' in content:
                new_content = re.sub(r'https?://[^"\'\s]+/logo-cong-ty\.png', new_logo_url, content)
                request(
                    f'{base_url}/wp-json/wp/v2/{type_name}/{item["id"]}',
                    method='POST',
                    body=json.dumps({'content': new_content}).encode('utf-8'),
                    headers={'Authorization': auth, 'Content-Type': 'application/json'}
                )
                fixed += 1
                print(f' - Replaced logo in {item["type"]} {item["id"]}')
        if len(items) < 100: break
        page += 1

print(f'Done! Replaced logo in {fixed} posts/pages.')
