import { readFileSync } from "node:fs";
import https from "node:https";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";
const AUDIT_JSON = "D:\\.thongtaccongquangninh\\wp-url-audit-list.json";

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
      headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "meta-check/1.0" },
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
    req.setTimeout(20000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

  const raw = JSON.parse(readFileSync(AUDIT_JSON, "utf8"));
  const entries = raw.entries ?? [];

  console.log(`Scanning ${entries.length} entries for focus keyword...`);

  const queryKeyword = "thông tắc cống Quảng Ninh".toLowerCase();

  for (const e of entries) {
    if (e.status !== "publish" && e.status !== "draft") continue;
    
    // Fetch Rank Math meta
    const r = await request(`/rankmath/v1/getObjectSeo?objectType=post&objectID=${e.id}`, auth);
    if (r.status === 200) {
      const kw = (r.data?.data?.rank_math_focus_keyword ?? "").toLowerCase();
      if (kw.includes(queryKeyword)) {
        console.log(`MATCH found: [ID ${e.id}] Slug: ${e.slug} | Type: ${e.post_type} | Status: ${e.status} | Focus Keyword: "${r.data?.data?.rank_math_focus_keyword}"`);
      }
    }
    // sleep a bit to avoid hitting rate limits
    await new Promise(res => setTimeout(res, 50));
  }
  console.log("Scan complete.");
}

main().catch(e => console.error(e));
