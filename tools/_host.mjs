/**
 * _host.mjs — runner goi hosting MCP (000nethost). CHI la cau noi, khong tu sua gi.
 * Dung: node tools\_host.mjs <tool_name> '<json_args>'
 * Vi du:
 *   node tools\_host.mjs get_hosting_context "{}"
 *   node tools\_host.mjs search_files "{\"path\":\"public_html\",\"query\":\"thongtacconghalong24h\"}"
 * In ra text/result tho de doc.
 */
import https from "node:https";
const MCP_HOST = "onehost-wphn022606.000nethost.com", MCP_PORT = 2023, MCP_PATH = "/api/mcp";
const TOKEN = "sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
let sessionId = null, msgId = 1;
function parseSSE(t){const r=[];for(const l of t.split("\n")){if(l.startsWith("data: ")){const x=l.slice(6).trim();if(x==="[DONE]")continue;try{r.push(JSON.parse(x));}catch{}}}return r;}
function mcpPost(method,params){return new Promise((resolve,reject)=>{const body=JSON.stringify({jsonrpc:"2.0",id:msgId++,method,params:params??{}});const headers={Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json",Accept:"application/json, text/event-stream","Content-Length":Buffer.byteLength(body)};if(sessionId)headers["Mcp-Session-Id"]=sessionId;const req=https.request({hostname:MCP_HOST,port:MCP_PORT,path:MCP_PATH,method:"POST",headers,rejectUnauthorized:false},(res)=>{if(res.headers["mcp-session-id"])sessionId=res.headers["mcp-session-id"];let d="";res.on("data",c=>d+=c);res.on("end",()=>{const ct=res.headers["content-type"]??"";if(ct.includes("text/event-stream"))resolve({status:res.statusCode,events:parseSSE(d),raw:d});else{try{resolve({status:res.statusCode,json:JSON.parse(d)});}catch{resolve({status:res.statusCode,raw:d});}}});});req.on("error",reject);req.setTimeout(120000,()=>req.destroy(new Error("timeout")));req.write(body);req.end();});}
function getResult(r){return r.json?.result??r.events?.find(e=>e.result!==undefined)?.result;}
function extractText(r){const res=getResult(r);if(!res)return JSON.stringify(r).slice(0,2000);if(res?.isError)return "ERR: "+JSON.stringify(res.content??res);return (Array.isArray(res?.content)?res.content.map(c=>c.text??"").join(""):null)??JSON.stringify(res);}

const toolName = process.argv[2];
let args = {};
try { args = JSON.parse(process.argv[3] || "{}"); } catch (e) { console.error("Bad JSON args:", e.message); process.exit(1); }
if (!toolName) { console.error("Usage: node tools/_host.mjs <tool> '<json>'"); process.exit(1); }

await mcpPost("initialize",{protocolVersion:"2024-11-05",capabilities:{},clientInfo:{name:"host-runner",version:"1"}});
await mcpPost("notifications/initialized",{});
const r = await mcpPost("tools/call",{name:toolName,arguments:args});
console.log(extractText(r));
