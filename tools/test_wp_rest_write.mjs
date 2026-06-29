/**
 * Test WP REST API write capabilities - update + plugin list
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) {
  const e = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return e;
}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");

function wpReq(method, urlPath, bodyObj) {
  return new Promise((resolve, reject) => {
    const body = bodyObj ? Buffer.from(JSON.stringify(bodyObj), "utf8") : null;
    const headers = { Host: WP_HOST, Authorization: auth };
    if (body) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = body.length;
    }
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path: urlPath, method, headers, rejectUnauthorized: false };
    const r = https.request(opts, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => { try { resolve({ s: resp.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: resp.statusCode, d }); } });
    });
    r.on("error", reject); r.setTimeout(20000, () => r.destroy(new Error("timeout")));
    if (body) r.write(body); r.end();
  });
}

// Test 1: GET plugin list
console.log("=== Test 1: GET plugins ===");
const plugins = await wpReq("GET", "/wp-json/wp/v2/plugins?per_page=20&_fields=plugin,name,status");
console.log("Status:", plugins.s);
if (Array.isArray(plugins.d)) {
  for (const p of plugins.d) {
    if (p.plugin?.includes("ttcqn")) console.log(" *", p.plugin, p.status);
  }
  console.log("Total active TTCQN plugins:", plugins.d.filter(p => p.plugin?.includes("ttcqn")).length);
} else {
  console.log("Response:", JSON.stringify(plugins.d).slice(0, 300));
}

// Test 2: GET current plugin content of our redirect plugin
console.log("\n=== Test 2: Check redirect plugin active ===");
const pluginCheck = await wpReq("GET", "/wp-json/wp/v2/plugins/ttcqn-seo-cleanup-redirects%2Fttcqn-seo-cleanup-redirects");
console.log("Status:", pluginCheck.s);
console.log("Plugin:", JSON.stringify(pluginCheck.d).slice(0, 300));
