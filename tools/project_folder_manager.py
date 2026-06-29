#!/usr/bin/env python3
"""Read-only project folder manager for D:\\.thongtaccongquangninh.

The script scans the workspace, classifies files, and writes a durable status
report under reports/. It does not delete, move, publish, or edit live content.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable


DEFAULT_ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR_NAME = "reports"

IMPORTANT_PREFIXES = (
    "SEO_",
    "CONTENT_DRAFT_STATUS_",
    "WORDPRESS_",
    "CHATGPT_APPS_",
    "LOCAL_FIX_",
)

SKIP_DIR_NAMES = {
    ".git",
    "__pycache__",
    "node_modules",
    ".venv",
    "venv",
}


@dataclass
class FileInfo:
    path: str
    size: int
    modified: str
    category: str


def relpath(path: Path, root: Path) -> str:
    return str(path.relative_to(root)).replace("/", "\\")


def classify(path: Path, root: Path) -> str:
    relative = path.relative_to(root)
    parts = relative.parts
    name = path.name
    suffix = path.suffix.lower()

    if len(parts) == 1 and name in {"AGENTS.md", "CODEX_CONTEXT.md"}:
        return "context"
    if parts and parts[0] == "content-drafts":
        return "content-draft"
    if parts and parts[0] == "seo-revisions":
        return "seo-revision"
    if parts and parts[0] == "reports":
        return "report"
    if parts and parts[0] == "tools":
        return "tool-script"
    if parts and parts[0] in {".agents", ".sixth"}:
        return "agent-config"
    if name.startswith("WORDPRESS_"):
        return "wordpress-operation-log"
    if name.startswith("SEO_"):
        return "seo-status"
    if name.startswith("CONTENT_DRAFT_STATUS_"):
        return "content-status"
    if suffix in {".json", ".csv"}:
        return "data-output"
    if suffix in {".md", ".txt"}:
        return "document"
    return "other"


def is_junction_or_symlink(path: Path) -> bool:
    if path.is_symlink():
        return True
    try:
        import stat
        attrs = path.stat(follow_symlinks=False).st_file_attributes
        return bool(attrs & stat.FILE_ATTRIBUTE_REPARSE_POINT)
    except Exception:
        return False


def collect(root: Path) -> dict:
    files: list[FileInfo] = []
    category_counts: Counter[str] = Counter()
    category_sizes: Counter[str] = Counter()
    top_level_counts: Counter[str] = Counter()
    suffix_counts: Counter[str] = Counter()
    latest_by_category: dict[str, list[FileInfo]] = defaultdict(list)
    important: list[FileInfo] = []
    large: list[FileInfo] = []
    directory_count = 0

    def walk(dir_path: Path):
        nonlocal directory_count
        try:
            for p in dir_path.iterdir():
                if is_junction_or_symlink(p):
                    continue
                if p.is_dir():
                    if p.name in SKIP_DIR_NAMES:
                        continue
                    directory_count += 1
                    walk(p)
                else:
                    stat_val = p.stat()
                    category = classify(p, root)
                    info = FileInfo(
                        path=relpath(p, root),
                        size=stat_val.st_size,
                        modified=datetime.fromtimestamp(stat_val.st_mtime).isoformat(timespec="seconds"),
                        category=category,
                    )
                    files.append(info)
                    category_counts[category] += 1
                    category_sizes[category] += stat_val.st_size
                    suffix_counts[p.suffix.lower() or "[no extension]"] += 1
                    top_level = p.relative_to(root).parts[0]
                    top_level_counts[top_level] += 1
                    latest_by_category[category].append(info)
                    if p.name.startswith(IMPORTANT_PREFIXES) or info.path in {"AGENTS.md", "CODEX_CONTEXT.md"}:
                        important.append(info)
                    if stat_val.st_size >= 5 * 1024 * 1024:
                        large.append(info)
        except OSError:
            pass

    walk(root)

    def newest(items: list[FileInfo], limit: int = 10) -> list[dict]:
        ordered = sorted(items, key=lambda item: item.modified, reverse=True)
        return [asdict(item) for item in ordered[:limit]]

    latest_categories = {
        category: newest(items, 5)
        for category, items in sorted(latest_by_category.items())
    }

    return {
        "root": str(root),
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "totals": {
            "files": len(files),
            "directories": directory_count,
            "bytes": sum(item.size for item in files),
        },
        "category_counts": dict(category_counts.most_common()),
        "category_sizes": dict(category_sizes.most_common()),
        "top_level_counts": dict(top_level_counts.most_common()),
        "suffix_counts": dict(suffix_counts.most_common()),
        "latest_files": newest(files, 20),
        "latest_by_category": latest_categories,
        "important_files": newest(important, 20),
        "large_files": newest(large, 20),
        "recommendations": build_recommendations(category_counts, top_level_counts, large),
    }


def human_size(value: int) -> str:
    units = ["B", "KB", "MB", "GB"]
    amount = float(value)
    for unit in units:
        if amount < 1024 or unit == units[-1]:
            return f"{amount:.1f} {unit}" if unit != "B" else f"{int(amount)} B"
        amount /= 1024
    return f"{value} B"


def build_recommendations(
    category_counts: Counter[str],
    top_level_counts: Counter[str],
    large: list[FileInfo],
) -> list[str]:
    recommendations = [
        "Giữ `AGENTS.md` và `CODEX_CONTEXT.md` làm nguồn quy tắc vận hành.",
        "Không dọn `WORDPRESS_*.json` hoặc report live nếu chưa đối chiếu task liên quan.",
        "Khi cần dọn thật, tạo danh sách move-plan trước rồi chờ Tuyền duyệt.",
    ]
    if category_counts.get("report", 0) > 100:
        recommendations.append("Thư mục `reports` có nhiều file; nên gom theo tháng sau khi tạo danh sách duyệt.")
    if category_counts.get("content-draft", 0) > 20:
        recommendations.append("Thư mục `content-drafts` có nhiều draft; nên ưu tiên phân loại `đã live`, `chờ duyệt`, `cần sửa`.")
    if large:
        recommendations.append("Có file lớn; chỉ nén/chuyển sau khi kiểm tra không phải bằng chứng audit đang dùng.")
    if top_level_counts.get("tools", 0) > 20:
        recommendations.append("Thư mục `tools` có nhiều script; nên ghi script nào là read-only, script nào có thể sửa live.")
    return recommendations


def render_markdown(data: dict) -> str:
    lines: list[str] = []
    lines.append("# Báo cáo Agent Quản Lý Thư Mục")
    lines.append("")
    lines.append(f"- Root: `{data['root']}`")
    lines.append(f"- Thời điểm quét: `{data['generated_at']}`")
    lines.append(f"- Tổng file: **{data['totals']['files']}**")
    lines.append(f"- Tổng thư mục: **{data['totals']['directories']}**")
    lines.append(f"- Dung lượng quét: **{human_size(data['totals']['bytes'])}**")
    lines.append("")

    lines.append("## Nhóm file")
    lines.append("")
    for category, count in data["category_counts"].items():
        size = data["category_sizes"].get(category, 0)
        lines.append(f"- `{category}`: {count} file, {human_size(size)}")
    lines.append("")

    lines.append("## Thư mục cấp 1")
    lines.append("")
    for name, count in data["top_level_counts"].items():
        lines.append(f"- `{name}`: {count} file")
    lines.append("")

    lines.append("## File mới sửa gần nhất")
    lines.append("")
    for item in data["latest_files"][:12]:
        lines.append(f"- `{item['path']}` | `{item['category']}` | {item['modified']} | {human_size(item['size'])}")
    lines.append("")

    lines.append("## File quan trọng")
    lines.append("")
    for item in data["important_files"][:12]:
        lines.append(f"- `{item['path']}` | `{item['category']}` | {item['modified']}")
    lines.append("")

    if data["large_files"]:
        lines.append("## File lớn")
        lines.append("")
        for item in data["large_files"]:
            lines.append(f"- `{item['path']}` | {human_size(item['size'])} | {item['modified']}")
        lines.append("")

    lines.append("## Đề xuất")
    lines.append("")
    for recommendation in data["recommendations"]:
        lines.append(f"- {recommendation}")
    lines.append("")

    lines.append("## Nguyên tắc khi dọn")
    lines.append("")
    lines.append("- Chỉ tạo danh sách đề xuất, không xóa/chuyển file nếu chưa được Tuyền duyệt.")
    lines.append("- Phân biệt rõ `local`, `draft`, `live`, `report` trước khi báo xong.")
    lines.append("- Với việc liên quan WordPress live, phải backup/dry-run/re-audit theo `AGENTS.md`.")
    return "\n".join(lines) + "\n"


def write_reports(data: dict, reports_dir: Path) -> tuple[Path, Path]:
    reports_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    json_path = reports_dir / f"project-folder-manager-{stamp}.json"
    md_path = reports_dir / f"project-folder-manager-{stamp}.md"
    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    md_path.write_text(render_markdown(data), encoding="utf-8")
    return md_path, json_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Read-only project folder manager.")
    parser.add_argument("--root", default=str(DEFAULT_ROOT), help="Project root to scan.")
    parser.add_argument("--no-write", action="store_true", help="Do not write reports.")
    parser.add_argument("--stdout-json", action="store_true", help="Print JSON summary to stdout.")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Project root not found: {root}")

    data = collect(root)

    if not args.no_write:
        md_path, json_path = write_reports(data, root / REPORTS_DIR_NAME)
        print(f"Markdown report: {md_path}")
        print(f"JSON report: {json_path}")

    if args.stdout_json:
        print(json.dumps(data, ensure_ascii=False, indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
