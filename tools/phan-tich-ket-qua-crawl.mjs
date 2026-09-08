// Đọc file crawl mới nhất (reports/tai-keyword-crawl-*.json do tai-keyword-crawl-audit.mjs
// tạo ra) và tự xuất kết luận GIAI ĐOẠN 2 của bao-cao-tu-khoa-tai.md: phân loại A/B/C/D cho
// từng cụm "tại <thành phố>", kèm bằng chứng cụ thể (URL + vị trí cụm xuất hiện).
//
// Đây là phần phân tích mà trước đây thiếu dữ liệu nên chưa làm được:
//   - Anchor text internal link TRỎ ĐẾN từng trang (audit cũ không lưu)
//   - Schema JSON-LD areaServed / addressLocality (audit cũ chỉ lưu tên loại schema)
//   - Toàn văn body text (audit cũ chỉ lưu heading)
//
// Cách chạy (trong D:\.thongtaccongquangninh, sau khi đã chạy tai-keyword-crawl-audit.mjs):
//   node tools/phan-tich-ket-qua-crawl.mjs
//
// Kết quả in ra màn hình + ghi file reports/phan-tich-tai-<thời gian>.md để đọc lại/gửi đi.

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = process.cwd();
const REPORTS = `${ROOT}/reports`;

const CITIES = ["Hạ Long", "Cẩm Phả", "Uông Bí", "Móng Cái", "Quảng Yên", "Đông Triều", "Vân Đồn", "Quảng Ninh"];
const SERVICES = [
  { label: "hút bể phốt", slugPart: "hut-be-phot" },
  { label: "thông tắc cống", slugPart: "thong-tac-cong" },
  { label: "thông tắc bồn cầu", slugPart: "thong-tac-bon-cau" },
  { label: "hút hầm cầu", slugPart: "hut-ham-cau" },
];

