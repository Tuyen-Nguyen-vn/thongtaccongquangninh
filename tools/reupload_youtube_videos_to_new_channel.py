#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload


os.environ.setdefault("OAUTHLIB_RELAX_TOKEN_SCOPE", "1")

ROOT = Path(__file__).resolve().parents[1]
SECRETS = ROOT / "secrets"
CLIENT_SECRET = SECRETS / "oauth_credentials.json"
TOKEN_FILE = SECRETS / "token_youtube_new_channel.upload.json"
SOURCE_DIR = ROOT / "reports" / "youtube-reupload-2026-05-30" / "upload-files"
REPORT_FILE = ROOT / "reports" / "youtube-reupload-2026-05-30" / "youtube-reupload-result.json"
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.force-ssl",
]

EXPECTED_CHANNEL_TITLE = "Môi Trường Đô Thị Số 1 Quảng Ninh"
EXPECTED_HANDLE = "@moitruongdothiso1quangninh"

VIDEOS = [
    {
        "sourceId": "vcVjDZLV_O0",
        "file": SOURCE_DIR / "vcVjDZLV_O0.mp4",
        "title": "Hút bể phốt, thông tắc cống Quảng Ninh 24/7 | Môi Trường Đô Thị Số 1 Quảng Ninh",
        "description": """Môi Trường Đô Thị Số 1 Quảng Ninh hỗ trợ hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh 24/7.

Hotline Quảng Ninh: 0963.953.533
Zalo: 0931.156.756
Website: https://thongtaccongquangninh.com

Khu vực phục vụ: Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn và các khu vực lân cận.

Video được đăng lại trên kênh chính thức Môi Trường Đô Thị Số 1 Quảng Ninh để đồng bộ thương hiệu Quảng Ninh.

#hutbephotquangninh #thongtaccongquangninh #moitruongdothiso1quangninh""",
        "tags": ["hút bể phốt Quảng Ninh", "thông tắc cống Quảng Ninh", "Môi Trường Đô Thị Số 1 Quảng Ninh"],
    },
    {
        "sourceId": "oWFUTKj4O18",
        "file": SOURCE_DIR / "oWFUTKj4O18.mp4",
        "title": "Thông tắc cống Quảng Ninh 24/7, không đục phá | Gọi 0963.953.533",
        "description": """Video minh họa quy trình kiểm tra và xử lý cống tắc tại Quảng Ninh bằng thiết bị phù hợp, ưu tiên hạn chế đục phá và báo phương án trước khi làm.

Hotline Quảng Ninh: 0963.953.533
Zalo: 0931.156.756
Website: https://thongtaccongquangninh.com/thong-tac-cong-quang-ninh/

Khu vực phục vụ: Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn.

Video được đăng lại trên kênh chính thức Môi Trường Đô Thị Số 1 Quảng Ninh để đồng bộ thương hiệu Quảng Ninh.

#thongtaccongquangninh #thongtacconghalong #moitruongdothiso1quangninh""",
        "tags": ["thông tắc cống Quảng Ninh", "thông tắc cống Hạ Long", "không đục phá"],
    },
    {
        "sourceId": "52u9a3u86uk",
        "file": SOURCE_DIR / "52u9a3u86uk.mp4",
        "title": "Xử lý mùi hôi cống thoát nước Quảng Ninh | Gọi 0963.953.533",
        "description": """Video ghi lại quy trình kiểm tra nguồn mùi từ cống thoát nước, hố ga và khu vệ sinh. Đội kỹ thuật xác định nguyên nhân trước khi xử lý để hạn chế tái phát.

Hotline Quảng Ninh: 0963.953.533
Zalo: 0931.156.756
Website: https://thongtaccongquangninh.com/xu-ly-mui-hoi-quang-ninh/

Dịch vụ liên quan: xử lý mùi hôi nhà vệ sinh, thông tắc cống, hút bể phốt, nạo vét hố ga tại Quảng Ninh và khu vực lân cận.

Video được đăng lại trên kênh chính thức Môi Trường Đô Thị Số 1 Quảng Ninh để đồng bộ thương hiệu Quảng Ninh.

#xulymuihoiquangninh #thongtaccongquangninh #moitruongdothiso1quangninh""",
        "tags": ["xử lý mùi hôi Quảng Ninh", "mùi hôi cống", "thông tắc cống Quảng Ninh"],
    },
]


