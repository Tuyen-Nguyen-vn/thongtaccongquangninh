/**
 * Deploy ttcqn-doorway-schema (whole dir) via mcp-adapter-default-server.
 */
import https from "node:https";
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210", WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
let SID=null;
function mcpReq(body){return new Promise((res,rej)=>{const b=Buffer.from(JSON.stringify(body),"utf8");const r=https.request({hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/mcp-adapter-default-server",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)});}catch{res({s:resp.statusCode,d});}});});r.on("error",rej);r.setTimeout(60000,()=>r.destroy());r.write(b);r.end();});}
function fetchPage(path){return new Promise((res,rej)=>{const r=https.request({hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,"User-Agent":"Mozilla/5.0"},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>res(d));});r.on("error",rej);r.setTimeout(20000,()=>r.destroy());r.end();});}

await mcpReq({jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2025-06-18",capabilities:{tools:{}},clientInfo:{name:"deploy-doorway",version:"1"}}});
await mcpReq({jsonrpc:"2.0",method:"notifications/initialized"});
console.log("SID:",SID);

const SLUG="ttcqn-doorway-schema";
const DIR=`D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}`;
const ZIP_PATH=`${DIR}.zip`;
if(existsSync(ZIP_PATH))execSync(`powershell -Command "Remove-Item '${ZIP_PATH}' -Force"`,{stdio:"pipe"});
execSync(`python -c "import zipfile,os; zf=zipfile.ZipFile(r'${ZIP_PATH}','w',zipfile.ZIP_DEFLATED); [zf.write(os.path.join(r'${DIR}',f), '${SLUG}/'+f) for f in ['ttcqn-doorway-schema.php','gbp_data.json']]; zf.close()"`,{stdio:"pipe"});
const zipB64=readFileSync(ZIP_PATH).toString("base64");
console.log(`ZIP: ${readFileSync(ZIP_PATH).length} bytes`);

const r=await mcpReq({jsonrpc:"2.0",id:4,method:"tools/call",params:{name:"mcp-adapter-execute-ability",arguments:{ability_name:"plugins/upload-base64",parameters:{content_base64:zipB64,filename:`${SLUG}.zip`,activate:true,overwrite:true}}}});
console.log("Deploy status:",r.s);
console.log("Result:",JSON.stringify(r.d).slice(0,400));

await new Promise(r=>setTimeout(r,3000));
for(const u of ["/thong-tac-cong-cao-xanh/","/thong-tac-cong-tuan-chau/"]){
  const html=await fetchPage(u);
  const blocks=[...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  const types=new Set();
  let serviceName="";
  for(const b of blocks){try{const j=JSON.parse(b);const arr=Array.isArray(j)?j:(j["@graph"]||[j]);for(const n of arr){const t=n["@type"];(Array.isArray(t)?t:[t]).forEach(x=>types.add(x));if((Array.isArray(t)?t:[t]).includes("Service"))serviceName=n.name||"";}}catch{}}
  console.log(`${u} -> Service=${types.has("Service")?"YES ("+serviceName+")":"NO"} | types=${[...types].join(",")}`);
}
