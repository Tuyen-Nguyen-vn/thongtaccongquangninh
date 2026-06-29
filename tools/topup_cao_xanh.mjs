import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210", WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function req(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const r=https.request({hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,headers:{Host:WP_HOST,Authorization:auth,"User-Agent":"WP-Agent/1.0",...(b?{"Content-Type":"application/json","Content-Length":b.length}:{})},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)});}catch{res({s:resp.statusCode,d});}});});r.on("error",rej);r.setTimeout(30000,()=>r.destroy());if(b)r.write(b);r.end();});}

const cur = await req("GET", "/wp-json/wp/v2/posts/2039?context=edit", null);
let raw = cur.d.content?.raw ?? "";

const EXTRA = `<p>Khu vực Cao Xanh có nhiều nhà trọ, quán ăn và khu dân cư đông nên hệ thống thoát nước thường chịu tải lớn vào giờ cao điểm. Vì vậy, ngoài việc xử lý dứt điểm điểm tắc, đội thợ luôn kiểm tra thêm hố ga và đường thoát chung phía sau để đánh giá nguy cơ tắc lại. Nếu phát hiện hố ga đầy bùn hoặc bể phốt có dấu hiệu quá tải, kỹ thuật sẽ tư vấn phương án hút và nạo vét kèm theo, giúp khách tránh phải gọi lại nhiều lần trong thời gian ngắn và tiết kiệm chi phí về lâu dài.</p>\n`;

raw = raw.replace("<h2>NAP liên hệ</h2>", EXTRA + "<h2>NAP liên hệ</h2>");
const words = raw.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().split(" ").filter(Boolean).length;
console.log("new words:", words);
const up = await req("POST", "/wp-json/wp/v2/posts/2039", { content: raw, status: "publish" });
console.log("status:", up.s, up.d.status);
