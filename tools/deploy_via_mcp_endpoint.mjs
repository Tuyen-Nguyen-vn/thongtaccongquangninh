/**
 * Deploy mu-plugin qua WP MCP Ultimate endpoint.
 * Protocol: initialize session → tools/list → call write_file tool (nếu có).
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

function req(method, path, auth, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST, path: "/wp-json" + path, method,
      headers: {
        Host: WP_HOST, Authorization: auth, "User-Agent": "mcp-client/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}),
        ...extraHeaders,
      },
      rejectUnauthorized: false,
    };
    const r = https.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => {
        const headers = res.headers;
        try { resolve({ status: res.statusCode, data: JSON.parse(d), headers }); }
        catch { resolve({ status: res.statusCode, data: d, headers }); }
      });
    });
    r.on("error", reject); r.setTimeout(30000, () => r.destroy(new Error("timeout")));
    if (bodyBuf) r.write(bodyBuf);
    r.end();
  });
}

(async () => {
  const env  = parseEnv(ENV_PATH);
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const phpContent = readFileSync(PHP_FILE, "utf8");

  console.log("=== 1. Initialize MCP session ===");
  const init = await req("POST", "/mcp/wp-mcp-ultimate", auth, {
    jsonrpc: "2.0", id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      clientInfo: { name: "ttcqn-deploy", version: "1.0" },
    },
  });
  console.log("Status:", init.status);
  console.log("Session header:", init.headers?.["mcp-session-id"] ?? "(none)");
  console.log("Data:", JSON.stringify(init.data).slice(0, 400));

  const sessionId = init.headers?.["mcp-session-id"] ?? init.data?.result?.sessionId ?? null;
  if (!sessionId) { console.log("\n✗ No session ID. Thử với header trước..."); }

  const headers = sessionId ? { "Mcp-Session-Id": sessionId } : {};

  console.log("\n=== 2. List tools ===");
  const list = await req("POST", "/mcp/wp-mcp-ultimate", auth, {
    jsonrpc: "2.0", id: 2, method: "tools/list", params: {}
  }, headers);
  console.log("Status:", list.status);
  const tools = list.data?.result?.tools ?? [];
  if (tools.length > 0) {
    console.log(`Tools (${tools.length}):`);
    for (const t of tools) {
      const params = Object.keys(t.inputSchema?.properties ?? {}).join(", ");
      console.log(`  [${t.name}] ${t.description?.slice(0,60)} | params: ${params}`);
    }

    // Tìm file write tool
    const writeTool = tools.find(t =>
      t.name.includes("write") || t.name.includes("file") || t.name.includes("create") || t.name.includes("upload")
    );
    if (writeTool) {
      console.log(`\n=== 3. Call ${writeTool.name} ===`);
      const call = await req("POST", "/mcp/wp-mcp-ultimate", auth, {
        jsonrpc: "2.0", id: 3,
        method: "tools/call",
        params: {
          name: writeTool.name,
          arguments: {
            path: "/wp-content/mu-plugins/ttcqn-fix-home-img-alt.php",
            content: phpContent,
            filename: "ttcqn-fix-home-img-alt.php",
          },
        },
      }, headers);
      console.log("Status:", call.status);
      console.log("Result:", JSON.stringify(call.data).slice(0, 400));
    } else {
      console.log("\n→ Không tìm thấy file write tool.");
      console.log("Available:", tools.map(t => t.name).join(", "));
    }
  } else {
    console.log("Data:", JSON.stringify(list.data).slice(0, 500));
  }
})().catch(e => console.error(e.stack ?? e.message));
