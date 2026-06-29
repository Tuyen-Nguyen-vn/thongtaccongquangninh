#!/usr/bin/env python3
"""Fill published WordPress pages/posts that have fewer than 3 content images using actual photos from source directory."""

from __future__ import annotations

import argparse
import json
import re
import time
import urllib.parse
import os
import base64
from pathlib import Path

from optimize_upload_insert_desktop_images import (
    DEFAULT_ENV_PATH,
    DEFAULT_SOURCE_DIR,
    MAX_IMAGE_KB,
    PROJECT,
    Assignment,
    escape_html,
    find_content_object,
    image_count,
    insert_figure,
    optimize_image,
    parse_env,
    public_request,
    slug_from_path,
    upload_media,
    wp_request,
)


def discover_image_pools(source_dir: Path) -> dict[str, list[tuple[str, str, str]]]:
    pools = {
        "hut-be-phot": [],
        "thong-tac-cong": [],
        "bon-cau": [],
        "chau-rua": [],
        "generic": []
    }
    
    for r, d, fs in os.walk(source_dir):
        for f in fs:
            if not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                continue
            # Bỏ qua các banner quảng cáo, logo hoặc thư mục đối tác
            if "banner" in f.lower() or "logo" in f.lower() or "doi tac" in r.lower() or "Doi Tac" in r:
                continue
                
            path_lower = r.lower()
            rel_path = os.path.relpath(os.path.join(r, f), source_dir)
            
            # Phân loại dựa trên đường dẫn thư mục con
            category = "generic"
            descriptor = "thi-cong-moi-truong"
            subject = "Thi công dịch vụ môi trường đô thị"
            
            if any(x in path_lower for x in ("xe hut", "xe-hut", "1. xe hut", "2. xe hut", "xehut")):
                category = "hut-be-phot"
                descriptor = "xe-bon-hut-be-phot"
                subject = "Xe bồn hút bể phốt"
                if "gia dinh" in path_lower:
                    descriptor = "xe-hut-be-phot-ho-gia-dinh"
                    subject = "Xe bồn hút bể phốt hộ gia đình"
                elif "kcn" in path_lower or "cong ty" in path_lower:
                    descriptor = "xe-hut-be-phot-khu-cong-nghiep"
                    subject = "Xe bồn hút bể phốt khu công nghiệp"
            elif any(x in path_lower for x in ("thong-tac-cong", "tho thong tac cong", "3. tho thong", "may thong cong", "thongcong")):
                category = "thong-tac-cong"
                descriptor = "may-lo-xo-thong-cong"
                subject = "Thợ dùng máy lò xo thông cống"
            elif any(x in path_lower for x in ("bon cau", "bon-cau", "4. tho thong", "boncau")):
                category = "bon-cau"
                descriptor = "tho-thong-bon-cau"
                subject = "Thợ thông tắc bồn cầu"
            elif any(x in path_lower for x in ("chau rua", "chau-rua", "5. tho thong", "chaurua")):
                category = "chau-rua"
                descriptor = "tho-thong-chau-rua"
                subject = "Thợ thông tắc chậu rửa"
            elif any(x in path_lower for x in ("mui hoi", "mui-hoi", "6. tho xu ly", "muihoi")):
                category = "thong-tac-cong"
                descriptor = "xu-ly-mui-hoi"
                subject = "Thợ xử lý mùi hôi nhà vệ sinh"
            elif any(x in path_lower for x in ("ho ga", "ho-ga", "7. tho nao vet", "hogacong")):
                category = "thong-tac-cong"
                descriptor = "nao-vet-ho-ga"
                subject = "Thợ nạo vét hố ga"
                
            pools[category].append((rel_path, descriptor, subject))
            
    # Fallback cho các pool bị trống bằng pool generic hoặc list ảnh có sẵn
    for cat in list(pools.keys()):
        if not pools[cat]:
            pools[cat] = pools["generic"] if pools["generic"] else [("banner-dich-vu.webp", "dich-vu-moi-truong", "Dịch vụ môi trường")]
            
    return pools


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", value or "")).strip()


def classify(title: str, link: str) -> str:
    text = f"{title} {link}".lower()
    if "bồn cầu" in text or "toilet" in text:
        return "bon-cau"
    if "chậu rửa" in text or "chau-rua" in text:
        return "chau-rua"
    if "hút bể phốt" in text or "hut-be-phot" in text or "bể phốt" in text:
        return "hut-be-phot"
    if "cống" in text or "cong" in text or "mùi hôi" in text:
        return "thong-tac-cong"
    return "generic"


