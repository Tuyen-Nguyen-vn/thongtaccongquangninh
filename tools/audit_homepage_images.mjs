/**
 * Fetch live homepage HTML, phân tích tất cả img tags,
 * liệt kê ảnh trống alt / alt thiếu dịch vụ/địa điểm.
 * Nếu --write: cập nhật alt trong WP media library qua REST API.
 *
 * Usage:
 *   node tools/audit_homepage_images.mjs          ← audit only
 *   node tools/audit_homepage_images.mjs --write  ← fix alt trong WP media
 */
import https from "node:https";
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs";

const ENV_PATH   = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP  = "103.57.220.210";
const WP_HOST    = "thongtaccongquangninh.com";
const BASE       = "https://thongtaccongquangninh.com";
const REPORT_DIR = "D:\\.thongtaccongquangninh\\reports";
const CSV_PATH   = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const WRITE      = process.argv.includes("--write");

// Từ khóa dịch vụ & địa phương để check alt
const SERVICE_KW  = ["hút bể phốt","thông tắc","hút hầm cầu","nạo vét","môi trường","xe bồn","bể phốt","cống","bồn cầu"];
const LOCATION_KW = ["quảng ninh","hạ long","cẩm phả","uông bí","móng cái","đông triều","quảng yên","vân đồn"];

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function fetchHtml(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "Mozilla/5.0 (audit-bot/1.0)" },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, res => {
      let d = ""; res.on("data", c => { if (d.length < 500000) d += c; });
      res.on("end", () => resolve({ status: res.statusCode, html: d }));
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function request(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: {
        Host: WP_HOST, Authorization: auth, "User-Agent": "fix-alt/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, data: d }); } });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

/** Extract all img tags → {src, alt, id} */
function extractImages(html) {
  const imgs = [];
  // Match both <img ... > patterns
  for (const m of html.matchAll(/<img\s([^>]*?)(?:\/?>)/gi)) {
    const attrs = m[1];
    const srcM  = attrs.match(/src=["']([^"']+)["']/i);
    const altM  = attrs.match(/alt=["']([^"']*)["']/i);
    const idM   = attrs.match(/class=["'][^"']*wp-image-(\d+)[^"']*["']/i)
                || attrs.match(/data-id=["'](\d+)["']/i);
    if (!srcM) continue;
    const src = srcM[1];
    // Chỉ lấy ảnh domain của mình
    if (!src.includes(WP_HOST) && !src.startsWith("/")) continue;
    imgs.push({
      src,
      alt: altM ? altM[1] : null,  // null = attr not present
      mediaId: idM ? Number(idM[1]) : null,
    });
  }
  return imgs;
}

function hasServiceOrLocation(alt) {
  if (!alt) return false;
  const a = alt.toLowerCase();
  return SERVICE_KW.some(k => a.includes(k)) || LOCATION_KW.some(k => a.includes(k));
}

/** Gợi ý alt text dựa vào tên file */
function suggestAlt(src) {
  const filename = src.split("/").pop().split("?")[0].replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ").replace(/\d{3,4}x\d{3,4}/g, "").trim();

  // Map các từ file name → ý nghĩa
  const maps = [
    [/xe.hut|xe.bon|isuzu|chuyen.dung/i,           "xe bồn hút bể phốt Quảng Ninh chuyên dụng"],
    [/doi.ngu|ky.thuat|tho/i,                       "đội thợ kỹ thuật hút bể phốt thông tắc cống Quảng Ninh"],
    [/hut.be.phot.ha.long|be.phot.ha.long/i,        "hút bể phốt Hạ Long Quảng Ninh"],
    [/hut.be.phot.cam.pha|be.phot.cam.pha/i,        "hút bể phốt Cẩm Phả Quảng Ninh"],
    [/hut.be.phot.uong.bi|be.phot.uong.bi/i,        "hút bể phốt Uông Bí Quảng Ninh"],
    [/hut.be.phot|be.phot|be.chua/i,                "dịch vụ hút bể phốt Quảng Ninh 24/7"],
    [/thong.tac.cong|cong.thoat|tac.cong/i,         "thông tắc cống Quảng Ninh không đục phá"],
    [/thong.tac.bon.cau|bon.cau/i,                  "thông tắc bồn cầu Quảng Ninh 24/7"],
    [/nao.vet.ho.ga|ho.ga/i,                        "nạo vét hố ga Quảng Ninh"],
    [/mui.hoi|xu.ly.mui/i,                          "xử lý mùi hôi cống thoát nước Quảng Ninh"],
    [/gia.dinh|nha.dan/i,                           "hút bể phốt hộ gia đình Quảng Ninh"],
    [/khu.cong.nghiep|cong.nghiep/i,                "hút bể phốt khu công nghiệp Quảng Ninh"],
    [/logo|icon|favicon/i,                          null],  // skip logo
    [/testimonial|review|danh.gia/i,                "khách hàng đánh giá dịch vụ hút bể phốt Quảng Ninh"],
    [/bang.gia|gia.dich.vu|chi.phi/i,               "bảng giá hút bể phốt thông tắc Quảng Ninh 2026"],
    [/moi.truong.do.thi|cong.ty/i,                  "Môi Trường Đô Thị Số 1 Quảng Ninh – hút bể phốt thông tắc cống"],
    [/quy.trinh|5.buoc|buoc/i,                      "quy trình 5 bước hút bể phốt Quảng Ninh"],
    [/du.an|cong.trinh|project/i,                   "dự án thông tắc cống hút bể phốt đã hoàn thành Quảng Ninh"],
    [/doi.tac|partner|khach.hang/i,                 "đối tác lâu năm dịch vụ môi trường đô thị Quảng Ninh"],
  ];

  for (const [regex, alt] of maps) {
    if (regex.test(filename)) return alt;
  }
  // fallback
  return `hút bể phốt thông tắc cống Quảng Ninh – ${filename.slice(0, 40)}`.trim();
}

async function main() {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log(`=== Audit Homepage Images (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);
  mkdirSync(REPORT_DIR, { recursive: true });

  // 1. Fetch live homepage
  console.log("Fetch live homepage...");
  const { status, html } = await fetchHtml("/");
  console.log(`  HTTP ${status} | HTML ${(html.length/1024).toFixed(0)} KB\n`);

  const allImgs = extractImages(html);
  console.log(`  Tổng ảnh trên domain: ${allImgs.length}`);

  // Phân loại
  const emptyAlt    = allImgs.filter(i => i.alt !== null && i.alt.trim() === "");
  const noAltAttr   = allImgs.filter(i => i.alt === null);
  const badAlt      = allImgs.filter(i => i.alt !== null && i.alt.trim() !== "" && !hasServiceOrLocation(i.alt));
  const goodAlt     = allImgs.filter(i => i.alt !== null && i.alt.trim() !== "" && hasServiceOrLocation(i.alt));

  console.log(`  ✓ Alt tốt: ${goodAlt.length}`);
  console.log(`  ⚠ No alt attr: ${noAltAttr.length}`);
  console.log(`  ✗ Alt trống: ${emptyAlt.length}`);
  console.log(`  ✗ Alt thiếu service/location: ${badAlt.length}\n`);

  // Chỉ fix những ảnh có mediaId (từ WP media library)
  const toFix = [
    ...emptyAlt.filter(i => i.mediaId),
    ...badAlt.filter(i => i.mediaId),
  ];

  // Với ảnh không có mediaId, thử tìm qua src URL trong WP media
  const noId = [
    ...emptyAlt.filter(i => !i.mediaId),
    ...badAlt.filter(i => !i.mediaId),
  ];

  console.log(`--- Ảnh cần fix (có media ID): ${toFix.length} ---`);
  for (const img of toFix) {
    const suggested = suggestAlt(img.src);
    console.log(`  [ID ${img.mediaId}] alt: "${img.alt}" → "${suggested}"`);
    console.log(`    src: ${img.src.split("/").pop()}`);
  }

  if (noId.length > 0) {
    console.log(`\n--- Ảnh cần fix (NO media ID — cần tìm qua src): ${noId.length} ---`);
    for (const img of noId) {
      const suggested = suggestAlt(img.src);
      const skip = suggested === null;
      if (skip) { console.log(`  [SKIP logo/icon] ${img.src.split("/").pop()}`); continue; }
      console.log(`  [?] alt: "${img.alt}" → "${suggested}"`);
      console.log(`    src: ${img.src.split("/").pop()}`);
    }
  }

  if (!WRITE) {
    console.log(`\n[DRY-RUN] Pass --write để cập nhật alt trong WP media library.`);
    return;
  }

  // === WRITE: cập nhật alt text trong WP media ===
  const fixed = [];

  // Fix ảnh có media ID
  for (const img of toFix) {
    const newAlt = suggestAlt(img.src);
    if (!newAlt) { console.log(`  [SKIP] media ${img.mediaId} (logo/icon)`); continue; }

    const w = await request("POST", `/wp/v2/media/${img.mediaId}`, auth, { alt_text: newAlt });
    const ok = w.status === 200;
    console.log(`  [${img.mediaId}] ${ok ? "✓" : "✗ " + w.status} → "${newAlt}"`);
    if (ok) fixed.push({ id: img.mediaId, alt: newAlt, src: img.src.split("/").pop() });
    await new Promise(r => setTimeout(r, 200));
  }

  // Fix ảnh không có media ID — lookup via src
  for (const img of noId) {
    const newAlt = suggestAlt(img.src);
    if (!newAlt) { console.log(`  [SKIP] src ${img.src.split("/").pop()} (logo/icon)`); continue; }

    // Tìm media ID qua src URL
    const filename = img.src.split("/").pop().split("?")[0];
    const search = await request("GET", `/wp/v2/media?search=${encodeURIComponent(filename.replace(/\.[^.]+$/, ""))}&per_page=5`, auth);
    if (search.status !== 200 || !Array.isArray(search.data) || search.data.length === 0) {
      console.log(`  [?] Không tìm thấy media cho: ${filename}`);
      continue;
    }
    const media = search.data.find(m => (m.source_url || "").includes(filename.replace(/\.[^.]+$/, ""))) || search.data[0];
    const w = await request("POST", `/wp/v2/media/${media.id}`, auth, { alt_text: newAlt });
    const ok = w.status === 200;
    console.log(`  [${media.id}] ${ok ? "✓" : "✗ " + w.status} → "${newAlt}"`);
    if (ok) fixed.push({ id: media.id, alt: newAlt, src: filename });
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nFixed: ${fixed.length} ảnh`);

  if (fixed.length > 0) {
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},FIX-HOME-IMG-ALT-${TODAY},seo_fix,fix image alt text trang chủ (empty+no-service),${BASE},,done,high,,,,,${fixed.length} media alt updated: ${fixed.map(f=>f.id).join(",")},tools/audit_homepage_images.mjs,,Re-audit homepage image SEO,,,,,,`,
      "utf8"
    );
    writeFileSync(`${REPORT_DIR}\\fix-home-img-alt-${TODAY}.json`, JSON.stringify(fixed, null, 2), "utf8");
    console.log(`Logged CSV + report.`);
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
