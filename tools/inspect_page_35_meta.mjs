import { readFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
}

const BASE_URL = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

async function main() {
  console.log("Fetching Page ID 35 detail...");
  const res = await fetch(`${BASE_URL}/wp-json/wp/v2/pages/35?context=edit`, {
    headers: { Authorization: AUTH }
  });
  const data = await res.json();
  
  console.log("=== Page ID 35 Main Info ===");
  console.log("Title (Raw): ", data.title?.raw);
  console.log("Slug:         ", data.slug);
  console.log("Status:       ", data.status);
  console.log("Meta Field:   ", JSON.stringify(data.meta, null, 2));
  console.log("Yoast Head JSON: ", JSON.stringify(data.yoast_head_json, null, 2));
  console.log("============================");
}

main().catch(console.error);
