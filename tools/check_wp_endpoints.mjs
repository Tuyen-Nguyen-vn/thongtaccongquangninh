import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}
function req(path, auth) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/wp-json" + path, method: "GET", headers: { Host: WP_HOST, Authorization: auth, "User-Agent": "check/1.0" }, rejectUnauthorized: false };
    const r = https.request(opts, res => { let d = ""; res.on("data", c => d += c); res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, data: d }); } }); });
    r.on("error", reject);
    r.setTimeout(15000, () => r.destroy(new Error("timeout")));
    r.end();
  });
}
(async () => {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  // Check custom namespaces
  const r = await req("/", auth);
  if (r.status === 200 && r.data?.namespaces) {
    console.log("Namespaces:", r.data.namespaces.join(", "));
    // Look for ttcqn or custom endpoints
    const custom = r.data.namespaces.filter(n => !["wp/v2","oembed/1.0","rankmath/v1","yoast/v1"].includes(n));
    console.log("Custom:", custom.join(", ") || "(none)");
  }
})().catch(e => console.error(e.message));
