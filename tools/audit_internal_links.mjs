/**
 * Audit internal links on main landing pages.
 * Checks which service/area/informational pages are linked from the landing pages.
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const BASE = "https://thongtaccongquangninh.com";

const LANDINGS = [
  { id: 26,  restBase: "pages", slug: "hut-be-phot-quang-ninh",     label: "HBP Quảng Ninh (main)" },
  { id: 35,  restBase: "pages", slug: "thong-tac-cong-quang-ninh",  label: "TTC Quảng Ninh (main)" },
];

// Links we WANT to exist on each landing (slug → anchor text)
const WANT_ON_HBP = {
  "chi-phi-hut-be-phot-quang-ninh":  "Chi phí hút bể phốt Quảng Ninh",
  "chu-ky-hut-be-phot":              "Chu kỳ hút bể phốt bao lâu?",
  "dau-hieu-be-phot-bi-day-2026":    "Dấu hiệu bể phốt bị đầy",
  "hut-be-phot-ha-long":             "Hút bể phốt Hạ Long",
  "hut-be-phot-cam-pha":             "Hút bể phốt Cẩm Phả",
  "hut-be-phot-uong-bi":             "Hút bể phốt Uông Bí",
  "hut-be-phot-mong-cai":            "Hút bể phốt Móng Cái",
  "hut-be-phot-dong-trieu":          "Hút bể phốt Đông Triều",
  "hut-be-phot-van-don":             "Hút bể phốt Vân Đồn",
};

const WANT_ON_TTC = {
  "thong-tac-cong-ha-long":          "Thông tắc cống Hạ Long",
  "thong-tac-cong-bai-chay":         "Thông tắc cống Bãi Cháy",
  "thong-tac-cong-cao-xanh":         "Thông tắc cống Cao Xanh",
  "thong-tac-cong-tuan-chau":        "Thông tắc cống Tuần Châu",
  "thong-tac-cong-gieng-day":        "Thông tắc cống Giếng Đáy",
  "thong-tac-cong-cam-pha":          "Thông tắc cống Cẩm Phả",
  "thong-tac-cong-uong-bi":          "Thông tắc cống Uông Bí",
  "thong-tac-cong-dong-trieu":       "Thông tắc cống Đông Triều",
  "thong-tac-cong-mong-cai":         "Thông tắc cống Móng Cái",
};

const WANT_MAP = { "hut-be-phot-quang-ninh": WANT_ON_HBP, "thong-tac-cong-quang-ninh": WANT_ON_TTC };

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
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "link-audit/1.0" },
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

function extractInternalLinks(content) {
  const links = new Map(); // slug → [anchor texts]
  const re = /href=["'](https?:\/\/thongtaccongquangninh\.com\/([^"'/]+)\/?)["'][^>]*>([^<]*)</gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    const slug = m[2].replace(/\/$/, "");
    const anchor = m[3].trim();
    if (!links.has(slug)) links.set(slug, []);
    links.get(slug).push(anchor);
  }
  return links;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  console.log("=== Internal Link Audit ===\n");

  for (const landing of LANDINGS) {
    console.log(`${"=".repeat(60)}`);
    console.log(`${landing.label}`);
    console.log("=".repeat(60));

    const r = await wpGet(`/wp/v2/${landing.restBase}/${landing.id}?context=edit`, auth);
    if (r.status !== 200) { console.log(`  ERROR ${r.status}`); continue; }

    const content = r.data?.content?.raw ?? "";
    console.log(`  Content: ${content.length} chars`);

    const links = extractInternalLinks(content);
    const wantMap = WANT_MAP[landing.slug] ?? {};

    console.log(`\n  Internal links found (${links.size} unique slugs):`);
    for (const [slug, anchors] of links) {
      console.log(`    ✓ /${slug}/ → "${anchors[0]}"`);
    }

    console.log(`\n  Gaps (wanted but missing):`);
    let gapCount = 0;
    for (const [slug, anchor] of Object.entries(wantMap)) {
      if (!links.has(slug)) {
        console.log(`    ✗ /${slug}/ — "${anchor}"`);
        gapCount++;
      }
    }
    if (gapCount === 0) console.log("    (none — all wanted links present)");
    console.log();
  }
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
