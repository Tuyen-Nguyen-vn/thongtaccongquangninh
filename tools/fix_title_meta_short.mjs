import https from "node:https";
const MCP_HOST="onehost-wphn022606.000nethost.com",MCP_PORT=2023,MCP_PATH="/api/mcp";
const TOKEN="sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
let sessionId=null,msgId=1;
function parseSSE(t){const r=[];for(const l of t.split("\n")){if(l.startsWith("data: ")){const x=l.slice(6).trim();if(x==="[DONE]")continue;try{r.push(JSON.parse(x));}catch{}}}return r;}
function mcpPost(method,params){return new Promise((resolve,reject)=>{const body=JSON.stringify({jsonrpc:"2.0",id:msgId++,method,params:params??{}});const headers={Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json",Accept:"application/json, text/event-stream","Content-Length":Buffer.byteLength(body)};if(sessionId)headers["Mcp-Session-Id"]=sessionId;const req=https.request({hostname:MCP_HOST,port:MCP_PORT,path:MCP_PATH,method:"POST",headers,rejectUnauthorized:false},(res)=>{if(res.headers["mcp-session-id"])sessionId=res.headers["mcp-session-id"];let d="";res.on("data",c=>d+=c);res.on("end",()=>{const ct=res.headers["content-type"]??"";if(ct.includes("text/event-stream"))resolve({status:res.statusCode,events:parseSSE(d),raw:d});else{try{resolve({status:res.statusCode,json:JSON.parse(d)});}catch{resolve({status:res.statusCode,raw:d});}}});});req.on("error",reject);req.setTimeout(60000,()=>req.destroy(new Error("timeout")));req.write(body);req.end();});}
function getResult(r){return r.json?.result??r.events?.find(e=>e.result!==undefined)?.result;}
function extractText(r){const res=getResult(r);if(!res)return "(none)";if(res?.isError)return "ERR: "+JSON.stringify(res.content??res);return (Array.isArray(res?.content)?res.content.map(c=>c.text??"").join(""):null)??JSON.stringify(res);}
await mcpPost("initialize",{protocolVersion:"2024-11-05",capabilities:{},clientInfo:{name:"ftms",version:"1"}});
await mcpPost("notifications/initialized",{});
async function call(n,a){return extractText(await mcpPost("tools/call",{name:n,arguments:a}));}

let miss=0;
function rep(code,a,b){if(!code.includes(a)){console.error("MISS:",a.slice(0,80));miss++;return code;}console.log("replaced:",a.slice(0,70));return code.replace(a,b);}

// === Fix 1: ttcqn-title-meta-short-2026-06-12 ===
const P1="/public_html/wp-content/plugins/ttcqn-title-meta-short-2026-06-12/ttcqn-title-meta-short-2026-06-12.php";
let c1=await call("read_file",{path:P1});
// case 62 title — old brand
c1=rep(c1,
  `        case 62: return 'Dịch vụ thông tắc Quảng Ninh - Hồ sơ Môi Trường Đô Thị Số 1';`,
  `        case 62: return 'Giới thiệu dịch vụ thông tắc cống, hút bể phốt Quảng Ninh';`
);
// case 2332 title — old (pre-fix) cam-nang title → match the H1 we already fixed
c1=rep(c1,
  `        case 2332: return 'Thông tắc cống Hạ Long: cẩm nang xử lý nhanh theo từng khu';`,
  `        case 2332: return 'Cẩm nang thông tắc cống Hạ Long: xử lý nhanh theo từng khu';`
);
if(miss===0){
  const w1=await call("write_file",{path:P1,content:c1});console.log("write title-meta-short:",w1.slice(0,100));
  const v1=await call("read_file",{path:P1});
  console.log("verify case 62 fixed:",!v1.includes("Hồ sơ Môi Trường"),"| cam-nang fixed:",v1.includes("Cẩm nang thông tắc cống Hạ Long"));
}else{console.error("Aborted title-meta-short, miss="+miss);process.exit(1);}

// === Fix 2: ttcqn-seo-cleanup-redirects — OG title for gioi-thieu ===
const P2="/public_html/wp-content/plugins/ttcqn-seo-cleanup-redirects/ttcqn-seo-cleanup-redirects.php";
let c2=await call("read_file",{path:P2});
let miss2=0;
function rep2(a,b){if(!c2.includes(a)){console.error("MISS2:",a.slice(0,80));miss2++;return;}console.log("rep2:",a.slice(0,70));c2=c2.replace(a,b);}
rep2(
  `            'title' => 'Hồ sơ Môi Trường Đô Thị Số 1 Quảng Ninh và đội thông hút 24/7',`,
  `            'title' => 'Giới thiệu dịch vụ thông tắc cống, hút bể phốt Quảng Ninh',`
);
if(miss2===0){
  const w2=await call("write_file",{path:P2,content:c2});console.log("write seo-cleanup:",w2.slice(0,100));
  const v2=await call("read_file",{path:P2});
  console.log("verify seo-cleanup fixed:",!v2.includes("Hồ sơ Môi Trường Đô Thị Số 1 Quảng Ninh và đội thông hút 24/7"));
}else{console.error("Aborted seo-cleanup, miss="+miss2);}
