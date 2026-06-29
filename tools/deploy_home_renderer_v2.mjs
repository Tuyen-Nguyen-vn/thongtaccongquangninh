/**
 * Deploy ttcqn-home-emergency-renderer:
 * 1. Deactivate plugin
 * 2. Delete plugin
 * 3. Upload slim ZIP (PHP + CSS + JS, no images/video)
 * 4. Activate plugin
 */
import https from "node:https";
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p) { const e={}; for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");} return e; }
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SLUG = "ttcqn-home-emergency-renderer";

// Build ZIP in-memory với PHP file duy nhất
const PHP_PATH = `D:\\.thongtaccongquangninh\\tools\\wp-plugins\\${SLUG}\\${SLUG}.php`;
const phpContent = readFileSync(PHP_PATH, "utf8");
const version = phpContent.match(/Version:\s*([\d.]+)/)?.[1];
console.log(`PHP version: ${version}`);
console.log(`department count check: ${(phpContent.match(/localbusiness-/g)||[]).length} locations`);

function crc32(buf){let c=0xFFFFFFFF;for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xEDB88320:0);}return(c^0xFFFFFFFF)>>>0;}
function buildZip(entries){const parts=[],cds=[];let off=0;for(const[name,data]of entries){const nb=Buffer.from(name,"utf8");const db=Buffer.isBuffer(data)?data:Buffer.from(data,"utf8");const cr=crc32(db);const lh=Buffer.alloc(30+nb.length);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0,6);lh.writeUInt16LE(0,8);lh.writeUInt16LE(0,10);lh.writeUInt16LE(0,12);lh.writeUInt32LE(cr,14);lh.writeUInt32LE(db.length,18);lh.writeUInt32LE(db.length,22);lh.writeUInt16LE(nb.length,26);lh.writeUInt16LE(0,28);nb.copy(lh,30);parts.push(lh,db);const cd=Buffer.alloc(46+nb.length);cd.writeUInt32LE(0x02014b50,0);cd.writeUInt16LE(20,4);cd.writeUInt16LE(20,6);cd.writeUInt16LE(0,8);cd.writeUInt16LE(0,10);cd.writeUInt16LE(0,12);cd.writeUInt16LE(0,14);cd.writeUInt32LE(cr,16);cd.writeUInt32LE(db.length,20);cd.writeUInt32LE(db.length,24);cd.writeUInt16LE(nb.length,28);cd.writeUInt16LE(0,30);cd.writeUInt16LE(0,32);cd.writeUInt16LE(0,34);cd.writeUInt16LE(0,36);cd.writeUInt32LE(0,38);cd.writeUInt32LE(off,42);nb.copy(cd,46);cds.push(cd);off+=lh.length+db.length;}const cdBuf=Buffer.concat(cds);const eo=Buffer.alloc(22);eo.writeUInt32LE(0x06054b50,0);eo.writeUInt16LE(0,4);eo.writeUInt16LE(0,6);eo.writeUInt16LE(cds.length,8);eo.writeUInt16LE(cds.length,10);eo.writeUInt32LE(cdBuf.length,12);eo.writeUInt32LE(off,16);eo.writeUInt16LE(0,20);return Buffer.concat([...parts,cdBuf,eo]);}

const zip = buildZip([[`${SLUG}/${SLUG}.php`, phpContent]]);
const zipB64 = zip.toString("base64");
console.log(`ZIP: ${zip.length} bytes`);

let SID=null;
function mcpReq(body){return new Promise((res,rej)=>{const b=Buffer.from(JSON.stringify(body),"utf8");const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/mcp-adapter-default-server",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})});r.on("error",rej);r.setTimeout(60000,()=>r.destroy(new Error("t")));r.write(b);r.end();});}
function ability(name,params){return mcpReq({jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"mcp-adapter-execute-ability",arguments:{ability_name:name,parameters:params}}});}

await mcpReq({jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2025-06-18",capabilities:{tools:{}},clientInfo:{name:"deploy-home-renderer",version:"1"}}});
await mcpReq({jsonrpc:"2.0",method:"notifications/initialized"});

// Bước 1: Deactivate
console.log("\n[1] Deactivating...");
const r1 = await ability("plugins/deactivate", { plugin: `${SLUG}/${SLUG}.php` });
console.log("  →", JSON.stringify(r1.d?.result?.content?.[0]?.text || r1.d).slice(0, 150));

// Bước 2: Delete
console.log("[2] Deleting...");
const r2 = await ability("plugins/delete", { plugin: `${SLUG}/${SLUG}.php` });
console.log("  →", JSON.stringify(r2.d?.result?.content?.[0]?.text || r2.d).slice(0, 150));

// Bước 3: Upload (không cần overwrite vì đã xóa)
console.log("[3] Uploading ZIP...");
const r3 = await ability("plugins/upload-base64", { content_base64: zipB64, filename: `${SLUG}.zip`, activate: true });
const t3 = r3.d?.result?.content?.[0]?.text ?? JSON.stringify(r3.d).slice(0, 300);
console.log("  →", t3.slice(0, 300));

const ok = t3.includes('"activated":true') || t3.includes("success");
console.log(ok ? "\n✓ Deploy OK — plugin activated" : "\n✗ Deploy failed");
