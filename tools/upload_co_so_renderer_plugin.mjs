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
const ENV_PATH = firstExisting([fromRoot(".env")]);
const PLUGIN_SLUG = "ttcqn-co-so-renderer";
const ZIP_FILENAME = `${PLUGIN_SLUG}.zip`;
const ZIP_PATH = fromRoot("tools", `${ZIP_FILENAME}`);

function readEnvFile(filePath) {
  try {
    const env = {};
    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
    return env;
  } catch { return {}; }
}

const fileEnv = readEnvFile(ENV_PATH);
const WP_BASE_URL = fileEnv.WP_BASE_URL || "https://thongtaccongquangninh.com";
const auth = `Basic ${Buffer.from(`${fileEnv.WP_USERNAME}:${fileEnv.WP_APP_PASSWORD}`).toString("base64")}`;
const endpoint = `${WP_BASE_URL}/wp-json/mcp/wp-mcp-ultimate`;

async function rpc(method, params, id, sessionId) {
  const headers = { Authorization: auth, "Content-Type": "application/json", Accept: "application/json, text/event-stream" };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const res = await fetch(`${endpoint}`, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  const text = await res.text();
  let payload; try { payload = JSON.parse(text); } catch { payload = { raw: text }; }
  return { status: res.status, sessionId: res.headers.get("mcp-session-id"), payload };
}

async function callAbility(sessionId, abilityName, parameters, id) {
  return rpc("tools/call", { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: abilityName, parameters } }, id, sessionId);
}

function extractText(payload) {
  const text = payload?.result?.content?.[0]?.text;
  if (typeof text === "string" && text.trim()) return text.trim();
  if (payload?.error) return `ERROR: ${JSON.stringify(payload.error)}`;
  return JSON.stringify(payload, null, 2);
}

if (!existsSync(ZIP_PATH)) throw new Error(`Missing zip: ${ZIP_PATH}`);

const zipBase64 = readFileSync(ZIP_PATH).toString("base64");

const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "codex", version: "1" } }, 1);
if (init.status !== 200 || !init.sessionId) throw new Error(`Init failed: ${JSON.stringify(init.payload)}`);

const upload = await callAbility(init.sessionId, "plugins/upload-base64", { content_base64: zipBase64, filename: ZIP_FILENAME, activate: true, overwrite: true }, 2);
const uploadText = extractText(upload.payload);
const uploadOk = upload.status === 200 && !upload.payload?.error && /success|installed|uploaded|activated/i.test(uploadText);

const plugins = await callAbility(init.sessionId, "plugins/list", { status: "active" }, 3);
const activeList = extractText(plugins.payload);
const activeConfirmed = activeList.toLowerCase().includes(PLUGIN_SLUG);

const summary = { uploadSuccess: uploadOk, activeConfirmed, success: uploadOk && activeConfirmed };
console.log(JSON.stringify(summary, null, 2));
if (!summary.success) { console.error("Upload or activation failed.\nUpload response:", uploadText); process.exitCode = 1; }
