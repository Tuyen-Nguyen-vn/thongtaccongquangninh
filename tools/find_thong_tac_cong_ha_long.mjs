import https from "node:https";
import { readFileSync } from "node:fs";

const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210"; const WP_HOST = "thongtaccongquangninh.com";

function parseEnv(p) { const env={}; for (const l of readFileSync(p,"utf8").split(/\r?\n/)) { const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/); if(m) env[m[1]]=m[2].replace(/^["']|["']$/g,""); } return env; }
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");

function wpGet(path) {
  return new Promise((res,rej)=>{
    const o={hostname:SERVER_IP,port:443,servername:WP_HOST,path,method:"GET",headers:{Host:WP_HOST,Authorization:auth},rejectUnauthorized:false};
    const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});
    r.on("error",rej);r.setTimeout(20000,()=>r.destroy(new Error("t")));r.end();
  });
}

// Tìm bài slug chứa ha-long + thong-tac hoặc search
const [posts, pages] = await Promise.all([
  wpGet("/wp-json/wp/v2/posts?search=thong+tac+cong+ha+long&per_page=20&_fields=id,slug,title,status"),
  wpGet("/wp-json/wp/v2/pages?search=thong+tac+cong+ha+long&per_page=10&_fields=id,slug,title,status"),
]);

const all = [...(Array.isArray(posts)?posts:[]), ...(Array.isArray(pages)?pages:[])];
console.log("=== Kết quả tìm kiếm 'thông tắc cống Hạ Long' ===");
for (const p of all) {
  console.log(`  id=${p.id} [${p.status}] slug="${p.slug}" title="${p.title?.rendered?.slice(0,80)}"`);
}

// Cũng thử tìm trực tiếp bằng slug
const slugTry = await wpGet("/wp-json/wp/v2/posts?slug=thong-tac-cong-ha-long&context=edit&_fields=id,slug,title");
if (Array.isArray(slugTry) && slugTry[0]) {
  console.log("\nDirect slug match:", slugTry[0].id, slugTry[0].slug);
}
