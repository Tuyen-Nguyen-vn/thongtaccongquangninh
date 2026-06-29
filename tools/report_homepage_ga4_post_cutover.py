import json
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.google_apis.ga4 import get_homepage_title_variants

REPORT_DIR = ROOT / "reports" / f"home-ga4-post-cutover-{datetime.now().strftime('%Y%m%dT%H%M%S')}"
JSON_PATH = REPORT_DIR / "homepage-ga4-post-cutover.json"
MD_PATH = REPORT_DIR / "SUMMARY.md"


def main() -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    rows = get_homepage_title_variants(start_date="2026-06-28", end_date="today", limit=100)

    by_title = defaultdict(lambda: {"screenPageViews": 0, "sessions": 0, "activeUsers": 0, "dates": set()})
    for row in rows:
        item = by_title[row["pageTitle"]]
        item["screenPageViews"] += row["screenPageViews"]
        item["sessions"] += row["sessions"]
        item["activeUsers"] += row["activeUsers"]
        item["dates"].add(row["date"])

    summary = []
    for title, metrics in by_title.items():
        summary.append({
            "pageTitle": title,
            "screenPageViews": metrics["screenPageViews"],
            "sessions": metrics["sessions"],
            "activeUsers": metrics["activeUsers"],
            "dates": sorted(metrics["dates"]),
        })
    summary.sort(key=lambda x: x["screenPageViews"], reverse=True)

    payload = {
        "generatedAt": datetime.now().isoformat(),
        "range": {"startDate": "2026-06-28", "endDate": "today"},
        "rows": rows,
        "titles": summary,
    }
    JSON_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# Homepage GA4 post-cutover report",
        "",
        "- Range: `2026-06-28` -> `today`",
        f"- Total raw rows: `{len(rows)}`",
        "",
        "## Title summary",
        "",
    ]
    if summary:
        for item in summary:
            lines.extend([
                f"- `{item['pageTitle']}`",
                f"  - screenPageViews: `{item['screenPageViews']}`",
                f"  - sessions: `{item['sessions']}`",
                f"  - activeUsers: `{item['activeUsers']}`",
                f"  - dates: `{', '.join(item['dates'])}`",
            ])
    else:
        lines.append("- No homepage rows returned for the selected range.")

    MD_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(JSON_PATH)
    print(MD_PATH)


if __name__ == "__main__":
    main()
