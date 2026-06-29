import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { platform } from "node:process";

function firstExisting(paths) {
  return paths.find((candidate) => existsSync(candidate)) || paths[0];
}

const PROJECT_ROOT =
  platform === "linux" && existsSync("/mnt/d/.thongtaccongquangninh")
    ? "/mnt/d/.thongtaccongquangninh"
    : firstExisting(["D:\\.thongtaccongquangninh", "/mnt/d/.thongtaccongquangninh"]);
const ROOT_IS_POSIX = PROJECT_ROOT.startsWith("/");
const fromRoot = (...parts) => (ROOT_IS_POSIX ? [PROJECT_ROOT, ...parts].join("/") : [PROJECT_ROOT, ...parts].join("\\"));
const ENV_PATH = fromRoot(".env");
const PLUGIN_SLUG = "ttcqn-doorway-schema";
const ZIP_FILENAME = `${PLUGIN_SLUG}.zip`;
const ZIP_PATH = fromRoot("tools", "wp-plugins", ZIP_FILENAME);
const REPORT_PATH = fromRoot("WORDPRESS_DOORWAY_SCHEMA_UPLOAD_2026-05-30.json");

function readEnvFile(filePath) {
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const fileEnv = readEnvFile(ENV_PATH);
const baseUrl = (fileEnv.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const username = fileEnv.WP_USERNAME;
const password = fileEnv.WP_APP_PASSWORD;
if (!username || !password) throw new Error("Missing WP credentials");

const auth = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
const endpoint = `${baseUrl}/wp-json/mcp/wp-mcp-ultimate`;

async function rpc(method, params, id, sessionId) {
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "User-Agent": "Codex doorway schema upload",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const response = await fetch(endpoint, {
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

async function callAbility(sessionId, abilityName, parameters, id) {
  return rpc(
    "tools/call",
    {
      name: "wp-mcp-ultimate-execute-ability",
      arguments: { ability_name: abilityName, parameters },
    },
    id,
    sessionId,
  );
}

function extractText(payload) {
  return payload?.result?.content?.[0]?.text ?? JSON.stringify(payload);
}

const init = await rpc(
  "initialize",
  { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "codex", version: "1" } },
  1,
);
if (init.status !== 200 || !init.sessionId) throw new Error(`Initialize failed: ${JSON.stringify(init.payload)}`);

const zipBase64 = readFileSync(ZIP_PATH).toString("base64");
const upload = await callAbility(
  init.sessionId,
  "plugins/upload-base64",
  { content_base64: zipBase64, filename: ZIP_FILENAME, activate: true, overwrite: true },
  2,
);
const uploadText = extractText(upload.payload);

const plugins = await callAbility(init.sessionId, "plugins/list", { status: "active" }, 3);
const activeText = extractText(plugins.payload);
const success = upload.status === 200 && !upload.payload?.error && activeText.includes(PLUGIN_SLUG);

const report = {
  generatedAt: new Date().toISOString(),
  pluginSlug: PLUGIN_SLUG,
  zipPath: ZIP_PATH,
  success,
  uploadStatus: upload.status,
  uploadText,
};

writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ success, report: REPORT_PATH }, null, 2));
if (!success) process.exitCode = 1;
