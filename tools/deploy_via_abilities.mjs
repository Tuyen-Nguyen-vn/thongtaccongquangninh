/**
 * Deploy mu-plugin qua WP MCP Ultimate "abilities" system.
 */
import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH  = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST   = "thongtaccongquangninh.com";
const PHP_FILE  = "D:\\.thongtaccongquangninh\\tools\\mu-plugins\\ttcqn-fix-home-img-alt.php";

function parseEnv(p) {
  const env = {};
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

let SESSION_ID = null;

function req(method, path, auth, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/wp-json" + path, method,
      headers: {
        Host: WP_HOST, Authorization: auth, "User-Agent": "mcp-client/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
        ...(SESSION_ID ? { "Mcp-Session-Id": SESSION_ID } : {}),
      },
      rejectUnauthorized: false,
    };
    const r = https.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => {
        if (!SESSION_ID && res.headers?.["mcp-session-id"]) SESSION_ID = res.headers["mcp-session-id"];
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    r.on("error", reject); r.setTimeout(30000, () => r.destroy(new Error("timeout")));
    if (bodyBuf) r.write(bodyBuf);
    r.end();
  });
}

function mcpCall(auth, method, params = {}) {
  return req("POST", "/mcp/wp-mcp-ultimate", auth, {
    jsonrpc: "2.0", id: Date.now(), method, params,
  });
}

function executeTool(auth, toolName, args) {
  return mcpCall(auth, "tools/call", { name: toolName, arguments: args });
}

(async () => {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const phpContent = readFileSync(PHP_FILE, "utf8");

  // Initialize session
  await mcpCall(auth, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: { tools: {} },
    clientInfo: { name: "ttcqn-deploy", version: "1.0" },
  });
  console.log("Session:", SESSION_ID);

  // 1. Discover all abilities
  console.log("\n=== Discover abilities ===");
  const discoverR = await executeTool(auth, "wp-mcp-ultimate-discover-abilities", {});
  const abilities = discoverR.data?.result?.content?.[0]?.text ?? "";
  console.log(abilities.slice(0, 3000));

  // Parse ability names that look like file operations
  const fileAbilities = abilities.split("\n").filter(l =>
    /file|write|create|upload|filesystem|plugin|mu.plugin/i.test(l)
  );
  console.log("\n=== File-related abilities ===");
  console.log(fileAbilities.join("\n") || "(none found)");

})().catch(e => console.error(e.stack ?? e.message));
