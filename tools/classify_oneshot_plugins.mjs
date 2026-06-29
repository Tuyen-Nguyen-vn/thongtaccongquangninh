import https from "node:https";
const MCP_HOST="onehost-wphn022606.000nethost.com",MCP_PORT=2023,MCP_PATH="/api/mcp";
const TOKEN="sp_67ebec4a2c0a93701f3fe0a0106c9ff552a1925d559c2555b0cd84c764bfe4d2";
let sessionId=null,msgId=1;
function parseSSE(t){const r=[];for(const l of t.split("\n")){if(l.startsWith("data: ")){const x=l.slice(6).trim();if(x==="[DONE]")continue;try{r.push(JSON.parse(x));}catch{}}}return r;}
function mcpPost(method,params){return new Promise((resolve,reject)=>{const body=JSON.stringify({jsonrpc:"2.0",id:msgId++,method,params:params??{}});const headers={Authorization:`Bearer ${TOKEN}`,"Content-Type":"application/json",Accept:"application/json, text/event-stream","Content-Length":Buffer.byteLength(body)};if(sessionId)headers["Mcp-Session-Id"]=sessionId;const req=https.request({hostname:MCP_HOST,port:MCP_PORT,path:MCP_PATH,method:"POST",headers,rejectUnauthorized:false},(res)=>{if(res.headers["mcp-session-id"])sessionId=res.headers["mcp-session-id"];let d="";res.on("data",c=>d+=c);res.on("end",()=>{const ct=res.headers["content-type"]??"";if(ct.includes("text/event-stream"))resolve({status:res.statusCode,events:parseSSE(d),raw:d});else{try{resolve({status:res.statusCode,json:JSON.parse(d)});}catch{resolve({status:res.statusCode,raw:d});}}});});req.on("error",reject);req.setTimeout(60000,()=>req.destroy(new Error("timeout")));req.write(body);req.end();});}
function getResult(r){return r.json?.result??r.events?.find(e=>e.result!==undefined)?.result;}
function extractText(r){const res=getResult(r);if(!res)return "(none)";if(res?.isError)return "ERR: "+JSON.stringify(res.content??res);return (Array.isArray(res?.content)?res.content.map(c=>c.text??"").join(""):null)??JSON.stringify(res);}
await mcpPost("initialize",{protocolVersion:"2024-11-05",capabilities:{},clientInfo:{name:"clsfy",version:"1"}});
await mcpPost("notifications/initialized",{});
async function call(n,a){return extractText(await mcpPost("tools/call",{name:n,arguments:a}));}

const ROOT="/public_html/wp-content/plugins";
// candidate one-shot slugs (active) to inspect main file
const slugs = process.argv.slice(2);
for(const slug of slugs){
  // main file usually slug.php inside slug dir
  let txt = await call("read_file",{path:`${ROOT}/${slug}/${slug}.php`});
  if(txt.startsWith("ERR")||txt==="(none)"){
    // try listing dir to find php
    const ls = await call("list_files",{path:`${ROOT}/${slug}`});
    console.log(`\n#### ${slug} (no ${slug}.php) listing:\n`+ls.slice(0,400));
    continue;
  }
  // detect runtime hooks
  const hooks = [];
  for(const h of ["the_content","the_title","wp_title","rank_math/frontend/title","rank_math/frontend/description","add_filter","template_redirect","wp_head","init"]) {
    if(txt.includes(h)) hooks.push(h);
  }
  const isFilter = /add_filter\s*\(/.test(txt);
  const wOnce = /update_option|update_post_meta|wp_update_post|wp_insert_post|->query\(|\$wpdb/.test(txt);
  console.log(`\n#### ${slug}  len=${txt.length}  filter=${isFilter} dbwrite=${wOnce}`);
  console.log("   hooks:", hooks.join(", ")||"(none)");
  console.log("   head:", txt.slice(0,220).replace(/\s+/g," "));
}
