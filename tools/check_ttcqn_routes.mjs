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

function wpGet(path) {
  return new Promise((res, rej) => {
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST, path, method: "GET",
      headers: { Host: WP_HOST, Authorization: auth }, rejectUnauthorized: false };
    const r = https.request(opts, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => { try { res(JSON.parse(d)); } catch { res(d); } });
    });
    r.on("error", rej); r.setTimeout(20000, () => r.destroy(new Error("t"))); r.end();
  });
}

const root = await wpGet("/wp-json/");
const routes = Object.keys(root.routes || {});

// Show all ttcqn and mcp-adapter routes
console.log("TTCQN/v1 routes:");
routes.filter(r => r.startsWith("/ttcqn")).forEach(r => {
  const methods = (root.routes[r].endpoints || []).flatMap(e => e.methods).join(", ");
  console.log(" ", r, "→", methods);
});

console.log("\nMCP Adapter routes:");
routes.filter(r => r.includes("mcp-adapter")).forEach(r => {
  const methods = (root.routes[r].endpoints || []).flatMap(e => e.methods).join(", ");
  console.log(" ", r, "→", methods);
});

// Try GET /ttcqn/v1/
const ttcqn = await wpGet("/wp-json/ttcqn/v1/");
console.log("\n/ttcqn/v1/ response:", JSON.stringify(ttcqn).slice(0, 400));
