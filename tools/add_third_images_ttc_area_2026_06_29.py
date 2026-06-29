#!/usr/bin/env python3
"""Add a third SEO image to TTC area pages that still have only two images.

Default mode is dry-run. Use --write to upload media and update WordPress.
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps


PROJECT = Path(__file__).resolve().parents[1]
SOURCE_DIR = PROJECT / "Ảnh cung cấp" / "3. Tho Thong Tac Cong"
OUTPUT_DIR = PROJECT / "Ảnh Đã Xử Lý SEO" / "ttc-area-third-images-2026-06-29"
REPORT_DIR = PROJECT / "reports"
BACKUP_ROOT = PROJECT / "seo-revisions"
CSV_PATH = PROJECT / "docs" / "SEO_PROGRESS.csv"
BASE_URL = "https://thongtaccongquangninh.com"
WP_HOST = "thongtaccongquangninh.com"
SERVER_IP = "103.57.220.210"
AUTHOR_MARKER = 'wp:paragraph {"className":"ttcqn-author-nguyen-song-hao'
SSL_CONTEXT = ssl._create_unverified_context()


@dataclass(frozen=True)
class Target:
    rest_base: str
    post_id: int
    slug: str
    url_path: str
    source_file: str
    output_file: str
    alt: str
    caption: str
    title: str
    insert_after_heading: str
    crop_box: tuple[float, float, float, float]
    brightness: float
    contrast: float


TARGETS = [
    Target(
        rest_base="pages",
        post_id=296,
        slug="thong-tac-cong-ha-long",
        url_path="/thong-tac-cong-ha-long/",
        source_file="anh-seo-063.png",
        output_file="thong-tac-cong-ha-long-kiem-tra-ho-ga.webp",
        alt="Thợ kiểm tra hố ga khi thông tắc cống Hạ Long không đục phá",
        caption="Hình minh họa bước kiểm tra hố ga, xác định điểm nghẹt trước khi thông tắc cống tại Hạ Long.",
        title="Kiểm tra hố ga thông tắc cống Hạ Long",
        insert_after_heading="Quy trình",
        crop_box=(0.04, 0.03, 0.96, 0.95),
        brightness=1.04,
        contrast=1.06,
    ),
    Target(
        rest_base="posts",
        post_id=2041,
        slug="thong-tac-cong-tuan-chau",
        url_path="/thong-tac-cong-tuan-chau/",
        source_file="anh-seo-085.png",
        output_file="thong-tac-cong-tuan-chau-kiem-tra-duong-ong.webp",
        alt="Kiểm tra đường ống thoát nước khi thông tắc cống Tuần Châu Hạ Long",
        caption="Hình minh họa thao tác kiểm tra đường ống thoát nước tại khu lưu trú, nhà hàng ở Tuần Châu.",
        title="Kiểm tra đường ống thông tắc cống Tuần Châu",
        insert_after_heading="Quy trình",
        crop_box=(0.06, 0.02, 0.98, 0.94),
        brightness=1.03,
        contrast=1.08,
    ),
    Target(
        rest_base="posts",
        post_id=2054,
        slug="thong-tac-cong-bai-chay",
        url_path="/thong-tac-cong-bai-chay/",
        source_file="anh-seo-091.png",
        output_file="thong-tac-cong-bai-chay-xu-ly-duong-thoat.webp",
        alt="Thợ xử lý đường thoát nước khi thông tắc cống Bãi Cháy Hạ Long",
        caption="Hình minh họa thợ xử lý đường thoát nước tại khu nhà hàng, khách sạn Bãi Cháy.",
        title="Xử lý đường thoát nước thông tắc cống Bãi Cháy",
        insert_after_heading="Quy trình",
        crop_box=(0.02, 0.05, 0.94, 0.97),
        brightness=1.05,
        contrast=1.05,
    ),
]


def parse_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        match = re.match(r"^\s*([^#=\s]+)\s*=\s*(.*)\s*$", line)
        if match:
            env[match.group(1)] = match.group(2).strip().strip("\"'")
    return env


def auth_header() -> str:
    env = parse_env(PROJECT / ".env")
    return "Basic " + base64.b64encode(f"{env['WP_USERNAME']}:{env['WP_APP_PASSWORD']}".encode()).decode()


def request_json(path: str, auth: str, method: str = "GET", body: bytes | None = None, headers: dict[str, str] | None = None):
    req = urllib.request.Request(
        f"{BASE_URL}/wp-json{path}",
        data=body,
        method=method,
        headers={
            "Host": WP_HOST,
            "Authorization": auth,
            "User-Agent": "codex-add-ttc-third-images/1.0",
            **(headers or {}),
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90, context=SSL_CONTEXT) as response:
            raw = response.read().decode("utf-8-sig", errors="replace")
            return response.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {error.code} {path}: {raw[:500]}") from error


def request_text(url_path: str) -> tuple[int, str]:
    req = urllib.request.Request(
        f"{BASE_URL}{url_path}",
        headers={
            "Host": WP_HOST,
            "User-Agent": "codex-add-ttc-third-images-verify/1.0",
            "Cache-Control": "no-cache",
        },
    )
    with urllib.request.urlopen(req, timeout=90, context=SSL_CONTEXT) as response:
        return response.status, response.read().decode("utf-8", errors="replace")


def strip_tags(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", value or "")).strip()


def image_count(content: str) -> int:
    return max(len(re.findall(r"<!-- wp:image", content)), len(re.findall(r"<img\s", content, flags=re.I)))


def prepare_image(target: Target) -> Path:
    source = SOURCE_DIR / target.source_file
    if not source.exists():
        raise FileNotFoundError(source)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output = OUTPUT_DIR / target.output_file
    image = Image.open(source).convert("RGB")
    image = ImageOps.exif_transpose(image)
    width, height = image.size
    left, top, right, bottom = target.crop_box
    box = (
        int(width * left),
        int(height * top),
        int(width * right),
        int(height * bottom),
    )
    image = image.crop(box)
    image = ImageOps.fit(image, (1200, 800), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    image = ImageEnhance.Brightness(image).enhance(target.brightness)
    image = ImageEnhance.Contrast(image).enhance(target.contrast)
    image.save(output, "WEBP", quality=82, method=6)
    return output


def find_existing_media(auth: str, file_name: str):
    stem = file_name.rsplit(".", 1)[0]
    status, items = request_json(f"/wp/v2/media?search={urllib.parse.quote(stem)}&per_page=20&_fields=id,source_url,slug", auth)
    if status != 200 or not isinstance(items, list):
        return None
    return next((item for item in items if file_name in str(item.get("source_url", ""))), None)


def upload_media(auth: str, target: Target, image_path: Path):
    existing = find_existing_media(auth, target.output_file)
    if existing:
        media_id = existing["id"]
        source_url = existing["source_url"]
    else:
        body = image_path.read_bytes()
        status, data = request_json(
            "/wp/v2/media",
            auth,
            method="POST",
            body=body,
            headers={
                "Content-Type": "image/webp",
                "Content-Disposition": f'attachment; filename="{target.output_file}"',
            },
        )
        if status not in (200, 201):
            raise RuntimeError(f"Upload failed {status}: {data}")
        media_id = data["id"]
        source_url = data["source_url"]
    meta = {
        "alt_text": target.alt,
        "title": target.title,
        "caption": target.caption,
        "description": f"{target.caption} Tối ưu ảnh SEO cho bài {target.slug}.",
    }
    request_json(f"/wp/v2/media/{media_id}", auth, method="POST", body=json.dumps(meta).encode("utf-8"), headers={"Content-Type": "application/json"})
    return {"id": media_id, "source_url": source_url}


def image_block(target: Target, media: dict) -> str:
    return "\n".join(
        [
            f'<!-- wp:image {{"id":{media["id"]},"sizeSlug":"large","linkDestination":"none"}} -->',
            f'<figure class="wp-block-image size-large"><img src="{media["source_url"]}" alt="{target.alt}" class="wp-image-{media["id"]}"/><figcaption class="wp-element-caption">{target.caption}</figcaption></figure>',
            "<!-- /wp:image -->",
        ]
    )


def insert_block(content: str, block: str, target: Target) -> str:
    if target.output_file in content:
        return content
    marker_index = content.find(f'<!-- {AUTHOR_MARKER}')
    insertion = "\n" + block + "\n"
    if marker_index != -1:
        return content[:marker_index] + insertion + content[marker_index:]
    heading_match = re.search(rf"(<h[23][^>]*>[^<]*{re.escape(target.insert_after_heading)}[^<]*</h[23]>[\s\S]{{0,1800}}?</p>)", content, flags=re.I)
    if heading_match:
        return content[: heading_match.end()] + insertion + content[heading_match.end() :]
    return content + insertion


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    auth = auth_header()
    stamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
    backup_dir = BACKUP_ROOT / f"wp-before-ttc-third-images-{stamp}"
    report_path = REPORT_DIR / f"ttc-third-images-{stamp}.json"
    REPORT_DIR.mkdir(exist_ok=True)
    report = {"mode": "write" if args.write else "dry-run", "generatedAt": stamp, "backupDir": str(backup_dir) if args.write else None, "targets": []}

    for target in TARGETS:
        output = prepare_image(target)
        status, post = request_json(f"/wp/v2/{target.rest_base}/{target.post_id}?context=edit", auth)
        if status != 200:
            raise RuntimeError(f"Cannot fetch {target.slug}: {status}")
        if post.get("slug") != target.slug:
            raise RuntimeError(f"Slug mismatch for {target.post_id}: {post.get('slug')} != {target.slug}")
        content = post.get("content", {}).get("raw") or ""
        before_count = image_count(content)
        media = {"id": 0, "source_url": f"https://{WP_HOST}/wp-content/uploads/dry-run/{target.output_file}"}
        if before_count >= 3:
            report["targets"].append(
                {
                    "slug": target.slug,
                    "id": target.post_id,
                    "source": str(SOURCE_DIR / target.source_file),
                    "output": str(output),
                    "beforeImageCount": before_count,
                    "changed": False,
                    "skipped": "already_has_at_least_3_images",
                    "media": None,
                    "liveVerify": None,
                }
            )
            continue
        if args.write:
            media = upload_media(auth, target, output)
        block = image_block(target, media)
        next_content = insert_block(content, block, target)
        changed = next_content != content
        live_verify = None
        if args.write and changed:
            backup_dir.mkdir(parents=True, exist_ok=True)
            (backup_dir / f"{target.rest_base}-{target.post_id}-{target.slug}.json").write_text(json.dumps(post, ensure_ascii=False, indent=2), encoding="utf-8")
            body = json.dumps({"content": next_content}).encode("utf-8")
            write_status, _ = request_json(
                f"/wp/v2/{target.rest_base}/{target.post_id}",
                auth,
                method="POST",
                body=body,
                headers={"Content-Type": "application/json"},
            )
            live_status, html = request_text(f"{target.url_path}?nowprocket=1&codex=ttc-third-image-{int(time.time())}")
            live_verify = {
                "writeStatus": write_status,
                "liveStatus": live_status,
                "h1Count": len(re.findall(r"<h1\b", html, flags=re.I)),
                "hasImage": target.output_file in html,
                "hasAlt": target.alt in html,
                "hasCaption": target.caption in html,
                "hasAuthorByline": "nguyensonghao" in html or "Nguyễn Song Hào" in strip_tags(html),
            }
        report["targets"].append(
            {
                "slug": target.slug,
                "id": target.post_id,
                "source": str(SOURCE_DIR / target.source_file),
                "output": str(output),
                "beforeImageCount": before_count,
                "changed": changed,
                "media": media if args.write else None,
                "liveVerify": live_verify,
            }
        )

    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.write:
        today = datetime.now().strftime("%Y-%m-%d")
        clock = datetime.now().strftime("%H:%M")
        fixed = [item["slug"] for item in report["targets"] if item["changed"]]
        CSV_PATH.write_text(
            CSV_PATH.read_text(encoding="utf-8")
            + f'\n{today},{clock},ADD-TTC-AREA-THIRD-IMAGES-2026-06-29,seo_image,add third images to TTC area warnings,{BASE_URL},,done,medium,,,,,"Added third optimized WebP images to: {"|".join(fixed)}",tools/add_third_images_ttc_area_2026_06_29.py,,Run audit_ttc_area_pages and audit_unique_wp_images.py,"report={report_path}; backup={backup_dir}",PASS,Codex,2026-06-29,{report_path},{backup_dir},,,',
            encoding="utf-8",
        )
    print(json.dumps({"report": str(report_path), "mode": report["mode"], "targets": report["targets"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
