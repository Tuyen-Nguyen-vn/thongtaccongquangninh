/**
 * Set Rank Math focus KW + description cho nhóm còn lại:
 * - BC khu vực (Uông Bí, Móng Cái, Đông Triều, Vân Đồn, Quảng Yên)
 * - TTC khu vực (Cẩm Phả, Uông Bí, Móng Cái, Đông Triều, Vân Đồn, Quảng Yên)
 * - HBP huyện (Ba Chẽ, Bình Liêu, Cô Tô, Đầm Hà, Hải Hà, Tiên Yên)
 * - Bài informational (chi phí, chu kỳ, dấu hiệu, bồn cầu tắc, FAQ, giá BC)
 *
 * Usage:
 *   node tools/set_rankmath_meta_remaining.mjs          ← dry-run
 *   node tools/set_rankmath_meta_remaining.mjs --write
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
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = path.join(PROJECT_ROOT, "docs", "SEO_PROGRESS.csv");
const WRITE = process.argv.includes("--write");

const TARGETS = [
  // ── BC khu vực ─────────────────────────────────────────────────────
  { id:1486, slug:"thong-tac-bon-cau-uong-bi",
    focusKw:"thông tắc bồn cầu Uông Bí",
    description:"Thông tắc bồn cầu Uông Bí tiếp nhận 05:00-22:00, xử lý bồn cầu tắc, trào ngược, rút chậm, không đục phá. Gọi 0963.953.533." },
  { id:1483, slug:"thong-tac-bon-cau-mong-cai",
    focusKw:"thông tắc bồn cầu Móng Cái",
    description:"Thông tắc bồn cầu Móng Cái tiếp nhận 05:00-22:00, xử lý tắc nghẽn nhà phố, khách sạn khu cửa khẩu. Gọi 0963.953.533." },
  { id:1481, slug:"thong-tac-bon-cau-dong-trieu",
    focusKw:"thông tắc bồn cầu Đông Triều",
    description:"Thông tắc bồn cầu Đông Triều tiếp nhận 05:00-22:00, xử lý bồn cầu tắc nhà trong ngõ, nhà vườn khu công nghiệp. Gọi 0963.953.533." },
  { id:1487, slug:"thong-tac-bon-cau-van-don",
    focusKw:"thông tắc bồn cầu Vân Đồn",
    description:"Thông tắc bồn cầu Vân Đồn tiếp nhận 05:00-22:00, xử lý bồn cầu tắc resort, nhà nghỉ, nhà dân. Gọi 0963.953.533." },
  { id:1485, slug:"thong-tac-bon-cau-quang-yen",
    focusKw:"thông tắc bồn cầu Quảng Yên",
    description:"Thông tắc bồn cầu Quảng Yên tiếp nhận 05:00-22:00, xử lý bồn cầu tắc, không đục phá, bảo hành. Gọi 0963.953.533." },

  // ── TTC khu vực ────────────────────────────────────────────────────
  { id:400,  slug:"thong-tac-cong-cam-pha",
    focusKw:"thông tắc cống Cẩm Phả",
    description:"Thông tắc cống Cẩm Phả tiếp nhận 05:00-22:00, máy lò xo + cao áp, xử lý cống nghẹt nhà dân và khu mỏ. Gọi 0963.953.533." },
  { id:405,  slug:"thong-tac-cong-uong-bi",
    focusKw:"thông tắc cống Uông Bí",
    description:"Thông tắc cống Uông Bí tiếp nhận 05:00-22:00, xử lý cống tắc, nước trào ngược, mùi hôi nhà dân và khu công nghiệp. Gọi 0963.953.533." },
  { id:426,  slug:"thong-tac-cong-mong-cai",
    focusKw:"thông tắc cống Móng Cái",
    description:"Thông tắc cống Móng Cái tiếp nhận 05:00-22:00, xử lý cống nghẹt nhà phố, chợ biên giới. Báo giá rõ. Gọi 0963.953.533." },
  { id:425,  slug:"thong-tac-cong-dong-trieu",
    focusKw:"thông tắc cống Đông Triều",
    description:"Thông tắc cống Đông Triều tiếp nhận 05:00-22:00, xử lý cống tắc nhà vườn, khu công nghiệp Đông Triều. Gọi 0963.953.533." },
  { id:427,  slug:"thong-tac-cong-van-don",
    focusKw:"thông tắc cống Vân Đồn",
    description:"Thông tắc cống Vân Đồn tiếp nhận 05:00-22:00, xử lý cống nghẹt resort, nhà dân khu đảo. Gọi 0963.953.533 / 0931.156.756." },
  { id:424,  slug:"thong-tac-cong-quang-yen",
    focusKw:"thông tắc cống Quảng Yên",
    description:"Thông tắc cống Quảng Yên tiếp nhận 05:00-22:00, máy lò xo + cao áp, xử lý cống nghẹt nhà dân. Gọi 0963.953.533." },

  // ── HBP huyện xa ───────────────────────────────────────────────────
  { id:2047, slug:"hut-be-phot-ba-che",
    focusKw:"hút bể phốt Ba Chẽ",
    description:"Hút bể phốt Ba Chẽ Quảng Ninh tiếp nhận 05:00-22:00, xe bồn vào vùng núi, báo giá rõ. Gọi 0963.953.533." },
  { id:2048, slug:"hut-be-phot-binh-lieu",
    focusKw:"hút bể phốt Bình Liêu",
    description:"Hút bể phốt Bình Liêu Quảng Ninh tiếp nhận 05:00-22:00, xe bồn phục vụ khu dân cư biên giới. Gọi 0963.953.533 / 0931.156.756." },
  { id:2049, slug:"hut-be-phot-co-to",
    focusKw:"hút bể phốt Cô Tô",
    description:"Hút bể phốt Cô Tô Quảng Ninh tiếp nhận 05:00-22:00, điều phối xe theo chuyến ra đảo. Gọi 0963.953.533." },
  { id:2050, slug:"hut-be-phot-dam-ha",
    focusKw:"hút bể phốt Đầm Hà",
    description:"Hút bể phốt Đầm Hà Quảng Ninh tiếp nhận 05:00-22:00, xe bồn vào vùng ven biển, báo giá rõ. Gọi 0963.953.533." },
  { id:2051, slug:"hut-be-phot-hai-ha",
    focusKw:"hút bể phốt Hải Hà",
    description:"Hút bể phốt Hải Hà Quảng Ninh tiếp nhận 05:00-22:00, xe bồn đến tận huyện ven biển, báo giá rõ. Gọi 0963.953.533." },
  { id:2052, slug:"hut-be-phot-tien-yen",
    focusKw:"hút bể phốt Tiên Yên",
    description:"Hút bể phốt Tiên Yên Quảng Ninh tiếp nhận 05:00-22:00, xe bồn đến thị trấn và xã lân cận. Gọi 0963.953.533 / 0931.156.756." },

  // ── Bài informational ──────────────────────────────────────────────
  { id:2025, slug:"chi-phi-hut-be-phot-quang-ninh",
    focusKw:"chi phí hút bể phốt Quảng Ninh",
    description:"Chi phí hút bể phốt Quảng Ninh 2026 tính theo m³ và loại bể — bảng giá tham khảo rõ ràng, không ẩn phí. Gọi 0963.953.533 báo giá ngay." },
  { id:2044, slug:"chu-ky-hut-be-phot",
    focusKw:"chu kỳ hút bể phốt",
    description:"Chu kỳ hút bể phốt Quảng Ninh bao lâu một lần? Hướng dẫn lịch hút định kỳ theo số người dùng và loại bể. Gọi 0963.953.533 đặt lịch." },
  { id:2589, slug:"dau-hieu-be-phot-bi-day-2026",
    focusKw:"dấu hiệu bể phốt bị đầy",
    description:"Dấu hiệu bể phốt bị đầy: mùi hôi, nước trào, bồn cầu rút chậm. Xử lý sớm tránh tắc nghẽn. Gọi 0963.953.533." },
  { id:1367, slug:"thong-tac-bon-cau-bi-tac",
    focusKw:"thông tắc bồn cầu bị tắc",
    description:"Bồn cầu bị tắc Quảng Ninh: xử lý trào ngược, rút chậm, tắc cứng nhanh trong ngày. Không đục phá. Gọi 0963.953.533 / 0931.156.756." },
  { id:1377, slug:"cau-hoi-thuong-gap-thong-tac-cong",
    focusKw:"câu hỏi thường gặp thông tắc cống",
    description:"Giải đáp câu hỏi thường gặp về thông tắc cống Quảng Ninh: giá bao nhiêu, thợ đến bao lâu, có bảo hành không. Gọi 0963.953.533." },
  { id:2357, slug:"gia-thong-tac-bon-cau-quang-ninh",
    focusKw:"giá thông tắc bồn cầu Quảng Ninh",
    description:"Giá thông tắc bồn cầu Quảng Ninh 2026 — báo giá theo loại tắc, không ẩn phí, bảo hành 12 tháng. Gọi 0963.953.533 để được báo giá ngay." },
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
        Host: WP_HOST, Authorization: auth, "User-Agent": "rm-meta/1.0",
        "Content-Type": "application/json", "Content-Length": bodyBuf.length,
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

  console.log(`=== Set Rank Math Meta — Remaining (${WRITE ? "WRITE" : "DRY-RUN"}) ===`);
  console.log(`Total: ${TARGETS.length} pages\n`);

  // Validate desc lengths in dry-run
  if (!WRITE) {
    let warn = 0;
    for (const t of TARGETS) {
      const len = [...t.description].length;
      const flag = len > 160 ? " ⚠ >160!" : "";
      console.log(`[${t.id}] ${t.slug.padEnd(42)} KW: ${t.focusKw.padEnd(35)} Desc: ${len}${flag}`);
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
    `\n${TODAY},${TIME},RANKMATH-META-REMAINING-${TODAY},seo_meta,set focus KW + desc remaining pages,https://thongtaccongquangninh.com,,${done===results.length?"done":"partial"},medium,,,,,Set rank_math_focus_keyword+description: ${done}/${results.length} pages (BC area + TTC area + HBP huyện + informational),tools/set_rankmath_meta_remaining.mjs,,Check SERP snippets 7-14d,,,,,,`,
    "utf8"
  );
  console.log(`\n${done}/${results.length} updated. Logged to SEO_PROGRESS.csv`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
