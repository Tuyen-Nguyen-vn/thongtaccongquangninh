/**
 * Audit + add internal links to thong-tac-bon-cau-quang-ninh (page ID 37).
 * Usage:
 *   node tools/fix_bon_cau_internal_links.mjs          ← audit + dry-run
 *   node tools/fix_bon_cau_internal_links.mjs --write  ← apply
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const BASE = "https://thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const MARKER = "ttcqn-author-nguyen-song-hao";
const PAGE_ID = 37;
const WRITE = process.argv.includes("--write");

// Links we want on BC landing
const WANT = {
  "thong-tac-bon-cau-ha-long":          "thông tắc bồn cầu Hạ Long",
  "thong-tac-bon-cau-cam-pha":          "thông tắc bồn cầu Cẩm Phả",
  "thong-tac-bon-cau-uong-bi":          "thông tắc bồn cầu Uông Bí",
  "thong-tac-bon-cau-mong-cai":         "thông tắc bồn cầu Móng Cái",
  "thong-tac-bon-cau-dong-trieu":       "thông tắc bồn cầu Đông Triều",
  "thong-tac-bon-cau-van-don":          "thông tắc bồn cầu Vân Đồn",
  "gia-thong-tac-bon-cau-quang-ninh":   "giá thông tắc bồn cầu Quảng Ninh",
  "thong-tac-bon-cau-khan-cap-quang-ninh": "thông tắc bồn cầu khẩn cấp",
};

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
        Host: WP_HOST, Authorization: auth, "User-Agent": "bc-link-fix/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
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
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function extractLinks(content) {
  const slugs = new Set();
  for (const m of content.matchAll(/href="https?:\/\/thongtaccongquangninh\.com\/([^"\/]+)\//g)) {
    slugs.add(m[1]);
  }
  return slugs;
}

function insertBeforeAuthor(content, section) {
  const idx = content.indexOf(`<!-- wp:paragraph {"className":"${MARKER}`);
  const ins = "\n" + section + "\n";
  return idx !== -1 ? content.slice(0, idx) + ins + content.slice(idx) : content + ins;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  console.log(`=== BC Landing Internal Links (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);

  const r = await request("GET", `/wp/v2/pages/${PAGE_ID}?context=edit`, auth);
  if (r.status !== 200) { console.error(`ERROR ${r.status}`); process.exit(1); }

  const content = r.data?.content?.raw ?? "";
  console.log(`Slug: ${r.data?.slug}  |  Chars: ${content.length}`);

  const existing = extractLinks(content);
  console.log(`\nExisting links (${existing.size}): ${[...existing].join(", ")}`);

  const missing = Object.entries(WANT).filter(([slug]) => !existing.has(slug));
  const present = Object.entries(WANT).filter(([slug]) => existing.has(slug));

  console.log(`\nPresent (${present.length}):`);
  for (const [s, a] of present) console.log(`  ✓ /${s}/ — "${a}"`);

  console.log(`\nMissing (${missing.length}):`);
  for (const [s, a] of missing) console.log(`  ✗ /${s}/ — "${a}"`);

  if (missing.length === 0) { console.log("\nAll links present. Nothing to do."); return; }

  // Build section: split into area links + informational links
  const areaLinks  = missing.filter(([s]) => !s.includes("gia-") && !s.includes("khan-cap"));
  const infoLinks  = missing.filter(([s]) => s.includes("gia-") || s.includes("khan-cap"));

  let section = "";
  if (areaLinks.length > 0) {
    const linkStr = areaLinks.map(([s, a]) => `<a href="${BASE}/${s}/">${a}</a>`).join(", ");
    section += `<!-- wp:heading {"level":2} -->\n<h2 class="wp-block-heading">Thông tắc bồn cầu các khu vực Quảng Ninh</h2>\n<!-- /wp:heading -->\n`;
    section += `<!-- wp:paragraph -->\n<p>Phục vụ toàn tỉnh: ${linkStr} — thợ đến nhanh trong ngày, không đục phá, bảo hành 12 tháng.</p>\n<!-- /wp:paragraph -->\n`;
  }
  if (infoLinks.length > 0) {
    const linkStr = infoLinks.map(([s, a]) => `<a href="${BASE}/${s}/">${a}</a>`).join(" — ");
    section += `<!-- wp:paragraph -->\n<p>Xem thêm: ${linkStr}.</p>\n<!-- /wp:paragraph -->\n`;
  }

  const newContent = insertBeforeAuthor(content, section.trimEnd());
  console.log(`\nNew content: ${newContent.length} chars (+${newContent.length - content.length})`);

  if (!WRITE) { console.log("\n[DRY-RUN] Pass --write to apply."); return; }

  const w = await request("POST", `/wp/v2/pages/${PAGE_ID}`, auth, { content: newContent });
  const ok = w.status === 200;
  console.log(`\nUpdate: ${ok ? "✓ 200 OK" : `✗ ${w.status}`}`);

  if (ok) {
    const TODAY = new Date().toISOString().slice(0, 10);
    const TIME  = new Date().toTimeString().slice(0, 5);
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},BC-INTERNAL-LINKS-${TODAY},seo_fix,add internal links to BC landing,${BASE}/thong-tac-bon-cau-quang-ninh/,,done,medium,,,,,Added ${missing.length} missing links to BC landing (area + info),tools/fix_bon_cau_internal_links.mjs,,Verify live links on BC landing,,,,,,`,
      "utf8"
    );
    console.log("Logged to SEO_PROGRESS.csv");
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
