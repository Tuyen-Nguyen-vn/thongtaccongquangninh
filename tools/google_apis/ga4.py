"""
Google Analytics 4 Data API — pull traffic, sessions, conversions.
Auth: OAuth2 hoặc Service Account.
Package: google-analytics-data (pip install google-analytics-data)

Đặt GA4 Property ID vào .env:
    GA4_PROPERTY_ID=123456789
"""

import os
import sys
from datetime import date, timedelta

try:
    from tools.google_apis.auth import get_oauth_creds, SCOPES_GA4
except ImportError:
    sys.path.insert(0, __file__.replace('\\tools\\google_apis\\ga4.py', ''))
    from tools.google_apis.auth import get_oauth_creds, SCOPES_GA4


def _property_id() -> str:
    env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
    if os.path.exists(env_path):
        for line in open(env_path, encoding='utf-8'):
            m = line.strip()
            if m.startswith('GA4_PROPERTY_ID='):
                return m.split('=', 1)[1].strip().strip('"\'')
    pid = os.environ.get('GA4_PROPERTY_ID', '')
    if not pid:
        sys.exit('Thiếu GA4_PROPERTY_ID trong .env. Xem docs/google-apis-setup.md.')
    return pid


def _client():
    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
    except ImportError:
        sys.exit('Cài đặt: pip install google-analytics-data')
    creds = get_oauth_creds(SCOPES_GA4)
    return BetaAnalyticsDataClient(credentials=creds)


def get_traffic_summary(days: int = 7) -> dict:
    """
    Tổng traffic 7 ngày gần nhất theo kênh (organic, direct, referral...).
    Trả về dict: tổng sessions, users, breakdown by channel.
    """
    from google.analytics.data_v1beta.types import (
        RunReportRequest, DateRange, Dimension, Metric
    )
    client = _client()
    prop   = f'properties/{_property_id()}'
    end    = date.today() - timedelta(days=1)
    start  = end - timedelta(days=days - 1)

    req = RunReportRequest(
        property=prop,
        date_ranges=[DateRange(start_date=start.isoformat(), end_date=end.isoformat())],
        dimensions=[Dimension(name='sessionDefaultChannelGroup')],
        metrics=[
            Metric(name='sessions'),
            Metric(name='activeUsers'),
            Metric(name='conversions'),
        ],
    )
    resp = client.run_report(req)

    channels = []
    total_sessions = 0
    for row in resp.rows:
        s = int(row.metric_values[0].value)
        total_sessions += s
        channels.append({
            'channel':     row.dimension_values[0].value,
            'sessions':    s,
            'users':       int(row.metric_values[1].value),
            'conversions': int(row.metric_values[2].value),
        })
    channels.sort(key=lambda x: x['sessions'], reverse=True)
    return {'total_sessions': total_sessions, 'channels': channels, 'days': days}


def get_top_pages(days: int = 7, limit: int = 20) -> list[dict]:
    """Top pages theo sessions."""
    from google.analytics.data_v1beta.types import (
        RunReportRequest, DateRange, Dimension, Metric, OrderBy
    )
    client = _client()
    prop   = f'properties/{_property_id()}'
    end    = date.today() - timedelta(days=1)
    start  = end - timedelta(days=days - 1)

    req = RunReportRequest(
        property=prop,
        date_ranges=[DateRange(start_date=start.isoformat(), end_date=end.isoformat())],
        dimensions=[Dimension(name='pagePath')],
        metrics=[Metric(name='sessions'), Metric(name='activeUsers')],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='sessions'), desc=True)],
        limit=limit,
    )
    resp = client.run_report(req)

    return [
        {
            'page':     row.dimension_values[0].value,
            'sessions': int(row.metric_values[0].value),
            'users':    int(row.metric_values[1].value),
        }
        for row in resp.rows
    ]


def get_homepage_title_variants(start_date: str, end_date: str = 'today', limit: int = 50) -> list[dict]:
    """
    Lấy các biến thể pageTitle cho homepage (pagePath=/) trong khoảng ngày chỉ định.
    start_date/end_date dùng format GA4 như '2026-06-28', 'today', '7daysAgo'.
    """
    from google.analytics.data_v1beta.types import (
        RunReportRequest,
        DateRange,
        Dimension,
        Metric,
        OrderBy,
        FilterExpression,
        Filter,
    )

    client = _client()
    prop = f'properties/{_property_id()}'

    req = RunReportRequest(
        property=prop,
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[Dimension(name='date'), Dimension(name='pagePath'), Dimension(name='pageTitle')],
        metrics=[
            Metric(name='screenPageViews'),
            Metric(name='sessions'),
            Metric(name='activeUsers'),
        ],
        dimension_filter=FilterExpression(
            filter=Filter(
                field_name='pagePath',
                string_filter=Filter.StringFilter(
                    match_type=Filter.StringFilter.MatchType.EXACT,
                    value='/',
                ),
            )
        ),
        order_bys=[OrderBy(desc=True, metric=OrderBy.MetricOrderBy(metric_name='screenPageViews'))],
        limit=limit,
    )
    resp = client.run_report(req)

    rows = []
    for row in resp.rows:
        rows.append({
            'date': row.dimension_values[0].value,
            'pagePath': row.dimension_values[1].value,
            'pageTitle': row.dimension_values[2].value,
            'screenPageViews': int(row.metric_values[0].value),
            'sessions': int(row.metric_values[1].value),
            'activeUsers': int(row.metric_values[2].value),
        })
    return rows


def get_homepage_title_variants_by_hour(date_value: str, limit: int = 100) -> list[dict]:
    """
    Lấy biến thể pageTitle cho homepage (pagePath=/) theo giờ trong một ngày.
    date_value format YYYY-MM-DD.
    """
    from google.analytics.data_v1beta.types import (
        RunReportRequest,
        DateRange,
        Dimension,
        Metric,
        OrderBy,
        FilterExpression,
        Filter,
    )

    client = _client()
    prop = f'properties/{_property_id()}'

    req = RunReportRequest(
        property=prop,
        date_ranges=[DateRange(start_date=date_value, end_date=date_value)],
        dimensions=[Dimension(name='dateHour'), Dimension(name='pagePath'), Dimension(name='pageTitle')],
        metrics=[
            Metric(name='screenPageViews'),
            Metric(name='sessions'),
            Metric(name='activeUsers'),
        ],
        dimension_filter=FilterExpression(
            filter=Filter(
                field_name='pagePath',
                string_filter=Filter.StringFilter(
                    match_type=Filter.StringFilter.MatchType.EXACT,
                    value='/',
                ),
            )
        ),
        order_bys=[
            OrderBy(dimension=OrderBy.DimensionOrderBy(dimension_name='dateHour')),
            OrderBy(desc=True, metric=OrderBy.MetricOrderBy(metric_name='screenPageViews')),
        ],
        limit=limit,
    )
    resp = client.run_report(req)

    rows = []
    for row in resp.rows:
        rows.append({
            'dateHour': row.dimension_values[0].value,
            'pagePath': row.dimension_values[1].value,
            'pageTitle': row.dimension_values[2].value,
            'screenPageViews': int(row.metric_values[0].value),
            'sessions': int(row.metric_values[1].value),
            'activeUsers': int(row.metric_values[2].value),
        })
    return rows
