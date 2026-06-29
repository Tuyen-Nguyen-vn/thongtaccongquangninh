/**
 * Thêm internal link còn thiếu vào 2 landing chính:
 *   - hut-be-phot-quang-ninh (ID 26): +3 informational + 3 county
 *   - thong-tac-cong-quang-ninh (ID 35): +5 ward/area pages
 * Chèn trước author byline nếu có, hoặc append cuối.
 *
 * Usage:
 *   node tools/add_internal_links_to_landings.mjs          ← dry-run
 *   node tools/add_internal_links_to_landings.mjs --write
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const BASE = "https://thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";
const MARKER = "ttcqn-author-nguyen-song-hao";
const WRITE = process.argv.includes("--write");

// ── Sections to inject ───────────────────────────────────────────────────────

const HBP_COUNTY_SECTION = `
<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Hút bể phốt các huyện Quảng Ninh</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Ngoài các thành phố lớn, đội xe bồn còn phục vụ toàn tỉnh: <a href="${BASE}/hut-be-phot-mong-cai/">hút bể phốt Móng Cái</a>, <a href="${BASE}/hut-be-phot-dong-trieu/">hút bể phốt Đông Triều</a>, <a href="${BASE}/hut-be-phot-van-don/">hút bể phốt Vân Đồn</a> — đặt lịch hôm nay, có mặt trong ngày.</p>
<!-- /wp:paragraph -->`.trimStart();

const HBP_INFO_SECTION = `
<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Tài liệu về hút bể phốt</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Tìm hiểu thêm: <a href="${BASE}/chi-phi-hut-be-phot-quang-ninh/">chi phí hút bể phốt Quảng Ninh</a> tính theo m³ và loại bể — <a href="${BASE}/chu-ky-hut-be-phot/">chu kỳ hút bể phốt bao lâu một lần</a> — <a href="${BASE}/dau-hieu-be-phot-bi-day-2026/">dấu hiệu bể phốt bị đầy</a> cần xử lý ngay.</p>
<!-- /wp:paragraph -->`.trimStart();

const TTC_WARD_SECTION = `
<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Thông tắc cống các phường Hạ Long và huyện lân cận</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p>Phục vụ chi tiết từng khu vực: <a href="${BASE}/thong-tac-cong-bai-chay/">thông tắc cống Bãi Cháy</a>, <a href="${BASE}/thong-tac-cong-cao-xanh/">thông tắc cống Cao Xanh</a>, <a href="${BASE}/thong-tac-cong-tuan-chau/">thông tắc cống Tuần Châu</a>, <a href="${BASE}/thong-tac-cong-gieng-day/">thông tắc cống Giếng Đáy</a>, <a href="${BASE}/thong-tac-cong-dong-trieu/">thông tắc cống Đông Triều</a>.</p>
<!-- /wp:paragraph -->`.trimStart();

const UPDATES = [
  {
    id: 26, restBase: "pages", slug: "hut-be-phot-quang-ninh",
    sections: [HBP_COUNTY_SECTION, HBP_INFO_SECTION],
    label: "HBP Quảng Ninh",
  },
  {
    id: 35, restBase: "pages", slug: "thong-tac-cong-quang-ninh",
    sections: [TTC_WARD_SECTION],
    label: "TTC Quảng Ninh",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

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
        Host: WP_HOST, Authorization: auth, "User-Agent": "internal-link/1.0",
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

function insertBeforeAuthor(content, newSections) {
  const authorIdx = content.indexOf(`<!-- wp:paragraph {"className":"${MARKER}`);
  const insertion = "\n" + newSections.join("\n") + "\n";
  if (authorIdx !== -1) {
    return content.slice(0, authorIdx) + insertion + content.slice(authorIdx);
  }
  return content + insertion;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log(`=== Add Internal Links to Landings (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);

  const results = [];
  for (const u of UPDATES) {
    console.log(`--- ${u.label} (ID ${u.id}) ---`);

    const r = await request("GET", `/wp/v2/${u.restBase}/${u.id}?context=edit`, auth);
    if (r.status !== 200) { console.log(`  ERROR ${r.status}`); continue; }

    const original = r.data?.content?.raw ?? "";
    console.log(`  Original: ${original.length} chars`);

    // Check for already-present links
    const alreadyPresent = u.sections.filter(s => {
      // Extract first href from section and check if it's in content
      const m = s.match(/href="[^"]+\/([^/"]+)\/"/);
      return m && original.includes(`/${m[1]}/`);
    });
    if (alreadyPresent.length === u.sections.length) {
      console.log("  All sections already present, skipping.\n");
      continue;
    }

    const sectionsToAdd = u.sections.filter(s => {
      const m = s.match(/href="[^"]+\/([^/"]+)\/"/);
      return !(m && original.includes(`/${m[1]}/`));
    });

    const newContent = insertBeforeAuthor(original, sectionsToAdd);
    console.log(`  New: ${newContent.length} chars (+${newContent.length - original.length})`);
    console.log(`  Adding ${sectionsToAdd.length} section(s)`);

    if (WRITE) {
      const w = await request("POST", `/wp/v2/${u.restBase}/${u.id}`, auth, { content: newContent });
      const ok = w.status === 200;
      console.log(`  Update: ${ok ? "✓ 200" : `✗ ${w.status}`}`);
      results.push({ slug: u.slug, ok, chars: newContent.length });
    } else {
      // Preview first 3 links to be added
      for (const s of sectionsToAdd) {
        const links = [...s.matchAll(/href="([^"]+)"[^>]*>([^<]+)</g)].map(m => `  ${m[2]} → ${m[1]}`);
        console.log("  Links to add:\n" + links.join("\n"));
      }
      results.push({ slug: u.slug, dryRun: true });
    }
    console.log();
  }

  if (WRITE && results.some(r => r.ok)) {
    const done = results.filter(r => r.ok).length;
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},INTERNAL-LINKS-${TODAY},seo_fix,add internal links to landing pages,${BASE},,done,medium,,,,,Added missing internal links to HBP+TTC main landings: county pages + informational + ward pages,tools/add_internal_links_to_landings.mjs,,Verify links live; check GSC link graph,slugs=${results.map(r=>r.slug).join(',')},,,,,,`,
      "utf8"
    );
    console.log(`${done}/${results.length} pages updated. Logged to SEO_PROGRESS.csv`);
  } else if (!WRITE) {
    console.log("[DRY-RUN] Pass --write to apply changes.");
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
