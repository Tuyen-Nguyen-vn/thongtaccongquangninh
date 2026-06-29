#!/usr/bin/env python3
"""Refresh Search Console OAuth token using a visible localhost callback URL."""

from __future__ import annotations

import argparse
import json
import os
import socketserver
import threading
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from google_auth_oauthlib.flow import InstalledAppFlow


ROOT = Path(__file__).resolve().parents[1]
SECRETS_DIR = ROOT / "secrets"
OAUTH_CREDS_FILE = SECRETS_DIR / "oauth_credentials.json"
TOKEN_FILE = SECRETS_DIR / "token_webmasters.json"
SCOPES = ["https://www.googleapis.com/auth/webmasters"]


class OAuthHandler(BaseHTTPRequestHandler):
    server: "OAuthServer"

    def do_GET(self) -> None:  # noqa: N802 - stdlib callback method
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        self.server.oauth_code = params.get("code", [""])[0]
        self.server.oauth_error = params.get("error", [""])[0]
        body = (
            "Search Console OAuth callback received. "
            "You can close this tab and return to Codex."
        )
        self.send_response(200 if self.server.oauth_code else 400)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(body.encode("utf-8"))
        threading.Thread(target=self.server.shutdown, daemon=True).start()

    def log_message(self, format: str, *args: object) -> None:
        return


class OAuthServer(socketserver.TCPServer):
    allow_reuse_address = True
    oauth_code = ""
    oauth_error = ""


def main() -> int:
    os.environ.setdefault("OAUTHLIB_RELAX_TOKEN_SCOPE", "1")
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    if not OAUTH_CREDS_FILE.exists():
        raise FileNotFoundError(f"Missing OAuth client: {OAUTH_CREDS_FILE}")

    with OAuthServer(("127.0.0.1", args.port), OAuthHandler) as httpd:
        flow = InstalledAppFlow.from_client_secrets_file(str(OAUTH_CREDS_FILE), SCOPES)
        flow.redirect_uri = f"http://localhost:{args.port}/"
        auth_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )

        print("Open this URL in the browser and approve Search Console access:")
        print(auth_url, flush=True)
        httpd.handle_request()

        if httpd.oauth_error:
            raise RuntimeError(f"OAuth error: {httpd.oauth_error}")
        if not httpd.oauth_code:
            raise RuntimeError("OAuth callback did not include a code")

        flow.fetch_token(code=httpd.oauth_code)
        TOKEN_FILE.write_text(flow.credentials.to_json(), encoding="utf-8")

    token_data = json.loads(TOKEN_FILE.read_text(encoding="utf-8"))
    print(
        json.dumps(
            {
                "ok": True,
                "tokenFile": str(TOKEN_FILE),
                "scopes": token_data.get("scopes", []),
                "hasRefreshToken": bool(token_data.get("refresh_token")),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
