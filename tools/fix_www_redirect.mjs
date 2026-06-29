// Fix www → non-www redirect trong .htaccess qua WP MCP
import { readFileSync } from "node:fs";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
function readEnv() {
  const env = {};
  for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const env = readEnv();
const BASE = (env.WP_BASE_URL || "https://thongtaccongquangninh.com").replace(/\/$/, "");
const AUTH = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
const ENDPOINT = `${BASE}/wp-json/mcp/wp-mcp-ultimate`;
const HTACCESS = "/home/yerdchtihosting/public_html/.htaccess";

async function rpc(method, params, sessionId, id = 1) {
  const headers = {
    Authorization: AUTH,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const text = await res.text();
  return { sid: res.headers.get("mcp-session-id"), payload: JSON.parse(text) };
}

async function ability(sid, name, parameters, id = 2) {
  return rpc("tools/call", {
    name: "wp-mcp-ultimate-execute-ability",
    arguments: { ability_name: name, parameters },
  }, sid, id);
}

// 1. Initialize
const init = await rpc("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "fix-www-redirect", version: "1.0" },
}, null);
const SID = init.sid || init.payload?.result?.sessionId;
console.log("Session ID:", SID);

// 2. Đọc .htaccess hiện tại
const readRes = await ability(SID, "file-read", { path: HTACCESS }, 2);
const currentContent = readRes.payload?.result?.content?.[0]?.text || "";
console.log("Current .htaccess (first 400 chars):\n", currentContent.slice(0, 400));

// 3. Kiểm tra đã có www redirect chưa
if (currentContent.includes("www.thongtaccongquangninh.com")) {
  console.log("✅ www redirect đã có sẵn, không cần sửa.");
  process.exit(0);
}

// 4. Thêm www → non-www redirect TRƯỚC phần WordPress rules
const WWW_REDIRECT = `# BEGIN www redirect
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{HTTP_HOST} ^www\\.thongtaccongquangninh\\.com$ [NC]
RewriteRule ^(.*)$ https://thongtaccongquangninh.com/$1 [R=301,L]
</IfModule>
# END www redirect

`;

let newContent;
if (currentContent.includes("# BEGIN WordPress")) {
  newContent = currentContent.replace("# BEGIN WordPress", WWW_REDIRECT + "# BEGIN WordPress");
} else {
  newContent = WWW_REDIRECT + currentContent;
}

// 5. Ghi lại
const writeRes = await ability(SID, "file-write", { path: HTACCESS, content: newContent }, 3);
console.log("Write result:", JSON.stringify(writeRes.payload, null, 2));

// 6. Verify
const verifyRes = await ability(SID, "file-read", { path: HTACCESS }, 4);
const verifiedContent = verifyRes.payload?.result?.content?.[0]?.text || "";
console.log(verifiedContent.includes("www.thongtaccongquangninh.com")
  ? "✅ www redirect đã được ghi vào .htaccess thành công."
  : "❌ Ghi thất bại.");
