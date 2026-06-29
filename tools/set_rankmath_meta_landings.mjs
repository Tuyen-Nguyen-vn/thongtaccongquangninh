/**
 * Set rank_math_focus_keyword + rank_math_description cho 5 landing chính
 * via Rank Math REST API (/rankmath/v1/updateMeta).
 *
 * Usage:
 *   node tools/set_rankmath_meta_landings.mjs          ← dry-run
 *   node tools/set_rankmath_meta_landings.mjs --write
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

// Focus KW + description chuẩn cho từng landing
// Description: ≤ 160 ký tự, chứa focus KW, CTA rõ ràng
const TARGETS = [
  {
    id: 26, type: "page", slug: "hut-be-phot-quang-ninh",
    label: "HBP Quảng Ninh",
    focusKw: "hút bể phốt Quảng Ninh",
    description: "Dịch vụ hút bể phốt Quảng Ninh tiếp nhận 05:00-22:00, xe bồn hút sạch, không đục phá, báo giá rõ. Gọi 0963.953.533.",
  },
  {
    id: 35, type: "page", slug: "thong-tac-cong-quang-ninh",
    label: "TTC Quảng Ninh",
    focusKw: "thông tắc cống Quảng Ninh",
    description: "Thông tắc cống Quảng Ninh tiếp nhận 05:00-22:00, máy lò xo + cao áp, xử lý trong ngày, không đục phá. Gọi 0963.953.533.",
  },
  {
    id: 37, type: "page", slug: "thong-tac-bon-cau-quang-ninh",
    label: "BC Quảng Ninh",
    focusKw: "thông tắc bồn cầu Quảng Ninh",
    description: "Thông tắc bồn cầu Quảng Ninh tiếp nhận 05:00-22:00, không đục phá, bảo hành theo hạng mục. Gọi 0963.953.533 / 0931.156.756.",
  },
  {
    id: 2559, type: "post", slug: "hut-ham-cau-quang-ninh-2026",
    label: "HHC QN 2026",
    focusKw: "hút hầm cầu Quảng Ninh",
    description: "Hút hầm cầu Quảng Ninh tiếp nhận 05:00-22:00, xe bồn hút sạch bể 1-20 khối, báo giá rõ trước. Gọi 0963.953.533.",
  },
  {
    id: 38, type: "page", slug: "nao-vet-ho-ga-quang-ninh",
    label: "NVHG Quảng Ninh",
    focusKw: "nạo vét hố ga Quảng Ninh",
    description: "Nạo vét hố ga Quảng Ninh tiếp nhận 05:00-22:00, hút bùn, thông cống rãnh, xử lý mùi hôi. Gọi 0963.953.533 / 0931.156.756.",
  },
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

function fetchMeta(path, auth) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "rm-meta/1.0" },
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
    req.setTimeout(15000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log(`=== Set Rank Math Meta — 5 Landings (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);

  const results = [];

  for (const t of TARGETS) {
    const descLen = [...t.description].length;
    const kwLen   = [...t.focusKw].length;
    console.log(`[${t.id}] ${t.label}`);
    console.log(`  Focus KW:    "${t.focusKw}" (${kwLen} chars)`);
    console.log(`  Description: "${t.description}" (${descLen} chars)`);
    if (descLen > 160) console.log(`  ⚠ Description > 160 chars!`);

    if (!WRITE) { console.log(); continue; }

    const r = await wpPost("/rankmath/v1/updateMeta", auth, {
      objectType: "post",
      objectID: t.id,
      meta: {
        rank_math_focus_keyword: t.focusKw,
        rank_math_description: t.description,
      },
    });

    const ok = r.status === 200 && r.data?.slug === true;
    console.log(`  → ${ok ? "✓ 200 OK" : `✗ ${r.status}: ${JSON.stringify(r.data).slice(0, 80)}`}`);
    results.push({ slug: t.slug, ok });
    await new Promise(r => setTimeout(r, 300));
    console.log();
  }

  if (WRITE) {
    const done = results.filter(r => r.ok).length;
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},RANKMATH-META-LANDINGS-${TODAY},seo_meta,set focus KW + description 5 landings,https://thongtaccongquangninh.com,,${done===results.length?"done":"partial"},medium,,,,,Set rank_math_focus_keyword + rank_math_description via RM API: ${done}/${results.length},tools/set_rankmath_meta_landings.mjs,,Verify meta description in GSC/SERP snippet,,,,,,`,
      "utf8"
    );
    console.log(`${done}/${results.length} updated. Logged to SEO_PROGRESS.csv`);
  } else {
    console.log("[DRY-RUN] Pass --write to apply.");
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
