/**
 * Minimal 1Panel MCP SSE client — emergency plugin restore
 * Supports: initialize, tools/list, tools/call
 *
 * Usage:
 *   node tools/panel_mcp_client.mjs list-tools
 *   node tools/panel_mcp_client.mjs describe-tool <toolName>
 *   node tools/panel_mcp_client.mjs write-file <serverPath> <localPath>
 *   node tools/panel_mcp_client.mjs read-file  <serverPath>
 *   node tools/panel_mcp_client.mjs copy-file  <sourcePath> <destinationPath>
 *   node tools/panel_mcp_client.mjs create-directory <parentPath> <name>
 *   node tools/panel_mcp_client.mjs purge-cache
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const MCP_HOST = "onehost-wphn022606.000nethost.com";
const MCP_PORT = 2023;
const MCP_PATH = "/api/mcp";
const TOKEN = "sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";

let sessionId = null;
let msgId = 1;

function parseSSE(rawText) {
  const results = [];
  for (const line of rawText.split("\n")) {
    if (line.startsWith("data: ")) {
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") continue;
      try { results.push(JSON.parse(raw)); } catch { /* skip */ }
    }
  }
  return results;
}

function mcpPost(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: msgId++,
      method,
      params: params ?? {},
    });

    const headers = {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "Content-Length": Buffer.byteLength(body),
    };
    if (sessionId) headers["Mcp-Session-Id"] = sessionId;

    const opts = {
      hostname: MCP_HOST,
      port: MCP_PORT,
      path: MCP_PATH,
      method: "POST",
      headers,
      rejectUnauthorized: false,
    };

    const req = https.request(opts, (res) => {
      // Capture session ID from response header
      if (res.headers["mcp-session-id"]) {
        sessionId = res.headers["mcp-session-id"];
      }

      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        const ct = res.headers["content-type"] ?? "";

        if (ct.includes("text/event-stream")) {
          // Parse SSE events
          const events = parseSSE(data);
          resolve({ status: res.statusCode, events, raw: data });
        } else {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(data), raw: data });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error("timeout " + method)));
    req.write(body);
    req.end();
  });
}

async function init() {
  console.log("→ initialize...");
  const r = await mcpPost("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "restore-script", version: "1.0" },
  });
  console.log("  status:", r.status, "| session:", sessionId);
  if (r.json) console.log("  server:", r.json?.result?.serverInfo ?? JSON.stringify(r.json).slice(0, 120));
  if (r.events?.length) console.log("  events:", JSON.stringify(r.events[0]).slice(0, 200));

  // Send initialized notification (required by MCP spec)
  await mcpPost("notifications/initialized", {});
  console.log("  initialized notification sent\n");
}

async function listTools() {
  const r = await mcpPost("tools/list", {});
  const tools =
    r.json?.result?.tools ??
    r.events?.find((e) => e.result?.tools)?.result?.tools ??
    [];
  console.log("Tools available:", tools.map((t) => t.name));
  return tools;
}

async function callTool(name, args) {
  console.log(`→ tools/call ${name}`, JSON.stringify(args).slice(0, 120));
  const r = await mcpPost("tools/call", { name, arguments: args });

  // Extract result content
  const res =
    r.json?.result ??
    r.events?.find((e) => e.result !== undefined)?.result;

  if (res?.isError) {
    console.error("Tool error:", JSON.stringify(res.content ?? res));
    return null;
  }

  const text =
    (Array.isArray(res?.content) ? res.content.map((c) => c.text ?? "").join("") : null) ??
    JSON.stringify(res ?? r.raw).slice(0, 500);

  return { text, res, raw: r };
}

async function main() {
  const [, , cmd, arg1, arg2] = process.argv;

  await init();

  if (cmd === "list-tools") {
    await listTools();
    return;
  }

  if (cmd === "describe-tool") {
    if (!arg1) { console.error("Usage: describe-tool <toolName>"); process.exit(1); }
    const tools = await listTools();
    const tool = tools.find((item) => item.name === arg1);
    console.log(JSON.stringify(tool ?? null, null, 2));
    return;
  }

  if (cmd === "read-file") {
    if (!arg1) { console.error("Usage: read-file <serverPath>"); process.exit(1); }
    const result = await callTool("read_file", { path: arg1 });
    if (result) console.log("Content (first 500 chars):\n", result.text.slice(0, 500));
    return;
  }

  if (cmd === "list-files") {
    if (!arg1) { console.error("Usage: list-files <serverPath>"); process.exit(1); }
    const result = await callTool("list_files", { path: arg1 });
    if (result) console.log(result.text);
    return;
  }

  if (cmd === "call-tool") {
    if (!arg1) { console.error("Usage: call-tool <toolName> [jsonArgs]"); process.exit(1); }
    const args = arg2 ? JSON.parse(arg2) : {};
    const result = await callTool(arg1, args);
    if (result) console.log(result.text);
    return;
  }

  if (cmd === "write-file") {
    if (!arg1 || !arg2) { console.error("Usage: write-file <serverPath> <localPath>"); process.exit(1); }
    let content = readFileSync(arg2, "utf8");
    // Strip line-number prefix if present (NNN\t format from Claude Read tool)
    content = content.replace(/^\d+\t/gm, "");
    console.log(`  Writing ${content.length} chars to ${arg1}`);
    const result = await callTool("write_file", { path: arg1, content });
    if (result) console.log("Write result:", result.text);
    return;
  }

  if (cmd === "copy-file") {
    if (!arg1 || !arg2) { console.error("Usage: copy-file <sourcePath> <destinationPath>"); process.exit(1); }
    const result = await callTool("copy_file", { directories: [arg1], destination_path: arg2 });
    if (result) console.log("Copy result:", result.text);
    return;
  }

  if (cmd === "create-directory") {
    if (!arg1 || !arg2) { console.error("Usage: create-directory <parentPath> <name>"); process.exit(1); }
    const result = await callTool("create_directory", { path: arg1, name: arg2 });
    if (result) console.log("Create directory result:", result.text);
    return;
  }

  if (cmd === "delete-file") {
    if (!arg1) { console.error("Usage: delete-file <serverPath>"); process.exit(1); }
    const result = await callTool("delete_file", { path: arg1, type: "file" });
    if (result) console.log("Delete result:", result.text);
    return;
  }

  if (cmd === "delete-directory") {
    if (!arg1) { console.error("Usage: delete-directory <serverPath>"); process.exit(1); }
    const result = await callTool("delete_file", { path: arg1, type: "directory" });
    if (result) console.log("Delete directory result:", result.text);
    return;
  }

  if (cmd === "purge-cache") {
    const result = await callTool("purge_wordpress_cache", { domain: "thongtaccongquangninh.com" });
    if (result) console.log("Purge result:", result.text);
    return;
  }

  console.log("Commands: list-tools | describe-tool <toolName> | list-files <path> | read-file <path> | copy-file <sourcePath> <destinationPath> | create-directory <parentPath> <name> | write-file <serverPath> <localPath> | delete-file <serverPath> | delete-directory <serverPath> | call-tool <toolName> [jsonArgs] | purge-cache");
}

main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
