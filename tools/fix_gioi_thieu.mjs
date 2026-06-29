import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function req(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const r=https.request({hostname:"103.57.220.210",port:443,servername:"thongtaccongquangninh.com",path,method,headers:{Host:"thongtaccongquangninh.com",Authorization:auth,"User-Agent":"WP-Agent/1.0",...(b?{"Content-Type":"application/json","Content-Length":b.length}:{})},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)});}catch{res({s:resp.statusCode,d});}});});r.on("error",rej);r.setTimeout(30000,()=>r.destroy());if(b)r.write(b);r.end();});}

const cur = await req("GET", "/wp-json/wp/v2/pages/62?context=edit", null);
const oldTitle = cur.d.title?.raw;
const EXPECTED_TITLE = "Dịch vụ thông tắc Quảng Ninh - Hồ sơ Môi Trường Đô Thị Số 1";
if(oldTitle?.trim() !== EXPECTED_TITLE){console.error("Title mismatch — abort. Got:", oldTitle);process.exit(1);}

let h = cur.d.content.raw;
const oldBrandCount = (h.match(/Môi Trường Đô Thị Số 1/g)||[]).length;
console.log("id=62 | oldTitle:", JSON.stringify(oldTitle));
console.log("content old-brand hits:", oldBrandCount, "(expect 4 in content)");

let miss=0;
function rep(a,b){if(!h.includes(a)){console.error("MISS:", a.slice(0,80));miss++;return;}h=h.replace(a,b);console.log("replaced:", a.slice(0,70));}

// text paragraph
rep(
  `<strong>Môi Trường Đô Thị Số 1 Quảng Ninh tập trung xử lý các sự cố thoát nước dân dụng và công trình nhỏ: hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi.</strong>`,
  `<strong>Chúng tôi chuyên xử lý các sự cố thoát nước dân dụng và công trình nhỏ: hút bể phốt, thông tắc cống, thông tắc bồn cầu, nạo vét hố ga và xử lý mùi hôi tại Quảng Ninh.</strong>`
);
// image alt 1
rep(
  `"Xe hút bể phốt của Môi Trường Đô Thị Số 1 Quảng Ninh"`,
  `"Xe hút bể phốt Quảng Ninh"`
);
// figcaption 1
rep(
  `Xe hút bể phốt của Môi Trường Đô Thị Số 1 Quảng Ninh phục vụ`,
  `Xe hút bể phốt Quảng Ninh phục vụ`
);
// image alt 2
rep(
  `"Thợ thông tắc cống Môi Trường Đô Thị Số 1 Quảng Ninh"`,
  `"Thợ thông tắc cống Quảng Ninh"`
);
// figcaption 2
rep(
  `Thợ thông tắc cống Môi Trường Đô Thị Số 1 Quảng Ninh xử lý`,
  `Thợ thông tắc cống Quảng Ninh xử lý`
);

if(miss>0){console.error(`${miss} replacements missed — abort.`);process.exit(1);}
const afterHits=(h.match(/Môi Trường Đô Thị Số 1/g)||[]).length;
console.log("After replace — old brand hits:", afterHits, "(expect 0)");
if(afterHits>0){console.error("Still has old brand — abort.");process.exit(1);}

const NEW_TITLE="Giới thiệu dịch vụ thông tắc cống, hút bể phốt Quảng Ninh";
console.log("New title ("+[...NEW_TITLE].length+" chars):", NEW_TITLE);
const up=await req("POST","/wp-json/wp/v2/pages/62",{title:NEW_TITLE,content:h,status:"publish"});
console.log("publish:", up.s, up.d.status||up.d.code||"");
console.log("new title.raw:", up.d.title?.raw);
