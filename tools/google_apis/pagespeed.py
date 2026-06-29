"""
PageSpeed Insights API — đo Core Web Vitals.
Auth: API key (không cần OAuth).
Quota: 25.000 req/ngày miễn phí.

Đặt API key vào .env:
    PAGESPEED_API_KEY=AIza...
"""

import os
import sys
import json
import urllib.request
import urllib.parse


API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'


def _load_api_key() -> str:
    env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
    if os.path.exists(env_path):
        for line in open(env_path, encoding='utf-8'):
            m = line.strip()
            if m.startswith('PAGESPEED_API_KEY='):
                return m.split('=', 1)[1].strip().strip('"\'')
    key = os.environ.get('PAGESPEED_API_KEY', '')
    if not key:
        sys.exit('Thiếu PAGESPEED_API_KEY trong .env. Xem docs/google-apis-setup.md.')
    return key


def run_pagespeed(url: str, strategy: str = 'mobile') -> dict:
    """
    Gọi PageSpeed Insights cho 1 URL.
    strategy: 'mobile' hoặc 'desktop'
    Trả về dict với các chỉ số CWV.
    """
    key = _load_api_key()
    params = urllib.parse.urlencode({'url': url, 'key': key, 'strategy': strategy})
    req_url = f'{API_URL}?{params}'

    try:
        with urllib.request.urlopen(req_url, timeout=30) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        return {'url': url, 'strategy': strategy, 'error': str(e)}

    cats = data.get('lighthouseResult', {}).get('categories', {})
    audits = data.get('lighthouseResult', {}).get('audits', {})

    return {
        'url': url,
        'strategy': strategy,
        'performance_score': round((cats.get('performance', {}).get('score', 0) or 0) * 100),
        'lcp_ms': _metric(audits, 'largest-contentful-paint'),
        'cls': _metric(audits, 'cumulative-layout-shift'),
        'inp_ms': _metric(audits, 'interaction-to-next-paint'),
        'fcp_ms': _metric(audits, 'first-contentful-paint'),
        'tbt_ms': _metric(audits, 'total-blocking-time'),
        'si_ms': _metric(audits, 'speed-index'),
    }


def _metric(audits: dict, key: str):
    audit = audits.get(key, {})
    num = audit.get('numericValue')
    return round(num, 2) if num is not None else None


def check_urls(urls: list[str]) -> list[dict]:
    """Kiểm tra danh sách URLs — trả về cả mobile + desktop."""
    results = []
    for url in urls:
        print(f'  [PSI] {url} ...')
        for strategy in ('mobile', 'desktop'):
            results.append(run_pagespeed(url, strategy))
    return results
