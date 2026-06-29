import { readFileSync } from "node:fs";
import { join } from "node:path";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";

function parseEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = parseEnv(ENV_PATH);
const baseUrl = env.WP_BASE_URL;
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

async function main() {
  const response = await fetch(`${baseUrl}/wp-json/rankmath/v1/an/post/55`, {
    headers: {
      Authorization: auth,
      Accept: "application/json",
    },
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
