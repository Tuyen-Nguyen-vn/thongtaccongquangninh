/**
 * Set Rank Math focus KW + description cho 8 post mới (2026-06-14)
 * IDs: 2687, 2694, 2702, 2708, 2769, 2777, 2782, 2787
 *
 * Usage:
 *   node tools/set_rankmath_meta_newposts_2026.mjs          ← dry-run
 *   node tools/set_rankmath_meta_newposts_2026.mjs --write
 */
import https from "node:https";
import { existsSync, readFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = firstExisting([
  path.join(PROJECT_ROOT, ".env"),
  process.env.TTCQN_WP_ENV,
  "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env",
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
]);
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = path.join(PROJECT_ROOT, "docs", "SEO_PROGRESS.csv");
const WRITE = process.argv.includes("--write");

const TARGETS = [
  {
    id: 2687, slug: "hut-be-phot-nha-hang-quang-ninh-2026",
    focusKw: "hút bể phốt nhà hàng Quảng Ninh",
    description: "Hút bể phốt nhà hàng Quảng Ninh — đặt lịch theo ca, hạn chế gián đoạn, xử lý gọn mùi. Gọi 0963.953.533 báo giá ngay.",
  },
  {
    id: 2694, slug: "hut-be-phot-cong-ty-quang-ninh-2026",
    focusKw: "hút bể phốt công ty Quảng Ninh",
    description: "Hút bể phốt công ty Quảng Ninh — xe bồn 5-8 khối, đặt lịch theo ca, báo giá minh bạch không phát sinh. Gọi 0963.953.533 ngay.",
  },
  {
    id: 2702, slug: "hut-be-phot-khach-san-quang-ninh-2026",
    focusKw: "hút bể phốt khách sạn Quảng Ninh",
    description: "Hút bể phốt khách sạn Quảng Ninh — không mùi, không gián đoạn khách lưu trú, có mặt trong 15 phút, bảo hành dài hạn. Gọi 0963.953.533.",
  },
  {
    id: 2708, slug: "hut-be-phot-khu-nha-tro-quang-ninh-2026",
    focusKw: "hút bể phốt khu nhà trọ Quảng Ninh",
    description: "Hút bể phốt khu nhà trọ Quảng Ninh — xe bồn vào ngõ sâu, tiếp nhận 05:00-22:00, báo giá rõ. Liên hệ 0963.953.533.",
  },
  {
    id: 2769, slug: "hut-be-phot-khu-cong-nghiep-quang-ninh-2026",
    focusKw: "hút bể phốt khu công nghiệp Quảng Ninh",
    description: "Hút bể phốt khu công nghiệp Quảng Ninh — xe 5 khối, đặt lịch theo ca, không ảnh hưởng sản xuất. Gọi 0963.953.533 báo giá.",
  },
  {
    id: 2777, slug: "thong-tac-cong-khan-cap-quang-ninh-2026",
    focusKw: "thông tắc cống khẩn cấp Quảng Ninh",
    description: "Thông tắc cống khẩn cấp Quảng Ninh — tiếp nhận 05:00-22:00, xử lý cống tắc, nước trào, không đục phá. Gọi 0963.953.533.",
  },
  {
    id: 2782, slug: "thong-tac-cong-24-7-quang-ninh",
    focusKw: "thông tắc cống Quảng Ninh",
    description: "Thông tắc cống Quảng Ninh tiếp nhận 05:00-22:00, xử lý cống nghẹt, nước trào, không đục phá. Liên hệ 0963.953.533.",
  },
  {
    id: 2787, slug: "gia-thong-tac-cong-quang-ninh-2026",
    focusKw: "giá thông tắc cống Quảng Ninh",
    description: "Giá thông tắc cống Quảng Ninh 2026 từ 200.000đ — bảng giá rõ ràng, không phát sinh, không báo giá ảo. Gọi 0963.953.533 để được báo giá ngay.",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function firstExisting(candidates) {
  for (const candidate of candidates.filter(Boolean)) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`Không tìm thấy .env. Đã thử: ${candidates.filter(Boolean).join(" | ")}`);
}

function loadEnv(path) {
  const raw = readFileSync(path, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function csvRow(slug, focusKw, status, note) {
  const d = new Date().toISOString().slice(0, 10);
  return `\n${d},rankmath_meta,${slug},"${focusKw}",${status},"${note}"`;
}

// ── Main ───────────────────────────────────────────────────────────────────

const env = loadEnv(ENV_PATH);
const WP_USER = env.WP_USERNAME || env.WP_USER || env.WORDPRESS_USER;
const WP_PASS = env.WP_APP_PASSWORD || env.WORDPRESS_APP_PASSWORD;

if (!WP_USER || !WP_PASS) {
  console.error("❌ Thiếu WP_USER / WP_APP_PASSWORD trong .env");
  process.exit(1);
}

const auth = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");

if (!WRITE) {
  console.log("=== DRY-RUN (thêm --write để ghi thật) ===\n");
  for (const t of TARGETS) {
    console.log(`[${t.id}] ${t.slug}`);
    console.log(`  focusKw    : ${t.focusKw}`);
    console.log(`  description: ${t.description}`);
    console.log(`  desc length: ${t.description.length} chars\n`);
  }
  process.exit(0);
}

console.log("=== WRITE MODE — Set Rank Math meta ===\n");
let ok = 0, fail = 0;

for (const t of TARGETS) {
  const bodyObj = {
    objectType: "post",
    objectID: t.id,
    meta: {
      rank_math_focus_keyword: t.focusKw,
      rank_math_description: t.description,
    },
  };
  const payload = JSON.stringify(bodyObj);

  const opts = {
    hostname: SERVER_IP,
    port: 443,
    path: `/wp-json/rankmath/v1/updateMeta`,
    method: "POST",
    headers: {
      Host: WP_HOST,
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
    rejectUnauthorized: false,
  };

  try {
    const res = await request(opts, payload);
    let parsed = {};
    try { parsed = JSON.parse(res.body); } catch {}
    const success = res.status === 200 && parsed?.slug === true;
    const icon = success ? "✅" : "❌";
    console.log(`${icon} [${t.id}] ${t.slug} → HTTP ${res.status}${success ? " OK" : " FAIL"}`);
    if (!success) console.log(`   Body: ${res.body.slice(0, 200)}`);

    appendFileSync(
      CSV_PATH,
      csvRow(t.slug, t.focusKw, success ? "done" : "fail",
             success ? `HTTP ${res.status}` : `HTTP ${res.status} ${res.body.slice(0, 80)}`)
    );
    if (success) ok++; else fail++;
  } catch (e) {
    console.log(`❌ [${t.id}] ${t.slug} → ERROR: ${e.message}`);
    appendFileSync(CSV_PATH, csvRow(t.slug, t.focusKw, "error", e.message.slice(0, 80)));
    fail++;
  }

  await new Promise(r => setTimeout(r, 800));
}

console.log(`\n=== Kết quả: ${ok} OK / ${fail} FAIL ===`);
