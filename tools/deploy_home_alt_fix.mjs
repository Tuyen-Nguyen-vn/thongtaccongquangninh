/**
 * Surgically update ONE template file (page-home-direct.php) on the live server
 * via the filesystem MCP, fixing 4 homepage benefit-icon alts that lacked
 * service/location terms (audit: IMG:ALT_NO_SERVICE_OR_LOCATION on /).
 * Backs up the remote file locally before overwriting.
 */
import https from "node:https";
import { readFileSync, writeFileSync } from "node:fs";

const MCP_HOST = "onehost-wphn022606.000nethost.com";
const MCP_PORT = 2023;
const MCP_PATH = "/api/mcp";
const TOKEN = "sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
const WP_ROOT = "/public_html";
const REL = "wp-content/plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php";
const REMOTE = `${WP_ROOT}/${REL}`;
const LOCAL = "D:/.thongtaccongquangninh/tools/wp-plugins/ttcqn-home-emergency-renderer/templates/page-home-direct.php";
const BACKUP = `D:/.thongtaccongquangninh/tools/_backup_page-home-direct.remote.${Date.now()}.php`;

let sessionId = null, msgId = 1;
function parseSSE(t){const r=[];for(const l of t.split("\n")){if(l.startsWith("data: ")){const x=l.slice(6).trim();if(x==="[DONE]")continue;try{r.push(JSON.parse(x));}catch{}}}return r;}
function mcpPost(method, params){return new Promise((resolve,reject)=>{const body=JSON.stringify({jsonrpc:"2.0",id:msgId++,method,params:params??{}});const headers={Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json",Accept:"application/json, text/event-stream","Content-Length":Buffer.byteLength(body)};if(sessionId)headers["Mcp-Session-Id"]=sessionId;const req=https.request({hostname:MCP_HOST,port:MCP_PORT,path:MCP_PATH,method:"POST",headers,rejectUnauthorized:false},(res)=>{if(res.headers["mcp-session-id"])sessionId=res.headers["mcp-session-id"];let d="";res.on("data",c=>d+=c);res.on("end",()=>{const ct=res.headers["content-type"]??"";if(ct.includes("text/event-stream"))resolve({status:res.statusCode,events:parseSSE(d),raw:d});else{try{resolve({status:res.statusCode,json:JSON.parse(d)});}catch{resolve({status:res.statusCode,raw:d});}}});});req.on("error",reject);req.setTimeout(90000,()=>req.destroy(new Error("timeout "+method)));req.write(body);req.end();});}
function extractText(r){const res=r.json?.result??r.events?.find(e=>e.result!==undefined)?.result;if(!res)return JSON.stringify(r.raw??r.json??"").slice(0,300);if(res?.isError)return "TOOL_ERROR: "+JSON.stringify(res.content??res);return (Array.isArray(res?.content)?res.content.map(c=>c.text??"").join(""):null)??JSON.stringify(res).slice(0,500);}
async function callTool(name,args){const r=await mcpPost("tools/call",{name,arguments:args});return extractText(r);}

await mcpPost("initialize",{protocolVersion:"2024-11-05",capabilities:{},clientInfo:{name:"home-alt-fix",version:"1.0"}});
await mcpPost("notifications/initialized",{});
console.log("Session:", sessionId);

// 1. Backup remote
const remoteCur = await callTool("read_file", { path: REMOTE });
if (remoteCur.startsWith("TOOL_ERROR")) { console.error("Read remote failed:", remoteCur); process.exit(1); }
writeFileSync(BACKUP, remoteCur, "utf8");
console.log(`Backup saved: ${BACKUP} (${remoteCur.length} chars)`);

// 2. Sanity: the 4 old alts must exist remotely, and must already be fixed locally
const OLD = [
  'alt="Biểu tượng gửi yêu cầu dịch vụ 24/7"',
  'alt="Biểu tượng bảng giá dịch vụ môi trường"',
  'alt="Biểu tượng chính sách bảo hành dịch vụ"',
  'alt="Biểu tượng cẩm nang xử lý tắc nghẽn"',
];
const missing = OLD.filter(s => !remoteCur.includes(s));
if (missing.length) { console.error("Remote missing expected old alts (already changed?):", missing); process.exit(1); }

const local = readFileSync(LOCAL, "utf8");
const stillOld = OLD.filter(s => local.includes(s));
if (stillOld.length) { console.error("Local file still has old alts — edit not applied:", stillOld); process.exit(1); }
const NEW = [
  'Gửi yêu cầu dịch vụ hút bể phốt, thông tắc cống tại Quảng Ninh',
  'Bảng giá dịch vụ hút bể phốt, thông tắc cống tại Quảng Ninh',
  'Chính sách bảo hành dịch vụ thông tắc cống, hút bể phốt Quảng Ninh',
  'Cẩm nang xử lý tắc cống, nghẹt bồn cầu tại Quảng Ninh',
];
const newMissing = NEW.filter(s => !local.includes(s));
if (newMissing.length) { console.error("Local file missing new alts:", newMissing); process.exit(1); }
console.log("Local file validated: 4 new alts present, 0 old alts.");

// 3. Write local -> remote
const w = await callTool("write_file", { path: REMOTE, content: local });
console.log("write_file:", w.slice(0, 200));

// 4. Verify remote now has new alts
const after = await callTool("read_file", { path: REMOTE });
const ok = NEW.every(s => after.includes(s)) && OLD.every(s => !after.includes(s));
console.log("Remote verify:", ok ? "OK (4 new alts live, 0 old)" : "MISMATCH");
if (!ok) process.exit(1);
