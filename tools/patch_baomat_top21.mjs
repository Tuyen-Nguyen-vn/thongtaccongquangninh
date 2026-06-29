import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com"; const PAGE_ID = 282;
function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
let SID=null;
function req(auth,body) { return new Promise((res,rej)=>{ const b=Buffer.from(JSON.stringify(body),"utf8"); const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/mcp/wp-mcp-ultimate",method:"POST",headers:{Host:WP_HOST,Authorization:auth,"Content-Type":"application/json","Content-Length":b.length,...(SID?{"Mcp-Session-Id":SID}:{})},rejectUnauthorized:false}; const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{if(!SID&&resp.headers["mcp-session-id"])SID=resp.headers["mcp-session-id"];try{res({s:resp.statusCode,d:JSON.parse(d)})}catch{res({s:resp.statusCode,d})}})}); r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));r.write(b);r.end(); }); }
function ability(auth,name,params){return req(auth,{jsonrpc:"2.0",id:Date.now(),method:"tools/call",params:{name:"wp-mcp-ultimate-execute-ability",arguments:{ability_name:name,parameters:params}}});}
const env=parseEnv(ENV_PATH); const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
await req(auth,{jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{tools:{}},clientInfo:{name:"p",version:"1"}}});

// Thêm 1 câu (~30 từ) vào đoạn cuối section 13
const FIND = "đội ngũ hỗ trợ sẵn sàng giải đáp 24/7, kể cả ngày lễ và cuối tuần.</p>";
const REPLACE = "đội ngũ hỗ trợ sẵn sàng giải đáp 24/7, kể cả ngày lễ và cuối tuần. Mọi thông tin trao đổi trong quá trình hỗ trợ đều được bảo mật và chỉ dùng để giải quyết thắc mắc của bạn, không lưu lại sau khi ca hỗ trợ kết thúc.</p>";

const r=await ability(auth,"content/patch-page",{id:PAGE_ID,find:FIND,replace:REPLACE});
const t=r.d?.result?.content?.[0]?.text??""; console.log(t.includes("success")?"✓":"✗",t.slice(0,80));

const fR=await ability(auth,"content/get-page",{id:PAGE_ID});
const pd=JSON.parse(fR.d?.result?.content?.[0]?.text??"{}")
const c=pd?.data?.content??"";
const w=c.replace(/<[^>]+>/g," ").replace(/\s+/g," ").split(/\s+/).filter(x=>x.length>1).length;
console.log(`Words: ${w}`);
