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

function get(path) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth }, rejectUnauthorized: false };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

const IDS = [35, 26, 380, 384, 386, 2589];

// Try posts
const r1 = await get(`/wp-json/wp/v2/posts?include=${IDS.join(",")}&_fields=id,type,slug&per_page=20`);
console.log("posts:", r1.status, r1.body.slice(0, 300));

// Try pages
const r2 = await get(`/wp-json/wp/v2/pages?include=${IDS.join(",")}&_fields=id,type,slug&per_page=20`);
console.log("pages:", r2.status, r2.body.slice(0, 300));

// Try listing registered post types
const r3 = await get("/wp-json/wp/v2/types?_fields=slug,name");
console.log("types:", r3.status, r3.body.slice(0, 500));
