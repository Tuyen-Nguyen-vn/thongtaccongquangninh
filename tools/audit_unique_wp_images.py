#!/usr/bin/env python3
"""Audit WordPress SEO images and optionally replace duplicate usages with unique variants.

Default mode is read-only. Use --fix to upload replacement WebP variants and update post_content.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import html
import io
import json
import math
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageOps


PROJECT = Path(__file__).resolve().parents[1]

def get_default_env_path() -> Path:
    local_env = PROJECT / ".env"
    if local_env.exists():
        return local_env
    doc_env = Path.home() / "Documents" / "Codex" / "2026-04-28" / "chatgpt-apps-plugin-chatgpt-apps-openai" / ".env"
    if doc_env.exists():
        return doc_env
    return local_env

DEFAULT_ENV_PATH = get_default_env_path()
BASE_URL = "https://thongtaccongquangninh.com"
MAX_IMAGE_KB = 300
RENDERED_MAIN_AUDIT_SLUGS = {
    # Page 296 is rendered by ttcqn-doorway-safe-renderer. REST post_content
    # misses hero images that are visible inside <main id="primary">.
    "thong-tac-cong-ha-long",
}


@dataclass
class ImageUse:
    index: int
    tag: str
    src: str
    alt: str
    media_id: str
    basename: str
    normalized_src: str
    sha256: str = ""
    dhash: int | None = None
    download_error: str = ""


class ImgParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.images: list[tuple[str, dict[str, str]]] = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "img":
            return
        attr_map = {str(k).lower(): html.unescape(str(v or "")) for k, v in attrs}
        raw = self.get_starttag_text() or ""
        self.images.append((raw, attr_map))


def parse_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        match = re.match(r"^\s*([^#=\s]+)\s*=\s*(.*)\s*$", line)
        if match:
            env[match.group(1)] = match.group(2).strip().strip("\"'")
    return env


def request_json(url: str, headers=None, method="GET", body: bytes | None = None):
    req = urllib.request.Request(url, data=body, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read()
            return json.loads(raw.decode("utf-8-sig") or "{}"), response.headers
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {error.code} {url}: {raw[:500]}") from error


def wp_request(base_url: str, auth: str, path: str, method="GET", body: bytes | None = None, headers=None):
    payload, _ = request_json(
        f"{base_url}/wp-json{path}",
        method=method,
        body=body,
        headers={
            "Authorization": auth,
            "User-Agent": "Codex unique image audit",
            **(headers or {}),
        },
    )
    return payload


def request_text(url: str, headers=None) -> str:
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read().decode("utf-8", errors="replace")


def extract_main_html(rendered_html: str) -> str:
    match = re.search(r"<main\b[^>]*\bid=[\"']primary[\"'][^>]*>[\s\S]*?</main>", rendered_html or "", flags=re.I)
    if match:
        return match.group(0)
    match = re.search(r"<main\b[^>]*>[\s\S]*?</main>", rendered_html or "", flags=re.I)
    return match.group(0) if match else rendered_html


def fetch_rendered_main_content(base_url: str, link: str) -> str:
    separator = "&" if "?" in link else "?"
    url = f"{link}{separator}nowprocket=1&codex=image-audit-rendered-{int(time.time())}"
    rendered_html = request_text(
        url,
        headers={
            "User-Agent": "Codex unique image audit rendered-main",
            "Cache-Control": "no-cache",
        },
    )
    return extract_main_html(rendered_html)


def fetch_content(base_url: str, auth: str, include_drafts: bool) -> list[dict]:
    rows = []
    statuses = "publish,draft,pending,private,future" if include_drafts else "publish"
    for type_name in ("pages", "posts"):
        page = 1
        while True:
            items = wp_request(
                base_url,
                auth,
                f"/wp/v2/{type_name}?status={statuses}&context=edit&per_page=100&page={page}",
            )
            if not items:
                break
            for item in items:
                raw = item.get("content", {}).get("raw") or item.get("content", {}).get("rendered") or ""
                slug = item.get("slug")
                link = item.get("link")
                audit_content = raw
                content_source = "post_content"
                if item.get("status") == "publish" and slug in RENDERED_MAIN_AUDIT_SLUGS and link:
                    try:
                        audit_content = fetch_rendered_main_content(base_url, link)
                        content_source = "rendered_main"
                    except Exception as error:
                        content_source = f"post_content_rendered_main_error:{error}"
                rows.append(
                    {
                        "type": type_name,
                        "id": item.get("id"),
                        "status": item.get("status"),
                        "link": link,
                        "slug": slug,
                        "title": clean_text(item.get("title", {}).get("raw") or item.get("title", {}).get("rendered") or ""),
                        "content": raw,
                        "audit_content": audit_content,
                        "contentSource": content_source,
                    }
                )
            if len(items) < 100:
                break
            page += 1
    return rows


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", value or "")).strip()


def normalize_url(src: str, base_url: str) -> str:
    absolute = urllib.parse.urljoin(base_url, html.unescape(src or ""))
    parsed = urllib.parse.urlparse(absolute)
    return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", "", ""))


def image_basename(src: str) -> str:
    return Path(urllib.parse.urlparse(src).path).name


def media_id_from_tag(tag: str) -> str:
    match = re.search(r"wp-image-(\d+)", tag or "")
    return match.group(1) if match else ""


def extract_images(content: str, base_url: str) -> list[ImageUse]:
    parser = ImgParser()
    parser.feed(content or "")
    images = []
    for index, (tag, attrs) in enumerate(parser.images):
        src = attrs.get("src") or attrs.get("data-src") or ""
        normalized = normalize_url(src, base_url)
        images.append(
            ImageUse(
                index=index,
                tag=tag,
                src=src,
                alt=attrs.get("alt", ""),
                media_id=media_id_from_tag(tag),
                basename=image_basename(normalized),
                normalized_src=normalized,
            )
        )
    return images


def download_bytes(url: str, cache: dict[str, bytes]) -> bytes:
    if url in cache:
        return cache[url]
    req = urllib.request.Request(url, headers={"User-Agent": "Codex unique image audit"})
    with urllib.request.urlopen(req, timeout=90) as response:
        data = response.read()
    cache[url] = data
    return data


def compute_dhash(image: Image.Image) -> int:
    small = ImageOps.exif_transpose(image).convert("L").resize((9, 8), Image.Resampling.LANCZOS)
    try:
        pixels = list(small.get_flattened_data())
    except AttributeError:
        pixels = list(small.getdata())
    value = 0
    for row in range(8):
        for col in range(8):
            left = pixels[row * 9 + col]
            right = pixels[row * 9 + col + 1]
            value = (value << 1) | int(left > right)
    return value


def hamming(a: int, b: int) -> int:
    return int((a ^ b).bit_count())


def enrich_hashes(images: list[ImageUse], cache: dict[str, bytes]) -> None:
    for image in images:
        if not image.normalized_src:
            continue
        try:
            data = download_bytes(image.normalized_src, cache)
            image.sha256 = hashlib.sha256(data).hexdigest()
            image.dhash = compute_dhash(Image.open(io.BytesIO(data)))
        except Exception as error:
            image.download_error = str(error)


def group_by(images: list[ImageUse], attr: str) -> list[list[ImageUse]]:
    groups: dict[str, list[ImageUse]] = {}
    for image in images:
        key = getattr(image, attr)
        if key:
            groups.setdefault(key, []).append(image)
    return [group for group in groups.values() if len(group) > 1]


def pixel_duplicate_pairs(images: list[ImageUse], max_distance: int) -> list[dict]:
    pairs = []
    for i, left in enumerate(images):
        if left.dhash is None:
            continue
        for right in images[i + 1 :]:
            if right.dhash is None:
                continue
            distance = hamming(left.dhash, right.dhash)
            if distance <= max_distance:
                pairs.append(
                    {
                        "leftIndex": left.index,
                        "rightIndex": right.index,
                        "distance": distance,
                        "left": left.basename,
                        "right": right.basename,
                    }
                )
    return pairs


def ascii_slug(value: str) -> str:
    value = value.replace("Đ", "D").replace("đ", "d")
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = value.encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def detect_service_area(title: str, link: str) -> tuple[str, str]:
    text = f"{title} {link}".lower()
    service = "dịch vụ môi trường"
    if "hút bể phốt" in text or "hut-be-phot" in text:
        service = "hút bể phốt"
    elif "bồn cầu" in text or "bon-cau" in text:
        service = "thông tắc bồn cầu"
    elif "chậu rửa" in text or "chau-rua" in text:
        service = "thông tắc chậu rửa"
    elif "hố ga" in text or "ho-ga" in text or "nạo vét" in text:
        service = "nạo vét hố ga"
    elif "cống" in text or "cong" in text:
        service = "thông tắc cống"
    areas = [
        "Bãi Cháy",
        "Tuần Châu",
        "Giếng Đáy",
        "Cao Xanh",
        "Cẩm Phả",
        "Uông Bí",
        "Quảng Yên",
        "Hạ Long",
        "Móng Cái",
        "Vân Đồn",
        "Đông Triều",
        "Quảng Ninh",
    ]
    area = next((area for area in areas if area.lower() in text), "Quảng Ninh")
    return service, area


def suggested_topics(service: str, area: str, count: int) -> list[str]:
    pools = {
        "thông tắc cống": [
            f"thợ thông tắc cống tại nhà dân ở {area} bằng máy lò xo",
            f"kiểm tra hố ga và đường ống thoát nước tại {area}",
            f"xử lý cống bếp dầu mỡ cho nhà hàng/quán ăn tại {area}",
            f"xả thử sau khi thông tắc cống tại {area}",
        ],
        "hút bể phốt": [
            f"xe bồn hút bể phốt tại nhà dân ở {area}",
            f"thợ kéo ống hút bể phốt vào ngõ sâu tại {area}",
            f"mở nắp bể phốt hoặc hố ga trước khi hút tại {area}",
            f"kiểm tra bể sau khi hút bể phốt tại {area}",
        ],
        "thông tắc bồn cầu": [
            f"thợ thông tắc bồn cầu tại nhà vệ sinh ở {area}",
            f"máy lò xo xử lý bồn cầu nghẹt không đục phá tại {area}",
            f"xả thử bồn cầu sau xử lý tại {area}",
        ],
        "thông tắc chậu rửa": [
            f"thợ xử lý ống thoát chậu rửa dưới tủ bếp tại {area}",
            f"kiểm tra siphon và đường ống bồn rửa tại {area}",
            f"xử lý mảng bám dầu mỡ chậu rửa tại {area}",
        ],
        "nạo vét hố ga": [
            f"nạo vét hố ga dân dụng tại {area}",
            f"mở nắp hố ga và hút bùn lắng tại {area}",
            f"kiểm tra dòng chảy sau nạo vét hố ga tại {area}",
        ],
    }
    base = pools.get(service, [f"ảnh thi công {service} tại {area}", f"ảnh quy trình xử lý {service} tại {area}"])
    return [base[i % len(base)] for i in range(count)]


def find_font(size: int):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def draw_overlay(image: Image.Image, text: str, seed: int) -> Image.Image:
    image = image.convert("RGB")
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    width, height = image.size
    font = find_font(max(22, width // 34))
    words = text.split()
    lines = []
    line = ""
    for word in words:
        trial = f"{line} {word}".strip()
        if draw.textbbox((0, 0), trial, font=font)[2] < width * 0.82:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    lines = lines[:2]
    line_height = draw.textbbox((0, 0), "Ay", font=font)[3] + 10
    box_h = line_height * len(lines) + 28
    y0 = height - box_h - 24
    color = [(8, 59, 92, 190), (16, 83, 63, 190), (104, 56, 22, 190)][seed % 3]
    draw.rounded_rectangle((24, y0, width - 24, y0 + box_h), radius=18, fill=color)
    for i, line in enumerate(lines):
        draw.text((44, y0 + 16 + i * line_height), line, font=font, fill=(255, 255, 255, 255))
    return Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB")


def create_variant(data: bytes, out: Path, overlay_text: str, seed: int) -> dict:
    image = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert("RGB")
    w, h = image.size
    crop_pct = 0.04 + (seed % 4) * 0.012
    dx, dy = int(w * crop_pct), int(h * crop_pct)
    image = image.crop((dx, dy, w - max(1, dx // 2), h - max(1, dy // 2)))
    # [FIX]: Khôi phục lật ngang, nhưng KHÔNG lật nếu ảnh có "xe" hoặc "biển" dễ ngược chữ
    if seed % 2 == 1 and "xe" not in overlay_text.lower() and "hút" not in overlay_text.lower():
        image = ImageOps.mirror(image)
    image = ImageEnhance.Brightness(image).enhance(1 + ((seed % 5) - 2) * 0.025)
    image = ImageEnhance.Contrast(image).enhance(1 + ((seed % 7) - 3) * 0.018)
    image.thumbnail((1200, 900), Image.Resampling.LANCZOS)
    image = draw_overlay(image, overlay_text, seed)
    out.parent.mkdir(parents=True, exist_ok=True)
    quality = 82
    while True:
        image.save(out, "WEBP", quality=quality, method=6)
        size_kb = round(out.stat().st_size / 1024, 1)
        if size_kb <= MAX_IMAGE_KB or quality <= 54:
            break
        quality -= 6
    return {"output": str(out), "fileSizeKb": size_kb, "quality": quality, "dhash": compute_dhash(Image.open(out))}


def upload_media(base_url: str, auth: str, file_path: Path, file_name: str, alt: str, caption: str, note: str):
    media = wp_request(
        base_url,
        auth,
        "/wp/v2/media",
        method="POST",
        body=file_path.read_bytes(),
        headers={
            "Content-Type": "image/webp",
            "Content-Disposition": f'attachment; filename="{file_name}"',
        },
    )
    wp_request(
        base_url,
        auth,
        f"/wp/v2/media/{media['id']}",
        method="POST",
        body=json.dumps({"alt_text": alt, "caption": caption, "description": note, "title": Path(file_name).stem}, ensure_ascii=False).encode(),
        headers={"Content-Type": "application/json"},
    )
    return media


def replace_img_tag(content: str, old_tag: str, new_src: str, new_alt: str, new_media_id: int, occurrence: int) -> str:
    seen = 0

    def repl(match: re.Match) -> str:
        nonlocal seen
        tag = match.group(0)
        if tag != old_tag:
            return tag
        if seen != occurrence:
            seen += 1
            return tag
        seen += 1
        updated = re.sub(r'\ssrc=(["\']).*?\1', f' src="{html.escape(new_src, quote=True)}"', tag, count=1, flags=re.I)
        if re.search(r'\salt=(["\']).*?\1', updated, flags=re.I):
            updated = re.sub(r'\salt=(["\']).*?\1', f' alt="{html.escape(new_alt, quote=True)}"', updated, count=1, flags=re.I)
        else:
            updated = updated[:-1] + f' alt="{html.escape(new_alt, quote=True)}">'
        if re.search(r"wp-image-\d+", updated):
            updated = re.sub(r"wp-image-\d+", f"wp-image-{new_media_id}", updated)
        return updated

    return re.sub(r"<img\b[^>]*>", repl, content or "", flags=re.I)


def audit_row(row: dict, base_url: str, cache: dict[str, bytes], hash_images: bool, max_distance: int) -> dict:
    images = extract_images(row.get("audit_content") or row["content"], base_url)
    if hash_images:
        enrich_hashes(images, cache)
    service, area = detect_service_area(row["title"], row["link"])
    exact_src = group_by(images, "normalized_src")
    same_file = group_by(images, "basename")
    same_bytes = group_by(images, "sha256") if hash_images else []
    pixel_pairs = pixel_duplicate_pairs(images, max_distance) if hash_images else []
    duplicate_count = max(0, len(images) - len({img.sha256 or img.normalized_src for img in images}))
    missing_count = max(0, 3 - len(images))
    replacement_needed = max(missing_count, duplicate_count, len(pixel_pairs))
    return {
        "id": row["id"],
        "type": row["type"],
        "status": row["status"],
        "title": row["title"],
        "link": row["link"],
        "slug": row["slug"],
        "contentSource": row.get("contentSource", "post_content"),
        "service": service,
        "area": area,
        "imageCount": len(images),
        "images": [img.__dict__ for img in images],
        "exactSrcDuplicates": [[img.index for img in group] for group in exact_src],
        "sameFileDuplicates": [[img.index for img in group] for group in same_file],
        "sameBytesDuplicates": [[img.index for img in group] for group in same_bytes],
        "pixelDuplicatePairs": pixel_pairs,
        "missingToThree": missing_count,
        "replacementNeeded": replacement_needed,
        "missingTopics": suggested_topics(service, area, replacement_needed),
    }


def build_global_reuse(audits: list[dict]) -> list[dict]:
    by_src: dict[str, list[dict]] = {}
    by_sha: dict[str, list[dict]] = {}
    for audit in audits:
        for image in audit["images"]:
            by_src.setdefault(image["normalized_src"], []).append({"link": audit["link"], "title": audit["title"], "index": image["index"], "file": image["basename"]})
            if image.get("sha256"):
                by_sha.setdefault(image["sha256"], []).append({"link": audit["link"], "title": audit["title"], "index": image["index"], "file": image["basename"]})
    out = []
    for kind, groups in (("same_url", by_src), ("same_bytes", by_sha)):
        for key, uses in groups.items():
            links = sorted({use["link"] for use in uses})
            if len(links) > 1:
                out.append({"kind": kind, "key": key, "pageCount": len(links), "uses": uses})
    return sorted(out, key=lambda item: item["pageCount"], reverse=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--env", default=str(DEFAULT_ENV_PATH))
    parser.add_argument("--include-drafts", action="store_true")
    parser.add_argument("--no-hash", action="store_true", help="Skip image downloads and pixel duplicate checks.")
    parser.add_argument("--max-distance", type=int, default=4, help="dHash distance treated as duplicate/suspicious.")
    parser.add_argument("--fix", action="store_true", help="Replace duplicate images inside the same WordPress content with unique variants.")
    parser.add_argument("--fix-global-reuse", action="store_true", help="Also replace reused exact images across different pages after first use.")
    args = parser.parse_args()

    env = parse_env(Path(args.env))
    base_url = (env.get("WP_BASE_URL") or BASE_URL).rstrip("/")
    auth = "Basic " + base64.b64encode(f"{env['WP_USERNAME']}:{env['WP_APP_PASSWORD']}".encode()).decode()
    stamp = time.strftime("%Y-%m-%dT%H-%M-%S")
    report_path = PROJECT / "reports" / f"wp-unique-image-audit-{stamp}.json"
    report_md_path = PROJECT / "reports" / f"wp-unique-image-audit-{stamp}.md"
    variant_dir = PROJECT / "_tmp" / f"unique-image-variants-{stamp}"
    backup_dir = PROJECT / "seo-revisions" / f"wp-before-unique-image-fix-{stamp}"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    backup_dir.mkdir(parents=True, exist_ok=True)
    cache: dict[str, bytes] = {}
    rows = fetch_content(base_url, auth, include_drafts=args.include_drafts)
    audits = [audit_row(row, base_url, cache, not args.no_hash, args.max_distance) for row in rows]
    needs = [audit for audit in audits if audit["exactSrcDuplicates"] or audit["sameBytesDuplicates"] or audit["pixelDuplicatePairs"] or audit["missingToThree"]]
    global_reuse = build_global_reuse(audits)
    fixes = []

    if args.fix:
        row_by_id = {(row["type"], row["id"]): row for row in rows}
        used_global: set[str] = set()
        for audit in audits:
            if audit.get("contentSource") != "post_content":
                continue
            row = row_by_id[(audit["type"], audit["id"])]
            content = row["content"]
            images = extract_images(content, base_url)
            audit_image_by_index = {image["index"]: image for image in audit["images"]}
            duplicate_indices: set[int] = set()
            for group in audit["exactSrcDuplicates"] + audit["sameBytesDuplicates"]:
                duplicate_indices.update(group[1:])
            for pair in audit["pixelDuplicatePairs"]:
                duplicate_indices.add(pair["rightIndex"])
            if args.fix_global_reuse:
                for img in images:
                    audit_image = audit_image_by_index.get(img.index, {})
                    key = audit_image.get("sha256") or img.normalized_src
                    if key in used_global:
                        duplicate_indices.add(img.index)
                    used_global.add(key)
            if not duplicate_indices:
                continue
            backup_path = backup_dir / f"{audit['type']}-{audit['id']}-{audit['slug']}.json"
            backup_path.write_text(json.dumps(row, ensure_ascii=False, indent=2), encoding="utf-8")
            page_fixes = []
            topics = suggested_topics(audit["service"], audit["area"], len(duplicate_indices))
            for seq, index in enumerate(sorted(duplicate_indices), 1):
                image = images[index]
                data = download_bytes(image.normalized_src, cache)
                topic = topics[seq - 1]
                file_name = f"{audit['slug']}-{ascii_slug(topic)}-{seq}.webp"
                out = variant_dir / file_name
                info = create_variant(data, out, topic.title(), audit["id"] + index + seq)
                alt = topic
                caption = f"Ảnh minh họa {topic}."
                media = upload_media(base_url, auth, out, file_name, alt, caption, "Codex tạo biến thể WebP: xóa EXIF, crop nhẹ, đổi màu nhẹ, overlay chữ theo ngữ cảnh.")
                occurrence = sum(1 for img in images[:index] if img.tag == image.tag)
                content = replace_img_tag(content, image.tag, media["source_url"], alt, media["id"], occurrence)
                page_fixes.append({"old": image.normalized_src, "new": media["source_url"], "file": file_name, **info})
            wp_request(
                base_url,
                auth,
                f"/wp/v2/{audit['type']}/{audit['id']}",
                method="POST",
                body=json.dumps({"content": content, "status": row["status"]}, ensure_ascii=False).encode("utf-8"),
                headers={"Content-Type": "application/json"},
            )
            fixes.append({"link": audit["link"], "id": audit["id"], "type": audit["type"], "fixes": page_fixes})

    result = {
        "ok": True,
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "mode": "fix" if args.fix else "audit",
        "includeDrafts": args.include_drafts,
        "hashed": not args.no_hash,
        "totalContent": len(audits),
        "pagesWithIssues": len(needs),
        "samePageDuplicatePages": len([a for a in audits if a["exactSrcDuplicates"] or a["sameBytesDuplicates"] or a["pixelDuplicatePairs"]]),
        "pagesUnderThreeImages": len([a for a in audits if a["missingToThree"]]),
        "globalReuseGroups": len(global_reuse),
        "fixes": fixes,
        "issues": needs,
        "globalReuse": global_reuse,
    }
    report_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    lines = [
        "# WordPress Unique Image Audit",
        "",
        f"- Generated: {result['generatedAt']}",
        f"- Mode: {result['mode']}",
        f"- Total content: {result['totalContent']}",
        f"- Pages with same-page duplicate/suspicious images: {result['samePageDuplicatePages']}",
        f"- Pages under 3 content images: {result['pagesUnderThreeImages']}",
        f"- Global reused image groups: {result['globalReuseGroups']}",
        "",
        "## Pages Needing Action",
    ]
    for issue in needs:
        lines.extend(
            [
                "",
                f"### {issue['title']}",
                f"- URL: {issue['link']}",
                f"- Images: {issue['imageCount']}",
                f"- Same URL duplicate groups: {issue['exactSrcDuplicates']}",
                f"- Same bytes duplicate groups: {issue['sameBytesDuplicates']}",
                f"- Pixel duplicate pairs: {issue['pixelDuplicatePairs']}",
                f"- Missing to 3 images: {issue['missingToThree']}",
                f"- Cần ảnh/chủ đề: {'; '.join(issue['missingTopics']) if issue['missingTopics'] else 'Không'}",
            ]
        )
    report_md_path.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"reportPath": str(report_path), "markdownReportPath": str(report_md_path), **{k: result[k] for k in ('totalContent','pagesWithIssues','samePageDuplicatePages','pagesUnderThreeImages','globalReuseGroups','mode')}}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
