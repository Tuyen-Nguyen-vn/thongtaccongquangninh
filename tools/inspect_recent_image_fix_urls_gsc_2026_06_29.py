#!/usr/bin/env python3
"""Run GSC URL Inspection for URLs updated in the image/byline cleanup."""

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
URLS = [
    "https://thongtaccongquangninh.com/thong-tac-cong-ha-long/",
    "https://thongtaccongquangninh.com/thong-tac-cong-bai-chay/",
    "https://thongtaccongquangninh.com/cau-hoi-thuong-gap-thong-tac-cong/",
    "https://thongtaccongquangninh.com/hut-be-phot-khach-san-quang-ninh/",
]


def slim(result: dict, url: str) -> dict:
    inspection = result.get("inspectionResult", {})
    index = inspection.get("indexStatusResult", {})
    rich = inspection.get("richResultsResult", {})
    mobile = inspection.get("mobileUsabilityResult", {})
    return {
        "url": url,
        "inspectionResultLink": inspection.get("inspectionResultLink"),
        "indexStatus": {
            "verdict": index.get("verdict"),
            "coverageState": index.get("coverageState"),
            "robotsTxtState": index.get("robotsTxtState"),
            "indexingState": index.get("indexingState"),
            "pageFetchState": index.get("pageFetchState"),
            "lastCrawlTime": index.get("lastCrawlTime"),
            "googleCanonical": index.get("googleCanonical"),
            "userCanonical": index.get("userCanonical"),
            "sitemap": index.get("sitemap", []),
            "referringUrls": index.get("referringUrls", []),
        },
        "richResults": {
            "verdict": rich.get("verdict"),
            "detectedTypes": [
                item.get("richResultType")
                for item in rich.get("detectedItems", [])
                if item.get("richResultType")
            ],
            "issues": [
                {
                    "type": item.get("richResultType"),
                    "name": nested.get("name"),
                    "issues": nested.get("issues", []),
                }
                for item in rich.get("detectedItems", [])
                for nested in item.get("items", [])
                if nested.get("issues")
            ],
        },
        "mobileUsability": {
            "verdict": mobile.get("verdict"),
            "issues": mobile.get("issues", []),
        },
    }


def write_markdown(path: Path, report: dict) -> None:
    lines = [
        "# GSC URL Inspection - Recent Image Fix URLs",
        "",
        f"- Generated: {report['generatedAt']}",
        f"- Site: {report['siteUrl']}",
        f"- URLs: {report['urlCount']}",
        "",
        "| URL | Verdict | Coverage | Fetch | Last crawl | Rich results | Mobile |",
        "|---|---|---|---|---|---|---|",
    ]
    for item in report["results"]:
        index = item["indexStatus"]
        rich = item["richResults"]
        mobile = item["mobileUsability"]
        lines.append(
            "| {url} | {verdict} | {coverage} | {fetch} | {crawl} | {rich} | {mobile} |".format(
                url=item["url"],
                verdict=index.get("verdict") or "",
                coverage=(index.get("coverageState") or "").replace("|", "\\|"),
                fetch=index.get("pageFetchState") or "",
                crawl=index.get("lastCrawlTime") or "",
                rich=rich.get("verdict") or "",
                mobile=mobile.get("verdict") or "",
            )
        )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    service = get_oauth_service("searchconsole", "v1", SCOPES_SEARCH_CONSOLE)
    results = []
    errors = []
    for url in URLS:
        try:
            response = service.urlInspection().index().inspect(
                body={"inspectionUrl": url, "siteUrl": SITE_URL}
            ).execute()
            results.append(slim(response, url))
            status = results[-1]["indexStatus"]
            print(f"[OK] {url} | {status.get('verdict')} | {status.get('coverageState')}")
        except Exception as exc:  # Google API errors are serialized into the report.
            errors.append({"url": url, "error": str(exc)})
            print(f"[ERR] {url} | {exc}")

    stamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
    report = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "siteUrl": SITE_URL,
        "urlCount": len(URLS),
        "okCount": len(results),
        "errorCount": len(errors),
        "results": results,
        "errors": errors,
    }
    out = ROOT / "reports" / f"gsc-url-inspection-recent-image-fixes-{stamp}.json"
    md = ROOT / "reports" / f"gsc-url-inspection-recent-image-fixes-{stamp}.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    write_markdown(md, report)
    print(json.dumps({"reportPath": str(out), "markdownReportPath": str(md), "okCount": len(results), "errorCount": len(errors)}, ensure_ascii=False, indent=2))
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
