import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p){const env={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}return env;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

let SID=null;
function mcpReq(body){return new Promise((res,rej)=>{const b=Buffer.from(JSON.stringify(body),"utf8");const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})});r.on("error",rej);r.setTimeout(60000,()=>r.destroy(new Error("t")));r.write(b);r.end();});}
function ability(name,params){return mcpReq({jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}

function crc32(buf){let c=0xFFFFFFFF;for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xEDB88320:0);}return(c^0xFFFFFFFF)>>>0;}
function buildZip(entries){const parts=[],cds=[];let off=0;for(const[name,data]of entries){const nb=Buffer.from(name,"utf8");const db=Buffer.isBuffer(data)?data:Buffer.from(data,"utf8");const cr=crc32(db);const lh=Buffer.alloc(30+nb.length);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0,6);lh.writeUInt16LE(0,8);lh.writeUInt16LE(0,10);lh.writeUInt16LE(0,12);lh.writeUInt32LE(cr,14);lh.writeUInt32LE(db.length,18);lh.writeUInt32LE(db.length,22);lh.writeUInt16LE(nb.length,26);lh.writeUInt16LE(0,28);nb.copy(lh,30);parts.push(lh,db);const cd=Buffer.alloc(46+nb.length);cd.writeUInt32LE(0x02014b50,0);cd.writeUInt16LE(20,4);cd.writeUInt16LE(20,6);cd.writeUInt16LE(0,8);cd.writeUInt16LE(0,10);cd.writeUInt16LE(0,12);cd.writeUInt16LE(0,14);cd.writeUInt32LE(cr,16);cd.writeUInt32LE(db.length,20);cd.writeUInt32LE(db.length,24);cd.writeUInt16LE(nb.length,28);cd.writeUInt16LE(0,30);cd.writeUInt16LE(0,32);cd.writeUInt16LE(0,34);cd.writeUInt16LE(0,36);cd.writeUInt32LE(0,38);cd.writeUInt32LE(off,42);nb.copy(cd,46);cds.push(cd);off+=lh.length+db.length;}const cdBuf=Buffer.concat(cds);const eo=Buffer.alloc(22);eo.writeUInt32LE(0x06054b50,0);eo.writeUInt16LE(0,4);eo.writeUInt16LE(0,6);eo.writeUInt16LE(cds.length,8);eo.writeUInt16LE(cds.length,10);eo.writeUInt32LE(cdBuf.length,12);eo.writeUInt32LE(off,16);eo.writeUInt16LE(0,20);return Buffer.concat([...parts,cdBuf,eo]);}

await mcpReq({jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"redeploy",version:"1"}}});

const phpContent = readFileSync("D:\\.thongtaccongquangninh\\tools\\mu-plugins\\ttcqn-fix-home-img-alt.php", "utf8");
console.log("PHP version:", phpContent.match(/Version:\s*([\d.]+)/)?.[1]);
console.log("Has priority -2500:", phpContent.includes("-2500"));
console.log("Has str_replace:", phpContent.includes("str_replace"));

const zip = buildZip([["ttcqn-fix-home-img-alt/ttcqn-fix-home-img-alt.php", phpContent]]);
console.log(`ZIP: ${zip.length} bytes — deploying...`);

const r = await ability("plugins/upload-base64", {
  content_base64: zip.toString("base64"),
  filename: "ttcqn-fix-home-img-alt.zip",
  activate: true, overwrite: true,
});
const t = r.d?.result?.content?.[0]?.text ?? "";
console.log(t.includes("success") ? "✓ deployed" : "? " + t.slice(0,120));

// Verify
await new Promise(rr=>setTimeout(rr,2000));
await new Promise((res,rej)=>{
  const opts={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/",method:"GET",headers:{Host:WP_HOST,"User-Agent":"check/1"},rejectUnauthorized:false};
  const r=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{
    console.log("\nLive verify:");
    console.log("  ytimg.com:", d.includes("ytimg.com")?"⚠ STILL PRESENT":"✓ CLEAN");
    const localUrl="video-khao-sat-dich-vu-moi-truong-do-thi-so-1-quang-ninh";
    console.log("  local thumb:", d.includes(localUrl)?"✓ FOUND":"✗ not found");
    console.log("  empty alt count:", (d.match(/\balt=""\s/g)||[]).length);
    res();
  })});
  r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.end();
});

const TODAY="2026-06-09";const TIME=new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",`\n${TODAY},${TIME},FIX-IMG-ALT-PRIORITY-${TODAY},seo_fix,homepage img-alt plugin priority -2500 to run before renderer exit(),https://thongtaccongquangninh.com/,,done,medium,,,,,ytimg.com hotlink fix,tools/redeploy_img_alt_plugin.mjs,,verify audit,,,,,,`,"utf8");
console.log("✓ logged");
