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

async function main() {
  const response = await fetch(`${baseUrl}/wp-json/`);
  const data = await response.json();
  const routes = Object.keys(data.routes || {}).filter(route => route.includes("rankmath"));
  console.log("Rank Math Routes:", routes);
}

main().catch(console.error);
