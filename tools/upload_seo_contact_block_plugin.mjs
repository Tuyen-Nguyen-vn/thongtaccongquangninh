/**
 * Upload & activate plugin: ttcqn-seo-contact-block
 * Usage: node tools/upload_seo_contact_block_plugin.mjs
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { createWriteStream } from "node:fs";
import { createRequire } from "node:module";
import { platform } from "node:process";

// ── Paths ──────────────────────────────────────────────────────────────────

function firstExisting(paths) {
  return paths.find((p) => existsSync(p)) || paths[0];
}

const PROJECT_ROOT =
  platform === "linux" && existsSync("/mnt/d/.thongtaccongquangninh")
    ? "/mnt/d/.thongtaccongquangninh"
    : firstExisting(["D:\\.thongtaccongquangninh", "/mnt/d/.thongtaccongquangninh"]);
const ROOT_IS_POSIX = PROJECT_ROOT.startsWith("/");
const fromRoot = (...parts) =>
  ROOT_IS_POSIX ? [PROJECT_ROOT, ...parts].join("/") : [PROJECT_ROOT, ...parts].join("\\");

const ENV_PATH = firstExisting([
  fromRoot(".env"),
  `/sessions/vigilant-beautiful-knuth/mnt/.thongtaccongquangninh/.env`,
]);

const PLUGIN_SLUG = "ttcqn-seo-contact-block";
const ZIP_FILENAME = `${PLUGIN_SLUG}.zip`;
const PLUGIN_DIR = fromRoot("tools", "wp-plugins", PLUGIN_SLUG);
const ZIP_PATH = fromRoot("tools", "wp-plugins", ZIP_FILENAME);
const REPORT_PATH = fromRoot(
  `WORDPRESS_SEO_CONTACT_BLOCK_PLUGIN_UPLOAD_${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.json`
);

// ── Credentials ────────────────────────────────────────────────────────────

function readEnvFile(filePath) {
  const env = {};
  try {
    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
  } catch {}
  return env;
}

const fileEnv = readEnvFile(ENV_PATH);
const baseUrl = (fileEnv.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const username = fileEnv.WP_USERNAME || process.env.WP_USERNAME;
const password = fileEnv.WP_APP_PASSWORD || process.env.WP_APP_PASSWORD;

if (!username || !password) {
  throw new Error(`Missing WP credentials. Checked: ${ENV_PATH}`);
}

const auth = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
const endpoint = `${baseUrl}/wp-json/mcp/wp-mcp-ultimate`;

// ── Build ZIP ──────────────────────────────────────────────────────────────

// ── Build ZIP using Node.js (cross-platform, no external zip/rm commands) ──
console.log(`[1/4] Building ZIP: ${ZIP_PATH}`);

// Dynamic import of archiver or fallback to adm-zip
async function buildZip(pluginDir, zipPath) {
  // Use Python as fallback since it's always available
  const { execSync } = await import("node:child_process");
  const py = `python3 -c "
import zipfile, os, sys
plugin_dir = sys.argv[1]
zip_out = sys.argv[2]
plugin_name = os.path.basename(plugin_dir)
base = os.path.dirname(plugin_dir)
with zipfile.ZipFile(zip_out, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(plugin_dir):
        for f in files:
            full = os.path.join(root, f)
            arc = os.path.relpath(full, base)
            z.write(full, arc)
            print('  +', arc)
print('ZIP OK:', zip_out)
" "${pluginDir}" "${zipPath}"`.replace(/\n/g, " ");

  // Try python3 first, then python
  for (const pyCmd of ["python3", "python"]) {
    try {
      const result = execSync(
        `${pyCmd} -c "import zipfile,os,sys; plugin_dir=r'${pluginDir}'; zip_out=r'${zipPath}'; base=os.path.dirname(plugin_dir); [z.write(os.path.join(r,f), os.path.relpath(os.path.join(r,f),base)) for z in [zipfile.ZipFile(zip_out,'w',zipfile.ZIP_DEFLATED)] for r,d,files in os.walk(plugin_dir) for f in files]; print('ZIP OK')"`,
        { stdio: "pipe", encoding: "utf8" }
      );
      return result.trim();
    } catch {}
  }
  throw new Error("Python not found — cannot build ZIP");
}

const pluginSrcDir = ROOT_IS_POSIX
  ? `${PROJECT_ROOT}/tools/wp-plugins/${PLUGIN_SLUG}`
  : `${PROJECT_ROOT}\\tools\\wp-plugins\\${PLUGIN_SLUG}`;

// If zip already exists and is valid, skip rebuild
if (existsSync(ZIP_PATH) && readFileSync(ZIP_PATH).length > 100) {
  console.log(`    ZIP already exists (${readFileSync(ZIP_PATH).length} bytes) — skipping rebuild.`);
} else {
  const result = await buildZip(pluginSrcDir, ZIP_PATH);
  console.log(`    ${result}`);
}

// ── WP MCP RPC helpers ────────────────────────────────────────────────────

async function rpc(method, params, id, sessionId) {
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "User-Agent": "Codex seo-contact-block upload",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const text = await res.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = { raw: text }; }
  return { status: res.status, sessionId: res.headers.get("mcp-session-id"), payload };
}

async function callAbility(sessionId, abilityName, parameters, id) {
  return rpc(
    "tools/call",
    { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: abilityName, parameters } },
    id,
    sessionId
  );
}

function extractText(payload) {
  return payload?.result?.content?.[0]?.text ?? JSON.stringify(payload);
}

// ── Upload ─────────────────────────────────────────────────────────────────

console.log(`[2/4] Initialising WP MCP session…`);
const init = await rpc("initialize", {
  protocolVersion: "2025-06-18",
  capabilities: {},
  clientInfo: { name: "codex", version: "1" },
}, 1);

if (init.status !== 200 || !init.sessionId) {
  throw new Error(`MCP initialize failed: ${JSON.stringify(init.payload)}`);
}
console.log(`    Session: ${init.sessionId}`);

console.log(`[3/4] Uploading & activating plugin…`);
const zipBase64 = readFileSync(ZIP_PATH).toString("base64");
const upload = await callAbility(
  init.sessionId,
  "plugins/upload-base64",
  { content_base64: zipBase64, filename: ZIP_FILENAME, activate: true, overwrite: true },
  2
);
const uploadText = extractText(upload.payload);
console.log(`    Response: ${uploadText.slice(0, 200)}`);

console.log(`[4/4] Verifying active plugins…`);
const plugins = await callAbility(init.sessionId, "plugins/list", { status: "active" }, 3);
const activeText = extractText(plugins.payload);
const isActive = activeText.includes(PLUGIN_SLUG);
console.log(`    Plugin active: ${isActive}`);

// ── Report ─────────────────────────────────────────────────────────────────

const report = {
  generatedAt: new Date().toISOString(),
  pluginSlug: PLUGIN_SLUG,
  version: "2026.06.04.1",
  zipPath: ZIP_PATH,
  uploadStatus: upload.status,
  pluginActive: isActive,
  uploadResponse: uploadText.slice(0, 500),
  success: upload.status === 200 && isActive,
};

writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
console.log(`\nReport: ${REPORT_PATH}`);
console.log(`Result: ${report.success ? "SUCCESS" : "FAILED"}`);

if (!report.success) {
  process.exit(1);
}
