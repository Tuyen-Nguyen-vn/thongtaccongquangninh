import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) {
  const e = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return e;
}
const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
let SID = null;

function mcpReq(endpoint, body) {
  return new Promise((resolve, reject) => {
    const b = Buffer.from(JSON.stringify(body), "utf8");
    const o = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: `/wp-json/mcp/${endpoint}`, method: "POST",
      headers: {
        Host: WP_HOST, Authorization: auth,
        "Content-Type": "application/json", "Content-Length": b.length,
        ...(SID ? { "Mcp-Session-Id": SID } : {}),
      },
      rejectUnauthorized: false,
    };
    const r = https.request(o, resp => {
      let d = ""; resp.on("data", c => d += c);
      resp.on("end", () => {
        if (!SID && resp.headers["mcp-session-id"]) SID = resp.headers["mcp-session-id"];
        try { resolve({ s: resp.statusCode, d: JSON.parse(d), sid: resp.headers["mcp-session-id"] }); }
        catch { resolve({ s: resp.statusCode, d }); }
      });
    });
    r.on("error", reject); r.setTimeout(20000, () => r.destroy(new Error("t")));
    r.write(b); r.end();
  });
}

// Try mcp-adapter-default-server
console.log("=== mcp-adapter-default-server ===");
const init1 = await mcpReq("mcp-adapter-default-server", {
  jsonrpc: "2.0", id: 1, method: "initialize",
  params: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, clientInfo: { name: "test", version: "1" } }
});
console.log("Init status:", init1.s, "SID:", SID);
console.log("Response:", JSON.stringify(init1.d).slice(0, 300));

if (SID) {
  const tools1 = await mcpReq("mcp-adapter-default-server", { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  console.log("\nTools:", JSON.stringify(tools1.d).slice(0, 800));
}

// Try wp-mcp-ultimate with initialized notification
SID = null;
console.log("\n=== wp-mcp-ultimate (new protocol) ===");
const init2 = await mcpReq("wp-mcp-ultimate", {
  jsonrpc: "2.0", id: 1, method: "initialize",
  params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "test", version: "1" } }
});
console.log("Init status:", init2.s, "SID:", SID || init2.sid);
const sid2 = SID || init2.sid;

if (sid2) {
  SID = sid2;
  // Send initialized notification
  await mcpReq("wp-mcp-ultimate", { jsonrpc: "2.0", method: "notifications/initialized" });
  const tools2 = await mcpReq("wp-mcp-ultimate", { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  console.log("Tools count:", tools2.d?.result?.tools?.length ?? 0);
  if (tools2.d?.result?.tools?.length > 0) {
    tools2.d.result.tools.slice(0, 10).forEach(t => console.log(" -", t.name));
    console.log("...");
  } else {
    console.log("Full response:", JSON.stringify(tools2.d).slice(0, 400));
  }
}
