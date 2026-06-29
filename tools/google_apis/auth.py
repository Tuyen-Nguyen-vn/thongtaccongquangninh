"""
Helper xác thực Google APIs — OAuth2 (user) và Service Account.

Cách dùng:
    from tools.google_apis.auth import get_oauth_service, get_service_account_creds

Files credential đặt trong secrets/ (đã gitignore):
    secrets/oauth_credentials.json     — tải từ Google Cloud Console (OAuth client Desktop)
    secrets/indexing_service_account.json — tải từ Google Cloud Console (Service Account)
"""

import os
import sys

SECRETS_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'secrets')
OAUTH_CREDS_FILE = os.path.join(SECRETS_DIR, 'oauth_credentials.json')
OAUTH_TOKEN_FILE = os.path.join(SECRETS_DIR, 'token.json')
SA_CREDS_FILE    = os.path.join(SECRETS_DIR, 'indexing_service_account.json')

SCOPES_SEARCH_CONSOLE = ['https://www.googleapis.com/auth/webmasters.readonly']
SCOPES_INDEXING       = ['https://www.googleapis.com/auth/indexing']
SCOPES_GA4            = ['https://www.googleapis.com/auth/analytics.readonly']
SCOPES_GBP            = ['https://www.googleapis.com/auth/business.manage']



def get_oauth_creds(scopes: list):
    """Trả về credentials OAuth2 (user account). Tự bật browser lần đầu."""
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
    except ImportError:
        sys.exit('Cài đặt: pip install google-api-python-client google-auth-oauthlib')

    creds = None
    token_path = OAUTH_TOKEN_FILE.replace('.json', f'_{"_".join(s.split("/")[-1] for s in scopes)}.json')

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, scopes)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(OAUTH_CREDS_FILE):
                sys.exit(f'Thiếu file: {OAUTH_CREDS_FILE}\nXem docs/google-apis-setup.md để tạo.')
            flow = InstalledAppFlow.from_client_secrets_file(OAUTH_CREDS_FILE, scopes)
            login_hint = os.environ.get('GOOGLE_LOGIN_HINT', '')
            extra = {'login_hint': login_hint} if login_hint else {}
            creds = flow.run_local_server(port=0, **extra)
        with open(token_path, 'w') as f:
            f.write(creds.to_json())

    return creds


def get_oauth_service(api_name: str, api_version: str, scopes: list):
    """Tạo Google API service dùng OAuth2."""
    from googleapiclient.discovery import build
    creds = get_oauth_creds(scopes)
    return build(api_name, api_version, credentials=creds)


def get_service_account_creds(scopes: list):
    """Trả về credentials Service Account (cho Indexing API)."""
    try:
        from google.oauth2 import service_account
    except ImportError:
        sys.exit('Cài đặt: pip install google-api-python-client google-auth')

    if not os.path.exists(SA_CREDS_FILE):
        sys.exit(f'Thiếu file: {SA_CREDS_FILE}\nXem docs/google-apis-setup.md để tạo.')

    return service_account.Credentials.from_service_account_file(SA_CREDS_FILE, scopes=scopes)
