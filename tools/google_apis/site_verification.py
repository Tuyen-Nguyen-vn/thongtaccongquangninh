"""
Site Verification API — đăng ký service account làm verified owner của site.
Cần thiết để Indexing API hoạt động (service account không thể add qua GSC UI).

Usage:
    python tools/google_apis/site_verification.py --get-token
    python tools/google_apis/site_verification.py --verify
    python tools/google_apis/site_verification.py --list
"""

import os, sys, argparse

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ROOT)

from tools.google_apis.auth import get_service_account_creds

SITE_URL = 'https://thongtaccongquangninh.com/'
SCOPES   = ['https://www.googleapis.com/auth/siteverification']


def get_service():
    from googleapiclient.discovery import build
    creds = get_service_account_creds(SCOPES)
    return build('siteVerification', 'v1', credentials=creds)


def get_token(verify_method='META'):
    svc = get_service()
    resp = svc.webResource().getToken(body={
        'site': {'type': 'SITE', 'identifier': SITE_URL},
        'verificationMethod': verify_method,
    }).execute()
    return resp


def verify_site(verify_method='META'):
    svc = get_service()
    resp = svc.webResource().insert(
        verificationMethod=verify_method,
        body={
            'site': {'type': 'SITE', 'identifier': SITE_URL},
        }
    ).execute()
    return resp


def list_sites():
    svc = get_service()
    resp = svc.webResource().list().execute()
    return resp


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--get-token', action='store_true')
    parser.add_argument('--verify',    action='store_true')
    parser.add_argument('--list',      action='store_true')
    args = parser.parse_args()

    if args.get_token:
        result = get_token()
        print('[TOKEN]', result)
        token_val = result.get('token', '')
        print()
        print('Thêm meta tag sau vào <head> của homepage:')
        print(f'<meta name="google-site-verification" content="{token_val}" />')

    elif args.verify:
        result = verify_site()
        print('[VERIFY]', result)

    elif args.list:
        result = list_sites()
        print('[LIST]', result)

    else:
        parser.print_help()


if __name__ == '__main__':
    main()
