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

async function wp(path, options = {}) {
  const response = await fetch(`${baseUrl}/wp-json${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      "User-Agent": "Codex Cache Toucher",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`WP error: ${response.status}`);
  }
  return response.json();
}

async function main() {
  console.log("Fetching page 55...");
  const page = await wp("/wp/v2/pages/55?context=edit");
  console.log("Touching page 55 to clear cache...");
  await wp("/wp/v2/pages/55", {
    method: "POST",
    body: {
      title: page.title.raw,
      content: page.content.raw,
      excerpt: page.excerpt.raw,
      status: page.status,
    },
  });
  console.log("Success! Page 55 cache touched.");
}

main().catch(console.error);
