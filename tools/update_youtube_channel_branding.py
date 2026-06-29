#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from copy import deepcopy
from pathlib import Path

from googleapiclient.discovery import build

from update_youtube_video_metadata import get_credentials


ROOT = Path(__file__).resolve().parents[1]
REPORT_FILE = ROOT / "reports" / "youtube-channel-branding-update-2026-05-30.json"

TARGET_TITLE = "Môi Trường Đô Thị Số 1 Quảng Ninh"
TARGET_DESCRIPTION = """Môi Trường Đô Thị Số 1 Quảng Ninh là kênh chia sẻ video thi công thực tế về hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh.

Khu vực phục vụ: Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Quảng Yên, Vân Đồn và các khu vực lân cận.

Thế mạnh: hỗ trợ 24/7, có mặt nhanh, ưu tiên không đục phá, báo phương án trước khi làm, dùng máy lò xo và xe bồn phù hợp từng công trình.

Hotline Quảng Ninh: 0963.953.533
Zalo: 0931.156.756
Website: https://thongtaccongquangninh.com"""


def get_channel(youtube) -> dict:
    response = (
        youtube.channels()
        .list(part="id,snippet,brandingSettings,localizations", mine=True)
        .execute()
    )
    items = response.get("items", [])
    if not items:
        raise SystemExit("Không tìm thấy kênh YouTube thuộc tài khoản OAuth hiện tại.")
    if len(items) > 1:
        raise SystemExit(f"Tài khoản trả về {len(items)} kênh, dừng để tránh sửa nhầm.")
    return items[0]


def build_updated_branding(channel: dict) -> dict:
    branding = deepcopy(channel.get("brandingSettings", {}))
    branding.setdefault("channel", {})
    # YouTube Data API does not allow changing the primary channel title via
    # channels.update; keep the current title here and update editable fields.
    branding["channel"]["title"] = channel.get("brandingSettings", {}).get("channel", {}).get("title", "")
    branding["channel"]["description"] = TARGET_DESCRIPTION
    return branding


def build_updated_localizations(channel: dict) -> dict:
    localizations = deepcopy(channel.get("localizations", {}))
    for locale in ("en_US", "vi_VN"):
        localizations[locale] = {
            "title": TARGET_TITLE,
            "description": TARGET_DESCRIPTION,
        }
    return localizations


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply channel branding update to YouTube.")
    args = parser.parse_args()

    youtube = build("youtube", "v3", credentials=get_credentials(False))
    before = get_channel(youtube)
    updated_branding = build_updated_branding(before)
    updated_localizations = build_updated_localizations(before)

    row = {
        "channelId": before["id"],
        "applied": args.apply,
        "before": {
            "snippetTitle": before.get("snippet", {}).get("title", ""),
            "snippetDescription": before.get("snippet", {}).get("description", ""),
            "customUrl": before.get("snippet", {}).get("customUrl", ""),
            "brandingTitle": before.get("brandingSettings", {}).get("channel", {}).get("title", ""),
            "brandingDescription": before.get("brandingSettings", {}).get("channel", {}).get("description", ""),
        },
        "after": {
            "primaryTitleNote": "YouTube Data API requires the primary branding title to remain unchanged; change it in YouTube Studio.",
            "brandingTitle": updated_branding.get("channel", {}).get("title", ""),
            "brandingDescription": TARGET_DESCRIPTION,
            "localizations": updated_localizations,
        },
    }

    if args.apply:
        branding_response = (
            youtube.channels()
            .update(
                part="brandingSettings",
                body={
                    "id": before["id"],
                    "brandingSettings": updated_branding,
                },
            )
            .execute()
        )
        localization_response = (
            youtube.channels()
            .update(
                part="localizations",
                body={
                    "id": before["id"],
                    "localizations": updated_localizations,
                },
            )
            .execute()
        )
        row["youtubeResponse"] = {
            "id": branding_response.get("id", ""),
            "brandingTitle": branding_response.get("brandingSettings", {}).get("channel", {}).get("title", ""),
            "brandingDescription": branding_response.get("brandingSettings", {}).get("channel", {}).get("description", ""),
            "localizations": localization_response.get("localizations", {}),
        }
        verified = get_channel(youtube)
        row["verifiedAfterApi"] = {
            "snippet": verified.get("snippet", {}),
            "brandingChannel": verified.get("brandingSettings", {}).get("channel", {}),
            "localizations": verified.get("localizations", {}),
        }

    report = {"applied": args.apply, "row": row}
    REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
    REPORT_FILE.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(REPORT_FILE), **report}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
