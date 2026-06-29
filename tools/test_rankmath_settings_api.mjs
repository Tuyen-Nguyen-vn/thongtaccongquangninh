import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
}

const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const baseUrl = env.WP_BASE_URL || "https://thongtaccongquangninh.com";

async function testRoute(wpPath, method = "GET", body = null) {
  console.log(`\nTesting ${method} ${wpPath}...`);
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
    "Cache-Control": "no-cache"
  };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${baseUrl}/wp-json${wpPath}`, opts);
    console.log(`Response Code: ${res.status}`);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log("Response JSON:", JSON.stringify(json, null, 2).slice(0, 1500));
    } catch {
      console.log("Response Text:", text.slice(0, 500));
    }
  } catch (e) {
    console.error("Fetch Error:", e.message);
  }
}

async function main() {
  // Thử các route Rank Math settings khác nhau
  await testRoute("/rankmath/v1/settings");
  await testRoute("/rankmath/v1/settings/general");
  await testRoute("/rankmath/v1/settings/analytics");
  await testRoute("/rankmath/v1/updateSettings", "POST", {});
}

main().catch(console.error);
