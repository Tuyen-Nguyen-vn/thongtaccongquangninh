#!/usr/bin/env python3
"""Optimize desktop service photos, upload to WordPress, and fill pages under 3 content images."""

from __future__ import annotations

import argparse
import base64
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageOps


PROJECT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_DIR = Path("/mnt/c/Users/DELL/Desktop/ẢNH")
DEFAULT_ENV_PATH = Path(
    "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env"
)
BASE_URL = "https://thongtaccongquangninh.com"
MAX_IMAGE_KB = 450


@dataclass(frozen=True)
class Assignment:
    source_file: str
    target_path: str
    new_file: str
    alt: str
    caption: str
    position: str
    note: str


ASSIGNMENTS = [
    Assignment(
        "IMG_20251219_120036.jpg",
        "/",
        "doi-xe-moi-truong-so-1-quang-ninh.webp",
        "Đội xe Môi Trường Đô Thị Số 1 Quảng Ninh phục vụ hút bể phốt và thông tắc cống",
        "Ảnh thực tế đội xe dịch vụ môi trường đô thị tại Quảng Ninh.",
        "sau mở bài",
        "Ảnh đội xe/thương hiệu, dùng cho trang chủ; người dùng xác nhận là ảnh thực tế.",
    ),
    Assignment(
        "f7ff60e9-3289-43b4-8160-3ded6108d908.png",
        "/hut-be-phot-ha-long/",
        "hut-be-phot-ha-long-xe-bon-quang-ninh.webp",
        "Xe bồn hút bể phốt Hạ Long Quảng Ninh",
        "Ảnh thực tế xe bồn hút bể phốt phục vụ khu vực Hạ Long, Quảng Ninh.",
        "quy trình",
        "Ảnh xe bồn ngoài trời, phù hợp dịch vụ hút bể phốt.",
    ),
    Assignment(
        "IMG_20260111_165116.jpg",
        "/thong-tac-bon-cau-quang-ninh/",
        "thong-tac-bon-cau-quang-ninh-may-lo-xo.webp",
        "Thợ thông tắc bồn cầu Quảng Ninh bằng máy lò xo",
        "Ảnh thực tế thợ xử lý thông tắc bồn cầu bằng máy lò xo tại Quảng Ninh.",
        "quy trình",
        "Ảnh bồn cầu/máy lò xo, phù hợp trang bồn cầu Quảng Ninh.",
    ),
    Assignment(
        "file_000000004a487209a493eaba60f431dc.png",
        "/thong-tac-bon-cau-ha-long/",
        "thong-tac-bon-cau-ha-long-khong-duc-pha.webp",
        "Thợ thông tắc bồn cầu Hạ Long không đục phá",
        "Ảnh thực tế quy trình thông tắc bồn cầu không đục phá tại Hạ Long.",
        "quy trình",
        "Ảnh bồn cầu/máy lò xo, người dùng xác nhận là ảnh thực tế.",
    ),
    Assignment(
        "1770505230503.png",
        "/thong-tac-cong-quang-ninh/",
        "thong-tac-cong-quang-ninh-ho-ga-ngoai-troi.webp",
        "Thợ thông tắc cống Quảng Ninh tại hố ga ngoài trời",
        "Ảnh thực tế thợ kiểm tra hố ga, đường cống ngoài trời tại Quảng Ninh.",
        "case study",
        "Ảnh hố ga/cống ngoài trời, phù hợp trang thông tắc cống.",
    ),
    Assignment(
        "1771169573711.png",
        "/thong-tac-cong-cam-pha/",
        "thong-tac-cong-cam-pha-may-lo-xo.webp",
        "Thợ thông tắc cống Cẩm Phả bằng máy lò xo",
        "Ảnh thực tế quy trình thông tắc cống bằng máy lò xo tại Cẩm Phả.",
        "quy trình",
        "Ảnh máy lò xo ngoài trời, người dùng xác nhận là ảnh thực tế.",
    ),
    Assignment(
        "IMG_20260130_063106.png",
        "/hut-be-phot-quang-ninh/",
        "hut-be-phot-quang-ninh-xe-bon-khu-cong-trinh.webp",
        "Xe bồn hút bể phốt Quảng Ninh tại khu công trình",
        "Ảnh thực tế xe bồn hút bể phốt phục vụ công trình tại Quảng Ninh.",
        "quy trình",
        "Ảnh xe bồn/ống hút, phù hợp hút bể phốt Quảng Ninh.",
    ),
    Assignment(
        "IMG_20260208_190420.png",
        "/hut-be-phot-uong-bi/",
        "hut-be-phot-uong-bi-xe-bon-ong-hut.webp",
        "Xe bồn hút bể phốt Uông Bí kéo ống hút",
        "Ảnh thực tế xe bồn và ống hút xử lý bể phốt tại Uông Bí.",
        "quy trình",
        "Ảnh xe bồn kéo ống, người dùng xác nhận là ảnh thực tế.",
    ),
    Assignment(
        "d84324b9-4cca-42b8-8e62-543f050b17c9.png",
        "/thong-tac-cong-uong-bi/",
        "thong-tac-cong-uong-bi-may-lo-xo-trong-nha.webp",
        "Thợ thông tắc cống Uông Bí bằng máy lò xo trong nhà",
        "Ảnh thực tế thợ dùng máy lò xo xử lý đường cống trong nhà tại Uông Bí.",
        "quy trình",
        "Ảnh máy lò xo trong nhà, phù hợp thông tắc cống.",
    ),
    Assignment(
        "b44111c1-b556-421c-aa97-a744c5542643.png",
        "/thong-tac-cong-quang-yen/",
        "thong-tac-cong-quang-yen-ho-ga-xe-bon.webp",
        "Thông tắc cống Quảng Yên kết hợp kiểm tra hố ga và xe bồn",
        "Ảnh thực tế kiểm tra hố ga, đường cống và xe bồn hỗ trợ tại Quảng Yên.",
        "case study",
        "Ảnh hố ga/xe bồn, phù hợp tình huống cống/hố ga.",
    ),
    Assignment(
        "1776658860791.png",
        "/thong-tac-chau-rua-quang-ninh/",
        "thong-tac-chau-rua-quang-ninh-tu-bep.webp",
        "Thợ thông tắc chậu rửa Quảng Ninh xử lý ống thoát dưới tủ bếp",
        "Ảnh thực tế thợ xử lý ống thoát chậu rửa dưới tủ bếp tại Quảng Ninh.",
        "quy trình",
        "Ảnh tủ bếp/chậu rửa, đúng dịch vụ thông tắc chậu rửa.",
    ),
    Assignment(
        "FB_IMG_1767165147685.jpg",
        "/thong-tac-cong-nha-hang-ha-long/",
        "thong-tac-cong-nha-hang-ha-long-san-bep.webp",
        "Thợ thông tắc cống nhà hàng Hạ Long tại khu bếp",
        "Ảnh thực tế xử lý đường cống, thoát sàn khu bếp nhà hàng tại Hạ Long.",
        "case study",
        "Ảnh khu bếp/thoát sàn, phù hợp trang cống nhà hàng.",
    ),
]


