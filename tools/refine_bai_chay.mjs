import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function req(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const r=https.request({hostname:"103.57.220.210",port:443,servername:"thongtaccongquangninh.com",path,method,headers:{Host:"thongtaccongquangninh.com",Authorization:auth,"User-Agent":"WP-Agent/1.0",...(b?{"Content-Type":"application/json","Content-Length":b.length}:{})},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)});}catch{res({s:resp.statusCode,d});}});});r.on("error",rej);r.setTimeout(30000,()=>r.destroy());if(b)r.write(b);r.end();});}

const cur = await req("GET", "/wp-json/wp/v2/posts/2054?context=edit", null);
let h = cur.d.content.raw;
let miss = 0;
function rep(a,b){ if(!h.includes(a)){ console.error("MISS:", a.slice(0,70)); miss++; return; } h = h.replace(a,b); }

// De-stuff 7 prose <strong> occurrences (keep H2/H3/FAQ/TOC/figcaption/JSON-LD/alt + 2 bold anchors #11,#17)
rep(`nhận <strong>thông tắc cống Bãi Cháy</strong> 24/7 cho nhà dân`, `nhận thông tắc cống, hút bể phốt 24/7 cho nhà dân`);
rep(`Bạn nên gọi <strong>thông tắc cống Bãi Cháy</strong> khi gặp`, `Bạn nên gọi thợ khi gặp`);
rep(`Với trường hợp này, <strong>thông tắc cống Bãi Cháy</strong> cần kiểm tra cả hố ga`, `Với trường hợp này, thợ cần kiểm tra cả hố ga`);
rep(`giúp <strong>dịch vụ thông tắc cống Bãi Cháy</strong> xử lý nhanh`, `giúp dịch vụ xử lý nhanh`);
rep(`Phần lớn ca <strong>thông tắc cống Bãi Cháy</strong> xử lý qua miệng thoát`, `Phần lớn ca xử lý qua miệng thoát`);
rep(`Chi phí <strong>thông tắc cống Bãi Cháy</strong> phụ thuộc`, `Chi phí dịch vụ phụ thuộc`);
rep(`Đội thợ nhận <strong>thông tắc cống Bãi Cháy</strong> tại các tuyến phố`, `Đội thợ nhận việc tại các tuyến phố`);

if (miss) { console.error(`\n${miss} replacements missed — aborting publish.`); process.exit(1); }

const txt = h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").toLowerCase();
const w = txt.split(" ").filter(Boolean).length;
const full = txt.split("thông tắc cống bãi cháy").length - 1;
console.log(`words=${w} | "thông tắc cống bãi cháy"=${full} (${((full*4/w)*100).toFixed(2)}%)`);

const up = await req("POST", "/wp-json/wp/v2/posts/2054", { content: h, status: "publish" });
console.log("publish:", up.s, up.d.status);
