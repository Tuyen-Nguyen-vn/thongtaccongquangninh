/**
 * Set Rank Math focus KW + description cho các bài còn thiếu (final batch).
 * Nhóm HIGH: 10 bài service/informational quan trọng.
 * Nhóm NORMAL: service pages + informational có SEO value.
 *
 * Usage:
 *   node tools/set_rankmath_meta_final_batch.mjs          ← dry-run
 *   node tools/set_rankmath_meta_final_batch.mjs --write
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
  // ── HIGH PRIORITY: service landing đặc thù ─────────────────────────
  { id: 311, slug: "xu-ly-mui-hoi-quang-ninh",
    focusKw: "xử lý mùi hôi Quảng Ninh",
    description: "Xử lý mùi hôi Quảng Ninh tiếp nhận 05:00-22:00, tìm đúng nguồn hôi từ cống, bể phốt, hố ga. Gọi 0963.953.533." },

  { id: 380, slug: "thong-tac-cong-chung-cu-ha-long",
    focusKw: "thông tắc cống chung cư Hạ Long",
    description: "Thông tắc cống chung cư Hạ Long tiếp nhận 05:00-22:00, xử lý trục đứng, tầng hầm, không đục phá. Gọi 0963.953.533 / 0931.156.756." },

  { id: 383, slug: "thong-tac-cong-nha-hang-ha-long",
    focusKw: "thông tắc cống nhà hàng Hạ Long",
    description: "Thông tắc cống nhà hàng Hạ Long tiếp nhận 05:00-22:00, đánh tan mỡ cứng, hạn chế gián đoạn giờ bán. Gọi 0963.953.533." },

  { id: 384, slug: "thong-tac-cong-ngo-nho-ha-long",
    focusKw: "thông tắc cống ngõ nhỏ Hạ Long",
    description: "Thông tắc cống ngõ nhỏ Hạ Long — xe nhỏ vào ngõ hẻm, thợ đến tận nơi, không đục phá. Gọi 0963.953.533 / 0931.156.756." },

  { id: 436, slug: "hut-be-phot-bai-chay",
    focusKw: "hút bể phốt Bãi Cháy",
    description: "Hút bể phốt Bãi Cháy Hạ Long tiếp nhận 05:00-22:00, xe bồn vào ngõ rộng, khách sạn, nhà hàng. Gọi 0963.953.533." },

  { id: 1368, slug: "nao-vet-ho-ga",
    focusKw: "nạo vét hố ga Quảng Ninh",
    description: "Nạo vét hố ga Quảng Ninh tiếp nhận 05:00-22:00, xử lý bùn lắng, tắc nghẽn, mùi hôi sau mưa. Gọi 0963.953.533." },

  { id: 1369, slug: "xu-ly-mui-hoi-nha-ve-sinh",
    focusKw: "xử lý mùi hôi nhà vệ sinh Quảng Ninh",
    description: "Xử lý mùi hôi nhà vệ sinh Quảng Ninh tiếp nhận 05:00-22:00, tìm đúng nguồn hôi từ bể phốt, cống, ron cầu. Gọi 0963.953.533." },

  { id: 2053, slug: "thong-tac-cong-hong-gai",
    focusKw: "thông tắc cống Hồng Gai",
    description: "Thông tắc cống Hồng Gai Hạ Long tiếp nhận 05:00-22:00, xử lý ngõ hẹp phố cổ, không đục phá. Gọi 0963.953.533 / 0931.156.756." },

  { id: 2332, slug: "cam-nang-thong-tac-cong-tai-ha-long",
    focusKw: "thông tắc cống Hạ Long",
    description: "Cẩm nang thông tắc cống tại Hạ Long: xử lý theo từng khu, ngõ hẹp, chung cư, nhà hàng. Hotline 0963.953.533." },

  { id: 217, slug: "bang-gia-hut-be-phot-quang-ninh-2026",
    focusKw: "bảng giá hút bể phốt Quảng Ninh",
    description: "Bảng giá hút bể phốt Quảng Ninh 2026 theo m3 và địa bàn — tính rõ từng hạng mục, không ẩn phí. Gọi 0963.953.533 báo giá ngay." },

  // ── NORMAL: service pages + informational ──────────────────────────
  { id: 36, slug: "thong-tac-chau-rua-quang-ninh",
    focusKw: "thông tắc chậu rửa Quảng Ninh",
    description: "Thông tắc chậu rửa Quảng Ninh tiếp nhận 05:00-22:00, xử lý tắc bồn rửa nhà bếp, nhà tắm. Gọi 0963.953.533." },

  { id: 61, slug: "bang-gia",
    focusKw: "bảng giá hút bể phốt thông tắc cống Quảng Ninh",
    description: "Bảng giá hút bể phốt, thông tắc cống, bồn cầu Quảng Ninh 2026 — rõ từng dịch vụ, không ẩn phí. Gọi 0963.953.533." },

  { id: 62, slug: "gioi-thieu",
    focusKw: "dịch vụ thông tắc Quảng Ninh",
    description: "Dịch vụ hút bể phốt, thông tắc cống, bồn cầu, nạo vét hố ga tại Quảng Ninh. Tiếp nhận 05:00-22:00. Hotline 0963.953.533 / 0931.156.756." },

  { id: 63, slug: "lien-he",
    focusKw: "liên hệ thông tắc cống Quảng Ninh",
    description: "Liên hệ dịch vụ hút bể phốt, thông tắc cống bồn cầu Quảng Ninh. Hotline 0963.953.533 / 0931.156.756 — tiếp nhận 05:00-22:00." },

  { id: 215, slug: "dau-hieu-be-phot-can-hut",
    focusKw: "dấu hiệu bể phốt cần hút",
    description: "Dấu hiệu bể phốt cần hút sớm: mùi hôi, nước trào, bồn cầu rút chậm. Xử lý trước khi tắc hẳn. Gọi 0963.953.533 Quảng Ninh." },

  { id: 216, slug: "cach-xu-ly-cong-thoat-nuoc-tac",
    focusKw: "cách xử lý cống thoát nước tắc",
    description: "Cách xử lý cống thoát nước tắc tại nhà Quảng Ninh: dùng lò xo, cao áp hoặc gọi thợ. Hotline 0963.953.533 tư vấn miễn phí." },

  { id: 386, slug: "nguyen-nhan-cong-tac-thuong-xuyen-ha-long",
    focusKw: "nguyên nhân cống tắc thường xuyên",
    description: "Nguyên nhân cống tắc thường xuyên tại Hạ Long: mỡ bếp, rác thải, cặn bùn. Cách xử lý dứt điểm. Gọi thợ 0963.953.533." },

  { id: 2043, slug: "bon-cau-rut-cham-nguyen-nhan",
    focusKw: "bồn cầu rút chậm nguyên nhân",
    description: "Bồn cầu rút chậm do đâu? Cách nhận biết và xử lý nhanh tại Quảng Ninh. Gọi 0963.953.533 nếu cần thợ đến ngay." },

  { id: 2045, slug: "hoa-chat-tu-thong-cong",
    focusKw: "hóa chất tự thông cống",
    description: "Hóa chất tự thông cống có hiệu quả không? Khi nào cần gọi thợ thay vì tự xử lý. Tư vấn miễn phí 0963.953.533 tại Quảng Ninh." },

  { id: 2046, slug: "mui-hoi-cong-nguyen-nhan-xu-ly",
    focusKw: "mùi hôi cống nguyên nhân xử lý",
    description: "Mùi hôi cống nguyên nhân từ đâu và cách xử lý dứt điểm tại Quảng Ninh. Tìm đúng nguồn hôi. Gọi 0963.953.533." },
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
        Host: WP_HOST, Authorization: auth, "User-Agent": "rm-meta-final/1.0",
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

  console.log(`=== Set Rank Math Meta — Final Batch (${WRITE ? "WRITE" : "DRY-RUN"}) ===`);
  console.log(`Total: ${TARGETS.length} pages\n`);

  if (!WRITE) {
    let warn = 0;
    for (const t of TARGETS) {
      const len = [...t.description].length;
      const flag = len > 160 ? " ⚠ >160!" : "";
      console.log(`[${t.id}] ${t.slug.padEnd(48)} Desc: ${len}${flag}`);
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
    `\n${TODAY},${TIME},RANKMATH-META-FINAL-${TODAY},seo_meta,set focus KW + desc final batch,https://thongtaccongquangninh.com,,${done===results.length?"done":"partial"},medium,,,,,Set rank_math_focus_keyword+description: ${done}/${results.length} final batch pages,tools/set_rankmath_meta_final_batch.mjs,,Check SERP snippets 7-14d,,,,,,`,
    "utf8"
  );
  console.log(`\n${done}/${results.length} updated. Logged to SEO_PROGRESS.csv`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
