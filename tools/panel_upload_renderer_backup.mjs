/**
 * Restore ttcqn-home-emergency-renderer.php from local backup
 * Backup: backups/ttcqn-home-emergency-renderer-before-footer-forbidden-2026-06-05/
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const MCP_HOST = "onehost-wphn022606.000nethost.com";
const MCP_PORT = 2023;
const MCP_PATH = "/api/mcp";
const TOKEN = "sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";

const BACKUP_FILE = "D:\\.thongtaccongquangninh\\backups\\ttcqn-home-emergency-renderer-before-footer-forbidden-2026-06-05\\ttcqn-home-emergency-renderer.php";
const SERVER_PATH = "public_html/wp-content/plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php";

let sessionId = null;
let msgId = 1;

function parseSSE(rawText) {
  const results = [];
  for (const line of rawText.split("\n")) {
    if (line.startsWith("data: ")) {
      try { results.push(JSON.parse(line.slice(6).trim())); } catch {}
    }
  }
  return results;
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
    const opts = { hostname: MCP_HOST, port: MCP_PORT, path: MCP_PATH, method: "POST", headers, rejectUnauthorized: false };
    const req = https.request(opts, (res) => {
      if (res.headers["mcp-session-id"]) sessionId = res.headers["mcp-session-id"];
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        const ct = res.headers["content-type"] ?? "";
        if (ct.includes("text/event-stream")) {
          resolve({ status: res.statusCode, events: parseSSE(data), raw: data });
        } else {
          try { resolve({ status: res.statusCode, json: JSON.parse(data) }); } catch { resolve({ status: res.statusCode, raw: data }); }
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(120000, () => req.destroy(new Error("timeout")));
    req.write(body);
    req.end();
  });
}

function extractText(r) {
  const res = r.json?.result ?? r.events?.find((e) => e.result !== undefined)?.result;
  if (!res) return JSON.stringify(r.raw ?? "").slice(0, 200);
  if (res?.isError) return "TOOL_ERROR: " + JSON.stringify(res.content ?? res).slice(0, 300);
  return (Array.isArray(res?.content) ? res.content.map((c) => c.text ?? "").join("") : null) ?? JSON.stringify(res).slice(0, 300);
}

async function callTool(name, args) {
  process.stdout.write(`→ ${name}... `);
  const r = await mcpPost("tools/call", { name, arguments: args });
  const text = extractText(r);
  console.log(text.startsWith("TOOL_ERROR") ? "ERR: " + text : "OK");
  return text;
}

function checkSite() {
  return new Promise((resolve) => {
    const opts = {
      hostname: "103.57.220.210", port: 443, servername: "thongtaccongquangninh.com",
      path: "/", method: "GET",
      headers: { Host: "thongtaccongquangninh.com", "User-Agent": "health/1.0" },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, up: res.statusCode === 200, critError: d.includes("critical error") }));
    });
    req.on("error", () => resolve({ up: false }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ up: false }); });
    req.end();
  });
}

async function main() {
  // Init MCP session
  await mcpPost("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "restore-renderer", version: "1.0" } });
  console.log("Session:", sessionId);
  await mcpPost("notifications/initialized", {});

  // Read backup
  const content = readFileSync(BACKUP_FILE, "utf8");
  console.log(`Backup: ${content.split("\n").length} lines, ${content.length} chars`);

  // Upload to server
  console.log(`\nUploading to server: ${SERVER_PATH}`);
  const writeResult = await callTool("write_file", { path: SERVER_PATH, content });
  console.log("write_file result:", writeResult);

  // Purge cache
  console.log("\nPurging WordPress cache...");
  const purge = await callTool("purge_all_wordpress_cache", { domain: "thongtaccongquangninh.com" });
  console.log("Purge result:", purge);

  // Check site
  await new Promise(r => setTimeout(r, 2000));
  const after = await checkSite();
  console.log(`\nSite status: HTTP ${after.status} | up=${after.up} | critError=${after.critError}`);

  if (after.up) {
    console.log("✓ Site restored successfully!");
  } else {
    console.log("✗ Site still down. Check logs.");
  }
}

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
