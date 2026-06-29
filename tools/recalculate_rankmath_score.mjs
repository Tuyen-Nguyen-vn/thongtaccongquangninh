import { readFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
}

const BASE_URL = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");

async function wpRequest(method, path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
      "User-Agent": "recalculate-score/1.0"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function main() {
  console.log("Forcing Rank Math to recalculate SEO score for ID 35...");
  
  // Trigger tools action
  const res = await wpRequest("POST", "/wp-json/rankmath/v1/toolsAction", {
    action: "update_seo_score",
    args: { update_all_scores: true, offset: 0 }
  });
  
  console.log("Recalculation triggered. Fetching updated Rank Math metadata for ID 35...");
  
  // Wait 1 second
  await new Promise(r => setTimeout(r, 1000));
  
  // Get Rank Math metadata
  const seoData = await wpRequest("GET", "/wp-json/rankmath/v1/an/post/35");
  
  console.log("\n=== Updated Rank Math Meta for Page 35 ===");
  console.log(JSON.stringify(seoData, null, 2));
  console.log("=========================================");
}

main().catch(console.error);
