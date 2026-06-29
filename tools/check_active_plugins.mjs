import { readFileSync } from "node:fs";
const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
}
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const endpoint = (env.WP_BASE_URL || "https://thongtaccongquangninh.com") + "/wp-json/mcp/wp-mcp-ultimate";

let SID = null;
async function rpc(method, params, id) {
  const headers = { Authorization: auth, "Content-Type": "application/json", Accept: "application/json" };
  if (SID) headers["Mcp-Session-Id"] = SID;
  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  if (!SID) SID = res.headers.get("mcp-session-id");
  return res.json();
}
const response = await fetch((env.WP_BASE_URL || "https://thongtaccongquangninh.com") + "/wp-json/wp/v2/plugins?context=edit&per_page=100", {
  headers: { Authorization: auth, "User-Agent": "Codex inspect plugins" },
});
const plugins = await response.json();
console.log("Plugins status:");
if (Array.isArray(plugins)) {
  plugins.forEach(p => {
    console.log(`- ${p.name} (${p.plugin}): ${p.status}`);
  });
} else {
  console.log(JSON.stringify(plugins, null, 2));
}
// End of script
