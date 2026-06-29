/**
 * Thêm 3 ảnh vào mỗi HBP area post 1576–1621 (hiện có 0 ảnh).
 * - Lấy ảnh từ WP media library (search hut-be-phot / be-phot)
 * - Mỗi post dùng 3 ảnh khác nhau, xoay vòng pool
 * - Insert 3 wp:image block vào đầu content (sau H1/intro hoặc trước body đầu tiên)
 *
 * Usage:
 *   node tools/add_images_hbp_area_posts.mjs          ← dry-run
 *   node tools/add_images_hbp_area_posts.mjs --write  ← apply
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const CSV_PATH  = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const WRITE     = process.argv.includes("--write");

// 10 posts cần ảnh
const TARGETS = [
  { id: 1576, slug: "hut-be-phot-hong-gai",  name: "HBP Hồng Gai",  area: "Hồng Gai Hạ Long" },
  { id: 1581, slug: "hut-be-phot-cao-xanh",  name: "HBP Cao Xanh",  area: "Cao Xanh Hạ Long" },
  { id: 1586, slug: "hut-be-phot-bach-dang", name: "HBP Bạch Đằng", area: "Bạch Đằng Hạ Long" },
  { id: 1591, slug: "hut-be-phot-ha-khau",   name: "HBP Hà Khẩu",   area: "Hà Khẩu Hạ Long" },
  { id: 1596, slug: "hut-be-phot-gieng-day", name: "HBP Giếng Đáy", area: "Giếng Đáy Hạ Long" },
  { id: 1601, slug: "hut-be-phot-tuan-chau", name: "HBP Tuần Châu", area: "Tuần Châu Hạ Long" },
  { id: 1606, slug: "hut-be-phot-cam-trung", name: "HBP Cẩm Trung", area: "Cẩm Trung Cẩm Phả" },
  { id: 1611, slug: "hut-be-phot-cam-thuy",  name: "HBP Cẩm Thủy",  area: "Cẩm Thủy Cẩm Phả" },
  { id: 1616, slug: "hut-be-phot-mao-khe",   name: "HBP Mão Khê",   area: "Mão Khê Đông Triều" },
  { id: 1621, slug: "hut-be-phot-yen-thanh", name: "HBP Yên Thanh", area: "Yên Thanh Uông Bí" },
];

const SEARCH_TERMS = ["hut-be-phot", "be-phot", "thong-tac-cong"];
const IMAGES_PER_POST = 3;

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

function buildImageBlock(mediaId, url, alt, caption) {
  return [
    `<!-- wp:image {"id":${mediaId},"sizeSlug":"large","linkDestination":"none"} -->`,
    `<figure class="wp-block-image size-large"><img src="${url}" alt="${alt}" class="wp-image-${mediaId}"/><figcaption class="wp-element-caption">${caption}</figcaption></figure>`,
    `<!-- /wp:image -->`,
  ].join("\n");
}

/** Insert 3 image blocks sau block đầu tiên (intro paragraph) */
function insertImagesAfterFirstParagraph(content, imageBlocks) {
  // Tìm kết thúc của paragraph đầu tiên
  const firstParaEnd = content.indexOf("<!-- /wp:paragraph -->");
  const insertPos = firstParaEnd !== -1
    ? firstParaEnd + "<!-- /wp:paragraph -->".length
    : 0; // nếu không tìm thấy thì chèn đầu

  const insertStr = "\n" + imageBlocks.join("\n\n") + "\n";
  return content.slice(0, insertPos) + insertStr + content.slice(insertPos);
}

