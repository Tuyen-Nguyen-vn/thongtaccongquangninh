/**
 * lien-he còn 2445w live, cần thêm ~60w để đạt >=2500
 */
import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}

function countWords(t){return(t.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<[^>]+>/g," ").match(/\b\w+\b/g)||[]).length;}

// Thêm vào trước JSON-LD
function insertBeforeJsonLd(raw, newContent){
  const marker='<!-- wp:html -->\n<script type="application/ld+json"';
  const idx=raw.lastIndexOf(marker);
  if(idx>=0) return raw.slice(0,idx)+newContent+"\n\n"+raw.slice(idx);
  const idx2=raw.lastIndexOf("<!-- wp:html -->");
  if(idx2>=0) return raw.slice(0,idx2)+newContent+"\n\n"+raw.slice(idx2);
  return raw+"\n\n"+newContent;
}

const ADD=`
<!-- wp:heading {"level":3} -->
<h3>Có thể đặt lịch trước không?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Có thể đặt trước 1–7 ngày cho dịch vụ hút bể phốt định kỳ hoặc nạo vét hố ga. Chỉ cần cung cấp địa chỉ, khung giờ thuận tiện và dung tích bể ước tính — đội sẽ xác nhận lịch và nhắn lại trước khi đến. Với sự cố khẩn cấp (cống trào, bồn cầu nghẹt cấp tập), gọi thẳng số <strong>0963.953.533</strong> để điều thợ ngay.</p>
<!-- /wp:paragraph -->`;

const post=await wpReq("GET","/wp-json/wp/v2/pages/63?context=edit&_fields=id,slug,content");
const raw=post.content?.raw||"";
const before=countWords(raw);
const newRaw=insertBeforeJsonLd(raw,ADD);
const after=countWords(newRaw);
console.log(`lien-he: raw ${before}w + ~${after-before}w → ${after}w raw`);
const res=await wpReq("POST","/wp-json/wp/v2/pages/63",{content:newRaw});
if(res?.id) console.log("✓ saved");
else console.log("✗ "+JSON.stringify(res).slice(0,120));
