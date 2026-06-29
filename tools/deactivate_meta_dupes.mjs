import https from "node:https";
const MCP_HOST="onehost-wphn022606.000nethost.com",MCP_PORT=2023,MCP_PATH="/api/mcp";
const TOKEN="sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
let sessionId=null,msgId=1;
function parseSSE(t){const r=[];for(const l of t.split("\n")){if(l.startsWith("data: ")){const x=l.slice(6).trim();if(x==="[DONE]")continue;try{r.push(JSON.parse(x));}catch{}}}return r;}
function mcpPost(method,params){return new Promise((resolve,reject)=>{const body=JSON.stringify({jsonrpc:"2.0",id:msgId++,method,params:params??{}});const headers={Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json",Accept:"application/json, text/event-stream","Content-Length":Buffer.byteLength(body)};if(sessionId)headers["Mcp-Session-Id"]=sessionId;const req=https.request({hostname:MCP_HOST,port:MCP_PORT,path:MCP_PATH,method:"POST",headers,rejectUnauthorized:false},(res)=>{if(res.headers["mcp-session-id"])sessionId=res.headers["mcp-session-id"];let d="";res.on("data",c=>d+=c);res.on("end",()=>{const ct=res.headers["content-type"]??"";if(ct.includes("text/event-stream"))resolve({status:res.statusCode,events:parseSSE(d),raw:d});else{try{resolve({status:res.statusCode,json:JSON.parse(d)});}catch{resolve({status:res.statusCode,raw:d});}}});});req.on("error",reject);req.setTimeout(60000,()=>req.destroy(new Error("timeout")));req.write(body);req.end();});}
function getResult(r){return r.json?.result??r.events?.find(e=>e.result!==undefined)?.result;}
function extractText(r){const res=getResult(r);if(!res)return "(none)";if(res?.isError)return "ERR: "+JSON.stringify(res.content??res);return (Array.isArray(res?.content)?res.content.map(c=>c.text??"").join(""):null)??JSON.stringify(res);}
function homeDesc(){return new Promise((resolve)=>{const req=https.request({hostname:"103.57.220.210",port:443,servername:"thongtaccongquangninh.com",path:"/?nocache="+Date.now(),method:"GET",headers:{Host:"thongtaccongquangninh.com","User-Agent":"WP-Agent/1.0"},rejectUnauthorized:false},(res)=>{let d="";res.on("data",c=>d+=c);res.on("end",()=>{const desc=(d.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)||[])[1]||"(none)";resolve({s:res.statusCode,desc,crit:/critical error/i.test(d)});});});req.on("error",e=>resolve({s:0,desc:String(e)}));req.setTimeout(20000,()=>req.destroy());req.end();});}
await mcpPost("initialize",{protocolVersion:"2024-11-05",capabilities:{},clientInfo:{name:"dmd",version:"1"}});
await mcpPost("notifications/initialized",{});
async function call(n,a){return extractText(await mcpPost("tools/call",{name:n,arguments:a}));}
const D="thongtaccongquangninh.com";

const before=await homeDesc();
console.log("BEFORE — desc:", before.desc);

for(const slug of ["ttcqn-fix-meta-html","ttcqn-fix-meta-v2"]){
  const r=await call("deactivate_wordpress_plugin",{domain:D,plugin:slug});
  console.log("deactivate",slug,"=>",r.slice(0,120));
}
const after=await homeDesc();
console.log("\nAFTER — status:",after.s,"crit:",after.crit);
console.log("AFTER — desc:", after.desc);
const ok = after.s===200 && !after.crit && after.desc.includes("15 ph") && !after.desc.includes("15-30");
console.log(ok ? "\n✓ OK — desc giữ '15 phút', redundant plugins removed safely" : "\n✗ REVERTED to 15-30 or error — REACTIVATING");
if(!ok){
  for(const slug of ["ttcqn-fix-meta-html","ttcqn-fix-meta-v2"]){
    const r=await call("activate_wordpress_plugin",{domain:D,plugin:slug});
    console.log("re-activate",slug,"=>",r.slice(0,120));
  }
}