function norm(s) {
  if (!s) return "";
  return String(s).toLowerCase().replace(/đ/g, "d").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
const CITY_ASCII = Object.fromEntries(CITIES.map((c) => [c, norm(c)]));

function hasTaiCity(text, cityAscii) {
  return new RegExp(`\\btai\\s+${cityAscii}\\b`).test(norm(text));
}
function countTaiCity(text, cityAscii) {
  return (norm(text).match(new RegExp(`\\btai\\s+${cityAscii}\\b`, "g")) || []).length;
}
function hasCity(text, cityAscii) {
  return new RegExp(`\\b${cityAscii}\\b`).test(norm(text));
}

function findLatestCrawl() {
  let files;
  try {
    files = readdirSync(REPORTS).filter((f) => /^tai-keyword-crawl-.*\.json$/.test(f)).sort();
  } catch {
    throw new Error(`Khong doc duoc thu muc ${REPORTS}. Hay chay lenh nay trong D:\\.thongtaccongquangninh`);
  }
  if (!files.length) {
    throw new Error(
      "Khong tim thay file reports/tai-keyword-crawl-*.json.\n" +
      "  -> Chay truoc: node tools/tai-keyword-crawl-audit.mjs");
  }
  return `${REPORTS}/${files[files.length - 1]}`;
}

function main() {
  const path = findLatestCrawl();
  console.log(`Doc file crawl: ${path}\n`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  const pages = data.pages || [];
  const inbound = data.inbound || {};
  if (!pages.length) throw new Error("File crawl khong co trang nao (pages rong).");

  const lines = [];
  const say = (s = "") => { console.log(s); lines.push(s); };

  say(`# Phân tích Giai đoạn 2 từ dữ liệu crawl thật`);
  say();
  say(`- Nguồn: \`${path.replace(ROOT, ".")}\` (crawl lúc ${data.generatedAt || "?"})`);
  say(`- Số trang phân tích được: ${pages.length}/${data.urlCount || "?"} URL trong sitemap`);
  say();

  // ---- Bảng 1: mức phủ "tại X" theo từng trang dịch vụ ----
  say(`## 1. Trang dịch vụ: cụm "tại <thành phố>" xuất hiện ở đâu`);
  say();
  say(`| Trang | Cụm | Title | H1 | H2/H3 | Body | Alt ảnh | Anchor trỏ đến | Schema |`);
  say(`|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|`);

  const rows = [];
  for (const svc of SERVICES) {
    for (const city of CITIES) {
      const cityAscii = CITY_ASCII[city];
      // trang dịch vụ chủ lực: slug = <dich-vu>-<thanh-pho>
      const citySlug = cityAscii.replace(/\s+/g, "-");
      const wanted = `${svc.slugPart}-${citySlug}`;
      const page = pages.find((p) => p.url.includes(`/${wanted}/`));
      if (!page) continue;

      const headings = [...(page.h1 || []), ...(page.h2 || []), ...(page.h3 || [])].join(" | ");
      const alts = (page.images || []).map((i) => i.alt).join(" | ");
      const schemaTxt = JSON.stringify(page.schemas || []);
      const key = page.url.split("#")[0].replace(/\/?$/, "/");
      const inboundAnchors = (inbound[key] || []).map((a) => a.text).join(" | ");

      const r = {
        service: svc.label, city, url: page.url,
        title: hasTaiCity(page.title, cityAscii),
        h1: hasTaiCity((page.h1 || []).join(" | "), cityAscii),
        heading: hasTaiCity(headings, cityAscii),
        body: countTaiCity(page.bodyText || "", cityAscii),
        alt: hasTaiCity(alts, cityAscii),
        anchor: hasTaiCity(inboundAnchors, cityAscii),
        schema: hasTaiCity(schemaTxt, cityAscii) || hasCity(schemaTxt, cityAscii),
        inboundCount: (inbound[key] || []).length,
      };
      rows.push(r);
      const ok = (b) => (b ? "✅" : "❌");
      say(`| ${page.url.replace("https://thongtaccongquangninh.com", "")} | ${svc.label} tại ${city} | ${ok(r.title)} | ${ok(r.h1)} | ${ok(r.heading)} | ${r.body} lần | ${ok(r.alt)} | ${ok(r.anchor)} | ${ok(r.schema)} |`);
    }
  }
  say();

  // ---- Bảng 2: phân loại A/B/C/D ----
  say(`## 2. Phân loại nguyên nhân theo rubric A/B/C/D`);
  say();
  say(`| Cụm từ khóa | Phân loại | Căn cứ |`);
  say(`|---|---|---|`);
  const counts = { A: 0, B: 0, C: 0, PASS: 0 };
  for (const r of rows) {
    // cannibalization: có trang khác cũng để cụm "tại X" trong title
    const rivals = pages.filter((p) => p.url !== r.url && hasTaiCity(p.title, CITY_ASCII[r.city]));
    let cls, why;
    if (rivals.length >= 1 && r.title) {
      cls = "C — ăn thịt nhau";
      why = `${rivals.length} trang khác cũng có "tại ${r.city}" trong Title: ${rivals.slice(0, 2).map((p) => p.url.replace("https://thongtaccongquangninh.com", "")).join(", ")}`;
    } else if (!r.title && !r.h1 && !r.heading && r.body === 0) {
      cls = "A — chưa nhắm";
      why = `Không thấy cụm "tại ${r.city}" ở bất kỳ đâu trên trang`;
    } else if (!r.title && !r.h1) {
      cls = "B — nhắm yếu";
      why = `Có trong ${[r.heading && "H2/H3", r.body > 0 && `body (${r.body} lần)`, r.alt && "alt ảnh"].filter(Boolean).join(", ") || "một số vị trí phụ"} nhưng THIẾU ở Title và H1`;
    } else {
      cls = "PASS";
      why = `Đã có ở Title${r.h1 ? " và H1" : ""}${r.heading ? ", H2/H3" : ""}${r.body > 0 ? `, body ${r.body} lần` : ""}`;
    }
    counts[cls.startsWith("A") ? "A" : cls.startsWith("B") ? "B" : cls.startsWith("C") ? "C" : "PASS"]++;
    say(`| ${r.service} tại ${r.city} | ${cls} | ${why} |`);
  }
  say();
  say(`**Tổng kết:** PASS ${counts.PASS} · B (nhắm yếu) ${counts.B} · A (chưa nhắm) ${counts.A} · C (ăn thịt nhau) ${counts.C}`);
  say();

  // ---- Phần 3: anchor text nội bộ thiếu "tại" ----
  say(`## 3. Anchor text internal link — trang nào đang được trỏ tới bằng anchor KHÔNG có "tại"`);
  say();
  say(`| Trang đích | Số link trỏ đến | Anchor có "tại" | Ví dụ anchor hiện tại |`);
  say(`|---|---:|---:|---|`);
  for (const r of rows.filter((x) => !x.anchor && x.inboundCount > 0).slice(0, 25)) {
    const key = r.url.split("#")[0].replace(/\/?$/, "/");
    const list = inbound[key] || [];
    const withTai = list.filter((a) => hasTaiCity(a.text, CITY_ASCII[r.city])).length;
    const samples = [...new Set(list.map((a) => a.text).filter(Boolean))].slice(0, 3).join(" / ");
    say(`| ${r.url.replace("https://thongtaccongquangninh.com", "")} | ${list.length} | ${withTai} | ${samples || "(anchor rỗng/ảnh)"} |`);
  }
  say();

  // ---- Phần 4: schema areaServed ----
  say(`## 4. Schema JSON-LD — trang nào thiếu areaServed / addressLocality`);
  say();
  const missingArea = [];
  for (const r of rows) {
    const page = pages.find((p) => p.url === r.url);
    const txt = JSON.stringify(page.schemas || []);
    const hasArea = /areaServed/i.test(txt);
    const hasLocality = /addressLocality/i.test(txt);
    if (!hasArea || !hasLocality) {
      missingArea.push(`| ${r.url.replace("https://thongtaccongquangninh.com", "")} | ${hasArea ? "có" : "**THIẾU**"} | ${hasLocality ? "có" : "**THIẾU**"} |`);
    }
  }
  if (missingArea.length) {
    say(`| Trang | areaServed | addressLocality |`);
    say(`|---|:---:|:---:|`);
    missingArea.slice(0, 30).forEach((l) => say(l));
    if (missingArea.length > 30) say(`\n_(còn ${missingArea.length - 30} trang nữa, xem file JSON gốc)_`);
  } else {
    say(`_Tất cả trang dịch vụ đều đã có areaServed và addressLocality._`);
  }
  say();

  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  mkdirSync(REPORTS, { recursive: true });
  const out = `${REPORTS}/phan-tich-tai-${stamp}.md`;
  writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`\n=== Da ghi ket qua ra: ${out.replace(ROOT, ".")} ===`);
  console.log("Mo file do bang Notepad de doc, hoac gui lai file do de phan tich them.");
}

try { main(); } catch (e) { console.error("[LOI]", e.message); process.exit(1); }
