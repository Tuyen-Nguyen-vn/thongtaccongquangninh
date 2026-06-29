import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH = existsSync("/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env")
  ? "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env"
  : "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const REPORT_PATH = join(PROJECT, "WORDPRESS_REST_ROUTES_2026-05-06.json");

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const baseUrl = env.WP_BASE_URL || "https://thongtaccongquangninh.com";
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
const response = await fetch(`${baseUrl}/wp-json/`, {
  headers: { Authorization: auth, "User-Agent": "Codex inspect routes" },
});
const root = await response.json();
const routes = Object.keys(root.routes ?? {}).filter((route) => /mcp|ability|plugin|option|theme/iu.test(route));
const result = { status: response.status, routes };
writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2), "utf8");
console.log(JSON.stringify(result, null, 2));