async function main() {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log(`=== Add Images to HBP Area Posts (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);

  // 1. Fetch media pool
  console.log("Tìm ảnh trong WP media library...");
  const mediaPool = [];
  const seenIds = new Set();
  for (const term of SEARCH_TERMS) {
    const r = await request("GET", `/wp/v2/media?search=${encodeURIComponent(term)}&per_page=50&media_type=image`, auth);
    if (r.status === 200 && Array.isArray(r.data)) {
      for (const m of r.data) {
        if (!seenIds.has(m.id)) {
          seenIds.add(m.id);
          const url = m.media_details?.sizes?.large?.source_url ?? m.source_url ?? "";
          mediaPool.push({
            id: m.id,
            url,
            title: m.title?.rendered ?? "",
            originalAlt: m.alt_text ?? "",
          });
        }
      }
    }
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`  Pool: ${mediaPool.length} ảnh\n`);

  if (mediaPool.length < IMAGES_PER_POST) {
    console.log(`  ✗ Không đủ ảnh trong media library (cần ít nhất ${IMAGES_PER_POST})`);
    return;
  }

  // Pool rotation: mỗi post dùng 3 ảnh kế tiếp, xoay vòng
  let poolOffset = 0;
  const fixed = [];

  for (const t of TARGETS) {
    console.log(`--- [${t.id}] ${t.name} ---`);

    // Pick 3 ảnh từ pool, xoay vòng
    const picks = [];
    for (let i = 0; i < IMAGES_PER_POST; i++) {
      picks.push(mediaPool[(poolOffset + i) % mediaPool.length]);
    }
    poolOffset = (poolOffset + IMAGES_PER_POST) % mediaPool.length;

    const alts = [
      `hút bể phốt tại ${t.area}`,
      `xe bồn hút bể phốt ${t.area}`,
      `dịch vụ hút bể phốt ${t.area} Quảng Ninh`,
    ];
    const captions = [
      `Dịch vụ hút bể phốt tại ${t.area} – xe bồn đến nhanh, không ẩn phí`,
      `Xe bơm hút bể phốt ${t.area} – phục vụ nhà dân, nhà hàng, khu đô thị`,
      `Hút bể phốt ${t.area} – gọi 0963.953.533 trong khung 05:00-22:00`,
    ];

    console.log(`  Ảnh chọn:`);
    for (let i = 0; i < IMAGES_PER_POST; i++) {
      console.log(`    [${picks[i].id}] ${picks[i].url.split("/").pop()} | alt: "${alts[i]}"`);
    }

    if (!WRITE) {
      console.log(`  [DRY-RUN] Sẽ insert 3 ảnh sau paragraph đầu tiên\n`);
      continue;
    }

    // Fetch content
    const r = await request("GET", `/wp/v2/posts/${t.id}?context=edit`, auth);
    if (r.status !== 200) { console.log(`  ERROR fetch ${r.status}\n`); continue; }

    let content = r.data?.content?.raw ?? "";

    // Verify 0 ảnh
    const imgCount = Math.max(
      (content.match(/<!-- wp:image/g)||[]).length,
      (content.match(/<img\s/gi)||[]).length
    );
    if (imgCount >= 3) { console.log(`  ✓ Đã có ${imgCount} ảnh — skip\n`); continue; }

    // Build blocks
    const imageBlocks = picks.map((p, i) =>
      buildImageBlock(p.id, p.url, alts[i], captions[i])
    );

    const newContent = insertImagesAfterFirstParagraph(content, imageBlocks);

    const w = await request("POST", `/wp/v2/posts/${t.id}`, auth, { content: newContent });
    const ok = w.status === 200;
    console.log(`  Update: ${ok ? `✓ 200 (+3 ảnh)` : `✗ ${w.status}`}\n`);
    if (ok) fixed.push(t.slug);
    await new Promise(r => setTimeout(r, 400));
  }

  if (WRITE && fixed.length > 0) {
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},ADD-IMAGES-HBP-AREA-${TODAY},seo_fix,thêm 3 ảnh vào 10 HBP area posts (0 ảnh),https://thongtaccongquangninh.com,,done,high,,,,,${fixed.length} posts fixed: ${fixed.join(",")},tools/add_images_hbp_area_posts.mjs,,Re-audit images + check alt text in WP,,,,,,`,
      "utf8"
    );
    console.log(`Đã fix: ${fixed.length}/${TARGETS.length} posts. Logged CSV.`);
  } else if (!WRITE) {
    console.log(`[DRY-RUN] ${TARGETS.length} posts cần thêm ảnh. Pass --write để apply.`);
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
