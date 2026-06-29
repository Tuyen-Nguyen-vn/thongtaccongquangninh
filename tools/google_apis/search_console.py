"""
Google Search Console API — pull query, CTR, position, coverage.
Auth: OAuth2 (user account, scope webmasters.readonly).

Lần đầu chạy sẽ mở browser để xác thực. Token lưu tự động vào secrets/.
"""

import sys
from datetime import date, timedelta

SITE_URL = 'https://thongtaccongquangninh.com/'

try:
    from tools.google_apis.auth import get_oauth_service, SCOPES_SEARCH_CONSOLE
except ImportError:
    sys.path.insert(0, __file__.replace('\\tools\\google_apis\\search_console.py', ''))
    from tools.google_apis.auth import get_oauth_service, SCOPES_SEARCH_CONSOLE


def _service():
    return get_oauth_service('searchconsole', 'v1', SCOPES_SEARCH_CONSOLE)


def get_top_queries(days: int = 28, row_limit: int = 50) -> list[dict]:
    """
    Lấy top queries theo impressions trong N ngày gần nhất.
    Trả về list[dict]: query, clicks, impressions, ctr, position.
    """
    svc = _service()
    end   = date.today() - timedelta(days=3)   # SC lag ~3 ngày
    start = end - timedelta(days=days)

    body = {
        'startDate': start.isoformat(),
        'endDate':   end.isoformat(),
        'dimensions': ['query'],
        'rowLimit': row_limit,
        'orderBy': [{'fieldName': 'impressions', 'sortOrder': 'DESCENDING'}],
    }

    resp = svc.searchanalytics().query(siteUrl=SITE_URL, body=body).execute()
    rows = resp.get('rows', [])

    return [
        {
            'query':       r['keys'][0],
            'clicks':      r['clicks'],
            'impressions': r['impressions'],
            'ctr':         round(r['ctr'] * 100, 2),
            'position':    round(r['position'], 1),
        }
        for r in rows
    ]


def get_top_pages(days: int = 28, row_limit: int = 30) -> list[dict]:
    """Lấy top pages theo clicks."""
    svc = _service()
    end   = date.today() - timedelta(days=3)
    start = end - timedelta(days=days)

    body = {
        'startDate': start.isoformat(),
        'endDate':   end.isoformat(),
        'dimensions': ['page'],
        'rowLimit': row_limit,
        'orderBy': [{'fieldName': 'clicks', 'sortOrder': 'DESCENDING'}],
    }

    resp = svc.searchanalytics().query(siteUrl=SITE_URL, body=body).execute()
    rows = resp.get('rows', [])

    return [
        {
            'page':        r['keys'][0],
            'clicks':      r['clicks'],
            'impressions': r['impressions'],
            'ctr':         round(r['ctr'] * 100, 2),
            'position':    round(r['position'], 1),
        }
        for r in rows
    ]


def get_coverage_summary() -> dict:
    """Lấy tổng số URL indexed / not indexed từ Index Coverage."""
    svc = _service()
    resp = svc.urlInspection()  # không có batch summary — dùng sitemaps thay
    # Lấy danh sách sitemap đã submit
    sm = svc.sitemaps().list(siteUrl=SITE_URL).execute()
    sitemaps = sm.get('sitemap', [])

    total_submitted = sum(int(s.get('contents', [{}])[0].get('submitted', 0) or 0) for s in sitemaps if s.get('contents'))
    total_indexed   = sum(int(s.get('contents', [{}])[0].get('indexed', 0)    or 0) for s in sitemaps if s.get('contents'))

    return {
        'sitemaps': [s.get('path') for s in sitemaps],
        'total_submitted': total_submitted,
        'total_indexed': total_indexed,
    }
