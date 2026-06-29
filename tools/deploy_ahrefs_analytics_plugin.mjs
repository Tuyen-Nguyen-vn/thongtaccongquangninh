import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

const PROJECT_ROOT = "D:\\.thongtaccongquangninh";
const ENV_PATH = `${PROJECT_ROOT}\\.env`;

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

const AHREFS_DATA_KEY = "2OIJwuMkh/P2qdBRgrz3pA";
const PLUGIN_SLUG = "ttcqn-ahrefs-analytics";
const PLUGIN_DIR = `${PROJECT_ROOT}\\tools\\wp-plugins\\${PLUGIN_SLUG}`;
const PLUGIN_FILE = `${PLUGIN_DIR}\\${PLUGIN_SLUG}.php`;
const ZIP_PATH = `${PROJECT_ROOT}\\tools\\wp-plugins\\${PLUGIN_SLUG}.zip`;

if (!existsSync(PLUGIN_DIR)) {
  mkdirSync(PLUGIN_DIR, { recursive: true });
}

const phpContent = `<?php
/*
Plugin Name: TTCQN Ahrefs Analytics
Description: Adds Ahrefs Analytics tracking script to every frontend page head.
Version: 1.0.0
Author: Codex
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'wp_head', 'ttcqn_add_ahrefs_analytics', 1 );
function ttcqn_add_ahrefs_analytics() {
    if ( is_user_logged_in() && current_user_can( 'manage_options' ) ) {
        return;
    }
    echo '<script src="https://analytics.ahrefs.com/analytics.js" data-key="${AHREFS_DATA_KEY}" async></script>' . "\\n";
}
`;

writeFileSync(PLUGIN_FILE, phpContent, "utf8");
console.log(`Đã tạo plugin PHP: ${PLUGIN_FILE}`);

console.log("Đang nén plugin thành zip...");
if (existsSync(ZIP_PATH)) {
  execSync(`powershell -Command "Remove-Item '${ZIP_PATH}' -Force"`);
}
const pythonCmd = `python -c "import zipfile; zf = zipfile.ZipFile(r'${ZIP_PATH}', 'w', zipfile.ZIP_DEFLATED); zf.write(r'${PLUGIN_FILE}', '${PLUGIN_SLUG}/${PLUGIN_SLUG}.php'); zf.close()"`;
execSync(pythonCmd);
console.log(`Đã tạo zip: ${ZIP_PATH}`);

const auth = `Basic ${Buffer.from(`${fileEnv.WP_USERNAME}:${fileEnv.WP_APP_PASSWORD}`).toString("base64")}`;
const endpoint = `${WP_BASE_URL}/wp-json/mcp/wp-mcp-ultimate`;

async function rpc(method, params, id, sessionId) {
  const headers = { Authorization: auth, "Content-Type": "application/json", Accept: "application/json" };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  const text = await res.text();
  let payload; try { payload = JSON.parse(text); } catch { payload = { raw: text }; }
  return { status: res.status, sessionId: res.headers.get("mcp-session-id"), payload };
}

async function callAbility(sessionId, abilityName, parameters, id) {
  return rpc("tools/call", { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: abilityName, parameters } }, id, sessionId);
}

(async () => {
  console.log("Đang kết nối WordPress live...");
  const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "codex-ahrefs-deploy", version: "1" } }, 1);
  if (init.status !== 200 || !init.sessionId) throw new Error(`Init failed: ${JSON.stringify(init.payload)}`);

  console.log("Đang upload và kích hoạt plugin...");
  const zipBase64 = readFileSync(ZIP_PATH).toString("base64");
  const upload = await callAbility(init.sessionId, "plugins/upload-base64", { content_base64: zipBase64, filename: `${PLUGIN_SLUG}.zip`, activate: true, overwrite: true }, 2);

  console.log("Kết quả:", JSON.stringify(upload.payload, null, 2));

  if (upload.payload?.result?.content?.[0]?.text?.includes("activated") || upload.status === 200) {
    console.log("\nHOÀN THÀNH! Ahrefs Analytics đã được cài và kích hoạt.");
    console.log(`- data-key: ${AHREFS_DATA_KEY}`);
    console.log(`- Plugin slug: ${PLUGIN_SLUG}`);
  } else {
    console.error("Upload có thể chưa thành công, kiểm tra kết quả trên.");
  }
})().catch(e => {
  console.error("Lỗi:", e.message);
  process.exitCode = 1;
});
