# Plan Audit SEO Toan Website - 2026-06-03

Website: https://thongtaccongquangninh.com  
Workspace: `/mnt/d/.thongtaccongquangninh`  
Thoi diem lap plan: 2026-06-03 11:59 +07  
Pham vi: audit toan bo website theo chuan SEO, local SEO, Google Search Essentials, image SEO, schema, internal link, performance va code/plugin hygiene.

## 1. Su That Dau Vao

- HTTP live hien tai dang loi 500 tren trang chu, sitemap va REST:
  - `/` = 500
  - `/sitemap_index.xml` = 500
  - `/wp-json/` = 500
  - `robots.txt` = 200
- Report su co: `reports/live-500-incident-2026-06-03.md`.
- Inventory gan nhat: `wp-url-audit-list.json` tao ngay 2026-06-02:
  - `88` dong audit.
  - `87` URL public can audit SEO.
  - `48` URL nghi landing page local SEO.
  - `88` URL trong sitemap.
  - Workspace khong co WordPress core, nen dung REST API + sitemap, khong mac dinh WP-CLI.
- Audit full gan nhat truoc su co:
  - `reports/seo-full-audit-2026-06-03.md`: 76 URL, PASS 13, FAIL 33, WARN 30.
  - Top issue: content 78, title/meta 53, heading 27, schema 24, image 14.
  - `reports/site-full-audit-2026-06-03.md`: 1 broken internal link, 2 footer variants.
- Structured data audit gan nhat:
  - `reports/structured-data-live-audit-2026-06-03T04-52-46.md`: 88/88 PASS tren HTML public fetch bang cache-buster.
  - GSC van co loi rich result cu tren 3 URL, nen can recrawl/validation sau khi site hoi phuc.
- Image audit gan nhat:
  - `reports/wp-unique-image-audit-2026-06-03T02-02-44.md`: 76 noi dung, 2 trang thieu anh, 1 nhom anh dung lai toan site.
- GSC audit gan nhat:
  - `reports/gsc-website-action-plan-2026-06-03.md`: cac URL chinh submitted/indexed, CTR yeu o nhom co impression cao.
  - `reports/gsc-404-redirect-audit-2026-06-03T03-59-24.md`: 16 URL 404, 10 redirect 1 buoc, 0 redirect chain dai.

Ket luan: khong chay audit sau hoac sua live khi WordPress con 500. P0 la khoi phuc live truoc, roi moi audit SEO toan site.

## 2. Nguyen Tac Audit Bat Buoc

- Read-only truoc: chi GET/HEAD REST, sitemap, public HTML, GSC/GA4 neu co token.
- Khong publish, khong POST/PUT/PATCH/DELETE WordPress neu chua co backup va lenh duyet ro.
- Neu sua live sau audit: backup truoc, dry-run neu tool ho tro, apply, verify frontend bang cache-buster, re-audit, ghi `docs/SEO_PROGRESS.csv`.
- Khong hua hen AI Overview/Discover/featured snippet. Chi kiem dieu kien crawl, index, snippet eligibility, helpful content va schema hop le.
- Schema phai khop noi dung visible. Khong them review/rating/case neu khong co bang chung hien thi tren trang.
- Local page khong duoc chi thay dia danh. Moi trang phai co intent, local entity, tinh huong, FAQ, anh/caption rieng.
- Anh SEO lay tu `Anh cung cap`, xu ly sang `Anh Da Xu Ly SEO`, khong dung poster quang cao de chen bai.
- Plugin/code cleanup phai phan loai `KEEP`, `REVIEW_REQUIRED`, `SAFE_DELETE`; khong xoa media, backup, report, plugin live neu chua co bang chung.

## 3. Pha Audit

### P0 - Khoi Phuc Kha Nang Audit Live

Muc tieu: dua WordPress live ve trang thai co the audit duoc.

Can lam:
- Lay PHP error log hosting/cPanel/SSH trong khoang 2026-06-03 11:02-11:05 +07.
- Kiem tra recovery email WordPress neu co.
- Doi chieu thao tac gan nhat: pipeline `reports/pipeline-gia-hut-be-phot-quang-ninh-2026-20260603-1055.json`, post 2449, media 2450-2452.
- Neu log chi plugin/theme/post cu the, tam vo hieu hoa theo quy trinh hosting va co rollback.

