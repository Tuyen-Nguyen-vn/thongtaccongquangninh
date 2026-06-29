import csv
import shutil
import sqlite3
import uuid
from datetime import datetime
from pathlib import Path


BASE = Path(r"D:\.phanmemmkt\UserData\MKT Page")
DB = BASE / "com.mkt-page.app.db"
SOURCE_DIR = Path(r"D:\TUYEN\Anh-seo\QN-0981.306.307")
INTERNAL_DIR = BASE / "File" / "QN-0981.306.307-uploaded"
REPORT_DIR = Path(r"D:\.thongtaccongquangninh\reports")
CATEGORY_ID = "d2833dc0-4dac-4068-a050-63aff844ede7"
CATEGORY_NAME = "Môi Trường Quảng Ninh 306.307"
HOTLINE = "0981.306.307"


def build_rows():
    images = sorted(
        p
        for p in SOURCE_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    )
    if not images:
        raise RuntimeError(f"Không có ảnh hợp lệ trong {SOURCE_DIR}")

    INTERNAL_DIR.mkdir(parents=True, exist_ok=True)

    locations = [
        "Hạ Long",
        "Cẩm Phả",
        "Uông Bí",
        "Móng Cái",
        "Quảng Yên",
        "Đông Triều",
        "Vân Đồn",
        "Tiên Yên",
        "Ba Chẽ",
        "Bình Liêu",
        "Đầm Hà",
        "Hải Hà",
        "Cô Tô",
        "Hoành Bồ",
        "Bãi Cháy",
        "Hồng Gai",
        "Giếng Đáy",
        "Tuần Châu",
        "Cao Xanh",
        "Hà Khẩu",
        "Cửa Ông",
        "Mạo Khê",
        "Trới",
        "Cái Rồng",
        "Mông Dương",
    ]
    pains = [
        "bể phốt đầy làm nhà vệ sinh bốc mùi",
        "bồn cầu xả yếu, nước dâng rồi rút chậm",
        "cống bếp nghẹt do dầu mỡ đóng đặc",
        "hố ga tràn sau mưa lớn",
        "mùi hôi bốc ngược từ miệng thoát sàn",
        "đường ống thoát nước kêu ục ục cả ngày",
        "nhà hàng bị tắc cống đúng giờ đông khách",
        "nhà trọ nhiều phòng dùng chung đường thoát",
        "công trình cần hút bùn, nạo vét hố ga",
        "bể phốt lâu năm chưa hút định kỳ",
    ]
    services = [
        "Hút bể phốt",
        "Thông tắc cống",
        "Thông tắc bồn cầu",
        "Nạo vét hố ga",
        "Xử lý mùi hôi nhà vệ sinh",
        "Hút bùn hầm cầu",
        "Thông tắc chậu rửa",
        "Thông tắc đường ống thoát nước",
        "Hút bể phốt xe bồn",
        "Thông tắc cống không đục phá",
    ]
    benefits = [
        "khảo sát rõ nguyên nhân trước khi làm",
        "dùng máy lò xo, máy áp lực và xe bồn phù hợp từng vị trí",
        "ưu tiên xử lý không đục phá, giữ sạch nền gạch",
        "báo giá trước khi thi công, không tự ý phát sinh",
        "làm gọn, thu dọn sạch sau khi hoàn tất",
        "phục vụ cả tối muộn, cuối tuần và ngày lễ",
        "phù hợp nhà dân, quán ăn, nhà trọ, khách sạn, công trình",
        "có mặt nhanh tại khu vực nội thành và các phường lân cận",
        "kiểm tra lại dòng chảy trước khi bàn giao",
        "nhắc lịch hút định kỳ để hạn chế trào ngược",
    ]
    openers = [
        "Đừng chờ đến lúc nước thải tràn ra sàn mới gọi thợ.",
        "Mùi hôi xuất hiện liên tục là dấu hiệu hệ thống thoát đang có vấn đề.",
        "Bồn cầu xả chậm hôm nay có thể thành tắc nghẽn nặng vào ngày mai.",
        "Cống nghẹt trong nhà hàng, nhà trọ hay gia đình đều cần xử lý sớm.",
        "Bể phốt đầy thường không báo trước, nhưng dấu hiệu thì đã có từ vài ngày.",
    ]
    ctas = [
        "Gọi ngay để được xếp lịch xử lý sớm.",
        "Cần thợ đến nhanh, gọi trực tiếp hotline.",
        "Nhắn vị trí, tình trạng và ảnh hiện trường để được tư vấn nhanh.",
        "Đặt lịch sớm để tránh trào ngược vào giờ cao điểm.",
        "Gọi khi vừa có dấu hiệu đầu tiên để tiết kiệm chi phí xử lý.",
    ]

    rows = []
    for i in range(50):
        loc = locations[i % len(locations)]
        service = services[i % len(services)]
        pain = pains[(i * 3) % len(pains)]
        benefit1 = benefits[(i * 2) % len(benefits)]
        benefit2 = benefits[(i * 2 + 3) % len(benefits)]
        opener = openers[i % len(openers)]
        cta = ctas[(i * 4) % len(ctas)]
        src = images[i % len(images)]
        dest = INTERNAL_DIR / src.name
        if not dest.exists() or dest.stat().st_size != src.stat().st_size:
            shutil.copy2(src, dest)

        title = f"{service} tại {loc} Quảng Ninh - Hotline {HOTLINE}"
        content = (
            f"{opener}\n\n"
            f"Tại {loc}, nhiều gia đình và cửa hàng gặp tình trạng {pain}. "
            "Nếu để lâu, mùi hôi lan rộng, nước thải có thể trào ngược và làm gián đoạn sinh hoạt.\n\n"
            f"Dịch vụ {service.lower()} tại {loc} Quảng Ninh hỗ trợ kiểm tra nhanh, "
            f"{benefit1}, {benefit2}. Đội thi công dùng thiết bị phù hợp để xử lý gọn, "
            "hạn chế ảnh hưởng nền gạch và khu vực xung quanh.\n\n"
            "Khi cần hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga tại Quảng Ninh, "
            f"gọi Hotline: {HOTLINE}.\n\n"
            f"{cta}"
        )
        rows.append(
            {
                "title": title,
                "content": content,
                "attached": f"{dest}|{dest.stem}",
                "location": loc,
                "image_source": str(src),
                "image_internal": str(dest),
            }
        )
    return rows, len(images)