def service_label(category: str) -> str:
    return {
        "hut-be-phot": "hút bể phốt",
        "thong-tac-cong": "thông tắc cống",
        "bon-cau": "thông tắc bồn cầu",
        "chau-rua": "thông tắc chậu rửa",
        "generic": "dịch vụ môi trường đô thị",
    }[category]


def area_from_title_link(title: str, link: str) -> str:
    text = f"{title} {link}".lower()
    areas = [
        "Bãi Cháy",
        "Vân Đồn",
        "Móng Cái",
        "Đông Triều",
        "Quảng Yên",
        "Hoành Bồ",
        "Hạ Long",
        "Cẩm Phả",
        "Uông Bí",
        "Quảng Ninh",
    ]
    for area in areas:
        if area.lower() in text:
            return area
    return "Quảng Ninh"


def ascii_slug(value: str) -> str:
    source = (
        value.replace("Đ", "D")
        .replace("đ", "d")
        .encode("ascii", "ignore")
        .decode("ascii")
        .lower()
    )
    return re.sub(r"[^a-z0-9]+", "-", source).strip("-")


def figure_html(media: dict, item: Assignment) -> str:
    return (
        f'<!-- wp:image {{"id":{media["id"]},"sizeSlug":"large","linkDestination":"none"}} -->\n'
        f'<figure class="wp-block-image size-large"><img src="{media["source_url"]}" '
        f'alt="{escape_html(item.alt)}" class="wp-image-{media["id"]}"/>'
        f'<figcaption class="wp-element-caption">{escape_html(item.caption)}</figcaption></figure>\n'
        "<!-- /wp:image -->"
    )


def fetch_all_content(base_url: str, auth: str):
    rows = []
    for type_name in ("pages", "posts"):
        page = 1
        while True:
            items = wp_request(
                base_url,
                auth,
                f"/wp/v2/{type_name}?status=publish,draft,pending,private,future&context=edit&per_page=100&page={page}",
            )
            if not items:
                break
            for item in items:
                content = item.get("content", {}).get("raw") or item.get("content", {}).get("rendered") or ""
                rows.append(
                    {
                        "type": type_name,
                        "id": item.get("id"),
                        "status": item.get("status"),
                        "link": item.get("link"),
                        "title": clean_text(item.get("title", {}).get("raw") or item.get("title", {}).get("rendered") or ""),
                        "images": image_count(content),
                    }
                )
            if len(items) < 100:
                break
            page += 1
    return rows


