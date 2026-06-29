import shutil
import socket
import sys
import os
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs

from google_auth_oauthlib.flow import InstalledAppFlow


ROOT = Path(__file__).resolve().parents[1]
SECRETS_DIR = ROOT / "secrets"
CREDS_FILE = SECRETS_DIR / "oauth_credentials.json"
TOKEN_FILE = SECRETS_DIR / "token_analytics.readonly.json"
SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]


def _pick_port() -> int:
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


def _run_manual_flow(flow: InstalledAppFlow):
    port = _pick_port()
    redirect_uri = f"http://127.0.0.1:{port}/"
    flow.redirect_uri = redirect_uri
    auth_url, _ = flow.authorization_url(access_type="offline", prompt="consent")
    print(f"OAUTH_URL={auth_url}", flush=True)
    print(f"CALLBACK_PORT={port}", flush=True)

    result = {"auth_response": None, "error": None}

    class OAuthHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urlparse(self.path)
            if parsed.path != "/":
                self.send_response(404)
                self.end_headers()
                return

            query = parse_qs(parsed.query)
            if "error" in query:
                result["error"] = query["error"][0]
            result["auth_response"] = f"{redirect_uri}?{parsed.query}"

            body = b"GA4 OAuth completed. You can close this tab."
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, format, *args):
            return

    httpd = HTTPServer(("127.0.0.1", port), OAuthHandler)
    httpd.handle_request()

    if result["error"]:
        raise SystemExit(f"OAuth error: {result['error']}")
    if not result["auth_response"]:
        raise SystemExit("OAuth callback not received.")

    flow.fetch_token(authorization_response=result["auth_response"])
    return flow.credentials


def main() -> None:
    os.environ.setdefault("OAUTHLIB_INSECURE_TRANSPORT", "1")

    if not CREDS_FILE.exists():
        raise SystemExit(f"Missing credentials file: {CREDS_FILE}")

    if TOKEN_FILE.exists():
        backup = TOKEN_FILE.with_name(
            f"{TOKEN_FILE.stem}.bak_{datetime.now().strftime('%Y%m%dT%H%M%S')}{TOKEN_FILE.suffix}"
        )
        shutil.copy2(TOKEN_FILE, backup)
        print(f"Backed up existing token to: {backup}")

    flow = InstalledAppFlow.from_client_secrets_file(str(CREDS_FILE), SCOPES)
    if "--manual" in sys.argv:
        creds = _run_manual_flow(flow)
    else:
        open_browser = "--no-browser" not in sys.argv
        creds = flow.run_local_server(
            host="127.0.0.1",
            port=0,
            open_browser=open_browser,
            access_type="offline",
            prompt="consent",
        )

    TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
    print(f"Wrote new token to: {TOKEN_FILE}")


if __name__ == "__main__":
    main()
