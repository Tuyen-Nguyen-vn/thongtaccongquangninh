import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
}
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

const POST_ID = 384;
const NEW_TITLE = "Thông Tắc Cống Ngõ Nhỏ Hạ Long – Xử Lý Nhanh | 0963.953.533";
console.log(`Title (${[...NEW_TITLE].length}): ${NEW_TITLE}`);

function rmPost(body) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(JSON.stringify(body), "utf8");
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json/rankmath/v1/updateMeta", method: "POST",
      headers: {
        Host: WP_HOST, Authorization: auth,
        "Content-Type": "application/json", "Content-Length": buf.length,
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.write(buf); req.end();
  });
}

const r = await rmPost({
  objectType: "post",
  objectID: POST_ID,
  meta: { rank_math_title: NEW_TITLE },
});
const ok = r.status === 200 && r.data?.slug === true;
console.log(ok ? `✅ [${POST_ID}] title updated` : `❌ [${POST_ID}] ${r.status}: ${JSON.stringify(r.data).slice(0, 100)}`);

appendFileSync("docs/SEO_PROGRESS.csv",
  `\n2026-06-10,title_short_fix,fix_title_post_384,${ok?"done":"fail"},"TITLE_SHORT(47)→59 via rankmath/v1/updateMeta",re-audit`,
  "utf8"
);
