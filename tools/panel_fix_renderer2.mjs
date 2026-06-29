/**
 * Fix ttcqn-home-emergency-renderer.php syntax error
 * Error: syntax error, unexpected string content "mui-hoi", expecting "]" at line 3377
 */
import https from "node:https";
import { writeFileSync } from "node:fs";

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
    req.setTimeout(90000, () => req.destroy(new Error("timeout")));
    req.write(body);
    req.end();
  });
}

function extractText(r) {
  const res = r.json?.result ?? r.events?.find((e) => e.result !== undefined)?.result;
  if (!res) return null;
  if (res?.isError) return null;
  return (Array.isArray(res?.content) ? res.content.map((c) => c.text ?? "").join("") : null) ?? JSON.stringify(res);
}

async function callTool(name, args) {
  const r = await mcpPost("tools/call", { name, arguments: args });
  return extractText(r);
}

async function init() {
  await mcpPost("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "fix-renderer2", version: "1.0" } });
  console.log("Session:", sessionId);
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
      res.on("end", () => resolve({ status: res.statusCode, up: res.statusCode === 200 }));
    });
    req.on("error", () => resolve({ up: false }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ up: false }); });
    req.end();
  });
}

async function main() {
  await init();
  console.log();

  // Step 1: Explore paths via list_files
  console.log("--- Listing files to find path format ---");
  const listing = await callTool("list_files", { path: "public_html/wp-content/plugins" });
  if (listing) {
    console.log("list_files(public_html/wp-content/plugins) OK, len:", listing.length);
    if (listing.includes("ttcqn-home-emergency-renderer")) {
      console.log("✓ Found ttcqn-home-emergency-renderer in listing");
    }
  } else {
    console.log("list_files failed");
    // Try absolute path
    const listing2 = await callTool("list_files", { path: "/home/yerdchtihosting/public_html/wp-content/plugins" });
    console.log("list_files(abs path):", listing2 ? "OK len=" + listing2.length : "FAIL");
  }

  // Step 2: Read the broken plugin file
  const paths = [
    "public_html/wp-content/plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php",
    "/home/yerdchtihosting/public_html/wp-content/plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php",
    "wp-content/plugins/ttcqn-home-emergency-renderer/ttcqn-home-emergency-renderer.php",
  ];

  let content = null;
  let workingPath = null;
  for (const p of paths) {
    process.stdout.write(`Trying read_file(${p.slice(-60)})... `);
    const r = await callTool("read_file", { path: p });
    if (r && !r.includes("Not found") && r.length > 100) {
      content = r;
      workingPath = p;
      console.log(`OK (${r.length} chars)`);
      break;
    } else {
      console.log("FAIL:", r?.slice(0, 50) ?? "null");
    }
  }

  if (!content) {
    console.error("Could not read the renderer plugin file. Trying error logs...");
    const logs = await callTool("get_error_logs", { domain: WP_DOMAIN, limit: 100 });
    console.log("Error logs:\n", logs?.slice(-3000) ?? "null");
    return;
  }

  // Step 3: Save locally and analyze
  writeFileSync("D:/.thongtaccongquangninh/tmp_renderer_broken.php", content, "utf8");
  console.log(`Saved to tmp_renderer_broken.php`);

  const lines = content.split("\n");
  console.log(`Total lines: ${lines.length}`);

  // Show context around line 3377
  const errLine = 3377;
  const start = Math.max(0, errLine - 8);
  const end = Math.min(lines.length, errLine + 5);
  console.log(`\n--- Lines ${start+1}-${end} (error context) ---`);
  for (let i = start; i < end; i++) {
    const marker = (i + 1 === errLine) ? " <-- ERROR" : "";
    console.log(`${i+1}: ${lines[i]}${marker}`);
  }

  // Find "mui-hoi" occurrences
  const muiHoiOccurrences = lines.map((l, i) => ({ line: i+1, text: l })).filter(({ text }) =>
    text.toLowerCase().includes("mui-hoi") || text.includes("mùi hôi") || text.includes("mùi-hôi")
  );
  console.log(`\n'mui-hoi' / 'mùi hôi' occurrences (${muiHoiOccurrences.length}):`);
  for (const { line, text } of muiHoiOccurrences.slice(0, 10)) {
    console.log(`  L${line}: ${text.slice(0, 100)}`);
  }

  // Step 4: Fix the syntax error
  // The error says: unexpected string content "mui-hoi", expecting "]"
  // This typically means a PHP array key is not quoted properly, e.g.
  //   $arr[mui-hoi] instead of $arr['mui-hoi']
  // OR a string with a hyphen that's being interpreted as subtraction
  // OR a heredoc/nowdoc that got broken

  console.log("\n--- Attempting auto-fix ---");

  // Look for the specific pattern near line 3377
  let fixedContent = content;
  let fixCount = 0;

  // Common PHP syntax errors with unquoted array keys containing hyphens
  // Pattern: something[mui-hoi] or array key issue
  // Try: replace $arr[mùi-hôi] with $arr['mùi-hôi'] or similar

  // Look at actual lines 3375-3380 for the pattern
  const problemLines = lines.slice(Math.max(0, errLine - 5), errLine + 2);
  console.log("Problem area lines:", problemLines);

  // Check for specific pattern: array access with unquoted key containing hyphen
  const fixedLines = lines.map((line, i) => {
    if (i < errLine - 10 || i > errLine + 5) return line;
    // Fix pattern: $var[key-with-hyphen] → $var['key-with-hyphen']
    // Also fix: 'key' => value\n  key-with-hyphen => (missing comma on previous line?)
    return line;
  });

  console.log("\nManual analysis needed. Check tmp_renderer_broken.php around line", errLine);
  console.log("Look for unquoted array keys or broken heredoc/nowdoc at that line.");
}

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
