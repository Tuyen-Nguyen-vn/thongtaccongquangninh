/**
 * Audit + fix link ngược cho 7 BC area pages (1481–1487, 450).
 * Chạy audit trước, nếu thiếu link → thêm CTA luôn.
 *
 * Usage:
 *   node tools/audit_bc_area_pages.mjs          ← audit only
 *   node tools/audit_bc_area_pages.mjs --write  ← audit + fix links
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
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const BASE      = "https://thongtaccongquangninh.com";
const CSV_PATH  = path.join(PROJECT_ROOT, "docs", "SEO_PROGRESS.csv");
const REPORT_DIR = path.join(PROJECT_ROOT, "reports");
const MARKER      = "ttcqn-author-nguyen-song-hao";
const AUTHOR_NAME = "Nguyễn Song Hào";
const AUTHOR_URL  = "https://thongtaccongquangninh.com/author/nguyensonghao/";
const HOTLINES  = ["0963.953.533", "0931.156.756"];
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];
const WRITE     = process.argv.includes("--write");
const LANDING   = "thong-tac-bon-cau-quang-ninh";

function firstExisting(candidates) {
  for (const candidate of candidates.filter(Boolean)) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`Không tìm thấy .env. Đã thử: ${candidates.filter(Boolean).join(" | ")}`);
}

const TARGETS = [
  { id: 1482, slug: "thong-tac-bon-cau-ha-long",    name: "BC Hạ Long",
    cta: `<!-- wp:paragraph -->\n<p>Cần thợ thông tắc bồn cầu tại Hạ Long ngay hôm nay? Xem đầy đủ dịch vụ tại trang <a href="${BASE}/${LANDING}/">thông tắc bồn cầu Quảng Ninh</a> hoặc gọi <strong>0963.953.533 / 0931.156.756</strong> — có mặt 15 phút.</p>\n<!-- /wp:paragraph -->` },

  { id: 450,  slug: "thong-tac-bon-cau-cam-pha",    name: "BC Cẩm Phả",
    cta: `<!-- wp:paragraph -->\n<p>Bồn cầu Cẩm Phả đang tắc cần xử lý ngay? Liên hệ <a href="${BASE}/${LANDING}/">thông tắc bồn cầu Quảng Ninh</a> — đội thợ có mặt trong ngày, không đục phá, bảo hành. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 1486, slug: "thong-tac-bon-cau-uong-bi",    name: "BC Uông Bí",
    cta: `<!-- wp:paragraph -->\n<p>Bồn cầu Uông Bí bị tắc? Đội <a href="${BASE}/${LANDING}/">thông tắc bồn cầu Quảng Ninh</a> tiếp nhận 05:00-22:00 — thợ đến tận nơi, không đục phá. Gọi <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 1483, slug: "thong-tac-bon-cau-mong-cai",   name: "BC Móng Cái",
    cta: `<!-- wp:paragraph -->\n<p>Cần thông tắc bồn cầu tại Móng Cái? Xem thêm dịch vụ <a href="${BASE}/${LANDING}/">thông tắc bồn cầu Quảng Ninh</a> — tiếp nhận nhà phố, khách sạn khu cửa khẩu trong khung 05:00-22:00. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 1481, slug: "thong-tac-bon-cau-dong-trieu", name: "BC Đông Triều",
    cta: `<!-- wp:paragraph -->\n<p>Bồn cầu Đông Triều tắc nghẽn? Liên hệ <a href="${BASE}/${LANDING}/">thông tắc bồn cầu Quảng Ninh</a> — xử lý nhà trong ngõ, khu công nghiệp, không đục phá. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 1487, slug: "thong-tac-bon-cau-van-don",    name: "BC Vân Đồn",
    cta: `<!-- wp:paragraph -->\n<p>Cần thông tắc bồn cầu tại Vân Đồn? Xem dịch vụ <a href="${BASE}/${LANDING}/">thông tắc bồn cầu Quảng Ninh</a> — phục vụ resort, nhà nghỉ, nhà dân tại đảo. Gọi <strong>0963.953.533 / 0931.156.756</strong>.</p>\n<!-- /wp:paragraph -->` },

  { id: 1485, slug: "thong-tac-bon-cau-quang-yen",  name: "BC Quảng Yên",
    cta: `<!-- wp:paragraph -->\n<p>Bồn cầu Quảng Yên bị tắc cần xử lý nhanh? Đội <a href="${BASE}/${LANDING}/">thông tắc bồn cầu Quảng Ninh</a> tiếp nhận tận nơi 05:00-22:00, không đục phá, bảo hành. Gọi <strong>0963.953.533</strong>.</p>\n<!-- /wp:paragraph -->` },
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
        Host: WP_HOST, Authorization: auth, "User-Agent": "audit-fix/1.0",
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

function analyze(raw, t) {
  const issues = [], passes = [];
  const text = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/).filter(w => w.length > 1).length;

  if (words >= 800) passes.push(`✓ Độ dài: ${words} từ`);
  else issues.push(`✗ Độ dài: ${words} từ (cần ≥ 800)`);

  const imgs = Math.max((raw.match(/<!-- wp:image/g)||[]).length, (raw.match(/<img\s/gi)||[]).length);
  if (imgs >= 3) passes.push(`✓ Ảnh: ${imgs} ảnh`);
  else if (imgs >= 2) issues.push(`⚠ Ảnh: ${imgs} ảnh (lý tưởng ≥ 3)`);
  else issues.push(`✗ Ảnh: ${imgs} ảnh (cần ≥ 3)`);

  const hasFaq = /Câu hỏi thường gặp|FAQ|thường gặp/i.test(text)
    || (raw.match(/<!-- wp:heading/g)||[]).length >= 5;
  if (hasFaq) passes.push("✓ FAQ/QA structure");
  else issues.push("✗ Thiếu FAQ");

  if (raw.includes(`/${LANDING}/`)) passes.push(`✓ Link → /${LANDING}/`);
  else issues.push(`✗ Thiếu link → /${LANDING}/`);

  if (HOTLINES.some(h => raw.includes(h))) passes.push("✓ Hotline");
  else issues.push("✗ Thiếu hotline");

  const h2 = (raw.match(/<!-- wp:heading.*?"level":2|<h2/g)||[]).length;
  if (h2 >= 3) passes.push(`✓ H2: ${h2}`);
  else issues.push(`✗ H2: ${h2} (cần ≥ 3)`);

  const bad = FORBIDDEN.filter(w => text.toLowerCase().includes(w.toLowerCase()));
  if (bad.length === 0) passes.push("✓ Không từ cấm");
  else issues.push(`⚠ Từ cấm: ${bad.join(", ")}`);

  if (raw.includes("ttcqn-author-nguyen-song-hao")) passes.push("✓ Author byline");
  else issues.push("✗ Thiếu author byline");

  return { words, imgs, issues, passes, criticalCount: issues.filter(i => i.startsWith("✗")).length };
}

function buildByline(modified) {
  const d = new Date(modified);
  const dateStr = `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`;
  return [
    `\n<!-- wp:paragraph {"className":"${MARKER} ttcqn-author-byline"} -->`,
    `<p class="${MARKER} ttcqn-author-byline"><strong>Tác giả:</strong> <a href="${AUTHOR_URL}" rel="author">${AUTHOR_NAME}</a> · <strong>Cập nhật:</strong> ${dateStr}</p>`,
    `<!-- /wp:paragraph -->`,
  ].join("\n");
}

function applyFixes(content, needsLink, needsByline, cta, modified) {
  let out = content;
  // Thêm CTA trước author block (hoặc cuối)
  if (needsLink) {
    const idx = out.indexOf(`<!-- wp:paragraph {"className":"${MARKER}`);
    const ins  = "\n" + cta + "\n";
    out = idx !== -1 ? out.slice(0, idx) + ins + out.slice(idx) : out + ins;
  }
  // Thêm byline cuối (sau CTA nếu vừa thêm)
  if (needsByline) {
    out = out + buildByline(modified);
  }
  return out;
}

async function main() {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log(`=== Audit + Fix BC Area Pages (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);
  mkdirSync(REPORT_DIR, { recursive: true });

  const results = [];
  const fixed = [];

  for (const t of TARGETS) {
    console.log(`--- [${t.id}] ${t.name} ---`);
    const r = await request("GET", `/wp/v2/pages/${t.id}?context=edit`, auth);
    if (r.status !== 200) { console.log(`  ERROR ${r.status}\n`); results.push({ ...t, error: r.status }); continue; }

    let content = r.data?.content?.raw ?? "";
    const a = analyze(content, t);
    for (const p of a.passes) console.log(" ", p);
    for (const i of a.issues) console.log(" ", i);
    console.log(`  → ${a.passes.length}/${a.passes.length + a.criticalCount} | ${a.words} từ | ${a.imgs} ảnh`);

    const needsLink   = a.issues.some(i => i.includes(`/${LANDING}/`));
    const needsByline = a.issues.some(i => i.includes("author byline"));
    const modified    = r.data?.modified ?? new Date().toISOString();

    if ((needsLink || needsByline) && WRITE) {
      const newContent = applyFixes(content, needsLink, needsByline, t.cta, modified);
      const w = await request("POST", `/wp/v2/pages/${t.id}`, auth, { content: newContent });
      const ok = w.status === 200;
      const fixes = [needsLink && "link", needsByline && "byline"].filter(Boolean).join("+");
      console.log(`  Fix [${fixes}]: ${ok ? "✓ 200" : `✗ ${w.status}`}`);
      if (ok) fixed.push(t.slug);
    } else if ((needsLink || needsByline) && !WRITE) {
      const pending = [needsLink && "link", needsByline && "byline"].filter(Boolean).join("+");
      console.log(`  → cần fix [${pending}] khi chạy --write`);
    }
    console.log();

    results.push({ ...t, ...a, needsLink });
    await new Promise(r => setTimeout(r, 300));
  }

  const critical = results.filter(r => r.criticalCount > 0);
  const ok = results.filter(r => !r.error && r.criticalCount === 0);
  console.log(`=== TÓM TẮT ===`);
  console.log(`Đạt: ${ok.length}/${TARGETS.length} | Cần sửa: ${critical.length}/${TARGETS.length}`);
  if (WRITE && fixed.length > 0) console.log(`Link đã fix: ${fixed.length} trang`);

  if (WRITE && fixed.length > 0) {
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},AUDIT-FIX-BC-AREA-${TODAY},seo_fix,audit+fix BC area pages link→landing,${BASE},,done,medium,,,,,${fixed.length} pages fixed link→/${LANDING}/: ${fixed.join(",")},tools/audit_bc_area_pages.mjs,,Re-audit to confirm,,,,,,`,
      "utf8"
    );
  }

  // Report
  let md = `# Audit BC Area Pages — ${TODAY}\n\n`;
  md += `| Trang | Từ | Ảnh | FAQ | Link | H2 | Byline | Critical |\n|---|---|---|---|---|---|---|---|\n`;
  for (const r of results) {
    if (r.error) { md += `| ${r.name} | ERROR | | | | | | |\n`; continue; }
    const faq  = r.passes?.some(p => p.includes("FAQ")) ? "✓" : "✗";
    const link = r.passes?.some(p => p.includes("Link")) ? "✓" : WRITE && fixed.includes(r.slug) ? "fixed" : "✗";
    const h2   = r.passes?.some(p => p.includes("H2")) ? "✓" : "✗";
    const byl  = r.passes?.some(p => p.includes("Author")) ? "✓" : "✗";
    md += `| ${r.name} | ${r.words} | ${r.imgs} | ${faq} | ${link} | ${h2} | ${byl} | ${r.criticalCount} |\n`;
  }
  const reportPath = path.join(REPORT_DIR, `audit-bc-area-${TODAY}.md`);
  writeFileSync(reportPath, md, "utf8");
  console.log(`\nReport: ${reportPath}`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
