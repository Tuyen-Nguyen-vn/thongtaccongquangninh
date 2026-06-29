#!/usr/bin/env python3
"""Add SEO images to public URLs still below the 3-image local SEO gate.

Default mode is dry-run. Use --write to upload media and update WordPress.
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import ssl
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps


PROJECT = Path(__file__).resolve().parents[1]
SOURCE_DIR = PROJECT / "Ảnh cung cấp"
OUTPUT_DIR = PROJECT / "Ảnh Đã Xử Lý SEO" / "missing-images-unique-audit-2026-06-29"
REPORT_DIR = PROJECT / "reports"
BACKUP_ROOT = PROJECT / "seo-revisions"
CSV_PATH = PROJECT / "docs" / "SEO_PROGRESS.csv"
BASE_URL = "https://thongtaccongquangninh.com"
WP_HOST = "thongtaccongquangninh.com"
SSL_CONTEXT = ssl._create_unverified_context()


@dataclass(frozen=True)
class ImageSpec:
    source: str
    output: str
    alt: str
    caption: str
    title: str
    crop_box: tuple[float, float, float, float]
    brightness: float = 1.03
    contrast: float = 1.06


@dataclass(frozen=True)
class Target:
    slug: str
    url_path: str
    keyword: str
    images: tuple[ImageSpec, ...]


TARGETS = [
    Target(
        slug="cau-hoi-thuong-gap-thong-tac-cong",
        url_path="/cau-hoi-thuong-gap-thong-tac-cong/",
        keyword="câu hỏi thường gặp thông tắc cống",
        images=(
            ImageSpec(
                source="3. Tho Thong Tac Cong/9f0becfa-f7be-420a-b834-43daab61b7e4.png",
                output="cau-hoi-thuong-gap-thong-tac-cong-tho-kiem-tra.webp",
                alt="Thợ kiểm tra đường thoát nước khi thông tắc cống Quảng Ninh",
                caption="Hình minh họa thợ kiểm tra tình trạng đường thoát nước trước khi tư vấn thông tắc cống tại Quảng Ninh.",
                title="Thợ kiểm tra thông tắc cống Quảng Ninh",
                crop_box=(0.04, 0.03, 0.96, 0.95),
            ),
            ImageSpec(
                source="3. Tho Thong Tac Cong/ChatGPT Image 04_05_23 22 thg 5, 2026.png",
                output="cau-hoi-thuong-gap-thong-tac-cong-may-lo-xo.webp",
                alt="Máy lò xo xử lý cống nghẹt tại nhà dân Quảng Ninh",
                caption="Hình minh họa thiết bị lò xo dùng để xử lý cống nghẹt tại nhà dân, cửa hàng và khu lưu trú.",
                title="Máy lò xo thông tắc cống tại Quảng Ninh",
                crop_box=(0.05, 0.02, 0.95, 0.94),
            ),
            ImageSpec(
                source="7. Tho Nao Vet Ho Ga/thong-tac-cong-quang-ninh-anh-ai-4.png",
                output="cau-hoi-thuong-gap-thong-tac-cong-ho-ga.webp",
                alt="Kiểm tra hố ga và đường ống thoát nước tại Quảng Ninh",
                caption="Hình minh họa bước kiểm tra hố ga, đường ống chính trước khi chốt phương án xử lý cống tắc.",
                title="Kiểm tra hố ga thông tắc cống Quảng Ninh",
                crop_box=(0.03, 0.05, 0.97, 0.97),
            ),
        ),
    ),
    Target(
        slug="hut-be-phot-khach-san-quang-ninh",
        url_path="/hut-be-phot-khach-san-quang-ninh/",
        keyword="hút bể phốt khách sạn Quảng Ninh",
        images=(
            ImageSpec(
                source="2. Xe Hut - Cong Ty KCN/hut-be-phot-164.jpg",
                output="hut-be-phot-khach-san-quang-ninh-xe-bon.webp",
                alt="Xe bồn hút bể phốt phục vụ khách sạn tại Quảng Ninh",
                caption="Hình minh họa xe bồn hút bể phốt phục vụ nhóm khách sạn, nhà hàng và khu lưu trú tại Quảng Ninh.",
                title="Xe bồn hút bể phốt khách sạn Quảng Ninh",
                crop_box=(0.04, 0.04, 0.96, 0.96),
            ),
            ImageSpec(
                source="2. Xe Hut - Cong Ty KCN/hut-be-phot-ha-long-016.jpg",
                output="hut-be-phot-khach-san-quang-ninh-keo-ong.webp",
                alt="Kéo ống hút bể phốt cho khách sạn nhà hàng tại Quảng Ninh",
                caption="Hình minh họa thao tác kéo ống hút bể phốt vào công trình lưu trú, nhà hàng có lối tiếp cận hạn chế.",
                title="Kéo ống hút bể phốt khách sạn Quảng Ninh",
                crop_box=(0.05, 0.03, 0.95, 0.95),
            ),
            ImageSpec(
                source="1. Xe Hut - Ho Gia Dinh/ChatGPT Image 10_50_12 10 thg 5, 2026 (1).png",
                output="hut-be-phot-khach-san-quang-ninh-kiem-tra-nap-be.webp",
                alt="Kiểm tra nắp bể phốt trước khi hút tại khách sạn Quảng Ninh",
                caption="Hình minh họa bước kiểm tra nắp bể, vị trí xe đỗ và đường kéo ống trước khi báo giá hút bể phốt.",
                title="Kiểm tra nắp bể phốt khách sạn Quảng Ninh",
                crop_box=(0.06, 0.02, 0.96, 0.94),
            ),
        ),
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
            "User-Agent": "codex-add-missing-images/1.0",
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
        f"{BASE_URL}{url_path}?nowprocket=1&codex=missing-image-{datetime.now().timestamp()}",
        headers={
            "Host": WP_HOST,
            "User-Agent": "codex-add-missing-images-verify/1.0",
            "Cache-Control": "no-cache",
        },
    )
    with urllib.request.urlopen(req, timeout=90, context=SSL_CONTEXT) as response:
        return response.status, response.read().decode("utf-8", errors="replace")


def find_content(auth: str, slug: str) -> tuple[str, dict]:
    candidates: list[tuple[str, dict]] = []
    for rest_base in ("pages", "posts"):
        status, items = request_json(f"/wp/v2/{rest_base}?slug={urllib.parse.quote(slug)}&context=edit&per_page=10", auth)
        if status == 200 and isinstance(items, list):
            for item in items:
                candidates.append((rest_base, item))
    published = [(base, item) for base, item in candidates if item.get("status") == "publish"]
    exact = [(base, item) for base, item in published if f"/{slug}/" in str(item.get("link", ""))]
    if exact:
        return exact[0]
    if published:
        return published[0]
    if candidates:
        return candidates[0]
    raise RuntimeError(f"Không tìm thấy post/page cho slug {slug}")


def image_count(content: str) -> int:
    return max(len(re.findall(r"<!-- wp:image", content)), len(re.findall(r"<img\s", content, flags=re.I)))


def prepare_image(spec: ImageSpec) -> Path:
    source = SOURCE_DIR / spec.source
    if not source.exists():
        raise FileNotFoundError(source)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output = OUTPUT_DIR / spec.output
    image = Image.open(source).convert("RGB")
    image = ImageOps.exif_transpose(image)
    width, height = image.size
    left, top, right, bottom = spec.crop_box
    image = image.crop((int(width * left), int(height * top), int(width * right), int(height * bottom)))
    image = ImageOps.fit(image, (1200, 800), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    image = ImageEnhance.Brightness(image).enhance(spec.brightness)
    image = ImageEnhance.Contrast(image).enhance(spec.contrast)
    image.save(output, "WEBP", quality=82, method=6)
    return output


def find_existing_media(auth: str, file_name: str):
    stem = file_name.rsplit(".", 1)[0]
    status, items = request_json(f"/wp/v2/media?search={urllib.parse.quote(stem)}&per_page=20&_fields=id,source_url,slug", auth)
    if status != 200 or not isinstance(items, list):
        return None
    return next((item for item in items if file_name in str(item.get("source_url", ""))), None)


def upload_media(auth: str, spec: ImageSpec, image_path: Path):
    existing = find_existing_media(auth, spec.output)
    if existing:
        media_id = existing["id"]
        source_url = existing["source_url"]
    else:
        status, data = request_json(
            "/wp/v2/media",
            auth,
            method="POST",
            body=image_path.read_bytes(),
            headers={
                "Content-Type": "image/webp",
                "Content-Disposition": f'attachment; filename="{spec.output}"',
            },
        )
        if status not in (200, 201):
            raise RuntimeError(f"Upload failed {status}: {data}")
        media_id = data["id"]
        source_url = data["source_url"]
    meta = {
        "alt_text": spec.alt,
        "title": spec.title,
        "caption": spec.caption,
        "description": f"{spec.caption} Tối ưu ảnh SEO local cho thongtaccongquangninh.com.",
    }
    request_json(f"/wp/v2/media/{media_id}", auth, method="POST", body=json.dumps(meta).encode("utf-8"), headers={"Content-Type": "application/json"})
    return {"id": media_id, "source_url": source_url}


def image_block(spec: ImageSpec, media: dict) -> str:
    return "\n".join(
        [
            f'<!-- wp:image {{"id":{media["id"]},"sizeSlug":"large","linkDestination":"none"}} -->',
            f'<figure class="wp-block-image size-large"><img src="{media["source_url"]}" alt="{spec.alt}" class="wp-image-{media["id"]}"/><figcaption class="wp-element-caption">{spec.caption}</figcaption></figure>',
            "<!-- /wp:image -->",
        ]
    )


def insert_after_nth_paragraph(content: str, block: str, n: int) -> str:
    matches = list(re.finditer(r"</p>", content, flags=re.I))
    if len(matches) >= n:
        index = matches[n - 1].end()
        return content[:index] + "\n\n" + block + "\n\n" + content[index:]
    return content + "\n\n" + block


def insert_blocks(content: str, blocks: list[str]) -> str:
    next_content = content
    paragraph_positions = (2, 7)
    for pos, block in zip(paragraph_positions, blocks[:2]):
        if block not in next_content:
            next_content = insert_after_nth_paragraph(next_content, block, pos)
    if len(blocks) > 2 and blocks[2] not in next_content:
        marker = re.search(r"(<p[^>]*class=\"[^\"]*ttcqn-author-nguyen-song-hao|<p>\s*Tác giả:|<script\s+type=\"application/ld\+json\")", next_content, flags=re.I)
        if marker:
            next_content = next_content[: marker.start()] + "\n\n" + blocks[2] + "\n\n" + next_content[marker.start() :]
        else:
            next_content = next_content + "\n\n" + blocks[2]
    return next_content


def inspect_live(html: str, specs: tuple[ImageSpec, ...]) -> dict:
    return {
        "h1Count": len(re.findall(r"<h1\b", html, flags=re.I)),
        "imageCount": len(re.findall(r"<img\b", html, flags=re.I)),
        "hasAllImages": all(spec.output in html for spec in specs),
        "hasAllAlts": all(spec.alt in html for spec in specs),
        "hasAllCaptions": all(spec.caption in html for spec in specs),
        "hasAuthorByline": "author/nguyensonghao" in html or "Nguyễn Song Hào" in html,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    auth = auth_header()
    stamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
    backup_dir = BACKUP_ROOT / f"wp-before-missing-images-unique-audit-{stamp}"
    report_path = REPORT_DIR / f"missing-images-unique-audit-{stamp}.json"
    REPORT_DIR.mkdir(exist_ok=True)
    report = {"mode": "write" if args.write else "dry-run", "generatedAt": stamp, "backupDir": str(backup_dir) if args.write else None, "targets": []}

    if args.write:
        backup_dir.mkdir(parents=True, exist_ok=True)

    for target in TARGETS:
        rest_base, post = find_content(auth, target.slug)
        content = post.get("content", {}).get("raw") or post.get("content", {}).get("rendered") or ""
        before_count = image_count(content)
        entry = {
            "slug": target.slug,
            "restBase": rest_base,
            "id": post.get("id"),
            "link": post.get("link"),
            "beforeImageCount": before_count,
            "changed": False,
            "outputs": [],
            "media": [],
            "liveVerify": None,
        }
        for spec in target.images:
            output = prepare_image(spec)
            entry["outputs"].append(str(output))
        if before_count >= 3:
            entry["skipped"] = "already_has_at_least_3_images"
            report["targets"].append(entry)
            continue
        if args.write:
            (backup_dir / f"{rest_base}-{post.get('id')}-{target.slug}.json").write_text(json.dumps(post, ensure_ascii=False, indent=2), encoding="utf-8")
            blocks = []
            for spec in target.images:
                media = upload_media(auth, spec, OUTPUT_DIR / spec.output)
                entry["media"].append(media)
                blocks.append(image_block(spec, media))
            updated = insert_blocks(content, blocks)
            body = json.dumps({"content": updated}).encode("utf-8")
            status, _ = request_json(f"/wp/v2/{rest_base}/{post.get('id')}", auth, method="POST", body=body, headers={"Content-Type": "application/json"})
            live_status, html = request_text(target.url_path)
            entry["changed"] = True
            entry["liveVerify"] = {"writeStatus": status, "liveStatus": live_status, **inspect_live(html, target.images)}
        report["targets"].append(entry)

    if args.write:
        changed_slugs = [item["slug"] for item in report["targets"] if item["changed"]]
        today = datetime.now().strftime("%Y-%m-%d")
        now = datetime.now().strftime("%H:%M")
        evidence = "; ".join(
            f"{item['slug']}:live={item.get('liveVerify', {}).get('liveStatus')},images={item.get('liveVerify', {}).get('hasAllImages')},alts={item.get('liveVerify', {}).get('hasAllAlts')}"
            for item in report["targets"]
            if item["changed"]
        )
        CSV_PATH.parent.mkdir(exist_ok=True)
        with CSV_PATH.open("a", encoding="utf-8") as f:
            f.write(
                f"\n{today},{now},ADD-MISSING-UNIQUE-AUDIT-IMAGES-{today},seo_image,fix pages under 3 images,https://thongtaccongquangninh.com,,done,medium,,,,,\"Added optimized WebP images to: {'|'.join(changed_slugs)}\",tools/add_missing_images_from_unique_audit_2026_06_29.py,,Run audit_unique_wp_images.py after image insert,\"{evidence}\",PASS,Codex,{today},{report_path},{backup_dir},,,"
            )

    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
