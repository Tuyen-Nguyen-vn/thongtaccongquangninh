import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
}
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

function fetch_(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const buf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method,
      headers: { Host: WP_HOST, Authorization: auth, Accept: "application/json",
        ...(buf ? { "Content-Type": "application/json", "Content-Length": buf.length } : {}),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("timeout")));
    if (buf) req.write(buf);
    req.end();
  });
}

// Check post 35 via WP REST API
const r1 = await fetch_("/wp-json/wp/v2/posts/35");
const post = JSON.parse(r1.body);
console.log("Post type:", post.type, "| status:", post.status);
console.log("Excerpt:", post.excerpt?.rendered?.slice(0, 100));

// Try updating meta via PATCH
const r2 = await fetch_("/wp-json/wp/v2/posts/35", "POST", {
  meta: {
    rank_math_description: "Thông tắc cống Quảng Ninh 24/7 bằng máy lò xo, xử lý nước trào, mùi hôi, cống nghẹt, không đục phá khi chưa cần. Gọi 0963.953.533. Có mặt 15 phút, bảo hành.",
  }
});
console.log("PATCH response:", r2.status, r2.body.slice(0, 200));
