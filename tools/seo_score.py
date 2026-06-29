"""SEO score tool noi bo cho du an thongtaccongquangninh.com.

Theo quy trinh PDF muc 11/15. Ban Python nay da fix 2 loi PDF:
- Khoi phuc dau tieng Viet trong cac regex va danh sach tu khoa
  (PDF render mat dau, neu copy nguyen se khong match noi dung).
- count_internal_links chi tinh link bat dau "/" hoac chua domain
  thongtaccongquangninh.com, khong tinh moi link chua "quang"/"hut".

Ho tro file .html va .md (drafts trong content-drafts/ la markdown).

v2 (2026-06-23): Bo sung 5 check sat Rank Math hon:
  - Slug co keyword (Rank Math test 3)
  - So trong title (Rank Math test 18)
  - Keyword trong subheading H2/H3 (Rank Math test 7)
  - Keyword trong ALT anh (Rank Math test 8)
  - Co external link (Rank Math test 11/12)
  Fix parser: nhan **SEO TITLE:** / **META DESCRIPTION:** / **SLUG:** cua draft.

Cach dung tren Windows:
    python tools\\seo_score.py content-drafts\\bai.md "tu khoa chinh"
    python tools\\seo_score.py exports\\bai.html "hut be phot Quang Ninh"
"""

import re
import sys
import unicodedata
from pathlib import Path

DOMAIN = "thongtaccongquangninh.com"


def md_to_html(md):
    """Markdown rut gon -> HTML toi thieu de regex dung duoc.

    Ho tro: frontmatter title/meta_description, # H1 / ## H2 / ### H3,
    ![alt](src) -> <img>, [text](url) -> <a>.
    Ho tro them nhan markdown bold kieu **SEO TITLE:** / **META DESCRIPTION:**.
    """
    lines = md.split("\n")
    out = []
    fm_title = ""
    fm_meta = ""
    in_fm = False
    if lines and lines[0].strip() == "---":
        in_fm = True
        lines = lines[1:]
        for i, line in enumerate(lines):
            if line.strip() == "---":
                lines = lines[i + 1:]
                in_fm = False
                break
            m = re.match(r"^\s*(title|meta_title|seo_title)\s*:\s*(.+?)\s*$", line, re.I)
            if m:
                fm_title = m.group(2).strip().strip('"').strip("'")
            m = re.match(r"^\s*(meta_description|description|excerpt)\s*:\s*(.+?)\s*$", line, re.I)
            if m:
                fm_meta = m.group(2).strip().strip('"').strip("'")
    # Plain "Meta Title:" / "Meta Description:" style
    if not fm_title:
        m = re.search(r"(?im)^\s*Meta\s+Title\s*:\s*(.+?)\s*$", md)
        if m:
            fm_title = m.group(1).strip().strip('"').strip("'")
    if not fm_meta:
        m = re.search(r"(?im)^\s*Meta\s+Description\s*:\s*(.+?)\s*$", md)
        if m:
            fm_meta = m.group(1).strip().strip('"').strip("'")
    # Draft format: **SEO TITLE:** / **META DESCRIPTION:**
    if not fm_title:
        m = re.search(r"(?im)^\*\*SEO\s+TITLE\s*:\*\*\s*(.+?)\s*$", md)
        if m:
            fm_title = m.group(1).strip()
    if not fm_meta:
        m = re.search(r"(?im)^\*\*META\s+DESCRIPTION\s*:\*\*\s*(.+?)\s*$", md)
        if m:
            fm_meta = m.group(1).strip()
    for line in lines:
        if re.match(r"^# +", line):
            out.append(f"<h1>{re.sub(r'^# +', '', line).strip()}</h1>")
        elif re.match(r"^## +", line):
            out.append(f"<h2>{re.sub(r'^## +', '', line).strip()}</h2>")
        elif re.match(r"^### +", line):
            out.append(f"<h3>{re.sub(r'^### +', '', line).strip()}</h3>")
        else:
            out.append(line)
    body = "\n".join(out)
    body = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)(?:\s+[^)]*)?\)", r'<img src="\2" alt="\1">', body)
    body = re.sub(r"\[([^\]]+)\]\(([^)\s]+)(?:\s+[^)]*)?\)", r'<a href="\2">\1</a>', body)
    head = ""
    if fm_title:
        head += f"<title>{fm_title}</title>\n"
    if fm_meta:
        head += f'<meta name="description" content="{fm_meta}">\n'
    return head + body


