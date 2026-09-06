// Crawl toàn bộ sitemap sống + đo mức phủ biến thể "tại <thành phố>" so với bản
// không có "tại", ở TẤT CẢ vị trí: title, meta description, H1, H2/H3, BODY TEXT,
// alt ảnh, anchor text internal link (cả outbound và inbound), schema JSON-LD
// (bao gồm areaServed/addressLocality).
//
// Vì sao cần script này: phiên bản Claude chạy trong sandbox cloud bị tường lửa
// OnePanel WAF của site chặn (mọi request tới thongtaccongquangninh.com từ IP sandbox
// đều trả về trang thử thách "Just a moment... OnePanel", kể cả /sitemap.xml và
// /wp-json/). Script này PHẢI chạy từ máy thật của bạn (Windows, mạng nhà/văn phòng
// hoặc VPS hosting) — nơi KHÔNG bị WAF thử thách — để lấy được HTML/JSON thật.
//
// Cách chạy:
//   node tools/tai-keyword-crawl-audit.mjs
// Output:
//   reports/tai-keyword-crawl-<timestamp>.json   (dữ liệu đầy đủ từng URL)
//   reports/tai-keyword-crawl-<timestamp>.md     (bảng tổng hợp theo Giai đoạn 1)
//
// Gửi lại 2 file này để phân tích tiếp Giai đoạn 2 (đặc biệt: anchor text nội bộ
// và schema areaServed — 2 phần audit cũ (seo-full-audit-2026-07-31.json) KHÔNG có).

import { writeFileSync, mkdirSync } from "node:fs";
import https from "node:https";

const HOST = "thongtaccongquangninh.com";
const ROOT = process.cwd();
const CONCURRENCY = 4;

const CITIES = ["Hạ Long", "Cẩm Phả", "Uông Bí", "Móng Cái", "Quảng Yên", "Đông Triều", "Vân Đồn", "Quảng Ninh"];

function norm(s) {
  if (!s) return "";
  return s.toLowerCase().replace(/đ/g, "d").normalize("NFD").replace(/[̀-ͯ]/g, "");
}
const CITY_ASCII = Object.fromEntries(CITIES.map((c) => [c, norm(c)]));

function get(urlPath) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: HOST, port: 443, path: urlPath, method: "GET",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; TaiKeywordAudit/1.0; +https://thongtaccongquangninh.com)" } },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, text: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

async function fetchSitemapUrls() {
  let res = await get("/sitemap.xml");
  if (res.status === 301 || res.status === 302) res = await get("/sitemap_index.xml");
  if (res.status !== 200) throw new Error(`sitemap.xml failed: ${res.status}. Co the van bi WAF chan tu may nay.`);
  if (/oneshield_waf_challenge|Just a moment/i.test(res.text)) {
    throw new Error("Bi WAF thu thach ngay ca tu may nay. Thu mo sitemap bang trinh duyet that va luu HTML thu cong.");
  }
  const subSitemaps = [...res.text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  let urls = [];
  if (subSitemaps.length && subSitemaps[0].includes("sitemap")) {
    for (const sm of subSitemaps) {
      const path = sm.replace(`https://${HOST}`, "");
      const sub = await get(path);
      urls.push(...[...sub.text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]));
    }
  } else {
    urls = subSitemaps;
  }
  return [...new Set(urls)].filter((u) => u.startsWith(`https://${HOST}`));
}

function extractAll(html, url) {
  const strip = (s) => (s || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const titleM = html.match(/<title>([\s\S]*?)<\/title>/i);
  const metaDescM = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => strip(m[1]));
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => strip(m[1]));
  const h3s = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map((m) => strip(m[1]));
  const imgs = [...html.matchAll(/<img\s+[^>]*>/gi)].map((tag) => {
    const src = (tag[0].match(/\ssrc=["']([^"']+)["']/i) || [])[1] || "";
    const alt = (tag[0].match(/\salt=["']([^"']*)["']/i) || [])[1] || "";
    return { src, alt };
  });
  const anchors = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({
    href: m[1], text: strip(m[2]),
  })).filter((a) => a.href.includes(HOST) || a.href.startsWith("/"));
  const schemas = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return { _parseError: true, raw: m[1].slice(0, 200) }; } });
  // body text = main content area if identifiable, else whole <body>
  const bodyM = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyText = strip(bodyM ? bodyM[1] : html);

  return {
    url,
    title: strip(titleM ? titleM[1] : ""),
    metaDesc: metaDescM ? metaDescM[1] : "",
    h1: h1s, h2: h2s, h3: h3s,
    images: imgs, anchors, schemas,
    bodyText,
    wordCount: bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0,
  };
}

