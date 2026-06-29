import https from "node:https";
import { readFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
const SERVER_IP = "103.57.220.210", WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function req(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const r=https.request({hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,headers:{Host:WP_HOST,Authorization:auth,"User-Agent":"WP-Agent/1.0",...(b?{"Content-Type":"application/json","Content-Length":b.length}:{})},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)});}catch{res({s:resp.statusCode,d});}});});r.on("error",rej);r.setTimeout(30000,()=>r.destroy());if(b)r.write(b);r.end();});}

const cur = await req("GET", "/wp-json/wp/v2/posts/2039?context=edit", null);
let h = cur.d.content.raw;
const before = h;
function rep(a,b){ if(!h.includes(a)){ console.error("MISS:", a.slice(0,60)); process.exit(1);} h = h.replace(a,b); }

// A) Fix escaped <strong> in intro
rep('Gọi &lt;strong&gt;0963.953.533 / 0931.156.756&lt;/strong&gt; — thợ kiểm tra',
    'Gọi <strong>0963.953.533 / 0931.156.756</strong> — thợ kiểm tra');

// B) Add H2 "Nguyên nhân" before "Khi nào cần gọi"
rep('<h2>Khi nào cần gọi thông tắc cống Cao Xanh ngay</h2>',
`<h2>Nguyên nhân cống tắc thường gặp tại Cao Xanh</h2>
<p>Tại các khu dân cư đông và nhà trọ ở Cao Xanh, nguyên nhân phổ biến nhất là dầu mỡ từ bếp bám dày trong đường ống, lâu ngày thu hẹp dòng chảy. Tiếp đến là rác vụn, tóc, khăn ướt và bã thức ăn bị xả xuống cống gây nghẹt cục bộ. Nhiều trường hợp do hố ga lâu chưa nạo vét nên đầy bùn, nước dồn ngược lại đường thoát. Ngoài ra, ống thoát cũ, lắp sai độ dốc hoặc bị lún sau thời gian dài sử dụng cũng khiến nước rút chậm. Sau mưa lớn, lượng nước và rác đổ về nhiều làm hố ga và cống chung quá tải, dẫn tới trào ngược ở khu vực trũng.</p>
<h2>Khi nào cần gọi thông tắc cống Cao Xanh ngay</h2>`);

// C) Add "Cam kết" H2 + cam kết thứ nhất before "Cam kết thứ hai"
rep('<p>Cam kết thứ hai là không báo giá ảo.',
`<h2>Cam kết khi làm dịch vụ tại Cao Xanh</h2>
<p>Cam kết thứ nhất là ưu tiên không đục phá. Thợ dùng máy lò xo, máy nén khí, đầu thông áp lực và dụng cụ kiểm tra hố ga để xử lý qua miệng thoát hoặc nắp hố ga, chỉ can thiệp sâu khi đường ống đã hỏng và luôn báo khách trước khi làm.</p>
<p>Cam kết thứ hai là không báo giá ảo.`);

// D) Reduce keyword repetition
rep('<p>Bạn nên gọi <strong>thông tắc cống Cao Xanh</strong> khi gặp một trong các dấu hiệu sau:</p>',
    '<p>Bạn nên gọi thợ kiểm tra khi gặp một trong các dấu hiệu sau:</p>');
rep('Chi phí <strong>thông tắc cống Cao Xanh</strong> phụ thuộc vào',
    'Chi phí dịch vụ phụ thuộc vào');
rep('Trường hợp này cho thấy <strong>thông tắc cống Cao Xanh</strong> cần đi đúng nguyên nhân.',
    'Trường hợp này cho thấy việc xử lý cống tắc cần đi đúng nguyên nhân.');
rep('nhất là với ca <strong>thông tắc cống Cao Xanh</strong> tại khu bếp dùng chung hoặc nhà trọ đông người.',
    'nhất là với ca xử lý tại khu bếp dùng chung hoặc nhà trọ đông người.');
rep('<p>Đội thợ nhận <strong>thông tắc cống Cao Xanh</strong> tại các tuyến phố, khu dân cư, khu dân cư, khu nhà hàng, nhà trọ, quán ăn, nhà trọ và mặt bằng kinh doanh tại Cao Xanh.</p>',
    '<p>Đội thợ nhận xử lý cống tắc tại các tuyến phố, khu dân cư, khu nhà hàng, nhà trọ, quán ăn và mặt bằng kinh doanh tại Cao Xanh.</p>');

// E) Remove redundant self-area in neighbor list
rep('như Hòn Gai, Cao Xanh, Cao Thắng, Hồng Gai', 'như Hòn Gai, Cao Thắng, Hồng Gai');

// stats
const txt = h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").toLowerCase();
const words = txt.split(" ").filter(Boolean).length;
const kw = (txt.match(/thông tắc cống cao xanh/g)||[]).length;
const h2 = [...h.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)].map(m=>m[1].replace(/<[^>]+>/g,"").trim());
console.log(`words=${words} kw=${kw} density=${((kw*4/words)*100).toFixed(2)}% escapedStrong=${(h.match(/&lt;strong&gt;/g)||[]).length}`);
console.log("H2:", JSON.stringify(h2));
console.log("changed:", before!==h);

const up = await req("POST", "/wp-json/wp/v2/posts/2039", { content: h, status: "publish" });
console.log("publish:", up.s, up.d.status);
