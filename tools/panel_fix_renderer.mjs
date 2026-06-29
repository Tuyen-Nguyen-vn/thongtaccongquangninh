/**
 * Fix PHP syntax error in ttcqn-home-emergency-renderer.php
 * Error: Parse error: syntax error, unexpected string content "mui-hoi", expecting "]" on line 3377
 */
import https from "node:https";
import { writeFileSync } from "node:fs";

const MCP_HOST = "onehost-wphn022606.000nethost.com";
const MCP_PORT = 2023;
const MCP_PATH = "/api/mcp";
const TOKEN = "sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
const WP_ROOT = "/home/yerdchtihosting/public_html";
const RENDERER_PLUGIN = `${WP_ROOT}/wp-content/plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php`;

let sessionId = null;
let msgId = 1;

function parseSSE(rawText) {
  const results = [];
  for (const line of rawText.split("\n")) {
    if (line.startsWith("data: ")) {
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") continue;
      try { results.push(JSON.parse(raw)); } catch {}
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
    req.setTimeout(90000, () => req.destroy(new Error("timeout " + method)));
    req.write(body);
    req.end();
  });
}

function extractText(r) {
  const res = r.json?.result ?? r.events?.find((e) => e.result !== undefined)?.result;
  if (!res) return JSON.stringify(r.raw ?? r.json ?? "").slice(0, 300);
  if (res?.isError) return "TOOL_ERROR: " + JSON.stringify(res.content ?? res);
  return (Array.isArray(res?.content) ? res.content.map((c) => c.text ?? "").join("") : null) ?? JSON.stringify(res).slice(0, 500);
}

async function callTool(name, args) {
  process.stdout.write(`→ ${name}... `);
  const r = await mcpPost("tools/call", { name, arguments: args });
  const text = extractText(r);
  console.log(text.startsWith("TOOL_ERROR") ? "ERR" : "OK");
  return text;
}

async function init() {
  const r = await mcpPost("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "fix-renderer", version: "1.0" },
  });
  console.log("Session:", sessionId, "| status:", r.status);
  await mcpPost("notifications/initialized", {});
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
    req.setTimeout(15000, () => { req.destroy(); resolve({ up: false, timeout: true }); });
    req.end();
  });
}

async function main() {
  await init();
  console.log();

  // Step 1: Read the broken renderer plugin
  console.log("=== Step 1: Read renderer plugin (around line 3377) ===");
  const content = await callTool("read_file", { path: RENDERER_PLUGIN });

  if (content.startsWith("TOOL_ERROR")) {
    console.error("Cannot read file:", content);
    process.exit(1);
  }

  const lines = content.split("\n");
  console.log(`Total lines: ${lines.length}`);

  // Show lines 3370-3385 for context
  const start = Math.max(0, 3370 - 1);
  const end = Math.min(lines.length, 3385);
  console.log(`\n--- Lines ${start+1}-${end} ---`);
  for (let i = start; i < end; i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }

  // Save full content locally for analysis
  writeFileSync("D:/.thongtaccongquangninh/tmp_renderer_broken.php", content, "utf8");
  console.log(`\nSaved broken file to tmp_renderer_broken.php (${content.length} chars)`);

  // Step 2: Find and fix the syntax error
  // Error: unexpected string content "mui-hoi", expecting "]"
  // This suggests a PHP array that has an unquoted string or broken heredoc
  const brokenLineIdx = lines.findIndex((l, i) => i >= 3370 && i <= 3385 && l.includes("mui-hoi"));
  if (brokenLineIdx >= 0) {
    console.log(`\nFound 'mui-hoi' at line ${brokenLineIdx+1}: ${lines[brokenLineIdx]}`);
  }

  // Search broader for "mui-hoi" string
  const muiHoiLines = lines.map((l, i) => ({ i, l })).filter(({ l }) => l.includes("mui-hoi") || l.includes("mùi hôi") || l.includes("mùi-hôi"));
  console.log(`\n'mui-hoi' occurrences:`, muiHoiLines.slice(0, 5).map(({ i, l }) => `L${i+1}: ${l.slice(0, 80)}`));
}

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
