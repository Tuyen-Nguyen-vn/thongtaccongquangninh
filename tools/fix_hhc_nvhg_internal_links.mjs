/**
 * Audit + add internal links to:
 *   - hut-ham-cau-quang-ninh-2026 (ID 2559, post)
 *   - nao-vet-ho-ga-quang-ninh    (ID 38,   page)
 *
 * Usage:
 *   node tools/fix_hhc_nvhg_internal_links.mjs          ← dry-run
 *   node tools/fix_hhc_nvhg_internal_links.mjs --write  ← apply
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

const TARGETS = [
  {
    id: 2559, restBase: "posts", slug: "hut-ham-cau-quang-ninh-2026",
    label: "Hút hầm cầu QN 2026",
    want: {
      "hut-be-phot-quang-ninh":        "hút bể phốt Quảng Ninh",
      "chi-phi-hut-be-phot-quang-ninh":"chi phí hút hầm cầu Quảng Ninh",
      "chu-ky-hut-be-phot":            "chu kỳ hút hầm cầu bao lâu",
      "hut-be-phot-ha-long":           "hút hầm cầu Hạ Long",
      "hut-be-phot-cam-pha":           "hút hầm cầu Cẩm Phả",
      "hut-be-phot-uong-bi":           "hút hầm cầu Uông Bí",
      "bang-gia":                      "bảng giá hút hầm cầu",
    },
    buildSection(missing) {
      const area  = missing.filter(([s]) => s.startsWith("hut-be-phot-") && !s.includes("quang-ninh"));
      const info  = missing.filter(([s]) => ["chi-phi-hut-be-phot-quang-ninh","chu-ky-hut-be-phot","bang-gia","hut-be-phot-quang-ninh"].includes(s));
      let sec = "";
      if (area.length) {
        const ls = area.map(([s, a]) => `<a href="${BASE}/${s}/">${a}</a>`).join(", ");
        sec += `<!-- wp:heading {"level":2} -->\n<h2 class="wp-block-heading">Hút hầm cầu các thành phố Quảng Ninh</h2>\n<!-- /wp:heading -->\n`;
        sec += `<!-- wp:paragraph -->\n<p>Đội xe bồn phục vụ toàn tỉnh: ${ls} — gọi <strong>0963.953.533</strong> để đặt lịch trong ngày.</p>\n<!-- /wp:paragraph -->\n`;
      }
      if (info.length) {
        const ls = info.map(([s, a]) => `<a href="${BASE}/${s}/">${a}</a>`).join(" — ");
        sec += `<!-- wp:paragraph -->\n<p>Tham khảo thêm: ${ls}.</p>\n<!-- /wp:paragraph -->\n`;
      }
      return sec.trimEnd();
    },
  },
  {
    id: 38, restBase: "pages", slug: "nao-vet-ho-ga-quang-ninh",
    label: "Nạo vét hố ga QN",
    want: {
      "thong-tac-cong-quang-ninh":  "thông tắc cống Quảng Ninh",
      "hut-be-phot-quang-ninh":     "hút bể phốt Quảng Ninh",
      "xu-ly-mui-hoi-quang-ninh":   "xử lý mùi hôi Quảng Ninh",
      "bang-gia":                   "bảng giá nạo vét hố ga",
      "nao-vet-ho-ga":              "nạo vét hố ga",
    },
    buildSection(missing) {
      const related = missing.filter(([s]) => ["thong-tac-cong-quang-ninh","hut-be-phot-quang-ninh","xu-ly-mui-hoi-quang-ninh"].includes(s));
      const info    = missing.filter(([s]) => ["bang-gia","nao-vet-ho-ga"].includes(s));
      let sec = "";
      if (related.length) {
        const ls = related.map(([s, a]) => `<a href="${BASE}/${s}/">${a}</a>`).join(", ");
        sec += `<!-- wp:heading {"level":2} -->\n<h2 class="wp-block-heading">Dịch vụ liên quan tại Quảng Ninh</h2>\n<!-- /wp:heading -->\n`;
        sec += `<!-- wp:paragraph -->\n<p>Ngoài nạo vét hố ga, đội thợ còn xử lý: ${ls} — gọi <strong>0963.953.533 / 0931.156.756</strong> để được tư vấn.</p>\n<!-- /wp:paragraph -->\n`;
      }
      if (info.length) {
        const ls = info.map(([s, a]) => `<a href="${BASE}/${s}/">${a}</a>`).join(" — ");
        sec += `<!-- wp:paragraph -->\n<p>Tham khảo: ${ls}.</p>\n<!-- /wp:paragraph -->\n`;
      }
      return sec.trimEnd();
    },
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

function request(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: {
        Host: WP_HOST, Authorization: auth, "User-Agent": "link-fix/1.0",
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
  for (const m of content.matchAll(/href="https?:\/\/thongtaccongquangninh\.com\/([^"\/]+)\//g))
    slugs.add(m[1]);
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
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log(`=== HHC + NVHG Internal Links (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);

  const updated = [];

  for (const t of TARGETS) {
    console.log(`--- ${t.label} [${t.restBase}/${t.id}] ---`);

    const r = await request("GET", `/wp/v2/${t.restBase}/${t.id}?context=edit`, auth);
    if (r.status !== 200) { console.log(`  ERROR ${r.status}\n`); continue; }

    const content = r.data?.content?.raw ?? "";
    const existing = extractLinks(content);
    console.log(`  Chars: ${content.length} | Existing links: ${existing.size}`);

    const missing = Object.entries(t.want).filter(([s]) => !existing.has(s));
    const present = Object.entries(t.want).filter(([s]) => existing.has(s));

    for (const [s] of present) console.log(`  ✓ /${s}/`);
    for (const [s] of missing) console.log(`  ✗ /${s}/`);

    if (missing.length === 0) { console.log("  All present.\n"); continue; }

    const section = t.buildSection(missing);
    const newContent = insertBeforeAuthor(content, section);
    console.log(`  → +${newContent.length - content.length} chars`);

    if (WRITE) {
      const w = await request("POST", `/wp/v2/${t.restBase}/${t.id}`, auth, { content: newContent });
      const ok = w.status === 200;
      console.log(`  Update: ${ok ? "✓ 200" : `✗ ${w.status}`}`);
      if (ok) updated.push(t.slug);
    }
    console.log();
  }

  if (WRITE && updated.length) {
    appendFileSync(CSV_PATH,
      `\n${TODAY},${TIME},HHC-NVHG-LINKS-${TODAY},seo_fix,add internal links HHC+NVHG landings,${BASE},,done,medium,,,,,Added missing internal links to hut-ham-cau + nao-vet-ho-ga landings,tools/fix_hhc_nvhg_internal_links.mjs,,Verify live links,,,,,,`,
      "utf8"
    );
    console.log(`Updated: ${updated.join(", ")}. Logged to SEO_PROGRESS.csv`);
  } else if (!WRITE) {
    console.log("[DRY-RUN] Pass --write to apply.");
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