def clean_text(html):
    text = re.sub(r"<script.*?</script>", "", html, flags=re.S)
    text = re.sub(r"<style.*?</style>", "", text, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def count_words(text):
    return len(re.findall(r"\w+", text, flags=re.UNICODE))


def has_keyword(text, keyword):
    return keyword.lower() in text.lower()


def count_keyword(text, keyword):
    return text.lower().count(keyword.lower())


def extract_tag(content, tag):
    pattern = rf"<{tag}[^>]*>(.*?)</{tag}>"
    return re.findall(pattern, content, flags=re.I | re.S)


def extract_meta_description(content):
    match = re.search(
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']',
        content,
        flags=re.I,
    )
    return match.group(1) if match else ""


def count_images(content):
    return len(re.findall(r"<img[^>]+>", content, flags=re.I))


def count_images_with_alt(content):
    imgs = re.findall(r"<img[^>]+>", content, flags=re.I)
    count = 0
    for img in imgs:
        if re.search(r'alt=["\'][^"\']{5,}["\']', img, flags=re.I):
            count += 1
    return count


def has_keyword_in_any_alt(content, keyword):
    """Kiem tra co it nhat 1 anh co keyword trong alt."""
    imgs = re.findall(r"<img[^>]+>", content, flags=re.I)
    for img in imgs:
        m = re.search(r'alt=["\']([^"\']+)["\']', img, flags=re.I)
        if m and has_keyword(m.group(1), keyword):
            return True
    return False


def count_internal_links(content):
    """Chi tinh link bat dau '/' hoac chua dung domain noi bo."""
    links = re.findall(r'<a[^>]+href=["\']([^"\']+)["\']', content, flags=re.I)
    count = 0
    for href in links:
        h = href.strip().lower()
        if h.startswith("/"):
            count += 1
        elif DOMAIN in h:
            count += 1
    return count


def count_external_links(content):
    """Dem link ra ngoai (khong phai internal). Proxy cho Rank Math test external link."""
    links = re.findall(r'<a[^>]+href=["\']([^"\']+)["\']', content, flags=re.I)
    count = 0
    for href in links:
        h = href.strip().lower()
        if h.startswith(("http://", "https://")) and DOMAIN not in h:
            count += 1
    return count


def detect_faq(content):
    return bool(re.search(r"câu hỏi thường gặp|faq|hỏi đáp", content, flags=re.I))


def detect_schema(content):
    return bool(re.search(r"application/ld\+json|FAQPage|LocalBusiness", content, flags=re.I))


def simple_slug(text):
    """Chuyen keyword thanh dang slug (khong dau, chu thuong, dau gan = gach ngang)."""
    nfkd = unicodedata.normalize("NFKD", text.lower())
    ascii_str = nfkd.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_str).strip("-")
    return slug


def extract_slug_from_raw(raw):
    """Lay slug tu nhan **SLUG:** hoac truong slug: trong frontmatter."""
    m = re.search(r"(?im)^\*\*SLUG\s*:\*\*\s*(.+?)\s*$", raw)
    if m:
        return m.group(1).strip()
    m = re.search(r"(?im)^\s*slug\s*:\s*(.+?)\s*$", raw)
    if m:
        return m.group(1).strip().strip('"').strip("'")
    return ""


def grade_difficulty(keyword):
    kw = keyword.lower()
    hard_terms = [
        "hút bể phốt",
        "thông tắc cống",
        "thông tắc bồn cầu",
        "quảng ninh",
        "hạ long",
    ]
    medium_terms = [
        "cẩm phả",
        "uông bí",
        "móng cái",
        "đông triều",
        "quảng yên",
        "vân đồn",
    ]
    score = 0
    for t in hard_terms:
        if t in kw:
            score += 2
    for t in medium_terms:
        if t in kw:
            score += 1
    if score >= 5:
        return "hard", 88
    if score >= 3:
        return "medium", 84
    return "easy", 80


