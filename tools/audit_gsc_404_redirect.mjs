/**
 * audit_gsc_404_redirect.mjs
 * ──────────────────────────
 * Mục đích:
 *  1. Lấy tất cả URL từ sitemap XML của website.
 *  2. Kiểm tra thêm danh sách URL cũ nghi vấn (đã từng tồn tại, có thể đang 404 trong GSC).
 *  3. Với mỗi URL: kiểm tra HTTP status, theo dõi redirect chain đến URL cuối cùng.
 *  4. Tổng hợp báo cáo: URL nào 404, URL nào redirect chain dài/sai, URL nào OK.
 *  5. Gợi ý redirect 301 cụ thể cho từng URL lỗi.
 *
 * Chạy: node tools/audit_gsc_404_redirect.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const PROJECT = process.env.TTCQN_PROJECT_ROOT
  ? resolve(process.env.TTCQN_PROJECT_ROOT)
  : resolve(dirname(__filename), "..");
const REPORT_DIR = join(PROJECT, "reports");
const STAMP     = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const OUT_MD    = join(REPORT_DIR, `gsc-404-redirect-audit-${STAMP}.md`);
const OUT_JSON  = join(REPORT_DIR, `gsc-404-redirect-audit-${STAMP}.json`);
const HOST      = "thongtaccongquangninh.com";
const BASE      = `https://${HOST}`;

// ── Danh sách URL nghi vấn thêm (slug cũ có thể đang 404 trong GSC) ──────────
const SUSPECT_SLUGS = [
  "thong-tac-cong-nha-hang-quang-ninh",   // broken link tìm thấy trong audit
  "thong-tac-cong-nha-hang",
  "hut-be-phot",
  "hut-ham-cau",
  "thong-tac-cong",
  "nao-vet",
  "xu-ly-mui-hoi",
  "dich-vu",
  "category/dich-vu",
  "category/tin-tuc",
  "category/huong-dan",
  "tag/thong-tac",
  "tag/hut-be-phot",
  "wp-content",
  "feed",
  "author/admin",
  "page/2",
  "page/3",
  "?page_id=2",
  "thong-tac-bon-cau",
  "thong-tac-chau-rua",
  "gia",
  "bao-gia",
  "lien-he-2",
  "contact",
  "dich-vu-hut-be-phot",
  "dich-vu-thong-tac-cong",
  "ve-chung-toi",
  "about",
  "tin-tuc",
  "news",
  "blog-2",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

async function checkUrl(url, maxRedirects = 5) {
  const chain = [];
  let current = url;
  for (let i = 0; i <= maxRedirects; i++) {
    try {
      const res = await fetch(current, {
        method: "HEAD",
        redirect: "manual",
        headers: { "User-Agent": "Codex GSC Audit/1.0" },
        signal: AbortSignal.timeout(15000),
      });
      chain.push({ url: current, status: res.status });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) break;
        current = loc.startsWith("http") ? loc : new URL(loc, current).href;
      } else {
        break;
      }
    } catch (err) {
      chain.push({ url: current, status: 0, error: err.message });
      break;
    }
  }
  return chain;
}

async function fetchSitemapUrls() {
  const urls = new Set();
  // Thử các sitemap thường dùng
  const sitemapList = [
    `${BASE}/sitemap.xml`,
    `${BASE}/sitemap_index.xml`,
    `${BASE}/page-sitemap.xml`,
    `${BASE}/post-sitemap.xml`,
  ];
  for (const sm of sitemapList) {
    try {
      const res = await fetch(sm, {
        headers: { "User-Agent": "Codex GSC Audit/1.0" },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      // Tìm URL con trong sitemap index
      const subMaps = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map(m => m[1].trim())
        .filter(u => u.includes("sitemap") && u !== sm);
      for (const sub of subMaps) {
        try {
          const r2 = await fetch(sub, {
            headers: { "User-Agent": "Codex GSC Audit/1.0" },
            signal: AbortSignal.timeout(15000),
          });
          if (!r2.ok) continue;
          const t2 = await r2.text();
          for (const m of t2.matchAll(/<loc>([^<]+)<\/loc>/g)) {
            const u = m[1].trim();
            if (u.includes(HOST) && !u.includes("sitemap")) urls.add(u);
          }
        } catch {}
      }
      // Thêm URL trực tiếp từ sitemap gốc
      for (const m of text.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const u = m[1].trim();
        if (u.includes(HOST) && !u.includes("sitemap")) urls.add(u);
      }
    } catch {}
  }
  return [...urls];
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  mkdirSync(REPORT_DIR, { recursive: true });

  console.log("📡 Fetching sitemap URLs...");
  const sitemapUrls = await fetchSitemapUrls();
  console.log(`  → ${sitemapUrls.length} URLs in sitemap`);

  // Thêm suspect slugs
  const suspectUrls = SUSPECT_SLUGS.map(s => `${BASE}/${s.replace(/^\//, "")}/`);
  // Thêm www variants (hay bị redirect)
  const wwwUrls = [`https://www.${HOST}/`, `http://${HOST}/`, `http://www.${HOST}/`];

  const allUrls = [...new Set([...sitemapUrls, ...suspectUrls, ...wwwUrls])];
  console.log(`📋 Total URLs to check: ${allUrls.length}\n`);

  const results = { ok: [], redirect: [], notFound: [], error: [], redirectChainLong: [] };

  for (const url of allUrls) {
    const chain = await checkUrl(url);
    const first = chain[0];
    const last  = chain[chain.length - 1];
    const isRedirect = chain.length > 1;
    const chainLong  = chain.length > 2;

    let category;
    if (last.status === 200 && !isRedirect) {
      category = "ok";
    } else if (last.status === 200 && isRedirect && chainLong) {
      category = "redirectChainLong";
    } else if (last.status === 200 && isRedirect) {
      category = "redirect";
    } else if (last.status === 404) {
      category = "notFound";
    } else {
      category = "error";
    }

    const entry = { url, chain, finalStatus: last.status, finalUrl: last.url, hops: chain.length };
    results[category].push(entry);

    const icon = { ok: "✅", redirect: "↪️", redirectChainLong: "⛓️", notFound: "❌", error: "⚠️" }[category];
    const chainStr = chain.map(c => `${c.status}`).join("→");
    if (category !== "ok") {
      console.log(`${icon} [${chainStr}] ${url}`);
      if (isRedirect) console.log(`   → ${last.url}`);
    }
  }

  // ── Tạo báo cáo Markdown ──────────────────────────────────────────────────

  const suggestRedirect = (entry) => {
    const slug = entry.url.replace(`${BASE}/`, "").replace(/\/$/, "");
    // Gợi ý trang đích hợp lý dựa theo từ khóa
    if (slug.includes("nha-hang")) return `${BASE}/thong-tac-cong-nha-hang-ha-long/`;
    if (slug.includes("chung-cu")) return `${BASE}/thong-tac-cong-chung-cu-ha-long/`;
    if (slug.includes("thong-tac-cong")) return `${BASE}/thong-tac-cong-quang-ninh/`;
    if (slug.includes("thong-tac-bon-cau")) return `${BASE}/thong-tac-bon-cau-quang-ninh/`;
    if (slug.includes("hut-be-phot") || slug.includes("hut-ham-cau")) return `${BASE}/hut-be-phot-quang-ninh/`;
    if (slug.includes("nao-vet")) return `${BASE}/nao-vet-ho-ga-quang-ninh/`;
    if (slug.includes("xu-ly-mui")) return `${BASE}/xu-ly-mui-hoi-quang-ninh/`;
    if (slug.includes("category") || slug.includes("tag")) return `${BASE}/blog/`;
    if (slug.includes("tin-tuc") || slug.includes("news")) return `${BASE}/blog/`;
    if (slug.includes("contact") || slug.includes("lien-he")) return `${BASE}/lien-he/`;
    if (slug.includes("about") || slug.includes("ve-chung")) return `${BASE}/gioi-thieu/`;
    if (slug.includes("gia") || slug.includes("bao-gia")) return `${BASE}/bang-gia/`;
    return `${BASE}/`;
  };

  const md = `# Báo Cáo Audit GSC 404 & Redirect
**Thời gian:** ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
**Website:** ${BASE}

---

## Tóm tắt

| Trạng thái | Số lượng |
|---|---|
| ✅ OK (200, không redirect) | ${results.ok.length} |
| ↪️ Redirect 1 bước (301/302) | ${results.redirect.length} |
| ⛓️ Redirect chain dài (>2 bước) | ${results.redirectChainLong.length} |
| ❌ Không tìm thấy (404) | ${results.notFound.length} |
| ⚠️ Lỗi khác (403, 500, timeout) | ${results.error.length} |
| **Tổng kiểm tra** | **${allUrls.length}** |

---

## ❌ URL đang 404 — Cần redirect 301 ngay

${results.notFound.length === 0 ? "_Không phát hiện URL 404 nào trong phạm vi kiểm tra._" :
results.notFound.map(e => `### \`${e.url}\`
- **Status:** 404
- **Gợi ý redirect 301 → ** \`${suggestRedirect(e)}\`
- **Hành động:** Thêm redirect 301 trong \`.htaccess\` hoặc plugin Redirection
`).join("\n")}

---

## ⛓️ Redirect Chain dài — Cần rút ngắn

${results.redirectChainLong.length === 0 ? "_Không phát hiện redirect chain dài._" :
results.redirectChainLong.map(e => `### \`${e.url}\`
- **Chain:** ${e.chain.map(c => `${c.status} ${c.url}`).join("\n  → ")}
- **Hành động:** Rút redirect thẳng A→C, bỏ bước trung gian
`).join("\n")}

---

## ↪️ Redirect 1 bước (bình thường / cần xác nhận)

${results.redirect.length === 0 ? "_Không có._" :
results.redirect.map(e => {
  const from = e.chain[0];
  const to   = e.chain[e.chain.length - 1];
  return `- \`${from.url}\` → ${from.status} → \`${to.url}\``;
}).join("\n")}

---

## ⚠️ Lỗi khác

${results.error.length === 0 ? "_Không có._" :
results.error.map(e => `- \`${e.url}\` — status ${e.chain[e.chain.length-1]?.status} | ${e.chain[e.chain.length-1]?.error || ""}`).join("\n")}

---

## 📋 Lộ Trình Xử Lý

### Ưu tiên 1 — Làm ngay (impact cao)
1. **Redirect 301** tất cả URL 404 về trang đích đúng (xem bảng trên).
2. **Fix link nội bộ** \`/thong-tac-cong-nha-hang-quang-ninh/\` trong trang \`thong-tac-bon-cau-nha-hang-quang-ninh-2026\` → đổi thành \`/thong-tac-cong-nha-hang-ha-long/\`.
3. **Rút ngắn** redirect chain dài > 2 bước.

### Ưu tiên 2 — Sau khi fix redirect
4. Submit lại sitemap trong GSC.
5. Dùng "Xác thực kết quả khắc phục" trong GSC cho từng lý do.

### Ưu tiên 3 — Cải thiện tốc độ (xem PageSpeed report)
6. Giảm Unused JS 720KB — tắt script plugin thừa.
7. Tối ưu ảnh trang chủ — tiết kiệm 330KB.
8. Fix render-blocking CSS/JS — tiết kiệm 490ms LCP.

---
_File này tự sinh bởi \`tools/audit_gsc_404_redirect.mjs\`_
`;

  writeFileSync(OUT_MD, md, "utf8");
  writeFileSync(OUT_JSON, JSON.stringify({ generated: STAMP, summary: {
    ok: results.ok.length,
    redirect: results.redirect.length,
    redirectChainLong: results.redirectChainLong.length,
    notFound: results.notFound.length,
    error: results.error.length,
  }, results }, null, 2), "utf8");

  console.log(`\n📄 Báo cáo: ${OUT_MD}`);
  console.log(`📊 JSON:    ${OUT_JSON}`);
  console.log(`\n✅ Xong!`);
  console.log(`  ❌ 404: ${results.notFound.length} | ⛓️ chain dài: ${results.redirectChainLong.length} | ↪️ redirect: ${results.redirect.length}`);
}

main().catch(err => { console.error("❌", err.message); process.exit(1); });
