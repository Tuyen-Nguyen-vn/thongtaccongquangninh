/**
 * Audit + fix link ngược + author byline cho 15 TTC area pages/posts.
 *
 * Usage:
 *   node tools/audit_ttc_area_pages.mjs          ← dry-run
 *   node tools/audit_ttc_area_pages.mjs --write
 */
import https from "node:https";
import { existsSync, readFileSync, appendFileSync, writeFileSync, mkdirSync } from "node:fs";
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
const SERVER_IP  = "103.57.220.210";
const WP_HOST    = "thongtaccongquangninh.com";
const BASE       = "https://thongtaccongquangninh.com";
const CSV_PATH   = path.join(PROJECT_ROOT, "docs", "SEO_PROGRESS.csv");
const REPORT_DIR = path.join(PROJECT_ROOT, "reports");
const MARKER     = "ttcqn-author-nguyen-song-hao";
const AUTHOR_NAME = "Nguyễn Song Hào";
const AUTHOR_URL  = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const HOTLINES   = ["0963.953.533", "0931.156.756"];
const FORBIDDEN  = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];
const WRITE      = process.argv.includes("--write");
const LANDING    = "thong-tac-cong-quang-ninh";

function firstExisting(candidates) {
  for (const candidate of candidates.filter(Boolean)) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`Không tìm thấy .env. Đã thử: ${candidates.filter(Boolean).join(" | ")}`);
}