Lenh verify toi thieu:

```bash
curl -I -L 'https://thongtaccongquangninh.com/?nowprocket=1&codex=recover-check'
curl -I -L 'https://thongtaccongquangninh.com/sitemap_index.xml?codex=recover-check'
curl -I -L 'https://thongtaccongquangninh.com/wp-json/?codex=recover-check'
curl 'https://thongtaccongquangninh.com/robots.txt'
```

Gate dat:
- Trang chu 200.
- REST `/wp-json/` 200.
- `sitemap_index.xml` 200.
- `robots.txt` 200 va khong chan CSS/JS/image quan trong.

### P1 - Inventory Toan Site

Muc tieu: tao danh sach URL that, gom REST, sitemap, GSC va URL redirect/404.

Lenh:

```bash
node tools/collect_wp_url_audit_list.mjs
node tools/audit_gsc_404_redirect.mjs
```

Can doi chieu:
- URL sitemap canonical/indexable/200.
- URL REST publish nhung khong co sitemap.
- URL sitemap-only nhu category/tag/legacy.
- URL 404 co impression/backlink/internal link.
- URL redirect 1 buoc, redirect chain, soft 404.

Output:
- `wp-url-audit-list.csv`
- `wp-url-audit-list.json`
- `WP_URL_AUDIT_REPORT_YYYY-MM-DD.md`
- report GSC 404/redirect moi trong `reports/`.

### P2 - Technical SEO Baseline

Muc tieu: kiem indexability, canonical, robots, status code, viewport, meta robots, sitemap hygiene.

Lenh:

```bash
node tools/audit_seo_full.mjs --no-csv
node tools/audit_live_links_assets.mjs
```

Luu y: `tools/audit_live_links_assets.mjs` hien con hard-code duong dan Windows, can patch WSL-safe truoc neu chay trong WSL.

Checklist:
- Moi URL indexable tra 200, khong redirect.
- Canonical tu tro dung URL chinh.
- Khong noindex nham landing/page quan trong.
- Category/tag sitemap phai co ly do SEO rieng, neu mong thi de xuat noindex/loai sitemap.
- Internal link khong tro 404/redirect.
- Footer/header/CTA khong tao bien the thua neu khong co ly do.

### P3 - Title, Meta, Heading, Content

Muc tieu: sua on-page de tang CTR va giam loi Helpful Content.

Nguon uu tien:
- `reports/seo-full-audit-2026-06-03.md`
- `reports/gsc-website-action-plan-2026-06-03.md`
- `WP_URL_AUDIT_REPORT_2026-06-02.md`

Nhom can audit sau:
- Duplicate title:
  - `/thong-tac-bon-cau-khan-cap-quang-ninh/`
  - `/thong-tac-bon-cau-khan-cap-quang-ninh-2/`
- Trang co impression cao CTR yeu:
  - `/hut-be-phot-uong-bi/`
  - `/hut-be-phot-dong-trieu/`
  - `/hut-be-phot-cam-pha/`
  - `/hut-be-phot-quang-ninh/`
  - `/hut-be-phot-mong-cai/`
- Trang local mong/word count thap:
  - `/hut-be-phot-dong-trieu/`
  - `/hut-be-phot-mong-cai/`
  - `/thong-tac-cong-dong-trieu/`
  - `/thong-tac-cong-mong-cai/`
  - `/thong-tac-cong-van-don/`

Checklist:
- Title 60-70 ky tu neu la landing/service.
- Meta 150-160 ky tu, co tinh huong + dia phuong + hotline khi phu hop.
- 1 H1 duy nhat.
- H2 bat buoc cho bai dich vu/local: Nguyen nhan, Cam ket 3 Khong, Bang gia, Quy trinh 5 buoc, tinh huong/case an toan, NAP, FAQ.
- Xoa tu cam: `chuyen nghiep`, `uy tin`, `hang dau`, `tan tam`.
- Khong de nhan bien tap nhu `CTA cuoi bai`, `outline`, `TODO`.

### P4 - Local SEO Chong Doorway

Muc tieu: audit 48 URL local SEO theo tinh doc lap noi dung.