def parse_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        match = re.match(r"^\s*([^#=\s]+)\s*=\s*(.*)\s*$", line)
        if match:
            env[match.group(1)] = match.group(2).strip().strip("\"'")
    return env


def wp_request(base_url: str, auth: str, path: str, method: str = "GET", body: bytes | None = None, headers=None):
    request = urllib.request.Request(
        f"{base_url}/wp-json{path}",
        data=body,
        method=method,
        headers={
            "Authorization": auth,
            "User-Agent": "Codex SEO desktop image optimizer",
            **(headers or {}),
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            raw = response.read()
            ctype = response.headers.get("Content-Type", "")
            if "application/json" in ctype:
                return json.loads(raw.decode("utf-8-sig") or "{}")
            return raw
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw)
            message = payload.get("message", raw)
        except Exception:
            message = raw
        raise RuntimeError(f"WordPress {error.code} {path}: {message}") from error


def public_request(url: str) -> tuple[int, str]:
    request = urllib.request.Request(url, headers={"User-Agent": "Codex SEO desktop image verifier"})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return response.status, response.read().decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode("utf-8", errors="ignore")


def optimize_image(src: Path, dest: Path, max_kb: int = MAX_IMAGE_KB) -> dict:
    image = ImageOps.exif_transpose(Image.open(src))
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")
    if image.mode == "RGBA":
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.getchannel("A"))
        image = background
    original_size = image.size
    max_side = 1600
    if max(image.size) > max_side:
        image.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    quality = 82
    while True:
        dest.parent.mkdir(parents=True, exist_ok=True)
        image.save(dest, "WEBP", quality=quality, method=6)
        size_kb = round(dest.stat().st_size / 1024, 1)
        if size_kb <= max_kb or quality <= 58:
            break
        quality -= 6
    return {
        "source": str(src),
        "output": str(dest),
        "originalSize": original_size,
        "outputSize": image.size,
        "quality": quality,
        "fileSizeKb": size_kb,
    }


def slug_from_path(pathname: str) -> str:
    return "" if pathname == "/" else pathname.strip("/")


