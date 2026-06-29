/**
 * Audit chất lượng nội dung 9 bài service BC/HBP mới (2377–2449).
 * Tiêu chí landing service: ≥ 800 từ, ≥ 3 ảnh, FAQ, internal link, hotline, ≥ 3 H2, byline.
 *
 * Usage: node tools/audit_bc_hbp_service_posts.mjs
 */
import https from "node:https";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const REPORT_DIR = "D:\\.thongtaccongquangninh\\reports";
const HOTLINES  = ["0963.953.533", "0931.156.756"];
const FORBIDDEN = ["chuyên nghiệp", "uy tín", "hàng đầu", "tận tâm"];

const TARGETS = [
  { id: 2377, slug: "thong-tac-bon-cau-khan-cap-quang-ninh",   name: "BC khẩn cấp",    landingSlug: "thong-tac-bon-cau-quang-ninh" },
  { id: 2379, slug: "thong-tac-bon-cau-ban-dem-quang-ninh",    name: "BC ban đêm",      landingSlug: "thong-tac-bon-cau-quang-ninh" },
  { id: 2385, slug: "thong-tac-bon-cau-khong-duc-pha-quang-ninh", name: "BC không đục phá", landingSlug: "thong-tac-bon-cau-quang-ninh" },
  { id: 2407, slug: "thong-tac-bon-cau-nha-dan-quang-ninh-2026",  name: "BC nhà dân",   landingSlug: "thong-tac-bon-cau-quang-ninh" },
  { id: 2412, slug: "thong-tac-bon-cau-nha-hang-quang-ninh-2026", name: "BC nhà hàng",  landingSlug: "thong-tac-bon-cau-quang-ninh" },
  { id: 2417, slug: "thong-tac-bon-cau-khach-san-quang-ninh-2026", name: "BC khách sạn", landingSlug: "thong-tac-bon-cau-quang-ninh" },
  { id: 2430, slug: "hut-be-phot-khan-cap-quang-ninh-2026",    name: "HBP khẩn cấp",   landingSlug: "hut-be-phot-quang-ninh" },
  { id: 2439, slug: "hut-be-phot-24-7-quang-ninh-2026",        name: "HBP 24/7",        landingSlug: "hut-be-phot-quang-ninh" },
  { id: 2449, slug: "gia-hut-be-phot-quang-ninh-2026",         name: "Giá HBP",         landingSlug: "hut-be-phot-quang-ninh" },
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
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, data: d }); } });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

