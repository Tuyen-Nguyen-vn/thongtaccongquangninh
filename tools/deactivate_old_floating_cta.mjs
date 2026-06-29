/**
 * Tìm và deactivate plugin floating CTA cũ (bên phải) trên live.
 * Chạy trước khi upload plugin mới để không chồng chéo.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { env as shellEnv, platform } from "node:process";

function firstExisting(paths) {
  return paths.find((p) => existsSync(p)) || paths[0];
}

const PROJECT_ROOT =
  platform === "linux" && existsSync("/mnt/d/.thongtaccongquangninh")
    ? "/mnt/d/.thongtaccongquangninh"
    : firstExisting(["D:\\.thongtaccongquangninh", "/mnt/d/.thongtaccongquangninh"]);
const ROOT_IS_POSIX = PROJECT_ROOT.startsWith("/");
const fromRoot = (...p) =>
  ROOT_IS_POSIX ? [PROJECT_ROOT, ...p].join("/") : [PROJECT_ROOT, ...p].join("\\");

const ENV_PATH = firstExisting([
  fromRoot(".env"),
  "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env",
]);

function readEnvFile(filePath) {
  try {
    const out = {};
    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
    }
    return out;
  } catch { return {}; }
}

const fileEnv = readEnvFile(ENV_PATH);
const WP_BASE_URL  = fileEnv.WP_BASE_URL  || shellEnv.WP_BASE_URL  || "https://thongtaccongquangninh.com";
const WP_USERNAME  = fileEnv.WP_USERNAME  || shellEnv.WP_USERNAME;
const WP_APP_PASSWORD = fileEnv.WP_APP_PASSWORD || shellEnv.WP_APP_PASSWORD;

if (!WP_USERNAME || !WP_APP_PASSWORD) throw new Error("Missing WP credentials");

const baseUrl  = WP_BASE_URL.replace(/\/$/, "");
const auth     = `Basic ${Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString("base64")}`;
const endpoint = `${baseUrl}/wp-json/mcp/wp-mcp-ultimate`;

async function rpc(method, params, id, sessionId) {
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "User-Agent": "Codex deactivate-old-cta",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  let payload;
  try { payload = await res.json(); } catch { payload = {}; }
  return { status: res.status, sessionId: res.headers.get("mcp-session-id"), payload };
}

async function callAbility(sessionId, ability, params, id) {
  return rpc("tools/call", { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: ability, parameters: params } }, id, sessionId);
}

function extractText(payload) {
  return payload?.result?.content?.[0]?.text ?? JSON.stringify(payload);
}

// 1. Initialize
const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "codex", version: "1" } }, 1);
if (init.status !== 200 || !init.sessionId) throw new Error(`Init failed: ${JSON.stringify(init.payload)}`);
const sid = init.sessionId;

// 2. List all plugins
const list = await callAbility(sid, "plugins/list", {}, 2);
const listText = extractText(list.payload);
console.log("=== Active plugins ===");
console.log(listText);

// 3. Tìm slug plugin cũ (floating CTA phải)
// Thường có dạng: ttcqn-floating-cta/... hoặc tương tự
const OLD_SLUG_PATTERNS = [
  "ttcqn-floating-cta",
  "floating-cta",
  "ttcqn-fcta",
  "mobile-cta",
];
let oldSlug = null;
for (const pat of OLD_SLUG_PATTERNS) {
  if (listText.toLowerCase().includes(pat) && !listText.toLowerCase().includes("mobile-left-sticky")) {
    // Tìm chính xác hơn trong JSON nếu có
    const match = listText.match(new RegExp(`"([^"]*${pat}[^"/]*\/[^"]+)"`, "i"));
    oldSlug = match ? match[1] : pat + "/" + pat + ".php";
    break;
  }
}

if (!oldSlug) {
  console.log("\n✓ Không tìm thấy plugin floating CTA cũ trong danh sách active — không cần deactivate.");
  process.exit(0);
}

console.log(`\nTìm thấy plugin cũ: ${oldSlug} — tiến hành deactivate...`);

// 4. Deactivate
const deact = await callAbility(sid, "plugins/deactivate", { plugin: oldSlug }, 3);
const deactText = extractText(deact.payload);
console.log("Kết quả deactivate:", deactText);

// 5. Verify
const list2 = await callAbility(sid, "plugins/list", { status: "active" }, 4);
const list2Text = extractText(list2.payload);
const stillActive = list2Text.toLowerCase().includes(oldSlug.split("/")[0]);

const report = {
  generatedAt: new Date().toISOString(),
  oldSlug,
  deactivateResult: deactText,
  stillActive,
  success: !stillActive,
};
writeFileSync(fromRoot("DEACTIVATE_OLD_FLOATING_CTA_2026-05-16.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
console.log("\nReport:", JSON.stringify(report.success ? { success: true, oldSlug } : report, null, 2));
if (!report.success) process.exitCode = 1;
