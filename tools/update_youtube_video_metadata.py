#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from wsgiref.simple_server import make_server

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build


os.environ.setdefault("OAUTHLIB_RELAX_TOKEN_SCOPE", "1")

ROOT = Path(__file__).resolve().parents[1]
SECRETS = ROOT / "secrets"
CLIENT_SECRET = SECRETS / "oauth_credentials.json"
TOKEN_FILE = SECRETS / "token_youtube.force-ssl.json"
REPORT_FILE = ROOT / "reports" / "youtube-metadata-update-2026-05-30.json"
SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]


VIDEOS = {
    "vcVjDZLV_O0": {
        "title": "Hút bể phốt, thông tắc cống Quảng Ninh 24/7 | Môi Trường Đô Thị Số 1 Quảng Ninh",
        "description": """Môi Trường Đô Thị Số 1 Quảng Ninh hỗ trợ hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh 24/7.

Hotline Quảng Ninh: 0963.953.533
Zalo: 0931.156.756
Website: https://thongtaccongquangninh.com

Khu vực phục vụ: Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn và các khu vực lân cận.

#hutbephotquangninh #thongtaccongquangninh #moitruongdothiso1quangninh""",
    },
    "oWFUTKj4O18": {
        "title": "Thông tắc cống Quảng Ninh 24/7, không đục phá | Gọi 0963.953.533",
        "description": """Video minh họa quy trình kiểm tra và xử lý cống tắc tại Quảng Ninh bằng thiết bị phù hợp, ưu tiên hạn chế đục phá và báo phương án trước khi làm.

Hotline Quảng Ninh: 0963.953.533
Zalo: 0931.156.756
Website: https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/

Khu vực phục vụ: Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn.

#thongtaccongquangninh #thongtacconghalong #moitruongdothiso1quangninh""",
    },
    "52u9a3u86uk": {
        "title": "Xử lý mùi hôi cống thoát nước Quảng Ninh - Hải Phòng | Gọi 0963.953.533",
        "description": """Video ghi lại quy trình kiểm tra nguồn mùi từ cống thoát nước, hố ga và khu vệ sinh. Đội kỹ thuật xác định nguyên nhân trước khi xử lý để hạn chế tái phát.

Hotline Quảng Ninh: 0963.953.533
Zalo: 0931.156.756
Website: https://thongtaccongquangninh.com/xu-ly-mui-hoi-quang-ninh/

Dịch vụ liên quan: xử lý mùi hôi nhà vệ sinh, thông tắc cống, hút bể phốt, nạo vét hố ga tại Quảng Ninh và khu vực lân cận.

#xulymuihoiquangninh #thongtaccongquangninh #moitruongdothiso1quangninh""",
    },
}


def get_credentials(manual_oauth: bool = False) -> Credentials:
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CLIENT_SECRET.exists():
                raise SystemExit(f"Missing OAuth client secret: {CLIENT_SECRET}")
            flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), SCOPES)
            redirect_uri = "http://127.0.0.1:8099/"
            flow.redirect_uri = redirect_uri
            auth_url, expected_state = flow.authorization_url(
                access_type="offline",
                prompt="consent",
            )
            print("\nMở link này trong trình duyệt đang đăng nhập kênh YouTube cần sửa:", flush=True)
            print(auth_url, flush=True)
            if manual_oauth:
                print(
                    "\nSau khi cấp quyền, nếu trình duyệt báo không mở được 127.0.0.1 thì copy toàn bộ URL trên thanh địa chỉ và dán vào đây.",
                    flush=True,
                )
                callback_url = input("Dán URL callback: ").strip()
                query = parse_qs(urlparse(callback_url).query)
                result = {
                    "code": query.get("code", [""])[0],
                    "state": query.get("state", [""])[0],
                    "error": query.get("error", [""])[0],
                }
            else:
                print("\nSau khi Google báo cấp quyền xong, quay lại terminal này.", flush=True)

                result: dict[str, str] = {}

                def app(environ, start_response):
                    query = parse_qs(urlparse(environ.get("RAW_URI", environ.get("PATH_INFO", ""))).query)
                    if not query:
                        query = parse_qs(environ.get("QUERY_STRING", ""))
                    result["code"] = query.get("code", [""])[0]
                    result["state"] = query.get("state", [""])[0]
                    result["error"] = query.get("error", [""])[0]
                    body = b"Da cap quyen YouTube cho Codex. Co the quay lai terminal."
                    start_response("200 OK", [("Content-Type", "text/plain; charset=utf-8"), ("Content-Length", str(len(body)))])
                    return [body]

                with make_server("127.0.0.1", 8099, app) as server:
                    server.handle_request()

            if result.get("error"):
                raise SystemExit(f"OAuth error: {result['error']}")
            if not result.get("code"):
                raise SystemExit("OAuth failed: missing code")
            if result.get("state") != expected_state:
                raise SystemExit("OAuth failed: state mismatch")

            flow.fetch_token(code=result["code"])
            creds = flow.credentials
        TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")

    return creds


def update_video(youtube, video_id: str, planned: dict[str, str], apply: bool) -> dict:
    current = (
        youtube.videos()
        .list(part="snippet,status", id=video_id)
        .execute()
    )
    items = current.get("items", [])
    if not items:
        return {"videoId": video_id, "ok": False, "error": "not_found_or_not_owned"}

    item = items[0]
    snippet = item["snippet"]
    status = item.get("status", {})
    before = {
        "title": snippet.get("title", ""),
        "description": snippet.get("description", ""),
        "categoryId": snippet.get("categoryId", ""),
        "privacyStatus": status.get("privacyStatus", ""),
    }

    new_snippet = {
        "title": planned["title"],
        "description": planned["description"],
        "categoryId": snippet.get("categoryId", "22"),
    }
    for key in ("tags", "defaultLanguage", "defaultAudioLanguage"):
        if key in snippet:
            new_snippet[key] = snippet[key]

    result = {
        "videoId": video_id,
        "ok": True,
        "applied": apply,
        "before": before,
        "after": {
            "title": new_snippet["title"],
            "description": new_snippet["description"],
            "categoryId": new_snippet["categoryId"],
        },
    }

    if apply:
        response = (
            youtube.videos()
            .update(
                part="snippet",
                body={
                    "id": video_id,
                    "snippet": new_snippet,
                },
            )
            .execute()
        )
        result["youtubeTitle"] = response.get("snippet", {}).get("title", "")

    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply updates to YouTube.")
    parser.add_argument("--manual-oauth", action="store_true", help="Paste callback URL manually instead of running a local callback server.")
    args = parser.parse_args()

    creds = get_credentials(manual_oauth=args.manual_oauth)
    youtube = build("youtube", "v3", credentials=creds)
    rows = [update_video(youtube, video_id, planned, args.apply) for video_id, planned in VIDEOS.items()]

    report = {
        "applied": args.apply,
        "rows": rows,
    }
    REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
    REPORT_FILE.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(REPORT_FILE), "applied": args.apply, "rows": rows}, ensure_ascii=False, indent=2))
    return 0 if all(row.get("ok") for row in rows) else 1


if __name__ == "__main__":
    raise SystemExit(main())
