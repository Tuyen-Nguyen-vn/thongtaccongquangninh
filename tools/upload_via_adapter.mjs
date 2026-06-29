/**
 * Upload plugin qua mcp-adapter-default-server / mcp-adapter-execute-ability
 * Dùng ability plugins/upload-base64
 */
import https from "node:https";
import { existsSync, readFileSync } from "node:fs";
import { platform } from "node:process";

const PROJECT_ROOT = platform === "linux" ? "/mnt/d/.thongtaccongquangninh" : "D:\\.thongtaccongquangninh";
const SEP = platform === "linux" ? "/" : "\\";
const fromRoot = (...parts) => [PROJECT_ROOT, ...parts].join(SEP);
const ENV_PATH = existsSync(fromRoot(".env"))
  ? fromRoot(".env")
  : platform === "linux"
    ? "/mnt/c/Users/DELL/Documents/Codex/2026-04-28/chatgpt-apps-plugin-chatgpt-apps-openai/.env"
    : "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210";
const WP_HOST = "thongtaccongquangninh.com";

const PLUGIN_SLUG = process.argv[2] || "ttcqn-seo-cleanup-redirects";
const ZIP_PATH = fromRoot("tools", "wp-plugins", `${PLUGIN_SLUG}.zip`);

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
    r.on("error", reject); r.setTimeout(60000, () => r.destroy(new Error("timeout")));
    r.write(b); r.end();
  });
}

function checkLive(path) {
  return new Promise((res, rej) => {
    const opts = {
      hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path, method: "GET",
      headers: { Host: WP_HOST, "User-Agent": "redirectcheck/1" },
      rejectUnauthorized: false,
    };
    const r = https.request(opts, resp => res({ code: resp.statusCode, loc: resp.headers.location || "" }));
    r.on("error", rej); r.setTimeout(10000, () => r.destroy(new Error("t"))); r.end();
  });
}

// Init
console.log("Initializing MCP adapter...");
await mcpPost({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, clientInfo: { name: "agent", version: "1" } } });
await mcpPost({ jsonrpc: "2.0", method: "notifications/initialized" });

// Read and encode ZIP
const zipContent = readFileSync(ZIP_PATH);
const zipBase64 = zipContent.toString("base64");
const filename = `${PLUGIN_SLUG}.zip`;
console.log(`Uploading ${filename} (${(zipContent.length / 1024).toFixed(1)} KB) via adapter...`);

// Execute upload
const uploadR = await mcpPost({
  jsonrpc: "2.0", id: 2, method: "tools/call",
  params: {
    name: "mcp-adapter-execute-ability",
    arguments: {
      ability_name: "plugins/upload-base64",
      parameters: {
        content_base64: zipBase64,
        filename,
        activate: true,
        overwrite: true,
      },
    },
  },
});

const resultText = uploadR?.result?.content?.[0]?.text ?? JSON.stringify(uploadR);
console.log("Upload result:", resultText.slice(0, 500));

let success = false;
try {
  const parsed = JSON.parse(resultText);
  success = parsed?.success === true || parsed?.status === "active" || parsed?.activated === true;
  if (!success && parsed?.message) console.log("Message:", parsed.message);
} catch {
  success = resultText.includes("active") || resultText.includes("success");
}

if (PLUGIN_SLUG === "ttcqn-seo-cleanup-redirects") {
  await new Promise(r => setTimeout(r, 3000));
  const liveCheck = await checkLive("/category/nao-vet-ho-ga/");
  console.log(`\nLive: /category/nao-vet-ho-ga/ -> HTTP ${liveCheck.code}${liveCheck.loc ? " -> " + liveCheck.loc : ""}`);
  const redirectOk = liveCheck.code === 301 && liveCheck.loc.includes("nao-vet-ho-ga-quang-ninh");
  if (redirectOk) success = true;
}

console.log(`\n${success ? "OK" : "FAIL"} Plugin upload ${PLUGIN_SLUG} ${success ? "thanh cong" : "that bai"}.`);
if (!success) process.exitCode = 1;
