/**
 * Thêm link ngược từ bài informational → landing chính.
 * Mỗi bài thêm 1 đoạn CTA cuối bài (trước author byline) dẫn về service landing.
 *
 * Usage:
 *   node tools/add_reverse_links_informational.mjs          ← dry-run
 *   node tools/add_reverse_links_informational.mjs --write
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const BASE = "https://thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const MARKER = "ttcqn-author-nguyen-song-hao";
const WRITE = process.argv.includes("--write");

// Mỗi entry: bài informational → link ngược về landing chính
const TARGETS = [
  {
    id: 2025, restBase: "pages", slug: "chi-phi-hut-be-phot-quang-ninh",
    label: "Chi phí HBP",
    checkSlug: "hut-be-phot-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Để được báo giá chính xác theo thực tế bể nhà bạn, liên hệ đội <a href="${BASE}/hut-be-phot-quang-ninh/">hút bể phốt Quảng Ninh</a> của chúng tôi — có mặt sau 15 phút, báo giá trước khi làm. Gọi <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->`,
  },
  {
    id: 2044, restBase: "posts", slug: "chu-ky-hut-be-phot",
    label: "Chu kỳ HBP",
    checkSlug: "hut-be-phot-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Đến hạn hút bể phốt? Gọi ngay dịch vụ <a href="${BASE}/hut-be-phot-quang-ninh/">hút bể phốt Quảng Ninh</a> — xe bồn chuyên dụng, đặt lịch hôm nay có mặt trong ngày. Hotline: <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->`,
  },
  {
    id: 2589, restBase: "posts", slug: "dau-hieu-be-phot-bi-day-2026",
    label: "Dấu hiệu BPS đầy",
    checkSlug: "hut-be-phot-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Phát hiện dấu hiệu bể phốt đầy? Gọi ngay dịch vụ <a href="${BASE}/hut-be-phot-quang-ninh/">hút bể phốt Quảng Ninh</a> — tiếp nhận 05:00-22:00, xử lý trước khi tràn, tránh ô nhiễm. Hotline: <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->`,
  },
  {
    id: 1367, restBase: "posts", slug: "thong-tac-bon-cau-bi-tac",
    label: "Bồn cầu bị tắc",
    checkSlug: "thong-tac-bon-cau-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Bồn cầu nhà bạn đang tắc hoặc trào ngược? Liên hệ <a href="${BASE}/thong-tac-bon-cau-quang-ninh/">thông tắc bồn cầu Quảng Ninh</a> — tiếp nhận 05:00-22:00, không đục phá, bảo hành theo hạng mục. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->`,
  },
  {
    id: 1377, restBase: "posts", slug: "cau-hoi-thuong-gap-thong-tac-cong",
    label: "FAQ thông tắc cống",
    checkSlug: "thong-tac-cong-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Còn thắc mắc? Gọi trực tiếp đội <a href="${BASE}/thong-tac-cong-quang-ninh/">thông tắc cống Quảng Ninh</a> để được tư vấn miễn phí và báo giá ngay. Hotline: <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->`,
  },
  {
    id: 2357, restBase: "posts", slug: "gia-thong-tac-bon-cau-quang-ninh",
    label: "Giá thông tắc bồn cầu",
    checkSlug: "thong-tac-bon-cau-quang-ninh",
    cta: `<!-- wp:paragraph -->\n<p>Cần thông tắc bồn cầu ngay? Xem đầy đủ dịch vụ tại trang <a href="${BASE}/thong-tac-bon-cau-quang-ninh/">thông tắc bồn cầu Quảng Ninh</a> hoặc gọi <strong>0963.953.533</strong> để đặt thợ trong ngày.</p>\n<!-- /wp:paragraph -->`,
  },
  {
    id: 2025, restBase: "pages", slug: "chi-phi-hut-be-phot-quang-ninh",
    // Also link to bang-gia
    label: "Chi phí HBP → Bảng giá",
    checkSlug: "bang-gia",
    cta: `<!-- wp:paragraph -->\n<p>Xem bảng giá chi tiết theo từng dịch vụ tại trang <a href="${BASE}/bang-gia/">bảng giá hút bể phốt, thông tắc cống Quảng Ninh</a> — cập nhật 2026, không ẩn phí.</p>\n<!-- /wp:paragraph -->`,
  },
].filter((t, i, arr) => {
  // Dedup: keep unique (id, checkSlug) pairs
  return arr.findIndex(x => x.id === t.id && x.checkSlug === t.checkSlug) === i;
});

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
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function insertBeforeAuthor(content, block) {
  const idx = content.indexOf(`<!-- wp:paragraph {"className":"${MARKER}`);
  const ins = "\n" + block + "\n";
  return idx !== -1 ? content.slice(0, idx) + ins + content.slice(idx) : content + ins;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log(`=== Reverse Links: Informational → Landings (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);

  // Group by ID to fetch content once per post
  const byId = new Map();
  for (const t of TARGETS) {
    if (!byId.has(t.id)) byId.set(t.id, { ...t, extra: [] });
    else byId.get(t.id).extra.push(t);
  }

  const results = [];

  for (const [id, t] of byId) {
    console.log(`--- [${id}] ${t.slug} ---`);
    const r = await request("GET", `/wp/v2/${t.restBase}/${id}?context=edit`, auth);
    if (r.status !== 200) { console.log(`  ERROR ${r.status}\n`); continue; }

    let content = r.data?.content?.raw ?? "";
    let changed = false;
    const added = [];

    // Process all CTAs for this post (primary + extras)
    const allCtAs = [t, ...(t.extra ?? [])];
    for (const entry of allCtAs) {
      if (content.includes(`/${entry.checkSlug}/`)) {
        console.log(`  ✓ already has /${entry.checkSlug}/`);
      } else {
        console.log(`  ✗ missing /${entry.checkSlug}/ → adding CTA`);
        if (WRITE) {
          content = insertBeforeAuthor(content, entry.cta);
          changed = true;
          added.push(entry.checkSlug);
        } else {
          // Preview
          const preview = entry.cta.replace(/<[^>]+>/g, "").trim().slice(0, 100);
          console.log(`    Preview: "${preview}..."`);
          added.push(entry.checkSlug);
        }
      }
    }

    if (WRITE && changed) {
      const w = await request("POST", `/wp/v2/${t.restBase}/${id}`, auth, { content });
      const ok = w.status === 200;
      console.log(`  Update: ${ok ? `✓ 200 (+${added.length} links)` : `✗ ${w.status}`}`);
      results.push({ slug: t.slug, ok, added });
    } else if (!WRITE && added.length > 0) {
      results.push({ slug: t.slug, dryRun: true, added });
    }
    console.log();
    await new Promise(r => setTimeout(r, 300));
  }

  if (WRITE) {
    const done = results.filter(r => r.ok).length;
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},REVERSE-LINKS-INFO-${TODAY},seo_fix,add reverse links informational→landings,${BASE},,${done===results.length?"done":"partial"},medium,,,,,Added CTA+links from informational posts back to service landings: ${results.map(r=>r.slug).join(',')},tools/add_reverse_links_informational.mjs,,Verify links live; check GSC link graph,,,,,,`,
      "utf8"
    );
    console.log(`${done}/${results.filter(r=>!r.dryRun).length} posts updated. Logged to SEO_PROGRESS.csv`);
  } else {
    console.log(`[DRY-RUN] ${results.length} posts need updates. Pass --write to apply.`);
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
