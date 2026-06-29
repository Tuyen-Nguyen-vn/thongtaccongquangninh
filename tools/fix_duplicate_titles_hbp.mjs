/**
 * Fix near-duplicate HBP county page titles (Jaccard ≥ 0.6)
 * Differentiates by local geography/intent, ≤ 60 chars each.
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const CSV_PATH = "D:\\.thongtaccongquangninh\\docs\\SEO_PROGRESS.csv";

const UPDATES = [
  // Pages
  {
    id: 55, restBase: "pages", slug: "hut-be-phot-mong-cai",
    oldTitle: "Hút Bể Phốt Móng Cái 24/7 – Giá Rẻ Không Đục Phá",
    newTitle:  "Hút Bể Phốt Móng Cái – Xe Bồn Cửa Khẩu, Phục Vụ 24/7",
    reason: "differentiate vs Đông Triều: highlight cửa khẩu biên giới",
  },
  {
    id: 56, restBase: "pages", slug: "hut-be-phot-dong-trieu",
    oldTitle: "Hút Bể Phốt Đông Triều 24/7 – Giá Rẻ Không Đục Phá",
    newTitle:  "Hút Bể Phốt Đông Triều 24/7 – Xe Bồn Vào Khu Công Nghiệp",
    reason: "differentiate vs Móng Cái: highlight khu công nghiệp",
  },
  // Posts
  {
    id: 2050, restBase: "posts", slug: "hut-be-phot-dam-ha",
    oldTitle: "Hút bể phốt Đầm Hà Quảng Ninh 24/7 – Xe đến tận nơi",
    newTitle:  "Hút Bể Phốt Đầm Hà Quảng Ninh – Xe Vào Vùng Ven Biển 24/7",
    reason: "differentiate vs Tiên Yên (same suffix): highlight ven biển",
  },
  {
    id: 2051, restBase: "posts", slug: "hut-be-phot-hai-ha",
    oldTitle: "Hút bể phốt Hải Hà Quảng Ninh 24/7 – Xe đến tận huyện",
    newTitle:  "Hút Bể Phốt Hải Hà Quảng Ninh – Xe Bồn Ven Biển 24/7",
    reason: "differentiate generic suffix: highlight coastal location",
  },
  {
    id: 2052, restBase: "posts", slug: "hut-be-phot-tien-yen",
    oldTitle: "Hút bể phốt Tiên Yên Quảng Ninh 24/7 – Xe đến tận nơi",
    newTitle:  "Hút Bể Phốt Tiên Yên Quảng Ninh – Xe Đến Thị Trấn 24/7",
    reason: "differentiate vs Đầm Hà (same suffix): highlight thị trấn",
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

function wpPost(path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(JSON.stringify(body), "utf8");
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method: "POST",
      headers: {
        Host: WP_HOST, Authorization: auth,
        "Content-Type": "application/json", "Content-Length": bodyBuf.length,
        "User-Agent": "title-fix/1.0",
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
    req.setTimeout(25000, () => req.destroy(new Error("timeout")));
    req.write(bodyBuf);
    req.end();
  });
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const TODAY = new Date().toISOString().slice(0, 10);
  const TIME  = new Date().toTimeString().slice(0, 5);

  console.log("=== Fix Near-Duplicate HBP County Titles ===\n");

  const results = [];
  for (const u of UPDATES) {
    process.stdout.write(`[${u.id}] ${u.slug} ... `);
    const chars = [...u.newTitle].length;
    if (chars > 65) { console.log(`SKIP (${chars} chars too long)`); continue; }

    const r = await wpPost(`/wp/v2/${u.restBase}/${u.id}`, auth, {
      title: u.newTitle,
    });

    const ok = r.status === 200;
    const liveTitle = r.data?.title?.rendered ?? r.data?.title?.raw ?? "(unknown)";
    console.log(ok
      ? `✓ ${r.status} → "${liveTitle.replace(/&#8211;/g, '–').slice(0, 60)}"`
      : `✗ ${r.status}: ${JSON.stringify(r.data).slice(0, 100)}`
    );
    results.push({ ...u, status: r.status, ok });
    await new Promise(r => setTimeout(r, 400));
  }

  // Log to CSV
  const done = results.filter(r => r.ok).length;
  appendFileSync(CSV_PATH,
    `\n${TODAY},${TIME},TITLE-DEDUP-HBP-${TODAY},seo_fix,fix near-duplicate titles HBP county pages,https://thongtaccongquangninh.com,,${done === results.length ? "done" : "partial"},medium,,,,,Rewrote ${done}/${results.length} titles (Jaccard≥0.6 pairs),tools/fix_duplicate_titles_hbp.mjs,,Verify Rank Math title update; check GSC impressions 14d,IDs=${results.map(r=>r.id).join(',')},,,,,,`,
    "utf8"
  );

  console.log(`\n${done}/${results.length} titles updated. Logged to SEO_PROGRESS.csv`);
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