Can kiem:
- Moi URL co intent rieng: tinh huong, loai cong trinh, khu vuc, thiet bi, rui ro.
- Khong copy case study giua dia phuong.
- Neu chua co case that, doi thanh `tinh huong thuong gap`.
- Local entity phai dung dia ban, khong tron Hạ Long/Cam Pha/Uong Bi/Van Don.
- FAQ voice search rieng theo dia phuong.
- Internal link ve pillar va bai lien quan tu nhien, anchor co dau.

Output:
- Bang `URL | cum dich vu | dia phuong | diem doorway risk | loi | fix path`.

### P5 - Structured Data va Rich Result

Muc tieu: dam bao JSON-LD sach va khop visible content.

Lenh:

```bash
node tools/audit_live_structured_data.mjs
```

Can audit:
- `LocalBusiness` / `HomeAndConstructionBusiness`: NAP, hotline, URL, areaServed.
- `Service`: chi co tren page/post co noi dung dich vu visible.
- `FAQPage`: chi co neu FAQ hien tren trang.
- `BlogPosting`: author, datePublished/dateModified, headline, image.
- `Person`: ap dung cho `/nguyen-song-hao/`, khong bien thanh LocalBusiness la schema chinh.
- Khong co `Review`/`AggregateRating` neu khong co review/rating that visible.

GSC rich result:
- Neu live audit PASS nhung GSC FAIL do ban crawl cu, request recrawl/validate.
- Neu crawl moi van FAIL, truy nguon Rank Math, `ttcqn-doorway-schema`, `ttcqn-seo-cleanup-redirects`, renderer custom.

### P6 - Image SEO

Muc tieu: moi trang SEO co anh dung dich vu, alt/caption dung ngu canh, khong lap nguyen xi.

Lenh:

```bash
python3 tools/audit_unique_wp_images.py --no-hash
```

Can audit:
- Trang thieu anh:
  - `/dieu-khoan-dich-vu/`
  - `/chinh-sach-bao-mat/`
- Homepage: 8 anh alt rong, 12 alt chua bam dich vu/dia phuong.
- Global reused image group con lai.
- Anh hero/LCP khong lazy-load.
- Anh quan trong co width/height, alt tu nhien, caption an toan.
- Khong ghi `anh thuc te` neu chua co can cu.

Output:
- Bang `URL | so anh | thieu anh | alt/caption issue | duplicate group | fix path`.

### P7 - Internal Link, IA, CTA va Footer

Muc tieu: lam ro cau truc site va dong chuyen doi.

Can audit:
- Broken internal link hien co:
  - `/thong-tac-bon-cau-nha-hang-quang-ninh-2026/` dang tro `/thong-tac-cong-nha-hang-quang-ninh/` 404.
- 16 URL 404 trong report GSC co can redirect 301 khong.
- 10 redirect 1 buoc co can giu hay cap nhat internal link sang URL dich.
- Moi bai blog ho tro link ve 1 pillar + 2-4 URL lien quan.
- Footer variant 2: xac dinh bien the co chu dich hay do template chong lop.
- Hotline dung: `0963.953.533 / 0931.156.756`.

### P8 - Performance, Mobile va Core Web Vitals

Muc tieu: uu tien toc do tren mobile, khong lam vo giao dien/CTA.

Lenh:

```bash
python3 tools/seo_weekly_report.py --pagespeed-only
```

Can audit:
- PageSpeed mobile/desktop cho home, pillar dich vu, URL co impression cao.
- LCP image, unused JS, render-blocking CSS/JS.
- Plugin runtime con `REVIEW_REQUIRED`:
  - `ttcqn-home-service-images`
  - `ttcqn-mobile-image-optimizer`
  - `ttcqn-subpage-banner-dedupe`
- Khong xoa plugin chi vi `rg` khong thay reference; phai co bang chung live/source/visual.

### P9 - GSC, GA4, Monitoring

Muc tieu: bien audit thanh vong lap do luong.

Can audit:
- Top queries 28 ngay: click, impression, CTR, position.
- Page co impression cao nhung CTR thap.
- URL Inspection cho nhom P0/P1 sau sua.
- Sitemap submit/validation.
- Rich result validation sau khi site hoi phuc.
- Uptime log neu co: theo doi 500/timeout.

Output:
- `reports/gsc-website-action-plan-YYYY-MM-DD.md`
- `docs/reports/weekly/YYYY-MM-DD.md` neu chay weekly report.

### P10 - Code, Plugin, Source Of Truth

Muc tieu: website sach, khong chong code/plugin.