const TARGETS = [
  // ── Hạ Long ────────────────────────────────────────────────────────
  { id: 296,  rb: "pages", name: "TTC Hạ Long",
    cta: `<!-- wp:paragraph -->\n<p>Cần thông tắc cống tại Hạ Long? Xem đầy đủ dịch vụ <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> — thợ có mặt 15 phút, không đục phá. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 2039, rb: "posts", name: "TTC Cao Xanh",
    cta: `<!-- wp:paragraph -->\n<p>Cống tắc tại Cao Xanh? Liên hệ <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> — thợ đến tận ngõ nhỏ, không đục phá. Gọi <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 992,  rb: "pages", name: "TTC Giếng Đáy",
    cta: `<!-- wp:paragraph -->\n<p>Cống tắc tại Giếng Đáy? Xem dịch vụ <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> — xử lý kho xưởng, nhà dân, tiếp nhận 05:00-22:00. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 2041, rb: "posts", name: "TTC Tuần Châu",
    cta: `<!-- wp:paragraph -->\n<p>Biệt thự, homestay Tuần Châu cống tắc? Đội <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> xử lý nhanh, không đục phá. Gọi <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 2054, rb: "posts", name: "TTC Bãi Cháy",
    cta: `<!-- wp:paragraph -->\n<p>Cống khách sạn, nhà hàng Bãi Cháy tắc nghẽn? Xem dịch vụ <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> hoặc gọi ngay <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 2053, rb: "posts", name: "TTC Hồng Gai",
    cta: `<!-- wp:paragraph -->\n<p>Cống ngõ hẹp phố cổ Hồng Gai bị tắc? Liên hệ <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> — xe nhỏ vào ngõ hẻm, không đục phá. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  // ── Đặc thù HL ─────────────────────────────────────────────────────
  { id: 380,  rb: "pages", name: "TTC Chung cư HL",
    cta: `<!-- wp:paragraph -->\n<p>Cống chung cư, tầng hầm Hạ Long tắc? Xem giải pháp tại <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> — máy cao áp chuyên dụng, xử lý trục đứng. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 383,  rb: "pages", name: "TTC Nhà hàng HL",
    cta: `<!-- wp:paragraph -->\n<p>Cống nhà hàng Hạ Long tắc mỡ cứng? Gọi đội <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> — đánh tan mỡ, không gián đoạn giờ bán. Hotline: <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 384,  rb: "pages", name: "TTC Ngõ nhỏ HL",
    cta: `<!-- wp:paragraph -->\n<p>Cống ngõ hẹp Hạ Long không vào được xe lớn? Xem dịch vụ <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> — xe nhỏ và thợ đến tận nơi. Gọi <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->` },

  // ── Khu vực tỉnh ───────────────────────────────────────────────────
  { id: 400,  rb: "pages", name: "TTC Cẩm Phả",
    cta: `<!-- wp:paragraph -->\n<p>Cống Cẩm Phả tắc nghẽn? Liên hệ <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> — máy lò xo + cao áp, xử lý khu mỏ và nhà dân. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 405,  rb: "pages", name: "TTC Uông Bí",
    cta: `<!-- wp:paragraph -->\n<p>Cống Uông Bí bị tắc, nước trào? Đội <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> có mặt nhanh, xử lý khu công nghiệp và nhà dân. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 426,  rb: "pages", name: "TTC Móng Cái",
    cta: `<!-- wp:paragraph -->\n<p>Cống chợ biên giới Móng Cái tắc? Xem dịch vụ <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> — thợ đến nhanh, báo giá rõ. Gọi <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 425,  rb: "pages", name: "TTC Đông Triều",
    cta: `<!-- wp:paragraph -->\n<p>Cống nhà vườn, khu công nghiệp Đông Triều tắc? Liên hệ <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> — không đục phá, bảo hành. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 427,  rb: "pages", name: "TTC Vân Đồn",
    cta: `<!-- wp:paragraph -->\n<p>Cống resort, nhà dân Vân Đồn tắc? Xem đầy đủ dịch vụ <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> — có mặt trong ngày. Gọi <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 424,  rb: "pages", name: "TTC Quảng Yên",
    cta: `<!-- wp:paragraph -->\n<p>Cống Quảng Yên bị nghẹt? Đội <a href="${BASE}/${LANDING}/">thông tắc cống Quảng Ninh</a> tiếp nhận 05:00-22:00, không đục phá, bảo hành sau xử lý. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },
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
        Host: WP_HOST, Authorization: auth, "User-Agent": "audit-ttc/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(d.replace(/^\uFEFF/, "")) }); } catch { resolve({ status: res.statusCode, data: d }); } });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function analyze(raw) {
  const issues = [], passes = [];
  const text = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/).filter(w => w.length > 1).length;

  if (words >= 800) passes.push(`✓ Độ dài: ${words} từ`);
  else issues.push(`✗ Độ dài: ${words} từ (cần ≥ 800)`);

  const imgs = Math.max((raw.match(/<!-- wp:image/g)||[]).length, (raw.match(/<img\s/gi)||[]).length);
  if (imgs >= 3) passes.push(`✓ Ảnh: ${imgs} ảnh`);
  else if (imgs >= 2) issues.push(`⚠ Ảnh: ${imgs} ảnh`);
  else issues.push(`✗ Ảnh: ${imgs} ảnh (cần ≥ 3)`);

  const hasFaq = /Câu hỏi thường gặp|FAQ|thường gặp/i.test(text) || (raw.match(/<!-- wp:heading/g)||[]).length >= 5;
  if (hasFaq) passes.push("✓ FAQ/QA"); else issues.push("✗ Thiếu FAQ");

  if (raw.includes(`/${LANDING}/`)) passes.push(`✓ Link → /${LANDING}/`);
  else issues.push(`✗ Thiếu link → /${LANDING}/`);

  if (HOTLINES.some(h => raw.includes(h))) passes.push("✓ Hotline"); else issues.push("✗ Thiếu hotline");

  const h2 = (raw.match(/<!-- wp:heading.*?"level":2|<h2/g)||[]).length;
  if (h2 >= 3) passes.push(`✓ H2: ${h2}`); else issues.push(`✗ H2: ${h2}`);

  const bad = FORBIDDEN.filter(w => text.toLowerCase().includes(w.toLowerCase()));
  if (bad.length === 0) passes.push("✓ Không từ cấm"); else issues.push(`⚠ Từ cấm: ${bad.join(", ")}`);

  if (raw.includes(MARKER)) passes.push("✓ Author byline"); else issues.push("✗ Thiếu author byline");

  return { words, imgs, issues, passes, criticalCount: issues.filter(i => i.startsWith("✗")).length };
}

function buildByline(modified) {
  const d = new Date(modified);
  const ds = `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`;
  return `\n<!-- wp:paragraph {"className":"${MARKER} ttcqn-author-byline"} -->\n<p class="${MARKER} ttcqn-author-byline"><strong>Tác giả:</strong> <a href="${AUTHOR_URL}" rel="author">${AUTHOR_NAME}</a> · <strong>Cập nhật:</strong> ${ds}</p>\n<!-- /wp:paragraph -->`;
}

