import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { env as shellEnv, platform } from "node:process";

function firstExisting(paths) {
  return paths.find((candidate) => existsSync(candidate)) || paths[0];
}

const PROJECT_ROOT =
  platform === "linux" && existsSync("/mnt/d/.thongtaccongquangninh")
    ? "/mnt/d/.thongtaccongquangninh"
    : firstExisting(["D:\\.thongtaccongquangninh", "/mnt/d/.thongtaccongquangninh"]);
const ROOT_IS_POSIX = PROJECT_ROOT.startsWith("/");
const fromRoot = (...parts) => (ROOT_IS_POSIX ? [PROJECT_ROOT, ...parts].join("/") : [PROJECT_ROOT, ...parts].join("\\"));
const homeDir = shellEnv.USERPROFILE || shellEnv.HOMEPATH || "C:\\Users\\DELL";
const wslUser = shellEnv.USER || "DELL";
const ENV_PATH = firstExisting([
  fromRoot(".env"),
  [homeDir, "Documents", "Codex", "2026-04-28", "chatgpt-apps-plugin-chatgpt-apps-openai", ".env"].join("\\"),
  `/mnt/c/Users/${wslUser}/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env`,
]);
const PLUGIN_SLUG = "ttcqn-home-emergency-renderer";
const ZIP_FILENAME = `${PLUGIN_SLUG}.zip`;
const ZIP_PATH = fromRoot("tools", "wp-plugins", ZIP_FILENAME);
const REPORT_PATH = fromRoot("WORDPRESS_HOME_EMERGENCY_RENDERER_PLUGIN_UPLOAD_2026-06-19.json");

function readEnvFile(filePath) {
  try {
    const env = {};
    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
    return env;
  } catch {
    return {};
  }
}

function readEnv() {
  const fileEnv = readEnvFile(ENV_PATH);
  const env = {
    WP_BASE_URL: fileEnv.WP_BASE_URL || shellEnv.WP_BASE_URL || "https://thongtaccongquangninh.com",
    WP_USERNAME: fileEnv.WP_USERNAME || shellEnv.WP_USERNAME,
    WP_APP_PASSWORD: fileEnv.WP_APP_PASSWORD || shellEnv.WP_APP_PASSWORD,
  };
  const missing = ["WP_USERNAME", "WP_APP_PASSWORD"].filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing required credentials: ${missing.join(", ")}`);
  return env;
}

function buildAuth(env) {
  const baseUrl = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
  return {
    baseUrl,
    auth: `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`,
  };
}

async function rpc(url, auth, method, params, id, sessionId) {
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "User-Agent": "Codex emergency home renderer upload",
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

async function callAbility(endpoint, auth, sessionId, abilityName, parameters, id) {
  return rpc(
    endpoint,
    auth,
    "tools/call",
    {
      name: "wp-mcp-ultimate-execute-ability",
      arguments: { ability_name: abilityName, parameters },
    },
    id,
    sessionId
  );
}

function extractText(payload) {
  const text = payload?.result?.content?.[0]?.text;
  if (typeof text === "string" && text.trim()) return text.trim();
  if (payload?.error) return `ERROR: ${JSON.stringify(payload.error)}`;
  return JSON.stringify(payload, null, 2);
}

function parseUpload(upload) {
  const text = extractText(upload.payload);
  let structured = upload.payload?.result?.structuredContent;
  try {
    if (text.startsWith("{")) structured = JSON.parse(text);
  } catch {}
  const successFlag =
    typeof structured?.data?.success === "boolean"
      ? structured.data.success
      : typeof structured?.success === "boolean"
        ? structured.success
        : true;
  const normalized = text.toLowerCase();
  return {
    text,
    success:
      upload.status === 200 &&
      !upload.payload?.error &&
      successFlag &&
      (/success|installed|uploaded|activated/.test(normalized)),
  };
}

if (!existsSync(ZIP_PATH)) {
  throw new Error(`Missing plugin zip file: ${ZIP_PATH}`);
}

const env = readEnv();
const { baseUrl, auth } = buildAuth(env);
const endpoint = `${baseUrl}/wp-json/mcp/wp-mcp-ultimate`;
const zipBase64 = readFileSync(ZIP_PATH).toString("base64");

const init = await rpc(
  endpoint,
  auth,
  "initialize",
  {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "codex", version: "1" },
  },
  1
);
if (init.status !== 200 || !init.sessionId) {
  throw new Error(`Initialize failed HTTP ${init.status}: ${JSON.stringify(init.payload)}`);
}

const upload = await callAbility(
  endpoint,
  auth,
  init.sessionId,
  "plugins/upload-base64",
  {
    content_base64: zipBase64,
    filename: ZIP_FILENAME,
    activate: true,
    overwrite: true,
  },
  2
);
const parsed = parseUpload(upload);

const plugins = await callAbility(endpoint, auth, init.sessionId, "plugins/list", { status: "active" }, 3);
const activeList = extractText(plugins.payload);
const activeConfirmed = activeList.toLowerCase().includes(PLUGIN_SLUG);

const report = {
  generatedAt: new Date().toISOString(),
  pluginSlug: PLUGIN_SLUG,
  zipPath: ZIP_PATH,
  summary: {
    uploadSuccess: parsed.success,
    activeConfirmed,
    success: parsed.success && activeConfirmed,
  },
  init,
  upload,
  uploadText: parsed.text,
  plugins,
};
writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report.summary, null, 2));
if (!report.summary.success) process.exitCode = 1;
