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

// Initialize
await mcpPost({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "agent", version: "1" } } });
await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" });

// Discover abilities
const discoverR = await mcpPost({
  jsonrpc: "2.0", id: 2, method: "tools/call",
  params: { name: "mcp-adapter-discover-abilities", arguments: {} }
});

const abilities = discoverR?.result?.content?.[0]?.text;
if (abilities) {
  const parsed = JSON.parse(abilities);
  console.log("Total abilities:", parsed.abilities?.length ?? "unknown");
  console.log("\nPlugin-related:");
  parsed.abilities?.filter(a => a.name.includes("plugin")).forEach(a => console.log(" -", a.name, ":", a.description));
  console.log("\nAll abilities:");
  parsed.abilities?.forEach(a => console.log(" -", a.name));
} else {
  console.log("Raw response:", JSON.stringify(discoverR).slice(0, 800));
}
