# SEO STATUS — 2026-06-08

> Tổng kết phiên làm việc 2026-06-08. Trạng thái live tại thời điểm kết phiên.

## Việc đã hoàn thành hôm nay

### 1. Fix canonical cannibalization HBP
- **Vấn đề**: `/xe-hut-be-phot-quang-ninh-2026/` (post 2554) cạnh tranh keyword với `/hut-be-phot-quang-ninh/` (Jaccard 0.65).
- **Fix**: Set `rank_math_robots = noindex` trên post 2554 via Rank Math updateMeta REST.
- **Verify live**: `follow, noindex` — canonical bị suppress (đúng behavior Rank Math khi noindex).
- **Monitor**: Chờ GSC Coverage → Excluded trong 7 ngày.

### 2. Refresh URL inventory
- Script: `tools/refresh_url_audit.mjs`
- Kết quả: `wp-url-audit-list.csv/json` — **149 entries** (54 pages + 95 posts), 61 local landing published.
- Tăng từ 90 → 149 (phản ánh đúng trạng thái sau các đợt publish).

### 3. Fix 5 cặp title gần trùng
- Đối tượng: Móng Cái (55) vs Đông Triều (56) — Jaccard 0.78; Đầm Hà (2050) vs Tiên Yên (2052) — suffix trùng.
- Script: `tools/fix_duplicate_titles_hbp.mjs`
- Kết quả 5/5 ✓:

| ID | Slug | Title mới |
|---|---|---|
| 55 | hut-be-phot-mong-cai | Hút Bể Phốt Móng Cái – Xe Bồn Cửa Khẩu, Phục Vụ 24/7 |
| 56 | hut-be-phot-dong-trieu | Hút Bể Phốt Đông Triều 24/7 – Xe Bồn Vào Khu Công Nghiệp |
| 2050 | hut-be-phot-dam-ha | Hút Bể Phốt Đầm Hà Quảng Ninh – Xe Vào Vùng Ven Biển 24/7 |
| 2051 | hut-be-phot-hai-ha | Hút Bể Phốt Hải Hà Quảng Ninh – Xe Bồn Ven Biển 24/7 |
| 2052 | hut-be-phot-tien-yen | Hút Bể Phốt Tiên Yên Quảng Ninh – Xe Đến Thị Trấn 24/7 |

### 4. Batch author byline
- Script: `tools/batch_author_ip_bypass.mjs`
- 29 posts đã có author trước. 3 posts còn thiếu (2589, 2559, 2054) → thêm byline thành công.
- Kết quả: **32/33 published posts có byline** `Nguyễn Song Hào`. (Post 2554 bỏ qua — noindex.)

### 5. Internal link — 5 landing chính (+2 dịch vụ phụ)
- Scripts: `tools/add_internal_links_to_landings.mjs`, `tools/fix_bon_cau_internal_links.mjs`, `tools/fix_hhc_nvhg_internal_links.mjs`
- Tổng **28 link mới** thêm vào 5 landing:

| Landing | Link thêm | Live |
|---|---|---|
| `/hut-be-phot-quang-ninh/` | 6 (Móng Cái, Đông Triều, Vân Đồn + chi phí, chu kỳ, dấu hiệu) | ✓ |
| `/thong-tac-cong-quang-ninh/` | 5 (Bãi Cháy, Cao Xanh, Tuần Châu, Giếng Đáy, Đông Triều) | ✓ |
| `/thong-tac-bon-cau-quang-ninh/` | 8 (Hạ Long, Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Vân Đồn + giá, khẩn cấp) | ✓ |
| `/hut-ham-cau-quang-ninh-2026/` | 7 (HBP QN, Hạ Long, Cẩm Phả, Uông Bí + chi phí, chu kỳ, bảng giá) | ✓ |
| `/nao-vet-ho-ga-quang-ninh/` | 2 (xử lý mùi hôi, nạo vét hố ga) | ✓ |

### 6. Rank Math focus keyword + meta description — 42 trang
- Scripts: `tools/set_rankmath_meta_landings.mjs`, `tools/set_rankmath_meta_area_pages.mjs`, `tools/set_rankmath_meta_remaining.mjs`
- **42/42 trang** có focus KW + meta description ≤ 160 chars:

| Nhóm | Số | Script |
|---|---|---|
| 5 landing chính | 5 | set_rankmath_meta_landings.mjs |
| HBP + TTC + BC thành phố lớn | 14 | set_rankmath_meta_area_pages.mjs |
| BC + TTC huyện, HBP huyện xa, informational | 23 | set_rankmath_meta_remaining.mjs |

