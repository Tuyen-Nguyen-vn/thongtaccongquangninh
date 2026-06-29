import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
const env = parseEnv(ENV_PATH);
const auth = "Basic " + Buffer.from(env.WP_USERNAME + ":" + env.WP_APP_PASSWORD).toString("base64");

const r = await new Promise((res,rej)=>{
  const opts={hostname:SERVER_IP,port:443,servername:WP_HOST,path:"/wp-json/wp/v2/posts/2043?context=edit",method:"GET",headers:{Host:WP_HOST,Authorization:auth,"User-Agent":"d/1"},rejectUnauthorized:false};
  const req=https.request(opts,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
  req.on("error",rej);req.setTimeout(15000,()=>req.destroy(new Error("t")));req.end();
});

const raw = r.content?.raw || "";
console.log("Title:", r.title?.rendered);
console.log("Content length:", raw.length, "chars");
const txt = raw.replace(/<[^>]+>/g," ").replace(/<!--[\s\S]*?-->/g," ").replace(/\s+/g," ").trim();
const wc = txt.split(/\s+/).filter(w=>w.length>1).length;
console.log("Word count (stripped):", wc);
console.log("Has byline:", raw.includes("ttcqn-author-nguyen-song-hao"));
console.log("Has section 6:", raw.includes("Giải Pháp Theo Từng Khu"));
console.log("Has FAQ bồn cầu tự khỏi:", raw.includes("bồn cầu rút chậm có tự"));
console.log("\nLast 500 chars of raw content:");
console.log(raw.slice(-500));
