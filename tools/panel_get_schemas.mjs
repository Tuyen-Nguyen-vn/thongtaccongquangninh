/**
 * Get 1Panel MCP tool schemas for read_file and write_file
 */
import https from "node:https";

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
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    req.write(body);
    req.end();
  });
}

async function main() {
  // Initialize
  const initR = await mcpPost("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "schema-check", version: "1.0" } });
  console.log("Session:", sessionId);
  await mcpPost("notifications/initialized", {});

  // Get full tool list with schemas
  const toolsR = await mcpPost("tools/list", {});
  const tools = toolsR.json?.result?.tools ?? toolsR.events?.find(e => e.result?.tools)?.result?.tools ?? [];

  // Find read_file, write_file schemas
  for (const t of tools) {
    if (['read_file', 'write_file', 'list_files', 'get_error_logs'].includes(t.name)) {
      console.log(`\n=== ${t.name} ===`);
      console.log(JSON.stringify(t.inputSchema ?? t.input_schema ?? {}, null, 2));
    }
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
