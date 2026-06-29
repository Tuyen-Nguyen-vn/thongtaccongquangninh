/**
 * Audit chất lượng nội dung các bài informational.
 * Kiểm: độ dài, ảnh ≥ 2, FAQ, internal link → landing, hotline, H2, author byline.
 *
 * Usage: node tools/audit_informational_content.mjs
 */
import https from "node:https";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const REPORT_DIR = "D:\\.thongtaccongquangninh\\reports";
const HOTLINES = ["0963.953.533", "0931.156.756"];
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];
const BASE = "https://thongtaccongquangninh.com";

const TARGETS = [
  // ── Bài cũ (có trước 2026-06) ──────────────────────────────────────
  { id: 215,  restBase: "posts", slug: "dau-hieu-be-phot-can-hut",
    name: "Dấu hiệu BPS cần hút",
    landingSlug: "hut-be-phot-quang-ninh" },

  { id: 216,  restBase: "posts", slug: "cach-xu-ly-cong-thoat-nuoc-tac",
    name: "Cách xử lý cống tắc",
    landingSlug: "thong-tac-cong-quang-ninh" },

  { id: 386,  restBase: "pages", slug: "nguyen-nhan-cong-tac-thuong-xuyen-ha-long",
    name: "Nguyên nhân cống tắc HL",
    landingSlug: "thong-tac-cong-quang-ninh" },

  { id: 2043, restBase: "posts", slug: "bon-cau-rut-cham-nguyen-nhan",
    name: "Bồn cầu rút chậm",
    landingSlug: "thong-tac-bon-cau-quang-ninh" },

  { id: 2045, restBase: "posts", slug: "hoa-chat-tu-thong-cong",
    name: "Hóa chất tự thông cống",
    landingSlug: "thong-tac-cong-quang-ninh" },

  { id: 2046, restBase: "posts", slug: "mui-hoi-cong-nguyen-nhan-xu-ly",
    name: "Mùi hôi cống",
    landingSlug: "xu-ly-mui-hoi-quang-ninh" },

  // ── Bài informational đã set meta trước đó ─────────────────────────
  { id: 2025, restBase: "pages", slug: "chi-phi-hut-be-phot-quang-ninh",
    name: "Chi phí HBP",
    landingSlug: "hut-be-phot-quang-ninh" },

  { id: 2044, restBase: "posts", slug: "chu-ky-hut-be-phot",
    name: "Chu kỳ HBP",
    landingSlug: "hut-be-phot-quang-ninh" },

  { id: 2357, restBase: "posts", slug: "gia-thong-tac-bon-cau-quang-ninh",
    name: "Giá TTC bồn cầu",
    landingSlug: "thong-tac-bon-cau-quang-ninh" },

  { id: 2589, restBase: "posts", slug: "dau-hieu-be-phot-bi-day-2026",
    name: "Dấu hiệu BPS đầy",
    landingSlug: "hut-be-phot-quang-ninh" },

  { id: 1367, restBase: "posts", slug: "thong-tac-bon-cau-bi-tac",
    name: "Bồn cầu bị tắc",
    landingSlug: "thong-tac-bon-cau-quang-ninh" },

  { id: 1377, restBase: "posts", slug: "cau-hoi-thuong-gap-thong-tac-cong",
    name: "FAQ thông tắc cống",
    landingSlug: "thong-tac-cong-quang-ninh" },
];

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function request(path, auth) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "audit/1.0" },
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
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function analyzeContent(raw, target) {
  const issues = [];
  const passes = [];

  const text = stripHtml(raw);
  const words = text.split(/\s+/).filter(w => w.length > 1).length;

  // 1. Word count (informational: ≥ 600)
  if (words >= 800) passes.push(`✓ Độ dài: ${words} từ`);
  else if (words >= 600) passes.push(`⚠ Độ dài: ${words} từ (đạt ngưỡng tối thiểu 600, lý tưởng ≥ 800)`);
  else issues.push(`✗ Độ dài: ${words} từ (cần ≥ 600)`);

  // 2. Images (informational: ≥ 2)
  const imgBlocks = (raw.match(/<!-- wp:image/g) || []).length;
  const imgTags   = (raw.match(/<img\s/gi) || []).length;
  const totalImgs = Math.max(imgBlocks, imgTags);
  if (totalImgs >= 3) passes.push(`✓ Ảnh: ${totalImgs} ảnh`);
  else if (totalImgs >= 2) passes.push(`⚠ Ảnh: ${totalImgs} ảnh (đạt tối thiểu 2, lý tưởng ≥ 3)`);
  else issues.push(`✗ Ảnh: ${totalImgs} ảnh (cần ≥ 2)`);

  // 3. FAQ / structured QA
  const hasFaq = /<!-- wp:yoast\/faq-block|wp:rank-math\/faq-block/i.test(raw)
    || /Câu hỏi thường gặp|FAQ|hỏi.*đáp|thường gặp/i.test(text)
    || (raw.match(/<!-- wp:heading/g) || []).length >= 4;
  if (hasFaq) passes.push("✓ Có FAQ/QA structure");
  else issues.push("✗ Thiếu FAQ hoặc cấu trúc QA");

  // 4. Internal link → service landing
  if (raw.includes(`/${target.landingSlug}/`))
    passes.push(`✓ Internal link → /${target.landingSlug}/`);
  else
    issues.push(`✗ Thiếu internal link → /${target.landingSlug}/`);

  // 5. Hotline
  if (HOTLINES.some(h => raw.includes(h))) passes.push("✓ Hotline có mặt");
  else issues.push("✗ Thiếu hotline");

  // 6. H2 count
  const h2count = (raw.match(/<!-- wp:heading.*?"level":2|<h2/g) || []).length;
  if (h2count >= 2) passes.push(`✓ H2: ${h2count} headings`);
  else issues.push(`✗ H2: ${h2count} headings (cần ≥ 2)`);

  // 7. Forbidden words
  const foundForbidden = FORBIDDEN.filter(w => text.toLowerCase().includes(w.toLowerCase()));
  if (foundForbidden.length === 0) passes.push("✓ Không từ cấm");
  else issues.push(`⚠ Từ cấm: ${foundForbidden.join(", ")}`);

  // 8. Author byline
  if (raw.includes("ttcqn-author-nguyen-song-hao")) passes.push("✓ Author byline");
  else issues.push("✗ Thiếu author byline");

  const criticalCount = issues.filter(i => i.startsWith("✗")).length;
  return { words, totalImgs, hasFaq, issues, passes, criticalCount };
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);

  console.log("=== Audit Informational Content Quality ===\n");
  mkdirSync(REPORT_DIR, { recursive: true });

  const results = [];

  for (const t of TARGETS) {
    console.log(`--- [${t.id}] ${t.slug} ---`);
    const r = await request(`/wp/v2/${t.restBase}/${t.id}?context=edit`, auth);
    if (r.status !== 200) {
      console.log(`  ERROR ${r.status}\n`);
      results.push({ ...t, error: r.status });
      continue;
    }

    const raw = r.data?.content?.raw ?? "";
    const analysis = analyzeContent(raw, t);

    for (const p of analysis.passes) console.log(" ", p);
    for (const i of analysis.issues) console.log(" ", i);
    const total = analysis.passes.length + analysis.criticalCount;
    console.log(`  → Điểm: ${analysis.passes.length}/${total} | Từ: ${analysis.words} | Ảnh: ${analysis.totalImgs}\n`);

    results.push({ ...t, ...analysis });
    await new Promise(r => setTimeout(r, 300));
  }

  // Summary
  const critical = results.filter(r => r.criticalCount > 0);
  const ok = results.filter(r => !r.error && r.criticalCount === 0);
  console.log(`=== TÓM TẮT ===`);
  console.log(`Đạt (0 lỗi critical): ${ok.length}/${TARGETS.length}`);
  console.log(`Cần sửa: ${critical.length}/${TARGETS.length}\n`);

  if (critical.length > 0) {
    console.log("=== BACKLOG FIX ===");
    for (const r of critical) {
      const crits = r.issues?.filter(i => i.startsWith("✗")) ?? [];
      const warns = r.issues?.filter(i => i.startsWith("⚠")) ?? [];
      console.log(`\n[${r.id}] ${r.name}:`);
      for (const c of crits) console.log("  " + c);
      for (const w of warns) console.log("  " + w);
    }
  }

  // Write report
  let md = `# Audit Informational Content — ${TODAY}\n\n`;
  md += `| Bài | Từ | Ảnh | FAQ | Link→Landing | H2 | Byline | Critical |\n`;
  md += `|---|---|---|---|---|---|---|---|\n`;
  for (const r of results) {
    if (r.error) { md += `| ${r.name} | ERROR | | | | | | |\n`; continue; }
    const faq  = r.passes?.some(p => p.includes("FAQ")) ? "✓" : "✗";
    const link = r.passes?.some(p => p.includes("Internal link")) ? "✓" : "✗";
    const h2   = r.passes?.some(p => p.includes("H2")) ? "✓" : "✗";
    const byl  = r.passes?.some(p => p.includes("Author")) ? "✓" : "✗";
    md += `| ${r.name} | ${r.words} | ${r.totalImgs} | ${faq} | ${link} | ${h2} | ${byl} | ${r.criticalCount} |\n`;
  }

  md += `\n## Backlog Fix\n\n`;
  for (const r of critical) {
    md += `### [${r.id}] ${r.name}\n`;
    for (const c of r.issues?.filter(i => i.startsWith("✗")) ?? []) md += `- **${c}**\n`;
    for (const w of r.issues?.filter(i => i.startsWith("⚠")) ?? []) md += `- ${w}\n`;
    md += "\n";
  }

  if (critical.length === 0) md += "_Tất cả bài đạt tiêu chí — không cần sửa._\n";

  const path = `${REPORT_DIR}\\audit-informational-${TODAY}.md`;
  writeFileSync(path, md, "utf8");
  console.log(`\nReport: ${path}`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
