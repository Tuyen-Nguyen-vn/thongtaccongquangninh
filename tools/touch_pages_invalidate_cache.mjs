/**
 * Touch key pages via WP REST API to invalidate LiteSpeed cache
 * Needed after plugin update to force fresh HTML generation with BreadcrumbList
 * Usage: node tools/touch_pages_invalidate_cache.mjs
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const PROJECT = "D:\\.thongtaccongquangninh";
const ENV_PATH =
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

// Pages to touch: {id, type, label}
const PAGES_TO_TOUCH = [
  { id: 296, type: "pages", label: "TTC Hạ Long" },
  { id: 35,  type: "pages", label: "TTC Quảng Ninh (main)" },
  { id: 26,  type: "pages", label: "HBP Quảng Ninh (main)" },
  { id: 991, type: "pages", label: "TTC Cao Xanh" },
  { id: 992, type: "pages", label: "TTC Giếng Đáy" },
  { id: 993, type: "pages", label: "TTC Tuần Châu" },
  { id: 61,  type: "pages", label: "Bảng giá" },
  { id: 63,  type: "pages", label: "Liên hệ" },
];

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function httpsRequest(method, wpPath, auth, body = null) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP,
      port: 443,
      servername: WP_HOST,
      path: "/wp-json" + wpPath,
      method,
      headers: {
        Host: WP_HOST,
        Authorization: auth,
        "Content-Type": "application/json",
        "User-Agent": "Codex cache invalidator",
        ...(bodyBuf ? { "Content-Length": bodyBuf.length } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let data;
        try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
        resolve({ status: res.statusCode, data });
      });
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout " + wpPath)));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  // Verify auth
  const me = await httpsRequest("GET", "/wp/v2/users/me", auth);
  if (me.status >= 400) throw new Error("Auth failed: " + me.status);
  console.log(`Auth OK: ${me.data.name}`);
  console.log(`Touching ${PAGES_TO_TOUCH.length} pages to invalidate LiteSpeed cache...\n`);

  for (const page of PAGES_TO_TOUCH) {
    try {
      // GET current content
      const current = await httpsRequest("GET", `/wp/v2/${page.type}/${page.id}?context=edit`, auth);
      if (current.status === 404) {
        console.log(`  SKIP ${page.label} (id=${page.id}) — 404`);
        continue;
      }
      if (current.status >= 400) {
        console.log(`  SKIP ${page.label} (id=${page.id}) — HTTP ${current.status}`);
        continue;
      }

      const rawTitle = current.data?.title?.raw ?? current.data?.title?.rendered ?? "";
      const rawContent = current.data?.content?.raw ?? "";
      const currentStatus = current.data?.status ?? "publish";

      // POST same content back → triggers LiteSpeed purge
      const touched = await httpsRequest("POST", `/wp/v2/${page.type}/${page.id}`, auth, {
        title: rawTitle,
        content: rawContent,
        status: currentStatus,
      });

      if (touched.status >= 400) {
        console.log(`  FAIL ${page.label} (id=${page.id}) — HTTP ${touched.status}: ${touched.data?.message ?? ""}`);
      } else {
        console.log(`  OK   ${page.label} (id=${page.id}) — modified=${touched.data?.modified ?? "?"}`);
      }
    } catch (e) {
      console.log(`  ERR  ${page.label} (id=${page.id}) — ${e.message}`);
    }
  }

  console.log("\nDone. LiteSpeed cache should be invalidated for touched pages.");
  console.log("Now verify live to check if BreadcrumbList appears.");
}

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
