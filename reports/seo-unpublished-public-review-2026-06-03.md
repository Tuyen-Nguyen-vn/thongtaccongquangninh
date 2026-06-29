# Audit draft SEO chua public - 2026-06-03

Thoi gian kiem tra: 2026-06-03 12:22-12:30 Asia/Bangkok.

## Ket luan

- Da kiem tra WordPress live sau su co HTTP 500: home, REST `wp/v2/posts` va sitemap deu HTTP 200.
- REST edit context lay duoc 68 item WordPress dang `draft/pending/future/private`. Phan lon la ban cu, ban legacy, page he thong hoac draft da bi chan trong `DRAFT_DUPLICATE_REVIEW.md`.
- Nhom draft SEO active trong `content-drafts/**` co ban WP dang draft: 13 bai.
- 13/13 bai nay deu pass `tools/seo_score.py`, nhung URL goc hien dang 301 sang ban da public va indexable. Vi vay khong publish them de tranh tao duplicate content.
- Khong co bai SEO moi nao du dieu kien "chua public that su" de publish trong lan nay.

## Nhom da duyet SEO va da public qua route live

| Slug goc | Score noi bo | URL live hien tai | Trang thai |
|---|---:|---|---|
| `bon-cau-rut-cham-nguyen-nhan` | 95/80 | `https://thongtaccongquangninh.com/bon-cau-rut-cham-nguyen-nhan-3/` | Live 200, indexable |
| `chi-phi-hut-be-phot-quang-ninh` | 95/84 | `https://thongtaccongquangninh.com/chi-phi-hut-be-phot-quang-ninh-2/` | Live 200, indexable |
| `chu-ky-hut-be-phot` | 95/80 | `https://thongtaccongquangninh.com/chu-ky-hut-be-phot-3/` | Live 200, indexable |
| `hoa-chat-tu-thong-cong` | 95/80 | `https://thongtaccongquangninh.com/hoa-chat-tu-thong-cong-3/` | Live 200, indexable |
| `mui-hoi-cong-nguyen-nhan-xu-ly` | 95/80 | `https://thongtaccongquangninh.com/mui-hoi-cong-nguyen-nhan-xu-ly-4/` | Live 200, indexable |
| `hut-be-phot-ba-che` | 95/80 | `https://thongtaccongquangninh.com/hut-be-phot-ba-che-2/` | Live 200, indexable |
| `hut-be-phot-binh-lieu` | 95/80 | `https://thongtaccongquangninh.com/hut-be-phot-binh-lieu-2/` | Live 200, indexable |
| `hut-be-phot-co-to` | 95/80 | `https://thongtaccongquangninh.com/hut-be-phot-co-to-2/` | Live 200, indexable |
| `hut-be-phot-dam-ha` | 95/80 | `https://thongtaccongquangninh.com/hut-be-phot-dam-ha-2/` | Live 200, indexable |
| `hut-be-phot-hai-ha` | 95/80 | `https://thongtaccongquangninh.com/hut-be-phot-hai-ha-2/` | Live 200, indexable |
| `hut-be-phot-tien-yen` | 95/80 | `https://thongtaccongquangninh.com/hut-be-phot-tien-yen-2/` | Live 200, indexable |
| `thong-tac-cong-hong-gai` | 95/80 | `https://thongtaccongquangninh.com/thong-tac-cong-hong-gai-2/` | Live 200, indexable |
| `cau-hoi-thuong-gap-thong-tac-cong-qn` | 95/80 | `https://thongtaccongquangninh.com/cau-hoi-thuong-gap-thong-tac-cong/` | Live 200, indexable |

## Bai da public san, khong can thao tac

- `thong-tac-cong-bai-chay` dang live 200.
- `thong-tac-cong-cao-xanh` dang live 200.
- `thong-tac-cong-gieng-day` dang live 200.
- `thong-tac-cong-tuan-chau` dang live 200.
- Nhom bai auto ngay 2026-05-31 den 2026-06-03 nhu `thong-tac-bon-cau-nha-dan-quang-ninh-2026`, `thong-tac-bon-cau-nha-hang-quang-ninh-2026`, `thong-tac-bon-cau-khach-san-quang-ninh-2026`, `hut-be-phot-khan-cap-quang-ninh-2026`, `hut-be-phot-24-7-quang-ninh-2026`, `gia-hut-be-phot-quang-ninh-2026` da live.

## Draft bi giu lai

- Draft legacy nhu `Elementor #33`, `Privacy Policy`, `ve-chung-toi`, `ve-sinh-duong-ong-quang-ninh` khong phai bai SEO active.
- Draft co dau hieu cu/khong an toan nhu title lap `24/7, xu ly nhanh trong ngay`, slug rong, ban cu duplicate hoac file khong nam trong `content-drafts/**` active khong duoc public.
- Cac draft giu slug goc cua bai da public qua URL `-2`, `-3`, `-4` khong duoc publish them vi se sinh duplicate content.

## Lenh kiem tra da chay

- `curl -I -L https://thongtaccongquangninh.com/?nowprocket=1&codex=publish-preflight-20260603` -> HTTP 200.
- `curl -I -L https://thongtaccongquangninh.com/wp-json/wp/v2/posts?per_page=1` -> HTTP 200.
- `curl -I -L https://thongtaccongquangninh.com/sitemap_index.xml?codex=publish-preflight-20260603` -> HTTP 200.
- REST edit context scan `draft/pending/future/private`: 68 item.
- `python3 tools/seo_score.py` logic import cho 13 draft active: 13/13 pass.
- Live verify 13 route: HTTP 200, canonical tu tro, robots `index, follow`, khong `noindex`.
- `node tools/collect_wp_url_audit_list.mjs` -> 88 URL publish, 1 draft trong audit list, sitemap 89 URL.
- `python3 tools/audit_unique_wp_images.py --no-hash` -> 2 URL duoi 3 anh, deu la page phap ly (`/dieu-khoan-dich-vu/`, `/chinh-sach-bao-mat/`), khong phai draft SEO can public.

## Viec tiep theo nen lam

Chuan hoa slug/canonical cho cac bai dang live o URL `-2`, `-3`, `-4` neu muon URL gon hon, lam theo batch rieng co backup va redirect hai chieu ro rang.
