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

function req(path, body) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(JSON.stringify(body), "utf8");
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method: "POST",
      headers: { Host: WP_HOST, Authorization: auth, "Content-Type": "application/json", "Content-Length": buf.length },
      rejectUnauthorized: false,
    };
    const r = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    r.on("error", reject);
    r.setTimeout(20000, () => r.destroy(new Error("timeout")));
    r.write(buf); r.end();
  });
}

// Test với post 35 (thong-tac-cong-quang-ninh)
const NEW_DESC = "Thông tắc cống Quảng Ninh 24/7 bằng máy lò xo, xử lý nước trào, mùi hôi, cống nghẹt, không đục phá khi chưa cần. Gọi 0963.953.533. Có mặt 15 phút, bảo hành.";
console.log(`Desc length: ${[...NEW_DESC].length}`);

const r1 = await req("/wp-json/rankmath/v1/updateMeta", {
  objectType: "post", objectID: 35,
  meta: { rank_math_description: NEW_DESC },
});
console.log("Rank Math API response:", r1.status, r1.body);

// Also try WP REST API meta endpoint
function get(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth },
      rejectUnauthorized: false,
    };
    const r = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    r.on("error", reject);
    r.setTimeout(20000, () => r.destroy(new Error("timeout")));
    r.end();
  });
}

const r2 = await get("/wp-json/wp/v2/posts/35?_fields=meta&context=edit");
console.log("WP post meta:", r2.status, r2.body.slice(0, 300));
