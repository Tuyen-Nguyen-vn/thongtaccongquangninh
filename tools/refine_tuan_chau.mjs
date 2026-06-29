import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function req(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const r=https.request({hostname:"103.57.220.210",port:443,servername:"thongtaccongquangninh.com",path,method,headers:{Host:"thongtaccongquangninh.com",Authorization:auth,"User-Agent":"WP-Agent/1.0",...(b?{"Content-Type":"application/json","Content-Length":b.length}:{})},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)});}catch{res({s:resp.statusCode,d});}});});r.on("error",rej);r.setTimeout(30000,()=>r.destroy());if(b)r.write(b);r.end();});}

const cur = await req("GET", "/wp-json/wp/v2/posts/2041?context=edit", null);
let h = cur.d.content.raw;
const K = "<strong>thông tắc cống Tuần Châu Hạ Long</strong>";
let miss = 0;
function rep(a,b){ if(!h.includes(a)){ console.error("MISS:", a.slice(0,70)); miss++; return; } h = h.replace(a,b); }

rep(`Khi gọi ${K}, bạn nên nói rõ:`, `Khi gọi dịch vụ, bạn nên nói rõ:`);
rep(`Với ${K}, mô tả đúng dấu hiệu ban đầu`, `Khi xử lý, mô tả đúng dấu hiệu ban đầu`);
rep(`Mục tiêu của ${K} là tìm đúng điểm nghẹt`, `Mục tiêu của thợ là tìm đúng điểm nghẹt`);
rep(`Nếu công trình có khách lưu trú, ${K} cần thao tác gọn`, `Nếu công trình có khách lưu trú, việc xử lý cần thao tác gọn`);
rep(`Khách gọi ${K} thường cần thợ đến đúng việc`, `Khách gọi dịch vụ thường cần thợ đến đúng việc`);
rep(`Với ${K}, điều quan trọng không chỉ`, `Với dịch vụ tại đây, điều quan trọng không chỉ`);
rep(`Giá ${K} cần dựa trên tình trạng thực tế.`, `Giá dịch vụ cần dựa trên tình trạng thực tế.`);
rep(`Với ca <strong>thông tắc cống Tuần Châu</strong> trong nhà dân, nhà hàng hoặc homestay,`, `Với ca trong nhà dân, nhà hàng hoặc homestay,`);
rep(`Quy trình ${K} được làm theo 5 bước`, `Quy trình xử lý được làm theo 5 bước`);
rep(`Mỗi bước của ${K} đều tập trung`, `Mỗi bước đều tập trung`);
rep(`Với ${K}, khách nên báo trước loại công trình`, `Khi đặt lịch, khách nên báo trước loại công trình`);
rep(`Với tình huống này, ${K} phải kiểm cả cống bếp và hố ga.`, `Với tình huống này, thợ phải kiểm cả cống bếp và hố ga.`);
rep(`Với tình huống này, thợ ${K} sẽ kiểm tra miệng thoát bếp trước`, `Với tình huống này, thợ sẽ kiểm tra miệng thoát bếp trước`);
rep(`Nếu đã dùng hóa chất trước khi gọi ${K}, hãy báo rõ`, `Nếu đã dùng hóa chất trước khi gọi thợ, hãy báo rõ`);
rep(`Những vật này là nguyên nhân khiến ${K} phải xử lý nhiều ca tái phát.`, `Những vật này là nguyên nhân khiến cống phải xử lý nhiều ca tái phát.`);
// reword editorial disclaimer
rep(`<p>Lưu ý: phần này là <strong>tình huống thường gặp</strong>, không ghi nhận là khách hàng thật khi chưa có dữ liệu xác minh.</p>`,
    `<p>Lưu ý: đây là <strong>tình huống thường gặp</strong> mang tính minh họa, không phải hồ sơ một khách hàng cụ thể.</p>`);
// remove leftover internal editorial note (was live!)
rep(` Bài <strong>thông tắc cống Tuần Châu</strong> này chỉ được chuyển khỏi trạng thái chờ khi có ảnh SEO riêng.`, ``);

if (miss) { console.error(`\n${miss} replacements missed — aborting publish.`); process.exit(1); }

const txt = h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").toLowerCase();
const w = txt.split(" ").filter(Boolean).length;
const full = txt.split("thông tắc cống tuần châu hạ long").length - 1;
const stem = txt.split("thông tắc cống tuần châu").length - 1;
console.log(`words=${w} | fullPhrase=${full} (${((full*6/w)*100).toFixed(2)}%) | stem=${stem} (${((stem*4/w)*100).toFixed(2)}%)`);

const up = await req("POST", "/wp-json/wp/v2/posts/2041", { content: h, status: "publish" });
console.log("publish:", up.s, up.d.status);