function applyFixes(content, needsLink, needsByline, cta, modified) {
  let out = content;
  if (needsLink) {
    const idx = out.indexOf(`<!-- wp:paragraph {"className":"${MARKER}`);
    const ins  = "\n" + cta + "\n";
    out = idx !== -1 ? out.slice(0, idx) + ins + out.slice(idx) : out + ins;
  }
  if (needsByline) out += buildByline(modified);
  return out;
}

async function main() {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log(`=== Audit + Fix TTC Area Pages (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);
  mkdirSync(REPORT_DIR, { recursive: true });

  const results = [];
  const fixed = [];

  for (const t of TARGETS) {
    console.log(`[${t.id}] ${t.name}`);
    const r = await request("GET", `/wp/v2/${t.rb}/${t.id}?context=edit`, auth);
    if (r.status !== 200) { console.log(`  ERROR ${r.status}\n`); results.push({ ...t, error: r.status }); continue; }

    const content  = r.data?.content?.raw ?? "";
    const modified = r.data?.modified ?? new Date().toISOString();
    const a = analyze(content);

    for (const p of a.passes) console.log(" ", p);
    for (const i of a.issues)  console.log(" ", i);

    const needsLink   = a.issues.some(i => i.includes(`/${LANDING}/`));
    const needsByline = a.issues.some(i => i.includes("author byline"));
    const fixes = [needsLink && "link", needsByline && "byline"].filter(Boolean);

    if (fixes.length > 0 && WRITE) {
      const newContent = applyFixes(content, needsLink, needsByline, t.cta, modified);
      const w = await request("POST", `/wp/v2/${t.rb}/${t.id}`, auth, { content: newContent });
      console.log(`  Fix [${fixes.join("+")}]: ${w.status === 200 ? "✓ 200" : `✗ ${w.status}`}`);
      if (w.status === 200) fixed.push(t.name);
    } else if (fixes.length > 0) {
      console.log(`  → cần fix [${fixes.join("+")}]`);
    }
    console.log();

    results.push({ ...t, ...a, needsLink, needsByline });
    await new Promise(r => setTimeout(r, 300));
  }

  const ok = results.filter(r => !r.error && r.criticalCount === 0);
  const bad = results.filter(r => r.criticalCount > 0);
  console.log(`=== TÓM TẮT ===`);
  console.log(`Đạt: ${ok.length}/${TARGETS.length} | Cần sửa: ${bad.length}/${TARGETS.length}`);
  if (WRITE && fixed.length > 0) console.log(`Đã fix: ${fixed.length} trang`);

  if (WRITE && fixed.length > 0) {
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},AUDIT-FIX-TTC-AREA-${TODAY},seo_fix,audit+fix TTC area pages,${BASE},,done,medium,,,,,${fixed.length} pages fixed (link+byline): ${fixed.join(",")},tools/audit_ttc_area_pages.mjs,,Re-audit confirm,,,,,,`,
      "utf8"
    );
  }

  // Report
  let md = `# Audit TTC Area Pages — ${TODAY}\n\n`;
  md += `| Trang | Từ | Ảnh | FAQ | Link | H2 | Byline | Critical |\n|---|---|---|---|---|---|---|---|\n`;
  for (const r of results) {
    if (r.error) { md += `| ${r.name} | ERROR | | | | | | |\n`; continue; }
    const faq  = r.passes?.some(p => p.includes("FAQ")) ? "✓" : "✗";
    const link = !r.needsLink || fixed.includes(r.name) ? "✓" : "✗";
    const h2   = r.passes?.some(p => p.includes("H2")) ? "✓" : "✗";
    const byl  = !r.needsByline || fixed.includes(r.name) ? "✓" : "✗";
    md += `| ${r.name} | ${r.words} | ${r.imgs} | ${faq} | ${link} | ${h2} | ${byl} | ${r.criticalCount} |\n`;
  }
  const reportPath = path.join(REPORT_DIR, `audit-ttc-area-${TODAY}.md`);
  writeFileSync(reportPath, md, "utf8");
  console.log(`\nReport: ${reportPath}`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