function countTaiVariant(text, cityAscii) {
  const t = norm(text);
  const taiCount = (t.match(new RegExp(`\\btai\\s+${cityAscii}`, "g")) || []).length;
  const plainCount = (t.match(new RegExp(`\\b${cityAscii}`, "g")) || []).length;
  return { taiCount, plainCount };
}

async function main() {
  console.log("Dang lay sitemap...");
  const urls = await fetchSitemapUrls();
  console.log(`Tim thay ${urls.length} URL trong sitemap.`);

  const pages = [];
  let idx = 0;
  async function worker() {
    while (idx < urls.length) {
      const i = idx++;
      const url = urls[i];
      const path = url.replace(`https://${HOST}`, "");
      try {
        const res = await get(path);
        if (res.status !== 200) { console.warn(`[SKIP ${res.status}] ${url}`); continue; }
        if (/oneshield_waf_challenge|Just a moment/i.test(res.text)) {
          console.warn(`[WAF-BLOCKED] ${url} — bi chan ngay tu may nay, dung crawl, lay HTML thu cong.`);
          continue;
        }
        pages.push(extractAll(res.text, url));
        console.log(`[OK ${pages.length}/${urls.length}] ${url}`);
      } catch (e) {
        console.warn(`[ERR] ${url}: ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // build inbound anchor-text map: target URL -> [{from, text}]
  const inbound = {};
  for (const p of pages) {
    for (const a of p.anchors) {
      const target = a.href.startsWith("/") ? `https://${HOST}${a.href}` : a.href;
      const clean = target.split("#")[0].replace(/\/?$/, "/");
      if (!inbound[clean]) inbound[clean] = [];
      if (a.text) inbound[clean].push({ from: p.url, text: a.text });
    }
  }

  // n-gram summary per city across all fields, all pages combined
  const ngram = {};
  for (const city of CITIES) {
    const cityAscii = CITY_ASCII[city];
    let title = { tai: 0, plain: 0 }, heading = { tai: 0, plain: 0 }, body = { tai: 0, plain: 0 },
      alt = { tai: 0, plain: 0 }, anchor = { tai: 0, plain: 0 }, schema = { tai: 0, plain: 0 };
    for (const p of pages) {
      const t = countTaiVariant(p.title, cityAscii); title.tai += t.taiCount; title.plain += t.plainCount;
      const h = countTaiVariant([...p.h1, ...p.h2, ...p.h3].join(" | "), cityAscii); heading.tai += h.taiCount; heading.plain += h.plainCount;
      const b = countTaiVariant(p.bodyText, cityAscii); body.tai += b.taiCount; body.plain += b.plainCount;
      const al = countTaiVariant(p.images.map((i) => i.alt).join(" | "), cityAscii); alt.tai += al.taiCount; alt.plain += al.plainCount;
      const an = countTaiVariant(p.anchors.map((a) => a.text).join(" | "), cityAscii); anchor.tai += an.taiCount; anchor.plain += an.plainCount;
      const sc = countTaiVariant(JSON.stringify(p.schemas), cityAscii); schema.tai += sc.taiCount; schema.plain += sc.plainCount;
    }
    ngram[city] = { title, heading, body, alt, anchor, schema };
  }

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  mkdirSync(`${ROOT}/reports`, { recursive: true });
  writeFileSync(`${ROOT}/reports/tai-keyword-crawl-${stamp}.json`,
    JSON.stringify({ generatedAt: new Date().toISOString(), urlCount: urls.length, pageCount: pages.length, pages, inbound, ngram }, null, 2), "utf8");

  let md = `# Crawl thô biến thể "tại" — ${stamp}\n\n`;
  md += `- URL trong sitemap: ${urls.length}\n- Crawl thành công: ${pages.length}\n\n`;
  md += `| Thành phố | Title(tại/thường) | H1-H3(tại/thường) | Body(tại/thường) | Alt(tại/thường) | Anchor nội bộ(tại/thường) | Schema(tại/thường) |\n`;
  md += `|---|---:|---:|---:|---:|---:|---:|\n`;
  for (const city of CITIES) {
    const n = ngram[city];
    md += `| ${city} | ${n.title.tai}/${n.title.plain} | ${n.heading.tai}/${n.heading.plain} | ${n.body.tai}/${n.body.plain} | ${n.alt.tai}/${n.alt.plain} | ${n.anchor.tai}/${n.anchor.plain} | ${n.schema.tai}/${n.schema.plain} |\n`;
  }
  writeFileSync(`${ROOT}/reports/tai-keyword-crawl-${stamp}.md`, md, "utf8");
  console.log("Xong. Xem reports/tai-keyword-crawl-" + stamp + ".md va .json");
}

main().catch((e) => { console.error("[FATAL]", e.message); process.exit(1); });