def main():
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    backup = BASE / f"com.mkt-page.app.before-fix-utf8-50-fanpage-qn-306307-{stamp}.db"
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(str(DB)) as src, sqlite3.connect(str(backup)) as dst:
        src.backup(dst)

    rows, source_count = build_rows()
    con = sqlite3.connect(str(DB), timeout=30)
    con.execute("pragma busy_timeout=30000")
    try:
        cat = con.execute(
            "select id,name from category where id=? and deletedAt is null", (CATEGORY_ID,)
        ).fetchone()
        if not cat:
            raise RuntimeError(f"Không tìm thấy danh mục {CATEGORY_NAME}")

        existing = con.execute(
            "select rowid from post where deletedAt is null and categoryId=? order by createdAt, rowid",
            (CATEGORY_ID,),
        ).fetchall()
        if len(existing) != 50:
            raise RuntimeError(f"Danh mục target đang có {len(existing)} bài, không phải 50")

        for post_row, new_data in zip(existing, rows):
            con.execute(
                """
                update post
                set updatedAt=?, title=?, content=?, attached=?, quantity_attached=1,
                    location=?, type_post='post', post_type='text',
                    use_filename_as_desc=0, delete_image_after_post=0, numpicture=0
                where rowid=?
                """,
                (
                    now,
                    new_data["title"],
                    new_data["content"],
                    new_data["attached"],
                    new_data["location"],
                    post_row[0],
                ),
            )
        con.commit()

        verify = con.execute(
            "select title,content,attached,quantity_attached from post where deletedAt is null and categoryId=?",
            (CATEGORY_ID,),
        ).fetchall()
        missing = [r[2] for r in verify if not Path((r[2] or "").split("|")[0]).exists()]
        bad_hotline = [r[0] for r in verify if HOTLINE not in (r[1] or "")]
        bad_encoding = [r[0] for r in verify if "?" in (r[0] or "") or "?" in (r[1] or "")]
        integrity = con.execute("pragma integrity_check").fetchone()[0]
    finally:
        con.close()

    csv_path = REPORT_DIR / f"MKT_PAGE_50_FANPAGE_QN_306307_UTF8_FIXED_{stamp}.csv"
    with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(
            f, fieldnames=["stt", "title", "location", "attached", "image_source", "image_internal"]
        )
        writer.writeheader()
        for idx, row in enumerate(rows, 1):
            writer.writerow(
                {
                    "stt": idx,
                    "title": row["title"],
                    "location": row["location"],
                    "attached": row["attached"],
                    "image_source": row["image_source"],
                    "image_internal": row["image_internal"],
                }
            )

    md_path = REPORT_DIR / f"MKT_PAGE_50_FANPAGE_QN_306307_UTF8_FIXED_{stamp}.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(f"# MKT Page 50 bài fanpage Quảng Ninh 306.307 - UTF-8 fixed\n\n")
        f.write(f"- Danh mục: {CATEGORY_NAME}\n")
        f.write(f"- Category ID: {CATEGORY_ID}\n")
        f.write(f"- Số bài: {len(rows)}\n")
        f.write(f"- Ảnh nguồn hợp lệ: {source_count}; bài 49-50 dùng lại 2 ảnh đầu.\n")
        f.write(f"- Backup trước khi sửa UTF-8: {backup}\n")
        f.write(f"- Integrity: {integrity}\n")
        f.write(f"- Missing attachment: {len(missing)}\n")
        f.write(f"- Bad hotline: {len(bad_hotline)}\n")
        f.write(f"- Bad encoding marker: {len(bad_encoding)}\n\n")
        for idx, row in enumerate(rows, 1):
            f.write(f"## {idx:02d}. {row['title']}\n")
            f.write(row["content"] + "\n\n")
            f.write(f"Ảnh: {row['attached']}\n\n")

    print(
        {
            "updated": len(rows),
            "source_images": source_count,
            "backup": str(backup),
            "csv": str(csv_path),
            "report": str(md_path),
            "missing_attachment": len(missing),
            "bad_hotline": len(bad_hotline),
            "bad_encoding_marker": len(bad_encoding),
            "integrity": integrity,
        }
    )


if __name__ == "__main__":
    main()
