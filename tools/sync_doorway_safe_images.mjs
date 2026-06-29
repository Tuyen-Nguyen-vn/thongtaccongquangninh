import { existsSync, readFileSync } from "node:fs";

const ENV_PATH = existsSync("D:\\.thongtaccongquangninh\\.env")
  ? "D:\\.thongtaccongquangninh\\.env"
  : "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";

function parseEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

async function rpc(url, auth, method, params, id) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Codex Image Sync Tool",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const raw = await response.text();
  let payload;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = { error: "Failed to parse JSON", raw };
  }
  return {
    payload,
    sessionId: response.headers.get("mcp-session-id")
  };
}

async function rpcWithSession(url, auth, sessionId, method, params, id) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Mcp-Session-Id": sessionId,
      "User-Agent": "Codex Image Sync Tool",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const raw = await response.text();
  let payload;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = { error: "Failed to parse JSON", raw };
  }
  return {
    payload,
    sessionId: response.headers.get("mcp-session-id")
  };
}

async function main() {
  const env = parseEnv(ENV_PATH);
  const baseUrl = env.WP_BASE_URL || "https://thongtaccongquangninh.com";
  const auth = `Basic ${Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64")}`;
  const endpoint = `${baseUrl}/wp-json/mcp/wp-mcp-ultimate`;

  console.log("Starting doorway option image sync...");
  console.log(`Base URL: ${baseUrl}`);

  // 1. Lấy post_content của page ID 296 (/thong-tac-cong-ha-long/)
  console.log("Fetching page content for ID 296...");
  const pageRes = await fetch(`${baseUrl}/wp-json/wp/v2/pages/296?context=edit`, {
    headers: { Authorization: auth },
  });
  if (!pageRes.ok) {
    console.error(`Failed to fetch page 296. HTTP Status: ${pageRes.status}`);
    return;
  }
  const pageData = await pageRes.json();
  const postContent = pageData.content?.raw || pageData.content?.rendered || "";
  console.log(`Page content fetched successfully. Length: ${postContent.length} characters.`);

  if (!postContent.includes("<img") && !postContent.includes("wp:image")) {
    console.warn("Warning: post_content does not contain any images! Please double check if images were actually inserted.");
  }

  // 2. Gọi initialize RPC
  console.log("Initializing MCP connection...");
  const initResult = await rpc(endpoint, auth, "initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "codex-sync-tool", version: "1.0.0" },
  }, 1);

  const sessionId = initResult?.sessionId;
  if (!sessionId) {
    console.error("Failed to obtain MCP Session ID from initialization response headers:", JSON.stringify(initResult));
    return;
  }
  console.log(`MCP Session initialized. Session ID: ${sessionId}`);

  // 3. Backup option cũ trước khi sửa
  console.log("Fetching old option value for backup...");
  const getOptRes = await rpcWithSession(endpoint, auth, sessionId, "tools/call", {
    name: "wp-mcp-ultimate-execute-ability",
    arguments: {
      ability_name: "options/get",
      parameters: { name: "ttcqn_doorway_safe_page_296_content_v2" }
    }
  }, 2);
  
  const textVal = getOptRes?.payload?.result?.content?.[0]?.text;
  let oldVal = "";
  if (textVal) {
    try {
      const parsed = JSON.parse(textVal);
      oldVal = parsed.data || "";
    } catch {}
  }
  console.log(`Old option fetched. Length: ${oldVal.length} chars.`);

  // 4. Update option ttcqn_doorway_safe_page_296_content_v2
  console.log("Updating option ttcqn_doorway_safe_page_296_content_v2 with new post_content...");
  const updateOptRes = await rpcWithSession(endpoint, auth, sessionId, "tools/call", {
    name: "wp-mcp-ultimate-execute-ability",
    arguments: {
      ability_name: "options/update",
      parameters: {
        name: "ttcqn_doorway_safe_page_296_content_v2",
        value: postContent
      }
    }
  }, 3);

  console.log("Update Option Response:", JSON.stringify(updateOptRes.payload, null, 2));

  // 5. Cập nhật option cũ ttcqn_doorway_safe_page_296_content (nếu có dùng v1)
  console.log("Updating option ttcqn_doorway_safe_page_296_content...");
  const updateOptV1Res = await rpcWithSession(endpoint, auth, sessionId, "tools/call", {
    name: "wp-mcp-ultimate-execute-ability",
    arguments: {
      ability_name: "options/update",
      parameters: {
        name: "ttcqn_doorway_safe_page_296_content",
        value: postContent
      }
    }
  }, 4);
  console.log("Update Option V1 Response:", JSON.stringify(updateOptV1Res.payload, null, 2));

  console.log("Doorway options sync completed successfully.");
}

main().catch(console.error);