function analyze(raw, t) {
  const issues = [], passes = [];
  const text = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/).filter(w => w.length > 1).length;

  // 1. Word count
  if (words >= 800) passes.push(`✓ Độ dài: ${words} từ`);
  else issues.push(`✗ Độ dài: ${words} từ (cần ≥ 800)`);

  // 2. Images
  const imgs = Math.max((raw.match(/<!-- wp:image/g)||[]).length, (raw.match(/<img\s/gi)||[]).length);
  if (imgs >= 3) passes.push(`✓ Ảnh: ${imgs} ảnh`);
  else if (imgs >= 2) issues.push(`⚠ Ảnh: ${imgs} ảnh (lý tưởng ≥ 3)`);
  else issues.push(`✗ Ảnh: ${imgs} ảnh (cần ≥ 3)`);

  // 3. FAQ
  const hasFaq = /Câu hỏi thường gặp|FAQ|thường gặp|<!-- wp:yoast\/faq|wp:rank-math\/faq/i.test(raw)
    || (raw.match(/<!-- wp:heading/g)||[]).length >= 5;
  if (hasFaq) passes.push("✓ FAQ/QA structure");
  else issues.push("✗ Thiếu FAQ");

  // 4. Internal link → main landing
  if (raw.includes(`/${t.landingSlug}/`)) passes.push(`✓ Link → /${t.landingSlug}/`);
  else issues.push(`✗ Thiếu link → /${t.landingSlug}/`);

  // 5. Hotline
  if (HOTLINES.some(h => raw.includes(h))) passes.push("✓ Hotline");
  else issues.push("✗ Thiếu hotline");

  // 6. H2
  const h2 = (raw.match(/<!-- wp:heading.*?"level":2|<h2/g)||[]).length;
  if (h2 >= 3) passes.push(`✓ H2: ${h2}`);
  else issues.push(`✗ H2: ${h2} (cần ≥ 3)`);

  // 7. Forbidden
  const bad = FORBIDDEN.filter(w => text.toLowerCase().includes(w.toLowerCase()));
  if (bad.length === 0) passes.push("✓ Không từ cấm");
  else issues.push(`⚠ Từ cấm: ${bad.join(", ")}`);

  // 8. Author byline
  if (raw.includes("ttcqn-author-nguyen-song-hao")) passes.push("✓ Author byline");
  else issues.push("✗ Thiếu author byline");

  const criticalCount = issues.filter(i => i.startsWith("✗")).length;
  return { words, imgs, hasFaq, issues, passes, criticalCount };
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);

  console.log("=== Audit BC/HBP Service Posts Content Quality ===\n");
  mkdirSync(REPORT_DIR, { recursive: true });

  const results = [];

  for (const t of TARGETS) {
    console.log(`--- [${t.id}] ${t.name} ---`);
    const r = await request(`/wp/v2/posts/${t.id}?context=edit`, auth);
    if (r.status !== 200) { console.log(`  ERROR ${r.status}\n`); results.push({ ...t, error: r.status }); continue; }

    const raw = r.data?.content?.raw ?? "";
    const a   = analyze(raw, t);
    for (const p of a.passes) console.log(" ", p);
    for (const i of a.issues) console.log(" ", i);
    console.log(`  → ${a.passes.length}/${a.passes.length + a.criticalCount} | ${a.words} từ | ${a.imgs} ảnh\n`);
    results.push({ ...t, ...a });
    await new Promise(r => setTimeout(r, 300));
  }

  const critical = results.filter(r => r.criticalCount > 0);
  const ok = results.filter(r => !r.error && r.criticalCount === 0);
  console.log(`=== TÓM TẮT ===`);
  console.log(`Đạt: ${ok.length}/${TARGETS.length} | Cần sửa: ${critical.length}/${TARGETS.length}`);

  if (critical.length > 0) {
    console.log("\n=== BACKLOG ===");
    for (const r of critical) {
      console.log(`\n[${r.id}] ${r.name}:`);
      for (const i of r.issues.filter(x => x.startsWith("✗"))) console.log("  " + i);
      for (const i of r.issues.filter(x => x.startsWith("⚠"))) console.log("  " + i);
    }
  }

  // Report
  let md = `# Audit BC/HBP Service Posts — ${TODAY}\n\n`;
  md += `| Bài | Từ | Ảnh | FAQ | Link | H2 | Byline | Critical |\n|---|---|---|---|---|---|---|---|\n`;
  for (const r of results) {
    if (r.error) { md += `| ${r.name} | ERROR | | | | | | |\n`; continue; }
    const faq  = r.passes?.some(p => p.includes("FAQ")) ? "✓" : "✗";
    const link = r.passes?.some(p => p.includes("Link")) ? "✓" : "✗";
    const h2   = r.passes?.some(p => p.includes("H2")) ? "✓" : "✗";
    const byl  = r.passes?.some(p => p.includes("Author")) ? "✓" : "✗";
    md += `| ${r.name} | ${r.words} | ${r.imgs} | ${faq} | ${link} | ${h2} | ${byl} | ${r.criticalCount} |\n`;
  }
  if (critical.length > 0) {
    md += `\n## Backlog Fix\n\n`;
    for (const r of critical) {
      md += `### [${r.id}] ${r.name}\n`;
      for (const i of r.issues?.filter(x => x.startsWith("✗")) ?? []) md += `- **${i}**\n`;
      for (const i of r.issues?.filter(x => x.startsWith("⚠")) ?? []) md += `- ${i}\n`;
      md += "\n";
    }
  } else {
    md += `\n_Tất cả 9 bài đạt tiêu chí — không cần sửa._\n`;
  }

  const path = `${REPORT_DIR}\\audit-bc-hbp-service-${TODAY}.md`;
  writeFileSync(path, md, "utf8");
  console.log(`\nReport: ${path}`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