def find_content_object(base_url: str, auth: str, target_path: str):
    if target_path == "/":
        settings = wp_request(base_url, auth, "/wp/v2/settings")
        page_id = int(settings.get("page_on_front") or 0)
        if not page_id:
            return None
        page = wp_request(base_url, auth, f"/wp/v2/pages/{page_id}?context=edit")
        return "pages", page
    slug = urllib.parse.quote(slug_from_path(target_path))
    for type_name in ("pages", "posts"):
        items = wp_request(
            base_url,
            auth,
            f"/wp/v2/{type_name}?slug={slug}&status=publish,draft,pending,private,future&context=edit",
        )
        if isinstance(items, list) and items:
            return type_name, items[0]
    return None


def image_count(content: str) -> int:
    return len(re.findall(r"<img\b", content or "", flags=re.I))


def escape_html(text: str) -> str:
    return (
        str(text or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def figure_html(media: dict, item: Assignment) -> str:
    return (
        f'<!-- wp:image {{"id":{media["id"]},"sizeSlug":"large","linkDestination":"none"}} -->\n'
        f'<figure class="wp-block-image size-large"><img src="{media["source_url"]}" '
        f'alt="{escape_html(item.alt)}" class="wp-image-{media["id"]}"/>'
        f'<figcaption class="wp-element-caption">{escape_html(item.caption)}</figcaption></figure>\n'
        "<!-- /wp:image -->"
    )


def insert_figure(content: str, figure: str, position: str) -> str:
    if re.search(r"đầu bài|sau mở bài|gioi thieu|giới thiệu", position, flags=re.I):
        match = re.search(r"</p>", content or "", flags=re.I)
        if match:
            index = match.end()
            return f"{content[:index]}\n\n{figure}\n\n{content[index:]}"
    if re.search(r"case|khách hàng|tình huống", position, flags=re.I):
        match = re.search(r"<h2[^>]*>[\s\S]*?(case|khách hàng|tình huống|e-e-a-t|niềm tin)[\s\S]*?</h2>", content or "", flags=re.I)
        if match:
            return f"{content[:match.start()]}\n\n{figure}\n\n{content[match.start():]}"
    if re.search(r"quy trình|thi công|xử lý", position, flags=re.I):
        match = re.search(r"<h2[^>]*>[\s\S]*?(quy trình|thi công|xử lý)[\s\S]*?</h2>", content or "", flags=re.I)
        if match:
            return f"{content[:match.start()]}\n\n{figure}\n\n{content[match.start():]}"
    match = re.search(r"<h2[^>]*>[\s\S]*?(gọi|liên hệ|nap)[\s\S]*?</h2>", content or "", flags=re.I)
    if match:
        return f"{content[:match.start()]}\n\n{figure}\n\n{content[match.start():]}"
    return f"{content}\n\n{figure}"


def find_existing_media(base_url: str, auth: str, file_name: str):
    stem = Path(file_name).stem
    items = wp_request(base_url, auth, f"/wp/v2/media?search={urllib.parse.quote(stem)}&per_page=20")
    if isinstance(items, list):
        for item in items:
            if file_name in str(item.get("source_url", "")):
                return item
    return None


def upload_media(base_url: str, auth: str, file_path: Path, item: Assignment, dry_run: bool):
    existing = find_existing_media(base_url, auth, item.new_file)
    if existing:
        return existing, False
    if dry_run:
        return {"id": 0, "source_url": f"DRY_RUN/{item.new_file}"}, False
    media = wp_request(
        base_url,
        auth,
        "/wp/v2/media",
        method="POST",
        body=file_path.read_bytes(),
        headers={
            "Content-Type": "image/webp",
            "Content-Disposition": f'attachment; filename="{item.new_file}"',
        },
    )
    wp_request(
        base_url,
        auth,
        f"/wp/v2/media/{media['id']}",
        method="POST",
        body=json.dumps(
            {
                "alt_text": item.alt,
                "caption": item.caption,
                "description": item.note,
                "title": Path(item.new_file).stem.replace("-", " "),
            },
            ensure_ascii=False,
        ).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    return media, True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", default=str(DEFAULT_SOURCE_DIR))
    parser.add_argument("--env", default=str(DEFAULT_ENV_PATH))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    source_dir = Path(args.source_dir)
    env_path = Path(args.env)
    stamp = time.strftime("%Y-%m-%dT%H-%M-%S")
    optimized_dir = PROJECT / "_tmp" / f"desktop-anh-seo-optimized-{stamp}"
    backup_dir = PROJECT / "seo-revisions" / f"wp-before-desktop-image-seo-{stamp}"
    report_path = PROJECT / f"WORDPRESS_DESKTOP_IMAGE_SEO_{stamp}.json"
    backup_dir.mkdir(parents=True, exist_ok=True)

    env = parse_env(env_path)
    base_url = env.get("WP_BASE_URL") or BASE_URL
    username = env["WP_USERNAME"]
    password = env["WP_APP_PASSWORD"]
    auth = "Basic " + base64.b64encode(f"{username}:{password}".encode()).decode()

    optimized = []
    uploads = []
    inserted = []
    skipped = []
    page_summary = []
    verify = []

    for item in ASSIGNMENTS:
        src = source_dir / item.source_file
        if not src.exists():
            skipped.append({"targetPath": item.target_path, "file": item.source_file, "reason": "Không tìm thấy ảnh nguồn"})
            continue
        output = optimized_dir / item.new_file
        optimized_info = optimize_image(src, output)
        optimized.append({**optimized_info, "targetPath": item.target_path, "alt": item.alt, "caption": item.caption})

        found = find_content_object(base_url, auth, item.target_path)
        if not found:
            skipped.append({"targetPath": item.target_path, "file": item.new_file, "reason": "Không tìm thấy page/post"})
            continue
        type_name, content_object = found
        content = content_object.get("content", {}).get("raw") or content_object.get("content", {}).get("rendered") or ""
        before_images = image_count(content)
        page = {
            "targetPath": item.target_path,
            "type": type_name,
            "id": content_object.get("id"),
            "title": content_object.get("title", {}).get("raw") or content_object.get("title", {}).get("rendered") or "",
            "link": content_object.get("link"),
            "beforeImages": before_images,
            "afterImages": before_images,
            "inserted": False,
        }
        if before_images >= 3:
            skipped.append({"targetPath": item.target_path, "file": item.new_file, "reason": "Nội dung đã có >=3 ảnh"})
            page_summary.append(page)
            continue

        media, uploaded = upload_media(base_url, auth, output, item, args.dry_run)
        uploads.append({"file": item.new_file, "mediaId": media.get("id"), "url": media.get("source_url"), "uploaded": uploaded})

        if item.new_file in content or str(media.get("source_url")) in content:
            skipped.append({"targetPath": item.target_path, "file": item.new_file, "reason": "Ảnh đã có trong nội dung"})
            page["afterImages"] = before_images
            page_summary.append(page)
            continue

        next_content = insert_figure(content, figure_html(media, item), item.position)
        if not args.dry_run:
            backup_path = backup_dir / f"{type_name}-{content_object['id']}-{slug_from_path(item.target_path) or 'home'}.json"
            backup_path.write_text(json.dumps(content_object, ensure_ascii=False, indent=2), encoding="utf-8")
            wp_request(
                base_url,
                auth,
                f"/wp/v2/{type_name}/{content_object['id']}",
                method="POST",
                body=json.dumps({"content": next_content}, ensure_ascii=False).encode("utf-8"),
                headers={"Content-Type": "application/json"},
            )
        page["afterImages"] = before_images + 1
        page["inserted"] = True
        page_summary.append(page)
        inserted.append(
            {
                "targetPath": item.target_path,
                "id": content_object.get("id"),
                "type": type_name,
                "file": item.new_file,
                "mediaId": media.get("id"),
                "alt": item.alt,
                "caption": item.caption,
                "position": item.position,
                "link": content_object.get("link"),
            }
        )

    if not args.dry_run:
        for page in page_summary:
            found = find_content_object(base_url, auth, page["targetPath"])
            if not found:
                verify.append({**page, "found": False})
                continue
            type_name, content_object = found
            content = content_object.get("content", {}).get("raw") or content_object.get("content", {}).get("rendered") or ""
            status, html = public_request(page["link"])
            inserted_file = next((x["file"] for x in inserted if x["targetPath"] == page["targetPath"]), "")
            verify.append(
                {
                    **page,
                    "found": True,
                    "restImageCount": image_count(content),
                    "liveStatus": status,
                    "liveHasInsertedFile": bool(inserted_file and inserted_file in html),
                    "restHasInsertedFile": bool(inserted_file and inserted_file in content),
                }
            )

    result = {
        "ok": True,
        "dryRun": args.dry_run,
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "sourceDir": str(source_dir),
        "optimizedDir": str(optimized_dir),
        "backupDir": str(backup_dir),
        "maxImageKb": MAX_IMAGE_KB,
        "assignments": [item.__dict__ for item in ASSIGNMENTS],
        "optimized": optimized,
        "uploads": uploads,
        "inserted": inserted,
        "skipped": skipped,
        "pageSummary": page_summary,
        "verify": verify,
    }
    report_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"reportPath": str(report_path), **result}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
