/**
 * Touch page 282 để trigger save_post hook → WP cache plugin purges cached HTML.
 * Sau đó kiểm tra live <title>.
 */
import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com"; const PAGE_ID = 282;

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
let SID=null;
function mcpReq(auth,body) { return new Promise((res,rej)=>{ const b=Buffer.from(JSON.stringify(body),"utf8"); const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false}; const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})}); r.on("error",rej);r.setTimeout(60000,()=>r.destroy(new Error("t")));r.write(b);r.end(); }); }
function ability(auth,name,params){return mcpReq(auth,{jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}

const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");
await mcpReq(auth, {jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"touch-page",version:"1"}}});

// Also deploy a plugin that does wp_update_post on init to ensure cache purge fires
// AND simultaneously updates _rank_math_title with UTF-8 title via the proper mechanism

// First: use content/update-page to trigger save_post (cache invalidation)
console.log("Touching page via content/update-page...");
const touchR = await ability(auth, "content/update-page", {
  id: PAGE_ID,
  title: "Chính Sách Bảo Mật Thông Tin Khách Hàng",
});
const touchTxt = touchR.d?.result?.content?.[0]?.text ?? "";
console.log(touchTxt.includes("success") ? "✓ touched" : "? " + touchTxt.slice(0,100));

// Wait for cache to clear
await new Promise(r => setTimeout(r, 3000));

// Check live title
async function checkLiveTitle() {
  return new Promise((res, rej) => {
    const opts = {hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/chinh-sach-bao-mat/",method:"GET",headers:{Host:WP_HOST,"User-Agent":"check/1","Cache-Control":"no-cache,no-store","Pragma":"no-cache"},rejectUnauthorized:false};
    const r=https.request(opts, resp => {
      let d=""; resp.on("data",c=>d+=c);
      resp.on("end", () => {
        const tm=d.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const title=tm?tm[1].replace(/\s+/g," ").trim():"(not found)";
        res(title);
      });
    });
    r.on("error", rej); r.setTimeout(15000,()=>r.destroy(new Error("t"))); r.end();
  });
}

const title1 = await checkLiveTitle();
console.log(`Live <title> after touch: "${title1}" (${[...title1].length} chars)`);

if ([...title1].length >= 60) {
  console.log("✓ TITLE resolved!");
} else {
  console.log("⚠ Still cached. Trying WP REST touch...");
  // Try WP REST direct
  const restR = await new Promise((res,rej) => {
    const body = Buffer.from(JSON.stringify({ date_modified: new Date().toISOString() }), "utf8");
    const opts = {hostname:SERVER_IP,port:443,servername:WP_HOST,path:`/wp-json/wp/v2/pages/${PAGE_ID}`,method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":body.length,"User-Agent":"touch/1"},rejectUnauthorized:false};
    const r=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})}); r.on("error",rej);r.setTimeout(15000,()=>r.destroy(new Error("t")));r.write(body);r.end();
  });
  console.log(`  REST touch: ${restR.s}`);

  await new Promise(r => setTimeout(r, 3000));
  const title2 = await checkLiveTitle();
  console.log(`Live <title> after REST touch: "${title2}" (${[...title2].length} chars)`);
}
