/**
 * Fix TITLE_SHORT trên /chinh-sach-bao-mat/ (id=282).
 * _rank_math_title không nhận qua REST → update WP post title dài hơn
 * để Rank Math fallback: "%title% | %sitename%" = ≥60 chars.
 */
import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com"; const PAGE_ID = 282;
function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
let SID=null;
function req(auth,body) { return new Promise((res,rej)=>{ const b=Buffer.from(JSON.stringify(body),"utf8"); const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false}; const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})}); r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));r.write(b);r.end(); }); }
function ability(auth,name,params){return req(auth,{jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}

const env=parseEnv(ENV_PATH); const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
await req(auth,{jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"fix-title",version:"1"}}});

// "Chính Sách Bảo Mật Thông Tin Khách Hàng" (40 chars) + " | Môi Trường Đô Thị Số 1 Quảng Ninh" (37) = 77 chars
const NEW_TITLE = "Chính Sách Bảo Mật Thông Tin Khách Hàng";
console.log(`New post title: "${NEW_TITLE}" (${[...NEW_TITLE].length} chars post title)`);
console.log(`Expected <title>: "${NEW_TITLE} | Môi Trường Đô Thị Số 1 Quảng Ninh" (~77 chars)`);

const r = await ability(auth, "content/update-page", { id: PAGE_ID, title: NEW_TITLE });
const t = r.d?.result?.content?.[0]?.text ?? "";
console.log(t.includes("success") ? "✓ title updated" : "✗ " + t.slice(0, 120));

// Also try direct WP REST with slug check
import https2 from "node:https";
function wpRest(method, path, auth2, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body), "utf8") : null;
    const opts = { hostname: SERVER_IP, port: 443, servername: WP_HOST,
      path: "/wp-json" + path, method,
      headers: { Host: WP_HOST, Authorization: auth2, "User-Agent": "fix/1.0",
        ...(bodyBuf ? { "Content-Type": "application/json", "Content-Length": bodyBuf.length } : {}) },
      rejectUnauthorized: false };
    const req2 = https2.request(opts, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ s: res.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, d }); } });
    });
    req2.on("error", reject); req2.setTimeout(30000, () => req2.destroy(new Error("t")));
    if (bodyBuf) req2.write(bodyBuf);
    req2.end();
  });
}

// Try to set rank_math_title via custom endpoint or direct meta
const metaR = await wpRest("POST", `/wp/v2/pages/${PAGE_ID}`, auth, {
  title: NEW_TITLE,
  meta: { rank_math_title: NEW_TITLE + " | Môi Trường Đô Thị Số 1 Quảng Ninh" }
});
console.log(`REST status: ${metaR.s} | title in response: "${metaR.d?.title?.rendered?.slice(0,60) ?? '?'}"`);
