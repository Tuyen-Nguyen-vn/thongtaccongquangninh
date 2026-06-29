import https from "node:https";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT = process.env.TTCQN_PROJECT_ROOT || path.resolve(__dirname, "..");
const ENV_PATH = path.join(PROJECT, ".env");
const SERVER_IP = "103.57.220.210", WP_HOST = "thongtaccongquangninh.com";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"");}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
function req(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const r=https.request({hostname:SERVER_IP,port:443,servername:WP_HOST,path,method,headers:{Host:WP_HOST,Authorization:auth,"User-Agent":"WP-Agent/1.0",...(b?{"Content-Type":"application/json","Content-Length":b.length}:{})},rejectUnauthorized:false},resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res({s:resp.statusCode,d:JSON.parse(d)});}catch{res({s:resp.statusCode,d});}});});r.on("error",rej);r.setTimeout(30000,()=>r.destroy());if(b)r.write(b);r.end();});}

const cur = await req("GET", "/wp-json/wp/v2/posts/2039?context=edit", null);
if (cur.s !== 200) { console.error("fetch fail", cur.s); process.exit(1); }
let raw = cur.d.content?.raw ?? "";

const HERO = `<figure><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-cao-xanh-ha-long-01-1.webp" alt="Thông tắc cống Cao Xanh Hạ Long – xử lý tắc nghẽn khu dân cư đông" width="1200" height="630" loading="eager" /><figcaption>Dịch vụ thông tắc cống tại Cao Xanh 24/7, không đục phá</figcaption></figure>\n`;
const PROC_IMG = `<figure><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-cao-xanh-quy-trinh-02-1.webp" alt="Quy trình thi công thông tắc cống Cao Xanh Hạ Long bằng máy lò xo chuyên dụng" loading="lazy" /><figcaption>Thông tắc cống Cao Xanh bằng máy lò xo, hạn chế đục phá</figcaption></figure>`;
const CASE_IMG = `\n<figure><img src="https://thongtaccongquangninh.com/wp-content/uploads/2026/06/thong-tac-cong-cao-xanh-chung-cu-03-1.webp" alt="Thông tắc cống chung cư khu dân cư Cao Xanh Hạ Long" loading="lazy" /><figcaption>Xử lý cống tắc cho khu dân cư đông tại Cao Xanh</figcaption></figure>\n`;

// 1) Strip broken markdown image block + stray markdown H1 at top: keep from first real paragraph.
const anchor = "<p>Cần thông tắc cống Cao Xanh?";
const idx = raw.indexOf(anchor);
if (idx === -1) { console.error("anchor not found"); process.exit(1); }
raw = HERO + raw.slice(idx);

// 2) Replace malformed image paragraph (markdown !<a ...></a>) with proper process figure.
raw = raw.replace(/<p>!<a href="https:\/\/thongtaccongquangninh\.com\/wp-content\/uploads\/2026\/04\/ky-thuat-thong-tac-cong-dan-dung-quang-ninh-01\.webp"[^>]*>.*?<\/a><\/p>/s, PROC_IMG);

// 3) Insert case-study image right after the case study H2.
raw = raw.replace("<h2>Case study E-E-A-T tại Cao Xanh</h2>", "<h2>Case study E-E-A-T tại Cao Xanh</h2>" + CASE_IMG);

// 4) Insert tips + FAQ before NAP section.
const TIPS_FAQ = `<h2>Lưu ý để hạn chế cống tắc lại tại Cao Xanh</h2>
<p>Để giữ đường thoát thông suốt sau khi xử lý, hộ gia đình và cơ sở kinh doanh tại Cao Xanh nên hạn chế đổ dầu mỡ nóng trực tiếp xuống cống bếp, lắp rổ chắn rác ở miệng thoát sàn và thoát bồn rửa, đồng thời gom tóc, khăn ướt, bã thức ăn vào thùng rác thay vì xả xuống cống. Với nhà trọ đông người hoặc quán ăn dùng bếp công suất lớn, nên lên lịch nạo vét hố ga và kiểm tra bể phốt định kỳ để phát hiện sớm dấu hiệu quá tải. Khi thấy nước rút chậm trở lại hoặc có mùi nhẹ, gọi kiểm tra sớm sẽ rẻ và nhanh hơn nhiều so với để cống tắc hoàn toàn rồi mới xử lý.</p>
<h2>Câu hỏi thường gặp về thông tắc cống Cao Xanh</h2>
<h3>Gọi thông tắc cống Cao Xanh bao lâu thì có thợ?</h3>
<p>Với các tuyến trong phường Cao Xanh và khu vực Hạ Long lân cận, đội thợ thường có mặt trong khoảng 15–30 phút tùy thời điểm và mật độ giao thông. Khi gọi <strong>0963.953.533 / 0931.156.756</strong>, kỹ thuật sẽ hỏi nhanh tình trạng để điều thợ gần nhất kèm thiết bị phù hợp, tránh phải quay về lấy thêm máy.</p>
<h3>Thông tắc cống Cao Xanh có phải đục phá nền không?</h3>
<p>Phần lớn trường hợp không cần đục phá. Thợ ưu tiên dùng máy lò xo, đầu thông áp lực và dụng cụ kiểm tra hố ga để xử lý qua miệng thoát hoặc nắp hố ga. Chỉ khi đường ống bị vỡ, sụt hoặc sai kỹ thuật từ trước mới cân nhắc can thiệp sâu, và luôn báo khách trước khi làm.</p>
<h3>Chi phí thông tắc cống tại Cao Xanh tính theo gì?</h3>
<p>Giá phụ thuộc độ nặng điểm tắc, vị trí, thời điểm gọi, thiết bị cần dùng và có xử lý kèm hố ga hay bể phốt không. Thợ khảo sát rồi báo giá trước khi thi công; khách đồng ý mới làm, không phát sinh ngoài thỏa thuận.</p>
<h3>Quán ăn, nhà trọ ở Cao Xanh tắc cống bếp có làm ngoài giờ không?</h3>
<p>Có. Dịch vụ nhận xử lý 24/7, kể cả buổi tối, cuối tuần và ngày lễ để cơ sở kinh doanh tại Cao Xanh sớm hoạt động lại. Với cống bếp nhiều dầu mỡ, thợ xử lý mảng bám và kiểm tra hố ga phía sau để tránh tắc lại nhanh.</p>
<h3>Cống cứ tắc lại nhiều lần thì nên làm gì?</h3>
<p>Tắc lặp lại thường do dầu mỡ tích tụ, hố ga quá tải hoặc thói quen xả rác, tóc, khăn ướt xuống cống. Nên kết hợp nạo vét hố ga định kỳ, đặt rổ chắn rác và kiểm tra bể phốt nếu có mùi. Trường hợp này thợ sẽ tư vấn lịch bảo trì phù hợp với từng hộ và cơ sở.</p>
`;
raw = raw.replace("<h2>NAP liên hệ</h2>", TIPS_FAQ + "<h2>NAP liên hệ</h2>");

// word count
const words = raw.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().split(" ").filter(Boolean).length;
const mdLeft = (raw.match(/!\[[^\]]*\]\(/g)||[]).length + (raw.match(/!<a /g)||[]).length;
const imgs = (raw.match(/<img /gi)||[]).length;
console.log(`new words=${words}  markdown-left=${mdLeft}  imgs=${imgs}`);

const up = await req("POST", "/wp-json/wp/v2/posts/2039", { content: raw, status: "publish" });
console.log("publish status:", up.s, up.s===200 ? `link=${up.d.link} status=${up.d.status}` : JSON.stringify(up.d).slice(0,300));
