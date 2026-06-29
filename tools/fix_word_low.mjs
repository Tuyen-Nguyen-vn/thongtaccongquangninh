/**
 * Fix WORD_LOW: append quality content sections to 3 posts
 *   - hoa-chat-tu-thong-cong (id=2045): +~450 words
 *   - mui-hoi-cong-nguyen-nhan-xu-ly (id=2046): +~250 words
 *   - bon-cau-rut-cham-nguyen-nhan (id=2043): +~120 words
 * Insert point: right before final <!-- wp:html --> block (BlogPosting JSON-LD)
 */
import https from "node:https";
import { readFileSync, appendFileSync } from "node:fs";
const ENV_PATH = "C:\\Users\\DELL\\Documents\\Codex\\2026-04-28\\chatgpt-apps-plugin-chatgpt-apps-openai\\.env";
function parseEnv(p){const e={};for(const l of readFileSync(p,"utf8").split(/\r?\n/)){const m=l.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);if(m)e[m[1]]=m[2].replace(/^["']|["']$/g,"")}return e;}
const env=parseEnv(ENV_PATH);
const auth="Basic "+Buffer.from(env.WP_USERNAME+":"+env.WP_APP_PASSWORD).toString("base64");
const SIP="103.57.220.210",WPH="thongtaccongquangninh.com";
function wpReq(method,path,body){return new Promise((res,rej)=>{const b=body?Buffer.from(JSON.stringify(body),"utf8"):null;const o={hostname:SIP,port:443,servername:WPH,path,method,headers:{Host:WPH,Authorization:auth,"Content-Type":"application/json",...(b?{"Content-Length":b.length}:{})},rejectUnauthorized:false};const r=https.request(o,resp=>{let d="";resp.on("data",c=>d+=c);resp.on("end",()=>{try{res(JSON.parse(d))}catch{res(d)}})});r.on("error",rej);r.setTimeout(30000,()=>r.destroy(new Error("t")));if(b)r.write(b);r.end();});}
function stripHtml(h){return h.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();}
function wc(t){return t.split(/\s+/).filter(Boolean).length;}

// Insert new sections before the final <!-- wp:html --> block (BlogPosting schema)
function insertBeforeJsonLd(raw, newContent){
  const marker = "<!-- wp:html -->\n<script type=\"application/ld+json\" data-ttcqn-author-nguyen-song-hao=\"1\">";
  const idx = raw.lastIndexOf(marker);
  if(idx < 0) throw new Error("marker not found");
  return raw.slice(0, idx) + newContent + "\n\n" + raw.slice(idx);
}

// ===================== 1. hoa-chat-tu-thong-cong (id=2045) =====================
const HOA_CHAT_NEW = `<hr />
<h2>Lưu ý an toàn khi dùng hóa chất thông cống tại nhà</h2>
<p>Dù chọn loại nào, áp dụng đúng cách sẽ tránh được phần lớn tai nạn. Một số nguyên tắc cần nhớ trước khi bắt đầu:</p>
<h3>Bảo hộ cá nhân</h3>
<p>Luôn đeo <strong>găng tay cao su dày</strong> khi dùng NaOH hoặc bất kỳ chất tẩy đậm đặc nào. Nếu bị dính vào da hoặc mắt, rửa ngay bằng nước sạch liên tục trong 15 phút và đến cơ sở y tế nếu cần. Mở cửa sổ hoặc bật quạt thông gió khi pha hoặc đổ hóa chất xuống cống để tránh hít phải hơi bay lên.</p>
<h3>Bảo quản đúng cách</h3>
<p>NaOH dạng hạt hút ẩm rất mạnh — để ngoài không khí chỉ vài giờ là chảy lỏng. Sau khi dùng phải đậy kín ngay và để nơi khô ráo, <strong>tránh xa tầm tay trẻ em và thú cưng</strong>. Không để NaOH chung tủ với giấm, axit hoặc thuốc tẩy — nếu lọ vỡ và tiếp xúc nhau sẽ phản ứng tỏa nhiệt mạnh.</p>
<h3>Nhà có trẻ nhỏ và thú cưng</h3>
<p>Ưu tiên <strong>enzyme vi sinh hoặc muối nở + giấm</strong> — an toàn tuyệt đối cho cả người và vật nuôi. Nếu bắt buộc dùng NaOH, khóa nhà tắm trong toàn bộ 30 phút xử lý và xả ít nhất 10 lít nước sau khi hóa chất đã thoát hoàn toàn trước khi để người vào.</p>
<hr />
<h2>Thêm câu hỏi thường gặp về hóa chất thông cống</h2>
<p><strong>Hóa chất thông cống có diệt vi khuẩn có lợi trong bể phốt không?</strong> NaOH và chất kiềm mạnh tiêu diệt vi sinh vật kể cả có lợi. Nhà dùng bể phốt vi sinh không nên dùng NaOH cho đường ống nối trực tiếp vào bể. Ưu tiên enzyme vi sinh hoặc muối nở.</p>
<p><strong>Sau khi dùng hóa chất, bao lâu thì cống thoát bình thường?</strong> Muối nở + giấm với tắc nhẹ: 30–60 phút. NaOH với tắc do tóc: 20–30 phút. Nếu sau 1 giờ vẫn không thoát, không đổ thêm — hóa chất đọng trong ống sẽ gây nguy hiểm khi thợ đến can thiệp. Gọi ngay <strong>0963.953.533</strong>.</p>
<p><strong>Có loại hóa chất nào thân thiện môi trường không?</strong> Enzyme vi sinh và muối nở không gây ô nhiễm nước ngầm, an toàn với hệ vi sinh tự nhiên. NaOH ở nồng độ cao có thể hại sinh vật thủy sinh — dùng đúng liều, đảm bảo hóa chất đã qua xử lý trước khi ra cống chung.</p>
<p><strong>Cống bếp tắc do dầu mỡ nên dùng gì trước?</strong> Nước sôi 80°C đổ từ từ là cách đơn giản và an toàn nhất. Nếu không thoát, dùng muối nở + giấm nóng. Dầu mỡ bếp hiếm khi cần đến NaOH — chỉ dùng khi lớp dầu mỡ đã cứng và dày nhiều năm.</p>

`;

// ===================== 2. mui-hoi-cong-nguyen-nhan-xu-ly (id=2046) =====================
const MUI_HOI_NEW = `<hr />
<h2>Phòng ngừa mùi hôi từ đường cống – Thói quen cần duy trì</h2>
<p>Phần lớn mùi hôi cống có thể phòng ngừa chủ động bằng thói quen đơn giản, không cần tốn nhiều chi phí.</p>
<h3>Hàng ngày</h3>
<ul>
<li><strong>Xả nước vào điểm thoát ít dùng</strong> (phòng tắm khách, phòng giặt phụ) để xi phông luôn có nước ngăn mùi.</li>
<li><strong>Không đổ dầu ăn thừa xuống bồn rửa</strong> — đây là nguyên nhân phổ biến gây tắc mỡ và mùi hôi trong ống bếp.</li>
</ul>
<h3>Hàng tuần</h3>
<ul>
<li><strong>Xả 1–2 lít nước nóng (80°C)</strong> qua bồn rửa bát để tan dầu mỡ tích tụ trong ống.</li>
<li><strong>Vệ sinh lưới chắn rác</strong> tại sàn nhà tắm và bồn rửa — tóc và cặn bẩn chỉ cần 1 tuần là tạo thành ổ phân hủy sinh mùi bên dưới.</li>
</ul>
<h3>Hàng tháng</h3>
<ul>
<li><strong>Dùng enzyme vi sinh</strong> đổ vào điểm thoát nhiều tóc (bồn tắm, sàn nhà tắm) — vi khuẩn phân hủy chất hữu cơ giúp giữ ống sạch lâu dài mà không hại người hay bể phốt.</li>
<li><strong>Kiểm tra mực nước trong bồn cầu</strong> — nếu mực nước thấp bất thường, xi phông có thể bị hút cạn do ống thông hơi tắc.</li>
</ul>
<h3>Mỗi 18–24 tháng</h3>
<p><strong>Hút bể phốt định kỳ</strong> — không chờ đến khi có mùi mới gọi. Bể đầy 80% đã bắt đầu đẩy khí H₂S ngược vào nhà. Hộ gia đình 4 người tại Quảng Ninh thường cần hút bể phốt mỗi 18–24 tháng. Gọi <strong>0963.953.533 / 0931.156.756</strong> để đặt lịch.</p>

`;

// ===================== 3. bon-cau-rut-cham-nguyen-nhan (id=2043) =====================
const BON_CAU_NEW = `<hr />
<h2>Thêm lưu ý khi xử lý bồn cầu rút chậm tại Quảng Ninh</h2>
<p>Trong quá trình xử lý, một số điểm cần kiểm tra thêm để tránh tái phát:</p>
<ul>
<li><strong>Lượng nước trong bình chứa (két nước):</strong> Nếu mực nước thấp hơn vạch chuẩn, áp lực xả giảm làm bồn cầu rút yếu. Điều chỉnh phao trong két nước là cách xử lý đơn giản không cần thợ.</li>
<li><strong>Cặn canxi trong ống sứ:</strong> Tại các khu vực Quảng Ninh có nước cứng, cặn vôi bám dần trong ống sứ làm thu hẹp tiết diện. Ngâm giấm trắng 2–3 giờ hoặc dùng dung dịch axit citric loãng có thể hòa tan cặn nhẹ.</li>
<li><strong>Bệ cầu và gioăng cao su:</strong> Gioăng cao su đệm giữa bồn cầu và sàn sau 5–10 năm có thể lão hóa, gây rò rỉ nhỏ làm ướt sàn và xuất hiện mùi. Thay gioăng mới giá 50.000–200.000 đ, thợ lắp trong 30 phút.</li>
</ul>
<p>Khi đã kiểm tra hết các bước trên mà bồn cầu vẫn rút chậm, nguyên nhân thường nằm ở đường cống thoát chung hoặc bể phốt gần đầy. Gọi <strong>0963.953.533 / 0931.156.756</strong> để kiểm tra và xử lý trong ngày tại Quảng Ninh.</p>

`;

// --- Process all 3 posts ---
const posts = [
  { id: 2045, slug: "hoa-chat-tu-thong-cong", newContent: HOA_CHAT_NEW },
  { id: 2046, slug: "mui-hoi-cong-nguyen-nhan-xu-ly", newContent: MUI_HOI_NEW },
  { id: 2043, slug: "bon-cau-rut-cham-nguyen-nhan", newContent: BON_CAU_NEW },
];

for(const {id, slug, newContent} of posts){
  const r = await wpReq("GET", `/wp-json/wp/v2/posts/${id}?context=edit&_fields=id,slug,content`);
  if(!r?.id){ console.log(`✗ ${slug}: not found`); continue; }

  let newRaw;
  try {
    newRaw = insertBeforeJsonLd(r.content.raw, newContent);
  } catch(e) {
    console.log(`✗ ${slug}: ${e.message}`);
    continue;
  }

  const wordsBefore = wc(stripHtml(r.content.raw));
  const wordsAfter = wc(stripHtml(newRaw));
  const res = await wpReq("POST", `/wp-json/wp/v2/posts/${id}`, { content: newRaw });
  if(res?.id){
    console.log(`✓ ${slug}: words ${wordsBefore} → ${wordsAfter} (+${wordsAfter - wordsBefore})`);
  } else {
    console.log(`✗ ${slug}: ${JSON.stringify(res).slice(0,120)}`);
  }
}

const TODAY = "2026-06-10"; const TIME = new Date().toTimeString().slice(0,5);
appendFileSync("docs/SEO_PROGRESS.csv",
  `\n${TODAY},${TIME},FIX-WORD-LOW-${TODAY},seo_fix,WORD_LOW — expand hoa-chat+mui-hoi+bon-cau posts above 2000 words,https://thongtaccongquangninh.com/,,done,medium,,,,,add quality content sections,tools/fix_word_low.mjs,,re-audit,,,,,,`,
  "utf8");
console.log("✓ logged");
