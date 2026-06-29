#!/usr/bin/env python3
"""
SEO Weekly Report — tổng hợp dữ liệu từ Search Console, GA4, PageSpeed.
Xuất Markdown vào docs/reports/weekly/YYYY-MM-DD.md.

Usage:
    python tools/seo_weekly_report.py
    python tools/seo_weekly_report.py --pagespeed-only   # chỉ chạy PSI (không cần OAuth)
    python tools/seo_weekly_report.py --no-ga4           # bỏ qua GA4
"""

import os
import sys
import argparse
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

SITE = 'https://thongtaccongquangninh.com'
REPORT_DIR = os.path.join(ROOT, 'docs', 'reports', 'weekly')
KEY_URLS = [
    SITE + '/',
    SITE + '/hut-be-phot-ha-long/',
    SITE + '/thong-tac-cong-quang-ninh/',
    SITE + '/hut-ham-cau/',
]


def section(title: str) -> str:
    return f'\n## {title}\n'


def build_report(args) -> str:
    today = date.today().isoformat()
    lines = [f'# Báo cáo SEO tuần — {today}\n']
    lines.append(f'Site: {SITE}  \n')

    # ── PageSpeed Insights ──────────────────────────────────────────────
    lines.append(section('Core Web Vitals (PageSpeed Insights)'))
    try:
        from tools.google_apis.pagespeed import check_urls
        psi_results = check_urls(KEY_URLS)
        lines.append('| URL | Strategy | Score | LCP (ms) | CLS | INP (ms) |')
        lines.append('|---|---|---|---|---|---|')
        for r in psi_results:
            if 'error' in r:
                lines.append(f"| {r['url']} | {r['strategy']} | ERROR | {r['error']} | | |")
            else:
                url_short = r['url'].replace(SITE, '')
                lines.append(
                    f"| {url_short} | {r['strategy']} | {r['performance_score']} "
                    f"| {r['lcp_ms']} | {r['cls']} | {r['inp_ms']} |"
                )
    except Exception as e:
        lines.append(f'> Lỗi PageSpeed: {e}')

    # ── Search Console ──────────────────────────────────────────────────
    if not args.pagespeed_only:
        lines.append(section('Search Console — Top 20 Queries (28 ngày)'))
        try:
            from tools.google_apis.search_console import get_top_queries, get_top_pages, get_coverage_summary
            queries = get_top_queries(days=28, row_limit=20)
            lines.append('| Query | Clicks | Impressions | CTR% | Position |')
            lines.append('|---|---|---|---|---|')
            for q in queries:
                lines.append(f"| {q['query']} | {q['clicks']} | {q['impressions']} | {q['ctr']} | {q['position']} |")

            lines.append(section('Search Console — Top 10 Pages (28 ngày)'))
            pages = get_top_pages(days=28, row_limit=10)
            lines.append('| Page | Clicks | Impressions | CTR% | Position |')
            lines.append('|---|---|---|---|---|')
            for p in pages:
                url_short = p['page'].replace(SITE, '')
                lines.append(f"| {url_short} | {p['clicks']} | {p['impressions']} | {p['ctr']} | {p['position']} |")

            lines.append(section('Search Console — Coverage'))
            cov = get_coverage_summary()
            lines.append(f"- Sitemaps: {', '.join(cov['sitemaps'])}")
            lines.append(f"- Submitted: {cov['total_submitted']}")
            lines.append(f"- Indexed: {cov['total_indexed']}")

        except Exception as e:
            lines.append(f'> Lỗi Search Console: {e}')
            lines.append('> Chạy lại để xác thực OAuth hoặc kiểm tra secrets/oauth_credentials.json')

    # ── GA4 ─────────────────────────────────────────────────────────────
    if not args.pagespeed_only and not args.no_ga4:
        lines.append(section('Google Analytics 4 — Traffic 7 ngày'))
        try:
            from tools.google_apis.ga4 import get_traffic_summary, get_top_pages as ga4_top_pages
            traffic = get_traffic_summary(days=7)
            lines.append(f"Tổng sessions: **{traffic['total_sessions']}**\n")
            lines.append('| Kênh | Sessions | Users | Conversions |')
            lines.append('|---|---|---|---|')
            for ch in traffic['channels']:
                lines.append(f"| {ch['channel']} | {ch['sessions']} | {ch['users']} | {ch['conversions']} |")

            lines.append(section('GA4 — Top Pages 7 ngày'))
            top = ga4_top_pages(days=7, limit=10)
            lines.append('| Page | Sessions | Users |')
            lines.append('|---|---|---|')
            for p in top:
                lines.append(f"| {p['page']} | {p['sessions']} | {p['users']} |")

        except Exception as e:
            lines.append(f'> Lỗi GA4: {e}')
            lines.append('> Đảm bảo GA4_PROPERTY_ID có trong .env và đã xác thực OAuth.')

    lines.append(f'\n---\n_Tạo tự động lúc {today} bởi tools/seo_weekly_report.py_')
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='SEO Weekly Report')
    parser.add_argument('--pagespeed-only', action='store_true', help='Chỉ chạy PageSpeed Insights (không cần OAuth)')
    parser.add_argument('--no-ga4', action='store_true', help='Bỏ qua GA4')
    args = parser.parse_args()

    print('[REPORT] Đang tạo báo cáo...')
    report = build_report(args)

    os.makedirs(REPORT_DIR, exist_ok=True)
    out_path = os.path.join(REPORT_DIR, f'{date.today().isoformat()}.md')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f'[REPORT] Xong: {out_path}')
    print(report[:500])


if __name__ == '__main__':
    main()
