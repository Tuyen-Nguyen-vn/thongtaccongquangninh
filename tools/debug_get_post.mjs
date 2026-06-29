import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
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

function mcpPost(body) {
  return new Promise((resolve, reject) => {
    const b = Buffer.from(JSON.stringify(body), "utf8");
    const o = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: `/wp-json/mcp/mcp-adapter-default-server`, method: "POST",
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
        try { resolve(JSON.parse(d)); } catch { resolve(d); }
      });
    });
    r.on("error", reject); r.setTimeout(30000, () => r.destroy(new Error("t")));
    r.write(b); r.end();
  });
}

await mcpPost({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "agent", version: "1" } } });
await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" });

// Get ability info for content/get-post and content/get-page
for (const ability of ["content/get-post", "content/get-page", "content/update-post", "content/patch-post"]) {
  const r = await mcpPost({
    jsonrpc: "2.0", id: Date.now(), method: "tools/call",
    params: { name: "mcp-adapter-get-ability-info", arguments: { ability_name: ability } }
  });
  const text = r?.result?.content?.[0]?.text ?? "{}";
  const data = JSON.parse(text);
  console.log(`\n${ability}:`);
  console.log("  Params:", JSON.stringify(data?.input_schema?.properties ?? data?.parameters ?? "unknown").slice(0, 200));
}
