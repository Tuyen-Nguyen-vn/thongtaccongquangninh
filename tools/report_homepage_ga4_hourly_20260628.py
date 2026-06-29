import json
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.google_apis.ga4 import get_homepage_title_variants_by_hour


REPORT_DIR = ROOT / "reports" / f"home-ga4-hourly-20260628-{datetime.now().strftime('%Y%m%dT%H%M%S')}"
JSON_PATH = REPORT_DIR / "homepage-ga4-hourly-20260628.json"
MD_PATH = REPORT_DIR / "SUMMARY.md"
TARGET_DATE = "2026-06-28"


def main() -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    rows = get_homepage_title_variants_by_hour(TARGET_DATE, limit=200)

    by_hour = defaultdict(list)
    for row in rows:
        by_hour[row["dateHour"]].append(row)

    payload = {
        "generatedAt": datetime.now().isoformat(),
        "date": TARGET_DATE,
        "rows": rows,
        "hours": {hour: items for hour, items in sorted(by_hour.items())},
    }
    JSON_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# Homepage GA4 hourly report",
        "",
        f"- Date: `{TARGET_DATE}`",
        f"- Total raw rows: `{len(rows)}`",
        "",
        "## Hour breakdown",
        "",
    ]
    if rows:
        for hour, items in sorted(by_hour.items()):
            lines.append(f"- `{hour}`")
            for item in items:
                lines.append(
                    f"  - `{item['pageTitle']}` | views=`{item['screenPageViews']}` sessions=`{item['sessions']}` users=`{item['activeUsers']}`"
                )
    else:
        lines.append("- No homepage rows returned for this date.")

    MD_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(JSON_PATH)
    print(MD_PATH)


if __name__ == "__main__":
    main()
