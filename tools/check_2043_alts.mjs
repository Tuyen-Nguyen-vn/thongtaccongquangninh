import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const env={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}return env;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const r=await new Promise((res,rej)=>{
  const opts={hostname:"103.57.220.210",port:443,servername:"thongtaccongquangninh.com",path:"/wp-json/wp/v2/posts/2043?context=edit",method:"GET",headers:{Host:"thongtaccongquangninh.com",Authorization:auth,"User-Agent":"d/1"},rejectUnauthorized:false};
  const req=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
  req.on("error",rej);req.setTimeout(15000,()=>req.destroy(new Error("t")));req.end();
});
const raw=r.content?.raw||"";
const imgs=[...raw.matchAll(/alt="([^"]*)"/gi)];
console.log("All alt attrs in raw content:");
imgs.forEach((m,i)=>console.log(`  [${i}] "${m[1]}"`));

// Check specific strings
const FIND1='alt="Bồn cầu rút nước chậm cần kiểm tra đường thoát, xi phông và bể phốt trước khi xử lý"';
const FIND2='alt="Thợ dùng thiết bị phù hợp để kiểm tra nguyên nhân bồn cầu rút chậm"';
console.log("\nFind 1 present:", raw.includes(FIND1));
console.log("Find 2 present:", raw.includes(FIND2));
console.log("Has 'tại Quảng Ninh':", raw.includes("tại Quảng Ninh"));
