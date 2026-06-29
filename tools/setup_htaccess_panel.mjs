import https from "node:https";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT = "D:\\.thongtaccongquangninh";
const PANEL_HOST = "onehost-wphn022606.000nethost.com";
const PANEL_PORT = 2023;
const PANEL_PATH = "/api/mcp";
const PANEL_TOKEN = "sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
const WP_ROOT = "/public_html";
const HTACCESS = `${WP_ROOT}/.htaccess`;
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const REMOTE_BACKUP = `${WP_ROOT}/.htaccess.codex-backup-${STAMP}`;
const CHECK_FILE = `${WP_ROOT}/codex-htaccess-check-${STAMP}.php`;
const CHECK_URL = `https://thongtaccongquangninh.com/${CHECK_FILE.split("/").pop()}`;

let sessionId = null;
let messageId = 1;

function parseSse(rawText) {
  const events = [];
  for (const line of rawText.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const raw = line.slice(6).trim();
    if (!raw || raw === "[DONE]") continue;
    try {
      events.push(JSON.parse(raw));
    } catch {
      // ignore invalid stream fragments
    }
  }
  return events;
}

function mcpPost(method, params) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({
      jsonrpc: "2.0",
      id: messageId++,
      method,
      params: params ?? {},
    }), "utf8");
    const headers = {
      Authorization: `Bearer ${PANEL_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "Content-Length": body.length,
    };
    if (sessionId) headers["Mcp-Session-Id"] = sessionId;

    const req = https.request({
      hostname: PANEL_HOST,
      port: PANEL_PORT,
      path: PANEL_PATH,
      method: "POST",
      headers,
      rejectUnauthorized: false,
    }, (res) => {
      if (res.headers["mcp-session-id"]) sessionId = res.headers["mcp-session-id"];
      let text = "";
      res.on("data", (chunk) => { text += chunk; });
      res.on("end", () => {
        const contentType = res.headers["content-type"] ?? "";
        if (contentType.includes("text/event-stream")) {
          resolve({ status: res.statusCode, events: parseSse(text), raw: text });
          return;
        }
        try {
          resolve({ status: res.statusCode, json: JSON.parse(text), raw: text });
        } catch {
          resolve({ status: res.statusCode, raw: text });
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error(`timeout ${method}`)));
    req.write(body);
    req.end();
  });
}

function resultFrom(response) {
  return response.json?.result ?? response.events?.find((event) => event.result !== undefined)?.result;
}

async function callTool(name, args) {
  const response = await mcpPost("tools/call", { name, arguments: args });
  const result = resultFrom(response);
  if (result?.isError) {
    const text = result.content?.map((item) => item.text ?? "").join("\n") ?? JSON.stringify(result);
    throw new Error(`${name} failed: ${text}`);
  }
  return result;
}

function contentText(result) {
  return result?.content?.map((item) => item.text ?? "").join("") ?? "";
}

async function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false, timeout: 30000 }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body }));
    }).on("error", reject);
  });
}

function phpCheckSource() {
  return `<?php
header('Content-Type: application/json; charset=utf-8');
$path = __DIR__ . '/.htaccess';
$result = [
  'exists' => file_exists($path),
  'perm_before' => file_exists($path) ? substr(sprintf('%o', fileperms($path)), -4) : null,
  'writable_before' => file_exists($path) ? is_writable($path) : null,
  'chmod_attempt' => false,
  'chmod_ok' => false,
  'perm_after' => null,
  'writable_after' => null,
];
if (file_exists($path)) {
  $result['chmod_attempt'] = true;
  $result['chmod_ok'] = @chmod($path, 0644);
  clearstatcache(true, $path);
  $result['perm_after'] = substr(sprintf('%o', fileperms($path)), -4);
  $result['writable_after'] = is_writable($path);
}
echo json_encode($result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
`;
}

await mcpPost("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "codex-htaccess-panel-setup", version: "1.0" },
});
await mcpPost("notifications/initialized", {});

const readResult = await callTool("read_file", { path: HTACCESS });
const htaccessContent = contentText(readResult);
if (!htaccessContent.includes("# BEGIN WordPress")) {
  throw new Error("Remote .htaccess does not contain WordPress block; refusing to rewrite.");
}
if (!htaccessContent.includes("TTCQN-WWW-Redirect")) {
  throw new Error("Remote .htaccess does not contain TTCQN-WWW-Redirect; refusing to rewrite.");
}

mkdirSync(join(PROJECT, "backups", "htaccess"), { recursive: true });
const localBackup = join(PROJECT, "backups", "htaccess", `.htaccess.${STAMP}.bak`);
writeFileSync(localBackup, htaccessContent, "utf8");
console.log("local_backup:", localBackup);

await callTool("write_file", { path: REMOTE_BACKUP, content: htaccessContent });
console.log("remote_backup:", REMOTE_BACKUP);

await callTool("write_file", { path: HTACCESS, content: htaccessContent });
console.log("rewrite_same_content: OK");

await callTool("write_file", { path: CHECK_FILE, content: phpCheckSource() });
console.log("php_check_file:", CHECK_FILE);

const check = await fetchText(CHECK_URL);
console.log("php_check_status:", check.status);
console.log("php_check_body:", check.body);

await callTool("delete_file", { path: CHECK_FILE });
console.log("php_check_deleted: OK");

const verifyResult = await callTool("read_file", { path: HTACCESS });
const verifyContent = contentText(verifyResult);
console.log("content_unchanged:", verifyContent === htaccessContent);
console.log("has_www_redirect:", verifyContent.includes("TTCQN-WWW-Redirect"));
console.log("has_wordpress_block:", verifyContent.includes("# BEGIN WordPress"));
