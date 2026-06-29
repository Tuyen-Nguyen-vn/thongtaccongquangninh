import https from "node:https";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const PROJECT_ROOT = process.cwd();
const SOURCE_TOKEN_SCRIPT = join(PROJECT_ROOT, "tools", "panel_upload_renderer_backup.mjs");
const BACKUP_DIR = process.argv[2] || join("backups", "bom-cleanup-panel-" + new Date().toISOString().replace(/[:.]/g, "-"));
const MCP_HOST = "onehost-wphn022606.000nethost.com";
const MCP_PORT = 2023;
const MCP_PATH = "/api/mcp";
const WP_HOST = "thongtaccongquangninh.com";
const SERVER_IP = "103.57.220.210";

const tokenMatch = readFileSync(SOURCE_TOKEN_SCRIPT, "utf8").match(/const TOKEN = "([^"]+)"/);
if (!tokenMatch) {
  throw new Error("Cannot locate panel MCP token source.");
}
const TOKEN = tokenMatch[1];

const files = [
  {
    local: "tools/wp-plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php",
    remote: "public_html/wp-content/plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php",
  },
  {
    local: "tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php",
    remote: "public_html/wp-content/plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php",
  },
  {
    local: "tools/wp-plugins/ttcqn-home-emergency-renderer/templates/shared-footer.php",
    remote: "public_html/wp-content/plugins/ttcqn-home-emergency-renderer/templates/shared-footer.php",
  },
  {
    local: "tools/wp-plugins/ttcqn-doorway-schema/ttcqn-doorway-schema.php",
    remote: "public_html/wp-content/plugins/ttcqn-doorway-schema/ttcqn-doorway-schema.php",
  },
];

let sessionId = null;
let msgId = 1;

function parseSse(rawText) {
  const events = [];
  for (const line of rawText.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      events.push(JSON.parse(line.slice(6).trim()));
    } catch {
      // Ignore non-JSON event lines.
    }
  }
  return events;
}

function extractResult(response) {
  return response.json?.result ?? response.events?.find((event) => event.result !== undefined)?.result;
}

function extractText(response) {
  const result = extractResult(response);
  if (!result) return String(response.raw ?? "");
  if (result.isError) {
    const text = Array.isArray(result.content) ? result.content.map((item) => item.text ?? "").join("\n") : JSON.stringify(result);
    throw new Error(text || "Panel MCP tool error");
  }
  if (Array.isArray(result.content)) return result.content.map((item) => item.text ?? "").join("");
  return JSON.stringify(result);
}

function mcpPost(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ jsonrpc: "2.0", id: msgId++, method, params: params ?? {} });
    const headers = {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "Content-Length": Buffer.byteLength(body),
    };
    if (sessionId) headers["Mcp-Session-Id"] = sessionId;
    const req = https.request(
      { hostname: MCP_HOST, port: MCP_PORT, path: MCP_PATH, method: "POST", headers, rejectUnauthorized: false },
      (res) => {
        if (res.headers["mcp-session-id"]) sessionId = res.headers["mcp-session-id"];
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if ((res.headers["content-type"] || "").includes("text/event-stream")) {
            resolve({ status: res.statusCode, events: parseSse(data), raw: data });
            return;
          }
          try {
            resolve({ status: res.statusCode, json: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(120000, () => req.destroy(new Error("timeout")));
    req.write(body);
    req.end();
  });
}

async function callTool(name, args) {
  const response = await mcpPost("tools/call", { name, arguments: args });
  return extractText(response);
}

function fetchHome() {
  return new Promise((resolve, reject) => {
    const path = "/?nowprocket=1&codex=bom-cleanup-" + Date.now();
    const req = https.request(
      {
        hostname: SERVER_IP,
        port: 443,
        servername: WP_HOST,
        path,
        method: "GET",
        headers: { Host: WP_HOST, "User-Agent": "Mozilla/5.0 Codex BOM Cleanup Verify" },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
      },
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

await mcpPost("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "ttcqn-bom-cleanup", version: "1.0" } });
await mcpPost("notifications/initialized", {});

mkdirSync(BACKUP_DIR, { recursive: true });
const manifest = {
  generatedAt: new Date().toISOString(),
  backupDir: BACKUP_DIR,
  files: [],
};

for (const item of files) {
  const remoteContent = await callTool("read_file", { path: item.remote });
  const backupPath = join(BACKUP_DIR, "remote-before-" + basename(item.remote));
  writeFileSync(backupPath, remoteContent, "utf8");

  const localContent = readFileSync(join(PROJECT_ROOT, item.local), "utf8");
  await callTool("write_file", { path: item.remote, content: localContent });
  manifest.files.push({
    local: item.local,
    remote: item.remote,
    backupPath,
    localStartsWithBom: localContent.charCodeAt(0) === 0xfeff,
    remoteBackupStartsWithBom: remoteContent.charCodeAt(0) === 0xfeff,
  });
  console.log(`updated ${item.remote}`);
}

let purgeResult = "";
try {
  purgeResult = await callTool("purge_all_wordpress_cache", { domain: WP_HOST });
} catch (error) {
  purgeResult = "PURGE_FAILED: " + error.message;
}

await new Promise((resolve) => setTimeout(resolve, 2500));
const home = await fetchHome();
const livePath = join(BACKUP_DIR, "home-live-after.html");
writeFileSync(livePath, home.body);

manifest.purgeResult = purgeResult.slice(0, 500);
manifest.live = {
  status: home.status,
  path: livePath,
  firstBytesHex: home.body.subarray(0, 12).toString("hex"),
  startsWithDoctype: home.body.subarray(0, 15).toString("utf8").startsWith("<!DOCTYPE html>"),
  hasRendererVersion: home.body.includes(Buffer.from("2026.06.27.3")),
  hasMetaDescription: /<meta\s+name=["']description["']/i.test(home.body.toString("utf8", 0, Math.min(home.body.length, 200000))),
};

const manifestPath = join(BACKUP_DIR, "deploy-bom-cleanup-panel.json");
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
console.log(JSON.stringify(manifest, null, 2));
