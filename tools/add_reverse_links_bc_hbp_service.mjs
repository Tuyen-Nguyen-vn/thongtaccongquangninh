/**
 * Thêm link ngược từ 9 bài BC/HBP service posts → landing chính.
 *
 * Usage:
 *   node tools/add_reverse_links_bc_hbp_service.mjs          ← dry-run
 *   node tools/add_reverse_links_bc_hbp_service.mjs --write
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const BASE      = "https://thongtaccongquangninh.com";
const CSV_PATH  = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const MARKER    = "ttcqn-author-nguyen-song-hao";
const WRITE     = process.argv.includes("--write");

const TARGETS = [
  { id: 2377, slug: "thong-tac-bon-cau-khan-cap-quang-ninh", checkSlug: "thong-tac-bon-cau-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Cần thợ đến ngay lúc này? Xem đầy đủ dịch vụ tại trang <a href="${BASE}/thong-tac-bon-cau-quang-ninh/">thông tắc bồn cầu Quảng Ninh</a> hoặc gọi thẳng <strong>0963.953.533</strong> — tiếp nhận ca gấp 05:00-22:00.</p>\n<!-- /wp:paragraph -->` },

  { id: 2379, slug: "thong-tac-bon-cau-ban-dem-quang-ninh", checkSlug: "thong-tac-bon-cau-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Bồn cầu tắc ngoài giờ sinh hoạt tại Quảng Ninh? Gọi ngay dịch vụ <a href="${BASE}/thong-tac-bon-cau-quang-ninh/">thông tắc bồn cầu Quảng Ninh</a> — tiếp nhận 05:00-22:00, báo thời gian có mặt theo khu vực. Hotline: <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 2385, slug: "thong-tac-bon-cau-khong-duc-pha-quang-ninh", checkSlug: "thong-tac-bon-cau-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Muốn thông tắc không đục phá, giữ nguyên nền gạch? Xem cách làm tại trang <a href="${BASE}/thong-tac-bon-cau-quang-ninh/">thông tắc bồn cầu Quảng Ninh</a> hoặc gọi <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 2407, slug: "thong-tac-bon-cau-nha-dan-quang-ninh-2026", checkSlug: "thong-tac-bon-cau-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Bồn cầu nhà bạn đang tắc? Đội thợ <a href="${BASE}/thong-tac-bon-cau-quang-ninh/">thông tắc bồn cầu Quảng Ninh</a> tiếp nhận nhà dân 05:00-22:00 — báo thời gian đến và giá rõ trước khi làm. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 2412, slug: "thong-tac-bon-cau-nha-hang-quang-ninh-2026", checkSlug: "thong-tac-bon-cau-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Nhà hàng cần thợ xử lý ngay không gián đoạn giờ bán? Liên hệ <a href="${BASE}/thong-tac-bon-cau-quang-ninh/">thông tắc bồn cầu Quảng Ninh</a> — thợ đến nhanh, làm sạch, bảo hành sau xử lý. Hotline: <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 2417, slug: "thong-tac-bon-cau-khach-san-quang-ninh-2026", checkSlug: "thong-tac-bon-cau-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Khách sạn cần thợ xử lý nhanh không ảnh hưởng khách lưu trú? Xem dịch vụ <a href="${BASE}/thong-tac-bon-cau-quang-ninh/">thông tắc bồn cầu Quảng Ninh</a> hoặc gọi <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 2430, slug: "hut-be-phot-khan-cap-quang-ninh-2026", checkSlug: "hut-be-phot-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Bể phốt đầy khẩn cấp, nguy cơ tràn? Gọi ngay dịch vụ <a href="${BASE}/hut-be-phot-quang-ninh/">hút bể phốt Quảng Ninh</a> — tiếp nhận 05:00-22:00, điều phối xe theo khu vực. Hotline: <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 2439, slug: "hut-be-phot-24-7-quang-ninh-2026", checkSlug: "hut-be-phot-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Cần hút bể phốt trong ngày? Xem đầy đủ tại trang <a href="${BASE}/hut-be-phot-quang-ninh/">hút bể phốt Quảng Ninh</a> — tiếp nhận 05:00-22:00, báo giá rõ trước. Gọi <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 2449, slug: "gia-hut-be-phot-quang-ninh-2026", checkSlug: "hut-be-phot-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Muốn được báo giá thực tế cho bể nhà bạn? Liên hệ đội <a href="${BASE}/hut-be-phot-quang-ninh/">hút bể phốt Quảng Ninh</a> — báo giá rõ trước khi xe bơm, không ẩn phí. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },
];

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
        Host: WP_HOST, Authorization: auth, "User-Agent": "reverse-link/1.0",
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

function insertBeforeAuthor(content, block) {
  const idx = content.indexOf(`<!-- wp:paragraph {"className":"${MARKER}`);
  const ins  = "\n" + block + "\n";
  return idx !== -1 ? content.slice(0, idx) + ins + content.slice(idx) : content + ins;
}

async function main() {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log(`=== Reverse Links BC/HBP Service → Landings (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);

  const results = [];

  for (const t of TARGETS) {
    console.log(`[${t.id}] ${t.slug}`);
    const r = await request("GET", `/wp/v2/posts/${t.id}?context=edit`, auth);
    if (r.status !== 200) { console.log(`  ERROR ${r.status}\n`); continue; }

    const content = r.data?.content?.raw ?? "";

    if (content.includes(`/${t.checkSlug}/`)) {
      console.log(`  ✓ đã có /${t.checkSlug}/\n`); continue;
    }

    console.log(`  ✗ thiếu /${t.checkSlug}/ → thêm CTA`);

    if (!WRITE) {
      console.log(`  Preview: "${t.cta.replace(/<[^>]+>/g,"").trim().slice(0,90)}..."\n`);
      results.push({ slug: t.slug, dryRun: true });
      continue;
    }

    const newContent = insertBeforeAuthor(content, t.cta);
    const w = await request("POST", `/wp/v2/posts/${t.id}`, auth, { content: newContent });
    const ok = w.status === 200;
    console.log(`  Update: ${ok ? "✓ 200" : `✗ ${w.status}`}\n`);
    results.push({ slug: t.slug, ok });
    await new Promise(r => setTimeout(r, 300));
  }

  if (WRITE) {
    const done = results.filter(r => r.ok).length;
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},REVERSE-LINKS-BC-HBP-${TODAY},seo_fix,add reverse links BC/HBP service→landings,${BASE},,${done===results.length?"done":"partial"},medium,,,,,Added link from BC/HBP service posts back to main landing: ${results.map(r=>r.slug).join(",")},tools/add_reverse_links_bc_hbp_service.mjs,,Re-audit content quality,,,,,,`,
      "utf8"
    );
    console.log(`${done}/${results.length} posts updated. Logged to SEO_PROGRESS.csv`);
  } else {
    console.log(`[DRY-RUN] ${results.length} posts cần thêm link. Pass --write to apply.`);
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