def get_credentials(manual_oauth: bool) -> Credentials:
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
            flow.redirect_uri = "http://127.0.0.1:8099/"
            auth_url, expected_state = flow.authorization_url(
                access_type="offline",
                prompt="consent select_account",
            )
            print("\nMở link này, chọn đúng kênh YouTube mới:", flush=True)
            print(auth_url, flush=True)
            if not manual_oauth:
                raise SystemExit("Dùng --manual-oauth và dán URL callback sau khi cấp quyền.")
            print(
                "\nSau khi Google redirect về 127.0.0.1, copy toàn bộ URL trên thanh địa chỉ và dán vào đây.",
                flush=True,
            )
            callback_url = input("Dán URL callback: ").strip()
            query = parse_qs(urlparse(callback_url).query)
            result = {
                "code": query.get("code", [""])[0],
                "state": query.get("state", [""])[0],
                "error": query.get("error", [""])[0],
            }
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


def get_selected_channel(youtube) -> dict:
    response = youtube.channels().list(part="id,snippet", mine=True).execute()
    items = response.get("items", [])
    if len(items) != 1:
        raise SystemExit(f"OAuth phải trả đúng 1 kênh, hiện trả {len(items)}.")
    return items[0]


def assert_new_channel(channel: dict) -> None:
    snippet = channel.get("snippet", {})
    title = snippet.get("title", "")
    custom_url = snippet.get("customUrl", "")
    if title != EXPECTED_CHANNEL_TITLE and custom_url != EXPECTED_HANDLE:
        raise SystemExit(
            "OAuth đang chọn sai kênh: "
            + json.dumps({"title": title, "customUrl": custom_url, "id": channel.get("id", "")}, ensure_ascii=False)
        )


def upload_video(youtube, spec: dict, privacy_status: str) -> dict:
    file_path = Path(spec["file"])
    if not file_path.exists():
        return {"sourceId": spec["sourceId"], "ok": False, "error": f"missing_file:{file_path}"}

    body = {
        "snippet": {
            "title": spec["title"],
            "description": spec["description"],
            "tags": spec["tags"],
            "categoryId": "22",
            "defaultLanguage": "vi",
            "defaultAudioLanguage": "vi",
        },
        "status": {
            "privacyStatus": privacy_status,
            "selfDeclaredMadeForKids": False,
        },
    }
    media = MediaFileUpload(str(file_path), chunksize=-1, resumable=True, mimetype="video/mp4")
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    response = None
    while response is None:
        _, response = request.next_chunk()
    return {
        "sourceId": spec["sourceId"],
        "ok": True,
        "newVideoId": response.get("id", ""),
        "url": f"https://www.youtube.com/watch?v={response.get('id', '')}",
        "title": response.get("snippet", {}).get("title", ""),
        "privacyStatus": response.get("status", {}).get("privacyStatus", ""),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Upload videos to the selected YouTube channel.")
    parser.add_argument("--manual-oauth", action="store_true", help="Paste OAuth callback URL manually.")
    parser.add_argument("--privacy", choices=["public", "unlisted", "private"], default="public")
    args = parser.parse_args()

    creds = get_credentials(manual_oauth=args.manual_oauth)
    youtube = build("youtube", "v3", credentials=creds)
    channel = get_selected_channel(youtube)
    assert_new_channel(channel)

    rows = []
    if args.apply:
        for spec in VIDEOS:
            rows.append(upload_video(youtube, spec, args.privacy))
    else:
        rows = [
            {
                "sourceId": spec["sourceId"],
                "file": str(spec["file"]),
                "exists": Path(spec["file"]).exists(),
                "title": spec["title"],
                "privacyStatus": args.privacy,
            }
            for spec in VIDEOS
        ]

    report = {
        "applied": args.apply,
        "privacyStatus": args.privacy,
        "channel": {
            "id": channel.get("id", ""),
            "title": channel.get("snippet", {}).get("title", ""),
            "customUrl": channel.get("snippet", {}).get("customUrl", ""),
        },
        "rows": rows,
    }
    REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
    REPORT_FILE.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(REPORT_FILE), **report}, ensure_ascii=False, indent=2))
    return 0 if all(row.get("ok", row.get("exists", False)) for row in rows) else 1


if __name__ == "__main__":
    raise SystemExit(main())
