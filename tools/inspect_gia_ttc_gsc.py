#!/usr/bin/env python3
"""Run Google Search Console URL Inspection for the gia TTC price post."""

from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.google_apis.auth import SCOPES_SEARCH_CONSOLE, get_oauth_service

SITE_URL = "https://thongtaccongquangninh.com/"
INSPECTION_URL = "https://thongtaccongquangninh.com/gia-thong-tac-cong-quang-ninh/"


def slim(result: dict) -> dict:
    inspection = result.get("inspectionResult", {})
    index = inspection.get("indexStatusResult", {})
    rich = inspection.get("richResultsResult", {})
    mobile = inspection.get("mobileUsabilityResult", {})
    amp = inspection.get("ampResult", {})
    return {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "siteUrl": SITE_URL,
        "inspectionUrl": INSPECTION_URL,
        "inspectionResultLink": inspection.get("inspectionResultLink"),
        "indexStatus": {
            "verdict": index.get("verdict"),
            "coverageState": index.get("coverageState"),
            "robotsTxtState": index.get("robotsTxtState"),
            "indexingState": index.get("indexingState"),
            "lastCrawlTime": index.get("lastCrawlTime"),
            "pageFetchState": index.get("pageFetchState"),
            "googleCanonical": index.get("googleCanonical"),
            "userCanonical": index.get("userCanonical"),
            "sitemap": index.get("sitemap"),
            "referringUrls": index.get("referringUrls", []),
        },
        "richResults": {
            "verdict": rich.get("verdict"),
            "detectedItems": [
                {
                    "richResultType": item.get("richResultType"),
                    "items": [
                        {
                            "name": nested.get("name"),
                            "issues": nested.get("issues", []),
                        }
                        for nested in item.get("items", [])
                    ],
                }
                for item in rich.get("detectedItems", [])
            ],
        },
        "mobileUsability": mobile,
        "amp": amp,
        "raw": result,
    }


def main() -> None:
    service = get_oauth_service("searchconsole", "v1", SCOPES_SEARCH_CONSOLE)
    response = service.urlInspection().index().inspect(
        body={"inspectionUrl": INSPECTION_URL, "siteUrl": SITE_URL}
    ).execute()
    report = slim(response)
    out = ROOT / "reports" / f"gsc-url-inspection-gia-ttc-{datetime.now().strftime('%Y-%m-%dT%H-%M-%S')}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"reportPath": str(out), **{k: report[k] for k in ("indexStatus", "richResults")}}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