def score_article(content, keyword, raw_content=None):
    text = clean_text(content)
    words = count_words(text)
    keyword_count = count_keyword(text, keyword)
    h1 = extract_tag(content, "h1")
    h2 = extract_tag(content, "h2")
    h3 = extract_tag(content, "h3")
    title = extract_tag(content, "title")
    meta = extract_meta_description(content)
    images = count_images(content)
    images_alt = count_images_with_alt(content)
    internal_links = count_internal_links(content)
    external_links = count_external_links(content)

    # Slug
    fm_slug = extract_slug_from_raw(raw_content) if raw_content else ""
    keyword_slug = simple_slug(keyword)

    score = 0
    checks = []

    def add(condition, points, name):
        nonlocal score
        if condition:
            score += points
            checks.append(f"PASS: {name} +{points}")
        else:
            checks.append(f"FAIL: {name} +0")

    # --- Basic SEO ---
    add(words >= 900, 10, "Nội dung >= 900 từ")
    add(words >= 1300, 5, "Nội dung >= 1300 từ")
    add(words >= 2500, 3, "[RM] Nội dung >= 2500 từ (Rank Math 100%)")
    add(len(h1) == 1, 8, "Có đúng 1 H1")
    add(len(h2) >= 4, 8, "Có ít nhất 4 H2")
    add(len(h3) >= 2, 4, "Có H3 bổ trợ")
    add(bool(title and has_keyword(clean_text(title[0]), keyword)), 8, "Title có từ khóa chính")
    title_text = clean_text(title[0]) if title else ""
    add(bool(title_text and re.search(r"\d", title_text)), 3, "[RM] Có số trong title")
    add(bool(meta and has_keyword(meta, keyword)), 8, "Meta description có từ khóa chính")
    add(bool(meta and 120 <= len(meta) <= 165), 5, "Meta description dài hợp lý")
    add(bool(fm_slug and keyword_slug and keyword_slug in fm_slug), 5, "[RM] Slug có từ khóa chính")
    add(has_keyword(text[:500], keyword), 8, "Từ khóa xuất hiện trong 500 ký tự đầu")
    add(keyword_count >= 3, 6, "Từ khóa xuất hiện tối thiểu 3 lần")
    max_keyword_count = max(8, int(words * 0.018))
    add(keyword_count <= max_keyword_count, 5, "Không nhồi từ khóa quá mức")

    # --- Additional ---
    add(
        any(has_keyword(h, keyword) for h in h2 + h3),
        5,
        "[RM] Từ khóa trong subheading H2/H3",
    )
    add(has_keyword_in_any_alt(content, keyword), 4, "[RM] Từ khóa trong ALT ảnh")
    add("quảng ninh" in text.lower(), 7, "Có yếu tố địa phương Quảng Ninh")
    add(
        any(
            x in text.lower()
            for x in [
                "hạ long",
                "cẩm phả",
                "uông bí",
                "móng cái",
                "đông triều",
                "quảng yên",
                "vân đồn",
            ]
        ),
        5,
        "Có địa danh phụ",
    )
    add(images >= 2, 6, "Có tối thiểu 2 ảnh")
    add(images >= 4, 3, "[RM] Có tối thiểu 4 ảnh (Rank Math 100%)")
    add(images_alt >= images and images > 0, 6, "Ảnh có alt đầy đủ")
    add(internal_links >= 2, 7, "Có tối thiểu 2 internal link")
    add(external_links >= 1, 3, "[RM] Có external link (dofollow giả định)")
    add(detect_faq(content), 5, "Có FAQ")
    add(detect_schema(content), 5, "Có schema FAQ/LocalBusiness")
    add(
        any(
            x in text.lower()
            for x in [
                "gọi ngay",
                "liên hệ ngay",
                "zalo",
                "hotline",
                "tư vấn miễn phí",
            ]
        ),
        5,
        "Có CTA mạnh",
    )

    raw_score = min(score, 100)
    internal_score = max(0, raw_score - 5)
    difficulty, required_score = grade_difficulty(keyword)

    return {
        "keyword": keyword,
        "difficulty": difficulty,
        "required_score": required_score,
        "word_count": words,
        "slug": fm_slug,
        "raw_score": raw_score,
        "internal_score": internal_score,
        "pass": internal_score >= required_score,
        "checks": checks,
    }


def main():
    if len(sys.argv) < 3:
        print('Cach dung: python tools/seo_score.py path/to/article.{html,md} "tu khoa chinh"')
        sys.exit(1)

    file_path = Path(sys.argv[1])
    keyword = sys.argv[2]

    if not file_path.exists():
        print(f"Khong tim thay file: {file_path}")
        sys.exit(1)

    raw = file_path.read_text(encoding="utf-8", errors="ignore")
    if file_path.suffix.lower() in {".md", ".markdown"}:
        content = md_to_html(raw)
    else:
        content = raw
        raw = None  # HTML file: khong co raw markdown

    result = score_article(content, keyword, raw_content=raw)

    print("=" * 60)
    print("SEO SCORE TOOL NỘI BỘ v2")
    print("=" * 60)
    print(f"Tu khoa chinh    : {result['keyword']}")
    print(f"Slug phat hien   : {result['slug'] or '(khong tim thay)'}")
    print(f"Do kho           : {result['difficulty']}")
    print(f"Diem yeu cau     : {result['required_score']}")
    print(f"So tu            : {result['word_count']}")
    print(f"Diem tho         : {result['raw_score']}/100")
    print(f"Diem noi bo      : {result['internal_score']}/100")
    print(f"Ket luan         : {'DAT' if result['pass'] else 'CHUA DAT'}")
    print("=" * 60)
    for check in result["checks"]:
        print(check)
    print("=" * 60)
    rm_gaps = [c for c in result["checks"] if c.startswith("FAIL") and "[RM]" in c]
    if rm_gaps:
        print("TEST RANK MATH CON FAIL (uu tien va):")
        for g in rm_gaps:
            print(" ", g)
        print("=" * 60)
    if not result["pass"]:
        print("KHONG DUOC PUBLIC. Can sua cac muc FAIL truoc.")
        sys.exit(2)
    else:
        print("DAT DIEM NOI BO. Co the chuyen sang buoc kiem tra cuoi/public.")


if __name__ == "__main__":
    main()
