import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function req(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const r=https.request({hostname:"103.57.220.210",port:443,servername:"thongtaccongquangninh.com",path,method,headers:{Host:"thongtaccongquangninh.com",Authorization:auth,"User-Agent":"WP-Agent/1.0",...(b?{"Content-Type":"application/json","Content-Length":b.length}:{})},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)});}catch{res({s:resp.statusCode,d});}});});r.on("error",rej);r.setTimeout(30000,()=>r.destroy());if(b)r.write(b);r.end();});}

const cur = await req("GET", "/wp-json/wp/v2/posts/2054?context=edit", null);
let h = cur.d.content.raw;

const ANCHOR = `mặt bằng kinh doanh quanh Bãi Cháy.</p>`;
const NEW_P = `<p>Địa hình Bãi Cháy nhiều đồi dốc nên đường ống thoát nước thường chạy theo độ dốc lớn, cặn dầu mỡ và rác dễ lắng ở các đoạn gấp khúc cuối dốc. Dọc trục đường Hạ Long ven biển, khu phố Vườn Đào và quanh bãi tắm Bãi Cháy tập trung dày nhà hàng hải sản, khách sạn mini và homestay, lượng nước thải giàu dầu mỡ đổ vào cống chung khá lớn. Các điểm đông khách theo mùa như Sun World Hạ Long, vòng quay Mặt Trời hay cảng tàu khách quốc tế Hạ Long cũng dễ quá tải hố ga vào cao điểm lễ Tết. Mùa mưa, nước từ các tuyến dốc dồn nhanh về cống khu thấp khiến điểm tắc lộ rõ hơn. Khi khảo sát tại những vị trí này, thợ thường kiểm tra cả hố ga lẫn đoạn ống dốc để không sót điểm nghẹt nằm sâu phía trong.</p>`;

if (!h.includes(ANCHOR)) { console.error("ANCHOR not found — abort."); process.exit(1); }
if (h.includes("nhiều đồi dốc nên đường ống thoát nước")) { console.error("Paragraph already inserted — abort (no double-insert)."); process.exit(1); }
h = h.replace(ANCHOR, ANCHOR + "\n" + NEW_P);

const txt = h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").toLowerCase();
const w = txt.split(" ").filter(Boolean).length;
const full = txt.split("thông tắc cống bãi cháy").length - 1;
console.log(`words(raw-text)=${w} | "thông tắc cống bãi cháy"=${full} (${((full*4/w)*100).toFixed(2)}%)`);

const up = await req("POST", "/wp-json/wp/v2/posts/2054", { content: h, status: "publish" });
console.log("publish:", up.s, up.d.status);
