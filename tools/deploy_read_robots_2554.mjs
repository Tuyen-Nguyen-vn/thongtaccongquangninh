import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import https from "node:https";

const ENV_PATH = "D:\\.thongtaccongquangninh\\.env";
const env = {};
for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
}
const auth = "Basic " + Buffer.from(`${env.WP_USERNAME}:${env.WP_APP_PASSWORD}`).toString("base64");
const WPH = "thongtaccongquangninh.com", SIP = "103.57.220.210";
const endpoint = (env.WP_BASE_URL || "https://"+WPH) + "/wp-json/mcp/wp-mcp-ultimate";

const SLUG = "ttcqn-read-robots-2554";
const PLUGIN_FILE = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}\\${SLUG}.php`;
const ZIP_PATH   = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}.zip`;

if (existsSync(ZIP_PATH)) execSync(`powershell -Command "Remove-Item '${ZIP_PATH}' -Force"`, {stdio:"pipe"});
execSync(`python -c "import zipfile; zf = zipfile.ZipFile(r'${ZIP_PATH}', 'w', zipfile.ZIP_DEFLATED); zf.write(r'${PLUGIN_FILE}', '${SLUG}/${SLUG}.php'); zf.close()"`, {stdio:"pipe"});

let SID = null;
async function rpc(method, params, id) {
  const headers = { Authorization: auth, "Content-Type": "application/json", Accept: "application/json" };
  if (SID) headers["Mcp-Session-Id"] = SID;
  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  if (!SID) SID = res.headers.get("mcp-session-id");
  return res.json();
}
async function ability(name, params) {
  return rpc("tools/call", { name: "wp-mcp-ultimate-execute-ability", arguments: { ability_name: name, parameters: params } }, Date.now());
}
function wpGet(path) {
  return new Promise((res,rej)=>{
    const o={hostname:SIP,port:443,servername:WPH,path,method:"GET",headers:{Host:WPH,Authorization:auth},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    r.on("error",rej);r.setTimeout(10000,()=>r.destroy());r.end();
  });
}

await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "read-robots-2554", version: "1" } }, 1);
const zipB64 = readFileSync(ZIP_PATH).toString("base64");
const r = await ability("plugins/upload-base64", { content_base64: zipB64, filename: `${SLUG}.zip`, activate: true, overwrite: true });
console.log("Deploy:", JSON.stringify(r).includes("activated") ? "✓" : "✗", JSON.stringify(r).slice(0,150));

// Read option
await new Promise(r => setTimeout(r, 2000));
const opts = await ability("options/get", { name: "ttcqn_debug_robots_2554" });
console.log("Before delete:", JSON.stringify(opts).slice(0,400));

const opts2 = await ability("options/get", { name: "ttcqn_debug_robots_2554_after" });
console.log("After delete:", JSON.stringify(opts2).slice(0,400));
