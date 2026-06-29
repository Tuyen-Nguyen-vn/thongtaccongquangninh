/**
 * Thêm ảnh thứ 3 vào TTC Giếng Đáy (992) và Tuần Châu (993).
 * - Fetch ảnh từ WP media library tìm theo keyword
 * - Chọn ảnh chưa dùng trên trang đó
 * - Insert wp:image block trước author byline (hoặc cuối)
 *
 * Usage:
 *   node tools/add_image_ttc_giengday_tuanchau.mjs          ← dry-run
 *   node tools/add_image_ttc_giengday_tuanchau.mjs --write  ← apply
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const CSV_PATH  = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const MARKER    = "ttcqn-author-nguyen-song-hao";
const WRITE     = process.argv.includes("--write");

const TARGETS = [
  { id: 992, slug: "thong-tac-cong-gieng-day", name: "TTC Giếng Đáy",
    alt: "thông tắc cống tại Giếng Đáy Hạ Long", caption: "Dịch vụ thông tắc cống Giếng Đáy – đội thợ có mặt trong ngày" },
  { id: 993, slug: "thong-tac-cong-tuan-chau", name: "TTC Tuần Châu",
    alt: "thông tắc cống tại Tuần Châu Hạ Long", caption: "Thông tắc cống Tuần Châu – phục vụ resort, nhà dân, khu đô thị" },
];

// Search keywords để tìm ảnh phù hợp
const SEARCH_TERMS = ["thong-tac-cong", "thong-tac", "cong-thoat", "thoat-nuoc"];

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function request(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: {
        Host: WP_HOST, Authorization: auth, "User-Agent": "add-image/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, data: d }); } });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function extractUsedMediaIds(content) {
  const ids = new Set();
  // wp:image {"id":12345}
  for (const m of content.matchAll(/<!-- wp:image \{[^}]*"id":(\d+)/g)) ids.add(Number(m[1]));
  // src URLs with -\d{3,4}x\d{3,4} pattern or just any img
  return ids;
}

function extractUsedMediaUrls(content) {
  const urls = new Set();
  for (const m of content.matchAll(/src=["']([^"']+)["']/gi)) urls.add(m[1]);
  return urls;
}

function buildImageBlock(mediaId, url, alt, caption) {
  // Simple figure block
  return [
    `<!-- wp:image {"id":${mediaId},"sizeSlug":"large","linkDestination":"none"} -->`,
    `<figure class="wp-block-image size-large"><img src="${url}" alt="${alt}" class="wp-image-${mediaId}"/><figcaption class="wp-element-caption">${caption}</figcaption></figure>`,
    `<!-- /wp:image -->`,
  ].join("\n");
}

async function fetchMediaBySearch(auth, term, page = 1) {
  const r = await request("GET", `/wp/v2/media?search=${encodeURIComponent(term)}&per_page=20&page=${page}&media_type=image`, auth);
  if (r.status !== 200) return [];
  return Array.isArray(r.data) ? r.data : [];
}

async function main() {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log(`=== Add 3rd Image to TTC Giếng Đáy/Tuần Châu (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);

  // 1. Collect media candidates từ library
  console.log("Tìm ảnh trong WP media library...");
  const mediaPool = [];
  const seenIds = new Set();
  for (const term of SEARCH_TERMS) {
    const items = await fetchMediaBySearch(auth, term);
    for (const m of items) {
      if (!seenIds.has(m.id)) {
        seenIds.add(m.id);
        const url = m.source_url ?? m.guid?.rendered ?? "";
        const size = m.media_details?.sizes?.large?.source_url ?? m.source_url ?? url;
        mediaPool.push({ id: m.id, url: size || url, title: m.title?.rendered ?? "", alt: m.alt_text ?? "" });
      }
    }
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`  Tìm được ${mediaPool.length} ảnh ứng viên\n`);

  const fixed = [];
  const assignedIds = new Set(); // track cross-page để tránh dùng cùng 1 ảnh

  for (const t of TARGETS) {
    console.log(`--- [${t.id}] ${t.name} ---`);
    const r = await request("GET", `/wp/v2/pages/${t.id}?context=edit`, auth);
    if (r.status !== 200) { console.log(`  ERROR ${r.status}\n`); continue; }

    const content = r.data?.content?.raw ?? "";
    const usedIds  = extractUsedMediaIds(content);
    const usedUrls = extractUsedMediaUrls(content);
    const imgCount = Math.max(
      (content.match(/<!-- wp:image/g)||[]).length,
      (content.match(/<img\s/gi)||[]).length
    );
    console.log(`  Ảnh hiện tại: ${imgCount} | Media IDs đang dùng: ${[...usedIds].join(", ") || "(không rõ ID)"}`);

    if (imgCount >= 3) { console.log("  ✓ Đã đủ 3 ảnh\n"); continue; }

    // Chọn ảnh chưa dùng (trên trang này VÀ chưa assign cho trang khác)
    const candidate = mediaPool.find(m => !usedIds.has(m.id) && !usedUrls.has(m.url) && !assignedIds.has(m.id));
    if (candidate) assignedIds.add(candidate.id);
    if (!candidate) {
      console.log("  ✗ Không tìm được ảnh phù hợp trong media library — cần upload thủ công\n");
      continue;
    }
    console.log(`  Ảnh chọn: [${candidate.id}] ${candidate.title} → ${candidate.url.split("/").pop()}`);

    const imageBlock = buildImageBlock(candidate.id, candidate.url, t.alt, t.caption);
    console.log(`  Block: ${imageBlock.split("\n")[1].slice(0, 100)}...`);

    if (!WRITE) {
      console.log(`  [DRY-RUN] Sẽ thêm vào trước author marker (hoặc cuối)\n`);
      continue;
    }

    // Insert trước author byline hoặc cuối
    let newContent = content;
    const idx = newContent.indexOf(`<!-- wp:paragraph {"className":"${MARKER}`);
    const ins  = "\n" + imageBlock + "\n";
    newContent = idx !== -1 ? newContent.slice(0, idx) + ins + newContent.slice(idx) : newContent + ins;

    const w = await request("POST", `/wp/v2/pages/${t.id}`, auth, { content: newContent });
    const ok = w.status === 200;
    console.log(`  Update: ${ok ? "✓ 200" : `✗ ${w.status}`}\n`);
    if (ok) fixed.push(t.slug);
    await new Promise(r => setTimeout(r, 400));
  }

  if (WRITE && fixed.length > 0) {
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},ADD-IMAGE-TTC-GD-TC-${TODAY},seo_fix,thêm ảnh thứ 3 vào TTC Giếng Đáy/Tuần Châu,https://thongtaccongquangninh.com,,done,low,,,,,Added 3rd image to: ${fixed.join(",")},tools/add_image_ttc_giengday_tuanchau.mjs,,Verify image alt text on WP,,,,,,`,
      "utf8"
    );
    console.log(`Đã fix: ${fixed.length} trang. Logged CSV.`);
  } else if (!WRITE) {
    console.log(`[DRY-RUN] Pass --write để thêm ảnh.`);
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
