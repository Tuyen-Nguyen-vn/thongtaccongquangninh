import https from "node:https";
const MCP_HOST="onehost-wphn022606.000nethost.com",MCP_PORT=2023,MCP_PATH="/api/mcp";
const TOKEN="sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
let sessionId=null,msgId=1;
function parseSSE(t){const r=[];for(const l of t.split("\n")){if(l.startsWith("data: ")){const x=l.slice(6).trim();if(x==="[DONE]")continue;try{r.push(JSON.parse(x));}catch{}}}return r;}
function mcpPost(method,params){return new Promise((resolve,reject)=>{const body=JSON.stringify({jsonrpc:"2.0",id:msgId++,method,params:params??{}});const headers={Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json",Accept:"application/json, text/event-stream","Content-Length":Buffer.byteLength(body)};if(sessionId)headers["Mcp-Session-Id"]=sessionId;const req=https.request({hostname:MCP_HOST,port:MCP_PORT,path:MCP_PATH,method:"POST",headers,rejectUnauthorized:false},(res)=>{if(res.headers["mcp-session-id"])sessionId=res.headers["mcp-session-id"];let d="";res.on("data",c=>d+=c);res.on("end",()=>{const ct=res.headers["content-type"]??"";if(ct.includes("text/event-stream"))resolve({status:res.statusCode,events:parseSSE(d),raw:d});else{try{resolve({status:res.statusCode,json:JSON.parse(d)});}catch{resolve({status:res.statusCode,raw:d});}}});});req.on("error",reject);req.setTimeout(60000,()=>req.destroy(new Error("timeout")));req.write(body);req.end();});}
function getResult(r){return r.json?.result??r.events?.find(e=>e.result!==undefined)?.result;}
function extractText(r){const res=getResult(r);if(!res)return "(none)";if(res?.isError)return "ERR: "+JSON.stringify(res.content??res);return (Array.isArray(res?.content)?res.content.map(c=>c.text??"").join(""):null)??JSON.stringify(res);}
await mcpPost("initialize",{protocolVersion:"2024-11-05",capabilities:{},clientInfo:{name:"deactA",version:"1"}});
await mcpPost("notifications/initialized",{});
async function call(n,a){return extractText(await mcpPost("tools/call",{name:n,arguments:a}));}
const D="thongtaccongquangninh.com";
const targets = ["ttcqn-fix-home-15phut","ttcqn-fix-home-15phut-v2","ttcqn-fix-missing-meta"];
for(const slug of targets){
  const r = await call("deactivate_wordpress_plugin",{domain:D, plugin:slug});
  console.log("deactivate", slug, "=>", r.slice(0,160));
}
// verify home meta unchanged + 200
const live = await new Promise((resolve)=>{const req=https.request({hostname:"103.57.220.210",port:443,servername:D,path:"/?nocache="+Date.now(),method:"GET",headers:{Host:D,"User-Agent":"WP-Agent/1.0"},rejectUnauthorized:false},(res)=>{let d="";res.on("data",c=>d+=c);res.on("end",()=>resolve({s:res.statusCode,d}));});req.on("error",e=>resolve({s:0,d:String(e)}));req.setTimeout(30000,()=>req.destroy());req.end();});
const ht=(live.d.match(/<title>([\s\S]*?)<\/title>/i)||[])[1];
const desc=(live.d.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)||[])[1];
const crit=/critical error|There has been a critical/i.test(live.d);
console.log("\nHOME status:", live.s, "critical:", crit);
console.log("HOME title:", ht);
console.log("HOME desc:", desc);
