/**
 * Emergency site restore via 1Panel MCP
 * 1. Get hosting context
 * 2. Try to deactivate broken plugin via DB
 * 3. Read PHP error logs to find root cause
 * 4. Optionally restore original plugin file
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const MCP_HOST = "onehost-wphn022606.000nethost.com";
const MCP_PORT = 2023;
const MCP_PATH = "/api/mcp";
const TOKEN = "sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
const WP_DOMAIN = "thongtaccongquangninh.com";

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
    req.setTimeout(60000, () => req.destroy(new Error("timeout " + method)));
    req.write(body);
    req.end();
  });
}

function extractText(r) {
  const res = r.json?.result ?? r.events?.find((e) => e.result !== undefined)?.result;
  if (!res) return JSON.stringify(r.raw ?? r.json ?? "").slice(0, 300);
  if (res?.isError) return "ERROR: " + JSON.stringify(res.content ?? res);
  return (Array.isArray(res?.content) ? res.content.map((c) => c.text ?? "").join("") : null) ?? JSON.stringify(res).slice(0, 500);
}

async function callTool(name, args) {
  process.stdout.write(`→ ${name}(${JSON.stringify(args).slice(0, 80)})... `);
  const r = await mcpPost("tools/call", { name, arguments: args });
  const text = extractText(r);
  console.log("OK");
  return text;
}

async function init() {
  const r = await mcpPost("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "restore-script", version: "1.0" },
  });
  console.log("Session:", sessionId, "| status:", r.status);
  await mcpPost("notifications/initialized", {});
}

async function checkSiteUp() {
  return new Promise((resolve) => {
    const opts = {
      hostname: "103.57.220.210", port: 443, servername: WP_DOMAIN,
      path: "/", method: "GET",
      headers: { Host: WP_DOMAIN, "User-Agent": "health-check/1.0" },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve({ status: res.statusCode, up: res.statusCode === 200, hasCriticalError: d.includes("critical error") }));
    });
    req.on("error", () => resolve({ up: false, error: true }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ up: false, timeout: true }); });
    req.end();
  });
}

async function main() {
  console.log("=== Emergency Site Restore ===\n");

  // Check current site status
  const before = await checkSiteUp();
  console.log(`Site status BEFORE: HTTP ${before.status} | up=${before.up} | criticalError=${before.hasCriticalError}\n`);

  await init();

  // Step 1: Get hosting context
  console.log("\n--- Step 1: Hosting context ---");
  const ctx = await callTool("get_hosting_context", {});
  console.log(ctx.slice(0, 800));

  // Step 2: List WordPress sites to get correct domain
  console.log("\n--- Step 2: List WordPress ---");
  const wpList = await callTool("list_wordpress", {});
  console.log(wpList.slice(0, 500));

  // Step 3: Read PHP error log to find cause
  console.log("\n--- Step 3: PHP error log ---");
  const errLogs = await callTool("get_error_logs", { domain: WP_DOMAIN, lines: 50 });
  console.log(errLogs.slice(-3000));

  // Step 4: Deactivate the broken plugin via 1Panel
  console.log("\n--- Step 4: Deactivate ttcqn-doorway-schema plugin ---");
  const deactivate = await callTool("deactivate_wordpress_plugin", {
    domain: WP_DOMAIN,
    plugin: "ttcqn-doorway-schema/ttcqn-doorway-schema.php",
  });
  console.log(deactivate);

  // Step 5: Check site after deactivation
  const after = await checkSiteUp();
  console.log(`\nSite status AFTER deactivate: HTTP ${after.status} | up=${after.up}`);

  if (after.up) {
    console.log("\n✓ Site restored! Plugin deactivated successfully.");
    console.log("Next: fix the PHP issue in tmp_doorway_schema_updated.php and re-upload.");
  } else {
    console.log("\n⚠ Site still down. Trying to restore original plugin file...");

    // Step 6: Restore original file from backup
    const origPath = "C:/Users/DELL/.claude/projects/D---thongtaccongquangninh/400aa309-ffb4-4469-b950-7c6e4213692f/tool-results/bm0u2e2b3.txt";
    let origContent = readFileSync(origPath, "utf8");
    // Strip line numbers from Claude Read tool format "NNN\t"
    origContent = origContent.replace(/^\d+\t/gm, "");
    console.log(`\nRestoring original file (${origContent.length} chars)...`);

    // First, find the correct server path
    console.log("\n--- Step 6a: Find plugin path ---");
    const fileList = await callTool("list_files", { domain: WP_DOMAIN, path: "wp-content/plugins/ttcqn-doorway-schema" });
    console.log(fileList.slice(0, 500));

    const serverPath = "wp-content/plugins/ttcqn-doorway-schema/ttcqn-doorway-schema.php";
    const writeResult = await callTool("write_file", { domain: WP_DOMAIN, path: serverPath, content: origContent });
    console.log("Write result:", writeResult);

    // Reactivate plugin
    console.log("\n--- Reactivate plugin ---");
    const reactivate = await callTool("activate_wordpress_plugin", {
      domain: WP_DOMAIN,
      plugin: "ttcqn-doorway-schema/ttcqn-doorway-schema.php",
    });
    console.log(reactivate);

    // Check again
    const afterRestore = await checkSiteUp();
    console.log(`Site status after restore: HTTP ${afterRestore.status} | up=${afterRestore.up}`);
  }
}

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
