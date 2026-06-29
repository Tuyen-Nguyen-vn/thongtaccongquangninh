import { readFileSync } from "node:fs";
const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
}
const auth = "Basic " + Buffer.from("chatgpt:G62y T4fU 41TV IqJ0 04ae lT2i").toString("base64");
const endpoint = (env.WP_BASE_URL || "https://thongtaccongquangninh.com") + "/wp-json/mcp/wp-mcp-ultimate?cb=" + Date.now();

let SID = null;
async function rpc(method, params, id) {
  const headers = {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  };
  if (SID) headers["Mcp-Session-Id"] = SID;
  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });

  // Log headers
  console.log(`RPC method=${method} res_headers:`);
  for (const [k, v] of res.headers.entries()) {
    console.log(`  ${k}: ${v}`);
  }

  if (!SID) {
    SID = res.headers.get("mcp-session-id");
    console.log(`Assigned SID: ${SID}`);
  }
  return res.json();
}
async function ability(name, params) {
  return rpc("tools/call", { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: name, parameters: params } }, Date.now());
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const initRes = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "check-options", version: "1" } }, 1);
console.log("Initialize Result:", JSON.stringify(initRes, null, 2));

console.log("Waiting 3 seconds for session to stabilize on server...");
await sleep(3000);

console.log("Calling tools/list...");
const listRes = await rpc("tools/list", {}, 2);
console.log("Tools List Result:", JSON.stringify(listRes, null, 2));
