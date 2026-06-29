#!/usr/bin/env python3
"""
Submit sitemap to Google Search Console with the official Search Console API.

This script intentionally uses a separate OAuth token file from the readonly
GSC reports, because sitemap submission requires the write-capable
`webmasters` scope.
"""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


ROOT = Path(__file__).resolve().parents[1]
SECRETS_DIR = ROOT / "secrets"
OAUTH_CREDS_FILE = SECRETS_DIR / "oauth_credentials.json"
TOKEN_FILE = SECRETS_DIR / "token_webmasters.json"
REPORTS_DIR = ROOT / "reports"

SCOPES = ["https://www.googleapis.com/auth/webmasters"]
DEFAULT_SITE = "https://thongtaccongquangninh.com/"
DEFAULT_SITEMAP = "https://thongtaccongquangninh.com/sitemap_index.xml"


def get_credentials(no_browser: bool, manual_oauth: bool) -> Credentials:
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if creds and creds.valid:
        return creds

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
        return creds

    if no_browser:
        raise RuntimeError(
            f"Missing OAuth token for write scope. Run without --no-browser to create {TOKEN_FILE}."
        )

    if not OAUTH_CREDS_FILE.exists():
        raise FileNotFoundError(f"Missing OAuth client: {OAUTH_CREDS_FILE}")

    flow = InstalledAppFlow.from_client_secrets_file(str(OAUTH_CREDS_FILE), SCOPES)
    login_hint = os.environ.get("GOOGLE_LOGIN_HINT", "")
    extra = {"login_hint": login_hint} if login_hint else {}
    creds = flow.run_local_server(port=0, open_browser=not manual_oauth, **extra)
    TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
    return creds


def normalize_site(site: str) -> str:
    return site if site.endswith("/") else site + "/"


def sitemap_summary(sitemap: dict[str, Any]) -> dict[str, Any]:
    return {
        "path": sitemap.get("path"),
        "lastSubmitted": sitemap.get("lastSubmitted"),
        "isPending": sitemap.get("isPending"),
        "isSitemapsIndex": sitemap.get("isSitemapsIndex"),
        "warnings": sitemap.get("warnings"),
        "errors": sitemap.get("errors"),
        "contents": sitemap.get("contents", []),
    }


def write_reports(data: dict[str, Any]) -> tuple[Path, Path]:
    REPORTS_DIR.mkdir(exist_ok=True)
    stamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
    json_path = REPORTS_DIR / f"search-console-sitemap-submit-{stamp}.json"
    md_path = REPORTS_DIR / f"search-console-sitemap-submit-{stamp}.md"

    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    matched = data.get("matchedSitemap") or {}
    lines = [
        f"# Search Console sitemap submit — {data['site']}",
        "",
        f"- Generated: {data['generatedAt']}",
        f"- Sitemap: {data['sitemap']}",
        f"- Submit status: {data['status']}",
        f"- API response: `{data.get('submitResponse') or 'empty response'}`",
        "",
        "## Verification",
        "",
    ]
    if matched:
        lines.extend(
            [
                f"- Found in GSC sitemap list: {matched.get('path')}",
                f"- Last submitted: {matched.get('lastSubmitted')}",
                f"- Pending: {matched.get('isPending')}",
                f"- Sitemap index: {matched.get('isSitemapsIndex')}",
                f"- Warnings: {matched.get('warnings')}",
                f"- Errors: {matched.get('errors')}",
            ]
        )
    else:
        lines.append("- Not found in GSC sitemap list after submit.")

    if data.get("error"):
        lines.extend(["", "## Error", "", f"```text\n{data['error']}\n```"])

    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return json_path, md_path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", default=DEFAULT_SITE)
    parser.add_argument("--sitemap", default=DEFAULT_SITEMAP)
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Fail instead of opening OAuth consent when write-scope token is missing.",
    )
    parser.add_argument(
        "--manual-oauth",
        action="store_true",
        help="Print an OAuth URL instead of opening the browser automatically.",
    )
    args = parser.parse_args()

    site = normalize_site(args.site)
    generated_at = datetime.now().isoformat(timespec="seconds")
    data: dict[str, Any] = {
        "generatedAt": generated_at,
        "site": site,
        "sitemap": args.sitemap,
        "status": "started",
    }

    try:
        creds = get_credentials(args.no_browser, args.manual_oauth)
        service = build("searchconsole", "v1", credentials=creds)
        submit_response = service.sitemaps().submit(siteUrl=site, feedpath=args.sitemap).execute()
        listed = service.sitemaps().list(siteUrl=site).execute().get("sitemap", [])
        matched = next((s for s in listed if s.get("path") == args.sitemap), None)

        data.update(
            {
                "status": "submitted",
                "submitResponse": submit_response,
                "matchedSitemap": sitemap_summary(matched) if matched else None,
                "allSitemaps": [sitemap_summary(s) for s in listed],
            }
        )
        json_path, md_path = write_reports(data)
        print(f"[OK] Submitted sitemap: {args.sitemap}")
        print(f"[OK] JSON report: {json_path}")
        print(f"[OK] Markdown report: {md_path}")
        return 0
    except HttpError as exc:
        data.update({"status": "failed", "error": str(exc)})
    except Exception as exc:
        data.update({"status": "failed", "error": f"{type(exc).__name__}: {exc}"})

    json_path, md_path = write_reports(data)
    print(f"[FAIL] {data['error']}")
    print(f"[FAIL] JSON report: {json_path}")
    print(f"[FAIL] Markdown report: {md_path}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
