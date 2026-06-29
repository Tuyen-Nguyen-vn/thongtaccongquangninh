import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";
const ENV_PATH = join(PROJECT, ".env");
const REPORT_PATH = join(PROJECT, `WORDPRESS_MCP_SMOKE_${localDateStamp()}.json`);

function localDateStamp(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

async function rpc(url, auth, method, params, id) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "User-Agent": "Codex MCP smoke",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  return {
    status: response.status,
    sessionId: response.headers.get("mcp-session-id"),
    raw: typeof payload === "string" ? payload.slice(0, 500) : undefined,
    payload
  };
}

async function rpcWithSession(url, auth, sessionId, method, params, id) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "Mcp-Session-Id": sessionId,
      "User-Agent": "Codex MCP smoke",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const raw = await response.text();
  let payload = raw;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {}
  return {
    status: response.status,
    sessionId: response.headers.get("mcp-session-id"),
    raw: typeof payload === "string" ? payload.slice(0, 500) : undefined,
    payload
  };
}

const env = parseEnv(ENV_PATH);
const baseUrl = env.WP_BASE_URL || "https://thongtaccongquangninh.com";
const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
const endpoints = [`${baseUrl}/wp-json/mcp`, `${baseUrl}/wp-json/mcp/wp-mcp-ultimate`];
const calls = [];
for (const endpoint of endpoints) {
  const init = await rpc(endpoint, auth, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "codex", version: "1" },
  }, 1);
  calls.push({ endpoint, call: "initialize", result: init });
  const list = init.sessionId
    ? await rpcWithSession(endpoint, auth, init.sessionId, "tools/list", {}, 2)
    : await rpc(endpoint, auth, "tools/list", {}, 2);
  calls.push({ endpoint, call: "tools/list", result: list });
}
writeFileSync(REPORT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), calls }, null, 2), "utf8");
console.log(JSON.stringify({ generatedAt: new Date().toISOString(), calls }, null, 2));