---


### 7. Link ngược từ informational → landing (reverse links)

- Script: `tools/add_reverse_links_informational.mjs`
- 5/7 bài đã có link sẵn, thêm CTA vào 2 bài còn thiếu:
  - `thong-tac-bon-cau-bi-tac` (1367) → `/thong-tac-bon-cau-quang-ninh/`
  - `gia-thong-tac-bon-cau-quang-ninh` (2357) → `/thong-tac-bon-cau-quang-ninh/`
- Kết quả: **2/2 ✓**

### 8. Audit chất lượng nội dung bài huyện HBP (2047–2052)

- Script: `tools/audit_hbp_huyen_content.mjs`
- Kiểm: độ dài, ảnh ≥ 3, FAQ, local entity, hotline, H2, từ cấm, author byline
- Kết quả: **6/6 đạt 8/8** — không bài nào cần sửa

| Bài | Từ | Ảnh | FAQ | Local entity |
|---|---|---|---|---|
| Ba Chẽ | 2396 | 3 | ✓ | ✓ |
| Bình Liêu | 2648 | 3 | ✓ | ✓ |
| Cô Tô | 2896 | 3 | ✓ | ✓ |
| Đầm Hà | 2700 | 3 | ✓ | ✓ |
| Hải Hà | 2765 | 3 | ✓ | ✓ |
| Tiên Yên | 2898 | 3 | ✓ | ✓ |

### 9. Rank Math meta — BC/HBP extra + Final batch

- Scripts: `tools/set_rankmath_meta_bc_extra.mjs`, `tools/set_rankmath_meta_final_batch.mjs`
- **9/9** BC/HBP extra (thong-tac-bon-cau-khan-cap, ban-dem, khong-duc-pha, nha-dan, nha-hang, khach-san, hut-be-phot-khan-cap, 24-7, gia-hut-be-phot)
- **20/20** final batch (xu-ly-mui-hoi, TTC chung cư/nhà hàng/ngõ nhỏ, HBP Bãi Cháy, nao-vet-ho-ga, bang-gia, service pages, informational posts)
- **Tổng coverage: 71/75 published+public** (4 bỏ qua đúng chủ ý: trang-chu, blog, partner, author)

---

## Trạng thái site cuối phiên

| Chỉ số | Giá trị |
|---|---|
| Tổng URL inventory | 149 entries (refresh 2026-06-08) |
| Published posts có author byline | 32/33 |
| Trang có Rank Math focus KW + desc | **71/75** published+public |
| Landing chính có internal link đầy đủ | 5/5 |
| Informational → landing reverse links | 7/7 ✓ |
| HBP huyện content audit | 6/6 đạt ✓ |
| Trang noindex (cannibalization) | 1 (post 2554) |
| BreadcrumbList live | 8/8 URL verify ✓ |
| max-image-preview:large | site-wide ✓ |

## Còn thiếu / Việc tiếp theo

- **P2**: Giảm `globalReuseGroups` — ảnh dùng lại giữa nhiều URL; audit ảnh đạt `pagesWithIssues=0` nhưng reuse vẫn cao.
- **Monitor**: GSC Coverage post 2554 → Excluded (7 ngày từ 2026-06-08).
- **Monitor**: SERP snippet cập nhật meta description mới (7–14 ngày).

## Files mới tạo trong phiên

```
tools/refresh_url_audit.mjs
tools/noindex_hbp_competing.mjs
tools/touch_post_2554.mjs
tools/set_canonical_and_noindex_2554.mjs
tools/fix_duplicate_titles_hbp.mjs
tools/batch_author_ip_bypass.mjs
tools/audit_internal_links.mjs
tools/add_internal_links_to_landings.mjs
tools/fix_bon_cau_internal_links.mjs
tools/fix_hhc_nvhg_internal_links.mjs
tools/verify_internal_links_live.mjs
tools/audit_rankmath_scores.mjs
tools/set_rankmath_meta_landings.mjs
tools/set_rankmath_meta_area_pages.mjs
tools/set_rankmath_meta_remaining.mjs
tools/add_reverse_links_informational.mjs
tools/audit_hbp_huyen_content.mjs
tools/set_rankmath_meta_bc_extra.mjs
tools/set_rankmath_meta_final_batch.mjs
tools/find_missing_rankmath_meta.mjs
reports/audit-hbp-huyen-2026-06-07.md
```
