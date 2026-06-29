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

function mcpReq(body) {
  return new Promise((resolve, reject) => {
    const b = Buffer.from(JSON.stringify(body), "utf8");
    const o = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json/mcp/wp-mcp-ultimate", method: "POST",
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
        catch { resolve({ s: resp.statusCode, d, sid: resp.headers["mcp-session-id"] }); }
      });
    });
    r.on("error", reject); r.setTimeout(20000, () => r.destroy(new Error("timeout")));
    r.write(b); r.end();
  });
}

// Initialize
const init = await mcpReq({ jsonrpc: "2.0", id: 1, method: "initialize",
  params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "check", version: "1" } } });
console.log("Init status:", init.s, "SID:", SID || init.sid);
console.log("Init response:", JSON.stringify(init.d).slice(0, 200));

// List tools
const tools = await mcpReq({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
console.log("\nTools status:", tools.s);
if (tools.d?.result?.tools) {
  console.log("Available tools:");
  for (const t of tools.d.result.tools) {
    console.log(" -", t.name);
  }
} else {
  console.log("Response:", JSON.stringify(tools.d).slice(0, 500));
}
