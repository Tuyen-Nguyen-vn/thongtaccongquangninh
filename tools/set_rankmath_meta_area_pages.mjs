/**
 * Set rank_math_focus_keyword + rank_math_description cho trang khu vực.
 * Usage:
 *   node tools/set_rankmath_meta_area_pages.mjs          ← dry-run
 *   node tools/set_rankmath_meta_area_pages.mjs --write
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
  // HBP thành phố lớn
  { id: 52,   type:"page", slug:"hut-be-phot-ha-long",
    focusKw:"hút bể phốt Hạ Long",
    description:"Hút bể phốt Hạ Long tiếp nhận 05:00-22:00, hút sạch bể 1-20 khối, không đục phá, báo giá rõ. Gọi 0963.953.533." },
  { id: 53,   type:"page", slug:"hut-be-phot-cam-pha",
    focusKw:"hút bể phốt Cẩm Phả",
    description:"Hút bể phốt Cẩm Phả tiếp nhận 05:00-22:00, xe bồn chuyên dụng, báo giá trước, không đục phá. Gọi 0963.953.533 / 0931.156.756." },
  { id: 54,   type:"page", slug:"hut-be-phot-uong-bi",
    focusKw:"hút bể phốt Uông Bí",
    description:"Hút bể phốt Uông Bí tiếp nhận 05:00-22:00, hút sạch bể phốt nhà dân và khu công nghiệp. Gọi 0963.953.533." },
  { id: 55,   type:"page", slug:"hut-be-phot-mong-cai",
    focusKw:"hút bể phốt Móng Cái",
    description:"Hút bể phốt Móng Cái tiếp nhận 05:00-22:00 cho khu cửa khẩu, nhà phố, khách sạn. Báo giá rõ. Gọi 0963.953.533 / 0931.156.756." },
  { id: 56,   type:"page", slug:"hut-be-phot-dong-trieu",
    focusKw:"hút bể phốt Đông Triều",
    description:"Hút bể phốt Đông Triều tiếp nhận 05:00-22:00, xe bồn vào khu công nghiệp, nhà vườn, khu dân cư. Gọi 0963.953.533." },
  { id: 57,   type:"page", slug:"hut-be-phot-quang-yen",
    focusKw:"hút bể phốt Quảng Yên",
    description:"Hút bể phốt Quảng Yên tiếp nhận 05:00-22:00, xe bồn đến tận nơi, hút sạch bể 1-20 khối. Gọi 0963.953.533 / 0931.156.756." },
  { id: 58,   type:"page", slug:"hut-be-phot-van-don",
    focusKw:"hút bể phốt Vân Đồn",
    description:"Hút bể phốt Vân Đồn tiếp nhận 05:00-22:00, xe bồn phục vụ resort, nhà dân, khu du lịch. Gọi 0963.953.533." },
  // TTC khu vực
  { id: 296,  type:"page", slug:"thong-tac-cong-ha-long",
    focusKw:"thông tắc cống Hạ Long",
    description:"Thông tắc cống Hạ Long tiếp nhận 05:00-22:00, máy lò xo + cao áp, xử lý cống nghẹt, nước trào ngược. Gọi 0963.953.533." },
  { id: 991,  type:"page", slug:"thong-tac-cong-cao-xanh",
    focusKw:"thông tắc cống Cao Xanh",
    description:"Thông tắc cống Cao Xanh Hạ Long tiếp nhận 05:00-22:00, xử lý cống tắc nhà dân, quán ăn. Gọi 0963.953.533." },
  { id: 992,  type:"page", slug:"thong-tac-cong-gieng-day",
    focusKw:"thông tắc cống Giếng Đáy",
    description:"Thông tắc cống Giếng Đáy Hạ Long tiếp nhận 05:00-22:00, xử lý cống nghẹt nhà dân, kho xưởng. Gọi 0963.953.533 / 0931.156.756." },
  { id: 993,  type:"page", slug:"thong-tac-cong-tuan-chau",
    focusKw:"thông tắc cống Tuần Châu",
    description:"Thông tắc cống Tuần Châu Hạ Long tiếp nhận 05:00-22:00, xử lý cống nghẹt biệt thự, homestay, nhà hàng. Gọi 0963.953.533." },
  { id: 2054, type:"post", slug:"thong-tac-cong-bai-chay",
    focusKw:"thông tắc cống Bãi Cháy",
    description:"Thông tắc cống Bãi Cháy tiếp nhận 05:00-22:00, xử lý cống nghẹt nhà hàng, khách sạn, nhà dân. Gọi 0963.953.533." },
  // BC khu vực
  { id: 1482, type:"page", slug:"thong-tac-bon-cau-ha-long",
    focusKw:"thông tắc bồn cầu Hạ Long",
    description:"Thông tắc bồn cầu Hạ Long tiếp nhận 05:00-22:00, không đục phá, bảo hành theo hạng mục. Gọi 0963.953.533 / 0931.156.756." },
  { id: 450,  type:"page", slug:"thong-tac-bon-cau-cam-pha",
    focusKw:"thông tắc bồn cầu Cẩm Phả",
    description:"Thông tắc bồn cầu Cẩm Phả tiếp nhận 05:00-22:00, xử lý bồn cầu tắc, trào ngược, rút chậm. Gọi 0963.953.533." },
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
        Host: WP_HOST, Authorization: auth, "User-Agent": "rm-meta-area/1.0",
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

  console.log(`=== Set Rank Math Meta — Area Pages (${WRITE ? "WRITE" : "DRY-RUN"}) ===`);
  console.log(`Total: ${TARGETS.length} pages\n`);

  const results = [];

  for (const t of TARGETS) {
    const descLen = [...t.description].length;
    if (!WRITE) {
      const warn = descLen > 160 ? " ⚠ >160" : "";
      console.log(`[${t.id}] ${t.slug}`);
      console.log(`  KW:   ${t.focusKw}`);
      console.log(`  Desc: ${t.description} (${descLen})${warn}\n`);
      continue;
    }

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
    await new Promise(r => setTimeout(r, 250));
  }

  if (WRITE) {
    const done = results.filter(r => r.ok).length;
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},RANKMATH-META-AREA-${TODAY},seo_meta,set focus KW + desc area pages,https://thongtaccongquangninh.com,,${done===results.length?"done":"partial"},medium,,,,,Set rank_math_focus_keyword + description: ${done}/${results.length} area pages,tools/set_rankmath_meta_area_pages.mjs,,Check SERP snippets 7-14 days,,,,,,`,
      "utf8"
    );
    console.log(`\n${done}/${results.length} updated. Logged to SEO_PROGRESS.csv`);
  } else {
    console.log("[DRY-RUN] Pass --write to apply.");
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
