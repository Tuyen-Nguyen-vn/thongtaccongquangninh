/**
 * Audit Rank Math SEO score + key meta cho các landing chính.
 * Đọc từ WP REST context=edit (trả về rank_math_* meta).
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

const TARGETS = [
  { id: 26,   restBase: "pages", slug: "hut-be-phot-quang-ninh",         label: "HBP Quảng Ninh" },
  { id: 35,   restBase: "pages", slug: "thong-tac-cong-quang-ninh",      label: "TTC Quảng Ninh" },
  { id: 37,   restBase: "pages", slug: "thong-tac-bon-cau-quang-ninh",   label: "BC Quảng Ninh" },
  { id: 2559, restBase: "posts", slug: "hut-ham-cau-quang-ninh-2026",    label: "HHC QN 2026" },
  { id: 38,   restBase: "pages", slug: "nao-vet-ho-ga-quang-ninh",       label: "NVHG Quảng Ninh" },
];

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function wpGet(path, auth) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "rm-audit/1.0" },
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
    req.end();
  });
}

function scoreLabel(score) {
  if (!score || score === 0) return "❓ (no score)";
  if (score >= 80) return `✅ ${score}`;
  if (score >= 70) return `⚠️  ${score}`;
  return `❌ ${score}`;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  console.log("=== Rank Math Score Audit — 5 Landing Chính ===\n");
  console.log(("Landing").padEnd(28) + " Score  Focus KW                    Title len  Desc len  Canonical");
  console.log("-".repeat(110));

  const issues = [];

  for (const t of TARGETS) {
    const r = await wpGet(`/wp/v2/${t.restBase}/${t.id}?context=edit`, auth);
    if (r.status !== 200) { console.log(`${t.label}: ERROR ${r.status}`); continue; }

    const meta  = r.data?.meta ?? {};
    const score = meta.rank_math_seo_score ?? meta.rank_math_score ?? 0;
    const kw    = meta.rank_math_focus_keyword ?? "(none)";
    const title = meta.rank_math_title ?? r.data?.title?.rendered ?? "";
    const desc  = meta.rank_math_description ?? "";
    const canon = meta.rank_math_canonical_url ?? "";
    const robots= meta.rank_math_robots ?? "";
    const content = r.data?.content?.raw ?? "";

    const titleLen = [...title].length;
    const descLen  = [...desc].length;

    const row = [
      t.label.padEnd(28),
      scoreLabel(score).padEnd(8),
      kw.slice(0, 28).padEnd(28),
      String(titleLen || "(RM default)").padEnd(10),
      String(descLen  || "(RM default)").padEnd(10),
      canon || "(self)",
    ].join(" ");
    console.log(row);

    // Collect issues
    const pageIssues = [];
    if (!score || score < 80) pageIssues.push(`score=${score} <80`);
    if (!kw || kw === "(none)") pageIssues.push("no focus KW");
    if (!desc || descLen < 100) pageIssues.push(`desc short (${descLen} chars)`);
    if (!title || titleLen < 30) pageIssues.push(`title short (${titleLen} chars)`);
    if (robots && robots.includes("noindex")) pageIssues.push("⚠ noindex!");
    if (pageIssues.length) issues.push({ label: t.label, slug: t.slug, issues: pageIssues });
  }

  if (issues.length) {
    console.log("\n=== Issues ===");
    for (const i of issues) {
      console.log(`\n${i.label} (/${i.slug}/):`);
      for (const issue of i.issues) console.log(`  → ${issue}`);
    }
  } else {
    console.log("\n✅ All pages pass Rank Math checks.");
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
