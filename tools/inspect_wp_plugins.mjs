import { readFileSync, writeFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const REPORT_PATH = "D:\\.thongtaccongquangninh\\WORDPRESS_PLUGINS_2026-05-10.json";

function readEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const env = readEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

const response = await fetch(`${baseUrl}/wp-json/wp/v2/plugins?context=edit&per_page=100`, {
  headers: { Authorization: auth, "User-Agent": "Codex inspect plugins" },
});
const text = await response.text();
let body;
try {
  body = text ? JSON.parse(text) : null;
} catch {
  body = text;
}
const report = { status: response.status, body };
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
