/**
 * Thêm author byline cho các page thiếu (386, 2025).
 * Usage:
 *   node tools/fix_missing_author_byline.mjs          ← dry-run
 *   node tools/fix_missing_author_byline.mjs --write
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const WRITE = process.argv.includes("--write");

const MARKER      = "ttcqn-author-nguyen-song-hao";
const AUTHOR_NAME = "Nguyễn Song Hào";
const AUTHOR_URL  = "https://thongtaccongquangninh.com/author/nguyensonghao/";

const TARGETS = [
  { id: 386,  restBase: "pages", slug: "nguyen-nhan-cong-tac-thuong-xuyen-ha-long" },
  { id: 2025, restBase: "pages", slug: "chi-phi-hut-be-phot-quang-ninh" },
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
        Host: WP_HOST, Authorization: auth, "User-Agent": "author-fix/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
      },
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
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
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

function insertByline(content, byline) {
  const idx = content.indexOf(`<!-- wp:paragraph {"className":"${MARKER}`);
  if (idx !== -1) return content; // đã có
  return content + byline;
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  console.log(`=== Fix Missing Author Byline (${WRITE ? "WRITE" : "DRY-RUN"}) ===\n`);

  for (const t of TARGETS) {
    console.log(`[${t.id}] ${t.slug}`);
    const r = await request("GET", `/wp/v2/${t.restBase}/${t.id}?context=edit`, auth);
    if (r.status !== 200) { console.log(`  ERROR ${r.status}\n`); continue; }

    const content  = r.data?.content?.raw ?? "";
    const modified = r.data?.modified ?? new Date().toISOString();

    if (content.includes(MARKER)) {
      console.log("  ✓ Đã có byline — bỏ qua\n");
      continue;
    }

    const byline  = buildByline(modified);
    const newContent = insertByline(content, byline);

    if (!WRITE) {
      console.log(`  ✗ Thiếu byline → sẽ thêm vào cuối bài`);
      console.log(`  Preview: "${byline.replace(/<[^>]+>/g,"").trim().slice(0,80)}"\n`);
      continue;
    }

    const w = await request("POST", `/wp/v2/${t.restBase}/${t.id}`, auth, { content: newContent });
    console.log(`  Update: ${w.status === 200 ? "✓ 200" : `✗ ${w.status}`}\n`);
    await new Promise(r => setTimeout(r, 300));
  }

  if (!WRITE) console.log("[DRY-RUN] Pass --write to apply.");
}

main().catch(e => { console.error(e.stack ?? e.message); process.exit(1); });
