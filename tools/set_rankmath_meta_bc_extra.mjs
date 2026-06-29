/**
 * Set Rank Math focus KW + description cho nhóm BC/HBP extra
 * (các bài publish chưa được cover trong đợt set_rankmath_meta_remaining.mjs).
 *
 * Usage:
 *   node tools/set_rankmath_meta_bc_extra.mjs          ← dry-run
 *   node tools/set_rankmath_meta_bc_extra.mjs --write
 */
import https from "node:https";
import { existsSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = firstExisting([
  process.env.TTCQN_WP_ENV,
  path.join(PROJECT_ROOT, ".env"),
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
]);
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const CSV_PATH  = path.join(PROJECT_ROOT, "docs", "SEO_PROGRESS.csv");
const WRITE = process.argv.includes("--write");

const TARGETS = [
  // ── BC dịch vụ đặc thù ─────────────────────────────────────────────
  { id: 2377, slug: "thong-tac-bon-cau-khan-cap-quang-ninh",
    focusKw: "thông tắc bồn cầu khẩn cấp Quảng Ninh",
    description: "Thông tắc bồn cầu khẩn cấp Quảng Ninh tiếp nhận 05:00-22:00, xử lý không đục phá, báo giá rõ trước. Gọi 0963.953.533." },

  { id: 2379, slug: "thong-tac-bon-cau-ban-dem-quang-ninh",
    focusKw: "thông tắc bồn cầu ban đêm Quảng Ninh",
    description: "Thông tắc bồn cầu ngoài giờ sinh hoạt Quảng Ninh tiếp nhận 05:00-22:00, không đục phá, báo giá rõ. Gọi 0963.953.533." },

  { id: 2385, slug: "thong-tac-bon-cau-khong-duc-pha-quang-ninh",
    focusKw: "thông tắc bồn cầu không đục phá Quảng Ninh",
    description: "Thông tắc bồn cầu không đục phá Quảng Ninh — máy lò xo chuyên dụng, giữ nguyên nền gạch, thợ đến 15 phút. Gọi 0963.953.533 / 0931.156.756." },

  { id: 2407, slug: "thong-tac-bon-cau-nha-dan-quang-ninh-2026",
    focusKw: "thông tắc bồn cầu nhà dân Quảng Ninh",
    description: "Thông tắc bồn cầu nhà dân Quảng Ninh tiếp nhận 05:00-22:00, xử lý tắc cứng, trào ngược, không đục phá. Gọi 0963.953.533." },

  { id: 2412, slug: "thong-tac-bon-cau-nha-hang-quang-ninh-2026",
    focusKw: "thông tắc bồn cầu nhà hàng Quảng Ninh",
    description: "Thông tắc bồn cầu nhà hàng Quảng Ninh tiếp nhận 05:00-22:00, không đục phá, hạn chế gián đoạn giờ bán. Gọi 0963.953.533." },

  { id: 2417, slug: "thong-tac-bon-cau-khach-san-quang-ninh-2026",
    focusKw: "thông tắc bồn cầu khách sạn Quảng Ninh",
    description: "Thông tắc bồn cầu khách sạn Quảng Ninh tiếp nhận 05:00-22:00, xử lý phòng tắc không đục phá, hạn chế ảnh hưởng khách. Gọi 0963.953.533." },

  // ── HBP dịch vụ đặc thù ────────────────────────────────────────────
  { id: 2430, slug: "hut-be-phot-khan-cap-quang-ninh-2026",
    focusKw: "hút bể phốt khẩn cấp Quảng Ninh",
    description: "Hút bể phốt khẩn cấp Quảng Ninh tiếp nhận 05:00-22:00 khi bể đầy, trào mùi, nguy cơ tràn. Báo giá rõ. Gọi 0963.953.533." },

  { id: 2439, slug: "hut-be-phot-24-7-quang-ninh-2026",
    focusKw: "hút bể phốt Quảng Ninh",
    description: "Hút bể phốt Quảng Ninh tiếp nhận 05:00-22:00, xe bồn vào ngõ sâu, báo giá trước, không ẩn phí. Gọi 0963.953.533 / 0931.156.756." },

  { id: 2449, slug: "gia-hut-be-phot-quang-ninh-2026",
    focusKw: "giá hút bể phốt Quảng Ninh",
    description: "Giá hút bể phốt Quảng Ninh 2026 từ 300K–2 triệu tùy m3, ngõ sâu, địa bàn. Báo giá rõ trước khi làm. Gọi 0963.953.533 / 0931.156.756." },
];

function firstExisting(candidates) {
  for (const candidate of candidates.filter(Boolean)) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`Không tìm thấy .env. Đã thử: ${candidates.filter(Boolean).join(" | ")}`);
}

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function wpPost(path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(JSON.stringify(body), "utf8");
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method: "POST",
      headers: {
        Host: WP_HOST, Authorization: auth, "User-Agent": "rm-meta-bc/1.0",
        "Content-Type": "application/json", "Content-Length": bodyBuf.length,
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on("error", reject);
    req.setTimeout(25000, () => req.destroy(new Error("timeout")));
    req.write(bodyBuf);
    req.end();
  });
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log(`=== Set Rank Math Meta — BC/HBP Extra (${WRITE ? "WRITE" : "DRY-RUN"}) ===`);
  console.log(`Total: ${TARGETS.length} pages\n`);

  if (!WRITE) {
    let warn = 0;
    for (const t of TARGETS) {
      const len = [...t.description].length;
      const flag = len > 160 ? " ⚠ >160!" : "";
      console.log(`[${t.id}] ${t.slug.padEnd(48)} KW: ${t.focusKw.padEnd(40)} Desc: ${len}${flag}`);
      if (len > 160) warn++;
    }
    console.log(`\n${warn > 0 ? warn + " descriptions > 160 chars — fix before --write" : "All descriptions ≤ 160 chars ✓"}`);
    console.log("[DRY-RUN] Pass --write to apply.");
    return;
  }

  const results = [];
  for (const t of TARGETS) {
    process.stdout.write(`[${t.id}] ${t.slug} ... `);
    const r = await wpPost("/rankmath/v1/updateMeta", auth, {
      objectType: "post",
      objectID: t.id,
      meta: {
        rank_math_focus_keyword: t.focusKw,
        rank_math_description: t.description,
      },
    });
    const ok = r.status === 200 && r.data?.slug === true;
    console.log(ok ? "✓" : `✗ ${r.status}: ${JSON.stringify(r.data).slice(0, 60)}`);
    results.push({ slug: t.slug, ok });
    await new Promise(r => setTimeout(r, 200));
  }

  const done = results.filter(r => r.ok).length;
  appendFileSync(CSV_PATH,
    `\n${TODAY},${TIME},RANKMATH-META-BC-EXTRA-${TODAY},seo_meta,set focus KW + desc BC/HBP extra pages,https://thongtaccongquangninh.com,,${done===results.length?"done":"partial"},medium,,,,,Set rank_math_focus_keyword+description: ${done}/${results.length} BC/HBP extra pages,tools/set_rankmath_meta_bc_extra.mjs,,Check SERP snippets 7-14d,,,,,,`,
    "utf8"
  );
  console.log(`\n${done}/${results.length} updated. Logged to SEO_PROGRESS.csv`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
