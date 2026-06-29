/**
 * Audit chất lượng nội dung 6 bài HBP huyện xa (2047–2052).
 * Kiểm: độ dài, ảnh ≥ 3, FAQ, local entity, hotline, H2.
 *
 * Usage: node tools/audit_hbp_huyen_content.mjs
 */
import https from "node:https";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const REPORT_DIR = "D:\\.thongtaccongquangninh\\reports";
const HOTLINES = ["0963.953.533", "0931.156.756"];
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm", "đội ngũ chuyên nghiệp"];

// Local entity keywords cho từng huyện
const TARGETS = [
  {
    id: 2047, slug: "hut-be-phot-ba-che",
    name: "Ba Chẽ",
    localEntities: ["Ba Chẽ", "thị trấn Ba Chẽ", "sông Ba Chẽ", "vùng núi", "đồng bào", "nông thôn"],
  },
  {
    id: 2048, slug: "hut-be-phot-binh-lieu",
    name: "Bình Liêu",
    localEntities: ["Bình Liêu", "thị trấn Bình Liêu", "cửa khẩu Hoành Mô", "vùng biên giới", "người Dao", "người Tày"],
  },
  {
    id: 2049, slug: "hut-be-phot-co-to",
    name: "Cô Tô",
    localEntities: ["Cô Tô", "đảo Cô Tô", "cảng Cô Tô", "resort", "du lịch biển", "đảo xa"],
  },
  {
    id: 2050, slug: "hut-be-phot-dam-ha",
    name: "Đầm Hà",
    localEntities: ["Đầm Hà", "thị trấn Đầm Hà", "nuôi trồng thủy sản", "ven biển", "khu công nghiệp Đầm Hà"],
  },
  {
    id: 2051, slug: "hut-be-phot-hai-ha",
    name: "Hải Hà",
    localEntities: ["Hải Hà", "thị trấn Quảng Hà", "cửa khẩu Bắc Phong Sinh", "ven biển", "khu kinh tế"],
  },
  {
    id: 2052, slug: "hut-be-phot-tien-yen",
    name: "Tiên Yên",
    localEntities: ["Tiên Yên", "thị trấn Tiên Yên", "cầu Ba Chẽ", "đầu mối giao thông", "sông Tiên Yên"],
  },
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

function countWords(text) {
  return text.split(/\s+/).filter(w => w.length > 1).length;
}

function analyzeContent(raw, target) {
  const issues = [];
  const passes = [];

  // 1. Word count
  const text = stripHtml(raw);
  const words = countWords(text);
  if (words >= 800) passes.push(`✓ Độ dài: ${words} từ`);
  else issues.push(`✗ Độ dài: ${words} từ (cần ≥ 800)`);

  // 2. Images
  const imgMatches = (raw.match(/<!-- wp:image/g) || []).length;
  const imgTags = (raw.match(/<img\s/gi) || []).length;
  const totalImgs = Math.max(imgMatches, imgTags);
  if (totalImgs >= 3) passes.push(`✓ Ảnh: ${totalImgs} ảnh`);
  else issues.push(`✗ Ảnh: ${totalImgs} ảnh (cần ≥ 3)`);

  // 3. FAQ
  const hasFaq = /<!-- wp:yoast\/faq-block|wp:rank-math\/faq-block|<!-- wp:heading.*faq|<h[23][^>]*>[^<]*câu hỏi/i.test(raw)
    || /Câu hỏi thường gặp|FAQ|hỏi.*đáp/i.test(text);
  if (hasFaq) passes.push("✓ Có FAQ");
  else issues.push("✗ Thiếu FAQ / H2 câu hỏi");

  // 4. Local entity
  const foundEntities = target.localEntities.filter(e =>
    text.toLowerCase().includes(e.toLowerCase())
  );
  if (foundEntities.length >= 2) passes.push(`✓ Local entity: ${foundEntities.slice(0,3).join(", ")}`);
  else if (foundEntities.length === 1) issues.push(`⚠ Local entity yếu: chỉ có "${foundEntities[0]}" (cần ≥ 2)`);
  else issues.push(`✗ Thiếu local entity (cần: ${target.localEntities.slice(0,3).join(", ")})`);

  // 5. Hotline
  const hasHotline = HOTLINES.some(h => raw.includes(h));
  if (hasHotline) passes.push("✓ Hotline có mặt");
  else issues.push("✗ Thiếu hotline");

  // 6. H2 count
  const h2s = (raw.match(/<!-- wp:heading.*?{"level":2}|<h2/g) || []).length;
  const h2Names = [...text.matchAll(/(?<=\n|>)[A-ZĐẮẶÂẤẦẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤÝỲỶỸỴ][^\n]{10,60}(?=\n)/g)]
    .slice(0, 4).map(m => m[0].trim());
  if (h2s >= 3) passes.push(`✓ H2: ${h2s} headings`);
  else issues.push(`✗ H2: ${h2s} headings (cần ≥ 3)`);

  // 7. Forbidden words
  const foundForbidden = FORBIDDEN.filter(w => text.toLowerCase().includes(w.toLowerCase()));
  if (foundForbidden.length === 0) passes.push("✓ Không từ cấm");
  else issues.push(`⚠ Từ cấm: ${foundForbidden.join(", ")}`);

  // 8. Author byline
  const hasAuthor = raw.includes("ttcqn-author-nguyen-song-hao");
  if (hasAuthor) passes.push("✓ Author byline");
  else issues.push("✗ Thiếu author byline");

  const score = passes.length;
  const total = passes.length + issues.filter(i => i.startsWith("✗")).length;
  return { words, totalImgs, hasFaq, foundEntities, issues, passes, score, total };
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);

  console.log("=== Audit HBP Huyện Content Quality ===\n");
  mkdirSync(REPORT_DIR, { recursive: true });

  const results = [];

  for (const t of TARGETS) {
    console.log(`--- [${t.id}] ${t.slug} (${t.name}) ---`);
    const r = await request(`/wp/v2/posts/${t.id}?context=edit`, auth);
    if (r.status !== 200) {
      console.log(`  ERROR ${r.status}\n`);
      results.push({ ...t, error: r.status });
      continue;
    }

    const raw = r.data?.content?.raw ?? "";
    const title = r.data?.title?.rendered ?? "";
    const analysis = analyzeContent(raw, t);

    for (const p of analysis.passes) console.log(" ", p);
    for (const i of analysis.issues) console.log(" ", i);
    console.log(`  → Điểm: ${analysis.score}/${analysis.score + analysis.issues.filter(x=>x.startsWith("✗")).length} critical\n`);

    results.push({ id: t.id, slug: t.slug, name: t.name, title, ...analysis });
    await new Promise(r => setTimeout(r, 300));
  }

  // Summary
  console.log("=== TÓM TẮT ===");
  const criticalFail = results.filter(r => r.issues?.some(i => i.startsWith("✗")));
  const perfect = results.filter(r => !r.issues?.some(i => i.startsWith("✗")));
  console.log(`Cần sửa: ${criticalFail.length}/${TARGETS.length} bài`);
  console.log(`Đạt: ${perfect.length}/${TARGETS.length} bài\n`);

  // Backlog
  const backlog = [];
  for (const r of results) {
    if (!r.issues) continue;
    const critical = r.issues.filter(i => i.startsWith("✗"));
    const warn = r.issues.filter(i => i.startsWith("⚠"));
    if (critical.length > 0 || warn.length > 0) {
      backlog.push({ id: r.id, slug: r.slug, name: r.name, critical, warn });
    }
  }

  // Write report
  let md = `# Audit HBP Huyện Content — ${TODAY}\n\n`;
  md += `## Tổng quan\n\n| Bài | Từ | Ảnh | FAQ | Local | H2 | Điểm |\n|---|---|---|---|---|---|---|\n`;
  for (const r of results) {
    if (r.error) { md += `| ${r.slug} | ERROR ${r.error} | | | | | |\n`; continue; }
    const faq = r.hasFaq ? "✓" : "✗";
    const loc = r.foundEntities?.length >= 2 ? "✓" : r.foundEntities?.length === 1 ? "⚠" : "✗";
    const h2ok = r.passes?.some(p => p.includes("H2")) ? "✓" : "✗";
    md += `| ${r.name} | ${r.words} | ${r.totalImgs} | ${faq} | ${loc} | ${h2ok} | ${r.score}/${r.score + r.issues.filter(i=>i.startsWith("✗")).length} |\n`;
  }

  md += `\n## Backlog Fix (theo bài)\n\n`;
  for (const b of backlog) {
    md += `### ${b.name} (ID: ${b.id})\n`;
    for (const c of b.critical) md += `- **${c}**\n`;
    for (const w of b.warn) md += `- ${w}\n`;
    md += "\n";
  }

  md += `## Ghi chú\n\n- Ngưỡng: ≥ 800 từ, ≥ 3 ảnh, có FAQ, ≥ 2 local entity, hotline, ≥ 3 H2\n`;
  md += `- Ưu tiên fix: từ < 500, ảnh < 2, thiếu local entity đặc trưng\n`;

  const reportPath = `${REPORT_DIR}\\audit-hbp-huyen-${TODAY}.md`;
  writeFileSync(reportPath, md, "utf8");
  console.log(`Report: ${reportPath}`);

  if (backlog.length > 0) {
    console.log("\n=== BACKLOG ===");
    for (const b of backlog) {
      console.log(`\n[${b.id}] ${b.name}:`);
      for (const c of b.critical) console.log("  " + c);
      for (const w of b.warn) console.log("  " + w);
    }
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