Can audit:
- Plugin nao dang la source-of-truth cho homepage, schema, contact block, redirect, image optimizer.
- Upload script va zip nao con dung.
- File/plugin nao `KEEP`, `REVIEW_REQUIRED`, `SAFE_DELETE`.
- Khong tao CSS/filter moi neu co the sua source goc.
- Khong de hai plugin cung sinh title/meta/schema/contact block gay xung dot.

Lenh read-only:

```bash
python3 tools/project_folder_manager.py --root /mnt/d/.thongtaccongquangninh
```

## 4. Backlog Uu Tien Sau Khi Live Hoi Phuc

### P0 - Lam Ngay

1. Khac phuc HTTP 500 toan he thong, verify home/REST/sitemap 200.
2. Fix duplicate title 100% giua 2 bai bon cau khan cap.
3. Fix internal link 404 trong `/thong-tac-bon-cau-nha-hang-quang-ninh-2026/`.
4. Xu ly/len plan redirect 16 URL 404 co gia tri SEO/GSC.
5. Validate/recrawl 3 URL rich result GSC dang giu loi cu.

### P1 - Sua On-page Co Impact SEO Cao

1. Rewrite title/meta nhom co impression cao CTR thap: Uong Bi, Dong Trieu, Cam Pha, Quang Ninh, Mong Cai.
2. Bo sung H2 `Nguyen nhan` va `NAP / Lien he` cho URL bi audit flag.
3. Giam keyword stuffing tren `/cau-hoi-thuong-gap-thong-tac-cong/`, `/nguyen-nhan-cong-tac-thuong-xuyen-ha-long/`, `/hut-be-phot-dong-trieu/`.
4. Lam day noi dung local mong nhung khong copy template.

### P2 - Lam Sach Anh, Schema, Plugin

1. Fix alt homepage va cac bai co `ALT_NO_SERVICE_OR_LOCATION`.
2. Bo sung/hoac quyet dinh khong can anh cho 2 trang policy, neu la trang policy thuan thi khong ep 3 anh may moc.
3. Review category sitemap va taxonomy mong.
4. Review 3 plugin `REVIEW_REQUIRED` bang visual + source live.
5. Lap retention plan cho reports/backups, khong xoa thang.

## 5. Mau Report Ket Qua Audit Can Co

Moi batch audit phai co:
- `Nguon da kiem`: URL/file/tool/report.
- `Ket qua dat`: muc PASS co bang chung.
- `Loi can sua`: URL, loi, muc uu tien, rui ro SEO.
- `Fix path`: sua REST/content/plugin/option/Rank Math/schema hay redirect.
- `Risk`: live risk, cache risk, auth risk, data thieu.
- `Verify command`: lenh da chay.
- `One next action`: chi 1 viec tiep theo.

## 6. Tieu Chi Hoan Thanh Audit Toan Site

- Live khong con HTTP 500.
- Co inventory moi sau khi site hoi phuc.
- Co report full audit moi sau outage.
- 0 broken internal link quan trong.
- Sitemap chi chua URL canonical/indexable/200 hoac co quyet dinh ro cho category.
- Structured data live PASS va GSC rich result duoc recrawl/validation.
- Image audit co backlog ro cho alt/caption/duplicate/thieu anh.
- 48 local landing co diem doorway risk va fix path.
- `docs/SEO_PROGRESS.csv` co log cho batch audit/fix.

## 7. Lenh Chay Theo Thu Tu De Trien Khai

Chi chay sau khi P0 HTTP 500 da hoi phuc:

```bash
node tools/collect_wp_url_audit_list.mjs
node tools/audit_seo_full.mjs --no-csv
node tools/audit_live_structured_data.mjs
python3 tools/audit_unique_wp_images.py --no-hash
node tools/audit_gsc_404_redirect.mjs
python3 tools/seo_weekly_report.py --pagespeed-only
python3 tools/project_folder_manager.py --root /mnt/d/.thongtaccongquangninh
```

Neu sua tool/script:

```bash
node --check tools/<script>.mjs
python3 -m py_compile tools/<script>.py
```

Neu sua WordPress live:

```bash
# 1. backup post/page/option/meta lien quan
# 2. dry-run neu tool ho tro
# 3. apply
# 4. public verify voi cache-buster
# 5. re-audit URL/batch
```

