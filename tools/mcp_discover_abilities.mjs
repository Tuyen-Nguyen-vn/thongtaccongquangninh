import { readFileSync, writeFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const REPORT_PATH = "D:\\.thongtaccongquangninh\\WORDPRESS_MCP_ABILITIES_2026-05-10.json";

function readEnv(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

async function rpc(url, auth, method, params, id, sessionId) {
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "User-Agent": "Codex MCP discover",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }
  return { status: response.status, sessionId: response.headers.get("mcp-session-id"), payload };
}

const env = readEnv(ENV_PATH);
const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const endpoint = `${baseUrl}/wp-json/mcp/wp-mcp-ultimate`;
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;

const init = await rpc(endpoint, auth, "initialize", {
  protocolVersion: "2025-06-18",
  capabilities: {},
  clientInfo: { name: "codex", version: "1" },
}, 1);
const sessionId = init.sessionId;
const discover = await rpc(endpoint, auth, "tools/call", {
  name: "wp-mcp-ultimate-discover-abilities",
  arguments: {},
}, 2, sessionId);

const report = { generatedAt: new Date().toISOString(), init, discover };
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