def build_assignments(missing_rows: list[dict], source_dir: Path) -> list[Assignment]:
    pools = discover_image_pools(source_dir)
    pool_index = {key: 0 for key in pools}
    assignments = []
    for row in missing_rows:
        needed = max(0, 3 - int(row["images"]))
        slug = slug_from_path(urllib.parse.urlparse(row["link"]).path) or "trang-chu"
        category = classify(row["title"], row["link"])
        area = area_from_title_link(row["title"], row["link"])
        service = service_label(category)
        for offset in range(needed):
            pool = pools[category]
            # Lấy ảnh tuần hoàn theo pool
            rel_path, descriptor, subject = pool[pool_index[category] % len(pool)]
            pool_index[category] += 1
            seq = int(row["images"]) + offset + 1
            new_file = f"{slug}-{descriptor}-{seq}.webp"
            alt = f"{subject} cho dịch vụ {service} tại {area}"
            caption = f"Ảnh thực tế {subject.lower()} cho dịch vụ {service} tại {area}."
            position = "quy trình" if offset % 2 == 0 else "case study"
            note = "Người dùng xác nhận bộ ảnh nguồn là ảnh thực tế; không dùng poster quảng cáo."
            assignments.append(Assignment(rel_path, "/" + slug + "/", new_file, alt, caption, position, note))
    return assignments


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", default=str(DEFAULT_SOURCE_DIR))
    parser.add_argument("--env", default=str(DEFAULT_ENV_PATH))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    source_dir = Path(args.source_dir)
    env = parse_env(Path(args.env))
    base_url = env.get("WP_BASE_URL") or "https://thongtaccongquangninh.com"
    auth = "Basic " + base64.b64encode(f"{env['WP_USERNAME']}:{env['WP_APP_PASSWORD']}".encode()).decode()

    stamp = time.strftime("%Y-%m-%dT%H-%M-%S")
    optimized_dir = PROJECT / "_tmp" / f"desktop-anh-missing-seo-optimized-{stamp}"
    backup_dir = PROJECT / "seo-revisions" / f"wp-before-fill-missing-images-{stamp}"
    report_path = PROJECT / f"WORDPRESS_FILL_MISSING_IMAGES_{stamp}.json"
    backup_dir.mkdir(parents=True, exist_ok=True)

    rows = fetch_all_content(base_url, auth)
    # Tìm các trang đang ở trạng thái publish và có ít hơn 3 ảnh content
    missing = [row for row in rows if row["status"] == "publish" and int(row["images"]) < 3]
    assignments = build_assignments(missing, source_dir)

    grouped: dict[str, list[Assignment]] = {}
    for item in assignments:
        grouped.setdefault(item.target_path, []).append(item)

    optimized = []
    uploads = []
    inserted = []
    skipped = []
    page_summary = []
    verify = []

    for target_path, items in grouped.items():
        found = find_content_object(base_url, auth, target_path)
        if not found:
            skipped.append({"targetPath": target_path, "reason": "Không tìm thấy page/post"})
            continue
        type_name, content_object = found
        content = content_object.get("content", {}).get("raw") or content_object.get("content", {}).get("rendered") or ""
        before = image_count(content)
        if before >= 3:
            skipped.append({"targetPath": target_path, "reason": "Nội dung đã có >=3 ảnh khi chạy"})
            continue
        
        # Chỉ tạo backup nếu không phải dry-run
        backup_path = backup_dir / f"{type_name}-{content_object['id']}-{slug_from_path(target_path) or 'home'}.json"
        if not args.dry_run:
            backup_path.write_text(json.dumps(content_object, ensure_ascii=False, indent=2), encoding="utf-8")

        page_inserted = []
        for item in items[: 3 - before]:
            src = source_dir / item.source_file
            if not src.exists():
                skipped.append({"targetPath": target_path, "file": item.source_file, "reason": "Không tìm thấy ảnh nguồn"})
                continue
            output = optimized_dir / item.new_file
            
            # Tối ưu ảnh chuẩn SEO WebP
            info = optimize_image(src, output, MAX_IMAGE_KB)
            optimized.append({**info, "targetPath": target_path, "alt": item.alt, "caption": item.caption})
            
            # Upload ảnh lên WordPress
            media, uploaded = upload_media(base_url, auth, output, item, args.dry_run)
            uploads.append({"targetPath": target_path, "file": item.new_file, "mediaId": media.get("id"), "url": media.get("source_url"), "uploaded": uploaded})
            
            # Nhúng hình ảnh vào bài viết
            content = insert_figure(content, figure_html(media, item), item.position)
            page_inserted.append(
                {
                    "targetPath": target_path,
                    "file": item.new_file,
                    "mediaId": media.get("id"),
                    "alt": item.alt,
                    "caption": item.caption,
                    "position": item.position,
                }
            )

        if page_inserted and not args.dry_run:
            wp_request(
                base_url,
                auth,
                f"/wp/v2/{type_name}/{content_object['id']}",
                method="POST",
                body=json.dumps({"content": content}, ensure_ascii=False).encode("utf-8"),
                headers={"Content-Type": "application/json"},
            )
        after = image_count(content)
        page_summary.append(
            {
                "targetPath": target_path,
                "type": type_name,
                "id": content_object.get("id"),
                "title": clean_text(content_object.get("title", {}).get("raw") or content_object.get("title", {}).get("rendered") or ""),
                "link": content_object.get("link"),
                "beforeImages": before,
                "afterImages": after,
                "insertedCount": len(page_inserted),
            }
        )
        inserted.extend(page_inserted)

    if not args.dry_run:
        for page in page_summary:
            found = find_content_object(base_url, auth, page["targetPath"])
            if not found:
                verify.append({**page, "found": False})
                continue
            _, content_object = found
            content = content_object.get("content", {}).get("raw") or content_object.get("content", {}).get("rendered") or ""
            status, html = public_request(page["link"])
            page_files = [item["file"] for item in inserted if item["targetPath"] == page["targetPath"]]
            verify.append(
                {
                    **page,
                    "found": True,
                    "restImageCount": image_count(content),
                    "liveStatus": status,
                    "allInsertedFilesInRest": all(file in content for file in page_files),
                    "allInsertedFilesInLive": all(file in html for file in page_files),
                    "files": page_files,
                }
            )

    result = {
        "ok": True,
        "dryRun": args.dry_run,
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "sourceDir": str(source_dir),
        "optimizedDir": str(optimized_dir),
        "backupDir": str(backup_dir),
        "initialMissingPublishedUnder3": len(missing),
        "assignmentsCount": len(assignments),
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
    raise SystemExit(main())
